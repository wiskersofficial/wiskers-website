const PALETTE = ['navy', 'blue', 'green', 'coral', 'cream'];
const MOTIFS = [
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 3, 2, 1, 2, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const chapters = [
  ['00', 'Home', '#home'],
  ['01', 'Thesis', '#v5-thesis'],
  ['02', 'Examples', '#v5-exhibition'],
  ['03', 'Approach', '#v5-approach'],
  ['04', 'Business', '#v5-capabilities'],
  ['05', 'Contact', '#contact'],
];

/** Mounts the self-contained ambient field and transport controls. */
export function mountAmbient(root, { onPause, onResume, onReset, onMotionChange, motionEnabled = true } = {}) {
  if (!root) return { destroy() {} };
  const host = document.createElement('div');
  host.className = 'wa-ambient';
  host.innerHTML = `
    <div class="wa-ambient__fields" aria-hidden="true">
      <div class="wa-ambient__field wa-ambient__field--cover" data-ambient-field="0"><span class="wa-ambient__field-label">SIGNAL / 00</span><div class="wa-ambient__pixels"></div><span class="wa-ambient__field-mark">W</span></div>
      <div class="wa-ambient__field wa-ambient__field--thesis" data-ambient-field="1"><span class="wa-ambient__field-label">INPUT → INSIGHT</span><div class="wa-ambient__pixels"></div><span class="wa-ambient__field-mark">↗</span></div>
      <div class="wa-ambient__field wa-ambient__field--process" data-ambient-field="2"><span class="wa-ambient__field-label">IDEA → USE</span><div class="wa-ambient__pixels"></div><span class="wa-ambient__field-mark">04</span></div>
    </div>
    <section class="wa-ambient__transport" aria-label="Signal transport"><div class="wa-ambient__transport-eyebrow">FILE / VIEW / TOOLS</div><div class="wa-ambient__menu-bar" role="menubar" aria-label="Signal transport menu">
      <div class="wa-ambient__menu-wrap"><button type="button" role="menuitem" aria-haspopup="true" aria-expanded="false" aria-controls="wa-menu-file" data-menu-trigger="file">File</button><div class="wa-ambient__menu" id="wa-menu-file" role="menu" aria-label="File" hidden>${chapters.map(([, label, href]) => `<a role="menuitem" tabindex="-1" href="${href}">${label}</a>`).join('')}</div></div>
      <div class="wa-ambient__menu-wrap"><button type="button" role="menuitem" aria-haspopup="true" aria-expanded="false" aria-controls="wa-menu-view" data-menu-trigger="view">View</button><div class="wa-ambient__menu wa-ambient__menu--view" id="wa-menu-view" role="menu" aria-label="View" hidden><div class="wa-ambient__menu-theme"><span>COLOUR THEME</span><div data-theme-controls></div></div><button type="button" role="menuitem" tabindex="-1" data-ambient-toggle aria-pressed="false" aria-label="Pause ambient motion"><span aria-hidden="true">Ⅱ</span><span class="wa-ambient__button-label">Pause motion</span></button></div></div>
      <div class="wa-ambient__menu-wrap"><button type="button" role="menuitem" aria-haspopup="true" aria-expanded="false" aria-controls="wa-menu-tools" data-menu-trigger="tools">Tools</button><div class="wa-ambient__menu" id="wa-menu-tools" role="menu" aria-label="Tools" hidden><a role="menuitem" tabindex="-1" href="#v5-exhibition">Open examples</a><button type="button" role="menuitem" tabindex="-1" data-ambient-reset>Reset example</button></div></div>
    </div><div class="wa-ambient__transport-heading">AUTONOMOUS / SIGNAL TRANSPORT <b data-ambient-state>PLAYING</b></div><div class="wa-ambient__transport-buttons"><button type="button" data-ambient-toggle aria-pressed="false" aria-label="Pause ambient motion"><span aria-hidden="true">Ⅱ</span><span class="wa-ambient__button-label">Pause</span></button><button type="button" data-ambient-reset aria-label="Reset the ambient example"><span aria-hidden="true">↺</span><span class="wa-ambient__button-label">Reset example</span></button></div><span class="wa-ambient__transport-readout" data-ambient-readout>FIELD / 00.00</span></section>`;

  const themeSwitcher = document.querySelector('.theme-switcher');
  const themeControls = host.querySelector('[data-theme-controls]');
  const themeOriginParent = themeSwitcher?.parentNode;
  const themeOriginNext = themeSwitcher?.nextSibling;
  const themeButtonState = [...(themeSwitcher?.querySelectorAll('button[data-theme-choice]') || [])].map((button) => ({
    button,
    role: button.getAttribute('role'),
    tabIndex: button.getAttribute('tabindex'),
    checked: button.getAttribute('aria-checked'),
  }));
  const themeSwitcherRole = themeSwitcher?.getAttribute('role');
  const themeSwitcherLabel = themeSwitcher?.getAttribute('aria-label');
  if (themeSwitcher && themeControls) {
    themeControls.append(themeSwitcher);
    themeSwitcher.setAttribute('role', 'group');
    themeSwitcher.setAttribute('aria-label', 'Colour theme choices');
    themeSwitcher.querySelectorAll('button[data-theme-choice]').forEach((button) => {
      button.setAttribute('role', 'menuitemradio');
      button.tabIndex = -1;
      button.setAttribute('aria-checked', button.getAttribute('aria-pressed') === 'true' ? 'true' : 'false');
    });
  }

  const targets = [root.querySelector('.v5-hero'), root.querySelector('.v5-thesis'), root.querySelector('.v5-approach-stage')];
  const chapterTargets = chapters.map(([, , href]) => root.querySelector(href));
  const fields = [...host.querySelectorAll('[data-ambient-field]')];
  const chapterLinks = installHeaderNavigation(chapters);
  const station = host.querySelector('.wa-ambient__transport');
  const toggles = [...station.querySelectorAll('[data-ambient-toggle]')];
  const globalToggle = installGlobalToggle();
  if (globalToggle) toggles.push(globalToggle);
  const resetButtons = [...station.querySelectorAll('[data-ambient-reset]')];
  const themeChoices = [...station.querySelectorAll('[data-theme-choice]')];
  const menuTriggers = [...station.querySelectorAll('[data-menu-trigger]')];
  const menus = [...station.querySelectorAll('[role="menu"]')];
  const stateLabel = host.querySelector('[data-ambient-state]');
  const readout = host.querySelector('[data-ambient-readout]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const bodyWasPaused = document.body.classList.contains('wa-motion-paused');
  let paused = !motionEnabled || reduce.matches || bodyWasPaused;
  let elapsedOffset = 0;
  let active = -1;
  const visibleScenes = new Set();
  const visibleChapters = new Set();
  let timer = 0;
  let startedAt = performance.now();
  const pixels = fields.map((field, scene) => {
    const grid = field.querySelector('.wa-ambient__pixels');
    return Array.from({ length: 81 }, (_, i) => {
      const cell = document.createElement('i');
      const motif = MOTIFS[scene][i];
      cell.className = `wa-pixel wa-pixel--${PALETTE[motif]}`;
      cell.dataset.base = String(motif);
      grid.append(cell);
      return cell;
    });
  });
  targets.forEach((target, i) => { if (target) { target.classList.add('wa-ambient-target'); target.append(fields[i]); } });
  root.append(host);
  const business = root.querySelector('#v5-business') || root.querySelector('#v5-capabilities');
  business?.append(station);

  const setPaused = (value, notify = true) => {
    const wasPaused = paused;
    paused = reduce.matches || value;
    if (!wasPaused && paused) elapsedOffset += (performance.now() - startedAt) / 1000;
    if (wasPaused && !paused) startedAt = performance.now();
    host.classList.toggle('wa-is-paused', paused);
    document.body.classList.toggle('wa-motion-paused', paused);
    stateLabel.textContent = reduce.matches ? 'REDUCED' : paused ? 'PAUSED' : 'PLAYING';
    toggles.forEach((button) => {
      button.setAttribute('aria-pressed', String(paused));
      button.disabled = reduce.matches;
      button.setAttribute('aria-label', reduce.matches ? 'Ambient motion disabled by reduced motion preference' : paused ? 'Resume ambient motion' : 'Pause ambient motion');
      button.querySelector('.wa-ambient__button-label')?.replaceChildren(document.createTextNode(reduce.matches ? 'Motion off' : paused ? 'Resume motion' : 'Pause motion'));
      const icon = button.querySelector('[aria-hidden="true"]');
      if (icon) icon.textContent = paused ? '▶' : 'Ⅱ';
    });
    if (!paused) schedule();
    else if (timer) { clearTimeout(timer); timer = 0; }
    if (notify) {
      (paused ? onPause : onResume)?.();
      onMotionChange?.({ paused });
      document.dispatchEvent(new CustomEvent('wa:motionchange', { detail:{ paused } }));
      host.dispatchEvent(new CustomEvent('ambientmotionchange', { detail:{ paused } }));
    }
  };
  const render = (now) => {
    timer = 0;
    if (paused || active < 0) return;
    const elapsed = elapsedOffset + (now - startedAt) / 1000;
    const stage = active;
    pixels[stage].forEach((cell, i) => {
      const base = Number(cell.dataset.base);
      const wave = Math.sin(elapsed * 1.15 + i * .51 + stage * 1.8);
      const pulse = Math.cos(elapsed * .44 + Math.floor(i / 9) * .62);
      const value = base === 0 ? (wave > .89 ? (stage + i) % 4 + 1 : 0) : Math.max(0, Math.min(4, base + (wave > .72 ? 1 : wave < -.8 ? -1 : 0) + (pulse > .92 ? 1 : 0)));
      cell.className = `wa-pixel wa-pixel--${PALETTE[value]}`;
    });
    readout.textContent = `FIELD / ${String(stage).padStart(2, '0')}.${String(Math.floor(elapsed * 10) % 100).padStart(2, '0')}`;
    schedule();
  };
  const schedule = () => { if (!timer && !paused && active >= 0) timer = setTimeout(() => render(performance.now()), 100); };
  const setActive = (i) => {
    active = i;
    if (i < 0 && timer) { clearTimeout(timer); timer = 0; }
    host.dataset.scene = String(i);
    fields.forEach((field, n) => field.classList.toggle('is-current', n === i));
    schedule();
  };
  const setChapter = (i) => {
    chapterLinks.forEach((link, n) => { if (n === i) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  };
  const observers = [];
  targets.forEach((target, i) => {
    if (!target || typeof IntersectionObserver !== 'function') return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) visibleScenes.add(i);
      else visibleScenes.delete(i);
      const candidates = [...visibleScenes].sort((a, b) => a - b);
      setActive(candidates.length ? candidates[candidates.length - 1] : -1);
    }, { rootMargin: '-35% 0px -45% 0px', threshold: 0 });
    observer.observe(target); observers.push(observer);
  });
  chapterTargets.forEach((target, i) => {
    if (typeof IntersectionObserver !== 'function') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) visibleChapters.add(i);
      else visibleChapters.delete(i);
      const candidates = [...visibleChapters].sort((a, b) => {
        const ar = chapterTargets[a].getBoundingClientRect();
        const br = chapterTargets[b].getBoundingClientRect();
        return Math.abs(ar.top + ar.height / 2 - innerHeight / 2) - Math.abs(br.top + br.height / 2 - innerHeight / 2);
      });
      if (candidates.length) setChapter(candidates[0]);
    }, { rootMargin: '-35% 0px -45% 0px', threshold: 0 });
    observer.observe(target); observers.push(observer);
  });
  const onToggle = () => setPaused(!paused);
  const onResetClick = () => {
    elapsedOffset = 0; startedAt = performance.now();
    fields.forEach((field, i) => pixels[i].forEach((cell, n) => { const base = MOTIFS[i][n]; cell.className = `wa-pixel wa-pixel--${PALETTE[base]}`; }));
    readout.textContent = 'FIELD / 00.00';
    setActive(0);
    onReset?.();
  };
  let openMenu = '';
  const closeMenus = (returnFocus = false) => {
    menuTriggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
    menus.forEach((menu) => { menu.hidden = true; });
    const previous = openMenu;
    openMenu = '';
    if (returnFocus) menuTriggers.find((trigger) => trigger.dataset.menuTrigger === previous)?.focus();
  };
  const openMenuAt = (trigger, focusFirst = true) => {
    closeMenus();
    openMenu = trigger.dataset.menuTrigger;
    const menu = station.querySelector(`#wa-menu-${openMenu}`);
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    if (focusFirst) menu.querySelector('[role^="menuitem"]')?.focus();
  };
  const onMenuTrigger = (event) => {
    const trigger = event.currentTarget;
    if (trigger.getAttribute('aria-expanded') === 'true') closeMenus();
    else openMenuAt(trigger);
  };
  const onMenuKeydown = (event) => {
    if (event.key === 'Escape') { event.preventDefault(); closeMenus(true); return; }
    if (event.key === 'Tab') { closeMenus(); return; }
    const triggerIndex = menuTriggers.indexOf(event.target);
    if (triggerIndex >= 0 && ['ArrowDown','ArrowUp','Enter',' '].includes(event.key)) {
      event.preventDefault();
      openMenuAt(event.target, event.key !== 'ArrowUp');
      if (event.key === 'ArrowUp') {
        const items = [...station.querySelector(`#wa-menu-${event.target.dataset.menuTrigger}`).querySelectorAll('[role^="menuitem"]')];
        items.at(-1)?.focus();
      }
      return;
    }
    if (triggerIndex >= 0 && ['ArrowLeft','ArrowRight'].includes(event.key)) {
      event.preventDefault();
      menuTriggers[(triggerIndex + (event.key === 'ArrowRight' ? 1 : menuTriggers.length - 1)) % menuTriggers.length].focus();
      return;
    }
    const menu = event.target.closest('[role="menu"]');
    if (!menu) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const current = menuTriggers.find((trigger) => trigger.getAttribute('aria-expanded') === 'true');
      const currentIndex = menuTriggers.indexOf(current);
      const next = menuTriggers[(currentIndex + (event.key === 'ArrowRight' ? 1 : menuTriggers.length - 1)) % menuTriggers.length];
      openMenuAt(next);
      return;
    }
    const items = [...menu.querySelectorAll('[role^="menuitem"]')];
    const i = items.indexOf(event.target);
    if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (i + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
      items[next]?.focus();
    }
  };
  const onMenuSelect = (event) => {
    if (event.target.closest('[role="menu"] [role^="menuitem"]')) closeMenus();
    if (event.target.closest('[data-theme-choice]')) themeChoices.forEach((button) => button.setAttribute('aria-checked', button.getAttribute('aria-pressed') === 'true' ? 'true' : 'false'));
  };
  const onOutside = (event) => { if (!station.contains(event.target)) closeMenus(); };
  const onMotionPreferenceChange = () => setPaused(reduce.matches || !motionEnabled || bodyWasPaused);
  toggles.forEach((button) => button.addEventListener('click', onToggle));
  resetButtons.forEach((button) => button.addEventListener('click', onResetClick));
  menuTriggers.forEach((trigger) => trigger.addEventListener('click', onMenuTrigger));
  station.addEventListener('keydown', onMenuKeydown);
  station.addEventListener('click', onMenuSelect);
  document.addEventListener('pointerdown', onOutside);
  reduce.addEventListener?.('change', onMotionPreferenceChange);
  setPaused(paused, false);
  let fallbackRaf = 0;
  const fallbackUpdate = () => {
    fallbackRaf = 0;
    const center = innerHeight / 2;
    const candidates = chapterTargets.map((target, i) => ({ i, rect: target.getBoundingClientRect() })).filter(({ rect }) => rect.bottom > 0 && rect.top < innerHeight);
    if (candidates.length) {
      candidates.sort((a, b) => Math.abs(a.rect.top + a.rect.height / 2 - center) - Math.abs(b.rect.top + b.rect.height / 2 - center));
      setChapter(candidates[0].i);
    }
    const scene = targets.findIndex((target) => { const rect = target?.getBoundingClientRect(); return rect && rect.bottom > 0 && rect.top < innerHeight; });
    if (scene >= 0) setActive(scene);
    else setActive(-1);
  };
  const scheduleFallback = () => { if (!fallbackRaf) fallbackRaf = requestAnimationFrame(fallbackUpdate); };
  if (typeof IntersectionObserver !== 'function') {
    addEventListener('scroll', scheduleFallback, { passive:true });
    addEventListener('resize', scheduleFallback, { passive:true });
    scheduleFallback();
  }

  return { pause: () => setPaused(true), resume: () => setPaused(false), reset: onResetClick, get paused() { return paused; }, destroy() {
    observers.forEach((observer) => observer.disconnect());
    toggles.forEach((button) => button.removeEventListener('click', onToggle));
  resetButtons.forEach((button) => button.removeEventListener('click', onResetClick));
  menuTriggers.forEach((trigger) => trigger.removeEventListener('click', onMenuTrigger));
  station.removeEventListener('keydown', onMenuKeydown);
  station.removeEventListener('click', onMenuSelect);
  document.removeEventListener('pointerdown', onOutside);
    reduce.removeEventListener?.('change', onMotionPreferenceChange);
    if (fallbackRaf) cancelAnimationFrame(fallbackRaf);
    if (typeof IntersectionObserver !== 'function') {
      removeEventListener('scroll', scheduleFallback);
      removeEventListener('resize', scheduleFallback);
    }
    if (timer) clearTimeout(timer);
    targets.forEach((target) => target?.classList.remove('wa-ambient-target'));
    document.body.classList.toggle('wa-motion-paused', bodyWasPaused);
    if (themeOriginParent && themeSwitcher) themeOriginParent.insertBefore(themeSwitcher, themeOriginNext?.parentNode === themeOriginParent ? themeOriginNext : null);
    if (themeSwitcher) {
      if (themeSwitcherRole === null) themeSwitcher.removeAttribute('role'); else themeSwitcher.setAttribute('role', themeSwitcherRole);
      if (themeSwitcherLabel === null) themeSwitcher.removeAttribute('aria-label'); else themeSwitcher.setAttribute('aria-label', themeSwitcherLabel);
    }
    themeButtonState.forEach(({ button, role, tabIndex, checked }) => {
      if (role === null) button.removeAttribute('role'); else button.setAttribute('role', role);
      if (tabIndex === null) button.removeAttribute('tabindex'); else button.setAttribute('tabindex', tabIndex);
      if (checked === null) button.removeAttribute('aria-checked'); else button.setAttribute('aria-checked', checked);
    });
    host.remove();
    station.remove();
    globalToggle?.remove();
  } };
}

function installHeaderNavigation(items) {
  const nav = document.querySelector('.main-nav');
  if (!nav) return [];
  const links = [...nav.querySelectorAll('a')];
  const icons = ['⌂', '✳', '▦', '↗', '⌖', '→'];
  items.forEach(([, label, href], i) => {
    let link = links[i];
    if (!link) { link = document.createElement('a'); nav.append(link); links.push(link); }
    link.href = href;
    link.textContent = label;
    link.classList.add('wa-ambient-nav-link');
    link.dataset.ambientChapter = String(i);
    link.dataset.chapterIcon = icons[i];
    link.removeAttribute('aria-current');
    if (i === 0) link.setAttribute('aria-current', 'location');
  });
  links.slice(items.length).forEach((link) => link.remove());
  return links.slice(0, items.length);
}

function installGlobalToggle() {
  const tools = document.querySelector('.header-tools');
  if (!tools) return null;
  const button = document.createElement('button');
  button.className = 'wa-ambient-global-toggle';
  button.type = 'button';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', 'Pause ambient motion');
  button.innerHTML = '<span aria-hidden="true">Ⅱ</span><span class="wa-ambient__button-label">Pause motion</span>';
  tools.prepend(button);
  return button;
}
