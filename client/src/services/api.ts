import axios from 'axios';

const api = axios.create({
  // Production is deployed together with Express on the same Railway domain.
  baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api'),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
