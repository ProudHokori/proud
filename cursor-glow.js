/* A soft decorative light; the native cursor and all hit targets stay intact. */
(() => {
  'use strict';
  const finePointer = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.append(glow);
  let frame = 0, x = 0, y = 0;
  const hide = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    glow.classList.remove('is-visible');
  };
  window.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch' || document.hidden) {
      hide();
      return;
    }
    x = event.clientX;
    y = event.clientY;
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      glow.classList.add('is-visible');
    });
  }, { passive: true });
  window.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') hide(); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', hide);
  finePointer.addEventListener('change', hide);
  reducedMotion.addEventListener('change', hide);
})();
