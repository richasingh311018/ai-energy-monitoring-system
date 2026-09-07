// routes/predictionRoutes.js
const express = require('express');
const { requireRole } = require('../middleware/auth');
const router = express.Router();
const { predictConsumption, getPredictions } = require('../controllers/predictionController');

router.post('/', requireRole('admin', 'manager'), predictConsumption);
router.get('/', getPredictions);

module.exports = router;
