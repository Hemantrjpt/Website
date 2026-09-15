import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import ImageUploadField from './ImageUploadField';

const emptyForm = { name: '', platform: 'PC', status: 'supported', image_url: '', visit_url: '', sort_order: 0 };

export default function AdminExecutors() {
  const [executors, setExecutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const showToast = useToast();

  async function reload() {
    setLoading(true);
    setExecutors(await api.getExecutors());
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function startEdit(ex) {
    setEditingId(ex.id);
    setForm({ ...emptyForm, ...ex });
  }

  function closeForm() {
    setForm(null);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
      if (editingId) {
        await api.updateExecutor(editingId, payload);
        showToast('Executor updated');
      } else {
        await api.createExecutor(payload);
        showToast('Executor created');
      }
      closeForm();
      reload();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ex) {
    if (!confirm(`Delete "${ex.name}"?`)) return;
    try {
      await api.deleteExecutor(ex.id);
      showToast('Executor deleted');
      reload();
      if (editingId === ex.id) closeForm();
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <h1>Executors</h1>
        {!form && (
          <button className="btn" onClick={startCreate}>
            Add executor
          </button>
        )}
      </div>

      {form && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 16 }}>
            {editingId ? 'Edit executor' : 'New executor'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Platform</label>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                <option value="PC">PC</option>
                <option value="Mobile">Mobile</option>
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="recommended">Recommended</option>
                <option value="supported">Supported</option>
                <option value="untested">Untested</option>
              </select>
            </div>
            <div className="field">
              <label>Sort order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            </div>
          </div>
          <ImageUploadField label="Executor image" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
          <div className="field">
            <label>Visit-site URL</label>
            <input value={form.visit_url} onChange={(e) => setForm({ ...form, visit_url: e.target.value })} placeholder="https://..." />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Platform</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {executors.map((ex) => (
              <tr key={ex.id}>
                <td>{ex.name}</td>
                <td>{ex.platform}</td>
                <td>{ex.status}</td>
                <td>
                  <div className="admin-row-actions">
                    <button onClick={() => startEdit(ex)}>Edit</button>
                    <button onClick={() => handleDelete(ex)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
