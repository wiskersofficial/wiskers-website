# Echoes spoken text

A dependency-free browser ES module for revealing text one word at a time. The default rhythm follows the Echoes Explorer: 205 ms per word and 460 ms after punctuation (`.,;:!?`). The current word is lime, revealed words remain visible, and the full passage is exposed once through an atomic polite live region. The animated visual copy is hidden from assistive technology, so it is not announced word by word. Reduced motion reveals the complete text immediately.

## Use

Import the factory and include the scoped stylesheet:

```html
<link rel="stylesheet" href="/shared/echoes-spoken-text/style.css">
<div id="quote"></div>
<script type="module">
  import { createSpokenText } from '/shared/echoes-spoken-text/index.mjs';
  const quote = createSpokenText({ root: document.querySelector('#quote') });
  quote.play('The room remembers every footstep.', {
    accessibleText: 'The room remembers every footstep. — Ada Example, A Sample Work',
  });
  // quote.replace('A different passage.'); quote.cancel(); quote.clear(); quote.destroy();
</script>
```

The root is the positioning boundary only if the caller chooses to make it one. For a quote block, place the root in the block and style it as desired. For anchored floating speech, position the root in the caller's overlay (for example, `position: absolute` relative to the map) and update its coordinates from the caller's anchor logic. This module does not position, animate, or manage the anchor, attribution, or surrounding container.

Each factory call owns its own nodes and timer. `play(text, { accessibleText })` begins a reveal; `replace` is an alias that cancels the current reveal and starts another. `cancel()` stops the timer while retaining revealed words, `clear()` removes text, and `destroy()` clears and releases the instance. Text is inserted with `textContent`. If reduced motion becomes enabled during a reveal, the instance immediately shows the full text and stops its timer. Set `announce: false` for ambient floating echoes whose full text should not enter the live announcement queue; the accessible copy remains available to assistive technology without live announcements.

Optional settings: `wordDelay`, `punctuationDelay`, `reducedMotion` (boolean override), and `announce` (defaults to `true`; false sets the accessible copy's live mode to `off`). The internal scheduler and `matchMedia` may be supplied for deterministic embedding or tests.

## Provenance

Extracted from the Echoes Explorer excerpt reveal in `echoes-explorer/dist/app.js` and its `.word` styles in `echoes-explorer/dist/style.css`. The source behavior used 205/460 ms timing, lime current words, persistent revealed words, `.18s` opacity and `.5s` color transitions, and immediate reveal under reduced motion. This standalone module leaves the explorer unchanged and adds independent lifecycle controls plus a single accessible full-text announcement.

## Continuous-story scroll extension — 28 October 2026

The bundled copy now additionally exposes `prepare(text, { accessibleText })` and `seek(progress)` (0–1). `prepare` creates the same visual words and full accessible copy without starting a timer. `seek` directly controls visible-word count/current-word state, reverses, clamps input and cancels any running timed reveal. Reduced motion keeps all words visible. Existing `play`/`replace` timed APIs remain compatible; the original archived Echoes module is unchanged.
