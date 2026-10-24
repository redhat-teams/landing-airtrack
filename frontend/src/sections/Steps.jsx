// Mise en route : vraie séquence, d'où la numérotation.
import { motion } from 'motion/react';

const STEPS = [
  { title: "Installez l'application", text: 'Entrez votre numéro (+225), le code reçu par SMS, puis choisissez un code PIN à 4 chiffres.' },
  { title: 'Scannez le QR code', text: 'Il est collé sous le boîtier. Pas de QR ? Le Bluetooth le détecte pendant 10 minutes après son démarrage.' },
  { title: 'Donnez-lui un nom', text: '« Peugeot 308 », « Moto Djakarta »… Choisissez une catégorie : il apparaît sur la carte dès son premier signal GPS.' },
];

export function Steps() {
  return (
    <section className="section steps">
      <div className="container steps__grid">
        <div>
          <h2 className="h2">Prêt en trois gestes</h2>
          <ol className="steps__list">
            {STEPS.map((s, i) => (
              <motion.li key={s.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay: i * 0.12 }}>
                <span className="steps__num">{i + 1}</span>
                <span>
                  <strong>{s.title}</strong>
                  <span>{s.text}</span>
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
        <motion.div className="steps__visual" initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <img src="/onboarding-tracking.png" alt="Téléphone affichant AirTrack avec une voiture, une moto et un boîtier GPS" width="567" height="527" loading="lazy" />
        </motion.div>
      </div>
    </section>
  );
}
