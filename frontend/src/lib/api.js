// Appels à l'API Django (même origine : Vite relaie /api en dev, Django sert le site en production).
import { useEffect, useState } from 'react';

const FALLBACK_CONFIG = {
  downloads: { apk: null, android: null, ios: null },
  plans: [
    { code: 'free', name: 'Free', price_xof: 0, max_trackers: 1, history_days: 7, features: ['Alertes push', 'Carte en temps réel', 'Historique 7 jours'] },
    { code: 'pro', name: 'Pro', price_xof: 2500, max_trackers: 3, history_days: 90, features: ['Alertes push + SMS', 'Replay des trajets', 'Zones géographiques', 'Historique 90 jours'] },
    { code: 'business', name: 'Business', price_xof: 12000, max_trackers: 20, history_days: 365, features: ['Alertes push + SMS', "Rapports d'activité", 'Historique 365 jours', "Jusqu'à 20 trackers"] },
  ],
  interests: [
    { code: 'app', label: "Nouveautés de l'application" },
    { code: 'securite', label: 'Conseils sécurité' },
    { code: 'offres', label: 'Offres et promotions' },
    { code: 'flottes', label: 'Flottes et entreprises' },
  ],
  contact: { email: 'support@airtrack.ci', whatsapp: null },
  ai_enabled: false,
};

function csrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export async function postJSON(url, body) {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken() },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Connexion impossible au serveur. Vérifiez votre réseau puis réessayez.');
  }
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* réponse non JSON (ex. 403 CSRF) */
  }
  if (!res.ok) {
    if (res.status === 403) throw new Error('Session expirée : rechargez la page puis réessayez.');
    throw new Error(data.message || `Le serveur a répondu ${res.status}. Réessayez dans un instant.`);
  }
  return data;
}

let configPromise = null;
function loadConfig() {
  if (!configPromise) {
    configPromise = fetch('/api/config/', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : FALLBACK_CONFIG))
      .catch(() => FALLBACK_CONFIG);
  }
  return configPromise;
}

export function useSiteConfig() {
  const [config, setConfig] = useState(FALLBACK_CONFIG);
  useEffect(() => {
    let alive = true;
    loadConfig().then((c) => alive && setConfig({ ...FALLBACK_CONFIG, ...c }));
    return () => {
      alive = false;
    };
  }, []);
  return config;
}

export const formatXof = (n) => (n === 0 ? '0 F' : `${n.toLocaleString('fr-FR').replace(/ | /g, ' ')} F`);
