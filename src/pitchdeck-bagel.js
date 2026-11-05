// Slide 6: a real Bagel story playing inside the phone.
// The poster frame shows first; the live slice loads when someone points at the
// phone or picks a story, and only on screens wide enough to scroll it comfortably.
// Elsewhere the poster frame and a link stand in.
const ORIGIN = 'https://bagel.wiskers.click';

export function mountBagelPhone(root) {
  const screen = root.querySelector('.phone-screen'), frame = root.querySelector('.phone-live');
  const poster = root.querySelector('.phone-poster'), link = root.querySelector('[data-story-link]');
  const buttons = [...root.querySelectorAll('[data-slice]')];
  const wide = matchMedia('(min-width: 901px) and (hover: hover)');
  let current = buttons[0], armed = false, wanted = false;

  const fit = () => screen.style.setProperty('--k', String(screen.clientWidth / 390));
  new ResizeObserver(fit).observe(screen); fit();

  function load() {
    if (!armed || !wanted || !wide.matches) { screen.classList.remove('is-live'); frame.hidden = true; return; }
    screen.classList.remove('is-live');
    frame.hidden = false;
    frame.title = `Bagel story: ${current.dataset.title}`;
    frame.src = `${ORIGIN}/${current.dataset.slice}/?noframe`;
  }
  frame.addEventListener('load', () => { if (frame.src) screen.classList.add('is-live'); });

  function choose(button) {
    current = button; wanted = true;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    poster.src = `/pitchdeck-assets/bagel/${button.dataset.slice}.jpg`;
    poster.alt = `Bagel story: ${button.dataset.title}`;
    link.href = `${ORIGIN}/${button.dataset.slice}/`;
    load();
  }
  buttons.forEach(b => b.addEventListener('click', () => choose(b)));
  wide.addEventListener('change', load);
  root.querySelector('.phone').addEventListener('pointerenter', () => { if (!wanted) { wanted = true; load(); } });

  return {
    // Called once the Bagel slide comes close, so the deck opens without the extra page.
    arm() { if (armed) return; armed = true; load(); },
  };
}
