const express = require('express');
const { body } = require('express-validator');
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getReviews)
  .post(
    protect,
    [
      body('boardingHouse').notEmpty().withMessage('Boarding house ID is required'),
      body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
      body('title').notEmpty().withMessage('Review title is required'),
      body('comment').notEmpty().withMessage('Review comment is required'),
      body('cleanliness').optional().isInt({ min: 1, max: 5 }),
      body('facilities').optional().isInt({ min: 1, max: 5 }),
      body('safety').optional().isInt({ min: 1, max: 5 }),
      body('location').optional().isInt({ min: 1, max: 5 }),
      body('value').optional().isInt({ min: 1, max: 5 }),
    ],
    createReview
  );

router.route('/:id')
  .put(
    protect,
    [
      body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
      body('title').optional().notEmpty().withMessage('Review title cannot be empty'),
      body('comment').optional().notEmpty().withMessage('Review comment cannot be empty'),
    ],
    updateReview
  )
  .delete(protect, deleteReview);

module.exports = router;
