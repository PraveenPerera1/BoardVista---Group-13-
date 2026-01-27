const mongoose = require('mongoose');

const boardingHouseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true
  },
  coordinates: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true
  }
}
,
  contact: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  price: {
    monthly: {
      type: Number,
      required: true
    },
    deposit: {
      type: Number,
      required: true
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  facilities: [{
    type: String,
    enum: ['Beds', 'Table', 'Chairs', 'Fans', 'Kitchen', 'Attached Bathroom', 'Free Electricity', 'Free Water', 'Study Area']
  }],
  roomTypes: [{
    name: {
      type: String,
      required: true
    },
    capacity: {
      type: Number,
      required: true
    },
    available: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  images: [{
    url: {
      type: String,
      required: true
    }
  }],
  description: {
    type: String,
    trim: true
  },
  nearbyServices: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Review-related fields
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Index for location-based queries
boardingHouseSchema.index({ coordinates: '2dsphere' });

boardingHouseSchema.index({ gender: 1 });
boardingHouseSchema.index({ isAvailable: 1 });
boardingHouseSchema.index({ isVerified: 1 });

module.exports = mongoose.model('BoardingHouse', boardingHouseSchema);