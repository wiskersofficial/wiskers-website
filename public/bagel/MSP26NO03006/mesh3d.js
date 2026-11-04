/* Bagel.Mesh: a tiny software 3D renderer on a 2D canvas, for hero objects (craft, devices, buildings) that need real rotation and lighting.
 * No libraries, no WebGL, no media. Flat-shaded faces, painter's sort, back-face culling, a sun light, a cool fill light, a specular term for glossy kinds,
 * optional grid lines on a face (solar cells, panel seams), optional mask cells (coded masks), and a heat blend toward ember.
 *
 * World: x right, y up, z toward the viewer. Faces wind counter-clockwise seen from outside.
 *
 *   var parts = Bagel.Mesh.box(...)  -> faces        faces carry { p:[4 verts], c:[r,g,b], k:'matte'|'gloss'|'foil'|'dark', grid:{u,v,c}, mask:true }
 *   var r = Bagel.Mesh.renderer(ctx2d)
 *   r.draw(model, view) -> { bbox:[x0,y0,x1,y1] }
 *   model: { groups: { id: { faces:[...], t:{ pos:[x,y,z], rot:[rx,ry,rz], a:1 } } } }     per-group transform, pivot at group origin (0,0,0) unless faces say otherwise
 *   view:  { cx, cy, scale, yaw, pitch, roll, heat, t, persp }
 */
(function () {
  'use strict';
  var M = {};
  function hexc(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  M.hex = hexc;

  M.box = function (x0, y0, z0, x1, y1, z1, c, k, extra) {
    var f = [
      [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],   /* front  +z */
      [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]],   /* back   -z */
      [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]],   /* right  +x */
      [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]],   /* left   -x */
      [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]],   /* top    +y */
      [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]    /* bottom -y */
    ];
    return f.map(function (p, i) { var o = { p: p, c: hexc(c), k: k || 'matte' }; if (extra) for (var q in extra) o[q] = extra[q]; if (extra && extra.perFace && extra.perFace[i]) for (var w in extra.perFace[i]) o[w] = extra.perFace[i][w]; return o; });
  };
  /* cylinder along the y axis, from y0 to y1, centre (cx, cz) */
  M.cylinder = function (cx, cz, r, y0, y1, seg, c, k, caps) {
    var faces = [], i, a0, a1;
    for (i = 0; i < seg; i++) {
      a0 = i / seg * Math.PI * 2; a1 = (i + 1) / seg * Math.PI * 2;
      faces.push({ p: [[cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r], [cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r], [cx + Math.cos(a1) * r, y1, cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, y1, cz + Math.sin(a0) * r]], c: hexc(c), k: k || 'matte' });
    }
    if (caps) {
      var top = [], bot = [];
      for (i = 0; i < seg; i++) { a0 = i / seg * Math.PI * 2; top.push([cx + Math.cos(a0) * r, y1, cz + Math.sin(a0) * r]); bot.unshift([cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r]); }
      if (caps.top) faces.push({ p: top.slice().reverse(), c: hexc(caps.top), k: 'dark', poly: true });
      if (caps.bottom) faces.push({ p: bot.slice().reverse(), c: hexc(caps.bottom), k: 'dark', poly: true });
    }
    return faces;
  };
  /* a cone (dish) pointing along +z, apex at z1 */
  M.dish = function (cx, cy, cz, r, depth, seg, c, k) {
    var faces = [], i, a0, a1, ap = [cx, cy, cz + depth];
    for (i = 0; i < seg; i++) {
      a0 = i / seg * Math.PI * 2; a1 = (i + 1) / seg * Math.PI * 2;
      faces.push({ p: [[cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, cz], [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r, cz], ap, ap], c: hexc(c), k: k || 'gloss', tri: true });
    }
    return faces;
  };

  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function rot(v, rx, ry, rz) {
    var x = v[0], y = v[1], z = v[2], c, s, t;
    if (rz) { c = Math.cos(rz); s = Math.sin(rz); t = x * c - y * s; y = x * s + y * c; x = t; }
    if (rx) { c = Math.cos(rx); s = Math.sin(rx); t = y * c - z * s; z = y * s + z * c; y = t; }
    if (ry) { c = Math.cos(ry); s = Math.sin(ry); t = x * c + z * s; z = -x * s + z * c; x = t; }
    return [x, y, z];
  }
  function hash(n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

  var SUN = norm([-0.55, 0.75, 0.55]), FILL = norm([0.2, -1, 0.35]);
  var EMBER = [255, 122, 61];

  M.renderer = function (g) {
    return {
      draw: function (model, v) {
        var out = [], gid, i, j, k;
        var f = v.persp || 7;
        var bb = [1e9, 1e9, -1e9, -1e9];
        for (gid in model.groups) {
          var grp = model.groups[gid], t = grp.t || {}, pos = t.pos || [0, 0, 0], r3 = t.rot || [0, 0, 0], ga = t.a == null ? 1 : t.a, sc = t.s == null ? 1 : t.s;
          if (ga <= 0.01) continue;
          for (i = 0; i < grp.faces.length; i++) {
            var fc = grp.faces[i], P = [], n = fc.p.length;
            for (j = 0; j < n; j++) {
              var q = [fc.p[j][0] * sc, fc.p[j][1] * sc, fc.p[j][2] * sc];
              q = rot(q, r3[0], r3[1], r3[2]);
              q = [q[0] + pos[0], q[1] + pos[1], q[2] + pos[2]];
              q = rot(q, v.pitch || 0, v.yaw || 0, v.roll || 0);
              P.push(q);
            }
            var nrm = norm(cross(sub(P[1], P[0]), sub(P[2], P[0])));
            if (fc.tri) nrm = norm(cross(sub(P[1], P[0]), sub(P[2], P[0])));
            var cen = [0, 0, 0]; for (j = 0; j < n; j++) { cen[0] += P[j][0] / n; cen[1] += P[j][1] / n; cen[2] += P[j][2] / n; }
            var toViewer = norm([-cen[0] * 0.0, -cen[1] * 0.0, f - cen[2]]);
            if (!fc.double && dot(nrm, toViewer) <= 0.02) continue;      /* back face */
            out.push({ f: fc, P: P, n: nrm, z: cen[2], a: ga, id: i + gid.length * 97 });
          }
        }
        out.sort(function (A, B) { return A.z - B.z; });
        var heat = v.heat || 0, s = v.scale;
        for (k = 0; k < out.length; k++) {
          var o = out[k], fc2 = o.f, c = fc2.c;
          var lam = Math.max(0, dot(o.n, SUN)), fill = Math.max(0, dot(o.n, FILL));
          var spec = 0;
          if (fc2.k === 'gloss' || fc2.k === 'foil') { var rr = norm([2 * dot(o.n, SUN) * o.n[0] - SUN[0], 2 * dot(o.n, SUN) * o.n[1] - SUN[1], 2 * dot(o.n, SUN) * o.n[2] - SUN[2]]); spec = Math.pow(Math.max(0, rr[2]), fc2.k === 'foil' ? 10 : 22) * (fc2.k === 'foil' ? 0.55 : 0.9); }
          var dark = fc2.k === 'dark' ? 0.55 : 1;
          var R = c[0] * (0.2 + 0.85 * lam) * dark + 30 * fill + 255 * spec;
          var G = c[1] * (0.22 + 0.85 * lam) * dark + 90 * fill + 255 * spec;
          var Bc = c[2] * (0.3 + 0.8 * lam) * dark + 190 * fill + 255 * spec;
          if (heat > 0) { var hh = heat * (0.55 + 0.45 * hash(o.id + Math.floor((v.t || 0) * 6))); R = R + (EMBER[0] - R) * hh; G = G + (EMBER[1] - G) * hh * 0.9; Bc = Bc + (EMBER[2] - Bc) * hh * 0.8; }
          R = Math.min(255, R); G = Math.min(255, G); Bc = Math.min(255, Bc);
          var pts = [];
          for (j = 0; j < o.P.length; j++) { var sc2 = f / (f - o.P[j][2]); pts.push([v.cx + o.P[j][0] * sc2 * s, v.cy - o.P[j][1] * sc2 * s]); }
          g.globalAlpha = o.a;
          g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
          for (j = 1; j < pts.length; j++) g.lineTo(pts[j][0], pts[j][1]);
          g.closePath();
          g.fillStyle = 'rgb(' + (R | 0) + ',' + (G | 0) + ',' + (Bc | 0) + ')'; g.fill();
          if (fc2.k === 'gloss' && fc2.grid && pts.length === 4) {            /* soft sheen across glossy panels */
            var sg = g.createLinearGradient(pts[0][0], pts[0][1], pts[2][0], pts[2][1]);
            sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.42, 'rgba(210,230,255,' + (0.05 + 0.28 * lam) .toFixed(3) + ')'); sg.addColorStop(0.55, 'rgba(255,255,255,0)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = sg; g.fill();
          }
          g.lineWidth = 0.7; g.strokeStyle = 'rgba(8,14,30,' + (0.45 * o.a).toFixed(2) + ')'; g.stroke();
          for (j = 0; j < pts.length; j++) { if (pts[j][0] < bb[0]) bb[0] = pts[j][0]; if (pts[j][1] < bb[1]) bb[1] = pts[j][1]; if (pts[j][0] > bb[2]) bb[2] = pts[j][0]; if (pts[j][1] > bb[3]) bb[3] = pts[j][1]; }
          if (fc2.grid && pts.length === 4) {                      /* seams or cells, interpolated across the projected quad */
            var gr = fc2.grid; g.strokeStyle = 'rgba(' + gr.c + ',' + (0.55 * o.a).toFixed(2) + ')'; g.lineWidth = 0.6; g.beginPath();
            for (j = 1; j < gr.u; j++) { var tt = j / gr.u; g.moveTo(pts[0][0] + (pts[1][0] - pts[0][0]) * tt, pts[0][1] + (pts[1][1] - pts[0][1]) * tt); g.lineTo(pts[3][0] + (pts[2][0] - pts[3][0]) * tt, pts[3][1] + (pts[2][1] - pts[3][1]) * tt); }
            for (j = 1; j < gr.v; j++) { var tv = j / gr.v; g.moveTo(pts[0][0] + (pts[3][0] - pts[0][0]) * tv, pts[0][1] + (pts[3][1] - pts[0][1]) * tv); g.lineTo(pts[1][0] + (pts[2][0] - pts[1][0]) * tv, pts[1][1] + (pts[2][1] - pts[1][1]) * tv); }
            g.stroke();
          }
          if (fc2.mask && pts.length === 4) {                      /* coded-mask cells */
            var mu = fc2.mask.u, mv = fc2.mask.v; g.fillStyle = 'rgba(6,10,24,' + (0.62 * o.a).toFixed(2) + ')';
            for (var iu = 0; iu < mu; iu++) for (var iv = 0; iv < mv; iv++) {
              if (hash(iu * 31 + iv * 17 + 3) < 0.5) continue;
              var u0 = iu / mu, u1 = (iu + 0.82) / mu, v0 = iv / mv, v1 = (iv + 0.82) / mv;
              function pp(uu, vv) { var ax = pts[0][0] + (pts[1][0] - pts[0][0]) * uu, ay = pts[0][1] + (pts[1][1] - pts[0][1]) * uu, bx = pts[3][0] + (pts[2][0] - pts[3][0]) * uu, by = pts[3][1] + (pts[2][1] - pts[3][1]) * uu; return [ax + (bx - ax) * vv, ay + (by - ay) * vv]; }
              var A1 = pp(u0, v0), B1 = pp(u1, v0), C1 = pp(u1, v1), D1 = pp(u0, v1);
              g.beginPath(); g.moveTo(A1[0], A1[1]); g.lineTo(B1[0], B1[1]); g.lineTo(C1[0], C1[1]); g.lineTo(D1[0], D1[1]); g.closePath(); g.fill();
            }
          }
        }
        g.globalAlpha = 1;
        return { bbox: bb };
      }
    };
  };
  Bagel.Mesh = M;
})();
