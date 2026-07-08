from typing import List, Dict, Any

# Sync with the 12 frontend target companies
BASELINE_TWINS: Dict[str, Dict[str, Any]] = {
  "pfizer": {
    "id": "pfizer",
    "name": "Pfizer Inc.",
    "logo": "PF",
    "ticker": "PFE",
    "industry": "Pharmaceuticals & Biotech",
    "employeeCount": 83000,
    "hq": "New York, NY",
    "website": "pfizer.com",
    "metrics": {
      "buyingIntent": 55,
      "expansionReadiness": 80,
      "partnershipReadiness": 76,
      "cybersecurityMaturity": 84,
      "vendorRequirementProb": 58,
      "regulatoryRisk": 50,
      "techAdoptionMomentum": 82,
      "competitiveThreatLevel": 32,
      "overallStrategicOpportunity": 70
    }
  },
  "tesla": {
    "id": "tesla",
    "name": "Tesla, Inc.",
    "logo": "TS",
    "ticker": "TSLA",
    "industry": "Automotive & Energy Storage",
    "employeeCount": 140000,
    "hq": "Austin, TX",
    "website": "tesla.com",
    "metrics": {
      "buyingIntent": 60,
      "expansionReadiness": 82,
      "partnershipReadiness": 70,
      "cybersecurityMaturity": 78,
      "vendorRequirementProb": 75,
      "regulatoryRisk": 58,
      "techAdoptionMomentum": 90,
      "competitiveThreatLevel": 50,
      "overallStrategicOpportunity": 70
    }
  },
  "crowdstrike": {
    "id": "crowdstrike",
    "name": "CrowdStrike Holdings",
    "logo": "CS",
    "ticker": "CRWD",
    "industry": "Endpoint Cybersecurity",
    "employeeCount": 8400,
    "hq": "Austin, TX",
    "website": "crowdstrike.com",
    "metrics": {
      "buyingIntent": 68,
      "expansionReadiness": 78,
      "partnershipReadiness": 75,
      "cybersecurityMaturity": 88,
      "vendorRequirementProb": 45,
      "regulatoryRisk": 30,
      "techAdoptionMomentum": 86,
      "competitiveThreatLevel": 42,
      "overallStrategicOpportunity": 74
    }
  },
  "nvidia": {
    "id": "nvidia",
    "name": "NVIDIA Corporation",
    "logo": "NV",
    "ticker": "NVDA",
    "industry": "Semiconductors & AI Hardware",
    "employeeCount": 29600,
    "hq": "Santa Clara, CA",
    "website": "nvidia.com",
    "metrics": {
      "buyingIntent": 65,
      "expansionReadiness": 88,
      "partnershipReadiness": 85,
      "cybersecurityMaturity": 82,
      "vendorRequirementProb": 55,
      "regulatoryRisk": 45,
      "techAdoptionMomentum": 95,
      "competitiveThreatLevel": 35,
      "overallStrategicOpportunity": 78
    }
  },
  "microsoft": {
    "id": "microsoft",
    "name": "Microsoft Corporation",
    "logo": "MS",
    "ticker": "MSFT",
    "industry": "Cloud & Enterprise Software",
    "employeeCount": 221000,
    "hq": "Redmond, WA",
    "website": "microsoft.com",
    "metrics": {
      "buyingIntent": 70,
      "expansionReadiness": 90,
      "partnershipReadiness": 88,
      "cybersecurityMaturity": 76,
      "vendorRequirementProb": 50,
      "regulatoryRisk": 52,
      "techAdoptionMomentum": 92,
      "competitiveThreatLevel": 40,
      "overallStrategicOpportunity": 80
    }
  },
  "snowflake": {
    "id": "snowflake",
    "name": "Snowflake Inc.",
    "logo": "SF",
    "ticker": "SNOW",
    "industry": "Cloud Data Warehousing",
    "employeeCount": 7000,
    "hq": "Bozeman, MT",
    "website": "snowflake.com",
    "metrics": {
      "buyingIntent": 72,
      "expansionReadiness": 74,
      "partnershipReadiness": 80,
      "cybersecurityMaturity": 70,
      "vendorRequirementProb": 60,
      "regulatoryRisk": 35,
      "techAdoptionMomentum": 84,
      "competitiveThreatLevel": 48,
      "overallStrategicOpportunity": 72
    }
  },
  "palantir": {
    "id": "palantir",
    "name": "Palantir Technologies",
    "logo": "PL",
    "ticker": "PLTR",
    "industry": "Data Analytics & AI Systems",
    "employeeCount": 3800,
    "hq": "Denver, CO",
    "website": "palantir.com",
    "metrics": {
      "buyingIntent": 58,
      "expansionReadiness": 80,
      "partnershipReadiness": 82,
      "cybersecurityMaturity": 90,
      "vendorRequirementProb": 40,
      "regulatoryRisk": 42,
      "techAdoptionMomentum": 88,
      "competitiveThreatLevel": 38,
      "overallStrategicOpportunity": 74
    }
  },
  "cloudflare": {
    "id": "cloudflare",
    "name": "Cloudflare, Inc.",
    "logo": "CF",
    "ticker": "NET",
    "industry": "Edge Networks & CDN",
    "employeeCount": 3500,
    "hq": "San Francisco, CA",
    "website": "cloudflare.com",
    "metrics": {
      "buyingIntent": 75,
      "expansionReadiness": 82,
      "partnershipReadiness": 84,
      "cybersecurityMaturity": 85,
      "vendorRequirementProb": 48,
      "regulatoryRisk": 28,
      "techAdoptionMomentum": 88,
      "competitiveThreatLevel": 45,
      "overallStrategicOpportunity": 76
    }
  },
  "databricks": {
    "id": "databricks",
    "name": "Databricks Inc.",
    "logo": "DB",
    "ticker": "DBX",
    "industry": "Data Lakehouse & AI",
    "employeeCount": 6500,
    "hq": "San Francisco, CA",
    "website": "databricks.com",
    "metrics": {
      "buyingIntent": 74,
      "expansionReadiness": 78,
      "partnershipReadiness": 78,
      "cybersecurityMaturity": 80,
      "vendorRequirementProb": 52,
      "regulatoryRisk": 32,
      "techAdoptionMomentum": 90,
      "competitiveThreatLevel": 46,
      "overallStrategicOpportunity": 75
    }
  },
  "salesforce": {
    "id": "salesforce",
    "name": "Salesforce, Inc.",
    "logo": "CRM",
    "ticker": "CRM",
    "industry": "Enterprise CRM & SaaS",
    "employeeCount": 79000,
    "hq": "San Francisco, CA",
    "website": "salesforce.com",
    "metrics": {
      "buyingIntent": 62,
      "expansionReadiness": 84,
      "partnershipReadiness": 86,
      "cybersecurityMaturity": 82,
      "vendorRequirementProb": 45,
      "regulatoryRisk": 38,
      "techAdoptionMomentum": 84,
      "competitiveThreatLevel": 40,
      "overallStrategicOpportunity": 74
    }
  },
  "moderna": {
    "id": "moderna",
    "name": "Moderna, Inc.",
    "logo": "MD",
    "ticker": "MRNA",
    "industry": "Biotech & mRNA Therapeutics",
    "employeeCount": 5600,
    "hq": "Cambridge, MA",
    "website": "modernatx.com",
    "metrics": {
      "buyingIntent": 56,
      "expansionReadiness": 72,
      "partnershipReadiness": 78,
      "cybersecurityMaturity": 80,
      "vendorRequirementProb": 64,
      "regulatoryRisk": 48,
      "techAdoptionMomentum": 86,
      "competitiveThreatLevel": 36,
      "overallStrategicOpportunity": 68
    }
  },
  "stripe": {
    "id": "stripe",
    "name": "Stripe, Inc.",
    "logo": "ST",
    "ticker": "STRIP",
    "industry": "Financial Infrastructure",
    "employeeCount": 8000,
    "hq": "San Francisco, CA",
    "website": "stripe.com",
    "metrics": {
      "buyingIntent": 70,
      "expansionReadiness": 85,
      "partnershipReadiness": 82,
      "cybersecurityMaturity": 86,
      "vendorRequirementProb": 50,
      "regulatoryRisk": 46,
      "techAdoptionMomentum": 88,
      "competitiveThreatLevel": 38,
      "overallStrategicOpportunity": 76
    }
  }
}

def clamp(val: int) -> int:
    return max(0, min(100, val))

def build_business_twin(company_id: str, signals: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes a living business twin by combining baseline values with classified signals.
    Recalculates indices dynamically for Growth, Innovation, Technology, Cybersecurity, etc.
    """
    cid = company_id.lower().strip()
    
    # Load default baseline profile details
    if cid in BASELINE_TWINS:
        base_data = BASELINE_TWINS[cid]
    else:
        # Create dynamic baseline
        base_data = {
            "id": cid,
            "name": company_id.title(),
            "logo": company_id[:2].upper(),
            "ticker": company_id[:4].upper(),
            "industry": "General Enterprise Solutions",
            "employeeCount": 500,
            "hq": "Unknown Location",
            "website": f"{cid}.com",
            "metrics": {
                "buyingIntent": 50,
                "expansionReadiness": 50,
                "partnershipReadiness": 50,
                "cybersecurityMaturity": 70,
                "vendorRequirementProb": 50,
                "regulatoryRisk": 30,
                "techAdoptionMomentum": 60,
                "competitiveThreatLevel": 30,
                "overallStrategicOpportunity": 50
            }
        }

    # Define the 10 Business DNA indices initialized from baseline values
    metrics = {
        "growth": clamp(int(base_data["metrics"].get("buyingIntent", 50) * 0.9 + base_data["metrics"].get("techAdoptionMomentum", 60) * 0.1)),
        "innovation": clamp(int(base_data["metrics"].get("techAdoptionMomentum", 60) * 0.8 + base_data["metrics"].get("partnershipReadiness", 50) * 0.2)),
        "technology": clamp(base_data["metrics"].get("techAdoptionMomentum", 60)),
        "cybersecurity": clamp(base_data["metrics"].get("cybersecurityMaturity", 70)),
        "marketPresence": clamp(int(base_data["metrics"].get("overallStrategicOpportunity", 50) * 0.7 + base_data["metrics"].get("expansionReadiness", 50) * 0.3)),
        "hiringVelocity": clamp(int(base_data["metrics"].get("buyingIntent", 50) * 0.5 + 20)),
        "expansion": clamp(base_data["metrics"].get("expansionReadiness", 50)),
        "risk": clamp(base_data["metrics"].get("regulatoryRisk", 30)),
        "funding": clamp(int(base_data["metrics"].get("overallStrategicOpportunity", 50) * 0.8)),
        "buyingIntent": clamp(base_data["metrics"].get("buyingIntent", 50))
    }

    # Trace explanations for each index (essential for Explainability Engine)
    explainability = {k: [] for k in metrics.keys()}

    for sig in signals:
        cat = sig.get("category", "")
        impact = sig.get("businessImpact", 0)
        title = sig.get("title", "")
        sig_id = sig.get("id", "sig-1")
        
        # 1. Hiring category
        if cat == "Hiring":
            metrics["hiringVelocity"] = clamp(metrics["hiringVelocity"] + 15)
            metrics["growth"] = clamp(metrics["growth"] + 5)
            explainability["hiringVelocity"].append({
                "signalId": sig_id,
                "signalTitle": title,
                "effect": "+15% due to active recruiting campaigns.",
                "impact": 15
            })
            if "sales" in title.lower() or "executives" in title.lower():
                metrics["buyingIntent"] = clamp(metrics["buyingIntent"] + 25) # +25 to match demo score surge
                explainability["buyingIntent"].append({
                    "signalId": sig_id,
                    "signalTitle": title,
                    "effect": "+25% due to scaling enterprise sales teams.",
                    "impact": 25
                })
        
        # 2. Funding category
        elif cat == "Funding":
            metrics["funding"] = clamp(metrics["funding"] + 18)
            metrics["growth"] = clamp(metrics["growth"] + 10)
            metrics["buyingIntent"] = clamp(metrics["buyingIntent"] + 8)
            explainability["funding"].append({
                "signalId": sig_id,
                "signalTitle": title,
                "effect": "+18% expansion of operational cash reserves.",
                "impact": 18
            })

        # 3. Expansion category
        elif cat == "Expansion":
            metrics["expansion"] = clamp(metrics["expansion"] + 12)
            metrics["marketPresence"] = clamp(metrics["marketPresence"] + 8)
            explainability["expansion"].append({
                "signalId": sig_id,
                "signalTitle": title,
                "effect": "+12% opening regional hubs increases reach.",
                "impact": 12
            })

        # 4. Product Launch category
        elif cat == "Product Launch":
            metrics["innovation"] = clamp(metrics["innovation"] + 14)
            metrics["growth"] = clamp(metrics["growth"] + 8)
            metrics["buyingIntent"] = clamp(metrics["buyingIntent"] + 10)
            explainability["innovation"].append({
                "signalId": sig_id,
                "signalTitle": title,
                "effect": "+14% feature launch updates monetization gates.",
                "impact": 14
            })

        # 5. Partnership category
        elif cat == "Partnership":
            metrics["technology"] = clamp(metrics["technology"] + 10)
            metrics["growth"] = clamp(metrics["growth"] + 6)
            explainability["technology"].append({
                "signalId": sig_id,
                "signalTitle": title,
                "effect": "+10% strategic product integrations secure ecosystems.",
                "impact": 10
            })

        # 6. Technology Adoption category
        elif cat == "Technology Adoption":
            metrics["technology"] = clamp(metrics["technology"] + 15)
            metrics["innovation"] = clamp(metrics["innovation"] + 8)
            explainability["technology"].append({
                "signalId": sig_id,
                "signalTitle": title,
                "effect": "+15% deployment of modern runtime frameworks.",
                "impact": 15
            })

        # 7. Cybersecurity category
        elif cat == "Cybersecurity":
            if impact < 0:
                metrics["cybersecurity"] = clamp(metrics["cybersecurity"] - 22)
                metrics["risk"] = clamp(metrics["risk"] + 18)
                metrics["marketPresence"] = clamp(metrics["marketPresence"] - 10)
                explainability["cybersecurity"].append({
                    "signalId": sig_id,
                    "signalTitle": title,
                    "effect": "-22% active security vulnerability exposure detected.",
                    "impact": -22
                })
            else:
                metrics["cybersecurity"] = clamp(metrics["cybersecurity"] + 10)
                explainability["cybersecurity"].append({
                    "signalId": sig_id,
                    "signalTitle": title,
                    "effect": "+10% patch release resolves security threat vectors.",
                    "impact": 10
                })

        # 8. Regulation category
        elif cat == "Regulation":
            if impact < 0:
                metrics["risk"] = clamp(metrics["risk"] + 15)
                metrics["expansion"] = clamp(metrics["expansion"] - 12)
                explainability["risk"].append({
                    "signalId": sig_id,
                    "signalTitle": title,
                    "effect": "+15% due to regulatory compliance warning letters.",
                    "impact": 15
                })
            else:
                metrics["risk"] = clamp(metrics["risk"] - 8)
                metrics["expansion"] = clamp(metrics["expansion"] + 10)
                explainability["expansion"].append({
                    "signalId": sig_id,
                    "signalTitle": title,
                    "effect": "+10% sandbox approvals open APAC trial networks.",
                    "impact": 10
                })

        # 9. Supply Chain category
        elif cat == "Supply Chain":
            metrics["risk"] = clamp(metrics["risk"] + 10)
            metrics["growth"] = clamp(metrics["growth"] - 8)
            explainability["risk"].append({
                "signalId": sig_id,
                "signalTitle": title,
                "effect": "+10% material supply chain delays increase operations risk.",
                "impact": 10
            })

        # 10. Competitive Threat category
        elif cat == "Competitive Threat":
            metrics["risk"] = clamp(metrics["risk"] + 12)
            metrics["marketPresence"] = clamp(metrics["marketPresence"] - 8)
            explainability["risk"].append({
                "signalId": sig_id,
                "signalTitle": title,
                "effect": "+12% rival capital rounds threaten market segments.",
                "impact": 12
            })

        # 11. Market Sentiment category
        elif cat == "Market Sentiment":
            if impact >= 0:
                metrics["marketPresence"] = clamp(metrics["marketPresence"] + 10)
                metrics["growth"] = clamp(metrics["growth"] + 6)
                explainability["marketPresence"].append({
                    "signalId": sig_id,
                    "signalTitle": title,
                    "effect": "+10% bullish stock valuations and profit estimates.",
                    "impact": 10
                })
            else:
                metrics["marketPresence"] = clamp(metrics["marketPresence"] - 8)
                explainability["marketPresence"].append({
                    "signalId": sig_id,
                    "signalTitle": title,
                    "effect": "-8% stock slides or profit warnings lower indicators.",
                    "impact": -8
                })

    # Sort signals to form chronological Business Timeline & Memory
    sorted_signals = sorted(signals, key=lambda x: x.get("timestamp", ""))
    
    business_timeline = []
    for sig in sorted_signals:
        business_timeline.append({
            "timestamp": sig.get("timestamp", ""),
            "event": sig.get("title", ""),
            "description": sig.get("content", ""),
            "category": sig.get("category", ""),
            "impact": sig.get("businessImpact", 0)
        })

    business_memory = []
    for idx, sig in enumerate(sorted_signals):
        business_memory.append({
            "id": sig.get("id", f"mem-{idx}"),
            "event": sig.get("title", ""),
            "date": sig.get("timestamp", ""),
            "observation": f"Classified under {sig.get('category')} with {sig.get('confidence')}% confidence. Impact score: {sig.get('businessImpact')}."
        })

    # Overall strategic score combination
    weighted_score = clamp(round(
        metrics["growth"] * 0.25 +
        metrics["innovation"] * 0.15 +
        metrics["technology"] * 0.15 +
        metrics["cybersecurity"] * 0.15 +
        metrics["marketPresence"] * 0.15 -
        metrics["risk"] * 0.1
    ))

    # Add default baseline history
    history = []
    for i in range(6):
        history.append({
            "timestamp": f"2026-07-0{i+2}",
            "metrics": {k: clamp(v + (i - 3)) for k, v in metrics.items()}
        })

    return {
        "id": base_data["id"],
        "name": base_data["name"],
        "logo": base_data["logo"],
        "ticker": base_data["ticker"],
        "industry": base_data["industry"],
        "employeeCount": base_data["employeeCount"],
        "hq": base_data["hq"],
        "website": base_data["website"],
        "metrics": metrics,
        "overallScore": weighted_score,
        "explainability": explainability,
        "businessTimeline": business_timeline,
        "businessMemory": business_memory,
        "historicalMetrics": history,
        "currentSignals": signals
    }
