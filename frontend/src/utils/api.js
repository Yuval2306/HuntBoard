const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  getToken() { return localStorage.getItem('at_token'); }
  setToken(token) {
    if (token) localStorage.setItem('at_token', token);
    else localStorage.removeItem('at_token');
  }

  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);
    const response = await fetch(`${this.baseUrl}${path}`, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  }

  get(path) { return this.request('GET', path); }
  post(path, body) { return this.request('POST', path, body); }
  patch(path, body) { return this.request('PATCH', path, body); }
  delete(path) { return this.request('DELETE', path); }

  async register(username, email, password) {
    const data = await this.post('/api/auth/register', { username, email, password });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.post('/api/auth/login', { email, password });
    this.setToken(data.token);
    return data;
  }

  logout() { this.setToken(null); }
  getMe() { return this.get('/api/auth/me'); }
  updateSettings(updates) { return this.patch('/api/auth/settings', updates); }

  getJobs(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/jobs${qs ? '?' + qs : ''}`);
  }
  getJob(id) { return this.get(`/api/jobs/${id}`); }
  createJob(job) { return this.post('/api/jobs', job); }
  updateJob(id, updates) { return this.patch(`/api/jobs/${id}`, updates); }
  deleteJob(id) { return this.delete(`/api/jobs/${id}`); }
  deleteAllJobs() { return this.delete('/api/jobs'); }
  getStats() { return this.get('/api/jobs/stats'); }

  getPendingReminders() { return this.get('/api/reminders/pending'); }
  sendReminder(jobId) { return this.post('/api/reminders/send', { jobId }); }
}

export const api = new ApiClient();