from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class UserBusinessProfile(BaseModel):
    name: str = Field(..., description="My company name")
    website: str = Field("", description="My company website")
    industry: str = Field(..., description="My company industry")
    product_service: str = Field(..., description="Our product or service")
    target_customer: str = Field(..., description="Target customer segment")
    target_region: str = Field(..., description="Target region (e.g. US, APAC, EMEA)")
    partnership_goal: str = Field(..., description="Partnership goal (e.g., pilot, distribution, integration)")
    ideal_partner_type: str = Field(..., description="Ideal partner company type")

class RawSignal(BaseModel):
    id: str
    companyId: str
    source: str
    title: str
    content: str
    timestamp: str

class ClassifiedSignal(BaseModel):
    id: str
    companyId: str
    source: str
    title: str
    content: str
    timestamp: str
    category: str
    urgency: str
    confidence: int
    businessImpact: int
    reasoning: str

class TwinMetrics(BaseModel):
    buyingIntent: int
    expansionReadiness: int
    partnershipReadiness: int
    cybersecurityMaturity: int
    vendorRequirementProb: int
    regulatoryRisk: int
    techAdoptionMomentum: int
    competitiveThreatLevel: int
    overallStrategicOpportunity: int

class MetricExplanation(BaseModel):
    signalId: str
    signalTitle: str
    effect: str
    impact: int

class CompanyTwin(BaseModel):
    id: str
    name: str
    logo: str
    ticker: str
    industry: str
    employeeCount: int
    hq: str
    website: str
    metrics: TwinMetrics
    explainability: Dict[str, List[MetricExplanation]]
    historicalMetrics: List[Dict[str, Any]]

class StrategicPrediction(BaseModel):
    id: str
    companyId: str
    title: str
    predictedAction: str
    why: str
    confidence: int
    recommendedAction: str
    urgency: str
    timeWindow: str

class StrategyPlaybook(BaseModel):
    companyId: str
    outreachAngle: str
    partnershipSuggestion: str
    riskMitigationStep: str
    strategicPlaybook: List[str]
    executiveSummary: str

class EvidenceRecord(BaseModel):
    title: str
    url: str
    snippet: str
    category: str
    confidence: int
    timestamp: Optional[str] = None
    impact: Optional[int] = None
    metricAffected: Optional[str] = None
    sourceAuthority: Optional[int] = None
    qualityScore: Optional[int] = None
    qualityGrade: Optional[str] = None
    why: Optional[str] = None

class MatchRecommendation(BaseModel):
    companyId: str
    companyName: str
    ticker: str
    logo: str
    industry: str
    hq: str
    website: str
    compatibilityScore: int
    businessFit: int
    businessFitExplanation: str
    techFit: int
    techFitExplanation: str
    marketFit: int
    marketFitExplanation: str
    geographicFit: int
    geographicFitExplanation: str
    growthAlignment: int
    growthAlignmentExplanation: str
    hiringSimilarity: int
    hiringSimilarityExplanation: str
    cybersecurityCompatibility: int
    cybersecurityCompatibilityExplanation: str
    partnershipReadiness: str
    riskLevel: str
    confidenceScore: int
    evidence: List[EvidenceRecord]
    recommendation: str
    outreach: Dict[str, str] # e.g. {"email": "...", "linkedinDm": "...", "executiveBrief": "..."}

class FindPartnersResponse(BaseModel):
    matches: List[MatchRecommendation]

class AnalyzeCompanyRequest(BaseModel):
    companyName: str
    website: Optional[str] = ""
