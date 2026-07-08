import asyncio
import time
from typing import Any, Dict

import httpx

from app.config import (
    GEMINI_API_KEY,
    GOOGLE_API_KEY,
    GOOGLE_CX,
    NEWS_API_KEY,
    OPENAI_API_KEY,
    TAVILY_API_KEY,
)
from app.services.observability import log_event


async def _probe(name: str, configured: bool, request_factory) -> Dict[str, Any]:
    started = time.perf_counter()
    base = {
        "provider": name,
        "loadedFromEnv": configured,
        "missing": not configured,
        "invalid": False,
        "expired": False,
        "permissionDenied": False,
        "wrongEnvironmentVariable": False,
        "successfullyResponding": False,
        "statusCode": None,
        "responseTimeMs": None,
        "error": None,
    }
    if not configured:
        return base

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(5.0, connect=2.0)) as client:
            method, url, kwargs = request_factory()
            response = await client.request(method, url, **kwargs)
        base["statusCode"] = response.status_code
        base["responseTimeMs"] = int((time.perf_counter() - started) * 1000)
        if response.status_code < 400:
            base["successfullyResponding"] = True
        elif response.status_code in {401, 403}:
            base["invalid"] = True
            base["permissionDenied"] = response.status_code == 403
        elif response.status_code in {402, 429}:
            base["expired"] = response.status_code == 402
            base["permissionDenied"] = response.status_code == 429
        else:
            base["error"] = f"HTTP {response.status_code}"
    except Exception as exc:
        base["responseTimeMs"] = int((time.perf_counter() - started) * 1000)
        base["error"] = str(exc)
    log_event("provider.probe", provider=name, ok=base["successfullyResponding"], elapsedMs=base["responseTimeMs"])
    return base


async def check_provider_status() -> Dict[str, Any]:
    tasks = [
        _probe(
            "Tavily",
            bool(TAVILY_API_KEY),
            lambda: (
                "POST",
                "https://api.tavily.com/search",
                {"json": {"api_key": TAVILY_API_KEY, "query": "PulseForge diagnostics", "search_depth": "basic", "max_results": 1}},
            ),
        ),
        _probe(
            "NewsAPI",
            bool(NEWS_API_KEY),
            lambda: (
                "GET",
                "https://newsapi.org/v2/everything",
                {"params": {"apiKey": NEWS_API_KEY, "q": "technology", "pageSize": 1, "language": "en"}},
            ),
        ),
        _probe(
            "Gemini",
            bool(GEMINI_API_KEY),
            lambda: (
                "POST",
                (
                    "https://api.studio.nebius.ai/v1/chat/completions"
                    if GEMINI_API_KEY.startswith("AQ.")
                    else f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
                ),
                (
                    {
                        "headers": {"Authorization": f"Bearer {GEMINI_API_KEY}", "Content-Type": "application/json"},
                        "json": {"model": "meta-llama/Meta-Llama-3.1-70B-Instruct", "messages": [{"role": "user", "content": "Return JSON {\"ok\":true}"}]},
                    }
                    if GEMINI_API_KEY.startswith("AQ.")
                    else {"json": {"contents": [{"parts": [{"text": "Return JSON {\"ok\":true}"}]}]}}
                ),
            ),
        ),
        _probe(
            "OpenAI",
            bool(OPENAI_API_KEY),
            lambda: (
                "GET",
                "https://api.openai.com/v1/models",
                {"headers": {"Authorization": f"Bearer {OPENAI_API_KEY}"}},
            ),
        ),
        _probe(
            "Google Search",
            bool(GOOGLE_API_KEY),
            lambda: (
                "GET",
                "https://www.googleapis.com/customsearch/v1",
                {"params": {"key": GOOGLE_API_KEY, "cx": GOOGLE_CX or "missing", "q": "PulseForge", "num": 1}},
            ),
        ),
        _probe(
            "Google Custom Search",
            bool(GOOGLE_CX),
            lambda: (
                "GET",
                "https://www.googleapis.com/customsearch/v1",
                {"params": {"key": GOOGLE_API_KEY or "missing", "cx": GOOGLE_CX, "q": "PulseForge", "num": 1}},
            ),
        ),
    ]
    providers = await asyncio.gather(*tasks)
    if GOOGLE_API_KEY and not GOOGLE_CX:
        for provider in providers:
            if provider["provider"] == "Google Search":
                provider["wrongEnvironmentVariable"] = True
                provider["error"] = "GOOGLE_API_KEY is set but GOOGLE_CX is missing."
    if GOOGLE_CX and not GOOGLE_API_KEY:
        for provider in providers:
            if provider["provider"] == "Google Custom Search":
                provider["wrongEnvironmentVariable"] = True
                provider["error"] = "GOOGLE_CX is set but GOOGLE_API_KEY is missing."
    return {
        "providers": providers,
        "summary": {
            "configured": len([p for p in providers if p["loadedFromEnv"]]),
            "responding": len([p for p in providers if p["successfullyResponding"]]),
            "missing": len([p for p in providers if p["missing"]]),
        },
    }
