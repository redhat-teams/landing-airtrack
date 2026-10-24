// Logo AirTrack : pictogramme (même image que l'app) + pastille verte qui pulse + mot-symbole Air / Track.
export function Logo({ onDark = false, size = 34 }) {
  return (
    <span className={`logo${onDark ? ' logo--dark' : ''}`} style={{ '--logo-size': `${size}px` }}>
      <span className="logo__mark">
        <img src="/logo-icon.png" alt="" width={size * 0.7} height={size * 0.7} />
        <span className="logo__dot" />
      </span>
      <span className="logo__word">
        <span className="logo__air">Air</span>
        <span className="logo__track">Track</span>
      </span>
    </span>
  );
}
