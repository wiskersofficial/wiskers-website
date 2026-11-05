/* hero-17m: the number as a 3D amber tile (Josh, 4 Nov 2026: "I was imagining it would be a bit more of a 3D tile rather than just text that comes up").
 * A real CSS 3D slab: six faces, lit from the top left, that swings in, settles, sways, and tips away. Transform and opacity only.
 * It arrives AT THE SAME TIME as the title, not after it (the title already says $17M, so a second "$17M" screen added nothing).
 * Smaller than the old text (it was too big to see properly). Role: hero. Group: drawn in code. */
Bagel.register('hero-17m', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var stage = el('div', { 'class': 'stage3d', 'aria-hidden': 'true' }, layer);
  var tile = el('div', { 'class': 'tile', 'data-gate': 'art', 'data-gate-id': '$17M tile' }, stage);
  var shadow = el('div', { 'class': 'shadow' }, stage);
  var front = el('div', { 'class': 'face front', html: '<i>SEED</i><b>$<span>0</span>M</b>' }, tile);
  var back = el('div', { 'class': 'face back' }, tile);
  var right = el('div', { 'class': 'face side' }, tile), left = el('div', { 'class': 'face side' }, tile);
  var top = el('div', { 'class': 'face side', style: 'filter:none;background:#F7B64F' }, tile), bottom = el('div', { 'class': 'face side', style: 'background:#8F5712' }, tile);
  var span = front.querySelector('span'), numEl = front.querySelector('b');
  el('div', { 'class': 'sr', text: '17 million dollars' }, layer);
  var w = 0, h = 0, d = 30;
  function size() {
    w = Math.min(layer.clientWidth * 0.62, 250); h = Math.round(w * 0.5); d = 30;
    tile.style.cssText += ';width:' + w + 'px;height:' + h + 'px;left:' + (-w / 2) + 'px;top:' + (-h / 2) + 'px';
    var s = function (n, css) { n.style.cssText += ';' + css; };
    s(front, 'width:' + w + 'px;height:' + h + 'px;transform:translateZ(' + d / 2 + 'px)');
    s(back, 'width:' + w + 'px;height:' + h + 'px;transform:rotateY(180deg) translateZ(' + d / 2 + 'px)');
    s(right, 'width:' + d + 'px;height:' + h + 'px;left:' + (w / 2 - d / 2) + 'px;transform:rotateY(90deg) translateZ(' + w / 2 + 'px)');
    s(left, 'width:' + d + 'px;height:' + h + 'px;left:' + (-d / 2 + w / 2) + 'px;transform:rotateY(-90deg) translateZ(' + w / 2 + 'px)');
    s(top, 'width:' + w + 'px;height:' + d + 'px;top:' + (h / 2 - d / 2) + 'px;transform:rotateX(90deg) translateZ(' + h / 2 + 'px)');
    s(bottom, 'width:' + w + 'px;height:' + d + 'px;top:' + (h / 2 - d / 2) + 'px;transform:rotateX(-90deg) translateZ(' + h / 2 + 'px)');
    numEl.style.fontSize = Math.round(w * 0.36) + 'px';
    shadow.style.top = (h / 2 + 34) + 'px';
  }
  size(); window.addEventListener('resize', size);
  var lastN = -1, thudded = false;

  var unsub = ctx.timeline.subscribe(function (p, t) {
    var a = B.hero[0], b = B.hero[1];
    var enter = U.ease.out(U.seg(p, a, a + 0.05));
    var count = U.seg(p, a + 0.015, a + 0.06);
    var exit = U.ease.inout(U.seg(p, b - 0.03, b + 0.015));
    var calm = ctx.reducedMotion();
    layer.style.visibility = (p > a - 0.02 && p < b + 0.03) ? 'visible' : 'hidden';
    var n = Math.round(U.ease.out(count) * 17);
    if (n !== lastN) { span.textContent = n; lastN = n; }
    var sway = calm ? 0 : Math.sin(t * 0.7) * 5, bob = calm ? 0 : Math.sin(t * 1.1) * 4;
    var ry = -78 * (1 - U.ease.back(enter)) - 16 + sway + exit * 60;
    var rx = 26 * (1 - enter) + 9 - exit * 85;
    var ty = (1 - enter) * 22 + bob - exit * 30;                          /* svh-ish via px below */
    tile.style.opacity = enter * (1 - exit);
    tile.style.transform = 'translate3d(0,' + (ty * 8).toFixed(1) + 'px,' + ((1 - enter) * -260) + 'px) rotateX(' + rx.toFixed(1) + 'deg) rotateY(' + ry.toFixed(1) + 'deg) scale(' + (0.7 + 0.3 * enter).toFixed(3) + ')';
    shadow.style.opacity = 0.9 * enter * (1 - exit); shadow.style.transform = 'scaleX(' + (0.6 + 0.4 * enter) + ')';
    if (n === 17 && !thudded) { thudded = true; ctx.haptic.play('thud'); }
    if (n < 15) thudded = false;
  });
  return { destroy: function () { unsub(); window.removeEventListener('resize', size); layer.innerHTML = ''; } };
});
