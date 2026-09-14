import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import ImageUploadField from './ImageUploadField';

const emptyForm = {
  slug: '',
  name: '',
  status: 'locked',
  visibility: 'draft',
  summary: '',
  overview: '',
  tags: '',
  features: '',
  requirements: '',
  loadstring_url: '',
  youtube_url: '',
  latest_version: '',
  cover_index: '01',
  cover_image_url: '',
  sort_order: 0
};

function scriptToForm(script) {
  return {
    ...emptyForm,
    ...script,
    tags: (script.tags || []).join(', '),
    features: (script.features || []).join('\n')
  };
}

function formToPayload(form) {
  return {
    ...form,
    sort_order: Number(form.sort_order) || 0,
    tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    features: form.features.split('\n').map((f) => f.trim()).filter(Boolean)
  };
}

export default function AdminScripts() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // null = no form open
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changelog, setChangelog] = useState([]);
  const [newEntry, setNewEntry] = useState({ version: '', description: '', released_at: '' });
  const showToast = useToast();

  async function reload() {
    setLoading(true);
    const data = await api.getScriptsAdmin();
    setScripts(data);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setChangelog([]);
  }

  async function startEdit(script) {
    setEditingId(script.id);
    setForm(scriptToForm(script));
    const full = await api.getScriptByIdAdmin(script.id);
    setChangelog(full.changelog || []);
  }

  function closeForm() {
    setForm(null);
    setEditingId(null);
    setChangelog([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await api.updateScript(editingId, payload);
        showToast('Script updated');
      } else {
        await api.createScript(payload);
        showToast('Script created');
      }
      closeForm();
      reload();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(script) {
    if (!confirm(`Delete "${script.name}"? This also removes its changelog.`)) return;
    try {
      await api.deleteScript(script.id);
      showToast('Script deleted');
      reload();
      if (editingId === script.id) closeForm();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleAddChangelog(e) {
    e.preventDefault();
    if (!newEntry.version || !newEntry.description || !newEntry.released_at) {
      showToast('Fill in version, description, and date first');
      return;
    }
    try {
      await api.addChangelogEntry(editingId, newEntry);
      const full = await api.getScriptByIdAdmin(editingId);
      setChangelog(full.changelog || []);
      setNewEntry({ version: '', description: '', released_at: '' });
      showToast('Changelog entry added');
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleDeleteChangelog(entryId) {
    if (!confirm('Delete this changelog entry?')) return;
    try {
      await api.deleteChangelogEntry(entryId);
      setChangelog((c) => c.filter((e) => e.id !== entryId));
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <h1>Scripts</h1>
        {!form && (
          <button className="btn" onClick={startCreate}>
            Add script
          </button>
        )}
      </div>

      {form && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 16 }}>
            {editingId ? 'Edit script' : 'New script'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label>Slug (used in the URL)</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </div>
            <div className="field">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="locked">Locked (sealed)</option>
                <option value="active">Active</option>
              </select>
            </div>
            <div className="field">
              <label>Visibility</label>
              <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
                <option value="draft">Draft (hidden from the public site)</option>
                <option value="published">Published (live on the site)</option>
              </select>
            </div>
            <div className="field">
              <label>Latest version</label>
              <input value={form.latest_version} onChange={(e) => setForm({ ...form, latest_version: e.target.value })} placeholder="v1.4.2" />
            </div>
            <div className="field">
              <label>Cover index (e.g. 01)</label>
              <input value={form.cover_index} onChange={(e) => setForm({ ...form, cover_index: e.target.value })} />
            </div>
            <div className="field">
              <label>Sort order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            </div>
          </div>

          <ImageUploadField
            label="Cover image (archive card — optional, falls back to the built-in design if unset)"
            value={form.cover_image_url}
            onChange={(url) => setForm({ ...form, cover_image_url: url })}
          />

          <div className="field">
            <label>Card summary (short, shown on the archive card)</label>
            <input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </div>

          <div className="field">
            <label>Overview (long description on the script page)</label>
            <textarea value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} />
          </div>

          <div className="field">
            <label>Tags (comma-separated)</label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Auto-farm, Combat automation, Webhooks" />
          </div>

          <div className="field">
            <label>Features (one per line)</label>
            <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Auto-farm routines tuned per map" />
          </div>

          <div className="field">
            <label>Requirements</label>
            <input value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          </div>

          <div className="field">
            <label>Loadstring URL (raw script link)</label>
            <input value={form.loadstring_url} onChange={(e) => setForm({ ...form, loadstring_url: e.target.value })} placeholder="https://raw.githubusercontent.com/..." />
          </div>

          <div className="field">
            <label>YouTube demo link (full URL)</label>
            <input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={closeForm}>
              Cancel
            </button>
          </div>

          {editingId && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 12 }}>Changelog</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {changelog.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.version}</td>
                      <td>{new Date(entry.released_at).toLocaleDateString()}</td>
                      <td>{entry.description}</td>
                      <td>
                        <button type="button" onClick={() => handleDeleteChangelog(entry.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {changelog.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ color: 'var(--ink-faint)' }}>No entries yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 10, marginTop: 16, alignItems: 'end' }}>
                <div className="field" style={{ margin: 0 }}>
                  <label>Version</label>
                  <input value={newEntry.version} onChange={(e) => setNewEntry({ ...newEntry, version: e.target.value })} placeholder="v1.4.3" />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Date</label>
                  <input type="date" value={newEntry.released_at} onChange={(e) => setNewEntry({ ...newEntry, released_at: e.target.value })} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Description</label>
                  <input value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} />
                </div>
                <button className="btn" type="button" onClick={handleAddChangelog}>
                  Add
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {loading ? (
        <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Visibility</th>
              <th>Version</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {scripts.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.slug}</td>
                <td>{s.status}</td>
                <td>{s.visibility === 'published' ? 'Published' : 'Draft'}</td>
                <td>{s.latest_version || '—'}</td>
                <td>
                  <div className="admin-row-actions">
                    <button onClick={() => startEdit(s)}>Edit</button>
                    <button onClick={() => handleDelete(s)}>Delete</button>
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
