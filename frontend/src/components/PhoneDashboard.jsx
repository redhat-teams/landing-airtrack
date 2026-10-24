// Téléphone qui affiche le vrai dashboard d'AirTrack : carte qui suit un tracker, panneau « Vos trackers »
// avec les cartes enrichies (barre d'état, pastille En ligne, vitesse, batterie). Tout est alimenté par la simulation.
import { Bell, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CityMap } from './CityMap';
import { Logo } from './Logo';
import { relativeTime, useFleet } from '../lib/fleet';

const FOCUS_ORDER = ['yaris', 'djakarta', 'camion', 'sac'];

function batteryColor(pct) {
  if (pct <= 20) return '#DC2626';
  if (pct <= 50) return '#D97706';
  return '#1E9E4A';
}

export function TrackerCard({ t, selected }) {
  const accent = !t.online ? '#9CA3AF' : t.moving ? '#E8650A' : '#1E9E4A';
  return (
    <div className={`tcard${selected ? ' tcard--selected' : ''}`}>
      <span className="tcard__accent" style={{ background: accent }} />
      <span className={`tcard__emoji${t.online ? ' tcard__emoji--on' : ''}`}>{t.emoji}</span>
      <span className="tcard__body">
        <span className="tcard__row">
          <span className="tcard__name">{t.name}</span>
          <span className={`pill${t.online ? ' pill--on' : ''}`}>
            <span className="pill__dot" />
            {t.online ? 'En ligne' : 'Hors ligne'}
          </span>
        </span>
        <span className="tcard__row tcard__row--meta">
          <span className={t.moving ? 'tcard__speed' : 'tcard__muted'}>{!t.online ? 'Dernière position' : t.moving ? `➤ ${t.kmh} km/h` : '⏸ Arrêté'}</span>
          <span className="tcard__muted">{relativeTime(t.lastSeenS)}</span>
        </span>
        <span className="tcard__battery">
          <span className="tcard__bar">
            <span style={{ width: `${Math.max(4, t.battery)}%`, background: batteryColor(t.battery) }} />
          </span>
          <span className={t.battery <= 20 ? 'tcard__low' : 'tcard__muted'}>{t.battery}%</span>
        </span>
      </span>
    </div>
  );
}

export function PhoneDashboard() {
  const { trackers } = useFleet();
  const [focusIndex, setFocusIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFocusIndex((i) => (i + 1) % FOCUS_ORDER.length), 6500);
    return () => clearInterval(id);
  }, []);
  const focusId = FOCUS_ORDER[focusIndex];
  const target = trackers.find((t) => t.id === focusId);
  const s = 0.58;
  const focus = target ? { tx: 150 - target.x * s, ty: 210 - target.y * s, s } : null;
  const online = trackers.filter((t) => t.online).length;

  return (
    <div className="phone" role="img" aria-label="Aperçu du dashboard AirTrack : carte en temps réel et liste de vos trackers">
      <div className="phone__screen">
        <CityMap trackers={trackers} labels markerLabels={false} focus={focus} selectedId={focusId} viewBox="0 0 300 620" className="citymap--phone" markerSize={0.85} />
        <div className="phone__status">
          <span>9:41</span>
          <span className="phone__island" />
          <span className="phone__signal">
            <i />
            <i />
            <i />
            <i />
            4G
          </span>
        </div>
        <div className="phone__header">
          <Logo size={22} />
          <span className="phone__icons">
            <Search size={14} />
            <Bell size={14} />
          </span>
        </div>
        <div className="phone__sheet">
          <span className="phone__grip" />
          <div className="phone__sheet-head">
            <strong>Vos trackers</strong>
            <span className="online-badge" key={online}>
              <span className="online-badge__dot" />
              {online} en ligne
            </span>
          </div>
          <div className="phone__list">
            {trackers.map((t) => (
              <TrackerCard key={t.id} t={t} selected={t.id === focusId} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
