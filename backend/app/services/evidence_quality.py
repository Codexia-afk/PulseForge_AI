import re
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List
from urllib.parse import urlparse


BOILERPLATE_PATTERNS = [
    "skip to main content",
    "cookie",
    "privacy policy",
    "terms of use",
    "all rights reserved",
    "subscribe",
    "sign up",
    "menu",
    "search contact us",
    "please log in",
    "trk=public_jobs",
    "#main-content",
    "[skip to main content]",
]

AUTHORITY_HINTS = {
    "investor": 94,
    "press": 90,
    "newsroom": 88,
    "careers": 86,
    "security": 86,
    "about": 84,
    "partners": 84,
    "sec.gov": 95,
    "linkedin.com/jobs": 76,
    "builtin": 68,
    "crunchbase": 70,
}


def compact_text(text: str, limit: int = 900) -> str:
    value = re.sub(r"\s+", " ", text or "").strip()
    return value[:limit]


def canonical_host(url: str) -> str:
    host = urlparse(url or "").netloc.lower()
    return host.replace("www.", "")


def company_terms(company_name: str, ticker: str = "", website: str = "") -> List[str]:
    terms = []
    for raw in [company_name, ticker, canonical_host(website).split(".")[0]]:
        raw = (raw or "").lower().strip()
        if not raw:
            continue
        terms.append(raw)
        terms.extend([part for part in re.split(r"[^a-z0-9]+", raw) if len(part) >= 4])
    return sorted(set(terms), key=len, reverse=True)


def contains_company_reference(text: str, company_name: str, ticker: str = "", website: str = "") -> bool:
    haystack = (text or "").lower()
    return any(term and term in haystack for term in company_terms(company_name, ticker, website))


def is_boilerplate(text: str) -> bool:
    value = compact_text(text, 1200).lower()
    if len(value) < 55:
        return True
    hits = sum(1 for pattern in BOILERPLATE_PATTERNS if pattern in value)
    markdown_link_count = value.count("](")
    linkish_words = len(re.findall(r"\b(contact|privacy|terms|careers|investors|media|search|menu)\b", value))
    return hits >= 2 or linkish_words >= 8 or markdown_link_count >= 3


def source_authority(url: str, website: str = "") -> int:
    parsed = urlparse(url or "")
    host = canonical_host(url)
    path = parsed.path.lower()
    base_host = canonical_host(website)
    if base_host and (host == base_host or host.endswith("." + base_host)):
        score = 92
    else:
        score = 58
    joined = f"{host} {path}"
    for hint, hint_score in AUTHORITY_HINTS.items():
        if hint in joined:
            score = max(score, hint_score)
    return min(98, score)


def quality_grade(score: int) -> str:
    if score >= 85:
        return "High"
    if score >= 68:
        return "Medium"
    return "Low"


def validate_signal(
    signal: Dict[str, Any],
    company_name: str,
    ticker: str = "",
    website: str = "",
    require_company_reference: bool = True,
) -> Dict[str, Any]:
    title = signal.get("title", "")
    content = signal.get("content") or signal.get("snippet") or ""
    url = signal.get("url", "")
    combined = f"{title} {content}"
    same_site = bool(website and canonical_host(url) and (
        canonical_host(url) == canonical_host(website) or canonical_host(url).endswith("." + canonical_host(website))
    ))
    company_relevant = same_site or contains_company_reference(combined, company_name, ticker, website)
    authority = source_authority(url, website)
    boilerplate = is_boilerplate(combined)
    signal_quality = 30 + (35 if company_relevant else 0) + round(authority * 0.25) + (10 if len(compact_text(content, 2000)) > 140 else 0)
    if boilerplate:
        signal_quality -= 30
    signal_quality = max(0, min(99, signal_quality))
    accepted = signal_quality >= 62 and not boilerplate and (company_relevant or not require_company_reference)
    return {
        "accepted": accepted,
        "qualityScore": signal_quality,
        "qualityGrade": quality_grade(signal_quality),
        "companyRelevant": company_relevant,
        "authorityScore": authority,
        "boilerplate": boilerplate,
        "timestamp": signal.get("timestamp") or datetime.now(timezone.utc).isoformat(),
        "reason": (
            "Company-relevant authoritative source."
            if accepted
            else "Rejected: weak company relevance, low authority, or boilerplate content."
        ),
    }


def filter_quality_signals(
    signals: Iterable[Dict[str, Any]],
    company_name: str,
    ticker: str = "",
    website: str = "",
    limit: int | None = None,
) -> List[Dict[str, Any]]:
    accepted: List[Dict[str, Any]] = []
    for signal in signals:
        quality = validate_signal(signal, company_name, ticker, website)
        if not quality["accepted"]:
            continue
        enriched = {**signal, "quality": quality}
        accepted.append(enriched)
    accepted.sort(key=lambda item: (item["quality"]["qualityScore"], item["quality"]["authorityScore"]), reverse=True)
    return accepted[:limit] if limit else accepted
