const express = require('express');
const { login, me, logout } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', me);
router.post('/logout', requireAuth, logout);

module.exports = router;
