// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMonthlyReport,
  getDepartmentReport,
  getConsumptionSummaryReport,
  getPredictionReport
} = require('../controllers/reportController');

router.get('/monthly', getMonthlyReport);
router.get('/department/:departmentId', getDepartmentReport);
router.get('/summary', getConsumptionSummaryReport);
router.get('/predictions', getPredictionReport);

module.exports = router;
