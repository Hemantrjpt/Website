import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../hooks/useToast';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function AdminBackups() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const showToast = useToast();

  async function reload() {
    setLoading(true);
    setBackups(await api.getBackups());
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleRestore(backup) {
    if (!confirm(`Restore ${backup.file} to this snapshot from ${new Date(backup.modifiedAt).toLocaleString()}? The current version will itself be snapshotted first, so this can be undone.`)) {
      return;
    }
    setRestoringId(backup.snapshot);
    try {
      await api.restoreBackup(backup.snapshot);
      showToast(`Restored ${backup.file}`);
      reload();
    } catch (err) {
      showToast(err.message);
    } finally {
      setRestoringId(null);
    }
  }

  async function handleExport() {
    try {
      await api.exportBackup();
      showToast('Backup downloaded');
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <h1>Backups</h1>
        <button className="btn" onClick={handleExport}>
          Download full backup
        </button>
      </div>

      <p style={{ color: 'var(--ink-dim)', marginBottom: 24, maxWidth: '70ch' }}>
        A snapshot of each data file is taken automatically right before every save, going back {backups.length ? 'as far as the list below shows' : 'none yet'}.
        Restoring a snapshot itself creates a new snapshot of the current state first, so nothing here is ever a one-way door.
      </p>

      {loading ? (
        <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
      ) : backups.length === 0 ? (
        <p style={{ color: 'var(--ink-faint)' }}>No snapshots yet — they're created automatically the first time you save something.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>File</th>
              <th>When</th>
              <th>Size</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {backups.map((b) => (
              <tr key={b.snapshot}>
                <td>{b.file}</td>
                <td>{new Date(b.modifiedAt).toLocaleString()}</td>
                <td>{formatSize(b.size)}</td>
                <td>
                  <button onClick={() => handleRestore(b)} disabled={restoringId === b.snapshot}>
                    {restoringId === b.snapshot ? 'Restoring…' : 'Restore'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
