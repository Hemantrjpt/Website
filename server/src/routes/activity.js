const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/activityController');

const router = express.Router();

router.get('/admin/activity', requireAdmin, ctrl.getActivity);

module.exports = router;
