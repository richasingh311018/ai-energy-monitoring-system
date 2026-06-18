// server.js
// Entry point for the AI-Based Energy Consumption Monitoring and Analysis System backend

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const departmentRoutes = require('./routes/departmentRoutes');
const energyRoutes = require('./routes/energyRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/departments', departmentRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AI-Based Energy Consumption Monitoring and Analysis System API is running' });
});

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/energy_monitoring';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
