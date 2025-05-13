const mongoose = require('mongoose');

const thingSpeakDataSchema = new mongoose.Schema({
  channelId: {
    type: Number,
    required: true,
  },
  channelName: {
    type: String,
    required: true,
  },
  channelDescription: {
    type: String,
    required: true,
  },
  field1: {
    type: String,
    required: true,  // Example: MQ9
  },
  field2: {
    type: String,
    required: true,  // Example: MQ135
  },
  field3: {
    type: String,
    required: true,  // Example: MQ2
  },
  field4: {
    type: String,
    required: true,  // Example: Temperature
  },
  field5: {
    type: String,
    required: true,  // Example: Humidity
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ThingSpeakData', thingSpeakDataSchema);
