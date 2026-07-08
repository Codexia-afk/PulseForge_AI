import React, { useState, useEffect } from 'react';
import { Radio, MapPin, Activity, Sliders, Play, Pause, FastForward, Briefcase, Sparkles, BookOpen, FileSearch } from 'lucide-react';
import { CompanyTwin } from '../agents/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companies: CompanyTwin[];
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  signalSpeed: 'pause' | 'normal' | 'fast';
  setSignalSpeed: (speed: 'pause' | 'normal' | 'fast') => void;
  telemetryCount: number;
  mode: 'realworld' | 'demo';
  setMode: (mode: 'realworld' | 'demo') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  companies,
  selectedCompanyId,
  setSelectedCompanyId,
  signalSpeed,
  setSignalSpeed,
  telemetryCount,
  mode,
  setMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClose = () => setIsDropdownOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'presentation', name: 'Presentation Workspace', icon: BookOpen },
    { id: 'match-engine', name: 'AI Partnership Matcher', icon: Sparkles },
    { id: 'twin', name: 'Business Twin', icon: Activity },
    { id: 'evidence', name: 'Evidence Explorer', icon: FileSearch },
    { id: 'signals', name: 'Signal Intelligence', icon: Radio, badge: telemetryCount },
    { id: 'map', name: 'Strategic Ecosystem', icon: MapPin },
    { id: 'simulator', name: 'Scenario Simulator', icon: Sliders },
    { id: 'actions', name: 'Action Hub', icon: Briefcase },
  ];

  return (
    <aside className="sidebar">
      {/* Header / Brand */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
        }}>
          <img
            src="/pulseforge-icon.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div>
          <h2 style={{
            fontSize: '17px',
            fontFamily: 'var(--font-header)',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #fff, #9ca3af)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            PULSEFORGE AI
          </h2>
          <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.1em' }}>
            STRATEGIC COGNITION
          </span>
        </div>
      </div>

      {/* My Business Profile Card */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(6, 182, 212, 0.02)' }}>
        <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
          My Business
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
            🧬
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              GenVax AI
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block' }}>
              Healthcare AI & Biotech
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TWIN STATUS</span>
            <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }} /> LIVE
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONFIDENCE</span>
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>94%</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SIGNALS TODAY</span>
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>{148 + telemetryCount}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LAST UPDATED</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>2 min ago</span>
          </div>
        </div>
      </div>

      {/* Bloomberg-Style Company Explorer */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', position: 'relative' }}
      >
        <label style={{ fontSize: '9.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
          Company Explorer
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search any company..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              padding: '8px 10px 8px 30px',
              fontSize: '12px',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
          <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '12px' }}>🔍</span>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Floating Bloomberg Search Dropdown */}
        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '20px',
            right: '20px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
            zIndex: 100,
            marginTop: '4px',
            maxHeight: '220px',
            overflowY: 'auto'
          }}>
            {filteredCompanies.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center' }}>
                No companies found
              </div>
            ) : (
              filteredCompanies.map(c => {
                const isSelected = selectedCompanyId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCompanyId(c.id);
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                      setActiveTab('twin');
                    }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.02)',
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                      transition: 'all 0.15s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        {c.industry}
                      </div>
                    </div>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', border: '1px solid rgba(6,182,212,0.3)', padding: '1px 4px', borderRadius: '4px' }}>
                      {c.ticker}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13.5px'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} color={isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: '10px', padding: '1px 5px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mode Control & Simulator Control Board */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'rgba(3, 7, 18, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Top-Level Mode Selector */}
        <div>
          <label style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            marginBottom: '8px',
            display: 'block'
          }}>
            System Operations Mode
          </label>
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px'
          }}>
            <button
              onClick={() => setMode('realworld')}
              style={{
                flex: 1,
                fontSize: '10.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                padding: '6px 2px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: mode === 'realworld' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: mode === 'realworld' ? 'var(--accent-green)' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              REAL-WORLD
            </button>
            <button
              onClick={() => setMode('demo')}
              style={{
                flex: 1,
                fontSize: '10.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                padding: '6px 2px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: mode === 'demo' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: mode === 'demo' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              PRESENTATION
            </button>
          </div>
        </div>

        {/* Live Signal Influx Scraping */}
        <div>
          <label style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            marginBottom: '8px',
            display: 'block'
          }}>
            Live Signal Telemetry
          </label>
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '4px',
            gap: '2px'
          }}>
            <button
              onClick={() => setSignalSpeed('pause')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: signalSpeed === 'pause' ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                color: signalSpeed === 'pause' ? 'var(--accent-magenta)' : 'var(--text-secondary)'
              }}
              title="Pause Ingestion"
            >
              <Pause size={13} />
            </button>
            <button
              onClick={() => setSignalSpeed('normal')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: signalSpeed === 'normal' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: signalSpeed === 'normal' ? 'var(--accent-green)' : 'var(--text-secondary)'
              }}
              title="Normal Speed (30s)"
            >
              <Play size={13} />
            </button>
            <button
              onClick={() => setSignalSpeed('fast')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: signalSpeed === 'fast' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: signalSpeed === 'fast' ? 'var(--accent-cyan)' : 'var(--text-secondary)'
              }}
              title="Accelerated Ingestion (5s)"
            >
              <FastForward size={13} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
