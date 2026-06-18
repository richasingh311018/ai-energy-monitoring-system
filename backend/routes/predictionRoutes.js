// routes/predictionRoutes.js
const express = require('express');
const router = express.Router();
const { predictConsumption, getPredictions } = require('../controllers/predictionController');

router.post('/', predictConsumption);
router.get('/', getPredictions);

module.exports = router;
