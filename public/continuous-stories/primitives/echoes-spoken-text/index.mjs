const PUNCTUATION = /[.,;:!?]$/;

/** Create an independently controlled, accessible word-by-word text reveal. */
export function createSpokenText({
  root,
  wordDelay = 205,
  punctuationDelay = 460,
  reducedMotion,
  announce = true,
  matchMedia = globalThis.matchMedia,
  schedule = globalThis.setTimeout,
  unschedule = globalThis.clearTimeout,
} = {}) {
  if (!root || typeof root.replaceChildren !== 'function') {
    throw new TypeError('createSpokenText requires a DOM element as root');
  }

  const doc = root.ownerDocument || globalThis.document;
  if (!doc?.createElement) throw new TypeError('A browser document is required');
  const visual = doc.createElement('span');
  visual.className = 'echoes-spoken-text__visual';
  visual.setAttribute('aria-hidden', 'true');
  const accessible = doc.createElement('span');
  accessible.className = 'echoes-spoken-text__accessible';
  accessible.setAttribute('aria-live', announce ? 'polite' : 'off');
  accessible.setAttribute('aria-atomic', 'true');
  root.classList?.add('echoes-spoken-text');
  root.replaceChildren(visual, accessible);

  const motionQuery = typeof reducedMotion === 'boolean'
    ? null
    : matchMedia?.('(prefers-reduced-motion: reduce)');
  let motionReduced = reducedMotion ?? Boolean(motionQuery?.matches);
  let timer = null;
  let generation = 0;
  let destroyed = false;
  let words = [];
  let index = 0;

  const onMotionChange = event => {
    motionReduced = event.matches;
    if (!motionReduced || destroyed) return;
    generation++;
    cancelTimer();
    words.forEach(word => {
      word.classList.add('is-visible');
      word.classList.remove('is-current');
    });
  };
  motionQuery?.addEventListener?.('change', onMotionChange);

  function cancelTimer() {
    if (timer !== null) unschedule(timer);
    timer = null;
  }

  function cancel() {
    if (destroyed) return;
    generation++;
    cancelTimer();
    visual.querySelectorAll?.('.echoes-spoken-text__word').forEach(word => {
      word.classList.remove('is-current');
    });
  }

  function prepare(text, { accessibleText = text } = {}) {
    if (destroyed) return;
    cancel();
    const source = String(text ?? '');
    const parts = source.match(/\S+\s*/g) || [];
    visual.replaceChildren(...parts.map(part => {
      const word = doc.createElement('span');
      word.className = 'echoes-spoken-text__word';
      word.textContent = part;
      return word;
    }));
    accessible.textContent = String(accessibleText ?? '');
    words = Array.from(visual.children);
    index = 0;

    if (motionReduced) {
      words.forEach(word => word.classList.add('is-visible'));
      return;
    }

  }

  // Prepare without starting a timer, then seek using a host-owned scroll position.
  function seek(progress) {
    if (destroyed) return;
    generation++;
    cancelTimer();
    const value = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
    const count = motionReduced ? words.length : Math.floor(value * words.length + 1e-7);
    words.forEach((word, i) => {
      if (i < count) word.classList.add('is-visible');
      else word.classList.remove('is-visible');
      if (count < words.length && i === count - 1) word.classList.add('is-current');
      else word.classList.remove('is-current');
    });
    index = count;
  }

  function play(text, options = {}) {
    if (destroyed) return;
    prepare(text, options);
    const run = generation;
    if (motionReduced) return;

    function revealNext() {
      if (destroyed || run !== generation) return;
      if (index > 0) words[index - 1].classList.remove('is-current');
      if (index >= words.length) return;
      const current = words[index++];
      current.classList.add('is-visible', 'is-current');
      const delay = PUNCTUATION.test(current.textContent.trim()) ? punctuationDelay : wordDelay;
      timer = schedule(() => {
        timer = null;
        revealNext();
      }, delay);
    }
    revealNext();
  }

  function clear() {
    if (destroyed) return;
    cancel();
    visual.replaceChildren();
    accessible.textContent = '';
    words = [];
    index = 0;
  }

  function destroy() {
    if (destroyed) return;
    clear();
    destroyed = true;
    motionQuery?.removeEventListener?.('change', onMotionChange);
    root.classList?.remove('echoes-spoken-text');
    root.replaceChildren();
  }

  return { play, replace: play, prepare, seek, cancel, clear, destroy };
}
