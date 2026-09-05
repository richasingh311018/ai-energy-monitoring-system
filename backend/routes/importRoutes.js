const express = require('express');
const multer = require('multer');
const { prepareImport, importEnergy } = require('../controllers/importController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/validate', upload.single('file'), prepareImport);
router.post('/energy', upload.single('file'), importEnergy);

module.exports = router;
