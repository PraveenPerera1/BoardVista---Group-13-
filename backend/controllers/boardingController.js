const BoardingHouse = require('../models/BoardingHouse');
const { validationResult } = require('express-validator');

const getBoardingHouses = async (req, res) => {
  try {
    let query = {};

    if (req.query.gender) {
      query.gender = req.query.gender;
    }

    if (req.query.city) {
      query['address.city'] = new RegExp(req.query.city, 'i');
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query['price.monthly'] = {};
      if (req.query.minPrice) {
        query['price.monthly'].$gte = parseInt(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query['price.monthly'].$lte = parseInt(req.query.maxPrice);
      }
    }

    if (req.query.facilities) {
      const facilities = req.query.facilities.split(',');
      query.facilities = { $all: facilities };
    }

    if (req.query.isVerified) {
      query.isVerified = req.query.isVerified === 'true';
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const boardingHouses = await BoardingHouse.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BoardingHouse.countDocuments(query);

    res.status(200).json({
      success: true,
      count: boardingHouses.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: boardingHouses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBoardingHouse = async (req, res) => {
  try {
    const boardingHouse = await BoardingHouse.findById(req.params.id)
      .populate('owner', 'name email phone profileImage');

    if (!boardingHouse) {
      return res.status(404).json({
        success: false,
        message: 'Boarding house not found',
      });
    }

    res.status(200).json({
      success: true,
      data: boardingHouse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createBoardingHouse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    req.body.owner = req.user.id;

    const boardingHouse = await BoardingHouse.create(req.body);

    const populatedBoardingHouse = await BoardingHouse.findById(
      boardingHouse._id
    ).populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      data: populatedBoardingHouse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBoardingHouse = async (req, res) => {
  try {
    let boardingHouse = await BoardingHouse.findById(req.params.id);

    if (!boardingHouse) {
      return res.status(404).json({
        success: false,
        message: 'Boarding house not found',
      });
    }

    if (boardingHouse.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this boarding house',
      });
    }

    boardingHouse = await BoardingHouse.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('owner', 'name email phone');

    res.status(200).json({
      success: true,
      data: boardingHouse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBoardingHouse = async (req, res) => {
  try {
    const boardingHouse = await BoardingHouse.findById(req.params.id);

    if (!boardingHouse) {
      return res.status(404).json({
        success: false,
        message: 'Boarding house not found',
      });
    }

    if (boardingHouse.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this boarding house',
      });
    }

    await boardingHouse.remove();

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

const getMyBoardingHouses = async (req, res) => {
  try {
    const boardingHouses = await BoardingHouse.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: boardingHouses.length,
      data: boardingHouses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getNearbyBoardingHouses = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude',
      });
    }

    const boardingHouses = await BoardingHouse.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    })
      .populate('owner', 'name email phone')
      .limit(20);

    res.status(200).json({
      success: true,
      count: boardingHouses.length,
      data: boardingHouses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBoardingHouses,
  getBoardingHouse,
  createBoardingHouse,
  updateBoardingHouse,
  deleteBoardingHouse,
  getMyBoardingHouses,
  getNearbyBoardingHouses,
};
