const express = require('express');
const router = express.Router();
const {
  addEnergyRecord,
  getEnergyRecords,
  getEnergyRecordById,
  updateEnergyRecord,
  deleteEnergyRecord
} = require('../controllers/energyController');

router.post('/', addEnergyRecord);
router.get('/', getEnergyRecords);
router.get('/:energyId', getEnergyRecordById);
router.put('/:energyId', updateEnergyRecord);
router.delete('/:energyId', deleteEnergyRecord);

module.exports = router;