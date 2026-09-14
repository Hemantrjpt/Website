const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const MAX_SNAPSHOTS_PER_FILE = 15;

// Per-file write queues so two overlapping requests can never interleave
// writes to the same file and corrupt it — every write to a given file
// waits for the previous one to finish first.
const writeQueues = new Map();

function queueWrite(file, task) {
  const previous = writeQueues.get(file) || Promise.resolve();
  const next = previous.then(task, task); // run task even if the previous write failed
  writeQueues.set(file, next);
  return next;
}

async function readJson(file) {
  const full = path.join(DATA_DIR, file);
  const raw = await fs.readFile(full, 'utf-8');
  return JSON.parse(raw);
}

async function ensureBackupDir() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

// Snapshots the file's CURRENT on-disk content before it gets overwritten,
// so every write is individually undoable. Prunes old snapshots beyond the cap.
async function snapshotBeforeWrite(file) {
  const full = path.join(DATA_DIR, file);
  let existing;
  try {
    existing = await fs.readFile(full, 'utf-8');
  } catch {
    return; // file doesn't exist yet — nothing to snapshot
  }

  await ensureBackupDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotName = `${file}.${timestamp}.bak`;
  await fs.writeFile(path.join(BACKUP_DIR, snapshotName), existing, 'utf-8');

  // prune old snapshots for this file beyond the cap
  const all = await fs.readdir(BACKUP_DIR);
  const forThisFile = all.filter((f) => f.startsWith(`${file}.`)).sort();
  const excess = forThisFile.length - MAX_SNAPSHOTS_PER_FILE;
  if (excess > 0) {
    await Promise.all(forThisFile.slice(0, excess).map((f) => fs.unlink(path.join(BACKUP_DIR, f)).catch(() => {})));
  }
}

async function writeJson(file, data) {
  return queueWrite(file, async () => {
    await snapshotBeforeWrite(file);
    const full = path.join(DATA_DIR, file);
    const tmp = `${full}.tmp`;
    // write to a temp file then rename — avoids a half-written file if the
    // process dies mid-write
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmp, full);
  });
}

// Lists available snapshots, newest first, grouped implicitly by filename prefix.
async function listBackups() {
  await ensureBackupDir();
  const all = await fs.readdir(BACKUP_DIR);
  const items = await Promise.all(
    all
      .filter((f) => f.endsWith('.bak'))
      .map(async (f) => {
        const stat = await fs.stat(path.join(BACKUP_DIR, f));
        const file = f.split('.')[0] + '.json';
        return { snapshot: f, file, size: stat.size, modifiedAt: stat.mtime };
      })
  );
  return items.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
}

// Restores a specific snapshot as the live file. Snapshots the current
// (about-to-be-replaced) state first, so a restore is itself undoable.
async function restoreBackup(snapshotName) {
  const snapshotPath = path.join(BACKUP_DIR, snapshotName);
  const content = await fs.readFile(snapshotPath, 'utf-8');
  const file = snapshotName.split('.')[0] + '.json';
  const data = JSON.parse(content); // validate before touching the live file
  await writeJson(file, data);
  return file;
}

function nextId(prefix, existingIds) {
  let n = 1;
  while (existingIds.has(`${prefix}-${n}`)) n++;
  return `${prefix}-${n}`;
}

module.exports = { readJson, writeJson, nextId, listBackups, restoreBackup, DATA_DIR, BACKUP_DIR };
