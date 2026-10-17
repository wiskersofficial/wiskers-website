const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const markup = `
  <div class="process-art__frame">
    <div class="process-art__frame-top"><span>WISKERS / FIELD NOTE</span><span>01 — 03</span></div>
    <div class="process-art__registration" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <section class="process-art__state process-art__idea" data-state="idea" aria-hidden="true">
      <div class="process-art__idea-back"></div>
      <div class="process-art__idea-sheet">
        <p class="process-art__eyebrow"><span>01</span> / THE QUESTION</p>
        <h2>What are they<br><em>trying to decide?</em></h2>
        <div class="process-art__question-list">
          <div><b>A</b><span>What changes if they wait?</span><i>↗</i></div>
          <div><b>B</b><span>Which choice feels unclear?</span><i>↗</i></div>
          <div><b>C</b><span>What would help them act?</span><i>↗</i></div>
        </div>
        <div class="process-art__idea-foot"><span>START WITH THEIR WORDS</span><span class="process-art__asterisk">✳</span></div>
        <span class="process-art__margin-note">the useful bit<br>starts here</span>
      </div>
    </section>
    <section class="process-art__state process-art__instrument" data-state="instrument" aria-hidden="true">
      <div class="process-art__instrument-head"><span class="process-art__eyebrow"><span>02</span> / THE INSTRUMENT</span><span class="process-art__live"><i></i> YOUR CONTEXT</span></div>
      <h2>Make the choice<br><em>specific to you.</em></h2>
      <div class="process-art__instrument-body">
        <div class="process-art__inputs">
          <div class="process-art__input-row"><span>01</span><div><small>WHAT MATTERS MOST?</small><b>Confidence before speed</b></div><i>↗</i></div>
          <div class="process-art__input-row"><span>02</span><div><small>HOW SOON?</small><b>This quarter</b></div><i>↗</i></div>
          <div class="process-art__input-row"><span>03</span><div><small>WHAT'S THE LIMIT?</small><b>Keep the team focused</b></div><i>↗</i></div>
        </div>
        <div class="process-art__result"><div><span>YOUR READOUT</span><span class="process-art__result-mark">↘</span></div><strong>Start with the smallest useful test.</strong><p>Keep the decision reversible. Learn what changes the answer before you scale it.</p><span class="process-art__result-rule"></span></div>
      </div>
      <div class="process-art__instrument-foot"><span>INPUT → A BETTER NEXT STEP</span><span>W / 01</span></div>
    </section>
    <section class="process-art__state process-art__launch" data-state="launch" aria-hidden="true">
      <div class="process-art__launch-head"><span class="process-art__eyebrow"><span>03</span> / THE ANSWER</span><span>MADE TO MOVE</span></div>
      <div class="process-art__answer-origin"><span>YOUR QUESTION</span><strong>What should I do next?</strong><i>↓</i></div>
      <div class="process-art__network" aria-hidden="true"><span class="process-art__network-line process-art__line-a"></span><span class="process-art__network-line process-art__line-b"></span><span class="process-art__network-line process-art__line-c"></span><span class="process-art__network-dot"></span></div>
      <div class="process-art__paths">
        <article><span>01 / CLARIFY</span><h3>Name the decision.</h3><p>Write down what has to be true for each option to work.</p><i>↗</i></article>
        <article><span>02 / COMPARE</span><h3>Test the trade-off.</h3><p>Use your real constraints to see what changes the answer.</p><i>↗</i></article>
        <article><span>03 / ACT</span><h3>Choose a first move.</h3><p>Take one useful step, then learn from what happens.</p><i>↗</i></article>
      </div>
      <div class="process-art__launch-foot"><span>AN ANSWER WITH ROOM TO GO</span><span class="process-art__launch-spark">✳</span></div>
    </section>
    <div class="process-art__frame-bottom"><span>IDEA&nbsp; · &nbsp;CONCEPTION&nbsp; · &nbsp;LAUNCH</span><span class="process-art__frame-index">01</span></div>
  </div>`;

/**
 * Mounts the decorative process artwork into an existing aria-hidden root.
 * The caller owns scroll, observers, and frame scheduling.
 */
export function initProcessArt(root) {
  if (!root) throw new TypeError('initProcessArt requires a [data-process-art] root.');
  root.replaceChildren();
  root.insertAdjacentHTML('beforeend', markup);
  root.classList.add('process-art');

  const frame = root.querySelector('.process-art__frame');
  const states = Object.fromEntries([...root.querySelectorAll('[data-state]')].map((node) => [node.dataset.state, node]));
  let manuallyPaused = false;
  let inView = true;
  let reducedMotion = false;

  const setVisibility = () => {
    root.classList.toggle('process-art--paused', manuallyPaused || !inView || reducedMotion);
    frame.dataset.reducedMotion = String(reducedMotion);
  };

  const update = (progress, environment = {}) => {
    const p = clamp(Number.isFinite(progress) ? progress : 0);
    reducedMotion = Boolean(environment.reducedMotion);
    inView = environment.visible !== false;
    const idea = reducedMotion ? 0 : 1 - smooth((p - 0.16) / 0.22);
    const instrument = reducedMotion ? 1 : smooth((p - 0.23) / 0.2) * (1 - smooth((p - 0.59) / 0.2));
    const launch = reducedMotion ? 0 : smooth((p - 0.61) / 0.2);
    const values = { idea, instrument, launch };
    for (const [name, node] of Object.entries(states)) {
      const opacity = values[name];
      node.style.opacity = opacity.toFixed(3);
      node.style.visibility = opacity > 0.004 ? 'visible' : 'hidden';
      node.style.transform = `translateY(${((1 - opacity) * 10).toFixed(2)}px) scale(${(0.985 + opacity * 0.015).toFixed(3)})`;
      node.style.pointerEvents = 'none';
    }
    frame.style.setProperty('--process-progress', p.toFixed(3));
    setVisibility();
  };

  const setPaused = (paused) => {
    manuallyPaused = Boolean(paused);
    setVisibility();
  };

  const destroy = () => {
    root.classList.remove('process-art', 'process-art--paused');
    root.replaceChildren();
  };

  update(0, {});
  return { update, setPaused, destroy };
}

export default initProcessArt;
