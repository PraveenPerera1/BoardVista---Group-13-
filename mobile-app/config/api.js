import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' // Use localhost to match frontend origin
  : 'https://your-production-api.com/api'; // Production URL later

// Main authenticated API instance (for user/owner operations)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Use localStorage for web, AsyncStorage for mobile
      let token;
      if (typeof window !== 'undefined') {
        // Web environment
        token = localStorage.getItem('authToken');
      } else {
        // Mobile environment
        token = await AsyncStorage.getItem('authToken');
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token being sent:', token);
        console.log('Authorization header:', config.headers.Authorization);
      }
    } catch (error) {
      console.log('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized, redirecting to login');
    }
    return Promise.reject(error);
  }
);

// Public API instance (for boarding operations - no auth)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api, publicApi };
export default api;
