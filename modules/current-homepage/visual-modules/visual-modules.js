const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const trailImages = [
  "/assets/component-studies/trail-signal.svg",
  "/assets/component-studies/trail-question.svg",
  "/assets/component-studies/trail-context.svg",
  "/assets/component-studies/trail-launch.svg",
  "/assets/component-studies/trail-focus.svg",
];

/** Scroll-first, light visual systems for the homepage. */
export function initScrollVisuals(root) {
  const canvases = [...root.querySelectorAll("[data-v6-ascii]")].map((canvas) => ({
    canvas,
    context: canvas.getContext("2d", { alpha: true }),
  }));
  const gallery = root.querySelector("[data-v6-spiral-experience]");
  const galleryRing = gallery?.querySelector("[data-v6-spiral-ring]");
  const galleryImages = [...(gallery?.querySelectorAll("[data-v6-spiral-image]") ?? [])];
  const hangingNote = root.querySelector("[data-v6-hanging-note]");
  const exampleRows = [...root.querySelectorAll(".v6-example")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cleanups = [];
  let paused = false;
  let pointerSignal = 0.5;
  let galleryScrollAngle = 0;
  let galleryDragAngle = 0;
  let galleryTilt = 0;
  let galleryFrame = 0;
  let lastTime = 0;

  function addListener(node, event, handler, options) {
    node?.addEventListener(event, handler, options);
    cleanups.push(() => node?.removeEventListener(event, handler, options));
  }

  function drawAsciiField(canvasState, progress = 0) {
    const { canvas, context } = canvasState;
    if (!context) return;
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1 || bounds.bottom < -60 || bounds.top > window.innerHeight + 60) return;
    const ratio = Math.min(1.2, window.devicePixelRatio || 1);
    const pixelWidth = Math.round(bounds.width * ratio);
    const pixelHeight = Math.round(bounds.height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);
    context.font = "9px ui-monospace, SFMono-Regular, Consolas, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";

    const columns = Math.min(120, Math.floor(bounds.width / 11));
    const rows = Math.min(56, Math.floor(bounds.height / 13));
    const glyphs = ".:;+x*#%@";
    const pageProgress = reducedMotion.matches ? 0 : window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const phase = pageProgress * Math.PI * 5 + progress * Math.PI * 0.6 + pointerSignal * 1.3;
    for (let col = 0; col < columns; col += 1) {
      const x = (col + 0.5) / columns;
      for (let row = 0; row < rows; row += 1) {
        const y = (row + 0.5) / rows;
        const field = Math.sin(x * 9.3 + y * 5.2 + phase)
          + Math.cos(y * 8.1 - x * 4.5 - phase * 0.72)
          + Math.sin(x * 15 + y * 3 + phase * 0.38) * 0.45;
        const ridge = Math.max(0, (field - 0.05) / 2.1);
        const speckle = Math.max(0, 0.23 - Math.abs(Math.sin(x * 31 + y * 23 + phase * 1.8))) * 0.6;
        const alpha = Math.max(ridge * 0.46, speckle);
        if (alpha < 0.045) continue;
        const color = (col + row) % 9 === 0 ? "239,118,122"
          : (col * 2 + row) % 7 === 0 ? "37,165,131" : "47,151,193";
        context.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
        const glyph = glyphs[(col * 3 + row * 5 + Math.floor(phase * 2)) % glyphs.length];
        context.fillText(glyph, x * bounds.width, y * bounds.height);
      }
    }
  }

  function drawVisibleAscii(progress = 0) {
    canvases.forEach((canvas) => drawAsciiField(canvas, progress));
  }

  function renderGallery() {
    if (!gallery || !galleryRing || galleryImages.length === 0) return;
    const width = gallery.clientWidth;
    const radius = Math.min(width * 0.28, 270);
    const heightScale = width < 640 ? 0.62 : 1;
    const idleAngle = reducedMotion.matches || paused ? 0 : performance.now() * 0.00012;
    galleryImages.forEach((card, index) => {
      const angle = galleryScrollAngle + galleryDragAngle + idleAngle + (index * Math.PI * 2) / galleryImages.length;
      const z = Math.cos(angle) * radius;
      const perspective = width < 640 ? 760 : 1200;
      const scale = 0.8 * perspective / Math.max(320, perspective - z);
      const rawY = ((index - (galleryImages.length - 1) / 2) * 27 + Math.sin(angle * 2) * 22) * heightScale + galleryTilt;
      const maxX = Math.max(0, (width - card.offsetWidth * scale) / 2 - 12);
      const maxY = Math.max(0, (gallery.clientHeight - card.offsetHeight * scale) / 2 - 14);
      const x = clamp(Math.sin(angle) * radius, -maxX, maxX);
      const y = clamp(rawY, -maxY, maxY);
      const depth = clamp((z / radius + 1) / 2, 0, 1);
      card.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), ${z.toFixed(1)}px) rotateY(${angle.toFixed(4)}rad) scale(.8)`;
      card.style.opacity = String((0.42 + depth * 0.58).toFixed(3));
      card.style.zIndex = String(Math.round(depth * 100));
    });
  }

  function updateGalleryScroll(progress = galleryScrollAngle) {
    galleryScrollAngle = (clamp(progress) - 0.5) * Math.PI * 1.8;
    renderGallery();
  }

  function setupGallery() {
    if (!gallery) return;
    let dragging = false;
    let previousX = 0;
    let previousY = 0;
    const onPointerDown = (event) => {
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      gallery.classList.add("is-dragging");
      if (event.pointerType === "mouse") gallery.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event) => {
      if (!dragging) return;
      galleryDragAngle += (event.clientX - previousX) * 0.009;
      const tiltLimit = gallery.clientWidth < 640 ? 42 : 54;
      galleryTilt = clamp(galleryTilt + (event.clientY - previousY) * 0.22, -tiltLimit, tiltLimit);
      previousX = event.clientX;
      previousY = event.clientY;
      renderGallery();
    };
    const onPointerUp = () => { dragging = false; gallery.classList.remove("is-dragging"); };
    const onKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        galleryDragAngle += (event.key === "ArrowLeft" ? -1 : 1) * Math.PI / 8;
        renderGallery();
      }
    };
    addListener(gallery, "pointerdown", onPointerDown);
    addListener(gallery, "pointermove", onPointerMove, { passive: true });
    addListener(gallery, "pointerup", onPointerUp);
    addListener(gallery, "pointercancel", onPointerUp);
    addListener(gallery, "lostpointercapture", onPointerUp);
    addListener(gallery, "keydown", onKeyDown);
    const animate = (now) => {
      const bounds = gallery.getBoundingClientRect();
      const visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
      const elapsed = lastTime ? Math.min(40, now - lastTime) : 0;
      lastTime = now;
      if (visible && !reducedMotion.matches && !paused && !dragging) {
        galleryDragAngle += elapsed * 0.00022;
        renderGallery();
      }
      galleryFrame = requestAnimationFrame(animate);
    };
    galleryFrame = requestAnimationFrame(animate);
  }

  function setupImageTrail() {
    root.querySelectorAll("[data-v6-image-trail]").forEach((layer) => {
      const pool = trailImages.map((src) => {
        const image = document.createElement("img");
        image.src = src;
        image.alt = "";
        image.className = "v6-trail-image";
        image.draggable = false;
        layer.append(image);
        return image;
      });
      let imageIndex = 0;
      let lastPoint = null;
      const spawn = (event) => {
        if (reducedMotion.matches || paused) return;
        if (event.pointerType === "touch" && event.type !== "pointerdown") return;
        const bounds = layer.getBoundingClientRect();
        const x = clamp(event.clientX - bounds.left, 62, bounds.width - 62);
        const y = clamp(event.clientY - bounds.top, 62, bounds.height - 62);
        const point = { x, y };
        if (lastPoint && Math.hypot(x - lastPoint.x, y - lastPoint.y) < 76) return;
        lastPoint = point;
        const image = pool[imageIndex++ % pool.length];
        image.getAnimations().forEach((animation) => animation.cancel());
        const rotation = (Math.random() * 18 - 9).toFixed(1);
        const size = 70 + Math.random() * 42;
        image.style.width = `${size.toFixed(0)}px`;
        image.style.left = `${x.toFixed(1)}px`;
        image.style.top = `${y.toFixed(1)}px`;
        image.animate([
          { opacity: 0, transform: `translate(-50%,-50%) rotate(${rotation}deg) scale(.76)` },
          { opacity: 0.98, transform: `translate(-50%,-50%) rotate(${rotation}deg) scale(1)`, offset: 0.18 },
          { opacity: 0, transform: `translate(-50%,-50%) rotate(${rotation}deg) scale(.92)` },
        ], { duration: 1100, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" });
      };
      addListener(layer.parentElement, "pointermove", spawn, { passive: true });
      addListener(layer.parentElement, "pointerdown", (event) => { if (event.pointerType === "touch") spawn(event); }, { passive: true });
      addListener(layer.parentElement, "pointerleave", () => { lastPoint = null; }, { passive: true });
    });
  }

  function update({ hero: heroProgress = 0, thesis = 0, examples: examplesProgress = 0, process = 0, activeExample } = {}) {
    drawVisibleAscii((thesis + examplesProgress + process) / 3);
    updateGalleryScroll(heroProgress);
    if (!paused && !reducedMotion.matches && Number.isInteger(activeExample)) {
      const active = activeExample >= 0 && activeExample < exampleRows.length ? activeExample : -1;
      exampleRows.forEach((example, index) => example.classList.toggle("is-active", index === active));
    }
    if (hangingNote) {
      const angle = reducedMotion.matches || paused ? 0 : Math.sin(process * Math.PI * 2) * 3.2;
      hangingNote.style.setProperty("--v6-hang-angle", `${angle.toFixed(2)}deg`);
    }
  }

  addListener(window, "resize", () => drawVisibleAscii());
  canvases.forEach(({ canvas }) => {
    const stage = canvas.parentElement;
    addListener(stage, "pointermove", (event) => {
      const bounds = stage.getBoundingClientRect();
      if (paused || reducedMotion.matches) return;
      pointerSignal = clamp((event.clientX - bounds.left) / Math.max(1, bounds.width));
      drawVisibleAscii();
    }, { passive: true });
  });
  setupGallery();
  setupImageTrail();
  update({});

  return {
    update,
    setPaused(value) {
      paused = Boolean(value);
      if (paused) {
        root.querySelectorAll(".v6-trail-image").forEach((image) => image.getAnimations().forEach((animation) => animation.cancel()));
      }
      renderGallery();
      drawVisibleAscii();
    },
    destroy() {
      if (galleryFrame) cancelAnimationFrame(galleryFrame);
      cleanups.forEach((cleanup) => cleanup());
      root.querySelectorAll("[data-v6-image-trail]").forEach((layer) => layer.replaceChildren());
    },
  };
}
