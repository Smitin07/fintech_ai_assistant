import React, { useState } from 'react';
import { addTransaction } from '../api';

export default function Transactions({ transactions, onRefresh, loading }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    merchant: '',
    category: 'Groceries'
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'Groceries', 'Food', 'Shopping', 'Travel', 'Entertainment',
    'Electronics', 'Utilities', 'General'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(formData.amount);
    if (!numAmount || numAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive amount.' });
      return;
    }
    if (!formData.merchant.trim()) {
      setMessage({ type: 'error', text: 'Merchant name is required.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      await addTransaction({
        date: formData.date,
        amount: numAmount,
        merchant: formData.merchant.trim(),
        category: formData.category.trim()
      });

      setMessage({ type: 'success', text: 'Transaction added successfully!' });
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        merchant: '',
        category: 'Groceries'
      });
      onRefresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add transaction.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return tx.category.toLowerCase().includes(term) || tx.merchant.toLowerCase().includes(term);
  });

  return (
    <div>
      <div className="page-header">
        <h2>Transactions</h2>
        <p>Add new expenses and view complete transaction history.</p>
      </div>

      {/* Add Transaction Form Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Add Transaction
        </h3>

        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                name="date"
                className="form-input" 
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input 
                type="number" 
                name="amount"
                step="0.01" 
                min="0.01" 
                placeholder="e.g. 500.00"
                className="form-input" 
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Merchant</label>
              <input 
                type="text" 
                name="merchant"
                placeholder="e.g. Swiggy, Amazon"
                className="form-input" 
                value={formData.merchant}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleInputChange}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>

      {/* Transaction History Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
            Transaction History ({filteredTransactions.length})
          </h3>

          <div>
            <input 
              type="text"
              className="form-input"
              style={{ width: '220px', padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
              placeholder="Search merchant or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No transactions found.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--text-muted)' }}>#{tx.id}</td>
                    <td>{tx.date}</td>
                    <td style={{ fontWeight: 600 }}>{tx.merchant}</td>
                    <td>
                      <span className="badge badge-gray">{tx.category}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
