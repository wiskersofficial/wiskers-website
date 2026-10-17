const choices = [
  { key: 'compare', label: 'Compare my options', code: '01 / COMPARE', title: 'What changes between my options?', detail: 'Line up the trade offs that matter to you: cost, effort, risk, and what you get back.' },
  { key: 'case', label: 'Make the case', code: '02 / EXPLAIN', title: 'How do I explain why this matters?', detail: 'Find the clearest evidence, the people it affects, and the next decision to make.' },
  { key: 'start', label: 'Find a starting point', code: '03 / BEGIN', title: 'What is the smallest useful first step?', detail: 'Turn a broad goal into one question you can answer and one action you can take.' },
];

/** Mounts the interactive Wiskers question keypad into the supplied element. */
export function mountKeypad(root) {
  if (!root || typeof root.append !== 'function') throw new TypeError('mountKeypad requires a DOM mount element.');
  const section = document.createElement('section');
  section.className = 'v5-keypad';
  section.setAttribute('aria-labelledby', 'v5-keypad-heading');
  section.innerHTML = `
    <div class="v5-keypad__intro">
      <p class="v5-keypad__eyebrow"><span aria-hidden="true"></span> A clearer question starts here</p>
      <h2 id="v5-keypad-heading">Press for a way in.</h2>
      <p class="v5-keypad__lede">Choose the question closest to yours.</p>
    </div>
    <div class="v5-keypad__instrument">
      <div class="v5-keypad__topline"><span>WISKERS / FIELD DEVICE</span><span>Q—01&nbsp;&nbsp; • &nbsp;&nbsp;LIVE</span></div>
      <div class="v5-keypad__aperture" aria-live="polite" aria-atomic="true">
        <span class="v5-keypad__readout-code">${choices[0].code}</span>
        <h3 class="v5-keypad__question">${choices[0].title}</h3>
        <p class="v5-keypad__answer">${choices[0].detail}</p>
        <span class="v5-keypad__aperture-mark" aria-hidden="true">↗</span>
      </div>
      <div class="v5-keypad__keys" role="group" aria-label="Choose the kind of help you need">
        ${choices.map((choice, i) => `<button class="v5-keypad__key${i === 0 ? ' is-selected' : ''}" type="button" data-key="${choice.key}" aria-pressed="${i === 0}" aria-controls="v5-keypad-preview"><span class="v5-keypad__key-cap"><span class="v5-keypad__key-index">0${i + 1}</span><span class="v5-keypad__key-glyph" aria-hidden="true">${['↔', '✳', '＋'][i]}</span></span><span class="v5-keypad__key-label">${choice.label}</span><span class="v5-keypad__key-side" aria-hidden="true"></span></button>`).join('')}
      </div>
      <div class="v5-keypad__base"><span>INPUT</span><span class="v5-keypad__base-line"></span><span>CONTEXT&nbsp; → &nbsp;CLARITY</span></div>
    </div>
    `;
  const aperture = section.querySelector('.v5-keypad__aperture');
  aperture.id = 'v5-keypad-preview';
  const question = section.querySelector('.v5-keypad__question');
  const answer = section.querySelector('.v5-keypad__answer');
  const code = section.querySelector('.v5-keypad__readout-code');
  const buttons = [...section.querySelectorAll('.v5-keypad__key')];
  const onClick = (event) => {
    const button = event.currentTarget;
    const choice = choices.find((item) => item.key === button.dataset.key);
    if (!choice) return;
    buttons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-selected', active);
      item.setAttribute('aria-pressed', String(active));
    });
    code.textContent = choice.code;
    question.textContent = choice.title;
    answer.textContent = choice.detail;
  };
  buttons.forEach((button) => button.addEventListener('click', onClick));
  root.append(section);
  return { destroy() { buttons.forEach((button) => button.removeEventListener('click', onClick)); section.remove(); } };
}
