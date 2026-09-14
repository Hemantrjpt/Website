export default function ExecutorCard({ executor }) {
  const platformClass = executor.platform === 'Mobile' ? 'mobile' : 'pc';
  const mono = executor.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="exec-card">
      <div className={`exec-cover ${platformClass}`} data-reveal-img>
        {executor.image_url && (
          <img
            className="exec-img"
            src={executor.image_url}
            alt={executor.name}
            onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
            onError={(e) => e.currentTarget.remove()}
          />
        )}
        <span className="exec-platform-badge">{executor.platform}</span>
        <span className={`exec-status${executor.status !== 'recommended' ? ` ${executor.status}` : ''}`}>
          {executor.status === 'recommended' ? 'Recommended' : executor.status === 'supported' ? 'Supported' : 'Untested'}
        </span>
        <span className="exec-mono">{mono}</span>
      </div>
      <div className="exec-body">
        <span className="executor-name" data-reveal-text>{executor.name}</span>
        <a href={executor.visit_url || '#'} className="exec-link" target="_blank" rel="noreferrer">
          Visit site
        </a>
      </div>
    </div>
  );
}
