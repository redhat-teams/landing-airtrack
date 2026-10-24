import { Plus, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import { openAssistant } from '../components/Assistant';

const FAQ = [
  { q: 'Mon tracker n’apparaît pas sur la carte', a: 'Vérifiez qu’il est alimenté et à l’extérieur pour capter le GPS : le premier fix peut prendre 1 à 2 minutes. Ensuite, touchez « Localiser maintenant » depuis la fiche du tracker.' },
  { q: 'Quelle carte SIM faut-il ?', a: 'Une nano-SIM avec données mobiles, code PIN désactivé : Orange, MTN ou Moov. Comptez environ 1 Mo par mois avec une position toutes les 30 secondes.' },
  { q: 'Comment ajouter un deuxième tracker ?', a: 'Le plan Free permet un tracker. Passez au plan Pro (3 trackers) ou Business (20 trackers) depuis Profil, Abonnement.' },
  { q: 'Le Bluetooth ne détecte rien', a: 'Le Bluetooth du tracker reste actif 10 minutes après chaque démarrage. Redémarrez-le, restez à proximité, ou scannez simplement le QR code collé sous le boîtier.' },
  { q: 'Que se passe-t-il sans réseau ?', a: 'En réseau faible, l’app passe en actualisation toutes les 60 secondes. Hors connexion, elle affiche les dernières positions connues et rattrape dès le retour du signal.' },
  { q: 'Puis-je partager un tracker ?', a: 'Oui, depuis la fiche du tracker : vos proches le voient sur leur carte avec l’étiquette « Partagé ».' },
];

export function Faq({ contact }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq" id="aide">
      <div className="container faq__grid">
        <div className="faq__aside">
          <h2 className="h2">Questions fréquentes</h2>
          <p>Vous ne trouvez pas votre réponse ? L’assistant connaît l’application, les plans et le boîtier, et répond tout de suite.</p>
          <button type="button" className="btn btn--navy" onClick={() => openAssistant()}>
            <Sparkles size={18} /> Demander à l’assistant
          </button>
          <p className="faq__contact">
            Support : <a href={`mailto:${contact.email}`}>{contact.email}</a>
            {contact.whatsapp ? (
              <>
                {' '}
                ou <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}>WhatsApp</a>
              </>
            ) : null}
          </p>
        </div>
        <div className="faq__list">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={`faq__item${isOpen ? ' is-open' : ''}`}>
                <button type="button" className="faq__q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
                  {item.q}
                  <Plus size={20} className="faq__plus" />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div className="faq__a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                      <p>{item.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
