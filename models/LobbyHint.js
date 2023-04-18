const mongoose = require('mongoose');

const LobbyHintSchema = new mongoose.Schema({
  lobbyCode: { type: String, required: true },
  word: { type: String, required: true },
  hint1: { type: String, required: true },
  hint2: { type: String, required: true }
});

module.exports = LobbyHint = mongoose.model("LobbyHint", LobbyHintSchema);