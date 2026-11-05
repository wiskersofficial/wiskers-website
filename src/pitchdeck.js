import {mountDeckWaveGrid} from './deck-wave-grid.js';
import {mountWarehouseDemo} from './pitchdeck-demo.js';
import {mountBagelPhone} from './pitchdeck-bagel.js';
import {initGlyphWaves} from './home-v6/glyph-wave.js';
import {initHoverWarp} from './home-v6/hover-warp.js';
import './home-v6/glyph-wave.css';
import './home-v6/hover-warp.css';

// Deck shell: active slide, keyboard navigation, motion toggle, print stills,
// and one scroll loop that drives every scroll-tracked effect.
document.documentElement.classList.add('js');
const slides = [...document.querySelectorAll('.slide')], links = [...document.querySelectorAll('.deck-nav a')];
const counter = document.getElementById('current-slide'), progressBar = document.getElementById('progress-bar');
const motion = document.querySelector('.deck-motion'), brand = document.querySelector('.deck-brand img');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const LIGHT = new Set(['paper', 'mist', 'sage', 'blush']);
const clamp = v => Math.min(1, Math.max(0, v)), ease = t => t * t * (3 - 2 * t);
let paused = reduce.matches, active = null, printing = false;
const still = () => paused || reduce.matches || printing;

const wave = mountDeckWaveGrid(document.querySelector('.wave-stage'));
const demo = mountWarehouseDemo(document.getElementById('slide-3'));
const bagel = mountBagelPhone(document.querySelector('[data-bagel]'));
const glyphs = initGlyphWaves(document);

let warpFrame = 0;
const warp = initHoverWarp(document, () => { if (!warpFrame) warpFrame = requestAnimationFrame(tickWarp); });
function tickWarp(now) { warpFrame = 0; if (warp.update(now)) warpFrame = requestAnimationFrame(tickWarp); }
addEventListener('resize', () => warp.measure(), {passive: true});
document.fonts?.ready.then(() => warp.measure());

// What each slide animates, collected once.
const scenes = slides.map(slide => ({
  slide,
  glyphs: [...slide.querySelectorAll('.glyph-wave')],
  counts: [...slide.querySelectorAll('[data-count-to]')].map(el => ({el, to: Number(el.dataset.countTo), prefix: el.dataset.prefix || '', suffix: el.dataset.suffix || ''})),
  cube: slide.querySelector('[data-word-cube]'),
  steps: [...slide.querySelectorAll('.flow-step')],
}));
for (const {counts} of scenes) for (const c of counts) { c.el.style.display = 'inline-block'; c.el.style.minWidth = `${c.el.offsetWidth}px`; }
document.fonts?.ready.then(() => { for (const {counts} of scenes) for (const c of counts) { c.el.style.minWidth = ''; c.el.style.minWidth = `${c.el.offsetWidth}px`; } });

const fmt = n => n >= 1000 ? n.toLocaleString('en-GB') : String(n);
let introTime = null;

/** Scroll progress for a slide: 0 as its top enters the bottom of the screen, 1 once it is in place. */
function entry(slide) {
  const r = slide.getBoundingClientRect();
  return clamp((innerHeight - r.top) / (innerHeight * .82));
}

function paintScene(scene, p) {
  const {slide, glyphs: targets, counts, cube, steps} = scene;
  slide.style.setProperty('--p', p.toFixed(4));
  // Glyph waves: staggered through the slide's arrival, so headline words morph first.
  targets.forEach((t, i) => glyphs.update(t, clamp((p - .08 - i * .08) / .72)));
  for (const c of counts) {
    const v = Math.round(c.to * (1 - Math.pow(1 - clamp((p - .15) / .85), 2)));
    c.el.textContent = `${c.prefix}${fmt(v)}${c.suffix}`;
  }
  // Slide 4: the signal's glow peaks on each card as it passes, then fades (none once finished).
  steps.forEach((el, i) => el.style.setProperty('--glow', p >= 1 ? '0' : clamp(1 - Math.abs(p * 6.2 - 1.45 - i) * 1.4).toFixed(3)));
  if (cube) {
    // Three quarter-turns, holding each word, ending on the real copy.
    const step = clamp((p - .15) / .75) * 3, face = Math.min(2, Math.floor(step)), turn = ease(clamp((step - face - .45) / .55));
    const angle = -90 * (step >= 3 ? 3 : face + turn);
    cube.style.setProperty('--cube-angle', `${angle}deg`);
    const current = Math.round(-angle / 90) % 4;
    cube.querySelectorAll('.cube-face').forEach((f, i) => f.classList.toggle('is-current', i === current));
    cube.classList.toggle('is-turning', Math.abs(angle / 90 - Math.round(angle / 90)) > .02);
  }
}

function frame(now = performance.now()) {
  queued = false;
  const range = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.width = `${range > 0 ? Math.min(100, scrollY / range * 100) : 0}%`;
  for (const scene of scenes) {
    let p;
    if (still()) p = 1;
    else if (scene.slide.id === 'slide-1') {
      // The title slide is already in place on load, so its words morph on a short timer.
      introTime ??= now;
      p = clamp((now - introTime) / 1700);
      if (p < 1) requestFrame();
    } else p = entry(scene.slide);
    paintScene(scene, p);
  }
}
let queued = false;
function requestFrame() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
addEventListener('scroll', requestFrame, {passive: true});
addEventListener('resize', requestFrame, {passive: true});

function setActive(slide) {
  if (active === slide) return;
  active = slide; counter.textContent = slide.dataset.slide;
  links.forEach(a => a.hash === `#${slide.id}` ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current'));
  const light = LIGHT.has(slide.dataset.theme);
  document.documentElement.classList.toggle('tone-light', light);
  brand.src = light ? '/pitchdeck-assets/wiskers-v2-wordmark-dark.svg' : '/pitchdeck-assets/wiskers-v2-wordmark-light.svg';
  slide.id === 'slide-1' ? wave.play() : wave.pause();
  demo.activate(slide.id === 'slide-3');
  bagel.activate(slide.id === 'slide-6');
}

// The active slide is whichever one covers the middle of the screen.
function pickActive() {
  const mid = innerHeight / 2;
  const hit = slides.find(s => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
  if (hit) setActive(hit);
}
addEventListener('scroll', () => requestAnimationFrame(pickActive), {passive: true});

const observer = new IntersectionObserver(entries => {
  for (const {target, isIntersecting} of entries) {
    if (!isIntersecting) continue;
    target.classList.add('is-visible');
    if (target.id === 'slide-5' || target.id === 'slide-6') bagel.arm();
  }
}, {threshold: [0, .15]});
slides.forEach(s => observer.observe(s));

function updateMotion() {
  document.documentElement.classList.toggle('no-motion', still());
  motion.disabled = reduce.matches; motion.setAttribute('aria-pressed', String(paused));
  motion.textContent = paused ? 'Resume motion' : 'Pause motion';
  wave.setReduced(still()); demo.setReduced(still()); warp.setPaused(still()); bagel.setReduced(still());
  requestFrame();
}
motion.addEventListener('click', () => { paused = !paused; updateMotion(); });
reduce.addEventListener('change', () => { paused = reduce.matches; updateMotion(); });

addEventListener('keydown', e => {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  const el = document.activeElement;
  if (/INPUT|TEXTAREA|SELECT|BUTTON/.test(el?.tagName) || el?.classList.contains('wave-stage')) return;
  const dir = ['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key) ? 1 : ['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key) ? -1 : 0;
  if (!dir) return;
  e.preventDefault();
  const i = Math.max(0, Math.min(slides.length - 1, slides.indexOf(active ?? slides[0]) + dir));
  slides[i].scrollIntoView({behavior: still() ? 'auto' : 'smooth'});
});

// Print and PDF: every effect in its finished state.
function finishAll() { scenes.forEach(s => paintScene(s, 1)); slides.forEach(s => s.classList.add('is-visible')); }
addEventListener('beforeprint', () => {
  printing = true; finishAll();
  wave.setReduced(true);
  document.querySelector('.wave-print').src = document.querySelector('.wave-grid').toDataURL();
  demo.beforePrint();
});
addEventListener('afterprint', () => { printing = false; updateMotion(); demo.afterPrint(); });

// Headless PDF export has no scroll, so show every slide finished straight away.
// Automated checks (webdriver) also freeze effects at their finished state, so layouts are measured as presented.
if (matchMedia('print').matches || navigator.webdriver) { printing = true; finishAll(); }

setActive(slides.find(s => `#${s.id}` === location.hash) || slides[0]);
updateMotion();
pickActive();

// Deep links (#slide-6): land on the slide even after fonts and images shift the layout.
const linked = slides.find(s => `#${s.id}` === location.hash);
if (linked) {
  history.scrollRestoration = 'manual';
  const align = () => { if (location.hash === `#${linked.id}`) { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, linked.offsetTop); document.documentElement.style.scrollBehavior = ''; } };
  requestAnimationFrame(align); document.fonts?.ready.then(() => requestAnimationFrame(align));
  addEventListener('load', () => requestAnimationFrame(align), {once: true});
}
