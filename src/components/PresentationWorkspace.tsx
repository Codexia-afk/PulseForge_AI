import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, ChevronDown, ChevronRight, Cpu, Database, Globe, RefreshCw, Search, Send, Sparkles, XCircle } from 'lucide-react';
import { API_BASE_URL, apiUrl, checkBackendHealth, fetchWithTimeout } from '../lib/api';

interface PresentationWorkspaceProps {
  userProfile: any;
  setUserProfile: (profile: any) => void;
  setImportedEvidence: (evidence: any[]) => void;
  setImportedTwin: (twin: any | null) => void;
  setActiveTab: (tab: string) => void;
  backendHealthy: boolean;
}

const pipelineSteps = [
  'Checking backend',
  'Discovering website',
  'Extracting evidence',
  'Classifying signals',
  'Building Business Twin',
  'Preparing review'
];

export const PresentationWorkspace: React.FC<PresentationWorkspaceProps> = ({
  userProfile,
  setUserProfile,
  setImportedEvidence,
  setImportedTwin,
  setActiveTab,
  backendHealthy
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [isOnboardingLoading, setIsOnboardingLoading] = useState<boolean>(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState<boolean>(true);
  const [localBackendHealthy, setLocalBackendHealthy] = useState<boolean>(backendHealthy);
  const [backendHealthStatus, setBackendHealthStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [onboardStepIndex, setOnboardStepIndex] = useState<number>(0);
  const [onboardProfile, setOnboardProfile] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastHealthCheckTime, setLastHealthCheckTime] = useState<string | null>(null);
  const [lastApiError, setLastApiError] = useState<string | null>(null);
  const [hasImportAttempted, setHasImportAttempted] = useState<boolean>(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);
  const importInFlightRef = useRef<boolean>(false);

  const runBackendHealthCheck = async () => {
    setIsCheckingBackend(true);
    setBackendHealthStatus('checking');
    const result = await checkBackendHealth();
    setLocalBackendHealthy(result.ok);
      setBackendHealthStatus(result.ok ? 'online' : 'offline');
      setLastHealthCheckTime(result.checkedAt);
      setLastApiError(result.error || null);
    setIsCheckingBackend(false);
    return result;
  };

  useEffect(() => {
    runBackendHealthCheck();
  }, []);

  useEffect(() => {
    if (backendHealthy) {
      setLocalBackendHealthy(true);
      setBackendHealthStatus('online');
    }
  }, [backendHealthy]);

  const runImport = async () => {
    if (importInFlightRef.current) return;
    if (!canImport) return;
    if (!websiteUrl.trim()) return;

    importInFlightRef.current = true;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsOnboardingLoading(true);
    setOnboardProfile(null);
    setImportedEvidence([]);
    setImportedTwin(null);
    setErrorMessage(null);
    setHasImportAttempted(true);
    setOnboardStepIndex(0);

    let logIdx = 0;
    const interval = window.setInterval(() => {
      logIdx += 1;
      setOnboardStepIndex(Math.min(logIdx, pipelineSteps.length - 2));
    }, 650);

    try {
      const health = await runBackendHealthCheck();
      if (!health.ok) {
        throw new Error(`Backend unavailable at ${health.baseUrl}. Start FastAPI or switch to Presentation Mode.`);
      }

      const response = await fetchWithTimeout(apiUrl('/api/onboard-company'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: websiteUrl, url: websiteUrl }),
        signal: abortRef.current.signal
      }, 15000);

      if (!response.ok) {
        let detail = 'Website unavailable or backend returned an error.';
        try {
          const errorData = await response.json();
          detail = errorData.detail || errorData.message || detail;
        } catch {
          // Keep the generic error if the backend did not return JSON.
        }
        throw new Error(detail);
      }

      const data = await response.json();
      setOnboardProfile(data);
      setImportedEvidence(data.evidenceDatabase || []);
      setImportedTwin(data.businessTwin || null);
      setOnboardStepIndex(pipelineSteps.length - 1);
      setLastApiError(null);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setErrorMessage('Import canceled.');
      } else {
        const message = (err as Error).message || 'Website unavailable.';
        setErrorMessage(message);
        setLastApiError(message);
      }
      setImportedEvidence([]);
      setImportedTwin(null);
    } finally {
      window.clearInterval(interval);
      importInFlightRef.current = false;
      setIsOnboardingLoading(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runImport();
  };

  const handleSaveOnboardedProfile = () => {
    if (!onboardProfile) return;
    setUserProfile(onboardProfile);
    setImportedEvidence(onboardProfile.evidenceDatabase || []);
    setImportedTwin(onboardProfile.businessTwin || null);
    setOnboardProfile(null);
    setWebsiteUrl('');
    setActiveStep(2);
  };

  const handleProfileFieldChange = (field: string, value: string) => {
    if (!onboardProfile) return;
    setOnboardProfile({ ...onboardProfile, [field]: value });
  };

  const evidence = onboardProfile?.evidenceDatabase || [];
  const twin = onboardProfile?.businessTwin || null;
  const frontendUrl = typeof window === 'undefined' ? 'Unknown' : window.location.href;
  const connectionCopy = localBackendHealthy
    ? 'Live backend connected. Public evidence import available.'
    : `Backend unavailable at ${API_BASE_URL}. Start FastAPI or switch to Presentation Mode.`;
  const canImport = localBackendHealthy && !isCheckingBackend && !isOnboardingLoading;
  const importProgress = Math.round(((onboardStepIndex + 1) / pipelineSteps.length) * 100);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', flexShrink: 0 }}>
          {[
            { step: 1, label: 'Step 1: Build My Business Twin' },
            { step: 2, label: 'Step 2: Find Strategic Partners' },
            { step: 3, label: 'Step 3: Execute Actions' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className="cyber-card"
              style={{
                padding: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                border: activeStep === s.step ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                backgroundColor: activeStep === s.step ? 'rgba(6, 182, 212, 0.04)' : 'rgba(255,255,255,0.01)',
                color: activeStep === s.step ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{s.label}</span>
            </button>
          ))}
        </div>

        {activeStep === 1 && (
          <div className="cyber-card glow-cyan" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} color="var(--accent-cyan)" />
                Import Company from Website
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Public website discovery, evidence extraction, classification, and Business Twin construction.
              </span>
            </div>

            <div style={{ fontSize: '11.5px', color: localBackendHealthy ? 'var(--accent-green)' : 'var(--accent-amber)', backgroundColor: localBackendHealthy ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)', padding: '9px 10px', borderRadius: '6px', border: localBackendHealthy ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {localBackendHealthy ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                {isCheckingBackend ? 'Checking backend connection...' : connectionCopy}
              </span>
              <button
                type="button"
                onClick={runBackendHealthCheck}
                disabled={isCheckingBackend || isOnboardingLoading}
                className="cyber-btn"
                style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', gap: '5px', whiteSpace: 'nowrap', opacity: isCheckingBackend || isOnboardingLoading ? 0.55 : 1 }}
              >
                <RefreshCw size={12} /> RETRY
              </button>
            </div>

            {errorMessage && (
              <div style={{ fontSize: '11.5px', color: 'var(--accent-amber)', backgroundColor: 'rgba(245,158,11,0.06)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={14} /> {errorMessage}
              </div>
            )}

            {!isOnboardingLoading && !onboardProfile && (
              <form onSubmit={handleImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Company Website URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="openai.com, nvidia.com, cloudflare.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    required
                    style={{ flex: 1, backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', padding: '8px 12px', fontSize: '12.5px', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={runImport}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        runImport();
                      }
                    }}
                    disabled={!canImport}
                    aria-label="Import company"
                    className="cyber-btn cyber-btn-accent"
                    style={{ padding: '8px 16px', fontSize: '12px', fontFamily: 'var(--font-mono)', gap: '4px', opacity: canImport ? 1 : 0.5, cursor: canImport ? 'pointer' : 'not-allowed' }}
                  >
                    <Search size={13} /> IMPORT
                  </button>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px', padding: '10px', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                  Enter a company website to build your Business Twin from public evidence.
                </div>
              </form>
            )}

            {isOnboardingLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', gap: '16px' }}>
                <Cpu size={32} color="var(--accent-cyan)" className="spin-animation" />
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff' }}>Building Evidence-backed Business Twin</div>
                <div style={{ width: '100%', maxWidth: '430px', height: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${importProgress}%`, height: '100%', backgroundColor: 'var(--accent-cyan)', transition: 'width 0.25s ease' }} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{importProgress}%</div>
                <div style={{ width: '100%', maxWidth: '430px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', padding: '12px', border: '1px solid var(--border-color)', maxHeight: '210px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '5px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {pipelineSteps.slice(0, onboardStepIndex + 1).map((log, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ color: idx === onboardStepIndex ? 'var(--accent-amber)' : 'var(--accent-cyan)' }}>&gt;</span>
                      <span>{new Date().toLocaleTimeString()} - {log}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    abortRef.current?.abort();
                    setIsOnboardingLoading(false);
                  }}
                  className="cyber-btn"
                  style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', gap: '6px' }}
                >
                  <XCircle size={13} /> CANCEL IMPORT
                </button>
              </div>
            )}

            {onboardProfile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', margin: 0, textTransform: 'uppercase' }}>
                  Review Your Business Twin
                </h4>

                <div style={{ fontSize: '11.5px', color: twin?.confidenceLabel === 'Low Confidence' ? 'var(--accent-amber)' : 'var(--accent-green)', backgroundColor: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  {twin?.confidenceLabel || 'Low Confidence'} - Evidence records: {evidence.length}. {onboardProfile.qualityGates?.reason || ''}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    ['name', 'COMPANY NAME'],
                    ['industry', 'INDUSTRY'],
                    ['product_service', 'PRODUCT / SERVICE'],
                    ['target_customer', 'TARGET CUSTOMER'],
                    ['target_region', 'TARGET REGION'],
                    ['partnership_goal', 'PARTNERSHIP GOAL']
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{label}</label>
                      <input
                        type="text"
                        value={onboardProfile[field] || 'Insufficient public evidence.'}
                        onChange={(e) => handleProfileFieldChange(field, e.target.value)}
                        style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', padding: '6px', fontSize: '12px', outline: 'none' }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>DESCRIPTION</label>
                  <textarea
                    value={onboardProfile.description || 'Insufficient public evidence.'}
                    onChange={(e) => handleProfileFieldChange('description', e.target.value)}
                    style={{ width: '100%', minHeight: '54px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', padding: '6px', fontSize: '12px', outline: 'none', resize: 'vertical', lineHeight: '1.35' }}
                  />
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>EVIDENCE USED ({evidence.length})</span>
                  {evidence.slice(0, 5).map((ev: any) => (
                    <div key={ev.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>{ev.category} - {ev.confidence}% confidence</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{ev.snippet}</div>
                      <a href={ev.url} target="_blank" rel="noreferrer" style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>{ev.url}</a>
                    </div>
                  ))}
                  {hasImportAttempted && evidence.length === 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Insufficient public evidence.</span>}
                </div>

                <button
                  onClick={handleSaveOnboardedProfile}
                  disabled={evidence.length === 0}
                  className="cyber-btn cyber-btn-accent"
                  style={{ width: '100%', padding: '10px', fontSize: '12.5px', fontFamily: 'var(--font-mono)', justifyContent: 'center', gap: '6px', marginTop: '6px', opacity: evidence.length > 0 ? 1 : 0.5, cursor: evidence.length > 0 ? 'pointer' : 'not-allowed' }}
                >
                  <CheckCircle2 size={14} /> CREATE MY BUSINESS TWIN
                </button>
              </div>
            )}
          </div>
        )}

        {activeStep === 2 && (
          <div className="cyber-card glow-cyan" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--accent-cyan)" /> Find Strategic Partners
            </h3>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ACTIVE BUSINESS PROFILE</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{userProfile.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{userProfile.industry}</div>
            </div>
            <button onClick={() => setActiveTab('match-engine')} className="cyber-btn cyber-btn-accent" style={{ padding: '12px', fontSize: '13px', fontFamily: 'var(--font-mono)', justifyContent: 'center', gap: '8px' }}>
              LAUNCH AI PARTNERSHIP MATCHING ENGINE <ArrowRight size={14} />
            </button>
          </div>
        )}

        {activeStep === 3 && (
          <div className="cyber-card glow-cyan" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Send size={16} color="var(--accent-cyan)" /> Execute Actions & Webhooks
            </h3>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Recommendations and outreach payloads are generated only when supporting evidence exists.
            </div>
            <button onClick={() => setActiveTab('actions')} className="cyber-btn cyber-btn-accent" style={{ padding: '12px', fontSize: '13px', fontFamily: 'var(--font-mono)', justifyContent: 'center', gap: '8px' }}>
              OPEN EXECUTIVE ACTION HUB <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="cyber-card glow-cyan" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '4px' }}>
          <BookOpen size={16} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '14.5px', color: '#fff', margin: 0 }}>Presentation Workspace Guide</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px', lineHeight: '1.5' }}>
          <div style={{ borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '8px' }}>
            <strong style={{ color: 'var(--accent-cyan)', display: 'block', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>THE RULE</strong>
            PulseForge AI classifies, summarizes, compares, scores, and predicts from verified public evidence only.
          </div>
          <div style={{ borderLeft: '2px solid var(--accent-amber)', paddingLeft: '8px' }}>
            <strong style={{ color: 'var(--accent-amber)', display: 'block', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>QUALITY GATE</strong>
            Fewer than three trusted sources produces Low Confidence and "Insufficient public evidence" for unsupported fields.
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '11px', marginBottom: '8px' }}>
              <Database size={13} /> EVIDENCE DATABASE
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              Every insight links to source URL, snippet, timestamp, category, confidence, impact, and tags.
            </p>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setDiagnosticsOpen(!diagnosticsOpen)}
              style={{ width: '100%', background: 'transparent', border: 0, color: '#fff', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <Cpu size={13} /> CONNECTION DIAGNOSTICS
              </span>
              {diagnosticsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {diagnosticsOpen && (
              <div style={{ borderTop: '1px solid var(--border-color)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '11px' }}>
                {[
                  ['Frontend URL', frontendUrl],
                  ['API Base URL', API_BASE_URL],
                  ['Backend Health Status', backendHealthStatus],
                  ['Last Health Check Time', lastHealthCheckTime ? new Date(lastHealthCheckTime).toLocaleTimeString() : 'Not checked'],
                  ['Last API Error', lastApiError || 'None'],
                  ['Mode', localBackendHealthy ? 'Live' : 'Presentation'],
                  ['Evidence Count', String(evidence.length)]
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'grid', gridTemplateColumns: '105px 1fr', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</span>
                    <span style={{ color: value === 'offline' ? 'var(--accent-amber)' : 'var(--text-secondary)', wordBreak: 'break-word' }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
