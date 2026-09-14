const { readJson, writeJson } = require('../db/store');

const FILE = 'analytics.json';

function emptyStats() {
  return { views: 0, clicks: 0 };
}

// POST /api/scripts/:slug/track  { type: "view" | "click" } — public, no auth
// (anyone loading the page or clicking "Get script" triggers this)
async function trackEvent(req, res) {
  const { type } = req.body || {};
  if (type !== 'view' && type !== 'click') {
    return res.status(400).json({ error: 'type must be "view" or "click"' });
  }

  const analytics = await readJson(FILE);
  const slug = req.params.slug;
  analytics[slug] = analytics[slug] || emptyStats();
  analytics[slug][type === 'view' ? 'views' : 'clicks'] += 1;
  await writeJson(FILE, analytics);
  res.json({ ok: true });
}

// GET /api/admin/analytics — admin dashboard
async function getAnalytics(req, res) {
  const analytics = await readJson(FILE);
  const scripts = await readJson('scripts.json');

  const rows = scripts.map((s) => ({
    slug: s.slug,
    name: s.name,
    status: s.status,
    views: analytics[s.slug]?.views || 0,
    clicks: analytics[s.slug]?.clicks || 0
  }));

  res.json(rows.sort((a, b) => b.views - a.views));
}

module.exports = { trackEvent, getAnalytics };
