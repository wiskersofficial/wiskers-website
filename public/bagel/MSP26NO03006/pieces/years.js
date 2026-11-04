/* years: a corridor of year markers streams past the craft, 2004 to 2026. The planned two-year end slips by early.
 * Role: connective tissue and clock. Group: drawn in code. */
Bagel.register('years', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var marks = [];
  for (var i = 0; i <= 22; i++) {
    var m = el('div', { 'class': 'mk' + (i === 2 ? ' big' : '') }, layer);
    el('span', { text: (2004 + i) + (i === 0 ? '  LAUNCH' : '') }, m);
    if (i === 2) el('i', { text: 'PLANNED END OF PRIME MISSION' }, m);
    marks.push(m);
  }
  var counter = el('div', { 'class': 'counter', html: '<small>Years in orbit</small><b>0</b>' }, layer);
  var num = counter.querySelector('b');
  var weight = el('div', { 'class': 'weight', text: 'about 3,200 lb' }, layer);
  var lastN = -1, passed = false;

  var unsub = ctx.timeline.subscribe(function (p) {
    var a = B.years[0], b = B.years[1];
    var q = U.seg(p, a, b);
    var on = p > a - 0.03 && p < b + 0.04;
    layer.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    var H = layer.clientHeight, gap = H * 0.115, y0 = H * 0.45;
    var fade = U.ease.out(U.seg(p, a - 0.025, a + 0.015)) * (1 - U.ease.inout(U.seg(p, b + 0.005, b + 0.035)));
    for (var i = 0; i < marks.length; i++) {
      var y = y0 + (q * 22 - i) * gap;
      var vis = y > -30 && y < H + 30;
      marks[i].style.display = vis ? '' : 'none';
      if (vis) { marks[i].style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)'; marks[i].style.opacity = fade * U.seg(y, H * 0.30, H * 0.40); }
    }
    var n = Math.round(q * 22);
    if (n !== lastN) { num.textContent = n; lastN = n; }
    counter.style.opacity = fade; weight.style.opacity = fade * U.seg(q, 0.05, 0.15);
    counter.style.transform = 'translate3d(0,' + ((1 - fade) * 4) + 'svh,0)';
    var slip = q * 22 > 2.2;                                     /* the planned end has been passed */
    if (slip && !passed) { passed = true; ctx.haptic.play('tick'); }
    if (!slip) passed = false;
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
