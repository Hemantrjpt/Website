const BASE = '/api';

function authHeaders() {
  const token = localStorage.getItem('th_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    }
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${BASE}/admin/upload`, {
    method: 'POST',
    headers: authHeaders(), // no Content-Type — the browser sets the multipart boundary itself
    body: formData
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Upload failed (${res.status})`);
  }
  return data; // { url }
}

async function exportBackup() {
  const res = await fetch(`${BASE}/admin/export`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `titanic-hub-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export const api = {
  // public
  getScripts: () => request('/scripts'),
  getScript: (slug) => request(`/scripts/${slug}`),
  getExecutors: () => request('/executors'),
  getSettings: () => request('/settings'),
  trackEvent: (slug, type) =>
    request(`/scripts/${slug}/track`, { method: 'POST', body: JSON.stringify({ type }) }).catch(() => {}), // never blocks the UI

  // auth
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => request('/auth/me'),

  // admin: uploads
  uploadImage,

  // admin: settings
  updateSettings: (payload) => request('/admin/settings', { method: 'PUT', body: JSON.stringify(payload) }),

  // admin: scripts (sees drafts too)
  getScriptsAdmin: () => request('/admin/scripts'),
  getScriptByIdAdmin: (id) => request(`/admin/scripts/${id}`),
  createScript: (payload) => request('/admin/scripts', { method: 'POST', body: JSON.stringify(payload) }),
  updateScript: (id, payload) => request(`/admin/scripts/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteScript: (id) => request(`/admin/scripts/${id}`, { method: 'DELETE' }),
  addChangelogEntry: (scriptId, payload) =>
    request(`/admin/scripts/${scriptId}/changelog`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteChangelogEntry: (entryId) => request(`/admin/changelog/${entryId}`, { method: 'DELETE' }),

  // admin: executors
  createExecutor: (payload) => request('/admin/executors', { method: 'POST', body: JSON.stringify(payload) }),
  updateExecutor: (id, payload) => request(`/admin/executors/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteExecutor: (id) => request(`/admin/executors/${id}`, { method: 'DELETE' }),

  // admin: accounts
  getAccounts: () => request('/admin/accounts'),
  createAccount: (username, password, role) =>
    request('/admin/accounts', { method: 'POST', body: JSON.stringify({ username, password, role }) }),
  deleteAccount: (id) => request(`/admin/accounts/${id}`, { method: 'DELETE' }),
  updateAccountRole: (id, role) => request(`/admin/accounts/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  changeOwnPassword: (currentPassword, newPassword) =>
    request('/admin/accounts/me/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),

  // admin: analytics
  getAnalytics: () => request('/admin/analytics'),

  // admin: activity log
  getActivity: () => request('/admin/activity'),

  // admin: backups
  getBackups: () => request('/admin/backups'),
  restoreBackup: (snapshot) => request('/admin/backups/restore', { method: 'POST', body: JSON.stringify({ snapshot }) }),
  exportBackup
};
