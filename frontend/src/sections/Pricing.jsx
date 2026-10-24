import { Check } from 'lucide-react';
import { motion } from 'motion/react';

import { formatXof } from '../lib/api';

const NOTES = { free: 'Pour essayer avec un seul objet', pro: 'Pour la famille et les petits pros', business: 'Pour les flottes et les entreprises' };

export function Pricing({ plans }) {
  return (
    <section className="section pricing" id="tarifs">
      <div className="container">
        <h2 className="h2">Un prix clair, en francs CFA</h2>
        <p className="section__lead">Sans engagement. Vous changez de plan depuis Profil, Abonnement, et vous payez en Mobile Money.</p>
        <div className="plans">
          {plans.map((p, i) => (
            <motion.article key={p.code} className={`plan plan--${p.code}`} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}>
              <header>
                <h3>{p.name}</h3>
                <p>{NOTES[p.code]}</p>
              </header>
              <p className="plan__price">
                <strong>{formatXof(p.price_xof)}</strong>
                <span>par mois</span>
              </p>
              <p className="plan__trackers">
                {p.max_trackers} tracker{p.max_trackers > 1 ? 's' : ''}, {p.history_days} jours d’historique
              </p>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>
                    <Check size={16} /> {f}
                  </li>
                ))}
              </ul>
              <a href="#telecharger" className={`btn ${p.code === 'pro' ? 'btn--orange' : 'btn--ghost'}`}>
                {p.price_xof === 0 ? 'Commencer gratuitement' : `Choisir ${p.name}`}
              </a>
            </motion.article>
          ))}
        </div>
        <p className="pricing__pay">
          Paiement via CinetPay :
          {['Orange Money', 'MTN MoMo', 'Moov Money', 'Wave'].map((m) => (
            <span key={m} className="chip">
              {m}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
