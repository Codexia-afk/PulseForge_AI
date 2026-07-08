import json
import re
import httpx
from typing import List, Dict, Any
from app.config import GEMINI_API_KEY
from app.services.gemini_service import gemini_available, mark_gemini_failure

def evaluate_heuristic_scores(user_profile: Dict[str, Any], target_twin: Dict[str, Any]) -> Dict[str, Any]:
    """
    Offline heuristics to calculate 7 partnership fit scores and explanations with exact weights:
    - Business Fit: 25%
    - Technology Compatibility: 20%
    - Market Alignment: 20%
    - Growth Alignment: 15%
    - Hiring Similarity: 10%
    - Regional Compatibility: 5%
    - Cybersecurity Compatibility: 5%
    """
    user_ind = user_profile.get("industry", "").lower()
    user_prod = user_profile.get("product_service", "").lower()
    user_goal = user_profile.get("partnership_goal", "").lower()
    user_region = user_profile.get("target_region", "").lower()

    twin_id = target_twin["id"]
    twin_name = target_twin["name"]
    twin_metrics = target_twin["metrics"]

    # Initialize scores (0-100)
    b_fit = 60
    t_fit = 55
    m_fit = 50
    growth_align = 60
    hiring_sim = 50
    r_fit = 65
    cyber_comp = 70

    # Explanations
    b_exp = f"General business model alignment with {twin_name}."
    t_exp = "Standard architectural compatibility."
    m_exp = "Overlapping enterprise customer segments."
    growth_exp = f"Growth index at {twin_metrics.get('growth', 60)}% indicates stable alignment."
    hiring_exp = f"Hiring velocity index at {twin_metrics.get('hiringVelocity', 50)}% matches baseline profiles."
    r_exp = f"Operational presence in targeted region ({user_region})."
    cyber_exp = f"Target company cybersecurity index stands at {twin_metrics.get('cybersecurity', 70)}%."

    # 1. Industry / Business Fit (Weight: 25%)
    if "pfizer" in twin_id or "moderna" in twin_id:
        if any(w in user_ind or w in user_prod or w in user_goal for w in ["health", "medical", "clinical", "biotech", "drug", "trial", "imaging"]):
            b_fit = 95
            b_exp = f"Exceptional Business Fit: User's focus on clinical sequencing and drug modeling directly matches {twin_name}'s pharmaceutical R&D roadmap."
        else:
            b_fit = 45
            b_exp = f"Low Business Fit: {twin_name} operates strictly in biotechnology, presenting limited commercial alignment."
            
    elif "tesla" in twin_id:
        if any(w in user_ind or w in user_prod or w in user_goal for w in ["battery", "clean energy", "storage", "grid", "scada", "utility", "solar"]):
            b_fit = 96
            b_exp = f"Exceptional Business Fit: VoltGrid's utility battery systems match {twin_name}'s Tesla Energy Megapack distribution program."
        else:
            b_fit = 40
            b_exp = f"Low Business Fit: {twin_name}'s focus is on automotive and grid battery units, rendering alignments weak."
            
    elif "crowdstrike" in twin_id or "cloudflare" in twin_id:
        if any(w in user_ind or w in user_prod or w in user_goal for w in ["security", "threat", "cyber", "ebpf", "kernel", "network", "firewall", "compliance"]):
            b_fit = 94
            b_exp = f"Exceptional Business Fit: KernSec's eBPF container scanning aligns with {twin_name}'s Falcon endpoint security suite."
        else:
            b_fit = 45
            b_exp = f"Low Business Fit: {twin_name} specializes in enterprise cybersecurity threats, offering limited overlap."

    elif "stripe" in twin_id:
        if any(w in user_ind or w in user_prod for w in ["billing", "tax", "subscription", "payments", "fintech", "saas"]):
            b_fit = 95
            b_exp = f"Exceptional Business Fit: User's subscription billing matches {twin_name}'s financial infrastructure gateway."
        else:
            b_fit = 50
            b_exp = f"Average Business Fit: Payment flows don't directly mesh with user's core segment."

    # 2. Technology Fit (Weight: 20%)
    if "nvidia" in twin_id:
        if "gpu" in user_prod or "ai" in user_prod or "llm" in user_prod or "learning" in user_prod:
            t_fit = 95
            t_exp = "Excellent Technology Fit: User's models utilize GPU acceleration, making them optimized for NVIDIA NIM frameworks."
    elif "crowdstrike" in twin_id:
        if "ebpf" in user_prod or "kernel" in user_prod or "container" in user_prod:
            t_fit = 96
            t_exp = f"Excellent Technology Fit: Deploying eBPF kernel instrumentation hooks directly merges container telemetry logs with Falcon sensor agents."
    elif "snowflake" in twin_id or "databricks" in twin_id:
        if "database" in user_prod or "clean room" in user_prod or "sql" in user_prod or "analytics" in user_prod:
            t_fit = 92
            t_exp = f"Excellent Technology Fit: Sharing datasets via Iceberg or Cortex SQL clean rooms matches {twin_name}'s cloud database architecture."

    # 3. Market Fit (Weight: 20%)
    if twin_id in ["microsoft", "salesforce", "palantir"]:
        if "enterprise" in user_prod or "fortune 500" in user_prod or "saas" in user_prod:
            m_fit = 90
            m_exp = f"High Market Fit: Shared target audience focusing on Fortune 500 cloud customers."

    # 4. Growth Alignment (Weight: 15%)
    growth_diff = abs(twin_metrics.get("growth", 60) - 75)  # user estimated growth 75
    growth_align = max(10, 100 - growth_diff * 2)
    growth_exp = f"Growth index at {twin_metrics.get('growth', 60)}% indicates close alignment with user's scaling target."

    # 5. Hiring Similarity (Weight: 10%)
    hiring_sim = max(10, 100 - abs(twin_metrics.get("hiringVelocity", 50) - 80) * 2)
    hiring_exp = f"Hiring velocity index at {twin_metrics.get('hiringVelocity', 50)}% indicates complementary recruiting volume."

    # 6. Region Fit (Weight: 5%)
    if "us" in user_region or "global" in user_region:
        r_fit = 90
        r_exp = f"High Region Fit: both companies maintain large US and global sales networks."
    elif "apac" in user_region and twin_id in ["cloudflare", "nvidia", "stripe"]:
        r_fit = 85
        r_exp = f"Good Region Fit: {twin_name} is actively expanding in Singapore and APAC sandbox trials."

    # 7. Cybersecurity Compatibility (Weight: 5%)
    cyber_comp = twin_metrics.get("cybersecurity", 70)
    cyber_exp = f"Target cybersecurity index of {cyber_comp}% meets baseline system validation standards."

    # Calculate overall Partnership Compatibility Score (Exact weights)
    compat_score = round(
        b_fit * 0.25 +
        t_fit * 0.20 +
        m_fit * 0.20 +
        growth_align * 0.15 +
        hiring_sim * 0.10 +
        r_fit * 0.05 +
        cyber_comp * 0.05
    )

    return {
        "compatibilityScore": compat_score,
        "businessFit": b_fit,
        "businessFitExplanation": b_exp,
        "technologyFit": t_fit,
        "technologyFitExplanation": t_exp,
        "marketFit": m_fit,
        "marketFitExplanation": m_exp,
        "growthAlignment": growth_align,
        "growthAlignmentExplanation": growth_exp,
        "hiringSimilarity": hiring_sim,
        "hiringSimilarityExplanation": hiring_exp,
        "regionFit": r_fit,
        "regionFitExplanation": r_exp,
        "cybersecurityCompatibility": cyber_comp,
        "cybersecurityCompatibilityExplanation": cyber_exp
    }

async def match_partnership_intelligence(user_profile: Dict[str, Any], target_twin: Dict[str, Any], signals: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evaluates partnership compatibility. Tries LLM first, falls back to heuristics.
    """
    twin_id = target_twin["id"]
    twin_name = target_twin["name"]

    if gemini_available():
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        prompt = f"""
        Perform a transparent Partnership Match between the User Company and Target Company:
        
        User Business Profile:
        {json.dumps(user_profile)}
        
        Target Twin:
        - Name: {twin_name}
        - Industry: {target_twin['industry']}
        - Current Metrics: {json.dumps(target_twin['metrics'])}
        
        Evidence Signals:
        {json.dumps(signals)}

        Calculate all 7 scores (0-100) and explain the calculation path for each.
        Respond ONLY with a JSON object in this format:
        {{
            "compatibilityScore": 0-100,
            "businessFit": 0-100,
            "businessFitExplanation": "Detailed reasoning path...",
            "technologyFit": 0-100,
            "technologyFitExplanation": "Detailed reasoning path...",
            "marketFit": 0-100,
            "marketFitExplanation": "Detailed reasoning path...",
            "growthAlignment": 0-100,
            "growthAlignmentExplanation": "Detailed reasoning path...",
            "hiringSimilarity": 0-100,
            "hiringSimilarityExplanation": "Detailed reasoning path...",
            "regionFit": 0-100,
            "regionFitExplanation": "Detailed reasoning path...",
            "cybersecurityCompatibility": 0-100,
            "cybersecurityCompatibilityExplanation": "Detailed reasoning path..."
        }}
        """
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
                if res.status_code == 200:
                    text_res = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                    json_match = re.search(r"\{.*\}", text_res, re.DOTALL)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        return parsed
                else:
                    mark_gemini_failure(res.status_code)
        except Exception as e:
            print(f"[PartnershipEngine] Gemini API matching failed: {str(e)}")

    return evaluate_heuristic_scores(user_profile, target_twin)
