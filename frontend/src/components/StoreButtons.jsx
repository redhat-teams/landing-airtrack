// Boutons de téléchargement : APK direct, Google Play, App Store. Un lien non configuré affiche « Bientôt ».
import { Download, Smartphone, Store } from 'lucide-react';

const ITEMS = [
  { key: 'apk', icon: Download, top: 'Android', label: "Télécharger l'APK", primary: true },
  { key: 'android', icon: Store, top: 'Disponible sur', label: 'Google Play' },
  { key: 'ios', icon: Smartphone, top: 'Télécharger sur', label: "l'App Store" },
];

export function StoreButtons({ downloads, compact = false }) {
  return (
    <div className={`stores${compact ? ' stores--compact' : ''}`}>
      {ITEMS.map(({ key, icon: Icon, top, label, primary }) => {
        const href = downloads[key];
        const cls = `store${primary ? ' store--primary' : ''}${href ? '' : ' store--soon'}`;
        const content = (
          <>
            <Icon size={22} strokeWidth={2} aria-hidden="true" />
            <span className="store__text">
              <small>{href ? top : 'Bientôt'}</small>
              <span>{label}</span>
            </span>
          </>
        );
        return href ? (
          <a key={key} className={cls} href={href} rel="noopener">
            {content}
          </a>
        ) : (
          <span key={key} className={cls} aria-disabled="true" title="Lien bientôt disponible">
            {content}
          </span>
        );
      })}
    </div>
  );
}
