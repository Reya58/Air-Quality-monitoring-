const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  channelId: {
    type: String,
    required: true,
    unique: true,  // Ensure channelId is unique
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);
