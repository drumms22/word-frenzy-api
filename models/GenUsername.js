const mongoose = require('mongoose');

const genUsernameSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = GenUsername = mongoose.model('GenUsername', genUsernameSchema);