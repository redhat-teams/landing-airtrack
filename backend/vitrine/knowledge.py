"""Ce que l'assistant sait d'AirTrack (repris du manuel, des contrats et des textes de l'application).

À tenir à jour quand l'offre change : c'est la seule source des réponses de l'assistant, avec ou sans IA.
"""

PLANS = [
    {"code": "free", "name": "Free", "price_xof": 0, "max_trackers": 1, "history_days": 7, "features": ["Alertes push", "Carte en temps réel", "Historique 7 jours"]},
    {"code": "pro", "name": "Pro", "price_xof": 2500, "max_trackers": 3, "history_days": 90, "features": ["Alertes push + SMS", "Replay des trajets", "Zones géographiques", "Historique 90 jours"]},
    {"code": "business", "name": "Business", "price_xof": 12000, "max_trackers": 20, "history_days": 365, "features": ["Alertes push + SMS", "Rapports d'activité", "Historique 365 jours", "Jusqu'à 20 trackers"]},
]

FACTS = """
AirTrack est une application de suivi GPS en temps réel pour tout ce qui compte : voiture, moto, camion, sac, clés, colis ou tout autre objet. Elle est conçue pour la Côte d'Ivoire et l'Afrique subsaharienne (réseaux Orange CI, MTN CI, Moov), avec des prix en francs CFA.

LE BOÎTIER (tracker)
- Basé sur la carte LILYGO T-A7670G : modem 4G LTE Cat-1 (A7670G) avec repli automatique en 2G, récepteur GPS L76K, batterie 18650 rechargeable, Bluetooth pour l'appairage.
- Il faut une nano-SIM avec données mobiles (code PIN désactivé). Consommation : environ 1 Mo de données par mois avec une position toutes les 30 secondes.
- Fréquence de position réglable : 15, 30 ou 60 secondes, et un mode économie pour la batterie.
- Option : détection de coupure de l'alimentation du véhicule (branchement 12 V).
- Le premier fix GPS peut prendre 1 à 2 minutes, à l'extérieur, ciel dégagé.
- Le prix du boîtier n'est pas public sur le site : inviter à contacter le support.

L'APPLICATION
- Android : APK à télécharger directement sur le site et Google Play. iPhone : App Store (voir disponibilité indiquée sur le site).
- Inscription avec son numéro de téléphone (+225) et un code reçu par SMS, puis un code PIN à 4 chiffres pour verrouiller l'app. Connexion Google ou Apple possible.
- Ajouter un tracker : scanner le QR code collé sous le boîtier, ou le détecter en Bluetooth (le Bluetooth du tracker reste actif 10 minutes après chaque démarrage). Ensuite on lui donne un nom (« Peugeot 308 ») et une catégorie (voiture, moto, camion, objet, clés, autre).
- Carte en temps réel : position, cercle de précision, vitesse ou « Arrêté », batterie, réseau (4G/3G/2G), « mis à jour il y a 12 s ».
- Si le réseau est faible, l'app passe automatiquement en actualisation toutes les 60 secondes (300 s en mode économie). Hors connexion, elle affiche les dernières positions connues.
- Historique des trajets et replay (plan Pro et Business).
- Partage d'un tracker avec ses proches (ils le voient avec l'étiquette « Partagé »).
- Confidentialité : export et suppression de ses données depuis le Profil.

ALERTES
- Zone géographique (entrée / sortie d'une zone, plan Pro), excès de vitesse, batterie faible (20 % puis 10 %), mouvement hors d'une plage horaire, perte de signal, coupure d'alimentation.
- Canal au choix : notification push, SMS, ou les deux.

PLANS (par mois, en francs CFA)
- Free : 0 F, 1 tracker, 7 jours d'historique, alertes push.
- Pro : 2 500 F, 3 trackers, 90 jours d'historique, alertes push + SMS, replay des trajets, zones géographiques.
- Business : 12 000 F, 20 trackers, 365 jours d'historique, push + SMS, rapports.
- Changer de plan : Profil › Abonnement dans l'application.

PAIEMENT
- Mobile Money via CinetPay : Orange Money, MTN MoMo, Moov Money, Wave. Un reçu est envoyé par SMS.

DÉPANNAGE
- Le tracker n'apparaît pas sur la carte : vérifier qu'il est alimenté et à l'extérieur (signal GPS), attendre 1 à 2 minutes, puis « Localiser maintenant » depuis la fiche du tracker.
- Ajouter un deuxième tracker : le plan Free n'en permet qu'un ; passer au plan Pro (3) ou Business (20).
- Le Bluetooth ne détecte rien : redémarrer le tracker (Bluetooth actif 10 minutes), rester à moins de 2 mètres, ou scanner le QR code à la place.
- Code SMS non reçu : vérifier le numéro (+225), attendre 1 minute puis renvoyer le code.
"""


def contact_line(support_email, whatsapp):
    parts = [f"e-mail {support_email}"]
    if whatsapp:
        parts.append(f"WhatsApp {whatsapp}")
    return "Support AirTrack : " + ", ".join(parts) + "."


# Réponses de secours quand l'IA n'est pas configurée ou ne répond pas.
FAQ = [
    {
        "keywords": ["prix", "tarif", "plan", "abonnement", "combien", "coût", "cout", "free", "pro", "business", "cher", "payer par mois"],
        "answer": "Trois plans, par mois : Free à 0 F (1 tracker, 7 jours d'historique), Pro à 2 500 F (3 trackers, 90 jours, alertes SMS, replay, zones) et Business à 12 000 F (20 trackers, 365 jours, rapports). Vous changez de plan dans Profil › Abonnement.",
    },
    {
        "keywords": ["payer", "paiement", "orange money", "mtn", "moov", "wave", "mobile money", "cinetpay", "carte bancaire"],
        "answer": "Le paiement se fait en Mobile Money via CinetPay : Orange Money, MTN MoMo, Moov Money ou Wave. Vous recevez un reçu par SMS dès que le paiement est confirmé.",
    },
    {
        "keywords": ["installer", "ajouter", "qr", "scanner", "appairer", "associer", "bluetooth", "nouveau tracker"],
        "answer": "Dans l'app, touchez « Ajouter un tracker » puis scannez le QR code collé sous le boîtier (ou détectez-le en Bluetooth, actif 10 minutes après le démarrage du tracker). Donnez-lui un nom et une catégorie : il apparaît sur la carte dès son premier signal GPS.",
    },
    {
        "keywords": ["2g", "réseau", "reseau", "4g", "signal", "couverture", "connexion", "sans internet", "hors ligne"],
        "answer": "Le tracker utilise la 4G LTE et bascule seul en 2G si besoin. Quand le réseau est faible, l'application passe en actualisation toutes les 60 secondes, et hors connexion elle affiche les dernières positions connues.",
    },
    {
        "keywords": ["batterie", "autonomie", "charge", "recharger", "économie", "economie"],
        "answer": "Le tracker fonctionne sur une batterie 18650 rechargeable. Vous réglez la fréquence de position (15, 30 ou 60 s) et activez le mode économie pour allonger l'autonomie. Une alerte vous prévient à 20 % puis à 10 %.",
    },
    {
        "keywords": ["alerte", "notification", "zone", "vitesse", "vol", "sms", "coupure", "mouvement"],
        "answer": "AirTrack vous alerte en cas d'entrée ou sortie de zone (plan Pro), d'excès de vitesse, de batterie faible, de mouvement hors horaires, de perte de signal ou de coupure d'alimentation. Vous choisissez push, SMS ou les deux.",
    },
    {
        "keywords": ["apparaît pas", "apparait pas", "pas sur la carte", "position", "localiser", "introuvable", "ne marche pas", "bug"],
        "answer": "Vérifiez que le tracker est alimenté et à l'extérieur pour capter le GPS : le premier fix peut prendre 1 à 2 minutes. Ensuite, utilisez « Localiser maintenant » depuis la fiche du tracker.",
    },
    {
        "keywords": ["télécharger", "telecharger", "apk", "android", "iphone", "ios", "app store", "play store", "google play"],
        "answer": "Sur Android, téléchargez l'APK directement depuis ce site ou passez par Google Play. Sur iPhone, utilisez le bouton App Store de la section Télécharger.",
    },
    {
        "keywords": ["données", "donnees", "data", "mo", "sim", "forfait", "puce"],
        "answer": "Il faut une nano-SIM avec données mobiles et code PIN désactivé (Orange, MTN ou Moov). Un tracker consomme environ 1 Mo par mois avec une position toutes les 30 secondes.",
    },
    {
        "keywords": ["partager", "partage", "famille", "proche"],
        "answer": "Vous pouvez partager un tracker avec vos proches depuis sa fiche : ils le voient sur leur carte avec l'étiquette « Partagé ».",
    },
    {
        "keywords": ["newsletter", "inscrire", "e-mail", "email", "actualités"],
        "answer": "Inscrivez-vous à la newsletter en bas de la page : choisissez vos sujets (nouveautés, conseils sécurité, offres, flottes) et vous recevrez uniquement ceux-là. Un lien de désinscription figure dans chaque e-mail.",
    },
]
