import './layout.css';
import './glyph-wave.css';
import './hover-warp.css';
import './lead-moment.css';
import { homeMarkup, mountHomeInteractions } from './markup.js';
import { initGlyphWaves } from './glyph-wave.js';
import { initScrollVisuals } from './visual-modules.js';
import { cuboidRotation, cuboidViewportProgress } from './word-cuboid.js';
import { initHoverWarp } from './hover-warp.js';
import { measureDocumentBoxes, observeLayoutChanges, progressAcrossRange, progressAcrossViewport } from './scroll-timing.js';

const main = document.querySelector('#main-content');
if (main) {
  if (!main.querySelector('.v6-home')) main.innerHTML = homeMarkup;
  document.body.className = 'home-v6';
  const root = main.querySelector('.v6-home');
  const interactions = mountHomeInteractions(root);
  const glyphs = initGlyphWaves(root);
  const visuals = initScrollVisuals(root);
  const warp = initHoverWarp(root, () => schedule(false));
  const targets = [...root.querySelectorAll('[data-glyph-wave]')];
  const scenes = [...root.querySelectorAll('.v6-scene')];
  const stages = [...root.querySelectorAll('[data-v6-process-stage]')];
  const cuboids = [...root.querySelectorAll('[data-v6-word-cuboid]')];
  const hero = root.querySelector('.v6-hero');
  const heroTarget = hero.querySelector('[data-glyph-wave]');
  const heroLines = [...hero.querySelectorAll('[data-v6-hero-line]')];
  const thesis = root.querySelector('.v6-thesis');
  const process = root.querySelector('.v6-process');
  const outline = root.querySelector('[data-v6-outline]');
  const progressBar = document.querySelector('[data-v6-progress]');
  const pauseButton = document.querySelector('[data-v6-pause]');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.min(1, Math.max(0, value));
  let boxes = new Map();
  let frame = 0;
  let needsSceneUpdate = true;
  let paused = false;
  let height = window.innerHeight;
  let pageHeight = 1;

  function measure() {
    height = window.visualViewport?.height || window.innerHeight;
    const scrollY = window.scrollY;
    boxes = measureDocumentBoxes([...scenes, ...targets, ...stages, ...cuboids], scrollY);
    // Hero lines drift. Remove the applied transform from measured geometry.
    if (heroTarget) {
      const box = boxes.get(heroTarget);
      const lift = parseFloat(getComputedStyle(heroTarget).getPropertyValue('--v6-line-lift')) || 0;
      if (box) boxes.set(heroTarget, { ...box, top: box.top - lift });
    }
    warp.measure();
    pageHeight = Math.max(1, document.documentElement.scrollHeight - height);
    schedule();
  }
  function progressFor(target) {
    const box = boxes.get(target);
    if (!box) return 0;
    const offset = window.visualViewport?.offsetTop || 0;
    // Use the existing cadence where there is room; complete the word while
    // its actual wrapped box is readable on short and narrow viewports.
    const travel = Math.min(glyphs.getTravelDistance(target, 48), Math.max(1, height * .76 - Math.min(box.height, height * .25)));
    const start = box.top - height * .9 - offset;
    const end = Math.min(start + travel, pageHeight);
    return progressAcrossRange(window.scrollY, Math.min(start, end - 1), Math.max(start + 1, end));
  }
  function sceneProgress(scene) {
    const box = boxes.get(scene);
    return box ? progressAcrossViewport(box, window.scrollY, height, .9, .1, window.visualViewport?.offsetTop || 0) : 0;
  }
  function update(now) {
    frame = 0;
    if (paused) return;
    const warpMoving = warp.update(now);
    if (!needsSceneUpdate) { if (warpMoving) schedule(false); return; }
    needsSceneUpdate = false;
    const reduced = motionPreference.matches;
    progressBar?.style.setProperty('--v6-page-progress', clamp(window.scrollY / pageHeight).toFixed(4));
    const heroBox = boxes.get(heroTarget);
    const heroTravel = Math.max(1, Math.min(glyphs.getTravelDistance(heroTarget, 48), (heroBox?.top || height * .35) - height * .05));
    const heroStep = glyphs.getTiming(heroTarget).step;
    const heroProgress = reduced ? 1 : heroTravel * heroStep < 12 ? 0 : progressAcrossRange(window.scrollY, 0, heroTravel);
    for (const target of targets) glyphs.update(target, reduced ? 1 : target === heroTarget ? heroProgress : progressFor(target));
    const depart = reduced ? 0 : clamp(window.scrollY / (height * .8));
    heroLines.forEach((line, index) => line.style.setProperty('--v6-line-lift', `${(-depart * (26 + index * 10)).toFixed(1)}px`));
    for (const cuboid of cuboids) {
      const progress = cuboidViewportProgress(boxes.get(cuboid), window.scrollY, height, window.visualViewport?.offsetTop || 0);
      const angle = reduced ? 0 : cuboidRotation(progress);
      cuboid.style.setProperty('--v6-cuboid-angle', `${angle.toFixed(3)}deg`);
      const frontFace = Math.round(-angle / 90) % 4;
      cuboid.querySelectorAll('.v6-cuboid-face').forEach((face, index) => face.classList.toggle('is-current', index === frontFace));
    }
    const thesisProgress = reduced ? 1 : sceneProgress(thesis);
    outline?.style.setProperty('--v6-outline-fill', `${(clamp(thesisProgress * 2.2) * 100).toFixed(1)}%`);
    const processProgress = reduced ? 1 : sceneProgress(process);
    visuals.update({ hero: heroProgress, thesis: thesisProgress, process: processProgress });
    stages.forEach(stage => {
      const target = stage.querySelector('[data-glyph-wave]');
      const p = reduced ? 1 : progressFor(target);
      stage.style.setProperty('--v6-stage-progress-percent', `${(p * 100).toFixed(1)}%`);
    });
    if (warpMoving) schedule(false);
  }
  function schedule(sceneChanged = true) {
    if (sceneChanged !== false) needsSceneUpdate = true;
    if (!frame && !paused) frame = requestAnimationFrame(update);
  }
  function onMotionPreference() {
    cuboids.forEach(cuboid => cuboid.classList.toggle('is-enhanced', !motionPreference.matches));
    measure();
  }
  function togglePause() {
    paused = !paused;
    document.documentElement.classList.toggle('motion-paused', paused);
    glyphs.setPaused(paused);
    visuals.setPaused(paused);
    warp.setPaused(paused);
    interactions.setPaused(paused);
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = paused ? 'Resume motion' : 'Pause motion';
    if (paused && frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!paused) measure();
  }
  if (pauseButton) pauseButton.hidden = false;
  pauseButton?.addEventListener('click', togglePause);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.visualViewport?.addEventListener('resize', measure, { passive: true });
  motionPreference.addEventListener('change', onMotionPreference);
  const disconnect = observeLayoutChanges([...scenes, ...targets, ...stages, ...cuboids, main], measure);
  document.fonts?.ready.then(measure);
  onMotionPreference();
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    interactions.destroy(); glyphs.destroy(); visuals.destroy(); warp.destroy(); disconnect();
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', measure);
    window.visualViewport?.removeEventListener('resize', measure);
    motionPreference.removeEventListener('change', onMotionPreference);
    pauseButton?.removeEventListener('click', togglePause);
  }, { once: true });
}
