import React, { useState } from 'react';
import {
  TrendingUp,
  Shield,
  ShieldAlert,
  Zap,
  Activity,
  AlertTriangle,
  Clock,
  Compass,
  Info,
  ChevronRight,
  Sparkles,
  Cpu,
  Radio
} from 'lucide-react';
import { CompanyTwin, TwinMetrics, ClassifiedSignal, StrategicPrediction } from '../agents/types';

interface DashboardGridProps {
  twin: CompanyTwin;
  signals: ClassifiedSignal[];
  predictions: StrategicPrediction[];
  onSelectTab: (tab: string) => void;
  playbook: any;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  twin,
  signals,
  predictions,
  onSelectTab,
  playbook
}) => {
  const [selectedMetric, setSelectedMetric] = useState<keyof TwinMetrics>('buyingIntent');
  const [isExplainDrawerOpen, setIsExplainDrawerOpen] = useState(false);

  const metricMeta: Record<keyof TwinMetrics, { label: string; icon: any; color: string; desc: string }> = {
    buyingIntent: {
      label: 'Buying Intent Score',
      icon: TrendingUp,
      color: 'var(--accent-cyan)',
      desc: 'Likelihood of acquiring external software, hardware, or agency services based on sales team scaling, pricing adjustments, and commercial infrastructure rollouts.'
    },
    expansionReadiness: {
      label: 'Expansion Readiness',
      icon: Compass,
      color: 'var(--accent-green)',
      desc: 'Corporate preparedness to open regional offices, scale operations globally, and deploy major infrastructure projects.'
    },
    partnershipReadiness: {
      label: 'Partnership Readiness',
      icon: Sparkles,
      color: 'var(--accent-blue)',
      desc: 'Willingness and technical architecture openness to form alliances, implement integrations, and engage in co-selling programs.'
    },
    cybersecurityMaturity: {
      label: 'Cybersecurity Maturity',
      icon: Shield,
      color: 'var(--accent-green)',
      desc: 'System health rating, accounting for security patch velocity, infrastructure commits, compliance hiring, and active API exposures.'
    },
    vendorRequirementProb: {
      label: 'Vendor Requirement Prob.',
      icon: Zap,
      color: 'var(--accent-amber)',
      desc: 'Likelihood that the company is actively seeking or has immediate requirements for external supply vendors or specialty consultants.'
    },
    regulatoryRisk: {
      label: 'Regulatory Audit Risk',
      icon: AlertTriangle,
      color: 'var(--accent-magenta)',
      desc: 'Regulatory audit and compliance vulnerability risk based on SEC item disclosures, FDA guideline changes, or grid regulatory delay updates.'
    },
    techAdoptionMomentum: {
      label: 'Tech Adoption Momentum',
      icon: Activity,
      color: 'var(--accent-cyan)',
      desc: 'Rate of onboarding modern architectural items (eBPF telemetry, AI/ML models, cloud IoT pipelines) and IP protection via patent approvals.'
    },
    competitiveThreatLevel: {
      label: 'Competitive Threat Level',
      icon: ShieldAlert,
      color: 'var(--accent-magenta)',
      desc: 'Level of threat from sector competitors raising massive capital, releasing parallel products, or capturing customer market share.'
    },
    overallStrategicOpportunity: {
      label: 'Overall Strategic Score',
      icon: Info,
      color: 'var(--accent-cyan)',
      desc: 'Weighted index summarizing corporate strength, commercial urgency, and target fit.'
    }
  };

  const getMetricGlowStyle = (key: keyof TwinMetrics, value: number) => {
    const meta = metricMeta[key];
    return {
      width: `${value}%`,
      background: `linear-gradient(90deg, rgba(${meta.color === 'var(--accent-magenta)' ? '236,72,153' : meta.color === 'var(--accent-amber)' ? '245,158,11' : meta.color === 'var(--accent-green)' ? '16,185,129' : '6,182,212'}, 0.4), ${meta.color})`,
      boxShadow: `0 0 10px ${meta.color}`
    };
  };

  const companySignals = signals.filter(s => s.companyId === twin.id).slice(-4).reverse();

  // Custom SVG line chart plotting historical metrics
  const renderTrendChart = () => {
    const dataPoints = twin.historicalMetrics;
    const height = 150;
    const width = 450;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const minVal = 0;
    const maxVal = 100;

    // Map points to SVG coordinates
    const points = dataPoints.map((dp, idx) => {
      const x = paddingLeft + (idx / (dataPoints.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((dp.metrics[selectedMetric] - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y, date: dp.timestamp, val: dp.metrics[selectedMetric] };
    });

    const pathData = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaData = `${pathData} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    const meta = metricMeta[selectedMetric];

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="responsive-svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={meta.color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={meta.color} stopOpacity="0.0" />
          </linearGradient>
          <filter id="shadowGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={meta.color} floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Gridlines */}
        {[0, 25, 50, 75, 100].map((grid, idx) => {
          const y = paddingTop + chartHeight - (grid / 100) * chartHeight;
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(75,85,99,0.15)" strokeWidth="1" strokeDasharray="3 3" />
              <text x={paddingLeft - 8} y={y + 4} fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">
                {grid}%
              </text>
            </g>
          );
        })}

        {/* Dates */}
        {points.map((p, idx) => (
          <text key={idx} x={p.x} y={height - 8} fill="var(--text-muted)" fontSize="8.5" fontFamily="var(--font-mono)" textAnchor="middle">
            {p.date.split('-')[2]} Jul
          </text>
        ))}

        {/* Gradient Area Fill */}
        <path d={areaData} fill="url(#chartGlow)" />

        {/* Trend Line */}
        <path d={pathData} fill="none" stroke={meta.color} strokeWidth="2.5" filter="url(#shadowGlow)" />

        {/* Data Circles */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="var(--bg-primary)" stroke={meta.color} strokeWidth="2" />
            <title>{`${p.date}: ${p.val}%`}</title>
          </g>
        ))}
      </svg>
    );
  };

  const handleMetricClick = (key: keyof TwinMetrics) => {
    setSelectedMetric(key);
    setIsExplainDrawerOpen(true);
  };

  const activeExplanations = twin.explainability[selectedMetric] || [];
  const metricEvidenceCount = activeExplanations.length;
  const metricConfidence = Math.min(96, Math.max(52, twin.metrics[selectedMetric] - (metricEvidenceCount === 0 ? 18 : 0) + metricEvidenceCount * 4));
  const reasoningTree = [
    { label: 'Signal Collection', value: `${signals.filter(s => s.companyId === twin.id).length} public signals` },
    { label: 'Evidence Validation', value: metricEvidenceCount > 0 ? `${metricEvidenceCount} supporting traces` : 'Historical baseline only' },
    { label: 'Intent Analysis', value: metricMeta[selectedMetric].label },
    { label: 'Business Twin Construction', value: `${twin.metrics[selectedMetric]}% live index` },
    { label: 'Opportunity Prioritization', value: `${metricConfidence}% confidence` }
  ];

  const hasSigFunding = signals.some(s => s.companyId === twin.id && (s.category === 'funding' || s.category?.toLowerCase() === 'funding'));
  const hasSigHiring = signals.some(s => s.companyId === twin.id && (s.category === 'hiring' || s.category?.toLowerCase() === 'hiring'));
  const hasSigProduct = signals.some(s => s.companyId === twin.id && (s.category === 'product_launch' || s.category?.toLowerCase() === 'product_launch'));
  const hasSigExpansion = signals.some(s => s.companyId === twin.id && (s.category === 'expansion' || s.category?.toLowerCase() === 'expansion'));
  const hasPredictions = predictions && predictions.length > 0;
  const hasPlaybook = playbook && playbook.strategicPlaybook && playbook.strategicPlaybook.length > 0;

  const timelineSteps = [
    { label: 'Funding Influx', active: hasSigFunding, desc: 'Capital rounds or debt extension logs.' },
    { label: 'Hiring Surge', active: hasSigHiring, desc: 'Sales AE scaling and compliance directors.' },
    { label: 'Product Launch', active: hasSigProduct, desc: 'Developer portals and subscription releases.' },
    { label: 'Expansion Push', active: hasSigExpansion, desc: 'APAC sandbox sandboxes and regional offices.' },
    { label: 'Predictive Foresight', active: hasPredictions, desc: 'Calculated 30/60/90 day strategic forecasts.' },
    { label: 'Strategy Playbook', active: hasPlaybook, desc: 'Executive outreach recommendations.' }
  ];

  // Radar Chart Calculations for the 9 Business DNA Indices
  const radarMetrics = [
    { label: 'Innovation', val: twin.metrics.partnershipReadiness, color: 'var(--accent-blue)' },
    { label: 'Growth', val: twin.metrics.overallStrategicOpportunity, color: 'var(--accent-cyan)' },
    { label: 'Technology', val: twin.metrics.techAdoptionMomentum, color: 'var(--accent-cyan)' },
    { label: 'Cybersecurity', val: twin.metrics.cybersecurityMaturity, color: 'var(--accent-green)' },
    { label: 'Hiring', val: Math.round(twin.metrics.buyingIntent * 0.8), color: 'var(--accent-cyan)' },
    { label: 'Expansion', val: twin.metrics.expansionReadiness, color: 'var(--accent-green)' },
    { label: 'Funding', val: Math.round(twin.metrics.overallStrategicOpportunity * 0.9), color: 'var(--accent-cyan)' },
    { label: 'Risk', val: twin.metrics.regulatoryRisk, color: 'var(--accent-magenta)' },
    { label: 'Buying Intent', val: twin.metrics.buyingIntent, color: 'var(--accent-cyan)' }
  ];

  const cx = 155;
  const cy = 135;
  const r = 85;
  const numAxes = radarMetrics.length;

  const getCoordinates = (index: number, value: number) => {
    const angle = (index * (2 * Math.PI)) / numAxes - Math.PI / 2;
    const factor = value / 100;
    const x = cx + r * factor * Math.cos(angle);
    const y = cy + r * factor * Math.sin(angle);
    return { x, y };
  };

  const concentricLevels = [25, 50, 75, 100].map(level => {
    return Array.from({ length: numAxes }).map((_, i) => {
      const { x, y } = getCoordinates(i, level);
      return `${x},${y}`;
    }).join(' ');
  });

  const valuePathPoints = radarMetrics.map((m, i) => {
    const { x, y } = getCoordinates(i, m.val);
    return `${x},${y}`;
  }).join(' ');

  const labelPoints = radarMetrics.map((m, i) => {
    const angle = (i * (2 * Math.PI)) / numAxes - Math.PI / 2;
    const labelR = r + (m.label === 'Cybersecurity' || m.label === 'Buying Intent' ? 24 : 16);
    const x = cx + labelR * Math.cos(angle);
    const y = cy + (labelR - 4) * Math.sin(angle);
    return { label: m.label, x, y };
  });

  return (
    <div className="dashboard-grid">
      {/* Left Column: Twin Metrics & Trend Analysis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Opportunity DNA Card with Radar Chart Split */}
        <div className="cyber-card glow-cyan">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--accent-cyan)" />
              Opportunity DNA
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Click any bar to inspect Explainability Layer
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '310px 1fr', gap: '20px' }}>
            {/* Animated Radar Chart */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.12)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: '270px' }}>
              <svg viewBox="0 0 310 270" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.45" />
                  </radialGradient>
                </defs>

                {/* Concentric Polygons */}
                {concentricLevels.map((pts, idx) => (
                  <polygon
                    key={idx}
                    points={pts}
                    fill="none"
                    stroke="rgba(75,85,99,0.25)"
                    strokeWidth="1"
                    strokeDasharray={idx === 3 ? "none" : "2 2"}
                  />
                ))}

                {/* Axes */}
                {Array.from({ length: numAxes }).map((_, i) => {
                  const outer = getCoordinates(i, 100);
                  return (
                    <line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="rgba(75,85,99,0.3)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Radar Value Shape */}
                <polygon
                  points={valuePathPoints}
                  fill="url(#radarFill)"
                  stroke="var(--accent-cyan)"
                  strokeWidth="2.5"
                  style={{ transition: 'points 0.5s ease-in-out' }}
                />

                {/* Vertex Dots */}
                {radarMetrics.map((m, i) => {
                  const pt = getCoordinates(i, m.val);
                  return (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4"
                        fill="var(--bg-primary)"
                        stroke={m.color}
                        strokeWidth="2"
                      />
                      <title>{m.label}: {m.val}%</title>
                    </g>
                  );
                })}

                {/* Labels */}
                {labelPoints.map((lbl, i) => (
                  <text
                    key={i}
                    x={lbl.x}
                    y={lbl.y}
                    fill="var(--text-secondary)"
                    fontSize="8"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                  >
                    {lbl.label.toUpperCase()}
                  </text>
                ))}
              </svg>
            </div>

            {/* DNA Metrics Progress Bars */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', height: '270px', overflowY: 'auto' }}>
              {(Object.keys(metricMeta) as Array<keyof TwinMetrics>)
                .filter(k => k !== 'overallStrategicOpportunity')
                .map(key => {
                  const meta = metricMeta[key];
                  const value = twin.metrics[key];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={key}
                      onClick={() => handleMetricClick(key)}
                      style={{
                        cursor: 'pointer',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.01)',
                        border: '1px solid transparent',
                        transition: 'all 0.15s',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                      }}
                    >
                      <div className="metric-header" style={{ marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon size={13} color={meta.color} />
                          <span className="metric-label" style={{ fontSize: '11px' }}>{meta.label}</span>
                        </div>
                        <span className="metric-value" style={{ color: meta.color, fontSize: '11px' }}>{value}%</span>
                      </div>
                      <div className="metric-track" style={{ height: '4px' }}>
                        <div className="metric-fill" style={getMetricGlowStyle(key, value)} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Business Timeline (Line Chart & Strategic Pipeline Split) */}
        <div className="cyber-card glow-cyan">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', color: '#fff' }}>
                Business Timeline (Telemetry Trend Analysis)
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Plotting 6-Day Trend for:{' '}
                <strong style={{ color: metricMeta[selectedMetric].color }}>
                  {metricMeta[selectedMetric].label}
                </strong>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as keyof TwinMetrics)}
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {(Object.keys(metricMeta) as Array<keyof TwinMetrics>).map(k => (
                  <option key={k} value={k}>
                    {metricMeta[k].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'center' }}>
            {/* Left: Trend line chart */}
            <div style={{ padding: '10px 0' }}>{renderTrendChart()}</div>

            {/* Right: Vertical Business Timeline Pipeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', borderLeft: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Corporate Strategic Evolution Pipeline
              </span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                {timelineSteps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', position: 'relative' }}>
                    
                    {/* Circle Indicator */}
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: step.active ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                      border: `1.5px solid ${step.active ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      boxShadow: step.active ? '0 0 8px var(--accent-cyan)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      marginTop: '2px',
                      transition: 'all 0.3s'
                    }}>
                      {step.active && <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#fff' }} />}
                    </div>

                    {/* Text Details */}
                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: 600, color: step.active ? '#fff' : 'var(--text-muted)', transition: 'color 0.3s' }}>
                        {step.label} {step.active ? '⚡' : ''}
                      </div>
                      <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', display: 'block' }}>{step.desc}</span>
                    </div>

                    {/* Connector line */}
                    {idx < timelineSteps.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '6px',
                        top: '16px',
                        bottom: '-12px',
                        width: '1.5px',
                        backgroundColor: step.active && timelineSteps[idx+1].active ? 'var(--accent-cyan)' : 'rgba(75,85,99,0.15)',
                        zIndex: 1,
                        transition: 'background-color 0.3s'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Reasoning Graph, Signal Evidence Feed, AI recommendations, 30/60/90 Day Forecast */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Reasoning Graph */}
        <div className="cyber-card glow-cyan" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '14px', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} color="var(--accent-cyan)" />
            Reasoning Flow Graph
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(3,7,18,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '70px', textAlign: 'center' }}>
              <div style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>INPUT</div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 6px', fontSize: '10px', color: '#fff', fontWeight: 600, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Raw Data
              </div>
            </div>
            
            <svg width="20" height="15" viewBox="0 0 20 15">
              <path d="M 0 7.5 L 16 7.5 M 10 3.5 L 16 7.5 L 10 11.5" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.2" />
            </svg>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '85px', textAlign: 'center' }}>
              <div style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>COGNITIVE</div>
              <div style={{ backgroundColor: 'rgba(6,182,212,0.06)', border: '1.2px solid var(--accent-cyan)', borderRadius: '6px', padding: '4px 6px', fontSize: '10px', color: '#fff', fontWeight: 600, width: '100%', boxShadow: '0 0 6px rgba(6,182,212,0.1)' }}>
                NLP Classifier
              </div>
            </div>

            <svg width="20" height="15" viewBox="0 0 20 15">
              <path d="M 0 7.5 L 16 7.5 M 10 3.5 L 16 7.5 L 10 11.5" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.2" />
            </svg>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '85px', textAlign: 'center' }}>
              <div style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>MATRICES</div>
              <div style={{ backgroundColor: 'rgba(16,185,129,0.06)', border: '1.2px solid var(--accent-green)', borderRadius: '6px', padding: '4px 6px', fontSize: '10px', color: '#fff', fontWeight: 600, width: '100%', boxShadow: '0 0 6px rgba(16,185,129,0.1)' }}>
                Twin DNA
              </div>
            </div>
          </div>
        </div>

        {/* Signal Evidence Feed */}
        <div className="cyber-card glow-cyan" style={{ maxHeight: '230px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
            <h3 style={{ fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={14} color="var(--accent-cyan)" />
              Signal Evidence Feed
            </h3>
            <button
              onClick={() => onSelectTab('signals')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-cyan)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              FULL FEED <ChevronRight size={12} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {companySignals.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                Awaiting incoming signal telemetry...
              </div>
            ) : (
              companySignals.map(sig => (
                <div
                  key={sig.id}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '9.5px' }}>
                      {sig.source}
                    </span>
                    <span className={`cyber-badge ${
                      sig.businessImpact < 0 ? 'cyber-badge-magenta' : 'cyber-badge-green'
                    }`} style={{ fontSize: '9px', padding: '0px 4px' }}>
                      {sig.businessImpact >= 0 ? '+' : ''}
                      {sig.businessImpact}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{sig.title}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Strategic Recommendation */}
        <div className="cyber-card glow-cyan" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '14px', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--accent-cyan)" />
            AI Strategic Recommendation
          </h3>
          <div style={{ backgroundColor: 'rgba(6,182,212,0.03)', border: '1px solid rgba(6,182,212,0.1)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
              Target Outreach Angle
            </div>
            <div style={{ fontSize: '12px', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>
              {playbook?.outreachAngle || 'Securing Cloud Database Ingest Pipelines'}
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {playbook?.executiveSummary || 'Target is scaling developer teams to deploy large multi-tenant data layers, offering a high-priority integration window.'}
            </p>
          </div>
        </div>

        {/* 30/60/90 Day Forecast */}
        <div className="cyber-card glow-cyan" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '14px', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="var(--accent-cyan)" />
            30/60/90 Day Forecast
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
            {[
              {
                day: '30 DAYS',
                title: predictions[0]?.title || 'API Gateway Security Audit',
                desc: predictions[0]?.predictedAction || 'Audit all public OAuth endpoints to block token leaks.',
                prob: predictions[0]?.confidence || 94,
                color: 'var(--accent-cyan)'
              },
              {
                day: '60 DAYS',
                title: predictions[1]?.title || 'compliance Audit Integration',
                desc: predictions[1]?.predictedAction || 'Align datasets with upcoming global compliance frameworks.',
                prob: predictions[1]?.confidence || 88,
                color: 'var(--accent-green)'
              },
              {
                day: '90 DAYS',
                title: 'Infrastructure Unification',
                desc: 'Consolidate multi-cloud Kubernetes telemetry logs and patch kernel sensor agents.',
                prob: 75,
                color: 'var(--accent-blue)'
              }
            ].map((fore, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: fore.color, fontWeight: 700 }}>
                    {fore.day}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Prob: <strong style={{ color: '#fff' }}>{fore.prob}%</strong>
                  </span>
                </div>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{fore.title}</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{fore.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* EXPLAINABILITY DRAWER overlay */}
      {isExplainDrawerOpen && (
        <>
          <div className="modal-overlay" onClick={() => setIsExplainDrawerOpen(false)} />
          <div className="explainability-drawer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', color: '#fff' }}>Explainability Audit</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  PulseForge AI Reasoning Protocol
                </span>
              </div>
              <button
                onClick={() => setIsExplainDrawerOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                CLOSE
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Metric header card */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {React.createElement(metricMeta[selectedMetric].icon, { size: 18, color: metricMeta[selectedMetric].color })}
                  <h4 style={{ fontSize: '15px', color: '#fff' }}>{metricMeta[selectedMetric].label}</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {metricMeta[selectedMetric].desc}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Living Index Rating:</span>
                  <span style={{ fontSize: '18px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: metricMeta[selectedMetric].color }}>
                    {twin.metrics[selectedMetric]}%
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px' }}>
                    <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>CONFIDENCE</div>
                    <div style={{ fontSize: '14px', color: metricMeta[selectedMetric].color, fontFamily: 'var(--font-mono)' }}>{metricConfidence}%</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px' }}>
                    <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>EVIDENCE COUNT</div>
                    <div style={{ fontSize: '14px', color: '#fff', fontFamily: 'var(--font-mono)' }}>{metricEvidenceCount}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  AI Reasoning Tree
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {reasoningTree.map((node, idx) => (
                    <div key={node.label} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '8px', alignItems: 'center' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid rgba(6,182,212,0.4)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>{idx + 1}</div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '7px', padding: '8px 10px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{node.label}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{node.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aggregation Trace */}
              <div>
                <h4 style={{ fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  Active Telemetry Aggregation Trace
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeExplanations.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      No modifying network signals detected. Index holding at historical baseline rating.
                    </div>
                  ) : (
                    activeExplanations.map((exp, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.03)',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            Signal Trace #{idx+1}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 600,
                            color: exp.impact >= 0 ? 'var(--accent-green)' : 'var(--accent-magenta)'
                          }}>
                            {exp.impact >= 0 ? '+' : ''}{exp.impact}% impact
                          </span>
                        </div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                          {exp.signalTitle}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {exp.effect}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
              <button
                onClick={() => {
                  setIsExplainDrawerOpen(false);
                  onSelectTab('signals');
                }}
                className="cyber-btn cyber-btn-accent"
                style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
              >
                OPEN TELEMETRY COMMAND CONSOLE
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
