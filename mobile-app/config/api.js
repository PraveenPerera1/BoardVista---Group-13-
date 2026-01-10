import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Detect if running in web or native
const isWeb = typeof window !== 'undefined';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://10.66.87.89:5000/api' // Your Wi-Fi IP address
  : 'https://your-production-api.com/api'; // Production URL later

// Create axios instance
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
      // Get token from AsyncStorage (native) or localStorage (web)
      let token;
      if (isWeb) {
        token = localStorage.getItem('authToken');
      } else {
        token = await AsyncStorage.getItem('authToken');
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
      // Handle unauthorized access
      console.log('Unauthorized, redirecting to login');
    }
    return Promise.reject(error);
  }
);

export default api;
