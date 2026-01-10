const express = require('express');
const { body } = require('express-validator');
const {
  getBoardingHouses,
  getBoardingHouse,
  createBoardingHouse,
  updateBoardingHouse,
  deleteBoardingHouse,
  getMyBoardingHouses,
  getNearbyBoardingHouses,
} = require('../controllers/boardingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getBoardingHouses)
  .post(
    // protect,
    // authorize('owner'),
    [
      body('title').notEmpty().withMessage('Title is required'),
      body('description').notEmpty().withMessage('Description is required'),
      body('address.street').notEmpty().withMessage('Street address is required'),
      body('address.city').notEmpty().withMessage('City is required'),
      body('coordinates.latitude').isFloat().withMessage('Valid latitude is required'),
      body('coordinates.longitude').isFloat().withMessage('Valid longitude is required'),
      body('price.monthly').isNumeric().withMessage('Monthly price must be a number'),
      body('price.deposit').isNumeric().withMessage('Deposit must be a number'),
      body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
    ],
    createBoardingHouse
  );

router.route('/nearby').get(getNearbyBoardingHouses);
router.route('/my').get(protect, authorize('owner'), getMyBoardingHouses);

router.route('/:id')
  .get(getBoardingHouse)
  .put(
    protect,
    authorize('owner'),
    [
      body('title').optional().notEmpty().withMessage('Title cannot be empty'),
      body('description').optional().notEmpty().withMessage('Description cannot be empty'),
      body('price.monthly').optional().isNumeric().withMessage('Monthly price must be a number'),
      body('price.deposit').optional().isNumeric().withMessage('Deposit must be a number'),
    ],
    updateBoardingHouse
  )
  .delete(protect, authorize('owner'), deleteBoardingHouse);

module.exports = router;
