import './home-v4-type.css';
import './home-v4-hero.css';
import './home-v4-process-art.css';
import './home-v4-process-words.css';
import './home-v4-thesis.css';
import './home-v4-example.css';
import './home-v4-bridge.css';
import './home-v4-closing.css';
import './home-v4-transitions.css';
import './home-v4-controls.css';
import { initHomeV4Type } from './home-v4-type.js';
import { initializeHeroSculpture } from './home-v4-hero.js';
import { initProcessArt } from './home-v4-process-art.js';
import { mountThesisScene } from './home-v4-thesis.js';
import { initExampleInstrument } from './home-v4-example.js';
import { initBuyerBridge } from './home-v4-bridge.js';
import { initializeClosingMonument } from './home-v4-closing.js';
import { mountHomeV4Transitions } from './home-v4-transitions.js';
import { createHomeV4Runtime } from './home-v4-runtime.js';
import { initHomeV4Controls } from './home-v4-controls.js';
import './home-v4-process-words.js';

const main = document.querySelector('#main-content');
if (main && document.body.classList.contains('home-v3')) {
  const runtime = createHomeV4Runtime();
  const cleanupControls = initHomeV4Controls(document);
  const cleanups = [];
  const register = (root, controller, options) => {
    if (root && controller) cleanups.push(runtime.register(root, controller, options));
  };

  const hero = main.querySelector('[data-hero-art]');
  if (hero) register(hero, initializeHeroSculpture(hero));

  const thesis = main.querySelector('#v3-thesis');
  if (thesis) register(thesis, mountThesisScene(thesis));

  const scene = main.querySelector('[data-process-scene]');
  const processArt = main.querySelector('[data-process-art]');
  if (processArt) register(processArt, initProcessArt(processArt));
  if (scene && window.mountProcessWords) {
    register(scene, window.mountProcessWords(scene), { range: scene });
  }

  const example = main.querySelector('[data-example-shell]');
  if (example) register(example, initExampleInstrument(example));

  const value = main.querySelector('#v3-value');
  if (value) {
    register(value, initBuyerBridge(value), { range: value });
  }

  const closingArt = main.querySelector('.v3-close-art');
  if (closingArt) {
    closingArt.dataset.closingArt = '';
    register(closingArt, initializeClosingMonument(closingArt));
  }

  const transitions = mountHomeV4Transitions(main);
  register(main, transitions, { range: main });

  // Mount typography after scene composition so inserted thesis and closing
  // headings receive the same scroll-reactive variable-axis treatment.
  register(main, initHomeV4Type(main), { range: main });

  const pauseMotion = (event) => runtime.setPaused(Boolean(event.detail?.paused));
  window.addEventListener('home-v4-motion-toggle', pauseMotion);
  const onPageHide = (event) => {
    // A BFCache restore revives this exact DOM and module instance; leave its
    // controllers intact so the page can continue where it was.
    if (event.persisted) return;
    window.removeEventListener('home-v4-motion-toggle', pauseMotion);
    runtime.destroy();
    cleanupControls();
    for (const cleanup of cleanups) cleanup();
  };
  window.addEventListener('pagehide', onPageHide, { once: true });
}
