/* captions: shared text layer. Title style 'plain' on purpose: Dream's background is a busy 2D blueprint, and Josh (4 Nov 2026) found plain text works
 * best over it. Captions reveal sentence by sentence, newest in the accent colour. The walls caption arrives WITH the wall, not after it. */
Bagel.register('captions', function (layer, ctx, B) {
  var U = Bagel.util, el = U.el, T = Bagel.text;
  T.theme = { base: '#F4F1E8', accent: '#F2A33A' };
  var parts = [];
  parts.push(T.title(layer, ctx, {
    style: 'plain', a: 0.005, b: 0.19, kicker: 'AI · funding', group: 'title',
    words: ['Dream', 'raises', { t: '$17M', em: 1 }, 'seed', 'for', 'AI', 'building', 'design']
  }));
  [
    { a: 0.205, b: 0.375, kicker: 'What it is', head: 'It knows what is inside the walls', lines: ['Materials, beams, what they can carry.', 'Trained on 100M+ sq ft of US building data from permit archives.'], accent: '#5FB4D8' },
    { a: 0.395, b: 0.495, zone: 'bottom', kicker: 'In use', head: 'Active projects in Texas and California', lines: ['Dream says it is on 10 active projects.'] },
    { a: 0.635, b: 0.885, kicker: 'The difference', head: 'A picture of a building is not a building', lines: ['Image models can draw unrealistic buildings.', 'Dream says its designs follow real physics and construction standards.'], accent: '#5FB4D8' },
    { a: 0.915, b: 1.03, head: 'AI for buildings that have to stand up', lines: ['Sources: TechCrunch, 29 Oct 2026; SiliconANGLE.'], accent: '#5FB4D8' }
  ].forEach(function (c, i) { c.group = 'c' + i; parts.push(T.caption(layer, ctx, c)); });

  var lab = el('div', { 'class': 'labels' }, layer);
  el('div', { 'class': 'src', 'data-gate': 'text', 'data-gate-id': 'sources', text: 'TechCrunch, 29 Oct 2026 · SiliconANGLE' }, lab);
  var ill = el('div', { 'class': 'ill', 'data-gate': 'text', 'data-gate-id': 'illustration', html: '<b>Illustration</b>Not Dream’s actual output. No figures shown are real.' }, lab);
  var unsub = ctx.timeline.subscribe(function (p) {
    ill.style.opacity = Math.max(U.seg(p, 0.215, 0.235) * (1 - U.seg(p, 0.37, 0.39)), U.seg(p, 0.635, 0.655) * (1 - U.seg(p, 0.985, 1)));
  });
  return { destroy: function () { unsub(); parts.forEach(function (x) { x.destroy(); }); layer.innerHTML = ''; } };
});
