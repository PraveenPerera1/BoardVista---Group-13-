const express = require('express');
const router = express.Router();

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

router.post('/', createBoardingHouse);
router.put('/:id', updateBoardingHouse);
router.delete('/:id', deleteBoardingHouse);
router.get('/owner/my-listings', getMyBoardingHouses);

module.exports = router;
