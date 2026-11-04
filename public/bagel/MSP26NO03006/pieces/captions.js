/* captions and labels: our own copy, one block per stretch; source and illustration labels stay on screen. */
Bagel.register('captions', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var blocks = [
    { a: 0.005, b: 0.125, pos: 'top', html: '<span class="kicker">Space &middot; 4 Nov 2026</span><h1>NASA’s Swift Observatory to <em>re-enter</em> the atmosphere after 22 years</h1>' },
    { a: 0.155, b: 0.285, pos: 'top', html: '<span class="kicker">Built for two years</span><h2>Still working after twenty-two</h2><p>Swift launched in 2004 with a planned two-year prime mission.</p>' },
    { a: 0.315, b: 0.445, pos: 'top', html: '<span class="kicker">What it watched</span><h2>The biggest explosions in the universe</h2><p>Gamma-ray bursts first. Then active galaxies, X-ray flares, supernovae, comets and asteroids.</p>' },
    { a: 0.475, b: 0.585, pos: 'top', html: '<span class="kicker">The rescue</span><h2>A craft was sent to lift it</h2><p>Katalyst Space’s LINK launched in July. Soon after reaching space it began spinning out of control. The attempt was abandoned in mid-August.</p>' },
    { a: 0.615, b: 0.715, pos: 'top', html: '<span class="kicker">No engine of its own</span><h2>Drag is pulling it down</h2><p>Swift can’t boost itself. A swollen atmosphere is dragging it lower.</p>' },
    { a: 0.745, b: 0.84, pos: 'top', html: '<span class="kicker">The burn</span><h2>Most of it should burn up</h2><p>Some pieces should survive. NASA says any that do fall between 20.6° south and 20.6° north.</p>' },
    { a: 0.935, b: 1.02, pos: 'top', html: '<h2>Designed for two years. It stayed for twenty-two.</h2><p>Sources: NASA Science (2 Nov 2026), Reuters (3 Nov), CNN (4 Nov).</p>' }
  ].map(function (b) {
    var d = el('div', { 'class': 'cap ' + b.pos, html: b.html }, layer);
    return { d: d, a: b.a, b: b.b };
  });

  var clock = el('div', { 'class': 'clock', html: '<b>Re-entry expected 4 Nov.</b> Estimates differ: about 3:30 a.m. ±11 h (NASA, 2 Nov); about 7:42 a.m. ±2 h (US Space Force, via CNN).' }, layer);
  clock.style.bottom = 'calc(env(safe-area-inset-bottom, 0px) + 78px)';
  var lab = el('div', { 'class': 'labels' }, layer);
  el('div', { 'class': 'src', text: 'NASA Science · Reuters · CNN, 2–4 Nov 2026' }, lab);
  var ill = el('div', { 'class': 'ill', html: '<b>Illustration</b>Stylised craft, not to scale. The events are illustrated; only the reported facts are stated.' }, lab);

  var unsub = ctx.timeline.subscribe(function (p) {
    blocks.forEach(function (c) {
      var inn = U.ease.out(U.seg(p, c.a, c.a + 0.022));
      var out = U.ease.inout(U.seg(p, c.b - 0.022, c.b));
      var o = inn * (1 - out);
      c.d.style.opacity = o;
      c.d.style.transform = 'translate3d(0,' + ((1 - inn) * 5 + out * -4) + 'svh,0)';
      c.d.style.visibility = o > 0.001 ? 'visible' : 'hidden';
    });
    clock.style.opacity = U.seg(p, 0.03, 0.05) * (1 - U.seg(p, 0.12, 0.14));
    ill.style.opacity = U.seg(p, 0.14, 0.16) * (1 - U.seg(p, 0.985, 1));
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
