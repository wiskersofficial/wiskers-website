/* groundtrack: where fragments could fall (a band between 20.6 degrees south and north; Swift's orbit swings exactly that far each side
 * of the equator, so the track itself draws the band), then 1 in 2,100 as a field of dots with one lit.
 * Role: supporting facts at the burn. Group: drawn in code. No continents are drawn (no map data used). */
Bagel.register('groundtrack', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var band = el('div', { 'class': 'band', 'aria-hidden': 'true' }, layer);
  var svg = el('svg', { viewBox: '0 0 400 200' }, band);
  var Y = function (lat) { return 100 - lat * (100 / 90); };
  var grat = '';
  for (var la = -90; la <= 90; la += 30) grat += 'M0 ' + Y(la) + 'H400';
  for (var lo = 0; lo <= 400; lo += 400 / 12) grat += 'M' + lo + ' 0V200';
  el('path', { d: grat, stroke: '#7FB4FF', 'stroke-opacity': 0.18, 'stroke-width': 0.8, fill: 'none' }, svg);
  var zone = el('rect', { x: 0, y: Y(20.6), width: 400, height: Y(-20.6) - Y(20.6), fill: '#FF7A3D', 'fill-opacity': 0 }, svg);
  el('path', { d: 'M0 ' + Y(20.6) + 'H400M0 ' + Y(-20.6) + 'H400', stroke: '#FF7A3D', 'stroke-width': 1.2, 'stroke-dasharray': '5 4', fill: 'none' }, svg);
  var d = ''; for (var x = 0; x <= 400; x += 4) d += (x ? 'L' : 'M') + x + ' ' + (Y(0) - Math.sin(x / 400 * Math.PI * 5.2) * (Y(0) - Y(20.6)));
  var track = el('path', { d: d, stroke: '#EAF2FF', 'stroke-width': 1.6, fill: 'none', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, svg);
  el('text', { x: 6, y: Y(20.6) - 5, fill: '#FF9A5C', 'font-size': 10, 'font-family': 'ui-monospace,Menlo,monospace', 'letter-spacing': '.08em' }, svg).textContent = '20.6° N';
  el('text', { x: 6, y: Y(-20.6) + 13, fill: '#FF9A5C', 'font-size': 10, 'font-family': 'ui-monospace,Menlo,monospace', 'letter-spacing': '.08em' }, svg).textContent = '20.6° S';
  el('text', { x: 394, y: Y(0) - 4, fill: '#7FB4FF', 'font-size': 9, 'text-anchor': 'end', 'font-family': 'ui-monospace,Menlo,monospace', 'letter-spacing': '.08em' }, svg).textContent = 'EQUATOR';
  band.style.top = '60svh';

  var field = el('div', { 'class': 'field' }, layer);
  var odds = el('div', { 'class': 'odds', html: '1 in <em>2,100</em>' }, field);
  var cv = el('canvas', { 'aria-hidden': 'true' }, field);
  var note = el('div', { style: 'font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.06em;color:#7FB4FF;margin-top:8px;line-height:1.4', text: 'Chance of harm to anyone on Earth, per the US Space Force (as quoted by NASA).' }, field);
  field.style.top = '35svh';
  var COLS = 50, ROWS = 42, LIT = 17 * COLS + 31;
  var g = cv.getContext('2d'), cw = 0, dpr = 1, fired = false, bandFired = false;
  function size() { dpr = Math.min(2, window.devicePixelRatio || 1); cw = Math.max(200, layer.clientWidth - 44); cv.style.width = cw + 'px'; cv.style.height = (cw / COLS * ROWS) + 'px'; cv.width = Math.round(cw * dpr); cv.height = Math.round(cw / COLS * ROWS * dpr); }
  size(); window.addEventListener('resize', size);

  var unsub = ctx.timeline.subscribe(function (p, t) {
    var a = B.burn[0], b = B.burn[1];
    var bq = U.seg(p, 0.79, 0.85), fq = U.seg(p, 0.855, 0.89);
    var bandOut = U.seg(p, 0.848, 0.86);
    var on = p > 0.78 && p < b + 0.03;
    layer.style.visibility = on ? 'visible' : 'hidden';
    if (!on) { fired = false; bandFired = false; return; }
    /* band */
    var bo = U.ease.out(bq) * (1 - bandOut);
    band.style.opacity = bo; band.style.transform = 'translate3d(0,' + ((1 - U.ease.out(bq)) * 10 + bandOut * -6) + 'svh,0)';
    track.setAttribute('stroke-dashoffset', 1 - U.ease.inout(U.seg(p, 0.795, 0.84)));
    zone.setAttribute('fill-opacity', 0.22 * U.seg(p, 0.82, 0.845));
    if (bq > 0.6 && !bandFired) { bandFired = true; ctx.haptic.play('stamp'); }
    if (bq < 0.1) bandFired = false;
    /* field */
    var fo = U.ease.out(U.seg(p, 0.85, 0.865)) * (1 - U.seg(p, 0.882, 0.898));
    field.style.opacity = fo; field.style.transform = 'translate3d(0,' + ((1 - fo) * 5) + 'svh,0)';
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, cw, cw / COLS * ROWS + 2);
    var cell = cw / COLS, rr = Math.max(1, cell * 0.28);
    for (var r = 0; r < ROWS; r++) {
      var rowIn = U.seg(fq * 1.6, r / ROWS * 0.6, r / ROWS * 0.6 + 0.4);
      if (rowIn <= 0) continue;
      g.fillStyle = 'rgba(234,242,255,' + (0.5 * rowIn).toFixed(3) + ')';
      for (var c = 0; c < COLS; c++) { if (r * COLS + c === LIT) continue; g.beginPath(); g.arc((c + 0.5) * cell, (r + 0.5) * cell, rr, 0, 6.283); g.fill(); }
    }
    var lit = U.ease.back(U.seg(fq, 0.55, 0.85));
    if (lit > 0) {
      var lx = (31 + 0.5) * cell, ly = (17 + 0.5) * cell, pulse = ctx.reducedMotion() ? 0 : (t * 0.8) % 1;
      g.fillStyle = '#FF7A3D'; g.beginPath(); g.arc(lx, ly, rr * 2.6 * lit, 0, 6.283); g.fill();
      g.strokeStyle = 'rgba(255,122,61,' + (0.8 * (1 - pulse) * lit).toFixed(3) + ')'; g.lineWidth = 1.5;
      g.beginPath(); g.arc(lx, ly, rr * 3 + pulse * cell * 6, 0, 6.283); g.stroke();
    }
    if (fq > 0.8 && !fired) { fired = true; ctx.haptic.play('thud'); }
    if (fq < 0.4) fired = false;
  });
  return { destroy: function () { unsub(); window.removeEventListener('resize', size); layer.innerHTML = ''; } };
});
