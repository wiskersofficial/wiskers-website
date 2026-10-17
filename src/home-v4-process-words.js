/* Optional cinematic typography for the v3 process scene.
 * Usage: const words = mountProcessWords(document.querySelector('[data-process-scene]'));
 * Call words.update(progress, environment) from the host scroll controller.
 */
(function (global) {
  'use strict';

  const WORDS = [
    { id: 'idea', label: 'IDEA', start: 0, end: 0.42, phase: 0.2, drift: 2.1 },
    { id: 'conception', label: 'CONCEPTION', start: 0.27, end: 0.76, phase: 2.4, drift: 1.7 },
    { id: 'launch', label: 'LAUNCH', start: 0.61, end: 1, phase: 4.1, drift: 2.4 }
  ];

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function smooth(value) { return value * value * (3 - 2 * value); }
  function envelope(progress, start, end) {
    const fade = Math.min(0.13, (end - start) * 0.34);
    return smooth(clamp((progress - start) / fade, 0, 1)) *
      (1 - smooth(clamp((progress - (end - fade)) / fade, 0, 1)));
  }

  function mountProcessWords(root, options) {
    options = options || {};
    if (typeof root === 'string') root = document.querySelector(root);
    if (!root || !root.appendChild) throw new TypeError('mountProcessWords requires a process scene element.');

    const host = root.matches && root.matches('.v3-process-sticky')
      ? root
      : (root.querySelector('.v3-process-sticky') || root);
    const layer = document.createElement('div');
    layer.className = 'v4-process-words';
    layer.setAttribute('aria-hidden', 'true');
    layer.setAttribute('data-v4-process-words', '');

    const nodes = WORDS.map((word) => {
      const node = document.createElement('span');
      node.className = 'v4-process-words__word';
      node.dataset.word = word.id;
      node.textContent = word.label;
      layer.appendChild(node);
      return { ...word, node };
    });
    host.appendChild(layer);

    const media = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let progress = 0;
    let environment = {};
    let paused = false;
    let destroyed = false;
    let frame = 0;
    let startTime = 0;
    let reduced = !!(media && media.matches);

    function render() {
      if (destroyed) return;
      const p = clamp(Number(progress) || 0, 0, 1);
      nodes.forEach((word) => {
        const amount = envelope(p, word.start, word.end);
        const entering = smooth(clamp((p - word.start) / Math.max(0.01, word.end - word.start), 0, 1));
        word.node.style.setProperty('--word-opacity', String(amount * 0.22));
        word.node.style.setProperty('--word-scale', String(reduced ? 1 : 0.9 + entering * 0.1 + amount * 0.035));
        word.node.style.setProperty('--word-rotate', reduced ? '0deg' : `${-7 + entering * 5}deg`);
        word.node.style.setProperty('--word-drift-x', '0px');
        word.node.style.setProperty('--word-drift-y', '0px');
      });
      layer.dataset.motion = reduced ? 'reduced' : (paused ? 'paused' : 'active');
    }

    function tick(time) {
      frame = 0;
      if (destroyed || paused || reduced) return;
      if (!startTime) startTime = time;
      const seconds = (time - startTime) / 1000;
      nodes.forEach((word) => {
        const opacity = parseFloat(word.node.style.getPropertyValue('--word-opacity')) || 0;
        const amplitude = Math.min(1, opacity * 7);
        const x = Math.sin(seconds * 0.47 + word.phase) * word.drift * amplitude;
        const y = Math.cos(seconds * 0.39 + word.phase) * word.drift * amplitude;
        word.node.style.setProperty('--word-drift-x', `${x.toFixed(2)}px`);
        word.node.style.setProperty('--word-drift-y', `${y.toFixed(2)}px`);
      });
      frame = global.requestAnimationFrame(tick);
    }

    function syncLoop() {
      if (frame) global.cancelAnimationFrame(frame);
      frame = 0;
      if (!destroyed && !paused && !reduced) frame = global.requestAnimationFrame(tick);
    }

    function onMotionPreference(event) {
      reduced = !!event.matches;
      render();
      syncLoop();
    }
    if (media) {
      if (media.addEventListener) media.addEventListener('change', onMotionPreference);
      else if (media.addListener) media.addListener(onMotionPreference);
    }

    render();
    syncLoop();

    return {
      update(nextProgress, nextEnvironment) {
        if (destroyed) return;
        progress = Number(nextProgress) || 0;
        environment = nextEnvironment || {};
        // Let a host supply a reduced-motion state, while never overriding the
        // visitor's explicit operating-system preference.
        reduced = !!(media && media.matches) || environment.reducedMotion === true;
        render();
        syncLoop();
      },
      setPaused(value) {
        if (destroyed) return;
        paused = !!value;
        render();
        syncLoop();
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        if (frame) global.cancelAnimationFrame(frame);
        frame = 0;
        if (media) {
          if (media.removeEventListener) media.removeEventListener('change', onMotionPreference);
          else if (media.removeListener) media.removeListener(onMotionPreference);
        }
        layer.remove();
      }
    };
  }

  global.mountProcessWords = mountProcessWords;
})(window);
