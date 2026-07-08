import { RawSignal, ClassifiedSignal, SignalCategory, UrgencyLevel } from './types';

// The Classification Agent analyzes a raw signal and yields classified metadata
export function classifySignal(signal: RawSignal): ClassifiedSignal {
  const titleLower = signal.title.toLowerCase();
  const contentLower = signal.content.toLowerCase();
  const sourceLower = signal.source.toLowerCase();

  let category: SignalCategory = 'hiring';
  let urgency: UrgencyLevel = 'low';
  let confidence = 85;
  let businessImpact = 0;
  let reasoning = '';

  // 1. Classification logic based on keywords and source
  if (
    titleLower.includes('vulnerability') ||
    contentLower.includes('vulnerability') ||
    titleLower.includes('leak') ||
    contentLower.includes('leak') ||
    titleLower.includes('zero-day') ||
    contentLower.includes('zero-day') ||
    titleLower.includes('exploit') ||
    contentLower.includes('exploit') ||
    titleLower.includes('cisa')
  ) {
    category = 'cybersecurity';
    confidence = sourceLower.includes('reddit') ? 75 : 95;
    urgency = (titleLower.includes('zero-day') || titleLower.includes('emergency')) ? 'critical' : 'high';
    businessImpact = titleLower.includes('patch') ? -1 : -8;
    reasoning = titleLower.includes('patch')
      ? 'Patch release addresses known system vulnerability, reducing active exploit risk.'
      : 'Vulnerability or system threat detected with active exploit risk, creating immediate security exposure.';
  } else if (
    titleLower.includes('fda') ||
    titleLower.includes('sec') ||
    titleLower.includes('regulation') ||
    contentLower.includes('regulation') ||
    titleLower.includes('compliance') ||
    contentLower.includes('compliance') ||
    titleLower.includes('directive') ||
    titleLower.includes('sandbox certification')
  ) {
    category = 'regulation';
    confidence = 98;
    urgency = titleLower.includes('delay') || titleLower.includes('emergency') ? 'high' : 'medium';
    businessImpact = titleLower.includes('delay') ? -5 : (titleLower.includes('certification') ? 6 : -2);
    reasoning = titleLower.includes('delay')
      ? 'Regulatory delays restrict market launch or grid connection, negatively impacting near-term roadmap.'
      : titleLower.includes('certification')
      ? 'Obtained regulatory sandbox approval, unlocking market testing and regional integration.'
      : 'Compliance monitoring and audits required to adapt to changing legal and administrative standards.';
  } else if (
    titleLower.includes('hiring') ||
    titleLower.includes('hire') ||
    contentLower.includes('seeking a') ||
    contentLower.includes('expanding our sales')
  ) {
    category = 'hiring';
    confidence = 90;
    urgency = titleLower.includes('urgent') || titleLower.includes('18 enterprise') ? 'high' : 'low';
    businessImpact = titleLower.includes('18 enterprise') ? 7 : 3;
    reasoning = titleLower.includes('18 enterprise')
      ? 'Aggressive enterprise sales team scaling strongly signals market demand and transition to active B2B commercialization.'
      : 'Hiring key roles to fill specific skill gaps in security, compliance, or system architecture.';
  } else if (
    titleLower.includes('expand') ||
    contentLower.includes('expand') ||
    titleLower.includes('apac') ||
    contentLower.includes('germany') ||
    titleLower.includes('singapore')
  ) {
    category = 'expansion';
    confidence = 92;
    urgency = 'medium';
    businessImpact = 6;
    reasoning = 'International expansion signals geographic scale, capital backing, and access to new customer bases.';
  } else if (
    titleLower.includes('series') ||
    titleLower.includes('funding') ||
    titleLower.includes('raises') ||
    titleLower.includes('secured') ||
    titleLower.includes('debt facility')
  ) {
    category = 'funding';
    confidence = 96;
    urgency = 'medium';
    businessImpact = 8;
    reasoning = 'Successful capital influx (equity or debt) extends operational runway, permitting aggressive development and hiring.';
  } else if (
    titleLower.includes('partner') ||
    titleLower.includes('partnership') ||
    contentLower.includes('purchase agreement')
  ) {
    category = 'partnership';
    confidence = 95;
    urgency = 'medium';
    businessImpact = 7;
    reasoning = 'Strategic partnership with critical vendor or supplier mitigates supply bottlenecks and expands delivery capacity.';
  } else if (
    titleLower.includes('launch') ||
    titleLower.includes('release') ||
    titleLower.includes('portals') ||
    contentLower.includes('subscription models')
  ) {
    category = 'product_launch';
    confidence = 94;
    urgency = 'medium';
    businessImpact = 6;
    reasoning = 'Release of new capabilities or subscription models creates immediate pathways for monetization and customer acquisition.';
  } else if (
    titleLower.includes('supply chain') ||
    titleLower.includes('bottleneck') ||
    titleLower.includes('procurement') ||
    contentLower.includes('seeking battery')
  ) {
    category = 'supply_chain';
    confidence = 88;
    urgency = 'high';
    businessImpact = -6;
    reasoning = 'Supply chain blockages in battery cells or critical parts directly threaten utility deployment schedules.';
  } else if (
    titleLower.includes('patent') ||
    titleLower.includes('ebpf') ||
    titleLower.includes('cloud infrastructure') ||
    contentLower.includes('aws iot') ||
    contentLower.includes('neural network')
  ) {
    category = 'tech_adoption';
    confidence = 93;
    urgency = 'low';
    businessImpact = 5;
    reasoning = 'Acquisition of patents or shift to advanced technologies (eBPF, edge neural nets) establishes long-term tech moat.';
  } else if (
    titleLower.includes('competitor') ||
    titleLower.includes('acquires') ||
    titleLower.includes('acquisition') ||
    contentLower.includes('networksentry')
  ) {
    category = 'competitive_threat';
    confidence = 90;
    urgency = 'medium';
    businessImpact = titleLower.includes('acquires') ? 8 : -4; // Acquiring is good for the company, competitor action is negative
    reasoning = titleLower.includes('acquires')
      ? 'Acquiring strategic firms extends system capability and locks out competitor integration pathways.'
      : 'Competitor fundraising or expansion threatens market share and calls for defensive response.';
  } else {
    // Default fallback
    category = 'tech_adoption';
    urgency = 'low';
    confidence = 80;
    businessImpact = 2;
    reasoning = 'General signal monitoring indicates minor infrastructure or technical evolution.';
  }

  // Adjust source confidence levels
  if (sourceLower.includes('sec filing')) {
    confidence = 99;
  } else if (sourceLower.includes('federal register') || sourceLower.includes('ministry of health')) {
    confidence = 97;
  } else if (sourceLower.includes('blog') || sourceLower.includes('releases')) {
    confidence = 93;
  } else if (sourceLower.includes('reddit') || sourceLower.includes('hacker news')) {
    confidence = 72;
  }

  return {
    ...signal,
    category,
    urgency,
    confidence,
    businessImpact,
    reasoning
  };
}
