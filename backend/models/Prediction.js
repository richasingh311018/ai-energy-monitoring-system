// models/Prediction.js
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  predictionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  departmentId: {
    type: String,
    required: true,
    ref: 'Department'
  },
  predictedConsumption: {
    type: Number,
    required: true
  },
  predictionDate: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Prediction', predictionSchema);
