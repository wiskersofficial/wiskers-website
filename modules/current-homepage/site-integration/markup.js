import { leadMomentMarkup, mountLeadMoment } from './lead-moment.js';

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
    <div class="v6-section-head"><h2 id="v6-thesis-title"><span class="v6-outline-word" data-v6-outline>See more</span><br>than a <span data-glyph-wave>click.</span></h2>
      <p class="v6-thesis-attention" data-v6-warp>See what grabs prospects’ attention as they explore your business.</p>
    </div>
    <div class="v6-thesis-body">
      <p class="v6-lead v6-offer-line"><span class="v6-lead-context" data-v6-warp>Interactive experiences invite prospects to explore</span> <span class="v6-lead-subject">your <span class="v6-word-cuboid" data-v6-word-cuboid><span class="v6-cuboid-readable">business, products, services, and approach.</span><span class="v6-cuboid-stage" aria-hidden="true"><span class="v6-cuboid-rotor"><span class="v6-cuboid-face v6-cuboid-business"><span>business</span></span><span class="v6-cuboid-face v6-cuboid-products"><span>products</span></span><span class="v6-cuboid-face v6-cuboid-services"><span>services</span></span><span class="v6-cuboid-face v6-cuboid-approach"><span>approach</span></span></span></span></span></span></p>
      <p data-v6-warp>Get to better-fit prospects sooner, then start the conversation knowing what caught their attention and where they need help.</p>
    </div>
  </section>

  <section class="v6-scene v6-examples" id="v6-examples" aria-labelledby="v6-examples-title">
    <div class="v6-examples-intro"><h2 id="v6-examples-title">Explore the experience,<br>see what <span data-glyph-wave>your team learns.</span></h2></div>
    ${leadMomentMarkup}
    <div class="v6-demo-takeaway"><p data-v6-warp>Explore an offer in more depth.<br>Start conversations knowing what prospects chose to explore.</p><a class="v6-text-link" href="mailto:hello@wiskers.click">See how this could work for your business.<span aria-hidden="true">↗</span></a></div>
  </section>

  <section class="v6-scene v6-process" id="v6-process" aria-labelledby="v6-process-title">
    <canvas class="v6-ascii-field" data-v6-ascii aria-hidden="true"></canvas>
    <div class="v6-process-head"><div><p class="v6-overline">Illustrative applications</p><h2 id="v6-process-title">Where it <span data-glyph-wave>fits.</span></h2><p class="v6-process-intro" data-v6-warp>Interactive experiences can help prospects understand an offer before they meet your team. The experience can take different forms depending on what they need to explore.</p></div><div class="v6-hanging-note" data-v6-hanging-note aria-hidden="true"><span class="v6-hanging-thread"></span><span class="v6-hanging-card">✳</span></div></div>
    <div class="v6-process-steps">
      <article data-v6-process-stage><h3 data-glyph-wave>Introduce a new offer</h3><p data-v6-warp>Give prospects a clear first look at what you offer, who it is for, and how it could fit their business.</p></article>
      <article data-v6-process-stage><h3 data-glyph-wave>Explain a complex offer</h3><p data-v6-warp>Make a layered product, service, or approach easier to explore, so prospects can focus on what matters to their situation.</p></article>
      <article data-v6-process-stage><h3 data-glyph-wave>Help prospects compare options</h3><p data-v6-warp>Show how different products, service levels, or approaches differ, and let prospects explore what each means for them.</p></article>
    </div>
  </section>

  <section class="v6-scene v6-contact" id="v6-contact" aria-labelledby="v6-contact-title">
    <div class="v6-contact-main" data-v6-trail-stage><div class="v6-image-trail" data-v6-image-trail aria-hidden="true"></div><h2 id="v6-contact-title">Let your expertise<br><span data-glyph-wave>speak before you do.</span></h2><p data-v6-warp>Wiskers is the next evolution of B2B marketing, making your expertise part of the experience. Let prospects get to know your business before they meet your team.</p><a class="v6-text-link" href="mailto:hello@wiskers.click">See how this could work for your business.<span aria-hidden="true">↗</span></a></div>
    <footer class="v6-footer"><a href="#v6-home" aria-label="Wiskers, back to top"><img class="wordmark-logo" src="/assets/brand-v2/wiskers-v2-wordmark-dark.svg" alt="" width="760" height="184"></a><span>© 2026 Wiskers</span><a href="mailto:hello@wiskers.click">hello@wiskers.click</a><nav aria-label="Legal"><a href="/privacy/index.html">Privacy</a><a href="/terms/index.html">Website terms</a></nav></footer>
  </section>
</div>`;

export function mountHomeInteractions(root) {
  return mountLeadMoment(root);
}
