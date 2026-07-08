import httpx
from app.config import NEWS_API_KEY
from app.services.evidence_quality import filter_quality_signals

async def fetch_company_news(company_name: str, max_results: int = 5) -> list:
    """
    Fetch recent articles or press releases using NewsAPI.
    Returns a list of dicts: {"title": "...", "url": "...", "snippet": "..."}
    """
    if not NEWS_API_KEY:
        print("[NewsAPI] NEWS_API_KEY is not configured.")
        return []
    
    # Simple query for company business headlines, funding, launches
    query = f'"{company_name}" AND (partnership OR launch OR funding OR hiring OR regulation OR security)'
    url = "https://newsapi.org/v2/everything"
    params = {
        "apiKey": NEWS_API_KEY,
        "q": query,
        "sortBy": "publishedAt",
        "pageSize": max_results,
        "language": "en"
    }
    
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                articles = []
                for art in data.get("articles", []):
                    # Filter out removed articles
                    if art.get("title") == "[Removed]":
                        continue
                    articles.append({
                        "title": art.get("title", "No Title"),
                        "url": art.get("url", ""),
                        "snippet": art.get("description", "") or art.get("content", "") or "",
                        "timestamp": art.get("publishedAt", "")
                    })
                return filter_quality_signals(articles, company_name, limit=max_results)
            else:
                print(f"[NewsAPI] Error response: {response.status_code} - {response.text}")
                return []
    except Exception as e:
        print(f"[NewsAPI] Request failed: {str(e)}")
        return []
