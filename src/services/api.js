import axios from "axios";

// ========================================
// API Base URL
// ========================================

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ========================================
// Request Interceptor
// Attach JWT Token
// ========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("secureerp_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========================================
// Response Interceptor
// Centralized Error Handling
// ========================================

api.interceptors.response.use(
  (response) => {
    return response.data;
  },

  (error) => {
    const status = error.response?.status;

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again.";

    // ========================================
    // Unauthorized
    // ========================================

    if (status === 401) {
      localStorage.removeItem("secureerp_token");
      localStorage.removeItem("secureerp_user");

      // Redirect only if user is not already on login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // ========================================
    // Forbidden
    // ========================================

    if (status === 403) {
      console.error("Access forbidden:", message);
    }

    // ========================================
    // Server Error
    // ========================================

    if (status >= 500) {
      console.error("Server error:", message);
    }

    return Promise.reject(new Error(message));
  }
);

// ========================================
// Export API Instance
// ========================================

export default api;