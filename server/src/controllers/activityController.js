const { readJson } = require('../db/store');

// GET /api/admin/activity
async function getActivity(req, res) {
  const log = await readJson('activity.json');
  res.json(log);
}

module.exports = { getActivity };
