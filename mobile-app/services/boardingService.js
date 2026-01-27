import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, publicApi } from '../config/api';

// --- ROBUST TOKEN READER ---
const getToken = async () => {
  try {
    console.log("🔍 Starting token retrieval...");
    
    // 1. Try Web LocalStorage first (for web platform)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const token = window.localStorage.getItem('authToken');
        console.log("🌐 Web localStorage check - token found:", !!token);
        console.log("🔍 DEBUG: LocalStorage keys:", Object.keys(window.localStorage));
        if (token) {
          console.log("✅ Token found in LocalStorage, length:", token.length);
          console.log("🔍 Token preview:", token.substring(0, 20) + "...");
          return token;
        }
      } catch (localStorageError) {
        console.error("❌ LocalStorage access failed:", localStorageError.message);
      }
    }

    // 2. Try AsyncStorage (for mobile platform)
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log("📱 AsyncStorage check - token found:", !!token);
      if (token) {
        console.log("✅ Token found in AsyncStorage, length:", token.length);
        return token;
      }
    } catch (asyncError) {
      console.log("⚠️ AsyncStorage failed:", asyncError.message);
    }

    // 3. Final fallback - try sessionStorage for web
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const token = window.sessionStorage.getItem('authToken');
        console.log("🔄 SessionStorage check - token found:", !!token);
        if (token) {
          console.log("✅ Token found in SessionStorage, length:", token.length);
          return token;
        }
      } catch (sessionError) {
        console.error("❌ SessionStorage access failed:", sessionError.message);
      }
    }

    console.log("❌ No token found in any storage");
    
    // Debug: Check if localStorage exists but token is missing
    if (typeof window !== 'undefined' && window.localStorage) {
      console.log("🔍 DEBUG: All LocalStorage keys and values:");
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        const value = window.localStorage.getItem(key);
        console.log(`  ${key}: ${value?.substring(0, 50)}...`);
      }
    }
    
    return null;
  } catch (e) {
    console.error("🚨 Error reading token:", e);
    return null;
  }
};

export const boardingService = {
  // Get all boarding listings
  getAllBoardings: async () => {
    try {
      const response = await publicApi.get('/boarding');
      return response.data.boardingHouses || response.data;
    } catch (error) {
      console.error('Error fetching boardings:', error);
      throw error;
    }
  },

  // Get boarding by ID
  getBoardingById: async (id) => {
    try {
      const response = await publicApi.get(`/boarding/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching boarding:', error);
      throw error;
    }
  },

  // Create new boarding listing (auth required)
  createBoarding: async (boardingData) => {
    try {
      // Use our Robust Reader
      const token = await getToken();

      if (!token) {
        // Debugging: Print available keys to see what went wrong
        if (typeof window !== 'undefined') {
            console.log("DEBUG: Keys in LocalStorage:", Object.keys(window.localStorage));
        }
        throw new Error('No authentication token found. Please log in again.');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await api.post('/boarding', boardingData, config);
      return response.data;
    } catch (error) {
      console.error('Error creating boarding:', error);
      throw error;
    }
  },

  updateBoarding: async (id, boardingData) => {
    try {
      const token = await getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await api.put(`/boarding/${id}`, boardingData, config);
      return response.data;
    } catch (error) {
      console.error('Error updating boarding:', error);
      throw error;
    }
  },

  deleteBoarding: async (id) => {
    try {
      const token = await getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await api.delete(`/boarding/${id}`, config);
      return response.data;
    } catch (error) {
      console.error('Error deleting boarding:', error);
      throw error;
    }
  }
};