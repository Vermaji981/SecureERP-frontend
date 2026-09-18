import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("secureerp_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    if (error.response?.status === 401) {
      localStorage.removeItem("secureerp_token");
      localStorage.removeItem("secureerp_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;