// models/Channel.js
const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({
  channelId: {
    type: String,
    required: true,
    unique: true  // Ensure unique channel IDs across all users
  },
  apiKey: {
    type: String,
    required: true
  },
 
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Channel', ChannelSchema);
