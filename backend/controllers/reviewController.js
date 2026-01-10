const Review = require('../models/Review');
const BoardingHouse = require('../models/BoardingHouse');
const { validationResult } = require('express-validator');

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

    const boardingHouseExists = await BoardingHouse.findById(boardingHouse);
    if (!boardingHouseExists) {
      return res.status(404).json({
        success: false,
        message: 'Boarding house not found',
      });
    }

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

    req.body.user = req.user.id;

    const review = await Review.create(req.body);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name profileImage')
      .populate('boardingHouse', 'title');

    res.status(201).json({
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

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
};
