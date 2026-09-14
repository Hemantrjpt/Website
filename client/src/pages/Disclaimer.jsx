import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollChrome from '../components/ScrollChrome';
import { useSettings } from '../hooks/useSettings';
import { useDocumentHead } from '../hooks/useDocumentHead';

export default function Disclaimer() {
  const { settings, loading } = useSettings();
  const disclaimer = settings?.disclaimer;

  useDocumentHead({ title: `Disclaimer — ${settings?.siteName || 'TITANIC HUB'}` });

  return (
    <>
      <ScrollChrome />
      <Header />

      <div className="wrap" style={{ maxWidth: 820 }}>
        <p className="breadcrumb"><Link to="/">← Back to home</Link></p>

        <div className="page-head">
          <h1>Disclaimer</h1>
          <p className="lede-sm">Read this before using anything from the archive.</p>
        </div>

        {loading && <p style={{ color: 'var(--ink-faint)', padding: '24px 0' }}>Loading…</p>}

        {!loading && disclaimer && (
          <div className="legal-body">
            {disclaimer.sections.map((section) => (
              <div key={section.id}>
                <h2>{section.heading}</h2>
                {section.body.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ))}
            <p className="updated-note">Last updated: {disclaimer.lastUpdated}. This page is a general disclaimer, not legal advice.</p>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
