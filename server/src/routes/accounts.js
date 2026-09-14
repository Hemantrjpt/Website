const express = require('express');
const { requireAdmin, requireOwner } = require('../middleware/auth');
const ctrl = require('../controllers/adminsController');

const router = express.Router();

router.get('/admin/accounts', requireAdmin, ctrl.listAccounts);
router.post('/admin/accounts', requireAdmin, requireOwner, ctrl.createAccount);
router.delete('/admin/accounts/:id', requireAdmin, requireOwner, ctrl.deleteAccount);
router.put('/admin/accounts/:id/role', requireAdmin, requireOwner, ctrl.updateRole);
router.put('/admin/accounts/me/password', requireAdmin, ctrl.changeOwnPassword);

module.exports = router;
