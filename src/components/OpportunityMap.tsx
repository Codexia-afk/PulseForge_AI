import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Sliders, Layers, ExternalLink, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { CompanyTwin } from '../agents/types';

interface OpportunityMapProps {
  twin: CompanyTwin; // Active target company twin
  onSelectTab: (tab: string) => void;
}

interface EcosystemNode {
  id: string;
  name: string;
  ticker: string;
  logo: string;
  industry: string;
  hq: string;
  employeeCount: number;
  website: string;
  category: 'partner' | 'customer' | 'vendor' | 'competitor' | 'investor' | 'regulator' | 'tech_provider';
  compatibility: number;
  businessFit: number;
  techFit: number;
  marketFit: number;
  geographicFit: number;
  growthAlignment: number;
  partnershipReadiness: number;
  risk: number;
  reason: string;
  predictedOutcome: string;
  nextStep: string;
  signals: string[];
}

export const OpportunityMap: React.FC<OpportunityMapProps> = ({
  twin,
  onSelectTab
}) => {
  // Zoom & Pan States
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  // Selected Node State (default to the current active twin ID if present)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Action status flash message
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  // Trigger flash message
  const triggerFlash = (msg: string) => {
    setFlashMessage(msg);
    setTimeout(() => setFlashMessage(null), 3000);
  };

  // Center Coordinates for SVG Map
  const cx = 275;
  const cy = 210;

  // Generate 8 target ecosystem nodes branching off GenVax AI
  const ecosystemNodes = useMemo<EcosystemNode[]>(() => [
    {
      id: 'pfizer',
      name: 'Pfizer Inc.',
      ticker: 'PFE',
      logo: '💊',
      industry: 'Pharmaceuticals & mRNA Vaccines',
      hq: 'New York, NY',
      employeeCount: 78000,
      website: 'pfizer.com',
      category: 'partner',
      compatibility: 98,
      businessFit: 96,
      techFit: 98,
      marketFit: 95,
      geographicFit: 90,
      growthAlignment: 92,
      partnershipReadiness: 94,
      risk: 15,
      reason: 'We recommend Pfizer because both companies share intensive mRNA sequence models, and Pfizer recently announced clinical data portals scaling programs.',
      predictedOutcome: 'Pfizer will establish a multi-million dollar co-development contract for computational vaccine sequence pipelines.',
      nextStep: 'Submit co-development clinical trials design draft to PFE Therapeutics Group.',
      signals: [
        'FDA ML draft guidelines compliance pipeline updates',
        'Clinical diagnostics software pilot scaling project'
      ]
    },
    {
      id: 'moderna',
      name: 'Moderna, Inc.',
      ticker: 'MRNA',
      logo: '🧬',
      industry: 'mRNA Therapeutics & Biotech',
      hq: 'Cambridge, MA',
      employeeCount: 56000,
      website: 'moderna.com',
      category: 'competitor',
      compatibility: 88,
      businessFit: 84,
      techFit: 92,
      marketFit: 85,
      geographicFit: 90,
      growthAlignment: 88,
      partnershipReadiness: 70,
      risk: 65,
      reason: 'Moderna is classified as a primary competitor. They are aggressively scaling local GPU computing environments for mRNA sequences modeling.',
      predictedOutcome: 'Moderna will release parallel software pipelines, competing for regional medical sandbox credentials.',
      nextStep: 'Deploy federated data sharing models to lock clinical networks in the APAC region.',
      signals: [
        'Moderna expands computational drug sequence workloads',
        'Patent approval for decentralized trial audit pipelines'
      ]
    },
    {
      id: 'nvidia',
      name: 'NVIDIA Corp.',
      ticker: 'NVDA',
      logo: '🟢',
      industry: 'GPU Compute & Accelerated AI',
      hq: 'Santa Clara, CA',
      employeeCount: 29000,
      website: 'nvidia.com',
      category: 'tech_provider',
      compatibility: 94,
      businessFit: 92,
      techFit: 96,
      marketFit: 90,
      geographicFit: 95,
      growthAlignment: 94,
      partnershipReadiness: 92,
      risk: 10,
      reason: 'NVIDIA is our primary GPU computing infrastructure provider. Their new BioNeMo models directly sync with GenVax accelerated trials pipelines.',
      predictedOutcome: 'NVIDIA will grant early compiler integration access, accelerating sequence queries by 4.2x.',
      nextStep: 'Apply for BioNeMo early access container integration credentials.',
      signals: [
        'NVIDIA launches Blackwell GPU architecture',
        'NVIDIA hires compiler specialists for bio-modeling'
      ]
    },
    {
      id: 'microsoft',
      name: 'Microsoft Corp.',
      ticker: 'MSFT',
      logo: '🟦',
      industry: 'Azure Cloud & Developer Tools',
      hq: 'Redmond, WA',
      employeeCount: 220000,
      website: 'microsoft.com',
      category: 'investor',
      compatibility: 90,
      businessFit: 88,
      techFit: 94,
      marketFit: 85,
      geographicFit: 90,
      growthAlignment: 92,
      partnershipReadiness: 88,
      risk: 12,
      reason: 'Microsoft is a prospective strategic investor. We leverage Azure cloud hosting nodes for decentralized clinical records audits.',
      predictedOutcome: 'Microsoft will propose corporate investment matching for GPU workloads optimization.',
      nextStep: 'Deliver security architecture brief regarding Azure compliance portals.',
      signals: [
        'Microsoft invests in specialized Azure compliance nodes',
        'Microsoft rolls out secure cloud healthcare storage'
      ]
    },
    {
      id: 'snowflake',
      name: 'Snowflake Inc.',
      ticker: 'SNOW',
      logo: '❄️',
      industry: 'SaaS Data Warehouses',
      hq: 'Bozeman, MT',
      employeeCount: 7000,
      website: 'snowflake.com',
      category: 'vendor',
      compatibility: 85,
      businessFit: 82,
      techFit: 88,
      marketFit: 85,
      geographicFit: 90,
      growthAlignment: 85,
      partnershipReadiness: 80,
      risk: 8,
      reason: 'Snowflake serves as a secure database clean room vendor. They host distributed EMR metadata tables with strict access logs audits.',
      predictedOutcome: 'Snowflake will configure automated SQL container gateways for local diagnostics queries.',
      nextStep: 'Configure Iceberg database formats inside Snowflake clean rooms.',
      signals: [
        'Snowflake partners with AWS for secure healthcare tables',
        'SaaS subscription database query optimizations'
      ]
    },
    {
      id: 'crowdstrike',
      name: 'CrowdStrike Holdings',
      ticker: 'CRWD',
      logo: '🦅',
      industry: 'Cybersecurity Endpoint Protection',
      hq: 'Austin, TX',
      employeeCount: 84000,
      website: 'crowdstrike.com',
      category: 'tech_provider',
      compatibility: 84,
      businessFit: 80,
      techFit: 88,
      marketFit: 82,
      geographicFit: 90,
      growthAlignment: 84,
      partnershipReadiness: 90,
      risk: 5,
      reason: 'CrowdStrike secures our remote telemetry nodes and SCADA smart-meter firmware channels using eBPF kernel agents.',
      predictedOutcome: 'CrowdStrike will patch security vulnerability profiles across hospital portals automatically.',
      nextStep: 'Deploy Falcon threat scanner containers across patient portal gateways.',
      signals: [
        'CrowdStrike deploys automatic memory validation sensors',
        'Vulnerability patches published for IoT SCADA endpoints'
      ]
    },
    {
      id: 'tesla',
      name: 'Tesla Energy',
      ticker: 'TSLA',
      logo: '⚡',
      industry: 'Automotive & Energy Storage',
      hq: 'Austin, TX',
      employeeCount: 140000,
      website: 'tesla.com',
      category: 'customer',
      compatibility: 76,
      businessFit: 70,
      techFit: 78,
      marketFit: 80,
      geographicFit: 85,
      growthAlignment: 75,
      partnershipReadiness: 72,
      risk: 28,
      reason: 'Tesla operates industrial grid storage. They are a prospective customer for automated SCADA smart-grid telemetry.',
      predictedOutcome: 'Tesla will purchase virtual energy storage monitoring models to optimize interconnection speeds.',
      nextStep: 'Present virtual power plantSCADA control brief to Tesla Energy directors.',
      signals: [
        'Tesla announces procurement cell agreements with VoltGrid',
        'Texas utility delays grid interconnect approvals'
      ]
    },
    {
      id: 'stripe',
      name: 'Stripe, Inc.',
      ticker: 'STRIPE',
      logo: '💳',
      industry: 'Payments & Billing Software',
      hq: 'San Francisco, CA',
      employeeCount: 8000,
      website: 'stripe.com',
      category: 'vendor',
      compatibility: 80,
      businessFit: 75,
      techFit: 85,
      marketFit: 82,
      growthAlignment: 80,
      geographicFit: 90,
      partnershipReadiness: 78,
      risk: 10,
      reason: 'Stripe acts as our B2B billing software engine, managing automated recurring subscription billing and SaaS tax compliance.',
      predictedOutcome: 'Stripe will automate localized transaction logs across APAC medical sandbox segments.',
      nextStep: 'Deploy Stripe Tax APIs inside the client checkout modules.',
      signals: [
        'Stripe rolls out recurring billing updates for AI builders',
        'Decentralized payment gateways compliance audits'
      ]
    }
  ], []);

  // Set default selected node
  useEffect(() => {
    if (!selectedNodeId && twin) {
      // Find matching twin in nodes list, or default to pfizer
      const matchingNode = ecosystemNodes.find(n => n.id === twin.id);
      setSelectedNodeId(matchingNode ? matchingNode.id : 'pfizer');
    }
  }, [selectedNodeId, twin, ecosystemNodes]);

  const activeNode = ecosystemNodes.find(n => n.id === selectedNodeId) || ecosystemNodes[0];

  // Category visual mapping
  const categoryMeta: Record<string, { label: string; color: string; line: string }> = {
    partner: { label: 'Partner', color: 'var(--accent-green)', line: '#10b981' },
    customer: { label: 'Customer', color: 'var(--accent-blue)', line: '#06b6d4' },
    vendor: { label: 'Vendor', color: 'var(--accent-amber)', line: '#f59e0b' },
    competitor: { label: 'Competitor', color: 'var(--accent-magenta)', line: '#ec4899' },
    investor: { label: 'Investor', color: '#8b5cf6', line: '#8b5cf6' }, // Purple
    regulator: { label: 'Regulator', color: '#9ca3af', line: '#9ca3af' }, // Gray
    tech_provider: { label: 'Tech Provider', color: 'var(--accent-cyan)', line: '#06b6d4' }
  };

  // Zoom & Pan Handlers
  const handleZoomIn = () => setZoom(z => Math.min(2.5, z + 0.15));
  const handleZoomOut = () => setZoom(z => Math.max(0.6, z - 0.15));
  const handleResetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Apply filters to nodes
  const filteredNodes = ecosystemNodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          node.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          node.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategoryFilter === 'all' || node.category === activeCategoryFilter;
    const matchesScore = node.compatibility >= minScoreFilter;
    return matchesSearch && matchesCategory && matchesScore;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      
      {/* Top Part: Search & Controls Banner */}
      <div className="cyber-card glow-cyan" style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0 }}>Ecosystem Filters</h3>
        </div>

        <input
          type="text"
          placeholder="Search corporate nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12.5px',
            outline: 'none',
            minWidth: '200px'
          }}
        />

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'partner', 'customer', 'vendor', 'competitor', 'investor', 'tech_provider'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              style={{
                backgroundColor: activeCategoryFilter === cat ? 'rgba(6,182,212,0.12)' : 'var(--bg-tertiary)',
                border: activeCategoryFilter === cat ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                color: activeCategoryFilter === cat ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                padding: '5px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase'
              }}
            >
              {cat === 'all' ? 'All Relations' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
          <span>Min Compatibility:</span>
          <select
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(Number(e.target.value))}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={0}>0%</option>
            <option value={80}>80%+</option>
            <option value={90}>90%+</option>
          </select>
        </div>
      </div>

      {/* Middle Part: Graph (Left) & Detail Panel (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', flex: 1, minHeight: '440px' }}>
        
        {/* LEFT COLUMN: SVG Relationship Graph */}
        <div 
          className="cyber-card glow-cyan" 
          style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            cursor: isDragging ? 'grabbing' : 'grab',
            backgroundColor: '#02050a',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Zoom / Pan Controls Overlay */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px', zIndex: 10 }}>
            <button onClick={handleZoomIn} className="cyber-btn" style={{ padding: '6px' }} title="Zoom In"><ZoomIn size={14} /></button>
            <button onClick={handleZoomOut} className="cyber-btn" style={{ padding: '6px' }} title="Zoom Out"><ZoomOut size={14} /></button>
            <button onClick={handleResetView} className="cyber-btn" style={{ padding: '6px' }} title="Reset View"><RotateCcw size={14} /></button>
          </div>

          <div style={{ position: 'absolute', top: '12px', left: '16px', display: 'flex', flexDirection: 'column', gap: '2px', zIndex: 10 }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff' }}>Ecosystem Radar Network</span>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Drag to pan. Hover node to highlight paths. Click to audit.</span>
          </div>

          <svg 
            viewBox="0 0 550 420" 
            style={{ 
              width: '100%', 
              height: '100%', 
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            <defs>
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Concentric Rings */}
            <circle cx={cx} cy={cy} r="85" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={cx} cy={cy} r="160" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="200" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="1" />

            {/* Radial Lines */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = i * (2 * Math.PI / 8);
              const x2 = cx + 220 * Math.cos(angle);
              const y2 = cy + 220 * Math.sin(angle);
              return (
                <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,0.01)" strokeWidth="1" />
              );
            })}

            {/* Connection Links */}
            {filteredNodes.map((node, i) => {
              const angle = i * (2 * Math.PI / filteredNodes.length) - Math.PI / 2;
              const radius = 160;
              const x = cx + radius * Math.cos(angle);
              const y = cy + radius * Math.sin(angle);
              
              const isSelected = selectedNodeId === node.id;
              const meta = categoryMeta[node.category] || categoryMeta.regulator;
              const linkWidth = isSelected ? 2.5 : 1.2;

              return (
                <g key={`link-${node.id}`}>
                  {/* Connection Line */}
                  <path
                    d={`M ${cx} ${cy} L ${x} ${y}`}
                    fill="none"
                    stroke={meta.line}
                    strokeWidth={linkWidth}
                    opacity={selectedNodeId ? (isSelected ? 1.0 : 0.25) : 0.6}
                    style={{ transition: 'opacity 0.2s' }}
                  />

                  {/* Flowing animated particle */}
                  {(!selectedNodeId || isSelected) && (
                    <circle r="3" fill="#fff" opacity="0.8">
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path={`M ${cx} ${cy} L ${x} ${y}`}
                        keyPoints="0;1"
                        keyTimes="0;1"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* CENTER NODE: MY BUSINESS (GenVax AI) */}
            <g style={{ cursor: 'pointer' }} onClick={() => setSelectedNodeId(null)}>
              {/* Outer pulsing ring */}
              <circle cx={cx} cy={cy} r="32" fill="url(#centerGlow)" stroke="var(--accent-cyan)" strokeWidth="1.5" opacity="0.8" />
              <circle cx={cx} cy={cy} r="22" fill="#030712" stroke="var(--accent-cyan)" strokeWidth="2.5" />
              <text cx={cx} cy={cy} x={cx} y={cy + 4} fill="#fff" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="var(--font-header)">
                🧬
              </text>
              <text x={cx} y={cy + 44} fill="var(--accent-cyan)" fontSize="9.5" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle" letterSpacing="0.05em">
                MY BUSINESS
              </text>
            </g>

            {/* Target Outer Nodes */}
            {filteredNodes.map((node, i) => {
              const angle = i * (2 * Math.PI / filteredNodes.length) - Math.PI / 2;
              const radius = 160;
              const x = cx + radius * Math.cos(angle);
              const y = cy + radius * Math.sin(angle);
              
              const isSelected = selectedNodeId === node.id;
              const meta = categoryMeta[node.category] || categoryMeta.regulator;

              return (
                <g 
                  key={`node-${node.id}`} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Highlight ring for selected node */}
                  {isSelected && (
                    <circle cx={x} cy={y} r="28" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="3 3" />
                  )}

                  <circle cx={x} cy={y} r="20" fill="#030712" stroke={meta.color} strokeWidth={isSelected ? 3.0 : 1.5} />
                  
                  {/* Node Logo Icon */}
                  <text x={x} y={y + 4} fontSize="13" textAnchor="middle">{node.logo}</text>

                  {/* Compatibility Text Label */}
                  <text 
                    x={x} 
                    y={y - 25} 
                    fill="#fff" 
                    fontSize="9.5" 
                    fontWeight="700" 
                    fontFamily="var(--font-mono)" 
                    textAnchor="middle"
                  >
                    {node.compatibility}%
                  </text>

                  {/* Company Name */}
                  <text 
                    x={x} 
                    y={y + 32} 
                    fill={isSelected ? 'var(--accent-cyan)' : '#fff'} 
                    fontSize="10" 
                    fontWeight={isSelected ? 700 : 500} 
                    textAnchor="middle"
                  >
                    {node.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* RIGHT COLUMN: Relationship Intelligence Panel */}
        <div className="cyber-card glow-cyan" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '12px' }}>
            <Activity size={16} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '14px', color: '#fff', margin: 0 }}>Relationship Intelligence</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                {activeNode.logo}
              </div>
              <div>
                <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: 700, margin: 0 }}>{activeNode.name}</h4>
                <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: '9px', marginTop: '2px', textTransform: 'uppercase' }}>
                  {activeNode.category.replace('_', ' ')}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
              {activeNode.industry} — Headquarters: <strong>{activeNode.hq}</strong>
            </p>

            {/* Compatibility Score Breakdown */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>COMPATIBILITY SCORE</span>
                <strong style={{ fontSize: '18px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{activeNode.compatibility}%</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Business Fit:</span> <strong style={{ color: '#fff' }}>{activeNode.businessFit}%</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tech Fit:</span> <strong style={{ color: '#fff' }}>{activeNode.techFit}%</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Market Fit:</span> <strong style={{ color: '#fff' }}>{activeNode.marketFit}%</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Geographic Fit:</span> <strong style={{ color: '#fff' }}>{activeNode.geographicFit}%</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Growth Align:</span> <strong style={{ color: '#fff' }}>{activeNode.growthAlignment}%</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Risk Rating:</span> <strong style={{ color: 'var(--accent-magenta)' }}>{activeNode.risk}%</strong>
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            <div>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                AI Recommendation brief
              </span>
              <div style={{ backgroundColor: 'rgba(6,182,212,0.02)', border: '1px solid rgba(6,182,212,0.1)', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', color: '#fff', lineHeight: '1.4' }}>
                "We recommend {activeNode.name} because both companies share compute models, and {activeNode.name} recently announced public API integration scaling programs."
              </div>
            </div>

            {/* Outcome & Next Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Predicted Outcome</span>
                <span style={{ color: '#fff' }}>🔮 {activeNode.predictedOutcome}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Recommended Next Step</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>🎯 {activeNode.nextStep}</span>
              </div>
            </div>

            {/* Scraped signals evidence */}
            <div>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Supporting Scraped Evidence
              </span>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activeNode.signals.map((sig, idx) => (
                  <li key={idx}>{sig}</li>
                ))}
              </ul>
            </div>

            {/* Website Link */}
            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Estimated Partnership Window: <strong style={{ color: '#fff' }}>Q3</strong></span>
              <a 
                href={`https://${activeNode.website}`} 
                target="_blank" 
                rel="noreferrer" 
                style={{ fontSize: '11px', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                onMouseEnter={(e)=>e.currentTarget.style.textDecoration='underline'} 
                onMouseLeave={(e)=>e.currentTarget.style.textDecoration='none'}
              >
                {activeNode.website} <ExternalLink size={10} />
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Part: Explainability Timeline (Left) & Executive Actions (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flexShrink: 0 }}>
        
        {/* LEFT: Explainability Timeline */}
        <div className="cyber-card glow-cyan" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ fontSize: '13.5px', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} color="var(--accent-cyan)" />
            AI Explainability Timeline (Ecosystem Calibrations)
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', position: 'relative' }}>
            {[
              { title: 'NVIDIA Blackwell Launched', effect: 'Technology Fit +12%', desc: 'Shared compute architecture validation.' },
              { title: 'GenVax GPU Scaling', effect: 'Business Fit +8%', desc: 'Synergy matching algorithm weights recalculation.' },
              { title: 'APAC Regulatory Sandbox', effect: 'Geographic Fit +5%', desc: 'Local medical credentials sandbox alignment.' },
              { title: 'Overall Index Recalibrated', effect: 'Recalculation Complete', desc: 'Composite model rating updated dynamically.' }
            ].map((step, idx) => (
              <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px', padding: '8px 10px', position: 'relative' }}>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', display: 'block', fontWeight: 600 }}>{step.effect}</span>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#fff', marginTop: '2px', lineHeight: '1.2' }}>{step.title}</div>
                <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', display: 'block', marginTop: '2px', lineHeight: '1.2' }}>{step.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Executive Actions */}
        <div className="cyber-card glow-cyan" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
          <h4 style={{ fontSize: '13.5px', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={14} color="var(--accent-cyan)" />
            Executive Actions & Playbooks
          </h4>

          {flashMessage && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '6px 12px', fontSize: '11.5px', color: 'var(--accent-green)', textAlign: 'center' }}>
              ✓ {flashMessage}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            <button 
              onClick={() => {
                onSelectTab('twin');
                triggerFlash('Opened Business Twin profile.');
              }}
              className="cyber-btn"
              style={{ fontSize: '10.5px', padding: '8px 4px', justifyContent: 'center', textAlign: 'center' }}
            >
              Open Twin
            </button>
            <button 
              onClick={() => triggerFlash('Outreach pitch email copied to draft.')}
              className="cyber-btn"
              style={{ fontSize: '10.5px', padding: '8px 4px', justifyContent: 'center', textAlign: 'center' }}
            >
              Email Pitch
            </button>
            <button 
              onClick={() => triggerFlash('LinkedIn message draft generated.')}
              className="cyber-btn"
              style={{ fontSize: '10.5px', padding: '8px 4px', justifyContent: 'center', textAlign: 'center' }}
            >
              LinkedIn DM
            </button>
            <button 
              onClick={() => {
                onSelectTab('actions');
                triggerFlash('Navigated to Playbook Action Hub.');
              }}
              className="cyber-btn"
              style={{ fontSize: '10.5px', padding: '8px 4px', justifyContent: 'center', textAlign: 'center' }}
            >
              Playbook
            </button>
            <button 
              onClick={() => triggerFlash('Autonomous PDF Report compilation initialized.')}
              className="cyber-btn"
              style={{ fontSize: '10.5px', padding: '8px 4px', justifyContent: 'center', textAlign: 'center' }}
            >
              Report
            </button>
            <button 
              onClick={() => triggerFlash('Continuous telemetry scraping active.')}
              className="cyber-btn"
              style={{ fontSize: '10.5px', padding: '8px 4px', justifyContent: 'center', textAlign: 'center' }}
            >
              Monitor
            </button>
            <button 
              onClick={() => triggerFlash('Twin comparison grid launched.')}
              className="cyber-btn"
              style={{ fontSize: '10.5px', padding: '8px 4px', justifyContent: 'center', textAlign: 'center' }}
            >
              Compare
            </button>
            <button 
              onClick={() => triggerFlash('Data schema exported as CSV/PDF.')}
              className="cyber-btn"
              style={{ fontSize: '10.5px', padding: '8px 4px', justifyContent: 'center', textAlign: 'center' }}
            >
              Export
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
