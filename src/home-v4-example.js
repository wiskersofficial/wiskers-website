const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const decoration = `
  <div class="example-instrument__stage" aria-hidden="true">
    <div class="example-instrument__halo"><span></span><i></i><b></b></div>
    <div class="example-instrument__seal"><span>W / 001</span><strong>✳</strong><small>QUESTION<br>IN MOTION</small></div>
    <div class="example-instrument__orbit example-instrument__orbit--one"></div>
    <div class="example-instrument__orbit example-instrument__orbit--two"></div>
    <div class="example-instrument__ticks"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <span class="example-instrument__annotation example-instrument__annotation--top">A SMALL CHANGE<br>MAKES A BETTER QUESTION</span>
    <span class="example-instrument__annotation example-instrument__annotation--bottom">INPUT&nbsp; → &nbsp;CONTEXT&nbsp; → &nbsp;CLARITY</span>
    <span class="example-instrument__reading">01 / FIELD NOTE</span>
  </div>`;

/** Adds an ornamental, non-interactive instrument layer to the existing example. */
export function initExampleInstrument(root) {
  if (!root) throw new TypeError('initExampleInstrument requires a [data-example-shell] root.');
  const stage = document.createElement('div');
  stage.innerHTML = decoration;
  const layer = stage.firstElementChild;
  root.prepend(layer);
  root.classList.add('example-instrument');

  const range = root.querySelector('input[type="range"]');
  const select = root.querySelector('select');
  let paused = false;
  let visible = true;
  let reducedMotion = false;
  let interaction = 0;

  root.dataset.examplePriority = select?.selectedIndex ?? 0;
  root.dataset.exampleValue = range?.value ?? '';
  root.style.setProperty('--example-readout', `"${range?.value ?? ''}"`);

  const react = () => {
    interaction += 1;
    root.style.setProperty('--example-interaction', String(interaction % 7));
    root.dataset.examplePriority = select?.selectedIndex ?? 0;
    root.dataset.exampleValue = range?.value ?? '';
    root.style.setProperty('--example-readout', `"${range?.value ?? ''}"`);
    root.classList.add('example-instrument--touched');
  };
  range?.addEventListener('input', react);
  select?.addEventListener('change', react);

  const update = (progress, environment = {}) => {
    const p = clamp(Number.isFinite(progress) ? progress : 0);
    reducedMotion = Boolean(environment.reducedMotion);
    visible = environment.visible !== false;
    root.style.setProperty('--example-progress', p.toFixed(3));
    root.classList.toggle('example-instrument--paused', paused || !visible || reducedMotion);
    root.dataset.exampleActive = String(!reducedMotion && p > 0.08 && p < 0.94);
  };
  const setPaused = (value) => {
    paused = Boolean(value);
    root.classList.toggle('example-instrument--paused', paused || !visible || reducedMotion);
  };
  const destroy = () => {
    range?.removeEventListener('input', react);
    select?.removeEventListener('change', react);
    root.classList.remove('example-instrument', 'example-instrument--paused', 'example-instrument--touched');
    delete root.dataset.examplePriority;
    delete root.dataset.exampleValue;
    delete root.dataset.exampleActive;
    root.style.removeProperty('--example-progress');
    root.style.removeProperty('--example-interaction');
    root.style.removeProperty('--example-readout');
    layer.remove();
  };
  return { update, setPaused, destroy };
}

export function mountExampleInstruments(scope = document) {
  return [...scope.querySelectorAll('[data-example-shell]')].map(initExampleInstrument);
}
