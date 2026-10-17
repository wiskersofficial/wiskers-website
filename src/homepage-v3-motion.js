// Scroll-linked motion for the home page. Native scrolling remains in control.
(() => {
  const root = document.documentElement;
  const scene = document.querySelector('[data-process-scene]');
  const art = document.querySelector('[data-process-art]');
  const progress = document.querySelector('[data-process-progress]');
  const hero = document.querySelector('[data-hero-art]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!scene && !hero) return;
  const syncMotionReadiness = () => {
    root.classList.toggle('process-motion-ready', !reduceMotion.matches && Boolean(scene));
  };
  syncMotionReadiness();

  const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
  let frame = 0;
  let metrics = null;
  let rawProgress = 0;
  let visualProgress = 0;
  let active = false;
  let heroActive = false;
  let lastProgress = -1;
  let lastStage = 0;
  let lastHero = -1;
  let resizeObserver;

  const setPlaneOffsets = (value) => {
    if (!art) return;
    const bounds = art.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    const open = reduceMotion.matches ? 0 : clamp(value / 0.31);
    const assembly = reduceMotion.matches ? 0 : clamp((value - 0.22) / 0.44);
    const delta = assembly - open;
    art.style.setProperty('--plane-one-x', `${(-delta * 0.10 * width).toFixed(2)}px`);
    art.style.setProperty('--plane-one-y', `${(delta * 0.12 * height).toFixed(2)}px`);
    art.style.setProperty('--plane-two-x', `${(delta * 0.10 * width).toFixed(2)}px`);
    art.style.setProperty('--plane-two-y', '0px');
    art.style.setProperty('--plane-three-x', `${(-delta * 0.10 * width).toFixed(2)}px`);
    art.style.setProperty('--plane-three-y', `${(-delta * 0.12 * height).toFixed(2)}px`);
  };

  const measure = () => {
    if (scene) {
      const rect = scene.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      // A viewport-height inset gives a long, steady passage through the sticky scene.
      metrics = { start: top, end: top + Math.max(1, scene.offsetHeight - window.innerHeight) };
      const target = clamp((window.scrollY - metrics.start) / (metrics.end - metrics.start || 1));
      setPlaneOffsets(reduceMotion.matches ? 0 : visualProgress || target);
    }
  };

  const setProgress = (value) => {
    // Reduced motion keeps the artwork in its initial static composition;
    // rawProgress below still drives stage and progress semantics.
    const motionValue = reduceMotion.matches ? 0 : value;
    if (Math.abs(value - lastProgress) >= 0.0005) {
      lastProgress = value;
      root.style.setProperty('--scene-progress', motionValue.toFixed(4));
      // Keep independently mounted artwork in sync with the easing pass, even
      // when scrolling pauses before the visual progress reaches its target.
      window.dispatchEvent(new CustomEvent('wiskers:process-progress'));
      root.style.setProperty('--document-open', clamp(motionValue / 0.31).toFixed(4));
      root.style.setProperty('--tool-assembly', clamp((motionValue - 0.22) / 0.44).toFixed(4));
      root.style.setProperty('--answer-progress', clamp((motionValue - 0.55) / 0.45).toFixed(4));
      root.style.setProperty('--scene-release', clamp((motionValue - 0.84) / 0.16).toFixed(4));
    }
    if (progress) {
      const stage = rawProgress < 0.31 ? 1 : rawProgress < 0.66 ? 2 : 3;
      progress.setAttribute('aria-valuenow', String(stage));
      progress.setAttribute('aria-valuetext', `${['Idea', 'Conception', 'Launch'][stage - 1]} stage`);
      progress.style.setProperty('--process-progress', `${rawProgress * 100}%`);
    }
    root.style.setProperty('--process-progress', `${rawProgress * 100}%`);
    if (scene) scene.style.setProperty('--process-progress', `${rawProgress * 100}%`);
    setPlaneOffsets(value);
    if (scene) {
      const stage = rawProgress < 0.31 ? 1 : rawProgress < 0.66 ? 2 : 3;
      if (stage !== lastStage) {
        lastStage = stage;
        // CSS can target [data-process-scene][data-active-stage="2"], etc.
        scene.dataset.activeStage = String(stage);
        scene.querySelectorAll('[data-process-stage]').forEach((node, index) => {
          if (index === stage - 1) node.setAttribute('aria-current', 'step');
          else node.removeAttribute('aria-current');
        });
      }
    }
  };

  const setHero = (p) => {
    if (!hero || Math.abs(p - lastHero) < 0.001) return;
    lastHero = p;
    // Move decorative layers at different rates; the hero copy never moves.
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    const reduced = reduceMotion.matches;
    const scale = reduced ? 0 : mobile ? 0.24 : 1;
    const layers = [
      ['.v3-art-stamp', -245], ['.v3-art-line', 180], ['.v3-art-word', -110], ['.v3-art-grid', 90]
    ];
    for (const [selector, amplitude] of layers) {
      const node = hero.querySelector(selector);
      if (node) node.style.translate = `0 ${((p - 0.5) * amplitude * scale).toFixed(2)}px`;
    }
  };

  const tick = () => {
    frame = 0;
    if (document.visibilityState !== 'visible') return;
    let needsAnother = false;
    if (scene && active && metrics) {
      const target = clamp((window.scrollY - metrics.start) / (metrics.end - metrics.start || 1));
      rawProgress = target; // Semantic stage choice always follows the real scroll position.
      const stage = target < 0.31 ? 1 : target < 0.66 ? 2 : 3;
      if (stage !== lastStage) {
        // Update stage semantics immediately, without waiting for visual easing.
        if (scene) {
          scene.dataset.activeStage = String(stage);
          scene.querySelectorAll('[data-process-stage]').forEach((node, index) => {
            if (index === stage - 1) node.setAttribute('aria-current', 'step');
            else node.removeAttribute('aria-current');
          });
        }
        lastStage = stage;
      }
      if (reduceMotion.matches) visualProgress = target;
      else visualProgress += (target - visualProgress) * 0.16;
      if (Math.abs(target - visualProgress) < 0.001) visualProgress = target;
      setProgress(visualProgress);
      if (visualProgress !== target) needsAnother = true;
    }
    if (hero && heroActive) {
      const rect = hero.getBoundingClientRect();
      const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
      setHero(reduceMotion.matches ? 0.5 : p);
    }
    if (needsAnother) frame = requestAnimationFrame(tick);
  };

  const updateRelevance = () => {
    if (scene) {
      const r = scene.getBoundingClientRect();
      active = r.bottom >= -window.innerHeight && r.top <= window.innerHeight;
      if (active) {
        // Recompute progress from current scroll for direct anchors and reversals.
        const target = metrics ? clamp((window.scrollY - metrics.start) / (metrics.end - metrics.start || 1)) : 0;
        if (reduceMotion.matches) visualProgress = target;
      }
    }
    if (hero) {
      const r = hero.getBoundingClientRect();
      heroActive = r.bottom >= -window.innerHeight && r.top <= window.innerHeight;
    }
    if ((active || heroActive) && !frame) frame = requestAnimationFrame(tick);
  };

  const onScroll = () => updateRelevance();
  const onResize = () => { measure(); updateRelevance(); };
  measure();
  updateRelevance();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', onResize, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateRelevance(); });
  reduceMotion.addEventListener?.('change', () => {
    syncMotionReadiness();
    if (reduceMotion.matches) visualProgress = rawProgress;
    lastProgress = -1;
    onResize();
  });
  if ('ResizeObserver' in window && scene) {
    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(scene);
  }
  if (document.fonts?.ready) document.fonts.ready.then(onResize);
})();
