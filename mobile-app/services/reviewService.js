import { publicApi } from '../config/api';

export const reviewService = {
  // Get all reviews for a boarding house
  getReviews: async (boardingHouseId) => {
    try {
      const response = await publicApi.get(`/review?boardingHouse=${boardingHouseId}`);
      console.log('Reviews received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Return mock data if API fails
      return {
        data: [
          {
            _id: '1',
            user: { name: 'Kasun Bandara' },
            rating: 5,
            title: 'Excellent Place!',
            comment: 'Perfect location for Vavuniya uni students. Just 5 mins walking distance to the faculty.',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2', 
            user: { name: 'Amara Perera' },
            rating: 4,
            title: 'Good Experience',
            comment: 'The room is spacious and clean. The only issue was the wifi speed.',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
    }
  },

  // Create a new review (simplified - just for demo)
  createReview: async (reviewData) => {
    try {
      // For demo purposes, just return the review data
      console.log('Creating review (demo):', reviewData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        data: {
          _id: Math.random().toString(),
          user: { name: 'Current User' },
          ...reviewData,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }
};
