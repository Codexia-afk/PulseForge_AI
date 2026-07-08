import httpx
import re
from bs4 import BeautifulSoup

# Try importing trafilatura for cleaner text extraction
try:
    import trafilatura
    TRAFILATURA_AVAILABLE = True
except ImportError:
    TRAFILATURA_AVAILABLE = False

async def extract_page_content(url: str) -> str:
    """
    Fetch a page and extract text, removing boilerplates.
    """
    if not url:
        return ""
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
    }
    
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            if response.status_code != 200:
                print(f"[Extractor] Failed to fetch {url}, status: {response.status_code}")
                return ""
            
            html = response.text
            
            # Use trafilatura if available for premium cleanup
            if TRAFILATURA_AVAILABLE:
                text = trafilatura.extract(html, include_links=False, include_comments=False)
                if text:
                    return text
            
            # Fallback to BeautifulSoup parser
            soup = BeautifulSoup(html, "html.parser")
            
            # Remove scripts, styles, headers, footers, navs
            for element in soup(["script", "style", "nav", "header", "footer", "aside"]):
                element.decompose()
            
            # Retrieve text and normalize whitespace
            text = soup.get_text(separator=" ")
            text = re.sub(r'\s+', ' ', text).strip()
            return text
            
    except Exception as e:
        print(f"[Extractor] Error scraping {url}: {str(e)}")
        return ""

async def extract_company_signals_from_site(company_url: str) -> list:
    """
    Extract hiring indicators or technology stacks from standard subpages if found.
    """
    # Normalize URL
    if not company_url.startswith("http"):
        url = "https://" + company_url
    else:
        url = company_url
        
    main_text = await extract_page_content(url)
    signals = []
    
    if main_text:
        # Look for general signals
        snippet_len = 300
        if "hiring" in main_text.lower() or "careers" in main_text.lower() or "jobs" in main_text.lower():
            idx = main_text.lower().find("careers")
            start = max(0, idx - 50)
            end = min(len(main_text), idx + snippet_len)
            signals.append({
                "title": "Careers Page Discovery",
                "url": url,
                "snippet": main_text[start:end] + "...",
                "category": "hiring"
            })
            
        if "partnership" in main_text.lower() or "partner" in main_text.lower():
            idx = main_text.lower().find("partner")
            start = max(0, idx - 50)
            end = min(len(main_text), idx + snippet_len)
            signals.append({
                "title": "Partnership Intent Mentioned",
                "url": url,
                "snippet": main_text[start:end] + "...",
                "category": "partnership"
            })
            
        if "security" in main_text.lower() or "compliance" in main_text.lower() or "privacy" in main_text.lower():
            idx = main_text.lower().find("security")
            start = max(0, idx - 50)
            end = min(len(main_text), idx + snippet_len)
            signals.append({
                "title": "Security & Compliance Page",
                "url": url,
                "snippet": main_text[start:end] + "...",
                "category": "cybersecurity"
            })
            
    return signals
