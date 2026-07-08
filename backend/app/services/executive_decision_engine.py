import json
import re
import httpx
from typing import Dict, Any, List
from app.config import GEMINI_API_KEY, OPENAI_API_KEY
from app.services.gemini_service import generate_twin_summary, generate_executive_recommendations_and_outreach, gemini_available

async def generate_playbook(company_twin: Dict[str, Any], signals: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes a strategic playbook dynamically based on twin metrics and signals.
    Uses Gemini if key is present to customize the Executive Summary narrative.
    """
    metrics = company_twin["metrics"]
    industry = company_twin.get("industry", "").lower()
    name = company_twin["name"]
    ticker = company_twin["ticker"]
    
    has_cyber = any(s.get("category") == "Cybersecurity" and s.get("businessImpact", 0) < 0 for s in signals)
    has_supply = any(s.get("category") == "Supply Chain" for s in signals)

    # Heuristic playbook template data
    playbook_data = {}

    # 1. Biotech / Pharma segment
    if "health" in industry or "biotech" in industry or "pharm" in industry or company_twin["id"] in ["pfizer", "moderna"]:
        if has_cyber:
            playbook_data = {
                "companyId": company_twin["id"],
                "outreachAngle": "Securing Clinical Data Integrity and API Gateway Access Control",
                "partnershipSuggestion": "Collaborate with CrowdStrike to deploy eBPF-based container threat security scanners.",
                "riskMitigationStep": "Deprecate legacy API endpoints, deploy strict OAuth2 sessions, and patch the IDOR API exposure immediately.",
                "strategicPlaybook": [
                    "Audit CarePortal patient endpoint parameters for object-level authorization vulnerabilities.",
                    "Deploy web application firewalls (WAF) to filter endpoint parameter manipulation.",
                    "Establish a bug bounty program to leverage external security researchers on new portals.",
                    "Brief hospital partners on telemetry updates to maintain institutional HIPAA trust."
                ],
                "executiveSummary": f"{name} is scaling clinical diagnostic tools. However, a critical IDOR patient API exposure has dropped their cybersecurity maturity and raised compliance risks, making secure API gateway integration their #1 priority."
            }
        else:
            playbook_data = {
                "companyId": company_twin["id"],
                "outreachAngle": "Accelerating FDA trial compliance and clinical database scaling",
                "partnershipSuggestion": "Partner with AWS Healthcare Cloud to build localized data clean room portals.",
                "riskMitigationStep": "Align algorithmic training data logs with the new FDA machine learning draft guidance within 90 days.",
                "strategicPlaybook": [
                    "Submit application for Singapore MOH national sandbox pilot integration program.",
                    "Deploy federated learning models to process patient diagnostics locally and bypass international data transfer restrictions.",
                    "Onboard and train the new enterprise sales hires on healthcare compliance frameworks."
                ],
                "executiveSummary": f"{name} is scaling diagnostic AI engines. Current signals show sales team scaling, regulatory compliance focus, and Singapore sandbox entry, representing a high-value opportunity for compliance automation platforms."
            }

    # 2. Energy / Automotive / Tesla
    elif "energy" in industry or "automotive" in industry or company_twin["id"] == "tesla":
        if has_supply:
            playbook_data = {
                "companyId": company_twin["id"],
                "outreachAngle": "Resilient Battery Procurement and Automated SCADA Ingestion Architecture",
                "partnershipSuggestion": "Finalize grid battery purchase agreement with VoltGrid to bypass supply chain bottlenecks.",
                "riskMitigationStep": "Submit harmonic filter designs to the Texas Utility Commission to resolve interconnection delays.",
                "strategicPlaybook": [
                    "Onboard LFP battery cells to fulfill storage farm volume demands.",
                    "Install grid harmonic disturbance filters at primary substations.",
                    "Establish secondary supply chains with backup LFP battery manufacturers."
                ],
                "executiveSummary": f"{name} is building decentralized battery farms. Supply bottlenecks and regulator interconnection delays are near-term issues, but the VoltGrid partnership resolves cell shortages to unlock Q3 activation."
            }
        else:
            playbook_data = {
                "companyId": company_twin["id"],
                "outreachAngle": "Scaling Smart-Grid Telemetry and IoT Firmware Posture Management",
                "partnershipSuggestion": "Partner with CrowdStrike to execute security posture audits on remote SCADA smart-meters.",
                "riskMitigationStep": "Deploy encrypted MQTT tunnels and automatic firmware rollbacks to block grid IoT tampering.",
                "strategicPlaybook": [
                    "Scale real-time IoT cloud data ingestion pipelines to ingest millions of grid telemetry metrics.",
                    "Draft a cybersecurity response framework for remote firmware channels.",
                    "Deploy Cloud Architects to optimize AWS IoT Core telemetry clusters."
                ],
                "executiveSummary": f"{name} is scaling smart-grid IoT meters and energy storage nodes. Backed by new capital, they are upgrading cloud data ingestion and SCADA controls, offering high-value entry points for IoT telemetry and cloud infrastructure vendors."
            }

    # 3. FinTech
    elif "finance" in industry or company_twin["id"] == "stripe":
        playbook_data = {
            "companyId": company_twin["id"],
            "outreachAngle": "Automated Tax Compliance and SaaS Subscription Ingestion",
            "partnershipSuggestion": "Partner with OpenAI to power billing frameworks for developer API platforms.",
            "riskMitigationStep": "Deploy automated card-testing fraud detection models and secure AML pipelines.",
            "strategicPlaybook": [
                "Roll out automated tax calculations across international SaaS segments.",
                "Upgrade API gateways to handle high-frequency subscription micro-transactions.",
                "Audit money transmitter licensing pipelines in expanding EMEA markets."
            ],
            "executiveSummary": f"{name} is the standard for financial software. Given their focus on recurring SaaS models and API developer billing, there is a high-fit alignment to deploy automated tax and transaction protection frameworks."
        }

    # Default Fallback (SaaS / AI)
    else:
        playbook_data = {
            "companyId": company_twin["id"],
            "outreachAngle": "Unified Metadata Catalogs and Cortex AI SQL Pipelines",
            "partnershipSuggestion": "Partner with Snowflake or Databricks to deploy automated RAG clean rooms.",
            "riskMitigationStep": "Mandate MFA across client databases to mitigate credential harvesting breaches.",
            "strategicPlaybook": [
                "Deploy Apache Iceberg catalog formats to optimize multi-cloud query execution.",
                "Onboard local LLM models using native SQL container gateways.",
                "Deploy customer success specialists to configure secure role-level access."
            ],
            "executiveSummary": f"{name} is scaling enterprise data clean rooms and AI models. Given their transition to serverless GPU database queries, they are a high-value opportunity for vector search optimization and data audit tools."
        }

    # Call Gemini to dynamically expand summary narrative if configured
    if gemini_available() and signals:
        try:
            gemini_res = await generate_twin_summary(name, company_twin.get("industry", ""), signals)
            if gemini_res.get("narrative"):
                playbook_data["executiveSummary"] = gemini_res["narrative"]
        except Exception as e:
            print(f"[ExecutiveDecision] Gemini twin summary failed, falling back: {str(e)}")

    return playbook_data

def generate_offline_briefs(company_twin: Dict[str, Any], playbook: Dict[str, Any]) -> Dict[str, Any]:
    """
    Offline templates for outreach copy and executive decision recommendations.
    Cites evidence from active signals.
    """
    name = company_twin.get("name", "Target Company")
    ticker = company_twin.get("ticker", "N/A")
    website = company_twin.get("website", "")

    signals = company_twin.get("currentSignals", [])
    primary_sig = signals[0]["title"] if signals else "recent telemetry adjustments"
    primary_url = signals[0].get("url", f"https://www.{website}") if signals else (f"https://www.{website}" if website else "No public source URL supplied")
    primary_snippet = signals[0].get("snippet", "Active growth metrics.") if signals else ""

    outreach_angle = playbook.get("outreachAngle", "Strategic Integration and Database Scaling")
    synergy = playbook.get("partnershipSuggestion", "Deploy joint security containers.")
    mitigation = playbook.get("riskMitigationStep", "Implement continuous compliance auditing.")

    email = f"""Subject: Strategic Proposal: {outreach_angle} - {name} ({ticker})

Dear {name} Strategy Team,

We have analyzed {name}'s current operations using PulseForge AI, tracking the recent release '{primary_sig}'. 

Based on your current Technology adoption indices and strategic scaling direction, we propose establishing a partnership to coordinate on '{synergy}'. This integration directly addresses the operational bottlenecks noted in public filings ({primary_url}).

Specifically, our system highlights how we can support your roadmaps by mitigating compliance risks, aligning with guidelines, and securing data nodes. 

Let's schedule a 15-minute briefing next Tuesday to discuss the detailed technical path.

Sincerely,
Strategic Development Lead
PulseForge AI Client Engine
(Verified Evidence: {primary_sig} | Source: {primary_url})"""

    linkedin = f"Hi Strategy Team at {name}, noticed your recent updates regarding '{primary_sig}' ({primary_url}). We've compiled an AI Strategic Twin showing how expanding collaboration on '{synergy}' could accelerate your rollout by 30 days while addressing risk factors. Let's connect for a brief sync!"

    exec_brief = f"""EXECUTIVE BRIEFING: {name.upper()} ({ticker})
--------------------------------------------------
PulseForge AI Twin Rating: {company_twin.get('overallScore', 50)}% Overall Strategic Opportunity
Primary Operational Trend: {playbook.get('executiveSummary', '')}

CRITICAL TELEMETRY EVIDENCE:
- Signal: "{primary_sig}"
- Source: {primary_url}
- Excerpt: "{primary_snippet}"

PROPOSED ROADMAP ACTION:
1. Outreach Alignment: Focus pitching on "{outreach_angle}".
2. Alliance Synergy: {synergy}
3. Vulnerability Mitigation: {mitigation}
--------------------------------------------------
Report generated autonomously via PulseForge Intelligence Engine."""

    partnership_rec = f"We highly recommend proposing a partnership with {name} focusing on '{synergy}' to address software deployment speed. Citing signal: '{primary_sig}'."
    vendor_rec = f"Deploy {name}'s platforms as an infrastructure vendor to optimize core developer databases. Citing signal: '{primary_sig}'."
    customer_rec = f"Target {name} as a prime buyer for compliance logging tools, capitalizing on their hiring velocity. Citing signal: '{primary_sig}'."

    return {
        "email": email,
        "linkedinDm": linkedin,
        "executiveBrief": exec_brief,
        "partnershipRecommendation": partnership_rec,
        "vendorRecommendation": vendor_rec,
        "customerRecommendation": customer_rec
    }

async def generate_executive_decisions(company_twin: Dict[str, Any], playbook: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates outreach assets and strategic recommendations. Tries LLMs, falls back to templates.
    """
    signals = company_twin.get("currentSignals", [])
    
    if gemini_available() and signals:
        try:
            return await generate_executive_recommendations_and_outreach(company_twin, playbook, signals)
        except Exception as e:
            print(f"[ExecutiveDecision] Gemini recommendations and outreach failed: {str(e)}")

    return generate_offline_briefs(company_twin, playbook)
