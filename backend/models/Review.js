const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  boardingHouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoardingHouse',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: [true, 'Please add a review title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  comment: {
    type: String,
    required: [true, 'Please add a review comment'],
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters'],
  },
  
  facilities: {
    type: Number,
    min: 1,
    max: 5,
  },
  
  location: {
    type: Number,
    min: 1,
    max: 5,
  },
  value: {
    type: Number,
    min: 1,
    max: 5,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for preventing duplicate reviews
reviewSchema.index({ boardingHouse: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.getAverageRating = async function (boardingHouseId) {
  const obj = await this.aggregate([
    {
      $match: { boardingHouse: boardingHouseId },
    },
    {
      $group: {
        _id: '$boardingHouse',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await this.model('BoardingHouse').findByIdAndUpdate(boardingHouseId, {
        averageRating: Math.round(obj[0].averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: obj[0].reviewCount,
      });
    } else {
      await this.model('BoardingHouse').findByIdAndUpdate(boardingHouseId, {
        averageRating: 0,
        reviewCount: 0,
      });
    }
  } catch (err) {
    console.error('Error updating boarding house rating:', err);
  }
};

// Post-save hook to update average rating
reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.boardingHouse);
});

// Post-remove hook to update average rating
reviewSchema.post('remove', async function () {
  await this.constructor.getAverageRating(this.boardingHouse);
});

module.exports = mongoose.model('Review', reviewSchema);
