import { CompanyTwin, StrategicPrediction, ClassifiedSignal } from './types';

// The Prediction Agent analyzes the living twin metrics and signals to make predictive assertions
export function generatePredictions(twin: CompanyTwin, signals: ClassifiedSignal[]): StrategicPrediction[] {
  const predictions: StrategicPrediction[] = [];
  const companySignals = signals.filter(s => s.companyId === twin.id);
  
  // 1. Cybersecurity threat / API incident active
  const hasCyberIncident = companySignals.some(s => s.category === 'cybersecurity' && s.businessImpact < 0);
  // 2. Regulation active
  const hasRegHurdle = companySignals.some(s => s.category === 'regulation' && s.businessImpact < 0);
  // 3. Sales hiring / Commercial launch active
  const hasSalesHiring = companySignals.some(s => s.category === 'hiring' && s.title.includes('Sales'));
  const hasProductLaunch = companySignals.some(s => s.category === 'product_launch');
  // 4. Supply chain bottleneck active
  const hasSupplyBottleneck = companySignals.some(s => s.category === 'supply_chain');

  // Prediction A: Security & Compliance Recovery
  if (hasCyberIncident || twin.metrics.cybersecurityMaturity < 65) {
    predictions.push({
      id: `${twin.id}-pred-cyber`,
      companyId: twin.id,
      title: 'Mandatory API Gateway Overhaul & Identity Auditing',
      predictedAction: `${twin.name} will audit all API endpoints and deploy API security gateways.`,
      why: hasCyberIncident 
        ? 'Active IDOR patient vulnerability exposed unsecured endpoints, threatening medical record security.'
        : 'Cybersecurity maturity score fell below baseline threshold, requiring compliance remediation.',
      confidence: 94,
      recommendedAction: 'Deliver automated API scanning and identity compliance playbooks to the CISO.',
      urgency: 'critical',
      timeWindow: '7 to 14 days'
    });
  }

  // Prediction B: Regulatory compliance audit
  if (hasRegHurdle || twin.metrics.regulatoryRisk > 55) {
    predictions.push({
      id: `${twin.id}-pred-reg`,
      companyId: twin.id,
      title: 'Clinical ML Model Re-evaluation and Audit Logging',
      predictedAction: `${twin.name} will halt non-audited clinical models to restructure training logs.`,
      why: 'FDA Draft Guidance mandates audit trails for ML training data origin and active bias checking.',
      confidence: 90,
      recommendedAction: 'Propose automated algorithmic audit logs that verify patient training data lineage.',
      urgency: 'high',
      timeWindow: '60 to 90 days'
    });
  }

  // Prediction C: Rapid B2B Sales expansion
  if (hasSalesHiring || hasProductLaunch || twin.metrics.buyingIntent > 70) {
    predictions.push({
      id: `${twin.id}-pred-sales`,
      companyId: twin.id,
      title: 'Aggressive B2B Regional Hospital Pilots Expansion',
      predictedAction: `${twin.name} will execute commercial contracts with regional networks and sandbox partners.`,
      why: 'Scale-up of 18 sales personnel and release of Care Portal with subscription options indicates ready commercialization.',
      confidence: 92,
      recommendedAction: 'Target VP of Sales with automated CRM intent tracking and clinical lead-generation tools.',
      urgency: 'high',
      timeWindow: '30 days'
    });
  }

  // Prediction D: Supply chain bottleneck mitigation
  if (hasSupplyBottleneck || twin.metrics.vendorRequirementProb > 75) {
    predictions.push({
      id: `${twin.id}-pred-supply`,
      companyId: twin.id,
      title: 'Battery Cell Supplier Diversification and Tesla Megapack Ingestion',
      predictedAction: `${twin.name} will onboard alternative battery suppliers and accelerate SCADA grid software deployment.`,
      why: 'Grid interconnections were delayed by grid regulator and procurement is seeking pack suppliers.',
      confidence: 88,
      recommendedAction: 'Pitch cloud infrastructure integration assets for high-density IoT energy storage grids.',
      urgency: 'high',
      timeWindow: '30 days'
    });
  }

  // Fallback / Standard Prediction
  if (predictions.length === 0) {
    predictions.push({
      id: `${twin.id}-pred-fallback`,
      companyId: twin.id,
      title: 'Cloud Infrastructure and eBPF Telemetry Scaling',
      predictedAction: `${twin.name} will migration SCADA telemetry ingestion to distributed Kubernetes clusters.`,
      why: 'Ongoing technical roles and eBPF software tracking implementation indicate database ingestion expansion.',
      confidence: 82,
      recommendedAction: 'Present Kubernetes performance monitoring and cluster cost reduction systems.',
      urgency: 'low',
      timeWindow: '90 to 180 days'
    });
  }

  return predictions;
}
