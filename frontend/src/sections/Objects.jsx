// « Ce que vous suivez » : un sélecteur par catégorie (les mêmes que dans l'app) avec scène animée et alertes utiles.
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

const ITEMS = [
  {
    code: 'car',
    emoji: '🚗',
    label: 'Voiture',
    title: 'Garée au Plateau, surveillée depuis votre bureau.',
    text: 'Si elle bouge la nuit, si le moteur est coupé de force ou si elle quitte le quartier, vous le savez dans la seconde.',
    alerts: ['Mouvement hors plage horaire', "Coupure d'alimentation", 'Entrée ou sortie de zone'],
    route: 'M30,150 C90,60 170,60 210,110 C250,160 320,170 370,90',
  },
  {
    code: 'moto',
    emoji: '🏍️',
    label: 'Moto',
    title: 'Chaque course de votre moto-taxi, au mètre près.',
    text: 'Suivez vos chauffeurs en direct, relisez leurs trajets et soyez prévenu en cas de vitesse excessive.',
    alerts: ['Excès de vitesse', 'Replay des trajets', 'Perte de signal'],
    route: 'M20,110 C80,170 140,40 200,100 C260,160 300,40 380,80',
  },
  {
    code: 'truck',
    emoji: '🚚',
    label: 'Camion',
    title: 'Vos livraisons, de Vridi à Abobo.',
    text: "Jusqu'à 20 véhicules avec le plan Business, un historique d'un an et des rapports d'activité pour votre flotte.",
    alerts: ['Rapports Business', 'Historique 365 jours', 'Alertes push + SMS'],
    route: 'M20,160 L120,160 C160,160 170,60 220,60 L380,60',
  },
  {
    code: 'object',
    emoji: '🎒',
    label: 'Sac',
    title: "Le cartable de votre enfant, de la maison à l'école.",
    text: "Créez une zone autour de l'école et de la maison : une notification à chaque arrivée et à chaque départ.",
    alerts: ["Zone école et maison", 'Batterie faible à 20 %', 'Partage avec les parents'],
    route: 'M40,140 C100,140 120,70 190,70 C260,70 270,140 360,140',
  },
  {
    code: 'keys',
    emoji: '🔑',
    label: 'Clés',
    title: "Le trousseau qui ne se perd plus.",
    text: 'Touchez « Localiser maintenant » : le tracker envoie sa position tout de suite, et le Bluetooth vous guide à proximité.',
    alerts: ['Localiser maintenant', 'Bluetooth à proximité', 'Dernière position connue'],
    route: 'M200,110 m-70,0 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0',
  },
  {
    code: 'other',
    emoji: '📦',
    label: 'Autre',
    title: 'Colis, valise, matériel de chantier.',
    text: "Tout ce qui a de la valeur et peut accueillir un boîtier. Donnez-lui un nom, il apparaît sur la carte avec les autres.",
    alerts: ['Nom et catégorie libres', 'Mode économie', 'Fréquence 15, 30 ou 60 s'],
    route: 'M30,90 C110,40 160,180 240,120 C300,80 330,60 380,120',
  },
];

export function Objects() {
  const [active, setActive] = useState(ITEMS[0].code);
  const item = ITEMS.find((i) => i.code === active);
  return (
    <section className="section objects" id="fonctionnalites">
      <div className="container">
        <h2 className="h2">Une seule app pour tout ce qui roule, et tout ce qui se perd</h2>
        <div className="objects__tabs" role="tablist" aria-label="Catégories de trackers">
          {ITEMS.map((i) => (
            <button key={i.code} type="button" role="tab" aria-selected={i.code === active} className={`objects__tab${i.code === active ? ' is-active' : ''}`} onClick={() => setActive(i.code)}>
              <span aria-hidden="true">{i.emoji}</span>
              {i.label}
              {i.code === active ? <motion.span layoutId="tab-pill" className="objects__tab-bg" transition={{ type: 'spring', stiffness: 500, damping: 38 }} /> : null}
            </button>
          ))}
        </div>
        <div className="objects__stage" role="tabpanel">
          <AnimatePresence mode="wait">
            <motion.div key={item.code} className="objects__panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
              <div className="objects__scene" aria-hidden="true">
                <svg viewBox="0 0 400 220">
                  <path d={item.route} className="scene__route" />
                  <path d={item.route} className="scene__route-live" pathLength="1" />
                  <circle r="9" className="scene__dot">
                    <animateMotion dur="5s" repeatCount="indefinite" path={item.route} rotate="auto" />
                  </circle>
                </svg>
                <motion.span className="objects__emoji" initial={{ scale: 0.6, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
                  {item.emoji}
                </motion.span>
              </div>
              <div className="objects__text">
                <h3 className="h3">{item.title}</h3>
                <p>{item.text}</p>
                <ul className="objects__alerts">
                  {item.alerts.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
