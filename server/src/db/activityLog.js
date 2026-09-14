const { readJson, writeJson, nextId } = require('./store');

const FILE = 'activity.json';
const MAX_ENTRIES = 500;

// action examples: "created script", "updated executor", "deleted changelog entry"
async function logActivity(admin, action, target) {
  try {
    const log = await readJson(FILE);
    const id = nextId('act', new Set(log.map((l) => l.id)));
    log.unshift({ id, admin, action, target: target || null, at: new Date().toISOString() });
    // keep the log itself from growing forever
    const trimmed = log.slice(0, MAX_ENTRIES);
    await writeJson(FILE, trimmed);
  } catch (err) {
    // logging failures should never break the actual admin action
    console.error('Failed to log activity:', err.message);
  }
}

module.exports = { logActivity };
