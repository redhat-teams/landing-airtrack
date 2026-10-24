import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Logo } from '../components/Logo';

const LINKS = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#boitier', label: 'Le boîtier' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#aide', label: 'Aide' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}${open ? ' nav--open' : ''}`}>
      <div className="nav__inner">
        <a href="#top" className="nav__brand" aria-label="AirTrack, retour en haut">
          <Logo onDark size={32} />
        </a>
        <nav className="nav__links" aria-label="Navigation principale">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#telecharger" className="btn btn--orange nav__cta" onClick={() => setOpen(false)}>
          Télécharger
        </a>
        <button type="button" className="nav__burger" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
