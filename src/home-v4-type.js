const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/**
 * Initialize the homepage's scroll-reactive variable typography.
 *
 * @param {Element|Document} root Homepage root (defaults to the document's main).
 * @returns {{update(progress: number, environment?: object): void, setPaused(paused: boolean): void, destroy(): void}}
 */
export function initHomeV4Type(root = document.querySelector("main")) {
  if (root instanceof Document) root = root.querySelector("main");
  if (!root) throw new Error("initHomeV4Type requires the homepage main element");

  const hadScope = root.classList.contains("home-v4");
  root.classList.add("home-v4");
  const headings = [...root.querySelectorAll("h1, h2, h3, h4")]
    .filter((heading) => !heading.closest('[aria-hidden="true"]'));
  const previous = headings.map((heading) => ({
    weight: heading.style.getPropertyValue("--home-v4-weight-axis"),
    width: heading.style.getPropertyValue("--home-v4-width-axis"),
    grade: heading.style.getPropertyValue("--home-v4-grade-axis"),
    scale: heading.style.getPropertyValue("--home-v4-scale-x"),
  }));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function update(progress = 0, environment = {}) {
    if (reducedMotion.matches || environment?.reducedMotion === true) return;
    const shared = clamp(Number(progress) || 0, 0, 1);
    headings.forEach((heading, index) => {
      const section = heading.closest('section');
      const rect = section?.getBoundingClientRect();
      const p = rect
        ? clamp((window.innerHeight - rect.top) / Math.max(1, window.innerHeight + rect.height))
        : shared;
      const wave = Math.sin(p * Math.PI * 2 - Math.PI / 2);
      const localWave = Math.sin(p * Math.PI * 2 + index * 0.57);
      const weight = clamp(520 + localWave * 95 + wave * 25, 400, 700);
      const width = clamp(100 + localWave * 13 + wave * 5, 82, 118);
      const grade = clamp(localWave * 55 + wave * 18, -50, 100);
      const scale = clamp(1 + localWave * 0.035 + wave * 0.01, 0.965, 1.045);
      heading.style.setProperty("--home-v4-weight-axis", weight.toFixed(1));
      heading.style.setProperty("--home-v4-width-axis", width.toFixed(1));
      heading.style.setProperty("--home-v4-grade-axis", grade.toFixed(1));
      heading.style.setProperty("--home-v4-scale-x", scale.toFixed(3));
    });
  }

  function setPaused(paused) {
    root.classList.toggle("home-v4-type-paused", Boolean(paused));
  }

  function destroy() {
    headings.forEach((heading, index) => {
      const old = previous[index];
      for (const [name, value] of Object.entries({
        "--home-v4-weight-axis": old.weight,
        "--home-v4-width-axis": old.width,
        "--home-v4-grade-axis": old.grade,
        "--home-v4-scale-x": old.scale,
      })) {
        if (value) heading.style.setProperty(name, value);
        else heading.style.removeProperty(name);
      }
    });
    root.classList.remove("home-v4-type-paused");
    if (!hadScope) root.classList.remove("home-v4");
  }

  return { update, setPaused, destroy };
}
