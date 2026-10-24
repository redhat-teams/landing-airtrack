// Assistant d'aide (IA Claude côté Django, FAQ de secours) : bulle flottante + panneau de discussion.
// openAssistant("question") l'ouvre depuis n'importe où (FAQ, menu) et pose la question directement.
import { MessageCircle, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import { postJSON } from '../lib/api';

const EVENT = 'airtrack:assistant';
export const openAssistant = (question) => window.dispatchEvent(new CustomEvent(EVENT, { detail: { question } }));

const SUGGESTIONS = ['Quel plan choisir pour 2 motos ?', 'Ça marche en 2G ?', 'Comment payer avec Orange Money ?', 'Comment installer le tracker ?'];
const GREETING = {
  role: 'assistant',
  content: "Bonjour, je suis l'assistant AirTrack. Posez-moi vos questions sur le tracker, l'application, les plans ou le paiement Mobile Money.",
};

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>));
}

function RichText({ text }) {
  const blocks = [];
  let list = null;
  text.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (/^[-•*]\s+/.test(line)) {
      if (!list) {
        list = [];
        blocks.push({ type: 'ul', items: list, key: i });
      }
      list.push(line.replace(/^[-•*]\s+/, ''));
    } else {
      list = null;
      if (line) blocks.push({ type: 'p', text: line, key: i });
    }
  });
  return blocks.map((b) =>
    b.type === 'ul' ? (
      <ul key={b.key}>
        {b.items.map((it, j) => (
          <li key={j}>{renderInline(it)}</li>
        ))}
      </ul>
    ) : (
      <p key={b.key}>{renderInline(b.text)}</p>
    ),
  );
}

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const ask = useCallback(async (question) => {
    const q = question.trim();
    if (!q) return;
    const next = [...messagesRef.current, { role: 'user', content: q }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const data = await postJSON('/api/assistant/', { messages: next.filter((m) => !m.error) });
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: err.message, error: true }]);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      setOpen(true);
      if (e.detail && e.detail.question) ask(e.detail.question);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [ask]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 250);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onlyGreeting = messages.length === 1;

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.section
            className="assistant"
            role="dialog"
            aria-label="Assistant AirTrack"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <header className="assistant__head">
              <span className="assistant__avatar">
                <img src="/logo-icon.png" alt="" width="22" height="22" />
                <span />
              </span>
              <span className="assistant__title">
                <strong>Assistant AirTrack</strong>
                <small>Répond en quelques secondes</small>
              </span>
              <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Fermer l'assistant">
                <X size={18} />
              </button>
            </header>
            <div className="assistant__list" ref={listRef} aria-live="polite">
              {messages.map((m, i) => (
                <motion.div key={i} className={`bubble bubble--${m.role}${m.error ? ' bubble--error' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <RichText text={m.content} />
                </motion.div>
              ))}
              {busy ? (
                <div className="bubble bubble--assistant bubble--typing" aria-label="L'assistant écrit">
                  <i />
                  <i />
                  <i />
                </div>
              ) : null}
              {onlyGreeting ? (
                <div className="assistant__suggest">
                  {SUGGESTIONS.map((s) => (
                    <button type="button" key={s} onClick={() => ask(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <form
              className="assistant__form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!busy) ask(input);
              }}
            >
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Écrivez votre question…" maxLength={1000} aria-label="Votre question" />
              <button type="submit" className="assistant__send" disabled={busy || !input.trim()} aria-label="Envoyer">
                <Send size={17} />
              </button>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>
      <button type="button" className={`assistant-fab${open ? ' assistant-fab--open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label={open ? "Fermer l'assistant" : "Poser une question à l'assistant"} aria-expanded={open}>
        <span className="assistant-fab__ring" />
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open ? <span className="assistant-fab__label">Une question ?</span> : null}
      </button>
    </>
  );
}
