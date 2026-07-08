import uuid
import asyncio
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional

# Import models
from app.models import (
    UserBusinessProfile,
    FindPartnersResponse,
    MatchRecommendation,
    AnalyzeCompanyRequest,
    EvidenceRecord,
    ClassifiedSignal
)

# Import modular backend intelligence engines
from app.services.signal_collector import collect_signals
from app.services.signal_classifier import classify_signal, run_offline_classifier
from app.services.business_twin_engine import build_business_twin, BASELINE_TWINS
from app.services.partnership_intelligence_engine import match_partnership_intelligence
from app.services.prediction_engine import generate_evidence_predictions
from app.services.explainability_engine import compile_explainability_audit
from app.services.executive_decision_engine import generate_playbook, generate_executive_decisions
from app.config import TAVILY_API_KEY, NEWS_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY, GOOGLE_CX
from pydantic import BaseModel
from app.services.evidence_importer import import_company_from_public_web
from app.services.observability import log_event
from app.services.provider_diagnostics import check_provider_status
import json

app = FastAPI(
    title="PulseForge Intelligence Engine API",
    description="Strategic Business Intelligence and AI Partnership Intelligence Platform Backend",
    version="1.1.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory history cache to track session activities
ANALYSIS_HISTORY = []

async def classify_signals_concurrently(raw_signals: List[Dict[str, Any]], company_id: str, limit: int = 8) -> List[Dict[str, Any]]:
    semaphore = asyncio.Semaphore(4)

    async def classify_one(idx: int, sig: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        async with semaphore:
            started = time.perf_counter()
            try:
                classified = run_offline_classifier(sig["title"], sig["content"])
                log_event("signal.classified", companyId=company_id, index=idx, elapsedMs=int((time.perf_counter() - started) * 1000))
                return {
                    "id": f"sig-{uuid.uuid4().hex[:6]}-{idx}",
                    "companyId": company_id,
                    "source": sig["source"],
                    "title": sig["title"],
                    "content": sig["content"],
                    "url": sig["url"],
                    "timestamp": sig["timestamp"],
                    "category": classified["category"],
                    "confidence": classified["confidence"],
                    "businessImpact": classified["businessImpact"],
                    "reasoning": classified["reasoning"],
                    "snippet": classified["snippet"],
                    "quality": sig.get("quality", {})
                }
            except Exception as exc:
                log_event("signal.classify_fallback", companyId=company_id, index=idx, error=type(exc).__name__)
                fallback = run_offline_classifier(sig["title"], sig["content"])
                return {
                    "id": f"sig-{uuid.uuid4().hex[:6]}-{idx}",
                    "companyId": company_id,
                    "source": sig["source"],
                    "title": sig["title"],
                    "content": sig["content"],
                    "url": sig["url"],
                    "timestamp": sig["timestamp"],
                    "quality": sig.get("quality", {}),
                    **fallback
                }

    results = await asyncio.gather(*(classify_one(idx, sig) for idx, sig in enumerate(raw_signals[:limit])))
    return [item for item in results if item]

@app.middleware("http")
async def log_requests(request: Request, call_next):
    started = time.perf_counter()
    log_event("api.request", method=request.method, path=request.url.path)
    try:
        response = await call_next(request)
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        response.headers["X-PulseForge-Response-Time-Ms"] = str(elapsed_ms)
        log_event("api.response", method=request.method, path=request.url.path, status=response.status_code, elapsedMs=elapsed_ms)
        return response
    except Exception as exc:
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        log_event("api.error", method=request.method, path=request.url.path, elapsedMs=elapsed_ms, error=type(exc).__name__)
        raise

@app.get("/api/health")
def health_check():
    """
    Check if the API is active and return key configuration warnings.
    """
    keys_configured = {
        "tavily": bool(TAVILY_API_KEY),
        "newsapi": bool(NEWS_API_KEY),
        "gemini": bool(GEMINI_API_KEY),
        "openai": bool(OPENAI_API_KEY),
        "googleSearch": bool(GOOGLE_API_KEY),
        "googleCustomSearch": bool(GOOGLE_CX)
    }
    
    missing = [k for k, v in keys_configured.items() if not v]
    
    return {
        "status": "ok",
        "service": "PulseForge API",
        "backend": "online",
        "keysConfigured": keys_configured,
        "mode": "Real-World Enabled" if TAVILY_API_KEY or NEWS_API_KEY else "Demo Mode Only",
        "warning": f"Missing API keys for: {', '.join(missing)}" if missing else None
    }

@app.get("/api/provider-status")
async def provider_status():
    return await check_provider_status()

@app.get("/api/routes")
def routes_status():
    return {
        "routes": [
            {"path": route.path, "methods": sorted(route.methods or [])}
            for route in app.routes
            if getattr(route, "path", "").startswith("/api/")
        ]
    }

class OnboardCompanyRequest(BaseModel):
    url: Optional[str] = None
    website: Optional[str] = None

@app.post("/api/onboard-company")
async def onboard_company(request: OnboardCompanyRequest):
    url_str = (request.website or request.url or "").strip()
    if not url_str:
        raise HTTPException(status_code=400, detail="Website URL is required")
    try:
        result = await import_company_from_public_web(url_str)
        ANALYSIS_HISTORY.append({
            "id": f"import-{uuid.uuid4().hex[:8]}",
            "type": "company_import",
            "url": url_str,
            "businessTwin": result.get("businessTwin", {}),
            "evidenceDatabase": result.get("evidenceDatabase", []),
            "pipeline": result.get("pipeline", [])
        })
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        print(f"[Onboard] Evidence import failed: {str(exc)}")
        return {
            "status": "failed",
            "message": "Classification unavailable.",
            "pipeline": [{"stage": "Import failed", "status": "failed", "detail": str(exc)}],
            "sources": [],
            "evidenceDatabase": [],
            "businessTwin": {
                "name": "Insufficient public evidence.",
                "website": url_str,
                "confidenceLabel": "Low Confidence",
                "evidenceCount": 0,
                "recommendations": []
            },
            "recommendations": [],
            "qualityGates": {"trustedEvidenceSources": 0, "label": "Low Confidence", "reason": "Classification unavailable."},
            "name": "Insufficient public evidence.",
            "website": url_str,
            "industry": "Insufficient public evidence.",
            "description": "Insufficient public evidence.",
            "product_service": "Insufficient public evidence.",
            "target_customer": "Insufficient public evidence.",
            "target_region": "Insufficient public evidence.",
            "partnership_goal": "Insufficient public evidence.",
            "ideal_partner_type": "Insufficient public evidence."
        }

@app.post("/api/analyze-company")
async def analyze_company(request: AnalyzeCompanyRequest):
    """
    Component 3 (Business Twin Engine): Creates a living Business Twin for the company.
    """
    company_name = request.companyName.strip()
    website = request.website.strip() if request.website else ""

    if not company_name:
        raise HTTPException(status_code=400, detail="Company name is required")

    print(f"[API] Analyzing target company: {company_name}")

    # 1. Signal Collector
    raw_signals = await collect_signals(company_name, website=website)

    company_id = company_name.lower().replace(" ", "").replace(",", "").replace(".", "")
    classified_signals = await classify_signals_concurrently(raw_signals, company_id, limit=10)

    # 3. Business Twin Engine
    twin = build_business_twin(company_id, classified_signals)

    # 4. Prediction Engine
    predictions = await generate_evidence_predictions(twin, classified_signals)

    # 5. Playbook & Outreach Generation (Executive Decision Engine)
    playbook = await generate_playbook(twin, classified_signals)
    actions = await generate_executive_decisions(twin, playbook)

    analysis_record = {
        "id": f"anal-{uuid.uuid4().hex[:8]}",
        "companyName": company_name,
        "twin": twin,
        "signals": classified_signals,
        "forecasts": predictions,
        "playbook": playbook,
        "actions": actions
    }
    ANALYSIS_HISTORY.append(analysis_record)

    return analysis_record

@app.post("/api/find-partners", response_model=FindPartnersResponse)
async def find_partners(profile: UserBusinessProfile):
    """
    Component 4 (Partnership Intelligence Engine): Matches user profile with target company twins.
    """
    print(f"[API] Finding partners for User Company: {profile.name} - Goal: {profile.partnership_goal}")
    
    matched_results = []
    
    # Evaluate a bounded live subset first; deeper exploration can run after the initial scan.
    for company_id, baseline_info in list(BASELINE_TWINS.items())[:2]:
        try:
            # 1. Gather signals for candidate
            raw_sigs = []
            try:
                raw_sigs = await collect_signals(baseline_info["name"], website=baseline_info["website"], ticker=baseline_info["ticker"])
            except Exception as se:
                print(f"[API] Signal collection failed for {company_id}, falling back: {str(se)}")
            
            classified_sigs = await classify_signals_concurrently(raw_sigs, company_id, limit=6)

            # 3. Build Twin for candidate
            twin = build_business_twin(company_id, classified_sigs)
            
            # 4. Partnership Intelligence Scoring
            try:
                match_fit = await match_partnership_intelligence(profile.dict(), twin, classified_sigs)
            except Exception as me:
                print(f"[API] Match scoring failed, using baseline fit: {str(me)}")
                match_fit = {
                    "compatibilityScore": 76,
                    "businessFit": 75, "businessFitExplanation": "Calculated from baseline corporate parameters.",
                    "technologyFit": 70, "technologyFitExplanation": "General cloud infrastructure matching.",
                    "marketFit": 75, "marketFitExplanation": "Standard customer overlap.",
                    "regionFit": 80, "regionFitExplanation": "Coordinated geography profile.",
                    "growthAlignment": 75, "growthAlignmentExplanation": "Baseline growth forecasts.",
                    "hiringSimilarity": 70, "hiringSimilarityExplanation": "Baseline staff levels.",
                    "cybersecurityCompatibility": 75, "cybersecurityCompatibilityExplanation": "Standard compliance policies."
                }

            # 5. Strategic recommendations
            try:
                playbook = await generate_playbook(twin, classified_sigs)
                actions = await generate_executive_decisions(twin, playbook)
            except Exception as re:
                print(f"[API] Playbook generation failed, using fallback: {str(re)}")
                actions = {
                    "partnershipRecommendation": f"Initiate joint trial proposal for {twin['name']}.",
                    "email": "Dear team,\nWe propose evaluating automated clinical trials sequence pipelines.",
                    "linkedinDm": "Let's connect to discuss clinical trials modeling workflows.",
                    "executiveBrief": "Baseline partnership alignment detected."
                }

            # Build evidence list
            evidence_list = []
            for sig in classified_sigs[:3]:
                quality = sig.get("quality", {})
                evidence_list.append({
                    "title": sig["title"],
                    "url": sig["url"],
                    "snippet": sig.get("snippet", sig["content"][:200]),
                    "category": sig["category"],
                    "confidence": min(99, round((sig["confidence"] + quality.get("qualityScore", sig["confidence"])) / 2)),
                    "timestamp": sig["timestamp"],
                    "impact": sig.get("businessImpact", 0),
                    "metricAffected": sig["category"],
                    "sourceAuthority": quality.get("authorityScore"),
                    "qualityScore": quality.get("qualityScore"),
                    "qualityGrade": quality.get("qualityGrade"),
                    "why": f"{sig['reasoning']} Source quality: {quality.get('qualityGrade', 'Reviewed')}."
                })

            matched_results.append({
                "companyId": company_id,
                "companyName": twin["name"],
                "ticker": twin["ticker"],
                "logo": twin["logo"],
                "industry": twin["industry"],
                "hq": twin["hq"],
                "website": twin["website"],
                "compatibilityScore": match_fit["compatibilityScore"],
                "businessFit": match_fit["businessFit"],
                "businessFitExplanation": match_fit["businessFitExplanation"],
                "techFit": match_fit["technologyFit"],
                "techFitExplanation": match_fit["technologyFitExplanation"],
                "marketFit": match_fit["marketFit"],
                "marketFitExplanation": match_fit["marketFitExplanation"],
                "geographicFit": match_fit["regionFit"],
                "geographicFitExplanation": match_fit["regionFitExplanation"],
                "growthAlignment": match_fit["growthAlignment"],
                "growthAlignmentExplanation": match_fit["growthAlignmentExplanation"],
                "hiringSimilarity": match_fit["hiringSimilarity"],
                "hiringSimilarityExplanation": match_fit["hiringSimilarityExplanation"],
                "cybersecurityCompatibility": match_fit["cybersecurityCompatibility"],
                "cybersecurityCompatibilityExplanation": match_fit["cybersecurityCompatibilityExplanation"],
                "partnershipReadiness": "High" if match_fit["compatibilityScore"] > 80 else "Medium",
                "riskLevel": "Low" if twin["metrics"]["risk"] < 40 else "Medium",
                "confidenceScore": match_fit.get("confidenceScore", 88),
                "evidence": evidence_list,
                "recommendation": actions.get("partnershipRecommendation", f"Initiate joint trial proposal for {twin['name']}."),
                "outreach": {
                    "email": actions["email"],
                    "linkedinDm": actions["linkedinDm"],
                    "executiveBrief": actions["executiveBrief"]
                }
            })
        except Exception as overall_e:
            print(f"[API] Evaluation failed for {company_id}: {str(overall_e)}")
            matched_results.append({
                "companyId": company_id,
                "companyName": baseline_info["name"],
                "ticker": baseline_info["ticker"],
                "logo": baseline_info.get("logo", "🏢"),
                "industry": baseline_info["industry"],
                "hq": baseline_info.get("hq", "San Francisco, CA"),
                "website": baseline_info["website"],
                "compatibilityScore": 70,
                "businessFit": 70, "businessFitExplanation": "Fallback alignment profiles.",
                "techFit": 70, "techFitExplanation": "Standard infrastructure stack.",
                "marketFit": 70, "marketFitExplanation": "Standard market presence.",
                "geographicFit": 80, "geographicFitExplanation": "Corporate headquarters proximity.",
                "growthAlignment": 70, "growthAlignmentExplanation": "Coordinated scaling alignment.",
                "hiringSimilarity": 70, "hiringSimilarityExplanation": "Baseline staffing indices.",
                "cybersecurityCompatibility": 70, "cybersecurityCompatibilityExplanation": "Baseline digital perimeter audits.",
                "partnershipReadiness": "Medium",
                "riskLevel": "Medium",
                "confidenceScore": 70,
                "evidence": [],
                "recommendation": f"Initiate partnership communication with {baseline_info['name']}.",
                "outreach": {
                    "email": "Dear team,\nWe are reaching out to discuss synergy channels.",
                    "linkedinDm": "Hi, let's explore collaborative avenues.",
                    "executiveBrief": "Baseline target profile matched."
                }
            })

    # Rank results by compatibility score
    matched_results.sort(key=lambda x: x["compatibilityScore"], reverse=True)

    # Save to history
    ANALYSIS_HISTORY.append({
        "id": f"match-{uuid.uuid4().hex[:8]}",
        "profile": profile.dict(),
        "matches": matched_results
    })

    return {"matches": matched_results}

@app.post("/api/classify-signal")
async def classify_signal_endpoint(signal: Dict[str, str]):
    """
    Component 2 (Signal Classifier): Classifies raw signal content.
    """
    title = signal.get("title", "")
    content = signal.get("content", "")
    
    if not title:
        raise HTTPException(status_code=400, detail="Signal title is required")
        
    result = await classify_signal(title, content)
    return result

@app.post("/api/generate-outreach")
async def generate_outreach_endpoint(payload: Dict[str, Any]):
    """
    Component 7 (Executive Decision Engine): Generates outreach scripts.
    """
    twin = payload.get("twin", {})
    playbook = payload.get("playbook", {})
    
    if not twin or not playbook:
        raise HTTPException(status_code=400, detail="twin and playbook are required")
        
    actions = await generate_executive_decisions(twin, playbook)
    return actions

@app.get("/api/explain-metric")
def explain_metric(companyId: str, metricKey: str):
    """
    Component 6 (Explainability Engine): Traces the calculation path for a specific metric.
    """
    cid = companyId.lower().strip()
    
    # Locate company in cache or build default baseline
    record = next((r for r in reversed(ANALYSIS_HISTORY) if r.get("twin", {}).get("id") == cid), None)
    if record:
        twin = record["twin"]
    else:
        # Build baseline twin with empty signals
        twin = build_business_twin(cid, [])

    audit = compile_explainability_audit(twin, metricKey)
    return audit

@app.get("/api/analysis-history")
def get_analysis_history():
    """
    Return recent match summaries and twin analyzes.
    """
    return ANALYSIS_HISTORY[-10:]
