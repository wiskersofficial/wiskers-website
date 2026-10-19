const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** Scroll-first, dependency-free versions of the visual ideas in the reference list. */
export function initScrollVisuals(root) {
  const array = root.querySelector(".v6-line-array");
  const canvas = root.querySelector("[data-v6-ascii]");
  const ripple = root.querySelector("[data-v6-water-map]");
  const trailPath = root.querySelector("[data-v6-trail-path]");
  const trailMarks = [...root.querySelectorAll("[data-v6-trail]")];
  const spiralPath = root.querySelector("[data-v6-spiral-path]");
  const spiralWaypoints = [...root.querySelectorAll("[data-v6-route-waypoint]")];
  const exampleRows = [...root.querySelectorAll(".v6-example")];
  const hangingNote = root.querySelector("[data-v6-hanging-note]");
  const context = canvas?.getContext("2d", { alpha: true });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let lastState = { thesis: 0, examples: 0, process: 0, trail: 0 };
  let lastDrawnThesis = -1;
  let pointerForce = 0;
  let paused = false;
  let activeWaypoint = -1;
  let resizeObserver;

  function resizeCanvas() {
    if (!canvas || !context) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scale = Math.min(1.5, window.devicePixelRatio || 1);
    const width = Math.round(rect.width * scale);
    const height = Math.round(rect.height * scale);
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
  }

  function drawAscii(progress) {
    if (!canvas || !context) return;
    resizeCanvas();
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const scale = Math.min(1.5, window.devicePixelRatio || 1);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, width, height);
    context.font = "8px ui-monospace, SFMono-Regular, Consolas, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const glyphs = ".:+x*#";
    const cols = Math.min(52, Math.floor(width / 10));
    const rows = Math.min(8, Math.floor(height / 13));
    for (let col = 0; col < cols; col += 1) {
      const x = ((col + 0.5) / cols) * width;
      const wave = Math.sin((col / Math.max(1, cols - 1)) * Math.PI * 2 + progress * Math.PI * 1.6);
      const centre = (rows - 1) / 2 + wave * Math.min(1.4, rows * 0.22);
      for (let row = 0; row < rows; row += 1) {
        const distance = Math.abs(row - centre);
        if (distance > 1.65) continue;
        const ink = clamp((1.7 - distance) * (0.24 + progress * 0.54), 0.08, 0.72);
        context.fillStyle = `rgba(47, 151, 193, ${ink.toFixed(3)})`;
        const charIndex = (col * 3 + row + Math.round(progress * 17)) % glyphs.length;
        context.fillText(glyphs[charIndex], x, ((row + 0.5) / rows) * height);
      }
    }
  }

  function update({ thesis = lastState.thesis, examples = lastState.examples, process = lastState.process, trail = lastState.trail, activeExample } = {}) {
    lastState = { thesis: clamp(thesis), examples: clamp(examples), process: clamp(process), trail: clamp(trail) };
    if (canvas && Math.abs(lastState.thesis - lastDrawnThesis) >= 0.012) {
      const rect = canvas.getBoundingClientRect();
      if (rect.bottom >= 0 && rect.top <= (window.innerHeight || 0)) {
        drawAscii(lastState.thesis);
        lastDrawnThesis = lastState.thesis;
      }
    }

    if (ripple && !reducedMotion.matches && !paused) {
      const scrollRipple = Math.sin(lastState.thesis * Math.PI) * 1.8;
      ripple.setAttribute("scale", String(Math.max(scrollRipple, pointerForce)));
    } else if (ripple) {
      ripple.setAttribute("scale", "0");
    }

    if (trailPath && trailMarks.length) {
      const length = trailPath.getTotalLength();
      const leadProgress = lastState.trail;
      const spacing = 0.16;
      trailMarks.forEach((mark, index) => {
        const markProgress = Math.max(0, leadProgress - index * spacing);
        const distance = markProgress * length;
        const point = trailPath.getPointAtLength(distance);
        const visible = index === 0 ? clamp(leadProgress * 2.1) : clamp(markProgress / 0.09);
        mark.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${(leadProgress * 92 - index * 12).toFixed(1)})`);
        mark.style.opacity = visible.toFixed(3);
      });
    }

    if (spiralPath) spiralPath.style.strokeDashoffset = reducedMotion.matches ? "0" : String(1 - lastState.examples);
    if (!paused && !reducedMotion.matches && Number.isInteger(activeExample) && activeExample !== activeWaypoint) {
      const visibleExample = activeExample >= 0 && activeExample < exampleRows.length ? activeExample : -1;
      spiralWaypoints.forEach((waypoint, index) => waypoint.classList.toggle("is-active", index === visibleExample));
      exampleRows.forEach((example, index) => example.classList.toggle("is-active", index === visibleExample));
      activeWaypoint = visibleExample;
    }
    if (reducedMotion.matches && activeWaypoint !== -1) {
      spiralWaypoints.forEach((waypoint) => waypoint.classList.remove("is-active"));
      exampleRows.forEach((example) => example.classList.remove("is-active"));
      activeWaypoint = -1;
    }
    if (hangingNote) {
      const angle = reducedMotion.matches ? 0 : Math.sin(lastState.process * Math.PI * 2) * 3.2;
      hangingNote.style.setProperty("--v6-hang-angle", `${angle.toFixed(2)}deg`);
    }
  }

  function onPointerMove(event) {
    if (event.pointerType === "touch" || reducedMotion.matches || paused) return;
    const rect = array?.getBoundingClientRect();
    if (!rect || event.clientY < rect.top - 30 || event.clientY > rect.bottom + 30) return;
    pointerForce = 5.5;
    if (ripple) ripple.setAttribute("scale", String(pointerForce));
  }

  function onPointerLeave() {
    pointerForce = 0;
    update(lastState);
  }

  if (array) {
    array.addEventListener("pointermove", onPointerMove, { passive: true });
    array.addEventListener("pointerleave", onPointerLeave, { passive: true });
    array.addEventListener("pointerup", onPointerLeave, { passive: true });
  }
  if (canvas && typeof ResizeObserver === "function") {
    resizeObserver = new ResizeObserver(() => {
      lastDrawnThesis = -1;
      update(lastState);
    });
    resizeObserver.observe(canvas);
  }
  update({ thesis: reducedMotion.matches ? 1 : 0, trail: reducedMotion.matches ? 1 : 0 });

  return {
    update,
    setPaused(value) {
      paused = Boolean(value);
      if (paused) pointerForce = 0;
      update(lastState);
    },
    destroy() {
      array?.removeEventListener("pointermove", onPointerMove);
      array?.removeEventListener("pointerleave", onPointerLeave);
      array?.removeEventListener("pointerup", onPointerLeave);
      resizeObserver?.disconnect();
      if (ripple) ripple.setAttribute("scale", "0");
    },
  };
}
