// models/Energy.js
const mongoose = require('mongoose');

const energySchema = new mongoose.Schema({
  energyId: {
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
  energyConsumed: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { timestamps: true });

energySchema.index({ departmentId: 1, date: 1 });

module.exports = mongoose.model('Energy', energySchema);
