import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function AdminAnalytics() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(setRows).finally(() => setLoading(false));
  }, []);

  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);
  const totalClicks = rows.reduce((sum, r) => sum + r.clicks, 0);

  return (
    <div>
      <div className="admin-topbar">
        <h1>Analytics</h1>
      </div>

      {loading ? (
        <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 40, marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>{totalViews}</div>
              <div style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>Total page views</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>{totalClicks}</div>
              <div style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>Total "Get script" clicks</div>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Script</th>
                <th>Status</th>
                <th>Views</th>
                <th>Clicks</th>
                <th>Click rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug}>
                  <td>{r.name}</td>
                  <td>{r.status}</td>
                  <td>{r.views}</td>
                  <td>{r.clicks}</td>
                  <td>{r.views ? `${Math.round((r.clicks / r.views) * 100)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
