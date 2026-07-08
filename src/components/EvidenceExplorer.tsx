import React from 'react';
import { ExternalLink, FileSearch, ShieldAlert } from 'lucide-react';

interface EvidenceExplorerProps {
  evidence: any[];
  importedTwin: any | null;
}

export const EvidenceExplorer: React.FC<EvidenceExplorerProps> = ({ evidence, importedTwin }) => {
  const getHost = (item: any) => {
    if (item.source) return item.source;
    try {
      return new URL(item.url).hostname;
    } catch {
      return 'unknown-source';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      <div className="cyber-card glow-cyan" style={{ overflowY: 'auto' }}>
        <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSearch size={17} color="var(--accent-cyan)" />
          Evidence Explorer
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Every card below is a public source record used to build or explain the imported Business Twin.
        </p>

        {evidence.length === 0 && (
          <div style={{ border: '1px solid rgba(245,158,11,0.2)', backgroundColor: 'rgba(245,158,11,0.05)', borderRadius: '10px', padding: '16px', color: 'var(--accent-amber)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <ShieldAlert size={18} />
            <div>
              <strong>Insufficient public evidence.</strong>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                Import a company website to populate the evidence database.
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {evidence.map((item) => {
            const host = getHost(item);
            const favicon = `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
            return (
              <article key={item.id} style={{ backgroundColor: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={favicon} alt="" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: '#fff', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span className="cyber-badge cyber-badge-cyan">{item.category}</span>
                  <span className="cyber-badge cyber-badge-green">{item.confidence}% confidence</span>
                  <span className="cyber-badge cyber-badge-blue">Impact {item.impact}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{item.snippet}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(item.timestamp).toLocaleString()}</span>
                  <a href={item.url} target="_blank" rel="noreferrer" className="cyber-btn" style={{ fontSize: '11px', padding: '6px 8px', textDecoration: 'none' }}>
                    Open Source <ExternalLink size={12} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <aside className="cyber-card glow-cyan" style={{ overflowY: 'auto' }}>
        <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '12px' }}>Twin Evidence Summary</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <Metric label="Company" value={importedTwin?.name || 'Insufficient public evidence.'} />
          <Metric label="Confidence" value={importedTwin?.confidenceLabel || 'Low Confidence'} />
          <Metric label="Evidence Count" value={String(importedTwin?.evidenceCount || evidence.length)} />
          <Metric label="Trusted Sources" value={String(importedTwin?.trustedEvidenceSources || 0)} />
          <Metric label="Last Updated" value={importedTwin?.lastUpdated ? new Date(importedTwin.lastUpdated).toLocaleString() : 'Unknown'} />
        </div>

        <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border-color)', paddingTop: '14px' }}>
          <h4 style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>RECOMMENDATIONS</h4>
          {(importedTwin?.recommendations || []).map((rec: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <strong style={{ color: '#fff' }}>{rec.title}</strong>
              <div>{rec.recommendation}</div>
              <div style={{ color: 'var(--accent-cyan)', marginTop: '4px' }}>Confidence: {rec.confidence}%</div>
            </div>
          ))}
          {(!importedTwin?.recommendations || importedTwin.recommendations.length === 0) && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Insufficient public evidence.</span>
          )}
        </div>
      </aside>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ backgroundColor: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
    <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label.toUpperCase()}</div>
    <div style={{ fontSize: '12px', color: '#fff', marginTop: '4px', lineHeight: 1.35 }}>{value}</div>
  </div>
);
