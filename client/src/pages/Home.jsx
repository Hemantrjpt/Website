import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollChrome from '../components/ScrollChrome';
import ScriptCard from '../components/ScriptCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useSettings } from '../hooks/useSettings';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { api } from '../api/client';

function TerminalPanel({ activeScriptName }) {
  const [lines, setLines] = useState(['', '', '']);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const full = [
      '> establishing uplink...',
      '> scanning archive...',
      `> ${activeScriptName ? `1 script active — ${activeScriptName.toLowerCase()}` : 'archive empty'}`
    ];

    if (prefersReduced) {
      setLines(full);
      return;
    }

    let cancelled = false;
    async function typeAll() {
      for (let i = 0; i < full.length; i++) {
        if (cancelled) return;
        const text = full[i];
        for (let c = 1; c <= text.length; c++) {
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, 18));
          setLines((prev) => {
            const next = [...prev];
            next[i] = text.slice(0, c);
            return next;
          });
        }
        await new Promise((r) => setTimeout(r, 220));
      }
    }
    typeAll();
    return () => {
      cancelled = true;
    };
  }, [activeScriptName]);

  return (
    <div className="terminal" aria-hidden="true">
      <p className="line">{lines[0]}</p>
      <p className="line">{lines[1]}</p>
      <p className="line ok">{lines[2]}</p>
    </div>
  );
}

function LiveStats({ guildId }) {
  const [members, setMembers] = useState(null);
  const [uptime, setUptime] = useState(null);

  useEffect(() => {
    if (!guildId || guildId === 'YOUR_DISCORD_GUILD_ID') {
      setMembers('—');
    } else {
      fetch(`https://discord.com/api/guilds/${guildId}/widget.json`)
        .then((res) => {
          if (!res.ok) throw new Error('widget unavailable');
          return res.json();
        })
        .then((data) => setMembers(`${data.presence_count ?? '—'} online`))
        .catch(() => setMembers('—'));
    }

    const t = setTimeout(() => setUptime('99.9%'), 900);
    return () => clearTimeout(t);
  }, [guildId]);

  return (
    <div className="live-stats">
      <div className="live-stat">
        <span className="live-stat-label">Discord members</span>
        {members ? <span className="live-stat-value">{members}</span> : <span className="live-stat-value skeleton" />}
      </div>
      <div className="live-stat">
        <span className="live-stat-label">Uptime</span>
        {uptime ? <span className="live-stat-value">{uptime}</span> : <span className="live-stat-value skeleton" />}
      </div>
    </div>
  );
}

const DiscordIconSmall = () => (
  <svg viewBox="0 0 24 24" fill="#5865F2" aria-hidden="true" width="16" height="16">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

const PILLAR_ICONS = [
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" /><path d="M9.5 12l1.8 1.8L15 10.2" /></svg>,
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M17 20v-2a4 4 0 00-3-3.87M7 20v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z" /></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
];

export default function Home() {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [scripts, setScripts] = useState([]);
  const [changelog, setChangelog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);
  const activeTag = searchParams.get('tag');

  function clearTagFilter() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('tag');
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const list = await api.getScripts();
        if (cancelled) return;
        setScripts(list);
        const active = list.find((s) => s.status === 'active');
        if (active) {
          const detail = await api.getScript(active.slug);
          if (!cancelled) setChangelog(detail.changelog.slice(0, 2));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredScripts = useMemo(() => {
    return scripts.filter((s) => {
      const matchesQuery = !query || s.name.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === 'all' || s.status === filter;
      const matchesTag = !activeTag || (s.tags || []).includes(activeTag);
      return matchesQuery && matchesFilter && matchesTag;
    });
  }, [scripts, query, filter, activeTag]);

  useScrollReveal([scripts, changelog, settings]);
  useDocumentHead({
    title: settings ? `${settings.siteName} — Roblox Script Archive` : undefined,
    description: settings?.metaDescription,
    jsonLd: settings
      ? { '@context': 'https://schema.org', '@type': 'WebSite', name: settings.siteName, description: settings.metaDescription }
      : null
  });

  const activeScript = scripts.find((s) => s.status === 'active');
  const hero = settings?.hero;
  const pillars = settings?.pillars || [];
  const faq = settings?.faq || [];
  const fieldReport = settings?.fieldReport;
  const discordInvite = settings?.discordInvite || '#';

  return (
    <>
      <ScrollChrome />
      <Header />

      <section className="hero" id="home">
        <div className="wrap hero-grid">
          <div>
            <h1 data-reveal-text>
              {hero?.headlineLine1 || 'Recon-grade'}
              <br />
              {hero?.headlineLine2 || 'automation'}
              <br />
              for <span>{hero?.headlineHighlight || 'Roblox'}</span>
            </h1>
            <p className="lede">{hero?.lede}</p>
            <div className="hero-ctas">
              <a href="#archive" className="btn">Browse the archive</a>
              <a href={discordInvite} className="icon-btn" aria-label="Join Discord">
                <DiscordIconSmall />
              </a>
            </div>
          </div>
          <TerminalPanel activeScriptName={activeScript?.name} />
        </div>
      </section>

      <section id="why-us">
        <div className="wrap">
          <div className="section-head" data-reveal-text>
            <h2>Why {settings?.siteName || 'Titanic Hub'}</h2>
            <p>A few reasons operators keep coming back to the archive.</p>
          </div>
          <div className="pillar-grid">
            {pillars.map((pillar, i) => (
              <div className="pillar-card" key={pillar.title}>
                <div className="pillar-icon" data-reveal-img>
                  {PILLAR_ICONS[i % PILLAR_ICONS.length]}
                </div>
                <h3 data-reveal-text>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="archive">
        <div className="wrap">
          <div className="section-head" data-reveal-text>
            <h2>The archive</h2>
            <p>Active scripts are cleared for deployment right now. Classified ones are still in the field.</p>
          </div>

          {activeTag && (
            <p style={{ marginBottom: 16 }}>
              <span className="chip is-active" style={{ cursor: 'default' }}>
                Tag: {activeTag}
              </span>{' '}
              <button
                type="button"
                onClick={clearTagFilter}
                style={{ background: 'none', border: 'none', color: 'var(--ink-dim)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
              >
                clear
              </button>
            </p>
          )}

          <div className="archive-controls">
            <input
              type="search"
              className="search-input"
              placeholder="Search scripts…"
              aria-label="Search scripts"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="filter-chips" role="group" aria-label="Filter by status">
              {['all', 'active', 'locked'].map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`chip${filter === f ? ' is-active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Sealed'}
                </button>
              ))}
            </div>
          </div>

          {loading && <p style={{ color: 'var(--ink-faint)' }}>Loading archive…</p>}
          {error && <p style={{ color: '#e08a72' }}>Couldn't load the archive: {error}</p>}

          {!loading && !error && (
            <>
              <div className="archive-grid">
                {filteredScripts.map((s, i) => (
                  <ScriptCard key={s.id} script={s} index={i} />
                ))}
              </div>
              {filteredScripts.length === 0 && <p className="archive-empty is-visible">No scripts match your search.</p>}
            </>
          )}
        </div>
      </section>

      <section id="updates">
        <div className="wrap">
          <div className="section-head" data-reveal-text>
            <h2>Recent updates</h2>
            <p>What shipped lately, straight from the changelog.</p>
          </div>
          <div className="timeline">
            {changelog.map((entry, i) => (
              <div key={entry.id} className={`timeline-item${i === 0 ? ' is-latest' : ''}`} data-reveal-text>
                <div className="v-num">{entry.version}</div>
                <div className="v-time">{i === 0 ? 'Today' : new Date(entry.released_at).toLocaleDateString()}</div>
                <p>{entry.description}</p>
              </div>
            ))}
          </div>
          {activeScript && (
            <a href={`/scripts/${activeScript.slug}#update-log`} className="view-log-link">
              View full changelog
            </a>
          )}
        </div>
      </section>

      <section>
        <div className="wrap report">
          <div>
            <div className="section-head" data-reveal-text>
              <h2>Field report</h2>
            </div>
            <p>{fieldReport?.paragraph1}</p>
            <p>{fieldReport?.paragraph2}</p>
          </div>
          <div className="report-stats">
            <div className="stat" data-reveal-text>
              <span className="num">{String(scripts.filter((s) => s.status === 'active').length).padStart(2, '0')}</span>
              <span className="label">Active script{scripts.filter((s) => s.status === 'active').length === 1 ? '' : 's'}</span>
            </div>
            <div className="stat" data-reveal-text>
              <span className="num">{scripts.filter((s) => s.status === 'locked').length}+</span>
              <span className="label">In development</span>
            </div>
            <div className="stat" data-reveal-text>
              <span className="num">Free</span>
              <span className="label">Every script in the archive</span>
            </div>
          </div>
        </div>
      </section>

      <section id="briefing">
        <div className="wrap">
          <div className="section-head" data-reveal-text>
            <h2>Briefing</h2>
            <p>Common questions before deployment.</p>
          </div>
          <div className="faq-list">
            {faq.map((item, i) => (
              <details
                key={item.id}
                open={openFaq === i}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenFaq(openFaq === i ? null : i);
                }}
              >
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer>
        <LiveStats guildId={settings?.discordGuildId} />
      </Footer>
    </>
  );
}
