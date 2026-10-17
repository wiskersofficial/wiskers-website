/** Mounts the homepage's site-level motion control into the existing header. */
export function initHomeV4Controls(root = document) {
  const headerTools = root.querySelector('.site-header .header-tools');
  if (!headerTools || headerTools.querySelector('[data-home-v4-motion-control]')) return () => {};

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'home-v4-motion-control';
  button.dataset.homeV4MotionControl = '';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', 'Pause decorative motion');

  const text = document.createElement('span');
  text.className = 'home-v4-motion-control__text';
  const preference = document.createElement('span');
  preference.className = 'home-v4-motion-control__preference';
  preference.setAttribute('aria-live', 'polite');
  preference.setAttribute('aria-atomic', 'true');
  button.append(text, preference);

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let paused = false;
  const render = () => {
    const reducedMotion = Boolean(reduced?.matches);
    text.textContent = paused ? 'Resume motion' : 'Pause motion';
    preference.textContent = reducedMotion ? ' · reduced motion on' : '';
    button.dataset.paused = String(paused);
    button.dataset.reducedMotion = String(reducedMotion);
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', `${paused ? 'Resume' : 'Pause'} decorative motion${reducedMotion ? '; reduced motion preference is on' : ''}`);
  };
  const onClick = () => {
    paused = !paused;
    render();
    window.dispatchEvent(new CustomEvent('home-v4-motion-toggle', { detail: { paused } }));
  };
  const onPreferenceChange = () => render();

  button.addEventListener('click', onClick);
  reduced?.addEventListener?.('change', onPreferenceChange);
  headerTools.append(button);
  render();

  return () => {
    button.removeEventListener('click', onClick);
    reduced?.removeEventListener?.('change', onPreferenceChange);
    button.remove();
  };
}
