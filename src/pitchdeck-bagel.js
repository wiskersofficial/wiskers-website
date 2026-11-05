// Slide 6: a live Wiskers story in the phone, scrolling on its own.
// Stories are served from this site, so the deck can drive their scroll position.
// They loop while the slide is on screen; scrolling the phone takes over for a moment.
// With reduced motion (or paused motion) the poster frame stays instead.
const SPEED = 0.36;      // screen heights per second
const HOLD_END = 2600;   // ms to rest on the last frame before looping
const HOLD_START = 900;  // ms to rest on the first frame
const IDLE = 5000;       // ms after a viewer scrolls before autoscroll resumes

export function mountBagelPhone(root) {
  const screen = root.querySelector('.phone-screen'), frame = root.querySelector('.phone-live');
  const poster = root.querySelector('.phone-poster'), buttons = [...root.querySelectorAll('[data-story]')];
  let current = buttons[0], armed = false, active = false, still = false;
  let raf = 0, last = 0, pos = 0, holdUntil = 0, userUntil = 0, scroller = null;

  const fit = () => screen.style.setProperty('--k', String(screen.clientWidth / 390));
  new ResizeObserver(fit).observe(screen); fit();

  function findScroller() {
    const doc = frame.contentDocument;
    if (!doc) return null;
    const sel = current.dataset.scroller;
    return sel ? doc.querySelector(sel) : doc.scrollingElement;
  }
  function load() {
    stop(); screen.classList.remove('is-live'); scroller = null;
    if (!armed || still) { frame.hidden = true; frame.removeAttribute('src'); return; }
    frame.hidden = false; frame.title = `Story: ${current.dataset.title}`;
    frame.src = current.dataset.story;
  }
  frame.addEventListener('load', () => {
    if (!frame.getAttribute('src')) return;
    const win = frame.contentWindow;
    const takeOver = () => { userUntil = performance.now() + IDLE; };
    for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) win.addEventListener(type, takeOver, {passive: true});
    // Give 3D scenes a moment to draw before swapping out the poster.
    setTimeout(() => {
      scroller = findScroller(); if (!scroller) return;
      scroller.scrollTop = 0; pos = 0; holdUntil = performance.now() + HOLD_START;
      screen.classList.add('is-live'); start();
    }, 700);
  });

  function tick(now) {
    raf = 0; if (!active || still || !scroller) return;
    const dt = last ? Math.min(now - last, 64) : 0; last = now;
    const max = scroller.scrollHeight - scroller.clientHeight;
    if (now < userUntil) pos = scroller.scrollTop;              // viewer is in control
    else if (now >= holdUntil) {
      if (pos >= max - 1) { pos = 0; scroller.scrollTop = 0; holdUntil = now + HOLD_START; }
      else {
        pos = Math.min(max, pos + dt / 1000 * SPEED * scroller.clientHeight);
        scroller.scrollTop = pos;
        if (pos >= max - 1) holdUntil = now + HOLD_END;
      }
    }
    raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf && active && !still && scroller) { last = 0; raf = requestAnimationFrame(tick); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  function choose(button) {
    current = button;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    poster.src = `/pitchdeck-assets/bagel/${button.dataset.still}.jpg`;
    poster.alt = `Story frame: ${button.dataset.title}`;
    load();
  }
  buttons.forEach(b => b.addEventListener('click', () => choose(b)));

  return {
    arm() { if (armed) return; armed = true; load(); },
    activate(on) { active = on; on ? start() : stop(); },
    setReduced(value) { if (value === still) return; still = value; load(); },
  };
}
