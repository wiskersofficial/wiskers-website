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
  const processStepTargets = glyphTargets.filter((target) => target.closest(".v6-process-steps article"));
  const exampleList = root.querySelector(".v6-example-list");
  const exampleRoute = root.querySelector("[data-v6-spiral-path]");
  const exampleWaypoints = [...root.querySelectorAll("[data-v6-route-waypoint]")];
  const stages = [...root.querySelectorAll(".v6-process-steps article")];
  const hero = root.querySelector(".v6-hero");
  const heroLines = [...root.querySelectorAll("[data-v6-hero-line]")];
  const heroTarget = glyphTargets.find((target) => target.closest(".v6-hero"));
  const thesis = root.querySelector(".v6-thesis");
  const lineArray = root.querySelector(".v6-line-array");
  const examplesScene = root.querySelector(".v6-examples");
  const processScene = root.querySelector(".v6-process");
  const processHead = root.querySelector(".v6-process-head");
  const processHeadingWave = root.querySelector("[data-v6-process-heading-wave]");
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
  let warnedAboutHeroLetterSpacing = false;

  const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));

  function usesWideProcessTimeline() {
    return !motionPreference.matches && window.matchMedia("(min-width: 1000px) and (min-height: 700px)").matches;
  }

  function measure() {
    viewportHeight = window.visualViewport?.height || window.innerHeight || 1;
    const scrollY = window.scrollY || 0;
    const measured = measureDocumentBoxes([...scenes, ...glyphTargets, ...examples, ...stages, lineArray].filter(Boolean), scrollY);
    rects.clear();
    for (const [element, box] of measured) rects.set(element, box);
    // Process headings receive a small translateY reveal from their stage.
    // offsetTop/offsetHeight are normal-flow measurements, so their glyph
    // timing stays fixed while scrolling, resizing, and reversing direction.
    for (const target of processStepTargets) {
      const stage = target.closest(".v6-process-steps article");
      const stageBox = rects.get(stage);
      if (!stage || !stageBox) continue;
      // These three headings are direct children of their positioned stage;
      // offsetTop remains normal-flow geometry even where offsetParent is null.
      if (target.parentElement === stage) {
        rects.set(target, { top: stageBox.top + target.offsetTop, height: target.offsetHeight });
      }
    }
    // Example rows move slightly for visual drift. Their offset geometry is
    // stable in list space, so use it for both glyph timing and the route
    // waypoint alignment instead of measuring the transformed screen boxes.
    if (exampleList && examples.length) {
      const listRect = exampleList.getBoundingClientRect();
      const listTop = listRect.top + scrollY;
      const listHeight = Math.max(1, exampleList.offsetHeight);
      const routeLength = exampleRoute?.getTotalLength() || 0;
      const routeSvg = exampleRoute?.ownerSVGElement;
      const viewBox = routeSvg?.viewBox.baseVal;
      examples.forEach((example, index) => {
        const top = listTop + example.offsetTop;
        const height = example.offsetHeight;
        rects.set(example, { top, height });
        const waypoint = exampleWaypoints[index];
        if (!waypoint || !routeLength || !viewBox?.height) return;
        const targetY = ((example.offsetTop + height / 2) / listHeight) * viewBox.height;
        let nearest = null;
        let nearestDistance = Infinity;
        // Select the closest point on the existing route to this row's stable
        // center, then place the decorative node at that exact path point.
        for (let sample = 0; sample <= 600; sample += 1) {
          const point = exampleRoute.getPointAtLength((sample / 600) * routeLength);
          const dx = point.x - viewBox.width / 2;
          const dy = point.y - targetY;
          const distance = dx * dx + dy * dy;
          if (distance < nearestDistance) {
            nearest = point;
            nearestDistance = distance;
          }
        }
        if (nearest) {
          waypoint.setAttribute("cx", nearest.x.toFixed(2));
          waypoint.setAttribute("cy", nearest.y.toFixed(2));
        }
      });
    }
    // Hero lines lift as the page scrolls. Store the target's normal-flow
    // document position so a resize at an intermediate scroll position cannot
    // bake that temporary transform into the next wave measurement.
    const heroBox = rects.get(hero);
    if (hero && heroTarget && heroBox) {
      const heroRect = hero.getBoundingClientRect();
      const targetRect = heroTarget.getBoundingClientRect();
      const line = heroTarget.closest("[data-v6-hero-line]");
      const lineLift = Number.parseFloat(line && getComputedStyle(line).getPropertyValue("--v6-line-lift")) || 0;
      rects.set(heroTarget, {
        top: heroBox.top + targetRect.top - heroRect.top - lineLift,
        height: targetRect.height,
      });
    }
    // The process heading is sticky on wide, tall screens. Keep its wave tied
    // to its normal document location, using the unshifted section box plus
    // the target's stable offset inside the sticky heading.
    if (usesWideProcessTimeline() && processScene && processHead && processHeadingWave) {
      const sectionBox = rects.get(processScene);
      const headingRect = processHead.getBoundingClientRect();
      const targetRect = processHeadingWave.getBoundingClientRect();
      const sectionPaddingTop = Number.parseFloat(getComputedStyle(processScene).paddingTop) || 0;
      if (sectionBox) {
        rects.set(processHeadingWave, {
          top: sectionBox.top + sectionPaddingTop + targetRect.top - headingRect.top,
          height: targetRect.height,
        });
      }
    }
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
    const processStage = target.closest(".v6-process-steps article");
    if (processStage) {
      const box = rects.get(target);
      if (!box) return 0;
      const travel = glyphs.getTravelDistance(target, 24);
      const initialTranslate = usesWideProcessTimeline() ? 14 : 22;
      const startAt = 1 - (box.height + initialTranslate) / viewportHeight;
      const endAt = startAt - travel / viewportHeight;
      return progressWhenCrossing(target, startAt, endAt);
    }
    const stableRow = target.closest(".v6-example");
    const anchor = stableRow || target;
    if (target.closest(".v6-contact")) {
      const box = rects.get(anchor);
      if (!box) return 0;
      const startScroll = Math.max(0, box.top - viewportHeight * 0.9);
      return progressAcrossRange(window.scrollY || 0, startScroll, pageHeight);
    }
    const travel = Math.min(viewportHeight * 0.86, glyphs.getTravelDistance(target, glyphPixelsPerLetter));
    const endAt = Math.max(0.06, 0.92 - travel / viewportHeight);
    return progressWhenCrossing(anchor, 0.92, endAt);
  }

  function exampleAtViewportBand(scrollY) {
    if (!examples.length) return -1;
    const viewportOffsetTop = window.visualViewport?.offsetTop || 0;
    let chosen = -1;
    let nearestOffset = Infinity;
    examples.forEach((example, index) => {
      const box = rects.get(example);
      if (!box) return;
      const center = (box.top + box.height / 2 - scrollY - viewportOffsetTop) / viewportHeight;
      if (center < 0.38 || center > 0.74) return;
      const offset = Math.abs(center - 0.56);
      if (offset < nearestOffset) {
        chosen = index;
        nearestOffset = offset;
      }
    });
    return chosen;
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
      const heroTargetBox = heroTarget && rects.get(heroTarget);
      // Complete the hero's letter wave while the full target line is still
      // readable: its top edge should reach the upper viewport, not leave
      // only a few pixels of the last glyph on screen. Keep the shared per-
      // glyph cadence when the viewport offers a longer runway.
      const heroVisibleTravel = heroTargetBox
        ? Math.max(1, heroTargetBox.top - (window.visualViewport?.offsetTop || 0) - viewportHeight * 0.04)
        : viewportHeight * 0.34;
      const heroTravel = Math.min(heroVisibleTravel, glyphs.getTravelDistance(heroTarget, glyphPixelsPerLetter));
      const { step: heroStep } = glyphs.getTiming(heroTarget);
      const letterSpacing = heroTravel * heroStep;
      const heroWaveDisabled = Boolean(heroTarget && letterSpacing < 12);
      if (heroWaveDisabled && !warnedAboutHeroLetterSpacing) {
        warnedAboutHeroLetterSpacing = true;
        console.warn(`[Wiskers hero glyph wave] Disabled for this layout: the available scroll runway yields ${letterSpacing.toFixed(1)}px between adjacent letter changes; at least 12px is required. Resize to a layout with more runway to restore the scroll-driven wave.`);
      }
      const heroProgress = heroWaveDisabled ? 0 : progressAcrossRange(scrollY, 0, Math.max(1, heroTravel));
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
      const trailProgress = progressWhenCrossing(lineArray, 0.92, 0.42);
      visuals.update({ thesis: thesisProgress, examples: galleryProgress, process: processProgress, trail: trailProgress, activeExample: exampleAtViewportBand(scrollY) });
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
      const glyphProgress = target ? progressForGlyph(target) : null;
      const p = usesWideProcessTimeline()
        ? (glyphProgress ?? progressWhenCrossing(stage, 0.60, 0.36))
        : target
          ? revealProgressForGlyph(target, glyphProgress)
          : progressWhenCrossing(stage, 0.92, 0.06);
      stage.style.setProperty("--v6-stage-progress", p.toFixed(3));
      stage.style.setProperty("--v6-stage-progress-percent", `${(p * 100).toFixed(1)}%`);
    }
  }

  function onScroll() { schedule(); }
  function onResize() { measure(); }
  function onMotionPreference() {
    if (motionPreference.matches) {
      if (heroTarget) glyphs.update(heroTarget, 1);
      hero?.style.setProperty("--v6-hero-progress", "1");
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      root.style.setProperty("--v6-outline-fill", "100%");
      root.style.setProperty("--v6-draw", "1");
      examples.forEach((example) => example.style.setProperty("--v6-reveal", "1"));
      stages.forEach((stage) => stage.style.setProperty("--v6-stage-progress", "1"));
      root.classList.add("motion-reduced");
      visuals.update({ thesis: 1, examples: 1, process: 1, trail: 1 });
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
  const disconnectLayoutObserver = observeLayoutChanges([...scenes, ...glyphTargets, ...examples, ...stages, lineArray, main].filter(Boolean), onResize);
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
