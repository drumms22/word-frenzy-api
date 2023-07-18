const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  data: {
    type: String,
  },
  gameData: {
    totalPoints: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    totalChallengesCompleted: {
      type: Number,
      default: 0
    },
    totalWordsCompleted: {
      type: Number,
      default: 0
    },
    totalCharCount: {
      type: Number,
      default: 0
    },
    speedData: {
      totalChar: {
        type: Number,
        default: 0
      },
      totalTime: {
        type: Number,
        default: 0
      }
    }
  },
  rewards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward'
  }],
  username: {
    type: String,
  }
});

module.exports = User = mongoose.model("User", UserSchema);