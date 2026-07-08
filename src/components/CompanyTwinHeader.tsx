import React from 'react';
import { Cpu } from 'lucide-react';
import { CompanyTwin } from '../agents/types';

interface CompanyTwinHeaderProps {
  twin: CompanyTwin;
  launchJudgeDemo: () => void;
  isDemoActive: boolean;
}

export const CompanyTwinHeader: React.FC<CompanyTwinHeaderProps> = ({
  twin,
  launchJudgeDemo,
  isDemoActive
}) => {
  const getGlowColor = (score: number) => {
    if (score >= 70) return 'var(--accent-green)';
    if (score >= 50) return 'var(--accent-cyan)';
    return 'var(--accent-amber)';
  };

  const riskLevel = twin.metrics.regulatoryRisk > 50 ? 'CRITICAL' : 'LOW';

  return (
    <header style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative'
    }} className="scanline">
      {/* Top Row: Brand & Status & Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
            border: '1px solid var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontFamily: 'var(--font-header)',
            fontWeight: 700,
            color: 'var(--accent-cyan)',
            textShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
          }}>
            {twin.logo}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>{twin.name}</h1>
              <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)' }}>{twin.ticker}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '6px' }}>
                <div className="signal-pulse-dot" style={{ backgroundColor: 'var(--accent-green)' }} />
                <span style={{ fontSize: '10.5px', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  BUSINESS TWIN SYNCED
                </span>
              </div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              Strategic Business Intelligence Profile
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={launchJudgeDemo}
            className={`cyber-btn ${isDemoActive ? 'cyber-btn-accent' : ''}`}
            style={{
              padding: '8px 14px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              letterSpacing: '0.02em',
              gap: '6px',
              height: '36px'
            }}
          >
            <Cpu size={14} className="pulse-ring" />
            {isDemoActive ? 'PRESENTATION SCRIPT ACTIVE' : 'PRESENTATION WORKSPACE'}
          </button>
        </div>
      </div>

      {/* Bottom Row: Executive Summary Grid Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        backgroundColor: 'rgba(3, 7, 18, 0.4)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px 16px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>INDUSTRY</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{twin.industry}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>HEADQUARTERS</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{twin.hq}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>PERSONNEL</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{twin.employeeCount.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>WEBSITE</span>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>
            <a href={`https://${twin.website}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }} onMouseEnter={(e)=>e.currentTarget.style.textDecoration='underline'} onMouseLeave={(e)=>e.currentTarget.style.textDecoration='none'}>
              {twin.website}
            </a>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TWIN HEALTH</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-green)' }}>93% CONFIDENCE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>SIGNALS TODAY</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-cyan)' }}>{twin.metrics.buyingIntent > 70 ? 43 : 18}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>OPPORTUNITY INDEX</span>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: getGlowColor(twin.metrics.overallStrategicOpportunity) }}>
            {twin.metrics.overallStrategicOpportunity}%
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>RISK PROFILE</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: riskLevel === 'CRITICAL' ? 'var(--accent-magenta)' : 'var(--accent-amber)' }}>
            ⚠️ {riskLevel}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LAST SYNCED</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>2 min ago</span>
        </div>
      </div>
    </header>
  );
};
