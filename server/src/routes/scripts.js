const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/scriptsController');
const analyticsCtrl = require('../controllers/analyticsController');

const router = express.Router();

// public
router.get('/scripts', ctrl.listScripts);
router.get('/scripts/:slug', ctrl.getScriptBySlug);
router.post('/scripts/:slug/track', analyticsCtrl.trackEvent);

// admin (protected) — sees drafts too
router.get('/admin/scripts', requireAdmin, ctrl.listScriptsAdmin);
router.get('/admin/scripts/:id', requireAdmin, ctrl.getScriptByIdAdmin);
router.post('/admin/scripts', requireAdmin, ctrl.createScript);
router.put('/admin/scripts/:id', requireAdmin, ctrl.updateScript);
router.delete('/admin/scripts/:id', requireAdmin, ctrl.deleteScript);
router.post('/admin/scripts/:id/changelog', requireAdmin, ctrl.addChangelogEntry);
router.delete('/admin/changelog/:entryId', requireAdmin, ctrl.deleteChangelogEntry);

module.exports = router;
