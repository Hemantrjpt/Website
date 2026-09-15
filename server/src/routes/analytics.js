const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/analyticsController');

const router = express.Router();

router.get('/admin/analytics', requireAdmin, ctrl.getAnalytics);

module.exports = router;
