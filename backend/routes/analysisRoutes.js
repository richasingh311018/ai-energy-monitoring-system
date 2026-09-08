// routes/analysisRoutes.js
const express = require('express');
const router = express.Router();
const {
  getConsumptionTrend,
  getDepartmentComparison,
  getHighestConsumption,
  getSummary,
  getOperationalInsights
} = require('../controllers/analysisController');

router.get('/trend', getConsumptionTrend);
router.get('/department-comparison', getDepartmentComparison);
router.get('/highest-consumption', getHighestConsumption);
router.get('/summary', getSummary);
router.get('/insights', getOperationalInsights);
router.get('/intelligence', getOperationalInsights);

module.exports = router;
