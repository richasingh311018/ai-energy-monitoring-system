require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const departmentRoutes = require('./routes/departmentRoutes');
const energyRoutes = require('./routes/energyRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const importRoutes = require('./routes/importRoutes');
const { REFINERY_DEPARTMENTS } = require('./config/refineryDepartments');
const Department = require('./models/Department');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/departments', departmentRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/import', importRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Energy Monitor API is healthy' });
});

app.get('/', (req, res) => {
  res.json({ message: '⚡ Energy Monitor API running!' });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/energy_monitoring')
  .then(() => {
    return Promise.all(REFINERY_DEPARTMENTS.map((department) => Department.updateOne(
      { departmentId: department.departmentId },
      { $setOnInsert: department },
      { upsert: true, runValidators: true }
    )));
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });