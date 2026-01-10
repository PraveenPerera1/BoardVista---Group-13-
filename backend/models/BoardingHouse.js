const mongoose = require('mongoose');

const boardingHouseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  address: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      default: 'Vavuniya',
    },
    state: {
      type: String,
      default: 'Northern Province',
    },
    zipCode: {
      type: String,
    },
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  price: {
    monthly: {
      type: Number,
      required: [true, 'Please add monthly rent'],
    },
    deposit: {
      type: Number,
      required: [true, 'Please add deposit amount'],
    },
  },
  facilities: [{
    type: String,
    enum: [
      'WiFi',
      'Parking',
      'Laundry',
      'Kitchen',
      'Air Conditioning',
      'Hot Water',
      'Study Room',
      'Gym',
      'Security',
      'CCTV',
      'Backup Power',
      'Water Supply',
    ],
  }],
  roomTypes: [{
    name: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    available: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  }],
  images: [{
    url: {
      type: String,
      required: true,
    },
    public_id: String,
  }],
  rules: [{
    type: String,
  }],
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

boardingHouseSchema.index({ 'address.city': 1, gender: 1 });
boardingHouseSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('BoardingHouse', boardingHouseSchema);
