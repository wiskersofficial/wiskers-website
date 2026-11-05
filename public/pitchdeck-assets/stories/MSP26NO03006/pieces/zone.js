/* zone: where any surviving pieces could land. Swift's orbit swings exactly 20.6 degrees each side of the equator, so the ground track itself draws the band.
 * No continents are drawn (no map data used). Role: supporting fact at the burn. Group: drawn in code. */
Bagel.register('zone', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var a = B.zone[0], b = B.zone[1];
  var blk = el('div', { 'class': 'blk', 'aria-hidden': 'true' }, layer);
  el('div', { 'class': 't', 'data-gate': 'text', 'data-gate-id': 'zone title', text: 'Where any surviving pieces could land' }, blk);
  var svg = el('svg', { viewBox: '0 0 400 100', 'data-gate': 'art', 'data-gate-group': 'zone' }, blk);
  var Y = function (lat) { return 50 - lat * (50 / 45); };
  var grat = '';
  for (var la = -45; la <= 45; la += 15) grat += 'M0 ' + Y(la) + 'H400';
  for (var lo = 0; lo <= 400; lo += 400 / 12) grat += 'M' + lo + ' 0V100';
  el('path', { d: grat, stroke: '#7FB4FF', 'stroke-opacity': 0.2, 'stroke-width': 0.8, fill: 'none' }, svg);
  var zone = el('rect', { x: 0, y: Y(20.6), width: 400, height: Y(-20.6) - Y(20.6), fill: '#FF7A3D', 'fill-opacity': 0 }, svg);
  el('path', { d: 'M0 ' + Y(20.6) + 'H400M0 ' + Y(-20.6) + 'H400', stroke: '#FF7A3D', 'stroke-width': 1.3, 'stroke-dasharray': '5 4', fill: 'none' }, svg);
  var d = ''; for (var x = 0; x <= 400; x += 4) d += (x ? 'L' : 'M') + x + ' ' + (Y(0) - Math.sin(x / 400 * Math.PI * 5.2) * (Y(0) - Y(20.6)));
  var track = el('path', { d: d, stroke: '#EAF2FF', 'stroke-width': 1.8, fill: 'none', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, svg);
  var tn = el('text', { x: 6, y: Y(20.6) - 4, fill: '#FF9A5C', 'font-size': 9.5, 'font-family': 'ui-monospace,Menlo,monospace', 'letter-spacing': '.08em' }, svg); tn.textContent = '20.6° N';
  var ts = el('text', { x: 6, y: Y(-20.6) + 12, fill: '#FF9A5C', 'font-size': 9.5, 'font-family': 'ui-monospace,Menlo,monospace', 'letter-spacing': '.08em' }, svg); ts.textContent = '20.6° S';
  var fired = false;
  var unsub = ctx.timeline.subscribe(function (p) {
    var on = p > a - 0.02 && p < b + 0.02;
    layer.style.visibility = on ? 'visible' : 'hidden';
    if (!on) { fired = false; return; }
    var inn = U.ease.out(U.seg(p, a, a + 0.015)), out = U.ease.inout(U.seg(p, b - 0.012, b));
    blk.style.opacity = inn * (1 - out);
    blk.style.transform = 'translate3d(0,' + ((1 - inn) * 5 - out * 3) + 'svh,0)';
    track.setAttribute('stroke-dashoffset', 1 - U.ease.inout(U.seg(p, a + 0.002, b - 0.012)));
    zone.setAttribute('fill-opacity', 0.24 * U.seg(p, a + 0.02, b - 0.015));
    if (p > a + 0.03 && !fired) { fired = true; ctx.haptic.play('stamp'); }
    if (p < a + 0.005) fired = false;
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
