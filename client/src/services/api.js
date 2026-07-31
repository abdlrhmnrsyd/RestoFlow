import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach Sanctum Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('restoflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors and handle 401 Unauthenticated
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('restoflow_token');
      localStorage.removeItem('restoflow_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    const validationErrors = error.response?.data?.errors || null;

    return Promise.reject({
      message: errorMessage,
      errors: validationErrors,
      status: error.response?.status || 500,
    });
  }
);

export default api;
