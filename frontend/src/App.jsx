import React, { useState, useEffect, useCallback } from 'react';
import { 
  checkBackendHealth, 
  getTransactions, 
  getAnalytics, 
  getRecommendations 
} from './api';

import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
import FraudCheck from './components/FraudCheck';
import SpendingPrediction from './components/SpendingPrediction';
import Recommendations from './components/Recommendations';
import Assistant from './components/Assistant';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const health = await checkBackendHealth();
      setIsOnline(!!health);

      if (health) {
        const [txList, analyticsData, recsData] = await Promise.all([
          getTransactions().catch(() => []),
          getAnalytics().catch(() => null),
          getRecommendations().catch(() => ({ recommendations: [] }))
        ]);

        setTransactions(txList || []);
        setAnalytics(analyticsData);
        setRecommendations(recsData?.recommendations || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      const health = await checkBackendHealth();
      setIsOnline(!!health);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'fraud', label: 'Fraud Check' },
    { id: 'prediction', label: 'Spending Prediction' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'assistant', label: 'AI Assistant' },
  ];

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="header-top">
          <div className="header-brand">
            <span style={{ fontSize: '1.25rem' }}>💳</span>
            <span className="header-title">FinTech AI Assistant</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="header-status">
              <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
              <span>{isOnline ? 'FastAPI Connected' : 'FastAPI Offline'}</span>
            </div>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        <nav className="navbar">
          {navTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="container">
        {activeTab === 'dashboard' && (
          <Dashboard 
            analytics={analytics}
            transactions={transactions}
            recommendations={recommendations}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'transactions' && (
          <Transactions 
            transactions={transactions}
            onRefresh={loadData}
            loading={loading}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics 
            analytics={analytics}
          />
        )}

        {activeTab === 'fraud' && (
          <FraudCheck />
        )}

        {activeTab === 'prediction' && (
          <SpendingPrediction />
        )}

        {activeTab === 'recommendations' && (
          <Recommendations 
            recommendations={recommendations}
            onRefresh={loadData}
            loading={loading}
          />
        )}

        {activeTab === 'assistant' && (
          <Assistant />
        )}
      </main>

      <footer className="footer">
        FinTech Transaction Risk & Personal Finance Assistant • FastAPI + Scikit-learn + React
      </footer>
    </div>
  );
}
