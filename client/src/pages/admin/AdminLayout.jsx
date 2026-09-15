import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const { username, loading, logout } = useAuth();

  if (loading) {
    return <div className="wrap" style={{ padding: '60px 0' }}>Loading…</div>;
  }
  if (!username) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.8rem', padding: '0 14px 16px' }}>
          Signed in as <strong style={{ color: 'var(--ink)' }}>{username}</strong>
        </p>
        <NavLink to="/admin/scripts" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          Scripts
        </NavLink>
        <NavLink to="/admin/executors" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          Executors
        </NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          Site settings
        </NavLink>
        <NavLink to="/admin/analytics" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          Analytics
        </NavLink>
        <NavLink to="/admin/backups" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          Backups
        </NavLink>
        <NavLink to="/admin/activity" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          Activity log
        </NavLink>
        <NavLink to="/admin/accounts" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          Accounts
        </NavLink>
        <a href="/" style={{ display: 'block', padding: '12px 14px', color: 'var(--ink-dim)', textDecoration: 'none', fontSize: '0.95rem' }}>
          ← View site
        </a>
        <button
          onClick={logout}
          style={{
            marginTop: 16,
            width: '100%',
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--ink-dim)',
            padding: '10px 14px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Log out
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
