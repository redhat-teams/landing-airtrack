// Téléchargement : QR code (vers l'APK ou le Play Store) + les trois boutons + aide à l'installation de l'APK.
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

import { Logo } from '../components/Logo';
import { StoreButtons } from '../components/StoreButtons';

export function Download({ downloads }) {
  const target = downloads.apk || downloads.android || downloads.ios;
  const qrValue = target ? new URL(target, window.location.origin).href : null;
  return (
    <section className="section download" id="telecharger">
      <div className="download__glow" aria-hidden="true" />
      <div className="container download__grid">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <h2 className="h2 h2--light">Installez AirTrack maintenant</h2>
          <p className="download__lead">Gratuit avec le plan Free : un tracker, 7 jours d’historique et les alertes push. Vous passez à Pro quand vous voulez.</p>
          <StoreButtons downloads={downloads} />
          <details className="download__help">
            <summary>Installer l’APK sur Android</summary>
            <ol>
              <li>Touchez « Télécharger l’APK » depuis votre téléphone.</li>
              <li>Ouvrez le fichier AirTrack.apk dans vos téléchargements.</li>
              <li>Si Android le demande, autorisez votre navigateur à installer des applications, puis touchez « Installer ».</li>
            </ol>
          </details>
        </motion.div>
        <motion.div className="download__card" initial={{ opacity: 0, rotate: -6, y: 40 }} whileInView={{ opacity: 1, rotate: -3, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
          <Logo size={30} />
          {qrValue ? (
            <>
              <QRCodeSVG value={qrValue} size={188} fgColor="#0B3C8C" bgColor="#ffffff" level="M" marginSize={0} />
              <p>Scannez avec l’appareil photo de votre téléphone</p>
            </>
          ) : (
            <>
              <div className="download__qr-soon">QR code disponible dès la mise en ligne de l’application</div>
              <p>Inscrivez-vous à la newsletter pour être prévenu</p>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
