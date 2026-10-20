const allowedThemes = ['day', 'night', 'twilight'];
const root = document.documentElement;
const buttons = [...document.querySelectorAll('[data-theme-choice]')];
const themeSelect = document.querySelector('#theme-select');
const systemDark = matchMedia('(prefers-color-scheme: dark)');
let manualChoice = false;
try { manualChoice = allowedThemes.includes(localStorage.getItem('wiskers-theme')); } catch {}
export function currentTheme() { return allowedThemes.includes(root.dataset.theme) ? root.dataset.theme : 'day'; }
function applyTheme(theme, persist = false) {
 if (!allowedThemes.includes(theme)) return;
 root.dataset.theme = theme;
 buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
 if (themeSelect) themeSelect.value = theme;
 const pageColour = getComputedStyle(root).getPropertyValue('--v6-paper').trim();
 document.querySelector('meta[name="theme-color"]').content = pageColour || (theme === 'day' ? '#f3f0e9' : theme === 'night' ? '#000000' : '#160f24');
 if (persist) { manualChoice = true; try { localStorage.setItem('wiskers-theme', theme); } catch {} }
 window.dispatchEvent(new CustomEvent('wiskers:themechange', {detail: {theme}}));
}
buttons.forEach(button => button.addEventListener('click', () => applyTheme(button.dataset.themeChoice, true)));
themeSelect?.addEventListener('change', () => applyTheme(themeSelect.value, true));
systemDark.addEventListener('change', event => { if (!manualChoice) applyTheme(event.matches ? 'night' : 'day'); });
applyTheme(currentTheme());
