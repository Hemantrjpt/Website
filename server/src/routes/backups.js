const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/backupsController');

const router = express.Router();

router.get('/admin/backups', requireAdmin, ctrl.getBackups);
router.post('/admin/backups/restore', requireAdmin, ctrl.restore);
router.get('/admin/export', requireAdmin, ctrl.exportAll);

module.exports = router;
