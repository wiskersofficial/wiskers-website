const panel = document.querySelector('#problem-panel');

document.querySelector('.problem-trigger')?.addEventListener('click', () => {
  panel?.showModal();
  if (panel) panel.scrollTop = 0;
  document.body.classList.add('panel-open');
});

panel?.querySelectorAll('.problem-close, .problem-done').forEach(button => {
  button.addEventListener('click', () => panel.close());
});
panel?.addEventListener('close', () => document.body.classList.remove('panel-open'));

const answers = {
  compare: [
    'Compare around the job, not the feature list.',
    'Write down the decision you need to make, the constraints that matter, and what success would look like. Then use those criteria to compare each option.',
  ],
  justify: [
    'Build the case around the cost of standing still.',
    'Start with the problem your team already recognises. Agree on the outcome, map the costs and trade-offs, and make the next step small enough to test.',
  ],
  plan: [
    'Find the smallest question worth answering.',
    'Pick one audience and one decision. Build a useful first version, put it in front of real buyers, and let what they do guide the next iteration.',
  ],
};

document.querySelector('#buyer-question')?.addEventListener('change', event => {
  const answer = answers[event.target.value];
  if (!answer) return;
  const result = document.querySelector('#buyer-result');
  const heading = result?.querySelector('h3');
  const detail = result?.querySelector('p:last-child');
  if (heading) heading.textContent = answer[0];
  if (detail) detail.textContent = answer[1];
});
