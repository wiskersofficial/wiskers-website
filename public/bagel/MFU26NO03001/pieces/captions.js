/* captions + labels: own copy, one block per beat; source and illustration labels stay on screen (plumbing). */
Bagel.register('captions', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el;
  var blocks = [
    { a: 0.005, b: 0.125, pos: 'top', html: '<span class="kicker">AI &middot; funding</span><h1>Dream raises <em>$17M</em> seed for AI building design</h1>' },
    { a: 0.205, b: 0.285, pos: 'bottom', html: '<span class="kicker">Seed round</span><h2>Led by Andreessen Horowitz</h2>' },
    { a: 0.345, b: 0.455, pos: 'top', html: '<span class="kicker">What it is</span><h2>It knows what is inside the walls</h2><p>Materials, beams, what they can carry. Trained on 100M+ sq ft of US building data from permit archives.</p>' },
    { a: 0.515, b: 0.60, pos: 'bottom', html: '<span class="kicker">In use</span><h2>Active projects in Texas and California</h2>' },
    { a: 0.745, b: 0.915, pos: 'top', html: '<span class="kicker">The difference</span><h2>A picture of a building is not a building that stands.</h2><p>Image models can produce unrealistic buildings. Dream says its designs follow real physics and construction standards.</p>' },
    { a: 0.945, b: 1.01, pos: 'top', html: '<h2>AI for buildings that have to stand up</h2><p>Sources: TechCrunch, 29 Oct 2026; SiliconANGLE.</p>' }
  ].map(function (b) {
    var d = el('div', { 'class': 'cap ' + b.pos, html: b.html }, layer);
    return { d: d, a: b.a, b: b.b, pos: b.pos };
  });

  var lab = el('div', { 'class': 'labels' }, layer);
  el('div', { 'class': 'src', text: 'TechCrunch, 29 Oct 2026 · SiliconANGLE' }, lab);
  var ill = el('div', { 'class': 'ill', html: '<b>Illustration</b>Not Dream’s actual output. No figures shown are real.' }, lab);
  var ill2 = el('div', { 'class': 'ill', html: '<b>Illustration</b>Walls, services and outlines are simplified and not to scale.' }, lab);

  var unsub = ctx.timeline.subscribe(function (p) {
    blocks.forEach(function (c) {
      var inn = U.ease.out(U.seg(p, c.a, c.a + 0.022));
      var out = U.ease.inout(U.seg(p, c.b - 0.022, c.b));
      var o = inn * (1 - out);
      c.d.style.opacity = o;
      c.d.style.transform = 'translate3d(0,' + ((1 - inn) * 5 + out * -4) + 'svh,0)';
      c.d.style.visibility = o > 0.001 ? 'visible' : 'hidden';
    });
    /* illustration tag: on for the wall beat and the reveal */
    ill2.style.opacity = U.seg(p, 0.33, 0.35) * (1 - U.seg(p, 0.455, 0.475));
    ill.style.opacity = U.seg(p, 0.745, 0.765) * (1 - U.seg(p, 0.93, 0.945));
  });
  return { destroy: function () { unsub(); layer.innerHTML = ''; } };
});
