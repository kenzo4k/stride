// src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create base axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('access-token');
      localStorage.removeItem('user');
      window.location.replace('/Auth/login');
    }
    return Promise.reject(error);
  }
);

export default api;
