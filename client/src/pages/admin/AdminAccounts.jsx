import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

export default function AdminAccounts() {
  const { username: myUsername, isOwner } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAccount, setNewAccount] = useState({ username: '', password: '', role: 'editor' });
  const [creating, setCreating] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const showToast = useToast();

  async function reload() {
    setLoading(true);
    setAccounts(await api.getAccounts());
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.createAccount(newAccount.username, newAccount.password, newAccount.role);
      setNewAccount({ username: '', password: '', role: 'editor' });
      showToast('Account created');
      reload();
    } catch (err) {
      showToast(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(account) {
    if (!confirm(`Delete the account "${account.username}"?`)) return;
    try {
      await api.deleteAccount(account.id);
      showToast('Account deleted');
      reload();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleRoleChange(account, role) {
    try {
      await api.updateAccountRole(account.id, role);
      showToast(`${account.username} is now ${role === 'owner' ? 'an owner' : 'an editor'}`);
      reload();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New passwords don't match");
      return;
    }
    setChangingPassword(true);
    try {
      await api.changeOwnPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed');
    } catch (err) {
      showToast(err.message);
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <h1>Accounts</h1>
      </div>

      {!isOwner && (
        <p style={{ color: 'var(--ink-faint)', marginBottom: 20, maxWidth: '70ch' }}>
          You're signed in as an editor — you can see who else has access, but only an owner can add accounts,
          remove them, or change roles.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 16 }}>Admin accounts</h2>

          {loading ? (
            <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.username}{a.username === myUsername ? ' (you)' : ''}</td>
                    <td>
                      {isOwner && a.username !== myUsername ? (
                        <select value={a.role} onChange={(e) => handleRoleChange(a, e.target.value)}>
                          <option value="owner">Owner</option>
                          <option value="editor">Editor</option>
                        </select>
                      ) : (
                        a.role === 'owner' ? 'Owner' : 'Editor'
                      )}
                    </td>
                    <td>{new Date(a.created_at).toLocaleDateString()}</td>
                    <td>
                      {isOwner && a.username !== myUsername && (
                        <button onClick={() => handleDelete(a)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {isOwner && (
            <form onSubmit={handleCreate} style={{ marginTop: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: 12 }}>Add a new account</h3>
              <div className="field">
                <label>Username</label>
                <input value={newAccount.username} onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })} required />
              </div>
              <div className="field">
                <label>Password (min. 8 characters)</label>
                <input
                  type="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Role</label>
                <select value={newAccount.role} onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value })}>
                  <option value="editor">Editor — can manage content, not other accounts</option>
                  <option value="owner">Owner — full access, including managing accounts</option>
                </select>
              </div>
              <button className="btn" type="submit" disabled={creating}>
                {creating ? 'Creating…' : 'Create account'}
              </button>
            </form>
          )}
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 16 }}>Change your password</h2>
          <form onSubmit={handleChangePassword}>
            <div className="field">
              <label>Current password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>New password (min. 8 characters)</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button className="btn" type="submit" disabled={changingPassword}>
              {changingPassword ? 'Saving…' : 'Change password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
