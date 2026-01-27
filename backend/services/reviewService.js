const Review = require('../models/Review');
const BoardingHouse = require('../models/BoardingHouse');

class ReviewService {
  // Get all reviews for a specific boarding house
  async getReviewsByBoardingHouse(boardingHouseId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    try {
      const reviews = await Review.find({ boardingHouse: boardingHouseId })
        .populate('user', 'name profileImage')
        .populate('boardingHouse', 'title')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Review.countDocuments({ boardingHouse: boardingHouseId });

      return {
        success: true,
        data: reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Create a new review
  async createReview(reviewData) {
    try {
      // Check if boarding house exists
      const boardingHouse = await BoardingHouse.findById(reviewData.boardingHouse);
      if (!boardingHouse) {
        return {
          success: false,
          message: 'Boarding house not found'
        };
      }

      // Check if user already reviewed this boarding house
      const existingReview = await Review.findOne({
        user: reviewData.user,
        boardingHouse: reviewData.boardingHouse
      });

      if (existingReview) {
        return {
          success: false,
          message: 'You have already reviewed this boarding house'
        };
      }

      // Create the review
      const review = await Review.create(reviewData);

      // Populate and return the created review
      const populatedReview = await Review.findById(review._id)
        .populate('user', 'name profileImage')
        .populate('boardingHouse', 'title');

      return {
        success: true,
        data: populatedReview
      };
    } catch (error) {
      console.error('Error creating review:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Update a review
  async updateReview(reviewId, updateData, userId) {
    try {
      const review = await Review.findById(reviewId);

      if (!review) {
        return {
          success: false,
          message: 'Review not found'
        };
      }

      // Check if user owns the review
      if (review.user.toString() !== userId) {
        return {
          success: false,
          message: 'Not authorized to update this review'
        };
      }

      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('user', 'name profileImage')
        .populate('boardingHouse', 'title');

      return {
        success: true,
        data: updatedReview
      };
    } catch (error) {
      console.error('Error updating review:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Delete a review
  async deleteReview(reviewId, userId) {
    try {
      const review = await Review.findById(reviewId);

      if (!review) {
        return {
          success: false,
          message: 'Review not found'
        };
      }

      // Check if user owns the review
      if (review.user.toString() !== userId) {
        return {
          success: false,
          message: 'Not authorized to delete this review'
        };
      }

      await Review.findByIdAndDelete(reviewId);

      return {
        success: true,
        message: 'Review deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting review:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get review statistics for a boarding house
  async getReviewStats(boardingHouseId) {
    try {
      const stats = await Review.aggregate([
        { $match: { boardingHouse: mongoose.Types.ObjectId(boardingHouseId) } },
        {
          $group: {
            _id: '$boardingHouse',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: { $push: '$rating' }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          success: true,
          data: {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          }
        };
      }

      const result = stats[0];
      
      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      result.ratingDistribution.forEach(rating => {
        distribution[rating]++;
      });

      return {
        success: true,
        data: {
          averageRating: Math.round(result.averageRating * 10) / 10,
          totalReviews: result.totalReviews,
          ratingDistribution: distribution
        }
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get user's reviews
  async getUserReviews(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    try {
      const reviews = await Review.find({ user: userId })
        .populate('boardingHouse', 'title address')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Review.countDocuments({ user: userId });

      return {
        success: true,
        data: reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = new ReviewService();
