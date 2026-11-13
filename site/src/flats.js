// The flats over the shops: what you can see of each room from the street. town.upWindows lists every
// upstairs window ({ x, y, z (world centre of the pane), w, h, side (+1 north, -1 south), lot }).
//
// Every pane is one quad in one mesh with one material. The room behind it is not built: the fragment
// shader walks the eye's ray into a box 8 ft wide and 6.5 deep ("interior mapping") and paints what it
// meets from one small sheet: the far wall, the side walls, a ceiling, a lamp that really hangs in the
// room (an ellipsoid on a cord), a layer of things 2.4 ft in (robots, plants, a cello), the curtains
// just behind the glass, anything stuck on the glass (steam, a notice), then the sky's reflection.
// Each window carries its own switching-on point, bedtime and waking hour as vertex attributes, so the
// street lights up one window at a time and nothing is updated per window per frame.
// Outside the glass (window boxes, pots, a balcony, a telescope) is built into the street's shared
// painted mesh and planting; the cloth that moves (curtains breathing out, bunting, a towel) is one mesh.
//
// buildFlats(K, town) runs while the street is laid out; flatsLife(ctx, K) once the scene exists.

import * as THREE from 'three';
import { T, F, fill, disc, rect, rrect, line, poly, rnd, TAU } from './draw.js';

// ---- the room, in feet, from the middle of the pane (x right as seen from the street, y up, z in) ----------
const RW = 8, RD = 6.5, CEIL_UP = 0.8, SILL_DOWN = 2.6, MIDZ = 2.4, MID = 5;
// ---- the sheet --------------------------------------------------------------------------------------------------
const AW = 2048, AH = 1024, BW = 192, BH = 168, MW = 128, CW = 80, CH = 128;
const MID_Y = 504, CUR_Y = 760, SIGN_Y = 888, CEIL_X = 1920, CEIL_H = 104;
const STEAM = [1280, CUR_Y, 80, 128], WAVER = [1360, CUR_Y, 128, 128], ARM = [1488, CUR_Y, 64, 64];
const SIGNS = { no: [0, SIGN_Y, 192, 136], let: [192, SIGN_Y, 192, 136], shh: [384, SIGN_Y, 192, 136] };

// =====================================================================================================================
// PAINTING (everything below, down to "the street's flats", only draws on a 2D context)
// =====================================================================================================================
// Nothing ordinary is painted brighter than about 228 in any channel: brighter than that glows in the
// dark (robots' eyes, a television, fairy lights, a fish tank), which is how the sheet marks its lights.
const BOT = ['#d9825b', '#7fa9a3', '#dcae4a', '#9a86b8', '#c9c2ae', '#6f8fb8', '#b85a50', '#8fae6f'];
const EYE = '#fff6d0', CREAM = '#dcd2b8', INK = '#26221e';
const pickOf = (r, a) => a[Math.floor(r() * a.length)];
const ell = (g, x, y, rx, ry, c, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fillStyle = c; g.fill(); };
const arm = (g, pts, col, lw = 3.4) => { g.lineCap = 'round'; g.lineJoin = 'round'; line(g, pts, col, lw); const p = pts[pts.length - 1]; disc(g, p[0], p[1], lw * 0.8, col); };
const leaf = (g, x, y, L, a, c) => { ell(g, x + Math.cos(a) * L * 0.5, y + Math.sin(a) * L * 0.5, L * 0.5, L * 0.22, c, a); };
function foliage(g, x, y, r, n, R, cols = ['#2f4a2c', '#3f6238', '#557a40', '#27402a']) {
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2.6, L = R * (0.6 + r() * 0.6); g.lineWidth = 1; g.strokeStyle = '#27402a'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L * 0.6, y + Math.sin(a) * L * 0.6); g.stroke(); leaf(g, x + Math.cos(a) * L * 0.45, y + Math.sin(a) * L * 0.45, L * 0.75, a, pickOf(r, cols)); }
}
function vine(g, x, y, len, r, c = '#3f6238') {
  let px = x, py = y; g.strokeStyle = '#27402a'; g.lineWidth = 1;
  for (let k = 0; k < len; k += 6) { const nx = x + Math.sin(k * 0.13 + x) * 3, ny = y + k; g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke(); ell(g, nx + (r() - 0.5) * 7, ny, 3.6, 2.3, r() < 0.5 ? c : '#557a40', r() * 3); px = nx; py = ny; }
}
const potAt = (g, x, y, w, h, c = '#a8603c') => poly(g, [[x - w / 2, y - h], [x + w / 2, y - h], [x + w * 0.36, y], [x - w * 0.36, y]], c);
function folds(g, x, y, w, h, col, n = 4, a = 1) {
  g.save(); g.globalAlpha = a; rect(g, x, y, w, h, col); g.globalAlpha = 1;
  for (let i = 0; i < n; i++) { const fx = x + i * w / n, gr = g.createLinearGradient(fx, 0, fx + w / n, 0); gr.addColorStop(0, `rgba(0,0,0,${0.3 * a})`); gr.addColorStop(0.5, `rgba(255,255,255,${0.1 * a})`); gr.addColorStop(1, `rgba(0,0,0,${0.3 * a})`); g.fillStyle = gr; g.fillRect(fx, y, w / n, h); }
  g.restore();
}

// A small floating robot, seen a little from below: an egg, a visor with two lit eyes, an antenna.
function bot(g, x, y, R, col, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0);
  const sy = o.sy ?? 1.16, body = () => { g.beginPath(); g.ellipse(0, 0, R, R * sy, 0, 0, TAU); };
  g.fillStyle = col; body(); g.fill();
  const gr = g.createLinearGradient(0, -R * sy, 0, R * sy); gr.addColorStop(0.35, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,10,10,.42)'); g.fillStyle = gr; body(); g.fill();
  if (o.belly) ell(g, 0, R * 0.48, R * 0.55, R * 0.4, o.belly);
  if (!o.back) {
    rrect(g, -R * 0.7, -R * 0.56, R * 1.4, R * 0.6, R * 0.28, '#1b1d24');
    const lx = (o.look ?? 0) * R * 0.14, ly = (o.lookY ?? 0) * R * 0.09;
    for (const k of [-1, 1]) { if (o.asleep) line(g, [[k * R * 0.32 - R * 0.13, -R * 0.24], [k * R * 0.32 + R * 0.13, -R * 0.24]], '#8a8f9a', 1.5); else disc(g, k * R * 0.32 + lx, -R * 0.26 + ly, R * 0.12, EYE); }
  }
  line(g, [[0, -R * sy + 1], [0, -R * sy - R * 0.4]], '#3a3a40', 1.5); disc(g, 0, -R * sy - R * 0.46, R * 0.14, o.tip ?? '#e0723c');
  if (o.hat === 'toque') { for (const k of [-0.5, 0, 0.5]) disc(g, k * R, -R * sy - R * 0.38, R * 0.42, '#dcd6c8'); rect(g, -R * 0.62, -R * sy - R * 0.2, R * 1.24, R * 0.36, '#cfc8b8'); }
  if (o.hat === 'beret') { ell(g, R * 0.1, -R * sy + R * 0.02, R * 0.8, R * 0.26, '#34405a', -0.2); }
  if (o.hat === 'phones') { g.beginPath(); g.arc(0, -R * 0.1, R * 1.12, Math.PI * 1.12, Math.PI * 1.88); g.strokeStyle = '#26221e'; g.lineWidth = 3; g.stroke(); for (const k of [-1, 1]) rrect(g, k * R * 1.02 - 3.5, -R * 0.42, 7, R * 0.7, 3, '#c8402f'); }
  g.restore();
}

// ---- the far wall of a room: 192 x 168 px is 8 ft x 7 ft, the ceiling at the top ------------------------------------
function wallBase(g, w, h, col, railing = true) {
  fill(g, w, h, col);
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,.06)'); gr.addColorStop(1, 'rgba(0,0,0,.22)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  rect(g, 0, 0, w, 5, 'rgba(255,255,255,.2)'); rect(g, 0, 5, w, 1.5, 'rgba(0,0,0,.2)');
  if (railing) { rect(g, 0, 23, w, 2.5, 'rgba(255,255,255,.2)'); rect(g, 0, 25.5, w, 1, 'rgba(0,0,0,.18)'); }
}
function art(g, x, y, w, h, r) {
  const k = Math.floor(r() * 5);
  if (k === 0) { rect(g, x, y, w, h, '#9db4c0'); rect(g, x, y + h * 0.6, w, h * 0.4, '#6f8a5e'); disc(g, x + w * 0.7, y + h * 0.36, Math.min(w, h) * 0.14, '#e0b46a'); }
  else if (k === 1) { rect(g, x, y, w, h, pickOf(r, ['#c8683a', '#34405a', '#7f9077'])); disc(g, x + w / 2, y + h / 2, Math.min(w, h) * 0.3, CREAM); }
  else if (k === 2) { rect(g, x, y, w, h, '#cfc3a8'); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); bot(g, x + w / 2, y + h * 0.62, Math.min(w, h) * 0.3, pickOf(r, BOT), { tip: '#b85a50' }); g.restore(); }
  else if (k === 3) { rect(g, x, y, w, h, '#d8ccb4'); for (let i = 0; i < 4; i++) rect(g, x + 2, y + 2 + i * (h - 4) / 4, w - 4, (h - 4) / 8, pickOf(r, ['#b8452e', '#34405a', '#c9a03c', '#3f6a5a'])); }
  else { rect(g, x, y, w, h, '#3a4a5a'); for (let i = 0; i < 9; i++) disc(g, x + 2 + r() * (w - 4), y + 2 + r() * (h * 0.6), 0.8, CREAM); rect(g, x, y + h * 0.75, w, h * 0.25, '#26303a'); }
}
const PB = {
  calm(g, w, h, r, o) {
    if (o.mirror) { disc(g, w * 0.5, 66, 36, '#a8b4b0'); disc(g, w * 0.5, 66, 36, null, '#a8894a', 4); line(g, [[w * 0.5 - 22, 56], [w * 0.5 - 6, 40]], 'rgba(255,255,255,.3)', 3); }
    else { rrect(g, w * 0.5 - 42, 30, 84, 100, 2, '#3a3028'); rect(g, w * 0.5 - 39, 33, 78, 94, '#d8ccb4'); g.save(); g.beginPath(); g.rect(w * 0.5 - 39, 33, 78, 66); g.clip(); disc(g, w * 0.5, 99, 27, '#c8683a'); for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; line(g, [[w * 0.5 + Math.cos(a) * 32, 99 + Math.sin(a) * 32], [w * 0.5 + Math.cos(a) * 42, 99 + Math.sin(a) * 42]], '#c8683a', 2); } g.restore(); rect(g, w * 0.5 - 39, 99, 78, 28, '#7f9077'); }
    rect(g, 12, 110, 34, 3, '#5a4636'); for (const x of [18, 28, 38]) { rect(g, x, 110 - 8 - (x % 5), 4, 8 + (x % 5), CREAM); disc(g, x + 2, 110 - 11 - (x % 5), 1.6, '#ffd070'); }
    rect(g, 150, 34, 24, 78, '#d2c8b0'); rect(g, 148, 32, 28, 3, '#5a4636'); rect(g, 148, 110, 28, 3, '#5a4636'); for (let i = 0; i < 4; i++) line(g, [[156, 46 + i * 15], [168, 50 + i * 15]], INK, 2);
  },
  plain(g, w, h, r, o) {
    if (o.k === 1) { for (let x = 0; x < w; x += 12) rect(g, x, 27, 5, h, 'rgba(255,255,255,.1)'); }
    if (o.k === 3) { for (let y = 34; y < h; y += 14) for (let x = (y % 28 ? 4 : 11); x < w; x += 14) disc(g, x, y, 1.8, 'rgba(255,255,255,.2)'); }
    const dx = o.k === 2 ? 118 : 26;                                 // a door, and hooks with hats
    rrect(g, dx, 34, 46, 140, 2, 'rgba(0,0,0,.25)'); rect(g, dx + 3, 37, 40, 134, o.door ?? '#6a5a48'); for (const [px, py] of [[5, 6], [24, 6], [5, 62], [24, 62]]) rrect(g, dx + 3 + px, 37 + py, 13, 50, 1, 'rgba(0,0,0,.16)'); disc(g, dx + 38, 110, 2, '#c9a45c');
    const hx = o.k === 2 ? 22 : 96; rect(g, hx, 52, 72, 3, '#4a3a2c');
    for (let i = 0; i < 4; i++) { const x = hx + 8 + i * 18; rect(g, x, 55, 2, 5, '#4a3a2c'); if (i === 1) { ell(g, x + 1, 64, 11, 3, '#8c3b2e'); ell(g, x + 1, 61, 6, 5, '#8c3b2e'); } if (i === 2) rect(g, x - 4, 60, 10, 34, '#3f5470'); if (i === 3) { poly(g, [[x + 1, 58], [x - 7, 74], [x + 9, 74]], '#c9a03c'); } }
  },
  gallery(g, w, h, r) {
    const fr = [[10, 34, 44, 56], [62, 34, 30, 24], [62, 66, 30, 36], [100, 32, 50, 40], [100, 80, 22, 28], [128, 80, 22, 28], [160, 36, 22, 62], [16, 100, 34, 30], [62, 112, 30, 22], [158, 110, 26, 30]];
    for (const [x, y, fw, fh] of fr) { if (r() < 0.14) continue; const jx = x + (r() - 0.5) * 4, jy = y + (r() - 0.5) * 4; rect(g, jx - 1, jy + 1, fw + 2, fh + 2, 'rgba(0,0,0,.25)'); rect(g, jx, jy, fw, fh, pickOf(r, ['#2a2622', '#a8894a', '#5a3a26', '#d2c8b0'])); rect(g, jx + 2.5, jy + 2.5, fw - 5, fh - 5, '#d8ccb4'); art(g, jx + 5, jy + 5, fw - 10, fh - 10, r); }
  },
  roaster(g, w, h) {                                                // a small drum roaster, its flue through the ceiling
    rect(g, 96, 0, 12, 70, '#5a5e60'); rect(g, 92, 30, 20, 3, '#3a3e40');
    rrect(g, 70, 66, 70, 62, 8, '#9a5a34'); ell(g, 105, 96, 22, 22, '#b06a3c'); disc(g, 105, 96, 22, null, '#6a3c22', 3); disc(g, 105, 96, 6, '#3a2418'); poly(g, [[76, 66], [100, 66], [94, 48], [70, 44]], '#7a7e80');
    rect(g, 60, 128, 90, 40, '#3a3e40');
    for (const [x, y] of [[8, 126], [30, 130], [18, 104]]) { rrect(g, x, y, 34, 30, 7, '#b09a6c'); T(g, '№' + ((x % 7) + 2), x + 17, y + 16, 11, '#5a4630', { f: F.bebas }); }
    rect(g, 150, 62, 40, 3, '#5a4636'); for (let i = 0; i < 4; i++) rrect(g, 152 + i * 9.5, 46, 8, 16, 1, ['#2f4a40', '#c9a45c', '#8a3a2a', '#2f4a40'][i]);
    rect(g, 150, 100, 40, 3, '#5a4636'); for (let i = 0; i < 4; i++) rrect(g, 152 + i * 9.5, 84, 8, 16, 1, ['#c9a45c', '#2f4a40', '#d2c8b0', '#8a3a2a'][i]);
  },
  kitchen(g, w, h, r, o) {
    if (o.k === 3) {                                                // the pantry: jars to the ceiling
      for (let y = 30; y < h; y += 28) { rect(g, 4, y + 24, w - 8, 3, '#5a4636'); for (let x = 8; x < w - 14;) { const jw = 8 + r() * 6, jh = 12 + r() * 10; rrect(g, x, y + 24 - jh, jw, jh, 2, pickOf(r, ['#b8452e', '#c9a03c', '#8a9a5a', '#d2c8b0', '#7a4a2a', '#b88a8a', '#5a6a3a'])); rect(g, x + 1, y + 24 - jh - 2, jw - 2, 3, '#8a8478'); x += jw + 2 + r() * 3; } }
      return;
    }
    for (let y = 100; y < h; y += 12) for (let x = (y % 24 ? 0 : 9); x < w; x += 18) rrect(g, x, y, 17, 11, 1, 'rgba(255,255,255,.14)');      // tiles behind the counter
    rect(g, 6, 52, w - 12, 3, '#5a4636');
    for (let x = 12; x < w - 20;) { const k = r(); if (k < 0.4) { for (let i = 0; i < 4; i++) ell(g, x + 8, 50 - i * 2.6, 9, 2, i % 2 ? '#cfc8b8' : '#d8d2c2'); x += 22; } else if (k < 0.75) { rrect(g, x, 38, 9, 14, 2, pickOf(r, ['#b8452e', '#3f6a5a', '#c9a03c', '#d2c8b0'])); x += 12; } else { rrect(g, x, 34, 12, 18, 3, '#9aa4a8'); rect(g, x + 2, 31, 8, 3, '#7a8488'); x += 16; } }
    line(g, [[10, 70], [w - 10, 70]], '#3a3a3c', 2);                // a rail of pans, or a pot rack
    for (let i = 0; i < (o.k === 2 ? 6 : 4); i++) { const x = 24 + i * (o.k === 2 ? 28 : 44) + r() * 6, R = 8 + r() * 5, c = pickOf(r, ['#b06a3c', '#3a3a3c', '#9a5a34', '#55585a']); line(g, [[x, 70], [x, 78]], c, 2.5); disc(g, x, 78 + R, R, c); disc(g, x, 78 + R, R * 0.7, 'rgba(0,0,0,.2)'); }
  },
  tv(g, w, h) {
    rect(g, 30, 44, 60, 3, '#3a3028'); for (let i = 0; i < 4; i++) { rect(g, 36 + i * 13, 44 - 12 - (i % 2) * 5, 6, 12 + (i % 2) * 5, '#b89a4a'); disc(g, 39 + i * 13, 44 - 15 - (i % 2) * 5, 4, '#b89a4a'); }
    rrect(g, 44, 70, 104, 64, 3, '#141416');
    const gr = g.createLinearGradient(0, 74, 0, 130); gr.addColorStop(0, '#dff0ff'); gr.addColorStop(0.55, '#f6fbff'); gr.addColorStop(0.56, '#bfe0ff'); gr.addColorStop(1, '#eaf6ff'); g.fillStyle = gr; g.fillRect(48, 74, 96, 56);
    disc(g, 120, 90, 7, '#fffbe8'); rect(g, 86, 134, 20, 8, '#141416'); rect(g, 20, 142, 152, 26, '#3a3028');
  },
  books(g, w, h, r, o) {
    const cols = ['#8a3a2a', '#35506a', '#c9a45c', '#4a6a4a', '#d8ccb0', '#5a3a50', '#b8562e', '#2f4a40', '#a8894a', '#7a2f2a', '#3a4a6a'];
    rect(g, 0, 6, w, h, o.wood ?? '#3a2618');
    for (let y = 9; y < h; y += 27) {
      rect(g, 3, y, w - 6, 24, '#1c120c');
      for (let x = 5; x < w - 10;) {
        const k = r();
        if (k < 0.06) { x += 5 + r() * 8; continue; }
        if (k < 0.12) { for (let i = 0; i < 3; i++) rect(g, x, y + 24 - (i + 1) * 4.2, 15 - i, 3.6, pickOf(r, cols)); x += 17; continue; }
        if (k < 0.15) { potAt(g, x + 6, y + 24, 9, 7); foliage(g, x + 6, y + 17, r, 5, 9); x += 14; continue; }
        const bw = 3 + r() * 5, bh = 14 + r() * 9, c = pickOf(r, cols);
        rect(g, x, y + 24 - bh, bw, bh, c); if (r() < 0.35) rect(g, x, y + 24 - bh + 3, bw, 1.5, 'rgba(240,220,160,.6)'); rect(g, x + bw - 0.8, y + 24 - bh, 0.8, bh, 'rgba(0,0,0,.25)');
        x += bw + 0.5;
      }
    }
  },
  jungle(g, w, h, r, o) {
    for (const y of [58, 104, 150]) { rect(g, 8, y, w - 16, 3, '#6a5236'); for (let x = 20 + r() * 10; x < w - 14; x += 24 + r() * 16) { const pw = 10 + r() * 6; potAt(g, x, y, pw, 9 + r() * 3, pickOf(r, ['#a8603c', '#c9bfa8', '#5a6a70', '#b8734a'])); foliage(g, x, y - 9, r, 7 + Math.floor(r() * 5), 16 + r() * 14); } }
    for (let i = 0; i < (o.k === 2 ? 7 : 4); i++) vine(g, 10 + r() * (w - 20), 6, 30 + r() * 60, r);
    if (o.k === 3) { for (let i = 0; i < 5; i++) { const x = 30 + i * 34, a = -Math.PI / 2 + (i - 2) * 0.35; line(g, [[96, 168], [x, 70 + Math.abs(i - 2) * 14]], '#27402a', 2); ell(g, x, 62 + Math.abs(i - 2) * 14, 17, 12, '#2f4a2c', a); line(g, [[x - Math.cos(a) * 12, 62 + Math.abs(i - 2) * 14 - Math.sin(a) * 12], [x + Math.cos(a) * 12, 62 + Math.abs(i - 2) * 14 + Math.sin(a) * 12]], '#557a40', 1.2); } }
  },
  cabinet(g, w, h, r, o) {
    if (o.k === 2) {                                                // an ammonite, a long case clock, a shelf of jars
      rrect(g, 20, 40, 92, 84, 2, '#2a2622'); rect(g, 24, 44, 84, 76, '#cfc3a8'); g.strokeStyle = '#5a4636'; g.lineWidth = 2.4; g.beginPath(); for (let a = 0; a < 15; a += 0.2) { const R = 2 + a * 2.1, x = 66 + Math.cos(a) * R, y = 82 + Math.sin(a) * R; a ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      rrect(g, 136, 30, 34, 138, 3, '#4a3020'); disc(g, 153, 50, 12, '#d2c8b0'); line(g, [[153, 50], [153, 42]], INK, 1.5); line(g, [[153, 50], [159, 53]], INK, 1.5); rect(g, 147, 70, 12, 90, '#2a1c14'); disc(g, 153, 120, 5, '#b89a4a');
      return;
    }
    for (let j = 0; j < 2; j++) for (let i = 0; i < 5; i++) {       // pinned butterflies, each in its own frame
      const x = 12 + i * 36, y = 34 + j * 44; rect(g, x, y, 30, 36, '#2a2622'); rect(g, x + 2.5, y + 2.5, 25, 31, '#d8ccb4');
      const c = pickOf(r, ['#c8683a', '#35506a', '#c9a03c', '#5a7a5a', '#8a4a6a', '#3a3a3a']), cx = x + 15, cy = y + 18;
      for (const k of [-1, 1]) { poly(g, [[cx, cy - 2], [cx + k * 10, cy - 9], [cx + k * 9, cy]], c); poly(g, [[cx, cy], [cx + k * 7, cy + 8], [cx + k * 2, cy + 7]], c); } line(g, [[cx, cy - 5], [cx, cy + 6]], INK, 1.4);
    }
    rect(g, 8, 150, w - 16, 3, '#5a4636'); disc(g, 40, 136, 11, '#5a8a9a'); ell(g, 37, 133, 5, 3.5, '#7f9a60', 0.5); line(g, [[40, 124], [40, 150]], '#a8894a', 1.6); for (const x of [84, 104, 150]) rrect(g, x, 132, 12, 18, 2, 'rgba(200,220,210,.5)');
    ell(g, 128, 144, 9, 6, '#d2c0a8');
  },
  records(g, w, h, r, o) {
    const cols = ['#c8402f', '#26364f', '#e0a02a', '#3c8fa0', '#d8ccb0', '#5a3a50', '#2f4a40', '#b8562e', '#1c1c1e'];
    if (o.k === 2) {                                                // two speakers and the sleeves on show
      for (const x of [10, 150]) { rrect(g, x, 62, 32, 70, 2, '#2a2420'); disc(g, x + 16, 82, 8, '#141416'); disc(g, x + 16, 110, 12, '#141416'); disc(g, x + 16, 110, 4, '#3a3a3c'); }
      for (let i = 0; i < 4; i++) { const x = 50 + i * 24; rect(g, x, 34, 21, 21, pickOf(r, cols)); disc(g, x + 10.5, 44.5, 6, pickOf(r, cols)); }
      rect(g, 46, 100, 100, 4, '#5a4636'); rrect(g, 70, 86, 50, 14, 2, '#3a3028'); disc(g, 88, 92, 6, '#141416'); for (let x = 48; x < 144; x += 2.2) rect(g, x, 108, 1.6, 26, pickOf(r, cols)); rect(g, 46, 134, 100, 4, '#5a4636');
      return;
    }
    for (let j = 0; j < 2; j++) for (let i = 0; i < 7; i++) { const x = 8 + i * 26, y = 32 + j * 27, c = pickOf(r, cols); rect(g, x, y, 22, 22, c); const k = r(); if (k < 0.4) disc(g, x + 11, y + 11, 6.5, pickOf(r, cols)); else if (k < 0.7) rect(g, x + 3, y + 12, 16, 5, pickOf(r, cols)); else poly(g, [[x + 3, y + 19], [x + 11, y + 4], [x + 19, y + 19]], pickOf(r, cols)); }
    for (const y of [92, 126]) { rect(g, 4, y + 30, w - 8, 3.5, '#4a3626'); for (let x = 6; x < w - 8; x += 2.3) if (r() > 0.04) rect(g, x, y + 2 + r() * 3, 1.7, 28 - r() * 3, pickOf(r, cols)); for (const x of [66, 128]) rect(g, x, y, 3, 30, '#4a3626'); }
  },
  posters(g, w, h, r) {
    const P = [[10, 34, 44, 62, '#c8402f'], [60, 30, 40, 56, '#26364f'], [106, 36, 38, 52, '#e0a02a'], [62, 92, 46, 60, '#3c8fa0']];
    for (const [x, y, pw, ph, c] of P) { rect(g, x, y, pw, ph, c); disc(g, x + pw / 2, y + ph * 0.4, pw * 0.26, CREAM); rect(g, x + 4, y + ph * 0.72, pw - 8, 4, CREAM); rect(g, x + 8, y + ph * 0.84, pw - 16, 2.5, CREAM); }
    line(g, [[166, 30], [166, 96]], '#5a3a22', 4); ell(g, 166, 112, 13, 15, '#b8734a'); ell(g, 166, 132, 16, 17, '#b8734a'); disc(g, 166, 124, 5, '#2a1c14'); rect(g, 162, 26, 8, 10, '#3a2a1c');
    rrect(g, 14, 112, 36, 44, 2, '#2a2420'); disc(g, 32, 126, 7, '#141416'); disc(g, 32, 144, 9, '#141416');
  },
  bakery(g, w, h, r) {
    for (const y of [58, 96, 134]) { rect(g, 44, y, w - 52, 3, '#6a5236'); for (let x = 52; x < w - 22; x += 22 + r() * 10) { const k = r(); if (k < 0.5) { ell(g, x + 8, y - 6, 10, 6, '#b8843e'); for (const dx of [-4, 0, 4]) line(g, [[x + 8 + dx - 1.5, y - 9], [x + 8 + dx + 1.5, y - 5]], '#d8b06a', 1.2); } else if (k < 0.8) { poly(g, [[x, y - 12], [x + 20, y - 12], [x + 17, y], [x + 3, y]], '#a8895a'); ell(g, x + 10, y - 12, 10, 3.5, '#c9a45c'); } else { rrect(g, x, y - 16, 12, 16, 2, '#d2c8b0'); T(g, 'F', x + 6, y - 8, 9, '#8a3a2a', { f: F.bebas }); } } }
    line(g, [[20, 34], [20, 120]], '#a8895a', 3); rrect(g, 9, 104, 22, 34, 4, '#b8996a');                     // the peel
    for (const y of [40, 52]) { rrect(g, 46, y - 3, 54, 6, 3, '#b8996a'); rect(g, 40, y - 1, 66, 2, '#8a6a42'); }
  },
  apoth(g, w, h, r) {
    for (let j = 0; j < 3; j++) { const y = 30 + j * 26; rect(g, 6, y + 22, w - 12, 3, '#3a2a1c'); for (let x = 10; x < w - 14;) { const bw = 6 + r() * 5, bh = 11 + r() * 9, c = pickOf(r, ['#8a5a22', '#3f6a4a', '#34507a', '#7a2f2a', '#c9bfa8', '#8a5a22']); rrect(g, x, y + 22 - bh, bw, bh, 2, c); rect(g, x + bw / 2 - 1.5, y + 22 - bh - 3, 3, 3.5, '#5a4636'); rect(g, x + 1, y + 22 - bh * 0.6, bw - 2, bh * 0.3, 'rgba(232,223,204,.75)'); x += bw + 2 + r() * 2.5; } }
    rect(g, 6, 110, w - 12, 58, '#4a3424'); for (let j = 0; j < 3; j++) for (let i = 0; i < 9; i++) { rrect(g, 9 + i * 19.6, 113 + j * 18, 17.6, 16, 1, '#5e4430'); disc(g, 17.8 + i * 19.6, 121 + j * 18, 1.7, '#c9a45c'); }
  },
  noodle(g, w, h, r) {
    rect(g, 20, 60, 70, 3, '#2a1c14'); for (let i = 0; i < 5; i++) ell(g, 34, 58 - i * 3.5, 11, 3, i % 2 ? '#d2c8b0' : '#34507a'); ell(g, 70, 50, 8, 9, '#dcd6c8'); disc(g, 70, 39, 6, '#dcd6c8'); poly(g, [[65, 35], [66, 30], [69, 34]], '#dcd6c8'); poly(g, [[75, 35], [74, 30], [71, 34]], '#dcd6c8'); line(g, [[77, 44], [81, 36]], '#dcd6c8', 3); disc(g, 70, 48, 2.2, '#c9a03c');
    for (let i = 0; i < 6; i++) { const x = 106 + i * 13; rect(g, x, 34, 10, 58 + (i % 3) * 8, '#d8ccb0'); for (let y = 39; y < 84; y += 7) line(g, [[x + 5, y], [x + 5 + (i % 2 ? 1.5 : -1.5), y + 4]], INK, 1.3); }
    rrect(g, 24, 86, 52, 62, 2, '#2a1c14'); rect(g, 27, 89, 46, 56, '#d2c8b0'); T(g, '麺', 50, 116, 34, '#b8402f');
  },
  bikes(g, w, h) {
    for (const x of [44, 104]) { disc(g, x, 80, 25, null, '#1c1c1c', 3); disc(g, x, 80, 22, null, '#8a8c90', 1); for (let a = 0; a < TAU; a += TAU / 10) line(g, [[x, 80], [x + Math.cos(a) * 22, 80 + Math.sin(a) * 22]], 'rgba(160,165,170,.6)', 0.7); }
    const c = '#d4a02a'; line(g, [[44, 80], [70, 82], [58, 50], [44, 80]], c, 3); line(g, [[70, 82], [96, 54], [58, 50]], c, 3); line(g, [[96, 54], [104, 80]], c, 3); line(g, [[94, 44], [98, 58]], c, 2.5); line(g, [[88, 44], [102, 42]], '#1c1c1c', 3); rrect(g, 50, 44, 16, 5, 2, '#3a2a1c');
    for (const x of [44, 104]) line(g, [[x, 52], [x, 44]], '#3a3a3c', 3);
    rrect(g, 140, 34, 44, 70, 2, '#a8895a'); for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) { const x = 148 + i * 14, y = 42 + j * 16; if ((i + j) % 3 === 0) line(g, [[x, y], [x, y + 12]], '#8a8c90', 2.5); else if ((i + j) % 3 === 1) { line(g, [[x, y], [x, y + 11]], '#b8452e', 2); rect(g, x - 2.5, y, 5, 3, '#8a8c90'); } else disc(g, x, y + 5, 4, null, '#3a3a3c', 1.6); }
    disc(g, 150, 136, 20, null, '#1c1c1c', 2.5); disc(g, 28, 138, 16, null, '#8a8c90', 1.6);
  },
};
// name: [painter, wall colour, seed, options]. The wall colour is also what the side walls are painted.
const BACKS = {
  calm1: ['calm', '#b9a48e', 3, {}], calm2: ['calm', '#8a9a8c', 4, { mirror: 1 }],
  plainA: ['plain', '#9aa48e', 5, { k: 1 }], plainB: ['plain', '#3f5560', 6, { k: 2, door: '#2f3f48' }], plainC: ['plain', '#b88a6a', 7, { k: 3 }],
  gal1: ['gallery', '#7a3f34', 11], gal2: ['gallery', '#33454a', 12], gal3: ['gallery', '#a8935c', 13], gal4: ['gallery', '#5a4a5e', 14],
  roaster: ['roaster', '#5e5046', 1], kit1: ['kitchen', '#a8a08a', 21, { k: 1 }], kit2: ['kitchen', '#6a8078', 22, { k: 2 }], kit3: ['kitchen', '#8a6a4a', 23, { k: 3 }],
  tv: ['tv', '#3a4254', 1],
  books1: ['books', '#6a4a38', 31], books2: ['books', '#3d4a44', 32, { wood: '#2a2a22' }], books3: ['books', '#7a3a30', 33, { wood: '#4a2c1c' }], books4: ['books', '#4a4458', 34],
  jung1: ['jungle', '#5a7062', 41, { k: 1 }], jung2: ['jungle', '#a89a7a', 42, { k: 2 }], jung3: ['jungle', '#3f5a4a', 43, { k: 3 }],
  cab1: ['cabinet', '#4a5a54', 51, { k: 1 }], cab2: ['cabinet', '#7a5a44', 52, { k: 2 }],
  rec1: ['records', '#2e3440', 61, { k: 1 }], rec2: ['records', '#5a3a34', 62, { k: 2 }], posters: ['posters', '#3a3a48', 63],
  bakery: ['bakery', '#b89a84', 71], apoth: ['apoth', '#56604e', 72], noodle: ['noodle', '#7a2a22', 73], bikes: ['bikes', '#8a9a90', 74],
};
const BACK_NAMES = Object.keys(BACKS);

// ---- things in the room, 2.4 ft in: 128 px is 5 ft, the ceiling at the top ------------------------------------------
const PM = {
  reading(g, r, c) { bot(g, 64, 66, 18, c, { lookY: 1, belly: 'rgba(255,255,255,.12)' }); poly(g, [[64, 96], [40, 90], [40, 106], [64, 112]], CREAM); poly(g, [[64, 96], [88, 90], [88, 106], [64, 112]], '#cfc4a8'); line(g, [[64, 96], [64, 112]], '#7a2f2a', 2); arm(g, [[48, 74], [42, 98]], c); arm(g, [[80, 74], [86, 98]], c); },
  readingUp(g, r, c) { g.save(); g.translate(64, 60); g.rotate(Math.PI); g.translate(-64, -64); PM.reading(g, r, c); g.restore(); },
  watering(g, r, c) { for (const x of [92, 106, 118]) foliage(g, x, 128, r, 6, 26); bot(g, 46, 60, 18, c, { rot: 0.18, look: 1, lookY: 1 }); rrect(g, 72, 62, 18, 15, 3, '#8a9498'); line(g, [[90, 68], [106, 60]], '#8a9498', 3); g.beginPath(); g.arc(80, 60, 8, Math.PI, 0); g.strokeStyle = '#8a9498'; g.lineWidth = 2; g.stroke(); arm(g, [[60, 66], [74, 68]], c); for (const [x, y] of [[108, 68], [111, 78], [106, 86]]) ell(g, x, y, 1.6, 2.6, '#9ac8dc'); },
  cello(g, r, c) { line(g, [[84, 22], [84, 74]], '#3a2418', 4); disc(g, 84, 20, 4, '#3a2418'); ell(g, 84, 82, 13, 12, '#9a5a30'); ell(g, 84, 106, 17, 16, '#9a5a30'); rect(g, 82, 60, 4, 54, '#2a1c14'); for (const k of [-1, 1]) line(g, [[84 + k * 7, 92], [84 + k * 8, 100]], '#2a1c14', 1.4); bot(g, 44, 70, 18, c, { look: 1, rot: -0.1 }); line(g, [[52, 94], [112, 80]], CREAM, 1.6); arm(g, [[58, 78], [70, 90]], c); arm(g, [[54, 62], [80, 50]], c); },
  dumplings(g, r, c) { rect(g, 0, 104, 128, 6, '#8a6a42'); rect(g, 0, 110, 128, 18, '#5a4630'); for (let j = 0; j < 2; j++) for (let i = 0; i < 7; i++) { const x = 26 + i * 12 + j * 5, y = 103 - j * 6; g.beginPath(); g.ellipse(x, y, 5, 4, 0, Math.PI, 0); g.fillStyle = j ? '#d2c8ae' : CREAM; g.fill(); for (let k = -1; k <= 1; k++) line(g, [[x + k * 2.4, y - 3.6], [x + k * 2.4, y - 2]], '#b8a888', 0.8); } for (let i = 0; i < 3; i++) { rect(g, 4, 86 + i * 6, 20, 5, '#b8996a'); rect(g, 4, 90.4 + i * 6, 20, 0.8, '#7a5a36'); } rrect(g, 110, 86, 14, 18, 2, '#cfc8b8'); bot(g, 64, 58, 18, c, { lookY: 1, hat: 'toque' }); arm(g, [[48, 68], [50, 94]], c); arm(g, [[80, 68], [78, 94]], c); },
  telescope(g, r, c) { for (const x of [42, 58, 74]) line(g, [[58, 60], [x, 128]], '#3a3028', 2.5); line(g, [[78, 74], [28, 28]], '#8a6a34', 8); line(g, [[38, 37], [24, 24]], '#a8894a', 11); line(g, [[78, 74], [84, 80]], '#3a3028', 5); bot(g, 100, 86, 17, c, { look: -1, lookY: -1, rot: -0.3 }); arm(g, [[88, 82], [76, 70]], c); },
  yoga(g, r, c) { for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(64, 72, 34 + i * 8, Math.PI * 1.2, Math.PI * 1.8); g.strokeStyle = `rgba(220,210,184,${0.5 - i * 0.14})`; g.lineWidth = 1.5; g.stroke(); } bot(g, 64, 76, 18, c, { asleep: 1, belly: 'rgba(255,255,255,.12)' }); arm(g, [[47, 70], [40, 46], [62, 24]], c); arm(g, [[81, 70], [88, 46], [66, 24]], c); rrect(g, 30, 112, 68, 6, 3, '#7f6a9a'); },
  headphones(g, r, c) { bot(g, 62, 70, 19, c, { rot: 0.14, hat: 'phones', asleep: 1 }); arm(g, [[44, 76], [30, 58]], c); arm(g, [[82, 78], [100, 92]], c); T(g, '♪', 102, 40, 22, CREAM); T(g, '♫', 24, 30, 18, CREAM); T(g, '♪', 110, 66, 14, CREAM); },
  knitting(g, r, c) { bot(g, 54, 58, 18, c, { lookY: 1 }); for (let i = 0; i < 9; i++) rect(g, 62 + Math.sin(i * 0.8) * 3, 84 + i * 5, 16, 5.4, i % 2 ? '#b8452e' : CREAM); line(g, [[58, 92], [84, 76]], '#8a8c90', 1.6); line(g, [[84, 92], [58, 76]], '#8a8c90', 1.6); arm(g, [[40, 66], [58, 82]], c); arm(g, [[70, 68], [82, 82]], c); disc(g, 106, 118, 9, '#b8452e'); line(g, [[100, 112], [112, 122]], '#8a2f20', 1); line(g, [[98, 118], [112, 114]], '#8a2f20', 1); },
  dusting(g, r, c) { bot(g, 50, 76, 18, c, { look: 1, lookY: -1 }); arm(g, [[64, 68], [80, 46]], c); line(g, [[80, 46], [90, 30]], '#5b4630', 2.5); ell(g, 95, 21, 8, 12, '#dcae4a', 0.5); for (const [x, y] of [[106, 12], [112, 26], [100, 6]]) disc(g, x, y, 1.2, CREAM); },
  baker(g, r, c) { bot(g, 64, 78, 18, c, { hat: 'toque', belly: 'rgba(255,255,255,.2)' }); rrect(g, 34, 30, 60, 9, 4, '#b8996a'); rect(g, 24, 33, 80, 3, '#8a6a42'); arm(g, [[48, 70], [36, 38]], c); arm(g, [[80, 70], [92, 38]], c); for (const [x, y] of [[20, 60], [106, 52], [98, 20]]) disc(g, x, y, 1.3, CREAM); },
  cooking(g, r, c) { bot(g, 48, 78, 18, c, { look: 1, lookY: -1, hat: 'toque' }); arm(g, [[64, 80], [78, 84]], c); line(g, [[78, 84], [92, 84]], '#26221e', 3); ell(g, 104, 84, 14, 4.5, '#26221e'); ell(g, 100, 46, 11, 5, '#d0a25a', -0.4); for (const k of [0, 1]) { g.beginPath(); g.arc(100, 66, 12 + k * 6, -Math.PI * 0.42, -Math.PI * 0.1); g.strokeStyle = 'rgba(220,210,184,.5)'; g.lineWidth = 1.2; g.stroke(); } },
  painting(g, r, c) { line(g, [[70, 128], [84, 30]], '#6a5236', 3); line(g, [[110, 128], [92, 30]], '#6a5236', 3); rect(g, 64, 38, 48, 54, '#d8ccb4'); rect(g, 67, 41, 42, 30, '#d08a5a'); disc(g, 88, 70, 10, '#e0c05a'); rect(g, 67, 71, 42, 18, '#4a5a7a'); bot(g, 32, 80, 17, c, { look: 1, hat: 'beret' }); arm(g, [[46, 78], [62, 64]], c); line(g, [[62, 64], [70, 58]], '#3a2a1c', 1.6); },
  hangplants(g, r) { for (const [x, L] of [[24, 34], [66, 52], [104, 26]]) { line(g, [[x, 0], [x - 7, L]], '#b8a888', 1); line(g, [[x, 0], [x + 7, L]], '#b8a888', 1); line(g, [[x, 0], [x, L]], '#b8a888', 1); potAt(g, x, L + 10, 16, 10, pickOf(r, ['#a8603c', '#c9bfa8'])); foliage(g, x, L + 1, r, 7, 16); for (const dx of [-6, 0, 6]) vine(g, x + dx, L + 6, 18 + r() * 34, r); } },
  armchair(g, r) { line(g, [[98, 128], [98, 58]], '#3a3028', 2.5); poly(g, [[84, 58], [112, 58], [106, 34], [90, 34]], '#f6e6b8'); rrect(g, 22, 92, 56, 40, 12, '#3f5a4a'); rrect(g, 14, 106, 14, 26, 6, '#35504a'); rrect(g, 72, 106, 14, 26, 6, '#35504a'); disc(g, 42, 104, 1.6, '#2a3f34'); disc(g, 58, 104, 1.6, '#2a3f34'); },
  cat(g) { rect(g, 60, 76, 8, 52, '#a8895a'); rrect(g, 34, 70, 60, 7, 3, '#8a6a42'); ell(g, 62, 56, 15, 14, '#2a2622'); disc(g, 72, 40, 8.5, '#2a2622'); poly(g, [[65, 36], [66, 27], [71, 33]], '#2a2622'); poly(g, [[79, 36], [79, 27], [74, 33]], '#2a2622'); g.beginPath(); g.moveTo(49, 64); g.quadraticCurveTo(36, 76, 42, 98); g.strokeStyle = '#2a2622'; g.lineWidth = 4; g.lineCap = 'round'; g.stroke(); disc(g, 69, 39, 1.5, '#f4ffb0'); disc(g, 75.5, 39, 1.5, '#f4ffb0'); },
  bikeHang(g) { for (const x of [34, 94]) { line(g, [[x, 0], [x, 30]], '#3a3a3c', 2); disc(g, x, 56, 25, null, '#1c1c1c', 3.5); disc(g, x, 56, 21.5, null, '#8a8c90', 1); for (let a = 0; a < TAU; a += TAU / 9) line(g, [[x, 56], [x + Math.cos(a) * 22, 56 + Math.sin(a) * 22]], 'rgba(160,165,170,.7)', 0.7); } const c = '#3f6a5a'; line(g, [[34, 56], [60, 58], [50, 84], [34, 56]], c, 3.4); line(g, [[60, 58], [86, 82], [50, 84]], c, 3.4); line(g, [[86, 82], [94, 56]], c, 3.4); line(g, [[82, 94], [92, 92]], '#1c1c1c', 3.4); rrect(g, 42, 86, 16, 5, 2, '#3a2a1c'); },
  herbs(g, r) { for (const x of [16, 112]) line(g, [[x, 0], [x, 16]], '#3a3a3c', 1.4); rect(g, 8, 15, 112, 3, '#5a4636'); for (let i = 0; i < 8; i++) { const x = 16 + i * 13.6, c = pickOf(r, ['#7f9077', '#8a7aa8', '#b8a868', '#5a7a4a', '#a87a5a']), L = 24 + r() * 16; line(g, [[x, 18], [x, 24]], '#b8a888', 1.2); for (let k = 0; k < 7; k++) { const a = Math.PI / 2 + (k - 3) * 0.13; line(g, [[x, 24], [x + Math.cos(a) * L, 24 + Math.sin(a) * L]], c, 1.6); disc(g, x + Math.cos(a) * L, 24 + Math.sin(a) * L, 1.8, c); } } },
  tea(g, r, c) { ell(g, 64, 104, 26, 6, '#6a5236'); rect(g, 61, 104, 6, 24, '#5a4630'); ell(g, 64, 94, 9, 7.5, '#34507a'); line(g, [[72, 92], [80, 86]], '#34507a', 3); disc(g, 64, 86, 2, '#34507a'); for (const x of [46, 82]) rrect(g, x - 4, 95, 8, 6, 2, CREAM); g.beginPath(); g.moveTo(80, 82); g.bezierCurveTo(76, 74, 86, 70, 80, 60); g.strokeStyle = 'rgba(220,214,200,.6)'; g.lineWidth = 1.6; g.stroke(); bot(g, 24, 74, 17, c, { look: 1 }); bot(g, 104, 76, 16, BOT[(BOT.indexOf(c) + 3) % BOT.length], { look: -1, tip: '#7fa9a3' }); },
  mobile(g, r) { line(g, [[64, 0], [64, 14]], '#b8a888', 1); line(g, [[20, 20], [108, 14]], '#5a4636', 1.6); const P = [[20, 20, 30, 8, '#c8683a'], [42, 18, 52, 5, '#9ac8dc'], [64, 17, 22, 12, '#e0b04a'], [88, 15, 46, 7, '#7f9a60'], [108, 14, 28, 6, '#b88ab8']]; for (const [x, y, L, R, c] of P) { line(g, [[x, y], [x, y + L]], '#b8a888', 0.8); disc(g, x, y + L + R, R, c); } g.beginPath(); g.ellipse(88, 68, 12, 3, -0.3, 0, TAU); g.strokeStyle = CREAM; g.lineWidth = 1.2; g.stroke(); },
  monstera(g, r) { for (const [x, y, s, a] of [[30, 66, 20, -0.5], [64, 44, 24, 0], [100, 62, 21, 0.5], [46, 96, 17, -0.25], [84, 98, 18, 0.3]]) { line(g, [[64, 128], [x, y]], '#27402a', 2.2); g.save(); g.translate(x, y); g.rotate(a); ell(g, 0, 0, s * 0.82, s, '#2f4a2c'); line(g, [[0, s], [0, -s * 0.8]], '#557a40', 1.4); g.globalCompositeOperation = 'destination-out'; for (const k of [-1, 1]) for (const yy of [-0.4, 0, 0.4]) poly(g, [[k * s * 0.9, yy * s - 2], [k * s * 0.9, yy * s + 2], [k * s * 0.3, yy * s + 2.5]], '#000'); g.restore(); } },
  laundry(g, r) { for (const x of [22, 106]) { line(g, [[x, 0], [x, 24]], '#b8a888', 1); } for (const y of [24, 30]) rect(g, 12, y, 104, 2.4, '#8a6a42'); rect(g, 18, 26, 26, 40, '#d2c8b0'); for (let y = 30; y < 64; y += 8) rect(g, 18, y, 26, 2.4, '#b8452e'); for (const [x, c] of [[52, '#e0723c'], [64, '#7fa9a3'], [76, '#dcae4a']]) { poly(g, [[x, 50], [x + 5, 30], [x + 10, 50]], c); disc(g, x + 5, 30, 2, CREAM); } rect(g, 92, 32, 20, 26, '#3f5470'); rect(g, 92, 32, 20, 5, '#34466a'); },
  sleeping(g, r, c) { bot(g, 58, 84, 18, c, { rot: 1.32, asleep: 1, tip: '#ff7a50' }); rrect(g, 52, 78, 46, 26, 9, '#56607a'); for (let x = 60; x < 96; x += 9) rect(g, x, 78, 3, 26, 'rgba(220,214,200,.25)'); T(g, 'z', 34, 52, 13, CREAM, { f: F.caveat, w: 700 }); T(g, 'z', 44, 38, 17, CREAM, { f: F.caveat, w: 700 }); T(g, 'Z', 58, 22, 22, CREAM, { f: F.caveat, w: 700 }); },
  noodles(g, r) { for (const [y, x0, x1] of [[16, 8, 120], [50, 20, 108]]) { rect(g, x0, y, x1 - x0, 3, '#8a6a42'); for (const x of [x0 + 4, x1 - 4]) line(g, [[x, 0], [x, y]], '#3a3a3c', 1.2); for (let x = x0 + 6; x < x1 - 5; x += 2.2) { const L = 22 + Math.sin(x * 0.9) * 4 + r() * 5; line(g, [[x, y + 2], [x + Math.sin(x) * 0.8, y + L]], r() < 0.5 ? '#d8c88e' : '#cdb97a', 1.2); } } },
  ladder(g, r, c) { line(g, [[26, 128], [50, 6]], '#8a6a42', 3.4); line(g, [[50, 128], [74, 6]], '#8a6a42', 3.4); for (let i = 0; i < 7; i++) { const t = 0.08 + i * 0.14; line(g, [[26 + 24 * t, 128 - 122 * t], [50 + 24 * t, 128 - 122 * t]], '#8a6a42', 2.6); } bot(g, 90, 48, 17, c, { look: -1, lookY: -1, rot: -0.15 }); arm(g, [[76, 42], [60, 22]], c); rect(g, 52, 10, 9, 14, '#8a3a2a'); rect(g, 60, 11, 2, 12, CREAM); arm(g, [[100, 58], [106, 74]], c); rect(g, 100, 74, 14, 10, '#35506a'); },
  hats(g, r, c) { bot(g, 64, 96, 18, c, { belly: 'rgba(255,255,255,.12)' }); ell(g, 64, 74, 20, 4, '#26221e'); rect(g, 52, 56, 24, 18, '#26221e'); rect(g, 52, 68, 24, 3, '#b8452e'); ell(g, 64, 55, 15, 3, '#7a5a3a'); g.beginPath(); g.arc(64, 54, 10, Math.PI, 0); g.fillStyle = '#7a5a3a'; g.fill(); ell(g, 64, 43, 11, 2.6, '#c9a03c'); rect(g, 56, 33, 16, 10, '#c9a03c'); poly(g, [[56, 33], [64, 8], [72, 33]], '#7fa9a3'); disc(g, 64, 8, 3, '#e0723c'); for (const y of [18, 26]) line(g, [[60, y + 3], [68, y]], CREAM, 1.4); },
  disco(g, r, c) { line(g, [[64, 0], [64, 18]], '#3a3a3c', 1.2); disc(g, 64, 32, 14, '#8a9098'); for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const x = 64 + i * 5.4, y = 32 + j * 5.4; if (Math.hypot(x - 64, y - 32) < 12) rect(g, x - 2, y - 2, 4, 4, (i + j) % 2 ? '#c8ccd2' : (i * j) % 3 ? '#a8b0b8' : '#fbfdff'); } for (const [x, y, a] of [[24, 30, 0.6], [104, 22, -0.5], [20, 70, 0.2], [112, 64, -0.2], [64, 62, 0]]) { g.save(); g.translate(x, y); g.rotate(a); rect(g, -3, -1, 6, 2, 'rgba(240,240,255,.55)'); g.restore(); } bot(g, 36, 96, 16, c, { rot: -0.22, asleep: 1 }); arm(g, [[24, 88], [14, 68]], c); arm(g, [[50, 92], [58, 78]], c); const c2 = BOT[(BOT.indexOf(c) + 5) % BOT.length]; bot(g, 96, 100, 15, c2, { rot: 0.25, tip: '#dcae4a' }); arm(g, [[108, 92], [118, 74]], c2); arm(g, [[84, 96], [76, 84]], c2); },
  fishtank(g, r, c) { rect(g, 26, 100, 60, 28, '#4a3626'); rrect(g, 22, 60, 68, 42, 2, '#2a3a40'); const gr = g.createLinearGradient(0, 63, 0, 99); gr.addColorStop(0, '#d8fbff'); gr.addColorStop(1, '#7fd0e0'); g.fillStyle = gr; g.fillRect(25, 63, 62, 36); for (const x of [34, 44, 78]) vine(g, x, 76, 22, r, '#2f6a4a'); ell(g, 60, 76, 5, 2.6, '#e0723c'); poly(g, [[65, 76], [69, 73], [69, 79]], '#e0723c'); ell(g, 48, 88, 4, 2.2, '#dcae4a'); poly(g, [[44, 88], [41, 86], [41, 90]], '#dcae4a'); rect(g, 22, 56, 68, 5, '#26221e'); bot(g, 108, 70, 13, c, { look: -1, lookY: 1 }); },
  sofa(g, r, c) { bot(g, 46, 92, 16, c, { back: 1 }); bot(g, 84, 94, 15, BOT[(BOT.indexOf(c) + 2) % BOT.length], { back: 1, tip: '#7fa9a3' }); rrect(g, 14, 102, 100, 34, 10, '#6a4a52'); rrect(g, 8, 108, 16, 28, 7, '#5a3e46'); rrect(g, 104, 108, 16, 28, 7, '#5a3e46'); poly(g, [[60, 104], [72, 104], [70, 92], [62, 92]], '#b8452e'); for (const [x, y] of [[63, 90], [67, 88], [70, 90], [65, 86]]) disc(g, x, y, 2.2, CREAM); },
};
const MID_NAMES = Object.keys(PM);
const HAS_BOT = new Set(['reading', 'readingUp', 'watering', 'cello', 'dumplings', 'telescope', 'yoga', 'headphones', 'knitting', 'dusting', 'baker', 'cooking', 'painting', 'tea', 'ladder', 'hats', 'disco', 'fishtank', 'sofa']);

// ---- curtains, blinds and shutters, just behind the glass: 80 x 128 px is 4.4 x 7.2 ft about the pane -------------
function drape(g, col, tied) {
  g.save(); g.beginPath();
  if (tied) { g.moveTo(0, 5); g.lineTo(38, 5); g.quadraticCurveTo(34, 60, 9, 82); g.quadraticCurveTo(18, 104, 20, 128); g.lineTo(0, 128); }
  else { g.moveTo(0, 5); g.lineTo(27, 5); g.quadraticCurveTo(25, 70, 15, 128); g.lineTo(0, 128); }
  g.closePath(); g.clip(); folds(g, 0, 5, 40, 123, col, 4); g.restore();
  if (tied) rect(g, 3, 80, 12, 3.5, '#c9a45c');
}
const rod = g => { rect(g, 0, 3, 80, 2.4, '#3a3028'); };
const PC = {
  drapes1(g) { drape(g, '#a8503a'); g.save(); g.translate(80, 0); g.scale(-1, 1); drape(g, '#a8503a'); g.restore(); rod(g); },
  drapes2(g) { drape(g, '#7f9077'); g.save(); g.translate(80, 0); g.scale(-1, 1); drape(g, '#7f9077'); g.restore(); rod(g); },
  drapes3(g) { drape(g, '#c9a03c'); g.save(); g.translate(80, 0); g.scale(-1, 1); drape(g, '#c9a03c'); g.restore(); rod(g); },
  tied(g) { drape(g, '#b87a6a', true); rod(g); },
  sheer(g) { folds(g, 3, 5, 74, 123, '#dcd8cc', 9, 0.4); rod(g); },
  cafe(g) { rect(g, 4, 63, 72, 2, '#b08d4a'); rect(g, 5, 66, 70, 62, '#d8d0bc'); for (let x = 5; x < 75; x += 7) rect(g, x, 66, 3.5, 62, 'rgba(184,69,46,.5)'); for (let y = 66; y < 128; y += 7) rect(g, 5, y, 70, 3.5, 'rgba(184,69,46,.5)'); for (let x = 5; x < 75; x += 14) { const gr = g.createLinearGradient(x, 0, x + 14, 0); gr.addColorStop(0, 'rgba(0,0,0,.2)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.2)'); g.fillStyle = gr; g.fillRect(x, 66, 14, 62); } },
  roller(g) { rect(g, 4, 3, 72, 60, '#d6cdb4'); rect(g, 4, 60, 72, 3, '#b8ae94'); line(g, [[40, 63], [40, 72]], '#8a8478', 1); disc(g, 40, 74, 2.2, null, '#8a8478', 1.2); },
  venetian(g) { for (let y = 5; y < 96; y += 5) { rect(g, 4, y, 72, 2.7, '#cfc8b8'); rect(g, 4, y + 2.7, 72, 0.7, 'rgba(0,0,0,.35)'); } for (const x of [18, 62]) rect(g, x, 3, 0.8, 94, '#8a8478'); rect(g, 4, 96, 72, 3, '#b8b0a0'); },
  linen(g) { folds(g, 3, 4, 74, 124, '#d6c096', 8); rod(g); },
  plants(g, r) { drape(g, '#8a9a70', true); rod(g); for (const [x, w] of [[30, 11], [47, 13], [64, 10]]) { potAt(g, x, 119, w, 9, pickOf(r, ['#a8603c', '#c9bfa8', '#b8734a'])); foliage(g, x, 110, r, 7, 15 + r() * 8); } },
  fairy(g, r) { g.strokeStyle = '#3a3028'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(8, 96); for (let i = 0; i <= 26; i++) { const t = i / 26, x = t < 0.3 ? 9 + Math.sin(t * 40) * 1.5 : t > 0.7 ? 71 + Math.sin(t * 40) * 1.5 : 9 + (t - 0.3) / 0.4 * 62, y = t < 0.3 ? 96 - t / 0.3 * 86 : t > 0.7 ? 10 + (t - 0.7) / 0.3 * 86 : 10 + Math.sin((t - 0.3) / 0.4 * Math.PI) * 9; g.lineTo(x, y); } g.stroke(); for (let i = 0; i <= 26; i++) { const t = i / 26, x = t < 0.3 ? 9 + Math.sin(t * 40) * 1.5 : t > 0.7 ? 71 + Math.sin(t * 40) * 1.5 : 9 + (t - 0.3) / 0.4 * 62, y = t < 0.3 ? 96 - t / 0.3 * 86 : t > 0.7 ? 10 + (t - 0.7) / 0.3 * 86 : 10 + Math.sin((t - 0.3) / 0.4 * Math.PI) * 9; disc(g, x, y + 1.5, 1.7, '#fff3c0'); } line(g, [[40, 19], [40, 34]], '#3a3028', 0.8); g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, R = i % 2 ? 5.5 : 13; g.lineTo(40 + Math.cos(a) * R, 46 + Math.sin(a) * R); } g.closePath(); g.fillStyle = '#ffe9a8'; g.fill(); },
  lace(g) { rect(g, 3, 3, 74, 14, 'rgba(220,214,200,.9)'); for (let x = 3; x < 77; x += 9.25) { g.beginPath(); g.arc(x + 4.6, 17, 4.6, 0, Math.PI); g.fillStyle = 'rgba(220,214,200,.9)'; g.fill(); disc(g, x + 4.6, 17, 1.4, 'rgba(0,0,0,.3)'); } for (let x = 6; x < 76; x += 4) disc(g, x, 9, 0.9, 'rgba(0,0,0,.25)');
    ell(g, 54, 108, 9, 11, '#3a3430'); disc(g, 54, 94, 6.5, '#3a3430'); poly(g, [[48.5, 91], [49.5, 84], [53, 89]], '#3a3430'); poly(g, [[59.5, 91], [58.5, 84], [55, 89]], '#3a3430'); g.beginPath(); g.moveTo(46, 114); g.quadraticCurveTo(34, 118, 36, 108); g.strokeStyle = '#3a3430'; g.lineWidth = 3; g.lineCap = 'round'; g.stroke(); disc(g, 51.5, 93.5, 1.2, '#f4ffb0'); disc(g, 56.5, 93.5, 1.2, '#f4ffb0'); },
  shutters(g) { for (const x of [3, 61]) { rrect(g, x, 4, 16, 122, 1, '#6f8068'); for (let y = 8; y < 122; y += 4.5) { rect(g, x + 2, y, 12, 2.6, '#8a9a80'); rect(g, x + 2, y + 2.6, 12, 0.8, 'rgba(0,0,0,.3)'); } rect(g, x + 7.4, 4, 1.2, 122, '#5a6a54'); } },
  beads(g, r) { rod(g); for (let x = 6; x < 76; x += 4) { const L = 12 + 26 * Math.pow(Math.abs(x - 40) / 36, 1.6) + r() * 3, c = pickOf(r, ['#c8683a', '#dcae4a', '#7fa9a3', '#b88ab8']); for (let y = 7; y < 5 + L; y += 3.4) disc(g, x, y, 1.3, c); } line(g, [[40, 5], [40, 50]], '#8a8478', 0.6); poly(g, [[40, 50], [44, 57], [40, 66], [36, 57]], '#f2fbff'); },
  shadow(g) { rect(g, 4, 3, 72, 121, '#d9c8a0'); rect(g, 4, 121, 72, 3, '#b8a880'); g.save(); g.beginPath(); g.rect(4, 3, 72, 118); g.clip(); g.globalAlpha = 0.5; const c = '#5a3c20'; g.fillStyle = c; g.beginPath(); g.ellipse(36, 78, 17, 20, 0, 0, TAU); g.fill(); line(g, [[36, 58], [36, 48]], c, 2); disc(g, 36, 46, 2.6, c); g.lineCap = 'round'; line(g, [[22, 70], [12, 52], [20, 38]], c, 4); line(g, [[50, 72], [62, 60]], c, 4); line(g, [[62, 60], [70, 22]], c, 2); ell(g, 67, 36, 5, 9, c, 0.1); g.restore(); },
  lanterns(g) { g.beginPath(); g.moveTo(4, 8); g.quadraticCurveTo(40, 24, 76, 8); g.strokeStyle = '#3a3028'; g.lineWidth = 0.9; g.stroke(); for (const [x, y] of [[16, 13], [32, 16.5], [48, 16.5], [64, 13]]) { line(g, [[x, y], [x, y + 4]], '#3a3028', 0.8); ell(g, x, y + 12, 6, 8, '#ff5a38'); rect(g, x - 3, y + 3.4, 6, 1.8, '#3a2018'); rect(g, x - 3, y + 19, 6, 1.8, '#3a2018'); line(g, [[x, y + 21], [x, y + 26]], '#c9a03c', 1.2); } },
};
const CUR_NAMES = Object.keys(PC);

// ---- ceilings: 128 x 104 px is 8 x 6.5 ft, the window wall at the top ---------------------------------------------------
const CEILS = [
  (g, w, h) => { fill(g, w, h, '#d2cbbc'); for (const [R, c] of [[17, 'rgba(0,0,0,.1)'], [15, '#d8d2c4'], [10, 'rgba(0,0,0,.08)'], [8, '#d8d2c4'], [3.4, 'rgba(0,0,0,.16)']]) disc(g, w / 2, h * 0.45, R, c); g.strokeStyle = 'rgba(0,0,0,.1)'; g.lineWidth = 3; g.strokeRect(2.5, 2.5, w - 5, h - 5); },
  (g, w, h) => { fill(g, w, h, '#cfc7b6'); for (const x of [14, 46, 82, 114]) { rect(g, x - 4, 0, 8, h, '#5a4636'); rect(g, x + 4, 0, 2.2, h, 'rgba(0,0,0,.2)'); } },
  (g, w, h) => { fill(g, w, h, '#c4c6c0'); for (let y = 0; y < h; y += 13) for (let x = 0; x < w; x += 12.8) { rect(g, x + 1, y + 1, 10.8, 11, 'rgba(255,255,255,.12)'); rect(g, x + 3, y + 3, 6.8, 7, 'rgba(0,0,0,.1)'); disc(g, x + 6.4, y + 6.5, 1.7, 'rgba(255,255,255,.16)'); } },
  (g, w, h) => {                                                    // glow-in-the-dark stars: their alpha is the mark
    fill(g, w, h, '#4a5474'); const r = rnd(77), S = [];
    for (let i = 0; i < 46; i++) S.push([4 + r() * (w - 8), 4 + r() * (h - 8), 1 + r() * 1.8]);
    const star = (x, y, R) => { g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, q = k % 2 ? R * 0.45 : R; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); };
    const all = () => { for (const [x, y, R] of S) star(x, y, R * 1.5); g.beginPath(); g.arc(26, 30, 9, 0, TAU); g.arc(30, 27, 8, 0, TAU, true); g.fill('evenodd'); };
    g.fillStyle = '#c8dca0'; all(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,.6)'; all(); g.globalCompositeOperation = 'source-over';
  },
];

// ---- things on the glass ---------------------------------------------------------------------------------------------------
const PS = {
  no(g, w, h) {
    rrect(g, 2, 2, w - 4, h - 4, 3, '#dcd4bc'); for (const [x, y] of [[14, 6], [w - 14, 6]]) { g.save(); g.translate(x, y); g.rotate(x < 50 ? -0.5 : 0.5); rect(g, -9, -4, 18, 8, 'rgba(200,190,150,.8)'); g.restore(); }
    T(g, 'NO,', w / 2, 30, 44, INK, { f: F.caveat, w: 700 }); T(g, 'the sun has not', w / 2, 66, 31, INK, { f: F.caveat, w: 700, max: w - 16 }); T(g, 'set yet.', w / 2, 96, 31, INK, { f: F.caveat, w: 700 }); T(g, '— mgmt', w - 12, 122, 22, '#8a3a2a', { f: F.caveat, w: 700, a: 'right' });
  },
  let(g, w, h) {
    rrect(g, 2, 2, w - 4, h - 4, 3, '#d8ccb0'); rrect(g, 7, 7, w - 14, h - 14, 2, null, '#b8402f', 2.5);
    T(g, 'ROOM TO LET', w / 2, 36, 40, '#b8402f', { f: F.bebas, ls: 2, max: w - 24 }); T(g, 'quiet tenant sought', w / 2, 74, 26, INK, { f: F.caveat, w: 700, max: w - 22 }); T(g, '(the shop below is not)', w / 2, 104, 22, INK, { f: F.caveat, w: 600, max: w - 22 });
  },
  shh(g, w, h) {
    rrect(g, 2, 2, w - 4, h - 4, 3, '#d6d8c0'); T(g, 'shh.', w / 2, 38, 52, '#2f4a2c', { f: F.caveat, w: 700 }); T(g, 'the ferns are', w / 2, 80, 30, INK, { f: F.caveat, w: 700, max: w - 16 }); T(g, 'sleeping', w / 2, 108, 30, INK, { f: F.caveat, w: 700 });
    for (const k of [-1, 1]) for (let i = 0; i < 5; i++) leaf(g, w / 2 + k * 74, 124 - i * 5, 12, k > 0 ? -0.5 - i * 0.2 : Math.PI + 0.5 + i * 0.2, '#557a40');
  },
};
function paintSteam(g, w, h) {
  const r = rnd(9), gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(216,220,218,.1)'); gr.addColorStop(0.5, 'rgba(216,220,218,.4)'); gr.addColorStop(1, 'rgba(216,220,218,.64)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) disc(g, r() * w, h * (0.25 + r() * 0.75), 5 + r() * 9, 'rgba(222,226,224,.1)');
  g.globalCompositeOperation = 'destination-out'; g.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const x = 5 + r() * (w - 10), y = h * (0.3 + r() * 0.5); g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 1.5, y + 14, x - 1.5, y + 30, x + (r() - 0.5) * 3, h); g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = 1 + r() * 1.6; g.stroke(); disc(g, x, y, 1.6, 'rgba(0,0,0,.7)'); }
  g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineWidth = 3; g.beginPath(); g.arc(46, 74, 13, 0, TAU); g.stroke(); disc(g, 41, 70, 1.8, 'rgba(0,0,0,.85)'); disc(g, 51, 70, 1.8, 'rgba(0,0,0,.85)'); g.beginPath(); g.arc(46, 75, 7, 0.25, Math.PI - 0.25); g.stroke();
  g.globalCompositeOperation = 'source-over';
}

// The whole sheet. Colours are stored as they are painted (alpha premultiplied on upload, undone in the shader).
function paintAtlas() {
  const c = document.createElement('canvas'); c.width = AW; c.height = AH; const g = c.getContext('2d');
  const cell = (x, y, w, h, draw) => { g.save(); g.translate(x, y); g.beginPath(); g.rect(0, 0, w, h); g.clip(); try { draw(); } catch (e) { console.warn('flats: a painting failed', e); } g.restore(); };
  BACK_NAMES.forEach((n, i) => { const [kind, wall, seed, o = {}] = BACKS[n]; cell((i % 10) * BW, Math.floor(i / 10) * BH, BW, BH, () => { wallBase(g, BW, BH, wall, kind !== 'books'); PB[kind](g, BW, BH, rnd(seed * 131 + 7), o); }); });
  MID_NAMES.forEach((n, i) => cell((i % 16) * MW, MID_Y + Math.floor(i / 16) * MW, MW, MW, () => PM[n](g, rnd(i * 53 + 11), BOT[(i * 3 + 1) % BOT.length])));
  CUR_NAMES.forEach((n, i) => cell(i * CW, CUR_Y, CW, CH, () => PC[n](g, rnd(i * 17 + 3))));
  CEILS.forEach((f, i) => cell(CEIL_X, i * CEIL_H, 128, CEIL_H, () => f(g, 128, CEIL_H)));
  for (const k of Object.keys(SIGNS)) { const [x, y, w, h] = SIGNS[k]; cell(x, y, w, h, () => PS[k](g, w, h)); }
  cell(...STEAM, () => paintSteam(g, STEAM[2], STEAM[3]));
  cell(...WAVER, () => { bot(g, 64, 86, 31, '#cfcabc', { lookY: 1, belly: 'rgba(255,255,255,.14)' }); g.lineCap = 'round'; line(g, [[36, 96], [26, 122], [44, 126]], '#cfcabc', 7); });
  cell(...ARM, () => { g.lineCap = 'round'; line(g, [[32, 58], [32, 24]], '#cfcabc', 7); disc(g, 32, 16, 8.5, '#cfcabc'); disc(g, 23, 20, 3.6, '#cfcabc'); });
  return c;
}

// =====================================================================================================================
// THE STREET'S FLATS: who lives over which shop
// =====================================================================================================================
// One line a window, in the order town.js makes them (first floor east to west, then the floor above):
// [far wall, what is in the room, curtains, lamp, extras].
//   lamp: globe, lantern, shade, bulb, red (pendants), read (a reading lamp), tv, grow, none
//   extras: box [plants], pot, feeder, balcony, towel, open ('curtain' | 'towel' | 'scope' | 1), sign, steam,
//           late (up past midnight), always (never goes to bed), early (bakers' hours), bed (hour), dark (nobody home),
//           ceil (0 rose, 1 beams, 2 tin, 3 stars), bunt (bunting from this window to the next)
const HOMES = {
  yoga: [
    ['calm1', 'yoga', 'sheer', 'lantern', { box: ['lavender', 'catmint'] }],
    ['plainA', null, null, 'globe', { sign: 'no' }],
    ['calm2', 'hangplants', 'fairy', 'lantern', { open: 'curtain', cloth: '#d8cfc0' }],
    ['gal1', 'tea', 'drapes2', 'shade', { pot: 1 }]],
  coffee: [
    ['roaster', null, null, 'bulb', { ceil: 1 }],
    ['kit1', 'cooking', 'cafe', 'shade', { box: ['herbs', 'marigold'] }],
    ['gal2', 'cat', 'drapes3', 'globe', { open: 'towel' }],
    ['tv', 'sofa', 'venetian', 'tv', { late: 1 }]],
  books: [
    ['books1', 'ladder', null, 'globe', { ceil: 1, bunt: 1 }],
    ['books2', 'reading', 'tied', 'read', { always: 1, ceil: 1 }],
    ['books3', 'armchair', 'drapes1', 'shade', { box: ['fern', 'hosta'] }],
    ['books4', 'readingUp', 'sheer', 'lantern', {}],
    ['books1', 'hats', 'lace', 'globe', { pot: 1 }],
    ['plainB', 'mobile', 'roller', 'globe', { bed: 20.7, ceil: 3 }]],
  grocery: [
    ['kit2', 'herbs', 'cafe', 'shade', { box: ['tomato', 'herbs', 'marigold'], ceil: 2 }],
    ['kit3', 'tea', 'shutters', 'globe', {}],
    ['gal3', 'knitting', 'drapes1', 'shade', { pot: 1, bunt: 1 }],
    ['plainC', 'laundry', null, 'bulb', { open: 'towel' }]],
  plants: [
    ['jung1', 'hangplants', null, 'grow', {}],
    ['jung2', 'watering', 'plants', 'globe', { sign: 'shh' }],
    ['jung3', 'monstera', null, 'lantern', { box: ['fern', 'wisteria', 'hosta'] }],
    ['jung1', 'monstera', 'sheer', 'shade', { open: 'curtain', cloth: '#c9d2b8' }],
    ['jung2', 'fishtank', null, 'globe', { balcony: ['fern', 'tomato'], late: 1 }],
    ['jung3', 'hangplants', 'beads', 'lantern', {}]],
  museum: [
    ['cab1', 'dusting', 'drapes1', 'globe', { ceil: 2 }],
    ['cab2', 'mobile', 'shutters', 'shade', { feeder: 1 }],
    ['gal4', 'painting', null, 'lantern', { box: ['cosmos', 'coneflower'] }],
    ['plainB', null, 'linen', 'none', { dark: 1 }]],
  records: [
    ['rec1', 'headphones', null, 'shade', { open: 'curtain', cloth: '#d9b8a0' }],
    ['posters', 'cello', 'drapes3', 'globe', { bunt: 1 }],
    ['rec2', 'disco', 'venetian', 'bulb', { late: 1 }],
    ['tv', 'sofa', null, 'tv', { late: 1 }],
    ['rec1', 'hats', 'sheer', 'lantern', { balcony: ['herbs', 'lavender'] }],
    ['plainA', null, 'roller', 'none', { dark: 1, sign: 'let' }]],
  bakery: [
    ['bakery', 'baker', 'cafe', 'shade', { early: 1 }],
    ['gal1', 'knitting', 'lace', 'globe', { early: 1, box: ['strawberry', 'marigold'] }],
    ['kit2', 'cooking', 'drapes2', 'bulb', { early: 1, ceil: 2 }]],
  apothecary: [
    ['apoth', 'herbs', null, 'globe', { ceil: 1 }],
    ['gal2', null, 'shadow', 'shade', {}],
    ['apoth', 'armchair', 'tied', 'read', { late: 1, feeder: 1, ceil: 1 }]],
  noodles: [
    ['noodle', 'dumplings', 'lanterns', 'red', { steam: 1 }],
    ['kit3', 'noodles', null, 'bulb', { steam: 1 }],
    ['tv', 'sofa', 'drapes1', 'tv', { late: 1 }],
    ['noodle', 'tea', 'sheer', 'red', { pot: 1 }]],
  bikes: [
    ['bikes', 'bikeHang', null, 'shade', {}],
    ['gal3', 'reading', 'drapes2', 'globe', { box: ['grass', 'wildflowers'] }],
    ['plainB', 'mobile', null, 'globe', { open: 'scope', late: 1, ceil: 3 }]],
};
const SPARE = [['gal4', 'tea', 'drapes2', 'globe', {}], ['plainC', 'armchair', 'sheer', 'shade', {}], ['gal1', 'cat', null, 'lantern', {}], ['plainA', 'knitting', 'cafe', 'globe', {}]];
// lamp: [centre x (from the room's middle), y (down from the ceiling), z, how tightly it lights, radii x y z, cord, colour, how much it fills the room]
const LAMPS = {
  globe: [0, 1.5, 2.9, 1, 0.42, 0.42, 0.42, 1, [1.0, 0.76, 0.46], 0.42],
  lantern: [0, 1.6, 2.9, 0.8, 0.8, 0.74, 0.8, 1, [1.0, 0.8, 0.56], 0.5],
  shade: [0, 1.55, 2.9, 1, 0.72, 0.36, 0.72, 1, [1.0, 0.7, 0.38], 0.36],
  bulb: [0, 1.3, 2.9, 0.9, 0.17, 0.22, 0.17, 1, [1.0, 0.84, 0.6], 0.5],
  red: [0, 1.6, 2.9, 1, 0.6, 0.72, 0.6, 1, [1.0, 0.34, 0.2], 0.4],
  read: [2.3, 3.7, 3.6, 3.2, 0.42, 0.36, 0.42, 0, [1.0, 0.7, 0.38], 0.07],
  tv: [-0.5, 5.6, 5.6, 0.5, 0, 0, 0, 0, [0.5, 0.68, 1.0], 0.2],
  grow: [0, 1.0, 1.5, 0.7, 1.9, 0.07, 0.12, 0, [1.0, 0.3, 0.85], 0.42],
  none: [0, 1.5, 2.9, 1, 0.42, 0.42, 0.42, 1, [1.0, 0.76, 0.46], 0.42],
};
const lin = c => (c /= 255, c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const hexLin = hex => { const n = parseInt(hex.slice(1), 16); return [lin((n >> 16) & 255), lin((n >> 8) & 255), lin(n & 255)]; };

// Who lives behind each window. Worked out once; buildFlats and flatsLife both read it.
let PLAN = null;
function plan(town) {
  if (PLAN && PLAN.town === town) return PLAN;
  const r = rnd(2026), seen = {}, list = [];
  town.upWindows.forEach((w, id) => {
    const k = seen[w.lot] = (seen[w.lot] ?? -1) + 1, lot = town.lots?.[w.lot], bays = lot?.bays || 1;
    const [back, mid, cur, lamp, o] = HOMES[w.lot]?.[k] ?? SPARE[id % SPARE.length];
    const late = !!o.late, th = lamp === 'grow' ? -1 : o.dark ? 9 : o.always ? 0.04 : 0.05 + r() * 0.82;
    const bed = o.dark ? 0 : o.always || lamp === 'grow' ? 99 : o.bed ?? (o.early ? 20.3 + r() * 0.6 : late ? 25.2 + r() * 2.2 : 21.4 + r() * 1.7);
    const wake = o.early ? 3.4 + r() * 0.5 : 5.7 + r() * 1.6;
    list.push({ id, w, o, back, mid, cur, lamp, th, bed, wake, bay: k % bays, floor: Math.floor(k / bays), off: (r() - 0.5) * 3, flip: r() < 0.5 ? -1 : 1, phase: r() * 6.28,
      open: o.open ? (o.open === 'scope' ? 2.9 : 2.2 + r() * 0.5) : 0, waves: !o.dark && mid && HAS_BOT.has(mid) });
  });
  list.town = town; PLAN = list; return list;
}

// ---- outside the glass ------------------------------------------------------------------------------------------------------
const BOXES = ['c#3f5a4a/0.8', 'c#8a4a34/0.85', 'c#4a4640/0.8', 'c#34405a/0.8', 'c#b8653f/0.92', 'c#d8cdb4/0.8'];
const SCALE = { marigold: 0.8, herbs: 0.62, lavender: 0.5, catmint: 0.46, strawberry: 0.85, cosmos: 0.38, fern: 0.44, wildflowers: 0.42, tomato: 0.42, coneflower: 0.44, hosta: 0.62, grass: 0.4, wisteria: 0.34 };
const IRONP = 'c#24231f/0.5', FLAGS = ['#c8402f', '#e0a02a', '#3c8fa0', '#dcd2b8', '#5a7a5a', '#d59a8a'];
const CLOTH = { pos: [], col: [], sway: [], idx: [] };

// A sheet of cloth nu x nv quads; at(u, v) gives [x, y, z, colour, swayX, swayY, swayZ, phase].
function sheet(nu, nv, at) {
  const C = CLOTH, base = C.pos.length / 3, col = new THREE.Color();
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const p = at(i / nu, j / nv); C.pos.push(p[0], p[1], p[2]); col.set(p[3]); C.col.push(col.r, col.g, col.b); C.sway.push(p[4], p[5], p[6], p[7]); }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = base + j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; C.idx.push(a, c, b, b, c, d); }
}

export function buildFlats(K, town) {
  const P = plan(town), r = rnd(417);
  CLOTH.pos.length = CLOTH.col.length = CLOTH.sway.length = CLOTH.idx.length = 0;
  const BARS = new Set(['books', 'records', 'apothecary', 'museum', 'grocery', 'bakery']);
  for (const p of P) {
    const w = p.w, o = p.o, s = w.side, u0 = Math.abs(w.x) - 0.36, h0 = w.y - w.h / 2, h1 = w.y + w.h / 2, z = w.z, hw = w.w / 2;
    const TRIM = town.lots?.[w.lot]?.trim ?? 'c#e8dfcc/0.7', paint = /^c#[0-9a-f]{6}\/[\d.]+$/i.test(TRIM) ? TRIM : 'c#e8dfcc/0.7';
    const X = u => s * u, bx = (mat, ua, ub, ya, yb, za, zb) => K.box(mat, X(ua), X(ub), ya, yb, za, zb);
    const plant = (kind, u, zz, y, k = 1) => K.F.add(kind, X(u), zz, (SCALE[kind] ?? 0.4) * k, { y });

    // glazing bars on the older fronts; and a sash pushed up where the window is open
    if (BARS.has(w.lot)) { bx(paint, u0 + 0.17, u0 + 0.27, w.y + 0.07, h1 - 0.12, z - 0.035, z + 0.035); if (!p.open) bx(paint, u0 + 0.19, u0 + 0.29, h0 + 0.12, w.y - 0.07, z - 0.035, z + 0.035); }
    if (p.open) bx(paint, u0 + 0.15, u0 + 0.31, h0 + p.open - 0.13, h0 + p.open, z - hw, z + hw);

    if (o.box) {                                                    // a window box on two brackets, properly planted
      const c = BOXES[p.id % BOXES.length];
      bx(c, u0 - 0.92, u0 - 0.2, h0 - 0.82, h0 - 0.06, z - 1.85, z + 1.85); bx('c#2e2219/1', u0 - 0.86, u0 - 0.26, h0 - 0.06, h0 - 0.035, z - 1.79, z + 1.79);
      for (const dz of [-1.3, 1.3]) { bx(IRONP, u0 - 0.8, u0, h0 - 0.9, h0 - 0.82, z + dz - 0.04, z + dz + 0.04); bx(IRONP, u0 - 0.07, u0, h0 - 1.5, h0 - 0.82, z + dz - 0.04, z + dz + 0.04); K.tube(IRONP, [X(u0 - 0.75), h0 - 0.88, z + dz], [X(u0 - 0.03), h0 - 1.48, z + dz], 0.03, 4); }
      const kinds = o.box.filter(k => k !== 'wisteria');
      for (let i = 0; i < 8; i++) plant(kinds[i % kinds.length], u0 - 0.56 + (r() - 0.5) * 0.3, z - 1.55 + i * 0.443 + (r() - 0.5) * 0.2, h0 - 0.12, 0.85 + r() * 0.4);
      if (o.box.includes('wisteria')) for (let i = 0; i < 5; i++) plant('wisteria', u0 - 0.95, z - 1.5 + i * 0.75 + (r() - 0.5) * 0.3, h0 - 0.1, 0.8 + r() * 0.5);
    }
    if (o.pot) {                                                    // a pot or two on the sill
      for (const dz of r() < 0.5 ? [-1.05] : [-1.1, 0.95]) { K.lathe(r() < 0.5 ? 'c#b8653f/0.92' : 'c#a8745a/0.95', X(u0 - 0.04), h0, z + dz, [[0.01, 0], [0.62, 0], [0.7, 0.08], [0.86, 1.0], [0.96, 1.04], [0.97, 1.2], [0.88, 1.22]], 10, 0.19); plant(r() < 0.5 ? 'herbs' : 'marigold', u0 - 0.04, z + dz, h0 + 0.18, 0.55); }
    }
    if (o.feeder) {                                                 // a bird feeder on an arm, and two customers
      const zf = z + p.flip * 2.75, y = h0 + 4.4, uf = u0 - 1.25;
      K.tube(IRONP, [X(u0), y, zf], [X(uf), y + 0.12, zf], 0.03, 4); K.tube(IRONP, [X(u0), y - 0.7, zf], [X(u0 - 0.8), y + 0.06, zf], 0.022, 4); K.tube(IRONP, [X(uf), y + 0.12, zf], [X(uf), y - 0.35, zf], 0.012, 3);
      K.lathe('c#7a3f34/0.7', X(uf), y - 0.62, zf, [[0.34, 0], [0.01, 0.3]], 10); K.lathe('c#c9b98a/0.6', X(uf), y - 1.2, zf, [[0.01, 0], [0.16, 0], [0.16, 0.58]], 8); K.lathe('c#7a3f34/0.7', X(uf), y - 1.27, zf, [[0.01, 0], [0.36, 0], [0.38, 0.07], [0.01, 0.07]], 10);
      for (const [dz, c] of [[0.24, 'c#6a5a4a/0.9'], [-0.22, 'c#8a4a34/0.9']]) { K.sphere(c, X(uf + 0.05), y - 1.1, zf + dz, 0.11, 0.9, 1, 1.25, 1); K.sphere(c, X(uf - 0.07), y - 1.01, zf + dz, 0.07, 1, 1); K.sphere('c#c9a03c/0.8', X(uf - 0.15), y - 1.02, zf + dz, 0.025, 1, 0, 2, 1); }
    }
    if (o.balcony) {                                                // a tiny balcony: a slab on brackets, an iron rail, pots
      const ub = u0 - 1.35, yb = h0 - 0.32, zw = 2.25;
      bx('c#55514a/0.85', ub, u0 - 0.17, yb - 0.14, yb, z - zw, z + zw);
      for (const dz of [-1.7, 1.7]) K.tube(IRONP, [X(ub + 0.2), yb - 0.14, z + dz], [X(u0), yb - 1.1, z + dz], 0.04, 4);
      const top = yb + 2.5, rail = (a, b) => K.tube(IRONP, a, b, 0.035, 4);
      rail([X(ub + 0.05), top, z - zw + 0.05], [X(ub + 0.05), top, z + zw - 0.05]); rail([X(ub + 0.05), yb + 0.25, z - zw + 0.05], [X(ub + 0.05), yb + 0.25, z + zw - 0.05]);
      for (const k of [-1, 1]) { rail([X(ub + 0.05), top, z + k * (zw - 0.05)], [X(u0), top, z + k * (zw - 0.05)]); rail([X(ub + 0.05), yb + 0.25, z + k * (zw - 0.05)], [X(u0), yb + 0.25, z + k * (zw - 0.05)]); K.tube(IRONP, [X(ub + 0.05), yb, z + k * (zw - 0.05)], [X(ub + 0.05), top, z + k * (zw - 0.05)], 0.045, 4); K.tube(IRONP, [X(ub + 0.6), yb, z + k * (zw - 0.05)], [X(ub + 0.6), top, z + k * (zw - 0.05)], 0.02, 3); }
      for (let i = 1; i < 14; i++) { const zz = z - zw + 0.05 + i * (2 * zw - 0.1) / 14; K.tube(IRONP, [X(ub + 0.05), yb + 0.25, zz], [X(ub + 0.05), top, zz], 0.018, 3); }
      for (const [dz, k, sc] of [[-1.6, 0, 0.34], [1.5, 1, 0.3], [0.9, 0, 0.22]]) { K.lathe('c#b8653f/0.92', X(ub + 0.5), yb, z + dz, [[0.01, 0], [0.62, 0], [0.7, 0.08], [0.86, 1.0], [0.96, 1.04], [0.97, 1.2], [0.88, 1.22]], 10, sc); plant(o.balcony[k % o.balcony.length], ub + 0.5, z + dz, yb + sc * 1.05, sc * 3.2); }
    }
    if (o.open === 'scope') {                                       // a telescope on the sill, trained on the Overlook's own
      const at = new THREE.Vector3(X(u0 - 0.5), h0 + 1.25, z), d = new THREE.Vector3(27, 5.5, -231).sub(at).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
      const part = (mat, r0, r1, t0, t1, seg = 12) => { const g = new THREE.CylinderGeometry(r1, r0, t1 - t0, seg); g.translate(0, (t0 + t1) / 2, 0); g.applyQuaternion(q); g.translate(at.x, at.y, at.z); K.put(mat, g); };
      part('c#b08d4a/0.4', 0.1, 0.13, -0.95, 1.5); part('c#2a2622/0.5', 0.145, 0.145, 1.3, 1.62); part('c#2a2622/0.5', 0.07, 0.07, -1.2, -0.95, 8); part('c#2a2622/0.5', 0.15, 0.15, -0.1, 0.1);
      bx('c#6a5236/0.8', u0 - 1.05, u0 - 0.17, h0 - 0.13, h0 - 0.03, z - 0.7, z + 0.7); for (const dz of [-0.5, 0.5]) K.tube(IRONP, [X(u0 - 0.95), h0 - 0.13, z + dz], [X(u0), h0 - 0.9, z + dz], 0.03, 4);
      for (const [du, dz] of [[-0.42, 0], [0.25, -0.5], [0.25, 0.5]]) K.tube('c#4a3626/0.7', [at.x, at.y - 0.12, at.z], [X(u0 - 0.5 + du), h0 - 0.03, z + dz], 0.035, 5);
    }
    if (o.open === 'curtain') {                                     // a curtain breathing out over the sill
      const yT = h0 + p.open - 0.1, yB = h0 - 0.5 - r() * 0.3, c = o.cloth ?? '#d8cfc0', ph = p.phase;
      const zc = z + p.flip * 0.75, base = new THREE.Color(c), tmp = new THREE.Color();
      sheet(8, 8, (u, v) => { const rip = Math.sin(u * TAU * 3 + ph) * 0.06 * (0.3 + v); return [X(u0 + 0.27 - 0.72 * Math.pow(v, 1.2) - rip), yT - (yT - yB) * v, zc + (u - 0.5) * (1.7 - 0.35 * v), tmp.copy(base).multiplyScalar(1.15 + 0.3 * Math.sin(u * TAU * 3 + ph + 1.2)), -s * 0.5 * v * v, 0.14 * v * v, (u - 0.3) * 0.3 * v * v, ph + u * 1.3]; });
    }
    if (o.open === 'towel') {                                       // a towel airing over the sill
      const zc = z + p.flip * 0.6, cols = [['#d8cdb4', '#3c8fa0'], ['#dcd2b8', '#c8402f']][p.id % 2], ph = p.phase;
      sheet(2, 8, (u, v) => { const out = v < 0.25, y = out ? h0 + 0.03 : h0 + 0.03 - (v - 0.25) / 0.75 * 1.7, uu = out ? u0 + 0.1 - v * 1.12 : u0 - 0.2, k = out ? 0 : (v - 0.25) / 0.75; return [X(uu), y, zc + (u - 0.5) * 1.25, Math.floor(v * 16) % 4 === 1 ? cols[1] : cols[0], -s * 0.12 * k * k, 0, 0.05 * k * k, ph]; });
    }
    if (o.bunt) {                                                   // bunting to the next window along
      const q = P[p.id + 1];
      if (q && q.w.lot === w.lot && q.floor === p.floor) {
        const y = h1 + 0.3, za = z - Math.sign(z - q.w.z) * (hw + 0.2), zb = q.w.z + Math.sign(z - q.w.z) * (hw + 0.2), n = 14, pts = [];
        for (let i = 0; i <= n; i++) { const t = i / n; pts.push([X(u0 - 0.1), y - 0.75 * 4 * t * (1 - t), za + (zb - za) * t]); }
        for (let i = 0; i < n; i++) K.tube('c#1d1b19/0.6', pts[i], pts[i + 1], 0.012, 3);
        for (let i = 0; i < n; i++) { const [ax, ay, az] = pts[i], [, by, bz] = pts[i + 1], c = FLAGS[i % FLAGS.length], ph = p.phase + i * 0.7, gap = 0.12; sheet(1, 1, (u, v) => v === 0 ? [ax, ay + (by - ay) * (gap + u * (1 - 2 * gap)), az + (bz - az) * (gap + u * (1 - 2 * gap)), c, 0, 0, 0, ph] : [ax, (ay + by) / 2 - 0.5, (az + bz) / 2 + (u - 0.5) * 0.02, c, -s * 0.16, 0, 0.04, ph]); }
      }
    }
  }
}

// =====================================================================================================================
// THE SHADERS
// =====================================================================================================================
const VERT_HEAD = /* glsl */`
attribute vec4 aCell; attribute vec4 aTint; attribute vec4 aLampP; attribute vec4 aLampR; attribute vec4 aLamp; attribute vec4 aTime; attribute vec4 aDecal; attribute vec4 aDecalAt; attribute vec4 aMisc;
uniform vec4 uClock; uniform vec4 uWave;
varying vec3 vfDir; varying vec2 vfP; varying vec4 vfCell; varying vec4 vfTint; varying vec4 vfLampP; varying vec4 vfLampR; varying vec4 vfLamp; varying vec4 vfDecal; varying vec4 vfDecalAt; varying vec4 vfState; varying float vfId;
`;
const VERT_BODY = /* glsl */`
{
  vec3 flW = (modelMatrix * vec4(position, 1.0)).xyz - cameraPosition;
  float flS = -normal.x;
  vfDir = vec3(flS * flW.z, flW.y, flS * flW.x);
  vfP = (uv - 0.5) * vec2(FL_W, FL_H);
  // is anybody up?  aTime: switching-on point, bedtime, waking hour, the window's number
  float flH = uClock.w < 12.0 ? uClock.w + 24.0 : uClock.w;
  float flUp = max(step(flH, aTime.y), uClock.w < 12.0 ? step(aTime.z, uClock.w) : 0.0);
  float flL = smoothstep(aTime.x, aTime.x + 0.06, uClock.y) * flUp;
  float flWv = abs(uWave.x - aTime.w) < 0.5 ? uWave.y : 0.0;
  float flAsleep = (1.0 - flUp) * step(0.5, uClock.y) * step(0.5, aMisc.w) * (1.0 - step(0.01, flWv));
  float flT = floor(uClock.x * 4.0), flF = fract(uClock.x * 4.0);
  float flA = fract(sin((flT + aTime.w * 7.0) * 12.9898) * 43758.5453), flB = fract(sin((flT + 1.0 + aTime.w * 7.0) * 12.9898) * 43758.5453);
  float flick = aMisc.z > 0.5 ? 0.5 + 0.5 * mix(flA, flB, flF * flF) : 1.0;
  vfState = vec4(max(flL, flWv), aMisc.x, flWv, flick);
  vfCell = aCell; if (flAsleep > 0.5) vfCell.y = FL_SLEEP;
  vfTint = aTint; vfLampP = aLampP; vfLampR = aLampR; vfLamp = aLamp; vfDecal = aDecal; vfDecalAt = aDecalAt; vfId = aTime.w;
}
`;
const FRAG_HEAD = /* glsl */`
uniform sampler2D uAtlas; uniform vec4 uClock;
varying vec3 vfDir; varying vec2 vfP; varying vec4 vfCell; varying vec4 vfTint; varying vec4 vfLampP; varying vec4 vfLampR; varying vec4 vfLamp; varying vec4 vfDecal; varying vec4 vfDecalAt; varying vec4 vfState; varying float vfId;
vec4 flTex(vec2 o, vec2 sz, vec2 uv, float lod) {
  vec2 p = clamp(o + uv * sz, o + 0.75, o + sz - 0.75);
  vec4 t = textureLod(uAtlas, vec2(p.x / FL_AW, 1.0 - p.y / FL_AH), lod);
  t.rgb = pow(t.rgb / max(t.a, 0.004), vec3(2.2)); return t;
}
float flIn(vec2 uv) { return step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0); }
float flGlow(vec3 c) { return smoothstep(0.8, 0.92, max(c.r, max(c.g, c.b))); }
// the light that falls on a point in the room
vec3 flLight(vec3 q) {
  vec3 dl = q - vfLampP.xyz; float fall = 1.0 / (1.0 + dot(dl, dl) * 0.1 * vfLampP.w);
  vec3 lamp = vfLamp.rgb * vfState.x * vfState.w * (vfLamp.w + 1.5 * fall);
  vec3 day = vec3(0.9, 0.95, 1.0) * uClock.z * (0.05 + 0.2 * exp(-q.z * 0.3));
  vec3 night = vec3(0.01, 0.014, 0.024) + vec3(1.0, 0.6, 0.3) * 0.03 * uClock.y * exp(-q.z * 0.5);
  return lamp + day + night;
}
// what lights a thing hung right in the window: the day in front of it, the lamp behind it, the street's lamps
vec3 flSheet(float through) {
  return vec3(0.9, 0.95, 1.0) * uClock.z * 0.34 + vfLamp.rgb * vfState.x * vfState.w * through + vec3(0.016, 0.02, 0.03) + vec3(1.0, 0.62, 0.32) * 0.07 * uClock.y;
}
`;
const FRAG_BODY = /* glsl */`
float flGlass = 1.0;
{
  vec3 d = normalize(vfDir); d.z = max(d.z, 0.03); d = normalize(d);
  vec2 P = vfP; vec3 O = vec3(P, 0.0); vec4 cell = floor(vfCell + 0.5);
  float off = vfTint.w, x0 = off - FL_RW * 0.5, x1 = off + FL_RW * 0.5;
  float tz = FL_RD / d.z;
  float tx = abs(d.x) < 1e-5 ? 1e9 : ((d.x > 0.0 ? x1 : x0) - P.x) / d.x;
  float ty = abs(d.y) < 1e-5 ? 1e9 : ((d.y > 0.0 ? FL_Y1 : FL_Y0) - P.y) / d.y;
  float t = min(tz, min(tx, ty));
  vec3 q = O + d * t;
  float ftpp = max(fwidth(P.x), fwidth(P.y)) * 1.2, L = vfState.x * vfState.w;
  float lodB = clamp(log2(ftpp * 24.0), 0.0, 3.0);
  vec3 alb; float stars = 0.0, screen = 0.0;
  if (t == tz) {
    alb = flTex(vec2(mod(cell.x, 10.0), floor(cell.x / 10.0)) * vec2(FL_BW, FL_BH), vec2(FL_BW, FL_BH), vec2((q.x - x0) / FL_RW, (FL_Y1 - q.y) / 7.0), lodB).rgb;
    screen = flGlow(alb); if (q.y < FL_Y1 - 7.0) alb *= 0.55;
  } else if (t == ty) {
    if (d.y > 0.0) { vec4 c = flTex(vec2(FL_CEILX, cell.w * FL_CEILH), vec2(128.0, FL_CEILH), vec2((q.x - x0) / FL_RW, q.z / FL_RD), clamp(lodB - 0.6, 0.0, 3.0)); alb = c.rgb * mix(vec3(1.0), vfTint.rgb * 2.2, 0.16); stars = 1.0 - c.a; }
    else alb = vec3(0.3, 0.19, 0.11) * (0.8 + 0.2 * step(0.5, fract(q.x * 1.6)));
  } else {
    float yy = FL_Y1 - q.y; alb = vfTint.rgb * (0.86 + 0.34 * step(yy, 0.2) + 0.3 * step(0.95, yy) * step(yy, 1.07));
    alb *= 1.0 - 0.3 * step(1.5, yy) * step(yy, 4.4) * step(2.2, q.z) * step(q.z, 4.6) * (1.0 - step(0.12, min(min(yy - 1.5, 4.4 - yy), min(q.z - 2.2, 4.6 - q.z))));
  }
  vec3 col = alb * flLight(q) + alb * screen * (0.1 + 1.5 * L);
  col += vec3(0.45, 1.0, 0.5) * stars * 0.55 * (1.0 - uClock.z) * (1.0 - vfState.x);

  // the lamp: an ellipsoid hanging in the room, and its cord
  vec3 lp = vfLampP.xyz, rr = vfLampR.xyz; float ts = 1e9; vec3 lampC = vec3(0.0); float cord = 0.0;
  if (rr.x > 0.0) {
    vec3 oc = (O - lp) / rr, dd = d / rr; float a = dot(dd, dd), b = dot(oc, dd), h = b * b - a * (dot(oc, oc) - 1.0);
    if (h > 0.0) { float s = (-b - sqrt(h)) / a; if (s > 0.0 && s < t) { ts = s; vec3 n = normalize((oc + dd * s) / rr); float f = 0.55 + 0.45 * max(0.0, -dot(n, d));
      lampC = mix(vec3(0.6, 0.57, 0.5) * (flLight(O + d * s) * 0.5 + vec3(0.9, 0.95, 1.0) * uClock.z * 0.12) * (0.6 + 0.4 * n.y), vfLamp.rgb * (0.9 + 1.7 * f), L); } }
    if (vfLampR.w > 0.5) { float tc = dot(lp.xz - O.xz, d.xz) / dot(d.xz, d.xz); vec3 qc = O + d * tc; if (tc > 0.0 && tc < t && qc.y > lp.y && qc.y < FL_Y1) cord = clamp(0.03 / ftpp, 0.0, 1.0) * (1.0 - smoothstep(0.0, max(0.035, ftpp), length(qc.xz - lp.xz))); }
  }
  float tm = FL_MIDZ / d.z;
  col = mix(col, vec3(0.02), cord * 0.85);
  if (ts < 1e8 && ts >= tm) col = lampC;
  if (cell.y >= 0.0 && tm < t) {                                 // the things in the room
    vec3 qm = O + d * tm; vec2 uv = vec2(qm.x / FL_MID + 0.5, (FL_Y1 - qm.y) / FL_MID);
    vec4 m = flTex(vec2(mod(cell.y, 16.0) * 128.0, FL_MIDY + floor(cell.y / 16.0) * 128.0), vec2(128.0), uv, clamp(log2(ftpp * 25.6), 0.0, 3.0)); m.a *= flIn(uv);
    float gl = flGlow(m.rgb);
    col = mix(col, m.rgb * (flLight(qm) * 0.9 + gl * (0.3 + 1.3 * L)), m.a);
  }
  if (ts < tm) col = lampC;
  if (cell.z >= 0.0) {                                           // curtains
    vec2 qc = P + d.xy / d.z * 0.3, uv = vec2(qc.x / 4.4 + 0.5, 0.5 - qc.y / 7.2);
    vec4 c = flTex(vec2(cell.z * FL_CW, FL_CURY), vec2(FL_CW, FL_CH), uv, clamp(log2(ftpp * 18.0), 0.0, 3.0)); c.a *= flIn(uv);
    col = mix(col, c.rgb * (flSheet(0.55) + flGlow(c.rgb) * 1.6 * L), c.a);
  }
  if (vfState.z > 0.001) {                                         // somebody comes to the glass and waves
    vec2 qw = P + d.xy / d.z * 0.45; float hb = qw.y + FL_H * 0.5 + (1.0 - vfState.z) * 3.3;
    vec3 tint = 0.62 + 0.38 * cos(vfId * 2.4 + vec3(0.0, 2.1, 4.2)); vec3 wl = flSheet(0.3) * 1.5;
    vec2 uv = vec2(qw.x / 3.4 + 0.5, 1.0 - hb / 3.4); vec4 b = flTex(FL_WAVER.xy, FL_WAVER.zw, uv, 0.0); b.a *= flIn(uv);
    float gl = flGlow(b.rgb); col = mix(col, b.rgb * mix(tint, vec3(1.0), gl) * (wl + gl * 1.2), b.a);
    float an = 0.25 + 0.5 * sin(uClock.x * 8.0), ca = cos(an), sa = sin(an); vec2 rel = vec2(qw.x - 0.76, hb - 1.25); rel = vec2(ca * rel.x - sa * rel.y, sa * rel.x + ca * rel.y);
    uv = vec2(rel.x / 1.7 + 0.5, 1.0 - (rel.y / 1.7 + 0.094)); vec4 ar = flTex(FL_ARM.xy, FL_ARM.zw, uv, 0.0); ar.a *= flIn(uv) * step(-FL_H * 0.5, qw.y);
    col = mix(col, ar.rgb * tint * wl, ar.a);
  }
  if (vfDecal.z > 0.0) {                                           // steam, or a notice, on the glass
    vec2 qd = P + d.xy / d.z * 0.06, uv = (qd - vfDecalAt.xy) / (vfDecalAt.zw - vfDecalAt.xy); uv.y = 1.0 - uv.y;
    vec4 s = flTex(vfDecal.xy, vfDecal.zw, uv, clamp(log2(ftpp * vfDecal.z / (vfDecalAt.z - vfDecalAt.x)), 0.0, 3.0)); s.a *= flIn(uv);
    col = mix(col, s.rgb * flSheet(0.42) * 1.15, s.a);
  }
  // the glass: none where the sash is pushed up, two panes of it where the sashes overlap
  flGlass = P.y < vfState.y ? 0.0 : (P.y < 0.0 && vfState.y > -3.0 ? 1.5 : 1.0);
  totalEmissiveRadiance = col * FL_GAIN * (1.0 - 0.1 * flGlass);
}
`;

// =====================================================================================================================
// ONCE THE SCENE EXISTS
// =====================================================================================================================
export function flatsLife(ctx, K) {
  const { scene, animated, day, camera } = ctx, town = K.town, P = plan(town), N = P.length;
  if (!N) return;
  const lampsOn = () => 1 - THREE.MathUtils.smoothstep(day.light, 0.42, 0.97);
  const uClock = { value: new THREE.Vector4(0, lampsOn(), day.light, day.hour ?? 18) }, uWave = { value: new THREE.Vector4(-9, 0, 0, 0) }, uT = { value: 0 };

  // ---- the sheet -------------------------------------------------------------------------------------------------
  const tex = new THREE.CanvasTexture(paintAtlas()); tex.colorSpace = THREE.NoColorSpace; tex.premultiplyAlpha = true; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.anisotropy = 1;
  // ?flatsatlas lays the sheet over the page, to look at it
  if (typeof location !== 'undefined' && /[?&]flatsatlas/.test(location.search)) { const c = tex.image; c.style.cssText = 'position:fixed;left:0;top:0;width:100%;z-index:99999;background:#456'; document.body.appendChild(c); }

  // ---- the panes: one quad a window ---------------------------------------------------------------------------
  const W0 = P[0].w.w, H0 = P[0].w.h, Y1 = H0 / 2 + CEIL_UP, Y0 = -H0 / 2 - SILL_DOWN;
  const A = { position: [new Float32Array(N * 12), 3], normal: [new Float32Array(N * 12), 3], uv: [new Float32Array(N * 8), 2] };
  for (const n of ['aCell', 'aTint', 'aLampP', 'aLampR', 'aLamp', 'aTime', 'aDecal', 'aDecalAt', 'aMisc']) A[n] = [new Float32Array(N * 16), 4];
  const idx = new Uint16Array(N * 6), put4 = (n, i, a, b, c, d) => { const arr = A[n][0]; for (let k = 0; k < 4; k++) { const o = (i * 4 + k) * 4; arr[o] = a; arr[o + 1] = b; arr[o + 2] = c; arr[o + 3] = d; } };
  const sleepCell = MID_NAMES.indexOf('sleeping');
  P.forEach((p, i) => {
    const w = p.w, s = w.side, o = p.o, CORN = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    CORN.forEach(([cx, cy], k) => { const v = i * 4 + k; A.position[0].set([w.x, w.y + cy * w.h / 2, w.z + s * cx * w.w / 2], v * 3); A.normal[0].set([-s, 0, 0], v * 3); A.uv[0].set([(cx + 1) / 2, (cy + 1) / 2], v * 2); });
    idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
    const lamp = LAMPS[p.lamp] ?? LAMPS.globe, back = BACKS[p.back] ?? BACKS.plainA, tint = hexLin(back[1]);
    const lx = p.lamp === 'read' ? p.flip * lamp[0] : p.lamp === 'grow' ? 0 : p.off + lamp[0];
    put4('aCell', i, Math.max(0, BACK_NAMES.indexOf(p.back)), p.mid ? MID_NAMES.indexOf(p.mid) : -1, p.cur ? CUR_NAMES.indexOf(p.cur) : -1, o.ceil ?? 0);
    put4('aTint', i, tint[0], tint[1], tint[2], p.off);
    put4('aLampP', i, lx, Y1 - lamp[1], lamp[2], lamp[3]);
    put4('aLampR', i, p.lamp === 'none' || p.lamp === 'tv' ? 0 : lamp[4], lamp[5], lamp[6], lamp[7]);
    put4('aLamp', i, lamp[8][0], lamp[8][1], lamp[8][2], lamp[9]);
    put4('aTime', i, p.th, p.bed, p.wake, p.id);
    const dec = o.steam ? [STEAM, [-W0 / 2, -H0 / 2, W0 / 2, H0 / 2]] : o.sign ? [SIGNS[o.sign], [-1.5, -2.9, 1.5, -0.775]] : null;
    put4('aDecal', i, ...(dec ? dec[0] : [0, 0, 0, 0])); put4('aDecalAt', i, ...(dec ? dec[1] : [0, 0, 1, 1]));
    put4('aMisc', i, p.open ? -H0 / 2 + p.open : -9, p.phase, p.lamp === 'tv' ? 1 : 0, p.waves ? 1 : 0);
  });
  const geo = new THREE.BufferGeometry();
  for (const [n, [arr, size]] of Object.entries(A)) geo.setAttribute(n, new THREE.BufferAttribute(arr, size));
  geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeBoundingSphere(); geo.computeBoundingBox();
  const f = n => Number(n).toFixed(4);
  const defs = `#define FL_W ${f(W0)}\n#define FL_H ${f(H0)}\n#define FL_RW ${f(RW)}\n#define FL_RD ${f(RD)}\n#define FL_Y1 ${f(Y1)}\n#define FL_Y0 ${f(Y0)}\n#define FL_MIDZ ${f(MIDZ)}\n#define FL_MID ${f(MID)}\n#define FL_AW ${f(AW)}\n#define FL_AH ${f(AH)}\n#define FL_BW ${f(BW)}\n#define FL_BH ${f(BH)}\n#define FL_CW ${f(CW)}\n#define FL_CH ${f(CH)}\n#define FL_MIDY ${f(MID_Y)}\n#define FL_CURY ${f(CUR_Y)}\n#define FL_CEILX ${f(CEIL_X)}\n#define FL_CEILH ${f(CEIL_H)}\n#define FL_SLEEP ${f(sleepCell)}\n#define FL_WAVER vec4(${WAVER.map(f).join(', ')})\n#define FL_ARM vec4(${ARM.map(f).join(', ')})\n#define FL_GAIN 1.0\n`;
  const mat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.07, metalness: 0, envMapIntensity: 1.5 });
  mat.onBeforeCompile = sh => {
    sh.uniforms.uAtlas = { value: tex }; sh.uniforms.uClock = uClock; sh.uniforms.uWave = uWave;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + defs + VERT_HEAD).replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VERT_BODY);
    sh.fragmentShader = sh.fragmentShader.replace('#define HOUSE_LIGHT', '').replace('#include <common>', '#include <common>\n' + defs + FRAG_HEAD)
      .replace('#include <emissivemap_fragment>', FRAG_BODY)
      .replace('#include <lights_physical_fragment>', '#include <lights_physical_fragment>\nfloat flK = mix(0.14, 1.0, smoothstep(0.0, 0.55, uClock.z)); material.diffuseColor = vec3(0.0); material.specularColor = vec3(0.13) * flK * min(flGlass, 1.0) * (0.7 + 0.3 * flGlass); material.specularF90 = flK * min(flGlass, 1.0);\n');
  };
  mat.customProgramCacheKey = () => 'flats-panes';
  const panes = new THREE.Mesh(geo, mat); panes.name = 'flats'; panes.userData.cat = 'flats'; scene.add(panes);

  // ---- cloth: curtains breathing out, bunting, a towel: one mesh, swayed in the vertex shader ---------------
  if (CLOTH.idx.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(CLOTH.pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(CLOTH.col, 3)); g.setAttribute('aSway', new THREE.Float32BufferAttribute(CLOTH.sway, 4));
    g.setIndex(CLOTH.idx); g.computeVertexNormals(); g.computeBoundingSphere(); g.boundingSphere.radius += 1;
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.92, envMapIntensity: 0.7 });
    m.onBeforeCompile = sh => {
      sh.uniforms.uFlT = uT;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 aSway; uniform float uFlT;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += aSway.xyz * (0.6 + 0.55 * sin(uFlT * 1.1 + aSway.w) + 0.25 * sin(uFlT * 2.7 + aSway.w * 1.7));');
      sh.fragmentShader = sh.fragmentShader.replace('#define HOUSE_LIGHT', '');
    };
    m.customProgramCacheKey = () => 'flats-cloth';
    const cloth = new THREE.Mesh(g, m); cloth.name = 'flats cloth'; cloth.userData.cat = 'flats'; cloth.receiveShadow = true; scene.add(cloth);
  }

  // ---- the clock, and somebody who waves back ------------------------------------------------------------------
  const dir = new THREE.Vector3(), last = new THREE.Vector3(1e9, 0, 0), NOTES = ['someone upstairs waves back', 'a small hand, waving', 'you have been noticed. a wave.', 'they wave. you are a regular now.'];
  let cand = -1, held = 0, waving = -1, waveT = 0, rest = 0, notes = 0;
  const force = typeof location !== 'undefined' ? /[?&]flatswave=(\d+)/.exec(location.search) : null;      // ?flatswave=9 keeps window 9 waving (for looking at it)
  animated.push((t, dt = 0.016) => {
    uClock.value.set(t, lampsOn(), day.light, day.hour ?? 18); uT.value = t;
    if (force) { uWave.value.set(Number(force[1]), 1, 0, 0); return; }
    if (waving >= 0) {                                              // up to the glass, wave, and away again
      waveT += dt; const k = Math.min(1, waveT / 0.7) * Math.min(1, Math.max(0, (7.5 - waveT) / 0.7));
      uWave.value.set(waving, k * k * (3 - 2 * k), 0, 0);
      if (waveT > 7.5) { waving = -1; uWave.value.set(-9, 0, 0, 0); rest = 12; }
      return;
    }
    if (rest > 0) { rest -= dt; return; }
    const cp = camera.position, still = last.distanceToSquared(cp) < 0.0004; last.copy(cp);
    if (!still) { held = 0; return; }
    camera.getWorldDirection(dir); if (dir.y < 0.08) { held = 0; return; }
    let best = -1, bd = 0.972;
    for (let i = 0; i < N; i++) {
      const p = P[i]; if (!p.waves) continue;
      const w = p.w, dx = w.x - cp.x, dy = w.y - cp.y, dz = w.z - cp.z;
      if (dx * w.side < 2 || dx * dx + dz * dz > 2500) continue;
      const dot = (dx * dir.x + dy * dir.y + dz * dir.z) / Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dot > bd) { bd = dot; best = i; }
    }
    if (best < 0 || best !== cand) { cand = best; held = 0; return; }
    held += dt;
    if (held > 3.5) { waving = P[best].id; waveT = 0; held = 0; cand = -1; try { ctx.flash?.(NOTES[notes++ % NOTES.length]); } catch { /* no toast, no matter */ } }
  });
}
