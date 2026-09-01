const API_BASE = 'https://fintech-ai-assistant.onrender.com';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to connect to backend:', err);
    return null;
  }
}

export async function getTransactions(params = {}) {
  const query = new URLSearchParams();
  if (params.skip !== undefined) query.append('skip', params.skip);
  if (params.limit !== undefined) query.append('limit', params.limit);
  if (params.category) query.append('category', params.category);
  if (params.min_amount) query.append('min_amount', params.min_amount);
  if (params.max_amount) query.append('max_amount', params.max_amount);
  if (params.start_date) query.append('start_date', params.start_date);
  if (params.end_date) query.append('end_date', params.end_date);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`${API_BASE}/transactions${qs}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch transactions');
  }
  return await res.json();
}

export async function addTransaction(transaction) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create transaction');
  }
  return await res.json();
}

export async function getAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch analytics');
  }
  return await res.json();
}

export async function checkFraud(params) {
  const query = new URLSearchParams({
    amount: params.amount,
    hour: params.hour,
  });
  if (params.category) query.append('category', params.category);
  if (params.merchant_risk !== undefined) query.append('merchant_risk', params.merchant_risk);
  if (params.transaction_type) query.append('transaction_type', params.transaction_type);
  if (params.velocity_last_24h !== undefined) query.append('velocity_last_24h', params.velocity_last_24h);
  if (params.is_international !== undefined) query.append('is_international', params.is_international);

  const res = await fetch(`${API_BASE}/fraud-check?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to check transaction risk');
  }
  return await res.json();
}

export async function getSpendingPrediction(month) {
  const res = await fetch(`${API_BASE}/spending-prediction?month=${month}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch spending prediction');
  }
  return await res.json();
}

export async function getRecommendations() {
  const res = await fetch(`${API_BASE}/recommendations`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch recommendations');
  }
  return await res.json();
}

export async function askAIAssistant(question) {
  const query = new URLSearchParams({ question });
  const res = await fetch(`${API_BASE}/assistant?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to communicate with AI assistant');
  }
  return await res.json();
}
