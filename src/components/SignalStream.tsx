import React, { useState, useEffect } from 'react';
import { Send, Filter, HelpCircle, Terminal, BookOpen, ExternalLink, Activity } from 'lucide-react';
import { ClassifiedSignal, SignalCategory, UrgencyLevel } from '../agents/types';

interface SignalStreamProps {
  signals: ClassifiedSignal[];
  onInjectSignal: (companyId: string, title: string, content: string, source: string) => void;
  companies: { id: string; name: string }[];
}

export const SignalStream: React.FC<SignalStreamProps> = ({
  signals,
  onInjectSignal,
  companies
}) => {
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

  // Selected Signal State
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [lastInjectedTitle, setLastInjectedTitle] = useState<string | null>(null);

  // Manual injection states
  const [injectCompany, setInjectCompany] = useState(companies[0]?.id || '');
  const [injectTitle, setInjectTitle] = useState('');
  const [injectContent, setInjectContent] = useState('');
  const [injectSource, setInjectSource] = useState('LinkedIn Post');

  const categories: { value: SignalCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'hiring', label: 'Hiring' },
    { value: 'expansion', label: 'Expansion' },
    { value: 'funding', label: 'Funding' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'product_launch', label: 'Product Launch' },
    { value: 'cybersecurity', label: 'Cybersecurity' },
    { value: 'regulation', label: 'Regulation' },
    { value: 'supply_chain', label: 'Supply Chain' },
    { value: 'tech_adoption', label: 'Tech Adoption' },
    { value: 'competitive_threat', label: 'Competitive Threat' }
  ];

  const urgencies: (UrgencyLevel | 'all')[] = ['all', 'low', 'medium', 'high', 'critical'];

  // Auto-select newly injected signal once it arrives in props
  useEffect(() => {
    if (lastInjectedTitle) {
      const found = signals.find(s => s.title === lastInjectedTitle);
      if (found) {
        setSelectedSignalId(found.id);
        setLastInjectedTitle(null);
      }
    }
  }, [signals, lastInjectedTitle]);

  const handleInjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!injectTitle || !injectContent || !injectSource) return;
    setLastInjectedTitle(injectTitle);
    onInjectSignal(injectCompany, injectTitle, injectContent, injectSource);
    setInjectTitle('');
    setInjectContent('');
  };

  const getUrgencyBadge = (level: UrgencyLevel) => {
    switch (level) {
      case 'critical':
        return 'cyber-badge-magenta';
      case 'high':
        return 'cyber-badge-amber';
      case 'medium':
        return 'cyber-badge-blue';
      default:
        return 'cyber-badge-cyan';
    }
  };

  const getAffectedMetrics = (category: string) => {
    switch (category) {
      case 'hiring':
        return 'Buying Intent, Expansion Readiness';
      case 'cybersecurity':
        return 'Cybersecurity Maturity, Regulatory Audit Risk';
      case 'regulation':
        return 'Regulatory Audit Risk';
      case 'supply_chain':
        return 'Expansion Readiness, Vendor Requirement Prob.';
      case 'partnership':
        return 'Partnership Readiness, Overall Strategic Score';
      case 'tech_adoption':
        return 'Tech Adoption Momentum';
      default:
        return 'Overall Strategic Score';
    }
  };

  const getPredictedOutcome = (category: string, compName: string) => {
    switch (category) {
      case 'hiring':
        return `${compName} will expand regional execution loops and initiate pilot program rollouts.`;
      case 'cybersecurity':
        return `Mandatory patch cycles and system access keys rotation, temporarily lowering compliance readiness scores.`;
      case 'regulation':
        return `Legal briefs alignment and mandatory training logs audits within the next 90 days.`;
      case 'partnership':
        return `Joint technical integration rollout accelerating mutual workspace synergy.`;
      default:
        return `Operational adjustments to support the strategic roadmap.`;
    }
  };

  const getRecommendedAction = (category: string) => {
    switch (category) {
      case 'hiring':
        return 'Dispatch B2B partnership proposal targeting the incoming VP team leads.';
      case 'cybersecurity':
        return 'Overhaul authentication tokens and deploy strict gateway firewalls.';
      case 'regulation':
        return 'Initiate compliance logging logs audit for algorithmic transparency.';
      default:
        return 'Schedule a technical synchronization sync to discuss joint endpoints.';
    }
  };

  const filteredSignals = signals
    .filter(s => {
      const matchComp = filterCompany === 'all' || s.companyId === filterCompany;
      const matchCat = filterCategory === 'all' || s.category === filterCategory;
      const matchUrg = filterUrgency === 'all' || s.urgency === filterUrgency;
      return matchComp && matchCat && matchUrg;
    })
    .slice()
    .reverse();

  const selectedSignal = signals.find(s => s.id === selectedSignalId);
  const selectedComp = selectedSignal ? companies.find(c => c.id === selectedSignal.companyId) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      {/* Left Column: Scrolling Signals Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden', height: '100%' }}>
        {/* Filters */}
        <div className="cyber-card glow-cyan" style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Filter size={14} color="var(--accent-cyan)" />
            <span>Filters:</span>
          </div>

          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {urgencies.map(u => (
              <option key={u} value={u}>
                {u === 'all' ? 'All Urgencies' : `${u.charAt(0).toUpperCase() + u.slice(1)} Urgency`}
              </option>
            ))}
          </select>

          <span style={{ marginLeft: 'auto', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Showing {filteredSignals.length} captures
          </span>
        </div>

        {/* Scrolling list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
          {filteredSignals.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              textAlign: 'center',
              height: '200px',
              border: '1px dashed var(--border-color)',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.01)'
            }}>
              <HelpCircle size={32} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No signals match active filters. Inject a signal to populate the stream.
              </span>
            </div>
          ) : (
            filteredSignals.map((sig) => {
              const comp = companies.find(c => c.id === sig.companyId);
              const isSelected = selectedSignalId === sig.id;
              return (
                <div
                  key={sig.id}
                  onClick={() => setSelectedSignalId(sig.id)}
                  className="cyber-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.04)' : 'rgba(255,255,255,0.01)',
                    boxShadow: isSelected ? '0 0 15px rgba(6, 182, 212, 0.12)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  {/* Top Bar info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: '9.5px' }}>
                        {comp?.name || sig.companyId}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {sig.source}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`cyber-badge ${getUrgencyBadge(sig.urgency)}`} style={{ fontSize: '9.5px' }}>
                        {sig.urgency} Urgency
                      </span>
                      <span className={`cyber-badge ${
                        sig.businessImpact < 0 ? 'cyber-badge-magenta' : 'cyber-badge-green'
                      }`} style={{ fontSize: '9.5px' }}>
                        {sig.businessImpact >= 0 ? '+' : ''}
                        {sig.businessImpact} Impact
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(sig.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description with expanded spacing */}
                  <div>
                    <h4 style={{ fontSize: '14.5px', color: '#fff', fontWeight: 600, marginBottom: '6px', lineHeight: '1.3' }}>
                      {sig.title}
                    </h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.45', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {sig.content}
                    </p>
                  </div>

                  {/* Classifier Trace Snippet */}
                  <div style={{
                    backgroundColor: 'rgba(3,7,18,0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.02)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '10.5px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)'
                  }}>
                    <span>🤖 CLASSIFIER AGENT SYNCED</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>Confidence: {sig.confidence}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Split into Analysis Panel (Top) and Form (Bottom) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
        
        {/* TOP: Signal Analysis Panel */}
        <div className="cyber-card glow-cyan" style={{ display: 'flex', flexDirection: 'column', minHeight: '380px', maxHeight: '500px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '12px' }}>
            <Activity size={16} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '14.5px', color: '#fff', margin: 0 }}>Signal Analysis Detail</h3>
          </div>

          {!selectedSignal ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              <BookOpen size={28} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <p style={{ fontSize: '12.5px', margin: 0 }}>
                Select a signal to inspect intelligence details
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Headline Event</span>
                <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 600, margin: '4px 0 0 0', lineHeight: '1.3' }}>
                  {selectedSignal.title}
                </h4>
              </div>

              <div>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Extracted Telemetry Description</span>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.45' }}>
                  {selectedSignal.content}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px', padding: '8px' }}>
                <div>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>COMPANY</span>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '11px' }}>{selectedComp?.name || selectedSignal.companyId}</div>
                </div>
                <div>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SOURCE NODE</span>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '11px' }}>{selectedSignal.source}</div>
                </div>
                <div>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CATEGORY</span>
                  <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '11px' }}>{selectedSignal.category.toUpperCase()}</div>
                </div>
                <div>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>URGENCY</span>
                  <div style={{ fontWeight: 600, color: 'var(--accent-amber)', fontSize: '11px' }}>{selectedSignal.urgency.toUpperCase()}</div>
                </div>
                <div>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONFIDENCE RATING</span>
                  <div style={{ fontWeight: 600, color: 'var(--accent-green)', fontSize: '11px' }}>{selectedSignal.confidence}%</div>
                </div>
                <div>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>IMPACT WEIGHT</span>
                  <div style={{ fontWeight: 600, color: selectedSignal.businessImpact >= 0 ? 'var(--accent-green)' : 'var(--accent-magenta)', fontSize: '11px' }}>
                    {selectedSignal.businessImpact >= 0 ? '+' : ''}{selectedSignal.businessImpact}
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Affected Business Twin Metrics</span>
                <p style={{ fontSize: '12px', color: '#fff', margin: '2px 0 0 0', fontWeight: 500 }}>
                  ⚡ {getAffectedMetrics(selectedSignal.category)}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Classifier Agent Reasoning</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontStyle: 'italic', lineHeight: '1.4' }}>
                  "{selectedSignal.reasoning}"
                </p>
              </div>

              <div>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Predicted Business Outcome</span>
                <p style={{ fontSize: '12px', color: '#fff', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                  🔮 {getPredictedOutcome(selectedSignal.category, selectedComp?.name || selectedSignal.companyId)}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recommended Next Action</span>
                <p style={{ fontSize: '12px', color: 'var(--accent-cyan)', margin: '4px 0 0 0', fontWeight: 600, lineHeight: '1.4' }}>
                  🎯 {getRecommendedAction(selectedSignal.category)}
                </p>
              </div>

              {selectedSignal.url && (
                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '8px', marginTop: '4px' }}>
                  <a
                    href={selectedSignal.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '11px', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onMouseEnter={(e)=>e.currentTarget.style.textDecoration='underline'}
                    onMouseLeave={(e)=>e.currentTarget.style.textDecoration='none'}
                  >
                    <ExternalLink size={11} /> Read Source Document
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM: Analyze New Signal / Ingest Form */}
        <div className="cyber-card glow-cyan" style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Terminal size={15} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '14.5px', color: '#fff', margin: 0 }}>Analyze New Signal</h3>
          </div>

          <form onSubmit={handleInjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Corporate Target
              </label>
              <select
                value={injectCompany}
                onChange={(e) => setInjectCompany(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  padding: '6px 8px',
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Source Node
              </label>
              <input
                type="text"
                value={injectSource}
                onChange={(e) => setInjectSource(e.target.value)}
                placeholder="e.g. SEC Filing, Reddit, Press Release"
                required
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  padding: '6px 8px',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Raw Title / Headline
              </label>
              <input
                type="text"
                value={injectTitle}
                onChange={(e) => setInjectTitle(e.target.value)}
                placeholder="e.g. NVIDIA releases Blackwell platform"
                required
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  padding: '6px 8px',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Extracted content details
              </label>
              <textarea
                value={injectContent}
                onChange={(e) => setInjectContent(e.target.value)}
                placeholder="Input scraping details. NLP Classifier will execute tag categorizations, assign weights, and re-calculate scores."
                required
                style={{
                  width: '100%',
                  minHeight: '75px',
                  maxHeight: '100px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  padding: '8px',
                  fontSize: '12px',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: '1.4'
                }}
              />
            </div>

            <button
              type="submit"
              className="cyber-btn-accent"
              style={{
                width: '100%',
                padding: '8px',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                gap: '6px',
                marginTop: '4px'
              }}
            >
              <Send size={12} />
              ANALYZE SIGNAL
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
