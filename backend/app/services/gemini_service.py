import json
import re
import time
import httpx
from typing import List, Dict, Any
from app.config import GEMINI_API_KEY

GEMINI_DISABLED_UNTIL = 0.0


def gemini_available() -> bool:
    return bool(GEMINI_API_KEY) and time.time() >= GEMINI_DISABLED_UNTIL


def mark_gemini_failure(status_code: int | None = None) -> None:
    global GEMINI_DISABLED_UNTIL
    if status_code in {401, 403, 429}:
        GEMINI_DISABLED_UNTIL = time.time() + 300

async def call_gemini_json(prompt: str, system_instruction: str = "") -> Dict[str, Any]:
    """
    Core utility to invoke Gemini API and request JSON response formatting.
    """
    if not gemini_available():
        raise ValueError("Gemini API key is not configured.")

    # Check if this is a Nebius API key pasted into GEMINI_API_KEY
    if GEMINI_API_KEY.startswith("AQ."):
        url = "https://api.studio.nebius.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GEMINI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "meta-llama/Meta-Llama-3.1-70B-Instruct",
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}
        }
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.post(url, json=payload, headers=headers)
            if res.status_code == 200:
                raw_text = res.json()["choices"][0]["message"]["content"]
                json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(0))
                return json.loads(raw_text)
            else:
                mark_gemini_failure(res.status_code)
                raise httpx.HTTPStatusError(f"Nebius API returned status code {res.status_code}", request=res.request, response=res)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    async with httpx.AsyncClient(timeout=8.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code == 200:
            raw_text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
            # Extract JSON brackets if model wraps it in markdown blocks
            json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return json.loads(raw_text)
        else:
            mark_gemini_failure(res.status_code)
            raise httpx.HTTPStatusError(f"Gemini API returned status code {res.status_code}", request=res.request, response=res)

async def generate_twin_summary(company_name: str, industry: str, signals: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Uses Gemini to generate a company summary and dynamic Twin Narrative based on structured evidence.
    """
    if not gemini_available() or not signals:
        return {
            "summary": f"{company_name} is a leading enterprise in the {industry} sector.",
            "narrative": "Twin state calibrated from baseline indices. Monitor telemetry scrapes for real-time updates."
        }

    system_instruction = "You are a senior financial analyst and strategist. You never invent facts. You summarize companies and write narratives strictly based on structured evidence. If evidence is weak or sparse, explicitly state that confidence is low."
    
    prompt = f"""
    Analyze the company: {company_name} (Industry: {industry}).
    Here are the structured signals and telemetry captured:
    {json.dumps(signals)}

    Tasks:
    1. Write a short corporate summary.
    2. Write a dynamic Business Twin narrative explaining their current operational focus, recent moves, and security posture.
    
    Respond ONLY with a JSON object in this format:
    {{
        "summary": "1-2 sentence executive summary...",
        "narrative": "Detailed narrative block explaining telemetry shifts..."
    }}
    """
    try:
        return await call_gemini_json(prompt, system_instruction)
    except Exception as e:
        print(f"[GeminiService] Failed generating twin summary, falling back: {str(e)}")
        return {
            "summary": f"{company_name} is a leading enterprise in the {industry} sector.",
            "narrative": "Twin state calibrated from baseline indices. Monitor telemetry scrapes for real-time updates."
        }

async def generate_timeline_predictions(company_twin: Dict[str, Any], signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Uses Gemini to project 30/60/90 day forecasts. Prohibits hallucinating future events.
    """
    if not gemini_available() or not signals:
        return []

    system_instruction = "You are a corporate foresight engine. You predict 30/60/90 day actions (Hiring, Partnerships, Technology Adoption, Compliance, Cybersecurity, Acquisition, Funding) strictly referencing evidence signals. If evidence is weak, output a low probability and explain the limitation. Never invent facts."

    prompt = f"""
    Evaluate this corporate twin:
    Name: {company_twin['name']}
    Industry: {company_twin['industry']}
    Current metrics: {json.dumps(company_twin['metrics'])}

    Evidence Signals:
    {json.dumps(signals)}

    Generate three forecasts (one for 30 Days, one for 60 Days, and one for 90 Days).
    Choose category from: Expansion, Hiring, Partnerships, Technology Adoption, Compliance, Cybersecurity, Acquisition, Funding.
    For each forecast, link it to a specific signal in the evidence list.
    
    Respond ONLY with a JSON array containing exactly three objects in this format:
    [
        {{
            "timeframe": "30 Days" | "60 Days" | "90 Days",
            "category": "One of the categories",
            "title": "Title of the prediction",
            "predictedAction": "Action statement...",
            "probability": 0-100 (Estimate confidence based on evidence strength. Lower it if signals are vague),
            "urgency": "low" | "medium" | "high" | "critical",
            "why": "Detailed reasoning referencing the signal title and snippet...",
            "evidence": {{
                "title": "Supporting signal title",
                "url": "Supporting signal URL",
                "snippet": "Snippet quote directly matching"
            }}
        }}
    ]
    """
    try:
        if GEMINI_API_KEY.startswith("AQ."):
            url = "https://api.studio.nebius.ai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {GEMINI_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "meta-llama/Meta-Llama-3.1-70B-Instruct",
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ]
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    raw_text = res.json()["choices"][0]["message"]["content"]
                    json_match = re.search(r"\[.*\]", raw_text, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group(0))
                    return json.loads(raw_text)
                else:
                    mark_gemini_failure(res.status_code)
                    raise httpx.HTTPStatusError(f"Nebius API returned status code {res.status_code}", request=res.request, response=res)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json"
            },
            "systemInstruction": {"parts": [{"text": system_instruction}]}
        }
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                raw_text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                json_match = re.search(r"\[.*\]", raw_text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(0))
                return json.loads(raw_text)
    except Exception as e:
        print(f"[GeminiService] Failed generating predictions, falling back: {str(e)}")
        return []

async def generate_executive_recommendations_and_outreach(company_twin: Dict[str, Any], playbook: Dict[str, Any], signals: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Uses Gemini to generate personalized outreach and decision recommendations citing structured signals.
    """
    if not gemini_available():
        raise ValueError("Gemini is not active.")

    system_instruction = "You are an executive strategist. You write highly personalized outreach emails and briefs referencing structured signal titles and source links. You never hallucinate links or snippets. If signals are sparse, keep descriptions conservative."

    prompt = f"""
    Target company: {company_twin['name']} (Website: {company_twin['website']}, Ticker: {company_twin['ticker']})
    Playbook suggestion: {json.dumps(playbook)}
    Structured evidence signals: {json.dumps(signals)}

    Tasks:
    1. Write a professional B2B outreach email citing the source signal and link.
    2. Write a LinkedIn DM hook.
    3. Write an executive brief summary.
    4. Generate a Partnership Recommendation brief.
    5. Generate a Vendor Recommendation brief.
    6. Generate a Customer Recommendation brief.

    Respond ONLY with a JSON object in this format:
    {{
        "email": "Outreach email text...",
        "linkedinDm": "LinkedIn DM text...",
        "executiveBrief": "Executive briefing summary...",
        "partnershipRecommendation": "Partnership recommendation brief...",
        "vendorRecommendation": "Vendor recommendation brief...",
        "customerRecommendation": "Customer recommendation brief..."
    }}
    """
    return await call_gemini_json(prompt, system_instruction)
