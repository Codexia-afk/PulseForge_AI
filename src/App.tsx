import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { CompanyTwinHeader } from './components/CompanyTwinHeader';
import { DashboardGrid } from './components/DashboardGrid';
import { SignalStream } from './components/SignalStream';
import { OpportunityMap } from './components/OpportunityMap';
import { StrategySimulator } from './components/StrategySimulator';
import { ActionHub } from './components/ActionHub';
import { JudgeDemoController } from './components/JudgeDemoController';
import { PresentationWorkspace } from './components/PresentationWorkspace';
import { PartnershipMatchEngine } from './components/PartnershipMatchEngine';
import { EvidenceExplorer } from './components/EvidenceExplorer';

import { INITIAL_RAW_SIGNALS, DYNAMIC_SIGNAL_POOL, createCustomSignal } from './agents/signalCollector';
import { classifySignal } from './agents/signalClassifier';
import { computeBusinessTwin, BASELINE_TWINS } from './agents/businessTwinEngine';
import { generatePredictions } from './agents/predictionEngine';
import { generateStrategyPlaybook } from './agents/strategyAgent';
import { generateActions } from './agents/actionGenerator';
import { RawSignal, ClassifiedSignal } from './agents/types';
import { checkBackendHealth } from './lib/api';

function App() {
  const [activeTab, setActiveTab] = useState<string>('presentation'); // Start on Presentation Workspace for presentation readiness
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('pfizer'); // Default to Pfizer (formerly AetherHealth)
  
  // App operations modes
  const [mode, setMode] = useState<'realworld' | 'demo'>('demo');
  const [backendHealthy, setBackendHealthy] = useState<boolean>(false);
  const [backendWarnings, setBackendWarnings] = useState<string[]>([]);
  
  // User profile structure
  const [userProfile, setUserProfile] = useState<any>({
    name: 'GenVax AI',
    website: 'genvax.ai',
    industry: 'Biotech & AI Drug Discovery',
    product_service: 'GPU-accelerated mRNA vaccine sequence modeling and clinical trials optimization platform',
    target_customer: 'Pharma companies, academic labs, vaccine manufacturing nodes',
    target_region: 'Global',
    partnership_goal: 'Scale clinical trials distribution, run FDA compliance logs audits, and optimize GPU model workloads',
    ideal_partner_type: 'Biotech companies, medical networks, cloud compute providers'
  });
  const [importedEvidence, setImportedEvidence] = useState<any[]>([]);
  const [importedTwin, setImportedTwin] = useState<any | null>(null);

  // Query backend health on mount
  useEffect(() => {
    const verifyBackend = async () => {
      const result = await checkBackendHealth();
      if (result.ok) {
        setBackendHealthy(true);
        setMode('realworld');
        if (result.data?.warning) {
          setBackendWarnings(result.data.warning.split(', '));
        }
      } else {
        console.log("[FastAPI] Offline: Running in Presentation Workspace.");
        setBackendHealthy(false);
        setMode('demo');
      }
    };
    verifyBackend();
  }, []);

  // Scraped raw signals database state
  const [rawSignals, setRawSignals] = useState<RawSignal[]>(INITIAL_RAW_SIGNALS);
  
  // Real-time telemetry speed setting
  const [signalSpeed, setSignalSpeed] = useState<'pause' | 'normal' | 'fast'>('pause');
  
  // Presentation Workspace HUD states
  const [isPresentationActive, setIsPresentationActive] = useState<boolean>(false);
  const [presentationStep, setPresentationStep] = useState<number>(0);
  
  // Tracks pool indices already injected to avoid duplicates
  const injectedPoolIdsRef = useRef<Set<string>>(new Set());

  // Dynamic Signal Stream Ingestion Loop
  useEffect(() => {
    if (signalSpeed === 'pause') return;

    const intervalMs = signalSpeed === 'fast' ? 5000 : 30000;

    const interval = setInterval(() => {
      // Find a signal in the pool not yet injected
      const availablePool = DYNAMIC_SIGNAL_POOL.filter(
        item => !injectedPoolIdsRef.current.has(item.title)
      );

      if (availablePool.length === 0) {
        console.log("Telemetry scraper pool depleted. Pause or inject custom signals.");
        setSignalSpeed('pause');
        return;
      }

      // Select a random signal from the available ones
      const randomIndex = Math.floor(Math.random() * availablePool.length);
      const selected = availablePool[randomIndex];
      injectedPoolIdsRef.current.add(selected.title);

      const newSignal: RawSignal = {
        id: `scraped-sig-${Math.random().toString(36).substr(2, 9)}`,
        companyId: selected.companyId,
        source: selected.source,
        title: selected.title,
        content: selected.content,
        timestamp: new Date().toISOString()
      };

      setRawSignals(prev => [...prev, newSignal]);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [signalSpeed]);

  // Handler for manual signal injection in stream terminal or strategy simulator
  const handleInjectSignal = (companyId: string, title: string, content: string, source: string) => {
    const customSig = createCustomSignal(companyId, title, content, source);
    injectedPoolIdsRef.current.add(title);
    setRawSignals(prev => [...prev, customSig]);
  };

  // Open target twin from Match Engine
  const handleOpenTwin = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setActiveTab('twin');
  };

  // --- REACTIVE AGENT INTELLIGENCE PIPELINE ---
  
  // Step 1: Run Classifier Agent on all raw signals
  const classifiedSignals: ClassifiedSignal[] = rawSignals.map(classifySignal);

  // Step 2: Run Business Twin Engine to calculate metrics for each enterprise profile
  const companiesList = Object.keys(BASELINE_TWINS).map(id => 
    computeBusinessTwin(id, classifiedSignals)
  );

  // Get active company twin details
  const activeTwin = companiesList.find(c => c.id === selectedCompanyId) || companiesList[0];

  // Step 3: Run Prediction Engine
  const activePredictions = generatePredictions(activeTwin, classifiedSignals);

  // Step 4: Run Strategy Recommendation Agent
  const activePlaybook = generateStrategyPlaybook(activeTwin, activePredictions, classifiedSignals);

  // Step 5: Run Action Communication Generator
  const activeActions = generateActions(activeTwin, activePlaybook);

  // --- STATE CONTROLLERS FOR PRESENTATION HUD ---
  const [, setExplainDrawerMetric] = useState<string | null>(null);
  const [, setSlackAlertFlashed] = useState<boolean>(false);

  const startPresentation = () => {
    setIsPresentationActive(true);
    setPresentationStep(0);
    setSelectedCompanyId('pfizer');
    setActiveTab('twin');
  };

  const handleClosePresentation = () => {
    setIsPresentationActive(false);
    setExplainDrawerMetric(null);
    setSlackAlertFlashed(false);
  };

  // Get total telemetry signal count for active twin
  const activeTelemetryCount = classifiedSignals.filter(s => s.companyId === selectedCompanyId).length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        companies={companiesList}
        selectedCompanyId={selectedCompanyId}
        setSelectedCompanyId={setSelectedCompanyId}
        signalSpeed={signalSpeed}
        setSignalSpeed={setSignalSpeed}
        telemetryCount={activeTelemetryCount}
        mode={mode}
        setMode={setMode}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <CompanyTwinHeader
          twin={activeTwin}
          launchJudgeDemo={startPresentation}
          isDemoActive={isPresentationActive}
        />

        <div className="content-body" style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 70px)' }}>
          {activeTab === 'presentation' && (
            <PresentationWorkspace
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setImportedEvidence={setImportedEvidence}
              setImportedTwin={setImportedTwin}
              setActiveTab={setActiveTab}
              backendHealthy={backendHealthy}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceExplorer
              evidence={importedEvidence}
              importedTwin={importedTwin}
            />
          )}

          {activeTab === 'match-engine' && (
            <PartnershipMatchEngine
              mode={mode}
              onDeployTwin={handleOpenTwin}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              backendHealthy={backendHealthy}
              backendWarnings={backendWarnings}
            />
          )}

          {activeTab === 'twin' && (
            <DashboardGrid
              twin={activeTwin}
              signals={classifiedSignals}
              predictions={activePredictions}
              onSelectTab={setActiveTab}
              playbook={activePlaybook}
            />
          )}

          {activeTab === 'signals' && (
            <SignalStream
              signals={classifiedSignals}
              onInjectSignal={handleInjectSignal}
              companies={Object.keys(BASELINE_TWINS).map(id => ({ id, name: BASELINE_TWINS[id].name }))}
            />
          )}

          {activeTab === 'map' && (
            <OpportunityMap
              twin={activeTwin}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'simulator' && (
            <StrategySimulator
              twin={activeTwin}
              onInjectSimulationSignal={(title, content, source) => 
                handleInjectSignal(activeTwin.id, title, content, source)
              }
            />
          )}

          {activeTab === 'actions' && (
            <ActionHub
              twin={activeTwin}
              playbook={activePlaybook}
              actions={activeActions}
            />
          )}
        </div>

        {/* Floating Judge Presentation HUD */}
        {isPresentationActive && (
          <JudgeDemoController
            currentStep={presentationStep}
            setCurrentStep={setPresentationStep}
            onClose={handleClosePresentation}
            setSelectedCompanyId={setSelectedCompanyId}
            setActiveTab={setActiveTab}
            onInjectSignal={handleInjectSignal}
            openExplainabilityDrawer={(metricKey) => {
              setExplainDrawerMetric(metricKey);
            }}
            closeExplainabilityDrawer={() => setExplainDrawerMetric(null)}
            setSlackTriggerFlashed={setSlackAlertFlashed}
          />
        )}
      </main>
    </div>
  );
}

export default App;
