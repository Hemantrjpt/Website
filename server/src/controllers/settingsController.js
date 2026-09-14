const { readJson, writeJson } = require('../db/store');
const { logActivity } = require('../db/activityLog');

const FILE = 'settings.json';

// GET /api/settings — public, powers the whole site's editable content
async function getSettings(req, res) {
  const settings = await readJson(FILE);
  res.json(settings);
}

// PUT /api/admin/settings — admin update. Accepts a full or partial settings
// object and merges it shallowly at the top level (each top-level key —
// hero, pillars, faq, disclaimer, etc. — is replaced wholesale when sent,
// so the client always sends the complete section it's editing).
async function updateSettings(req, res) {
  const current = await readJson(FILE);
  const updated = { ...current, ...(req.body || {}) };
  await writeJson(FILE, updated);

  const sections = Object.keys(req.body || {}).join(', ') || 'settings';
  logActivity(req.admin.username, 'updated site settings', sections);
  res.json(updated);
}

module.exports = { getSettings, updateSettings };
