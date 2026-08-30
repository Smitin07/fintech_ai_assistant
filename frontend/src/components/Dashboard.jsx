import React from 'react';

export default function Dashboard({ 
  analytics, 
  transactions, 
  recommendations, 
  setActiveTab 
}) {
  const totalSpending = analytics?.total_spending || 0;
  const avgTx = analytics?.average_transaction || 0;
  const txCount = analytics?.transaction_count || 0;
  const categorySpending = analytics?.category_spending || {};

  const categories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]);
  const topCategory = categories.length > 0 ? categories[0][0] : 'None';

  return (
    <div>
      <div className="page-header">
        <h2>Financial Overview</h2>
        <p>Summary of your overall expenses and recent financial activity.</p>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid-3">
        <div className="card stat-box">
          <div className="stat-label">Total Spending</div>
          <div className="stat-number">
            ₹{totalSpending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-help">{txCount} recorded transactions</div>
        </div>

        <div className="card stat-box">
          <div className="stat-label">Average Transaction</div>
          <div className="stat-number">
            ₹{avgTx.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-help">Mean expense amount</div>
        </div>

        <div className="card stat-box">
          <div className="stat-label">Top Expense Category</div>
          <div className="stat-number" style={{ fontSize: '1.35rem' }}>
            {topCategory}
          </div>
          <div className="stat-help">Highest spending category</div>
        </div>
      </div>

      {/* Insight Banner */}
      {recommendations && recommendations.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          <strong>💡 AI Recommendation:</strong>
          <span>{recommendations[0]}</span>
        </div>
      )}

      {/* 2-Column Grid: Category Spending & Recent Transactions */}
      <div className="grid-2">
        {/* Category Breakdown Card */}
        <div className="card">
          <div className="card-title">
            <span>Category Spending</span>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('analytics')}
            >
              View All
            </button>
          </div>

          {categories.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No transaction data available yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {categories.slice(0, 5).map(([category, amount]) => {
                const percentage = totalSpending > 0 ? ((amount / totalSpending) * 100).toFixed(1) : 0;
                return (
                  <div key={category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 500 }}>{category}</span>
                      <span style={{ fontWeight: 600 }}>
                        ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({percentage}%)
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

        {/* Recent Transactions Card */}
        <div className="card">
          <div className="card-title">
            <span>Recent Transactions</span>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('transactions')}
            >
              Manage
            </button>
          </div>

          {transactions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No transactions recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {transactions.slice(0, 5).map(tx => (
                <div 
                  key={tx.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.65rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    background: '#fafafa'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{tx.merchant}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                      {tx.date} • <span className="badge badge-gray">{tx.category}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                    ₹{Number(tx.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
