import React from 'react';
import { ChevronRight, ChevronLeft, Cpu, Sparkles, X, Volume2 } from 'lucide-react';

interface DemoStep {
  title: string;
  script: string;
  actionLabel: string;
  triggerAction: () => void;
}

interface JudgeDemoControllerProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onClose: () => void;
  // State control injections
  setSelectedCompanyId: (id: string) => void;
  setActiveTab: (tab: string) => void;
  onInjectSignal: (companyId: string, title: string, content: string, source: string) => void;
  openExplainabilityDrawer: (metricKey: any) => void;
  closeExplainabilityDrawer: () => void;
  setSlackTriggerFlashed: (flash: boolean) => void;
}

export const JudgeDemoController: React.FC<JudgeDemoControllerProps> = ({
  currentStep,
  setCurrentStep,
  onClose,
  setSelectedCompanyId,
  setActiveTab,
  onInjectSignal,
  openExplainabilityDrawer,
  closeExplainabilityDrawer,
  setSlackTriggerFlashed
}) => {

  const demoSteps: DemoStep[] = [
    {
      title: '1. Select Corporate Twin',
      script: '“Welcome. We are looking at PulseForge AI—an autonomous strategic intelligence and partnership match platform. Let’s start by selecting our first target corporation, Pfizer. The system initializes their living AI Business Twin: a real-time behavioral representation derived from public telemetry. Notice their initial baseline indices: 55% Buying Intent, 84% Cybersecurity Maturity, and a 70% overall Strategic Opportunity Score.”',
      actionLabel: 'Initialize Pfizer Twin',
      triggerAction: () => {
        setSelectedCompanyId('pfizer');
        setActiveTab('twin');
        closeExplainabilityDrawer();
      }
    },
    {
      title: '2. Live public Signal Influx',
      script: '“PulseForge scrapers continually search public data nodes. Let’s trigger a live signal scrape: a newly fetched LinkedIn job posting. In real time, the Signal Collection Agent captures this event, and we feed it directly into the PulseForge pipeline.”',
      actionLabel: 'Inject LinkedIn Hiring Signal',
      triggerAction: () => {
        onInjectSignal(
          'pfizer',
          'Urgent Hiring: 18 Enterprise Account Executives & Sales Leaders',
          'Expanding our clinical AI sales team. Responsibilities include running pilots with regional hospital networks, contract negotiation, and hitting high B2B quotas.',
          'LinkedIn Job Board'
        );
        setActiveTab('signals');
        closeExplainabilityDrawer();
      }
    },
    {
      title: '3. Signal Classification Agent Analysis',
      script: '“Immediately, our Signal Classification Agent reviews the raw text. It bypasses noise to categorize the signal under HIRING, assigning a +6 Business Impact, a 90% confidence rating, and publishing a clear reasoning statement. No manual tagger required.”',
      actionLabel: 'View Classifier Reasoning',
      triggerAction: () => {
        setActiveTab('signals');
        closeExplainabilityDrawer();
      }
    },
    {
      title: '4. Corporate Twin Score updates',
      script: '“Now let’s look at how the living Twin responds. The Business Twin Engine aggregates this categorized hiring signal. Moving back to the Dashboard—notice the Buying Intent score has surged from 55% to 80%! The overall Strategic Score has dynamically re-calculated.”',
      actionLabel: 'Switch to Dashboard & Review Scores',
      triggerAction: () => {
        setActiveTab('twin');
        closeExplainabilityDrawer();
      }
    },
    {
      title: '5. Predictive Foresight Alerts',
      script: '“Because of the sales scaling, our Prediction Engine triggers a forward prediction: Pfizer is likely to launch B2B clinical pilots within 30 days. It gives a 88% confidence rating and suggests targeting the VP of Sales immediately.”',
      actionLabel: 'Focus on Predictions Block',
      triggerAction: () => {
        setActiveTab('twin');
        closeExplainabilityDrawer();
      }
    },
    {
      title: '6. Explainability Audit Trace',
      script: '“PulseForge has zero black boxes. Clicking on the Buying Intent rating opens our Explainability Audit drawer. Presenters and audit logs can trace the exact chain: listing the precise signal, timestamp, and the math showing how it affected the score.”',
      actionLabel: 'Open Explainability Audit Drawer',
      triggerAction: () => {
        setActiveTab('twin');
        openExplainabilityDrawer('buyingIntent');
      }
    },
    {
      title: '7. Strategy Playbook Generation',
      script: '“With our target intent established, the Strategy Agent designs an outreach playbook. It suggests a positioning angle: Accelerating clinical trial integrations. It drafts partnership proposals and lists defensive checklist items.”',
      actionLabel: 'Go to Action Hub Playbook',
      triggerAction: () => {
        closeExplainabilityDrawer();
        setActiveTab('actions');
      }
    },
    {
      title: '8. Automated Outreach & Webhooks',
      script: '“Finally, the Action Generator automatically writes hyper-personalized emails, DMs, and CRM updates referencing the signals. We can immediately test-fire a Slack webhook alert, dispatching team alerts instantly. This turns intelligence into immediate revenue.”',
      actionLabel: 'Generate Actions & Flash Webhook',
      triggerAction: () => {
        closeExplainabilityDrawer();
        setActiveTab('actions');
        setSlackTriggerFlashed(true);
      }
    }
  ];

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      demoSteps[nextStepIndex].triggerAction();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      demoSteps[prevStepIndex].triggerAction();
    }
  };

  const activeStepInfo = demoSteps[currentStep];

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '280px',
      right: '24px',
      background: 'rgba(8, 12, 22, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1.5px solid var(--accent-cyan)',
      boxShadow: '0 0 30px rgba(6, 182, 212, 0.15)',
      borderRadius: '12px',
      zIndex: 90,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 20px',
      transition: 'all 0.3s'
    }}>
      {/* Title / Close */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(6, 182, 212, 0.15)', paddingBottom: '8px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={14} color="var(--accent-cyan)" className="pulse-ring" />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
            PULSEFORGE PRESENTATION WORKSPACE HUD
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          title="Exit Presentation Workspace"
        >
          <X size={14} />
        </button>
      </div>

      {/* Script & Control bar split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'center' }}>
        {/* Presentation Script */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Volume2 size={16} color="var(--accent-green)" style={{ marginTop: '3px', flexShrink: 0 }} />
          <div style={{
            fontSize: '12.5px',
            color: '#a5f3fc',
            lineHeight: '1.5',
            fontFamily: 'var(--font-sans)',
            fontStyle: 'italic'
          }}>
            {activeStepInfo.script}
          </div>
        </div>

        {/* Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '20px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Stage: {activeStepInfo.title}
          </span>
          
          <button
            onClick={activeStepInfo.triggerAction}
            className="cyber-btn-accent"
            style={{
              padding: '8px 12px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              justifyContent: 'center',
              width: '100%',
              gap: '4px'
            }}
          >
            <Sparkles size={11} />
            {activeStepInfo.actionLabel}
          </button>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="cyber-btn"
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '11px',
                justifyContent: 'center',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                opacity: currentStep === 0 ? 0.4 : 1
              }}
            >
              <ChevronLeft size={13} /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === demoSteps.length - 1}
              className="cyber-btn"
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '11px',
                justifyContent: 'center',
                cursor: currentStep === demoSteps.length - 1 ? 'not-allowed' : 'pointer',
                opacity: currentStep === demoSteps.length - 1 ? 0.4 : 1
              }}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
