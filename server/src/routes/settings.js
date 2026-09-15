const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/settingsController');

const router = express.Router();

router.get('/settings', ctrl.getSettings);
router.put('/admin/settings', requireAdmin, ctrl.updateSettings);

module.exports = router;
