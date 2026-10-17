/** Mount the full-width thesis scene into a supplied element.
 * Include home-v4-thesis.css once before calling. Returns the scene controller.
 */
export function mountThesisScene(root, options = {}) {
  if (!(root instanceof Element)) throw new TypeError("mountThesisScene requires a root Element");
  root.setAttribute("data-thesis-scene", "");
  root.setAttribute("aria-label", options.label || "From one-size content to useful tools");
  const previous = root.innerHTML;
  const template = `<div class="thesis-scene-inner">
    <div class="thesis-topline"><span>01 / The shift</span><span>Broadcast → participation</span></div>
    <div class="thesis-stage">
      <div class="thesis-copy"><p class="thesis-kicker">A better kind of answer</p>
        <h2 class="thesis-title" id="v3-thesis-title">Insight takes<br><em>input.</em></h2>
        <p class="thesis-deck">A PDF can tell you. A tool can show you. Let people bring their own context to the question.</p>
      </div>
      <div class="thesis-art" aria-hidden="true"><div class="thesis-orbit"></div>
        <div class="thesis-slab thesis-slab--broadcast"><small>ONE-SIZE CONTENT</small><strong>Everyone gets the same answer.</strong><span>PDF / 01</span></div>
        <div class="thesis-slab thesis-slab--input"><small>YOUR QUESTION</small><strong>What should I do next?</strong><span>INPUT / CONTEXT / INSIGHT</span></div>
        <i class="thesis-spark"></i>
      </div>
    </div>
    <div class="thesis-bottom"><p>Useful content gives each person a way to explore their constraints, their options and their next move.</p><span class="thesis-index">WISKERS&nbsp; / &nbsp;MAKE IT USEFUL</span></div>
  </div>`;
  root.innerHTML = template;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const broadcast = root.querySelector(".thesis-slab--broadcast");
  const input = root.querySelector(".thesis-slab--input");
  const spark = root.querySelector(".thesis-spark");
  let progress = 0, paused = Boolean(options.paused), visible = true, frame = 0, startedAt = 0, destroyed = false;
  const clamp = (n) => Math.max(0, Math.min(1, Number(n) || 0));
  function paint(now) {
    frame = 0;
    if (destroyed || paused || !visible || reduce?.matches) return;
    if (!startedAt) startedAt = now;
    const t = (now - startedAt) / 1000;
    const p = progress;
    const mode = p > .52 ? "interactive" : "broadcast";
    root.dataset.thesisMode = mode;
    const drift = Math.sin(t * .65) * 2.2;
    const settle = p * 5;
    broadcast.style.transform = `translate3d(${drift - settle}px,${Math.cos(t * .45) * 3}px,0) rotate(${-8 + p * 3}deg)`;
    input.style.transform = `translate3d(${-drift + settle}px,${Math.sin(t * .52) * 4}px,0) rotate(${7 - p * 3}deg)`;
    spark.style.transform = `rotate(${t * 10}deg) scale(${1 + Math.sin(t * .8) * .045})`;
    root.style.setProperty("--thesis-progress", p.toFixed(3));
    frame = requestAnimationFrame(paint);
  }
  const start = () => {
    if (!frame && !destroyed && !paused && visible && !reduce?.matches) frame = requestAnimationFrame(paint);
  };
  start();
  function update(nextProgress, environment = {}) {
    if (destroyed) return;
    progress = clamp(nextProgress);
    visible = environment.visible !== false;
    root.dataset.progress = progress.toFixed(3);
    if (environment.theme) root.dataset.sceneTheme = String(environment.theme);
    if (environment.paused !== undefined) controller.setPaused(Boolean(environment.paused));
    else if (visible && !reduce?.matches) start();
  }
  const controller = {
    update,
    setPaused(value) {
      paused = Boolean(value);
      if (paused || !visible || reduce?.matches) { cancelAnimationFrame(frame); frame = 0; }
      else { startedAt = 0; start(); }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frame);
      root.innerHTML = previous;
      root.removeAttribute("data-progress");
      root.removeAttribute("data-thesis-mode");
      root.removeAttribute("data-scene-theme");
      root.removeAttribute("aria-label");
      root.removeAttribute("data-thesis-scene");
    }
  };
  return controller;
}
