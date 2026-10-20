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

/** Request frames from the homepage's existing scheduler only while settling. */
export function initHoverWarp(root, requestFrame) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const records = [];
  const cleanups = [];
  let paused = false;
  let lastTime = 0;
  const listen = (node, event, handler) => {
    node.addEventListener(event, handler, { passive: true });
    cleanups.push(() => node.removeEventListener(event, handler));
  };
  for (const element of root.querySelectorAll('[data-v6-warp]')) {
    const original = element.textContent;
    const readable = document.createElement('span');
    readable.className = 'glyph-wave__sr-only';
    readable.textContent = original;
    const visual = document.createElement('span');
    visual.className = 'v6-warp-visual';
    visual.setAttribute('aria-hidden', 'true');
    for (const token of original.split(/(\s+)/u)) {
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
    element.replaceChildren(readable, visual);
    element.classList.add('v6-warp-text');
    const record = { element, original, cells: [...visual.querySelectorAll('.v6-warp-cell')], boxes: [], fontSize: 18, active: false, strength: 0, x: 0, y: 0, targetX: 0, targetY: 0, positioned: false };
    records.push(record);
    const point = event => {
      if (reduced.matches || paused || (event.type === 'pointermove' && event.pointerType === 'touch')) return;
      record.targetX = event.clientX;
      record.targetY = event.clientY;
      if (!record.positioned) { record.x = record.targetX; record.y = record.targetY; record.positioned = true; }
      record.active = true;
      requestFrame();
    };
    const leave = () => { record.active = false; requestFrame(); };
    listen(element, 'pointerenter', event => { if (event.pointerType !== 'touch') point(event); });
    listen(element, 'pointermove', point);
    listen(element, 'pointerdown', point);
    listen(element, 'pointerleave', leave);
    listen(element, 'pointerup', event => { if (event.pointerType === 'touch') leave(); });
    listen(element, 'pointercancel', leave);
  }
  function measure() {
    for (const r of records) {
      const rect = r.element.getBoundingClientRect();
      r.fontSize = parseFloat(getComputedStyle(r.element).fontSize) || 18;
      // The paragraph is the positioned offsetParent; these offsets ignore the
      // transforms already applied to the individual letters during a resize.
      r.boxes = r.cells.map(cell => ({ x: rect.left + cell.offsetLeft + cell.offsetWidth / 2, y: rect.top + window.scrollY + cell.offsetTop + cell.offsetHeight / 2 }));
    }
  }
  function reset(record) {
    record.active = false; record.strength = 0; record.positioned = false;
    record.element.classList.remove('is-warping');
    record.cells.forEach(cell => { cell.style.removeProperty('transform'); cell.style.removeProperty('--v6-warp-influence'); });
  }
  function update(now = performance.now()) {
    if (paused) return false;
    const dt = lastTime ? Math.min(48, Math.max(1, now - lastTime)) : 16;
    lastTime = now;
    const ease = 1 - Math.exp(-dt / 70);
    let moving = false;
    for (const r of records) {
      if (reduced.matches) { reset(r); continue; }
      const targetStrength = r.active ? 1 : 0;
      r.strength += (targetStrength - r.strength) * ease;
      r.x += (r.targetX - r.x) * ease;
      r.y += (r.targetY - r.y) * ease;
      const unsettled = Math.abs(targetStrength - r.strength) > .002 || Math.abs(r.targetX - r.x) > .1 || Math.abs(r.targetY - r.y) > .1;
      if (!unsettled) r.strength = targetStrength;
      if (r.strength === 0) { reset(r); continue; }
      r.element.classList.add('is-warping');
      r.cells.forEach((cell, i) => {
        const box = r.boxes[i];
        if (!box) return;
        const warp = warpAtPoint(box.x - r.x, box.y - window.scrollY - r.y, r.fontSize, r.strength);
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
      cleanups.forEach(cleanup => cleanup());
      reduced.removeEventListener('change', preferenceChange);
      records.forEach(r => { r.element.textContent = r.original; r.element.classList.remove('v6-warp-text', 'is-warping'); });
    },
  };
}
