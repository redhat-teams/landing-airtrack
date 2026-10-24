import { Logo } from '../components/Logo';

export function Footer({ contact }) {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo onDark size={34} />
          <p>Suivi GPS en temps réel pour véhicules, motos et objets de valeur. Conçu à Abidjan pour la Côte d’Ivoire et l’Afrique de l’Ouest.</p>
        </div>
        <nav aria-label="Liens du pied de page">
          <h4>Produit</h4>
          <a href="#fonctionnalites">Fonctionnalités</a>
          <a href="#boitier">Le boîtier</a>
          <a href="#tarifs">Tarifs</a>
          <a href="#telecharger">Télécharger</a>
        </nav>
        <nav aria-label="Aide">
          <h4>Aide</h4>
          <a href="#aide">Questions fréquentes</a>
          <a href="#newsletter">Newsletter</a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </nav>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} AirTrack, Abidjan</span>
        <span>Paiements sécurisés par CinetPay</span>
      </div>
    </footer>
  );
}
