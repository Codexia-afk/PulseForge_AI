import { CompanyTwin, TwinMetrics, ClassifiedSignal, TwinMetricExplanations, MetricExplanation } from './types';

// Baselines for our 12 real companies
export const BASELINE_TWINS: Record<string, Omit<CompanyTwin, 'metrics' | 'explainability' | 'historicalMetrics'>> = {
  pfizer: {
    id: 'pfizer',
    name: 'Pfizer Inc.',
    logo: 'PF',
    ticker: 'PFE',
    industry: 'Pharmaceuticals & Biotech',
    employeeCount: 83000,
    hq: 'New York, NY',
    website: 'pfizer.com'
  },
  tesla: {
    id: 'tesla',
    name: 'Tesla, Inc.',
    logo: 'TS',
    ticker: 'TSLA',
    industry: 'Automotive & Energy Storage',
    employeeCount: 140000,
    hq: 'Austin, TX',
    website: 'tesla.com'
  },
  crowdstrike: {
    id: 'crowdstrike',
    name: 'CrowdStrike Holdings',
    logo: 'CS',
    ticker: 'CRWD',
    industry: 'Endpoint Cybersecurity',
    employeeCount: 8400,
    hq: 'Austin, TX',
    website: 'crowdstrike.com'
  },
  nvidia: {
    id: 'nvidia',
    name: 'NVIDIA Corporation',
    logo: 'NV',
    ticker: 'NVDA',
    industry: 'Semiconductors & AI Hardware',
    employeeCount: 29600,
    hq: 'Santa Clara, CA',
    website: 'nvidia.com'
  },
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft Corporation',
    logo: 'MS',
    ticker: 'MSFT',
    industry: 'Cloud & Enterprise Software',
    employeeCount: 221000,
    hq: 'Redmond, WA',
    website: 'microsoft.com'
  },
  snowflake: {
    id: 'snowflake',
    name: 'Snowflake Inc.',
    logo: 'SF',
    ticker: 'SNOW',
    industry: 'Cloud Data Warehousing',
    employeeCount: 7000,
    hq: 'Bozeman, MT',
    website: 'snowflake.com'
  },
  palantir: {
    id: 'palantir',
    name: 'Palantir Technologies',
    logo: 'PL',
    ticker: 'PLTR',
    industry: 'Data Analytics & AI Systems',
    employeeCount: 3800,
    hq: 'Denver, CO',
    website: 'palantir.com'
  },
  cloudflare: {
    id: 'cloudflare',
    name: 'Cloudflare, Inc.',
    logo: 'CF',
    ticker: 'NET',
    industry: 'Edge Networks & CDN',
    employeeCount: 3500,
    hq: 'San Francisco, CA',
    website: 'cloudflare.com'
  },
  databricks: {
    id: 'databricks',
    name: 'Databricks Inc.',
    logo: 'DB',
    ticker: 'DBX',
    industry: 'Data Lakehouse & AI',
    employeeCount: 6500,
    hq: 'San Francisco, CA',
    website: 'databricks.com'
  },
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce, Inc.',
    logo: 'CRM',
    ticker: 'CRM',
    industry: 'Enterprise CRM & SaaS',
    employeeCount: 79000,
    hq: 'San Francisco, CA',
    website: 'salesforce.com'
  },
  moderna: {
    id: 'moderna',
    name: 'Moderna, Inc.',
    logo: 'MD',
    ticker: 'MRNA',
    industry: 'Biotech & mRNA Therapeutics',
    employeeCount: 5600,
    hq: 'Cambridge, MA',
    website: 'modernatx.com'
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe, Inc.',
    logo: 'ST',
    ticker: 'STRIP',
    industry: 'Financial Infrastructure',
    employeeCount: 8000,
    hq: 'San Francisco, CA',
    website: 'stripe.com'
  }
};

const BASELINE_METRICS: Record<string, TwinMetrics> = {
  pfizer: {
    buyingIntent: 55,
    expansionReadiness: 80,
    partnershipReadiness: 76,
    cybersecurityMaturity: 84,
    vendorRequirementProb: 58,
    regulatoryRisk: 50,
    techAdoptionMomentum: 82,
    competitiveThreatLevel: 32,
    overallStrategicOpportunity: 70
  },
  tesla: {
    buyingIntent: 60,
    expansionReadiness: 82,
    partnershipReadiness: 70,
    cybersecurityMaturity: 78,
    vendorRequirementProb: 75,
    regulatoryRisk: 58,
    techAdoptionMomentum: 90,
    competitiveThreatLevel: 50,
    overallStrategicOpportunity: 70
  },
  crowdstrike: {
    buyingIntent: 68,
    expansionReadiness: 78,
    partnershipReadiness: 75,
    cybersecurityMaturity: 88,
    vendorRequirementProb: 45,
    regulatoryRisk: 30,
    techAdoptionMomentum: 86,
    competitiveThreatLevel: 42,
    overallStrategicOpportunity: 74
  },
  nvidia: {
    buyingIntent: 65,
    expansionReadiness: 88,
    partnershipReadiness: 85,
    cybersecurityMaturity: 82,
    vendorRequirementProb: 55,
    regulatoryRisk: 45,
    techAdoptionMomentum: 95,
    competitiveThreatLevel: 35,
    overallStrategicOpportunity: 78
  },
  microsoft: {
    buyingIntent: 70,
    expansionReadiness: 90,
    partnershipReadiness: 88,
    cybersecurityMaturity: 76,
    vendorRequirementProb: 50,
    regulatoryRisk: 52,
    techAdoptionMomentum: 92,
    competitiveThreatLevel: 40,
    overallStrategicOpportunity: 80
  },
  snowflake: {
    buyingIntent: 72,
    expansionReadiness: 74,
    partnershipReadiness: 80,
    cybersecurityMaturity: 70,
    vendorRequirementProb: 60,
    regulatoryRisk: 35,
    techAdoptionMomentum: 84,
    competitiveThreatLevel: 48,
    overallStrategicOpportunity: 72
  },
  palantir: {
    buyingIntent: 58,
    expansionReadiness: 80,
    partnershipReadiness: 82,
    cybersecurityMaturity: 90,
    vendorRequirementProb: 40,
    regulatoryRisk: 42,
    techAdoptionMomentum: 88,
    competitiveThreatLevel: 38,
    overallStrategicOpportunity: 74
  },
  cloudflare: {
    buyingIntent: 75,
    expansionReadiness: 82,
    partnershipReadiness: 84,
    cybersecurityMaturity: 85,
    vendorRequirementProb: 48,
    regulatoryRisk: 28,
    techAdoptionMomentum: 88,
    competitiveThreatLevel: 45,
    overallStrategicOpportunity: 76
  },
  databricks: {
    buyingIntent: 74,
    expansionReadiness: 78,
    partnershipReadiness: 78,
    cybersecurityMaturity: 80,
    vendorRequirementProb: 52,
    regulatoryRisk: 32,
    techAdoptionMomentum: 90,
    competitiveThreatLevel: 46,
    overallStrategicOpportunity: 75
  },
  salesforce: {
    buyingIntent: 62,
    expansionReadiness: 84,
    partnershipReadiness: 86,
    cybersecurityMaturity: 82,
    vendorRequirementProb: 45,
    regulatoryRisk: 38,
    techAdoptionMomentum: 84,
    competitiveThreatLevel: 40,
    overallStrategicOpportunity: 74
  },
  moderna: {
    buyingIntent: 56,
    expansionReadiness: 72,
    partnershipReadiness: 78,
    cybersecurityMaturity: 80,
    vendorRequirementProb: 64,
    regulatoryRisk: 48,
    techAdoptionMomentum: 86,
    competitiveThreatLevel: 36,
    overallStrategicOpportunity: 68
  },
  stripe: {
    buyingIntent: 70,
    expansionReadiness: 85,
    partnershipReadiness: 82,
    cybersecurityMaturity: 86,
    vendorRequirementProb: 50,
    regulatoryRisk: 46,
    techAdoptionMomentum: 88,
    competitiveThreatLevel: 38,
    overallStrategicOpportunity: 76
  }
};

// Computes the Twin State by applying classified signals onto baseline metrics
export function computeBusinessTwin(companyId: string, signals: ClassifiedSignal[]): CompanyTwin {
  const cid = companyId.toLowerCase().trim();
  const info = BASELINE_TWINS[cid] || BASELINE_TWINS.pfizer;
  const baseMetrics = { ...(BASELINE_METRICS[cid] || BASELINE_METRICS.pfizer) };

  // Set up blank explanations
  const explainability: TwinMetricExplanations = {
    buyingIntent: [],
    expansionReadiness: [],
    partnershipReadiness: [],
    cybersecurityMaturity: [],
    vendorRequirementProb: [],
    regulatoryRisk: [],
    techAdoptionMomentum: [],
    competitiveThreatLevel: [],
    overallStrategicOpportunity: []
  };

  // Filter signals matching this company
  const companySignals = signals.filter(s => s.companyId === cid);

  // Apply signal impacts
  companySignals.forEach(sig => {
    switch (sig.category) {
      case 'hiring':
        if (sig.title.includes('HIPAA') || sig.title.includes('Security Audit') || sig.title.includes('Compliance')) {
          applyImpact(baseMetrics, explainability, 'cybersecurityMaturity', sig, 8, 'Hiring security compliance leadership strengthens cybersecurity processes.');
          applyImpact(baseMetrics, explainability, 'regulatoryRisk', sig, -10, 'Hiring dedicated regulatory lead mitigates compliance exposure.');
        } else if (sig.title.includes('Cloud Infrastructure') || sig.title.includes('SCADA') || sig.title.includes('Architect')) {
          applyImpact(baseMetrics, explainability, 'techAdoptionMomentum', sig, 8, 'Hiring specialized SCADA cloud developers indicates systems upgrade.');
          applyImpact(baseMetrics, explainability, 'vendorRequirementProb', sig, 12, 'Technical architecture scaling increases SaaS and cloud hosting demands.');
        } else if (sig.title.includes('Account Executives') || sig.title.includes('Sales')) {
          applyImpact(baseMetrics, explainability, 'buyingIntent', sig, 25, 'Aggressive enterprise sales scaling signals ready commercialization and customer acquisition push.');
        }
        break;

      case 'funding':
        applyImpact(baseMetrics, explainability, 'expansionReadiness', sig, 18, 'Capital injection boosts geographic scaling capacity.');
        applyImpact(baseMetrics, explainability, 'partnershipReadiness', sig, 10, 'Strong balance sheet makes company a low-risk, attractive strategic partner.');
        applyImpact(baseMetrics, explainability, 'buyingIntent', sig, 8, 'Capitalized companies show higher propensity to buy new vendor solutions.');
        break;

      case 'regulation':
        if (sig.title.includes('FDA') || sig.title.includes('Guidance')) {
          applyImpact(baseMetrics, explainability, 'regulatoryRisk', sig, 20, 'Stricter FDA guidelines require audits on algorithmic training data.');
          applyImpact(baseMetrics, explainability, 'buyingIntent', sig, -5, 'Tight compliance updates redirect developer focus away from procurement.');
        } else if (sig.title.includes('delayed') || sig.title.includes('delayed by grid regulator')) {
          applyImpact(baseMetrics, explainability, 'regulatoryRisk', sig, 15, 'Harmonic disturbance investigation delays solar grid interconnection.');
          applyImpact(baseMetrics, explainability, 'expansionReadiness', sig, -12, 'Regulatory grid hurdles delay commercial project timelines.');
        } else if (sig.title.includes('sandbox')) {
          applyImpact(baseMetrics, explainability, 'regulatoryRisk', sig, -12, 'Acceptance into Singapore Health tech sandbox validates compliance standing.');
          applyImpact(baseMetrics, explainability, 'expansionReadiness', sig, 15, 'Singapore sandbox opens APAC pilot integration routes.');
        }
        break;

      case 'cybersecurity':
        if (sig.title.includes('Zero-day') || sig.title.includes('vulnerability') || sig.title.includes('leak') || sig.title.includes('outage')) {
          if (sig.title.includes('Patch') || sig.title.includes('Release')) {
            applyImpact(baseMetrics, explainability, 'cybersecurityMaturity', sig, 5, 'Released security patch resolves memory leaks, stabilizing the endpoint client.');
          } else {
            applyImpact(baseMetrics, explainability, 'cybersecurityMaturity', sig, -22, 'Active IDOR patient vulnerability exposes unsecured clinical endpoints.');
            applyImpact(baseMetrics, explainability, 'regulatoryRisk', sig, 20, 'Patient record leakage risks HIPAA fines and compliance enforcement.');
            applyImpact(baseMetrics, explainability, 'competitiveThreatLevel', sig, 12, 'Critical vulnerability damages brand trust, exposing accounts to competitor poaching.');
          }
        } else if (sig.title.includes('CISA')) {
          applyImpact(baseMetrics, explainability, 'cybersecurityMaturity', sig, -8, 'Alert on Active Directory triggers emergency internal security reviews.');
          applyImpact(baseMetrics, explainability, 'vendorRequirementProb', sig, 18, 'CISA AD directive increases urgent need for threat identity audit tooling.');
        }
        break;

      case 'expansion':
        applyImpact(baseMetrics, explainability, 'expansionReadiness', sig, 12, 'Expansion details (APAC/Germany scaling) reflect successful operational execution.');
        applyImpact(baseMetrics, explainability, 'techAdoptionMomentum', sig, 5, 'Distributed global offices prompt adoption of collaborative/regional cloud networks.');
        break;

      case 'supply_chain':
        applyImpact(baseMetrics, explainability, 'expansionReadiness', sig, -15, 'Energy storage cell bottlenecks delay smart-grid project deployment schedules.');
        applyImpact(baseMetrics, explainability, 'vendorRequirementProb', sig, 25, 'Shortage triggers search for alternative battery storage and supply channel partners.');
        break;

      case 'partnership':
        if (sig.title.includes('Tesla')) {
          applyImpact(baseMetrics, explainability, 'expansionReadiness', sig, 22, 'Tesla Energy Megapack agreement resolves regional battery bottleneck.');
          applyImpact(baseMetrics, explainability, 'vendorRequirementProb', sig, -15, 'Megapack supply commitment fulfills immediate energy storage needs.');
        } else {
          applyImpact(baseMetrics, explainability, 'partnershipReadiness', sig, 12, 'Announced integration contracts confirm partnership-friendly tech architecture.');
        }
        break;

      case 'product_launch':
        applyImpact(baseMetrics, explainability, 'buyingIntent', sig, 15, 'Self-serve pilot portals and subscription model release indicate active commercial scaling.');
        applyImpact(baseMetrics, explainability, 'techAdoptionMomentum', sig, 8, 'Developer portal roll-out confirms adoption of modern API Gateway technology.');
        break;

      case 'tech_adoption':
        if (sig.title.includes('Patent')) {
          applyImpact(baseMetrics, explainability, 'techAdoptionMomentum', sig, 12, 'Granted patent on local neural nets establishes technical moat.');
        } else {
          applyImpact(baseMetrics, explainability, 'techAdoptionMomentum', sig, 10, 'Adoption of advanced tracking technologies (eBPF telemetry) upgrades data pipelines.');
        }
        break;

      case 'competitive_threat':
        if (sig.title.includes('acquires') || sig.title.includes('acquisition')) {
          applyImpact(baseMetrics, explainability, 'competitiveThreatLevel', sig, -10, 'Acquiring competitors consolidates market position, reducing competitive pressure.');
          applyImpact(baseMetrics, explainability, 'techAdoptionMomentum', sig, 10, 'Integrating acquired IP adds hardware network traffic analytics to core stack.');
        } else {
          applyImpact(baseMetrics, explainability, 'competitiveThreatLevel', sig, 20, 'Competitor raises and product launches threaten existing sales cycle pilot dominance.');
        }
        break;
    }
  });

  // Calculate Overall Opportunity Score
  const weightedOpportunity =
    baseMetrics.buyingIntent * 0.3 +
    baseMetrics.expansionReadiness * 0.25 +
    baseMetrics.partnershipReadiness * 0.2 +
    baseMetrics.techAdoptionMomentum * 0.15 -
    baseMetrics.regulatoryRisk * 0.1 -
    baseMetrics.competitiveThreatLevel * 0.1;

  baseMetrics.overallStrategicOpportunity = Math.max(0, Math.min(100, Math.round(weightedOpportunity)));

  // Add explanation for overall strategic opportunity
  if (companySignals.length > 0) {
    const topSignal = companySignals[companySignals.length - 1];
    explainability.overallStrategicOpportunity.push({
      signalId: topSignal.id,
      signalTitle: topSignal.title,
      effect: `Calibrated to ${baseMetrics.overallStrategicOpportunity}%`,
      impact: topSignal.businessImpact
    });
  }

  // Generate historical data
  const historicalMetrics = Array.from({ length: 6 }).map((_, idx) => {
    const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * (6 - idx));
    const variance = (idx - 3) * 2;
    return {
      timestamp: date.toISOString().split('T')[0],
      metrics: {
        buyingIntent: clamp(baseMetrics.buyingIntent + variance - 4),
        expansionReadiness: clamp(baseMetrics.expansionReadiness - variance),
        partnershipReadiness: clamp(baseMetrics.partnershipReadiness + variance),
        cybersecurityMaturity: clamp(baseMetrics.cybersecurityMaturity + (idx % 2 === 0 ? 3 : -2)),
        vendorRequirementProb: clamp(baseMetrics.vendorRequirementProb - variance + 2),
        regulatoryRisk: clamp(baseMetrics.regulatoryRisk + (idx % 3 === 0 ? 4 : -3)),
        techAdoptionMomentum: clamp(baseMetrics.techAdoptionMomentum + idx),
        competitiveThreatLevel: clamp(baseMetrics.competitiveThreatLevel + (idx % 2 === 0 ? -2 : 3)),
        overallStrategicOpportunity: clamp(baseMetrics.overallStrategicOpportunity + variance)
      }
    };
  });

  return {
    ...info,
    metrics: baseMetrics,
    explainability,
    historicalMetrics
  };
}

function clamp(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

function applyImpact(
  metrics: TwinMetrics,
  explainability: TwinMetricExplanations,
  key: keyof TwinMetrics,
  signal: ClassifiedSignal,
  impact: number,
  effectText: string
) {
  metrics[key] = Math.max(0, Math.min(100, metrics[key] + impact));
  
  const formattedEffect = `${impact >= 0 ? '+' : ''}${impact}%: ${effectText}`;
  
  const explanation: MetricExplanation = {
    signalId: signal.id,
    signalTitle: signal.title,
    effect: formattedEffect,
    impact
  };

  explainability[key] = [...(explainability[key] || []), explanation];
}
