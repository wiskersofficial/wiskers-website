import "./layout.css";
import "./glyph-wave.css";
import { homeMarkup, mountHomeInteractions } from "./markup.js";
import { initGlyphWaves } from "./glyph-wave.js";
import { initScrollVisuals } from "./visual-modules.js";
import { measureDocumentBoxes, observeLayoutChanges, progressAcrossRange, progressAcrossViewport } from "./scroll-timing.js";

const main = document.querySelector("#main-content");
if (main) {
  if (!main.querySelector(".v6-home")) main.innerHTML = homeMarkup;
  document.body.classList.remove("home-v3", "home-v4", "home-v5");
  document.body.classList.add("home-v6");
  const root = main.querySelector(".v6-home");
  const disposeInteractions = mountHomeInteractions(root);
  const glyphs = initGlyphWaves(root);
  const visuals = initScrollVisuals(root);
  const glyphTargets = [...root.querySelectorAll("[data-glyph-wave]")];
  const scenes = [...root.querySelectorAll(".v6-scene")];
  const examples = [...root.querySelectorAll(".v6-example")];
  const stages = [...root.querySelectorAll(".v6-process-steps article")];
  const hero = root.querySelector(".v6-hero");
  const heroLines = [...root.querySelectorAll("[data-v6-hero-line]")];
  const thesis = root.querySelector(".v6-thesis");
  const examplesScene = root.querySelector(".v6-examples");
  const processScene = root.querySelector(".v6-process");
  const outlineWord = root.querySelector("[data-v6-outline]");
  const progressBar = document.querySelector("[data-v6-progress]");
  const pauseButton = document.querySelector("[data-v6-pause]");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const rects = new Map();
  const glyphPixelsPerLetter = 48;
  let frame = 0;
  let paused = false;
  let pageHeight = 1;
  let viewportHeight = window.visualViewport?.height || window.innerHeight || 1;

  const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));

  function measure() {
    viewportHeight = window.visualViewport?.height || window.innerHeight || 1;
    const scrollY = window.scrollY || 0;
    const measured = measureDocumentBoxes([...scenes, ...glyphTargets, ...examples, ...stages], scrollY);
    rects.clear();
    for (const [element, box] of measured) rects.set(element, box);
    pageHeight = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
    schedule();
  }

  function schedule() {
    if (paused || motionPreference.matches || frame) return;
    frame = requestAnimationFrame(update);
  }

  function progressWhenCrossing(element, startAt = 0.88, endAt = 0.52) {
    return progressAcrossViewport(
      rects.get(element),
      window.scrollY || 0,
      viewportHeight,
      startAt,
      endAt,
      window.visualViewport?.offsetTop || 0,
    );
  }

  function progressForGlyph(target) {
    // Revealed children move visually; anchor their timing to the untransformed
    // row so resize measurements never inherit a previous animation offset.
    const stableRow = target.closest(".v6-example, .v6-process-steps article");
    const anchor = stableRow || target;
    const travel = Math.min(viewportHeight * 0.86, glyphs.getTravelDistance(target, glyphPixelsPerLetter));
    const endAt = Math.max(0.06, 0.92 - travel / viewportHeight);
    return progressWhenCrossing(anchor, 0.92, endAt);
  }

  function revealProgressForGlyph(target, progress) {
    const { transition } = glyphs.getTiming(target);
    return clamp((progress - transition / 2) / Math.max(0.05, 1 - transition));
  }

  function update() {
    frame = 0;
    if (paused || motionPreference.matches) return;
    const scrollY = window.scrollY || 0;
    const pageProgress = clamp(scrollY / pageHeight);
    progressBar?.style.setProperty("--v6-page-progress", pageProgress.toFixed(4));

    const heroBox = rects.get(hero);
    if (heroBox) {
      const heroTarget = glyphTargets.find((target) => target.closest(".v6-hero"));
      const heroTargetBox = heroTarget && rects.get(heroTarget);
      const targetVisibleEnd = heroTargetBox
        ? Math.max(1, heroTargetBox.top + heroTargetBox.height - viewportHeight * 0.06)
        : heroBox.top + viewportHeight * 0.26;
      // Use the same character cadence as every other heading; cap the hero's
      // shorter runway so its final glyph changes while the line is visible.
      const heroTravel = Math.min(targetVisibleEnd, glyphs.getTravelDistance(heroTarget, glyphPixelsPerLetter));
      const heroProgress = progressAcrossRange(scrollY, 0, Math.max(1, heroTravel));
      const depart = clamp((scrollY - heroBox.top) / Math.max(1, viewportHeight * 0.8));
      hero?.style.setProperty("--v6-hero-progress", heroProgress.toFixed(4));
      hero?.style.setProperty("--v6-hero-depth", `${(depart * 22).toFixed(1)}px`);
      heroLines.forEach((line, index) => line.style.setProperty("--v6-line-lift", `${(-depart * (54 + index * 12)).toFixed(1)}px`));
      for (const target of glyphTargets) {
        if (target.closest(".v6-hero")) glyphs.update(target, heroProgress);
      }
    }

    for (const target of glyphTargets) {
      if (target.closest(".v6-hero")) continue;
      glyphs.update(target, progressForGlyph(target));
    }

    if (thesis) {
      const thesisProgress = progressWhenCrossing(thesis, 0.86, 0.14);
      const fill = clamp((thesisProgress - 0.08) / 0.5);
      outlineWord?.style.setProperty("--v6-outline-fill", `${(fill * 100).toFixed(1)}%`);
      thesis.style.setProperty("--v6-draw", thesisProgress.toFixed(3));
      const galleryProgress = progressWhenCrossing(examplesScene, 0.92, 0.08);
      const processProgress = progressWhenCrossing(processScene, 0.92, 0.08);
      visuals.update({ thesis: thesisProgress, examples: galleryProgress, process: processProgress });
    }

    for (const example of examples) {
      const target = example.querySelector("[data-glyph-wave]");
      const p = target
        ? revealProgressForGlyph(target, progressForGlyph(target))
        : progressWhenCrossing(example, 0.92, 0.06);
      const orbit = Math.sin(p * Math.PI * 2 + examples.indexOf(example) * (Math.PI * 2 / 3));
      example.style.setProperty("--v6-spiral-x", `${(orbit * 12).toFixed(1)}px`);
      example.style.setProperty("--v6-spiral-tilt", `${(orbit * 0.72).toFixed(2)}deg`);
      example.style.setProperty("--v6-reveal", p.toFixed(3));
    }

    for (const stage of stages) {
      const target = stage.querySelector("[data-glyph-wave]");
      const p = target
        ? revealProgressForGlyph(target, progressForGlyph(target))
        : progressWhenCrossing(stage, 0.92, 0.06);
      stage.style.setProperty("--v6-stage-progress", p.toFixed(3));
    }
  }

  function onScroll() { schedule(); }
  function onResize() { measure(); }
  function onMotionPreference() {
    if (motionPreference.matches) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      root.style.setProperty("--v6-outline-fill", "100%");
      root.style.setProperty("--v6-draw", "1");
      examples.forEach((example) => example.style.setProperty("--v6-reveal", "1"));
      stages.forEach((stage) => stage.style.setProperty("--v6-stage-progress", "1"));
      root.classList.add("motion-reduced");
      visuals.update({ thesis: 1, examples: 1, process: 1 });
    } else {
      root.classList.remove("motion-reduced");
      measure();
    }
  }

  function setPaused(value) {
    paused = Boolean(value);
    document.body.classList.toggle("motion-paused", paused);
    glyphs.setPaused(paused);
    visuals.setPaused(paused);
    if (pauseButton) {
      pauseButton.setAttribute("aria-pressed", String(paused));
      pauseButton.textContent = paused ? "Resume motion" : "Pause motion";
    }
    if (paused && frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!paused) schedule();
  }

  if (pauseButton) {
    pauseButton.hidden = false;
    pauseButton.addEventListener("click", () => setPaused(!paused));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.visualViewport?.addEventListener("resize", onResize, { passive: true });
  motionPreference.addEventListener?.("change", onMotionPreference);
  onMotionPreference();
  const disconnectLayoutObserver = observeLayoutChanges([...scenes, ...glyphTargets, ...examples, ...stages, main], onResize);
  document.fonts?.ready.then(measure);
  measure();

  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    disposeInteractions();
    glyphs.destroy();
    visuals.destroy();
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("resize", onResize);
    disconnectLayoutObserver();
  }, { once: true });
}
