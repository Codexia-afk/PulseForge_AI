import re
import json
import httpx
from typing import Dict, Any
from app.config import GEMINI_API_KEY, OPENAI_API_KEY
from app.services.gemini_service import gemini_available, mark_gemini_failure

CATEGORIES = [
    "Hiring", "Funding", "Expansion", "Product Launch", "Partnership",
    "Technology Adoption", "Cybersecurity", "Regulation", "Supply Chain",
    "Competitive Threat", "Market Sentiment"
]

def run_offline_classifier(title: str, content: str) -> Dict[str, Any]:
    """
    Rule-based heuristics classifier supporting 11 categories.
    """
    text = (title + " " + content).lower()
    
    category = "Technology Adoption"
    urgency = "low"
    confidence = 80
    business_impact = 2
    reasoning = "General corporate telemetry signal."
    snippet = content[:200] if len(content) > 200 else content

    # 1. Cybersecurity
    if any(k in text for k in ["exploit", "leak", "vulnerability", "breach", "hacked", "zero-day", "cisa", "patch", "outage", "incident"]):
        category = "Cybersecurity"
        confidence = 85
        if "patch" in text or "resolved" in text:
            business_impact = 3
            reasoning = "Patch deployment resolves active systems threat, strengthening endpoints."
        else:
            business_impact = -8
            reasoning = "Active security vulnerability or outage poses structural compliance risks."
            
    # 2. Regulation & Compliance
    elif any(k in text for k in ["sec", "fda", "regulation", "compliance", "lawsuit", "guideline", "fines", "sandbox", "audit"]):
        category = "Regulation"
        confidence = 90
        if "sandbox" in text:
            business_impact = 6
            reasoning = "Sandbox validation unlocks pilot integrations and verifies legal posture."
        elif "delay" in text or "fines" in text:
            business_impact = -6
            reasoning = "Regulatory delays or compliance reviews restrict near-term commercial launches."
        else:
            business_impact = -2
            reasoning = "Monitoring legal and administrative guidelines to align operations."

    # 3. Hiring
    elif any(k in text for k in ["hiring", "recruit", "talent", "headcount", "account executive", "director of", "engineering"]):
        category = "Hiring"
        confidence = 85
        if "sales" in text or "executive" in text:
            business_impact = 6
            reasoning = "Recruiting sales leaders signals preparation to scale regional customer pipelines."
        else:
            business_impact = 3
            reasoning = "Hiring specialised developers to build cloud system capabilities."

    # 4. Funding
    elif any(k in text for k in ["funding", "series", "raises", "ipo", "debt facility", "capital", "venture"]):
        category = "Funding"
        confidence = 95
        business_impact = 8
        reasoning = "Capital rounds expand operational cash runway to fund aggressive research and scaling."

    # 5. Partnership
    elif any(k in text for k in ["partnership", "alliances", "partner", "collaborates", "agreement", "integrates"]):
        category = "Partnership"
        confidence = 90
        business_impact = 7
        reasoning = "Forming strategic integrations with core providers unlocks rapid distribution."

    # 6. Product Launch
    elif any(k in text for k in ["launch", "announces", "release", "unveils", "platform release", "subscription"]):
        category = "Product Launch"
        confidence = 90
        business_impact = 6
        reasoning = "Product launches introduce features to monetize new client segments."

    # 7. Supply Chain
    elif any(k in text for k in ["supply chain", "bottleneck", "shortage", "delayed shipment", "procurement"]):
        category = "Supply Chain"
        confidence = 85
        business_impact = -5
        reasoning = "Shortages in battery cells or silicon hardware delay operational timelines."

    # 8. Expansion
    elif any(k in text for k in ["expand", "regional office", "opening", "apac", "emea", "global office", "geographic"]):
        category = "Expansion"
        confidence = 90
        business_impact = 6
        reasoning = "Geographic expansion signals operational strength and new market entry."

    # 9. Competitive Threat
    elif any(k in text for k in ["competitor", "acquires", "acquisition", "rival", "merger"]):
        category = "Competitive Threat"
        confidence = 85
        if "acquires" in text or "acquisition" in text:
            business_impact = 7
            reasoning = "Acquisitions expand system reach and consolidate competitor lines."
        else:
            business_impact = -4
            reasoning = "Rival company activity threatens current customer pipelines."

    # 10. Market Sentiment
    elif any(k in text for k in ["stock surges", "shares slide", "revenue gains", "profit warning", "growth estimates", "outlook"]):
        category = "Market Sentiment"
        confidence = 88
        if any(w in text for w in ["surge", "gain", "profit", "bullish"]):
            business_impact = 5
            reasoning = "Strong market sentiment driven by growth estimates and profit gains."
        else:
            business_impact = -4
            reasoning = "Slowing market projections or sliding shares affect company valuation."

    return {
        "category": category,
        "confidence": confidence,
        "businessImpact": business_impact,
        "reasoning": reasoning,
        "snippet": snippet
    }

async def classify_signal(title: str, content: str) -> Dict[str, Any]:
    """
    Classifies a raw text signal. Tries Gemini/OpenAI API first, falls back to offline heuristics.
    """
    if gemini_available():
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        prompt = f"""
        Analyze the following corporate signal:
        Title: {title}
        Content: {content}

        Categorize it into one of these 11 values: {", ".join(CATEGORIES)}.
        
        Respond ONLY with a JSON object in this format:
        {{
            "category": "One of the 11 categories",
            "confidence": 0-100,
            "businessImpact": -10 to 10,
            "reasoning": "A concise summary explaining why this category matches and its business effect",
            "snippet": "A short 1-2 sentence evidence quote directly from the content"
        }}
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
                if res.status_code == 200:
                    text_res = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                    json_match = re.search(r"\{.*\}", text_res, re.DOTALL)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        if parsed.get("category") in CATEGORIES:
                            return parsed
                else:
                    mark_gemini_failure(res.status_code)
        except Exception as e:
            print(f"[Classifier] Gemini API failed, falling back to heuristics: {str(e)}")

    if OPENAI_API_KEY:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "user",
                    "content": f"Classify this corporate signal in JSON format. Rules: category must be one of: {', '.join(CATEGORIES)}. Respond only with a JSON object containing keys: category, confidence, businessImpact (number -10 to 10), reasoning, snippet. Title: {title}. Content: {content}."
                }
            ],
            "temperature": 0.2
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    text_res = res.json()["choices"][0]["message"]["content"]
                    json_match = re.search(r"\{.*\}", text_res, re.DOTALL)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        if parsed.get("category") in CATEGORIES:
                            return parsed
        except Exception as e:
            print(f"[Classifier] OpenAI API failed, falling back to heuristics: {str(e)}")

    return run_offline_classifier(title, content)
