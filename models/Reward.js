const mongoose = require('mongoose');

const rewardsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  badgeImageUrl: {
    type: String,
    required: true
  }
});

module.exports = Reward = mongoose.model('Reward', rewardsSchema);