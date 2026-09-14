const bcrypt = require('bcryptjs');
const { readJson, writeJson, nextId } = require('../db/store');
const { logActivity } = require('../db/activityLog');

const FILE = 'admins.json';
const VALID_ROLES = ['owner', 'editor'];

function publicView(admin) {
  const { password_hash, ...rest } = admin;
  return rest;
}

function ownerCount(admins) {
  return admins.filter((a) => a.role === 'owner').length;
}

// GET /api/admin/accounts — any logged-in admin can see the list
async function listAccounts(req, res) {
  const admins = await readJson(FILE);
  res.json(admins.map(publicView));
}

// POST /api/admin/accounts — owner only
async function createAccount(req, res) {
  const { username, password, role } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  const finalRole = role || 'editor';
  if (!VALID_ROLES.includes(finalRole)) {
    return res.status(400).json({ error: 'role must be "owner" or "editor"' });
  }

  const admins = await readJson(FILE);
  if (admins.some((a) => a.username === username)) {
    return res.status(400).json({ error: 'That username is already taken' });
  }

  const id = nextId('admin', new Set(admins.map((a) => a.id)));
  const password_hash = await bcrypt.hash(password, 10);
  admins.push({ id, username, password_hash, role: finalRole, created_at: new Date().toISOString() });
  await writeJson(FILE, admins);

  logActivity(req.admin.username, `created ${finalRole} account`, username);
  res.status(201).json({ id });
}

// DELETE /api/admin/accounts/:id — owner only
async function deleteAccount(req, res) {
  const admins = await readJson(FILE);
  const target = admins.find((a) => a.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Account not found' });

  if (target.username === req.admin.username) {
    return res.status(400).json({ error: "You can't delete your own account while logged in as it" });
  }
  if (admins.length <= 1) {
    return res.status(400).json({ error: 'Cannot delete the last remaining admin account' });
  }
  if (target.role === 'owner' && ownerCount(admins) <= 1) {
    return res.status(400).json({ error: 'Cannot delete the last remaining owner' });
  }

  const next = admins.filter((a) => a.id !== req.params.id);
  await writeJson(FILE, next);

  logActivity(req.admin.username, 'deleted admin account', target.username);
  res.json({ ok: true });
}

// PUT /api/admin/accounts/:id/role — owner only, promote/demote another account
async function updateRole(req, res) {
  const { role } = req.body || {};
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'role must be "owner" or "editor"' });
  }

  const admins = await readJson(FILE);
  const target = admins.find((a) => a.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Account not found' });

  if (target.username === req.admin.username) {
    return res.status(400).json({ error: "You can't change your own role" });
  }
  if (target.role === 'owner' && role !== 'owner' && ownerCount(admins) <= 1) {
    return res.status(400).json({ error: 'Cannot demote the last remaining owner' });
  }

  target.role = role;
  await writeJson(FILE, admins);

  logActivity(req.admin.username, `changed role to ${role} for`, target.username);
  res.json({ ok: true });
}

// PUT /api/admin/accounts/me/password — change your own password, any role
async function changeOwnPassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const admins = await readJson(FILE);
  const index = admins.findIndex((a) => a.username === req.admin.username);
  if (index === -1) return res.status(404).json({ error: 'Account not found' });

  const valid = await bcrypt.compare(currentPassword, admins[index].password_hash);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

  admins[index].password_hash = await bcrypt.hash(newPassword, 10);
  await writeJson(FILE, admins);

  logActivity(req.admin.username, 'changed their own password');
  res.json({ ok: true });
}

module.exports = { listAccounts, createAccount, deleteAccount, updateRole, changeOwnPassword };
