import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { useSettings } from '../../hooks/useSettings';

function SaveButton({ saving, onClick }) {
  return (
    <button className="btn" type="button" onClick={onClick} disabled={saving}>
      {saving ? 'Saving…' : 'Save section'}
    </button>
  );
}

function BrandingSection({ settings, onSave }) {
  const [form, setForm] = useState({
    siteName: settings.siteName,
    discordInvite: settings.discordInvite,
    discordGuildId: settings.discordGuildId,
    discordWebhookUrl: settings.discordWebhookUrl || '',
    youtubeChannel: settings.youtubeChannel || '',
    metaDescription: settings.metaDescription
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div>
      <h2>Branding & Discord</h2>
      <div className="field">
        <label>Site name</label>
        <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
      </div>
      <div className="field">
        <label>Discord invite link</label>
        <input value={form.discordInvite} onChange={(e) => setForm({ ...form, discordInvite: e.target.value })} />
      </div>
      <div className="field">
        <label>YouTube channel link (leave blank to hide the icon)</label>
        <input value={form.youtubeChannel} onChange={(e) => setForm({ ...form, youtubeChannel: e.target.value })} placeholder="https://youtube.com/@yourchannel" />
      </div>
      <div className="field">
        <label>Discord server (guild) ID — for the live member count</label>
        <input value={form.discordGuildId} onChange={(e) => setForm({ ...form, discordGuildId: e.target.value })} />
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.82rem', marginTop: 6 }}>
          Two things have to both be true for the member count to actually show a number instead of "—":
          1) Discord → your server → Server Settings → Widget → enable "Enable Server Widget", and
          2) the ID above has to be your real server ID (right-click your server icon → Copy Server ID — you may need
          Developer Mode on in Discord's settings to see that option).
        </p>
      </div>
      <div className="field">
        <label>Discord webhook URL — posts an announcement when a script or version goes live (optional)</label>
        <input value={form.discordWebhookUrl} onChange={(e) => setForm({ ...form, discordWebhookUrl: e.target.value })} placeholder="https://discord.com/api/webhooks/..." />
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.82rem', marginTop: 6 }}>
          Create one from a Discord channel: Edit Channel → Integrations → Webhooks → New Webhook, then paste its URL here.
        </p>
      </div>
      <div className="field">
        <label>Meta description (for search engines / link previews)</label>
        <textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
      </div>
      <SaveButton saving={saving} onClick={handleSave} />
    </div>
  );
}

function AnnouncementSection({ settings, onSave }) {
  const [form, setForm] = useState({ ...settings.announcement });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ announcement: form });
    setSaving(false);
  }

  return (
    <div>
      <h2>Announcement banner</h2>
      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            style={{ width: 'auto', marginRight: 8 }}
          />
          Show banner across the site
        </label>
      </div>
      <div className="field">
        <label>Banner text</label>
        <input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
      </div>
      <SaveButton saving={saving} onClick={handleSave} />
    </div>
  );
}

function HeroSection({ settings, onSave }) {
  const [form, setForm] = useState({ ...settings.hero });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ hero: form });
    setSaving(false);
  }

  return (
    <div>
      <h2>Hero</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div className="field">
          <label>Headline line 1</label>
          <input value={form.headlineLine1} onChange={(e) => setForm({ ...form, headlineLine1: e.target.value })} />
        </div>
        <div className="field">
          <label>Headline line 2</label>
          <input value={form.headlineLine2} onChange={(e) => setForm({ ...form, headlineLine2: e.target.value })} />
        </div>
        <div className="field">
          <label>Highlighted word ("for ___")</label>
          <input value={form.headlineHighlight} onChange={(e) => setForm({ ...form, headlineHighlight: e.target.value })} />
        </div>
      </div>
      <div className="field">
        <label>Subtext (lede)</label>
        <textarea value={form.lede} onChange={(e) => setForm({ ...form, lede: e.target.value })} />
      </div>
      <SaveButton saving={saving} onClick={handleSave} />
    </div>
  );
}

function PillarsSection({ settings, onSave }) {
  const [form, setForm] = useState(settings.pillars.map((p) => ({ ...p })));
  const [saving, setSaving] = useState(false);

  function update(i, field, value) {
    setForm((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ pillars: form });
    setSaving(false);
  }

  return (
    <div>
      <h2>Why-us pillars</h2>
      {form.map((pillar, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', padding: 16, marginBottom: 12 }}>
          <div className="field">
            <label>Title {i + 1}</label>
            <input value={pillar.title} onChange={(e) => update(i, 'title', e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Description {i + 1}</label>
            <textarea value={pillar.description} onChange={(e) => update(i, 'description', e.target.value)} />
          </div>
        </div>
      ))}
      <SaveButton saving={saving} onClick={handleSave} />
    </div>
  );
}

function FieldReportSection({ settings, onSave }) {
  const [form, setForm] = useState({ ...settings.fieldReport });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ fieldReport: form });
    setSaving(false);
  }

  return (
    <div>
      <h2>Field report text</h2>
      <div className="field">
        <label>Paragraph 1</label>
        <textarea value={form.paragraph1} onChange={(e) => setForm({ ...form, paragraph1: e.target.value })} />
      </div>
      <div className="field">
        <label>Paragraph 2</label>
        <textarea value={form.paragraph2} onChange={(e) => setForm({ ...form, paragraph2: e.target.value })} />
      </div>
      <SaveButton saving={saving} onClick={handleSave} />
    </div>
  );
}

function FaqSection({ settings, onSave }) {
  const [form, setForm] = useState(settings.faq.map((f) => ({ ...f })));
  const [saving, setSaving] = useState(false);

  function update(i, field, value) {
    setForm((prev) => prev.map((f, idx) => (idx === i ? { ...f, [field]: value } : f)));
  }
  function addItem() {
    setForm((prev) => [...prev, { id: `faq-${Date.now()}`, question: '', answer: '' }]);
  }
  function removeItem(i) {
    setForm((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ faq: form });
    setSaving(false);
  }

  return (
    <div>
      <h2>FAQ</h2>
      {form.map((item, i) => (
        <div key={item.id} style={{ border: '1px solid var(--border)', padding: 16, marginBottom: 12 }}>
          <div className="field">
            <label>Question</label>
            <input value={item.question} onChange={(e) => update(i, 'question', e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>Answer</label>
            <textarea value={item.answer} onChange={(e) => update(i, 'answer', e.target.value)} />
          </div>
          <button type="button" onClick={() => removeItem(i)}>
            Remove question
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" type="button" onClick={addItem}>
          Add question
        </button>
        <SaveButton saving={saving} onClick={handleSave} />
      </div>
    </div>
  );
}

function DisclaimerSection({ settings, onSave }) {
  const [lastUpdated, setLastUpdated] = useState(settings.disclaimer.lastUpdated);
  const [sections, setSections] = useState(settings.disclaimer.sections.map((s) => ({ ...s })));
  const [saving, setSaving] = useState(false);

  function update(i, field, value) {
    setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }
  function addSection() {
    setSections((prev) => [...prev, { id: `sec-${Date.now()}`, heading: '', body: '' }]);
  }
  function removeSection(i) {
    setSections((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ disclaimer: { lastUpdated, sections } });
    setSaving(false);
  }

  return (
    <div>
      <h2>Disclaimer page</h2>
      <div className="field">
        <label>Last updated (shown at the bottom of the page)</label>
        <input value={lastUpdated} onChange={(e) => setLastUpdated(e.target.value)} />
      </div>
      {sections.map((section, i) => (
        <div key={section.id} style={{ border: '1px solid var(--border)', padding: 16, marginBottom: 12 }}>
          <div className="field">
            <label>Heading</label>
            <input value={section.heading} onChange={(e) => update(i, 'heading', e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>Body (use a blank line to start a new paragraph)</label>
            <textarea style={{ minHeight: 140 }} value={section.body} onChange={(e) => update(i, 'body', e.target.value)} />
          </div>
          <button type="button" onClick={() => removeSection(i)}>
            Remove section
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" type="button" onClick={addSection}>
          Add section
        </button>
        <SaveButton saving={saving} onClick={handleSave} />
      </div>
    </div>
  );
}

const TABS = [
  { key: 'branding', label: 'Branding & Discord', Component: BrandingSection },
  { key: 'announcement', label: 'Announcement', Component: AnnouncementSection },
  { key: 'hero', label: 'Hero', Component: HeroSection },
  { key: 'pillars', label: 'Why-us pillars', Component: PillarsSection },
  { key: 'fieldReport', label: 'Field report', Component: FieldReportSection },
  { key: 'faq', label: 'FAQ', Component: FaqSection },
  { key: 'disclaimer', label: 'Disclaimer page', Component: DisclaimerSection }
];

export default function AdminSettings() {
  const { settings, reload } = useSettings();
  const [activeTab, setActiveTab] = useState('branding');
  const showToast = useToast();

  async function handleSave(partial) {
    try {
      await api.updateSettings(partial);
      await reload();
      showToast('Saved');
    } catch (err) {
      showToast(err.message);
    }
  }

  if (!settings) return <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>;

  const ActiveComponent = TABS.find((t) => t.key === activeTab).Component;

  return (
    <div>
      <div className="admin-topbar">
        <h1>Site settings</h1>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={tab.key === activeTab ? 'chip is-active' : 'chip'}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ActiveComponent settings={settings} onSave={handleSave} />
    </div>
  );
}
