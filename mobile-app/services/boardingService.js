import api from '../config/api';

// Boarding related API calls
export const boardingService = {
  // Get all boarding listings
  getAllBoardings: async () => {
    try {
      const response = await api.get('/boarding');
      return response.data;
    } catch (error) {
      console.error('Error fetching boardings:', error);
      throw error;
    }
  },

  // Get boarding by ID
  getBoardingById: async (id) => {
    try {
      const response = await api.get(`/boarding/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching boarding:', error);
      throw error;
    }
  },

  // Create new boarding listing
  createBoarding: async (boardingData) => {
    try {
      const response = await api.post('/boarding', boardingData);
      return response.data;
    } catch (error) {
      console.error('Error creating boarding:', error);
      throw error;
    }
  },

  // Update boarding listing
  updateBoarding: async (id, boardingData) => {
    try {
      const response = await api.put(`/boarding/${id}`, boardingData);
      return response.data;
    } catch (error) {
      console.error('Error updating boarding:', error);
      throw error;
    }
  },

  // Delete boarding listing
  deleteBoarding: async (id) => {
    try {
      const response = await api.delete(`/boarding/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting boarding:', error);
      throw error;
    }
  }
};
