const express = require('express');
const { requireRole } = require('../middleware/auth');
const router = express.Router();
const {
  addEnergyRecord,
  getEnergyRecords,
  getEnergyRecordById,
  updateEnergyRecord,
  deleteEnergyRecord
} = require('../controllers/energyController');

router.post('/', requireRole('admin', 'manager'), addEnergyRecord);
router.get('/', getEnergyRecords);
router.get('/:energyId', getEnergyRecordById);
router.put('/:energyId', requireRole('admin', 'manager'), updateEnergyRecord);
router.delete('/:energyId', requireRole('admin'), deleteEnergyRecord);

module.exports = router;