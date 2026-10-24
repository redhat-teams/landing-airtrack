// Trois démonstrations vivantes : alerte de zone, replay de trajet (curseur manipulable), bascule 4G → 2G.
import { BellRing, Leaf, MessageSquareText, ShieldCheck, Smartphone, Users, Wallet } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useInView, useLoop } from '../lib/useLoop';

function usePath(d) {
  const ref = useRef(null);
  const [len, setLen] = useState(0);
  useEffect(() => {
    if (ref.current) setLen(ref.current.getTotalLength());
  }, [d]);
  const at = (frac) => {
    if (!ref.current || !len) return { x: 0, y: 0 };
    return ref.current.getPointAtLength(Math.max(0, Math.min(1, frac)) * len);
  };
  return { ref, len, at };
}

function Reveal({ children, className = '' }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

/* ---------- 1. Zone géographique ---------- */
const ZONE_PATH = 'M40,250 C110,230 150,170 200,150 C260,126 300,150 340,110 C370,80 390,60 420,40';
const ZONE = { cx: 190, cy: 160, r: 62 };

function GeofenceDemo() {
  const box = useRef(null);
  const visible = useInView(box);
  const t = useLoop(7000, { paused: !visible });
  const { ref, at } = usePath(ZONE_PATH);
  const p = at(t);
  const inside = Math.hypot(p.x - ZONE.cx, p.y - ZONE.cy) <= ZONE.r;
  const [notif, setNotif] = useState(null);
  const wasInside = useRef(null);
  useEffect(() => {
    if (wasInside.current !== null && wasInside.current !== inside) {
      setNotif({ id: Date.now(), text: inside ? 'est entrée dans la zone Maison' : 'est sortie de la zone Maison' });
    }
    wasInside.current = inside;
  }, [inside]);
  useEffect(() => {
    if (!notif) return undefined;
    const id = setTimeout(() => setNotif(null), 2600);
    return () => clearTimeout(id);
  }, [notif]);

  return (
    <div className="demo" ref={box}>
      <svg viewBox="0 0 460 300" className="demo__svg" aria-hidden="true">
        <DemoGrid />
        <circle cx={ZONE.cx} cy={ZONE.cy} r={ZONE.r} className={`demo-zone${inside ? ' is-inside' : ''}`} />
        <circle cx={ZONE.cx} cy={ZONE.cy} r={ZONE.r} className="demo-zone__ring" />
        <text x={ZONE.cx} y={ZONE.cy - ZONE.r - 10} textAnchor="middle" className="demo-label">
          Zone Maison
        </text>
        <path ref={ref} d={ZONE_PATH} className="demo-path" />
        <g transform={`translate(${p.x} ${p.y})`}>
          <circle r="22" className="demo-pulse" />
          <circle r="15" fill="#fff" stroke={inside ? '#1E9E4A' : '#E8650A'} strokeWidth="3" />
          <text textAnchor="middle" dominantBaseline="central" className="demo-emoji">
            🏍️
          </text>
        </g>
      </svg>
      <AnimatePresence>
        {notif ? (
          <motion.div key={notif.id} className="demo-notif" initial={{ opacity: 0, y: -30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ type: 'spring', stiffness: 420, damping: 28 }}>
            <img src="/logo-icon.png" alt="" width="28" height="28" />
            <span>
              <strong>AirTrack</strong>
              Moto Djakarta {notif.text}
            </span>
            <em>SMS + push</em>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DemoGrid() {
  const lines = useMemo(() => {
    const out = [];
    for (let x = 20; x < 460; x += 38) out.push(`M${x},0 L${x + 10},300`);
    for (let y = 18; y < 300; y += 34) out.push(`M0,${y} L460,${y - 6}`);
    return out.join(' ');
  }, []);
  return (
    <>
      <rect width="460" height="300" className="demo-bg" />
      <path d={lines} className="demo-grid" />
      <path d="M0,215 C120,200 220,250 460,210 L460,250 C220,290 120,240 0,255 Z" className="demo-water" />
    </>
  );
}

/* ---------- 2. Replay ---------- */
const TRIP = 'M40,240 C80,240 90,190 130,180 C180,168 190,220 240,214 C300,206 290,120 340,110 C380,102 400,140 430,70';
const STOPS = [0.27, 0.55, 0.82];
const START_MIN = 7 * 60 + 12;
const DURATION_MIN = 34;

function ReplayDemo() {
  const box = useRef(null);
  const visible = useInView(box);
  const [manual, setManual] = useState(null);
  const auto = useLoop(9000, { paused: !visible || manual !== null });
  useEffect(() => {
    if (manual === null) return undefined;
    const id = setTimeout(() => setManual(null), 3500);
    return () => clearTimeout(id);
  }, [manual]);
  const progress = manual !== null ? manual : auto;
  const { ref, len, at } = usePath(TRIP);
  const head = at(progress);
  const minutes = START_MIN + Math.round(progress * DURATION_MIN);
  const clock = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  const nearStop = STOPS.some((s) => Math.abs(s - progress) < 0.025);
  const speed = nearStop ? 0 : Math.round(30 + 25 * Math.abs(Math.sin(progress * 9)));

  return (
    <div className="demo" ref={box}>
      <svg viewBox="0 0 460 300" className="demo__svg" aria-hidden="true">
        <DemoGrid />
        <path d={TRIP} className="demo-path demo-path--ghost" />
        <path ref={ref} d={TRIP} className="demo-trip" style={{ strokeDasharray: len, strokeDashoffset: len * (1 - progress) }} />
        {STOPS.map((s) => {
          const pt = at(s);
          return <circle key={s} cx={pt.x} cy={pt.y} r="5" className={`demo-stop${progress >= s ? ' is-passed' : ''}`} />;
        })}
        <g transform={`translate(${head.x} ${head.y})`}>
          <circle r="12" fill="#fff" stroke="#E8650A" strokeWidth="3" />
          <circle r="4" fill="#E8650A" />
        </g>
        <g transform={`translate(${Math.min(head.x + 14, 360)} ${Math.max(head.y - 44, 8)})`}>
          <rect width="94" height="32" rx="10" className="demo-chip" />
          <text x="10" y="21" className="demo-chip__text">
            {clock}
            <tspan dx="8" className={speed ? 'demo-chip__speed' : ''}>
              {speed ? `${speed} km/h` : 'arrêt'}
            </tspan>
          </text>
        </g>
      </svg>
      <div className="replay">
        <input type="range" min="0" max="1000" value={Math.round(progress * 1000)} onChange={(e) => setManual(Number(e.target.value) / 1000)} aria-label="Avancer dans le trajet" className="replay__range" style={{ '--p': `${progress * 100}%` }} />
        <dl className="replay__stats">
          <div>
            <dt>Distance</dt>
            <dd>{(progress * 12.4).toFixed(1).replace('.', ',')} km</dd>
          </div>
          <div>
            <dt>Vitesse max</dt>
            <dd>58 km/h</dd>
          </div>
          <div>
            <dt>Arrêts</dt>
            <dd>{STOPS.filter((s) => progress >= s).length} / 3</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/* ---------- 3. Réseau 4G → 2G ---------- */
const NET_PATH = 'M30,200 C100,120 160,250 230,170 C290,100 340,220 430,120';
const PHASES = [
  { until: 0.42, net: '4G', bars: 4, mode: 'Temps réel', live: true },
  { until: 0.52, net: '3G', bars: 3, mode: 'Temps réel', live: true },
  { until: 0.9, net: '2G', bars: 1, mode: 'Actualisation toutes les 60 s', live: false },
  { until: 1, net: '4G', bars: 4, mode: 'Retour au temps réel', live: true },
];

function NetworkDemo() {
  const box = useRef(null);
  const visible = useInView(box);
  const t = useLoop(12000, { paused: !visible });
  const phase = PHASES.find((p) => t < p.until) || PHASES[0];
  const { ref, at } = usePath(NET_PATH);
  // En 2G la position n'arrive que par paliers (une mise à jour toutes les « 60 s », accélérées ici).
  const shown = phase.live ? t : Math.floor(t * 28) / 28;
  const p = at(shown);
  const real = at(t);
  return (
    <div className="demo" ref={box}>
      <svg viewBox="0 0 460 300" className="demo__svg" aria-hidden="true">
        <DemoGrid />
        <path ref={ref} d={NET_PATH} className="demo-path" />
        {!phase.live ? <circle cx={real.x} cy={real.y} r="6" className="demo-ghost" /> : null}
        <g transform={`translate(${p.x} ${p.y})`} className={phase.live ? '' : 'demo-jump'}>
          <circle r="22" className="demo-pulse" />
          <circle r="15" fill="#fff" stroke={phase.live ? '#E8650A' : '#9DB8F5'} strokeWidth="3" />
          <text textAnchor="middle" dominantBaseline="central" className="demo-emoji">
            🚚
          </text>
        </g>
      </svg>
      <div className="net">
        <span className="net__bars" aria-hidden="true">
          {[1, 2, 3, 4].map((b) => (
            <i key={b} className={b <= phase.bars ? 'on' : ''} style={{ height: `${b * 5 + 4}px` }} />
          ))}
        </span>
        <motion.strong key={phase.net} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          {phase.net}
        </motion.strong>
        <span className={`net__mode${phase.live ? ' is-live' : ''}`}>{phase.mode}</span>
      </div>
    </div>
  );
}

const EXTRAS = [
  { icon: Users, title: 'Partagez avec vos proches', text: 'Un tracker, plusieurs regards : vos proches le voient sur leur carte avec l’étiquette « Partagé ».' },
  { icon: Wallet, title: 'Payez en Mobile Money', text: 'Orange Money, MTN MoMo, Moov Money ou Wave, reçu par SMS.' },
  { icon: Leaf, title: 'Mode économie', text: 'Une position toutes les 15, 30 ou 60 secondes : vous réglez l’équilibre entre précision et batterie.' },
  { icon: ShieldCheck, title: 'Vos données vous appartiennent', text: 'Code PIN sur l’app, export et suppression de vos données depuis le profil.' },
];

export function Features() {
  return (
    <section className="section features">
      <div className="container">
        <div className="feature">
          <Reveal className="feature__text">
            <BellRing className="feature__icon" size={28} />
            <h3 className="h2 h2--sm">Prévenu avant même de demander</h3>
            <p>Dessinez une zone autour de la maison, du bureau ou de l’école. AirTrack vous alerte à chaque entrée et à chaque sortie, mais aussi en cas d’excès de vitesse, de batterie faible, de mouvement la nuit ou de coupure d’alimentation.</p>
            <p className="feature__note">
              <MessageSquareText size={16} /> Par notification, par SMS, ou les deux.
            </p>
          </Reveal>
          <Reveal className="feature__demo">
            <GeofenceDemo />
          </Reveal>
        </div>

        <div className="feature feature--flip">
          <Reveal className="feature__text">
            <Smartphone className="feature__icon" size={28} />
            <h3 className="h2 h2--sm">Rejouez n’importe quel trajet</h3>
            <p>Glissez le curseur : le trajet se redessine avec les arrêts, la vitesse et l’heure de passage. Jusqu’à 90 jours d’historique avec Pro, un an avec Business.</p>
          </Reveal>
          <Reveal className="feature__demo">
            <ReplayDemo />
          </Reveal>
        </div>

        <div className="feature">
          <Reveal className="feature__text">
            <span className="feature__icon feature__icon--net" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <h3 className="h2 h2--sm">Le réseau faiblit, le suivi continue</h3>
            <p>Le boîtier passe tout seul de la 4G à la 2G. L’application bascule alors en actualisation toutes les 60 secondes, puis revient au temps réel dès que le signal remonte. Hors connexion, vous gardez les dernières positions connues.</p>
          </Reveal>
          <Reveal className="feature__demo">
            <NetworkDemo />
          </Reveal>
        </div>

        <div className="extras">
          {EXTRAS.map(({ icon: Icon, title, text }, i) => (
            <motion.div key={title} className="extra" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}>
              <Icon size={22} className="extra__icon" />
              <h4>{title}</h4>
              <p>{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
