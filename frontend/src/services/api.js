/**
 * API Service for SIH26017 Land Acquisition Analytics Backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeader() {
  const token = localStorage.getItem('sih_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'An error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email, password) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  getDemoUsers: () => request('/api/auth/demo-users'),
  getMe: () => request('/api/auth/me'),

  // Dashboard
  getDashboardSummary: () => request('/api/dashboard/summary'),
  getGeoData: () => request('/api/dashboard/geo-data'),
  getStageBottlenecks: () => request('/api/dashboard/stage-bottlenecks'),
  getDistrictAnalytics: () => request('/api/dashboard/district-analytics'),

  // Projects
  getProjects: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/api/projects${qs}`);
  },
  getProjectDetail: (id) => request(`/api/projects/${id}`),
  createProject: (data) => request('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProject: (id, data) => request(`/api/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  runPrediction: (id, forceRefresh = true) => request(`/api/projects/${id}/predict`, {
    method: 'POST',
    body: JSON.stringify({ force_refresh: forceRefresh })
  }),
  simulateScenario: (id, simulationData) => request(`/api/projects/${id}/simulate`, {
    method: 'POST',
    body: JSON.stringify(simulationData)
  }),

  // Documents & Stages & Compensation
  addDocument: (id, docData) => request(`/api/projects/${id}/documents`, {
    method: 'POST',
    body: JSON.stringify(docData)
  }),
  approveDocument: (id, docId) => request(`/api/projects/${id}/documents/${docId}/approve`, {
    method: 'PATCH'
  }),
  updateStage: (id, stageId, data) => request(`/api/projects/${id}/stages/${stageId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  updateCompensation: (id, data) => request(`/api/projects/${id}/compensation`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  // Alerts
  getAlerts: (status = null) => {
    const qs = status ? `?status=${status}` : '';
    return request(`/api/alerts${qs}`);
  },
  acknowledgeAlert: (id) => request(`/api/alerts/${id}/acknowledge`, { method: 'PATCH' }),
  resolveAlert: (id) => request(`/api/alerts/${id}/resolve`, { method: 'PATCH' }),

  // Actions
  getActions: (projectId = null) => {
    const qs = projectId ? `?project_id=${projectId}` : '';
    return request(`/api/actions${qs}`);
  },
  createAction: (projectId, data) => request(`/api/actions/${projectId}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateAction: (actionId, data) => request(`/api/actions/${actionId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  // Reports & Governance
  getProjectReport: (id) => request(`/api/reports/project/${id}`),
  getAuditLogs: (limit = 50) => request(`/api/reports/audit-logs?limit=${limit}`),
  getModelCard: () => request('/api/reports/model-card'),
};
