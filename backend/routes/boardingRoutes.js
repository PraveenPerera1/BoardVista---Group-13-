const express = require('express');
const router = express.Router();
const BoardingHouse = require('../models/BoardingHouse');
const auth = require('../middleware/auth');

// Create a new boarding house listing
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      address,
      coordinates,
      email,
      phone,
      price,
      gender,
      facilities,
      roomTypes,
      images,
      description,
      nearbyServices,
      isAvailable,
      isVerified
    } = req.body;

    // Validate required fields
    if (!title || !address || !coordinates || !email || !phone || !price || !gender) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['title', 'address', 'coordinates', 'email', 'phone', 'price', 'gender']
      });
    }

    // Validate coordinates
    if (!coordinates.latitude || !coordinates.longitude) {
      return res.status(400).json({ 
        message: 'Coordinates must include latitude and longitude'
      });
    }

    // Create new boarding house
    const boardingHouse = new BoardingHouse({
      title,
      address,
      coordinates: {
        latitude: parseFloat(coordinates.latitude),
        longitude: parseFloat(coordinates.longitude)
      },
      contact: {
        email,
        phone
      },
      price: {
        monthly: parseFloat(price.monthly),
        deposit: parseFloat(price.deposit)
      },
      gender,
      facilities: facilities || [],
      roomTypes: roomTypes || [],
      images: images || [],
      description,
      nearbyServices,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isVerified: isVerified !== undefined ? isVerified : false,
      owner: req.user.id
    });

    await boardingHouse.save();
    res.status(201).json({
      message: 'Boarding house created successfully',
      boardingHouse
    });
  } catch (error) {
    console.error('Error creating boarding house:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get all boarding houses with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      gender,
      minPrice,
      maxPrice,
      facilities,
      isAvailable,
      isVerified,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};
    
    if (gender) query.gender = gender;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    
    if (minPrice || maxPrice) {
      query['price.monthly'] = {};
      if (minPrice) query['price.monthly'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.monthly'].$lte = parseFloat(maxPrice);
    }
    
    if (facilities) {
      const facilityArray = facilities.split(',');
      query.facilities = { $in: facilityArray };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const boardingHouses = await BoardingHouse.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BoardingHouse.countDocuments(query);

    res.json({
      boardingHouses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching boarding houses:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get boarding house by ID
router.get('/:id', async (req, res) => {
  try {
    const boardingHouse = await BoardingHouse.findById(req.params.id)
      .populate('owner', 'name email phone');
    
    if (!boardingHouse) {
      return res.status(404).json({ message: 'Boarding house not found' });
    }

    res.json(boardingHouse);
  } catch (error) {
    console.error('Error fetching boarding house:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update boarding house
router.put('/:id', auth, async (req, res) => {
  try {
    const boardingHouse = await BoardingHouse.findById(req.params.id);
    
    if (!boardingHouse) {
      return res.status(404).json({ message: 'Boarding house not found' });
    }

    // Check if user owns this boarding house
    if (boardingHouse.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this boarding house' });
    }

    const updates = req.body;
    
    // Handle coordinates updates
    if (updates.coordinates) {
      updates.coordinates = {
        latitude: parseFloat(updates.coordinates.latitude),
        longitude: parseFloat(updates.coordinates.longitude)
      };
    }

    // Handle contact updates
    if (updates.email || updates.phone) {
      updates.contact = {};
      if (updates.email) updates.contact.email = updates.email;
      if (updates.phone) updates.contact.phone = updates.phone;
      delete updates.email;
      delete updates.phone;
    }

    // Handle price updates
    if (updates.price) {
      updates.price = {
        monthly: parseFloat(updates.price.monthly),
        deposit: parseFloat(updates.price.deposit)
      };
    }

    const updatedBoardingHouse = await BoardingHouse.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    res.json({
      message: 'Boarding house updated successfully',
      boardingHouse: updatedBoardingHouse
    });
  } catch (error) {
    console.error('Error updating boarding house:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Delete boarding house
router.delete('/:id', auth, async (req, res) => {
  try {
    const boardingHouse = await BoardingHouse.findById(req.params.id);
    
    if (!boardingHouse) {
      return res.status(404).json({ message: 'Boarding house not found' });
    }

    // Check if user owns this boarding house
    if (boardingHouse.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this boarding house' });
    }

    await BoardingHouse.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Boarding house deleted successfully' });
  } catch (error) {
    console.error('Error deleting boarding house:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get boarding houses by owner
router.get('/owner/my-listings', auth, async (req, res) => {
  try {
    const boardingHouses = await BoardingHouse.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    res.json(boardingHouses);
  } catch (error) {
    console.error('Error fetching owner boarding houses:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Search boarding houses by location
router.get('/search/nearby', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required' 
      });
    }

    const boardingHouses = await BoardingHouse.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isAvailable: true
    }).populate('owner', 'name email');

    res.json(boardingHouses);
  } catch (error) {
    console.error('Error searching nearby boarding houses:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;