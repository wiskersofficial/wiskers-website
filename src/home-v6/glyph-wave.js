const clamp = (value) => Math.min(1, Math.max(0, value));

function buildVisual(text) {
  const visual = document.createElement("span");
  visual.className = "glyph-wave__visual";
  visual.setAttribute("aria-hidden", "true");

  for (const character of Array.from(text)) {
    if (/\s/u.test(character)) {
      visual.append(document.createTextNode(character));
      continue;
    }

    const cell = document.createElement("span");
    cell.className = "glyph-wave__cell";
    const sans = document.createElement("span");
    sans.className = "glyph-wave__sans";
    sans.textContent = character;
    const serif = document.createElement("span");
    serif.className = "glyph-wave__serif";
    serif.textContent = character;
    cell.append(sans, serif);
    visual.append(cell);
  }
  return visual;
}

/**
 * Enhance plain-text elements marked [data-glyph-wave] with accessible,
 * character-staggered sans-to-italic-serif layers.
 *
 * The parent owns all scroll observation and animation scheduling. Call
 * update(element, progress) from its shared rAF loop, where progress is 0–1.
 * A Map<Element, number> may be passed to update() to update several targets
 * in one call. The optional data-glyph-stagger attribute controls the progress
 * margin around the letter sequence (default 0.08); the remaining interval is
 * distributed evenly across each glyph's change point. Each glyph crossfades
 * through the change within a window narrower than its stagger interval, so
 * only one or two neighboring glyphs visibly morph at once. `getTravelDistance()`
 * returns the scroll distance needed to keep successive changes a chosen
 * number of CSS pixels apart. `getTiming()` exposes the effective per-target
 * crossfade window so accompanying reveals can finish with the final glyph.
 *
 * @param {Element|Document} root Search root (defaults to document).
 * @returns {{update(targetOrProgressMap:Element|Map<Element,number>,progress?:number):void,setPaused(paused:boolean):void,getTravelDistance(target:Element,pixelsPerLetter?:number):number,getTiming(target:Element):{transition:number,step:number},destroy():void}}
 */
export function initGlyphWaves(root = document) {
  const records = new Map();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let paused = false;
  let destroyed = false;

  for (const element of root.querySelectorAll("[data-glyph-wave]")) {
    // Preserve nested markup untouched; targets should be authored as plain text.
    if ([...element.childNodes].some((node) => node.nodeType !== Node.TEXT_NODE)) continue;
    const text = element.textContent ?? "";
    if (!text.trim()) continue;

    const accessible = document.createElement("span");
    accessible.className = "glyph-wave__sr-only";
    accessible.textContent = text;
    const visual = buildVisual(text);
    element.replaceChildren(accessible, visual);
    element.classList.add("glyph-wave");
    records.set(element, {
      originalText: text,
      cells: [...visual.querySelectorAll(".glyph-wave__cell")],
    });
    if (reducedMotion.matches) applyProgress(records.get(element), element, 1);
  }

  function applyProgress(record, element, progress) {
    const p = reducedMotion.matches ? 1 : clamp(Number(progress) || 0);
    const { cells } = record;
    const transition = transitionFor(element, records.get(element));
    const step = cells.length > 1 ? Math.max(0.025, (1 - transition) / (cells.length - 1)) : 0;
    for (let i = 0; i < cells.length; i += 1) {
      const offset = i * step;
      const local = clamp((p - offset) / Math.max(0.01, transition));
      // Crossfade both type and color from the same scroll progress. Narrowing
      // the window below one stagger interval keeps the change legible as a
      // travelling letter wave instead of turning the whole word at once.
      const eased = local * local * (3 - 2 * local);
      cells[i].style.setProperty("--glyph-progress", eased.toFixed(4));
    }
  }

  function update(targetOrProgressMap, progress) {
    if (paused || destroyed) return;
    if (targetOrProgressMap instanceof Map) {
      for (const [element, value] of targetOrProgressMap) {
        const record = records.get(element);
        if (record) applyProgress(record, element, value);
      }
      return;
    }
    const record = records.get(targetOrProgressMap);
    if (record) applyProgress(record, targetOrProgressMap, progress);
  }

  function setPaused(value) {
    paused = Boolean(value);
  }

  function getTiming(target) {
    const record = records.get(target);
    if (!record || record.cells.length < 2) return { transition: 0, step: 1 };
    const transition = transitionFor(target, record);
    const step = Math.max(0.025, (1 - transition) / (record.cells.length - 1));
    return { transition, step };
  }

  function getTravelDistance(target, pixelsPerLetter = 48) {
    const { step } = getTiming(target);
    return Math.max(0, Number(pixelsPerLetter) || 0) / step;
  }

  function transitionFor(element, record) {
    const requested = clamp(Number(element.dataset.glyphStagger ?? 0.08));
    const count = record?.cells.length ?? 0;
    if (count < 2) return requested;
    // Keep each morph to about half the space between neighboring glyphs.
    // Older authored values (0.18–0.30) are retained as upper bounds only.
    const isolatedWindow = 0.52 / (count - 1 + 0.52);
    return Math.min(requested, isolatedWindow);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    for (const [element, record] of records) {
      element.replaceChildren(document.createTextNode(record.originalText));
      element.classList.remove("glyph-wave");
    }
    records.clear();
  }

  return { update, setPaused, getTravelDistance, getTiming, destroy };
}
