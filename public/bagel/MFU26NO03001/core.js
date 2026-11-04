/* Bagel slice contract, first draft (T3).
 *
 *   Slice.mount(container, ctx) -> { destroy() }
 *
 * ctx (everything a slice may use from its surroundings):
 *   ctx.timeline.subscribe(fn(p, t, dt)) -> unsubscribe   one shared, smoothed 0..1 scroll timeline, one rAF loop
 *   ctx.reducedMotion()                  -> boolean         live value
 *   ctx.haptic.play(name)                                   tick | stamp | thud | burst | snap
 *   ctx.gesture.drag(el, {start, move, end}) -> unbind     normalised horizontal drag, vertical scroll left to the feed
 *   ctx.onCleanup(fn)                                       run when the slice leaves
 *   ctx.weight                                              declared weight, set by the slice
 *
 * The standalone host below stands in for the feed. In the feed, the same ctx is supplied by the feed.
 */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SVGTAGS = { svg: 1, g: 1, path: 1, rect: 1, circle: 1, line: 1, text: 1, defs: 1, pattern: 1, clipPath: 1, polygon: 1, polyline: 1, ellipse: 1, linearGradient: 1, stop: 1 };

  function el(tag, attrs, parent) {
    var n = SVGTAGS[tag] ? document.createElementNS(NS, tag) : document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'style') n.style.cssText = v;
      else n.setAttribute(k, v);
    }
    if (parent) parent.appendChild(n);
    return n;
  }
  function clamp(x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.min(b, Math.max(a, x)); }
  function seg(p, a, b) { return clamp((p - a) / (b - a)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var ease = {
    out: function (t) { return 1 - Math.pow(1 - t, 3); },
    inout: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    back: function (t) { var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  };
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a += 0x6D2B79F5; var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /* hide a layer when the timeline is outside its window (keeps paint cost down) */
  function windowed(layer, a, b, pad) {
    pad = pad === undefined ? 0.02 : pad;
    return function (p) { layer.style.visibility = (p >= a - pad && p <= b + pad) ? 'visible' : 'hidden'; };
  }

  var registry = {};
  window.Bagel = {
    register: function (name, factory) { registry[name] = factory; },
    pieces: registry,
    util: { el: el, clamp: clamp, seg: seg, lerp: lerp, ease: ease, rng: rng, windowed: windowed }
  };

  /* ---------- standalone host: stands in for the feed ---------- */
  var PATTERNS = { tick: [8], snap: [12], stamp: [22], thud: [45], burst: [30, 40, 30, 40, 50] };

  window.Bagel.createScrollHost = function (scroller) {
    var subs = [], cleanups = [], cur = 0, last = performance.now(), raf = 0, dead = false;
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    function readP() {
      var max = scroller.offsetHeight - window.innerHeight;
      return max > 0 ? clamp(window.scrollY / max) : 0;
    }
    cur = readP();

    var haptic = {
      log: [],
      play: function (name) {
        var pat = PATTERNS[name] || PATTERNS.tick;
        haptic.log.push(name);
        try {
          if (window.BagelNative && window.BagelNative.haptic) return window.BagelNative.haptic(name); /* backend 1: native bridge */
          if (navigator.vibrate) return navigator.vibrate(pat);                                         /* backend 2: Vibration API */
        } catch (e) { /* backend 4: no-op */ }
      }
    };

    var gesture = {
      drag: function (node, h) {
        var id = null, rect = null;
        function down(e) {
          id = e.pointerId; rect = node.getBoundingClientRect();
          try { node.setPointerCapture(id); } catch (e2) {}
          h.start && h.start(clamp((e.clientX - rect.left) / rect.width), e);
        }
        function move(e) {
          if (id !== e.pointerId) return;
          h.move && h.move(clamp((e.clientX - rect.left) / rect.width), e);
        }
        function up(e) {
          if (id !== e.pointerId) return; id = null;
          h.end && h.end(e);
        }
        node.addEventListener('pointerdown', down);
        node.addEventListener('pointermove', move);
        node.addEventListener('pointerup', up);
        node.addEventListener('pointercancel', up);
        return function () {
          node.removeEventListener('pointerdown', down);
          node.removeEventListener('pointermove', move);
          node.removeEventListener('pointerup', up);
          node.removeEventListener('pointercancel', up);
        };
      }
    };

    function loop(now) {
      if (dead) return;
      raf = requestAnimationFrame(loop);                  /* schedule first: one failing piece must never stop the feed */
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var target = readP();
      cur = mq.matches ? target : cur + (target - cur) * (1 - Math.exp(-dt * 10));
      if (Math.abs(target - cur) < 1e-5) cur = target;
      for (var i = 0; i < subs.length; i++) {
        try { subs[i](cur, now / 1000, dt); } catch (e) { if (!loop.warned) { loop.warned = 1; console.error('slice piece failed:', e); } }
      }
    }
    raf = requestAnimationFrame(loop);

    return {
      timeline: { subscribe: function (fn) { subs.push(fn); return function () { var i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); }; } },
      reducedMotion: function () { return mq.matches; },
      haptic: haptic,
      gesture: gesture,
      onCleanup: function (fn) { cleanups.push(fn); },
      weight: {},
      destroy: function () {
        dead = true; cancelAnimationFrame(raf);
        while (cleanups.length) { try { cleanups.pop()(); } catch (e) {} }
        subs.length = 0;
      }
    };
  };
})();
