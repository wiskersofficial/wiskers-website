import "./layout.css";
import "./glyph-wave.css";
import { homeMarkup, mountHomeInteractions } from "./markup.js";
import { initGlyphWaves } from "./glyph-wave.js";

const main = document.querySelector("#main-content");
if (main) {
  if (!main.querySelector(".v6-home")) main.innerHTML = homeMarkup;
  document.body.classList.remove("home-v3", "home-v4", "home-v5");
  document.body.classList.add("home-v6");
  const root = main.querySelector(".v6-home");
  const disposeInteractions = mountHomeInteractions(root);
  const glyphs = initGlyphWaves(root);
  const glyphTargets = [...root.querySelectorAll("[data-glyph-wave]")];
  const scenes = [...root.querySelectorAll(".v6-scene")];
  const examples = [...root.querySelectorAll(".v6-example")];
  const stages = [...root.querySelectorAll(".v6-process-steps article")];
  const hero = root.querySelector(".v6-hero");
  const heroLines = [...root.querySelectorAll("[data-v6-hero-line]")];
  const thesis = root.querySelector(".v6-thesis");
  const outlineWord = root.querySelector("[data-v6-outline]");
  const progressBar = document.querySelector("[data-v6-progress]");
  const pauseButton = document.querySelector("[data-v6-pause]");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const rects = new Map();
  let frame = 0;
  let paused = false;
  let pageHeight = 1;
  let viewportHeight = window.innerHeight || 1;

  const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));

  function measure() {
    viewportHeight = window.innerHeight || 1;
    const scrollY = window.scrollY || 0;
    for (const element of [...scenes, ...glyphTargets, ...examples, ...stages]) {
      const rect = element.getBoundingClientRect();
      rects.set(element, { top: rect.top + scrollY, height: rect.height });
    }
    pageHeight = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
    schedule();
  }

  function schedule() {
    if (paused || motionPreference.matches || frame) return;
    frame = requestAnimationFrame(update);
  }

  function progressWhenCrossing(element, enterAt = 0.82, range = 0.48) {
    const box = rects.get(element);
    if (!box) return 0;
    const line = (window.scrollY || 0) + viewportHeight * enterAt;
    return clamp((line - box.top) / Math.max(1, box.height + viewportHeight * range));
  }

  function update() {
    frame = 0;
    if (paused || motionPreference.matches) return;
    const scrollY = window.scrollY || 0;
    const pageProgress = clamp(scrollY / pageHeight);
    progressBar?.style.setProperty("--v6-page-progress", pageProgress.toFixed(4));

    const heroBox = rects.get(hero);
    if (heroBox) {
      const heroTravel = Math.max(1, heroBox.height * 0.58);
      const heroProgress = clamp((scrollY - heroBox.top + viewportHeight * 0.02) / heroTravel);
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
      const p = progressWhenCrossing(target, 0.84, 0.52);
      glyphs.update(target, p);
    }

    if (thesis) {
      const thesisProgress = progressWhenCrossing(thesis, 0.86, 0.14);
      const fill = clamp((thesisProgress - 0.08) / 0.5);
      outlineWord?.style.setProperty("--v6-outline-fill", `${(fill * 100).toFixed(1)}%`);
      thesis.style.setProperty("--v6-draw", thesisProgress.toFixed(3));
    }

    for (const example of examples) {
      const p = progressWhenCrossing(example, 0.9, 0.12);
      example.style.setProperty("--v6-reveal", p.toFixed(3));
    }

    for (const stage of stages) {
      const p = progressWhenCrossing(stage, 0.9, 0.2);
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
    } else {
      root.classList.remove("motion-reduced");
      measure();
    }
  }

  function setPaused(value) {
    paused = Boolean(value);
    document.body.classList.toggle("motion-paused", paused);
    glyphs.setPaused(paused);
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
  motionPreference.addEventListener?.("change", onMotionPreference);
  onMotionPreference();
  document.fonts?.ready.then(measure);
  measure();

  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    disposeInteractions();
    glyphs.destroy();
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
  }, { once: true });
}
