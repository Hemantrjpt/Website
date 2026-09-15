const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readJson } = require('../db/store');
const { logActivity } = require('../db/activityLog');

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const admins = await readJson('admins.json');
  const admin = admins.find((a) => a.username === username);
  if (!admin) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ sub: admin.id, username: admin.username, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: '12h'
  });

  logActivity(admin.username, 'logged in');
  res.json({ token, username: admin.username, role: admin.role });
}

async function me(req, res) {
  res.json({ username: req.admin.username, role: req.admin.role });
}

module.exports = { login, me };
