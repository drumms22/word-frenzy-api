const mongoose = require('mongoose');

const LobbyInviteSchema = new mongoose.Schema({
  lobbyCode: { type: String, required: true },
  playerFrom: { type: String, required: true },
  playerTo: { type: String, required: true },
  created: { type: Date, required: true, default: Date.now },
  accepted: { type: Boolean, required: true, default: false }
});

module.exports = LobbyInvite = mongoose.model("LobbyInvite", LobbyInviteSchema);