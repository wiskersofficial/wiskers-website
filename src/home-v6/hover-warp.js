const clamp = value => Math.min(1, Math.max(0, value));

/** A restrained elastic lens; transforms never change text layout. */
export function warpAtPoint(dx, dy, fontSize, strength) {
  const nx = dx / (fontSize * 4.3);
  const ny = dy / (fontSize * 2.1);
  const influence = Math.exp(-(nx * nx + ny * ny) * 0.5) * clamp(strength);
  return {
    influence,
    x: nx * fontSize * 0.22 * influence,
    y: -fontSize * 0.48 * influence,
    skew: -nx * 14 * influence,
    rotation: nx * 4 * influence,
    scaleX: 1 + 0.09 * influence,
    scaleY: 1 + 0.24 * influence,
  };
}

/** Enhance marked prose; the caller owns the shared animation frame. */
export function initHoverWarp(root, requestFrame) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const records = new Map();
  let paused = false;
  let lastTime = 0;
  function measureRecord(r) {
    r.fontSize = parseFloat(getComputedStyle(r.element).fontSize) || 18;
    // Offsets ignore the lens transforms. The host is the positioned ancestor.
    r.boxes = r.cells.map(cell => ({ x: cell.offsetLeft + cell.offsetWidth / 2, y: cell.offsetTop + cell.offsetHeight / 2 }));
  }
  function reset(r) {
    r.active = false; r.strength = 0; r.positioned = false;
    r.element.classList.remove('is-warping');
    r.cells.forEach(cell => { cell.style.removeProperty('transform'); cell.style.removeProperty('--v6-warp-influence'); });
  }
  function mount(element) {
    // Targets contain prose and optional line breaks, never interactive children.
    if (element.querySelector(':not(br)')) return;
    const original = [...element.childNodes].map(node => node.cloneNode(true));
    const readable = document.createElement('span');
    readable.className = 'v6-warp-readable';
    readable.append(...original.map(node => node.cloneNode(true)));
    const visual = document.createElement('span');
    visual.className = 'v6-warp-visual';
    visual.setAttribute('aria-hidden', 'true');
    for (const node of original) {
      if (node.nodeType !== Node.TEXT_NODE) { visual.append(node.cloneNode(true)); continue; }
      for (const token of node.textContent.split(/(\s+)/u)) {
        if (/^\s*$/u.test(token)) { visual.append(document.createTextNode(token)); continue; }
        const word = document.createElement('span');
        word.className = 'v6-warp-word';
        for (const letter of Array.from(token)) {
          const cell = document.createElement('span');
          cell.className = 'v6-warp-cell';
          cell.textContent = letter;
          word.append(cell);
        }
        visual.append(word);
      }
    }
    element.replaceChildren(readable, visual);
    element.classList.add('v6-warp-text');
    const r = { element, original, readable, visual, cells: [...visual.querySelectorAll('.v6-warp-cell')], boxes: [], fontSize: 18, active: false, strength: 0, x: 0, y: 0, targetX: 0, targetY: 0, positioned: false, cleanups: [] };
    records.set(element, r);
    const listen = (event, handler) => {
      element.addEventListener(event, handler, { passive: true });
      r.cleanups.push(() => element.removeEventListener(event, handler));
    };
    const point = event => {
      if (reduced.matches || paused || (event.type === 'pointermove' && event.pointerType === 'touch')) return;
      if (!r.active) measureRecord(r); // Includes newly opened or updated demo copy.
      r.targetX = event.clientX;
      r.targetY = event.clientY;
      if (!r.positioned) { r.x = r.targetX; r.y = r.targetY; r.positioned = true; }
      r.active = true;
      requestFrame();
    };
    const leave = () => { r.active = false; requestFrame(); };
    listen('pointerenter', event => { if (event.pointerType !== 'touch') point(event); });
    listen('pointermove', point);
    listen('pointerdown', point);
    listen('pointerleave', leave);
    listen('pointerup', event => { if (event.pointerType === 'touch') leave(); });
    listen('pointercancel', leave);
  }
  function remove(r, restore = false) {
    r.cleanups.forEach(cleanup => cleanup());
    reset(r);
    r.element.classList.remove('v6-warp-text');
    if (restore) r.element.replaceChildren(...r.original);
    records.delete(r.element);
  }
  function sync() {
    for (const r of records.values()) {
      if (!root.contains(r.element) || r.visual.parentNode !== r.element || r.readable.parentNode !== r.element) remove(r);
    }
    for (const element of root.querySelectorAll('[data-v6-warp]')) {
      if (!records.has(element)) mount(element);
    }
  }
  sync();
  // Watch content replacement, never animation attributes. Enhancement writes are
  // disconnected so they cannot create observer loops or duplicate announcements.
  const observer = new MutationObserver(() => {
    observer.disconnect();
    sync();
    observer.observe(root, { childList: true, subtree: true, characterData: true });
  });
  observer.observe(root, { childList: true, subtree: true, characterData: true });
  function measure() { records.forEach(measureRecord); }
  function update(now = performance.now()) {
    if (paused) return false;
    const dt = lastTime ? Math.min(48, Math.max(1, now - lastTime)) : 16;
    lastTime = now;
    const ease = 1 - Math.exp(-dt / 70);
    let moving = false;
    for (const r of records.values()) {
      if (!r.active && r.strength === 0) continue;
      if (reduced.matches) { reset(r); continue; }
      const targetStrength = r.active ? 1 : 0;
      r.strength += (targetStrength - r.strength) * ease;
      r.x += (r.targetX - r.x) * ease;
      r.y += (r.targetY - r.y) * ease;
      const unsettled = Math.abs(targetStrength - r.strength) > .002 || Math.abs(r.targetX - r.x) > .1 || Math.abs(r.targetY - r.y) > .1;
      if (!unsettled) r.strength = targetStrength;
      if (r.strength === 0) { reset(r); continue; }
      // One host read keeps the lens aligned inside native nested scroll panes.
      const rect = r.element.getBoundingClientRect();
      r.element.classList.add('is-warping');
      r.cells.forEach((cell, i) => {
        const box = r.boxes[i];
        if (!box) return;
        const warp = warpAtPoint(rect.left + box.x - r.x, rect.top + box.y - r.y, r.fontSize, r.strength);
        cell.style.setProperty('--v6-warp-influence', warp.influence.toFixed(3));
        cell.style.transform = `translate3d(${warp.x.toFixed(2)}px,${warp.y.toFixed(2)}px,0) skewX(${warp.skew.toFixed(2)}deg) rotate(${warp.rotation.toFixed(2)}deg) scale(${warp.scaleX.toFixed(3)},${warp.scaleY.toFixed(3)})`;
      });
      moving ||= unsettled;
    }
    return moving;
  }
  const preferenceChange = () => { if (reduced.matches) records.forEach(reset); requestFrame(); };
  reduced.addEventListener('change', preferenceChange);
  return {
    measure, update,
    setPaused(value) { paused = Boolean(value); lastTime = 0; },
    destroy() {
      observer.disconnect();
      reduced.removeEventListener('change', preferenceChange);
      for (const r of records.values()) remove(r, true);
    },
  };
}
