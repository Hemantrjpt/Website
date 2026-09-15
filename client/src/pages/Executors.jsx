import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollChrome from '../components/ScrollChrome';
import ExecutorCard from '../components/ExecutorCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useSettings } from '../hooks/useSettings';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { api } from '../api/client';

export default function Executors() {
  const { settings } = useSettings();
  const [executors, setExecutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getExecutors()
      .then((data) => !cancelled && setExecutors(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useScrollReveal([executors]);
  useDocumentHead({
    title: `Supported Executors — ${settings?.siteName || 'TITANIC HUB'}`,
    description: "Executors our scripts have been tested with, and where to find them.",
    jsonLd: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Supported Executors' }
  });

  return (
    <>
      <ScrollChrome />
      <Header />

      <div className="wrap">
        <p className="breadcrumb"><Link to="/#archive">← Back to archive</Link></p>

        <div className="page-head" data-reveal-text>
          <h1>Supported executors</h1>
          <p className="lede-sm">Where our scripts have actually been tested. If yours isn't listed, it may still work — it just isn't verified yet.</p>
        </div>

        {loading && <p style={{ color: 'var(--ink-faint)', padding: '24px 0' }}>Loading…</p>}
        {error && <p style={{ color: '#e08a72', padding: '24px 0' }}>Couldn't load executors: {error}</p>}

        {!loading && !error && (
          <div className="executor-grid">
            {executors.map((ex) => (
              <ExecutorCard key={ex.id} executor={ex} />
            ))}
          </div>
        )}

        <p className="exec-note">
          This list reflects what's been tested by us or the community, not an endorsement of any executor's safety.
          Always download executors from their official source, and use your own judgment before running third-party
          software.
        </p>
      </div>

      <Footer />
    </>
  );
}
