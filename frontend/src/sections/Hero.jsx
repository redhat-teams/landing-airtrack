// Hero : Abidjan de nuit en plein écran, les trackers roulent, la zone Plateau déclenche des alertes,
// le téléphone affiche le dashboard en direct et les catégories gravitent autour.
import { BatteryLow, Gauge, MapPinned } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { CityMap } from '../components/CityMap';
import { PhoneDashboard } from '../components/PhoneDashboard';
import { StoreButtons } from '../components/StoreButtons';
import { onFleetEvent, useFleet } from '../lib/fleet';

const ORBIT = ['🚗', '🏍️', '🚚', '🎒', '🔑', '📦'];
const PAYMENTS = ['Orange Money', 'MTN MoMo', 'Moov Money', 'Wave'];
const EVENT_ICON = { zone: MapPinned, speed: Gauge, battery: BatteryLow };
const EVENT_TITLE = { zone: 'Alerte zone', speed: 'Excès de vitesse', battery: 'Batterie faible' };

function AlertToasts() {
  const [toasts, setToasts] = useState([]);
  useEffect(
    () =>
      onFleetEvent((ev) => {
        setToasts((list) => [ev, ...list].slice(0, 2));
        setTimeout(() => setToasts((list) => list.filter((t) => t.id !== ev.id)), 5200);
      }),
    [],
  );
  return (
    <div className="toasts" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = EVENT_ICON[t.kind] || MapPinned;
          return (
            <motion.div key={t.id} className={`toast toast--${t.kind}`} layout initial={{ opacity: 0, x: 60, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 40, scale: 0.95 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}>
              <span className="toast__icon">
                <Icon size={18} />
              </span>
              <span className="toast__text">
                <strong>
                  {EVENT_TITLE[t.kind]} <time>{t.time}</time>
                </strong>
                <span>
                  {t.emoji} {t.name} {t.text}
                </span>
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

const rise = (delay) => ({ initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] } });

export function Hero({ config }) {
  const { trackers } = useFleet();
  return (
    <section className="hero" id="top">
      <div className="hero__map">
        <CityMap trackers={trackers} />
      </div>
      <div className="hero__veil" />
      <div className="hero__inner">
        <div className="hero__copy">
          <motion.p className="hero__kicker" {...rise(0.1)}>
            <span className="live-dot" /> Suivi GPS en temps réel, pensé pour Abidjan
          </motion.p>
          <motion.h1 className="hero__title" {...rise(0.2)}>
            Tout ce qui compte, toujours sur la carte<span className="hero__period" aria-hidden="true" />
          </motion.h1>
          <motion.p className="hero__lead" {...rise(0.35)}>
            Voiture, moto, camion, cartable ou trousseau de clés : AirTrack vous montre où ils sont, seconde après seconde, et vous prévient par push ou SMS dès que quelque chose cloche. Même quand le réseau passe en 2G.
          </motion.p>
          <motion.div {...rise(0.5)}>
            <StoreButtons downloads={config.downloads} />
          </motion.div>
          <motion.div className="hero__pay" {...rise(0.65)}>
            <span>Abonnement payable en Mobile Money</span>
            <span className="hero__chips">
              {PAYMENTS.map((p) => (
                <span key={p} className="chip chip--glass">
                  {p}
                </span>
              ))}
            </span>
          </motion.div>
        </div>

        <motion.div className="hero__device" initial={{ opacity: 0, y: 60, rotate: 4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          <div className="orbit" aria-hidden="true">
            <div className="orbit__ring" />
            <div className="orbit__ring orbit__ring--2" />
            <div className="orbit__spin">
              {ORBIT.map((e, i) => (
                <span key={e} className="orbit__item" style={{ '--i': i, '--n': ORBIT.length }}>
                  <span className="orbit__bubble">{e}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="hero__float">
            <PhoneDashboard />
          </div>
          <AlertToasts />
        </motion.div>
      </div>
      <a href="#fonctionnalites" className="hero__scroll" aria-label="Voir les fonctionnalités">
        <span />
      </a>
    </section>
  );
}
