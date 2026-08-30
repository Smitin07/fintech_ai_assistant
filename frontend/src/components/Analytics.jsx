import React from 'react';

export default function Analytics({ analytics }) {
  const total = analytics?.total_spending || 0;
  const average = analytics?.average_transaction || 0;
  const count = analytics?.transaction_count || 0;
  const categorySpending = analytics?.category_spending || {};

  const categories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="page-header">
        <h2>Financial Analytics</h2>
        <p>Detailed breakdown of your spending metrics and category distributions.</p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid-3">
        <div className="card stat-box">
          <div className="stat-label">Total Expenditure</div>
          <div className="stat-number">
            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-help">All recorded transactions</div>
        </div>

        <div className="card stat-box">
          <div className="stat-label">Average Spending</div>
          <div className="stat-number">
            ₹{average.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-help">Per transaction average</div>
        </div>

        <div className="card stat-box">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-number">{count}</div>
          <div className="stat-help">Number of recorded entries</div>
        </div>
      </div>

      {/* Category Breakdown Table / Chart Card */}
      <div className="card">
        <h3 className="card-title">Category Spending Breakdown</h3>

        {categories.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
            No category spending recorded yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categories.map(([category, amount]) => {
              const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
              return (
                <div key={category} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600 }}>{category}</span>
                    <span style={{ fontWeight: 700 }}>
                      ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} 
                      <span style={{ fontWeight: 400, color: 'var(--text-sub)', marginLeft: '0.4rem' }}>
                        ({percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
