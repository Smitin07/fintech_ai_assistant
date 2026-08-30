import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import { checkFraud } from '../api';

export default function FraudCheck() {
  const [formData, setFormData] = useState({
    amount: '150.00',
    hour: '14',
    category: 'Groceries',
    merchant_risk: '0.10',
    transaction_type: 'Online',
    velocity_last_24h: '1',
    is_international: '0'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const categories = [
    'Groceries', 'Food', 'Shopping', 'Travel', 'Entertainment',
    'Electronics', 'Crypto/Investment', 'Money Transfer', 'Utilities', 'General'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckFraud = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const amount = parseFloat(formData.amount);
    const hour = parseInt(formData.hour, 10);

    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }
    if (isNaN(hour) || hour < 0 || hour > 23) {
      setError('Hour must be between 0 and 23.');
      return;
    }

    try {
      setLoading(true);
      const res = await checkFraud({
        amount,
        hour,
        category: formData.category,
        merchant_risk: parseFloat(formData.merchant_risk),
        transaction_type: formData.transaction_type,
        velocity_last_24h: parseInt(formData.velocity_last_24h, 10),
        is_international: parseInt(formData.is_international, 10)
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to evaluate fraud risk.');
    } finally {
      setLoading(false);
    }
  };

  // Preset demo scenarios for quick testing
  const loadScenario = (type) => {
    if (type === 'normal') {
      setFormData({
        amount: '45.00',
        hour: '14',
        category: 'Groceries',
        merchant_risk: '0.05',
        transaction_type: 'POS',
        velocity_last_24h: '2',
        is_international: '0'
      });
    } else if (type === 'suspicious') {
      setFormData({
        amount: '9500.00',
        hour: '3',
        category: 'Crypto/Investment',
        merchant_risk: '0.85',
        transaction_type: 'Online',
        velocity_last_24h: '12',
        is_international: '1'
      });
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#3b82f6" />
              AI Transaction Fraud Risk Evaluator
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Test any transaction parameters against our trained Random Forest Risk Model.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="chip-btn" onClick={() => loadScenario('normal')}>
              Load Normal Example
            </button>
            <button type="button" className="chip-btn" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fda4af' }} onClick={() => loadScenario('suspicious')}>
              Load High-Risk Example
            </button>
          </div>
        </div>

        {error && (
          <div className="alert-banner alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCheckFraud}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Transaction Amount ($)</label>
              <input 
                type="number"
                name="amount"
                step="0.01"
                min="0.01"
                className="input-control"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Transaction Hour (0–23)</label>
              <input 
                type="number"
                name="hour"
                min="0"
                max="23"
                className="input-control"
                value={formData.hour}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Category</label>
              <select 
                name="category"
                className="input-control"
                value={formData.category}
                onChange={handleInputChange}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Transaction Channel</label>
              <select 
                name="transaction_type"
                className="input-control"
                value={formData.transaction_type}
                onChange={handleInputChange}
              >
                <option value="POS">POS (Point of Sale)</option>
                <option value="Online">Online / E-Commerce</option>
                <option value="ATM">ATM Withdrawal</option>
                <option value="Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Evaluating Risk...' : 'Run Fraud Risk Check'}
            </button>
          </div>
        </form>
      </div>

      {/* Result Presentation */}
      {result && (
        <div 
          className="card" 
          style={{ 
            borderColor: result.is_suspicious ? 'rgba(244, 63, 94, 0.5)' : 'rgba(16, 185, 129, 0.5)',
            background: result.is_suspicious 
              ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(17, 24, 39, 0.95))' 
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(17, 24, 39, 0.95))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {result.is_suspicious ? (
                <div style={{ background: 'rgba(244, 63, 94, 0.2)', padding: '0.75rem', borderRadius: '12px', color: '#fb7185' }}>
                  <ShieldAlert size={32} />
                </div>
              ) : (
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '12px', color: '#34d399' }}>
                  <ShieldCheck size={32} />
                </div>
              )}
              <div>
                <h4 style={{ fontSize: '1.25rem' }}>
                  {result.is_suspicious ? 'Suspicious Transaction Detected' : 'Legitimate Transaction'}
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Evaluated with Scikit-learn Random Forest Model
                </p>
              </div>
            </div>

            <div>
              <span className={`badge ${result.is_suspicious ? 'badge-high' : 'badge-low'}`} style={{ fontSize: '0.9rem', padding: '0.4rem 0.9rem' }}>
                {result.risk_level || (result.is_suspicious ? 'High Risk' : 'Low Risk')}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div>
              <div className="stat-label">Calculated Risk Probability</div>
              <div className="stat-value" style={{ fontSize: '1.5rem', color: result.is_suspicious ? '#fb7185' : '#34d399' }}>
                {(result.risk_probability * 100).toFixed(0)}%
              </div>
            </div>

            <div>
              <div className="stat-label">Model Classification Flag</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem', color: result.is_suspicious ? '#fb7185' : '#34d399' }}>
                {result.is_suspicious ? 'Flagged (1)' : 'Approved (0)'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
