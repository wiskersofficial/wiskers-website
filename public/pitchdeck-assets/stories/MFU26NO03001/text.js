/* Bagel shared text layer.
 *
 *   Bagel.text.theme = { base, accent }                         set once by the slice (hex strings)
 *   Bagel.text.title(layer, ctx, opts)                          a title, in one of four styles
 *   Bagel.text.caption(layer, ctx, opts)                        a head and up to three sentences, revealed one by one
 *
 * Title styles: 'plain' | 'words' | 'slide' | 'tile'. Pick one per slice from the list and do not repeat the last two slices'.
 * Rule of thumb (Josh, 4 Nov 2026): plain suits a busy 2D background (blueprints); words or slide suit open space; tile suits a flat or photographic ground.
 * Caption modes: 'accent' (the newest sentence arrives in the accent colour and settles) | 'dim' (earlier sentences dim) | 'plain'.
 *
 * Everything is a pure function of the timeline p, so it scrubs both ways. Every text element is tagged data-gate="text" for the overlap gate.
 */
(function () {
  'use strict';
  var U = Bagel.util, el = U.el;
  function hex(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function mix(a, b, t) { var A = hex(a), B = hex(b); return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * t) + ',' + Math.round(A[1] + (B[1] - A[1]) * t) + ',' + Math.round(A[2] + (B[2] - A[2]) * t) + ')'; }
  U.hex = hex; U.mix = mix;

  Bagel.text = { theme: { base: '#EAF2FF', accent: '#FF7A3D' }, STYLES: ['plain', 'words', 'slide', 'tile'] };

  function place(box, o) {
    if (o.y != null) { box.style.top = o.y + 'svh'; }
    else box.className += ' ' + (o.zone || 'top');
  }
  function words(h, list, group) {
    var out = [];
    list.forEach(function (w) {
      var t = typeof w === 'string' ? w : w.t;
      var s = el('span', { 'class': 'w', 'data-gate': 'text', 'data-gate-group': group, html: (typeof w === 'object' && w.em) ? '<em>' + t + '</em>' : t }, h);
      out.push(s);
      h.appendChild(document.createTextNode(' '));
    });
    return out;
  }

  /* ---------- title ---------- */
  Bagel.text.title = function (layer, ctx, o) {
    var style = o.style || 'plain', a = o.a, b = o.b, group = o.group || 'title';
    var box = el('div', { 'class': 'cap ttl-' + style }, layer); place(box, o);
    var host = box;
    var panel = null;
    if (style === 'tile') { panel = el('div', { 'class': 'panel' }, box); host = panel; }
    if (o.kicker) el('span', { 'class': 'kicker', 'data-gate': 'text', 'data-gate-group': group, text: o.kicker }, host);
    var h = el('h1', {}, host);
    var ws = words(h, o.words, group);
    var inLen = o.inLen || 0.05;
    var unsub = ctx.timeline.subscribe(function (p) {
      var inn = U.seg(p, a, a + inLen), out = U.ease.inout(U.seg(p, b - 0.022, b));
      var calm = ctx.reducedMotion();
      box.style.visibility = (p > a - 0.01 && p < b + 0.01) ? 'visible' : 'hidden';
      box.style.opacity = style === 'plain' ? U.ease.out(U.seg(p, a, a + 0.025)) * (1 - out) : (1 - out);
      box.style.transform = 'translate3d(0,' + ((style === 'plain' ? (1 - U.ease.out(U.seg(p, a, a + 0.025))) * 5 : 0) - out * 4) + 'svh,0)';
      if (style === 'plain') return;
      if (style === 'tile') {
        var t = U.ease.out(U.seg(p, a, a + inLen));
        panel.style.opacity = t;
        panel.style.transform = calm ? 'none' : 'rotateX(' + ((1 - t) * -82) + 'deg) translate3d(0,' + ((1 - t) * -3) + 'svh,0)';
        return;
      }
      for (var i = 0; i < ws.length; i++) {
        var st = i / ws.length * 0.75, t2 = U.ease.out(U.seg(inn, st, st + 0.35));
        ws[i].style.opacity = t2;
        if (style === 'words') ws[i].style.transform = calm ? 'none' : 'translate3d(0,' + ((1 - t2) * 0.55) + 'em,0)';
        else ws[i].style.transform = calm ? 'none' : 'translate3d(' + ((i % 2 ? 1 : -1) * (1 - t2) * 55) + 'vw,0,0)';
      }
    });
    return { el: box, destroy: function () { unsub(); box.remove(); } };
  };

  /* ---------- caption ---------- */
  Bagel.text.caption = function (layer, ctx, o) {
    var a = o.a, b = o.b, mode = o.mode || 'accent', group = o.group || ('cap' + a);
    var th = Bagel.text.theme, accent = o.accent || th.accent, base = th.base;
    var box = el('div', { 'class': 'cap' }, layer); place(box, o);
    if (o.kicker) el('span', { 'class': 'kicker', 'data-gate': 'text', 'data-gate-group': group, text: o.kicker }, box);
    var head = o.head ? el('h2', { 'data-gate': 'text', 'data-gate-group': group, html: o.head }, box) : null;
    var body = el('div', { 'class': 'body' }, box);
    var lines = (o.lines || []).slice(0, 3).map(function (t) { return el('span', { 'class': 's', 'data-gate': 'text', 'data-gate-group': group, html: t }, body); });
    var unsub = ctx.timeline.subscribe(function (p) {
      var len = b - a;
      var inn = U.ease.out(U.seg(p, a, a + Math.min(0.022, len * 0.2))), out = U.ease.inout(U.seg(p, b - Math.min(0.022, len * 0.2), b));
      var vis = p > a - 0.01 && p < b + 0.01;
      box.style.visibility = vis ? 'visible' : 'hidden';
      box.style.opacity = inn * (1 - out);
      box.style.transform = 'translate3d(0,' + ((1 - inn) * 4 + out * -3) + 'svh,0)';
      if (!vis) return;
      /* sentences arrive one at a time across the first part of the stretch */
      var n = lines.length;
      lines.forEach(function (s, i) {
        var start = a + len * (0.14 + (n > 1 ? i * (0.5 / n) : 0)), t = U.ease.out(U.seg(p, start, start + len * 0.12));
        s.style.opacity = t;
        s.style.transform = 'translate3d(0,' + ((1 - t) * 0.6) + 'em,0)';
        if (mode === 'accent') s.style.color = mix(accent, base, U.seg(p, start + len * 0.05, start + len * 0.26));
        else if (mode === 'dim') { var next = i + 1 < n ? U.seg(p, a + len * (0.14 + (i + 1) * (0.5 / n)), a + len * (0.14 + (i + 1) * (0.5 / n) + 0.12)) : 0; s.style.color = mix(base, '#8a97ad', next * 0.8); }
        else s.style.color = base;
      });
    });
    return { el: box, destroy: function () { unsub(); box.remove(); } };
  };
})();
