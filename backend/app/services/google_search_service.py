import httpx
from app.config import GOOGLE_API_KEY, GOOGLE_CX

async def search_google(query: str, max_results: int = 5) -> list:
    """
    Fallback web search using Google Custom Search API.
    Returns a list of dicts: {"title": "...", "url": "...", "snippet": "..."}
    """
    if not GOOGLE_API_KEY or not GOOGLE_CX:
        print("[Google Search] GOOGLE_API_KEY or GOOGLE_CX is not configured.")
        return []
    
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_API_KEY,
        "cx": GOOGLE_CX,
        "q": query,
        "num": max_results
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                results = []
                for item in data.get("items", []):
                    results.append({
                        "title": item.get("title", "No Title"),
                        "url": item.get("link", ""),
                        "snippet": item.get("snippet", "")
                    })
                return results
            else:
                print(f"[Google Search] Error: {response.status_code} - {response.text}")
                return []
    except Exception as e:
        print(f"[Google Search] Request failed: {str(e)}")
        return []
