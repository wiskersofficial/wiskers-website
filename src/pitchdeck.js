import {mountDeckWaveGrid} from './deck-wave-grid.js';
import {mountWarehouseDemo} from './pitchdeck-demo.js';
import {mountBagelPhone} from './pitchdeck-bagel.js';
import {initGlyphWaves} from './home-v6/glyph-wave.js';
import {initHoverWarp} from './home-v6/hover-warp.js';
import './home-v6/glyph-wave.css';
import './home-v6/hover-warp.css';

// Deck shell: active slide tracking, keyboard navigation, motion toggle, print stills.
document.documentElement.classList.add('js');
const slides = [...document.querySelectorAll('.slide')], links = [...document.querySelectorAll('.deck-nav a')];
const counter = document.getElementById('current-slide'), progress = document.getElementById('progress-bar');
const motion = document.querySelector('.deck-motion');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduce.matches, active = null;
const still = () => paused || reduce.matches;

const wave = mountDeckWaveGrid(document.querySelector('.wave-stage'));
const demo = mountWarehouseDemo(document.getElementById('slide-3'));
const bagel = mountBagelPhone(document.querySelector('[data-bagel]'));

// The website's sans-to-italic-serif glyph wave, played once as each slide arrives.
const glyphs = initGlyphWaves(document);
const played = new WeakSet();
function playGlyphs(slide) {
  const targets = [...slide.querySelectorAll('.glyph-wave')];
  if (!targets.length || played.has(slide)) return;
  played.add(slide);
  if (still()) { targets.forEach(t => glyphs.update(t, 1)); return; }
  const start = performance.now() + 380;
  const runs = targets.map(t => ({t, duration: Math.min(2200, Math.max(900, t.textContent.length * 70 + 400))}));
  const step = now => {
    let busy = false;
    for (const {t, duration} of runs) { const p = Math.max(0, Math.min(1, (now - start) / duration)); glyphs.update(t, p); busy ||= p < 1; }
    if (busy) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const finishGlyphs = () => { slides.forEach(s => played.add(s)); document.querySelectorAll('.glyph-wave').forEach(t => glyphs.update(t, 1)); };

// The website's elastic hover lens on lead lines.
let warpFrame = 0;
const warp = initHoverWarp(document, () => { if (!warpFrame) warpFrame = requestAnimationFrame(tickWarp); });
function tickWarp(now) { warpFrame = 0; if (warp.update(now)) warpFrame = requestAnimationFrame(tickWarp); }
addEventListener('resize', () => warp.measure(), {passive: true});
document.fonts?.ready.then(() => warp.measure());

// £125k counts up the first time the raise slide arrives.
const counter125 = document.querySelector('[data-count]');
let counted = false;
function countUp() {
  if (counted) return; counted = true;
  const target = Number(counter125.dataset.count);
  if (still()) return;
  counter125.style.display = 'inline-block'; counter125.style.minWidth = `${counter125.offsetWidth}px`;
  const start = performance.now() + 300, duration = 1500;
  const step = now => {
    const p = Math.max(0, Math.min(1, (now - start) / duration)), eased = 1 - Math.pow(1 - p, 3);
    counter125.textContent = `£${Math.round(target * eased)}k`;
    if (p < 1) requestAnimationFrame(step); else counter125.textContent = `£${target}k`;
  };
  counter125.textContent = '£0k'; requestAnimationFrame(step);
}

function setActive(slide) {
  if (active === slide) return;
  active = slide; counter.textContent = slide.dataset.slide;
  links.forEach(a => a.hash === `#${slide.id}` ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current'));
  slide.id === 'slide-1' ? wave.play() : wave.pause();
  demo.activate(slide.id === 'slide-3');
}

const observer = new IntersectionObserver(entries => {
  for (const {target, isIntersecting, intersectionRatio} of entries) {
    if (isIntersecting) {
      target.classList.add('is-visible'); playGlyphs(target);
      if (target.id === 'slide-6' || target.id === 'slide-5') bagel.arm();
      if (target.id === 'slide-10') countUp();
    }
    if (isIntersecting && intersectionRatio >= .4) setActive(target);
  }
}, {threshold: [0, .15, .4, .7]});
slides.forEach(s => observer.observe(s));

function updateMotion() {
  document.documentElement.classList.toggle('no-motion', still());
  motion.disabled = reduce.matches; motion.setAttribute('aria-pressed', String(paused));
  motion.textContent = paused ? 'Resume motion' : 'Pause motion';
  wave.setReduced(still()); demo.setReduced(still()); warp.setPaused(still());
  if (still()) finishGlyphs();
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

let queued = false;
addEventListener('scroll', () => {
  if (queued) return; queued = true;
  requestAnimationFrame(() => {
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${range > 0 ? Math.min(100, scrollY / range * 100) : 0}%`; queued = false;
  });
}, {passive: true});

addEventListener('beforeprint', () => {
  slides.forEach(s => s.classList.add('is-visible'));
  finishGlyphs(); counter125.textContent = `£${counter125.dataset.count}k`;
  wave.setReduced(true);
  document.querySelector('.wave-print').src = document.querySelector('.wave-grid').toDataURL();
  demo.beforePrint();
});
addEventListener('afterprint', () => { updateMotion(); demo.afterPrint(); });

// Headless PDF export has no scroll, so show every slide straight away.
if (matchMedia('print').matches || navigator.webdriver) { slides.forEach(s => s.classList.add('is-visible')); finishGlyphs(); }

setActive(slides.find(s => `#${s.id}` === location.hash) || slides[0]);
updateMotion();
