import './homepage-v3-motion.js';
import './homepage-v3-demo.js';

const panel = document.querySelector('#problem-panel');

document.querySelectorAll('.problem-trigger').forEach((button) => {
  button.addEventListener('click', () => {
    if (!panel || panel.open) return;
    panel.showModal();
    panel.scrollTop = 0;
    document.body.classList.add('panel-open');
  });
});

panel?.querySelectorAll('.problem-close, .problem-done').forEach((button) => {
  button.addEventListener('click', () => panel.close());
});

panel?.addEventListener('close', () => document.body.classList.remove('panel-open'));

