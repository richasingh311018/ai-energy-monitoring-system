// routes/analysisRoutes.js
const express = require('express');
const router = express.Router();
const {
  getConsumptionTrend,
  getDepartmentComparison,
  getHighestConsumption,
  getSummary
} = require('../controllers/analysisController');

router.get('/trend', getConsumptionTrend);
router.get('/department-comparison', getDepartmentComparison);
router.get('/highest-consumption', getHighestConsumption);
router.get('/summary', getSummary);

module.exports = router;
