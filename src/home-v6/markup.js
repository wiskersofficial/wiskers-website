/** Static markup for the v6 homepage. Keep this usable as an index.html fallback. */
export const homeMarkup = String.raw`<div class="v6-home">
  <section class="v6-scene v6-hero" id="v6-home" aria-labelledby="v6-hero-title">
    <div class="v6-hero-copy">
      <h1 id="v6-hero-title"><span class="v6-hero-line" data-v6-hero-line>Find your</span><span class="v6-hero-line v6-hero-line-last" data-v6-hero-line data-glyph-wave data-glyph-stagger="0.18">next client.</span></h1>
      <p class="v6-intro">The next evolution of hyper-targeted digital marketing. We help you hone in on your next B2B client without wasting hours working down a list.</p>
      <a class="v6-text-link" href="#v6-examples">See how it works <span aria-hidden="true">↓</span></a>
    </div>
    <span class="v6-hero-asterisk" data-v6-asterisk aria-hidden="true">✳</span>
  </section>

  <section class="v6-scene v6-thesis" id="v6-thesis" aria-labelledby="v6-thesis-title">
    <div class="v6-section-head">
      <p class="v6-overline">A different way in</p>
      <h2 id="v6-thesis-title"><span class="v6-outline-word" data-v6-outline>Insight</span> takes<br><span data-glyph-wave data-glyph-stagger="0.24">input.</span></h2>
    </div>
    <div class="v6-thesis-body">
      <p class="v6-wrap-copy"><span class="v6-wrap-orbit" aria-hidden="true"><span>W</span></span>We turn your expertise into useful tools that help buyers find their own answer.</p>
      <div class="v6-line-array" role="img" aria-label="A buyer's question and context flow through your expertise to a useful answer">
        <div class="v6-array-ends"><span>Question<br><small>+ context</small></span><span>Useful<br><small>answer</small></span></div>
        <canvas class="v6-ascii-field" data-v6-ascii aria-hidden="true"></canvas>
        <svg viewBox="0 0 600 150" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="v6-water-ripple" x="-8%" y="-25%" width="116%" height="150%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="1" seed="8" result="water-noise"/><feDisplacementMap data-v6-water-map in="SourceGraphic" in2="water-noise" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></defs><path class="v6-flow v6-flow-one" pathLength="1" d="M0 35 C150 35 150 75 300 75 S450 35 600 35"/><path class="v6-flow v6-flow-two" data-v6-trail-path pathLength="1" d="M0 75 C150 75 150 75 300 75 S450 75 600 75"/><path class="v6-flow v6-flow-three" pathLength="1" d="M0 115 C150 115 150 75 300 75 S450 115 600 115"/><circle class="v6-flow-core" cx="300" cy="75" r="7"/><g class="v6-flow-trail" data-v6-trail="0"><path d="M-4 0H4M0-4V4"/></g><g class="v6-flow-trail" data-v6-trail="1"><path d="M-3 0H3M0-3V3"/></g><g class="v6-flow-trail" data-v6-trail="2"><path d="M-2 0H2M0-2V2"/></g></svg>
        <span class="v6-array-core">Your expertise</span>
      </div>
    </div>
  </section>

  <section class="v6-scene v6-examples" id="v6-examples" aria-labelledby="v6-examples-title">
    <div class="v6-examples-intro"><p class="v6-overline">Useful by design</p><h2 id="v6-examples-title">Make the answer<br><em>the experience.</em></h2></div>
    <div class="v6-example-list" data-v6-spiral-gallery>
      <svg class="v6-spiral-route" viewBox="0 0 52 900" preserveAspectRatio="none" aria-hidden="true"><path data-v6-spiral-path pathLength="1" d="M26 0 C26 80 4 78 4 150 C4 220 48 220 48 300 C48 375 4 382 4 455 C4 530 48 540 48 615 C48 690 4 700 4 775 C4 850 26 840 26 900"/></svg>
      <article class="v6-example" aria-labelledby="v6-calculate-title">
        <div class="v6-example-title"><div><h3 id="v6-calculate-title" data-glyph-wave data-glyph-stagger="0.3">Calculate.</h3><p>Turn a number into a clearer picture.</p></div></div>
        <form class="v6-calc" data-v6-calc>
          <label>Amount <span><span aria-hidden="true">£</span><input name="amount" type="number" inputmode="decimal" min="0" step="100" value="1200" aria-label="Amount in pounds"></span></label>
          <span class="v6-times" aria-hidden="true">×</span>
          <label>Months <span><input name="months" type="number" inputmode="numeric" min="0" max="120" step="1" value="6" aria-label="Number of months"></span></label>
          <output data-v6-calc-output aria-live="polite">£7,200</output>
        </form>
      </article>
      <article class="v6-example" aria-labelledby="v6-diagnose-title">
        <div class="v6-example-title"><div><h3 id="v6-diagnose-title" data-glyph-wave data-glyph-stagger="0.3">Diagnose.</h3><p>Find the next step that fits.</p></div></div>
        <form class="v6-diagnose" data-v6-diagnose>
          <fieldset data-v6-diagnose-step="1"><legend><span>01</span> What needs attention?</legend><div class="v6-choice-row"><label><input type="radio" name="focus" value="reach" checked><span>Reach</span></label><label><input type="radio" name="focus" value="conversion"><span>Conversion</span></label><label><input type="radio" name="focus" value="clarity"><span>Clarity</span></label></div></fieldset>
          <fieldset data-v6-diagnose-step="2"><legend><span>02</span> What feels hardest?</legend><div class="v6-choice-row"><label><input type="radio" name="friction" value="time" checked><span>Finding time</span></label><label><input type="radio" name="friction" value="signal"><span>Finding signal</span></label></div></fieldset>
          <p class="v6-diagnose-result" data-v6-diagnose-result aria-live="polite">Start by testing one focused tool with a small, well-matched audience.</p>
        </form>
      </article>
      <article class="v6-example" aria-labelledby="v6-compare-title">
        <div class="v6-example-title"><div><h3 id="v6-compare-title" data-glyph-wave data-glyph-stagger="0.3">Compare.</h3><p>Choose what matters to your decision.</p></div></div>
        <fieldset class="v6-compare" data-v6-compare><legend>Choose up to three criteria</legend><div class="v6-choice-row v6-compare-grid"><label><input type="checkbox" value="fit" checked><span>Audience fit</span></label><label><input type="checkbox" value="effort" checked><span>Build effort</span></label><label><input type="checkbox" value="learning" checked><span>What you learn</span></label><label><input type="checkbox" value="reach"><span>Reach</span></label><label><input type="checkbox" value="speed"><span>Speed to launch</span></label></div><p data-v6-compare-count aria-live="polite">3 of 3 selected</p></fieldset>
      </article>
    </div>
  </section>

  <section class="v6-scene v6-process" id="v6-process" aria-labelledby="v6-process-title">
    <div class="v6-process-head"><p class="v6-overline">From question to conversation</p><h2 id="v6-process-title">A better conversation<br><span data-glyph-wave data-glyph-stagger="0.24">starts here.</span></h2><div class="v6-hanging-note" data-v6-hanging-note aria-hidden="true"><span class="v6-hanging-thread"></span><span class="v6-hanging-card"><i></i><b>Buyer signal</b></span></div></div>
    <div class="v6-process-steps">
      <article><h3 data-glyph-wave data-glyph-stagger="0.18">QUESTION</h3><p>Start with the decision your buyer needs to make.</p></article>
      <article><h3 data-glyph-wave data-glyph-stagger="0.18">TOOL</h3><p>Shape your expertise into a useful self-serve answer.</p></article>
      <article><h3 data-glyph-wave data-glyph-stagger="0.18">CONVERSATION</h3><p>Meet buyers with context when they are ready.</p></article>
    </div>
  </section>

  <section class="v6-scene v6-contact" id="v6-contact" aria-labelledby="v6-contact-title">
    <div class="v6-contact-main"><p class="v6-overline">For ambitious B2B teams</p><h2 id="v6-contact-title">Let’s make<br><span data-glyph-wave data-glyph-stagger="0.24">something useful.</span></h2><a class="v6-email-link" href="mailto:hello@wiskers.click">hello@wiskers.click <span aria-hidden="true">↗</span></a></div>
    <div class="v6-buyer-question"><span class="v6-overline">Start with a question</span><p>What are your buyers trying to figure out?</p><a href="mailto:hello@wiskers.click?subject=What%20my%20buyers%20need%20to%20figure%20out">Tell us about it <span aria-hidden="true">↗</span></a></div>
    <footer class="v6-footer"><a href="#v6-home" aria-label="Wiskers, back to top">wiskers<span aria-hidden="true">.</span></a><span>© 2026 Wiskers</span><nav aria-label="Legal"><a href="/privacy/index.html">Privacy</a><a href="/terms/index.html">Website terms</a></nav></footer>
  </section>
</div>`;

/** Attach small, local interactions to an already-rendered v6 main element. */
export function mountHomeInteractions(root) {
  if (!root) return () => {};
  const cleanups = [];
  const listen = (node, event, handler) => {
    node.addEventListener(event, handler);
    cleanups.push(() => node.removeEventListener(event, handler));
  };

  root.querySelectorAll('[data-v6-calc]').forEach((form) => {
    const amount = form.elements.amount;
    const months = form.elements.months;
    const output = form.querySelector('[data-v6-calc-output]');
    const update = () => {
      const total = Math.max(0, Number(amount.value) || 0) * Math.max(0, Number(months.value) || 0);
      output.value = `£${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(total)}`;
      output.textContent = output.value;
    };
    listen(form, 'input', update);
    update();
  });

  root.querySelectorAll('[data-v6-diagnose]').forEach((form) => {
    const result = form.querySelector('[data-v6-diagnose-result]');
    const responses = {
      reach: { time: 'Start by testing one focused tool with a small, well-matched audience.', signal: 'Give a specific audience one useful question to answer, then learn from the choices they make.' },
      conversion: { time: 'Make one high-intent page more useful with a tool that helps buyers weigh their options.', signal: 'Compare the questions visitors ask with the decision your tool could help them make.' },
      clarity: { time: 'Turn one recurring buyer question into a simple, guided answer.', signal: 'Map the questions buyers ask to the information they need for a confident next step.' },
    };
    const update = () => {
      const focus = form.elements.focus.value;
      const friction = form.elements.friction.value;
      result.textContent = responses[focus][friction];
    };
    listen(form, 'change', update);
  });

  root.querySelectorAll('[data-v6-compare]').forEach((group) => {
    const boxes = [...group.querySelectorAll('input[type="checkbox"]')];
    const count = group.querySelector('[data-v6-compare-count]');
    const update = (changed) => {
      const selected = boxes.filter((box) => box.checked);
      if (selected.length > 3 && changed) changed.checked = false;
      const total = boxes.filter((box) => box.checked).length;
      count.textContent = `${total} of 3 selected`;
      boxes.forEach((box) => { box.disabled = total >= 3 && !box.checked; });
    };
    listen(group, 'change', (event) => update(event.target.matches('input[type="checkbox"]') ? event.target : null));
    update();
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
