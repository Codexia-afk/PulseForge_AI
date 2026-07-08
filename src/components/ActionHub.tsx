import React, { useState } from 'react';
import { StrategyPlaybook, GeneratedActions, CompanyTwin } from '../agents/types';
import { Briefcase, Copy, Send, CheckCircle2, ChevronRight, FileText, MessageSquare, Calendar, Database, Cpu, Sparkles, Download } from 'lucide-react';

interface ActionHubProps {
  playbook: StrategyPlaybook;
  actions: GeneratedActions;
  twin: CompanyTwin;
}

export const ActionHub: React.FC<ActionHubProps> = ({
  playbook,
  actions,
  twin
}) => {
  const [activeActionTab, setActiveActionTab] = useState<'email' | 'linkedin' | 'slack' | 'crm' | 'brief'>('email');
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Track status for each dispatch action
  const [actionStatuses, setActionStatuses] = useState<Record<string, { status: 'Ready' | 'Sent' | 'Created' | 'Failed'; timestamp?: string }>>({
    email: { status: 'Ready' },
    linkedin: { status: 'Ready' },
    slack: { status: 'Ready' },
    crm: { status: 'Ready' },
    brief: { status: 'Ready' }
  });

  const getActionContent = () => {
    switch (activeActionTab) {
      case 'linkedin':
        return actions.linkedinDm;
      case 'slack':
        return actions.slackAlert;
      case 'crm':
        return actions.crmNote;
      case 'brief':
        return actions.executiveBrief;
      default:
        return actions.email;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActionContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildIntegrationPayload = () => ({
    generatedAt: new Date().toISOString(),
    actionType: activeActionTab,
    status: 'integration_ready',
    targetCompany: {
      id: twin.id,
      name: twin.name,
      ticker: twin.ticker,
      industry: twin.industry,
      website: twin.website
    },
    playbook,
    content: getActionContent(),
    evidenceSummary: {
      evidenceCount,
      confidence: Math.min(96, 60 + evidenceCount * 5),
      metricEvidence: twin.explainability
    }
  });

  const downloadArtifact = (kind: 'json' | 'report') => {
    const payload = buildIntegrationPayload();
    const content = kind === 'json'
      ? JSON.stringify(payload, null, 2)
      : [
          `# PulseForge Executive Brief: ${twin.name}`,
          '',
          `Generated: ${payload.generatedAt}`,
          `Target: ${twin.name} (${twin.ticker})`,
          `Industry: ${twin.industry}`,
          `Website: ${twin.website}`,
          '',
          '## Strategic Summary',
          playbook.executiveSummary,
          '',
          '## Recommended Motion',
          playbook.partnershipSuggestion,
          '',
          '## Risk Mitigation',
          playbook.riskMitigationStep,
          '',
          '## Generated Action',
          getActionContent(),
          '',
          '## Evidence Trace',
          JSON.stringify(payload.evidenceSummary.metricEvidence, null, 2)
        ].join('\n');
    const blob = new Blob([content], { type: kind === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = kind === 'json'
      ? `pulseforge-${activeActionTab}-payload-${twin.ticker}.json`
      : `pulseforge-executive-brief-${twin.ticker}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setActionStatuses(prev => ({
      ...prev,
      [activeActionTab]: {
        status: 'Created',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    }));
  };

  const handleExecuteAction = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setActionStatuses(prev => ({
        ...prev,
        [activeActionTab]: {
          status: 'Created',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      }));
    }, 1000);
  };

  const tabs = [
    { id: 'email', name: 'Outreach Email', icon: FileText },
    { id: 'linkedin', name: 'LinkedIn DM', icon: ChevronRight },
    { id: 'slack', name: 'Slack Webhook', icon: MessageSquare },
    { id: 'crm', name: 'CRM Sync Note', icon: Calendar },
    { id: 'brief', name: 'Executive Brief', icon: FileText }
  ];

  const evidenceCount = Object.values(twin.explainability || {}).reduce((sum, traces) => sum + traces.length, 0);
  const copilotRecommendations = [
    `Lead with ${playbook.outreachAngle}.`,
    `Cite ${evidenceCount || 'available'} supporting signal${evidenceCount === 1 ? '' : 's'} before asking for a meeting.`,
    `Route risk objection to: ${playbook.riskMitigationStep}.`
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      
      {/* Left Column: Strategic playbook & Playbook recommendations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
        {/* Executive Summary */}
        <div className="cyber-card glow-cyan">
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '10px' }}>AI Strategic Summary</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {playbook.executiveSummary}
          </p>
        </div>

        {/* Tactical Playbook recommendations */}
        <div className="cyber-card glow-cyan" style={{ flex: 1 }}>
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={16} color="var(--accent-cyan)" />
            Tactical Action Playbook
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Outreach Angle */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Outreach positioning Vector
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                🎯 {playbook.outreachAngle}
              </span>
            </div>

            {/* Partnership */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Strategic alliance synergy
              </span>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                🤝 {playbook.partnershipSuggestion}
              </span>
            </div>

            {/* Risk Mitigation */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-magenta)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Immediate Risk Mitigation
              </span>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                🛡️ {playbook.riskMitigationStep}
              </span>
            </div>

            {/* Steps Checklist */}
            <div>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Execution Checklist
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {playbook.strategicPlaybook.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.4'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(6,182,212,0.1)',
                      border: '1px solid rgba(6,182,212,0.3)',
                      color: 'var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9.5px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {idx + 1}
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-card glow-cyan">
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            Executive AI Copilot
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.015)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>EVIDENCE CONFIDENCE</div>
              <div style={{ fontSize: '16px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{Math.min(96, 60 + evidenceCount * 5)}%</div>
            </div>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.015)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PUBLIC SIGNALS</div>
              <div style={{ fontSize: '16px', color: '#fff', fontFamily: 'var(--font-mono)' }}>{evidenceCount}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {copilotRecommendations.map((rec, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <CheckCircle2 size={14} color="var(--accent-green)" style={{ marginTop: '1px', flexShrink: 0 }} />
                <span>{rec}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setActiveActionTab('brief')}
            className="cyber-btn cyber-btn-accent"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '9px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
          >
            GENERATE EXECUTIVE REPORT <FileText size={13} />
          </button>
        </div>
      </div>

      {/* Right Column: Generated Communications / Actions */}
      <div className="cyber-card glow-cyan" style={{ display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '12px' }}>Auto Action Generator</h3>

        {/* Tab selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', backgroundColor: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px', flexShrink: 0 }}>
          {tabs.map((tab) => {
            const isSel = activeActionTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveActionTab(tab.id as any)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '6px 8px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: isSel ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: isSel ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <tab.icon size={11} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Integration-ready execution status board */}
        <div style={{ backgroundColor: 'rgba(245,158,11,0.02)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, color: 'var(--accent-amber)' }}>
            <Database size={13} />
            <span>Integration-ready payload. No external system is contacted from this demo.</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '6px', fontFamily: 'var(--font-mono)' }}>
            <div>Target: <strong style={{ color: '#fff' }}>{twin.name}</strong></div>
            <div>Status: <strong style={{ color: actionStatuses[activeActionTab].status === 'Ready' ? 'var(--accent-cyan)' : 'var(--accent-green)' }}>{actionStatuses[activeActionTab].status}</strong></div>
            <div>Evidence: <strong style={{ color: '#fff' }}>{twin.industry}</strong></div>
            <div>Timestamp: <strong style={{ color: '#fff' }}>{actionStatuses[activeActionTab].timestamp || 'N/A'}</strong></div>
          </div>
        </div>

        {/* Content Box */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header commands */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#090d16', border: '1px solid var(--border-color)', borderBottom: 'none', padding: '8px 16px', borderRadius: '8px 8px 0 0', flexShrink: 0 }}>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {activeActionTab.toUpperCase()}_OUTFLOW_DRAFT.txt
            </span>
            <button
              onClick={handleCopy}
              style={{
                background: 'none',
                border: 'none',
                color: copied ? 'var(--accent-green)' : 'var(--accent-cyan)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          </div>

          <textarea
            readOnly
            value={getActionContent()}
            style={{
              flex: 1,
              backgroundColor: '#020509',
              border: '1px solid var(--border-color)',
              color: '#a5f3fc',
              fontFamily: 'var(--font-mono)',
              fontSize: '11.5px',
              padding: '16px',
              borderRadius: '0 0 8px 8px',
              outline: 'none',
              resize: 'none',
              lineHeight: '1.5'
            }}
          />
        </div>

        {/* Action execution buttons */}
        <div style={{ marginTop: '14px', flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={() => downloadArtifact(activeActionTab === 'brief' ? 'report' : 'json')}
            className="cyber-btn"
            style={{ justifyContent: 'center', padding: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)', gap: '6px', cursor: 'pointer' }}
          >
            <Download size={13} />
            DOWNLOAD ARTIFACT
          </button>
          <button
            onClick={handleExecuteAction}
            disabled={isExecuting}
            className="cyber-btn cyber-btn-accent"
            style={{ justifyContent: 'center', padding: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)', gap: '6px', cursor: isExecuting ? 'not-allowed' : 'pointer' }}
          >
            {isExecuting ? (
              <>
                <Cpu size={13} className="spin-animation" />
                PREPARING PAYLOAD...
              </>
            ) : (
              <>
                <Send size={13} />
                MARK PAYLOAD READY
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
