import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollChrome from '../components/ScrollChrome';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { useToast } from '../hooks/useToast';
import { api } from '../api/client';

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function LiveFeed({ youtubeUrl }) {
  const [playing, setPlaying] = useState(false);
  const videoId = extractYouTubeId(youtubeUrl);
  const showToast = useToast();

  function handlePlay() {
    if (!videoId) {
      showToast('No demo video has been set for this script yet');
      return;
    }
    setPlaying(true);
  }

  return (
    <div className="live-feed" data-reveal-img>
      {playing && videoId ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="Demo video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          {videoId && (
            <img
              className={`live-feed-thumb${videoId ? '' : ''}`}
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt="Video thumbnail"
              onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
            />
          )}
          <span className="live-tag">REC</span>
          <button className="play-btn" type="button" aria-label="Play demo video" onClick={handlePlay}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export default function ScriptDetail() {
  const { slug } = useParams();
  const [script, setScript] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [relatedScripts, setRelatedScripts] = useState([]);
  const showToast = useToast();

  useEffect(() => {
    let cancelled = false;
    api
      .getScript(slug)
      .then((data) => {
        if (cancelled) return;
        setScript(data);
        api.trackEvent(slug, 'view'); // fire-and-forget, never blocks rendering
      })
      .catch(() => !cancelled && setNotFound(true));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    api.getScripts().then((list) => {
      if (cancelled) return;
      setRelatedScripts(list.filter((s) => s.slug !== slug && s.status === 'active'));
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useScrollReveal([script]);
  useDocumentHead({
    title: script ? `${script.name} — TITANIC HUB` : undefined,
    description: script?.summary,
    jsonLd: script
      ? {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: script.name,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Roblox',
          softwareVersion: script.latest_version,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
        }
      : null
  });

  if (notFound) return <Navigate to="/404" replace />;
  if (!script) {
    return (
      <>
        <ScrollChrome />
        <Header />
        <div className="wrap" style={{ padding: '60px 0' }}>
          <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
        </div>
        <Footer />
      </>
    );
  }

  async function handleCopyScript() {
    try {
      await navigator.clipboard.writeText(script.loadstring_url ? buildLoadstring(script.loadstring_url) : '');
      showToast('Script copied to clipboard');
      api.trackEvent(slug, 'click');
    } catch {
      showToast('Copy failed — press Ctrl+C to copy manually');
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard');
    } catch {
      showToast('Copy the URL from your address bar');
    }
  }

  function buildLoadstring(url) {
    return `loadstring(game:HttpGet("${url}"))()`;
  }

  return (
    <>
      <ScrollChrome />
      <Header />

      <div className="wrap">
        <p className="breadcrumb-row">
          <Link to="/#archive" className="breadcrumb-link">← Back to archive</Link>
          <button className="share-btn" type="button" onClick={handleCopyLink}>
            <svg className="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="18" cy="5" r="2.5" />
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="19" r="2.5" />
              <path d="M8.3 10.7l7.4-4.4M8.3 13.3l7.4 4.4" />
            </svg>
            Copy link
          </button>
        </p>

        <div className="dossier-head" data-reveal-text>
          <span className="stamp">{script.status === 'active' ? 'ACTIVE' : 'CLASSIFIED'}</span>
          <h1>{script.name}</h1>
          <div className="tag-row">
            {(script.tags || []).map((tag) => (
              <Link className="tag" key={tag} to={{ pathname: '/', search: `?tag=${encodeURIComponent(tag)}`, hash: '#archive' }} style={{ textDecoration: 'none' }}>
                {tag}
              </Link>
            ))}
          </div>
          <div className="stats-box">
            <div className="stat-item">
              <span className="stat-label">Status</span>
              <span className="stat-value is-live">{script.status === 'active' ? 'Active' : 'Sealed'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Latest version</span>
              <span className="stat-value">{script.latest_version || '—'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Last updated</span>
              <span className="stat-value">{script.changelog?.[0] ? new Date(script.changelog[0].released_at).toLocaleDateString() : '—'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Maintainer</span>
              <span className="stat-value">Titanic Hub</span>
            </div>
          </div>
        </div>

        <div className="main-grid">
          <div className="col">
            <h2>Overview</h2>
            <p>{script.overview}</p>

            <h2>What it does</h2>
            <ul className="feature-list" data-reveal-text>
              {(script.features || []).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            <div className="req-box">
              <strong>Requirements:</strong> {script.requirements || 'Any Roblox executor that supports HTTP requests via loadstring.'}{' '}
              <Link to="/executors" className="view-log-link">See supported executors</Link>
            </div>
          </div>

          <div className="col">
            <div className="deploy-panel" data-reveal-text>
              <h2>Get script</h2>
              <div className="code-box">
                <code>{script.loadstring_url ? buildLoadstring(script.loadstring_url) : 'Loadstring not set yet'}</code>
              </div>
              <button className="btn copy-btn" onClick={handleCopyScript}>
                Copy script
              </button>
              <ol className="steps">
                <li>Copy the script above.</li>
                <li>Open your executor.</li>
                <li>Paste the script and execute.</li>
                <li>The Titanic Hub UI opens in-game.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="page-section">
        <div className="wrap">
          <h2 data-reveal-text>Live feed</h2>
          <p className="lede-sm">A quick look at the automation in action.</p>
          <LiveFeed youtubeUrl={script.youtube_url} />
          <p className="live-feed-caption">Demonstration of wave-clearing automation.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="wrap">
          <h2 data-reveal-text>Core architecture</h2>
          <p className="lede-sm">Built for stability across long sessions, with an interface that stays out of your way.</p>
          <div className="arch-card">
            <div className="arch-icon" data-reveal-img>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" />
                <path d="M9.5 12l1.8 1.8L15 10.2" />
              </svg>
            </div>
            <h3 data-reveal-text>Modular automation core</h3>
            <p>Farming, combat, quests, and prestige each run as independent modules, so one system updating doesn't break the others.</p>
          </div>
          <div className="arch-card">
            <div className="arch-icon" data-reveal-img>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
            </div>
            <h3 data-reveal-text>Webhook integration</h3>
            <p>Get a Discord ping the moment a Mythic drop or prestige milestone happens, without needing to watch the screen.</p>
          </div>
        </div>
      </section>

      <section className="page-section" id="update-log">
        <div className="wrap">
          <h2 data-reveal-text>Update log</h2>
          <div className="timeline">
            {(script.changelog || []).map((entry, i) => (
              <div key={entry.id} className={`timeline-item${i === 0 ? ' is-latest' : ''}`} data-reveal-text>
                <div className="v-num">{entry.version}</div>
                <div className="v-time">{new Date(entry.released_at).toLocaleDateString()}</div>
                <p>{entry.description}</p>
              </div>
            ))}
            {(!script.changelog || script.changelog.length === 0) && (
              <p style={{ color: 'var(--ink-faint)' }}>No updates logged yet.</p>
            )}
          </div>
        </div>
      </section>

      {relatedScripts.length > 0 && (
        <section className="page-section">
          <div className="wrap">
            <h2 data-reveal-text>Related scripts</h2>
            <p className="lede-sm">Other active dossiers in the archive.</p>
            <div className="archive-grid" style={{ marginTop: 20 }}>
              {relatedScripts.map((s) => (
                <Link key={s.id} to={`/scripts/${s.slug}`} className="card is-active" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: '1.2rem' }}>{s.name}</h3>
                  <p className="desc">{s.summary}</p>
                  <div className="card-foot">
                    <span className="btn btn-block">View script</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
