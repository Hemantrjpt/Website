const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing auth token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Use after requireAdmin — restricts a route to the 'owner' role only
// (account management: creating/deleting logins, changing roles).
function requireOwner(req, res, next) {
  if (req.admin?.role !== 'owner') {
    return res.status(403).json({ error: 'Only an owner can do that' });
  }
  next();
}

module.exports = { requireAdmin, requireOwner };
