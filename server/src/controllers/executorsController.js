const { readJson, writeJson, nextId } = require('../db/store');
const { logActivity } = require('../db/activityLog');

const FILE = 'executors.json';

// GET /api/executors — public
async function listExecutors(req, res) {
  const executors = await readJson(FILE);
  res.json([...executors].sort((a, b) => a.sort_order - b.sort_order));
}

// POST /api/admin/executors
async function createExecutor(req, res) {
  const b = req.body || {};
  if (!b.name) return res.status(400).json({ error: 'name is required' });

  const executors = await readJson(FILE);
  const id = nextId('exec', new Set(executors.map((e) => e.id)));
  const executor = {
    id,
    name: b.name,
    platform: b.platform || 'PC',
    status: b.status || 'supported',
    image_url: b.image_url || '',
    visit_url: b.visit_url || '#',
    sort_order: Number(b.sort_order) || 0
  };
  executors.push(executor);
  await writeJson(FILE, executors);

  logActivity(req.admin.username, 'created executor', executor.name);
  res.status(201).json({ id });
}

// PUT /api/admin/executors/:id
async function updateExecutor(req, res) {
  const b = req.body || {};
  const executors = await readJson(FILE);
  const index = executors.findIndex((e) => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Executor not found' });

  const existing = executors[index];
  executors[index] = {
    ...existing,
    name: b.name ?? existing.name,
    platform: b.platform || existing.platform,
    status: b.status || existing.status,
    image_url: b.image_url ?? existing.image_url,
    visit_url: b.visit_url ?? existing.visit_url,
    sort_order: b.sort_order !== undefined ? Number(b.sort_order) : existing.sort_order
  };
  await writeJson(FILE, executors);

  logActivity(req.admin.username, 'updated executor', executors[index].name);
  res.json({ ok: true });
}

// DELETE /api/admin/executors/:id
async function deleteExecutor(req, res) {
  const executors = await readJson(FILE);
  const target = executors.find((e) => e.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Executor not found' });
  const next = executors.filter((e) => e.id !== req.params.id);
  await writeJson(FILE, next);

  logActivity(req.admin.username, 'deleted executor', target.name);
  res.json({ ok: true });
}

module.exports = { listExecutors, createExecutor, updateExecutor, deleteExecutor };
