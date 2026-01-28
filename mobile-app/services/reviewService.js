import { publicApi } from '../config/api';

// In-memory storage for demo reviews (this will reset on app reload)
let demoReviews = [];

export const reviewService = {
  // Get all reviews for a boarding house
  getReviews: async (boardingHouseId) => {
    try {
      const response = await publicApi.get(`/review?boardingHouse=${boardingHouseId}`);
      console.log('Reviews received:', response.data);
      
      // Check if API returned any reviews
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      }
      
      // If API returned empty or no data, use demo reviews
      console.log('API returned empty reviews, using demo storage');
      const filteredReviews = demoReviews.filter(review => 
        review.boardingHouse === boardingHouseId
      );
      
      // If no demo reviews for this boarding house, return default mock data
      if (filteredReviews.length === 0) {
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
      
      return { data: filteredReviews };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Return demo reviews if API fails
      const filteredReviews = demoReviews.filter(review => 
        review.boardingHouse === boardingHouseId
      );
      
      // If no demo reviews for this boarding house, return default mock data
      if (filteredReviews.length === 0) {
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
      
      return { data: filteredReviews };
    }
  },

  // Create a new review (demo version)
  createReview: async (reviewData) => {
    try {
      console.log('Creating review (demo):', reviewData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create the new review
      const newReview = {
        _id: Math.random().toString(36).substr(2, 9),
        user: { name: 'Current User' },
        ...reviewData,
        createdAt: new Date().toISOString()
      };
      
      // Store in demo reviews array
      demoReviews.push(newReview);
      
      console.log('Review stored in demo storage:', newReview);
      console.log('All demo reviews:', demoReviews);
      
      return {
        success: true,
        data: newReview
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }
};
