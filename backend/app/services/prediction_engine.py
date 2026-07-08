from typing import List, Dict, Any
from app.config import GEMINI_API_KEY
from app.services.gemini_service import generate_timeline_predictions

def generate_offline_predictions(company_twin: Dict[str, Any], signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Offline fallback predictions citing signals.
    """
    predictions = []
    twin_name = company_twin["name"]
    twin_metrics = company_twin["metrics"]
    
    has_cyber = any(s.get("category") == "Cybersecurity" for s in signals)
    has_hiring = any(s.get("category") == "Hiring" for s in signals)
    has_funding = any(s.get("category") == "Funding" for s in signals)
    has_reg = any(s.get("category") == "Regulation" for s in signals)

    # 30-Day Forecast
    if has_cyber or twin_metrics.get("cybersecurity", 70) < 65:
        evidence_sig = [s for s in signals if s.get("category") == "Cybersecurity"]
        ref_title = evidence_sig[0]["title"] if evidence_sig else "active system vulnerability reports"
        predictions.append({
            "timeframe": "30 Days",
            "category": "Cybersecurity",
            "title": "Mandatory API Gateway Patch & Security Audit",
            "predictedAction": f"{twin_name} will overhaul authentication keys rotation and deploy web application firewalls.",
            "probability": 92,
            "urgency": "critical",
            "why": f"Active cybersecurity indicators ('{ref_title}') require immediate endpoint remediation to prevent data leakage.",
            "evidence": {
                "title": ref_title,
                "url": evidence_sig[0].get("url", "") if evidence_sig else "",
                "snippet": evidence_sig[0].get("snippet", "Active system vulnerability exposed.") if evidence_sig else "Low cybersecurity maturity rating."
            }
        })
    else:
        predictions.append({
            "timeframe": "30 Days",
            "category": "Technology Adoption",
            "title": "Edge Telemetry Framework Expansion",
            "predictedAction": f"{twin_name} will scale cloud database query caching nodes.",
            "probability": 80,
            "urgency": "low",
            "why": "Target company maintains high tech adoption momentum with no active threat indicators.",
            "evidence": {
                "title": "Continuous Core Software Commits",
                "url": f"https://www.{company_twin['website']}",
                "snippet": "Software optimization cycles."
            }
        })

    # 60-Day Forecast
    if has_reg or twin_metrics.get("risk", 30) > 50:
        evidence_sig = [s for s in signals if s.get("category") == "Regulation"]
        ref_title = evidence_sig[0]["title"] if evidence_sig else "FDA draft regulations"
        predictions.append({
            "timeframe": "60 Days",
            "category": "Compliance",
            "title": "Clinical Training Data Audit Logging",
            "predictedAction": f"{twin_name} will re-validate model bias controls and file compliance registers.",
            "probability": 88,
            "urgency": "high",
            "why": f"New regulatory guidelines ('{ref_title}') demand strict audit trails of algorithm training data origins within 90 days.",
            "evidence": {
                "title": ref_title,
                "url": evidence_sig[0].get("url", "") if evidence_sig else "",
                "snippet": evidence_sig[0].get("snippet", "Regulatory compliance audits required.") if evidence_sig else "High compliance risk profile."
            }
        })
    else:
        predictions.append({
            "timeframe": "60 Days",
            "category": "Partnerships",
            "title": "Multi-Tenant Data Sharing Alliances",
            "predictedAction": f"{twin_name} will coordinate data clean room integrations with major platforms.",
            "probability": 75,
            "urgency": "medium",
            "why": "Target requires unified metadata formats to establish clean data catalogs.",
            "evidence": {
                "title": "Standard SDK Release Logs",
                "url": f"https://www.{company_twin['website']}",
                "snippet": "Exposing open integration API endpoints."
            }
        })

    # 90-Day Forecast
    predictions.append({
        "timeframe": "90 Days",
        "category": "Acquisition",
        "title": "Consolidating Market Footprint via IP Acquisition",
        "predictedAction": f"{twin_name} will acquire niche infrastructure startups to ingest hardware telemetry IP.",
        "probability": 74,
        "urgency": "medium",
        "why": f"High strategic rating ({twin_metrics.get('overallScore', 50)}%) and strong balance sheets make target a prime acquirer.",
        "evidence": {
            "title": "Strategic Capital Reserve Expansion",
            "url": f"https://www.{company_twin['website']}",
            "snippet": "High strategic opportunity rating holds."
        }
    })

    return predictions

async def generate_evidence_predictions(company_twin: Dict[str, Any], signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Component 5 (Prediction Engine): Forecasts 30/60/90 day strategic roadmap indicators.
    Uses Gemini API if key is present, falls back to offline heuristics.
    """
    if GEMINI_API_KEY and signals:
        try:
            res = await generate_timeline_predictions(company_twin, signals)
            if res and len(res) == 3:
                return res
        except Exception as e:
            print(f"[PredictionEngine] Gemini predictions generation failed: {str(e)}")
            
    return generate_offline_predictions(company_twin, signals)
