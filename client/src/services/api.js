import axios from 'axios';

const getBaseURL = () => {
  // If running in browser and hostname is NOT localhost/127.0.0.1, force relative path '/api'
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return '/api';
    }
  }
  // Fall back to environment variable or local port 5000
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Auth token to headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper for formatting API errors
export const getAPIError = (error) => {
  return (
    error.response &&
    error.response.data &&
    error.response.data.message
      ? error.response.data.message
      : error.message || 'Something went wrong'
  );
};

export default API;
