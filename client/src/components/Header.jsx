import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import AnnouncementBanner from './AnnouncementBanner';

const DiscordIcon = () => (
  <svg className="discord-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg className="youtube-icon" viewBox="0 0 24 24" aria-hidden="true" fill="#FF0000">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/#archive', label: 'Archive' },
  { to: '/executors', label: 'Executors' },
  { to: '/#briefing', label: 'FAQ' }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();
  const discordInvite = settings?.discordInvite || '#';
  const youtubeChannel = settings?.youtubeChannel;
  const siteName = settings?.siteName || 'TITANIC HUB';

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    if (to.startsWith('/#')) return false; // in-page anchors: no static active state
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <AnnouncementBanner />
      <header>
        <nav className="nav">
          <Link to="/" className="brand">
            <img src="/assets/logo.png" alt={siteName} className="brand-mark-img" />
          </Link>

          <div className="nav-links-desktop">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} to={link.to} className={isActive(link.to) ? 'is-active' : ''}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            {youtubeChannel && (
              <a href={youtubeChannel} className="icon-btn" aria-label="YouTube channel" target="_blank" rel="noreferrer">
                <YouTubeIcon />
              </a>
            )}
            <a href={discordInvite} className="icon-btn" aria-label="Join Discord">
              <DiscordIcon />
            </a>
            <button
              className="icon-btn menu-toggle"
              type="button"
              aria-expanded={open}
              aria-controls="menu-panel"
              aria-label="Open menu"
              onClick={() => setOpen((o) => !o)}
            >
              <svg
                className="menu-icon-bars"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
              <svg
                className="menu-icon-close"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          <div className={`menu-panel${open ? ' is-open' : ''}`} id="menu-panel">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`menu-link${isActive(link.to) ? ' is-active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <div className={`menu-backdrop${open ? ' is-open' : ''}`} onClick={() => setOpen(false)} />
    </>
  );
}
