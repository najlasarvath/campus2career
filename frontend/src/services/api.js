/**
 * Frontend API client service for Campus2Career
 * Points to the backend Express server with JWT authentication support.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'campus2career_jwt_token';

export const tokenStorage = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (err) {
      console.error('Failed to set token in localStorage', err);
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.error('Failed to clear token', err);
    }
  }
};

async function handleResponse(response) {
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = (data && typeof data === 'object' && (data.message || data.error))
      ? (data.message || data.error)
      : (typeof data === 'string' && data ? data : `HTTP ${response.status}: ${response.statusText}`);

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const apiClient = {
  getToken: tokenStorage.get,
  setToken: tokenStorage.set,
  clearToken: tokenStorage.clear,

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const headers = { ...options.headers };

    // Inject Bearer token if present and not explicitly provided
    const token = tokenStorage.get();
    if (token && !headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Determine body handling
    let body = options.body;
    if (body instanceof FormData) {
      // Do not set Content-Type; browser will set boundary multipart/form-data
      delete headers['Content-Type'];
      delete headers['content-type'];
    } else if (body && typeof body === 'object') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    const response = await fetch(url, {
      ...options,
      headers,
      body
    });

    return handleResponse(response);
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, data, isMultipart = false, options = {}) {
    let body = data;
    if (isMultipart && !(data instanceof FormData)) {
      body = data;
    }
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body
    });
  },

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};

export default apiClient;
