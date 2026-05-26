import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
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
