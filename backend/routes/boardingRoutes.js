const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  getBoardingHouses,
  getBoardingHouse,
  createBoardingHouse,
  updateBoardingHouse,
  deleteBoardingHouse,
  getMyBoardingHouses,
  getNearbyBoardingHouses,
} = require('../controllers/boardingController');

router.get('/', getBoardingHouses);
router.get('/search/nearby', getNearbyBoardingHouses);
router.get('/:id', getBoardingHouse);

router.post('/',protect, createBoardingHouse);
router.put('/:id',protect, updateBoardingHouse);
router.delete('/:id',protect, deleteBoardingHouse);
router.get('/owner/my-listings',protect, getMyBoardingHouses);

module.exports = router;
