/**
 * AFHAM AHAMED — SCROLL REVEAL & INTERSECTION OBSERVER
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
});

let scrollObserver;

function initScrollReveal() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-init').forEach(el => el.classList.add('reveal-active'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  scrollObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  observeNewElements();
}

window.observeNewElements = function() {
  if (!scrollObserver) return;
  const elements = document.querySelectorAll('.reveal-init:not(.reveal-active)');
  elements.forEach(el => scrollObserver.observe(el));
};
