// Simulation de la flotte : chaque tracker parcourt son itinéraire, s'arrête, accélère, perd de la batterie,
// envoie un « rapport » toutes les quelques secondes et déclenche des alertes (zone, vitesse, batterie).
// Un seul moteur (requestAnimationFrame) alimente la carte du hero, le dashboard du téléphone et le bandeau.
import { useSyncExternalStore } from 'react';

import { FLEET, GEOFENCE } from './cityData';

const SVG_NS = 'http://www.w3.org/2000/svg';
const REPORT_EVERY_S = 5;

let started = false;
let state = { trackers: [], events: [] };
const listeners = new Set();
const eventListeners = new Set();
let lastEmit = 0;

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function makePaths() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.style.pointerEvents = 'none';
  document.body.appendChild(svg);
  return FLEET.map((def) => {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', def.route);
    svg.appendChild(p);
    return p;
  });
}

function nowLabel() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function pushEvent(kind, tracker, text) {
  const ev = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, kind, emoji: tracker.emoji, name: tracker.name, text, time: nowLabel() };
  state = { ...state, events: [ev, ...state.events].slice(0, 12) };
  eventListeners.forEach((fn) => fn(ev));
}

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  const paths = makePaths();
  const sims = FLEET.map((def, i) => {
    const len = paths[i].getTotalLength();
    return {
      def,
      path: paths[i],
      len,
      dist: len * def.offset,
      speed: def.pxPerSec,
      stopLeft: 0,
      stopsDone: new Set(),
      battery: def.battery,
      sinceReport: Math.random() * REPORT_EVERY_S,
      kmh: def.kmh[0],
      kmhTarget: def.kmh[0],
      kmhTimer: 0,
      inZone: null,
      lastSpeedAlert: -999,
      lastBatteryAlert: false,
      clock: 0,
    };
  });

  let prev = performance.now();
  const reduce = reduceMotion();

  const frame = (now) => {
    const dt = Math.min(0.1, (now - prev) / 1000);
    prev = now;
    const trackers = sims.map((s) => step(s, reduce ? 0 : dt));
    if (now - lastEmit > 33) {
      lastEmit = now;
      state = { ...state, trackers };
      listeners.forEach((fn) => fn());
    }
    requestAnimationFrame(frame);
  };
  // Premier état immédiat (positions de départ) pour éviter un écran vide.
  state = { ...state, trackers: sims.map((s) => step(s, 0)) };
  requestAnimationFrame(frame);
}

function step(s, dt) {
  const { def } = s;
  s.clock += dt;
  const moving = def.online && def.pxPerSec > 0;
  if (moving && dt > 0) {
    if (s.stopLeft > 0) {
      s.stopLeft -= dt;
      s.speed = 0;
    } else {
      // Changement de rythme toutes les 2 à 5 s (feux, trafic) : la vitesse affichée suit en douceur.
      s.kmhTimer -= dt;
      if (s.kmhTimer <= 0) {
        s.kmhTimer = 2 + Math.random() * 3;
        const [lo, hi] = def.kmh;
        s.kmhTarget = lo + Math.random() * (hi - lo);
      }
      s.kmh += (s.kmhTarget - s.kmh) * Math.min(1, dt * 1.5);
      const ratio = s.kmh / ((def.kmh[0] + def.kmh[1]) / 2);
      s.speed = def.pxPerSec * ratio;
      s.dist += s.speed * dt;
      if (s.dist >= s.len) {
        s.dist -= s.len;
        s.stopsDone.clear();
      }
      const frac = s.dist / s.len;
      for (const stop of def.stops) {
        if (!s.stopsDone.has(stop.at) && frac >= stop.at && frac < stop.at + 0.05) {
          s.stopsDone.add(stop.at);
          s.stopLeft = stop.s;
        }
      }
    }
    // Batterie : baisse lente, recharge simulée quand elle est très basse.
    s.battery -= dt * (def.id === 'sac' ? 0.35 : 0.04);
    if (s.battery < 11) s.battery = 68;
    s.sinceReport += dt;
    if (s.sinceReport >= REPORT_EVERY_S) s.sinceReport = 0;
  }

  const p = s.path.getPointAtLength(s.dist);
  const ahead = s.path.getPointAtLength((s.dist + 4) % s.len);
  const heading = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
  const stopped = !moving || s.stopLeft > 0;
  const kmh = stopped ? 0 : Math.round(s.kmh);

  const view = {
    id: def.id,
    name: def.name,
    emoji: def.emoji,
    category: def.category,
    x: p.x,
    y: p.y,
    heading,
    kmh,
    moving: !stopped,
    online: def.online,
    battery: Math.round(s.battery),
    lastSeenS: def.online ? Math.round(s.sinceReport) : def.lastSeenS,
    dist: s.dist,
    len: s.len,
  };

  if (dt > 0) checkAlerts(s, view);
  return view;
}

function checkAlerts(s, v) {
  const inside = Math.hypot(v.x - GEOFENCE.cx, v.y - GEOFENCE.cy) <= GEOFENCE.r;
  if (s.inZone !== null && inside !== s.inZone) {
    pushEvent('zone', v, inside ? `est entrée dans la zone ${GEOFENCE.name}` : `est sortie de la zone ${GEOFENCE.name}`);
  }
  s.inZone = inside;

  if (v.kmh >= 80 && s.clock - s.lastSpeedAlert > 25) {
    s.lastSpeedAlert = s.clock;
    pushEvent('speed', v, `roule à ${v.kmh} km/h (limite 80)`);
  }

  if (v.battery <= 20 && !s.lastBatteryAlert) {
    s.lastBatteryAlert = true;
    pushEvent('battery', v, `n'a plus que ${v.battery} % de batterie`);
  } else if (v.battery > 30) {
    s.lastBatteryAlert = false;
  }
}

function subscribe(fn) {
  start();
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const getSnapshot = () => state;

export function useFleet() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function onFleetEvent(fn) {
  start();
  eventListeners.add(fn);
  return () => eventListeners.delete(fn);
}

export function relativeTime(seconds) {
  if (seconds == null) return '—';
  if (seconds < 5) return "à l'instant";
  if (seconds < 60) return `il y a ${seconds} s`;
  const min = Math.round(seconds / 60);
  if (min < 60) return `il y a ${min} min`;
  return `il y a ${Math.floor(min / 60)} h`;
}
