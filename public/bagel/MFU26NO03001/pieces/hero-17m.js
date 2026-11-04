/* hero-17m: the number. Role: hero, straight after the title. Group: drawn in code. */
Bagel.register('hero-17m', function (layer, ctx, B) {
  var U = Bagel.util;
  var num = U.el('div', { 'class': 'num', 'aria-hidden': 'true', html: '$<span>0</span>M' }, layer);
  var span = num.querySelector('span');
  var sr = U.el('div', { 'class': 'sr', text: '17 million dollars' }, layer);
  var lastN = -1, ticked = false;
  var unsub = ctx.timeline.subscribe(function (p) {
    var a = B.hero[0], b = B.hero[1];
    var enter = U.seg(p, a - 0.03, a + 0.05);
    var count = U.seg(p, a, a + 0.045);
    var exit = U.seg(p, b - 0.025, b + 0.02);
    var n = Math.round(U.ease.out(count) * 17);
    if (n !== lastN) { span.textContent = n; lastN = n; }
    var vis = p > a - 0.04 && p < b + 0.03;
    layer.style.visibility = vis ? 'visible' : 'hidden';
    var s = U.lerp(0.55, 1, U.ease.back(enter)) * (1 + 0.35 * U.ease.inout(exit));
    var y = -12 * U.ease.inout(exit);
    num.style.opacity = U.ease.out(enter) * (1 - U.ease.inout(exit));
    num.style.transform = 'translate3d(0,' + y + 'svh,0) scale(' + s.toFixed(3) + ')';
    if (n === 17 && !ticked) { ticked = true; ctx.haptic.play('thud'); }
    if (n < 15) ticked = false;
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
