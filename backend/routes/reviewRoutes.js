const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const router = express.Router();

// Import controllers
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  getReviewStats
} = require('../controllers/reviewController');

// @desc    Get all reviews for a boarding house
// @route   GET /api/review
// @access  Public
router.route('/')
  .get(getReviews)
  .post(
    protect,
    [
      body('boardingHouse').notEmpty().withMessage('Boarding house ID is required'),
      body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
      body('title').notEmpty().withMessage('Review title is required').isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters'),
      body('comment').notEmpty().withMessage('Review comment is required').isLength({ max: 500 }).withMessage('Comment cannot be more than 500 characters'),
      // Optional detailed ratings
      body('cleanliness').optional().isInt({ min: 1, max: 5 }),
      body('facilities').optional().isInt({ min: 1, max: 5 }),
      body('safety').optional().isInt({ min: 1, max: 5 }),
      body('location').optional().isInt({ min: 1, max: 5 }),
      body('value').optional().isInt({ min: 1, max: 5 }),
    ],
    createReview
  );

// @desc    Get review statistics for a boarding house
// @route   GET /api/review/stats/:boardingHouseId
// @access  Public
router.get('/stats/:boardingHouseId', getReviewStats);

// @desc    Update or delete a specific review
// @route   PUT /api/review/:id
// @route   DELETE /api/review/:id
// @access  Private
router.route('/:id')
  .put(
    protect,
    [
      body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
      body('title').optional().notEmpty().withMessage('Review title is required').isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters'),
      body('comment').optional().notEmpty().withMessage('Review comment is required').isLength({ max: 500 }).withMessage('Comment cannot be more than 500 characters'),
      // Optional detailed ratings
      body('cleanliness').optional().isInt({ min: 1, max: 5 }),
      body('facilities').optional().isInt({ min: 1, max: 5 }),
      body('safety').optional().isInt({ min: 1, max: 5 }),
      body('location').optional().isInt({ min: 1, max: 5 }),
      body('value').optional().isInt({ min: 1, max: 5 }),
    ],
    updateReview
  )
  .delete(protect, deleteReview);

module.exports = router;
