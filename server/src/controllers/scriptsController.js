const { readJson, writeJson, nextId } = require('../db/store');
const { logActivity } = require('../db/activityLog');
const { announceToDiscord } = require('../db/discordAnnounce');

const FILE = 'scripts.json';

// ---------- public ----------

// GET /api/scripts — published only, sorted for the archive grid
async function listScripts(req, res) {
  const scripts = await readJson(FILE);
  const published = scripts.filter((s) => s.visibility !== 'draft');
  const sorted = [...published].sort((a, b) => a.sort_order - b.sort_order);
  res.json(sorted.map(({ changelog, ...rest }) => rest));
}

// GET /api/scripts/:slug — published only, includes its changelog
async function getScriptBySlug(req, res) {
  const scripts = await readJson(FILE);
  const script = scripts.find((s) => s.slug === req.params.slug);
  if (!script || script.visibility === 'draft') {
    return res.status(404).json({ error: 'Script not found' });
  }

  const changelog = [...(script.changelog || [])].sort(
    (a, b) => new Date(b.released_at) - new Date(a.released_at)
  );
  res.json({ ...script, changelog });
}

// ---------- admin (sees drafts too) ----------

// GET /api/admin/scripts — everything, including drafts, for the admin table
async function listScriptsAdmin(req, res) {
  const scripts = await readJson(FILE);
  const sorted = [...scripts].sort((a, b) => a.sort_order - b.sort_order);
  res.json(sorted.map(({ changelog, ...rest }) => rest));
}

// GET /api/admin/scripts/:id — by id, for populating the edit form (drafts included)
async function getScriptByIdAdmin(req, res) {
  const scripts = await readJson(FILE);
  const script = scripts.find((s) => s.id === req.params.id);
  if (!script) return res.status(404).json({ error: 'Script not found' });
  const changelog = [...(script.changelog || [])].sort((a, b) => new Date(b.released_at) - new Date(a.released_at));
  res.json({ ...script, changelog });
}

// POST /api/admin/scripts — admin create
async function createScript(req, res) {
  const b = req.body || {};
  if (!b.slug || !b.name) return res.status(400).json({ error: 'slug and name are required' });

  const scripts = await readJson(FILE);
  if (scripts.some((s) => s.slug === b.slug)) {
    return res.status(400).json({ error: 'A script with that slug already exists' });
  }

  const id = nextId('script', new Set(scripts.map((s) => s.id)));
  const script = {
    id,
    slug: b.slug,
    name: b.name,
    status: b.status || 'locked',
    visibility: b.visibility || 'draft',
    summary: b.summary || '',
    overview: b.overview || '',
    tags: b.tags || [],
    features: b.features || [],
    requirements: b.requirements || '',
    loadstring_url: b.loadstring_url || '',
    youtube_url: b.youtube_url || '',
    latest_version: b.latest_version || '',
    cover_index: b.cover_index || '01',
    cover_image_url: b.cover_image_url || '',
    sort_order: Number(b.sort_order) || 0,
    changelog: []
  };
  scripts.push(script);
  await writeJson(FILE, scripts);

  logActivity(req.admin.username, 'created script', script.name);
  if (script.visibility === 'published') {
    announceToDiscord(`📦 **${script.name}** just went live on the archive.`);
  }
  res.status(201).json({ id });
}

// PUT /api/admin/scripts/:id — admin update
async function updateScript(req, res) {
  const b = req.body || {};
  const scripts = await readJson(FILE);
  const index = scripts.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Script not found' });

  const existing = scripts[index];
  const wasPublished = existing.visibility === 'published';
  scripts[index] = {
    ...existing,
    slug: b.slug ?? existing.slug,
    name: b.name ?? existing.name,
    status: b.status || existing.status,
    visibility: b.visibility || existing.visibility,
    summary: b.summary ?? existing.summary,
    overview: b.overview ?? existing.overview,
    tags: b.tags ?? existing.tags,
    features: b.features ?? existing.features,
    requirements: b.requirements ?? existing.requirements,
    loadstring_url: b.loadstring_url ?? existing.loadstring_url,
    youtube_url: b.youtube_url ?? existing.youtube_url,
    latest_version: b.latest_version ?? existing.latest_version,
    cover_index: b.cover_index ?? existing.cover_index,
    cover_image_url: b.cover_image_url ?? existing.cover_image_url,
    sort_order: b.sort_order !== undefined ? Number(b.sort_order) : existing.sort_order
  };
  await writeJson(FILE, scripts);

  logActivity(req.admin.username, 'updated script', scripts[index].name);
  if (!wasPublished && scripts[index].visibility === 'published') {
    announceToDiscord(`📦 **${scripts[index].name}** just went live on the archive.`);
  }
  res.json({ ok: true });
}

// DELETE /api/admin/scripts/:id
async function deleteScript(req, res) {
  const scripts = await readJson(FILE);
  const target = scripts.find((s) => s.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Script not found' });
  const next = scripts.filter((s) => s.id !== req.params.id);
  await writeJson(FILE, next);

  logActivity(req.admin.username, 'deleted script', target.name);
  res.json({ ok: true });
}

// -- changelog, scoped under a script --

// POST /api/admin/scripts/:id/changelog
async function addChangelogEntry(req, res) {
  const b = req.body || {};
  if (!b.version || !b.description || !b.released_at) {
    return res.status(400).json({ error: 'version, description and released_at are required' });
  }
  const scripts = await readJson(FILE);
  const script = scripts.find((s) => s.id === req.params.id);
  if (!script) return res.status(404).json({ error: 'Script not found' });

  script.changelog = script.changelog || [];
  const id = nextId('cl', new Set(scripts.flatMap((s) => (s.changelog || []).map((c) => c.id))));
  script.changelog.push({ id, version: b.version, description: b.description, released_at: b.released_at });
  await writeJson(FILE, scripts);

  logActivity(req.admin.username, `added changelog ${b.version} to`, script.name);
  if (script.visibility === 'published') {
    announceToDiscord(`🔧 **${script.name} ${b.version}** just shipped: ${b.description}`);
  }
  res.status(201).json({ id });
}

// DELETE /api/admin/changelog/:entryId
async function deleteChangelogEntry(req, res) {
  const scripts = await readJson(FILE);
  let found = false;
  let scriptName = null;
  for (const script of scripts) {
    const before = (script.changelog || []).length;
    script.changelog = (script.changelog || []).filter((c) => c.id !== req.params.entryId);
    if (script.changelog.length !== before) {
      found = true;
      scriptName = script.name;
    }
  }
  if (!found) return res.status(404).json({ error: 'Changelog entry not found' });
  await writeJson(FILE, scripts);

  logActivity(req.admin.username, 'deleted a changelog entry from', scriptName);
  res.json({ ok: true });
}

module.exports = {
  listScripts,
  getScriptBySlug,
  listScriptsAdmin,
  getScriptByIdAdmin,
  createScript,
  updateScript,
  deleteScript,
  addChangelogEntry,
  deleteChangelogEntry
};
