const express = require('express');
const router = express.Router();
const SensorData = require('./SensorDataModel');  // Import your model

// Endpoint to get data from MongoDB
router.get('/getData', async (req, res) => {
  try {
    const data = await SensorData.find().sort({ timestamp: -1 }).limit(1); // Get the latest data entry
    if (!data) {
      return res.status(404).json({ message: 'No data found' });
    }
    res.json(data);  // Send data to frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
