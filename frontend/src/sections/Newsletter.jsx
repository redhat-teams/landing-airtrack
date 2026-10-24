// Newsletter : e-mail, prénom, sujets choisis. À l'inscription, l'IA écrit un mot de bienvenue personnalisé.
import { Check, Loader2, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { postJSON } from '../lib/api';

function Typewriter({ text }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setN(text.length);
      return undefined;
    }
    const id = setInterval(() => setN((v) => (v >= text.length ? v : v + 2)), 18);
    return () => clearInterval(id);
  }, [text]);
  return (
    <p className="typewriter">
      {text.slice(0, n)}
      {n < text.length ? <span className="typewriter__caret" /> : null}
    </p>
  );
}

export function Newsletter({ interests }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [chosen, setChosen] = useState(['app', 'securite']);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [unsubscribed] = useState(() => new URLSearchParams(window.location.search).get('desinscription') === 'ok');

  const toggle = (code) => setChosen((list) => (list.includes(code) ? list.filter((c) => c !== code) : [...list, code]));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const data = await postJSON('/api/newsletter/subscribe/', { email, first_name: firstName, interests: chosen, website });
      setResult(data);
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <section className="section newsletter" id="newsletter">
      <div className="container newsletter__grid">
        <div>
          <h2 className="h2">Les nouveautés AirTrack, une fois par mois</h2>
          <p className="section__lead">Nouvelles fonctions, conseils pour protéger vos biens, offres réservées aux abonnés. Vous choisissez les sujets, vous vous désinscrivez en un clic.</p>
          {unsubscribed ? <p className="newsletter__info">Votre désinscription est confirmée. Vous ne recevrez plus nos e-mails.</p> : null}
        </div>
        <div className="newsletter__card">
          <AnimatePresence mode="wait">
            {status === 'done' && result ? (
              <motion.div key="done" className="newsletter__done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }}>
                <span className="newsletter__check">
                  <Check size={26} />
                </span>
                <h3>{result.already ? 'Vous êtes déjà inscrit' : 'Inscription confirmée'}</h3>
                {result.welcome ? (
                  <div className="newsletter__welcome">
                    <span className="newsletter__ai">
                      <Sparkles size={14} /> Message de bienvenue écrit pour vous
                    </span>
                    <Typewriter text={result.welcome} />
                  </div>
                ) : null}
                <button type="button" className="btn btn--ghost" onClick={() => setStatus('idle')}>
                  Inscrire une autre adresse
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} noValidate={false}>
                <div className="field-row">
                  <label className="field">
                    <span>Prénom (facultatif)</span>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={60} autoComplete="given-name" placeholder="Awa" />
                  </label>
                  <label className="field">
                    <span>E-mail</span>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="awa@exemple.ci" />
                  </label>
                </div>
                <fieldset className="interests">
                  <legend>Vos sujets</legend>
                  {interests.map((it) => (
                    <button type="button" key={it.code} className={`interest${chosen.includes(it.code) ? ' is-on' : ''}`} aria-pressed={chosen.includes(it.code)} onClick={() => toggle(it.code)}>
                      {chosen.includes(it.code) ? <Check size={14} /> : null}
                      {it.label}
                    </button>
                  ))}
                </fieldset>
                <input className="hp" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} aria-hidden="true" name="website" />
                {error ? (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <button type="submit" className="btn btn--orange btn--block" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={18} className="spin" /> Inscription en cours
                    </>
                  ) : (
                    'M’inscrire à la newsletter'
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
