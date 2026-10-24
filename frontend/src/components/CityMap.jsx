// Carte nocturne d'Abidjan en SVG : lagune, océan, rues, ponts, zone surveillée et trackers en mouvement
// avec leur traînée. Utilisée en grand dans le hero et en petit (suivi d'un tracker) dans le téléphone.
import { memo } from 'react';

import { BRIDGES, DISTRICTS, FLEET, GEOFENCE, LAGOON, OCEAN, ROADS, VIEW } from '../lib/cityData';

// Trame de rues générée une fois (pseudo-aléatoire déterministe) : donne la texture « ville ».
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const STREETS = (() => {
  const rnd = seeded(42);
  const blocks = [
    [60, 220, 460, 560, -8],
    [480, 200, 760, 460, 12],
    [700, 60, 1000, 300, -4],
    [980, 160, 1560, 540, 6],
    [600, 690, 1480, 860, -3],
    [100, 60, 680, 240, 3],
  ];
  let d = '';
  for (const [x0, y0, x1, y1, tilt] of blocks) {
    const step = 26 + rnd() * 10;
    for (let x = x0; x < x1; x += step + rnd() * 14) d += `M${x.toFixed(0)},${y0} L${(x + tilt).toFixed(0)},${y1} `;
    for (let y = y0; y < y1; y += step + rnd() * 12) d += `M${x0},${y.toFixed(0)} L${x1},${(y + tilt * 0.6).toFixed(0)} `;
  }
  return d;
})();

const STATUS_COLOR = { moving: '#E8650A', online: '#1E9E4A', offline: '#7C8AA5' };
const statusOf = (t) => (!t.online ? 'offline' : t.moving ? 'moving' : 'online');

const Marker = memo(function Marker({ t, showLabel, selected, size = 1 }) {
  const color = STATUS_COLOR[statusOf(t)];
  const label = t.online ? (t.moving ? `${t.kmh} km/h` : 'Arrêté') : 'Hors ligne';
  const w = Math.round((t.name.length + label.length) * 6.6 + 34);
  return (
    <g transform={`translate(${t.x.toFixed(1)} ${t.y.toFixed(1)}) scale(${size})`} className={`marker marker--${statusOf(t)}${selected ? ' marker--selected' : ''}`}>
      {t.online ? <circle r="30" className="marker__pulse" style={{ fill: color }} /> : null}
      {t.moving ? (
        <g transform={`rotate(${t.heading.toFixed(0)})`}>
          <path d="M27,0 L19,-6 L19,6 Z" fill={color} />
        </g>
      ) : null}
      <circle r="19" fill="#fff" stroke={color} strokeWidth={selected ? 5 : 3.5} />
      <text className="marker__emoji" textAnchor="middle" dominantBaseline="central" y="1">
        {t.emoji}
      </text>
      {showLabel ? (
        <g transform="translate(26 -34)" className="marker__label">
          <rect width={w} height="26" rx="13" />
          <circle cx="13" cy="13" r="4" fill={color} />
          <text x="23" y="17.5" className="marker__name">
            {t.name}
            <tspan dx="6" className={t.moving ? 'marker__speed' : 'marker__state'}>
              {label}
            </tspan>
          </text>
        </g>
      ) : null}
    </g>
  );
});

export function CityMap({ trackers, labels = true, markerLabels = true, focus, selectedId, viewBox, className = '', markerSize = 1 }) {
  const vb = viewBox || `0 0 ${VIEW.w} ${VIEW.h}`;
  const transform = focus ? `translate(${focus.tx}px, ${focus.ty}px) scale(${focus.s})` : undefined;
  return (
    <svg className={`citymap ${className}`} viewBox={vb} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="cm-glow" cx="55%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#123a7a" />
          <stop offset="60%" stopColor="#0a2250" />
          <stop offset="100%" stopColor="#061733" />
        </radialGradient>
        <linearGradient id="cm-water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0f3577" />
          <stop offset="100%" stopColor="#0a2a62" />
        </linearGradient>
        <filter id="cm-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <g className="citymap__world" style={{ transform }}>
        <rect x="-400" y="-400" width={VIEW.w + 800} height={VIEW.h + 800} fill="url(#cm-glow)" />
        <path d={STREETS} className="citymap__streets" />
        {ROADS.map((d) => (
          <path key={d} d={d} className="citymap__road" />
        ))}
        <path d={LAGOON} fill="url(#cm-water)" className="citymap__lagoon" />
        <path d={LAGOON} className="citymap__ripples" />
        <path d={OCEAN} fill="url(#cm-water)" className="citymap__ocean" />
        <path d="M0,902 C300,880 600,908 900,890 C1200,874 1400,902 1600,884" className="citymap__coast" />
        {BRIDGES.map((b) => (
          <path key={b.name} d={b.d} className="citymap__bridge" />
        ))}
        {labels
          ? DISTRICTS.map((d) => (
              <text key={d.name} x={d.x} y={d.y} className="citymap__district" textAnchor="middle">
                {d.name}
              </text>
            ))
          : null}
        {labels ? (
          <text x="420" y="640" className="citymap__water-label">
            Lagune Ébrié
          </text>
        ) : null}

        <g className="citymap__geofence">
          <circle cx={GEOFENCE.cx} cy={GEOFENCE.cy} r={GEOFENCE.r} className="geofence__fill" />
          <circle cx={GEOFENCE.cx} cy={GEOFENCE.cy} r={GEOFENCE.r} className="geofence__ring" />
        </g>

        {FLEET.map((f) => (
          <path key={f.id} d={f.route} className="citymap__route" />
        ))}

        {trackers.map((t) => {
          if (!t.online || t.len < 10) return null;
          const def = FLEET.find((f) => f.id === t.id);
          const trail = Math.min(t.len * 0.45, 260);
          const color = t.id === 'sac' ? '#2BC266' : '#E8650A';
          const dash = `${trail} ${t.len}`;
          const offset = -(t.dist - trail);
          return (
            <g key={`trail-${t.id}`}>
              <path d={def.route} className="citymap__trail-glow" style={{ stroke: color, strokeDasharray: dash, strokeDashoffset: offset }} filter="url(#cm-blur)" />
              <path d={def.route} className="citymap__trail" style={{ stroke: color, strokeDasharray: dash, strokeDashoffset: offset }} />
            </g>
          );
        })}

        {trackers.map((t) => (
          <Marker key={t.id} t={t} showLabel={markerLabels} selected={selectedId === t.id} size={markerSize} />
        ))}
      </g>
    </svg>
  );
}
