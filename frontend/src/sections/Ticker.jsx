// Bandeau défilant du journal d'activité : alertes de la simulation en direct + exemples du quotidien.
import { useFleet } from '../lib/fleet';

const BASE = [
  { emoji: '🚗', text: 'Peugeot 308 garée à Cocody Angré depuis 2 h', time: '07:58' },
  { emoji: '🏍️', text: 'Moto Djakarta a terminé sa course à Adjamé : 7,4 km', time: '08:06' },
  { emoji: '🎒', text: "Sac école est arrivé à l'école", time: '07:31' },
  { emoji: '🚚', text: 'Camion livraison est sorti du port de Vridi', time: '08:12' },
  { emoji: '🔑', text: 'Clés maison localisées par Bluetooth', time: '08:20' },
  { emoji: '🛵', text: 'Scooter livreur est passé en 2G : actualisation toutes les 60 s', time: '08:24' },
  { emoji: '🚗', text: 'Alerte SMS envoyée : mouvement à 02:14 hors plage horaire', time: '02:14' },
];

export function Ticker() {
  const { events } = useFleet();
  const items = [...events.slice(0, 4).map((e) => ({ emoji: e.emoji, text: `${e.name} ${e.text}`, time: e.time, live: true })), ...BASE];
  const row = items.map((it, i) => (
    <span className={`ticker__item${it.live ? ' ticker__item--live' : ''}`} key={`${i}-${it.text}`}>
      <span className="ticker__time">{it.time}</span>
      <span aria-hidden="true">{it.emoji}</span>
      {it.text}
    </span>
  ));
  return (
    <div className="ticker" aria-label="Journal d'activité des trackers">
      <div className="ticker__track">
        <div className="ticker__row">{row}</div>
        <div className="ticker__row" aria-hidden="true">
          {row}
        </div>
      </div>
    </div>
  );
}
