const mongoose = require('mongoose');


const LobbySchema = new mongoose.Schema({
  code: { type: String, required: true },
  players: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: { type: String },
      isWinner: { type: Boolean },
      duration: { type: Number },
      didComplete: { type: Boolean },
      wordsGuessed: { type: Array },
      isCreator: { type: Boolean },
    }
  ],
  game: {
    words: { type: Array },
    startedAt: { type: Date },
    endedAt: { type: Date },
    isComplete: { type: Boolean },
    type: { type: String },
    totalDuration: { type: Number },
    maxPlayers: { type: Number },
    difficulty: { type: Number },
    points: { type: Number },
  },
  created: {
    type: Date,
    default: Date.now
  },
});

module.exports = Lobby = mongoose.model("Lobby", LobbySchema);