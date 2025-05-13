// app.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const routes = require('./routes');

const app = express();



// Middleware
app.use(express.json());  // To parse JSON bodies

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', routes);

module.exports = app;
