import asyncio
import time
from typing import List, Dict, Any
from app.config import TAVILY_API_KEY, NEWS_API_KEY
from app.services.tavily_service import search_tavily
from app.services.news_service import fetch_company_news
from app.services.rss_collector import collect_rss_signals
from app.services.website_extractor import extract_company_signals_from_site
from app.services.observability import log_event
from app.services.evidence_quality import filter_quality_signals

async def collect_signals(company_name: str, website: str = "", ticker: str = "") -> List[Dict[str, Any]]:
    """
    Collects raw public signals from multiple sources for the specified company.
    """
    print(f"[SignalCollector] Gathering updates for: {company_name}")
    raw_signals: List[Dict[str, Any]] = []

    async def collect_tavily() -> List[Dict[str, Any]]:
        if not TAVILY_API_KEY:
            return []
        started = time.perf_counter()
        tavily_query = f'"{company_name}" (partnership OR hiring OR product launch OR security OR funding)'
        tavily_res = await asyncio.wait_for(search_tavily(tavily_query, max_results=5), timeout=6)
        log_event("collector.tavily", company=company_name, count=len(tavily_res), elapsedMs=int((time.perf_counter() - started) * 1000))
        return [{
                "title": res["title"],
                "content": res["snippet"],
                "url": res["url"],
                "source": "Tavily Web Intelligence",
                "timestamp": res.get("timestamp") or "2026-07-07T19:00:00Z"
            } for res in tavily_res]

    async def collect_news() -> List[Dict[str, Any]]:
        if not NEWS_API_KEY:
            return []
        started = time.perf_counter()
        news_res = await asyncio.wait_for(fetch_company_news(company_name, max_results=4), timeout=6)
        log_event("collector.newsapi", company=company_name, count=len(news_res), elapsedMs=int((time.perf_counter() - started) * 1000))
        return [{
                "title": res["title"],
                "content": res["snippet"],
                "url": res["url"],
                "source": "NewsAPI",
                "timestamp": res.get("timestamp") or "2026-07-07T18:00:00Z"
            } for res in news_res]

    async def collect_rss() -> List[Dict[str, Any]]:
        started = time.perf_counter()
        rss_res = await asyncio.to_thread(collect_rss_signals, company_name, ticker)
        log_event("collector.rss", company=company_name, count=len(rss_res), elapsedMs=int((time.perf_counter() - started) * 1000))
        return [{
                "title": res["title"],
                "content": res["snippet"],
                "url": res["url"],
                "source": res["source"],
                "timestamp": res.get("timestamp", "2026-07-07T17:00:00Z")
            } for res in rss_res]

    async def collect_site() -> List[Dict[str, Any]]:
        if not website:
            return []
        started = time.perf_counter()
        site_res = await asyncio.wait_for(extract_company_signals_from_site(website), timeout=6)
        log_event("collector.website", company=company_name, count=len(site_res), elapsedMs=int((time.perf_counter() - started) * 1000))
        return [{
                "title": res["title"],
                "content": res["snippet"],
                "url": res["url"],
                "source": "Website Scraper",
                "timestamp": "2026-07-07T12:00:00Z"
            } for res in site_res]

    for result in await asyncio.gather(collect_tavily(), collect_news(), collect_rss(), collect_site(), return_exceptions=True):
        if isinstance(result, Exception):
            log_event("collector.fallback", company=company_name, error=type(result).__name__)
            continue
        raw_signals.extend(result)

    raw_signals = filter_quality_signals(raw_signals, company_name, ticker=ticker, website=website, limit=12)

    # Ensure uniqueness of signals based on Title
    seen_titles = set()
    unique_signals = []
    for sig in raw_signals:
        title = sig["title"].strip().lower()
        if title not in seen_titles:
            seen_titles.add(title)
            unique_signals.append(sig)

    print(f"[SignalCollector] Collected {len(unique_signals)} unique raw signals.")
    return unique_signals
