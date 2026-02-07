import api from '../config/api';

// User related API calls
export const userService = {
  // User registration
  register: async (userData) => {
    try {
      console.log('=== USER SERVICE REGISTER ===');
      console.log('Sending registration data to API:', userData);
      console.log('API endpoint: /users/register');
      
      const response = await api.post('/users/register', userData);
      console.log('API response received:', response);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      console.error('Error response:', error?.response);
      console.error('Error status:', error?.response?.status);
      console.error('Error data:', error?.response?.data);
      throw error;
    }
  },

  // User login
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/users/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error sending forgot password email:', error);
      throw error;
    }
  }
};
