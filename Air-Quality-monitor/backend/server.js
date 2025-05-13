const express = require('express');
const cors = require('cors');
// For making API requests
const connectDB = require('./db');
const routes = require('./routes');
const cron = require('node-cron');
const ThingSpeakData = require('./models/data');  // Your ThingSpeakData model
const Channel = require('./models/key');  // Your Channel model

const app = express();
const PORT = process.env.PORT || 5500;

// Enable CORS
const allowedOrigins = [
  'http://localhost:3000',  // Your React frontend (default port 3000)
  'https://e6e7-14-194-176-226.ngrok-free.app ',  // Your React frontend (default port 3000)
  'https://elaborate-chaja-812fc2.netlify.app'// Another domain or subdomain
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Middleware
app.use(express.json());  // To parse JSON bodies

// Connect to MongoDB
connectDB();

// Function to fetch data from ThingSpeak for a given channel
const fetchDataFromThingSpeak = async (channelId, apiKey) => {
  try {
    // Fetch data from ThingSpeak API for the given channel
    const response = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=2`);
    const data = await response.json();

    const channel = data.channel;  // Channel info
    const latestData = data.feeds[0];  // Latest feed data

    // Create a new document to save to MongoDB
    const newThingSpeakData = new ThingSpeakData({
      channelId: channel.id,
      channelName: channel.name,
      channelDescription: channel.description,
      field1: latestData.field1,  // MQ2 value
      field2: latestData.field2,  // MQ135 value
      field3: latestData.field3,  // MQ9 value
      field4: latestData.field4,  // Temperature value
      field5: latestData.field5,  // Humidity value
    });

    // Save the document to MongoDB
    await newThingSpeakData.save();
    console.log(`Data saved for channel ${channelId}:`, latestData);
  } catch (err) {
    console.error(`Error fetching data from ThingSpeak for channel ${channelId}:`, err);
  }
};

// Function to fetch data from all channels stored in MongoDB
const fetchDataFromAllChannels = async () => {
  try {
    // Get all channels from the database
    const channels = await Channel.find();

    // Loop through each channel and fetch data
    channels.forEach((channel) => {
      fetchDataFromThingSpeak(channel.channelId, channel.apiKey);
    });
  } catch (err) {
    console.error('Error fetching channels from database:', err);
  }
};

// Schedule the fetchDataFromAllChannels function to run every 15 seconds
cron.schedule('*/15 * * * * *', fetchDataFromAllChannels);

// Routes
app.use('/api', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
