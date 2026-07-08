import httpx
from app.config import TAVILY_API_KEY

async def search_tavily(query: str, max_results: int = 5) -> list:
    """
    Search the web using Tavily API.
    Returns a list of dicts: {"title": "...", "url": "...", "snippet": "..."}
    """
    if not TAVILY_API_KEY:
        print("[Tavily] TAVILY_API_KEY is not configured.")
        return []
    
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "basic",
        "include_answer": False,
        "max_results": max_results
    }
    
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                results = []
                for item in data.get("results", []):
                    results.append({
                        "title": item.get("title", "No Title"),
                        "url": item.get("url", ""),
                        "snippet": item.get("content", "")
                    })
                return results
            else:
                print(f"[Tavily] Error response: {response.status_code} - {response.text}")
                return []
    except Exception as e:
        print(f"[Tavily] Connection failed: {str(e)}")
        return []
