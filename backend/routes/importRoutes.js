const express = require('express');
const multer = require('multer');
const { prepareImport, importEnergy } = require('../controllers/importController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/validate', requireRole('admin', 'manager'), upload.single('file'), prepareImport);
router.post('/energy', requireRole('admin', 'manager'), upload.single('file'), importEnergy);

module.exports = router;
