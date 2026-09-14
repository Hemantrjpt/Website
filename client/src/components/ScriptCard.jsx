import { Link } from 'react-router-dom';

const TitanArt = () => (
  <svg className="cover-art" viewBox="0 0 120 160" fill="none" aria-hidden="true">
    <path
      d="M60 8c-14 0-24 12-24 26 0 10 5 18 5 18l-14 10c-6 4-9 11-9 18v70c0 6 5 10 10 10h64c5 0 10-4 10-10V80c0-7-3-14-9-18l-14-10s5-8 5-18c0-14-10-26-24-26z"
      fill="#170d09"
      fillOpacity="0.85"
    />
    <circle cx="48" cy="46" r="4" fill="#e0b563" />
    <circle cx="72" cy="46" r="4" fill="#e0b563" />
  </svg>
);

function CoverImage({ src }) {
  if (!src) return null;
  return (
    <img
      className="cover-photo"
      src={src}
      alt=""
      onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
      onError={(e) => e.currentTarget.remove()}
    />
  );
}

export default function ScriptCard({ script, index }) {
  const isActive = script.status === 'active';
  const indexLabel = script.cover_index || String(index + 1).padStart(2, '0');

  if (!isActive) {
    return (
      <article className="card" data-status="locked">
        <div className="cover cover-locked" data-reveal-img>
          <CoverImage src={script.cover_image_url} />
          <span className="cover-index">{indexLabel}</span>
          <span className="stamp locked">CLASSIFIED</span>
          <span className="cover-seal">FILE SEALED</span>
        </div>
        <h3 data-reveal-text>{script.name}</h3>
        <p className="game-tag">Sealed</p>
        <p className="desc">{script.summary || 'Details sealed until deployment. Check the Discord for progress updates.'}</p>
        <div className="card-foot">
          <button className="btn-locked" disabled>
            Locked
          </button>
        </div>
      </article>
    );
  }

  return (
    <Link to={`/scripts/${script.slug}`} className="card is-active" data-status="active">
      <div className="cover cover-active" data-reveal-img>
        <CoverImage src={script.cover_image_url} />
        <span className="cover-index">{indexLabel}</span>
        <span className="stamp">ACTIVE</span>
        {!script.cover_image_url && <TitanArt />}
      </div>
      <h3 data-reveal-text>{script.name}</h3>
      <p className="desc">{script.summary}</p>
      <div className="card-foot">
        <span className="btn btn-block">Get script</span>
      </div>
    </Link>
  );
}
