const FORMS = {
  question: {
    className: 'hero-sculpture__mark--question',
    detailAt: new Set([2, 3, 4, 10, 11, 12, 15]),
    points: [
      [2,0],[3,0],[4,0], [1,1],[5,1], [0,2],[6,2], [5,3], [4,4], [3,5], [3,6],
      [0,0],[6,0],[0,1],[6,1],[0,3],[6,3],[2,6],[4,6]
    ],
  },
  inputs: {
    className: 'hero-sculpture__mark--inputs',
    detailAt: new Set([1, 5, 9, 13, 16]),
    points: [
      [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],
      [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
      [0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],
      [0,1],[0,3],[6,1],[6,3],[1,5],[2,5],[4,5],[5,5]
    ],
  },
  forward: {
    className: 'hero-sculpture__mark--forward',
    detailAt: new Set([1, 4, 8, 12]),
    points: [
      [0,0],[1,0],[2,0],[3,0],[4,0], [2,1],[3,1],[4,1],[5,1],
      [4,2],[5,2],[6,2], [4,3],[5,3], [2,4],[3,4],[4,4],[5,4],
      [0,5],[1,5],[2,5],[3,5],[4,5]
    ],
  },
};

function rect(x, y, size, cls) {
  return `<rect class="${cls}" x="${x}" y="${y}" width="${size}" height="${size}" rx="1.5"/>`;
}

function makeMark(name, form) {
  const cells = form.points.map(([x, y], index) => {
    const cls = form.detailAt.has(index) ? 'hero-sculpture__detail' : 'hero-sculpture__face';
    const px = 43 + x * 22;
    const py = 44 + y * 22;
    // A 2px offset is the dark, squared side plane of each raised block.
    return `<g class="hero-sculpture__block">${rect(px + 2, py + 3, 16, 'hero-sculpture__edge')}${rect(px, py, 16, cls)}</g>`;
  }).join('');
  return `<g class="hero-sculpture__mark ${form.className}" data-mark="${name}" shape-rendering="crispEdges">${cells}</g>`;
}

function createArtwork() {
  const marks = Object.entries(FORMS).map(([name, form]) => makeMark(name, form)).join('');
  return `<div class="hero-sculpture__halo" aria-hidden="true"></div><div class="hero-sculpture__aperture" aria-hidden="true"></div><svg class="hero-sculpture" viewBox="0 0 240 240" aria-hidden="true" focusable="false">${marks}</svg>`;
}

/**
 * Mount the decorative homepage hero sculpture.
 * @param {HTMLElement} root Existing [data-hero-art] mount, hidden from assistive technology.
 * @returns {{update(progress:number, environment?:object):void, setPaused(boolean):void, destroy():void}}
 */
export function initializeHeroSculpture(root) {
  if (!root) throw new TypeError('initializeHeroSculpture requires a [data-hero-art] element');
  const originalChildren = [...root.childNodes];
  const priorClass = root.getAttribute('class');
  const priorStyle = root.getAttribute('style');
  const priorState = root.getAttribute('data-scroll-state');
  const priorAriaHidden = root.getAttribute('aria-hidden');
  let userPaused = false;
  let reduced = false;
  let visible = true;
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = createArtwork();

  function reflectPause() {
    root.classList.toggle('is-paused', userPaused || !visible || reduced);
    root.classList.toggle('is-static', reduced);
  }

  function update(progress = 0, environment = {}) {
    const p = Math.max(0, Math.min(1, Number(progress) || 0));
    reduced = Boolean(environment.reducedMotion);
    visible = environment.visible !== false;
    // The complete scroll excursion is intentionally legible: the sculpture lifts,
    // contracts, and opens around its central aperture as the hero leaves view.
    const viewportWidth = Number(environment.viewport?.width || environment.viewportWidth || 1000);
    const mobile = viewportWidth <= 700;
    const distance = mobile ? 19 : 34;
    root.style.setProperty('--hero-x', `${(p * distance).toFixed(1)}px`);
    root.style.setProperty('--hero-y', `${(-p * (mobile ? 30 : 54)).toFixed(1)}px`);
    root.style.setProperty('--hero-scale', (1 - p * (mobile ? .18 : .23)).toFixed(3));
    root.dataset.scrollState = p < .2 ? 'open' : p > .68 ? 'deep' : 'near';
    reflectPause();
  }

  function setPaused(value) {
    userPaused = Boolean(value);
    reflectPause();
  }

  function destroy() {
    root.replaceChildren(...originalChildren);
    if (priorClass === null) root.removeAttribute('class'); else root.setAttribute('class', priorClass);
    if (priorStyle === null) root.removeAttribute('style'); else root.setAttribute('style', priorStyle);
    if (priorState === null) root.removeAttribute('data-scroll-state'); else root.setAttribute('data-scroll-state', priorState);
    if (priorAriaHidden === null) root.removeAttribute('aria-hidden'); else root.setAttribute('aria-hidden', priorAriaHidden);
  }

  reflectPause(true);
  return { update, setPaused, destroy };
}
