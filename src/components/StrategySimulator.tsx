import React, { useEffect, useRef, useState } from 'react';
import { Sliders, ShieldAlert, Play, Terminal, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CompanyTwin } from '../agents/types';

interface Scenario {
  id: string;
  name: string;
  description: string;
  signalTitle: string;
  signalContent: string;
  signalSource: string;
  expectedOutcome: string;
  icon: string;
}

interface StrategySimulatorProps {
  twin: CompanyTwin;
  onInjectSimulationSignal: (title: string, content: string, source: string) => void;
}

export const StrategySimulator: React.FC<StrategySimulatorProps> = ({
  twin,
  onInjectSimulationSignal
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRefs = useRef<number[]>([]);
  
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [customSource, setCustomSource] = useState('Manual Influx Console');

  const getScenarios = (companyId: string): Scenario[] => {
    if (companyId === 'aetherhealth') {
      return [
        {
          id: 'ah-scen-cyber',
          name: 'Zero-Day API Data Leak Disclosed',
          description: 'Simulates the public disclosure of an IDOR session vulnerability on the patient portal, exposing private medical database telemetry.',
          signalTitle: 'Zero-day vulnerability reported in AetherHealth CarePortal patient API',
          signalContent: 'A researcher has disclosed an IDOR vulnerability on the CarePortal endpoint where raw medical records could be queried without proper session token matching. Patch is pending.',
          signalSource: 'Hacker News Thread',
          expectedOutcome: 'Cybersecurity Maturity drops -22%, Regulatory Risk increases +20%, Opportunity Index reduces.',
          icon: '🚨'
        },
        {
          id: 'ah-scen-sales',
          name: 'Rapid B2B Sales Scaling',
          description: 'Simulates the aggressive hiring of 18 Enterprise Account Executives and the launch of transparent self-serve developer pricing tiers.',
          signalTitle: 'Urgent Hiring: 18 Enterprise Account Executives & Sales Leaders',
          signalContent: 'Expanding our clinical AI sales team. Responsibilities include running pilots with regional hospital networks, contract negotiation, and hitting high B2B quotas.',
          signalSource: 'LinkedIn Job Board',
          expectedOutcome: 'Buying Intent increases +25%, overall commercial opportunity score elevates.',
          icon: '📈'
        },
        {
          id: 'ah-scen-sandbox',
          name: 'Singapore MOH Sandbox Approval',
          description: 'Simulates the official compliance approval and sandbox certification by the Singapore Ministry of Health to hook into public hospital EMRs.',
          signalTitle: 'Singapore Ministry of Health grants AetherHealth sandbox certification',
          signalContent: 'AetherHealth has been approved to participate in Singapore’s National Health tech sandbox, enabling direct integrations with local public hospital systems.',
          signalSource: 'Ministry of Health Bulletin',
          expectedOutcome: 'Regulatory Risk decreases -12%, Expansion Readiness jumps +15%.',
          icon: '🇸🇬'
        }
      ];
    }

    if (companyId === 'solargrid') {
      return [
        {
          id: 'sg-scen-tesla',
          name: 'Tesla Megapack Procurement Contract',
          description: 'Simulates entering a multi-megawatt battery purchase agreement with Tesla Energy to bypass ongoing storage cell supply bottlenecks.',
          signalTitle: 'SolarGrid partners with Tesla Energy for grid battery packs',
          signalContent: 'SolarGrid Systems announces massive purchase agreement with Tesla Energy for Megapacks, resolving its storage cell bottleneck and accelerating the Q3 battery farm deployments.',
          signalSource: 'TechCrunch Press Release',
          expectedOutcome: 'Expansion Readiness increases +22%, Vendor Requirement Probability decreases -15%.',
          icon: '🔋'
        },
        {
          id: 'sg-scen-supply',
          name: 'Severe Battery Cell Supply Bottleneck',
          description: 'Simulates severe LFP component delays, halting smart-grid energy storage farm deployments across key Texas grid points.',
          signalTitle: 'SolarGrid Procurement Director posts: Seeking commercial battery pack supply partners',
          signalContent: 'We are facing supply chain bottlenecks for our utility-scale grid batteries. Seeking suppliers that can deliver LFP battery modules with 5-year warranties starting Q3.',
          signalSource: 'LinkedIn Procurement Update',
          expectedOutcome: 'Expansion Readiness decreases -15%, Vendor Requirement Probability jumps +25%.',
          icon: '⚠️'
        },
        {
          id: 'sg-scen-reg',
          name: 'Grid Regulator Connection Delay',
          description: 'Simulates harmonic transmission interference delays, blocking grid interconnection authorizations on new utility fields.',
          signalTitle: 'SolarGrid grid interconnection approval delayed by grid regulator',
          signalContent: 'Regulatory board delays solar farm grid interconnection due to harmonic disturbance concerns on local transmission lines. SolarGrid must install mitigation filters.',
          signalSource: 'Texas Utility Commission',
          expectedOutcome: 'Regulatory Risk increases +15%, Expansion Readiness drops -12%.',
          icon: '⚖️'
        }
      ];
    }

    // cybershield
    return [
      {
        id: 'cs-scen-ebpf',
        name: 'v4.2.0 eBPF Telemetry Hook Release',
        description: 'Simulates releasing a Kubernetes performance agent patch resolving container memory leaks and implementing direct Linux socket tracking.',
        signalTitle: 'Release v4.2.0: Patch for memory leak & added support for eBPF kernel tracking',
        signalContent: 'Resolves memory leak in high-volume Kubernetes nodes. Also introduces eBPF telemetry hooks to monitor raw Linux socket activity directly without kernel modules.',
        signalSource: 'GitHub Releases',
        expectedOutcome: 'Cybersecurity Maturity increases +5%, Tech Adoption Momentum increases +10%.',
        icon: '🚀'
      },
      {
        id: 'cs-scen-cisa',
        name: 'CISA Emergency Active Directory Mandate',
        description: 'Simulates CISA issuing an emergency directive ordering agencies to audit and secure Active Directory structures against active exploits.',
        signalTitle: 'CISA issues emergency directive on Active Directory zero-day exploitation',
        signalContent: 'CISA warns government agencies to immediately audit Active Directory structures. Active exploitation detected. Cybersecurity systems must implement real-time AD monitoring.',
        signalSource: 'CISA Alert Bulletin',
        expectedOutcome: 'Vendor Requirement Probability jumps +18%, Cybersecurity Maturity drops -8% (temporary reviews required).',
        icon: '🛡️'
      }
    ];
  };

  const scenarios = getScenarios(twin.id);
  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((id) => window.clearTimeout(id));
      timeoutRefs.current = [];
    };
  }, []);

  const queueLog = (log: string, index: number, total: number, onDone?: () => void) => {
    const timeoutId = window.setTimeout(() => {
      setConsoleLogs(prev => [...prev, log]);
      setProgress(Math.round(((index + 1) / total) * 100));
      if (index === total - 1) {
        setIsRunning(false);
        setShowResults(true);
        onDone?.();
      }
    }, (index + 1) * 350);
    timeoutRefs.current.push(timeoutId);
  };

  const runSimulation = () => {
    if (!selectedScenario) return;
    
    setIsRunning(true);
    setProgress(0);
    setShowResults(false);
    setConsoleLogs([]);
    timeoutRefs.current.forEach((id) => window.clearTimeout(id));
    timeoutRefs.current = [];

    const logs = [
      `[00:01] ⚡ INIT SCENARIO SIMULATOR: Ingesting Event "${selectedScenario.name}"`,
      `[00:50] 🔍 COLLECTOR AGENT: Scraping source "${selectedScenario.signalSource}"...`,
      `[01:20] 📝 COLLECTOR AGENT: Raw payload fetched: "${selectedScenario.signalTitle}"`,
      `[01:80] 🤖 CLASSIFIER AGENT: Launching NLP context review on scraped payload...`,
      `[02:40] 🤖 CLASSIFIER AGENT: Signal classified under "${selectedScenario.id.includes('cyber') ? 'cybersecurity' : selectedScenario.id.includes('reg') ? 'regulation' : selectedScenario.id.includes('sales') ? 'hiring' : selectedScenario.id.includes('tesla') ? 'partnership' : 'tech_adoption'}"`,
      `[03:10] 💻 TWIN ENGINE: Recalculating Operational Indices for Entity "${twin.name}"...`,
      `[03:70] 💻 TWIN ENGINE: Applying score changes. Generating Explainability Trace...`,
      `[04:20] 🧠 PREDICTION ENGINE: Re-assessing predictions & defensive playbooks...`,
      `[04:90] 🏁 SIMULATION RUN SUCCESSFUL: Twin database mutated.`
    ];

    logs.forEach((log, index) => {
      queueLog(log, index, logs.length, index === logs.length - 1 ? () => {
          onInjectSimulationSignal(
            selectedScenario.signalTitle,
            selectedScenario.signalContent,
            selectedScenario.signalSource
          );
        } : undefined);
    });
  };

  const runCustomSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    
    setIsRunning(true);
    setProgress(0);
    setShowResults(false);
    setConsoleLogs([]);
    timeoutRefs.current.forEach((id) => window.clearTimeout(id));
    timeoutRefs.current = [];

    const logs = [
      `[00:20] 🔍 COLLECTOR AGENT: Intercepted manual client payload...`,
      `[00:80] 🔍 COLLECTOR AGENT: Raw payload fetched: "${customTitle}"`,
      `[01:40] 🤖 CLASSIFIER AGENT: Querying NLP classification parameters...`,
      `[02:10] 💻 TWIN ENGINE: Calibrating DNA indices for entity "${twin.name}"...`,
      `[02:80] 💻 TWIN ENGINE: Evolving Business DNA Radar vectors live...`,
      `[03:50] 🧠 PREDICTION ENGINE: recalculating 30/60/90 Day forecasts...`,
      `[04:20] 🏁 PIPELINE RUN SUCCESSFUL: Mutated Business DNA & Outreach Playbooks.`
    ];

    logs.forEach((log, index) => {
      queueLog(log, index, logs.length, index === logs.length - 1 ? () => {
          onInjectSimulationSignal(customTitle, customContent || 'Custom business telemetry signal injected by client console.', customSource);
          setCustomTitle('');
          setCustomContent('');
        } : undefined);
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* Left Column: Scenario Selector & Log Output */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
        {/* Scenario Grid */}
        <div className="cyber-card glow-cyan" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="var(--accent-cyan)" />
            What-If Scenarios playground
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {scenarios.map((scen) => {
              const isSelected = selectedScenarioId === scen.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => {
                    if (!isRunning) {
                      setSelectedScenarioId(scen.id);
                      setShowResults(false);
                    }
                  }}
                  style={{
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255,255,255,0.01)',
                    border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{scen.icon}</div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                    {scen.name}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {scen.description.substring(0, 75)}...
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Signal Influx Console */}
        <div className="cyber-card glow-cyan" style={{ padding: '16px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '13.5px', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={15} color="var(--accent-cyan)" />
            Live Custom Signal Influx Console
          </h3>
          <form onSubmit={runCustomSimulation} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>SIGNAL TITLE / HEADLINE</span>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. NVIDIA announces partnership with XYZ"
                disabled={isRunning}
                style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: '#fff', fontSize: '11.5px', outline: 'none' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>EXTRACTED DESCRIPTION</span>
              <input
                type="text"
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="e.g. Direct integration to combine metadata..."
                disabled={isRunning}
                style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: '#fff', fontSize: '11.5px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>SOURCE NODE</span>
              <input
                type="text"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                placeholder="Hacker News"
                disabled={isRunning}
                style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: '#fff', fontSize: '11.5px', outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={isRunning || !customTitle.trim()}
              className="cyber-btn cyber-btn-accent"
              style={{
                padding: '8px 14px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                height: '34px',
                cursor: (isRunning || !customTitle.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              INJECT SIGNAL <ArrowRight size={12} />
            </button>
          </form>
        </div>

        {/* Agent Ingestion terminal */}
        <div className="cyber-card glow-cyan" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#02050b', border: '1px solid rgba(6,182,212,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(6,182,212,0.15)', paddingBottom: '10px', marginBottom: '10px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={14} /> PULSEFORGE AGENT TELEMETRY PROTOCOL
            </span>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isRunning ? 'var(--accent-green)' : 'var(--text-muted)' }} />
          </div>
          <div style={{ height: '8px', border: '1px solid var(--border-color)', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px', backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--accent-cyan)', transition: 'width 0.2s ease' }} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#a5f3fc', display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px' }}>
            {consoleLogs.length === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>
                {isRunning ? 'System spinning up...' : 'Awaiting simulation trigger. Select a scenario and execute.'}
              </span>
            ) : (
              consoleLogs.map((log, idx) => (
                <div key={idx} style={{ lineHeight: '1.4' }}>
                  {log.includes('🏁') ? (
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{log}</span>
                  ) : log.includes('🚨') || log.includes('🔍') ? (
                    <span style={{ color: 'var(--accent-magenta)' }}>{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Execution control & results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="cyber-card glow-cyan" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selectedScenario ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '20px',
              color: 'var(--text-muted)'
            }}>
              <Sliders size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Select Scenario
              </h3>
              <p style={{ fontSize: '12px', lineHeight: '1.4' }}>
                Choose one of the target corporate simulations to configure the custom scraper agent and watch the twin mutate live.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: '9px', marginBottom: '6px' }}>
                  Simulation Configured
                </span>
                <h3 style={{ fontSize: '16px', color: '#fff' }}>{selectedScenario.name}</h3>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Trigger Signal Text
                  </span>
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4'
                  }}>
                    <strong>{selectedScenario.signalTitle}</strong>
                    <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {selectedScenario.signalContent}
                    </p>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Projected Outcomes
                  </span>
                  <div style={{
                    backgroundColor: 'rgba(236,72,153,0.03)',
                    border: '1px solid rgba(236,72,153,0.1)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '11.5px',
                    color: 'var(--accent-magenta)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    lineHeight: '1.4'
                  }}>
                    <ShieldAlert size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{selectedScenario.expectedOutcome}</span>
                  </div>
                </div>

                {showResults && (
                  <div style={{
                    backgroundColor: 'rgba(16,185,129,0.04)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: 'var(--accent-green)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={16} />
                    <span>Twin indices recalculated. Visual indicators flashed.</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <button
                  onClick={runSimulation}
                  disabled={isRunning}
                  className="cyber-btn cyber-btn-accent"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    fontSize: '12.5px',
                    fontFamily: 'var(--font-mono)',
                    gap: '8px',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 15px rgba(6,182,212,0.15)'
                  }}
                >
                  <Play size={14} />
                  {isRunning ? 'AGENT CALIBRATING...' : 'RUN LIVE PITCH SCENARIO'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
