import { initGlyphWaves } from '../home-v6/glyph-wave.js';

const root = document.querySelector('.v6-home');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---------- phone depth: a stack of thin layers gives the body its thickness when it turns ---------- */
function addLayers(phone) {
  const body = phone.querySelector('.ev-phone-body');
  for (let i = 9; i >= 1; i -= 1) {
    const layer = document.createElement('span');
    layer.className = 'ev-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.setProperty('--i', String(i));
    phone.insertBefore(layer, body);
  }
}
document.querySelectorAll('.ev-phone').forEach(addLayers);

/* ---------- a decorative code (not a real one) ---------- */
function drawQr(host) {
  const n = 21;
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const finder = (x, y) => {
    for (const [ox, oy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
      const dx = x - ox, dy = y - oy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
        const edge = dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        return edge || core ? 1 : 0;
      }
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) return 0;
    }
    return null;
  };
  let cells = '';
  for (let y = 0; y < n; y += 1) for (let x = 0; x < n; x += 1) {
    const f = finder(x, y);
    const on = f === null ? rnd() > 0.52 : f === 1;
    if (on) cells += `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`;
  }
  host.innerHTML = `<svg viewBox="0 0 ${n} ${n}" fill="#091540" shape-rendering="crispEdges" aria-hidden="true">${cells}</svg>`;
}

/* ---------- the three screens: one sticky phone on wide screens, one phone per step on narrow ones ---------- */
const screenHost = document.querySelector('[data-ev-steps-screen]');
const stageScreens = [];
for (let i = 1; i <= 3; i += 1) {
  const tpl = document.getElementById(`ev-screen-${i}`);
  if (!tpl) continue;
  const screen = tpl.content.firstElementChild.cloneNode(true);
  screenHost?.append(screen);
  stageScreens.push(screen);
  const shot = document.querySelector(`[data-ev-shot="${i}"]`);
  if (shot) {
    shot.innerHTML = '<div class="ev-phone ev-phone-flat"><span class="ev-phone-edge"></span><div class="ev-phone-body"><div class="ev-phone-screen"><span class="ev-island"></span></div></div></div>';
    const inline = tpl.content.firstElementChild.cloneNode(true);
    inline.classList.add('is-active');
    shot.querySelector('.ev-phone-screen').append(inline);
    addLayers(shot.querySelector('.ev-phone'));
  }
}
document.querySelectorAll('[data-ev-qr]').forEach(drawQr);

const steps = [...document.querySelectorAll('[data-ev-step]')];
let activeStep = -1;
function setStep(index) {
  if (index === activeStep) return;
  activeStep = index;
  steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
  stageScreens.forEach((screen, i) => screen.classList.toggle('is-active', i === index));
  const phone = document.querySelector('[data-ev-steps-phone]');
  if (phone && !reduced.matches) phone.style.setProperty('--ry', `${[-14, -4, -12][index] ?? -10}deg`);
}

/* ---------- hero phone: follows the pointer, can be dragged round, springs back ---------- */
const stage = document.querySelector('[data-ev-stage]');
const phone = document.querySelector('[data-ev-phone]');
const demo = document.querySelector('[data-ev-demo]');
const cue = document.querySelector('[data-ev-demo-cue]');
const BASE = matchMedia('(max-width: 900px)').matches ? -6 : -12;
let rx = 0, ry = BASE, tx = 0, ty = BASE, hoverX = 0, hoverY = 0, dragging = false, raf = 0, last = null;
let dragStart = null;
function loop(now) {
  raf = 0;
  const dt = last == null ? 16 : Math.min(48, now - last);
  last = now;
  const k = 1 - Math.pow(0.0015, dt / 1000);
  rx += (tx - rx) * k;
  ry += (ty - ry) * k;
  phone.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
  phone.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
  stage.style.setProperty('--px', hoverX.toFixed(3));
  stage.style.setProperty('--py', hoverY.toFixed(3));
  if (Math.abs(tx - rx) > 0.04 || Math.abs(ty - ry) > 0.04) raf = requestAnimationFrame(loop);
  else last = null;
}
const kick = () => { if (!raf && !reduced.matches) raf = requestAnimationFrame(loop); };

if (stage && phone) {
  phone.style.setProperty('--ry', `${BASE}deg`);
  stage.addEventListener('pointermove', (e) => {
    if (dragging || e.pointerType === 'touch') return;
    const r = stage.getBoundingClientRect();
    hoverX = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    hoverY = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    tx = hoverY * -6;
    ty = BASE + hoverX * 12;
    kick();
  });
  stage.addEventListener('pointerleave', () => { if (dragging) return; hoverX = 0; hoverY = 0; tx = 0; ty = BASE; kick(); });
  phone.addEventListener('pointerdown', (e) => {
    if (e.target.closest('[data-ev-demo-cue]') || phone.classList.contains('is-live') && e.target.closest('iframe')) return;
    dragging = true;
    dragStart = { x: e.clientX, y: e.clientY, ry: ty, rx: tx };
    phone.classList.add('is-dragging');
    phone.setPointerCapture(e.pointerId);
  });
  phone.addEventListener('pointermove', (e) => {
    if (!dragging || !dragStart) return;
    ty = clamp(dragStart.ry + (e.clientX - dragStart.x) * 0.45, -75, 75);
    tx = clamp(dragStart.rx - (e.clientY - dragStart.y) * 0.18, -22, 22);
    kick();
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    phone.classList.remove('is-dragging');
    try { phone.releasePointerCapture(e.pointerId); } catch {}
    tx = hoverY * -6; ty = BASE + hoverX * 12;
    kick();
  };
  phone.addEventListener('pointerup', endDrag);
  phone.addEventListener('pointercancel', endDrag);
  kick();

  /* the example experience loads once the page is idle, and only takes touches after "Tap to try it" */
  const loadDemo = () => { if (demo && !demo.getAttribute('src')) demo.setAttribute('src', demo.dataset.src); };
  if ('requestIdleCallback' in window) requestIdleCallback(loadDemo, { timeout: 2500 }); else setTimeout(loadDemo, 1200);
  cue?.addEventListener('click', () => {
    phone.classList.add('is-live');
    tx = 0; ty = 0; kick();
  });
  const endLive = () => { phone.classList.remove('is-live'); };
  document.addEventListener('pointerdown', (e) => { if (!phone.contains(e.target)) endLive(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') endLive(); });
}

/* ---------- scroll: glyph waves, step focus, progress ---------- */
const glyphs = initGlyphWaves(root);
const targets = [...root.querySelectorAll('[data-glyph-wave]')];
const heroGlyph = root.querySelector('[data-ev-hero-glyph]');
const signals = [...root.querySelectorAll('[data-ev-signal]')];
const bar = document.querySelector('[data-ev-progress]');
let ticking = false;

function update() {
  ticking = false;
  const vh = window.visualViewport?.height || window.innerHeight;
  const doc = document.documentElement;
  bar?.style.setProperty('--v6-page-progress', clamp(window.scrollY / Math.max(1, doc.scrollHeight - vh)).toFixed(4));
  for (const target of targets) {
    if (target === heroGlyph) continue;
    if (reduced.matches) { glyphs.update(target, 1); continue; }
    const rect = target.getBoundingClientRect();
    const travel = Math.max(1, Math.min(glyphs.getTravelDistance(target, 48), vh * 0.76 - Math.min(rect.height, vh * 0.25)));
    glyphs.update(target, clamp((vh * 0.9 - rect.top) / travel));
  }
  for (const signal of signals) {
    const target = signal.querySelector('[data-glyph-wave]');
    const rect = target.getBoundingClientRect();
    const travel = Math.max(1, Math.min(glyphs.getTravelDistance(target, 48), vh * 0.76));
    const p = reduced.matches ? 1 : clamp((vh * 0.9 - rect.top) / travel);
    signal.style.setProperty('--v6-stage-progress-percent', `${(p * 100).toFixed(1)}%`);
  }
  if (steps.length) {
    const wide = matchMedia('(min-width: 901px)').matches;
    if (wide) {
      const focal = vh * 0.5;
      let best = -1, bestDist = Infinity;
      steps.forEach((step, i) => {
        const r = step.getBoundingClientRect();
        const centre = r.top + r.height / 2;
        const inside = focal >= r.top && focal <= r.bottom;
        const dist = inside ? 0 : Math.abs(centre - focal);
        if (dist < bestDist) { best = i; bestDist = dist; }
      });
      setStep(best);
    } else {
      setStep(-1);
    }
  }
}
const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule, { passive: true });
document.fonts?.ready.then(schedule);
update();

/* the headline's last word turns to italic once, on arrival */
if (heroGlyph) {
  if (reduced.matches) glyphs.update(heroGlyph, 1);
  else {
    const start = performance.now() + 450;
    const run = (now) => {
      const p = clamp((now - start) / 1900);
      glyphs.update(heroGlyph, p);
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }
}

/* ---------- booking form ---------- */
const form = document.getElementById('ev-form');
const status = form?.querySelector('[data-ev-status]');
const submit = form?.querySelector('[data-ev-submit]');
function showStatus(kind, html) {
  if (!status) return;
  status.dataset.kind = kind;
  status.innerHTML = html;
  status.hidden = false;
}
function mailtoFor(data) {
  const body = `Who I am: ${data.who}\n\nWhat I'd like to do: ${data.want}`;
  return `mailto:hello@wiskers.click?subject=${encodeURIComponent('Events enquiry')}&body=${encodeURIComponent(body)}`;
}
const thanks = 'Thanks, that’s with us. We’ll be in touch soon.';
if (form) {
  const qs = new URLSearchParams(location.search);
  if (qs.get('sent') === '1') showStatus('ok', thanks);
  if (qs.get('error') === '1') showStatus('error', 'That didn’t send. Please email <a href="mailto:hello@wiskers.click">hello@wiskers.click</a> instead.');
  form.addEventListener('submit', async (event) => {
    const who = form.elements.who.value.trim();
    const want = form.elements.want.value.trim();
    form.elements.who.setAttribute('aria-invalid', String(!who));
    form.elements.want.setAttribute('aria-invalid', String(!want));
    if (!who || !want) {
      event.preventDefault();
      showStatus('error', 'Please answer both questions so we know who to reply to.');
      (who ? form.elements.want : form.elements.who).focus();
      return;
    }
    if (!window.fetch) return; // falls back to the plain form post
    event.preventDefault();
    submit.disabled = true;
    showStatus('ok', 'Sending…');
    try {
      const res = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error('send failed');
      showStatus('ok', thanks);
      form.reset();
    } catch {
      showStatus('error', `That didn’t send. <a href="${mailtoFor({ who, want })}">Email it to hello@wiskers.click instead</a>.`);
      submit.disabled = false;
    }
  });
}
