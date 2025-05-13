const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
ThingSpeakData = require('../models/data'); // Assuming you have a model for ThingSpeak data
const axios = require('axios'); // For making HTTP requests to the Python API
const mongoose = require('mongoose');
const moment = require('moment');  
const Channel = require('../models/key'); // Assuming you have a model for Channel
// To work with timestamps

const threeHoursAgo = moment().subtract(3, 'hours').toDate(); 

// Register new user
exports.register = async (req, res) => {
  const { channelId, password, apiKey } = req.body;

  try {
    // Check if the channelId is already registered (for uniqueness)
    const existingChannel = await Channel.findOne({ channelId });
    if (existingChannel) {
      return res.status(400).json({ message: 'ChannelID already registered' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ channelId, password: hashedPassword });
    await newUser.save();

    // Create the channel linked to the new user
    const newChannel = new Channel({
      channelId,
      apiKey,
      user: newUser._id  // Associate the channel with the user
    });

    // Save the channel data
    await newChannel.save();

    // Respond with success
    res.status(201).json({ message: 'User and channel registered successfully', user: newUser, channel: newChannel });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { channelId, password } = req.body;
  try {
    const user = await User.findOne({ channelId });
    if (!user) {
      return res.status(400).json({ message: 'Invalid ChannelID or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid ChannelID or password' });
    }

    // JWT token (optional)
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

  
exports.getLatestData = async (req, res) => {
  const { channelId } = req.body;  // Get channelId from URL parameters
 console.log('Channel ID:', channelId);  // Log the channelId for debugging
  try {
    // Fetch the latest data for the given channelId
    const latestData = await ThingSpeakData.find({ channelId })  // Filter by channelId
      .sort({ timestamp: -1 })  // Sort by timestamp to get the latest
      .limit(1);  // Limit to only the latest entry

    if (!latestData.length) {
      return res.status(404).json({ message: 'No data found for the given channelId' });
    }

    res.status(200).json(latestData[0]);  // Send the latest document for the specific channelId
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

  


exports.getPrediction = async (req, res) => {
  const { channelId } = req.body;  // Get channelId from URL parameters

  try {
    // Step 1: Get data from the past 3 hours for the specific channelId
    const threeHoursAgo = moment().subtract(3, 'hours').toDate();
    const recentData = await ThingSpeakData.find({
      channelId,  // Filter by channelId
      timestamp: { $gte: threeHoursAgo }  // Filter records with timestamp greater than or equal to 3 hours ago
    }).sort({ timestamp: 1 });  // Sort by timestamp in ascending order

    if (recentData.length === 0) {
      return res.status(404).json({ message: `No data found for channel ${channelId} in the past 3 hours` });
    }

    // Step 2: Prepare the payload with combined data (averaging values over 3 hours)
    const aggregatedData = {
      "MQ2": 0,
      "MQ135": 0,
      "MQ9": 0,
      "TEMPERATURE": 0,
      "HUMIDITY": 0
    };

    recentData.forEach(item => {
      aggregatedData["MQ2"] += parseFloat(item.field1);
      aggregatedData["MQ135"] += parseFloat(item.field2);
      aggregatedData["MQ9"] += parseFloat(item.field3);
      aggregatedData["TEMPERATURE"] += parseFloat(item.field4);  // Assuming the temperature is in field4
      aggregatedData["HUMIDITY"] += parseFloat(item.field5);  // Assuming the humidity is in field5
    });

    // Average the values over the 3 hours
    const dataCount = recentData.length;
    aggregatedData["MQ2"] /= dataCount;
    aggregatedData["MQ135"] /= dataCount;
    aggregatedData["MQ9"] /= dataCount;
    aggregatedData["TEMPERATURE"] /= dataCount;
    aggregatedData["HUMIDITY"] /= dataCount;

    // Step 3: Send aggregated data to Flask API
    const flaskResponse = await fetch('http://127.0.0.1:5001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aggregatedData)  // Send the aggregated data as a single payload
    });

    const prediction = await flaskResponse.json();
    console.log('Prediction from Flask:', prediction);

    // Step 4: Send prediction to frontend
    res.status(200).json({
      message: `Prediction successful for channel ${channelId} from past 3 hours of data`,
      prediction: prediction
    });

  } catch (error) {
    console.error('Error in /api/pred:', error);
    res.status(500).json({ message: 'Prediction failed', error: error.message });
  }
};

