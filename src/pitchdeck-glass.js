import {mount as mountGlass} from './vendor/molten-glass/index.js';

// Molten-glass tiles (vendored primitive, see vendor/SOURCES.md).
// Each lens refracts a viewport-sized backdrop painted to match what sits behind
// the tiles on that slide: its colour, its glows, or (slide 5) the founders photo.
// Every lens is a WebGL context and browsers cap those, so lenses are only kept
// on the active slide and its neighbours. Without WebGL the CSS glass finish stays.
const LIGHT = new Set(['paper', 'mist', 'sage', 'blush']);
const PHOTO = '/pitchdeck-assets/founders-josh-imran.jpg';

const photo = new Image();
photo.src = PHOTO;
const photoReady = photo.decode().catch(() => null);

function options(slide, backdrop) {
  const light = LIGHT.has(slide.dataset.theme);
  return light
    ? {background: backdrop, twist: .32, refraction: .34, edgeExponent: 6, specular: .5, chromaticAberration: .32, tint: '#f4f6fb', tintStrength: .16, canvasBlur: 0, dpr: 1.5}
    : {background: backdrop, twist: .22, refraction: .38, edgeExponent: 5, specular: .55, chromaticAberration: .22, tint: '#091540', tintStrength: .3, canvasBlur: 1.5, dpr: 1.5};
}

/** Paint the slide's backdrop at viewport size, as it looks when the slide fills the screen. */
function paintBackdrop(slide) {
  const w = Math.max(1, innerWidth), h = Math.max(1, innerHeight);
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const sr = slide.getBoundingClientRect();
  ctx.fillStyle = getComputedStyle(slide).backgroundColor; ctx.fillRect(0, 0, w, h);

  if (slide.id === 'slide-5' && photo.naturalWidth) {
    // Blurred fill: draw tiny, scale up (a cheap blur that works in every browser).
    const small = document.createElement('canvas'); small.width = 48; small.height = 36;
    small.getContext('2d').drawImage(photo, 0, 0, 48, 36);
    const cover = Math.max(w / 48, h / 36);
    ctx.imageSmoothingEnabled = true; ctx.globalAlpha = .55;
    ctx.drawImage(small, (w - 48 * cover) / 2, (h - 36 * cover) / 2, 48 * cover, 36 * cover);
    ctx.globalAlpha = 1;
    const sharp = slide.querySelector('.team-photo-sharp').getBoundingClientRect();
    ctx.drawImage(photo, sharp.left, sharp.top - sr.top, sharp.width, sharp.height);
    ctx.fillStyle = 'rgba(9, 21, 64, .3)'; ctx.fillRect(0, 0, w, h);
    return canvas;
  }
  for (const orb of slide.querySelectorAll('.ambient i')) {
    const r = orb.getBoundingClientRect(), color = getComputedStyle(orb).getPropertyValue('--orb').trim();
    const cx = r.left + r.width / 2, cy = r.top - sr.top + r.height / 2, rad = r.width / 2;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.globalAlpha = .9; ctx.fillStyle = g; ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  }
  ctx.globalAlpha = 1;
  return canvas;
}

export function mountGlassTiles(slides) {
  const groups = slides.map(slide => ({slide, tiles: [...slide.querySelectorAll('[data-glass]')], lenses: [], backdrop: null}))
    .filter(g => g.tiles.length);
  let wanted = new Set(), disabled = false;

  function mountGroup(g) {
    if (g.lenses.length || disabled) return;
    g.backdrop = paintBackdrop(g.slide);
    for (const tile of g.tiles) {
      try { g.lenses.push(mountGlass(tile, options(g.slide, g.backdrop))); tile.classList.add('has-glass'); }
      catch (error) { console.warn('Glass tile fallback', error); disabled = true; break; }
    }
  }
  function unmountGroup(g) {
    g.lenses.forEach(l => l.destroy()); g.lenses = [];
    g.tiles.forEach(t => t.classList.remove('has-glass'));
  }
  function refresh() {
    for (const g of groups) if (g.lenses.length) { g.backdrop = paintBackdrop(g.slide); g.lenses.forEach(l => l.setBackground(g.backdrop)); }
  }
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(refresh, 200); }, {passive: true});
  photoReady.then(refresh);
  document.fonts?.ready.then(refresh);

  return {
    /** Keep lenses on the active slide and its neighbours only. */
    focus(active) {
      const i = slides.indexOf(active);
      wanted = new Set(slides.filter((_, j) => Math.abs(j - i) <= 1));
      for (const g of groups) wanted.has(g.slide) ? mountGroup(g) : unmountGroup(g);
    },
    /** Print and PDF use the CSS glass finish. */
    release() { groups.forEach(unmountGroup); },
  };
}
