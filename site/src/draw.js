// Drawing on canvases: the lettering, little pictures and paper textures that signs, labels,
// menus, posters and packaging are made of. Everything takes a 2D context first.
import { F } from './fonts.js';
export { F };

export const TAU = Math.PI * 2;
export function rnd(seed = 1) { let s = seed >>> 0 || 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

// Text. o: { f font family, w weight, it italic, a align, max width, stroke, lw, ls letter spacing (px), rot }
export function T(g, s, x, y, px, col, o = {}) {
  g.save();
  g.font = `${o.it ? 'italic ' : ''}${o.w ?? 'normal'} ${Math.round(px)}px ${o.f ?? F.fraunces}`;
  g.textAlign = o.a ?? 'center'; g.textBaseline = o.base ?? 'middle';
  if (o.ls !== undefined) try { g.letterSpacing = o.ls + 'px'; } catch { /* older browsers */ }
  if (o.rot) { g.translate(x, y); g.rotate(o.rot); x = 0; y = 0; }
  if (o.shadow) { g.fillStyle = o.shadow; g.fillText(s, x + (o.sx ?? px * 0.05), y + (o.sy ?? px * 0.06), o.max); }
  if (o.stroke) { g.lineJoin = 'round'; g.lineWidth = o.lw ?? px * 0.12; g.strokeStyle = o.stroke; g.strokeText(s, x, y, o.max); }
  g.fillStyle = col; g.fillText(s, x, y, o.max);
  g.restore();
}
// Lines of text wrapped to a width; returns the y after the last line.
export function para(g, text, x, y, px, col, width, o = {}) {
  g.save(); g.font = `${o.it ? 'italic ' : ''}${o.w ?? 'normal'} ${Math.round(px)}px ${o.f ?? F.fraunces}`; g.textAlign = o.a ?? 'left'; g.textBaseline = 'top'; g.fillStyle = col;
  const lh = px * (o.lh ?? 1.28);
  for (const block of String(text).split('\n')) {
    let line = '';
    for (const word of block.split(' ')) { const t = line ? line + ' ' + word : word; if (g.measureText(t).width > width && line) { g.fillText(line, x, y); y += lh; line = word; } else line = t; }
    g.fillText(line, x, y); y += lh;
  }
  g.restore(); return y;
}
export const fill = (g, w, h, c) => { g.fillStyle = c; g.fillRect(0, 0, w, h); };
export const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
export const disc = (g, x, y, r, c, stroke, lw) => { g.beginPath(); g.arc(x, y, r, 0, TAU); if (c) { g.fillStyle = c; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw ?? r * 0.1; g.stroke(); } };
export const line = (g, pts, c, lw = 2, close = false) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (close) g.closePath(); g.strokeStyle = c; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };
export const poly = (g, pts, c) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = c; g.fill(); };
export function rrect(g, x, y, w, h, r, c, stroke, lw = 2) { g.beginPath(); g.roundRect(x, y, w, h, r); if (c) { g.fillStyle = c; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }

// Surfaces ------------------------------------------------------------------------------------------
// A little tooth and wear over whatever is there: paper, card, a painted board
export function grain(g, w, h, amt = 0.06, seed = 5) {
  const r = rnd(seed);
  for (let i = 0; i < (w * h) / 220; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${r() * amt})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2); }
}
export function paper(g, w, h, c = '#f1e9d6', seed = 3) { fill(g, w, h, c); grain(g, w, h, 0.05, seed); }
// A sign-painter's board: flat colour, a thin lined border, a little weathering
export function board(g, w, h, c, edge, o = {}) {
  fill(g, w, h, c); grain(g, w, h, o.wear ?? 0.05, o.seed ?? 9);
  if (edge) { g.strokeStyle = edge; g.lineWidth = o.lw ?? Math.max(2, h * 0.02); const m = o.inset ?? h * 0.07; g.strokeRect(m, m, w - 2 * m, h - 2 * m); }
}
// A slate: dusty black with half-wiped ghosts of yesterday
export function slate(g, w, h, c = '#252a28', seed = 4) {
  fill(g, w, h, c); const r = rnd(seed);
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,255,255,${0.012 + r() * 0.022})`; g.beginPath(); g.ellipse(r() * w, r() * h, w * (0.1 + r() * 0.3), h * (0.03 + r() * 0.08), r() * 3, 0, 7); g.fill(); }
}
export const chalk = (g, s, x, y, px, col = '#f1efe6', o = {}) => T(g, s, x, y, px, col, { f: F.caveat, w: 600, ...o });
// A soft glow round bright lettering (neon, bulbs)
export function glow(g, col, blur, draw) { g.save(); g.shadowColor = col; g.shadowBlur = blur; draw(); g.restore(); }

// Little pictures: each is drawn about (x, y) at size s (roughly its height), in colour c ---------------
export const ICON = {
  cup(g, x, y, s, c, bg) {
    g.save(); g.translate(x, y); g.fillStyle = c; g.strokeStyle = c; g.lineWidth = s * 0.07; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-s * 0.3, -s * 0.12); g.lineTo(s * 0.22, -s * 0.12); g.quadraticCurveTo(s * 0.22, s * 0.32, -s * 0.04, s * 0.32); g.quadraticCurveTo(-s * 0.3, s * 0.32, -s * 0.3, -s * 0.12); g.fill();
    g.beginPath(); g.arc(s * 0.25, s * 0.04, s * 0.12, -1.2, 1.5); g.stroke();
    g.beginPath(); g.moveTo(-s * 0.4, s * 0.42); g.lineTo(s * 0.32, s * 0.42); g.stroke();
    for (const dx of [-0.16, 0.04]) { g.beginPath(); g.moveTo(s * dx, -s * 0.22); g.bezierCurveTo(s * (dx - 0.08), -s * 0.32, s * (dx + 0.08), -s * 0.38, s * dx, -s * 0.48); g.stroke(); }
    g.restore();
  },
  book(g, x, y, s, c, bg = '#0000') {
    g.save(); g.translate(x, y); g.strokeStyle = c; g.fillStyle = c; g.lineWidth = s * 0.06; g.lineJoin = 'round';
    for (const k of [-1, 1]) { g.beginPath(); g.moveTo(0, -s * 0.24); g.quadraticCurveTo(k * s * 0.22, -s * 0.36, k * s * 0.46, -s * 0.26); g.lineTo(k * s * 0.46, s * 0.3); g.quadraticCurveTo(k * s * 0.22, s * 0.2, 0, s * 0.32); g.closePath(); g.fill(); }
    g.strokeStyle = bg; g.lineWidth = s * 0.04; g.beginPath(); g.moveTo(0, -s * 0.24); g.lineTo(0, s * 0.32); g.stroke();
    g.restore();
  },
  record(g, x, y, s, c, bg = '#111') {
    disc(g, x, y, s * 0.46, c); for (const k of [0.38, 0.31, 0.24]) disc(g, x, y, s * k, null, bg, s * 0.012);
    disc(g, x, y, s * 0.15, bg); disc(g, x, y, s * 0.03, c);
  },
  fish(g, x, y, s, c, bg = '#0000') {
    g.save(); g.translate(x, y); g.fillStyle = c;
    g.beginPath(); g.moveTo(-s * 0.46, 0); g.quadraticCurveTo(-s * 0.1, -s * 0.3, s * 0.26, 0); g.quadraticCurveTo(-s * 0.1, s * 0.3, -s * 0.46, 0); g.fill();
    g.beginPath(); g.moveTo(s * 0.2, 0); g.lineTo(s * 0.48, -s * 0.2); g.lineTo(s * 0.4, 0); g.lineTo(s * 0.48, s * 0.2); g.closePath(); g.fill();
    disc(g, -s * 0.28, -s * 0.04, s * 0.035, bg === '#0000' ? '#fff' : bg);
    g.strokeStyle = bg === '#0000' ? 'rgba(0,0,0,.35)' : bg; g.lineWidth = s * 0.02; for (const k of [-0.12, 0, 0.1]) { g.beginPath(); g.arc(s * k - s * 0.1, 0, s * 0.14, -0.7, 0.7); g.stroke(); }
    g.restore();
  },
  leaf(g, x, y, s, c, bg = '#0000') {
    g.save(); g.translate(x, y); g.rotate(-0.5); g.fillStyle = c;
    g.beginPath(); g.moveTo(0, s * 0.46); g.bezierCurveTo(-s * 0.42, s * 0.1, -s * 0.3, -s * 0.36, 0, -s * 0.46); g.bezierCurveTo(s * 0.3, -s * 0.36, s * 0.42, s * 0.1, 0, s * 0.46); g.fill();
    g.strokeStyle = bg === '#0000' ? 'rgba(0,0,0,.3)' : bg; g.lineWidth = s * 0.03; g.beginPath(); g.moveTo(0, s * 0.46); g.lineTo(0, -s * 0.36); for (const k of [-0.2, 0, 0.2]) { g.moveTo(0, s * k + s * 0.1); g.lineTo(-s * 0.18, s * k - s * 0.04); g.moveTo(0, s * k + s * 0.1); g.lineTo(s * 0.18, s * k - s * 0.04); } g.stroke();
    g.restore();
  },
  candle(g, x, y, s, c, flame = '#f4b942') {
    g.save(); g.translate(x, y); g.fillStyle = c; g.fillRect(-s * 0.12, -s * 0.08, s * 0.24, s * 0.5); g.fillRect(-s * 0.26, s * 0.42, s * 0.52, s * 0.06);
    g.fillStyle = flame; g.beginPath(); g.moveTo(0, -s * 0.48); g.bezierCurveTo(s * 0.16, -s * 0.28, s * 0.1, -s * 0.12, 0, -s * 0.12); g.bezierCurveTo(-s * 0.1, -s * 0.12, -s * 0.16, -s * 0.28, 0, -s * 0.48); g.fill();
    g.restore();
  },
  bowl(g, x, y, s, c) {
    g.save(); g.translate(x, y); g.fillStyle = c; g.strokeStyle = c; g.lineWidth = s * 0.055; g.lineCap = 'round';
    g.beginPath(); g.arc(0, s * 0.02, s * 0.4, 0, Math.PI); g.closePath(); g.fill(); g.fillRect(-s * 0.16, s * 0.4, s * 0.32, s * 0.06);
    g.beginPath(); g.moveTo(s * 0.1, -s * 0.02); g.lineTo(s * 0.42, -s * 0.44); g.moveTo(s * 0.2, -s * 0.02); g.lineTo(s * 0.5, -s * 0.4); g.stroke();
    for (const dx of [-0.22, -0.06]) { g.beginPath(); g.moveTo(s * dx, -s * 0.1); g.bezierCurveTo(s * (dx - 0.08), -s * 0.2, s * (dx + 0.08), -s * 0.28, s * dx, -s * 0.4); g.stroke(); }
    g.restore();
  },
  bike(g, x, y, s, c) {
    g.save(); g.translate(x, y); g.strokeStyle = c; g.lineWidth = s * 0.05; g.lineCap = 'round'; g.lineJoin = 'round';
    for (const k of [-1, 1]) { g.beginPath(); g.arc(k * s * 0.3, s * 0.14, s * 0.2, 0, TAU); g.stroke(); }
    g.beginPath(); g.moveTo(-s * 0.3, s * 0.14); g.lineTo(-s * 0.06, s * 0.14); g.lineTo(-s * 0.16, -s * 0.16); g.lineTo(s * 0.2, -s * 0.16); g.lineTo(-s * 0.06, s * 0.14); g.moveTo(-s * 0.3, s * 0.14); g.lineTo(-s * 0.16, -s * 0.16);
    g.moveTo(s * 0.3, s * 0.14); g.lineTo(s * 0.18, -s * 0.26); g.lineTo(s * 0.3, -s * 0.3); g.moveTo(-s * 0.24, -s * 0.2); g.lineTo(-s * 0.08, -s * 0.2); g.stroke();
    g.restore();
  },
  loaf(g, x, y, s, c, bg = 'rgba(0,0,0,.3)') {
    g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, s * 0.46, s * 0.28, 0, 0, TAU); g.fill();
    g.strokeStyle = bg; g.lineWidth = s * 0.04; g.lineCap = 'round'; for (const k of [-0.2, 0, 0.2]) { g.beginPath(); g.moveTo(s * k - s * 0.06, -s * 0.12); g.lineTo(s * k + s * 0.06, s * 0.08); g.stroke(); }
    g.restore();
  },
  sun(g, x, y, s, c) {
    g.save(); g.translate(x, y); g.fillStyle = c; g.strokeStyle = c; g.lineWidth = s * 0.05; g.lineCap = 'round';
    g.beginPath(); g.arc(0, s * 0.12, s * 0.24, Math.PI, 0); g.closePath(); g.fill();
    for (let i = 0; i <= 6; i++) { const a = Math.PI + (i / 6) * Math.PI; g.beginPath(); g.moveTo(Math.cos(a) * s * 0.32, s * 0.12 + Math.sin(a) * s * 0.32); g.lineTo(Math.cos(a) * s * 0.46, s * 0.12 + Math.sin(a) * s * 0.46); g.stroke(); }
    g.beginPath(); g.moveTo(-s * 0.48, s * 0.2); g.lineTo(s * 0.48, s * 0.2); g.stroke();
    g.restore();
  },
  star(g, x, y, s, c) { g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? s * 0.2 : s * 0.48; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.restore(); },
  hand(g, x, y, s, c) {                                           // a pointing hand, the kind sign-painters love
    g.save(); g.translate(x, y); g.fillStyle = c; rrect(g, -s * 0.5, -s * 0.16, s * 0.3, s * 0.34, s * 0.03, c); rrect(g, -s * 0.2, -s * 0.2, s * 0.34, s * 0.4, s * 0.1, c); rrect(g, 0, -s * 0.2, s * 0.5, s * 0.12, s * 0.06, c);
    for (let i = 0; i < 3; i++) rrect(g, 0, -s * 0.07 + i * s * 0.09, s * 0.22, s * 0.085, s * 0.04, c); g.restore();
  },
};
