const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const ctrl = require('../controllers/authController');

const router = express.Router();

router.post('/auth/login', loginLimiter, ctrl.login);
router.get('/auth/me', requireAdmin, ctrl.me);

module.exports = router;
