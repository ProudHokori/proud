/* Keep a point on the room's floor directly beneath the character's feet. */
(() => {
  window.mountPortfolioScene = function(hero, config = {}) {
    const image = hero?.querySelector('.hero-room img');
    const character = hero?.querySelector('.character-interaction');
    const stage = hero?.querySelector('.hero-visual');
    if (!image || !character || !stage) return;
    let frame = 0;
    const align = () => {
      frame = 0;
      if (!image.naturalWidth) return;
      const bounds = hero.getBoundingClientRect();
      const body = character.getBoundingClientRect();
      const floor = config.floorAnchor || [.7, .91];
      // These match the contact shadow and planted pivot in character-layers.js.
      const footX = body.left - bounds.left + body.width * 460 / 1024;
      const footY = body.top - bounds.top + body.height * 1424 / 1536;
      // Cover BOTH edges while retaining the floor anchor. A centered character
      // needs more image on its right than the desktop composition does.
      const width = Math.max(
        bounds.width * 1.2,
        stage.clientHeight * 2.15,
        (footX + 2) / floor[0],
        (bounds.width - footX + 2) / (1 - floor[0])
      );
      const height = width * image.naturalHeight / image.naturalWidth;
      image.style.width = `${width}px`;
      image.style.height = `${height}px`;
      image.style.left = `${footX - width * floor[0]}px`;
      image.style.top = `${footY - height * floor[1]}px`;
      hero.classList.add('scene-aligned');
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(align); };
    const observer = new ResizeObserver(schedule);
    [hero, character, stage].forEach(element => observer.observe(element));
    image.addEventListener('load', schedule);
    document.fonts?.ready.then(schedule);
    schedule();
  };
})();
