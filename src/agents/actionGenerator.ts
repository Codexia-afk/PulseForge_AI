import { CompanyTwin, StrategyPlaybook, GeneratedActions } from './types';

// The Action Generator outputs customized outreach messages, Slack alerts, and CRM reports
export function generateActions(twin: CompanyTwin, playbook: StrategyPlaybook): GeneratedActions {
  const name = twin.name;
  const ticker = twin.ticker;
  const industry = twin.industry;
  const hq = twin.hq;
  const score = twin.metrics.overallStrategicOpportunity;
  
  // 1. Email template
  const email = `Subject: Strategic Proposal: ${playbook.outreachAngle} - ${name} (${ticker})

Dear ${name} Executive Team,

I've been tracking ${name}'s impressive growth in ${industry}, particularly your recent milestone: "${playbook.executiveSummary.substring(0, 80)}...".

Based on an analysis of public business telemetry—including your current ${twin.metrics.buyingIntent > 70 ? 'aggressive scaling of B2B teams' : 'technical infrastructure developments'}—we have analyzed your business twin's primary strategic vectors.

We noticed an opportunity regarding: ${playbook.outreachAngle}. Specifically, we suggest that ${playbook.riskMitigationStep}. 

We'd love to share our playbooks on how similar enterprises scale telemetry while maintaining strict security:
${playbook.strategicPlaybook.slice(0, 2).map(item => `* ${item}`).join('\n')}

Are you available for a brief, 10-minute technical brief next Tuesday at 10 AM EST?

Best regards,

Strategic Account Director
PulseForge AI Platform
`;

  // 2. LinkedIn DM
  const linkedinDm = `Hi Team, noticed ${name} is scaling in ${industry} (ticker: ${ticker}). With your current Strategic Opportunity index at ${score}%, we mapped out an outreach angle on: "${playbook.outreachAngle}". 

Specifically, to support your upcoming roadmap, we suggest: "${playbook.riskMitigationStep.substring(0, 120)}...". 

Would love to send over our brief 3-page executive plan. Let me know if you are open to reviewing!`;

  // 3. Slack alert
  const slackAlert = `*🚨 PULSEFORGE INTENT TELEMETRY ALERT: ${name.toUpperCase()} (${ticker})*
*Industry:* ${industry} | *Location:* ${hq}
*Overall Opportunity Score:* 🟩 ${score}% (Intent: ${twin.metrics.buyingIntent}%, Cyber: ${twin.metrics.cybersecurityMaturity}%, Regulatory Risk: ${twin.metrics.regulatoryRisk}%)

*Latest Strategic Analysis:*
> "${playbook.executiveSummary}"

*Target outreach Angle:*
🎯 \`${playbook.outreachAngle}\`

*Immediate Playbook Steps:*
1️⃣ ${playbook.strategicPlaybook[0]}
2️⃣ ${playbook.strategicPlaybook[1]}

*Proposed Action:*
👉 _Personalized outreach email drafted and synced to CRM hub._
👉 _Partnership opportunity generated: ${playbook.partnershipSuggestion}_
`;

  // 4. CRM Note
  const crmNote = `=== PULSEFORGE AI AGENTIC INTELLIGENCE SYNC ===
Company: ${name} (${ticker})
Industry Segment: ${industry}
Headquarters: ${hq}
Intel Score: Opportunity: ${score}%, Buying Intent: ${twin.metrics.buyingIntent}%, Risk Level: ${twin.metrics.regulatoryRisk}%

AI Twin Observations:
- Strategic Angle: ${playbook.outreachAngle}
- Risk Mitigation Plan: ${playbook.riskMitigationStep}
- Partnership Potential: ${playbook.partnershipSuggestion}
- Playbook Recommendations:
  * ${playbook.strategicPlaybook.join('\n  * ')}

Status: Syncing outreach draft. Opportunity updated to 'Active Target'.
Sync Date: ${new Date().toISOString().split('T')[0]}
===============================================`;

  // 5. Executive Brief
  const executiveBrief = `EXECUTIVE SUMMARY BRIEFING: ${name.toUpperCase()} (${ticker})
Prepared by PulseForge AI Platform

1. STRATEGIC POSITIONING
${name} is an enterprise player in ${industry} operating out of ${hq}. They maintain an employee count of approximately ${twin.employeeCount} personnel.

2. LIVING TWIN STATE & TELEMETRY
* Strategic Opportunity: ${score}/100 (Strong Buying Intent: ${twin.metrics.buyingIntent}%)
* Cybersecurity Posture: ${twin.metrics.cybersecurityMaturity}/100
* Regulatory Audit Exposure: ${twin.metrics.regulatoryRisk}/100
* Technology Adoption Momentum: ${twin.metrics.techAdoptionMomentum}/100

3. DETECTED ROADMAP VECTORS & INTENT
* Core Opportunity: ${playbook.outreachAngle}
* Suggested Strategic Alliance: ${playbook.partnershipSuggestion}
* Critical Defensive Step: ${playbook.riskMitigationStep}

4. KEY ACTIONABLE INITIATIVES
* Initiative 1: ${playbook.strategicPlaybook[0]}
* Initiative 2: ${playbook.strategicPlaybook[1]}
* Initiative 3: ${playbook.strategicPlaybook[2] || 'Implement continuous compliance audits'}
`;

  return {
    email,
    linkedinDm,
    slackAlert,
    crmNote,
    executiveBrief
  };
}
