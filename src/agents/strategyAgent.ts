import { CompanyTwin, StrategyPlaybook, StrategicPrediction, ClassifiedSignal } from './types';

// The Strategy Recommendation Agent designs customized action playbooks based on twin telemetry
export function generateStrategyPlaybook(
  twin: CompanyTwin,
  _predictions: StrategicPrediction[],
  signals: ClassifiedSignal[]
): StrategyPlaybook {
  const companySignals = signals.filter(s => s.companyId === twin.id);
  const hasCyberIncident = companySignals.some(s => s.category === 'cybersecurity' && s.businessImpact < 0);
  const hasSupplyBottleneck = companySignals.some(s => s.category === 'supply_chain');

  const industry = twin.industry.toLowerCase();
  const id = twin.id.toLowerCase().trim();

  // 1. Healthcare & Biotech segment (Pfizer, Moderna)
  if (industry.includes('health') || industry.includes('biotech') || industry.includes('pharm') || id === 'pfizer' || id === 'moderna') {
    if (hasCyberIncident) {
      return {
        companyId: twin.id,
        outreachAngle: 'Securing Clinical Data Integrity and API Gateway Access Control',
        partnershipSuggestion: 'Collaborate with CrowdStrike to deploy eBPF-based container threat security scanners.',
        riskMitigationStep: 'Deprecate legacy API endpoints, deploy strict OAuth2 sessions, and patch the IDOR API exposure immediately.',
        strategicPlaybook: [
          'Audit CarePortal patient endpoint parameters for object-level authorization vulnerabilities.',
          'Deploy web application firewalls (WAF) to filter endpoint parameter manipulation.',
          'Establish a bug bounty program to leverage external security researchers on new portals.',
          'Brief hospital partners on telemetry updates to maintain institutional HIPAA trust.'
        ],
        executiveSummary: `${twin.name} is scaling clinical diagnostic tools. However, a critical IDOR patient API exposure has dropped their cybersecurity maturity and raised compliance risks, making secure API gateway integration their #1 priority.`
      };
    } else {
      return {
        companyId: twin.id,
        outreachAngle: 'Accelerating FDA trial compliance and clinical database scaling',
        partnershipSuggestion: 'Partner with AWS Healthcare Cloud to build localized data clean room portals.',
        riskMitigationStep: 'Align algorithmic training data logs with the new FDA machine learning draft guidance within 90 days.',
        strategicPlaybook: [
          'Submit application for Singapore MOH national sandbox pilot integration program.',
          'Deploy federated learning models to process patient diagnostics locally and bypass international data transfer restrictions.',
          'Onboard and train the 18 new enterprise sales hires on healthcare compliance frameworks.'
        ],
        executiveSummary: `${twin.name} is scaling diagnostic AI engines. Current signals show aggressive sales team scaling, regulatory compliance focus, and Singapore sandbox entry, representing a high-value opportunity for compliance automation platforms.`
      };
    }
  }

  // 2. CleanTech, Energy & Automotive segment (Tesla)
  if (industry.includes('energy') || industry.includes('automotive') || id === 'tesla') {
    if (hasSupplyBottleneck) {
      return {
        companyId: twin.id,
        outreachAngle: 'Resilient Battery Procurement and Automated SCADA Ingestion Architecture',
        partnershipSuggestion: 'Finalize grid battery purchase agreement with VoltGrid to bypass supply chain bottlenecks.',
        riskMitigationStep: 'Submit harmonic filter designs to the Texas Utility Commission to resolve interconnection delays.',
        strategicPlaybook: [
          'Onboard LFP battery cells to fulfill storage farm volume demands.',
          'Install grid harmonic disturbance filters at primary substations.',
          'Establish secondary supply chains with backup LFP battery manufacturers.'
        ],
        executiveSummary: `${twin.name} is building decentralized battery farms. Supply bottlenecks and regulator interconnection delays are near-term issues, but the VoltGrid partnership resolves cell shortages to unlock Q3 activation.`
      };
    } else {
      return {
        companyId: twin.id,
        outreachAngle: 'Scaling Smart-Grid Telemetry and IoT Firmware Posture Management',
        partnershipSuggestion: 'Partner with CrowdStrike to execute security posture audits on remote SCADA smart-meters.',
        riskMitigationStep: 'Deploy encrypted MQTT tunnels and automatic firmware rollbacks to block grid IoT tampering.',
        strategicPlaybook: [
          'Scale real-time IoT cloud data ingestion pipelines to ingest millions of grid telemetry metrics.',
          'Draft a cybersecurity response framework for remote firmware channels.',
          'Deploy Cloud Architects to optimize AWS IoT Core telemetry clusters.'
        ],
        executiveSummary: `${twin.name} is scaling smart-grid IoT meters and energy storage nodes. Backed by new capital, they are upgrading cloud data ingestion and SCADA controls, offering high-value entry points for IoT telemetry and cloud infrastructure vendors.`
      };
    }
  }

  // 3. Fintech & Payments segment (Stripe)
  if (industry.includes('finance') || id === 'stripe') {
    return {
      companyId: twin.id,
      outreachAngle: 'Automated Tax Compliance and SaaS Subscription Ingestion',
      partnershipSuggestion: 'Partner with OpenAI to power billing frameworks for developer API platforms.',
      riskMitigationStep: 'Deploy automated card-testing fraud detection models and secure AML pipelines.',
      strategicPlaybook: [
        'Roll out automated tax calculations across international SaaS segments.',
        'Upgrade API gateways to handle high-frequency subscription micro-transactions.',
        'Audit money transmitter licensing pipelines in expanding EMEA markets.'
      ],
      executiveSummary: `${twin.name} is the standard for financial software. Given their focus on recurring SaaS models and API developer billing, there is a high-fit alignment to deploy automated tax and transaction protection frameworks.`
    };
  }

  // 4. Semiconductors & Hardware segment (NVIDIA)
  if (industry.includes('semiconductor') || industry.includes('hardware') || id === 'nvidia') {
    return {
      companyId: twin.id,
      outreachAngle: 'Accelerating GPU Compiler Workloads and BioNeMo Container Scale',
      partnershipSuggestion: 'Form cloud compute alliances with Microsoft Azure to support Blackwell cluster rollouts.',
      riskMitigationStep: 'Audit compiler translation logics to secure private proprietary models.',
      strategicPlaybook: [
        'Hire compiler developers to optimize CUDA software libraries.',
        'Partner with biotech leaders to roll out containerized BioNeMo models.',
        'Address federal regulatory queries regarding graphics chip supply logs.'
      ],
      executiveSummary: `${twin.name} leads in AI silicon. Current roadmaps show Blackwell GPU scaling and BioNeMo drug design adoption, presenting major partnerships for cloud systems builders and medical AI developers.`
    };
  }

  // 5. General Cybersecurity segment (CrowdStrike, Cloudflare)
  if (industry.includes('cyber') || industry.includes('security') || industry.includes('network') || id === 'crowdstrike' || id === 'cloudflare') {
    return {
      companyId: twin.id,
      outreachAngle: 'eBPF Threat Intelligence Scaling and Container Telemetry Optimization',
      partnershipSuggestion: 'Partner with Microsoft to secure endpoint container clusters.',
      riskMitigationStep: 'Deploy automatic memory validation routines to stabilize kernel-level sensors.',
      strategicPlaybook: [
        'Roll out eBPF telemetry hooks to monitor raw Linux socket activity directly without kernel modules.',
        'Integrate network traffic analysis tools to monitor hybrid cloud network frames.',
        'Address customer questions regarding recent sensor configuration outages.'
      ],
      executiveSummary: `${twin.name} is a leading security node. Given their deployment of eBPF kernel instrumentation, they represent a prime target for Kubernetes monitoring and enterprise DevSecOps tools.`
    };
  }

  // 6. SaaS & Cloud Database Fallback (Microsoft, Snowflake, Palantir, Databricks, Salesforce)
  return {
    companyId: twin.id,
    outreachAngle: 'Unified Metadata Catalogs and Cortex AI SQL Pipelines',
    partnershipSuggestion: 'Partner with Snowflake or Databricks to deploy automated RAG clean rooms.',
    riskMitigationStep: 'Mandate MFA across client databases to mitigate credential harvesting breaches.',
    strategicPlaybook: [
      'Deploy Apache Iceberg catalog formats to optimize multi-cloud query execution.',
      'Onboard local LLM models using native SQL container gateways.',
      'Deploy customer success specialists to configure secure role-level access.'
    ],
    executiveSummary: `${twin.name} is scaling enterprise data clean rooms and AI models. Given their transition to serverless GPU database queries, they are a high-value opportunity for vector search optimization and data audit tools.`
  };
}
