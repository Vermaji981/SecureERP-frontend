import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('secureerp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized error messaging
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message || 'An unexpected error occurred';

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.response.status === 401 && window.location.pathname !== '/login') {
        localStorage.removeItem('secureerp_token');
        localStorage.removeItem('secureerp_user');
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
