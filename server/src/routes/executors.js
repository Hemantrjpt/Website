const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/executorsController');

const router = express.Router();

router.get('/executors', ctrl.listExecutors);

router.post('/admin/executors', requireAdmin, ctrl.createExecutor);
router.put('/admin/executors/:id', requireAdmin, ctrl.updateExecutor);
router.delete('/admin/executors/:id', requireAdmin, ctrl.deleteExecutor);

module.exports = router;
