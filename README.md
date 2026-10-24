# AirTrack : site vitrine

Site de présentation d'AirTrack : carte d'Abidjan animée où les trackers roulent en direct, dashboard de l'app
dans un téléphone, démos vivantes (alerte de zone, replay, bascule 4G → 2G), tarifs, liens **APK / Google Play / App Store**,
**assistant IA** pour les questions d'aide et **newsletter** avec message de bienvenue écrit par l'IA.

| Dossier | Contenu |
|---|---|
| `frontend/` | React 18 + Vite 6, animations `motion`, icônes `lucide-react`, QR code, polices auto-hébergées |
| `backend/` | Django 5.2 + SQLite : API (`/api/…`), admin (`/admin/`), téléchargements (`/download/…`), sert le build React en production |
| `Dockerfile` | build React puis Django + Gunicorn, un seul service |
| `render.yaml` | Blueprint Render |

## Lancer en local

Prérequis : Python 3.12+, Node 22+.

**Terminal 1 : backend**

```bash
cd site-vitrine/backend
python -m venv .venv
source .venv/bin/activate            # Windows Git Bash : source .venv/Scripts/activate  ·  PowerShell : .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env                 # facultatif : clé IA, liens de téléchargement
python manage.py migrate
python manage.py createsuperuser     # pour l'admin
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 : frontend**

```bash
cd site-vitrine/frontend
npm install
npm run dev
```

Ouvrir **http://localhost:5173**. Vite relaie `/api`, `/download` et `/admin` vers Django (port 8000).
Depuis un téléphone sur le même Wi-Fi : `http://<IP du PC>:5173`.
Admin : http://localhost:8000/admin/ (ou http://localhost:5173/admin/).

## Assistant IA

- Mettre `ANTHROPIC_API_KEY` dans `backend/.env` (clé sur https://console.anthropic.com). Modèle : `AI_MODEL` (par défaut `claude-haiku-5-5`, rapide et économique).
- Sans clé, ou si l'API ne répond pas, l'assistant répond depuis la FAQ intégrée : le site ne casse jamais.
- Ce que l'assistant sait : `backend/vitrine/knowledge.py` (plans, boîtier, alertes, paiement, dépannage). **À mettre à jour quand l'offre change.**
- Les questions posées sont visibles dans l'admin (« Questions à l'assistant ») : idéal pour enrichir la FAQ.
- Limite : 30 questions / 10 min par visiteur.

## Newsletter

- Inscription sur le site (e-mail, prénom, sujets). L'IA écrit un mot de bienvenue personnalisé, affiché et envoyé par e-mail.
- Admin › Newsletters : créer un numéro (objet + « sujet pour l'IA »), action **Rédiger avec l'IA**, relire, puis **Envoyer maintenant**.
  Chaque e-mail contient le prénom (`{prénom}` dans le texte) et un lien de désinscription personnel.
- En ligne de commande : `python manage.py send_newsletter --subject "Nouveautés d'octobre" --topic "le replay des trajets" --dry-run`
- Sans `EMAIL_HOST`, les e-mails s'affichent dans la console. En production : un SMTP (Brevo, Mailjet, Gmail…) via `EMAIL_*`.
- Admin › Abonnés : action **Exporter en CSV**.

## Liens de téléchargement

Tout se règle dans les variables d'environnement, sans toucher au code. Un lien vide affiche « Bientôt ».

| Variable | Exemple |
|---|---|
| `APK_URL` | lien direct de l'APK (build EAS, GitHub Release…), **ou** déposer le fichier dans `backend/downloads/airtrack.apk` |
| `PLAY_STORE_URL` | `https://play.google.com/store/apps/details?id=com.airtrack.ci` |
| `APP_STORE_URL` | `https://apps.apple.com/ci/app/airtrack/id…` |

Les clics passent par `/download/apk/`, `/download/android/`, `/download/ios/` et sont comptés dans l'admin (« Téléchargements »).
Le QR code de la section Télécharger pointe vers l'APK (ou le Play Store si pas d'APK).

## Déployer sur Render (Blueprint)

1. Pousser le dépôt sur GitHub (le dossier `site-vitrine/` inclus).
2. Render › **New › Blueprint** › choisir le dépôt › **Blueprint file path** : `site-vitrine/render.yaml`.
   (Le `render.yaml` à la racine du dépôt reste celui du backend de l'application.)
3. Renseigner les variables demandées : `DJANGO_SUPERUSER_EMAIL` et `DJANGO_SUPERUSER_PASSWORD` (compte admin), `ANTHROPIC_API_KEY`,
   les liens de téléchargement. Celles que vous ne connaissez pas encore peuvent rester vides.
4. **Apply**. Le site est en ligne sur `https://airtrack-site.onrender.com` (ou le nom que Render attribue), l'admin sur `/admin/`.

Le site poussé seul dans son propre dépôt : retirer `site-vitrine/` des chemins `rootDir`, `dockerfilePath` et `dockerContext` du `render.yaml`.

**Important : SQLite sur le plan free.** Le disque d'un service free est effacé à chaque redéploiement et redémarrage :
les abonnés et l'historique sont perdus. Pour les garder, passer le service en plan **starter** et décommenter
le bloc `disk` et la variable `SQLITE_PATH=/var/data/db.sqlite3` dans `render.yaml`. Le service free se met aussi en veille
après 15 minutes sans visite (premier chargement plus lent).

Domaine personnalisé : l'ajouter dans Render (Settings › Custom Domains) puis dans `DJANGO_ALLOWED_HOSTS`,
`CSRF_TRUSTED_ORIGINS` et `PUBLIC_SITE_URL` (lignes commentées dans `render.yaml`).

## Personnaliser

| Quoi | Où |
|---|---|
| Couleurs, polices | `frontend/src/styles/base.css` (variables `:root`, mêmes couleurs que l'app) |
| Carte d'Abidjan, trackers simulés, zone surveillée | `frontend/src/lib/cityData.js` |
| Vitesse, arrêts, alertes de la simulation | `frontend/src/lib/fleet.js` |
| Textes des sections | `frontend/src/sections/*.jsx` |
| Tarifs | `backend/vitrine/knowledge.py` (`PLANS`), servis par `/api/config/` |
| Connaissances de l'assistant, FAQ de secours | `backend/vitrine/knowledge.py` |

Les boutons de téléchargement utilisent des icônes génériques. Pour les badges officiels « Disponible sur Google Play »
et « Télécharger dans l'App Store », récupérez-les sur les pages de badges de Google et d'Apple et placez-les dans
`frontend/src/components/StoreButtons.jsx`.

## Tests

```bash
cd backend && python manage.py test vitrine
cd frontend && npm run build
```

## API

| Méthode | URL | Rôle |
|---|---|---|
| GET | `/api/health/` | santé (utilisée par Render) |
| GET | `/api/config/` | liens de téléchargement, plans, sujets newsletter, contact ; pose le cookie CSRF |
| POST | `/api/assistant/` | `{messages: [{role, content}]}` → `{reply, source: "ai" \| "faq"}` |
| POST | `/api/newsletter/subscribe/` | `{email, first_name, interests}` → `{ok, already, welcome}` |
| GET | `/api/newsletter/unsubscribe/<token>/` | désinscription, retour au site |
| GET | `/download/apk/` · `/download/android/` · `/download/ios/` | redirection + comptage |
