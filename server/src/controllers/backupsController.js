const fs = require('fs/promises');
const path = require('path');
const { readJson, listBackups, restoreBackup, DATA_DIR } = require('../db/store');
const { logActivity } = require('../db/activityLog');

// GET /api/admin/backups
async function getBackups(req, res) {
  const backups = await listBackups();
  res.json(backups);
}

// POST /api/admin/backups/restore  { snapshot: "scripts.json.2026-09-11T...bak" }
async function restore(req, res) {
  const { snapshot } = req.body || {};
  if (!snapshot) return res.status(400).json({ error: 'snapshot is required' });

  try {
    const file = await restoreBackup(snapshot);
    logActivity(req.admin.username, 'restored a backup', file);
    res.json({ ok: true, file });
  } catch (err) {
    res.status(400).json({ error: `Couldn't restore that snapshot: ${err.message}` });
  }
}

// GET /api/admin/export — downloads every data file as one JSON bundle
async function exportAll(req, res) {
  const [scripts, executors, settings, activity] = await Promise.all([
    readJson('scripts.json'),
    readJson('executors.json'),
    readJson('settings.json'),
    readJson('activity.json')
  ]);
  // admins.json and analytics.json intentionally excluded: password hashes
  // shouldn't leave the server, and analytics isn't content worth restoring

  const bundle = { exportedAt: new Date().toISOString(), scripts, executors, settings, activity };
  logActivity(req.admin.username, 'exported a full data backup');

  res.setHeader('Content-Disposition', `attachment; filename="titanic-hub-backup-${Date.now()}.json"`);
  res.type('application/json').send(JSON.stringify(bundle, null, 2));
}

module.exports = { getBackups, restore, exportAll };
