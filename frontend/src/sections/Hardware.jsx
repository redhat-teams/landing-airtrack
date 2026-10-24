// Le boîtier T-A7670G : il flotte, émet ses ondes, les satellites GPS tournent au-dessus ; caractéristiques autour.
import { motion } from 'motion/react';

const SPECS_LEFT = [
  { title: '4G LTE Cat-1', text: 'Repli automatique en 2G quand le réseau faiblit.' },
  { title: 'GPS L76K', text: 'La précision est affichée en cercle sur la carte.' },
  { title: 'Batterie 18650', text: 'Rechargeable, avec un mode économie.' },
];
const SPECS_RIGHT = [
  { title: 'Bluetooth', text: 'Appairage avec le téléphone, sans saisie.' },
  { title: '15, 30 ou 60 s', text: 'Vous choisissez la fréquence des positions.' },
  { title: 'Environ 1 Mo par mois', text: 'Une SIM data Orange, MTN ou Moov suffit.' },
];

function Spec({ s, i, side }) {
  return (
    <motion.li className={`spec spec--${side}`} initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}>
      <strong>{s.title}</strong>
      <span>{s.text}</span>
    </motion.li>
  );
}

function Device() {
  return (
    <svg viewBox="0 0 420 460" className="device" aria-hidden="true">
      <defs>
        <linearGradient id="dv-body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#2a3346" />
          <stop offset="55%" stopColor="#121826" />
          <stop offset="100%" stopColor="#090c14" />
        </linearGradient>
        <linearGradient id="dv-edge" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#4b5874" />
          <stop offset="100%" stopColor="#141a28" />
        </linearGradient>
        <radialGradient id="dv-led" r="50%">
          <stop offset="0%" stopColor="#7CFFAE" />
          <stop offset="100%" stopColor="#1E9E4A" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Satellites */}
      <g className="sats">
        {[0, 1, 2].map((i) => (
          <g key={i} className="sat" style={{ '--d': `${i * -6}s` }}>
            <g transform="translate(-14 -8)">
              <rect x="10" y="4" width="8" height="8" rx="2" fill="#9DB8F5" />
              <rect x="0" y="6" width="9" height="4" fill="#1E4FA3" />
              <rect x="19" y="6" width="9" height="4" fill="#1E4FA3" />
            </g>
          </g>
        ))}
      </g>
      {/* Ondes */}
      <g transform="translate(210 150)" className="waves">
        <path d="M-40,-10 A50,50 0 0 1 40,-10" />
        <path d="M-62,-22 A74,74 0 0 1 62,-22" />
        <path d="M-84,-34 A98,98 0 0 1 84,-34" />
      </g>
      {/* Boîtier */}
      <g className="device__body">
        <rect x="120" y="170" width="180" height="250" rx="34" fill="url(#dv-edge)" />
        <rect x="124" y="174" width="172" height="242" rx="31" fill="url(#dv-body)" />
        <rect x="150" y="200" width="120" height="70" rx="14" fill="#0b0f19" stroke="#2b3550" />
        <text x="210" y="244" textAnchor="middle" className="device__gps">
          GPS
        </text>
        <text x="210" y="390" textAnchor="middle" className="device__brand">
          AirTrack
        </text>
        <circle cx="210" cy="320" r="18" fill="url(#dv-led)" className="device__led-glow" />
        <circle cx="210" cy="320" r="5" fill="#2BC266" className="device__led" />
        <path d="M150,178 Q210,168 270,178" stroke="rgba(255,255,255,.18)" strokeWidth="2" fill="none" />
      </g>
      <ellipse cx="210" cy="446" rx="96" ry="10" className="device__shadow" />
    </svg>
  );
}

export function Hardware() {
  return (
    <section className="section hardware" id="boitier">
      <div className="hardware__stars" aria-hidden="true" />
      <div className="container">
        <motion.div className="hardware__head" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <h2 className="h2 h2--light">Le boîtier se cache, la carte voit tout</h2>
          <p>Modem 4G, GPS et Bluetooth réunis sur la carte LILYGO T-A7670G, alimentés par batterie ou par le 12 V du véhicule, avec détection de coupure en option.</p>
        </motion.div>
        <div className="hardware__grid">
          <ul className="specs">
            {SPECS_LEFT.map((s, i) => (
              <Spec key={s.title} s={s} i={i} side="left" />
            ))}
          </ul>
          <div className="hardware__device">
            <Device />
          </div>
          <ul className="specs">
            {SPECS_RIGHT.map((s, i) => (
              <Spec key={s.title} s={s} i={i} side="right" />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
