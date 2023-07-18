const mongoose = require('mongoose');


const LobbySchema = new mongoose.Schema({
  code: { type: String, required: true },
  type: { type: String, default: "sp" },
  players: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: { type: String },
      isWinner: { type: Boolean },
      timeSpent: { type: Number },
      didComplete: { type: Boolean },
      wordsGuessed: { type: Array },
      isCreator: { type: Boolean },
      pointsAquired: { type: Number },
    }
  ],
  game: {
    words: { type: Array },
    startedAt: { type: Date },
    endedAt: { type: Date },
    isComplete: { type: Boolean },
    mode: { type: String },
    modeName: { type: String },
    modeDescription: { type: String },
    maxDuration: { type: Number },
    maxPlayers: { type: Number },
    rewards: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward'
    }],
    category: { type: String },
    difficulty: { type: Number }
  },
  created: {
    type: Date,
    default: Date.now()
  },
});

module.exports = Lobby = mongoose.model("Lobby", LobbySchema);