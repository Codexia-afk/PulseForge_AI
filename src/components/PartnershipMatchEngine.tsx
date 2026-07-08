import React, { useState, useRef } from 'react';
import { Sparkles, Check, Copy, ArrowRight, ShieldAlert, Cpu, Layers, ExternalLink, Globe, Search, BookOpen, AlertTriangle } from 'lucide-react';
import { MatchRecommendation } from '../agents/types';
import { generateDemoMatches } from '../agents/mockRealCompanies';
import { apiUrl, fetchWithTimeout } from '../lib/api';

interface PartnershipMatchEngineProps {
  mode: 'realworld' | 'demo';
  onDeployTwin: (companyId: string, matchedTwinData?: any) => void;
  userProfile: any;
  setUserProfile: (profile: any) => void;
  backendHealthy: boolean;
  backendWarnings: string[];
}

export const PartnershipMatchEngine: React.FC<PartnershipMatchEngineProps> = ({
  mode,
  onDeployTwin,
  userProfile,
  setUserProfile,
  backendHealthy,
  backendWarnings
}) => {
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    website: userProfile?.website || '',
    industry: userProfile?.industry || '',
    product_service: userProfile?.product_service || '',
    target_customer: userProfile?.target_customer || '',
    target_region: userProfile?.target_region || '',
    partnership_goal: userProfile?.partnership_goal || '',
    ideal_partner_type: userProfile?.ideal_partner_type || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [matches, setMatches] = useState<MatchRecommendation[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchRecommendation | null>(null);
  const [activeTab, setActiveTab] = useState<'rec' | 'outreach' | 'evidence'>('rec');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedFitKey, setSelectedFitKey] = useState<string | null>(null);

  const presets = [
    {
      label: 'Biotech & mRNA drug discovery',
      data: {
        name: 'GenVax AI',
        website: 'genvax.ai',
        industry: 'Biotech & AI Drug Discovery',
        product_service: 'GPU-accelerated mRNA vaccine sequence modeling and clinical trials optimization platform',
        target_customer: 'Pharma companies, academic labs, vaccine manufacturing nodes',
        target_region: 'Global',
        partnership_goal: 'Scale clinical trials distribution, run FDA compliance logs audits, and optimize GPU model workloads',
        ideal_partner_type: 'Biotech companies, medical networks, cloud compute providers'
      }
    },
    {
      label: 'VoltGrid Utility Battery systems',
      data: {
        name: 'VoltGrid Power',
        website: 'voltgrid.energy',
        industry: 'CleanTech & Energy Storage',
        product_service: 'High-density LFP utility storage modules with SCADA cloud tracking and harmonic filter controls',
        target_customer: 'State grid utilities, commercial solar farms, municipal energy boards',
        target_region: 'North America',
        partnership_goal: 'Secure commercial Megapack battery storage supply contracts and integrate SCADA telemetry systems',
        ideal_partner_type: 'Battery manufacturers, EV makers, utility administrators'
      }
    },
    {
      label: 'eBPF Kubernetes security',
      data: {
        name: 'KernSec Systems',
        website: 'kernsec.io',
        industry: 'DevSecOps & Cybersecurity',
        product_service: 'Real-time eBPF container kernel threat monitoring agents with automated Active Directory scanning',
        target_customer: 'Fortune 500 Kubernetes platforms, banking cloud networks, public SaaS providers',
        target_region: 'US & EU',
        partnership_goal: 'Find distribution partners for security integration and scale identity threat telemetry coverage',
        ideal_partner_type: 'Endpoint security leaders, cloud hosts, security compliance consultants'
      }
    },
    {
      label: 'FlexPay subscription billing',
      data: {
        name: 'FlexPay APIs',
        website: 'flexpay.co',
        industry: 'Financial Technology',
        product_service: 'Multi-tenant automated tax & billing subscription API with automated tax compliance tracking',
        target_customer: 'SaaS platforms, AI model API developer portals, ecommerce networks',
        target_region: 'Global',
        partnership_goal: 'Find payment gateway integration alliances and power billing frameworks for developer AI APIs',
        ideal_partner_type: 'Financial infrastructure providers, payment hubs, enterprise billing networks'
      }
    }
  ];

  const handleApplyPreset = (preset: any) => {
    setFormData(preset.data);
    setUserProfile(preset.data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setUserProfile(updated);
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingIntervalRef = useRef<any>(null);

  const runSearchLogs = [
    "Signal Collector: querying public sources",
    "Evidence Validator: filtering weak/off-target signals",
    "Intent Analyzer: classifying buying, hiring, risk and partnership intent",
    "Business Twin Builder: recalculating fit dimensions",
    "Decision Engine: generating evidence-backed recommendations",
    "Action Generator: preparing outreach payloads"
  ];

  const handleCancelMatch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
    }
    setErrorMessage("Live sources unavailable. Switch to Presentation Mode or retry.");
  };

  const handleRunMatchEngine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.industry) return;

    setIsLoading(true);
    setLoadingStep(0);
    setSelectedMatch(null);
    setErrorMessage(null);

    // Set up AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Simulate logs progress loop
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < runSearchLogs.length) {
        setLoadingStep(step);
      }
    }, 1000);
    loadingIntervalRef.current = interval;

    try {
      if (mode === 'realworld') {
        if (!backendHealthy) {
          throw new Error("FastAPI backend offline.");
        }
        
        // Query Python FastAPI backend
        const response = await fetchWithTimeout(apiUrl('/api/find-partners'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          signal: controller.signal
        }, 15000);
        
        if (response.ok) {
          const result = await response.json();
          setMatches(result.matches);
          if (result.matches.length > 0) {
            setSelectedMatch(result.matches[0]);
          }
        } else {
          throw new Error(`Server returned error status ${response.status}`);
        }
      } else {
        // Offline demo fallback matches
        const demoResults = generateDemoMatches(formData);
        // Add artificial delay for aesthetic scanning effect
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, 3000);
          controller.signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new Error("aborted"));
          });
        });
        setMatches(demoResults);
        if (demoResults.length > 0) {
          setSelectedMatch(demoResults[0]);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'aborted') {
        console.log("Match scan aborted by user.");
        setErrorMessage("Scanning cancelled.");
      } else {
        console.error("Failed connecting to matching endpoint:", err);
        setErrorMessage("Live sources unavailable. Switch to Presentation Mode or retry.");
        setMatches([]);
      }
    } finally {
      clearInterval(interval);
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getSelectedFitDetails = () => {
    if (!selectedMatch || !selectedFitKey) return null;
    switch (selectedFitKey) {
      case 'business':
        return {
          label: 'Business Fit',
          val: selectedMatch.businessFit,
          weight: '25%',
          contribution: ((selectedMatch.businessFit * 25) / 100).toFixed(1),
          explanation: selectedMatch.businessFitExplanation || 'Evaluates industry relevance and product synergies.',
        };
      case 'tech':
        return {
          label: 'Technology Compatibility',
          val: selectedMatch.techFit,
          weight: '20%',
          contribution: ((selectedMatch.techFit * 20) / 100).toFixed(1),
          explanation: selectedMatch.techFitExplanation || 'Evaluates tech stack integration and API endpoint synergy.',
        };
      case 'market':
        return {
          label: 'Market Alignment',
          val: selectedMatch.marketFit,
          weight: '20%',
          contribution: ((selectedMatch.marketFit * 20) / 100).toFixed(1),
          explanation: selectedMatch.marketFitExplanation || 'Evaluates customer segment overlap and Fortune 500 audience.',
        };
      case 'growth':
        return {
          label: 'Growth Alignment',
          val: selectedMatch.growthAlignment,
          weight: '15%',
          contribution: ((selectedMatch.growthAlignment * 15) / 100).toFixed(1),
          explanation: selectedMatch.growthAlignmentExplanation || 'Evaluates dynamic expansion rate indices alignment.',
        };
      case 'hiring':
        return {
          label: 'Hiring Similarity',
          val: selectedMatch.hiringSimilarity || 50,
          weight: '10%',
          contribution: (((selectedMatch.hiringSimilarity || 50) * 10) / 100).toFixed(1),
          explanation: selectedMatch.hiringSimilarityExplanation || 'Evaluates hiring velocities and recruiter campaigns.',
        };
      case 'region':
        return {
          label: 'Regional Compatibility',
          val: selectedMatch.geographicFit,
          weight: '5%',
          contribution: ((selectedMatch.geographicFit * 5) / 100).toFixed(1),
          explanation: selectedMatch.geographicFitExplanation || 'Evaluates headquarters locations and target expansion regions.',
        };
      case 'cyber':
        return {
          label: 'Cybersecurity Compatibility',
          val: selectedMatch.cybersecurityCompatibility || 70,
          weight: '5%',
          contribution: (((selectedMatch.cybersecurityCompatibility || 70) * 5) / 100).toFixed(1),
          explanation: selectedMatch.cybersecurityCompatibilityExplanation || 'Evaluates cybersecurity auditing and compliance.',
        };
      default:
        return null;
    }
  };
  const selectedFitDetails = getSelectedFitDetails();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      {/* Top Banner: Enterprise Intelligence Status / Presentation Workspace */}
      <div className={`cyber-card ${mode === 'realworld' ? 'glow-green' : 'glow-cyan'}`} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: mode === 'realworld' ? 'var(--accent-green)' : 'var(--accent-cyan)',
            boxShadow: `0 0 10px ${mode === 'realworld' ? 'var(--accent-green)' : 'var(--accent-cyan)'}`
          }} />
          {mode === 'realworld' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                LIVE INTELLIGENCE STATUS
              </span>
              <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                <span>Tavily <strong style={{ color: 'var(--accent-green)' }}>✓</strong></span>
                <span>NewsAPI <strong style={{ color: 'var(--accent-green)' }}>✓</strong></span>
                <span>Website Crawl <strong style={{ color: 'var(--accent-green)' }}>✓</strong></span>
                <span>RSS <strong style={{ color: 'var(--accent-green)' }}>✓</strong></span>
                <span>Evidence Gate <strong style={{ color: 'var(--accent-green)' }}>✓</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
                <span>Mode: <strong style={{ color: '#fff' }}>Live + Fallback</strong></span>
                <span>Timeout: <strong style={{ color: '#fff' }}>15s</strong></span>
                <span>Quality Gate: <strong style={{ color: '#fff' }}>62+</strong></span>
              </div>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                Presentation Workspace
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                Using cached intelligence for offline demonstrations.
              </span>
            </div>
          )}
        </div>
        {mode === 'realworld' && !backendHealthy && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--accent-magenta)', backgroundColor: 'rgba(236,72,153,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(236,72,153,0.2)', flexShrink: 0 }}>
            <ShieldAlert size={13} />
            <span>FastAPI Backend Offline. Falling back to cached data.</span>
          </div>
        )}
        {mode === 'realworld' && backendHealthy && backendWarnings.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--accent-amber)', backgroundColor: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)', flexShrink: 0 }}>
            <AlertTriangle size={13} />
            <span>Missing API keys: {backendWarnings.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Main Workspace Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Column: Business Profile Form & Presets */}
        <div className="cyber-card glow-cyan" style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', padding: '20px' }}>
          <div>
            <h3 style={{ fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--accent-cyan)" />
              My Corporate Profile
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Configure your business details to evaluate synergy alignment
            </span>
          </div>

          {/* Quick Presets Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Quick Preset Fill
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    fontSize: '11px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleRunMatchEngine} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>My Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. GenVax AI"
                  required
                  style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', padding: '8px 10px', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="e.g. genvax.ai"
                  style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', padding: '8px 10px', fontSize: '12px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Industry Segment</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                placeholder="e.g. Biotech & mRNA Therapeutics"
                required
                style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', padding: '8px 10px', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Core Product or Service</label>
              <textarea
                name="product_service"
                value={formData.product_service}
                onChange={handleInputChange}
                rows={2}
                placeholder="Describe your primary product offering..."
                style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', padding: '8px 10px', fontSize: '12px', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Target Customer</label>
                <input
                  type="text"
                  name="target_customer"
                  value={formData.target_customer}
                  onChange={handleInputChange}
                  placeholder="e.g. Big Pharma labs"
                  style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', padding: '8px 10px', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Target Region</label>
                <input
                  type="text"
                  name="target_region"
                  value={formData.target_region}
                  onChange={handleInputChange}
                  placeholder="e.g. Global"
                  style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', padding: '8px 10px', fontSize: '12px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Strategic Partnership Goal</label>
              <input
                type="text"
                name="partnership_goal"
                value={formData.partnership_goal}
                onChange={handleInputChange}
                placeholder="e.g. Scale clinical trial distribution"
                style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', padding: '8px 10px', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Ideal Partner Profile</label>
              <input
                type="text"
                name="ideal_partner_type"
                value={formData.ideal_partner_type}
                onChange={handleInputChange}
                placeholder="e.g. BioTech manufacturers"
                style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', padding: '8px 10px', fontSize: '12px' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.industry}
              className="cyber-btn cyber-btn-accent"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                gap: '8px',
                marginTop: '10px',
                cursor: (isLoading || !formData.name || !formData.industry) ? 'not-allowed' : 'pointer'
              }}
            >
              <Cpu size={14} className={isLoading ? "spin-animation" : ""} />
              {isLoading ? "RUNNING MATCH ALGORITHMS..." : "RUN PARTNERSHIP MATCH ENGINE"}
            </button>
          </form>
        </div>

        {/* Right Column: Search Logs, Match Results, and Dossier Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>
          
          {errorMessage && (
            <div className="cyber-card glow-magenta" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'rgba(236,72,153,0.06)', border: '1.5px solid var(--accent-magenta)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                <ShieldAlert size={16} color="var(--accent-magenta)" />
                <span>Scanning Protocol Alert</span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                {errorMessage}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="cyber-card glow-cyan" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <Cpu size={40} color="var(--accent-cyan)" className="spin-animation" />
                <h3 style={{ fontSize: '16px', color: '#fff', fontFamily: 'var(--font-header)' }}>Strategic Scanning Protocol Active</h3>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>MODE: {mode.toUpperCase()}</span>
                <div style={{ width: '260px', height: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round(((loadingStep + 1) / runSearchLogs.length) * 100)}%`, height: '100%', backgroundColor: 'var(--accent-cyan)', transition: 'width 0.25s ease' }} />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{Math.round(((loadingStep + 1) / runSearchLogs.length) * 100)}%</span>
              </div>
              
              <div style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid var(--border-color)',
                height: '140px',
                overflowY: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                color: 'var(--text-secondary)'
              }}>
                {runSearchLogs.slice(0, loadingStep + 1).map((log, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '18px 1fr 48px', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--accent-cyan)' }}>&gt;</span>
                    <span>{log}</span>
                    <span style={{ color: idx === loadingStep ? 'var(--accent-cyan)' : 'var(--accent-green)', fontSize: '10px', textAlign: 'right' }}>
                      {idx === loadingStep ? `${idx + 1}.0s` : 'done'}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCancelMatch}
                className="cyber-btn"
                style={{
                  marginTop: '10px',
                  padding: '8px 20px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  borderColor: 'var(--accent-magenta)',
                  color: 'var(--accent-magenta)',
                  cursor: 'pointer'
                }}
              >
                CANCEL SCAN
              </button>
            </div>
          )}

          {!isLoading && matches.length === 0 && (
            <div className="cyber-card glow-cyan" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Search size={40} style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Awaiting Business Profile Scan
              </h3>
              <p style={{ fontSize: '12.5px', maxWidth: '350px', lineHeight: '1.4' }}>
                Fill in your company details on the left, select a quick preset, and launch the match engine to identify strategic real-world fits.
              </p>
            </div>
          )}

          {!isLoading && matches.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', flex: 1, overflow: 'hidden' }}>
              
              {/* Match Listings */}
              <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', padding: '12px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  Ranked Match Fits ({matches.length})
                </span>
                
                {matches.map((match) => {
                  const isSel = selectedMatch?.companyId === match.companyId;
                  return (
                    <div
                      key={match.companyId}
                      onClick={() => setSelectedMatch(match)}
                      style={{
                        backgroundColor: isSel ? 'rgba(6, 182, 212, 0.06)' : 'rgba(255,255,255,0.01)',
                        border: isSel ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSel) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSel) e.currentTarget.style.borderColor = 'var(--border-color)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: 'var(--accent-cyan)'
                          }}>
                            {match.logo}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#fff' }}>{match.companyName}</div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{match.ticker}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {match.compatibilityScore}%
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '6px' }}>
                        <span>Ready: <strong style={{ color: 'var(--accent-green)' }}>{match.partnershipReadiness}</strong></span>
                        <span>Risk: <strong style={{ color: match.riskLevel === 'Critical' ? 'var(--accent-magenta)' : 'var(--accent-amber)' }}>{match.riskLevel}</strong></span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        <span>Evidence: <strong style={{ color: '#fff' }}>{match.evidence?.length || 0}</strong></span>
                        <span>Confidence: <strong style={{ color: 'var(--accent-cyan)' }}>{match.confidenceScore}%</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dossier Detail Panel */}
              <div className="cyber-card glow-cyan" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
                {selectedMatch && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
                    
                    {/* Header */}
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                          border: '1.5px solid var(--accent-cyan)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 700,
                          color: 'var(--accent-cyan)'
                        }}>
                          {selectedMatch.logo}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: 700 }}>{selectedMatch.companyName}</h3>
                            <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: '9px' }}>{selectedMatch.ticker}</span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{selectedMatch.industry}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onDeployTwin(selectedMatch.companyId, selectedMatch)}
                        className="cyber-btn cyber-btn-accent"
                        style={{ padding: '6px 12px', fontSize: '11px', fontFamily: 'var(--font-mono)', gap: '4px' }}
                      >
                        OPEN BUSINESS TWIN <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* Compatibility Fit Vector Meters */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
                      <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Fit Parameters (Click any parameter to audit contributions)
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px' }}>
                        {[
                          { key: 'business', label: 'Business Fit', val: selectedMatch.businessFit, color: 'var(--accent-cyan)' },
                          { key: 'tech', label: 'Tech Fit', val: selectedMatch.techFit, color: 'var(--accent-green)' },
                          { key: 'market', label: 'Market Fit', val: selectedMatch.marketFit, color: 'var(--accent-blue)' },
                          { key: 'growth', label: 'Growth Align', val: selectedMatch.growthAlignment, color: 'var(--accent-amber)' },
                          { key: 'hiring', label: 'Hiring Sim.', val: selectedMatch.hiringSimilarity || 50, color: 'var(--accent-cyan)' },
                          { key: 'region', label: 'Region Fit', val: selectedMatch.geographicFit, color: 'var(--accent-green)' },
                          { key: 'cyber', label: 'Cyber Fit', val: selectedMatch.cybersecurityCompatibility || 70, color: 'var(--accent-blue)' }
                        ].map((fit, idx) => {
                          const isSel = selectedFitKey === fit.key;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedFitKey(isSel ? null : fit.key)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '6px',
                                backgroundColor: isSel ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                                border: isSel ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                                transition: 'all 0.15s'
                              }}
                            >
                              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{fit.label}</span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: fit.color }}>{fit.val}%</span>
                              <div style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1px' }}>
                                <div style={{ height: '100%', width: `${fit.val}%`, backgroundColor: fit.color }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fit Explainability Drawer */}
                    {selectedFitDetails && (
                      <div className="cyber-card glow-cyan" style={{ padding: '12px 16px', backgroundColor: 'rgba(6, 182, 212, 0.02)', border: '1px solid rgba(6, 182, 212, 0.15)', borderRadius: '8px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                            Fit Score Breakdown: {selectedFitDetails.label}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Contributing Weight: <strong style={{ color: '#fff' }}>{selectedFitDetails.weight}</strong>
                          </span>
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#fff', lineHeight: '1.4', marginBottom: '8px' }}>
                          {selectedFitDetails.explanation}
                        </p>
                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                          <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                            Calculated Contribution Path
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {selectedFitDetails.val}% (Score) × {selectedFitDetails.weight} (Weight) = <strong style={{ color: 'var(--accent-cyan)' }}>{selectedFitDetails.contribution}%</strong> added to overall score.
                          </span>
                        </div>
                        {selectedMatch.evidence && selectedMatch.evidence.length > 0 && (
                          <div style={{ marginTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                            <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                              Supporting Scraped Evidence snippet
                            </span>
                            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                              "{selectedMatch.evidence[0]?.snippet || 'Public filings telemetry.'}"
                            </p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                              <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: '9px' }}>QUALITY {selectedMatch.evidence[0]?.qualityScore || selectedMatch.evidence[0]?.confidence || 0}</span>
                              <span className="cyber-badge cyber-badge-green" style={{ fontSize: '9px' }}>IMPACT {selectedMatch.evidence[0]?.impact ?? 'n/a'}</span>
                              <span className="cyber-badge cyber-badge-amber" style={{ fontSize: '9px' }}>METRIC {selectedMatch.evidence[0]?.metricAffected || selectedMatch.evidence[0]?.category}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                      {[
                        { id: 'rec', label: 'AI Recommendation', icon: Sparkles },
                        { id: 'evidence', label: `Verified Evidence (${selectedMatch.evidence.length})`, icon: BookOpen },
                        { id: 'outreach', label: 'Outreach Generator', icon: Cpu }
                      ].map((t) => {
                        const Icon = t.icon;
                        const isAct = activeTab === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            style={{
                              border: 'none',
                              background: 'none',
                              borderBottom: isAct ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                              color: isAct ? 'var(--text-primary)' : 'var(--text-secondary)',
                              padding: '8px 12px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontFamily: 'var(--font-sans)',
                              fontWeight: isAct ? 600 : 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Icon size={12} color={isAct ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
                            {t.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab Body panels */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      
                      {activeTab === 'rec' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PARTNERSHIP READINESS</span>
                              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-green)', marginTop: '4px' }}>
                                🟩 {selectedMatch.partnershipReadiness}
                              </div>
                            </div>
                            <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>RISK ASSESSMENT LEVEL</span>
                              <div style={{ fontSize: '15px', fontWeight: 600, color: selectedMatch.riskLevel === 'Critical' ? 'var(--accent-magenta)' : 'var(--accent-amber)', marginTop: '4px' }}>
                                ⚠️ {selectedMatch.riskLevel}
                              </div>
                            </div>
                          </div>

                          <div style={{ backgroundColor: 'rgba(6,182,212,0.03)', border: '1px solid rgba(6,182,212,0.1)', borderRadius: '8px', padding: '14px' }}>
                            <h4 style={{ fontSize: '13px', color: '#fff', marginBottom: '6px' }}>AI Strategic Synergy Recommendation</h4>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                              {selectedMatch.recommendation}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'evidence' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {selectedMatch.evidence.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                              No signals extracted yet. Run live-mode searches to crawl evidence.
                            </div>
                          ) : (
                            selectedMatch.evidence.map((ev: any, idx: number) => (
                              <div key={idx} style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: '9px' }}>{ev.category.toUpperCase()}</span>
                                    <span className="cyber-badge cyber-badge-green" style={{ fontSize: '9px' }}>QUALITY {ev.qualityScore || ev.confidence}</span>
                                    <span className="cyber-badge cyber-badge-amber" style={{ fontSize: '9px' }}>IMPACT {ev.impact ?? 0}</span>
                                  </div>
                                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Confidence: <strong style={{ color: 'var(--accent-cyan)' }}>{ev.confidence}%</strong>
                                  </span>
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#fff' }}>{ev.title}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                  <span>Metric: <strong style={{ color: '#fff' }}>{ev.metricAffected || ev.category}</strong></span>
                                  <span>Authority: <strong style={{ color: '#fff' }}>{ev.sourceAuthority || 'n/a'}</strong></span>
                                  <span>Time: <strong style={{ color: '#fff' }}>{ev.timestamp ? new Date(ev.timestamp).toLocaleDateString() : 'live'}</strong></span>
                                </div>
                                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4', fontStyle: 'italic', borderLeft: '2px solid rgba(255,255,255,0.05)', paddingLeft: '8px', margin: '4px 0' }}>
                                  "{ev.snippet}"
                                </p>
                                {ev.why && (
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', backgroundColor: 'rgba(6,182,212,0.03)', border: '1px solid rgba(6,182,212,0.1)', borderRadius: '6px', padding: '7px 8px' }}>
                                    <strong style={{ color: 'var(--accent-cyan)' }}>Why it matters:</strong> {ev.why}
                                  </div>
                                )}
                                {ev.url && (
                                  <a href={ev.url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', alignSelf: 'flex-start' }} onMouseEnter={(e)=>e.currentTarget.style.textDecoration='underline'} onMouseLeave={(e)=>e.currentTarget.style.textDecoration='none'}>
                                    <Globe size={11} /> View Source Document <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {activeTab === 'outreach' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {/* Email Template */}
                          <div style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Strategic Email Pitch</span>
                              <button
                                onClick={() => copyToClipboard(selectedMatch.outreach.email, 'email')}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                {copiedKey === 'email' ? <Check size={11} color="var(--accent-green)" /> : <Copy size={11} />}
                                {copiedKey === 'email' ? 'Copied!' : 'Copy to Clipboard'}
                              </button>
                            </div>
                            <pre style={{
                              whiteSpace: 'pre-wrap',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              backgroundColor: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              padding: '10px',
                              color: 'var(--text-secondary)',
                              maxHeight: '180px',
                              overflowY: 'auto'
                            }}>
                              {selectedMatch.outreach.email}
                            </pre>
                          </div>

                          {/* LinkedIn DM */}
                          <div style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>LinkedIn DM Hook</span>
                              <button
                                onClick={() => copyToClipboard(selectedMatch.outreach.linkedinDm, 'linkedin')}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                {copiedKey === 'linkedin' ? <Check size={11} color="var(--accent-green)" /> : <Copy size={11} />}
                                {copiedKey === 'linkedin' ? 'Copied!' : 'Copy to Clipboard'}
                              </button>
                            </div>
                            <pre style={{
                              whiteSpace: 'pre-wrap',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              backgroundColor: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              padding: '10px',
                              color: 'var(--text-secondary)',
                              maxHeight: '100px',
                              overflowY: 'auto'
                            }}>
                              {selectedMatch.outreach.linkedinDm}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
