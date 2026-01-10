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
  },
  comment: {
    type: String,
    required: [true, 'Please add a review comment'],
  },
  cleanliness: {
    type: Number,
    min: 1,
    max: 5,
  },
  facilities: {
    type: Number,
    min: 1,
    max: 5,
  },
  safety: {
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
  images: [{
    url: String,
    public_id: String,
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  helpful: {
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

reviewSchema.index({ boardingHouse: 1, user: 1 }, { unique: true });
reviewSchema.index({ boardingHouse: 1 });

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
    await this.model('BoardingHouse').findByIdAndUpdate(boardingHouseId, {
      averageRating: Math.ceil(obj[0] ? obj[0].averageRating : 0),
      reviewCount: obj[0] ? obj[0].reviewCount : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.boardingHouse);
});

reviewSchema.post('remove', async function () {
  await this.constructor.getAverageRating(this.boardingHouse);
});

module.exports = mongoose.model('Review', reviewSchema);
