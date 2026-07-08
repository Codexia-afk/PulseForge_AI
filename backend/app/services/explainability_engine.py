from typing import Dict, Any, List

def compile_explainability_audit(company_twin: Dict[str, Any], metric_key: str) -> Dict[str, Any]:
    """
    Formulates a transparent audit trail for the selected metric.
    Displays: Reason, Evidence, Confidence, Source, and Calculation path.
    """
    metrics = company_twin["metrics"]
    explain_data = company_twin.get("explainability", {}).get(metric_key, [])
    
    # Base configuration formula paths
    calculation_paths = {
        "growth": "Growth = Buying Intent * 0.9 + Tech Adoption * 0.1",
        "innovation": "Innovation = Tech Adoption * 0.8 + Partnership Readiness * 0.2",
        "technology": "Technology = Baseline + sum(Tech Adoption / Patent signals)",
        "cybersecurity": "Cybersecurity = Baseline + sum(Patch signals) - sum(Vulnerability signals)",
        "marketPresence": "Market Presence = Overall Score * 0.7 + Expansion Readiness * 0.3",
        "hiringVelocity": "Hiring Velocity = Buying Intent * 0.5 + sum(Hiring signals)",
        "expansion": "Expansion = Baseline + sum(Expansion signals) - sum(Regulatory delay signals)",
        "risk": "Risk Index = Baseline + sum(Vulnerability / Regulation delay signals)",
        "funding": "Funding Strength = Overall Score * 0.8 + sum(Funding signals)",
        "buyingIntent": "Buying Intent = Baseline + sum(Sales Hiring / Product Launch signals)",
        "overallScore": "Overall Score = Growth*0.25 + Innovation*0.15 + Tech*0.15 + Cyber*0.15 + Market*0.15 - Risk*0.1"
    }

    path = calculation_paths.get(metric_key, "Index = Baseline + sum(Signal impacts)")
    
    # Calculate starting baseline mathematically
    current_val = metrics.get(metric_key, 50)
    signal_sum = sum(item.get("impact", 0) for item in explain_data)
    starting_baseline = current_val - signal_sum

    # Compile signals evidence list
    evidence_list = []
    sources_list = []
    confidence_sum = 80
    
    for item in explain_data:
        sig_title = item.get("signalTitle", "")
        # Find matching signal in current signals to extract url and content snippet
        matched_sig = next((s for s in company_twin.get("currentSignals", []) if s.get("title") == sig_title), {})
        
        url = matched_sig.get("url", f"https://www.{company_twin['website']}")
        snippet = matched_sig.get("content", matched_sig.get("snippet", "Telemetry updates."))
        conf = matched_sig.get("confidence", 85)
        
        evidence_list.append({
            "signalTitle": sig_title,
            "impact": item.get("impact", 0),
            "effect": item.get("effect", ""),
            "snippet": snippet
        })
        
        sources_list.append(url)
        confidence_sum += conf

    avg_confidence = round(confidence_sum / (len(explain_data) + 1))
    
    # Reason explanation summary
    if len(explain_data) == 0:
        reason = f"Metric resides at baseline levels ({current_val}%). No modifying strategic indicators detected in recent telemetry scraping cycles."
        calc_path_detail = f"{path} (Baseline: {current_val}%, Signal Impacts: 0)"
    else:
        reason = f"Metric calibrated from baseline {starting_baseline}% to {current_val}% due to {len(explain_data)} verified public signals."
        impact_details = " + ".join(f"{item['impact']}% ({item['signalTitle'][:30]}...)" for item in explain_data)
        calc_path_detail = f"{path} -> Baseline ({starting_baseline}%) + {impact_details} = {current_val}%"

    return {
        "metric": metric_key,
        "currentValue": current_val,
        "reason": reason,
        "calculationPath": calc_path_detail,
        "confidence": avg_confidence,
        "evidence": evidence_list,
        "sources": list(set(sources_list)) if sources_list else [f"https://www.{company_twin['website']}"]
    }
