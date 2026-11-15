// The flats over the shops: what you can see of each room from the street. town.upWindows lists every
// upstairs window ({ x, y, z (world centre of the pane), w, h, side (+1 north, -1 south), lot }), and every one
// of them gets a pane here, whatever the lots' storeys and bays are: nothing is counted by hand.
//
// Every pane is one quad in one mesh with one material. The room behind it is not built: the fragment
// shader walks the eye's ray into a box 8 ft wide and 6.5 deep ("interior mapping") and paints what it
// meets from one small sheet: the far wall, the side walls, a ceiling, a lamp that really hangs in the
// room (an ellipsoid on a cord), at most one thing 2.4 ft in, the curtains or blind just behind the glass,
// then the sky's reflection. Each window carries its own switching-on point, bedtime and waking hour as
// vertex attributes, so the street lights up one window at a time and nothing is updated per window per frame.
//
// Most windows are quiet on purpose: a blind half down, curtains drawn, a plain room, dark. About a third
// have somebody home after dusk. SPECIAL names the one window a building may have with something in it to
// notice (six on the whole street); OUTSIDE the three window boxes and the one sash left open.
//
// buildFlats(K, town) runs while the street is laid out; flatsLife(ctx, K) once the scene exists.

import * as THREE from 'three';
import { fill, disc, rect, rrect, line, poly, rnd, TAU } from './draw.js';

// ---- the room, in feet, from the middle of the pane (x right as seen from the street, y up, z in) ----------
const RW = 8, RD = 6.5, CEIL_UP = 0.8, SILL_DOWN = 2.6, MIDZ = 2.4, MID = 5, PANE_H = 6.2;
// ---- the sheet --------------------------------------------------------------------------------------------------
const AW = 2048, AH = 1024, BW = 192, BH = 168, MW = 128, CW = 80, CH = 128;
const MID_Y = 504, CUR_Y = 760, CEIL_X = 1920, CEIL_H = 104;
const WAVER = [1360, CUR_Y, 128, 128], ARM = [1488, CUR_Y, 64, 64];

// =====================================================================================================================
// PAINTING (everything below, down to "the street's flats", only draws on a 2D context)
// =====================================================================================================================
// Nothing ordinary is painted brighter than about 228 in any channel: brighter than that glows in the
// dark (robots' eyes, a television, fairy lights, a fish tank), which is how the sheet marks its lights.
const BOT = ['#d9825b', '#7fa9a3', '#dcae4a', '#9a86b8', '#c9c2ae', '#6f8fb8', '#b85a50', '#8fae6f'];
const EYE = '#fff6d0', CREAM = '#dcd2b8', INK = '#26221e';
const pickOf = (r, a) => a[Math.floor(r() * a.length)];
const ell = (g, x, y, rx, ry, c, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fillStyle = c; g.fill(); };
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
  const k = Math.floor(r() * 4);
  if (k === 0) { rect(g, x, y, w, h, '#9db4c0'); rect(g, x, y + h * 0.6, w, h * 0.4, '#6f8a5e'); disc(g, x + w * 0.7, y + h * 0.36, Math.min(w, h) * 0.14, '#e0b46a'); }
  else if (k === 1) { rect(g, x, y, w, h, pickOf(r, ['#c8683a', '#34405a', '#7f9077'])); disc(g, x + w / 2, y + h / 2, Math.min(w, h) * 0.3, CREAM); }
  else if (k === 2) { rect(g, x, y, w, h, '#b9a98a'); rect(g, x, y + h * 0.55, w, h * 0.45, '#8a6a4a'); ell(g, x + w * 0.4, y + h * 0.5, w * 0.16, h * 0.2, '#5a6a50'); }
  else { rect(g, x, y, w, h, '#3a4a5a'); for (let i = 0; i < 9; i++) disc(g, x + 2 + r() * (w - 4), y + 2 + r() * (h * 0.6), 0.8, CREAM); rect(g, x, y + h * 0.75, w, h * 0.25, '#26303a'); }
}
const PB = {
  bare() { /* a wall, a cornice and a picture rail: wallBase has drawn them */ },
  plain(g, w, h, r, o) {
    if (o.k === 1) { for (let x = 0; x < w; x += 12) rect(g, x, 27, 5, h, 'rgba(255,255,255,.1)'); }
    if (o.k === 3) { for (let y = 34; y < h; y += 14) for (let x = (y % 28 ? 4 : 11); x < w; x += 14) disc(g, x, y, 1.8, 'rgba(255,255,255,.2)'); }
    const dx = o.k === 2 ? 118 : 26;                                 // a door, and hooks with hats
    rrect(g, dx, 34, 46, 140, 2, 'rgba(0,0,0,.25)'); rect(g, dx + 3, 37, 40, 134, o.door ?? '#6a5a48'); for (const [px, py] of [[5, 6], [24, 6], [5, 62], [24, 62]]) rrect(g, dx + 3 + px, 37 + py, 13, 50, 1, 'rgba(0,0,0,.16)'); disc(g, dx + 38, 110, 2, '#c9a45c');
    const hx = o.k === 2 ? 22 : 96; rect(g, hx, 52, 72, 3, '#4a3a2c');
    for (let i = 0; i < 4; i++) { const x = hx + 8 + i * 18; rect(g, x, 55, 2, 5, '#4a3a2c'); if (i === 1) { ell(g, x + 1, 64, 11, 3, '#8c3b2e'); ell(g, x + 1, 61, 6, 5, '#8c3b2e'); } if (i === 2) rect(g, x - 4, 60, 10, 34, '#3f5470'); if (i === 3) { poly(g, [[x + 1, 58], [x - 7, 74], [x + 9, 74]], '#c9a03c'); } }
  },
  pics(g, w, h, r, o) {                                             // a picture or two, hung from the rail
    const fr = [[[70, 44, 52, 40]], [[26, 40, 40, 54], [112, 50, 34, 28]], [[118, 38, 44, 58]]][o.k ?? 0];
    for (const [x, y, fw, fh] of fr) { rect(g, x - 1, y + 1, fw + 2, fh + 2, 'rgba(0,0,0,.25)'); rect(g, x, y, fw, fh, pickOf(r, ['#2a2622', '#a8894a', '#5a3a26'])); rect(g, x + 2.5, y + 2.5, fw - 5, fh - 5, '#d8ccb4'); art(g, x + 5, y + 5, fw - 10, fh - 10, r); }
  },
  kitchen(g, w, h, r) {
    for (let y = 100; y < h; y += 12) for (let x = (y % 24 ? 0 : 9); x < w; x += 18) rrect(g, x, y, 17, 11, 1, 'rgba(255,255,255,.14)');      // tiles behind the counter
    rect(g, 6, 52, w - 12, 3, '#5a4636');
    for (let x = 12; x < w - 20;) { const k = r(); if (k < 0.4) { for (let i = 0; i < 4; i++) ell(g, x + 8, 50 - i * 2.6, 9, 2, i % 2 ? '#cfc8b8' : '#d8d2c2'); x += 22; } else if (k < 0.75) { rrect(g, x, 38, 9, 14, 2, pickOf(r, ['#b8452e', '#3f6a5a', '#c9a03c', '#d2c8b0'])); x += 12; } else { rrect(g, x, 34, 12, 18, 3, '#9aa4a8'); rect(g, x + 2, 31, 8, 3, '#7a8488'); x += 16; } }
    line(g, [[10, 70], [w - 10, 70]], '#3a3a3c', 2);                // a rail of pans
    for (let i = 0; i < 4; i++) { const x = 24 + i * 44 + r() * 6, R = 8 + r() * 5, c = pickOf(r, ['#b06a3c', '#3a3a3c', '#9a5a34', '#55585a']); line(g, [[x, 70], [x, 78]], c, 2.5); disc(g, x, 78 + R, R, c); disc(g, x, 78 + R, R * 0.7, 'rgba(0,0,0,.2)'); }
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
  shed(g, w, h, r) {                                                // the inside of the allotment shed: boards, a shelf, the tools on nails
    for (let x = 0; x < w; x += 16) { rect(g, x, 0, 15, h, pickOf(r, ['#6e5a42', '#735e45', '#68553e'])); rect(g, x + 15, 0, 1, h, 'rgba(0,0,0,.35)'); }
    rect(g, 0, 62, w, 4, '#4a3a2a');                                 // a rail across the studs
    rect(g, 10, 84, 92, 4, '#8a7050');                               // a shelf: tins, a jar of string, seed packets
    for (const [x, ww, hh, c] of [[14, 10, 14, '#7a8288'], [27, 12, 10, '#a8603c'], [42, 9, 16, '#c9c2ae'], [56, 14, 8, '#5a6a50'], [74, 8, 12, '#b8452e'], [86, 11, 15, '#7a8288']]) rect(g, x, 84 - hh, ww, hh, c);
    line(g, [[128, 64], [124, 150]], '#8a6a48', 3); rect(g, 116, 150, 16, 18, '#7a8288');      // a hoe hung up on the rail
    line(g, [[150, 64], [152, 140]], '#8a6a48', 3); for (let i = 0; i < 7; i++) line(g, [[143 + i * 2.5, 140], [143 + i * 2.5, 150]], '#6a7074', 1.4);      // a rake, its teeth down
    g.beginPath(); g.ellipse(176, 90, 9, 12, 0, 0, TAU); g.strokeStyle = '#b8a070'; g.lineWidth = 3; g.stroke();     // a coil of twine on a nail
    rect(g, 30, 118, 60, 3, '#4a3a2a'); poly(g, [[34, 121], [86, 121], [80, 168], [40, 168]], 'rgba(0,0,0,.18)');      // the potting bench, in its own shadow
    for (const x of [44, 58, 72]) potAt(g, x, 118, 11, 9);
  },
};
// name: [painter, wall colour, seed, options]. The wall colour is also what the side walls are painted.
const BACKS = {
  bareA: ['bare', '#b9a48e', 3], bareB: ['bare', '#8a9a8c', 4], bareC: ['bare', '#a8a08a', 5], bareD: ['bare', '#7d8a94', 6],
  plainA: ['plain', '#9aa48e', 5, { k: 1 }], plainB: ['plain', '#3f5560', 6, { k: 2, door: '#2f3f48' }], plainC: ['plain', '#b88a6a', 7, { k: 3 }],
  pics1: ['pics', '#7a3f34', 11, { k: 0 }], pics2: ['pics', '#33454a', 12, { k: 1 }], pics3: ['pics', '#a8935c', 13, { k: 2 }],
  books: ['books', '#3d4a44', 32, { wood: '#2a2a22' }], kitchen: ['kitchen', '#a8a08a', 21], shed: ['shed', '#6e5a42', 41],
};
const BACK_NAMES = Object.keys(BACKS);

// ---- the one thing in a room, 2.4 ft in: 128 px is 5 ft, the ceiling at the top --------------------------------------
const PM = {
  cello(g) {                                                        // a cello on its stand, and a music stand beside it
    line(g, [[70, 26], [70, 80]], '#3a2418', 4); disc(g, 70, 24, 4, '#3a2418'); ell(g, 70, 86, 13, 12, '#9a5a30'); ell(g, 70, 108, 17, 16, '#9a5a30'); rect(g, 68, 62, 4, 52, '#2a1c14');
    for (const k of [-1, 1]) line(g, [[70 + k * 7, 96], [70 + k * 8, 104]], '#2a1c14', 1.4); line(g, [[70, 122], [70, 128]], '#3a3a3c', 1.6);
    line(g, [[28, 128], [28, 84]], '#3a3a3c', 2); poly(g, [[14, 86], [42, 86], [40, 66], [16, 66]], '#3a3a3c'); rect(g, 19, 69, 18, 14, CREAM);
  },
  hangplants(g, r) { for (const [x, L] of [[24, 34], [66, 52], [104, 26]]) { line(g, [[x, 0], [x - 7, L]], '#b8a888', 1); line(g, [[x, 0], [x + 7, L]], '#b8a888', 1); line(g, [[x, 0], [x, L]], '#b8a888', 1); potAt(g, x, L + 10, 16, 10, pickOf(r, ['#a8603c', '#c9bfa8'])); foliage(g, x, L + 1, r, 7, 16); for (const dx of [-6, 0, 6]) vine(g, x + dx, L + 6, 18 + r() * 34, r); } },
  bikeHang(g) { for (const x of [34, 94]) { line(g, [[x, 0], [x, 30]], '#3a3a3c', 2); disc(g, x, 56, 25, null, '#1c1c1c', 3.5); disc(g, x, 56, 21.5, null, '#8a8c90', 1); for (let a = 0; a < TAU; a += TAU / 9) line(g, [[x, 56], [x + Math.cos(a) * 22, 56 + Math.sin(a) * 22]], 'rgba(160,165,170,.7)', 0.7); } const c = '#3f6a5a'; line(g, [[34, 56], [60, 58], [50, 84], [34, 56]], c, 3.4); line(g, [[60, 58], [86, 82], [50, 84]], c, 3.4); line(g, [[86, 82], [94, 56]], c, 3.4); line(g, [[82, 94], [92, 92]], '#1c1c1c', 3.4); rrect(g, 42, 86, 16, 5, 2, '#3a2a1c'); },
  mobile(g, r) { line(g, [[64, 0], [64, 14]], '#b8a888', 1); line(g, [[20, 20], [108, 14]], '#5a4636', 1.6); const P = [[20, 20, 30, 8, '#c8683a'], [42, 18, 52, 5, '#9ac8dc'], [64, 17, 22, 12, '#e0b04a'], [88, 15, 46, 7, '#7f9a60'], [108, 14, 28, 6, '#b88ab8']]; for (const [x, y, L, R, c] of P) { line(g, [[x, y], [x, y + L]], '#b8a888', 0.8); disc(g, x, y + L + R, R, c); } g.beginPath(); g.ellipse(88, 68, 12, 3, -0.3, 0, TAU); g.strokeStyle = CREAM; g.lineWidth = 1.2; g.stroke(); },
};
const MID_NAMES = Object.keys(PM);

// ---- curtains and blinds, just behind the glass: 80 x 128 px is 4.4 x 7.2 ft about the pane -----------------------
function drape(g, col, tied) {
  g.save(); g.beginPath();
  if (tied) { g.moveTo(0, 5); g.lineTo(38, 5); g.quadraticCurveTo(34, 60, 9, 82); g.quadraticCurveTo(18, 104, 20, 128); g.lineTo(0, 128); }
  else { g.moveTo(0, 5); g.lineTo(27, 5); g.quadraticCurveTo(25, 70, 15, 128); g.lineTo(0, 128); }
  g.closePath(); g.clip(); folds(g, 0, 5, 40, 123, col, 4); g.restore();
  if (tied) rect(g, 3, 80, 12, 3.5, '#c9a45c');
}
const rod = g => { rect(g, 0, 3, 80, 2.4, '#3a3028'); };
const closed = col => g => { folds(g, 3, 4, 74, 124, col, 8); rod(g); };
const PC = {
  drapes1(g) { drape(g, '#a8503a'); g.save(); g.translate(80, 0); g.scale(-1, 1); drape(g, '#a8503a'); g.restore(); rod(g); },
  drapes2(g) { drape(g, '#7f9077'); g.save(); g.translate(80, 0); g.scale(-1, 1); drape(g, '#7f9077'); g.restore(); rod(g); },
  drapes3(g) { drape(g, '#c9a03c'); g.save(); g.translate(80, 0); g.scale(-1, 1); drape(g, '#c9a03c'); g.restore(); rod(g); },
  tied(g) { drape(g, '#b87a6a', true); rod(g); },
  sheer(g) { folds(g, 3, 5, 74, 123, '#dcd8cc', 9, 0.4); rod(g); },
  cafe(g) { rect(g, 4, 63, 72, 2, '#b08d4a'); rect(g, 5, 66, 70, 62, '#d8d0bc'); for (let x = 5; x < 75; x += 7) rect(g, x, 66, 3.5, 62, 'rgba(184,69,46,.5)'); for (let y = 66; y < 128; y += 7) rect(g, 5, y, 70, 3.5, 'rgba(184,69,46,.5)'); for (let x = 5; x < 75; x += 14) { const gr = g.createLinearGradient(x, 0, x + 14, 0); gr.addColorStop(0, 'rgba(0,0,0,.2)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.2)'); g.fillStyle = gr; g.fillRect(x, 66, 14, 62); } },
  venetian(g) { for (let y = 5; y < 96; y += 5) { rect(g, 4, y, 72, 2.7, '#cfc8b8'); rect(g, 4, y + 2.7, 72, 0.7, 'rgba(0,0,0,.35)'); } for (const x of [18, 62]) rect(g, x, 3, 0.8, 94, '#8a8478'); rect(g, 4, 96, 72, 3, '#b8b0a0'); },
  closedA: closed('#d6c096'), closedB: closed('#a8604a'), closedC: closed('#7f9077'), closedD: closed('#5e6f80'),
  shutters(g) { for (const x of [3, 61]) { rrect(g, x, 4, 16, 122, 1, '#6f8068'); for (let y = 8; y < 122; y += 4.5) { rect(g, x + 2, y, 12, 2.6, '#8a9a80'); rect(g, x + 2, y + 2.6, 12, 0.8, 'rgba(0,0,0,.3)'); } rect(g, x + 7.4, 4, 1.2, 122, '#5a6a54'); } },
};
const CUR_NAMES = Object.keys(PC);
const HIDES = new Set(['closedA', 'closedB', 'closedC', 'closedD']);      // nothing of the room shows past these

// ---- roller blinds: not painted but drawn in the shader, a real panel that rolls up and down -------------------
// A blind is a cloth on a roller just behind the glass, with a wooden bar along its foot and a cord with a ring
// to pull it by. Where it is is one number a window (how far down, 0 to 1), kept here and eased from one place
// to the next at about the speed a hand pulls a blind, so nothing snaps. name: [cloth, how far down by day]
// (the names are the ones the curtains list draws, so the street's habits stay as they were)
const BLINDS = { roller: ['#d6cdb4', 0.42], rollerLow: ['#cfc4a6', 0.68], rollerDown: ['#d6cdb4', 0.96], rollerGrey: ['#a9aca2', 0.96] };
const CLOTHS = ['#d6cdb4', '#cfc4a6', '#b59a6a', '#c8b89a', '#9aa88e', '#d8d2c4'];      // linen, oatmeal, a brown holland, a faded green
// What a blind is doing at this hour. Somebody home lets it down a little after the lamp goes on and runs it up
// when they get up; the afternoon sun on the south-facing fronts brings some of them half down; an empty room's
// blind stays where it was left.
function blindWants(p, hour, lamps) {
  const b = p.bl; let to = b.day;
  if (b.sun && hour > b.sun[0] && hour < b.sun[1]) to = Math.max(to, 0.66);
  if (p.th < 9 && (hour >= 12 ? lamps > Math.min(0.96, p.th + b.lag) : hour < p.wake)) to = b.eve;
  return to;
}

// ---- ceilings: 128 x 104 px is 8 x 6.5 ft, the window wall at the top ---------------------------------------------------
const CEILS = [
  (g, w, h) => { fill(g, w, h, '#d2cbbc'); for (const [R, c] of [[17, 'rgba(0,0,0,.1)'], [15, '#d8d2c4'], [10, 'rgba(0,0,0,.08)'], [8, '#d8d2c4'], [3.4, 'rgba(0,0,0,.16)']]) disc(g, w / 2, h * 0.45, R, c); g.strokeStyle = 'rgba(0,0,0,.1)'; g.lineWidth = 3; g.strokeRect(2.5, 2.5, w - 5, h - 5); },
  (g, w, h) => { fill(g, w, h, '#cfc7b6'); for (const x of [14, 46, 82, 114]) { rect(g, x - 4, 0, 8, h, '#5a4636'); rect(g, x + 4, 0, 2.2, h, 'rgba(0,0,0,.2)'); } },
  (g, w, h) => { fill(g, w, h, '#c4c6c0'); for (let y = 0; y < h; y += 13) for (let x = 0; x < w; x += 12.8) { rect(g, x + 1, y + 1, 10.8, 11, 'rgba(255,255,255,.12)'); rect(g, x + 3, y + 3, 6.8, 7, 'rgba(0,0,0,.1)'); disc(g, x + 6.4, y + 6.5, 1.7, 'rgba(255,255,255,.16)'); } },
];

// The whole sheet. Colours are stored as they are painted (alpha premultiplied on upload, undone in the shader).
function paintAtlas() {
  const c = document.createElement('canvas'); c.width = AW; c.height = AH; const g = c.getContext('2d');
  const cell = (x, y, w, h, draw) => { g.save(); g.translate(x, y); g.beginPath(); g.rect(0, 0, w, h); g.clip(); try { draw(); } catch (e) { console.warn('flats: a painting failed', e); } g.restore(); };
  BACK_NAMES.forEach((n, i) => { const [kind, wall, seed, o = {}] = BACKS[n]; cell((i % 10) * BW, Math.floor(i / 10) * BH, BW, BH, () => { wallBase(g, BW, BH, wall, kind !== 'books' && kind !== 'shed'); PB[kind](g, BW, BH, rnd(seed * 131 + 7), o); }); });
  MID_NAMES.forEach((n, i) => cell((i % 16) * MW, MID_Y + Math.floor(i / 16) * MW, MW, MW, () => PM[n](g, rnd(i * 53 + 11))));
  CUR_NAMES.forEach((n, i) => cell(i * CW, CUR_Y, CW, CH, () => PC[n](g, rnd(i * 17 + 3))));
  CEILS.forEach((f, i) => cell(CEIL_X, i * CEIL_H, 128, CEIL_H, () => f(g, 128, CEIL_H)));
  cell(...WAVER, () => { bot(g, 64, 86, 31, '#cfcabc', { lookY: 1, belly: 'rgba(255,255,255,.14)' }); g.lineCap = 'round'; line(g, [[36, 96], [26, 122], [44, 126]], '#cfcabc', 7); });
  cell(...ARM, () => { g.lineCap = 'round'; line(g, [[32, 58], [32, 24]], '#cfcabc', 7); disc(g, 32, 16, 8.5, '#cfcabc'); disc(g, 23, 20, 3.6, '#cfcabc'); });
  return c;
}

// =====================================================================================================================
// THE STREET'S FLATS: who lives over which shop
// =====================================================================================================================
// Floors count up from the first over the shop (0); bays along the street from the east end (0), as town.js lays
// them. A floor or bay a building does not have is taken as its nearest.
// SPECIAL: the one window of a building with something to notice. back: far wall; mid: the thing in the room;
// cur: curtains; lamp: globe, lantern, shade, bulb (pendants), read (a reading lamp), tv.
const SPECIAL = {
  books: { f: 0, b: 1, back: 'books', lamp: 'read', late: 1 },                        // a wall of books and a reading lamp, on late
  bikes: { f: 1, b: 2, back: 'bareC', mid: 'bikeHang', lamp: 'bulb' },                // a bicycle hung up out of the way
  grocery: { f: 0, b: 0, back: 'kitchen', cur: 'cafe', lamp: 'shade' },               // a kitchen: plates, a rail of pans
  plants: { f: 0, b: 2, back: 'bareB', mid: 'hangplants', lamp: 'lantern' },          // three hanging plants
  records: { f: 1, b: 2, back: 'plainB', mid: 'cello', cur: 'drapes3', lamp: 'shade', late: 1 },   // a cello
  museum: { f: 1, b: 1, back: 'bareA', mid: 'mobile', lamp: 'globe' },                // a mobile
};
// OUTSIDE: what is built outside the glass. box: a planted window box; open: a sash left up, a curtain breathing out.
const OUTSIDE = {
  coffee: { f: 0, b: 1, box: ['herbs', 'marigold'] },
  yoga: { f: 1, b: 0, box: ['lavender', 'catmint'] },
  bakery: { f: 0, b: 1, box: ['strawberry', 'marigold'] },
  apothecary: { f: 1, b: 2, open: 'curtain', cloth: '#d8cfc0' },
};
const EMPTY = new Set(['cinema']);                                   // a false front: blinds down, nobody home
const LIT = 0.36;                                                    // how many windows of a building have somebody in, of an evening
// what a quiet window wears, and how often
const CURTAINS = [['closedA', 3], ['closedB', 2], ['closedC', 2], ['closedD', 1], ['roller', 4], ['rollerLow', 3], ['rollerDown', 2], ['venetian', 2], ['drapes1', 1], ['drapes2', 1], ['drapes3', 1], ['sheer', 3], ['tied', 1], ['shutters', 1], [null, 2]];
const SHUT = [['rollerDown', 4], ['rollerGrey', 4], ['rollerLow', 1], ['venetian', 1]];
const QUIET_BACKS = ['bareA', 'bareB', 'bareC', 'bareD', 'bareA', 'bareC', 'plainA', 'plainC', 'pics1', 'pics2', 'pics3'];
const QUIET_LAMPS = ['globe', 'shade', 'shade', 'bulb', 'lantern'];
const TEMPS = [[1.0, 0.6, 0.28], [1.0, 0.68, 0.36], [1.0, 0.76, 0.46], [1.0, 0.76, 0.46], [1.0, 0.84, 0.6], [1.0, 0.9, 0.76]];      // candle amber to soft white
const pickW = (r, a) => { let t = r() * a.reduce((s, e) => s + e[1], 0); for (const e of a) if ((t -= e[1]) < 0) return e[0]; return a[0][0]; };
// lamp: [centre x (from the room's middle), y (down from the ceiling), z, how tightly it lights, radii x y z, cord, colour, how much it fills the room]
const LAMPS = {
  globe: [0, 1.5, 2.9, 1, 0.42, 0.42, 0.42, 1, [1.0, 0.76, 0.46], 0.42],
  lantern: [0, 1.6, 2.9, 0.8, 0.8, 0.74, 0.8, 1, [1.0, 0.8, 0.56], 0.5],
  shade: [0, 1.55, 2.9, 1, 0.72, 0.36, 0.72, 1, [1.0, 0.7, 0.38], 0.36],
  bulb: [0, 1.3, 2.9, 0.9, 0.17, 0.22, 0.17, 1, [1.0, 0.84, 0.6], 0.5],
  read: [2.3, 3.7, 3.6, 3.2, 0.42, 0.36, 0.42, 0, [1.0, 0.7, 0.38], 0.07],
  tv: [-0.5, 5.6, 5.6, 0.5, 0, 0, 0, 0, [0.5, 0.68, 1.0], 0.2],
};
const lin = c => (c /= 255, c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const hexLin = hex => { const n = parseInt(hex.slice(1), 16); return [lin((n >> 16) & 255), lin((n >> 8) & 255), lin(n & 255)]; };

// Who lives behind each window. Worked out once; buildFlats and flatsLife both read it.
let PLAN = null;
function plan(town) {
  if (PLAN && PLAN.town === town) return PLAN;
  const r = rnd(2026), list = [], byLot = {};
  town.upWindows.forEach((w, id) => { const p = { id, w, o: {}, mid: null, open: 0, off: (r() - 0.5) * 3, flip: r() < 0.5 ? -1 : 1, phase: r() * 6.28, ceil: Math.floor(r() * 3) }; list.push(p); (byLot[w.lot] ??= []).push(p); });
  for (const [id, ps] of Object.entries(byLot)) {
    // floors and bays from where the panes actually are
    const uniq = (f, dir) => [...new Set(ps.map(p => Math.round(f(p.w) * 20)))].sort((a, b) => dir * (a - b));
    const ys = uniq(w => w.y, 1), zs = uniq(w => w.z, -1), nf = ys.length, nb = zs.length, empty = EMPTY.has(id);
    for (const p of ps) { p.floor = ys.indexOf(Math.round(p.w.y * 20)); p.bay = zs.indexOf(Math.round(p.w.z * 20)); }
    const at = t => t && ps.find(p => p.floor === Math.min(t.f, nf - 1) && p.bay === Math.min(t.b, nb - 1));
    // a floor is mostly one household: one taste in curtains, one colour of wall, one kind of bulb
    const habit = ys.map(() => [pickW(r, empty ? SHUT : CURTAINS), pickOf(r, QUIET_BACKS), pickOf(r, QUIET_LAMPS), pickOf(r, TEMPS)]);
    for (const p of ps) {
      const h = habit[p.floor];
      p.cur = r() < 0.4 ? pickW(r, empty ? SHUT : CURTAINS) : h[0]; p.back = r() < 0.3 ? pickOf(r, QUIET_BACKS) : h[1]; p.lamp = h[2]; p.temp = r() < 0.3 ? pickOf(r, TEMPS) : h[3];
    }
    const sp = empty ? null : at(SPECIAL[id]), out = empty ? null : at(OUTSIDE[id]);
    if (sp) { const t = SPECIAL[id]; Object.assign(sp, { back: t.back, mid: t.mid ?? null, cur: t.cur ?? null, lamp: t.lamp, special: true, late: !!t.late, off: sp.off * 0.3 }); }
    if (out && out !== sp) { out.o = OUTSIDE[id]; if (out.o.open) { out.cur = 'sheer'; out.open = 2.2 + r() * 0.5; } }
    // who is in tonight: the particular window, then enough of the others, taken at random
    const rest = ps.filter(p => p !== sp).map(p => [r() + (p.open ? -1 : 0), p]).sort((a, b) => a[0] - b[0]).map(e => e[1]);
    const home = empty ? [] : [...(sp ? [sp] : []), ...rest].slice(0, Math.ceil(ps.length * LIT));
    if (id === 'records') { const tv = home.find(p => !p.special && p.floor === nf - 1) ?? home.find(p => !p.special); if (tv) { tv.lamp = 'tv'; tv.cur = 'venetian'; tv.late = true; } }      // one television on the street
    for (const p of ps) {
      const up = home.includes(p);
      p.th = !up ? 9 : p.special ? 0.04 + r() * 0.12 : 0.05 + r() * 0.5;                // where in the dusk the lamp goes on (9: never)
      p.bed = !up ? 0 : p.late ? 25.2 + r() * 2 : 22.4 + r() * 3.2; p.wake = 5.7 + r() * 1.6;
      p.waves = up && !HIDES.has(p.cur);
    }
  }
  // The roller blinds come out of the curtains list as names; here each becomes a blind with its own habits
  // (its own numbers, so the street's other choices above are drawn exactly as they were).
  const rb = rnd(5150);
  for (const p of list) {
    const k = BLINDS[p.cur]; if (!k) continue;
    const day = Math.min(0.97, Math.max(0.12, k[1] + (rb() - 0.5) * 0.2)), home = p.th < 9;
    p.bl = { col: rb() < 0.6 ? k[0] : pickOf(rb, CLOTHS), day, eve: home && rb() < 0.75 ? 0.86 + rb() * 0.12 : day, lag: 0.06 + rb() * 0.2,
      sun: p.w.side > 0 && rb() < 0.35 ? [12.8 + rb() * 1.5, 16.6 + rb() * 1.2] : null };
    p.cur = null;
  }
  list.town = town; PLAN = list; return list;
}

// ---- the backs of the buildings (backs.js lists their windows in K.backs.wins) ----------------------------------------------
// The same rooms behind the glass, chosen from the letter backs.js gives each window: d nobody in (dark), b a blind and
// sometimes somebody behind it, c curtains drawn and a lamp on, k the kitchen, f the light over a back door, shed the
// allotment shed. The ground-floor ones are in reach: each has a blind, rolled up where the room is dark.
function planBacks(wins, n0) {
  const r = rnd(808), out = [];
  wins.forEach((w, i) => {
    const p = { id: n0 + i, w, o: {}, mid: null, open: 0, off: (r() - 0.5) * 2.4, flip: r() < 0.5 ? -1 : 1, phase: r() * 6.28, ceil: Math.floor(r() * 3), isBack: true,
      back: pickOf(r, QUIET_BACKS), cur: null, lamp: pickOf(r, QUIET_LAMPS), temp: pickOf(r, TEMPS), th: 9, wake: 5.7 + r() * 1.6, bed: 0 };
    const lit = (th, late = 0) => { p.th = th; p.bed = 22.2 + r() * 2.8 + late; };
    const blind = (day, eve) => { p.bl = { col: r() < 0.55 ? '#d6cdb4' : pickOf(r, CLOTHS), day, eve: eve ?? day, lag: 0.06 + r() * 0.2, sun: null }; };
    if (w.kind === 'b') { if (r() < 0.6) lit(0.08 + r() * 0.4); blind(0.25 + r() * 0.3, 0.84 + r() * 0.12); }
    else if (w.kind === 'c') { lit(0.05 + r() * 0.4); p.cur = pickOf(r, ['closedA', 'closedB', 'closedC', 'closedD']); }
    else if (w.kind === 'k') { lit(0.03 + r() * 0.15, -0.6); p.back = 'kitchen'; p.lamp = 'shade'; p.cur = r() < 0.5 ? 'cafe' : null; }
    else if (w.kind === 'f') { p.back = pickOf(r, ['plainA', 'plainC', 'bareA']); p.lamp = 'bulb'; p.off *= 0.3; if (r() < 0.55) lit(0.1 + r() * 0.4, 1); }
    else if (w.kind === 'shed') { p.back = 'shed'; p.lamp = 'bulb'; p.off = 0; }
    else if (!w.reach) { if (r() < 0.3) p.cur = 'sheer'; else if (r() < 0.45) blind(0.3 + r() * 0.35); }
    if (w.reach && !p.bl) blind(0.1 + r() * 0.06, p.th < 9 ? 0.9 : undefined);
    out.push(p);
  });
  return out;
}

// ---- outside the glass ------------------------------------------------------------------------------------------------------
const BOXES = ['c#3f5a4a/0.8', 'c#8a4a34/0.85', 'c#4a4640/0.8', 'c#34405a/0.8', 'c#b8653f/0.92', 'c#d8cdb4/0.8'];
const SCALE = { marigold: 0.8, herbs: 0.62, lavender: 0.5, catmint: 0.46, strawberry: 0.85, cosmos: 0.38, fern: 0.44, wildflowers: 0.42, tomato: 0.42, coneflower: 0.44, hosta: 0.62, grass: 0.4, wisteria: 0.34 };
const IRONP = 'c#24231f/0.5';
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
  for (const p of P) {
    const w = p.w, o = p.o, s = w.side, u0 = Math.abs(w.x) - 0.36, h0 = w.y - w.h / 2, h1 = w.y + w.h / 2, z = w.z, hw = w.w / 2, lot = town.lots?.[w.lot];
    const TRIM = lot?.trim ?? 'c#e8dfcc/0.7', paint = /^c#[0-9a-f]{6}\/[\d.]+$/i.test(TRIM) ? TRIM : 'c#e8dfcc/0.7';
    const X = u => s * u, bx = (mat, ua, ub, ya, yb, za, zb) => K.box(mat, X(ua), X(ub), ya, yb, za, zb);
    const plant = (kind, u, zz, y, k = 1) => K.F.add(kind, X(u), zz, (SCALE[kind] ?? 0.4) * k, { y });

    // a glazing bar down each sash of the plain linteled fronts; and a sash pushed up where the window is open
    if (lot?.head === 'lintel') { bx(paint, u0 + 0.17, u0 + 0.27, w.y + 0.07, h1 - 0.12, z - 0.035, z + 0.035); if (!p.open) bx(paint, u0 + 0.19, u0 + 0.29, h0 + 0.12, w.y - 0.07, z - 0.035, z + 0.035); }
    if (p.open) bx(paint, u0 + 0.15, u0 + 0.31, h0 + p.open - 0.13, h0 + p.open, z - hw, z + hw);

    if (o.box) {                                                    // a window box on two brackets, properly planted
      const c = BOXES[p.id % BOXES.length], bw = hw + 0.15;
      bx(c, u0 - 0.92, u0 - 0.2, h0 - 0.82, h0 - 0.06, z - bw, z + bw); bx('c#2e2219/1', u0 - 0.86, u0 - 0.26, h0 - 0.06, h0 - 0.035, z - bw + 0.06, z + bw - 0.06);
      for (const dz of [-bw * 0.7, bw * 0.7]) { bx(IRONP, u0 - 0.8, u0, h0 - 0.9, h0 - 0.82, z + dz - 0.04, z + dz + 0.04); bx(IRONP, u0 - 0.07, u0, h0 - 1.5, h0 - 0.82, z + dz - 0.04, z + dz + 0.04); K.tube(IRONP, [X(u0 - 0.75), h0 - 0.88, z + dz], [X(u0 - 0.03), h0 - 1.48, z + dz], 0.03, 4); }
      for (let i = 0; i < 8; i++) plant(o.box[i % o.box.length], u0 - 0.56 + (r() - 0.5) * 0.3, z - bw + 0.3 + i * (2 * bw - 0.6) / 7 + (r() - 0.5) * 0.2, h0 - 0.12, 0.85 + r() * 0.4);
    }
    if (o.open === 'curtain') {                                     // a curtain breathing out over the sill
      const yT = h0 + p.open - 0.1, yB = h0 - 0.5 - r() * 0.3, c = o.cloth ?? '#d8cfc0', ph = p.phase;
      const zc = z + p.flip * 0.75, base = new THREE.Color(c), tmp = new THREE.Color();
      sheet(8, 8, (u, v) => { const rip = Math.sin(u * TAU * 3 + ph) * 0.06 * (0.3 + v); return [X(u0 + 0.27 - 0.72 * Math.pow(v, 1.2) - rip), yT - (yT - yB) * v, zc + (u - 0.5) * (1.7 - 0.35 * v), tmp.copy(base).multiplyScalar(1.15 + 0.3 * Math.sin(u * TAU * 3 + ph + 1.2)), -s * 0.5 * v * v, 0.14 * v * v, (u - 0.3) * 0.3 * v * v, ph + u * 1.3]; });
    }
  }
}

// =====================================================================================================================
// THE SHADERS
// =====================================================================================================================
const VERT_HEAD = /* glsl */`
attribute vec4 aCell; attribute vec4 aTint; attribute vec4 aLampP; attribute vec4 aLampR; attribute vec4 aLamp; attribute vec4 aTime; attribute vec4 aMisc;
attribute vec4 aSash; attribute vec4 aSashC; attribute vec4 aBlind;
uniform vec4 uClock; uniform vec4 uWave;
varying vec3 vfDir; varying vec2 vfP; varying vec4 vfCell; varying vec4 vfTint; varying vec4 vfLampP; varying vec4 vfLampR; varying vec4 vfLamp; varying vec4 vfState; varying float vfId; varying float vfHH;
varying float vfHW; varying vec4 vfSash; varying vec4 vfSashC; varying vec4 vfBlind;
`;
const VERT_BODY = /* glsl */`
{
  vec3 flW = (modelMatrix * vec4(position, 1.0)).xyz - cameraPosition;
  float flS = -normal.x;
  vfDir = vec3(flS * flW.z, flW.y, flS * flW.x);
  vfP = uv; vfHH = aMisc.y; vfHW = aMisc.w; vfSash = aSash; vfSashC = aSashC; vfBlind = aBlind;                                          // uv is the corner in feet from the middle of the pane
  // is anybody up?  aTime: switching-on point, bedtime, waking hour, the window's number
  float flH = uClock.w < 12.0 ? uClock.w + 24.0 : uClock.w;
  float flUp = max(step(flH, aTime.y), uClock.w < 12.0 ? step(aTime.z, uClock.w) : 0.0);
  float flL = smoothstep(aTime.x, aTime.x + 0.06, uClock.y) * flUp;
  float flWv = abs(uWave.x - aTime.w) < 0.5 ? uWave.y : 0.0;
  float flT = floor(uClock.x * 4.0), flF = fract(uClock.x * 4.0);
  float flA = fract(sin((flT + aTime.w * 7.0) * 12.9898) * 43758.5453), flB = fract(sin((flT + 1.0 + aTime.w * 7.0) * 12.9898) * 43758.5453);
  float flick = aMisc.z > 0.5 ? 0.5 + 0.5 * mix(flA, flB, flF * flF) : 1.0;
  vfState = vec4(max(flL, flWv), aMisc.x, flWv, flick);
  vfCell = aCell;
  vfTint = aTint; vfLampP = aLampP; vfLampR = aLampR; vfLamp = aLamp; vfId = aTime.w;
}
`;
const FRAG_HEAD = /* glsl */`
uniform sampler2D uAtlas; uniform vec4 uClock;
varying vec3 vfDir; varying vec2 vfP; varying vec4 vfCell; varying vec4 vfTint; varying vec4 vfLampP; varying vec4 vfLampR; varying vec4 vfLamp; varying vec4 vfState; varying float vfId; varying float vfHH;
varying float vfHW; varying vec4 vfSash; varying vec4 vfSashC; varying vec4 vfBlind;
// how much of a pixel a bar covers: d the distance from its middle, w half its width, a the pixel's size
float flBar(float d, float w, float a) { return 1.0 - smoothstep(w - a, w + a, abs(d)); }
// a sash window's timber, at p on the plane of one sash (the upper: up > 0, the lower: up < 0; 0: a fixed light):
// the box frame round it, the sash's stiles and rails, and the glazing bars of the pattern k
// (1 one over one, 2 two over two, 6 six over six, 4 four lights (the shed), 3 three lights over a door)
float flSashWood(vec2 p, float hw, float hh, float k, float up, float a) {
  float e = min(hw - abs(p.x), min(hh - p.y, p.y + hh));
  float c = 1.0 - smoothstep(0.1 - a, 0.1 + a, e);                                    // the box frame
  if (k > 3.5 && k < 4.5) {                                                           // a casement of four lights
    c = max(c, 1.0 - smoothstep(0.22 - a, 0.22 + a, e)); c = max(c, max(flBar(p.x, 0.035, a), flBar(p.y, 0.035, a)));
  } else if (k > 2.5 && k < 3.5) {
    c = max(c, max(flBar(p.x - hw / 3.0, 0.035, a), flBar(p.x + hw / 3.0, 0.035, a)));
  } else if (up != 0.0) {                                                             // one sash of a pair, meeting in the middle
    float iw = hw - 0.24;
    c = max(c, 1.0 - smoothstep(0.24 - a, 0.24 + a, hw - abs(p.x)));                  // stiles
    float g0, g1;
    if (up > 0.0) { c = max(c, 1.0 - smoothstep(0.25 - a, 0.25 + a, hh - p.y)); c = max(c, 1.0 - smoothstep(0.06 - a, 0.06 + a, p.y)); g0 = 0.06; g1 = hh - 0.25; }
    else { c = max(c, 1.0 - smoothstep(0.32 - a, 0.32 + a, p.y + hh)); c = max(c, 1.0 - smoothstep(0.07 - a, 0.07 + a, -p.y)); g0 = -hh + 0.32; g1 = -0.07; }
    if (k > 1.5) c = max(c, k > 5.5 ? max(flBar(p.x - iw / 3.0, 0.03, a), flBar(p.x + iw / 3.0, 0.03, a)) : flBar(p.x, 0.03, a));
    if (k > 5.5) c = max(c, flBar(p.y - (g0 + g1) * 0.5, 0.03, a));
  }
  return c;
}
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
float flGlass = 1.0; vec3 flDiff = vec3(0.0);
{
  vec3 d = normalize(vfDir); d.z = max(d.z, 0.03); d = normalize(d);
  vec2 P = vfP; float hw = vfHW, hh = vfHH, ap = max(fwidth(vfP.x), fwidth(vfP.y)) * 0.75;
  // A back window is let into the wall (the quad lies on the wall's face): the ray meets the brick of the reveal, or the
  // sash at the back of it, before the glass. The fronts' sashes are real timber (town.js); these are drawn here, which
  // costs nothing a window and shows the same from any side.
  float wood = 0.0, rev = 0.0; vec3 revAlb = vec3(0.0);
  if (vfSash.x > 0.0) {
    vec2 qs = P + d.xy / d.z * vfSash.x;
    if (abs(qs.x) > hw || abs(qs.y) > hh) {
      float txr = abs(d.x) < 1e-5 ? 1e9 : (sign(d.x) * hw - P.x) / d.x, tyr = abs(d.y) < 1e-5 ? 1e9 : (sign(d.y) * hh - P.y) / d.y;
      vec3 rp = vec3(P, 0.0) + d * min(txr, tyr);
      if (vfSashC.w > 0.5) revAlb = vfSashC.rgb * 0.7;                                  // lined with boards (the shed)
      else if (txr < tyr) {                                                              // a jamb: courses of brick, in the shade of the opening
        float c = floor(rp.y / 0.25), m = fract(rp.y / 0.25);
        revAlb = mix(vec3(0.34, 0.31, 0.27), vec3(0.25, 0.13, 0.09) * (0.8 + 0.4 * fract(sin(c * 17.3 + vfId) * 437.5)), smoothstep(0.0, 0.12, m) * (1.0 - smoothstep(0.86, 0.98, m))) * 0.7;
      } else revAlb = d.y < 0.0 ? vec3(0.36, 0.34, 0.3) : vec3(0.06, 0.04, 0.03);       // the stone sill running in; the soffit under the lintel
      rev = 1.0;
    } else P = qs;
  }
  if (vfSash.y > 0.5 && rev < 0.5) {
    float k = vfSash.y;
    if (k > 2.5 && k < 4.5) wood = flSashWood(P, hw, hh, k, 0.0, ap);
    else if (P.y >= 0.0) wood = flSashWood(P, hw, hh, k, 1.0, ap);                    // the upper sash, on the outer track
    else { vec2 p2 = P + d.xy / d.z * 0.07; wood = flSashWood(p2, hw, hh, k, -1.0, ap); P = p2; }      // the lower, an inch behind it
  }
  vec3 O = vec3(P, 0.0); vec4 cell = floor(vfCell + 0.5);
  float off = vfTint.w, x0 = off - FL_RW * 0.5, x1 = off + FL_RW * 0.5;
  float tz = FL_RD / d.z;
  float tx = abs(d.x) < 1e-5 ? 1e9 : ((d.x > 0.0 ? x1 : x0) - P.x) / d.x;
  float ty = abs(d.y) < 1e-5 ? 1e9 : ((d.y > 0.0 ? FL_Y1 : FL_Y0) - P.y) / d.y;
  float t = min(tz, min(tx, ty));
  vec3 q = O + d * t;
  float ftpp = max(fwidth(vfP.x), fwidth(vfP.y)) * 1.2, L = vfState.x * vfState.w;
  float lodB = clamp(log2(ftpp * 24.0), 0.0, 3.0);
  vec3 alb; float screen = 0.0;
  if (t == tz) {
    alb = flTex(vec2(mod(cell.x, 10.0), floor(cell.x / 10.0)) * vec2(FL_BW, FL_BH), vec2(FL_BW, FL_BH), vec2((q.x - x0) / FL_RW, (FL_Y1 - q.y) / 7.0), lodB).rgb;
    screen = flGlow(alb); if (q.y < FL_Y1 - 7.0) alb *= 0.55;
  } else if (t == ty) {
    if (d.y > 0.0) { vec4 c = flTex(vec2(FL_CEILX, cell.w * FL_CEILH), vec2(128.0, FL_CEILH), vec2((q.x - x0) / FL_RW, q.z / FL_RD), clamp(lodB - 0.6, 0.0, 3.0)); alb = c.rgb * mix(vec3(1.0), vfTint.rgb * 2.2, 0.16); }
    else alb = vec3(0.3, 0.19, 0.11) * (0.8 + 0.2 * step(0.5, fract(q.x * 1.6)));
  } else {
    float yy = FL_Y1 - q.y; alb = vfTint.rgb * (0.86 + 0.34 * step(yy, 0.2) + 0.3 * step(0.95, yy) * step(yy, 1.07));
    alb *= 1.0 - 0.3 * step(1.5, yy) * step(yy, 4.4) * step(2.2, q.z) * step(q.z, 4.6) * (1.0 - step(0.12, min(min(yy - 1.5, 4.4 - yy), min(q.z - 2.2, 4.6 - q.z))));
  }
  vec3 col = alb * flLight(q) + alb * screen * (0.1 + 1.5 * L);

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
    vec2 qw = P + d.xy / d.z * 0.45; float hb = qw.y + vfHH + (1.0 - vfState.z) * 3.3;
    vec3 tint = 0.62 + 0.38 * cos(vfId * 2.4 + vec3(0.0, 2.1, 4.2)); vec3 wl = flSheet(0.3) * 1.5;
    vec2 uv = vec2(qw.x / 3.4 + 0.5, 1.0 - hb / 3.4); vec4 b = flTex(FL_WAVER.xy, FL_WAVER.zw, uv, 0.0); b.a *= flIn(uv);
    float gl = flGlow(b.rgb); col = mix(col, b.rgb * mix(tint, vec3(1.0), gl) * (wl + gl * 1.2), b.a);
    float an = 0.25 + 0.5 * sin(uClock.x * 8.0), ca = cos(an), sa = sin(an); vec2 rel = vec2(qw.x - 0.76, hb - 1.25); rel = vec2(ca * rel.x - sa * rel.y, sa * rel.x + ca * rel.y);
    uv = vec2(rel.x / 1.7 + 0.5, 1.0 - (rel.y / 1.7 + 0.094)); vec4 ar = flTex(FL_ARM.xy, FL_ARM.zw, uv, 0.0); ar.a *= flIn(uv) * step(-vfHH, qw.y);
    col = mix(col, ar.rgb * tint * wl, ar.a);
  }
  if (vfBlind.x >= 0.0) {                                          // the roller blind, an inch or two behind the glass
    vec2 qb = P + d.xy / d.z * 0.14; float a = ftpp * 0.6, bw = hw - 0.05, top = hh + 0.04, rh = 0.15;
    float yb = top - rh - vfBlind.x * (2.0 * hh - rh - 0.02);                     // the foot of the cloth
    float inX = 1.0 - smoothstep(bw - a, bw + a, abs(qb.x));
    float roll = inX * smoothstep(top - rh - a, top - rh + a, qb.y);
    float cl = inX * smoothstep(yb - a, yb + a, qb.y) * (1.0 - smoothstep(top - rh - a, top - rh + a, qb.y));
    float bar = (1.0 - smoothstep(bw + 0.02 - a, bw + 0.02 + a, abs(qb.x))) * smoothstep(yb - 0.07 - a, yb - 0.07 + a, qb.y) * (1.0 - smoothstep(yb - a, yb + a, qb.y));
    float cy = yb - 0.07, cw = max(0.012, a);
    float cord = clamp(0.012 / cw, 0.0, 1.0) * flBar(qb.x, cw, a) * step(cy - 0.5, qb.y) * step(qb.y, cy);
    float acorn = 1.0 - smoothstep(0.045 - a, 0.045 + a, length((qb - vec2(0.0, cy - 0.55)) * vec2(1.0, 0.7)));
    vec3 cloth = vfBlind.yzw * (1.0 + 0.06 * clamp(1.0 - ftpp * 25.0, 0.0, 1.0) * sin(qb.y * 160.0 + sin(qb.x * 9.0)))
      * (1.0 - 0.2 * smoothstep(0.3, 0.0, qb.y - yb)) * (1.0 - 0.25 * smoothstep(bw - 0.12, bw, abs(qb.x)));
    col = mix(col, cloth * flSheet(0.75), cl);                        // the lamp behind comes through the cloth
    col = mix(col, vfBlind.yzw * 0.7 * flSheet(0.1) * (0.7 + 0.3 * smoothstep(top, top - rh, qb.y)), roll);
    col = mix(col, vec3(0.3, 0.2, 0.12) * flSheet(0.05), max(bar, max(cord, acorn)));
  }
  // the glass: none where the sash is pushed up, two panes of it where the sashes overlap
  flGlass = P.y < vfState.y ? 0.0 : (P.y < 0.0 && vfState.y > -3.0 ? 1.5 : 1.0);
  // the timber and the brick are lit as the wall is, by the street's own lights; only a little of the room's lamp on them
  float solid = max(wood, rev);
  col = mix(col, vfSashC.rgb * vfLamp.rgb * L * 0.05, solid);
  flDiff = (rev > 0.5 ? revAlb : vfSashC.rgb) * solid;
  flGlass *= 1.0 - solid;
  totalEmissiveRadiance = col * FL_GAIN * (1.0 - 0.1 * flGlass);
}
`;
// =====================================================================================================================
// ONCE THE SCENE EXISTS
// =====================================================================================================================
export function flatsLife(ctx, K) {
  const { scene, animated, day, camera } = ctx, town = K.town, P = plan(town), N = P.length;
  const ALL = [...P, ...planBacks(K.backs?.wins ?? [], N)], NA = ALL.length;      // the fronts (P) and then the backs, in one mesh
  if (!NA) return;
  const lampsOn = () => 1 - THREE.MathUtils.smoothstep(day.light, 0.42, 0.97);
  const uClock = { value: new THREE.Vector4(0, lampsOn(), day.light, day.hour ?? 18) }, uWave = { value: new THREE.Vector4(-9, 0, 0, 0) }, uT = { value: 0 };

  // ---- the sheet -------------------------------------------------------------------------------------------------
  const tex = new THREE.CanvasTexture(paintAtlas()); tex.colorSpace = THREE.NoColorSpace; tex.premultiplyAlpha = true; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.anisotropy = 1;
  // ?flatsatlas lays the sheet over the page, to look at it
  if (typeof location !== 'undefined' && /[?&]flatsatlas/.test(location.search)) { const c = tex.image; c.style.cssText = 'position:fixed;left:0;top:0;width:100%;z-index:99999;background:#456'; document.body.appendChild(c); }

  // ---- the panes: one quad a window ---------------------------------------------------------------------------
  const Y1 = PANE_H / 2 + CEIL_UP, Y0 = -PANE_H / 2 - SILL_DOWN;      // the room is the same height behind every pane, tall or short
  const A = { position: [new Float32Array(NA * 12), 3], normal: [new Float32Array(NA * 12), 3], uv: [new Float32Array(NA * 8), 2] };
  for (const n of ['aCell', 'aTint', 'aLampP', 'aLampR', 'aLamp', 'aTime', 'aMisc', 'aSash', 'aSashC', 'aBlind']) A[n] = [new Float32Array(NA * 16), 4];
  const idx = new Uint16Array(NA * 6), put4 = (n, i, a, b, c, d) => { const arr = A[n][0]; for (let k = 0; k < 4; k++) { const o = (i * 4 + k) * 4; arr[o] = a; arr[o + 1] = b; arr[o + 2] = c; arr[o + 3] = d; } };
  ALL.forEach((p, i) => {
    // nx: which way the glass faces (a front looks onto the street, a back away from it)
    const w = p.w, nx = w.nx ?? -w.side, CORN = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    CORN.forEach(([cx, cy], k) => { const v = i * 4 + k; A.position[0].set([w.x, w.y + cy * w.h / 2, w.z - nx * cx * w.w / 2], v * 3); A.normal[0].set([nx, 0, 0], v * 3); A.uv[0].set([cx * w.w / 2, cy * w.h / 2], v * 2); });
    idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
    const lamp = LAMPS[p.lamp] ?? LAMPS.globe, back = BACKS[p.back] ?? BACKS.bareA, tint = hexLin(back[1]), glow = p.lamp === 'tv' ? lamp[8] : p.temp ?? lamp[8];
    const lx = p.lamp === 'read' ? p.flip * lamp[0] : p.off + lamp[0];
    put4('aCell', i, Math.max(0, BACK_NAMES.indexOf(p.back)), p.mid ? MID_NAMES.indexOf(p.mid) : -1, p.cur ? CUR_NAMES.indexOf(p.cur) : -1, p.ceil ?? 0);
    put4('aTint', i, tint[0], tint[1], tint[2], p.off);
    put4('aLampP', i, lx, Y1 - lamp[1], lamp[2], lamp[3]);
    put4('aLampR', i, p.lamp === 'tv' ? 0 : lamp[4], lamp[5], lamp[6], lamp[7]);
    put4('aLamp', i, glow[0], glow[1], glow[2], lamp[9]);
    put4('aTime', i, p.th, p.bed, p.wake, p.id);
    put4('aMisc', i, p.open ? -w.h / 2 + p.open : -9, w.h / 2, p.lamp === 'tv' ? 1 : 0, w.w / 2);
    const fc = hexLin(w.frame ?? '#e0d8c4');
    put4('aSash', i, w.reveal ?? 0, w.bars ?? 0, 0, 0); put4('aSashC', i, fc[0], fc[1], fc[2], w.lined ? 1 : 0);
    if (p.bl) { const c = hexLin(p.bl.col); p.bl.rgb = c; p.bl.cur = p.bl.to = blindWants(p, day.hour ?? 18, lampsOn()); p.bl.i = i; put4('aBlind', i, p.bl.cur, c[0], c[1], c[2]); }
    else put4('aBlind', i, -1, 0, 0, 0);
  });
  const geo = new THREE.BufferGeometry();
  for (const [n, [arr, size]] of Object.entries(A)) geo.setAttribute(n, new THREE.BufferAttribute(arr, size));
  geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeBoundingSphere(); geo.computeBoundingBox();
  const f = n => Number(n).toFixed(4);
  const defs = `#define FL_RW ${f(RW)}\n#define FL_RD ${f(RD)}\n#define FL_Y1 ${f(Y1)}\n#define FL_Y0 ${f(Y0)}\n#define FL_MIDZ ${f(MIDZ)}\n#define FL_MID ${f(MID)}\n#define FL_AW ${f(AW)}\n#define FL_AH ${f(AH)}\n#define FL_BW ${f(BW)}\n#define FL_BH ${f(BH)}\n#define FL_CW ${f(CW)}\n#define FL_CH ${f(CH)}\n#define FL_MIDY ${f(MID_Y)}\n#define FL_CURY ${f(CUR_Y)}\n#define FL_CEILX ${f(CEIL_X)}\n#define FL_CEILH ${f(CEIL_H)}\n#define FL_WAVER vec4(${WAVER.map(f).join(', ')})\n#define FL_ARM vec4(${ARM.map(f).join(', ')})\n#define FL_GAIN 1.0\n`;
  const mat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.07, metalness: 0, envMapIntensity: 1.5 });
  mat.onBeforeCompile = sh => {
    sh.uniforms.uAtlas = { value: tex }; sh.uniforms.uClock = uClock; sh.uniforms.uWave = uWave;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + defs + VERT_HEAD).replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VERT_BODY);
    sh.fragmentShader = sh.fragmentShader.replace('#define HOUSE_LIGHT', '').replace('#include <common>', '#include <common>\n' + defs + FRAG_HEAD)
      .replace('#include <emissivemap_fragment>', FRAG_BODY)
      .replace('#include <lights_physical_fragment>', '#include <lights_physical_fragment>\nfloat flK = mix(0.14, 1.0, smoothstep(0.0, 0.55, uClock.z)); material.diffuseColor = flDiff; material.specularColor = vec3(0.13) * flK * min(flGlass, 1.0) * (0.7 + 0.3 * flGlass); material.specularF90 = flK * min(flGlass, 1.0);\n');
  };
  mat.customProgramCacheKey = () => 'flats-panes';
  const panes = new THREE.Mesh(geo, mat); panes.name = 'flats'; panes.userData.cat = 'flats'; panes.receiveShadow = true; scene.add(panes);

  // ---- the blinds: where each wants to be at this hour, and getting there at the pace of a hand on the cord -------------
  // A pull at one in reach holds until that window's own next change of mind (its lamp, its morning).
  const BL = ALL.filter(p => p.bl), aBlind = geo.attributes.aBlind;
  aBlind.setUsage(THREE.DynamicDrawUsage);
  const setDrop = (b, v) => { b.cur = v; for (let k = 0; k < 4; k++) aBlind.array[(b.i * 4 + k) * 4] = v; };
  const pull = (p, to, now, lag = 0) => { const b = p.bl; b.from = b.cur; b.to = to; b.t0 = now + lag; b.dur = 0.5 + Math.abs(to - b.cur) * p.w.h / 1.1; };
  let clockT = 0;
  const pulls = [];
  for (const p of BL) if (p.w.reach) {
    const b = p.bl, w = p.w;
    pulls.push({ p, x: w.x + w.nx * 0.6, y: w.y, z: w.z });
    ctx.interact?.push(pulls[pulls.length - 1].it = { x: w.x + w.nx * 0.6, y: w.y, z: w.z, reach: 6.5, size: Math.max(w.w, w.h) * 0.5, label: () => ((b.hold ?? b.to) > 0.5 ? 'raise the blind' : 'let the blind down'),
      act: () => { b.hold = (b.hold ?? b.to) > 0.5 ? 0.06 : 0.94; b.holdFor = blindWants(p, day.hour ?? 18, lampsOn()); pull(p, b.hold, clockT); } });
  }
  if (typeof window !== 'undefined') window.__blinds = { list: BL, pulls };      // (for looking at them from tools/drive.py)
  animated.push(t => {
    clockT = t; let moved = false;
    const hour = day.hour ?? 18, lamps = lampsOn();
    for (const p of BL) {
      const b = p.bl; let want = blindWants(p, hour, lamps);
      if (b.hold !== undefined && b.hold !== null) { if (want === b.holdFor) want = b.hold; else b.hold = null; }
      if (Math.abs(want - b.to) > 1e-4) pull(p, want, t, b.hold === null || b.hold === undefined ? Math.random() * 2.5 : 0);      // windows do not all move at once
      if (b.cur !== b.to) { const k = Math.min(1, Math.max(0, (t - b.t0) / b.dur)); setDrop(b, k >= 1 ? b.to : b.from + (b.to - b.from) * k * k * (3 - 2 * k)); moved = true; }
    }
    if (moved) aBlind.needsUpdate = true;
  });

  // ---- cloth: a curtain breathing out: one mesh, swayed in the vertex shader ---------------
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
  const dir = new THREE.Vector3(), last = new THREE.Vector3(1e9, 0, 0);
  let cand = -1, held = 0, waving = -1, waveT = 0, rest = 0;
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
      const p = P[i]; if (!p.waves || (p.bl && p.bl.cur > 0.7)) continue;
      const w = p.w, dx = w.x - cp.x, dy = w.y - cp.y, dz = w.z - cp.z;
      if (dx * w.side < 2 || dx * dx + dz * dz > 2500) continue;
      const dot = (dx * dir.x + dy * dir.y + dz * dir.z) / Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dot > bd) { bd = dot; best = i; }
    }
    if (best < 0 || best !== cand) { cand = best; held = 0; return; }
    held += dt;
    if (held > 3.5) { waving = P[best].id; waveT = 0; held = 0; cand = -1; try { ctx.flash?.('someone upstairs waves back'); } catch { /* no toast, no matter */ } }
  });
}