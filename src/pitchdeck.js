import {mountDeckWaveGrid} from './deck-wave-grid.js';
import {mountWarehouseDemo} from './pitchdeck-demo.js';

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

function setActive(slide) {
  if (active === slide) return;
  active = slide; counter.textContent = slide.dataset.slide;
  links.forEach(a => a.hash === `#${slide.id}` ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current'));
  slide.id === 'slide-1' ? wave.play() : wave.pause();
  demo.activate(slide.id === 'slide-3');
}

const observer = new IntersectionObserver(entries => {
  for (const {target, isIntersecting, intersectionRatio} of entries) {
    if (isIntersecting) target.classList.add('is-visible');
    if (isIntersecting && intersectionRatio >= .4) setActive(target);
  }
}, {threshold: [0, .15, .4, .7]});
slides.forEach(s => observer.observe(s));

function updateMotion() {
  document.documentElement.classList.toggle('no-motion', still());
  motion.disabled = reduce.matches; motion.setAttribute('aria-pressed', String(paused));
  motion.textContent = paused ? 'Resume motion' : 'Pause motion';
  wave.setReduced(still()); demo.setReduced(still());
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
  wave.setReduced(true);
  document.querySelector('.wave-print').src = document.querySelector('.wave-grid').toDataURL();
  demo.beforePrint();
});
addEventListener('afterprint', () => { updateMotion(); demo.afterPrint(); });

// Headless PDF export has no scroll, so show every slide straight away.
if (matchMedia('print').matches || navigator.webdriver) slides.forEach(s => s.classList.add('is-visible'));

setActive(slides.find(s => `#${s.id}` === location.hash) || slides[0]);
updateMotion();
