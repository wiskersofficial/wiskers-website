/**
 * Mounts three quiet geometric transition marks at the v3 homepage boundaries.
 * Include home-v4-transitions.css once, then call mountHomeV4Transitions(main).
 * No scroll listeners are installed: update() is driven by the page runtime.
 */
export function mountHomeV4Transitions(root = document.querySelector('#main-content')) {
  if (!root?.querySelector) throw new TypeError('mountHomeV4Transitions requires the homepage main element.');
  const boundaries = [
    ['#v3-process', 'thesis-process'],
    ['#v3-example', 'process-example'],
    ['#contact', 'value-contact'],
  ];
  const entries = boundaries.map(([selector, name]) => {
    const section = root.querySelector(selector);
    if (!section) return null;
    const layer = document.createElement('div');
    layer.className = 'home-v4-transition';
    layer.dataset.transition = name;
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '<span class="home-v4-transition__plane"></span><span class="home-v4-transition__cut"></span><span class="home-v4-transition__step"></span><span class="home-v4-transition__step"></span><span class="home-v4-transition__step"></span><span class="home-v4-transition__spark"></span>';
    section.prepend(layer);
    const previousPosition = section.style.position;
    if (getComputedStyle(section).position === 'static') section.style.position = 'relative';
    return { section, layer, previousPosition };
  }).filter(Boolean);

  let paused = false;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const update = (progress = 0, environment = {}) => {
    const viewportHeight = environment.viewportHeight || window.innerHeight || 1;
    const scrollY = Number.isFinite(environment.scrollY) ? environment.scrollY : window.scrollY;
    const staticMode = Boolean(environment.reducedMotion ?? reduced?.matches);
    for (const { section, layer } of entries) {
      const rect = section.getBoundingClientRect();
      const top = rect.top + scrollY;
      const local = Math.min(1, Math.max(0, (scrollY + viewportHeight - top) / (viewportHeight + rect.height)));
      const depth = staticMode ? 0 : Math.sin(local * Math.PI);
      layer.style.setProperty('--transition-progress', String(Math.min(1, Math.max(0, Number(progress) || 0))));
      layer.style.setProperty('--transition-depth', depth.toFixed(3));
      layer.classList.toggle('is-static', staticMode);
      layer.classList.toggle('is-paused', paused || staticMode);
    }
  };
  const setPaused = (value) => {
    paused = Boolean(value);
    for (const { layer } of entries) layer.classList.toggle('is-paused', paused || Boolean(reduced?.matches));
  };
  const onMotionChange = () => update(0, { reducedMotion: reduced.matches });
  reduced?.addEventListener?.('change', onMotionChange);

  return {
    update,
    setPaused,
    destroy() {
      reduced?.removeEventListener?.('change', onMotionChange);
      for (const { section, layer, previousPosition } of entries) {
        layer.remove();
        if (previousPosition) section.style.position = previousPosition;
        else section.style.removeProperty('position');
      }
    },
  };
}
