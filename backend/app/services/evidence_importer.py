import asyncio
import hashlib
import re
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple
from urllib.parse import urljoin, urlparse

import feedparser
import httpx
from bs4 import BeautifulSoup

from app.services.signal_classifier import run_offline_classifier
from app.services.evidence_quality import is_boilerplate, source_authority, validate_signal

CACHE_TTL_SECONDS = 900
IMPORT_CACHE: Dict[str, Tuple[float, Dict[str, Any]]] = {}

TRUSTED_PATH_KEYWORDS = [
    "about", "company", "product", "products", "solution", "solutions",
    "leadership", "careers", "jobs", "press", "news", "investor",
    "security", "trust", "compliance", "sustainability", "blog", "docs",
    "documentation", "partners", "customers"
]

COMMON_PATHS = [
    "/", "/about", "/company", "/products", "/solutions", "/leadership",
    "/careers", "/jobs", "/press", "/news", "/investor-relations",
    "/investors", "/security", "/trust", "/compliance", "/sustainability",
    "/blog", "/docs", "/documentation", "/partners", "/customers",
    "/sitemap.xml", "/robots.txt", "/rss.xml", "/feed.xml"
]

CATEGORY_TAGS = {
    "Hiring": ["hiring", "careers", "jobs", "talent", "recruiting", "engineer"],
    "Funding": ["funding", "investor", "earnings", "revenue", "capital", "ipo"],
    "Partnership": ["partner", "partnership", "alliance", "ecosystem", "integrations"],
    "Expansion": ["expansion", "global", "region", "office", "market", "availability"],
    "Cybersecurity": ["security", "trust", "privacy", "compliance", "soc 2", "iso"],
    "Product Launch": ["product", "launch", "platform", "solution", "release"],
    "Regulation": ["regulatory", "regulation", "compliance", "policy", "legal"],
    "Technology Adoption": ["ai", "cloud", "api", "infrastructure", "developer", "docs"],
}

INDUSTRY_HINTS = [
    ("pharmaceutical", "Pharmaceuticals & Biotech"),
    ("biopharmaceutical", "Pharmaceuticals & Biotech"),
    ("clinical trial", "Healthcare & Life Sciences"),
    ("healthcare", "Healthcare & Life Sciences"),
    ("cybersecurity", "Cybersecurity"),
    ("security platform", "Cybersecurity"),
    ("cloud", "Cloud Infrastructure"),
    ("artificial intelligence", "Artificial Intelligence"),
    ("machine learning", "Artificial Intelligence"),
    ("financial infrastructure", "Financial Technology"),
    ("payments", "Financial Technology"),
    ("electric vehicle", "Automotive & Energy"),
    ("battery", "Energy Storage"),
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_url(input_url: str) -> str:
    value = input_url.strip()
    if not value:
        raise ValueError("Website URL is required.")
    if not value.startswith(("http://", "https://")):
        value = "https://" + value
    parsed = urlparse(value)
    if not parsed.netloc:
        raise ValueError("Website URL is invalid.")
    return value.rstrip("/")


def same_site(base_url: str, candidate: str) -> bool:
    base_host = urlparse(base_url).netloc.lower().replace("www.", "")
    cand_host = urlparse(candidate).netloc.lower().replace("www.", "")
    return cand_host == base_host or cand_host.endswith("." + base_host)


def compact_text(text: str, limit: int = 6000) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    return text[:limit]


def readable_sentence(text: str, limit: int = 260) -> str:
    cleaned = compact_text(text, 1200)
    for sentence in re.split(r"(?<=[.!?])\s+", cleaned):
        sentence = sentence.strip()
        if 50 <= len(sentence) <= limit and not is_boilerplate(sentence):
            return sentence[:limit]
    return cleaned[:limit] if cleaned and not is_boilerplate(cleaned) else "Insufficient public evidence."


def infer_industry(text: str) -> str:
    lowered = (text or "").lower()
    for needle, label in INDUSTRY_HINTS:
        if needle in lowered:
            return label
    return "Insufficient public evidence."


def extract_headquarters(text: str) -> str:
    patterns = [
        r"headquartered in ([A-Z][A-Za-z .'-]+,\s*[A-Z][A-Za-z .'-]+)",
        r"headquarters (?:are|is) (?:in|at) ([A-Z][A-Za-z .'-]+,\s*[A-Z][A-Za-z .'-]+)",
        r"based in ([A-Z][A-Za-z .'-]+,\s*[A-Z][A-Za-z .'-]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text or "")
        if match:
            return match.group(1)[:120]
    return "Insufficient public evidence."


def detect_language(text: str) -> str:
    if not text:
        return "unknown"
    ascii_ratio = sum(1 for ch in text if ord(ch) < 128) / max(1, len(text))
    return "en" if ascii_ratio > 0.85 else "unknown"


async def fetch_url(client: httpx.AsyncClient, url: str) -> Dict[str, Any]:
    started = time.perf_counter()
    try:
        response = await client.get(url)
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        content_type = response.headers.get("content-type", "").split(";")[0] or "unknown"
        return {
            "ok": response.status_code < 400,
            "status": response.status_code,
            "url": str(response.url),
            "requestedUrl": url,
            "contentType": content_type,
            "text": response.text[:500_000] if response.status_code < 400 else "",
            "elapsedMs": elapsed_ms,
            "error": None,
        }
    except Exception as exc:
        return {
            "ok": False,
            "status": 0,
            "url": url,
            "requestedUrl": url,
            "contentType": "unknown",
            "text": "",
            "elapsedMs": int((time.perf_counter() - started) * 1000),
            "error": str(exc),
        }


def parse_html_source(fetch: Dict[str, Any], base_url: str) -> Dict[str, Any]:
    html = fetch.get("text", "")
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg", "nav", "footer", "header", "form", "button"]):
        tag.decompose()

    title = soup.title.string.strip() if soup.title and soup.title.string else urlparse(fetch["url"]).netloc
    meta = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
    description = compact_text(meta.get("content", ""), 600) if meta else ""
    main = soup.find("main") or soup.find("article") or soup.body or soup
    text = compact_text(main.get_text(" "), 12000)

    links: List[str] = []
    rss_links: List[str] = []
    for a in soup.find_all(["a", "link"]):
        href = a.get("href")
        if not href:
            continue
        absolute = urljoin(fetch["url"], href).split("#")[0].rstrip("/")
        if not absolute.startswith(("http://", "https://")):
            continue
        rel = " ".join(a.get("rel", [])) if isinstance(a.get("rel"), list) else str(a.get("rel", ""))
        link_type = str(a.get("type", ""))
        if "rss" in rel.lower() or "atom" in rel.lower() or "rss" in link_type or "atom" in link_type:
            rss_links.append(absolute)
        if same_site(base_url, absolute) and any(k in absolute.lower() for k in TRUSTED_PATH_KEYWORDS):
            links.append(absolute)

    return {
        "sourceUrl": fetch["url"],
        "title": title,
        "description": description,
        "text": text,
        "language": detect_language(text),
        "contentType": fetch["contentType"],
        "metadata": {
            "status": fetch["status"],
            "elapsedMs": fetch["elapsedMs"],
            "description": description,
        },
        "links": sorted(set(links)),
        "rssLinks": sorted(set(rss_links)),
    }


def parse_sitemap(xml_text: str, base_url: str) -> List[str]:
    soup = BeautifulSoup(xml_text, "xml")
    urls = []
    for loc in soup.find_all("loc"):
        value = loc.get_text(strip=True)
        if value and value.startswith("http") and same_site(base_url, value):
            if any(k in value.lower() for k in TRUSTED_PATH_KEYWORDS):
                urls.append(value.rstrip("/"))
    return sorted(set(urls))


def evidence_from_source(source: Dict[str, Any], company: str) -> List[Dict[str, Any]]:
    text = source["text"]
    title = source["title"]
    if not text or len(text) < 80:
        return []

    evidence: List[Dict[str, Any]] = []
    lowered = f"{title} {text}".lower()
    for category, keywords in CATEGORY_TAGS.items():
        hits = [kw for kw in keywords if kw in lowered]
        if not hits:
            continue
        idx = min([lowered.find(hit) for hit in hits if lowered.find(hit) >= 0] or [0])
        snippet = compact_text(text[max(0, idx - 180): idx + 420], 520) or compact_text(text, 520)
        quality = validate_signal(
            {"title": title, "content": snippet, "url": source["sourceUrl"], "timestamp": utc_now()},
            company,
            website=source["sourceUrl"],
            require_company_reference=False,
        )
        if not quality["accepted"] and quality["qualityScore"] < 58:
            continue
        classified = run_offline_classifier(title, snippet)
        confidence = min(95, max(45, int(classified.get("confidence", 60)) + min(10, len(hits) * 2)))
        impact = int(classified.get("businessImpact", 1))
        evidence.append({
            "id": "ev-" + hashlib.sha1(f"{source['sourceUrl']}:{category}:{snippet}".encode("utf-8")).hexdigest()[:12],
            "source": urlparse(source["sourceUrl"]).netloc,
            "url": source["sourceUrl"],
            "title": title,
            "snippet": snippet if snippet else "Insufficient public evidence.",
            "category": category,
            "timestamp": utc_now(),
            "confidence": confidence,
            "impact": impact,
            "metricAffected": category,
            "sourceAuthority": source_authority(source["sourceUrl"], source["sourceUrl"]),
            "qualityScore": quality["qualityScore"],
            "qualityGrade": quality["qualityGrade"],
            "why": quality["reason"],
            "tags": sorted(set(hits + [category.lower(), company.lower()])),
            "language": source["language"],
            "contentType": source["contentType"],
            "metadata": source["metadata"],
        })

    if not evidence:
        evidence.append({
            "id": "ev-" + hashlib.sha1(f"{source['sourceUrl']}:general".encode("utf-8")).hexdigest()[:12],
            "source": urlparse(source["sourceUrl"]).netloc,
            "url": source["sourceUrl"],
            "title": title,
            "snippet": compact_text(source.get("description") or text, 520) or "Insufficient public evidence.",
            "category": "Company",
            "timestamp": utc_now(),
            "confidence": 55,
            "impact": 1,
            "metricAffected": "Company",
            "sourceAuthority": source_authority(source["sourceUrl"], source["sourceUrl"]),
            "qualityScore": 55,
            "qualityGrade": "Low",
            "why": "General company page with limited extractable signal detail.",
            "tags": ["company", company.lower()],
            "language": source["language"],
            "contentType": source["contentType"],
            "metadata": source["metadata"],
        })
    return evidence


def field_from_evidence(evidence: List[Dict[str, Any]], categories: List[str], fallback: str = "Insufficient public evidence.") -> str:
    for item in evidence:
        if item["category"] in categories and item["snippet"] and item.get("qualityScore", 0) >= 58:
            value = readable_sentence(item["snippet"])
            if value != "Insufficient public evidence.":
                return value
    return fallback


def build_verified_twin(base_url: str, sources: List[Dict[str, Any]], evidence: List[Dict[str, Any]]) -> Dict[str, Any]:
    homepage = sources[0] if sources else {}
    title = homepage.get("title") or urlparse(base_url).netloc.replace("www.", "")
    company_name = re.split(r"[|\-•]", title)[0].strip() or urlparse(base_url).netloc
    trusted_count = len({ev["url"] for ev in evidence if ev.get("confidence", 0) >= 55})
    confidence = min(95, 35 + trusted_count * 12)
    low_confidence = trusted_count < 3

    def category_count(category: str) -> int:
        return len([ev for ev in evidence if ev["category"] == category])

    def score(category: str, base: int = 40) -> Dict[str, Any]:
        used = [ev for ev in evidence if ev["category"] == category]
        if not used:
            return {
                "value": 0,
                "label": "Unknown",
                "evidenceCount": 0,
                "confidence": 0,
                "lastUpdated": utc_now(),
                "reason": "Insufficient public evidence.",
                "evidenceIds": [],
            }
        value = min(95, base + len(used) * 12 + sum(max(0, ev["impact"]) for ev in used[:5]))
        return {
            "value": value,
            "label": "Low Confidence" if len(used) < 2 else "Evidence-backed",
            "evidenceCount": len(used),
            "confidence": round(sum(ev["confidence"] for ev in used) / len(used)),
            "lastUpdated": max(ev["timestamp"] for ev in used),
            "reason": f"Calculated from {len(used)} public {category.lower()} evidence record(s).",
            "weight": "Evidence count 50%, source confidence 30%, impact 20%",
            "evidenceIds": [ev["id"] for ev in used],
        }

    product_evidence = [ev for ev in evidence if ev["category"] in ["Product Launch", "Technology Adoption", "Company"]]
    security_evidence = [ev for ev in evidence if ev["category"] == "Cybersecurity"]

    recommendations = []
    if trusted_count >= 3:
        for metric_name, category in [("Growth Score", "Expansion"), ("Innovation Index", "Product Launch"), ("Cyber Posture", "Cybersecurity")]:
            used = [ev for ev in evidence if ev["category"] == category][:3]
            if used:
                recommendations.append({
                    "title": f"Review {metric_name} opportunity",
                    "recommendation": f"Prioritize analyst review for {company_name}'s {metric_name.lower()} because public evidence exists.",
                    "confidence": round(sum(ev["confidence"] for ev in used) / len(used)),
                    "reasoningChain": [
                        "Public source collected.",
                        f"Evidence classified as {category}.",
                        "Metric score calculated from evidence only.",
                        "Recommendation generated from supporting sources.",
                    ],
                    "predictedOutcome": "Potential strategic motion within 30-90 days if signals continue.",
                    "evidenceIds": [ev["id"] for ev in used],
                    "supportingUrls": [ev["url"] for ev in used],
                })
    if not recommendations:
        recommendations.append({
            "title": "Insufficient public evidence.",
            "recommendation": "Insufficient public evidence.",
            "confidence": 0,
            "reasoningChain": ["Fewer than three trusted public evidence sources were collected."],
            "predictedOutcome": "Unknown.",
            "evidenceIds": [],
            "supportingUrls": [],
        })

    combined_text = " ".join(source.get("text", "")[:2500] for source in sources[:5])
    description = homepage.get("description") or readable_sentence(combined_text)
    inferred_industry = infer_industry(f"{title} {description} {combined_text}")

    return {
        "id": "import-" + uuid.uuid4().hex[:8],
        "name": company_name,
        "website": base_url,
        "industry": inferred_industry,
        "description": description,
        "products": [readable_sentence(ev["snippet"], 160) for ev in product_evidence[:5] if ev.get("qualityScore", 0) >= 58] or ["Insufficient public evidence."],
        "services": [readable_sentence(ev["snippet"], 160) for ev in product_evidence[5:10] if ev.get("qualityScore", 0) >= 58] or ["Insufficient public evidence."],
        "technologyStack": [tag for ev in evidence for tag in ev["tags"] if tag in ["ai", "cloud", "api", "infrastructure", "developer"]][:8] or ["Insufficient public evidence."],
        "targetCustomers": [field_from_evidence(evidence, ["Company", "Product Launch"])],
        "businessModel": "Insufficient public evidence.",
        "headquarters": extract_headquarters(combined_text),
        "regions": [field_from_evidence(evidence, ["Expansion"])],
        "compliance": [readable_sentence(ev["snippet"], 160) for ev in security_evidence[:4] if ev.get("qualityScore", 0) >= 58] or ["Insufficient public evidence."],
        "partners": [readable_sentence(ev["snippet"], 160) for ev in evidence if ev["category"] == "Partnership" and ev.get("qualityScore", 0) >= 58][:5] or ["Insufficient public evidence."],
        "competitors": ["Insufficient public evidence."],
        "suppliers": ["Insufficient public evidence."],
        "hiringTrend": score("Hiring"),
        "expansionTrend": score("Expansion"),
        "innovationIndex": score("Product Launch", 45),
        "digitalMaturity": score("Technology Adoption", 45),
        "cyberPosture": score("Cybersecurity", 40),
        "cloudAdoption": score("Technology Adoption", 42),
        "aiAdoption": score("Technology Adoption", 42),
        "growthScore": score("Expansion", 45),
        "evidenceCount": len(evidence),
        "trustedEvidenceSources": trusted_count,
        "confidence": confidence,
        "confidenceLabel": "Low Confidence" if low_confidence else "Evidence-backed",
        "lastUpdated": utc_now(),
        "recommendations": recommendations,
    }


async def import_company_from_public_web(input_url: str) -> Dict[str, Any]:
    base_url = normalize_url(input_url)
    cache_key = base_url.lower()
    cached = IMPORT_CACHE.get(cache_key)
    if cached and time.time() - cached[0] < CACHE_TTL_SECONDS:
        result = cached[1].copy()
        result["cacheStatus"] = "hit"
        return result

    pipeline: List[Dict[str, Any]] = []
    pipeline_started = time.perf_counter()

    def log(stage: str, status: str = "completed", detail: str = "") -> None:
        pipeline.append({
            "stage": stage,
            "status": status,
            "detail": detail,
            "timestamp": utc_now(),
            "elapsedMs": int((time.perf_counter() - pipeline_started) * 1000),
        })

    headers = {"User-Agent": "PulseForgeAI/1.0 public evidence crawler", "Accept-Language": "en-US,en;q=0.8"}
    timeout = httpx.Timeout(4.0, connect=2.0)
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, headers=headers) as client:
        log("Connecting")
        homepage_fetch = await fetch_url(client, base_url)
        if not homepage_fetch["ok"]:
            log("Finding Website", "failed", homepage_fetch.get("error") or f"HTTP {homepage_fetch['status']}")
            unavailable = {
                "status": "low_confidence",
                "message": "Website unavailable.",
                "pipeline": pipeline,
                "sources": [],
                "evidenceDatabase": [],
                "businessTwin": build_verified_twin(base_url, [], []),
                "recommendations": [],
                "qualityGates": {"trustedEvidenceSources": 0, "label": "Low Confidence", "reason": "Website unavailable."},
            }
            IMPORT_CACHE[cache_key] = (time.time(), unavailable)
            return unavailable

        log("Finding Website", detail=homepage_fetch["url"])
        homepage = parse_html_source(homepage_fetch, base_url)
        log("Parsing HTML", detail=homepage["title"])

        discovered = set([homepage_fetch["url"]])
        discovered.update(urljoin(base_url, path).rstrip("/") for path in COMMON_PATHS)
        discovered.update(homepage["links"][:20])
        rss_links = set(homepage["rssLinks"])

        sitemap_fetch = await fetch_url(client, urljoin(base_url + "/", "sitemap.xml"))
        if sitemap_fetch["ok"]:
            sitemap_urls = parse_sitemap(sitemap_fetch["text"], base_url)
            discovered.update(sitemap_urls[:25])
            log("Finding Sitemap.xml", detail=f"{len(sitemap_urls)} relevant URLs")
        else:
            log("Finding Sitemap.xml", "warning", "Sitemap not available.")

        robots_fetch = await fetch_url(client, urljoin(base_url + "/", "robots.txt"))
        log("Finding Robots.txt", "completed" if robots_fetch["ok"] else "warning", "robots.txt collected" if robots_fetch["ok"] else "robots.txt unavailable")

        candidates = []
        for url in sorted(discovered):
            path = urlparse(url).path.lower()
            priority = 0 if path in ["", "/"] else min([path.find(k) for k in TRUSTED_PATH_KEYWORDS if k in path] or [50])
            candidates.append((priority, url))
        candidate_urls = [url for _, url in sorted(candidates, key=lambda item: item[0])[:10]]

        log("Finding About Page")
        log("Finding Careers")
        log("Finding Press")
        fetches = await asyncio.gather(*(fetch_url(client, url) for url in candidate_urls))
        sources: List[Dict[str, Any]] = []
        for fetch in fetches:
            if not fetch["ok"] or not fetch["text"]:
                continue
            if "xml" in fetch["contentType"] and ("rss" in fetch["url"].lower() or "feed" in fetch["url"].lower()):
                rss_links.add(fetch["url"])
                continue
            if "html" in fetch["contentType"] or "<html" in fetch["text"][:500].lower():
                source = parse_html_source(fetch, base_url)
                if source["text"]:
                    sources.append(source)

        log("Collecting RSS")
        rss_fetches = await asyncio.gather(*(fetch_url(client, rss_url) for rss_url in sorted(rss_links)[:3]), return_exceptions=True)
        for rss_fetch in rss_fetches:
            if isinstance(rss_fetch, Exception):
                continue
            if not rss_fetch["ok"]:
                continue
            feed = feedparser.parse(rss_fetch["text"])
            for entry in feed.entries[:5]:
                text = compact_text(f"{entry.get('title', '')}. {entry.get('summary', '')}", 2000)
                if text:
                    sources.append({
                        "sourceUrl": entry.get("link", rss_url),
                        "title": entry.get("title", "RSS item"),
                        "description": entry.get("summary", ""),
                        "text": text,
                        "language": detect_language(text),
                        "contentType": "application/rss+xml",
                        "metadata": {"feed": rss_url, "status": rss_fetch["status"]},
                        "links": [],
                        "rssLinks": [],
                    })

    evidence: List[Dict[str, Any]] = []
    company_label = urlparse(base_url).netloc.replace("www.", "")
    for source in sources:
        evidence.extend(evidence_from_source(source, company_label))
    unique_evidence = {ev["id"]: ev for ev in evidence}
    evidence = list(unique_evidence.values())

    log("Collecting Hiring Signals", detail=f"{len([ev for ev in evidence if ev['category'] == 'Hiring'])} records")
    log("Classifying Evidence", detail=f"{len(evidence)} evidence records")
    twin = build_verified_twin(base_url, sources, evidence)
    log("Building Business Twin", detail=f"{twin['confidenceLabel']} / {twin['evidenceCount']} evidence records")
    log("Generating Recommendations", detail="Evidence-backed only" if twin["trustedEvidenceSources"] >= 3 else "Insufficient public evidence.")
    log("Finished")

    source_records = []
    for source in sources:
        source_records.append({
            "sourceUrl": source["sourceUrl"],
            "pageTitle": source["title"],
            "timestamp": utc_now(),
            "extractedText": source["text"][:1200],
            "detectedLanguage": source["language"],
            "contentType": source["contentType"],
            "confidence": 70 if len(source["text"]) > 200 else 45,
            "metadata": source["metadata"],
        })

    result = {
        "status": "ok",
        "message": "Finished." if evidence else "Insufficient public evidence.",
        "cacheStatus": "miss",
        "pipeline": pipeline,
        "sources": source_records,
        "evidenceDatabase": evidence,
        "businessTwin": twin,
        "recommendations": twin["recommendations"],
        "qualityGates": {
            "trustedEvidenceSources": twin["trustedEvidenceSources"],
            "label": twin["confidenceLabel"],
            "reason": "Low Confidence" if twin["trustedEvidenceSources"] < 3 else "Evidence threshold satisfied.",
        },
        # Backward-compatible fields for the current PresentationWorkspace review form.
        "name": twin["name"],
        "website": base_url,
        "industry": twin["industry"],
        "description": twin["description"],
        "product_service": "; ".join(twin["products"][:2]),
        "target_customer": "; ".join(twin["targetCustomers"][:2]),
        "target_region": "; ".join(twin["regions"][:2]),
        "partnership_goal": twin["recommendations"][0]["recommendation"] if twin["recommendations"] else "Insufficient public evidence.",
        "ideal_partner_type": "Insufficient public evidence.",
    }
    IMPORT_CACHE[cache_key] = (time.time(), result)
    return result
