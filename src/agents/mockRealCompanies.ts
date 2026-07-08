import { CompanyTwin, MatchRecommendation } from './types';

// Baseline definitions for our 12 real companies
export const REAL_BASELINE_COMPANIES: Record<string, Omit<CompanyTwin, 'explainability' | 'historicalMetrics'>> = {
  nvidia: {
    id: 'nvidia',
    name: 'NVIDIA Corporation',
    logo: 'NV',
    ticker: 'NVDA',
    industry: 'Semiconductors & AI Hardware',
    employeeCount: 29600,
    hq: 'Santa Clara, CA',
    website: 'nvidia.com',
    metrics: {
      buyingIntent: 65,
      expansionReadiness: 88,
      partnershipReadiness: 85,
      cybersecurityMaturity: 82,
      vendorRequirementProb: 55,
      regulatoryRisk: 45,
      techAdoptionMomentum: 95,
      competitiveThreatLevel: 35,
      overallStrategicOpportunity: 78
    }
  },
  tesla: {
    id: 'tesla',
    name: 'Tesla, Inc.',
    logo: 'TS',
    ticker: 'TSLA',
    industry: 'Automotive & Energy Storage',
    employeeCount: 140000,
    hq: 'Austin, TX',
    website: 'tesla.com',
    metrics: {
      buyingIntent: 60,
      expansionReadiness: 82,
      partnershipReadiness: 70,
      cybersecurityMaturity: 78,
      vendorRequirementProb: 75,
      regulatoryRisk: 58,
      techAdoptionMomentum: 90,
      competitiveThreatLevel: 50,
      overallStrategicOpportunity: 70
    }
  },
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft Corporation',
    logo: 'MS',
    ticker: 'MSFT',
    industry: 'Cloud & Enterprise Software',
    employeeCount: 221000,
    hq: 'Redmond, WA',
    website: 'microsoft.com',
    metrics: {
      buyingIntent: 70,
      expansionReadiness: 90,
      partnershipReadiness: 88,
      cybersecurityMaturity: 76,
      vendorRequirementProb: 50,
      regulatoryRisk: 52,
      techAdoptionMomentum: 92,
      competitiveThreatLevel: 40,
      overallStrategicOpportunity: 80
    }
  },
  snowflake: {
    id: 'snowflake',
    name: 'Snowflake Inc.',
    logo: 'SF',
    ticker: 'SNOW',
    industry: 'Cloud Data Warehousing',
    employeeCount: 7000,
    hq: 'Bozeman, MT',
    website: 'snowflake.com',
    metrics: {
      buyingIntent: 72,
      expansionReadiness: 74,
      partnershipReadiness: 80,
      cybersecurityMaturity: 70,
      vendorRequirementProb: 60,
      regulatoryRisk: 35,
      techAdoptionMomentum: 84,
      competitiveThreatLevel: 48,
      overallStrategicOpportunity: 72
    }
  },
  palantir: {
    id: 'palantir',
    name: 'Palantir Technologies',
    logo: 'PL',
    ticker: 'PLTR',
    industry: 'Data Analytics & AI Systems',
    employeeCount: 3800,
    hq: 'Denver, CO',
    website: 'palantir.com',
    metrics: {
      buyingIntent: 58,
      expansionReadiness: 80,
      partnershipReadiness: 82,
      cybersecurityMaturity: 90,
      vendorRequirementProb: 40,
      regulatoryRisk: 42,
      techAdoptionMomentum: 88,
      competitiveThreatLevel: 38,
      overallStrategicOpportunity: 74
    }
  },
  crowdstrike: {
    id: 'crowdstrike',
    name: 'CrowdStrike Holdings',
    logo: 'CS',
    ticker: 'CRWD',
    industry: 'Endpoint Cybersecurity',
    employeeCount: 8400,
    hq: 'Austin, TX',
    website: 'crowdstrike.com',
    metrics: {
      buyingIntent: 68,
      expansionReadiness: 78,
      partnershipReadiness: 75,
      cybersecurityMaturity: 88,
      vendorRequirementProb: 45,
      regulatoryRisk: 30,
      techAdoptionMomentum: 86,
      competitiveThreatLevel: 42,
      overallStrategicOpportunity: 74
    }
  },
  cloudflare: {
    id: 'cloudflare',
    name: 'Cloudflare, Inc.',
    logo: 'CF',
    ticker: 'NET',
    industry: 'Edge Networks & CDN',
    employeeCount: 3500,
    hq: 'San Francisco, CA',
    website: 'cloudflare.com',
    metrics: {
      buyingIntent: 75,
      expansionReadiness: 82,
      partnershipReadiness: 84,
      cybersecurityMaturity: 85,
      vendorRequirementProb: 48,
      regulatoryRisk: 28,
      techAdoptionMomentum: 88,
      competitiveThreatLevel: 45,
      overallStrategicOpportunity: 76
    }
  },
  databricks: {
    id: 'databricks',
    name: 'Databricks Inc.',
    logo: 'DB',
    ticker: 'DBX',
    industry: 'Data Lakehouse & AI',
    employeeCount: 6500,
    hq: 'San Francisco, CA',
    website: 'databricks.com',
    metrics: {
      buyingIntent: 74,
      expansionReadiness: 78,
      partnershipReadiness: 78,
      cybersecurityMaturity: 80,
      vendorRequirementProb: 52,
      regulatoryRisk: 32,
      techAdoptionMomentum: 90,
      competitiveThreatLevel: 46,
      overallStrategicOpportunity: 75
    }
  },
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce, Inc.',
    logo: 'CRM',
    ticker: 'CRM',
    industry: 'Enterprise CRM & SaaS',
    employeeCount: 79000,
    hq: 'San Francisco, CA',
    website: 'salesforce.com',
    metrics: {
      buyingIntent: 62,
      expansionReadiness: 84,
      partnershipReadiness: 86,
      cybersecurityMaturity: 82,
      vendorRequirementProb: 45,
      regulatoryRisk: 38,
      techAdoptionMomentum: 84,
      competitiveThreatLevel: 40,
      overallStrategicOpportunity: 74
    }
  },
  pfizer: {
    id: 'pfizer',
    name: 'Pfizer Inc.',
    logo: 'PF',
    ticker: 'PFE',
    industry: 'Pharmaceuticals & Biotech',
    employeeCount: 83000,
    hq: 'New York, NY',
    website: 'pfizer.com',
    metrics: {
      buyingIntent: 55,
      expansionReadiness: 80,
      partnershipReadiness: 76,
      cybersecurityMaturity: 84,
      vendorRequirementProb: 58,
      regulatoryRisk: 50,
      techAdoptionMomentum: 82,
      competitiveThreatLevel: 32,
      overallStrategicOpportunity: 70
    }
  },
  moderna: {
    id: 'moderna',
    name: 'Moderna, Inc.',
    logo: 'MD',
    ticker: 'MRNA',
    industry: 'Biotech & mRNA Therapeutics',
    employeeCount: 5600,
    hq: 'Cambridge, MA',
    website: 'modernatx.com',
    metrics: {
      buyingIntent: 56,
      expansionReadiness: 72,
      partnershipReadiness: 78,
      cybersecurityMaturity: 80,
      vendorRequirementProb: 64,
      regulatoryRisk: 48,
      techAdoptionMomentum: 86,
      competitiveThreatLevel: 36,
      overallStrategicOpportunity: 68
    }
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe, Inc.',
    logo: 'ST',
    ticker: 'STRIP',
    industry: 'Financial Infrastructure',
    employeeCount: 8000,
    hq: 'San Francisco, CA',
    website: 'stripe.com',
    metrics: {
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
  }
};

// Curated signals for each company (evidence)
export const REAL_COMPANY_SIGNALS: Record<string, { title: string; url: string; snippet: string; category: string; confidence: number }[]> = {
  nvidia: [
    {
      title: "NVIDIA Blackwell B200 GPU Architecture Announcement",
      url: "https://nvidianews.nvidia.com/news/blackwell-b200-architecture",
      snippet: "NVIDIA announces the Blackwell platform, including the B200 and GB200 NVL72 chips, designed to execute generative AI model training and inference at 30x lower energy levels.",
      category: "product_launch",
      confidence: 99
    },
    {
      title: "Careers: Principal Software Engineer - BioNeMo AI Models",
      url: "https://nvidia.wd5.myworkdayjobs.com/NVIDIACareers/job/BioNeMo-Software-Engineer",
      snippet: "NVIDIA is seeking compiler developers and software architects to build GPU-optimized interfaces for BioNeMo, enabling molecular design container deployment.",
      category: "hiring",
      confidence: 92
    }
  ],
  tesla: [
    {
      title: "Tesla Energy Megapack Scale-Up in California",
      url: "https://www.tesla.com/blog/scaling-megapack-utility-storage",
      snippet: "Tesla is increasing manufacturing capacity of its utility-scale battery storage system, Megapack, at its Lathrop Megafactory to assist with grid peak storage.",
      category: "expansion",
      confidence: 98
    },
    {
      title: "Tesla SEC Form 10-K: Item 1A Risk Factors on Autopilot Compliance",
      url: "https://www.sec.gov/Archives/edgar/data/1318605/TSLA-10K",
      snippet: "We are subject to regulatory reviews by NHTSA regarding Autopilot features. Any safety recalls or modifications to grid storage battery interconnects could impact operations.",
      category: "regulation",
      confidence: 99
    }
  ],
  microsoft: [
    {
      title: "Microsoft Launches Secure Future Initiative (SFI)",
      url: "https://www.microsoft.com/en-us/security/blog/secure-future-initiative",
      snippet: "Microsoft CEO Satya Nadella outlines SFI to overhaul code audits and identity authorization flows following CISA reports on Exchange Online system access.",
      category: "cybersecurity",
      confidence: 99
    },
    {
      title: "Microsoft and OpenAI Expand AI Infrastructure Partnership",
      url: "https://news.microsoft.com/microsoft-and-openai-extend-partnership",
      snippet: "Microsoft announces multi-billion dollar investment to build out specialized supercomputing clusters on Azure to deploy next-gen GPT models.",
      category: "partnership",
      confidence: 99
    }
  ],
  snowflake: [
    {
      title: "Snowflake Cortex AI Launched in General Availability",
      url: "https://www.snowflake.com/en/blog/cortex-ai-general-availability",
      snippet: "Snowflake launches Cortex AI, exposing LLM inference, embedding generation, and vector search natively within SQL data warehousing environments.",
      category: "product_launch",
      confidence: 98
    },
    {
      title: "Snowflake Mandates Multi-Factor Authentication (MFA) Globally",
      url: "https://www.snowflake.com/en/blog/snowflake-mandatory-mfa-compliance",
      snippet: "Following unauthorized access incidents on customer accounts via compromised credentials, Snowflake updates policy to require MFA for all client nodes.",
      category: "cybersecurity",
      confidence: 97
    }
  ],
  palantir: [
    {
      title: "Palantir AIP (Artificial Intelligence Platform) Releases",
      url: "https://www.palantir.com/newsroom/aip-commercial-release",
      snippet: "Palantir announces massive B2B client growth driven by AIP deployments, enabling enterprises to write local agents and connect Foundry databases to LLM models.",
      category: "product_launch",
      confidence: 99
    }
  ],
  crowdstrike: [
    {
      title: "CrowdStrike Global IT Outage Root Cause Analysis",
      url: "https://www.crowdstrike.com/blog/falcon-sensor-update-remediation",
      snippet: "CrowdStrike releases remediation details following a Falcon sensor template update error that triggered Windows crashes globally. Reviewing quality assurance checks.",
      category: "cybersecurity",
      confidence: 99
    }
  ],
  cloudflare: [
    {
      title: "Cloudflare Workers AI Serverless Inference Expansion",
      url: "https://blog.cloudflare.com/workers-ai-edge-gpus",
      snippet: "Cloudflare deploys edge GPUs across 150 global locations, enabling developers to run serverless Hugging Face AI models directly on edge networks.",
      category: "tech_adoption",
      confidence: 98
    }
  ],
  databricks: [
    {
      title: "Databricks Acquires MosaicML for $1.3B",
      url: "https://www.databricks.com/blog/databricks-acquires-mosaicml-generative-ai",
      snippet: "Databricks consolidates data lakehouse capabilities with generative AI by acquiring MosaicML, giving enterprises tools to train custom LLMs on local data.",
      category: "competitive_threat",
      confidence: 99
    }
  ],
  salesforce: [
    {
      title: "Salesforce Launches Agentforce Autonomous AI Agents",
      url: "https://www.salesforce.com/news/press-releases/agentforce-launch",
      snippet: "Salesforce unveils Agentforce, an autonomous AI agent network that routes CRM leads, automates service chats, and generates business workflows natively.",
      category: "product_launch",
      confidence: 99
    }
  ],
  pfizer: [
    {
      title: "Pfizer Partners with BioNTech for AI Vaccine Development",
      url: "https://www.pfizer.com/news/press-release/pfizer-biontech-mrna-alliance",
      snippet: "Pfizer coordinates with BioNTech to integrate mRNA research pipelines and utilize machine learning for epitope forecasting during drug trials.",
      category: "partnership",
      confidence: 99
    }
  ],
  moderna: [
    {
      title: "Moderna Launches Clinical AI Trial Automation Portal",
      url: "https://investors.modernatx.com/news/moderna-digital-clinical-portal",
      snippet: "Moderna implements secure cloud databases to streamline mRNA sequencing trial updates and automate patient compliance logging for FDA submissions.",
      category: "tech_adoption",
      confidence: 98
    }
  ],
  stripe: [
    {
      title: "Stripe Selected to Power Billing for OpenAI ChatGPT",
      url: "https://stripe.com/newsroom/news/openai-stripe-billing",
      snippet: "Stripe Billing is selected by OpenAI to manage recurring credit card payments and tax calculations for its ChatGPT Plus subscription customer base.",
      category: "partnership",
      confidence: 99
    }
  ]
};

// Frontend function to generate Demo Match recommendations based on User Presets
export function generateDemoMatches(userProfile: any): MatchRecommendation[] {
  const matchedList: MatchRecommendation[] = [];
  const ind = (userProfile.industry || '').toLowerCase();
  const region = (userProfile.target_region || '').toLowerCase();
  
  // Iterate through our 12 companies and build custom compatibility scores
  Object.keys(REAL_BASELINE_COMPANIES).forEach(id => {
    const base = REAL_BASELINE_COMPANIES[id];
    let bFit = 60;
    let tFit = 55;
    let mFit = 50;
    let growthAlign = 62;
    let hiringSim = 58;
    let gFit = 70;
    let cyberComp = base.metrics.cybersecurityMaturity;

    let bExp = `General business model alignment with ${base.name}.`;
    let tExp = "Standard architectural compatibility.";
    let mExp = "Overlapping enterprise customer segments.";
    let growthExp = `Growth index at ${base.metrics.buyingIntent * 0.9 + base.metrics.techAdoptionMomentum * 0.1}% indicates stable alignment.`;
    let hiringExp = `Hiring velocity matches baseline targets.`;
    let rExp = `Operational presence in targeted region (${userProfile.target_region}).`;
    let cyberExp = `Target cybersecurity index stands at ${cyberComp}%.`;
    
    // Custom match logic mirroring the backend heuristics
    if (id === 'pfizer' || id === 'moderna') {
      if (ind.includes('biotech') || ind.includes('health') || ind.includes('clinical') || ind.includes('pharma') || ind.includes('imaging')) {
        bFit = 96; tFit = 94; mFit = 92;
        bExp = `Exceptional Business Fit: User's focus on clinical sequencing and drug modeling directly matches ${base.name}'s pharmaceutical R&D roadmap.`;
        tExp = `Excellent Technology Fit: Aligning software modeling with mRNA sequencing databases creates a highly integrated technology stack.`;
      }
    } else if (id === 'tesla') {
      if (ind.includes('energy') || ind.includes('battery') || ind.includes('storage') || ind.includes('utility') || ind.includes('grid')) {
        bFit = 95; tFit = 92; mFit = 94;
        bExp = `Exceptional Business Fit: VoltGrid's utility battery systems match ${base.name}'s Tesla Energy Megapack distribution program.`;
        tExp = `Excellent Technology Fit: Direct grid SCADA database compatibility with Megapack telemetry sensors.`;
      }
    } else if (id === 'crowdstrike' || id === 'cloudflare') {
      if (ind.includes('security') || ind.includes('cyber') || ind.includes('ebpf') || ind.includes('kernel') || ind.includes('network')) {
        bFit = 94; tFit = 95; mFit = 90;
        bExp = `Exceptional Business Fit: KernSec's eBPF container scanning aligns with ${base.name}'s Falcon endpoint security suite.`;
        tExp = `Excellent Technology Fit: Deploying eBPF kernel instrumentation hooks directly merges container telemetry logs with Falcon sensor agents.`;
      }
    } else if (id === 'stripe') {
      if (ind.includes('fintech') || ind.includes('billing') || ind.includes('tax') || ind.includes('payment') || ind.includes('saas')) {
        bFit = 96; tFit = 93; mFit = 95;
        bExp = `Exceptional Business Fit: User's subscription billing matches ${base.name}'s financial infrastructure gateway.`;
      }
    } else if (id === 'nvidia') {
      if (ind.includes('ai') || ind.includes('gpu') || ind.includes('compiler') || ind.includes('biotech') || ind.includes('learning')) {
        bFit = 88; tFit = 95; mFit = 85;
        bExp = `Strong Business Fit: NVIDIA NIM and BioNeMo containers align with user's core compiler pipeline.`;
      }
    } else if (id === 'microsoft' || id === 'snowflake' || id === 'databricks') {
      if (ind.includes('cloud') || ind.includes('database') || ind.includes('saas') || ind.includes('analytics')) {
        bFit = 86; tFit = 90; mFit = 84;
      }
    }

    if (region.includes('us') || region.includes('global')) {
      gFit = 90;
      rExp = `High Region Fit: both companies maintain large US and global sales networks.`;
    }

    // Calculate exact weights
    const compScore = Math.round(
      bFit * 0.25 +
      tFit * 0.20 +
      mFit * 0.20 +
      growthAlign * 0.15 +
      hiringSim * 0.10 +
      gFit * 0.05 +
      cyberComp * 0.05
    );

    const evidence = REAL_COMPANY_SIGNALS[id] || [
      {
        title: "Public Corporate Update Link",
        url: `https://www.${base.website}`,
        snippet: `Public records indicate active expansion pipelines and software development audits matching enterprise criteria.`,
        category: "tech_adoption",
        confidence: 80
      }
    ];

    const outreachEmail = `Subject: Strategic Proposal: Scaling operational outcomes with ${userProfile.name}

Dear ${base.name} Partnership Team,

I have been following ${base.name}'s recent work, particularly regarding: "${evidence[0].title}".

At ${userProfile.name}, we build: "${userProfile.product_service}". Given your current technology integration initiatives and public business signals, we see a strong opportunity to align. Specifically, we suggest that collaborating would help ${base.name} achieve your goal to ${userProfile.partnership_goal} while ensuring enterprise security compliance.

We would love to share a brief technical overview of how we support similar scaling ecosystems. Are you open to a brief 10-minute introduction call next Tuesday at 11 AM EST?

Best regards,

Partnership Manager
${userProfile.name}
`;

    matchedList.push({
      companyId: id,
      companyName: base.name,
      ticker: base.ticker,
      logo: base.logo,
      industry: base.industry,
      hq: base.hq,
      website: base.website,
      compatibilityScore: compScore,
      businessFit: bFit,
      businessFitExplanation: bExp,
      techFit: tFit,
      techFitExplanation: tExp,
      marketFit: mFit,
      marketFitExplanation: mExp,
      geographicFit: gFit,
      geographicFitExplanation: rExp,
      growthAlignment: growthAlign,
      growthAlignmentExplanation: growthExp,
      hiringSimilarity: hiringSim,
      hiringSimilarityExplanation: hiringExp,
      cybersecurityCompatibility: cyberComp,
      cybersecurityCompatibilityExplanation: cyberExp,
      partnershipReadiness: base.metrics.partnershipReadiness >= 75 ? 'High' : base.metrics.partnershipReadiness >= 55 ? 'Medium' : 'Low',
      riskLevel: base.metrics.regulatoryRisk >= 65 ? 'Critical' : base.metrics.regulatoryRisk >= 50 ? 'High' : 'Medium',
      confidenceScore: 82 + evidence.length * 3,
      evidence: evidence,
      recommendation: `High-value match detected! ${base.name} shows exceptional compatibility (${compScore}%) with ${userProfile.name} for ${userProfile.partnership_goal}. We suggest reaching out regarding: "${evidence[0].title}".`,
      outreach: {
        email: outreachEmail,
        linkedinDm: `Hi Team, noticed ${base.name} is executing on: "${evidence[0].title}". At ${userProfile.name}, we build ${userProfile.product_service}. Let's chat regarding your goal to ${userProfile.partnership_goal}!`,
        executiveBrief: `EXECUTIVE PARTNERSHIP BRIEF: ${base.name}\n- Compatibility: ${compScore}%\n- Key Signal: ${evidence[0].title}\n- Next Step: Initiate pilot project proposals.`
      }
    } as MatchRecommendation);
  });

  return matchedList.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
