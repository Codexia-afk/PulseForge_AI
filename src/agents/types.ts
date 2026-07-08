export type SignalCategory =
  | 'hiring'
  | 'expansion'
  | 'funding'
  | 'partnership'
  | 'product_launch'
  | 'cybersecurity'
  | 'regulation'
  | 'supply_chain'
  | 'tech_adoption'
  | 'competitive_threat';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RawSignal {
  id: string;
  companyId: string;
  source: string; // e.g. 'SEC Filing', 'GitHub Commit', 'LinkedIn Job Post', 'TechCrunch', 'Twitter/X'
  title: string;
  content: string;
  timestamp: string; // ISO string
  url?: string;
}

export interface ClassifiedSignal {
  id: string;
  companyId: string;
  source: string;
  title: string;
  content: string;
  timestamp: string;
  category: SignalCategory;
  urgency: UrgencyLevel;
  confidence: number; // 0 to 100
  businessImpact: number; // -10 to +10
  reasoning: string;
  url?: string;
}

export interface TwinMetrics {
  buyingIntent: number;
  expansionReadiness: number;
  partnershipReadiness: number;
  cybersecurityMaturity: number;
  vendorRequirementProb: number;
  regulatoryRisk: number;
  techAdoptionMomentum: number;
  competitiveThreatLevel: number;
  overallStrategicOpportunity: number;
}

export interface MetricExplanation {
  signalId: string;
  signalTitle: string;
  effect: string; // e.g. "+15% due to hiring 3 security roles"
  impact: number;
}

export type TwinMetricExplanations = Record<keyof TwinMetrics, MetricExplanation[]>;

export interface CompanyTwin {
  id: string;
  name: string;
  logo: string; // URL or abbreviation
  ticker: string;
  industry: string;
  employeeCount: number;
  hq: string;
  website: string;
  metrics: TwinMetrics;
  explainability: TwinMetricExplanations;
  historicalMetrics: { timestamp: string; metrics: TwinMetrics }[];
}

export interface StrategicPrediction {
  id: string;
  companyId: string;
  title: string;
  predictedAction: string;
  why: string;
  confidence: number;
  recommendedAction: string;
  urgency: UrgencyLevel;
  timeWindow: string; // e.g. '30 days', '6 months'
}

export interface StrategyPlaybook {
  companyId: string;
  outreachAngle: string;
  partnershipSuggestion: string;
  riskMitigationStep: string;
  strategicPlaybook: string[];
  executiveSummary: string;
}

export interface GeneratedActions {
  email: string;
  linkedinDm: string;
  slackAlert: string;
  crmNote: string;
  executiveBrief: string;
}

export interface EvidenceRecord {
  title: string;
  url: string;
  snippet: string;
  category: string;
  confidence: number;
  timestamp?: string;
  impact?: number;
  metricAffected?: string;
  sourceAuthority?: number;
  qualityScore?: number;
  qualityGrade?: string;
  why?: string;
}

export interface MatchRecommendation {
  companyId: string;
  companyName: string;
  ticker: string;
  logo: string;
  industry: string;
  hq: string;
  website: string;
  compatibilityScore: number;
  businessFit: number;
  businessFitExplanation: string;
  techFit: number;
  techFitExplanation: string;
  marketFit: number;
  marketFitExplanation: string;
  geographicFit: number;
  geographicFitExplanation: string;
  growthAlignment: number;
  growthAlignmentExplanation: string;
  hiringSimilarity: number;
  hiringSimilarityExplanation: string;
  cybersecurityCompatibility: number;
  cybersecurityCompatibilityExplanation: string;
  partnershipReadiness: string;
  riskLevel: string;
  confidenceScore: number;
  evidence: EvidenceRecord[];
  recommendation: string;
  outreach: {
    email: string;
    linkedinDm: string;
    executiveBrief: string;
  };
}
