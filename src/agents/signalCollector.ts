import { RawSignal } from './types';

// Initial signals that exist in the system for real-world companies
export const INITIAL_RAW_SIGNALS: RawSignal[] = [
  // Pfizer (pfizer)
  {
    id: 'pf-sig-1',
    companyId: 'pfizer',
    source: 'LinkedIn Jobs',
    title: 'Hiring: Senior Director of HIPAA Compliance & Trial Security Audit',
    content: 'Seeking a compliance veteran to audit our medical sequencing models, interface with healthcare databases, and align with new clinical data standards.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'pf-sig-2',
    companyId: 'pfizer',
    source: 'Company Press Release',
    title: 'Pfizer partners with BioNTech to integrate AI-driven vaccine sequencing',
    content: 'The clinical pipeline leverages generative AI models to forecast epitope sequence variations, accelerating clinical trial runs and regulatory approvals.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'pf-sig-3',
    companyId: 'pfizer',
    source: 'Federal Register',
    title: 'FDA Draft Guidance on Machine Learning in Clinical Care Software',
    content: 'New FDA rules demand strict audits on bias, training data origins, and continuous evaluation loops. Software updates must comply with the new pre-market notification standard within 90 days.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },

  // Tesla (tesla)
  {
    id: 'ts-sig-1',
    companyId: 'tesla',
    source: 'SEC 10-K',
    title: 'Item 1A Risk Factors: Interconnection regulations on utility energy storage',
    content: 'Our energy division relies heavily on SCADA networks. Regulatory delays or changes in utility interconnect criteria could affect deployment of our Megapacks.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: 'ts-sig-2',
    companyId: 'tesla',
    source: 'LinkedIn Jobs',
    title: 'Hiring: Cloud Infrastructure Architect (SCADA & IoT Megapack Integration)',
    content: 'Looking for a cloud expert to build real-time ingestion pipelines for millions of battery telemetry points. Experience with AWS IoT Core and MQTT broker clusters is required.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: 'ts-sig-3',
    companyId: 'tesla',
    source: 'TechCrunch',
    title: 'Tesla secures $400M Megapack supply agreement with VoltGrid',
    content: 'Tesla will deliver utility-scale Megapack battery clusters to accelerate Q3 energy storage farm deployment in Texas and California.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },

  // CrowdStrike (crowdstrike)
  {
    id: 'cs-sig-1',
    companyId: 'crowdstrike',
    source: 'Tech News',
    title: 'CrowdStrike releases root cause analysis for global Falcon update issue',
    content: 'A sensor configuration update triggered Windows BSODs. The CrowdStrike team has deployed automatic memory validation checks to prevent telemetry client crashes.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: 'cs-sig-2',
    companyId: 'crowdstrike',
    source: 'USPTO Office',
    title: 'Patent Granted: Real-time autonomous behavioral threat detection',
    content: 'Patent granted to CrowdStrike for its method of analyzing syscall streams using local neural networks without leaking customer payload data.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'cs-sig-3',
    companyId: 'crowdstrike',
    source: 'Securities Filings',
    title: 'CrowdStrike launches Next-Gen SIEM to unify security telemetry',
    content: 'The new log management and telemetry framework aggregates threat feeds, providing deeper eBPF and endpoint auditing tools.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },

  // NVIDIA (nvidia)
  {
    id: 'nv-sig-1',
    companyId: 'nvidia',
    source: 'NVIDIA Newsroom',
    title: 'NVIDIA Launches Blackwell B200 Chip to Accelerate LLM Workloads',
    content: 'BLACKWELL architecture delivers 30x faster model inference with localized neural engine arrays and NVLink integrations.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  }
];

// Pool of signals that are triggered during the live demo or simulations
export const DYNAMIC_SIGNAL_POOL: Omit<RawSignal, 'id' | 'timestamp'>[] = [
  // Pfizer Live Demo Influx
  {
    companyId: 'pfizer',
    source: 'LinkedIn Jobs',
    title: 'Urgent Hiring: 18 Enterprise Account Executives & Sales Leaders',
    content: 'Expanding our clinical AI sales team. Responsibilities include running pilots with regional hospital networks, contract negotiation, and hitting high B2B quotas.',
  },
  {
    companyId: 'pfizer',
    source: 'Company Blog',
    title: 'Pfizer launches Digital Link portal with updated transparent clinical trial options',
    content: 'Announcing our self-serve developer API portal and clinical pilot portals. We are launching public cloud subscription models for clinical labs.',
  },
  {
    companyId: 'pfizer',
    source: 'Hacker News',
    title: 'Zero-day vulnerability reported in Pfizer Digital Link patient portal API',
    content: 'A researcher has disclosed an IDOR vulnerability on the CarePortal endpoint where raw medical records could be queried without proper session token matching. Patch is pending.',
  },
  {
    companyId: 'pfizer',
    source: 'Asia One News',
    title: 'Singapore Ministry of Health grants Pfizer clinical sandbox certification',
    content: 'Pfizer has been approved to participate in Singapore’s National Health tech sandbox, enabling direct integrations with local public hospital systems.',
  },

  // Tesla Live Demo Influx
  {
    companyId: 'tesla',
    source: 'Utility Commission',
    title: 'Tesla Megapack interconnection approval delayed by grid regulator',
    content: 'Regulatory board delays battery farm grid interconnection due to harmonic disturbance concerns on local transmission lines. Tesla must install mitigation filters.',
  },
  {
    companyId: 'tesla',
    source: 'LinkedIn Posts',
    title: 'Tesla Energy Director posts: Seeking LFP commercial battery cell partners',
    content: 'We are facing supply chain bottlenecks for LFP battery modules. Seeking suppliers that can deliver components starting Q3.',
  },
  {
    companyId: 'tesla',
    source: 'Business Wire',
    title: 'Tesla partners with VoltGrid for rapid energy Megapack delivery',
    content: 'Tesla Energy announces purchase agreement with VoltGrid to secure cell supply, resolving its storage bottleneck and accelerating deployments.',
  },

  // CrowdStrike Live Demo Influx
  {
    companyId: 'crowdstrike',
    source: 'GitHub Releases',
    title: 'Release v4.2.0: Patch for Falcon sensor memory issues & eBPF tracking',
    content: 'Resolves memory issues in high-volume Kubernetes nodes. Also introduces eBPF telemetry hooks to monitor raw Linux socket activity directly without kernel modules.',
  },
  {
    companyId: 'crowdstrike',
    source: 'CISA Alert Bulletin',
    title: 'CISA issues emergency directive on Active Directory zero-day exploitation',
    content: 'CISA warns government agencies to immediately audit Active Directory structures. Active exploitation detected. Cybersecurity systems must implement real-time AD monitoring.',
  }
];

// Helper to manually create a signal
export function createCustomSignal(
  companyId: string,
  title: string,
  content: string,
  source: string
): RawSignal {
  return {
    id: `custom-sig-${Math.random().toString(36).substr(2, 9)}`,
    companyId,
    title,
    content,
    source,
    timestamp: new Date().toISOString()
  };
}
