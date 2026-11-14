// The chapel's windows, drawn as leaded glass: each piece of glass cut and filled with its own
// colour (a little lighter or darker than its neighbours, streaked, with a seed bubble or two),
// shaded at its edges with paint, lettering painted on a banderole, and the leads laid over
// everything. Plain 2D canvas, no three.js, so the windows can be looked at on their own.
//
// The canvas is what the glass lets through: lead is black, pale glass nearly white. The chapel
// (chapel.js) lights it from behind with the sky.
//
//   W1 murmuration      starlings over reeds at dusk, in the tall light over the door
//   W2 broken symmetry  roundels with compass needles: hot and disordered above, cold, packed and
//                       all pointing one chosen way below (Anderson's crystal and magnet)
//   W3 Life             Conway's game on the quarries; the only window that moves (lifeStep)
//   W4 Turing           a daisy head over an animal's coat, spots running into stripes
//   W5 eigen-behaviour  a tangle smoothed by the same operation again and again until a ball
//   W6 the neuron       a pyramidal cell in black paint on amber, after Ramón y Cajal
//   W7 ingressing minds the great window: the regular solids in the head, and plain forms coming down
//                       into a cell, flatworms, gears, a slime mould, a frog and xenobots
//   W8 a strange loop   a ring of steps that climbs all the way round to where it began, Gödel's
//                       numbering on its treads, the ring again inside it, a clear roundel at the heart
//
// On Vesper Street the tall windows are round-headed lights 376 by 1285 (TALL), and every picture is drawn
// for the whole of that opening (tall(), below): the subject up into the arch, the border round it, a
// ribbon of words over a sill course at the foot. The end window (W7) is the great one: three such lights
// and three roundels under one arch (greatPlan), 1400 by 2016, at the same scale and in the same border.
//
// Every window carries words, in one hand and one size (inscription(), below), large enough to read
// from the middle of the floor. Under each tall window is a short one (lowLight, at the end): pale
// quarries in the same border, and one small roundel that answers the picture above it.
//
// Some of the drawing is slow-ish (the Turing coat is grown by reaction and diffusion), so every
// window is drawn by a generator that yields now and then: chapel.js spreads the work over frames.

const TAU = Math.PI * 2;
export const FONT = '"Goudy House", "Sorts Mill Goudy", "Iowan Old Style", Palatino, Georgia, serif';
export const rng = seed => { let s = (seed >>> 0) || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ---- colours: [hue, saturation, lightness] ------------------------------------------------------
const C = {
  blue: [222, 70, 30], deep: [228, 72, 20], azure: [206, 64, 46], ruby: [350, 78, 34], rose: [348, 55, 62],
  amber: [38, 88, 50], gold: [46, 90, 60], straw: [48, 60, 82], white: [70, 22, 88], green: [128, 48, 30],
  emerald: [160, 70, 28], leaf: [96, 46, 40], violet: [276, 48, 32], purple: [290, 40, 24], umber: [24, 60, 18],
  flesh: [20, 58, 74], teal: [184, 58, 30], ice: [200, 40, 82], orange: [24, 86, 48], grey: [210, 10, 55],
};
const hsl = ([h, s, l], a = 1) => `hsla(${h.toFixed(1)},${clamp(s, 0, 100).toFixed(1)}%,${clamp(l, 0, 100).toFixed(1)}%,${a})`;
const lerpC = (a, b, t) => { let dh = b[0] - a[0]; if (dh > 180) dh -= 360; if (dh < -180) dh += 360; return [(a[0] + dh * t + 360) % 360, mix(a[1], b[1], t), mix(a[2], b[2], t)]; };
const shift = ([h, s, l], dh = 0, ds = 0, dl = 0) => [(h + dh + 360) % 360, s + ds, l + dl];

// ---- polygons ----------------------------------------------------------------------------------
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const circle = (cx, cy, r, n = 40, rot = 0) => Array.from({ length: n }, (_, i) => [cx + Math.cos(rot + (i / n) * TAU) * r, cy + Math.sin(rot + (i / n) * TAU) * r]);
const ellipse = (cx, cy, rx, ry, rot = 0, n = 36) => Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
function centroid(p) { let x = 0, y = 0; for (const q of p) { x += q[0]; y += q[1]; } return [x / p.length, y / p.length]; }
function area(p) { let a = 0; for (let i = 0; i < p.length; i++) { const [x0, y0] = p[i], [x1, y1] = p[(i + 1) % p.length]; a += x0 * y1 - x1 * y0; } return Math.abs(a) / 2; }
// keep the part of a convex-or-not polygon where a*x + b*y <= c
function clipHalf(poly, a, b, c) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i], Q = poly[(i + 1) % poly.length], dp = a * P[0] + b * P[1] - c, dq = a * Q[0] + b * Q[1] - c;
    if (dp <= 0) out.push(P);
    if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) { const t = dp / (dp - dq); out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]); }
  }
  return out;
}
// Voronoi cells of the sites inside a convex outline: the irregular hand-cut pieces of a background
function voronoi(sites, outline) {
  return sites.map((s, i) => {
    let p = outline;
    for (let j = 0; j < sites.length && p.length > 2; j++) {
      if (j === i) continue;
      const o = sites[j], dx = o[0] - s[0], dy = o[1] - s[1];
      if (dx * dx + dy * dy > 6e4) continue;
      p = clipHalf(p, dx, dy, (dx * (s[0] + o[0]) + dy * (s[1] + o[1])) / 2);
    }
    return p;
  }).filter(p => p.length > 2);
}
// Sites spread evenly but not regularly (a few relaxation passes of dart throwing)
function sitesIn(test, bx0, by0, bx1, by1, n, r, minD) {
  const out = [];
  for (let k = 0; k < n * 40 && out.length < n; k++) {
    const x = bx0 + r() * (bx1 - bx0), y = by0 + r() * (by1 - by0);
    if (!test(x, y)) continue;
    const d = typeof minD === 'function' ? minD(x, y) : minD;
    if (out.some(q => (q[0] - x) ** 2 + (q[1] - y) ** 2 < d * d)) continue;
    out.push([x, y]);
  }
  return out;
}
// Inset a convex polygon (counter-clockwise or clockwise) by d
function inset(poly, d) {
  const n = poly.length, sgn = signedArea(poly) > 0 ? 1 : -1, lines = [];
  for (let i = 0; i < n; i++) {
    const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % n], len = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / len * sgn, ny = (x1 - x0) / len * sgn;
    lines.push([x0 + nx * d, y0 + ny * d, x1 - x0, y1 - y0]);
  }
  return lines.map((L, i) => { const M = lines[(i + n - 1) % n]; const den = M[2] * L[3] - M[3] * L[2]; const t = ((L[0] - M[0]) * L[3] - (L[1] - M[1]) * L[2]) / den; return [M[0] + M[2] * t, M[1] + M[3] * t]; });
}
function signedArea(p) { let a = 0; for (let i = 0; i < p.length; i++) { const [x0, y0] = p[i], [x1, y1] = p[(i + 1) % p.length]; a += x0 * y1 - x1 * y0; } return a / 2; }
const path = (g, polys) => { g.beginPath(); for (const p of polys) { g.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]); g.closePath(); } };
const inPolyPt = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, yi] = p[i], [xj, yj] = p[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };

// ---- the glazier's hand ---------------------------------------------------------------------------
// One piece of glass: its colour varies a little, it is streaky and seedy as blown glass is, and the
// painter has shaded it toward its edges. polys: one outline, or several (holes, by even-odd).
function glass(g, polys, col, r, o = {}) {
  if (!polys.length || !polys[0].length) return;
  if (!Array.isArray(polys[0][0])) polys = [polys];
  polys = polys.filter(p => p.length > 2); if (!polys.length) return;
  const c = shift(col, (r() - 0.5) * (o.hj ?? 7), (r() - 0.5) * 8, (r() - 0.5) * (o.lj ?? 9));
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of polys) for (const [x, y] of p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const w = x1 - x0, h = y1 - y0, sz = Math.max(w, h);
  g.save(); path(g, polys); g.clip('evenodd');
  // thicker and thinner across the sheet
  const a = r() * TAU, gr = g.createLinearGradient(x0 + w / 2 - Math.cos(a) * sz / 2, y0 + h / 2 - Math.sin(a) * sz / 2, x0 + w / 2 + Math.cos(a) * sz / 2, y0 + h / 2 + Math.sin(a) * sz / 2);
  gr.addColorStop(0, hsl(shift(c, 0, 4, 7))); gr.addColorStop(0.55, hsl(c)); gr.addColorStop(1, hsl(shift(c, 2, 6, -9)));
  g.fillStyle = gr; g.fillRect(x0 - 2, y0 - 2, w + 4, h + 4);
  // streaks, all one way in a sheet, wavering
  const sa = r() * TAU, ns = Math.min(18, 3 + (w * h) / 900), ca = Math.cos(sa), sa2 = Math.sin(sa);
  for (let i = 0; i < ns; i++) {
    const off = (r() - 0.5) * sz * 1.4, cx = x0 + w / 2 - sa2 * off, cy = y0 + h / 2 + ca * off;
    g.strokeStyle = r() < 0.55 ? `rgba(255,250,235,${0.05 + r() * 0.09})` : `rgba(20,10,0,${0.04 + r() * 0.08})`;
    g.lineWidth = 0.8 + r() * (o.streak ?? 3.5); g.beginPath();
    g.moveTo(cx - ca * sz, cy - sa2 * sz);
    g.bezierCurveTo(cx - ca * sz * 0.3 + (r() - 0.5) * 10, cy - sa2 * sz * 0.3 + (r() - 0.5) * 10, cx + ca * sz * 0.3 + (r() - 0.5) * 10, cy + sa2 * sz * 0.3 + (r() - 0.5) * 10, cx + ca * sz, cy + sa2 * sz);
    g.stroke();
  }
  // seeds: little bubbles
  for (let i = 0, n = Math.floor((w * h) / 2500 * r()); i < n; i++) { g.fillStyle = `rgba(255,255,240,${0.2 + r() * 0.3})`; g.beginPath(); g.ellipse(x0 + r() * w, y0 + r() * h, 0.6 + r() * 1.4, 0.5 + r(), r() * 3, 0, TAU); g.fill(); }
  // the painter's shading toward the edges (a matt of brown paint, brushed off the middle)
  if (o.matt !== 0) { g.strokeStyle = `rgba(48,30,14,${o.matt ?? 0.32})`; g.lineWidth = o.mattW ?? 12; g.lineJoin = 'round'; path(g, polys); g.stroke(); g.lineWidth = (o.mattW ?? 12) * 0.4; g.strokeStyle = `rgba(40,24,10,${(o.matt ?? 0.32) * 0.8})`; g.stroke(); }
  g.restore();
}
// Leads over the joins: a black came, slightly irregular
function leads(g, polys, w, r) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  for (const p of polys) {
    if (!p.length || !p[0].length) continue;
    const ps = Array.isArray(p[0][0]) ? p : [p];
    g.strokeStyle = '#0d0b09'; g.lineWidth = w * (0.85 + r() * 0.3); path(g, ps); g.stroke();
  }
}
// Paint: grisaille lines and washes
const paint = (a = 0.85) => `rgba(28,17,9,${a})`;

// ---- the border shared by all the windows ----------------------------------------------------------
// A narrow fillet of pale glass, then a band of deep blue cut in lengths, a ruby or amber jewel at
// every joint. Returns the inner outline and the pieces' outlines (for the leads).
function border(g, outline, r, unit, o = {}) {
  const pieces = [], n = outline.length, d1 = unit * 0.5, d2 = unit * 1.55;
  const A = outline, B = inset(outline, d1), Cc = inset(outline, d2), D = inset(outline, d2 + unit * 0.22);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, len = Math.hypot(A[j][0] - A[i][0], A[j][1] - A[i][1]), segs = Math.max(1, Math.round(len / (unit * 4.2)));
    for (let s = 0; s < segs; s++) {
      const t0 = s / segs, t1 = (s + 1) / segs, L = (P, Q, t) => [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t];
      const fil = [L(A[i], A[j], t0), L(A[i], A[j], t1), L(B[i], B[j], t1), L(B[i], B[j], t0)];
      glass(g, fil, o.fillet ?? C.white, r, { matt: 0.18, mattW: 5 }); pieces.push(fil);
      // the band, with a square jewel at its start
      const tj = Math.min(0.3 * (t1 - t0), unit * 1.05 / len);
      const jewel = [L(B[i], B[j], t0), L(B[i], B[j], t0 + tj), L(Cc[i], Cc[j], t0 + tj), L(Cc[i], Cc[j], t0)];
      const band = [L(B[i], B[j], t0 + tj), L(B[i], B[j], t1), L(Cc[i], Cc[j], t1), L(Cc[i], Cc[j], t0 + tj)];
      glass(g, band, o.band ?? C.blue, r, { mattW: 8 }); pieces.push(band);
      glass(g, jewel, (i + s) % 2 ? (o.jewelA ?? C.ruby) : (o.jewelB ?? C.amber), r, { mattW: 6 }); pieces.push(jewel);
    }
    const inner = [Cc[i], Cc[j], D[j], D[i]];
    glass(g, inner, o.inner ?? C.gold, r, { matt: 0.2, mattW: 4 }); pieces.push(inner);
  }
  return { inner: D, pieces };
}
// ---- lettering ----------------------------------------------------------------------------------------
// Set by hand: each letter placed, small capitals made from capitals, spaced a little open.
function setLine(g, text, x, y, size, o = {}) {
  const caps = o.caps, italic = o.italic, track = o.track ?? 0.04;
  const runs = [];
  for (const ch of text) {
    if (caps && ch !== ch.toUpperCase()) runs.push([ch.toUpperCase(), size * 0.76]); else runs.push([ch, size]);
  }
  const font = s => `${italic ? 'italic ' : ''}${s.toFixed(1)}px ${FONT}`;
  let w = 0; for (const [ch, s] of runs) { g.font = font(s); w += g.measureText(ch).width + s * track; }
  w -= (runs.at(-1)?.[1] ?? 0) * track;
  if (o.measure) return w;
  let cx = o.align === 'left' ? x : x - w / 2;
  g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  for (const [ch, s] of runs) { g.font = font(s); const cw = g.measureText(ch).width, yy = y + (o.yAt ? o.yAt(cx + cw / 2) : 0); g.fillText(ch, cx, yy); if (o.bold) { g.lineWidth = s * o.bold; g.lineJoin = 'round'; g.strokeText(ch, cx, yy); } cx += cw + s * track; }
  return w;
}
// A banderole: a ribbon of pale glass with its ends turned under, lettered in brown paint.
// lines: [{ text, size, caps, italic }]. Returns its pieces.
function banderole(g, x0, x1, yc, h, lines, r, o = {}) {
  const pieces = [], fold = o.fold ?? h * 0.5, wave = o.wave ?? h * 0.05, n = 1;
  const top = x => yc - h / 2 + Math.sin((x - x0) / (x1 - x0) * Math.PI * 2) * wave, bot = x => top(x) + h;
  // the turned-under ends, in a deeper tone (the back of the ribbon)
  for (const s of [-1, 1]) {
    const xe = s < 0 ? x0 : x1, yt = top(xe) + h * 0.32, p = [[xe, yt], [xe + s * fold * 1.25, yt - h * 0.12], [xe + s * fold * 0.8, yt + h * 0.45], [xe + s * fold * 1.25, yt + h * 1.0], [xe, yt + h * 0.95]];
    glass(g, p, o.back ?? shift(C.straw, -8, 10, -22), r, { mattW: 7 }); pieces.push(p);
  }
  for (let i = 0; i < n; i++) {
    const a = x0 + (x1 - x0) * i / n, b = x0 + (x1 - x0) * (i + 1) / n, p = [];
    for (let k = 0; k <= 8; k++) { const x = a + (b - a) * k / 8; p.push([x, top(x)]); }
    for (let k = 8; k >= 0; k--) { const x = a + (b - a) * k / 8; p.push([x, bot(x)]); }
    glass(g, p, o.col ?? [46, 38, 90], r, { matt: 0.14, mattW: 7, lj: 2, hj: 3, streak: 1.2 }); pieces.push(p);
  }
  // a painted rule along each edge, as on a scroll
  g.strokeStyle = paint(0.55); g.lineWidth = 1.2;
  for (const f of [x => top(x) + h * 0.12, x => bot(x) - h * 0.12]) { g.beginPath(); for (let x = x0 + 6; x <= x1 - 6; x += 4) { const y = f(x); x === x0 + 6 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
  // the letters follow the ribbon's wave; the block of lines is fitted to the ribbon and centred on it
  g.fillStyle = paint(1); g.strokeStyle = paint(1);
  const room = h * 0.8, block = ls => ls[0].size * 0.7 + ls.slice(1).reduce((s2, l) => s2 + l.size * (l.lead ?? 1.15), 0) + ls.at(-1).size * 0.18;
  let k = Math.min(1, room / block(lines));
  const fit = lines.map(l => ({ ...l, size: l.size * k })), xm = (x0 + x1) / 2;
  for (const l of fit) { const w = setLine(g, l.text, 0, 0, l.size, { ...l, measure: true }); if (w > (x1 - x0) * 0.86) l.size *= (x1 - x0) * 0.86 / w; }
  let y = yc - block(fit) / 2 + fit[0].size * 0.7;
  fit.forEach((l, i) => {
    if (i) y += l.size * (l.lead ?? 1.15);
    setLine(g, l.text, xm, y, l.size, { ...l, bold: 0.035, yAt: x => top(x) - (yc - h / 2) });
  });
  return pieces;
}

// The words of a window: its lines in italic, then the credit in small capitals, all at one size in
// every window (TXT and CR, in the window's units, a seventeenth of its width), or a title in capitals.
// Returns the lines as banderole() takes them, the ribbon's height, and its options.
const TXT = 1.3, CR = 0.7;
function inscription(unit, lines, credit, title) {
  const ls = [];
  for (const t of [].concat(title ?? [])) ls.push({ text: t, size: unit * 1.2, track: 0.14, lead: ls.length ? 1.0 : 1 });
  for (const t of lines ?? []) ls.push({ text: t, size: unit * TXT, italic: true, lead: ls.length ? 1.04 : 1 });
  ls.push({ text: credit, size: unit * CR, caps: true, track: 0.12, lead: 1.3 });
  const block = ls[0].size * 0.7 + ls.slice(1).reduce((s2, l) => s2 + l.size * l.lead, 0) + ls.at(-1).size * 0.18;
  return { lines: ls, h: block / 0.8 + unit * 0.3, o: { fold: unit * 0.75, wave: unit * 0.15 } };
}
// ---- the tall opening ------------------------------------------------------------------------------
// The chapel's tall windows are round-headed lights, nearly three and a half times as high as they are wide.
// Every one is set out the same way, and its picture is composed inside that: a dark spandrel in each top
// corner with one small roundel, the shared border carried up the sides and round the arch, a sill course of
// the border's own glass across the foot, and four iron saddle bars at the same heights in every window.
// tall() returns the field left for the picture: its sides x0 and x1, its crown y0 and foot y1, the arch's
// centre (cx, sy: sy is the springing line too) and inner radius R, its outline, and a test for a point.
export const TALL = [376, 1285];
function tall(g, W, H, r, o = {}) {
  const unit = W / 17, R = W / 2, N = 12, band = o.band ?? C.blue, jA = o.jewelA ?? C.ruby, jB = o.jewelB ?? C.amber, sp = [];
  for (const s of [0, 1]) {
    const p = rect(s * R, 0, (s + 1) * R, R + unit); glass(g, p, [band[0], band[1] * 0.85, Math.min(band[2], 30) * 0.5], r, { mattW: 16, matt: 0.4 }); sp.push(p);
    const c = circle(s ? W - unit * 1.3 : unit * 1.3, unit * 1.3, unit * 0.7, 20); glass(g, c, s ? jA : jB, r, { mattW: 5 }); sp.push(c);
  }
  leads(g, sp, unit * 0.22, r);
  const out = [[W, H], [0, H]];
  for (let k = 0; k <= N; k++) { const a = Math.PI + k * Math.PI / N; out.push([R + Math.cos(a) * R, R + Math.sin(a) * R]); }
  const b = border(g, out, r, unit, o), D = b.inner, x0 = D[1][0], x1 = D[0][0], yb = D[0][1], y1 = yb - unit * 1.3, Ri = R * Math.cos(Math.PI / (2 * N)) - x0;
  const sill = [], sw = unit * 1.3, lw = (x1 - x0 - 3 * sw) / 4;
  for (let i = 0, x = x0; i < 7; i++) { const w = i % 2 ? sw : lw, p = rect(x, y1, x + w, yb); glass(g, p, i % 2 ? (i === 3 ? jA : jB) : shift(band, 0, 0, 3), r, { mattW: 7 }); sill.push(p); x += w; }
  leads(g, [...b.pieces, ...sill], unit * 0.22, r);
  const inner = clipHalf(D, 0, 1, y1), y0 = Math.min(...D.map(p => p[1]));
  const inside = (x, y, m = 0) => x > x0 + m && x < x1 - m && y < y1 - m && (y >= R || Math.hypot(x - R, y - R) < Ri - m);
  return { unit, x0, x1, y0, y1, cx: R, sy: R, R: Ri, inner, inside };
}
// The words go on a ribbon across the foot, just over the sill course; the picture runs on behind it
const ribbonTop = (f, ins) => f.y1 - f.unit * 0.45 - ins.h;
const ribbon = (g, f, ins, r) => banderole(g, f.x0 + f.unit * 0.6, f.x1 - f.unit * 0.6, f.y1 - f.unit * 0.45 - ins.h / 2, ins.h, ins.lines, r, ins.o);
const saddle = (g, f) => { g.fillStyle = '#0d0b09'; for (let k = 1; k <= 4; k++) g.fillRect(f.x0, f.sy + k * f.unit * 9.4 - f.unit * 0.07, f.x1 - f.x0, f.unit * 0.14); };

// ---- W1: a murmuration ----------------------------------------------------------------------------
// The light over the door: dusk from deep blue in the arch down to a band of gold, a reed bed across the foot
// with a few bulrushes standing up into the sky at either side, and the flock: a ball of birds in the round
// head, pouring down the sky in three long turns and folding over on itself as it goes.
function* murmuration(g, W, H, seed = 11) {
  const r = rng(seed), f = tall(g, W, H, r, { band: C.blue, jewelA: C.ruby, jewelB: C.amber }), { unit, x0, x1, y0, y1, cx } = f, pieces = [];
  const ins = inscription(unit, ['at each level', 'of complexity', 'entirely new', 'properties appear'], 'P. W. Anderson · 1972'), rt = ribbonTop(f, ins);
  const Sw = (x1 - x0) / 2, hor = rt - unit * 4.6, Hs = hor - y0;
  // dusk, with light still in it (the birds are dark paint, and must show): blue above, violet, rose, then a band of gold at the horizon
  const DUSK = [[226, 64, 35], [224, 62, 41], [272, 46, 50], [348, 58, 64]];
  const skyAt = y => { const t = (y - y0) / Hs; return t < 0.2 ? lerpC(DUSK[0], DUSK[1], t / 0.2) : t < 0.52 ? lerpC(DUSK[1], DUSK[2], (t - 0.2) / 0.32) : t < 0.8 ? lerpC(DUSK[2], DUSK[3], (t - 0.52) / 0.28) : lerpC(DUSK[3], C.gold, Math.min(1, (t - 0.8) / 0.15)); };
  const land = x => hor + Math.sin(x * 0.05) * unit * 0.4 + Math.sin(x * 0.013 + 1) * unit * 1.1;
  const sky = voronoi(sitesIn((x, y) => f.inside(x, y) && y < land(x) + unit, x0, y0, x1, y1, 120, r, unit * 2.7), f.inner);
  for (const p of sky) { const [, y] = centroid(p); glass(g, p, skyAt(y + (r() - 0.5) * unit * 1.2), r, { mattW: 10 }); pieces.push(p); }
  yield;
  // the land: a far line of trees and the reed bed, in purple and dark green, down to the sill
  {
    const far = [], near = [];
    for (let x = x0; x <= x1 + 5; x += 6) { far.push([Math.min(x, x1), land(x)]); near.push([Math.min(x, x1), land(x) + unit * 1.6 + Math.sin(x * 0.09) * unit * 0.4]); }
    const ground = [...far, [x1, y1], [x0, y1]], g2 = [...near, [x1, y1], [x0, y1]];
    glass(g, ground, shift(C.purple, -20, -10, -6), r, { mattW: 14 }); pieces.push(ground);
    glass(g, g2, shift(C.green, 0, -10, -12), r, { mattW: 12 }); pieces.push(g2);
    g.save(); path(g, [f.inner]); g.clip(); g.strokeStyle = paint(0.75);
    for (let i = 0; i < 110; i++) {      // reeds painted on, a seed head on some
      const x = x0 + r() * 2 * Sw, yb = land(x) + unit * 0.6 + r() * (y1 - land(x) - unit * 0.6), hgt = unit * (1.2 + r() * 2.6), lean = (r() - 0.4) * unit * 0.7;
      g.lineWidth = 1 + r(); g.beginPath(); g.moveTo(x, yb); g.quadraticCurveTo(x + lean * 0.3, yb - hgt * 0.6, x + lean, yb - hgt); g.stroke();
      if (r() < 0.3) { g.fillStyle = paint(0.8); g.beginPath(); g.ellipse(x + lean, yb - hgt, 1.8, 5, lean * 0.02, 0, TAU); g.fill(); }
    }
    for (let i = 0; i < 9; i++) {        // bulrushes, standing up against the gold at the sides
      const s = i % 2 ? 1 : -1, x = cx + s * Sw * (0.58 + r() * 0.36), yb = land(x) + unit * 1.5, hgt = unit * (3.4 + r() * 3.2), lean = -s * unit * (0.2 + r() * 0.8);
      g.strokeStyle = paint(0.88); g.lineWidth = 1.7; g.beginPath(); g.moveTo(x, yb); g.quadraticCurveTo(x + lean * 0.2, yb - hgt * 0.6, x + lean, yb - hgt); g.stroke();
      g.fillStyle = paint(0.9); g.beginPath(); g.ellipse(x + lean * 0.9, yb - hgt * 0.93, 2.3, unit * 0.42, lean * 0.012, 0, TAU); g.fill();
    }
    g.restore();
  }
  yield;
  // the flock: a wash of paint where it is thick, then thousands of small painted birds, the sheet of them
  // folding over on itself (darkest where it is seen edge-on)
  const P = Array.from({ length: 100 }, (_, i) => { const t = i / 99; return [cx + Sw * (0.12 + 0.46 * t ** 0.7) * Math.sin(t * 7.6 + 0.4), y0 + Hs * (0.085 + 0.78 * t) + Math.sin(t * 13) * Hs * 0.012]; });
  const pinch = (t, c) => 1 - 0.7 * Math.exp(-((t - c) ** 2) / 0.003);
  const wid = t => Sw * (0.1 + 0.3 * Math.sin(Math.PI * t) ** 0.8 + 0.3 * Math.exp(-((t - 0.07) ** 2) / 0.008)) * pinch(t, 0.34) * pinch(t, 0.66);
  const dens = (x, y) => { let d = 0; for (let i = 0; i < 100; i += 2) { const [px, py] = P[i], w = wid(i / 99) + 2, dd = ((x - px) ** 2 + (y - py) ** 2) / (w * w); if (dd < 9) d += Math.exp(-dd) * (0.4 + Sw * 0.035 / w); } return d; };
  g.save(); path(g, [f.inner]); g.clip();
  for (let i = 0; i < 100; i++) { const [px, py] = P[i], w = wid(i / 99) * 1.1 + 3, k = Math.min(0.26, 0.07 + Sw * 0.004 / w), gr = g.createRadialGradient(px, py, 0, px, py, w); gr.addColorStop(0, `rgba(24,10,20,${k})`); gr.addColorStop(1, 'rgba(24,10,20,0)'); g.fillStyle = gr; g.fillRect(px - w, py - w, 2 * w, 2 * w); }
  g.strokeStyle = paint(0.95); g.lineCap = 'round'; g.lineJoin = 'round';
  let n = 0;
  for (let k = 0; k < 220000 && n < 11000; k++) {
    if (k % 10000 === 9999) yield;
    const x = x0 + r() * 2 * Sw, y = y0 + r() * Hs;
    if (!f.inside(x, y, 3) || y > land(x) - 2) continue;
    const d = dens(x, y);
    if (r() > d * d * 0.35) continue;
    n++;
    const s = 1.2 + r() * 1.2, a = Math.sin(x * 0.02 + y * 0.03) * 0.6 + (r() - 0.5) * 0.5, up = 0.2 + r() * 0.9, c = Math.cos(a), sn = Math.sin(a);
    g.lineWidth = 0.9 + s * 0.25; g.beginPath();
    g.moveTo(x - c * s * 1.5 + sn * s * up, y - sn * s * 1.5 - c * s * up); g.lineTo(x, y); g.lineTo(x + c * s * 1.5 + sn * s * up, y + sn * s * 1.5 - c * s * up); g.stroke();
  }
  // a few stragglers out on their own
  for (let k = 0; k < 110; k++) { const x = x0 + unit + r() * (2 * Sw - 2 * unit), y = y0 + unit + r() * (Hs - unit * 2); if (!f.inside(x, y, 6) || y > land(x) - 6 || dens(x, y) > 0.3) continue; const s = 2; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x - s * 1.5, y - s * 0.6); g.lineTo(x, y); g.lineTo(x + s * 1.5, y - s * 0.6); g.stroke(); }
  g.restore();
  leads(g, pieces, unit * 0.22, r); pieces.length = 0;
  yield;
  pieces.push(...ribbon(g, f, ins, r));
  leads(g, pieces, unit * 0.22, r);
  saddle(g, f);
  return pieces;
}
// A starling in flight, from below: a pointed head, swept triangular wings, a short square tail
function bird(x, y, s, a) {
  const half = [[1.25, 0], [1.0, 0.1], [0.55, 0.16], [0.05, 1.3], [-0.25, 1.22], [-0.2, 0.22], [-0.75, 0.18], [-1.05, 0.3], [-1.1, 0]];
  const pts = [...half, ...half.slice(1, -1).reverse().map(([u, v]) => [u, -v])];
  return pts.map(([u, v]) => [x + (u * Math.cos(a) - v * Math.sin(a)) * s, y + (u * Math.sin(a) + v * Math.cos(a)) * s]);
}
// intersect any polygon with a convex outline
function clipPoly(p, outline) {
  let q = p; const sgn = signedArea(outline) > 0 ? 1 : -1;
  for (let i = 0; i < outline.length && q.length; i++) { const [x0, y0] = outline[i], [x1, y1] = outline[(i + 1) % outline.length], nx = -(y1 - y0) * sgn, ny = (x1 - x0) * sgn; q = clipHalf(q, -nx, -ny, -(nx * x0 + ny * y0)); }
  return q;
}

// ---- W2: broken symmetry ------------------------------------------------------------------------
// The whole height of the light is one cooling: in the round head the roundels float loose, hot and pointing
// every way; down the window they settle, and at the foot they are a crystal, packed, all pointing one way.
function* brokenSymmetry(g, W, H, seed = 22) {
  const r = rng(seed), f = tall(g, W, H, r, { band: C.violet }), { unit, x0, x1, y0, y1 } = f, pieces = [];
  const ins = inscription(unit, ['an entirely new', 'and very beautiful', 'symmetry'], 'P. W. Anderson · 1972'), top = y0, bot = ribbonTop(f, ins) - unit * 0.45;
  // the ground behind the roundels: pale glass, warm above and cool below
  const ground = voronoi(sitesIn((x, y) => f.inside(x, y), x0, y0, x1, y1, 90, r, unit * 2.6), f.inner);
  for (const p of ground) { const [, y] = centroid(p), t = smooth(top, bot, y); glass(g, p, lerpC([40, 55, 80], [205, 35, 80], t), r, { mattW: 10 }); pieces.push(p); }
  leads(g, pieces, unit * 0.22, r); pieces.length = 0;
  yield;
  // a hexagonal lattice, turned to an angle of its own choosing, shaken loose toward the top
  const R0 = unit * 0.98, a0 = 0.33, dirA = -1.15;                       // the lattice's angle, and the way every needle comes to point
  const ax = [Math.cos(a0) * 2 * R0 * 1.06, Math.sin(a0) * 2 * R0 * 1.06], ay = [Math.cos(a0 + Math.PI / 3) * 2 * R0 * 1.06, Math.sin(a0 + Math.PI / 3) * 2 * R0 * 1.06];
  const pts = [];
  for (let i = -36; i <= 36; i++) for (let j = -36; j <= 36; j++) {
    let x = (x0 + x1) / 2 + i * ax[0] + j * ay[0], y = (top + bot) / 2 + unit * 0.6 + i * ax[1] + j * ay[1];
    if (x < x0 - R0 || x > x1 + R0 || y < top - R0 || y > bot + R0) continue;
    const t = smooth(top + (bot - top) * 0.2, bot - (bot - top) * 0.3, y), heat = 1 - t;
    if (r() < 0.24 * heat) continue;                                         // the liquid is less dense
    x += (r() - 0.5) * 2.6 * R0 * heat; y += (r() - 0.5) * 2.6 * R0 * heat;
    pts.push({ x, y, heat, s: 0.82 + 0.18 * (1 - heat) + (r() - 0.5) * 0.3 * heat });
  }
  // let the shaken ones settle apart
  for (let it = 0; it < 30; it++) {
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const p = pts[i], q = pts[j], dx = q.x - p.x, dy = q.y - p.y; if (Math.abs(dx) > R0 * 3 || Math.abs(dy) > R0 * 3) continue;
      const d = Math.hypot(dx, dy) || 1, m = R0 * (p.s + q.s) * 1.02;
      if (d < m && (p.heat > 0.02 || q.heat > 0.02)) { const k = (m - d) / d * 0.5; if (p.heat > 0.02) { p.x -= dx * k; p.y -= dy * k; } if (q.heat > 0.02) { q.x += dx * k; q.y += dy * k; } }
    }
    if (it % 10 === 9) yield;
  }
  // domains: a slowly varying field of directions in between
  const field = (x, y) => Math.sin(x * 0.013 + 1.3) * 1.7 + Math.cos(y * 0.011 - x * 0.006) * 1.9 + Math.sin(y * 0.031 + 2) * 0.6;
  let done = 0;
  for (const p of pts) {
    const rad = R0 * p.s;
    if (!f.inside(p.x, p.y, rad + 2) || p.y + rad > bot) continue;
    const hot = p.heat, dir = dirA + hot * (hot > 0.6 ? (r() - 0.5) * TAU : field(p.x, p.y) * hot * 1.4);
    const col = hot > 0.55 ? [[350, 75, 38], [24, 85, 47], [38, 88, 52], [8, 70, 42], [330, 50, 40]][Math.floor(r() * 5)] : lerpC([300, 50, 34], C.blue, smooth(0.55, 0.05, hot));
    const disc = circle(p.x, p.y, rad, 30);
    glass(g, disc, col, r, { mattW: rad * 0.5, matt: 0.28 });
    // crown glass: the faint rings of a spun roundel
    g.save(); path(g, [disc]); g.clip();
    for (let k = 1; k < 4; k++) { g.strokeStyle = `rgba(255,250,230,${0.07 + 0.04 * k})`; g.lineWidth = 1.2; g.beginPath(); g.arc(p.x, p.y, rad * k / 4.2, 0, TAU); g.stroke(); }
    g.restore();
    // the needle: one half silver stain (yellow), one half painted dark
    const L = rad * 0.78, wN = rad * 0.2, c = Math.cos(dir), s = Math.sin(dir), px = -s, py = c;
    g.fillStyle = 'rgba(255,214,90,.92)'; g.beginPath(); g.moveTo(p.x + c * L, p.y + s * L); g.lineTo(p.x + px * wN, p.y + py * wN); g.lineTo(p.x - px * wN, p.y - py * wN); g.closePath(); g.fill();
    g.fillStyle = paint(0.82); g.beginPath(); g.moveTo(p.x - c * L, p.y - s * L); g.lineTo(p.x + px * wN, p.y + py * wN); g.lineTo(p.x - px * wN, p.y - py * wN); g.closePath(); g.fill();
    g.fillStyle = paint(0.9); g.beginPath(); g.arc(p.x, p.y, rad * 0.09, 0, TAU); g.fill();
    pieces.push(disc);
    if (++done % 40 === 0) yield;
  }
  yield;
  // the banderole across the foot, the crystal running on behind it
  pieces.push(...ribbon(g, f, ins, r));
  leads(g, pieces, unit * 0.22, r);
  saddle(g, f);
  return pieces;
}

// ---- W3: Life -----------------------------------------------------------------------------------------
// The whole light is the board: quarries from the crown of the arch (which cuts them, as a glazier would) down
// to the ribbon, and on behind it, for the board wraps round. A stream of gliders runs down it on the
// diagonal, past things that stay (blocks, beehives, boats, loaves) and things that blink. Cells born this
// step are gold, cells that stayed are ruby, cells that have just died keep a little warmth for one step.
// chapel.js calls step() about once a second while it is in view; a step redraws only the cells that changed.
export const LIFE = { cols: 22, rows: 88, tile: 22 };
const SEEDS = (() => {
  const L = [];
  const put = (ox, oy, rows) => rows.forEach((row, y) => [...row].forEach((c, x) => { if (c === 'O') L.push([ox + x, oy + y]); }));
  const glider = ['.O.', '..O', 'OOO'], block = ['OO', 'OO'], hive = ['.OO.', 'O..O', '.OO.'], boat = ['OO.', 'O.O', '.O.'], loaf = ['.OO.', 'O..O', '.O.O', '..O.'], toad = ['.OOO', 'OOO.'], beacon = ['OO..', 'OO..', '..OO', '..OO'];
  for (let k = 0; k < LIFE.rows; k += 11) put(1 + (k % 22), 1 + k, glider);   // all on the same diagonal band, eleven apart
  // things off the band (x - y well away from the gliders' diagonal, modulo 22); run for three thousand steps, nothing ever meets
  for (const [x, y, p] of [[15, 5, block], [19, 10, ['OOO']], [3, 16, hive], [10, 20, ['O', 'O', 'O']], [13, 26, boat], [17, 31, toad], [1, 37, loaf], [8, 43, beacon], [16, 50, ['OOO']], [19, 54, block], [2, 59, hive], [8, 65, boat], [12, 70, toad], [20, 75, ['O', 'O', 'O']], [1, 81, loaf]]) put(x, y, p);
  return L;
})();
export function makeLife(g, W, H, seed = 33) {
  const r = rng(seed), f = tall(g, W, H, r, { band: C.emerald, jewelA: C.ruby, jewelB: C.gold }), { unit, x0, x1, y0, y1 } = f, { cols, rows, tile } = LIFE;
  const ins = inscription(unit, ['Three to be born.', 'Two or three to stay.'], 'Life · J. H. Conway · 1970');
  const cw = (x1 - x0) / cols, ch = (y1 - y0) / rows, gx = x0, gy = y0, last = Math.floor((ribbonTop(f, ins) - unit * 0.35 - gy) / ch), pieces = [];
  // behind the ribbon, a strip of plain glass (the board goes on behind it, unseen)
  const below = rect(x0, gy + last * ch, x1, y1);
  glass(g, below, shift(C.white, 60, 10, -6), r, { mattW: 10 }); pieces.push(below);
  pieces.push(...ribbon(g, f, ins, r));
  leads(g, pieces, unit * 0.22, r);
  // four sheets of one square of the board (22 by 22, repeated down it), one per state; a step copies cells from them
  const mk = () => { const w = Math.ceil(cols * cw) + 2, h = Math.ceil(tile * ch) + 2; return typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h }); };
  const STATES = [
    (i, j) => { const f2 = Math.sin(i * 0.31 + j * TAU / tile) + Math.sin(j * TAU / tile - i * 0.17 + 2) * 0.8, t = (f2 + 1.8) / 3.6; return lerpC(lerpC([196, 34, 82], [52, 46, 82], t), [140, 22, 84], ((i * 7 + j * 13) % 5) / 9); },   // dead: old quarry glass, greenish, straw, a little blue
    () => [44, 92, 56],                                                     // born
    () => [356, 74, 38],                                                    // stayed
    () => [30, 50, 74],                                                     // just died
  ];
  const sheets = STATES.map((col, k) => {
    const c = mk(), q = c.getContext('2d'), rr = rng(seed + 7);           // the same streaks in every sheet, so a cell changes colour only
    for (let j = 0; j < tile; j++) for (let i = 0; i < cols; i++) {
      const p = rect(1 + i * cw, 1 + j * ch, 1 + (i + 1) * cw, 1 + (j + 1) * ch);
      glass(q, p, col(i, j), rr, { mattW: cw * 0.34, matt: k === 0 ? 0.22 : 0.3, streak: 2 });
      if (k === 1) { q.fillStyle = 'rgba(255,250,215,.35)'; q.beginPath(); q.arc(1 + (i + 0.5) * cw, 1 + (j + 0.5) * ch, cw * 0.18, 0, TAU); q.fill(); }
    }
    q.strokeStyle = '#0d0b09'; q.lineWidth = Math.max(2, cw * 0.3);
    for (let i = 0; i <= cols; i++) { q.beginPath(); q.moveTo(1 + i * cw, 0); q.lineTo(1 + i * cw, tile * ch + 2); q.stroke(); }
    for (let j = 0; j <= tile; j++) { q.beginPath(); q.moveTo(0, 1 + j * ch); q.lineTo(cols * cw + 2, 1 + j * ch); q.stroke(); }
    return c;
  });
  // the board
  const N = cols * rows, cur = new Uint8Array(N), nxt = new Uint8Array(N), shown = new Uint8Array(N).fill(255), state = new Uint8Array(N);
  for (const [x, y] of SEEDS) cur[((y % rows) * cols) + (x % cols)] = 1;
  for (let i = 0; i < N; i++) state[i] = cur[i] ? 2 : 0;
  // which quarries show: 0 not at all (outside the arch, or behind the ribbon), 1 whole, 2 cut by the arch
  const vis = new Uint8Array(N), arch = f.inner.filter(p => p[1] <= f.sy + 1);
  for (let j = 0; j < last; j++) for (let i = 0; i < cols; i++) {
    const X = gx + i * cw, Y = gy + j * ch, n = [[X, Y], [X + cw, Y], [X, Y + ch], [X + cw, Y + ch]].filter(([x, y]) => f.inside(x, y, -0.25)).length;
    vis[j * cols + i] = n === 4 ? 1 : (n || f.inside(X + cw / 2, Y + ch / 2)) ? 2 : 0;
  }
  const cell = k => { const i = k % cols, j = (k - i) / cols; g.drawImage(sheets[state[k]], i * cw, (j % tile) * ch, cw + 2, ch + 2, gx - 1 + i * cw, gy - 1 + j * ch, cw + 2, ch + 2); };
  const draw = () => {
    let cut = null;
    for (let k = 0; k < N; k++) {
      if (!vis[k] || shown[k] === state[k]) continue;
      shown[k] = state[k];
      if (vis[k] === 1) cell(k); else (cut ??= []).push(k);
    }
    if (!cut) return;
    g.save(); path(g, [f.inner]); g.clip(); cut.forEach(cell); g.restore();
    g.strokeStyle = '#0d0b09'; g.lineWidth = unit * 0.2; g.lineJoin = 'round'; g.beginPath(); arch.forEach(([x, y], n) => (n ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();      // (the lead round the arch, which the cut quarries run under)
  };
  const step = () => {
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      let n = 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (!di && !dj) continue; n += cur[((j + dj + rows) % rows) * cols + ((i + di + cols) % cols)]; }
      const k = j * cols + i, alive = cur[k];
      nxt[k] = n === 3 || (alive && n === 2) ? 1 : 0;
      state[k] = nxt[k] ? (alive ? 2 : 1) : (alive ? 3 : 0);
    }
    cur.set(nxt);
    draw();
  };
  draw();
  return { step, pieces, cur, board: { x: gx, y: gy, w: cols * cw, h: last * ch } };
}

// ---- W4: Turing -------------------------------------------------------------------------------------
// The daisy fills the round head, its rays out to the arch; under it the coat runs the whole height of the
// light, spots at the top drawing out into stripes by the foot, and on behind the ribbon.
function* turing(g, W, H, seed = 44) {
  const r = rng(seed), f = tall(g, W, H, r, { band: C.teal }), { unit, x0, x1, y0, y1, cx } = f, pieces = [];
  const ins = inscription(unit, ['a simplification and', 'an idealization, and', 'consequently a', 'falsification'], 'A. M. Turing · 1952');
  const dcx = cx, dcy = f.sy + unit * 0.4, DR = f.R * 0.93, coatTop = dcy + DR + unit * 0.9, coatBot = y1;
  // above: the daisy head on blue
  const skyP = voronoi(sitesIn((x, y) => f.inside(x, y) && Math.hypot(x - dcx, y - dcy) > DR * 0.9, x0, y0, x1, coatTop, 22, r, unit * 2.2), clipHalf(f.inner, 0, 1, coatTop));
  for (const p of skyP) { glass(g, p, shift(C.azure, 0, 0, -6 + r() * 6), r); pieces.push(p); }
  leads(g, pieces, unit * 0.22, r); pieces.length = 0;
  // ray florets, white tipped with rose
  const nr = 21;
  for (let i = 0; i < nr; i++) {
    const a = (i / nr) * TAU + 0.1, a0 = a - TAU / nr * 0.46, a1 = a + TAU / nr * 0.46, rin = DR * 0.5, rout = DR * (0.96 + r() * 0.04);
    const p = [[dcx + Math.cos(a0) * rin, dcy + Math.sin(a0) * rin], [dcx + Math.cos(a0) * rout * 0.86, dcy + Math.sin(a0) * rout * 0.86], [dcx + Math.cos(a) * rout, dcy + Math.sin(a) * rout], [dcx + Math.cos(a1) * rout * 0.86, dcy + Math.sin(a1) * rout * 0.86], [dcx + Math.cos(a1) * rin, dcy + Math.sin(a1) * rin]];
    glass(g, p, i % 3 ? C.white : shift(C.rose, 0, -20, 18), r, { mattW: 7 }); pieces.push(p);
    g.strokeStyle = paint(0.35); g.lineWidth = 1; g.beginPath(); g.moveTo(dcx + Math.cos(a) * rin * 1.1, dcy + Math.sin(a) * rin * 1.1); g.lineTo(dcx + Math.cos(a) * rout * 0.85, dcy + Math.sin(a) * rout * 0.85); g.stroke();
  }
  // the disc: florets set at the golden angle, so the spirals run 13 one way and 21 the other
  const discP = circle(dcx, dcy, DR * 0.5, 48);
  glass(g, discP, C.amber, r, { mattW: 16, matt: 0.4 }); pieces.push(discP);
  const GA = Math.PI * (3 - Math.sqrt(5)), NF = 230;
  for (let i = 1; i < NF; i++) {
    const rr = DR * 0.47 * Math.sqrt(i / NF), a = i * GA, x = dcx + Math.cos(a) * rr, y = dcy + Math.sin(a) * rr, s = DR * 0.026 + DR * 0.022 * Math.sqrt(i / NF);
    g.fillStyle = i / NF < 0.35 ? 'rgba(120,70,10,.55)' : paint(0.62); g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,230,140,.4)'; g.beginPath(); g.arc(x - s * 0.3, y - s * 0.3, s * 0.35, 0, TAU); g.fill();
  }
  yield;
  // below: the coat, grown by reaction and diffusion (Gray and Scott's version of Turing's
  // equations), its feed rate rising down the window so that spots run together into stripes
  const GW = 60, GH = Math.round(GW * (coatBot - coatTop) / (x1 - x0)), N = GW * GH;
  let u = new Float32Array(N).fill(1), v = new Float32Array(N), u2 = new Float32Array(N), v2 = new Float32Array(N);
  for (let i = 0; i < 100; i++) { const cx2 = Math.floor(r() * GW), cy2 = Math.floor(r() * GH); for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const k = ((cy2 + dy + GH) % GH) * GW + (cx2 + dx + GW) % GW; v[k] = 0.5 + r() * 0.2; u[k] = 0.5; } }
  const Fy = new Float32Array(GH), Ky = new Float32Array(GH);
  for (let y = 0; y < GH; y++) { const e = smooth(0.18, 0.8, y / GH); Fy[y] = mix(0.0367, 0.055, e); Ky[y] = mix(0.0649, 0.062, e); }
  for (let it = 0; it < 5200; it++) {
    for (let y = 0; y < GH; y++) {
      const ym = ((y - 1 + GH) % GH) * GW, yp = ((y + 1) % GH) * GW, yc = y * GW, F = Fy[y], K = Ky[y];
      for (let x = 0; x < GW; x++) {
        const xm = x === 0 ? GW - 1 : x - 1, xp = x === GW - 1 ? 0 : x + 1, i = yc + x, ui = u[i], vi = v[i];
        const uvv = ui * vi * vi;
        u2[i] = ui + 0.2 * (u[ym + x] + u[yp + x] + u[yc + xm] + u[yc + xp] - 4 * ui) - uvv + F * (1 - ui);
        v2[i] = vi + 0.1 * (v[ym + x] + v[yp + x] + v[yc + xm] + v[yc + xp] - 4 * vi) + uvv - (F + K) * vi;
      }
    }
    [u, u2] = [u2, u]; [v, v2] = [v2, v];
    if (it % 40 === 39) yield;
  }
  // the coat's ground, pale gold, and the markings traced round and leaded in
  const coat = rect(x0, coatTop, x1, coatBot);
  const ground = voronoi(sitesIn(() => true, x0, coatTop, x1, coatBot, 40, r, unit * 3), coat);
  for (const p of ground) { glass(g, p, shift(C.gold, -6, -14, 6), r, { mattW: 10 }); pieces.push(p); }
  leads(g, ground, unit * 0.22, r);
  yield;
  const sx = (x1 - x0) / GW, sy = (coatBot - coatTop) / GH;
  const loops = contours(v, GW, GH, 0.22).map(l => smoothLoop(l, 2).map(([i, j]) => [x0 + i * sx, coatTop + j * sy])).filter(l => l.length > 4);
  const clipped = loops.map(l => clipPoly(l, coat)).filter(l => l.length > 2 && area(l) > 20);
  glass(g, clipped, [24, 62, 20], r, { mattW: 9, matt: 0.45, lj: 4 });
  pieces.push(...clipped);
  leads(g, pieces, unit * 0.22, r); pieces.length = 0;
  yield;
  pieces.push(...ribbon(g, f, ins, r));
  leads(g, pieces, unit * 0.22, r);
  saddle(g, f);
  return pieces;
}
// Marching squares: closed outlines of {f > level} on a grid (padded, so every outline closes)
function contours(f, W, H, level) {
  const at = (i, j) => (i < 0 || j < 0 || i >= W || j >= H) ? 0 : f[j * W + i];
  const segs = new Map(), key = (x, y) => `${Math.round(x * 64)},${Math.round(y * 64)}`;
  const edge = (ax, ay, bx, by) => { const va = at(ax, ay), vb = at(bx, by), t = (level - va) / (vb - va); return [ax + (bx - ax) * t, ay + (by - ay) * t]; };
  const add = (p, q) => { segs.set(key(...p), { p, q }); };
  for (let j = -1; j < H; j++) for (let i = -1; i < W; i++) {
    const a = at(i, j) > level, b2 = at(i + 1, j) > level, c = at(i + 1, j + 1) > level, d = at(i, j + 1) > level;
    const T = () => edge(i, j, i + 1, j), R = () => edge(i + 1, j, i + 1, j + 1), B = () => edge(i, j + 1, i + 1, j + 1), L = () => edge(i, j, i, j + 1);
    const code = (a ? 8 : 0) | (b2 ? 4 : 0) | (c ? 2 : 0) | (d ? 1 : 0);
    switch (code) {        // segments run with the inside on their left
      case 1: add(L(), B()); break; case 2: add(B(), R()); break; case 3: add(L(), R()); break; case 4: add(R(), T()); break;
      case 5: add(L(), T()); add(R(), B()); break; case 6: add(B(), T()); break; case 7: add(L(), T()); break; case 8: add(T(), L()); break;
      case 9: add(T(), B()); break; case 10: add(T(), R()); add(B(), L()); break; case 11: add(T(), R()); break; case 12: add(R(), L()); break;
      case 13: add(R(), B()); break; case 14: add(B(), L()); break; default: break;
    }
  }
  const loops = [];
  while (segs.size) {
    const [k0, s0] = segs.entries().next().value; segs.delete(k0);
    const loop = [s0.p]; let q = s0.q;
    for (let n = 0; n < 100000; n++) { const k = key(...q), s = segs.get(k); if (!s) break; segs.delete(k); loop.push(s.p); q = s.q; }
    loops.push(loop);
  }
  return loops;
}
const smoothLoop = (l, n) => { let p = l; for (let k = 0; k < n; k++) p = p.map((q, i) => { const a = p[(i - 1 + p.length) % p.length], b = p[(i + 1) % p.length]; return [(a[0] + 2 * q[0] + b[0]) / 4, (a[1] + 2 * q[1] + b[1]) / 4]; }); return p; };

// ---- W5: eigen-behaviour -----------------------------------------------------------------------------
// The same operation, applied to what it last made: a tangled loop is smoothed and set back on its
// centre, again and again, and settles into the one form it does not change: a ball. The window is read
// upward. The tangle is at the foot, over the ribbon; five medallions climb the light, each the one below
// it done once more; and the ball they come to, held in a child's hand, fills the round head.
function* eigen(g, W, H, seed = 55) {
  const r = rng(seed), f = tall(g, W, H, r, { band: C.ruby, jewelA: C.blue, jewelB: C.gold }), { unit, x0, x1, y0, y1, cx } = f, pieces = [];
  const ins = inscription(unit, ['Objects: Tokens for', '(Eigen-)Behaviors'], 'H. von Foerster · for Jean Piaget · 1976'), rt = ribbonTop(f, ins);
  // the ground: lozenge quarries, as in old leaded lights
  quarries(g, x0, y0, x1, y1, unit, [200, 26, 84], r, pieces, { hj: 20, clip: f.inner });
  leads(g, pieces, unit * 0.2, r); pieces.length = 0;
  yield;
  // the operation: keep the loop's own shape, but less of every wrinkle, and centre it again
  const K = 9, coef = [];
  for (let k = -K; k <= K; k++) coef.push(k === 1 ? [1, 0] : k === 0 ? [0, 0] : [(r() - 0.5) * 1.5 / Math.sqrt(Math.abs(k)), (r() - 0.5) * 1.5 / Math.sqrt(Math.abs(k))]);
  const loopOf = (cf, px, py, R) => { const pts = []; for (let i = 0; i < 160; i++) { const t = (i / 160) * TAU; let x = 0, y = 0; for (let k = -K; k <= K; k++) { const [a, b2] = cf[k + K], c = Math.cos(k * t), s = Math.sin(k * t); x += a * c - b2 * s; y += a * s + b2 * c; } pts.push([x, y]); } const m = Math.max(...pts.map(([x, y]) => Math.hypot(x, y))); return pts.map(([x, y]) => [px + x / m * R, py + y / m * R]); };
  const T = cf => cf.map(([a, b2], i) => { const k = i - K; const f2 = k === 1 ? 1 : k === 0 ? 0 : Math.exp(-0.36 * Math.abs(k - 1)); return [a * f2, b2 * f2]; });
  const n = 5, mR = unit * 2.55, hR = f.R - unit * 0.12, hy = f.sy + unit * 0.2;      // the medallions; the roundel in the head
  const yBot = rt - unit * 0.7 - mR, yTop = hy + hR + unit * 0.75 + mR;
  const at = Array.from({ length: n }, (_, i) => [cx + (i % 2 ? 1 : -1) * unit * 2.5, yBot - i * (yBot - yTop) / (n - 1), mR]);
  at.push([cx, hy, hR]);
  let cf = coef;
  for (let i = 0; i < n; i++) {
    const [px, py] = at[i], med = circle(px, py, mR, 44), inner = circle(px, py, mR * 0.84, 44);
    glass(g, [med, inner], C.gold, r, { mattW: 6 }); pieces.push(med);
    glass(g, inner, shift(C.violet, 0, 6, -4 + i * 3), r, { mattW: mR * 0.5, matt: 0.4 }); pieces.push(inner);
    // the loop, as a line of silver stain and paint
    const L = loopOf(cf, px, py, mR * 0.66);
    g.save(); path(g, [inner]); g.clip(); g.lineJoin = 'round';
    g.strokeStyle = 'rgba(30,14,4,.7)'; g.lineWidth = unit * 0.42; path(g, [L]); g.stroke();
    g.strokeStyle = 'rgba(255,214,110,.95)'; g.lineWidth = unit * 0.2; path(g, [L]); g.stroke();
    g.restore();
    // and up to the next: a little ribbon of ruby glass, curling round
    {
      const [nx, ny, nR] = at[i + 1], dx = nx - px, dy = ny - py, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
      const a = [px + ux * mR * 1.02, py + uy * mR * 1.02], z = [nx - ux * nR * 1.02, ny - uy * nR * 1.02], w = unit * 0.2;
      const mid = [(a[0] + z[0]) / 2 + (i % 2 ? -1 : 1) * unit * 0.6, (a[1] + z[1]) / 2];
      const rib = [[a[0] - uy * w, a[1] + ux * w], [mid[0] - uy * w, mid[1] + ux * w], [z[0], z[1]], [mid[0] + uy * w, mid[1] - ux * w], [a[0] + uy * w, a[1] - ux * w]];
      glass(g, rib, C.ruby, r, { mattW: 3 }); pieces.push(rib);
    }
    cf = T(cf);
    yield;
  }
  // the last: the form it settles into, a ball, held in a child's hand, in the round head
  {
    const cy = hy, ballR = hR * 0.76;
    const med = circle(cx, cy, hR, 64), inner = circle(cx, cy, hR - unit * 0.3, 64);
    glass(g, [med, inner], C.gold, r, { mattW: 6 }); pieces.push(med);
    glass(g, inner, shift(C.ice, 0, 10, -8), r, { mattW: 14 }); pieces.push(inner);
    const br = ballR * 0.6, bx = cx + unit * 0.1, by = cy - ballR * 0.18, ball = circle(bx, by, br, 40);
    glass(g, ball, [354, 80, 40], r, { matt: 0.55, mattW: br * 0.9 }); pieces.push(ball);
    g.fillStyle = 'rgba(255,240,220,.55)'; g.beginPath(); g.ellipse(bx - br * 0.35, by - br * 0.38, br * 0.22, br * 0.14, -0.6, 0, TAU); g.fill();
    // the ball's loop, as it was in the others, now a perfect circle round its middle
    g.strokeStyle = 'rgba(255,214,110,.9)'; g.lineWidth = unit * 0.18; g.beginPath(); g.ellipse(bx, by, br * 0.98, br * 0.3, -0.12, 0, Math.PI); g.stroke();
    // the hand: palm under the ball, four fingers curled up its far side, the thumb on the near
    const s = ballR / 3.1;
    const palm = [[cx - 3.4 * s, cy + 1.3 * s], [cx - 2.4 * s, cy + 2.4 * s], [cx - 0.6 * s, cy + 2.9 * s], [cx + 1.6 * s, cy + 2.55 * s], [cx + 2.9 * s, cy + 1.4 * s], [cx + 2.2 * s, cy + 0.9 * s], [cx + 0.2 * s, cy + 1.62 * s], [cx - 1.8 * s, cy + 1.25 * s], [cx - 3.0 * s, cy + 0.8 * s]];
    glass(g, palm, C.flesh, r, { mattW: 9, matt: 0.3 }); pieces.push(palm);
    const fingers = [[2.25, 1.0, 2.95, 0.15, 0.36], [2.55, 0.15, 2.85, -0.75, 0.33], [2.55, -0.75, 2.45, -1.55, 0.3], [2.2, -1.55, 1.75, -2.1, 0.26]];
    for (const [ax, ay, bx2, by2, w] of fingers) {
      const A = [cx + ax * s, cy + ay * s], Bp = [cx + bx2 * s, cy + by2 * s], d = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]), nx = -(Bp[1] - A[1]) / d * w * s * 1.4, ny = (Bp[0] - A[0]) / d * w * s * 1.4;
      const fg = [[A[0] - nx * 0.2, A[1] - ny * 0.2], [A[0] + nx, A[1] + ny], [Bp[0] + nx * 0.8, Bp[1] + ny * 0.8], [Bp[0] + (Bp[0] - A[0]) / d * w * s, Bp[1] + (Bp[1] - A[1]) / d * w * s], [Bp[0] - nx * 0.3, Bp[1] - ny * 0.3]];
      glass(g, fg, shift(C.flesh, 0, 0, -3), r, { mattW: 5, matt: 0.3 }); pieces.push(fg);
      g.fillStyle = 'rgba(255,235,225,.5)'; g.beginPath(); g.ellipse(Bp[0] + nx * 0.2, Bp[1] + ny * 0.2, w * s * 0.35, w * s * 0.22, Math.atan2(Bp[1] - A[1], Bp[0] - A[0]), 0, TAU); g.fill();
    }
    const thumb = [[cx - 2.9 * s, cy + 0.9 * s], [cx - 2.6 * s, cy - 0.2 * s], [cx - 2.0 * s, cy - 0.9 * s], [cx - 1.45 * s, cy - 0.75 * s], [cx - 1.7 * s, cy + 0.1 * s], [cx - 2.0 * s, cy + 1.1 * s]];
    glass(g, thumb, shift(C.flesh, 0, 0, 2), r, { mattW: 5, matt: 0.3 }); pieces.push(thumb);
    g.strokeStyle = paint(0.45); g.lineWidth = 1.2;
    for (const k of [0.4, 0.8]) { g.beginPath(); g.moveTo(cx - 2.4 * s, cy + (1.6 + k) * s); g.quadraticCurveTo(cx - 0.4 * s, cy + (2.0 + k * 0.6) * s, cx + 1.8 * s, cy + (1.5 + k * 0.5) * s); g.stroke(); }
  }
  yield;
  pieces.push(...ribbon(g, f, ins, r));
  leads(g, pieces, unit * 0.22, r);
  saddle(g, f);
  return pieces;
}

// ---- W6: the neuron, after Cajal ------------------------------------------------------------------------
// A pyramidal cell the height of the light, as he drew them: the body low down, the apical dendrite climbing
// to a tuft that fills the round head, the basal dendrites spread about the body, and the axon going straight
// down behind the ribbon. Two lesser neurons and a star of a cell keep it company.
function* neuron(g, W, H, seed = 66) {
  const r = rng(seed), f = tall(g, W, H, r, { band: [24, 70, 26], jewelA: C.blue, jewelB: C.ruby, inner: C.straw }), { unit, x0, x1, y0, y1 } = f, pieces = [];
  const ins = inscription(unit, ['las misteriosas', 'mariposas del alma'], 'S. Ramón y Cajal · 1917'), foot = ribbonTop(f, ins) - unit * 0.3;
  const cx = f.cx - unit * 0.3, cy = y0 + (foot - y0) * 0.64;
  // the paper of his drawings: pale amber glass, paler round the cell and up the dendrite
  const bg = voronoi(sitesIn((x, y) => f.inside(x, y), x0, y0, x1, y1, 70, r, unit * 3.0), f.inner);
  for (const p of bg) { const [x, y] = centroid(p), d = Math.hypot(x - cx, (y - cy) * 0.3) / (x1 - x0); glass(g, p, lerpC([46, 62, 80], [36, 78, 56], smooth(0.1, 0.9, d)), r, { mattW: 12, matt: 0.26 }); pieces.push(p); }
  leads(g, pieces, unit * 0.22, r); pieces.length = 0;
  yield;
  // the cell, in black paint: a tapering line that wanders, forks, and carries spines
  const drawBranch = (x, y, a, len, w, depth, o) => {
    let px = x, py = y, dir = a; const steps = Math.max(4, Math.round(len / 5));
    for (let i = 0; i < steps; i++) {
      dir += (r() - 0.5) * 0.28 + (o.pull ?? 0) * Math.sin((o.toward ?? a) - dir) * 0.1;
      const nx = px + Math.cos(dir) * len / steps, ny = py + Math.sin(dir) * len / steps, ww = w * (1 - i / steps * 0.55);
      g.strokeStyle = paint(0.9); g.lineWidth = Math.max(0.6, ww); g.lineCap = 'round'; g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke();
      if (o.spines && ww < 3.2) for (let k = 0; k < 2; k++) if (r() < 0.55) { const sa = dir + (r() < 0.5 ? 1 : -1) * (1.1 + r() * 0.6), sl = 2 + r() * 3; g.lineWidth = 0.7; g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx + Math.cos(sa) * sl, ny + Math.sin(sa) * sl); g.stroke(); g.fillStyle = paint(0.85); g.beginPath(); g.arc(nx + Math.cos(sa) * sl, ny + Math.sin(sa) * sl, 0.9, 0, TAU); g.fill(); }
      px = nx; py = ny;
      if (depth > 0 && i > 1 && r() < (o.fork ?? 0.12)) { const s = r() < 0.5 ? 1 : -1; drawBranch(px, py, dir + s * (0.35 + r() * 0.5), Math.min(o.side ?? 1e9, len * (0.35 + r() * 0.35) * (1 - i / steps)), ww * 0.7, depth - 1, { ...o, toward: dir + s * 0.6 }); }
    }
    if (depth > 0 && (o.split ?? true)) { drawBranch(px, py, dir - 0.3 - r() * 0.3, len * 0.42, w * 0.45, depth - 1, o); drawBranch(px, py, dir + 0.3 + r() * 0.3, len * 0.42, w * 0.45, depth - 1, o); }
  };
  g.save(); path(g, [f.inner]); g.clip();
  // the apical dendrite, up toward the surface, branching into a tuft under the arch
  drawBranch(cx, cy - unit * 0.6, -Math.PI / 2 + 0.03, (cy - y0) * 0.56, unit * 0.52, 4, { spines: true, fork: 0.04, pull: 0.7, toward: -Math.PI / 2, side: unit * 5 });
  yield;
  // oblique and basal dendrites
  for (const a of [-2.5, -0.65, 2.75, 0.4, 1.9, 1.1, 2.3]) drawBranch(cx + Math.cos(a) * unit * 0.5, cy + Math.sin(a) * unit * 0.5, a + (r() - 0.5) * 0.3, unit * (3.4 + r() * 2.8), unit * 0.24, 2, { spines: true, fork: 0.1 });
  yield;
  // the axon, fine and smooth, straight down with collaterals at right angles
  {
    let px = cx + unit * 0.05, py = cy + unit * 0.7, d = Math.PI / 2;
    for (let i = 0; i < 120 && py < y1 - unit * 0.6; i++) { d += (r() - 0.5) * 0.1 + (Math.PI / 2 - d) * 0.1; const nx = px + Math.cos(d) * 6, ny = py + Math.sin(d) * 6; g.strokeStyle = paint(0.85); g.lineWidth = 1.4; g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke(); px = nx; py = ny; if (i % 13 === 6) drawBranch(px, py, d + (i % 26 < 13 ? -1.35 : 1.35), unit * 2.6, 1.2, 1, { fork: 0.05, split: false }); }
  }
  // a small star of a cell beside the dendrite (an astrocyte), a small pyramid higher up, and a second neuron low down
  { const ax = x0 + unit * 2.6, ay = y0 + (y1 - y0) * 0.37; g.fillStyle = paint(0.85); g.beginPath(); g.arc(ax, ay, unit * 0.32, 0, TAU); g.fill(); for (let k = 0; k < 14; k++) drawBranch(ax, ay, (k / 14) * TAU + r() * 0.3, unit * (1 + r() * 1.1), 1.6, 1, { fork: 0.25, split: false }); }
  { const bx = x1 - unit * 2.7, by = y0 + (y1 - y0) * 0.3; g.fillStyle = paint(0.88); g.beginPath(); g.moveTo(bx, by - unit * 0.55); g.lineTo(bx + unit * 0.36, by + unit * 0.3); g.lineTo(bx - unit * 0.36, by + unit * 0.3); g.closePath(); g.fill(); drawBranch(bx, by - unit * 0.4, -Math.PI / 2 + 0.1, unit * 5.5, unit * 0.16, 2, { spines: true, fork: 0.06 }); for (const a of [2.6, 0.5, 1.57]) drawBranch(bx, by + unit * 0.2, a, unit * 1.7, unit * 0.11, 1, { spines: a !== 1.57, split: a !== 1.57 }); }
  { const bx = x1 - unit * 2.2, by = foot - unit * 3.2; g.fillStyle = paint(0.88); g.beginPath(); g.ellipse(bx, by, unit * 0.45, unit * 0.62, 0.3, 0, TAU); g.fill(); drawBranch(bx, by - unit * 0.5, -Math.PI / 2 - 0.2, unit * 8, unit * 0.18, 2, { spines: true, fork: 0.07 }); for (const a of [2.2, 0.9, 1.6]) drawBranch(bx, by, a, unit * 2, unit * 0.14, 1, { spines: true }); }
  g.restore();
  yield;
  // the body: a pyramid of darker glass, leaded in, with its nucleus painted
  const soma = [[cx, cy - unit * 1.25], [cx + unit * 0.72, cy + unit * 0.55], [cx + unit * 0.2, cy + unit * 0.8], [cx - unit * 0.55, cy + unit * 0.7], [cx - unit * 0.8, cy + unit * 0.45]];
  glass(g, soma, [28, 70, 22], r, { mattW: 10, matt: 0.5 }); pieces.push(soma);
  g.fillStyle = 'rgba(255,236,190,.42)'; g.beginPath(); g.ellipse(cx - unit * 0.05, cy + unit * 0.12, unit * 0.3, unit * 0.24, 0.2, 0, TAU); g.fill();
  g.fillStyle = paint(0.75); g.beginPath(); g.arc(cx - unit * 0.02, cy + unit * 0.12, unit * 0.08, 0, TAU); g.fill();
  // his words, from his memoirs (Recuerdos de mi vida, 1917), for the cells of the cortex
  pieces.push(...ribbon(g, f, ins, r));
  leads(g, pieces, unit * 0.22, r);
  saddle(g, f);
  return pieces;
}

// ---- W7: ingressing minds, the great window ---------------------------------------------------------
// After Michael Levin: minds as patterns that come into matter from a space of forms (the word is Whitehead's).
// The end wall's window, behind the stone table: ten feet wide and nearly fourteen and a half high under a
// round arch, three round-headed lights (the middle one wider and a little taller) and three roundels in
// the head, all cut through one frame (greatPlan: chapel.js builds the frame from it and the picture is
// drawn into its openings). It is read from the top down, in tiers that run across all three lights:
//   the head     the space of patterns: the five regular solids on deep blue in the great roundel, the
//                dodecahedron in the middle; a trefoil knot and an equiangular spiral in the two small ones
//   the arches   three plain forms arriving, a triangle, a ring and a star, each with its halo, and from
//                each a beam of pale gold that goes on down behind everything below it
//   first tier   a cell; two flatworms in a dish (the lower one has regrown a head at each end and no
//                tail); a pair of gears
//   second tier  a slime mould finding its oat flakes; a frog on its leaf with a tadpole under it;
//                three xenobots sweeping loose cells into heaps
//   the foot     water and weed, and the words on a ribbon in the middle light
// The ground runs from deep blue through sea green to green as it comes down into matter.
export const GREATPX = [1400, 2016];      // the cell it is drawn in: 140 px to the foot, as the tall windows are
// The frame's openings for a window W wide and H high (any measure; y runs down from the crown): its own
// outline, the three lights and the three roundels
export function greatPlan(W, H) {
  const R = W / 2, f = W * 0.03, m = W * 0.034, sw = W * 0.266, cw = W - 2 * f - 2 * m - 2 * sw, ls = R + W * 0.14, bot = H - f;
  const arch = (cx, cy, rad, n) => Array.from({ length: n + 1 }, (_, k) => [cx + Math.cos(Math.PI + k * Math.PI / n) * rad, cy + Math.sin(Math.PI + k * Math.PI / n) * rad]);
  const light = (x0, x1) => ({ x0, x1, spring: ls, bot, r: (x1 - x0) / 2, out: [[x1, bot], [x0, bot], ...arch((x0 + x1) / 2, ls, (x1 - x0) / 2, 16)] });
  const xs = f + sw + m;
  return {
    R, spring: R, out: [[W, H], [0, H], ...arch(R, R, R, 32)],
    lights: [light(f, f + sw), light(xs, xs + cw), light(W - f - sw, W - f)],
    rounds: [{ x: R, y: R - W * 0.25, r: W * 0.19 }, { x: R - W * 0.295, y: R - W * 0.135, r: W * 0.1 }, { x: R + W * 0.295, y: R - W * 0.135, r: W * 0.1 }],
  };
}
// One round-headed light of it, set out as tall() sets out a tall window (but anywhere, and at a given unit):
// the shared border up the sides and round the arch, a sill course across the foot. Returns the field.
function archLight(g, xa, xb, ys, yb, unit, r, o = {}) {
  const R = (xb - xa) / 2, cx = (xa + xb) / 2, N = 12, band = o.band ?? C.blue, jA = o.jewelA ?? C.ruby, jB = o.jewelB ?? C.amber, Rp = R / Math.cos(Math.PI / (2 * N));
  const out = [[xb, yb], [xa, yb]];
  for (let k = 0; k <= N; k++) { const a = Math.PI + k * Math.PI / N; out.push([k === 0 ? xa : k === N ? xb : cx + Math.cos(a) * Rp, ys + Math.sin(a) * Rp]); }
  const b = border(g, out, r, unit, o), D = b.inner, x0 = D[1][0], x1 = D[0][0], yD = D[0][1], y1 = yD - unit * 1.3, Ri = R - (x0 - xa);
  const sill = [], sw = unit * 1.3, lw = (x1 - x0 - 3 * sw) / 4;
  for (let i = 0, x = x0; i < 7; i++) { const w = i % 2 ? sw : lw, p = rect(x, y1, x + w, yD); glass(g, p, i % 2 ? (i === 3 ? jA : jB) : shift(band, 0, 0, 3), r, { mattW: 7 }); sill.push(p); x += w; }
  leads(g, [...b.pieces, ...sill], unit * 0.22, r);
  const inner = clipHalf(D, 0, 1, y1), y0 = Math.min(...D.map(p => p[1]));
  const inside = (x, y, m = 0) => x > x0 + m && x < x1 - m && y < y1 - m && (y >= ys || Math.hypot(x - cx, y - ys) < Ri - m);
  return { unit, x0, x1, y0, y1, cx, sy: ys, R: Ri, inner, inside };
}
// The five regular solids, from their corners: the faces are found (every plane through three corners that
// has the rest on one side), turned, and the ones that face us cut in glass, lighter where they face the light
const PHI = (1 + Math.sqrt(5)) / 2;
const turns3 = ([a, b, c]) => [[a, b, c], [c, a, b], [b, c, a]];
const signs3 = v => { let out = [v]; v.forEach((q, i) => { if (q) out = out.flatMap(p => [p, p.map((c, j) => (j === i ? -c : c))]); }); return out; };
const SOLIDS = {
  tetra: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], cube: signs3([1, 1, 1]), octa: turns3([1, 0, 0]).flatMap(signs3),
  icosa: turns3([0, 1, PHI]).flatMap(signs3), dodeca: [...signs3([1, 1, 1]), ...turns3([0, 1 / PHI, PHI]).flatMap(signs3)],
};
const FACES = {};
function solidFaces(V) {
  const n = V.length, faces = [], seen = new Set(), sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
    let nm = cross(sub(V[j], V[i]), sub(V[k], V[i])); const len = Math.hypot(...nm); if (len < 1e-6) continue;
    nm = nm.map(c => c / len); let d = dot3(nm, V[i]); if (d < 0) { nm = nm.map(c => -c); d = -d; }
    if (d < 1e-6 || V.some(v => dot3(nm, v) - d > 1e-6)) continue;
    const key = nm.map(c => Math.round(c * 1000) + 0).join(','); if (seen.has(key)) continue; seen.add(key);
    const on = V.filter(v => Math.abs(dot3(nm, v) - d) < 1e-6), c = [0, 1, 2].map(q => on.reduce((s, v) => s + v[q], 0) / on.length);
    const e1 = sub(on[0], c), l1 = Math.hypot(...e1), a1 = e1.map(q => q / l1), a2 = cross(nm, a1), ang = p => Math.atan2(dot3(sub(p, c), a2), dot3(sub(p, c), a1));
    faces.push({ n: nm, v: on.slice().sort((p, q) => ang(p) - ang(q)) });
  }
  return faces;
}
function platonic(g, name, cx, cy, s, rx, ry, col, r, pieces) {
  const cxr = Math.cos(rx), sxr = Math.sin(rx), cyr = Math.cos(ry), syr = Math.sin(ry), V = SOLIDS[name], k = s / Math.hypot(...V[0]);
  const rot = ([x, y, z]) => { const xa = x * cyr + z * syr, za = -x * syr + z * cyr; return [xa, y * cxr - za * sxr, y * sxr + za * cxr]; };
  for (const f of (FACES[name] ??= solidFaces(V))) {
    const nn = rot(f.n); if (nn[2] <= 0.02) continue;
    const p = f.v.map(v => { const q = rot(v); return [cx + q[0] * k, cy - q[1] * k]; });
    glass(g, p, shift(col, 0, 0, (clamp(nn[0] * -0.45 + nn[1] * 0.6 + nn[2] * 0.66, 0, 1) - 0.6) * 38), r, { mattW: 4, matt: 0.22, lj: 3, hj: 3 }); pieces.push(p);
  }
}
function* ingression(g, W, H, seed = 77) {
  const r = rng(seed), P = greatPlan(W, H), u = W / 63.6, LW = u * 0.22, BORD = { band: C.deep, jewelA: C.gold, jewelB: C.ruby }, GOLD = 'rgba(255,224,130,.96)', pieces = [];
  g.fillStyle = '#0d0b09'; g.fillRect(0, 0, W, H);      // (behind the frame)
  const flush = (w = LW * 0.8) => { leads(g, pieces, w, r); pieces.length = 0; };

  // ---- the head: three roundels ----------------------------------------------------------------------
  const [big, kn, sp] = P.rounds;
  const round = (c, N) => { const b = border(g, circle(c.x, c.y, (c.r + 2) / Math.cos(Math.PI / N), N, -Math.PI / 2), r, u, BORD); leads(g, b.pieces, LW, r); return { inner: b.inner, R: c.r + 2 - u * 1.77 }; };
  const ground = (rd, c, n, minD, colAt) => {
    const cells = voronoi(sitesIn((x, y) => Math.hypot(x - c.x, y - c.y) < rd.R, c.x - rd.R, c.y - rd.R, c.x + rd.R, c.y + rd.R, n, r, minD), rd.inner);
    for (const p of cells) { const [x, y] = centroid(p); glass(g, p, colAt(Math.hypot(x - c.x, y - c.y) / rd.R), r, { mattW: 7, matt: 0.3 }); }
    leads(g, cells, LW * 0.8, r);
  };
  const B = round(big, 18);
  yield;
  ground(B, big, 170, u * 1.45, t => lerpC(shift(C.azure, 0, 0, 4), C.deep, smooth(0.12, 0.8, t)));
  yield;
  // rays out of the middle, and points of light
  g.save(); path(g, [B.inner]); g.clip();
  for (let k = 0; k < 40; k++) { const a = k / 40 * TAU + 0.04; g.strokeStyle = `rgba(255,236,170,${k % 2 ? 0.2 : 0.38})`; g.lineWidth = k % 2 ? 1 : 1.6; g.beginPath(); g.moveTo(big.x + Math.cos(a) * B.R * 0.2, big.y + Math.sin(a) * B.R * 0.2); g.lineTo(big.x + Math.cos(a) * B.R, big.y + Math.sin(a) * B.R); g.stroke(); }
  for (let k = 0; k < 90; k++) { const a = r() * TAU, d = Math.sqrt(r()) * B.R; g.fillStyle = `rgba(255,250,225,${0.35 + r() * 0.5})`; g.beginPath(); g.arc(big.x + Math.cos(a) * d, big.y + Math.sin(a) * d, 0.7 + r() * 1.3, 0, TAU); g.fill(); }
  g.restore();
  // the solids: the dodecahedron in the middle; round it fire, air, water and earth
  platonic(g, 'dodeca', big.x, big.y, B.R * 0.37, 0.32, 0.2, C.gold, r, pieces);
  [['tetra', C.orange, 0.5, 0.4], ['octa', C.straw, 0.45, 0.3], ['icosa', C.ice, 0.3, 0.2], ['cube', C.leaf, 0.5, 0.6]].forEach(([name, col, rx, ry], k) => {
    const a = -Math.PI * 3 / 4 + k * Math.PI / 2, x = big.x + Math.cos(a) * B.R * 0.645, y = big.y + Math.sin(a) * B.R * 0.645;
    g.strokeStyle = 'rgba(255,240,190,.3)'; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, B.R * 0.3, 0, TAU); g.stroke();
    platonic(g, name, x, y, B.R * 0.25, rx, ry, col, r, pieces);
  });
  flush(LW * 0.7);
  yield;
  // a trefoil knot, over and under
  const K = round(kn, 10); ground(K, kn, 40, u * 1.6, t => lerpC(C.blue, C.deep, t));
  {
    const s = K.R * 0.27, wide = u * 0.34;
    g.lineJoin = 'round';
    for (const over of [0, 1]) for (let k = 0; k < 3; k++) {
      const t0 = (2 * k + over) * Math.PI / 3; g.beginPath();
      for (let i = 0; i <= 24; i++) { const t = t0 + i / 24 * Math.PI / 3, x = kn.x + (Math.sin(t) + 2 * Math.sin(2 * t)) * s, y = kn.y - (Math.cos(t) - 2 * Math.cos(2 * t)) * s; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.lineCap = 'butt'; g.strokeStyle = 'rgba(30,14,4,.8)'; g.lineWidth = wide * 2.1; g.stroke(); g.lineCap = over ? 'round' : 'butt'; g.strokeStyle = GOLD; g.lineWidth = wide; g.stroke();
    }
  }
  yield;
  // an equiangular spiral
  const S = round(sp, 10); ground(S, sp, 40, u * 1.6, t => lerpC(C.blue, C.deep, t));
  { const pts = []; for (let a = 0; a <= 17.6; a += 0.1) { const q = S.R * 0.9 * Math.exp(0.17 * (a - 17.6)); pts.push([sp.x + Math.cos(a) * q, sp.y - Math.sin(a) * q]); } stain(g, pts, u * 0.3, GOLD); }
  yield;

  // ---- the three lights ----------------------------------------------------------------------------------
  const ls = P.lights[1].spring, yF = ls - u * 2.5, m1 = ls + u * 12.6, m2 = ls + u * 30, RY = u * 7.6, yA = ls + u * 4, yB = ls + u * 26, F = [];
  for (const L of P.lights) { F.push(archLight(g, L.x0 - 2, L.x1 + 2, L.spring, L.bot + 2, u, r, BORD)); yield; }
  const yEnd = F[1].y1, skyAt = y => (y < yA ? lerpC(shift(C.azure, 0, 0, 2), C.deep, smooth(ls - u * 9.5, yA, y)) : y < yB ? lerpC(C.deep, shift(C.teal, 6, 0, 0), smooth(yA, yB, y)) : lerpC(shift(C.teal, 6, 0, 0), shift(C.green, -8, -4, -2), smooth(yB, yEnd, y)));
  const RX = [u * 6.1, u * 7.6, u * 6.1];
  // a medallion: a gold ring, and a field of one colour in a few pieces
  const medal = (cx, cy, rx, col) => {
    const out = ellipse(cx, cy, rx, RY, 0, 56), inn = ellipse(cx, cy, rx - u * 0.55, RY - u * 0.55, 0, 56);
    glass(g, [out, inn], C.gold, r, { mattW: 4, matt: 0.2 });
    const cells = voronoi(sitesIn((x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / RY) ** 2 < 0.8, cx - rx, cy - RY, cx + rx, cy + RY, 12, r, u * 4.2), inn);
    for (const p of cells) glass(g, p, col, r, { mattW: 9, matt: 0.3, lj: 7 });
    leads(g, cells, LW * 0.7, r); leads(g, [out, inn], LW, r);
    g.strokeStyle = '#0d0b09'; g.lineWidth = LW * 0.7; for (let k = 0; k < 12; k++) { const a = (k + 0.5) / 12 * TAU; g.beginPath(); g.moveTo(cx + Math.cos(a) * rx, cy + Math.sin(a) * RY); g.lineTo(cx + Math.cos(a) * (rx - u * 0.55), cy + Math.sin(a) * (RY - u * 0.55)); g.stroke(); }
  };
  // ---- what the forms come down into ---------------------------------------------------------------------
  // a cell: membrane, the cytoplasm, the nucleus and its nucleolus, mitochondria, a few vesicles
  const cell = (cx, cy) => {
    const R = u * 4.6, mem = ellipse(cx, cy, R * 0.94, R * 1.2, 0.2, 44), cyto = ellipse(cx, cy, R * 0.81, R * 1.07, 0.2, 44), nx = cx + R * 0.1, ny = cy - R * 0.22, nuc = ellipse(nx, ny, R * 0.42, R * 0.37, 0.6, 30);
    glass(g, [mem, cyto], C.emerald, r, { mattW: 5 }); glass(g, [cyto, nuc], [86, 50, 70], r, { mattW: 16, matt: 0.25 }); glass(g, nuc, C.violet, r, { mattW: 8 }); pieces.push(mem, cyto, nuc);
    g.fillStyle = 'rgba(255,220,240,.6)'; g.beginPath(); g.arc(nx + R * 0.06, ny - R * 0.04, R * 0.1, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(30,60,20,.45)'; g.lineWidth = 1.2; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(nx, ny, R * (0.5 + k * 0.08), 1.2, 3.4); g.stroke(); }
    for (let k = 0; k < 10; k++) {
      const a = k / 10 * TAU + r() * 0.4, d = 0.56 + r() * 0.16, mx = cx + Math.cos(a) * R * 0.8 * d, my = cy + Math.sin(a) * R * 1.06 * d;
      if (Math.hypot(mx - nx, my - ny) < R * 0.56) continue;
      g.fillStyle = 'rgba(205,110,20,.85)'; g.beginPath(); g.ellipse(mx, my, R * 0.13, R * 0.06, a + 1.2, 0, TAU); g.fill(); g.strokeStyle = paint(0.55); g.lineWidth = 1; g.stroke();
    }
    for (let k = 0; k < 7; k++) { const a = r() * TAU, d = 0.3 + r() * 0.5, vx = cx + Math.cos(a) * R * 0.8 * d, vy = cy + Math.sin(a) * R * 1.06 * d; if (Math.hypot(vx - nx, vy - ny) < R * 0.5) continue; g.fillStyle = 'rgba(255,255,240,.5)'; g.beginPath(); g.arc(vx, vy, R * (0.03 + r() * 0.03), 0, TAU); g.fill(); }
  };
  // a flatworm: an arrow-headed planarian, its two eyespots looking inward; `two` gives it a head at each end
  const worm = (wx, wy, L, Wd, a, two) => {
    const Pt = (p, v) => [wx + Math.cos(a) * p - Math.sin(a) * v, wy + Math.sin(a) * p + Math.cos(a) * v];
    const h1 = t => (t < 0.72 ? 0.34 + 0.16 * Math.sin(Math.PI * t / 0.72) : t < 0.8 ? 0.34 - (t - 0.72) * 0.5 : t < 0.88 ? 0.3 + (t - 0.8) * 3.0 : 0.54 - (t - 0.88) * 4.4);
    const half = t => Wd * (two ? h1(Math.max(t, 1 - t)) : h1(t) * Math.min(1, Math.sqrt(t / 0.12)));
    const side = s2 => Array.from({ length: 41 }, (_, i) => { const t = i / 40; return Pt(-L / 2 + L * t, s2 * Math.max(0.02 * Wd, half(t)) + Math.sin(t * 6) * Wd * 0.06); });
    const outline = [...side(-1), ...side(1).reverse()], ends = two ? [-1, 1] : [1];
    glass(g, outline, [26, 58, 46], r, { mattW: 12, matt: 0.42 }); pieces.push(outline);
    g.strokeStyle = 'rgba(60,28,8,.45)'; g.lineWidth = Wd * 0.12; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 14; i++) { const [px, py] = Pt((two ? -L * 0.3 : -L * 0.42) + L * (two ? 0.6 : 0.72) * i / 14, Math.sin(i * 0.43) * Wd * 0.05); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
    g.fillStyle = 'rgba(255,230,190,.35)'; for (let i = 0; i < 22; i++) { const [px, py] = Pt(-L * 0.36 + L * 0.66 * r(), (r() - 0.5) * Wd * 0.4); g.beginPath(); g.arc(px, py, 1 + r() * 1.6, 0, TAU); g.fill(); }
    for (const e of ends) for (const s2 of [-1, 1]) { const [ex, ey] = Pt(e * L * 0.36, s2 * Wd * 0.14); g.fillStyle = 'rgba(255,250,235,.95)'; g.beginPath(); g.ellipse(ex, ey, Wd * 0.14, Wd * 0.1, a, 0, TAU); g.fill(); const [qx, qy] = Pt(e * L * 0.36, s2 * Wd * 0.14 - s2 * Wd * 0.045); g.fillStyle = paint(0.95); g.beginPath(); g.arc(qx, qy, Wd * 0.06, 0, TAU); g.fill(); }
  };
  // a machine: two gears, one turning the other
  const gears = (cx, cy) => {
    const gear = (x, y, R, n, ph) => { const p = []; for (let i = 0; i < n * 4; i++) { const a = ph + (i / (n * 4)) * TAU, rr = (i % 4 < 2) ? R : R * 0.8; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return p; };
    const R1 = u * 3.9, R2 = u * 2.5, ax = cx - u * 1.3, ay = cy + u * 2.4, bx = ax + (R1 + R2) * 0.92 * Math.cos(-1.05), by = ay + (R1 + R2) * 0.92 * Math.sin(-1.05);
    const ga = gear(ax, ay, R1, 12, 0), gb = gear(bx, by, R2, 8, 0.2), ha = circle(ax, ay, R1 * 0.26, 20), hb = circle(bx, by, R2 * 0.3, 16);
    glass(g, [ga, ha], C.gold, r, { mattW: 9, matt: 0.4 }); glass(g, ha, C.blue, r, { mattW: 4 });
    glass(g, [gb, hb], [205, 18, 66], r, { mattW: 7, matt: 0.4 }); glass(g, hb, C.blue, r, { mattW: 4 }); pieces.push(ga, ha, gb, hb);
    g.strokeStyle = paint(0.55); g.lineWidth = 1.6;
    for (const [x, y, R, n] of [[ax, ay, R1, 6], [bx, by, R2, 4]]) { for (let k = 0; k < n; k++) { const a = k / n * TAU + 0.2; g.beginPath(); g.moveTo(x + Math.cos(a) * R * 0.3, y + Math.sin(a) * R * 0.3); g.lineTo(x + Math.cos(a) * R * 0.68, y + Math.sin(a) * R * 0.68); g.stroke(); } g.beginPath(); g.arc(x, y, R * 0.7, 0, TAU); g.stroke(); }
  };
  // a slime mould: yellow veins from where it started to every oat flake, by the shortest roads it could find
  const slime = (cx, cy, rx) => {
    const YEL = 'rgba(255,212,48,.97)', nodes = sitesIn((x, y) => ((x - cx) / (rx - u * 1.7)) ** 2 + ((y - cy) / (RY - u * 1.7)) ** 2 < 1, cx - rx, cy - RY, cx + rx, cy + RY, 24, r, u * 2.05);
    if (nodes.length < 3) return;
    let root = 0; nodes.forEach((p, i) => { if (Math.hypot(p[0] - cx + rx * 0.3, p[1] - cy - RY * 0.5) < Math.hypot(nodes[root][0] - cx + rx * 0.3, nodes[root][1] - cy - RY * 0.5)) root = i; });
    const dist = (i, j) => Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]), depth = new Map([[root, 0]]), edges = [], kids = new Map();
    while (depth.size < nodes.length) {
      let best = null; for (const i of depth.keys()) for (let j = 0; j < nodes.length; j++) if (!depth.has(j) && (!best || dist(i, j) < best[2])) best = [i, j, dist(i, j)];
      depth.set(best[1], depth.get(best[0]) + 1); edges.push(best); kids.set(best[0], (kids.get(best[0]) ?? 0) + 1);
    }
    const tips = nodes.map((_, i) => i).filter(i => !kids.has(i) && i !== root), food = tips.filter((_, k) => k % 2 === 0).slice(0, 4);
    for (const i of food) { const e = ellipse(nodes[i][0], nodes[i][1], u * 0.8, u * 0.5, r() * 3, 14); glass(g, e, C.straw, r, { mattW: 4, matt: 0.3 }); pieces.push(e); }
    flush(LW * 0.6);
    const vein = (p, q, wide) => { const mx = (p[0] + q[0]) / 2 - (q[1] - p[1]) * (r() - 0.5) * 0.3, my = (p[1] + q[1]) / 2 + (q[0] - p[0]) * (r() - 0.5) * 0.3, pts = []; for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push([(1 - t) ** 2 * p[0] + 2 * t * (1 - t) * mx + t * t * q[0], (1 - t) ** 2 * p[1] + 2 * t * (1 - t) * my + t * t * q[1]]); } stain(g, pts, wide, YEL); };
    for (const [i, j] of edges.slice().reverse()) vein(nodes[i], nodes[j], Math.max(u * 0.26, u * (0.66 - 0.085 * depth.get(j))));
    { let loops = 0; for (let i = 0; i < nodes.length && loops < 5; i++) for (let j = i + 1; j < nodes.length && loops < 5; j++) if (dist(i, j) < u * 3.1 && !edges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i))) { vein(nodes[i], nodes[j], u * 0.2); loops++; } }      // and a few ways round
    for (const i of tips) if (!food.includes(i)) for (let k = 0; k < 4; k++) { const a = r() * TAU, l = u * (0.7 + r() * 0.7); vein(nodes[i], [nodes[i][0] + Math.cos(a) * l, nodes[i][1] + Math.sin(a) * l], u * 0.15); }
    g.fillStyle = YEL; g.beginPath(); g.arc(nodes[root][0], nodes[root][1], u * 0.7, 0, TAU); g.fill();
  };
  // a frog, sitting side-on on a leaf, with its gold eye; and under it what it was
  const frog = (cx, cy) => {
    const s = u * 3.1, fx = cx - u * 0.3, fy = cy - u * 1.6, at = pts => pts.map(([a, b]) => [fx + a * s, fy + b * s]);
    const pad = ellipse(fx + 0.1 * s, fy + 1.1 * s, 1.85 * s, 0.3 * s, 0, 30);
    glass(g, pad, C.leaf, r, { mattW: 8 }); pieces.push(pad);
    const body = at([[-1.35, 0.55], [-1.3, 0.05], [-0.9, -0.42], [-0.2, -0.62], [0.35, -0.78], [0.62, -1.05], [0.95, -1.02], [1.15, -0.72], [1.55, -0.45], [1.62, -0.25], [1.25, 0.0], [0.7, 0.25], [0.3, 0.72], [-0.6, 0.85]]);
    const thigh = at([[-1.45, 0.62], [-1.05, -0.05], [-0.25, 0.1], [-0.05, 0.55], [-0.5, 0.86]]), foot = at([[-0.55, 0.82], [-0.05, 0.55], [0.6, 0.88], [0.75, 1.0], [-0.4, 1.0]]), arm = at([[0.55, 0.25], [0.85, 0.2], [1.0, 0.95], [1.25, 1.02], [0.7, 1.02]]);
    glass(g, body, [104, 56, 42], r, { mattW: 12, matt: 0.4 }); glass(g, thigh, [100, 52, 35], r, { mattW: 9, matt: 0.42 }); glass(g, foot, [96, 50, 31], r, { mattW: 6 }); glass(g, arm, [102, 50, 37], r, { mattW: 6 });
    pieces.push(body, thigh, foot, arm);
    const eye = circle(fx + 0.8 * s, fy - 0.78 * s, 0.22 * s, 18); glass(g, eye, C.gold, r, { mattW: 3 }); pieces.push(eye);
    g.fillStyle = paint(0.95); g.beginPath(); g.ellipse(fx + 0.82 * s, fy - 0.78 * s, 0.12 * s, 0.06 * s, 0, 0, TAU); g.fill();
    g.strokeStyle = paint(0.55); g.lineWidth = 1.6; g.beginPath(); g.moveTo(fx + 1.58 * s, fy - 0.3 * s); g.quadraticCurveTo(fx + 1.15 * s, fy - 0.2 * s, fx + 0.7 * s, fy - 0.42 * s); g.stroke();
    g.beginPath(); g.moveTo(fx - 1.0 * s, fy - 0.3 * s); g.quadraticCurveTo(fx - 0.2 * s, fy - 0.55 * s, fx + 0.6 * s, fy - 0.62 * s); g.stroke();
    for (let k = 0; k < 12; k++) { g.fillStyle = 'rgba(30,40,10,.4)'; g.beginPath(); g.arc(fx + (r() - 0.7) * 1.6 * s, fy + (r() - 0.65) * 0.9 * s, 0.06 * s + r() * 0.06 * s, 0, TAU); g.fill(); }
    // the tadpole
    const tx = cx + u * 1.0, ty = cy + u * 5.0, tad = [], k2 = 1.35;
    for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI; tad.push([tx + Math.cos(a) * u * 1.1 * k2, ty + Math.sin(a) * u * 0.62 * k2]); }
    for (let i = 1; i <= 10; i++) { const t = i / 10; tad.push([tx - t * u * 3.4 * k2, ty + u * 0.62 * k2 * (1 - t) ** 1.6 + Math.sin(t * 5) * u * 0.3]); }
    for (let i = 10; i >= 1; i--) { const t = i / 10; tad.push([tx - t * u * 3.4 * k2, ty - u * 0.62 * k2 * (1 - t) ** 1.6 + Math.sin(t * 5) * u * 0.3]); }
    glass(g, tad, [70, 40, 30], r, { mattW: 6, matt: 0.4 }); pieces.push(tad);
    g.fillStyle = 'rgba(255,250,235,.95)'; g.beginPath(); g.arc(tx + u * 0.75, ty - u * 0.22, u * 0.22, 0, TAU); g.fill(); g.fillStyle = paint(0.95); g.beginPath(); g.arc(tx + u * 0.81, ty - u * 0.22, u * 0.1, 0, TAU); g.fill();
  };
  // xenobots: a few thousand frog cells that were never told to be a frog; they swim, and sweep loose cells into heaps
  const xeno = (cx, cy) => {
    for (const [dx, dy, R, a0] of [[-1.3, -3.4, 2.2, 0.5], [1.6, 0.5, 1.9, 2.6], [-1.6, 4.0, 1.6, 0.0]]) {
      const x = cx + dx * u, y = cy + dy * u, rad = R * u, p = [[x + Math.cos(a0) * rad * 0.2, y + Math.sin(a0) * rad * 0.2]];
      for (let i = 0; i <= 30; i++) { const a = a0 + 0.55 + i / 30 * (TAU - 1.1); p.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]); }
      glass(g, p, [24, 56, 72], r, { mattW: 9, matt: 0.4 }); pieces.push(p);
      g.save(); path(g, [p]); g.clip(); g.strokeStyle = 'rgba(90,40,20,.4)'; g.lineWidth = 1;
      for (let k = 0; k < R * 16; k++) { const a = r() * TAU, d = Math.sqrt(r()) * rad; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, u * 0.2, 0, TAU); g.stroke(); }
      g.restore();
      // the heap in front of its mouth, and a few strays
      for (let k = 0; k < 16; k++) { const a = a0 + (r() - 0.5) * 1.1, d = rad * (0.75 + r() * 0.85) * (k < 11 ? 1 : 1.6); g.fillStyle = `rgba(255,236,206,${0.55 + r() * 0.4})`; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, u * (0.09 + r() * 0.07), 0, TAU); g.fill(); }
    }
  };
  const FIELD = [[C.ruby, [200, 40, 74], C.ruby], [[282, 40, 20], [206, 62, 38], C.violet]];
  for (let i = 0; i < 3; i++) {
    const f = F[i], rx = RX[i], inMed = (x, y, m) => [m1, m2].some(my => ((x - f.cx) / (rx - m)) ** 2 + ((y - my) / (RY - m)) ** 2 < 1);
    // the ground: deep blue above, coming down through sea green to green; lighter where the beam passes behind it
    const cells = voronoi(sitesIn((x, y) => f.inside(x, y) && !inMed(x, y, u * 1.2), f.x0, f.y0, f.x1, f.y1, 420, r, u * 1.45), f.inner);
    yield;
    let n = 0;
    for (const p of cells) {
      const [x, y] = centroid(p), t = clamp((y - yF) / (m2 - yF), 0, 1), glow = y > yF - u * 3 && y < m2 ? smooth(u * 3.4, u * 0.8, Math.abs(x - f.cx)) * (1 - 0.55 * t) : 0;
      glass(g, p, shift(skyAt(y), 0, -8 * glow, 13 * glow), r, { mattW: 7, matt: 0.3 });
      if (++n % 80 === 0) yield;
    }
    // painted on it: points of light and a few small forms above, ripples lower down, weed at the foot
    g.save(); path(g, [f.inner]); g.clip();
    for (let k = 0; k < 46; k++) { const x = f.x0 + r() * (f.x1 - f.x0), y = f.y0 + r() * (m1 - f.y0); g.fillStyle = `rgba(255,250,225,${0.35 + r() * 0.5})`; g.beginPath(); g.arc(x, y, 0.7 + r() * 1.2, 0, TAU); g.fill(); }
    for (let k = 0; k < 6; k++) {
      const x = f.cx + (k % 2 ? 1 : -1) * (f.x1 - f.x0) * (0.24 + r() * 0.18), y = yF - u * 2.4 + k * u * 1.5, s = u * (0.36 + r() * 0.2), nn = 3 + (k + i) % 4, a0 = r() * TAU;
      if (!f.inside(x, y, s * 1.3)) continue;
      g.strokeStyle = k % 3 ? 'rgba(255,232,150,.9)' : 'rgba(240,248,255,.88)'; g.lineWidth = 1.5; g.beginPath(); for (let q = 0; q <= nn; q++) { const a = a0 + q / nn * TAU; q ? g.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s) : g.moveTo(x + Math.cos(a) * s, y + Math.sin(a) * s); } g.stroke();
    }
    g.strokeStyle = 'rgba(210,255,240,.24)'; g.lineWidth = 1.3;
    for (let k = 0; k < 26; k++) { const x = f.x0 + r() * (f.x1 - f.x0), y = m1 + RY + r() * (f.y1 - m1 - RY - u), l = u * (0.6 + r() * 1.2); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - u * 0.18, x + l, y); g.stroke(); }
    g.strokeStyle = 'rgba(10,40,20,.5)'; g.lineWidth = 2.2;
    for (let k = 0; k < 16; k++) { const x = f.x0 + r() * (f.x1 - f.x0), y = f.y1 - r() * u * 0.4, h = u * (1.4 + r() * 3.2); g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + u * 0.3, y - h * 0.3, x - u * 0.3, y - h * 0.6, x + (r() - 0.5) * u * 0.6, y - h); g.stroke(); }
    g.restore();
    leads(g, cells, LW * 0.85, r);
    yield;
    // the beam: pale gold from the form down to the first body, and on, fainter, to the second
    const glowC = i === 1 ? [52, 60, 84] : [44, 88, 66], rf = u * (i === 1 ? 2.5 : 2.2);
    for (const [ya, yb, wa, wb] of [[yF, m1 - RY + 3, u * 1.25, u * 0.95], [m1 + RY - 3, m2 - RY + 3, u * 0.8, u * 0.6]]) {
      const p = [[f.cx - wa, ya], [f.cx + wa, ya], [f.cx + wb, yb], [f.cx - wb, yb]];
      glass(g, p, ya > m1 ? shift(glowC, 0, -6, -6) : glowC, r, { mattW: 5, matt: 0.15, hj: 3, lj: 3 });
      g.save(); path(g, [p]); g.clip(); g.strokeStyle = 'rgba(255,255,240,.34)'; g.lineWidth = 1; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(f.cx + k * wa * 0.3, ya); g.lineTo(f.cx + k * wb * 0.3, yb); g.stroke(); } g.restore();
      pieces.push(p);
    }
    flush();
    // the form in the arch, cut in luminous glass, with its halo
    for (let k = 1; k <= 3; k++) { g.strokeStyle = `rgba(255,240,190,${0.5 - k * 0.11})`; g.lineWidth = 1.3; g.beginPath(); g.arc(f.cx, yF, rf * (1.18 + k * 0.2), 0, TAU); g.stroke(); }
    if (i === 0) { const p = [0, 1, 2].map(k => [f.cx + Math.cos(-Math.PI / 2 + k * TAU / 3) * rf * 1.12, yF + rf * 0.14 + Math.sin(-Math.PI / 2 + k * TAU / 3) * rf * 1.12]), q = [0, 1, 2].map(k => [f.cx + Math.cos(-Math.PI / 2 + k * TAU / 3) * rf * 0.42, yF + rf * 0.14 + Math.sin(-Math.PI / 2 + k * TAU / 3) * rf * 0.42]); glass(g, [p, q], C.white, r, { mattW: 6 }); glass(g, q, C.gold, r, { mattW: 4 }); pieces.push(p, q); }
    if (i === 1) { const c = circle(f.cx, yF, rf, 40), c2 = circle(f.cx, yF, rf * 0.56, 40); glass(g, [c, c2], C.white, r, { mattW: 6 }); glass(g, c2, C.gold, r, { mattW: 6 }); pieces.push(c, c2); }
    if (i === 2) { const p = []; for (let k = 0; k < 14; k++) { const a = -Math.PI / 2 + (k / 14) * TAU, rr = k % 2 ? rf * 0.52 : rf * 1.08; p.push([f.cx + Math.cos(a) * rr, yF + Math.sin(a) * rr]); } glass(g, p, C.gold, r, { mattW: 6 }); pieces.push(p); const c = circle(f.cx, yF, rf * 0.3, 20); glass(g, c, C.ruby, r, { mattW: 4 }); pieces.push(c); }
    flush();
    yield;
    // the two bodies
    medal(f.cx, m1, rx, FIELD[0][i]);
    if (i === 0) cell(f.cx, m1);
    if (i === 1) { worm(f.cx - u * 0.3, m1 - u * 2.7, u * 10.6, u * 2.9, -0.2, false); worm(f.cx + u * 0.3, m1 + u * 2.9, u * 10.4, u * 2.8, 0.12, true); }
    if (i === 2) gears(f.cx, m1);
    flush();
    yield;
    medal(f.cx, m2, rx, FIELD[1][i]);
    if (i === 0) slime(f.cx, m2, rx);
    if (i === 1) frog(f.cx, m2);
    if (i === 2) xeno(f.cx, m2);
    flush();
    // at the foot of the side lights, beside the words: the pond's edge, three leaves and a flower
    if (i !== 1) {
      const sg = i ? -1 : 1, yb = (m2 + RY + f.y1) / 2;
      for (const [dx, dy, rad, a0] of [[-3.0, 1.3, 2.5, 0.6], [2.4, 0.2, 2.0, 3.6], [0.1, -1.9, 1.5, 5.2]]) {
        const x = f.cx + sg * dx * u, y = yb + dy * u, p = [[x, y]];
        for (let k = 0; k <= 22; k++) { const a = a0 + 0.22 + k / 22 * (TAU - 0.44); p.push([x + Math.cos(a) * rad * u, y + Math.sin(a) * rad * u * 0.52]); }
        glass(g, p, shift(C.leaf, 0, 0, rad * 2 - 4), r, { mattW: 7, matt: 0.36 }); pieces.push(p);
        g.strokeStyle = 'rgba(20,50,10,.4)'; g.lineWidth = 1.1; for (let k = 0; k < 7; k++) { const a = a0 + 0.6 + k / 7 * (TAU - 1.0); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * rad * u * 0.86, y + Math.sin(a) * rad * u * 0.45); g.stroke(); }
      }
      const fx = f.cx + sg * 2.5 * u, fy = yb - 1.5 * u;
      for (let k = 0; k < 5; k++) { const a = -Math.PI + (k + 0.5) / 5 * Math.PI, p = ellipse(fx + Math.cos(a) * u * 0.62, fy + Math.sin(a) * u * 0.62, u * 0.66, u * 0.28, a, 12); glass(g, p, k % 2 ? C.white : C.rose, r, { mattW: 3, matt: 0.2 }); pieces.push(p); }
      flush(LW * 0.6);
    }
    // three saddle bars, at the same heights in every light
    g.fillStyle = '#0d0b09'; for (const y of [m1 - RY - u * 0.95, (m1 + m2) / 2, m2 + RY + u * 1.0]) g.fillRect(f.x0, y - u * 0.07, f.x1 - f.x0, u * 0.14);
    yield;
  }
  // ---- the words, on a ribbon across the foot of the middle light ------------------------------------------
  {
    const f = F[1], lines = [{ text: 'INGRESSING', size: u * 1.7, track: 0.14, lead: 1 }, { text: 'MINDS', size: u * 1.7, track: 0.14, lead: 1.0 }, { text: 'after M. Levin · the word is Whitehead’s', size: u * 0.88, italic: true, track: 0.05, lead: 1.4 }];
    const block = lines[0].size * 0.7 + lines.slice(1).reduce((s2, l) => s2 + l.size * l.lead, 0) + lines.at(-1).size * 0.18, h = block / 0.8 + u * 0.3;
    pieces.push(...banderole(g, f.x0 + u * 0.35, f.x1 - u * 0.35, f.y1 - u * 0.45 - h / 2, h, lines, r, { fold: u * 0.6, wave: u * 0.12 }));
    flush(LW);
  }
  return pieces;
}

// ---- W8: a strange loop -------------------------------------------------------------------------
// After Hofstadter, and Gödel whose numbering it is. In the round head, a ring of twelve steps, each with its
// riser on the same side, so the stair climbs all the way round and arrives where it began. On the treads, one
// prime power to a step, is Gödel's number for a sentence of arithmetic, (∃x)(x = s0 + 0), coded as in
// Nagel and Newman's Gödel's Proof: ( 8, ∃ 4, x 13, ) 9, = 5, s 7, 0 6, + 11. Inside the ring the same
// ring again, smaller, regarding itself; at the heart a roundel of clear glass, with the sky in it (the
// texture is cut away there and chapel.js sets real glass behind it). Out of the ring the stair comes down
// the light in four flights, to and fro, twenty-four steps in the ring's twelve colours twice over, so the
// bottom step is the colour before the top one; and it lands on a tablet with the sentence that speaks of
// itself: G ↔ ¬Prov(⌜G⌝), the signs drawn by hand, as a glass painter would. Behind: night, a dawn, the sea.
export const LOOP_EYE = { u: 0.5, v: TALL[0] / 2 / TALL[1], r: 0.072 };      // the clear roundel: centre (fractions of the width and height; it is the arch's own centre), radius (of the width)
const LOOP_HUES = [46, 36, 24, 4, 340, 300, 268, 228, 206, 184, 158, 100];
const GODEL = [[2, 8], [3, 4], [5, 13], [7, 9], [11, 8], [13, 13], [17, 5], [19, 7], [23, 6], [29, 11], [31, 6], [37, 9]];
function* strangeLoop(g, W, H, seed = 88) {
  const r = rng(seed), f = tall(g, W, H, r, { band: [262, 46, 30], jewelA: C.gold, jewelB: C.teal }), { unit, x0, x1, y0, y1 } = f, pieces = [];
  const ins = inscription(unit, null, 'D. R. Hofstadter · 2007', ['I AM A', 'STRANGE LOOP']), rt = ribbonTop(f, ins);
  const cx = W * LOOP_EYE.u, cy = H * LOOP_EYE.v, eye = W * LOOP_EYE.r;
  const R1 = f.R - unit * 0.75, R0 = R1 * 0.6;
  // the stair's four flights, and the tablet at its foot
  const th = unit * 2.4, ty = rt - unit * 0.8 - th / 2, sTop = cy + R1 + unit * 1.0, sBot = ty - th / 2 - unit * 0.6, FL = 4, NS = 6, FH = (sBot - sTop) / FL, rise = FH / NS, xa = cx - unit * 4.7, run = unit * 9.4 / NS, soff = unit * 1.0;
  // the ground: night above, deep violet round the ring, a dawn rose, and the sea's horizon below it
  // (this window looks out over the island's edge)
  const hy = sTop + FH * 2.9;
  const bg = voronoi(sitesIn((x, y) => f.inside(x, y) && y < hy, x0, y0, x1, hy, 90, r, unit * 2.9), clipHalf(f.inner, 0, 1, hy));
  for (const p of bg) {
    const [, y] = centroid(p), t = smooth(y0, hy, y + (r() - 0.5) * unit * 2);
    glass(g, p, t < 0.6 ? lerpC(C.deep, shift(C.violet, -10, 6, 2), t / 0.6) : lerpC(shift(C.violet, -10, 6, 2), shift(C.rose, 4, -6, -16), (t - 0.6) / 0.4), r, { mattW: 12 });
    pieces.push(p);
  }
  // the sea, in long wavering strips, darker toward the foot
  for (let k = 0, ya = hy; k < 4; k++) {
    const yb = k === 3 ? y1 : hy + (y1 - hy) * (k + 1) * 0.26, wv = (y, ph, flat) => { const p2 = []; for (let x = x0; x <= x1 + 0.1; x += (x1 - x0) / 10) p2.push([x, y + (flat ? 0 : Math.sin(x * 0.05 + ph) * unit * 0.18)]); return p2; };
    const strip = [...wv(ya, k, !k), ...wv(yb, k + 1, k === 3).reverse()];
    glass(g, strip, lerpC(shift(C.azure, 0, -10, 6), C.deep, k / 3.2), r, { mattW: 9, streak: 2 }); pieces.push(strip);
    ya = yb;
  }
  // the light coming up behind the horizon, silver stain over the dawn
  { const gx = (x0 + x1) / 2 + unit * 2, gr = g.createRadialGradient(gx, hy, 0, gx, hy, unit * 7); gr.addColorStop(0, 'rgba(255,214,120,.75)'); gr.addColorStop(0.35, 'rgba(255,190,110,.35)'); gr.addColorStop(1, 'rgba(255,170,110,0)'); g.save(); path(g, [rect(x0, y0, x1, hy)]); g.clip(); g.fillStyle = gr; g.fillRect(x0, hy - unit * 7, x1 - x0, unit * 7); g.restore(); }
  // stars in the night, painted out of the matt
  for (let k = 0; k < 130; k++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (hy - y0) * 0.72; if (!f.inside(x, y, 3) || Math.hypot(x - cx, y - cy) < R1 + unit * 0.7) continue; g.fillStyle = `rgba(255,248,220,${0.3 + r() * 0.5})`; g.beginPath(); g.arc(x, y, 0.7 + r() * 1.4, 0, TAU); g.fill(); }
  leads(g, pieces, unit * 0.22, r); pieces.length = 0;
  yield;
  // a ring of steps: treads and risers as pieces of an annulus, the riser darker and on the same side
  // of every step, the tread shaded toward its foot, so each is a step up from the one before
  const wedge = (Ra, Rb, a0, a1, n = 8) => { const p = []; for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; p.push([cx + Math.cos(a) * Rb, cy + Math.sin(a) * Rb]); } for (let k = n; k >= 0; k--) { const a = a0 + (a1 - a0) * k / n; p.push([cx + Math.cos(a) * Ra, cy + Math.sin(a) * Ra]); } return p; };
  const stair = (Ra, Rb, turn, numerals) => {
    const N = 12, step = TAU / N, rs = step * 0.24;
    // the stringers, a fillet of gold glass inside and out
    for (const [ra, rb] of [[Rb, Rb + unit * 0.42], [Ra - unit * 0.42, Ra]]) { const ring = [circle(cx, cy, rb, 64), circle(cx, cy, ra, 64)]; glass(g, ring, C.gold, r, { matt: 0.3, mattW: 5 }); pieces.push(...ring); }
    for (let k = 0; k < N; k++) {
      const a0 = -Math.PI / 2 + turn + k * step, hue = LOOP_HUES[k];
      const riser = wedge(Ra, Rb, a0, a0 + rs, 3), tread = wedge(Ra, Rb, a0 + rs, a0 + step);
      glass(g, riser, [hue, 62, 20], r, { mattW: 8, matt: 0.5 }); pieces.push(riser);
      glass(g, tread, [hue, 66, 50], r, { mattW: (Rb - Ra) * 0.3, matt: 0.28 }); pieces.push(tread);
      // the shadow each step casts on the tread below it, a wash of paint along its riser
      g.save(); path(g, [tread]); g.clip();
      const sa = a0 + rs, gr = g.createLinearGradient(cx + Math.cos(sa + 0.04) * (Ra + Rb) / 2, cy + Math.sin(sa + 0.04) * (Ra + Rb) / 2, cx + Math.cos(sa + step * 0.45) * (Ra + Rb) / 2, cy + Math.sin(sa + step * 0.45) * (Ra + Rb) / 2);
      gr.addColorStop(0, 'rgba(30,14,6,.55)'); gr.addColorStop(1, 'rgba(30,14,6,0)'); g.fillStyle = gr; path(g, [tread]); g.fill(); g.restore();
      // and its nosing, the edge of the step catching the light, on the far side of the tread
      g.save(); path(g, [tread]); g.clip(); g.strokeStyle = 'rgba(255,246,214,.5)'; g.lineWidth = (Rb - Ra) * 0.07; g.beginPath(); const an = a0 + step - 0.012; g.moveTo(cx + Math.cos(an) * Ra, cy + Math.sin(an) * Ra); g.lineTo(cx + Math.cos(an) * Rb, cy + Math.sin(an) * Rb); g.stroke(); g.restore();
      if (numerals) {
        const [p, e] = GODEL[k], am = a0 + rs + (step - rs) * 0.5, rm = (Ra + Rb) / 2, x = cx + Math.cos(am) * rm, y = cy + Math.sin(am) * rm, sz = (Rb - Ra) * 0.42;
        g.fillStyle = paint(0.92); g.textBaseline = 'alphabetic'; g.textAlign = 'left';
        g.font = `${sz.toFixed(1)}px ${FONT}`; const wb = g.measureText(String(p)).width; g.font = `${(sz * 0.62).toFixed(1)}px ${FONT}`; const we = g.measureText(String(e)).width;
        const xl = x - (wb + we + sz * 0.04) / 2;
        g.font = `${sz.toFixed(1)}px ${FONT}`; g.fillText(String(p), xl, y + sz * 0.33);
        g.font = `${(sz * 0.62).toFixed(1)}px ${FONT}`; g.fillText(String(e), xl + wb + sz * 0.04, y - sz * 0.12);
      }
    }
  };
  stair(R0, R1, 0, true);
  yield;
  // the ring again, inside itself, half a step turned
  stair(eye + unit * 0.65, R0 - unit * 0.6, TAU / 24, false);
  // the clear roundel's fillet
  { const fl = [circle(cx, cy, eye + unit * 0.4, 48), circle(cx, cy, eye, 48)]; glass(g, fl, C.white, r, { matt: 0.2, mattW: 4 }); pieces.push(...fl); }
  yield;
  // the stair down the light, seen from the side: each flight six steps, the last of them a landing; every
  // step a piece of glass in the ring's colours, lit along its tread and dark under it
  for (let n = 0; n < FL * NS; n++) {
    const fl = Math.floor(n / NS), k = n % NS, dir = fl % 2 ? -1 : 1, xs = fl % 2 ? xa + run * NS : xa, Y = sTop + fl * FH;
    const xl = xs + dir * k * run, xr = xs + dir * (k + 1) * run, top = Y + k * rise, hue = LOOP_HUES[n % 12];
    const p = [[xl, top], [xr, top], [xr, k === NS - 1 ? Y + NS * rise : top + rise + soff], [xl, top + soff]];
    glass(g, p, [hue, 66, 50], r, { mattW: 6, matt: 0.3 }); pieces.push(p);
    g.save(); path(g, [p]); g.clip();
    const gr = g.createLinearGradient(0, top + rise * 0.35, 0, top + rise + soff); gr.addColorStop(0, 'rgba(30,14,6,0)'); gr.addColorStop(1, 'rgba(30,14,6,.62)'); g.fillStyle = gr; g.fillRect(Math.min(xl, xr), top, run, rise + soff + 2);
    g.fillStyle = 'rgba(255,246,214,.55)'; g.fillRect(Math.min(xl, xr), top + unit * 0.1, run, unit * 0.1);
    g.restore();
  }
  yield;
  // the tablet, and on it the sentence that speaks of itself
  {
    const tw = (x1 - x0) * 0.86, tx = (x0 + x1) / 2, c = unit * 0.55;
    const tab = [[tx - tw / 2 + c, ty - th / 2], [tx + tw / 2 - c, ty - th / 2], [tx + tw / 2, ty - th / 2 + c], [tx + tw / 2, ty + th / 2 - c], [tx + tw / 2 - c, ty + th / 2], [tx - tw / 2 + c, ty + th / 2], [tx - tw / 2, ty + th / 2 - c], [tx - tw / 2, ty - th / 2 + c]];
    glass(g, tab, [46, 38, 90], r, { matt: 0.14, mattW: 7, lj: 2, hj: 3, streak: 1.2 }); pieces.push(tab);
    g.strokeStyle = paint(0.55); g.lineWidth = 1.2; path(g, [inset(tab, unit * 0.28)]); g.stroke();
    formula(g, tx, ty + unit * 0.42, unit * 1.25, tw * 0.86);
  }
  pieces.push(...ribbon(g, f, ins, r));
  leads(g, pieces, unit * 0.22, r);
  saddle(g, f);
  // the roundel's middle is cut away: chapel.js glazes it with clear glass
  g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(cx, cy, eye - unit * 0.06, 0, TAU); g.fill(); g.restore();
  return pieces;
}
// G ↔ ¬Prov(⌜G⌝), centred on x with its baseline at y, at size s (shrunk to fit within maxW). The
// arrow, the not-sign and the corner quotes are drawn, not set: few faces have them.
function formula(g, x, y, s, maxW) {
  const items = [['t', 'G', true], ['gap', 0.22], ['arrow', 1.05], ['gap', 0.22], ['not', 0.55], ['gap', 0.06], ['t', 'Prov', false], ['t', '(', false], ['gap', 0.04], ['ql', 0.3], ['t', 'G', true], ['qr', 0.3], ['gap', 0.04], ['t', ')', false]];
  const widthAt = sz => items.reduce((w, [k, v, it]) => { if (k === 't') { g.font = `${it ? 'italic ' : ''}${sz}px ${FONT}`; return w + g.measureText(v).width; } return w + v * sz; }, 0);
  if (widthAt(s) > maxW) s *= maxW / widthAt(s);
  let cx = x - widthAt(s) / 2;
  g.fillStyle = paint(1); g.strokeStyle = paint(1); g.lineWidth = s * 0.08; g.lineCap = 'round'; g.lineJoin = 'round'; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  const mid = y - s * 0.3, top = y - s * 0.7;
  for (const [k, v, it] of items) {
    if (k === 't') { g.font = `${it ? 'italic ' : ''}${s}px ${FONT}`; g.fillText(v, cx, y); g.save(); g.lineWidth = s * 0.04; g.strokeText(v, cx, y); g.restore(); cx += g.measureText(v).width; continue; }
    const w = v * s;
    g.beginPath();
    if (k === 'arrow') { const h = s * 0.16; g.moveTo(cx, mid); g.lineTo(cx + w, mid); g.moveTo(cx + h, mid - h); g.lineTo(cx, mid); g.lineTo(cx + h, mid + h); g.moveTo(cx + w - h, mid - h); g.lineTo(cx + w, mid); g.lineTo(cx + w - h, mid + h); }
    if (k === 'not') { g.moveTo(cx + s * 0.04, mid - s * 0.04); g.lineTo(cx + w - s * 0.06, mid - s * 0.04); g.lineTo(cx + w - s * 0.06, mid + s * 0.16); }
    if (k === 'ql') { g.moveTo(cx + w * 0.3, top + s * 0.28); g.lineTo(cx + w * 0.3, top); g.lineTo(cx + w * 0.85, top); }
    if (k === 'qr') { g.moveTo(cx + w * 0.15, top); g.lineTo(cx + w * 0.7, top); g.lineTo(cx + w * 0.7, top + s * 0.28); }
    if (k !== 'gap') g.stroke();
    cx += w;
  }
}

// ======================================================================================================
// Four more of the same family, made for the chapel on Vesper Street (the eight above are the house's).
//   W9  Lorenz             the attractor of 1963, and under it two runs begun a hair apart
//   W10 the logistic map   May's 1976 picture: one fixed point, then two, four, eight, chaos, windows of order
//   W11 Darwin's tree      the branching sketch of Notebook B (1837), "I think" over it, living tips as jewels
//   W12 a logical calculus McCulloch and Pitts's nets of 1943: threshold cells, drawn in their own notation
// ======================================================================================================
function quarries(g, x0, y0, x1, y1, unit, col, r, pieces, o = {}) {
  const qw = unit * 1.7, qh = unit * 2.6, field = o.clip ?? rect(x0, y0, x1, y1);
  for (let j = -1; j * qh / 2 < y1 - y0 + qh; j++) for (let i = -1; i * qw < x1 - x0 + qw; i++) {
    const cx = x0 + i * qw + (j % 2 ? qw / 2 : 0), cy = y0 + j * qh / 2;
    const p = clipPoly([[cx, cy - qh / 2], [cx + qw / 2, cy], [cx, cy + qh / 2], [cx - qw / 2, cy]], field);
    if (p.length < 3) continue;
    glass(g, p, shift(col, (r() - 0.5) * (o.hj ?? 16), 0, (r() - 0.5) * (o.lj ?? 6)), r, { mattW: 6, matt: o.matt ?? 0.2, streak: 2 }); pieces.push(p);
  }
}
const stain = (g, pts, wide, col, dark = 'rgba(30,14,4,.7)') => { g.lineJoin = g.lineCap = 'round'; g.strokeStyle = dark; g.lineWidth = wide * 2.1; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.strokeStyle = col; g.lineWidth = wide; g.stroke(); };

// Lorenz: the attractor is a roundel that fills the round head. Out of it two runs of the same flow, begun one
// part in a hundred thousand apart, come down the light side by side on a long panel, time running down the
// window: one line, one line, and then, two thirds of the way to the ribbon, two.
function* lorenz(g, W, H, seed = 101) {
  const r = rng(seed), f = tall(g, W, H, r, { band: C.teal, jewelA: C.ruby, jewelB: C.gold }), { unit, x0, x1, y0, y1, cx } = f, pieces = [];
  const ins = inscription(unit, ['Deterministic', 'Nonperiodic Flow'], 'E. N. Lorenz · 1963'), rt = ribbonTop(f, ins);
  quarries(g, x0, y0, x1, y1, unit, [226, 44, 70], r, pieces, { clip: f.inner });
  leads(g, pieces, unit * 0.2, r); pieces.length = 0;
  yield;
  // the flow itself: sigma 10, rho 28, beta 8/3, as in the paper
  const run = (x, y, z, n, dt = 0.006) => { const out = []; for (let i = 0; i < n; i++) { const dx = 10 * (y - x), dy = x * (28 - z) - y, dz = x * y - (8 / 3) * z; x += dx * dt; y += dy * dt; z += dz * dt; out.push([x, y, z]); } return out; };
  const R = f.R - unit * 0.12, cy = f.sy + unit * 0.2;
  const med = circle(cx, cy, R, 64), inner = circle(cx, cy, R - unit * 0.3, 64);
  glass(g, [med, inner], C.gold, r, { mattW: 6 }); pieces.push(med);
  glass(g, inner, shift(C.deep, 0, 0, -3), r, { mattW: R * 0.55, matt: 0.45 }); pieces.push(inner);
  const tr = run(0.1, 0, 0, 9000).slice(600), sc = (R - unit * 0.9) / 24;
  g.save(); path(g, [inner]); g.clip(); g.lineJoin = g.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i + 40 < tr.length; i += 40) {
      const seg = tr.slice(i, i + 41), left = seg[20][0] < 0;
      g.strokeStyle = pass ? (left ? 'rgba(170,222,255,.75)' : 'rgba(255,212,110,.8)') : 'rgba(10,6,20,.35)'; g.lineWidth = pass ? unit * 0.075 : unit * 0.2;
      g.beginPath(); seg.forEach(([x, , z], k) => { const px = cx + x * sc, py = cy + (25 - z) * sc * 0.98; k ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke();
    }
    g.restore(); yield; g.save(); path(g, [inner]); g.clip(); g.lineJoin = g.lineCap = 'round';
  }
  g.restore();
  // the long panel under it, in courses of pale glass, and the two runs down it
  const py0 = cy + R + unit * 0.7, py1 = rt - unit * 0.7, px0 = x0 + unit * 1.5, px1 = x1 - unit * 1.5, NC = 5;
  for (let k = 0; k < NC; k++) { const p = rect(px0, py0 + (py1 - py0) * k / NC, px1, py0 + (py1 - py0) * (k + 1) / NC); glass(g, p, shift(C.ice, 0, -6, 4 - k * 1.5), r, { mattW: 8, matt: 0.22 }); pieces.push(p); }
  for (const s of [0, 1]) { const p = rect(s ? px1 : px0 - unit * 0.3, py0, s ? px1 + unit * 0.3 : px0, py1); glass(g, p, C.gold, r, { mattW: 3, matt: 0.25 }); pieces.push(p); }
  const NT = 5600, A = run(1, 1, 20, NT, 0.005), Bq = run(1.00001, 1, 20, NT, 0.005), mx = (px0 + px1) / 2, sx = (px1 - px0) * 0.43 / 20;
  const ty = i => py0 + unit * 0.5 + (py1 - py0 - unit) * i / NT;
  yield;
  g.save(); path(g, [rect(px0, py0, px1, py1)]); g.clip();
  stain(g, Bq.filter((_, i) => i % 5 === 0).map(([x], i) => [mx + x * sx, ty(i * 5)]), unit * 0.12, 'rgba(176,30,48,.95)', 'rgba(60,10,10,.25)');
  stain(g, A.filter((_, i) => i % 5 === 0).map(([x], i) => [mx + x * sx, ty(i * 5)]), unit * 0.12, 'rgba(24,40,120,.95)', 'rgba(10,10,40,.2)');
  g.restore();
  yield;
  pieces.push(...ribbon(g, f, ins, r));
  leads(g, pieces, unit * 0.22, r);
  saddle(g, f);
  return pieces;
}

// The logistic map, stood on end and read upward, as a tree: one stem behind the ribbon (a single fixed point),
// which forks at r = 3, forks again and again, and breaks into chaos, whose crown fills the round head (r = 4
// at the top of the arch; the window of order at 3.83 comes just at the springing).
function* logistic(g, W, H, seed = 202) {
  const r = rng(seed), f = tall(g, W, H, r, { band: C.violet, jewelA: C.gold, jewelB: C.emerald }), { unit, x0, x1, y0, y1 } = f, pieces = [];
  const ins = inscription(unit, ['Simple mathematical', 'models with very', 'complicated dynamics'], 'R. M. May · Nature · 1976');
  // the field: courses of night-blue glass the whole height, a little lighter toward the crown
  const N = 10;
  for (let k = 0; k < N; k++) { const p = clipPoly(rect(x0, y0 + (y1 - y0) * k / N, x1, y0 + (y1 - y0) * (k + 1) / N), f.inner); glass(g, p, shift(C.deep, (N - 1 - k) * 4, 0, (N - 1 - k) * 0.9), r, { mattW: 10, matt: 0.3 }); pieces.push(p); }
  leads(g, pieces, unit * 0.22, r); pieces.length = 0;
  yield;
  // x' = r x (1 - x): for each r, throw away the first three hundred turns and mark where it goes after
  g.save(); path(g, [f.inner]); g.clip();
  const R0 = 2.7, R1 = 4.0, rows = Math.round((y1 - y0) * 1.5), fx0 = x0 + unit * 0.35, fw = x1 - x0 - unit * 0.7;
  for (let j = 0; j < rows; j++) {
    const t = j / (rows - 1), rr = R0 + (R1 - R0) * t, y = y1 - (y1 - y0) * t; let x = 0.5 + (r() - 0.5) * 0.2;
    for (let i = 0; i < 300; i++) x = rr * x * (1 - x);
    const few = rr < 3.5699; g.fillStyle = few ? 'rgba(255,220,130,.9)' : 'rgba(255,214,120,.42)';
    for (let i = 0; i < (few ? 16 : 110); i++) { x = rr * x * (1 - x); g.fillRect(fx0 + x * fw - (few ? 1.3 : 0.6), y - 0.5, few ? 2.6 : 1.2, 1.2); }
    if (j % 40 === 39) yield;
  }
  // r marked at the sides where the path first splits, splits again, where order gives out (3.5699...), and at the window of three
  g.fillStyle = 'rgba(255,224,150,.9)';
  for (const rr of [3, 3.449, 3.5699, 3.8284]) { const y = y1 - (y1 - y0) * (rr - R0) / (R1 - R0); g.fillRect(x0, y - 0.9, unit * 0.55, 1.8); g.fillRect(x1 - unit * 0.55, y - 0.9, unit * 0.55, 1.8); }
  g.restore();
  yield;
  pieces.push(...ribbon(g, f, ins, r));
  leads(g, pieces, unit * 0.22, r);
  saddle(g, f);
  return pieces;
}

// Darwin's tree, grown to the height of the light: the one stock, numbered 1, rooted over the ribbon, "I think"
// written beside it as he wrote it, and the branching carried up until its twigs fill the round head.
function* darwinTree(g, W, H, seed = 303) {
  const r = rng(seed), f = tall(g, W, H, r, { band: C.green, jewelA: C.amber, jewelB: C.rose }), { unit, x0, x1, y0, y1, cx } = f, pieces = [];
  const ins = inscription(unit, ['endless forms', 'most beautiful'], 'C. Darwin · 1859'), rt = ribbonTop(f, ins);
  quarries(g, x0, y0, x1, y1, unit, [52, 46, 84], r, pieces, { hj: 10, clip: f.inner });      // the notebook's page
  leads(g, pieces, unit * 0.2, r); pieces.length = 0;
  yield;
  // the tree of Notebook B, page 36: one stock, numbered 1, forking unevenly; a bar across a twig's end for a
  // line that came through to the present (here a jewel), nothing for one that did not
  const root = [cx + unit * 1.7, rt - unit * 2.0], twigs = [], tips = [], UPW = -Math.PI / 2;
  const free = (x, y) => f.inside(x, y, unit * 1.0) && y < root[1] && !(x < root[0] - unit * 0.7 && y > root[1] - unit * 7);      // (the room kept for his two words)
  const grow = (x, y, a, len, depth) => {
    const bend = (r() - 0.5) * 0.5, x2 = x + Math.cos(a + bend) * len, y2 = y + Math.sin(a + bend) * len;
    if (!free(x2, y2)) { tips.push([x, y, a, true]); return; }
    twigs.push([x, y, x2, y2, depth]);
    if (depth >= 8 || (depth > 3 && r() < 0.15)) { tips.push([x2, y2, a, r() < 0.7]); return; }
    const n = r() < 0.3 ? 3 : 2, spread = 0.5 + r() * 0.35;
    for (let k = 0; k < n; k++) { const b = a + (k - (n - 1) / 2) * spread + (r() - 0.5) * 0.25; grow(x2, y2, b + (UPW - b) * 0.3, len * (0.74 + r() * 0.2), depth + 1); }
  };
  grow(root[0], root[1], UPW + 0.04, unit * 8.4, 0);
  g.save(); path(g, [f.inner]); g.clip(); g.lineCap = 'round';
  for (const [xa, ya, xb, yb, d] of twigs) { g.strokeStyle = paint(0.92); g.lineWidth = Math.max(1.8, unit * (0.62 - d * 0.075)); g.beginPath(); g.moveTo(xa, ya); g.quadraticCurveTo((xa + xb) / 2 + (yb - ya) * 0.08, (ya + yb) / 2 - (xb - xa) * 0.08, xb, yb); g.stroke(); }
  g.restore();
  yield;
  const hues = [350, 24, 46, 128, 160, 184, 206, 276, 300, 96], set = [];
  tips.forEach(([x, y, a, alive], i) => {
    if (!alive || set.some(q => Math.hypot(q[0] - x, q[1] - y) < unit * 1.15)) return;
    set.push([x, y]);
    const j = circle(x, y, unit * (0.42 + r() * 0.16), 14); glass(g, j, [hues[i % hues.length], 70, 40 + r() * 12], r, { mattW: 3, matt: 0.3 }); pieces.push(j);
  });
  // "I think", as he wrote it by the sketch (on a slip of the page's own glass, so it reads), and the 1 at the root
  { const ty = root[1] - unit * 3.1, slip = rect(x0 + unit * 0.45, ty - unit * 2.0, root[0] - unit * 1.0, ty + unit * 0.95); glass(g, slip, [50, 44, 89], r, { matt: 0.14, mattW: 6, lj: 2, hj: 3, streak: 1.2 }); pieces.push(slip);
    g.fillStyle = paint(0.95); g.strokeStyle = paint(0.95);
    setLine(g, 'I think', (x0 + unit * 0.45 + root[0] - unit * 1.0) / 2, ty, unit * 2.0, { italic: true, bold: 0.05 }); }
  const one = circle(root[0], root[1] + unit * 0.75, unit * 0.62, 18); glass(g, one, C.white, r, { mattW: 3, matt: 0.2 }); pieces.push(one);
  g.fillStyle = paint(0.95); setLine(g, '1', root[0], root[1] + unit * 1.08, unit * 0.95, {});
  yield;
  pieces.push(...ribbon(g, f, ins, r));
  leads(g, pieces, unit * 0.22, r);
  saddle(g, f);
  return pieces;
}

// McCulloch and Pitts's net, hung the height of the light: one cell under the crown of the arch with its two
// afferents coming in from above, the net widening and narrowing below it, seven ranks deep, and the last
// cell's axon going down behind the ribbon.
function* calculus(g, W, H, seed = 404) {
  const r = rng(seed), f = tall(g, W, H, r, { band: C.azure, jewelA: C.ruby, jewelB: C.straw }), { unit, x0, x1, y0, y1 } = f, pieces = [];
  const ins = inscription(unit, ['A Logical Calculus', 'of the Ideas Immanent', 'in Nervous Activity'], 'W. S. McCulloch & W. Pitts · 1943'), rt = ribbonTop(f, ins);
  quarries(g, x0, y0, x1, y1, unit, [150, 22, 80], r, pieces, { hj: 14, clip: f.inner });
  leads(g, pieces, unit * 0.2, r); pieces.length = 0;
  yield;
  // a net in their notation: each cell a triangle, its axon leaving the point; a filled knob excites,
  // a loop round the cell inhibits (absolutely); a cell fires when its knobs reach its threshold
  const top = y0 + unit * 3.6, bot = rt - unit * 3.0, rowsN = [1, 2, 3, 2, 3, 2, 1], cells = [];
  rowsN.forEach((n, j) => { for (let i = 0; i < n; i++) cells.push({ j, x: x0 + (x1 - x0) * (i + 0.5) / n + (n > 1 ? (r() - 0.5) * unit * 0.5 : 0), y: top + (bot - top) * j / (rowsN.length - 1), on: r() < 0.5 }); });
  const s = unit * 1.25, tri = c => [[c.x - s, c.y - s * 0.8], [c.x + s, c.y - s * 0.8], [c.x, c.y + s]];
  g.save(); path(g, [f.inner]); g.clip(); g.lineCap = g.lineJoin = 'round';
  for (const c of cells) for (const d of cells) {
    if (d.j !== c.j + 1 || Math.abs(d.x - c.x) > (x1 - x0) * 0.42) continue;
    const inhibit = r() < 0.22, ax = c.x, ay = c.y + s, bx = d.x + (c.x - d.x) * 0.25, by = d.y - s * 0.8 - (inhibit ? unit * 0.5 : unit * 0.16);
    g.strokeStyle = paint(0.9); g.lineWidth = unit * 0.13; g.beginPath(); g.moveTo(ax, ay); g.bezierCurveTo(ax, ay + (by - ay) * 0.5, bx, by - (by - ay) * 0.5, bx, by); g.stroke();
    if (inhibit) { g.beginPath(); g.arc(bx, by + unit * 0.3, unit * 0.3, 0, TAU); g.stroke(); } else { g.fillStyle = paint(1); g.beginPath(); g.arc(bx, by, unit * 0.2, 0, TAU); g.fill(); }
  }
  // the two afferents of the first cell, in from the arch; and the last cell's axon, away down the light
  { const c = cells[0]; for (const sx of [-1, 1]) { const bx = c.x + sx * s * 0.45, by = c.y - s * 0.8 - unit * 0.16; g.strokeStyle = paint(0.9); g.lineWidth = unit * 0.13; g.beginPath(); g.moveTo(c.x + sx * unit * 3.4, y0); g.bezierCurveTo(c.x + sx * unit * 3.0, by - unit * 1.2, bx, by - unit * 1.6, bx, by); g.stroke(); g.fillStyle = paint(1); g.beginPath(); g.arc(bx, by, unit * 0.2, 0, TAU); g.fill(); } }
  { const c = cells.at(-1); g.strokeStyle = paint(0.9); g.lineWidth = unit * 0.13; g.beginPath(); g.moveTo(c.x, c.y + s); g.lineTo(c.x, y1); g.stroke(); }
  g.restore();
  yield;
  for (const c of cells) {
    const t = tri(c); glass(g, t, c.on ? C.ruby : shift(C.gold, 0, -10, 8), r, { mattW: 7, matt: 0.3 }); pieces.push(t);
    g.fillStyle = c.on ? 'rgba(255,236,214,.95)' : paint(0.9); setLine(g, String(c.j === 0 ? 2 : 1 + ((c.x * 7 | 0) % 2) + (c.j % 2)), c.x, c.y - s * 0.02, unit * 0.9, {});
  }
  yield;
  pieces.push(...ribbon(g, f, ins, r));
  leads(g, pieces, unit * 0.22, r);
  saddle(g, f);
  return pieces;
}

// ======================================================================================================
// The short windows under the tall ones. One family, and quiet: pale quarries inside the border of the window
// above (its own band and jewels), and at the middle one small roundel of that window's colour with a single
// figure drawn on it in silver stain, a footnote to the picture overhead. No words.
// ======================================================================================================
const SILVER = 'rgba(255,226,150,.95)';
const pen = (g, pts, wide, col = SILVER) => stain(g, pts, wide, col, 'rgba(20,10,4,.55)');
const dot = (g, x, y, rad, col = SILVER) => { g.fillStyle = 'rgba(20,10,4,.55)'; g.beginPath(); g.arc(x, y, rad * 1.35, 0, TAU); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill(); };
const LOWS = {
  // Life: a glider, the smallest thing on the board that travels
  life: { border: { band: C.emerald, jewelA: C.ruby, jewelB: C.gold }, field: [160, 58, 22], draw(g, x, y, R, u) {
    const s = R * 0.36; [[0, -1], [1, 0], [-1, 1], [0, 1], [1, 1]].forEach(([i, j]) => { g.fillStyle = 'rgba(20,10,4,.6)'; g.fillRect(x + (i - 0.5) * s - 1.5, y + (j - 0.5) * s - 1.5, s + 3, s + 3); g.fillStyle = 'rgba(255,214,100,.96)'; g.fillRect(x + (i - 0.5) * s + 1.5, y + (j - 0.5) * s + 1.5, s - 3, s - 3); });
  } },
  // Turing: a seed head, every floret 137.5 degrees round from the last
  turing: { border: { band: C.teal }, field: [184, 52, 22], draw(g, x, y, R) {
    for (let k = 1; k <= 55; k++) { const a = k * 2.39996, q = Math.sqrt(k / 55); dot(g, x + Math.cos(a) * R * 0.82 * q, y + Math.sin(a) * R * 0.82 * q, R * (0.035 + 0.04 * q)); }
  } },
  // the strange loop: the tribar, three right angles that cannot all be there
  loop: { border: { band: [262, 46, 30], jewelA: C.gold, jewelB: C.teal }, field: [262, 44, 24], draw(g, x, y, R, u) {
    const A = R * 0.84, w = A * 0.2, d = w / Math.sin(Math.PI / 3), k = (A / 2 - w) / (A / 2), cy = y + A * 0.12;
    const V = [0, 1, 2].map(i => [x + A * Math.cos(-Math.PI / 2 + i * TAU / 3), cy + A * Math.sin(-Math.PI / 2 + i * TAU / 3)]), Hh = V.map(([vx, vy]) => [x + (vx - x) * k, cy + (vy - cy) * k]);
    const to = (p, q, len) => { const l = Math.hypot(q[0] - p[0], q[1] - p[1]); return [p[0] + (q[0] - p[0]) * len / l, p[1] + (q[1] - p[1]) * len / l]; };
    const hex = [], Qs = [];
    for (let i = 0; i < 3; i++) { const v = V[(i + 1) % 3]; hex.push(to(v, V[i], d)); const q = to(v, V[(i + 2) % 3], d); hex.push(q); Qs.push(q); }
    pen(g, [...hex, hex[0], hex[1]], u * 0.16); pen(g, [...Hh, Hh[0], Hh[1]], u * 0.16);
    for (let i = 0; i < 3; i++) pen(g, [Hh[(i + 1) % 3], Qs[i]], u * 0.16);
  } },
  // eigen-behaviour: the same turn again and again, down to the point that stays
  eigen: { border: { band: C.ruby, jewelA: C.blue, jewelB: C.gold }, field: [350, 62, 24], draw(g, x, y, R, u) {
    const pts = []; for (let a = 0; a <= 26; a += 0.12) { const q = R * 0.84 * Math.exp(-a * 0.135); pts.push([x + Math.cos(a) * q, y + Math.sin(a) * q]); }
    pen(g, pts, u * 0.14); dot(g, x, y, u * 0.2);
  } },
  // the neuron: one more of Cajal's cells, a small one, black on amber
  neuron: { border: { band: [24, 70, 26], jewelA: C.blue, jewelB: C.ruby, inner: C.straw }, field: [38, 84, 52], draw(g, x, y, R, u, r) {
    const ink = 'rgba(28,17,9,.92)', tw = (px, py, a, len, wd, n) => { const bend = (r() - 0.5) * 0.5, qx = px + Math.cos(a + bend) * len, qy = py + Math.sin(a + bend) * len; g.strokeStyle = ink; g.lineCap = 'round'; g.lineWidth = wd; g.beginPath(); g.moveTo(px, py); g.lineTo(qx, qy); g.stroke(); if (n > 0) for (const s of [-1, 1]) tw(qx, qy, a + s * (0.3 + r() * 0.35), len * 0.74, Math.max(1, wd * 0.68), n - 1); };
    const sy = y + R * 0.3;
    tw(x, sy, -Math.PI / 2, R * 0.36, u * 0.2, 3); for (const a of [0.45, 1.25, 1.9, 2.7]) tw(x, sy, a, R * 0.2, u * 0.11, 2);
    g.fillStyle = ink; g.beginPath(); g.moveTo(x, sy - R * 0.16); g.lineTo(x + R * 0.11, sy + R * 0.08); g.lineTo(x - R * 0.11, sy + R * 0.08); g.closePath(); g.fill();
  } },
  // broken symmetry: one needle, pointing the way they all chose
  symmetry: { border: { band: C.violet }, field: [276, 46, 26], draw(g, x, y, R) {
    const dir = -1.15, L = R * 0.76, wN = R * 0.17, c = Math.cos(dir), s = Math.sin(dir), px = -s, py = c;
    g.fillStyle = 'rgba(20,10,4,.5)'; g.beginPath(); g.moveTo(x + c * (L + 4), y + s * (L + 4)); g.lineTo(x + px * (wN + 3), y + py * (wN + 3)); g.lineTo(x - c * (L + 4), y - s * (L + 4)); g.lineTo(x - px * (wN + 3), y - py * (wN + 3)); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,214,90,.96)'; g.beginPath(); g.moveTo(x + c * L, y + s * L); g.lineTo(x + px * wN, y + py * wN); g.lineTo(x - px * wN, y - py * wN); g.closePath(); g.fill();
    g.fillStyle = 'rgba(226,222,236,.92)'; g.beginPath(); g.moveTo(x - c * L, y - s * L); g.lineTo(x + px * wN, y + py * wN); g.lineTo(x - px * wN, y - py * wN); g.closePath(); g.fill();
    g.fillStyle = paint(0.9); g.beginPath(); g.arc(x, y, R * 0.06, 0, TAU); g.fill();
  } },
  // Darwin's tree: a seedling, two seed leaves and the first true pair
  tree: { border: { band: C.green, jewelA: C.amber, jewelB: C.rose }, field: [128, 44, 22], draw(g, x, y, R, u) {
    const stem = []; for (let i = 0; i <= 20; i++) { const t = i / 20; stem.push([x + Math.sin(t * 2.2) * R * 0.07, y + R * 0.72 - t * R * 1.25]); }
    pen(g, stem, u * 0.16);
    const leaf = (t, a, len) => { const [lx, ly] = stem[Math.round(t * 20)], p = ellipse(lx + Math.cos(a) * len * 0.5, ly + Math.sin(a) * len * 0.5, len * 0.5, len * 0.2, a, 20); g.fillStyle = 'rgba(20,10,4,.55)'; g.lineJoin = 'round'; g.strokeStyle = 'rgba(20,10,4,.55)'; g.lineWidth = 3; path(g, [p]); g.stroke(); g.fillStyle = SILVER; g.fill(); };
    leaf(0.5, -0.35, R * 0.58); leaf(0.5, Math.PI + 0.35, R * 0.58); leaf(1, -0.95, R * 0.36); leaf(1, Math.PI + 0.75, R * 0.36);
  } },
  // the logistic map: the parabola, the diagonal, and a path stepping between them that never settles
  logistic: { border: { band: C.violet, jewelA: C.gold, jewelB: C.emerald }, field: [228, 62, 20], draw(g, x, y, R, u) {
    const s = R * 1.24, bx = x - s / 2, by = y + s / 2, at = (a, b) => [bx + a * s, by - b * s], f = v => 3.9 * v * (1 - v);
    g.lineJoin = g.lineCap = 'round';
    pen(g, [at(0, 1), at(0, 0), at(1, 0)], u * 0.1); pen(g, [at(0, 0), at(1, 1)], u * 0.08);
    const web = []; let v = 0.12; web.push(at(v, 0)); for (let i = 0; i < 9; i++) { const w = f(v); web.push(at(v, w), at(w, w)); v = w; }
    g.strokeStyle = 'rgba(255,170,150,.9)'; g.lineWidth = u * 0.07; g.beginPath(); web.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke();
    const par = []; for (let a = 0; a <= 1.001; a += 0.04) par.push(at(a, f(a))); pen(g, par, u * 0.15);
  } },
  // Lorenz: a few turns of the same flow
  lorenz: { border: { band: C.teal, jewelA: C.ruby, jewelB: C.gold }, field: [228, 66, 18], draw(g, x, y, R, u) {
    let px = 0.1, py = 0, pz = 0; const pts = [];
    for (let i = 0; i < 3400; i++) { const dx = 10 * (py - px), dy = px * (28 - pz) - py, dz = px * py - (8 / 3) * pz; px += dx * 0.006; py += dy * 0.006; pz += dz * 0.006; if (i > 500 && i % 2 === 0) pts.push([x + px * R / 25, y + (25 - pz) * R / 27]); }
    g.lineJoin = g.lineCap = 'round'; g.strokeStyle = 'rgba(10,6,20,.4)'; g.lineWidth = u * 0.16; g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke();
    g.strokeStyle = 'rgba(255,220,140,.85)'; g.lineWidth = u * 0.06; g.stroke();
  } },
  // McCulloch and Pitts: one cell, two knobs on it, threshold two: it fires only if both do
  calculus: { border: { band: C.azure, jewelA: C.ruby, jewelB: C.straw }, field: [206, 58, 26], draw(g, x, y, R, u) {
    const s = R * 0.34, t = [[x - s, y - s * 0.7], [x + s, y - s * 0.7], [x, y + s * 1.1]];
    for (const sx of [-1, 1]) { pen(g, [[x + sx * R * 0.52, y - R * 0.78], [x + sx * s * 0.45, y - s * 0.7 - u * 0.24]], u * 0.13); dot(g, x + sx * s * 0.45, y - s * 0.7 - u * 0.2, u * 0.2); }
    pen(g, [[x, y + s * 1.1], [x, y + R * 0.8]], u * 0.13);
    g.lineJoin = 'round'; g.strokeStyle = 'rgba(20,10,4,.6)'; g.lineWidth = 4; path(g, [t]); g.stroke(); g.fillStyle = SILVER; g.fill();
    g.fillStyle = paint(0.95); setLine(g, '2', x, y + s * 0.12, s * 0.95, {});
  } },
};
// One short window, W by H px, under the tall window `id`
export function* lowLight(g, W, H, id, seed = 500) {
  const L = LOWS[id], r = rng(seed), unit = W / 17, b = border(g, rect(0, 0, W, H), r, unit, L.border);
  const [x0, y0] = b.inner[0], [x1, y1] = b.inner[2], pieces = [...b.pieces];
  quarries(g, x0, y0, x1, y1, unit, [56, 26, 71], r, pieces, { hj: 16, lj: 7 });      // old pale glass, a little green, a little straw: not white
  leads(g, pieces, unit * 0.2, r); pieces.length = 0;
  yield;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = unit * 3.7, med = circle(cx, cy, R, 48), inner = circle(cx, cy, R - unit * 0.36, 48);
  glass(g, [med, inner], C.gold, r, { mattW: 5 }); glass(g, inner, L.field, r, { mattW: R * 0.5, matt: 0.36 });
  g.save(); path(g, [inner]); g.clip(); L.draw(g, cx, cy, R - unit * 0.36, unit, r); g.restore();
  pieces.push(med, inner); leads(g, pieces, unit * 0.22, r);
  return pieces;
}

// ---- the set -----------------------------------------------------------------------------------------
// id: [width px, height px, drawing]. The tall windows are all TALL; the end window is GREATPX.
// The Life window is made by makeLife (it keeps its board).
const [TW, TH] = TALL;
// (a fault in the great window's drawing is reported and leaves its glass as far as it got: it must not stop the page)
function* safely(it, name) { try { yield* it; } catch (e) { console.warn('chapel glass: ' + name, e); } }
export const WINDOWS = {
  murmuration: [TW, TH, g => murmuration(g, TW, TH)],
  symmetry: [TW, TH, g => brokenSymmetry(g, TW, TH)],
  turing: [TW, TH, g => turing(g, TW, TH)],
  eigen: [TW, TH, g => eigen(g, TW, TH)],
  neuron: [TW, TH, g => neuron(g, TW, TH)],
  ingression: [GREATPX[0], GREATPX[1], g => safely(ingression(g, GREATPX[0], GREATPX[1]), 'ingression')],
  loop: [TW, TH, g => strangeLoop(g, TW, TH)],
  lorenz: [TW, TH, g => lorenz(g, TW, TH)],
  logistic: [TW, TH, g => logistic(g, TW, TH)],
  tree: [TW, TH, g => darwinTree(g, TW, TH)],
  calculus: [TW, TH, g => calculus(g, TW, TH)],
};

// A small blurred copy of a window, for the light it throws on the floor
export function poolCopy(src, w, h) {
  const a = document.createElement('canvas'); a.width = w * 4; a.height = h * 4; const ga = a.getContext('2d'); ga.fillStyle = '#fff'; ga.fillRect(0, 0, a.width, a.height); ga.drawImage(src, 0, 0, a.width, a.height);     // (white where a window is clear)
  const b = document.createElement('canvas'); b.width = w * 2; b.height = h * 2; b.getContext('2d').drawImage(a, 0, 0, b.width, b.height);
  const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(b, 0, 0, w, h);
  return c;
}
