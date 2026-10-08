/// <reference types="vite/client" />

import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'https://pulseloop-backend-5il0.onrender.com/api'
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions
export const auth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const patient = {
  getDashboard: () => api.get('/patient/dashboard'),
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (data: any) => api.put('/patient/profile', data),
};

export const glucose = {
  getReadings: (params?: any) => api.get('/glucose', { params }),
  addReading: (data: any) => api.post('/glucose', data),
};

export const patterns = {
  getPatterns: () => api.get('/patterns'),
  detectPatterns: () => api.post('/patterns/detect'),
  dismissPattern: (patternId: string, reason?: string) =>
    api.put(`/patterns/${patternId}/dismiss`, { reason }),
};

export const experiments = {
  getExperiments: () => api.get('/experiments'),
  getExperiment: (id: string) => api.get(`/experiments/${id}`),
  createExperiment: (data: any) => api.post('/experiments', data),
  checkIn: (id: string, data: any) => api.post(`/experiments/${id}/checkin`, data),
  complete: (id: string) => api.post(`/experiments/${id}/complete`),
};
