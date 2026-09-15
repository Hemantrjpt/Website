import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function AdminActivity() {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getActivity().then(setLog).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-topbar">
        <h1>Activity log</h1>
      </div>

      {loading ? (
        <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
      ) : log.length === 0 ? (
        <p style={{ color: 'var(--ink-faint)' }}>Nothing logged yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {log.map((entry) => (
              <tr key={entry.id}>
                <td>{new Date(entry.at).toLocaleString()}</td>
                <td>{entry.admin}</td>
                <td>{entry.action}</td>
                <td>{entry.target || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
