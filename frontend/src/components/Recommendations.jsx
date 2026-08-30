import React from 'react';
import { Sparkles, Lightbulb, CheckCircle2, RefreshCw } from 'lucide-react';

export default function Recommendations({ recommendations, onRefresh, loading }) {
  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={20} color="#f59e0b" />
              Smart Financial Recommendations
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Real-time heuristic recommendations based on your spending patterns and category ratios.
            </p>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh Recommendations
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!recommendations || recommendations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <p>Start adding transactions to receive automated financial insights.</p>
          </div>
        ) : (
          recommendations.map((rec, idx) => (
            <div 
              key={idx}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                borderLeft: '4px solid #3b82f6',
                background: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.65rem', borderRadius: '10px', color: '#60a5fa', flexShrink: 0, marginTop: '2px' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
                  Insight #{idx + 1}
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  {rec}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
