const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

function artwork() {
  // A stepped, three-plane echo of the hero sculpture, rebuilt as a quieter end mark.
  const blocks = [];
  const form = [[0,0],[1,0],[2,0],[3,0],[4,0],[0,1],[4,1],[0,2],[1,2],[2,2],[3,2],[4,2],[4,3],[4,4],[0,4],[1,4],[2,4],[3,4]];
  form.forEach(([x,y], i) => {
    const px = 14 + x * 25, py = 20 + y * 25;
    blocks.push(`<rect class="closing-art__edge" x="${px+4}" y="${py+5}" width="19" height="19"/>`);
    blocks.push(`<rect class="${i % 5 === 2 ? 'closing-art__accent' : 'closing-art__face'}" x="${px}" y="${py}" width="19" height="19"/>`);
  });
  return `<div class="closing-art__layout"><div class="closing-art__copy"><p class="closing-art__eyebrow">WISKERS&nbsp; / &nbsp;THE NEXT MOVE</p><h2 class="closing-art__headline">Make the next<br><em>move matter.</em></h2><p class="closing-art__note">A clearer answer changes what happens next.</p></div><div class="closing-art__mark" aria-hidden="true"><span class="closing-art__orbit"></span><svg viewBox="0 0 160 160" focusable="false" shape-rendering="crispEdges">${blocks.join('')}</svg><span class="closing-art__index">W / 01</span></div><span class="closing-art__rule" aria-hidden="true"></span></div>`;
}

/** Mount closing art into [data-closing-art]. The caller owns scheduling and scroll. */
export function initializeClosingMonument(root) {
  if (!root) return { update() {}, setPaused() {}, destroy() {} };
  const children = [...root.childNodes];
  const previous = ['class','style','aria-hidden'].map((key) => [key, root.getAttribute(key)]);
  let userPaused = false, reduced = false, visible = true;
  root.setAttribute('aria-hidden', 'true');
  root.classList.add('closing-art');
  root.replaceChildren();
  root.insertAdjacentHTML('afterbegin', artwork());
  const mark = root.querySelector('.closing-art__mark');
  const setState = () => root.classList.toggle('closing-art--paused', userPaused || reduced || !visible);
  function update(progress = 0, environment = {}) {
    const p = clamp(Number(progress) || 0);
    reduced = Boolean(environment.reducedMotion);
    visible = environment.visible !== false;
    const width = Number(environment.viewport?.width || environment.viewportWidth || 1000);
    const compact = width <= 700;
    root.style.setProperty('--closing-progress', p.toFixed(3));
    root.style.setProperty('--closing-scale', (1 - p * (compact ? .09 : .13)).toFixed(3));
    root.style.setProperty('--closing-gap', `${(p * (compact ? 8 : 18)).toFixed(1)}px`);
    root.style.setProperty('--closing-rise', `${(-p * (compact ? 8 : 15)).toFixed(1)}px`);
    setState();
  }
  function setPaused(value) { userPaused = Boolean(value); setState(); }
  function destroy() {
    root.replaceChildren(...children);
    for (const [key, value] of previous) value === null ? root.removeAttribute(key) : root.setAttribute(key, value);
  }
  update(0, {});
  return { update, setPaused, destroy };
}

export default initializeClosingMonument;
