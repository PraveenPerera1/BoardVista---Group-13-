import api from '../config/api';

// Admin related API calls
export const adminService = {
  // Get all boardings (admin)
  getAllBoardings: async () => {
    try {
      const response = await api.get('/admin/boardings');
      return response.data;
    } catch (error) {
      console.error('Error fetching all boardings:', error);
      throw error;
    }
  },

  // Delete boarding
  deleteBoarding: async (boardingId) => {
    try {
      const response = await api.delete(`/admin/boardings/${boardingId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting boarding:', error);
      throw error;
    }
  },

  // Get all users (admin)
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Toggle user block status
  toggleUserBlock: async (userId, blocked) => {
    try {
      const response = await api.put(`/admin/users/${userId}/block`, { blocked });
      return response.data;
    } catch (error) {
      console.error('Error toggling user block status:', error);
      throw error;
    }
  },
};
