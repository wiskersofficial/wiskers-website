/* years: a corridor of year markers streams past the craft, 2004 to 2026. The planned two-year end slips by early.
 * Role: connective tissue and clock. The counter sits bottom right, clear of the craft; the weight moved into the caption. Group: drawn in code. */
Bagel.register('years', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var marks = [];
  for (var i = 0; i <= 22; i++) {
    var m = el('div', { 'class': 'mk' + (i === 2 ? ' big' : '') }, layer);
    el('span', { 'data-gate': 'text', 'data-gate-group': 'yr', 'data-gate-id': 'year ' + (2004 + i), text: String(2004 + i) }, m);
    marks.push(m);
  }
  var counter = el('div', { 'class': 'counter', html: '<small data-gate="text" data-gate-group="cnt" data-gate-id="counter label">Years in orbit</small><b data-gate="text" data-gate-group="cnt" data-gate-id="counter">0</b>' }, layer);
  var num = counter.querySelector('b');
  var chip = el('div', { 'class': 'pe', 'data-gate': 'text', 'data-gate-id': 'planned end', text: 'PLANNED END OF PRIME MISSION' }, layer);
  var lastN = -1, passed = false;

  var unsub = ctx.timeline.subscribe(function (p) {
    var a = B.years[0], b = B.years[1];
    var q = U.seg(p, a, b);
    var on = p > a - 0.03 && p < b + 0.04;
    layer.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    var H = layer.clientHeight, gap = H * 0.115, y0 = H * 0.575;
    var fade = U.ease.out(U.seg(p, a - 0.025, a + 0.015)) * (1 - U.ease.inout(U.seg(p, b - 0.012, b + 0.004)));
    for (var i = 0; i < marks.length; i++) {
      var y = y0 + (q * 22 - i) * gap;
      var vis = y > -30 && y < H + 30;
      marks[i].style.display = vis ? '' : 'none';
      /* markers fade out under the caption zone (top 38%) so the copy is never crossed by a label */
      if (vis) { marks[i].style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)'; marks[i].style.opacity = fade * U.seg(y, H * 0.36, H * 0.46) * (1 - U.seg(y, H * 0.72, H * 0.8)); }
    }
    /* the planned-end label rides the 2006 marker, but only in the clear band above the craft */
    var py = y0 + (q * 22 - 2) * gap;
    chip.style.opacity = fade * U.seg(py, H * 0.37, H * 0.40) * (1 - U.seg(py, H * 0.43, H * 0.46));
    chip.style.transform = 'translate3d(0,' + (py - 8).toFixed(1) + 'px,0)';
    var n = Math.round(q * 22);
    if (n !== lastN) { num.textContent = n; lastN = n; }
    counter.style.opacity = fade;
    counter.style.transform = 'translate3d(0,' + ((1 - fade) * 4) + 'svh,0)';
    var slip = q * 22 > 2.2;
    if (slip && !passed) { passed = true; ctx.haptic.play('tick'); }
    if (!slip) passed = false;
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
