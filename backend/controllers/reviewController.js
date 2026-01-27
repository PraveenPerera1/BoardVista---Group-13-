const Review = require('../models/Review');
const BoardingHouse = require('../models/BoardingHouse');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Get all reviews for a boarding house
// @route   GET /api/review
// @access  Public
const getReviews = async (req, res) => {
  try {
    const { boardingHouse } = req.query;
    let query = {};
    
    if (boardingHouse) {
      query.boardingHouse = boardingHouse;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate('user', 'name profileImage')
      .populate('boardingHouse', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new review
// @route   POST /api/review
// @access  Private
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { boardingHouse, rating, title, comment } = req.body;

    // Check if boarding house exists
    const boardingHouseExists = await BoardingHouse.findById(boardingHouse);
    if (!boardingHouseExists) {
      return res.status(404).json({
        success: false,
        message: 'Boarding house not found',
      });
    }

    // Check if user already reviewed this boarding house
    const existingReview = await Review.findOne({
      user: req.user.id,
      boardingHouse,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this boarding house',
      });
    }

    // Create review
    req.body.user = req.user.id;
    const review = await Review.create(req.body);

    // Populate and return the created review
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name profileImage')
      .populate('boardingHouse', 'title');

    res.status(201).json({
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a review
// @route   PUT /api/review/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review',
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name profileImage')
      .populate('boardingHouse', 'title');

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/review/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get review statistics for a boarding house
// @route   GET /api/review/stats/:boardingHouseId
// @access  Public
const getReviewStats = async (req, res) => {
  try {
    const { boardingHouseId } = req.params;

    const stats = await Review.aggregate([
      { $match: { boardingHouse: mongoose.Types.ObjectId(boardingHouseId) } },
      {
        $group: {
          _id: '$boardingHouse',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      });
    }

    const result = stats[0];
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result.ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    res.status(200).json({
      success: true,
      data: {
        averageRating: Math.round(result.averageRating * 10) / 10,
        totalReviews: result.totalReviews,
        ratingDistribution: distribution
      }
    });
  } catch (error) {
    console.error('Error getting review stats:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  getReviewStats,
};
