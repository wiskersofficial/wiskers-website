/* Bagel.gate: post-build layout gate.
 *
 * Josh (4 Nov 2026): "are any parts covered up, especially when titles appear". This steps the slice through its timeline and reports every place
 * where text covers text, text covers art, or text runs off the screen.
 *
 * Tag elements in the slice:
 *   data-gate="text"   a block of words (a title word, a caption sentence, a label, a number). Measured line by line, so a wide box with short text is fine.
 *   data-gate="art"    a hero or supporting graphic that words must not cover (craft, tile, map, window). Measured as its box.
 *   data-gate-group="x"  elements that belong together may overlap each other (a label on its own flash, an annotation on its own drawing).
 * Untagged things (backgrounds, stars, glows) are ignored on purpose.
 *
 * Use:  var report = Bagel.gate.run(function (p) { step(p); }, { samples: 220 });   report.fail === 0 means pass.
 * Elements count only when visible and their combined opacity (to the root) is at least minOpacity.
 */
(function () {
  'use strict';
  function effOpacity(n, root) {
    var o = 1;
    while (n && n !== root.parentNode && n.nodeType === 1) {
      var cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
      o *= parseFloat(cs.opacity);
      n = n.parentNode;
    }
    return o;
  }
  function textRects(e) {
    var r = document.createRange(); r.selectNodeContents(e);
    var out = [], list = r.getClientRects();
    for (var i = 0; i < list.length; i++) if (list[i].width > 2 && list[i].height > 2) out.push(list[i]);
    return out;
  }
  function inter(a, b) {
    var w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return (w > 3 && h > 3) ? w * h : 0;
  }
  function label(e) { return e.getAttribute('data-gate-id') || (e.textContent || '').trim().slice(0, 28) || e.className || e.tagName; }

  Bagel.gate = {
    run: function (step, o) {
      o = o || {};
      var root = o.root || document.getElementById('stage'), N = o.samples || 200, minO = o.minOpacity == null ? 0.4 : o.minOpacity, minArea = o.minArea || 60;
      var W = innerWidth, H = innerHeight, worst = {}, off = {}, checked = 0;
      for (var s = 0; s <= N; s++) {
        var p = s / N; step(p, p * 60);
        var items = [], nodes = root.querySelectorAll('[data-gate]');
        for (var i = 0; i < nodes.length; i++) {
          var e = nodes[i], kind = e.getAttribute('data-gate');
          if (kind !== 'text' && kind !== 'art') continue;
          if (effOpacity(e, root) < minO) continue;
          var rects = kind === 'text' ? textRects(e) : [e.getBoundingClientRect()];
          rects = rects.filter(function (r) { return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < H && r.right > 0 && r.left < W; });
          if (!rects.length) continue;
          items.push({ e: e, kind: kind, rects: rects, g: e.getAttribute('data-gate-group') || '', name: label(e) });
        }
        checked += items.length;
        for (i = 0; i < items.length; i++) {
          var A = items[i];
          if (A.kind === 'text') A.rects.forEach(function (r) { if (r.left < -1 || r.right > W + 1 || r.bottom > H + 1) { var key = 'edge|' + A.name; if (!off[key]) off[key] = { type: 'off-screen', a: A.name, p: p }; } });
          for (var j = i + 1; j < items.length; j++) {
            var B = items[j];
            if (A.kind === 'art' && B.kind === 'art') continue;                 /* art may layer over art */
            if (A.g && A.g === B.g) continue;
            var area = 0; A.rects.forEach(function (ra) { B.rects.forEach(function (rb) { area = Math.max(area, inter(ra, rb)); }); });
            if (area < minArea) continue;
            var k = [A.name, B.name].sort().join(' | ');
            if (!worst[k] || area > worst[k].area) worst[k] = { type: (A.kind === 'text' && B.kind === 'text') ? 'text-over-text' : 'text-over-art', a: A.name, b: B.name, p: +p.toFixed(3), area: Math.round(area) };
          }
        }
      }
      var fails = Object.keys(worst).map(function (k) { return worst[k]; }).concat(Object.keys(off).map(function (k) { return off[k]; }));
      fails.sort(function (a, b) { return a.p - b.p; });
      return { fail: fails.length, samples: N + 1, itemsChecked: checked, issues: fails };
    }
  };
})();
