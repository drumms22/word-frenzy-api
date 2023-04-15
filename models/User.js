const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  data: {
    type: String,
  },
  username: {
    type: String,
  }
});

module.exports = User = mongoose.model("User", UserSchema);