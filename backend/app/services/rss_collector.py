import feedparser
import urllib.parse
from typing import List, Dict

def collect_rss_signals(company_name: str, ticker: str = "") -> List[Dict]:
    """
    Search Yahoo Finance or RSS feeds for corporate signals.
    """
    signals = []
    
    # Yahoo Finance RSS feed template
    query_ticker = ticker if ticker else company_name
    encoded_ticker = urllib.parse.quote(query_ticker.strip())
    feed_url = f"https://feeds.finance.yahoo.com/rss.xml?s={encoded_ticker}"
    
    try:
        # feedparser handles malformed XML feeds cleanly
        feed = feedparser.parse(feed_url)
        
        for entry in feed.entries[:5]:
            title = entry.get("title", "No Title")
            summary = entry.get("summary", "") or entry.get("description", "")
            link = entry.get("link", "")
            published = entry.get("published", "")
            
            signals.append({
                "title": title,
                "url": link,
                "snippet": summary,
                "timestamp": published,
                "source": "Yahoo Finance RSS"
            })
            
    except Exception as e:
        print(f"[RSS] Failed parsing feed for {query_ticker}: {str(e)}")
        
    return signals
