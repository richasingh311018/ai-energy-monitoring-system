// controllers/predictionController.js
const Energy = require('../models/Energy');
const Department = require('../models/Department');
const Prediction = require('../models/Prediction');
const { trainLinearRegression, predict } = require('../utils/linearRegression');

// @desc    Train model on historical data and predict future consumption for a department
// @route   POST /api/predict
// @body    { departmentId, daysAhead }
exports.predictConsumption = async (req, res) => {
  try {
    const { departmentId, daysAhead = 1 } = req.body;

    if (!departmentId) {
      return res.status(400).json({ success: false, message: 'departmentId is required' });
    }

    const department = await Department.findOne({ departmentId });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Fetch historical records sorted by date ascending
    const records = await Energy.find({ departmentId }).sort({ date: 1 });

    if (records.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Not enough historical data to make a prediction. At least 2 records are required.'
      });
    }

    const firstDate = new Date(records[0].date);

    // Build training points: x = days since first record, y = energy consumed
    const points = records.map(r => {
      const diffDays = Math.round((new Date(r.date) - firstDate) / (1000 * 60 * 60 * 24));
      return { x: diffDays, y: r.energyConsumed };
    });

    // Train model
    const model = trainLinearRegression(points);

    // Predict for "daysAhead" days after the last recorded date
    const lastX = points[points.length - 1].x;
    const futureX = lastX + parseInt(daysAhead, 10);
    const predictedValue = predict(model, futureX);

    const predictionDate = new Date(firstDate);
    predictionDate.setDate(predictionDate.getDate() + futureX);

    // Save prediction to DB
    const predictionId = `PRED-${departmentId}-${Date.now()}`;
    const predictionRecord = await Prediction.create({
      predictionId,
      departmentId,
      predictedConsumption: Math.round(predictedValue * 100) / 100,
      predictionDate
    });

    res.status(200).json({
      success: true,
      data: {
        departmentId,
        departmentName: department.departmentName,
        predictedConsumption: predictionRecord.predictedConsumption,
        predictionDate: predictionRecord.predictionDate,
        model: { slope: model.slope, intercept: model.intercept },
        trainedOnRecords: records.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all stored predictions (optionally by department)
// @route   GET /api/predict?departmentId=D001
exports.getPredictions = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const filter = {};
    if (departmentId) filter.departmentId = departmentId;

    const predictions = await Prediction.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: predictions.length, data: predictions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
