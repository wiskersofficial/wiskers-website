const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const markup = `
  <div class="buyer-bridge" aria-hidden="true">
    <div class="buyer-bridge__rail buyer-bridge__rail--top"></div>
    <div class="buyer-bridge__label buyer-bridge__label--buyer"><span>01 / BUYER</span><strong>Useful<br>answers</strong><i class="buyer-bridge__blocks"><b></b><b></b><b></b><b></b><b></b></i></div>
    <div class="buyer-bridge__path"><span class="buyer-bridge__track"></span><span class="buyer-bridge__signal"></span><span class="buyer-bridge__node buyer-bridge__node--one"></span><span class="buyer-bridge__node buyer-bridge__node--two"></span><span class="buyer-bridge__node buyer-bridge__node--three"></span><span class="buyer-bridge__arrow">→</span></div>
    <div class="buyer-bridge__label buyer-bridge__label--client"><span>02 / CLIENT</span><strong>Clearer<br>insight</strong><i class="buyer-bridge__blocks"><b></b><b></b><b></b><b></b><b></b></i></div>
    <div class="buyer-bridge__rail buyer-bridge__rail--bottom"><span>VALUE IN USE</span><span>LEARNING FROM REAL USE</span></div>
    <span class="buyer-bridge__readout">INPUT&nbsp; / &nbsp;CHOICE&nbsp; / &nbsp;RESULT</span>
  </div>`;

/** Adds an ornamental buyer-to-client bridge. The caller owns scroll scheduling. */
export function initBuyerBridge(root) {
  if (!root) throw new TypeError('initBuyerBridge requires a #v3-value root.');
  const wrapper = document.createElement('div');
  wrapper.innerHTML = markup;
  const art = wrapper.firstElementChild;
  const heading = root.querySelector('.v3-value-heading');
  (heading ?? root).insertAdjacentElement(heading ? 'afterend' : 'afterbegin', art);
  root.classList.add('has-buyer-bridge');

  let paused = false;
  let visible = true;
  let reducedMotion = false;
  let raf = 0;
  let started = 0;
  const signal = art.querySelector('.buyer-bridge__signal');
  const setMotion = () => {
    const stop = paused || !visible || reducedMotion;
    art.classList.toggle('buyer-bridge--paused', stop);
    if (stop) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { started = 0; raf = requestAnimationFrame(tick); }
  };
  const tick = (time) => {
    if (!started) started = time;
    signal.style.setProperty('--signal-drift', `${Math.sin((time - started) / 1050) * 7}px`);
    raf = requestAnimationFrame(tick);
  };
  const update = (progress, environment = {}) => {
    const p = clamp(Number.isFinite(progress) ? progress : 0);
    reducedMotion = Boolean(environment.reducedMotion);
    visible = environment.visible !== false;
    art.style.setProperty('--bridge-progress', p.toFixed(3));
    art.classList.toggle('buyer-bridge--settled', reducedMotion);
    setMotion();
  };
  const setPaused = (value) => { paused = Boolean(value); setMotion(); };
  const destroy = () => {
    cancelAnimationFrame(raf);
    root.classList.remove('has-buyer-bridge');
    art.remove();
  };
  setMotion();
  return { update, setPaused, destroy };
}

export function mountBuyerBridges(scope = document) {
  return [...scope.querySelectorAll('#v3-value')].map(initBuyerBridge);
}
