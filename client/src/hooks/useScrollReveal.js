import { useEffect } from 'react';

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function clampVal(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

// Applies the scroll-linked reveal to every [data-reveal-text] / [data-reveal-img]
// element currently in the DOM. Call once per page after content renders;
// re-runs automatically on scroll/resize.
export function useScrollReveal(deps = []) {
  useEffect(() => {
    const textEls = document.querySelectorAll('[data-reveal-text]');
    const imgEls = document.querySelectorAll('[data-reveal-img]');
    if (!textEls.length && !imgEls.length) return;

    function updateReveal() {
      const vh = window.innerHeight;
      textEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const progress = clampVal((vh - rect.top) / (vh * 0.65), 0, 1);
        el.style.opacity = progress;
        el.style.transform = `scale(${0.94 + progress * 0.06}) translateY(${(1 - progress) * 16}px)`;
      });
      imgEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const progress = clampVal((vh - rect.top) / (vh * 0.75), 0, 1);
        el.style.transform = `scale(${1.16 - progress * 0.16}) translateY(${(1 - progress) * -12}px)`;
      });
    }

    if (prefersReduced) {
      textEls.forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      imgEls.forEach((el) => {
        el.style.transform = 'none';
      });
      return;
    }

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateReveal();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateReveal();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
