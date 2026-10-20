import { mountExperience } from './experience.js';

/** Keep the same semantic markup in index.html for the no-script fallback. */
export const homeMarkup = String.raw`<div class="v6-home">
  <section class="v6-scene v6-hero" id="v6-home" aria-labelledby="v6-hero-title">
    <div class="v6-hero-copy">
      <h1 id="v6-hero-title"><span class="v6-hero-line" data-v6-hero-line data-glyph-wave>vibe-check</span> <span class="v6-hero-line v6-hero-line-last" data-v6-hero-line>your prospects</span></h1>
      <a class="v6-intro" href="#v6-thesis">Explore beyond the first click.<span aria-hidden="true">↘</span></a>
    </div>
    <span class="v6-hero-asterisk" aria-hidden="true">✳</span>
  </section>

  <section class="v6-scene v6-thesis" id="v6-thesis" aria-labelledby="v6-thesis-title">
    <canvas class="v6-ascii-field" data-v6-ascii aria-hidden="true"></canvas>
    <div class="v6-section-head"><h2 id="v6-thesis-title"><span class="v6-outline-word" data-v6-outline>See more</span><br>than a <span data-glyph-wave>click.</span></h2></div>
    <div class="v6-thesis-body">
      <p class="v6-lead v6-offer-line"><span class="v6-lead-context">Interactive experiences invite prospects to explore</span> <span class="v6-lead-subject">your <span class="v6-word-cuboid" data-v6-word-cuboid><span class="v6-cuboid-readable">business, products, services, and approach.</span><span class="v6-cuboid-stage" aria-hidden="true"><span class="v6-cuboid-rotor"><span class="v6-cuboid-face v6-cuboid-business"><span>business</span></span><span class="v6-cuboid-face v6-cuboid-products"><span>products</span></span><span class="v6-cuboid-face v6-cuboid-services"><span>services</span></span><span class="v6-cuboid-face v6-cuboid-approach"><span>approach</span></span></span></span></span></span></p>
      <p data-v6-warp>See what grabs prospects’ attention as they explore your business.</p>
      <p>Get to better-fit prospects sooner, then start the conversation knowing what caught their attention and where they need help.</p>
      <div class="v6-line-array" aria-hidden="true"><svg viewBox="0 0 600 150" preserveAspectRatio="none"><path class="v6-flow v6-flow-one" pathLength="1" d="M0 35 C150 35 150 75 300 75 S450 35 600 35"/><path class="v6-flow v6-flow-two" pathLength="1" d="M0 75 C150 75 150 75 300 75 S450 75 600 75"/><path class="v6-flow v6-flow-three" pathLength="1" d="M0 115 C150 115 150 75 300 75 S450 115 600 115"/><circle class="v6-flow-core" cx="300" cy="75" r="7"/></svg></div>
    </div>
  </section>

  <section class="v6-scene v6-examples" id="v6-examples" aria-labelledby="v6-examples-title">
    <div class="v6-examples-intro"><h2 id="v6-examples-title">Explore the experience,<br>see what <span data-glyph-wave>your team learns.</span></h2></div>
    <div class="v6-experience" data-experience>
      <div class="v6-prospect">
        <div class="v6-pane-heading"><span class="v6-status-dot" aria-hidden="true"></span><h3>Your view</h3><img class="v6-pane-mark brand-v2-dark" src="/assets/brand-v2/wiskers-v2-mark-dark.svg" width="28" height="28" alt=""><img class="v6-pane-mark brand-v2-light" src="/assets/brand-v2/wiskers-v2-mark-light.svg" width="28" height="28" alt=""></div>
        <nav class="v6-demo-nav" aria-label="Explore the Wiskers example"><a href="#experience-does">What it does</a><a href="#experience-how">How it works</a><a href="#experience-tailor">Ways to tailor it</a></nav>
        <div class="v6-prospect-page" tabindex="0" role="region" aria-label="Explore Wiskers" data-prospect-page>
          <section id="experience-does" data-experience-section="What it does" class="v6-demo-section">
            <p class="v6-demo-label">What it does</p><h4>Let your expertise<br><em>speak before you do.</em></h4>
            <p>Interactive experiences invite prospects to explore your business, products, services, and approach.</p>
            <div class="v6-offer-choices" role="group" aria-label="Explore an application">
              <button type="button" data-application="introduce" aria-pressed="true">Introduce a new offer <span aria-hidden="true">↗</span></button>
              <button type="button" data-application="explain" aria-pressed="false">Explain a complex offer <span aria-hidden="true">↗</span></button>
              <button type="button" data-application="compare" aria-pressed="false">Help prospects compare options <span aria-hidden="true">↗</span></button>
            </div>
            <div class="v6-offer-preview" data-offer-preview data-application-state="introduce" aria-live="polite" aria-atomic="true">
              <div class="v6-offer-art" aria-hidden="true"><i></i><i></i><i></i><span>✳</span></div>
              <h5 data-application-title>Introduce a new offer</h5><p data-application-copy>Give prospects a clear first look at what you offer, who it is for, and how it could fit their business.</p>
            </div>
          </section>
          <section id="experience-how" data-experience-section="How it works" class="v6-demo-section">
            <p class="v6-demo-label">How it works</p><h4>Explore beyond<br><em>the first click.</em></h4>
            <details data-experience-detail="The experience"><summary>The experience<span aria-hidden="true">+</span></summary><p>Explore an offer in any order. Open the details that matter, compare approaches, and choose what to explore next. There is no required path.</p></details>
            <details data-experience-detail="The team view"><summary>The team view<span aria-hidden="true">+</span></summary><p>See the details you opened, the approaches you compared, and the choices you made. The team can use those actions as context for a conversation, without treating a section view as a confirmed need.</p></details>
          </section>
          <section id="experience-tailor" data-experience-section="Ways to tailor it" class="v6-demo-section">
            <p class="v6-demo-label">Ways to tailor it</p><h4>What could this<br><em>look like for you?</em></h4>
            <p>Explore two illustrative ways to shape an experience around your offer.</p>
            <button class="v6-compare-toggle" type="button" aria-expanded="false" aria-controls="experience-comparison" data-compare-toggle>Compare approaches <span aria-hidden="true">↗</span></button>
            <div id="experience-comparison" class="v6-approach-comparison" hidden>
              <div><h5>A focused introduction</h5><p>One offer, a clear use case, and useful details to open.</p></div><div><h5>A deeper exploration</h5><p>Connected topics, options to compare, and a question about what matters most.</p></div>
            </div>
            <fieldset class="v6-approach-choices"><legend>Choose an approach</legend><label><input type="radio" name="experience-approach" value="focused"><span>A focused introduction</span></label><label><input type="radio" name="experience-approach" value="deeper"><span>A deeper exploration</span></label></fieldset>
            <div class="v6-tailored-preview" data-tailored-preview hidden aria-live="polite" aria-atomic="true"><span class="v6-tailored-icon" aria-hidden="true">↳</span><div><h5 data-tailored-title></h5><p data-tailored-copy></p></div></div>
            <fieldset class="v6-priority-choices"><legend>What matters most?</legend><label><input type="radio" name="experience-priority" value="Clarity of the offer"><span>Clarity of the offer</span></label><label><input type="radio" name="experience-priority" value="Better-fit prospects"><span>Better-fit prospects</span></label><label><input type="radio" name="experience-priority" value="Better conversations"><span>Better conversations</span></label></fieldset>
          </section>
        </div>
      </div>
      <aside class="v6-team" aria-labelledby="experience-team-title">
        <div class="v6-pane-heading"><span class="v6-status-dot v6-status-coral" aria-hidden="true"></span><h3 id="experience-team-title">What Wiskers learns</h3><button type="button" class="v6-reset" data-experience-reset>Reset demo</button></div>
        <div class="v6-team-content">
          <div class="v6-team-eye" aria-hidden="true"><svg viewBox="0 0 160 90"><path d="M8 45Q80-24 152 45Q80 114 8 45Z"/><circle cx="80" cy="45" r="24"/><circle class="v6-eye-pupil" cx="80" cy="45" r="8"/></svg></div>
          <p class="v6-demo-label">Your activity</p>
          <p class="v6-activity-empty" data-activity-empty>Your choices will appear here as you explore.</p>
          <ol class="v6-activity" data-activity aria-label="Your deliberate actions"></ol>
          <div class="v6-exposure"><p class="v6-demo-label">Sections viewed</p><ul data-exposure aria-label="Sections viewed"></ul></div>
          <div class="v6-conversation"><h4>Possible conversation angle</h4><p data-conversation>Make a choice in the experience to see what it could add to a conversation.</p></div>
          <p class="v6-activity-announcement glyph-wave__sr-only" role="status" aria-live="polite" aria-atomic="true" data-activity-announcement></p>
        </div>
      </aside>
    </div>
    <div class="v6-demo-takeaway"><p>Explore an offer in more depth.<br>Start conversations knowing what prospects chose to explore.</p><a class="v6-text-link" href="mailto:hello@wiskers.click">See how this could work for your business.<span aria-hidden="true">↗</span></a></div>
  </section>

  <section class="v6-scene v6-process" id="v6-process" aria-labelledby="v6-process-title">
    <canvas class="v6-ascii-field" data-v6-ascii aria-hidden="true"></canvas>
    <div class="v6-process-head"><div><p class="v6-overline">Illustrative applications</p><h2 id="v6-process-title">Where it <span data-glyph-wave>fits.</span></h2><p class="v6-process-intro">Interactive experiences can help prospects understand an offer before they meet your team. The experience can take different forms depending on what they need to explore.</p></div><div class="v6-hanging-note" data-v6-hanging-note aria-hidden="true"><span class="v6-hanging-thread"></span><span class="v6-hanging-card">✳</span></div></div>
    <div class="v6-process-steps">
      <article data-v6-process-stage><h3 data-glyph-wave>Introduce a new offer</h3><p>Give prospects a clear first look at what you offer, who it is for, and how it could fit their business.</p></article>
      <article data-v6-process-stage><h3 data-glyph-wave>Explain a complex offer</h3><p>Make a layered product, service, or approach easier to explore, so prospects can focus on what matters to their situation.</p></article>
      <article data-v6-process-stage><h3 data-glyph-wave>Help prospects compare options</h3><p>Show how different products, service levels, or approaches differ, and let prospects explore what each means for them.</p></article>
    </div>
  </section>

  <section class="v6-scene v6-contact" id="v6-contact" aria-labelledby="v6-contact-title">
    <div class="v6-contact-main" data-v6-trail-stage><div class="v6-image-trail" data-v6-image-trail aria-hidden="true"></div><h2 id="v6-contact-title">Let your expertise<br><span data-glyph-wave>speak before you do.</span></h2><p>Wiskers is the next evolution of B2B marketing, making your expertise part of the experience. Let prospects get to know your business before they meet your team.</p><a class="v6-text-link" href="mailto:hello@wiskers.click">See how this could work for your business.<span aria-hidden="true">↗</span></a></div>
    <footer class="v6-footer"><a href="#v6-home" aria-label="Wiskers, back to top"><img class="wordmark-logo" src="/assets/brand-v2/wiskers-v2-wordmark-dark.svg" alt="" width="760" height="184"></a><span>© 2026 Wiskers</span><a href="mailto:hello@wiskers.click">hello@wiskers.click</a><nav aria-label="Legal"><a href="/privacy/index.html">Privacy</a><a href="/terms/index.html">Website terms</a></nav></footer>
  </section>
</div>`;

export function mountHomeInteractions(root) {
  return mountExperience(root);
}
