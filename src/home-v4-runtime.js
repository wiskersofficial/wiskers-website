// One scroll/visibility coordinator for the homepage's decorative modules.
export function createHomeV4Runtime() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const registrations = new Set();
  let frame = 0;
  let manuallyPaused = false;
  let destroyed = false;

  const clamp = (value) => Math.min(1, Math.max(0, value));
  const getProgress = (root, range) => {
    const scene = root.closest('[data-process-scene]');
    if (scene) {
      const shared = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scene-progress'));
      return Number.isFinite(shared) ? clamp(shared) : 0;
    }
    if (range === document.querySelector('#main-content')) {
      return clamp(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    }
    const rect = range.getBoundingClientRect();
    // Progress begins when the section first reaches the top of the page and
    // completes as its lower edge leaves the viewport.
    return clamp((window.innerHeight - rect.bottom) / Math.max(1, window.innerHeight));
  };

  const sync = () => {
    frame = 0;
    if (destroyed) return;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    for (const item of registrations) {
      if (!item.root.isConnected) continue;
      const range = item.range;
      const rect = range.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < viewport.height;
      const environment = {
        reducedMotion: reducedMotion.matches,
        visible,
        paused: manuallyPaused || document.hidden || !visible || reducedMotion.matches,
        viewport,
        viewportHeight: viewport.height,
        scrollY: window.scrollY,
        stage: item.root.closest('[data-process-scene]')?.dataset.activeStage ?? null,
      };
      item.controller.update(reducedMotion.matches ? 0 : getProgress(item.root, range), environment);
      if (item.paused !== environment.paused) {
        item.paused = environment.paused;
        item.controller.setPaused(environment.paused);
      }
    }
  };

  const requestSync = () => {
    if (!frame && !destroyed) frame = requestAnimationFrame(sync);
  };

  const onPreferenceChange = () => requestSync();
  window.addEventListener('scroll', requestSync, { passive: true });
  window.addEventListener('wiskers:process-progress', requestSync);
  window.addEventListener('resize', requestSync, { passive: true });
  window.addEventListener('orientationchange', requestSync, { passive: true });
  document.addEventListener('visibilitychange', requestSync);
  reducedMotion.addEventListener?.('change', onPreferenceChange);

  return {
    register(root, controller, { range = root.closest('section') || root } = {}) {
      if (!root || !controller || typeof controller.update !== 'function') return () => {};
      const item = { root, range, controller, paused: null };
      registrations.add(item);
      requestSync();
      return () => {
        registrations.delete(item);
        controller.setPaused?.(true);
        controller.destroy?.();
      };
    },
    setPaused(paused) {
      manuallyPaused = Boolean(paused);
      requestSync();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestSync);
      window.removeEventListener('wiskers:process-progress', requestSync);
      window.removeEventListener('resize', requestSync);
      window.removeEventListener('orientationchange', requestSync);
      document.removeEventListener('visibilitychange', requestSync);
      reducedMotion.removeEventListener?.('change', onPreferenceChange);
      for (const { controller } of registrations) {
        controller.setPaused?.(true);
        controller.destroy?.();
      }
      registrations.clear();
    },
  };
}
