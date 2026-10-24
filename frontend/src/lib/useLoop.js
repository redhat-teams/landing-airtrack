import { useEffect, useRef, useState } from 'react';

// Progression 0 → 1 qui boucle (durée en ms), mise à jour ~30 fois par seconde. `paused` fige la valeur.
export function useLoop(duration, { paused = false } = {}) {
  const [t, setT] = useState(0);
  const base = useRef(null);
  const last = useRef(0);
  const value = useRef(0);
  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduce) {
      base.current = null;
      return undefined;
    }
    let raf;
    const tick = (now) => {
      if (base.current == null) base.current = now - value.current * duration;
      const v = ((now - base.current) % duration) / duration;
      value.current = v;
      if (now - last.current > 33) {
        last.current = now;
        setT(v);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, paused]);
  return t;
}

// true quand l'élément est visible à l'écran (pour ne pas animer ce qu'on ne voit pas).
export function useInView(ref, margin = '120px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}
