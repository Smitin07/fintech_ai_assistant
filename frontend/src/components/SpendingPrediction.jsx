import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, Sparkles, AlertCircle } from 'lucide-react';
import { getSpendingPrediction } from '../api';

export default function SpendingPrediction({ analytics }) {
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const months = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' },
  ];

  const fetchPrediction = async (monthNum) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSpendingPrediction(monthNum);
      setPrediction(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch spending prediction.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction(selectedMonth);
  }, [selectedMonth]);

  const monthName = months.find(m => m.num === Number(selectedMonth))?.name || 'Selected Month';

  return (
    <div>
      {/* Month Selection Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="#3b82f6" />
          Forecast Monthly Expenditure
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Select a calendar month to forecast projected spending using our Gradient Boosting Regressor model.
        </p>

        {error && (
          <div className="alert-banner alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {months.map(m => (
            <button
              key={m.num}
              type="button"
              className={`chip-btn ${selectedMonth === m.num ? 'active' : ''}`}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                background: selectedMonth === m.num ? 'rgba(59, 130, 246, 0.25)' : undefined,
                borderColor: selectedMonth === m.num ? '#3b82f6' : undefined,
                color: selectedMonth === m.num ? '#ffffff' : undefined,
                fontWeight: selectedMonth === m.num ? 600 : 400
              }}
              onClick={() => setSelectedMonth(m.num)}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Prediction Output Card */}
      {prediction && (
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(17, 24, 39, 0.95))', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.65rem', borderRadius: '10px', color: '#60a5fa' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem' }}>Expenditure Forecast for {monthName}</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Estimated using transaction volume and seasonal historical models
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div className="stat-label">Projected Spending</div>
              <div className="stat-value" style={{ color: '#60a5fa' }}>
                ${Number(prediction.predicted_spending).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="stat-subtext">Estimated total expense for {monthName}</div>
            </div>

            {prediction.baseline_spending !== undefined && (
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div className="stat-label">Historical Baseline</div>
                <div className="stat-value" style={{ color: '#94a3b8' }}>
                  ${Number(prediction.baseline_spending).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="stat-subtext">Calculated from recent transaction history</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
