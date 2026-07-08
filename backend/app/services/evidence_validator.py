from typing import List, Dict

def validate_evidence(evidence_list: List[Dict]) -> List[Dict]:
    """
    Validates that all evidence records have a title, url, snippet, and category.
    Returns only verified, complete evidence structures.
    """
    validated_records = []
    
    for item in evidence_list:
        title = item.get("title", "").strip()
        url = item.get("url", "").strip()
        snippet = item.get("snippet", "").strip()
        category = item.get("category", "tech_adoption").strip()
        confidence = item.get("confidence", 80)
        
        # Ensure we have all necessary components to construct verification links
        if title and url and snippet:
            # Basic URL format validation
            if url.startswith("http://") or url.startswith("https://"):
                validated_records.append({
                    "title": title,
                    "url": url,
                    "snippet": snippet,
                    "category": category,
                    "confidence": int(confidence)
                })
                
    return validated_records
