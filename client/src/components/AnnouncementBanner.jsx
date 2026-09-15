import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';

export default function AnnouncementBanner() {
  const { settings } = useSettings();
  const [dismissed, setDismissed] = useState(false);

  if (!settings?.announcement?.enabled || dismissed) return null;

  return (
    <div
      style={{
        background: 'var(--brass)',
        color: '#191305',
        padding: '10px 20px',
        fontSize: '0.9rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        position: 'relative',
        textAlign: 'center'
      }}
    >
      <span>{settings.announcement.text}</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        style={{
          position: 'absolute',
          right: 16,
          background: 'none',
          border: 'none',
          color: '#191305',
          cursor: 'pointer',
          fontSize: '1.1rem',
          lineHeight: 1,
          padding: 4
        }}
      >
        ×
      </button>
    </div>
  );
}
