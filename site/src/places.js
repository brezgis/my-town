// The places that are not shops: the Landing, Pickle Alley and the picture garden behind the
// cinema, the Yard, and the Overlook. Laid out with the street's kit (world feet; z = -Y).

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FRONT, ROAD, CURB, SHOPTOP } from './town.js';
import { PAINT, GLOW } from './street/tools.js';
import { makeFlames } from './flame.js';
import { T, F, fill, grain, paper, board, slate, chalk, disc, rect, rrect, line, poly, para, glow, ICON, rnd, TAU } from './draw.js';
import { dressWindows, windowsLife } from './displays.js';

const IRON = PAINT.iron, WOOD = 'c#8a6a48/0.85', WOODD = 'c#5a4432/0.85', CREAM = 'c#ece4d0/0.75', GREEN = 'c#2f4a40/0.6';

// Travel between this street and Anna's House. Set `house` to the house's address (for example
// 'https://house.brezgis.com/site/') to open the line; the house should send people here with ?from=house,
// which sets them down at the airship stop (main.js).
export const TRANSIT = { house: null };

export function buildPlaces(K, town) {
  const kit = K.kit, P = K.P2, r = K.r;
  const sign = (X, Y, h, q, w, tall, draw, o = {}) => kit.sign(kit.fr(X, Y, 0, q), 0, 0, h, w, tall, draw, o);
  const post = (X, Y, h0, h1, rad = 0.12, mat = IRON) => K.cyl(mat, X, h0, h1, -Y, rad, rad, 8);
  const lantern = (X, Y, h, size = 0.3, col = 'e#ffb866/2.2') => { K.B.mesh(col, new THREE.SphereGeometry(size, 10, 8).scale(1, 1.25, 1).translate(X, h, -Y)); K.glowDots.push([X, h, -Y, size * 6]); };

  // ======================================================================================
  // THE LANDING: where the airship sets you down
  // ======================================================================================
  {
    // a flagged apron joining the two pavements round the end of the road
    P('pavers', -FRONT, FRONT, -58, -40, -0.6, CURB - 0.012); P('concrete', -FRONT, FRONT, -58.7, -58, -0.6, CURB);
    K.surface(-FRONT, FRONT, 40, 58.7, CURB);
    // the mooring mast: iron lattice, a ring at the top, a windsock, a ladder nobody has needed
    const mx = -19, my = -53;
    K.lathe(IRON, mx, CURB, -my, [[0.01, 0], [1.3, 0], [1.3, 0.3], [0.5, 0.7], [0.36, 3], [0.22, 20], [0.18, 34], [0.3, 34.2], [0.3, 34.6], [0.01, 34.8]], 10);
    K.put(IRON, new THREE.TorusGeometry(1.1, 0.09, 6, 20).translate(mx, CURB + 35.8, -my));
    for (let h = 2; h < 20; h += 1.3) K.tube(IRON, [mx - 0.5, CURB + h, -my - 0.45], [mx + 0.5, CURB + h, -my - 0.45], 0.035, 4);
    for (const dx of [-0.5, 0.5]) K.tube(IRON, [mx + dx, CURB + 1, -my - 0.45], [mx + dx, CURB + 20, -my - 0.45], 0.04, 4);
    K.windsock = { x: mx, y: CURB + 30, z: -my };
    lantern(mx, my, CURB + 34.2, 0.34, 'e#ffb866/2.2'); K.collide(mx - 1.3, mx + 1.3, -my - 1.3, -my + 1.3, 30);
    // the stop: a little shelter with a bench and the timetable
    const sx = 17.5, sy = -30;
    for (const [dx, dy] of [[-3, -5], [3, -5], [-3, 5], [3, 5]]) post(sx + dx, sy + dy, CURB, CURB + 8.4, 0.12, GREEN);
    P(GREEN, sx - 3.6, sx + 3.6, sy - 5.8, sy + 5.8, CURB + 8.4, CURB + 8.6); P('c#b98f7c/0.8', sx - 3.9, sx + 3.9, sy - 6.1, sy + 6.1, CURB + 8.6, CURB + 8.75);
    P('glass', sx + 2.95, sx + 3.0, sy - 5, sy + 5, CURB + 1, CURB + 8); K.collide(sx + 2.8, sx + 3.2, -(sy + 5), -(sy - 5), 8);
    K.bench(sx + 1.6, -sy, -Math.PI / 2, { y: CURB, w: 6, mat: 'c#7d8a72/0.8' }); K.seat(sx + 1.6, CURB + 1.4, -sy, Math.PI / 2, 'sit and wait for the airship');
    lantern(sx, sy, CURB + 8.0, 0.24, 'e#ffe2b4/1.7'); K.lamp(sx, CURB + 7.6, -sy, 0.8);
    sign(sx + 2.9, sy - 2.2, CURB + 5, 1, 2.6, 3.4, (g, w, h) => {
      paper(g, w, h, '#efe7d2'); rect(g, 0, 0, w, h * 0.17, '#2f4a40'); T(g, 'AIRSHIP', w / 2, h * 0.09, h * 0.09, '#efe7d2', { f: F.bebas, ls: 6 });
      T(g, 'LINE 6  ·  VESPER STREET', w / 2, h * 0.24, h * 0.05, '#2f4a40', { f: F.bebas, ls: 2 });
      const rows = [['arrives', 'at dusk'], ['departs', 'at dusk'], ['next one', 'shortly'], ['after that', 'also shortly'], ['fare', 'a nice thought']];
      rows.forEach(([a, b], i) => { const y = h * (0.36 + i * 0.1); T(g, a, w * 0.1, y, h * 0.052, '#2a1c13', { f: F.elite, a: 'left' }); T(g, b, w * 0.9, y, h * 0.052, '#2a1c13', { f: F.elite, a: 'right' }); line(g, [[w * 0.1, y + h * 0.04], [w * 0.9, y + h * 0.04]], 'rgba(42,28,19,.25)', 1); });
      T(g, 'Please do not feed the clouds.', w / 2, h * 0.92, h * 0.045, '#a8361f', { f: F.fraunces, it: 1, w: 600 });
    }, { cw: 300, ch: 392 });
    // Where the airship goes. The line to Anna's House is painted on the board already; when the two places
    // are joined, give TRANSIT.house an address and the board becomes a way of travelling (placesLife).
    sign(sx + 2.9, sy + 2.3, CURB + 5, 1, 2.6, 3.4, (g, w, h) => {
      paper(g, w, h, '#efe7d2'); rect(g, 0, 0, w, h * 0.17, '#a8361f'); T(g, 'DESTINATIONS', w / 2, h * 0.09, h * 0.075, '#efe7d2', { f: F.bebas, ls: 4 });
      [["Anna's House", 'the bungalow under the oaks', '#24382f'], ['Vesper Street', 'you are here', '#a8361f'], ['Elsewhere', 'by arrangement with the wind', '#5b4636']].forEach(([a, b, c], i) => { const y = h * (0.3 + i * 0.2); disc(g, w * 0.14, y, h * 0.028, c); T(g, a, w * 0.24, y - h * 0.02, h * 0.066, c, { f: F.playfair, w: 700, it: 1, a: 'left' }); T(g, b, w * 0.24, y + h * 0.045, h * 0.04, '#2a1c13', { f: F.elite, a: 'left' }); if (i < 2) line(g, [[w * 0.14, y + h * 0.04], [w * 0.14, y + h * 0.16]], '#2a1c13', 3); });
      T(g, 'Ring the bell and it comes.', w / 2, h * 0.92, h * 0.045, '#2a1c13', { f: F.fraunces, it: 1, w: 600 });
    }, { cw: 300, ch: 392 });
    K.put(PAINT.brass, new THREE.SphereGeometry(0.34, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6).translate(sx - 2.9, CURB + 6.6, -(sy + 4.9))); K.tube(IRON, [sx - 2.9, CURB + 8.4, -(sy + 4.9)], [sx - 2.9, CURB + 6.9, -(sy + 4.9)], 0.03, 4);
    K.transit = { x: sx - 2.9, y: CURB + 6.4, z: -(sy + 4.9), arrive: { x: sx - 1, y: CURB, z: -(sy), yaw: Math.PI / 2 } };
    // the town's sign, and a fingerpost
    const tx = -17.5, ty = -27;
    for (const dy of [-3.4, 3.4]) post(tx, ty + dy, CURB, CURB + 7.6, 0.16, WOODD);
    P(GREEN, tx - 0.12, tx + 0.12, ty - 4, ty + 4, CURB + 3.6, CURB + 7.8);
    K.collide(tx - 0.4, tx + 0.4, -(ty + 4), -(ty - 4), 7.8);
    const TOWN = (g, w, h) => { board(g, w, h, '#24382f', '#d2ae62', { inset: h * 0.05 }); ICON.sun(g, w / 2, h * 0.22, h * 0.26, '#e9b44c'); T(g, 'Vesper Street', w / 2, h * 0.5, h * 0.19, '#efe6cf', { f: F.playfair, w: 700, it: 1 });
      T(g, 'POP. 9 ROBOTS & YOU   ·   ELEV. CONSIDERABLE', w / 2, h * 0.7, h * 0.062, '#d2ae62', { f: F.bebas, ls: 2 }); T(g, 'evenings a speciality', w / 2, h * 0.84, h * 0.085, '#efe6cf', { f: F.caveat, w: 600 }); };
    sign(tx + 0.14, ty, CURB + 5.7, 3, 7.6, 4, TOWN, { cw: 760, ch: 400 }); sign(tx - 0.14, ty, CURB + 5.7, 1, 7.6, 4, TOWN, { cw: 760, ch: 400 });
    const fx = 13.4, fy = -11; post(fx, fy, CURB, CURB + 10.5, 0.13, CREAM); K.collide(fx - 0.3, fx + 0.3, -fy - 0.3, -fy + 0.3, 10);
    // boards point the way they say: west down the street, or east back to the airship; each reads right from both sides
    [['coffee', 'w'], ['records', 'w'], ['tinned fish, 150 ft', 'w'], ['the edge, 260 ft (mind it)', 'w'], ['the chapel', 'e'], ['the airship', 'e']].forEach(([name, dir], i) => {
      const h = CURB + 9.8 - i * 0.95, w = 4.6, yc = fy + (dir === 'e' ? -w / 2 - 0.1 : w / 2 + 0.1);
      P(CREAM, fx - 0.06, fx + 0.06, yc - w / 2, yc + w / 2, h - 0.36, h + 0.36);
      for (const [q, dx] of [[3, 0.07], [1, -0.07]]) { const right = (q === 3) === (dir === 'w'), txt = right ? `${name}  →` : `←  ${name}`;
        sign(fx + dx, yc, h, q, w, 0.72, (g, cw, ch) => { fill(g, cw, ch, '#ece4d0'); T(g, txt, cw / 2, ch * 0.54, ch * 0.5, '#24382f', { f: F.fraunces, w: 600, it: 1, max: cw * 0.94 }); }, { cw: 368, ch: 58 }); }
    });
    for (let i = 0; i < 9; i++) K.F.add(K.pick(['cosmos', 'lavender', 'catmint', 'grass']), -27 + (r() - 0.5) * 3, 27 + (r() - 0.5) * 9, 0.8 + r() * 0.3, { y: 0 });
  }

  // ======================================================================================
  // PICKLE ALLEY, and the picture garden behind the cinema
  // ======================================================================================
  {
    const gro = town.lots.grocery, cin = town.lots.cinema, a0 = 112, a1 = 120;
    P('pavers', FRONT, 60, a0, a1, -0.6, CURB - 0.012); K.surface(FRONT, 60, -a1, -a0, CURB);
    // the mural on the grocer's wall
    sign(40, a1 - 0.06, CURB + 6.4, 2, 24, 10, (g, w, h) => {
      const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#34405a'); sky.addColorStop(0.45, '#c9705a'); sky.addColorStop(0.75, '#f0b060'); sky.addColorStop(1, '#f6d58a'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
      disc(g, w * 0.5, h * 0.82, h * 0.34, '#fbe6a0');
      for (let i = 0; i < 7; i++) { g.fillStyle = `rgba(255,236,170,${0.12 - i * 0.012})`; g.beginPath(); g.moveTo(w * 0.5, h * 0.82); g.arc(w * 0.5, h * 0.82, w, Math.PI + i * 0.45 + 0.1, Math.PI + i * 0.45 + 0.3); g.fill(); }
      const rr = rnd(4); for (let x = 0; x < w; x += w / 14) { const bh = h * (0.16 + rr() * 0.22); rect(g, x, h - bh, w / 14 - 4, bh, '#2a2338'); for (let k = 0; k < 4; k++) if (rr() < 0.6) rect(g, x + 8 + (k % 2) * 22, h - bh + 12 + Math.floor(k / 2) * 26, 10, 14, '#f6d58a'); }
      g.save(); g.translate(w * 0.2, h * 0.3); g.rotate(-0.12); ICON.fish(g, 0, 0, h * 0.34, '#efe6cf', '#34405a'); g.restore();
      T(g, "IT'S ALWAYS GOLDEN HOUR", w * 0.56, h * 0.2, h * 0.14, '#fbf0d0', { f: F.shrikhand, shadow: '#2a2338' }); T(g, 'somewhere  (here)', w * 0.62, h * 0.38, h * 0.12, '#fbe6a0', { f: F.pacifico, shadow: '#2a2338' });
      grain(g, w, h, 0.07, 21);
    }, { cw: 1200, ch: 500, rough: 0.95 });
    // a lit arrow at the mouth of the alley
    sign(FRONT - 0.3, a0 + 0.5, CURB + 9.6, 1, 0.9, 3.2, (g, w, h) => { fill(g, w, h, '#16212d'); glow(g, '#ffd27a', 10, () => { T(g, 'PICTURES', w / 2, h * 0.5, w * 0.62, '#ffe6a8', { f: F.limelight, rot: Math.PI / 2 }); }); }, { cw: 72, ch: 256, glow: 1.1 });
    sign(FRONT - 2.2, a0 + 0.07, CURB + 7.2, 0, 3.4, 1.4, (g, w, h) => { fill(g, w, h, '#16212d'); g.strokeStyle = '#c9a45c'; g.lineWidth = 3; g.strokeRect(5, 5, w - 10, h - 10); glow(g, '#ffd27a', 8, () => { T(g, 'TONIGHT\'S PICTURE', w / 2, h * 0.32, h * 0.24, '#ffe6a8', { f: F.limelight }); T(g, 'round the back  →', w / 2, h * 0.7, h * 0.3, '#ffe6a8', { f: F.pacifico }); }); }, { cw: 340, ch: 140, glow: 1.0 });
    // barrels, crates, a broom: it is called Pickle Alley for a reason
    for (const [x, y, s] of [[28, a1 - 1.4, 1], [30.6, a1 - 1.3, 0.9], [29.2, a1 - 3.0, 0.8]]) { K.lathe(WOOD, x, CURB, -y, [[0.01, 0], [0.95, 0], [1.2, 1.4], [1.2, 2.2], [0.95, 3.5], [0.9, 3.5], [0.01, 3.4]], 14, s); for (const h of [0.6, 1.8, 3.0]) K.put(IRON, new THREE.TorusGeometry((h === 1.8 ? 1.21 : 1.08) * s, 0.04, 4, 18).rotateX(Math.PI / 2).translate(x, CURB + h * s, -y)); }
    K.collide(27, 31.8, -(a1), -(a1 - 4), 3.4);
    sign(29.3, a1 - 4.05, CURB + 2.0, 2, 1.6, 1.1, (g, w, h) => { paper(g, w, h, '#efe7d2'); T(g, 'PICKLES', w / 2, h * 0.25, h * 0.3, '#3f5f43', { f: F.abril }); T(g, 'honesty box. be honest.', w / 2, h * 0.6, h * 0.17, '#2a1c13', { f: F.caveat, w: 600 }); T(g, '(the box is also pickled)', w / 2, h * 0.82, h * 0.13, '#a8361f', { f: F.caveat, w: 600 }); }, { cw: 208, ch: 144 });
    for (let i = 0; i < 4; i++) K.strand([FRONT + 4 + i * 7, CURB + 11.5, -(a0 + 0.3)], [FRONT + 7.5 + i * 7, CURB + 11.5, -(a1 - 0.3)], 0.9, 6);
    lantern(FRONT + 16, a0 + 0.5, CURB + 9, 0.26); K.lamp(FRONT + 16, CURB + 8.6, -(a0 + 1.5), 0.9);

    // ---- the picture garden: an open-air cinema on the lawn behind the false front -------------------------
    const bx = cin.back, sc = { x: bx + 0.2, y0: 86.5, y1: 109.5, h0: CURB + 4.6, h1: CURB + 15.4 };       // the screen, on the back of the cinema
    P('c#17140f/0.9', bx, bx + 0.18, sc.y0 - 0.6, sc.y1 + 0.6, sc.h0 - 0.6, sc.h1 + 0.6);
    K.screen = sc;
    K.G.poly('lawn', [[bx, -84], [72, -84], [72, -112], [bx, -112]], {});
    // deck chairs and benches in rows, facing the screen
    const chair = (x, y, col) => {
      const z = -y; for (const dz of [-0.95, 0.95]) { K.tube(WOOD, [x + 1.5, 0, z + dz], [x - 1.4, 3.3, z + dz], 0.06, 4); K.tube(WOOD, [x - 1.3, 0, z + dz], [x + 0.6, 1.9, z + dz], 0.06, 4); }
      K.tube(WOOD, [x - 1.4, 3.3, z - 0.95], [x - 1.4, 3.3, z + 0.95], 0.06, 4); K.tube(WOOD, [x + 1.2, 0.5, z - 0.95], [x + 1.2, 0.5, z + 0.95], 0.06, 4);
      K.box(col, x - 0.05, x + 0.05, 0.5, 3.6, z - 0.9, z + 0.9, { rot: [0, 0, -0.76] });
      K.seat(x - 0.1, 1.5, z, Math.PI / 2 + 0.0, 'sit and watch the picture'); K.collide(x - 1.4, x + 1.5, z - 1, z + 1, 1.5);
    };
    const cols = ['c#b8452e/0.9', 'c#e9e0cc/0.9', 'c#34405a/0.9', 'c#c9952a/0.9', 'c#2f4a40/0.9'];
    for (let row = 0; row < 3; row++) for (let i = 0; i < 5; i++) { if (row === 1 && i === 2) continue; chair(bx + 15 + row * 6.5, 89.5 + i * 4.3 + (row % 2) * 1.6, cols[(row * 2 + i) % cols.length]); }
    // the projector on its stand at the back, and the popcorn
    const px = bx + 35, py = 98;
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.tube(WOODD, [px + dx * 1.3, 0, -(py + dy * 1.3)], [px + dx * 0.3, 5.2, -(py + dy * 0.3)], 0.07, 4);
    K.box('c#3a3a3e/0.5', px - 1.2, px + 1.0, 5.2, 6.6, -(py + 0.6), -(py - 0.6)); for (const [dx, h] of [[-0.4, 7.6], [0.5, 7.2]]) K.put('c#2a2a2e/0.5', new THREE.CylinderGeometry(0.85, 0.85, 0.2, 18).rotateX(Math.PI / 2).translate(px + dx, h, -(py + 0.75)));
    K.put('c#b9bcc0/0.3/1', new THREE.CylinderGeometry(0.22, 0.3, 0.7, 12).rotateZ(Math.PI / 2).translate(px - 1.5, 5.9, -py)); K.collide(px - 1.5, px + 1.5, -(py + 1.5), -(py - 1.5), 6.5);
    K.projector = { x: px - 1.8, y: 5.9, z: -py };
    const cx = bx + 6, cy = 110;
    K.box('c#b8452e/0.6', cx - 1.6, cx + 1.6, 0.6, 3.2, -(cy + 1.1), -(cy - 1.1), { collide: true }); for (const dx of [-1.2, 1.2]) K.put('c#1c1c1c/0.9', new THREE.TorusGeometry(0.75, 0.1, 6, 16).translate(cx + dx, 0.85, -(cy - 1.2)));
    K.box('glass', cx - 1.5, cx + 1.5, 3.2, 5.6, -(cy + 1.0), -(cy - 1.0)); K.box('c#e9c46a/0.9', cx - 1.4, cx + 1.4, 3.2, 4.3, -(cy + 0.9), -(cy - 0.9)); K.box('c#b8452e/0.6', cx - 1.7, cx + 1.7, 5.6, 5.9, -(cy + 1.2), -(cy - 1.2));
    lantern(cx, cy, 5.3, 0.16, 'e#ffe2b4/1.7'); K.lamp(cx, 5.2, -cy + 2, 0.7);
    kit.clerks.push({
      id: 'gus', name: 'Gus', lot: 'garden', floor: 0, reach: 20, look: { shape: 'tall', colour: '#7a2f2f', belly: '#efe4cf', trim: '#c9a45c', hat: 'cap', hatColour: '#7a2f2f', bowtie: '#c9a45c', eye: '#ffe9c0', ring: 0xffd9a0, hover: 3.3 },
      home: [cx + 4.5, -(cy - 3)], faces: [cx + 16, -(cy - 12)], posts: [[cx + 10, -(cy - 4)]],
      lines: {
        greet: ['*whispering* Sit anywhere. It has only just started. It has always only just started.', '*whispering* Welcome to the Lantern. Popcorn is by the wall. Shh.'],
        idle: ['*whispering* This is the good part.', '*straightens a deck chair by one degree*', '*whispering* I have seen it four thousand times. I still gasp.'],
        bye: ['*whispering* Mind the hedge on your way out.'],
        topics: [
          { q: '*whisper* What is showing?', a: '*whispering* The Longest Sunset. Four hours, no interval. The critics called it "long". They were not wrong, and they stayed.' },
          { q: '*whisper* Why is the cinema outside?', a: '*whispering* The front of the building was all we could afford. Then we noticed the sky was free.' },
          { q: '*whisper* How does it end?', a: '*whispering* I will not spoil it. But walk to the far end of the street, past the rail, to the last bench. That is all I will say.' },
          { q: 'IS THE POPCORN FREE?', a: '*whispering, pained* Yes. It is free. Please. People are watching a sunset.', expr: 'surprised' },
        ],
      },
    });
    sign(cx, cy - 1.12, 2.0, 2, 2.6, 1.3, (g, w, h) => { fill(g, w, h, '#b8452e'); g.strokeStyle = '#f6e6c0'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12); T(g, 'POPCORN', w / 2, h * 0.36, h * 0.36, '#f6e6c0', { f: F.limelight }); T(g, 'real butter · help yourself', w / 2, h * 0.74, h * 0.17, '#f6e6c0', { f: F.fraunces, it: 1, w: 600 }); }, { cw: 300, ch: 150 });
    // lights on poles round the lawn, a hedge of shrubs, the back way out
    const poles = [[bx + 12, 85.5], [bx + 36, 85.5], [bx + 36, 110.8], [bx + 12, 110.8]];
    for (const [x, y] of poles) { post(x, y, 0, 13, 0.11, WOODD); K.collide(x - 0.3, x + 0.3, -y - 0.3, -y + 0.3, 12); }
    for (let i = 0; i < 4; i++) { const a = poles[i], b = poles[(i + 1) % 4]; if (i !== 3) K.strand([a[0], 12.6, -a[1]], [b[0], 12.6, -b[1]], 1.8, 12); }
    for (let x = bx + 3; x < 72; x += 4.5) K.F.add(r() < 0.5 ? 'hydrangea' : 'shrub', x, -83 - r() * 1.5, 0.7 + r() * 0.3);
    for (let y = 86; y < 112; y += 4.5) K.F.add(r() < 0.6 ? 'shrub' : 'rose', 73 + r() * 1.5, -y, 0.7 + r() * 0.3);
    K.F.drift('wildflowers', bx + 44, -98, 5, 12, 26, 0.8); K.F.drift('grass', bx + 46, -98, 4, 12, 14, 0.9);
  }

  // ======================================================================================
  // THE YARD: gravel, an oak, a dumpling cart, somewhere to sit by a fire
  // ======================================================================================
  {
    const y0 = 78, y1 = 118, xb = -90;
    K.G.poly('gravel', [[-FRONT, -y0], [xb, -y0 - 2], [xb - 4, -y1 + 3], [-FRONT, -y1]], { y: CURB + 0.02 });
    P('concrete', xb - 6, -FRONT, y0 - 3, y1 + 1, -0.6, CURB - 0.02); K.surface(xb - 6, -FRONT, -(y1 + 1), -(y0 - 3), CURB);
    // the oak's ring bench
    const ox = -52, oy = 98;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU, b = ((i + 1) / 12) * TAU; for (const [rad, h] of [[4.3, 1.55], [5.0, 1.55], [5.7, 1.55]]) K.tube(WOOD, [ox + Math.cos(a) * rad, CURB + h, -oy + Math.sin(a) * rad], [ox + Math.cos(b) * rad, CURB + h, -oy + Math.sin(b) * rad], 0.16, 4); K.tube(WOODD, [ox + Math.cos(a) * 5.4, CURB, -oy + Math.sin(a) * 5.4], [ox + Math.cos(a) * 5.4, CURB + 1.5, -oy + Math.sin(a) * 5.4], 0.1, 4); }
    for (const a of [0.3, 1.9, 3.5, 5.1]) K.seat(ox + Math.cos(a) * 5.0, CURB + 1.55, -oy + Math.sin(a) * 5.0, Math.atan2(-Math.cos(a), -Math.sin(a)) + Math.PI, 'sit under the oak');
    K.collide(ox - 4.2, ox + 4.2, -oy - 4.2, -oy + 4.2, 1.6);
    for (const a of [0.9, 2.4, 4.3, 5.6]) lantern(ox + Math.cos(a) * 7, oy + Math.sin(a) * 7, CURB + 11 + Math.sin(a * 3), 0.28, 'e#ffb866/2.2');
    // the cart: a little caravan with a hatch, an awning and a chimney
    const cx = -38, cy = 86, CART = 'c#3f6a5a/0.5', CR = 'c#ece4d0/0.6';
    K.box(CART, cx - 5, cx + 5, CURB + 1.6, CURB + 8.6, -(cy + 2.6), -(cy - 2.6)); K.put(CART, new THREE.CylinderGeometry(2.6, 2.6, 10, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2).scale(1, 0.4, 1).translate(cx, CURB + 8.6, -cy));
    K.box(CR, cx - 5.05, cx + 5.05, CURB + 4.3, CURB + 4.5, -(cy + 2.65), -(cy - 2.65)); K.box('c#17140f/0.9', cx - 3.6, cx + 3.2, CURB + 4.5, CURB + 7.6, -(cy + 2.62), -(cy + 2.4));          // the hatch (faces +Y, into the yard)
    K.box(WOOD, cx - 3.9, cx + 3.5, CURB + 4.3, CURB + 4.5, -(cy + 3.6), -(cy + 2.5));                                                                                      // its counter
    for (let i = 0; i < 6; i++) K.box(i % 2 ? CR : 'c#c8402f/0.9', cx - 3.9 + i * 1.23, cx - 3.9 + (i + 1) * 1.23, CURB + 7.5, CURB + 7.56, -(cy + 5.2), -(cy + 2.6), { rot: [0.3, 0, 0] });
    for (const dx of [-3.9, 3.5]) K.tube(IRON, [cx + dx, CURB + 7.0, -(cy + 5.1)], [cx + dx, CURB + 4.5, -(cy + 2.7)], 0.03, 4);
    for (const dx of [-3.2, 3.2]) { K.put('c#1c1c1c/0.9', new THREE.TorusGeometry(1.0, 0.24, 8, 18).translate(cx + dx, CURB + 1.2, -(cy + 2.7))); K.put('c#1c1c1c/0.9', new THREE.TorusGeometry(1.0, 0.24, 8, 18).translate(cx + dx, CURB + 1.2, -(cy - 2.7))); }
    K.cyl('c#2b2724/0.5', cx + 3.6, CURB + 9, CURB + 12, -(cy - 1.2), 0.3, 0.3, 10); K.cyl('c#2b2724/0.5', cx + 3.6, CURB + 12, CURB + 12.3, -(cy - 1.2), 0.45, 0.2, 10);
    K.collide(cx - 5.2, cx + 5.2, -(cy + 3.7), -(cy - 2.8), 9);
    // bamboo steamers, stacked and steaming; bottles of sauce; a bell
    for (const [dx, n] of [[-3.0, 3], [-1.7, 4], [2.6, 2]]) for (let i = 0; i < n; i++) { K.cyl('c#c9a56a/0.8', cx + dx, CURB + 4.5 + i * 0.36, CURB + 4.5 + i * 0.36 + 0.33, -(cy + 3.05), 0.52, 0.52, 14); K.cyl('c#8a6a3a/0.8', cx + dx, CURB + 4.5 + i * 0.36 + 0.3, CURB + 4.5 + i * 0.36 + 0.36, -(cy + 3.05), 0.54, 0.54, 14); }
    K.steam = [[cx - 3.0, CURB + 5.7, -(cy + 3.05)], [cx - 1.7, CURB + 6.1, -(cy + 3.05)], [cx + 3.6, CURB + 12.4, -(cy - 1.2)]];
    for (let i = 0; i < 4; i++) K.cyl(K.pick(['c#3a2214/0.3', 'c#8a1c1c/0.3', 'c#17140f/0.3']), cx + 0.6 + i * 0.36, CURB + 4.5, CURB + 5.1, -(cy + 3.3), 0.1, 0.07, 8);
    lantern(cx - 4.4, cy + 5.0, CURB + 6.9, 0.36, 'e#ff7a5a/1.6'); lantern(cx + 4.0, cy + 5.0, CURB + 6.9, 0.36, 'e#ff7a5a/1.6'); K.lamp(cx, CURB + 6.6, -(cy + 4.2), 1.1);
    sign(cx, cy + 2.62, CURB + 8.05, 0, 6.6, 0.85, (g, w, h) => { fill(g, w, h, '#ece4d0'); T(g, 'GOOD FOLD DUMPLINGS', w / 2, h * 0.54, h * 0.66, '#c8402f', { f: F.archivo, ls: 3 }); }, { cw: 660, ch: 86 });
    sign(cx + 4.55, cy + 2.67, CURB + 5.3, 0, 0.9, 1.6, (g, w, h) => { slate(g, w, h); chalk(g, 'today', w / 2, h * 0.1, h * 0.11, '#e9c46a'); ['pork & chive', 'mushroom', 'the spicy one', 'soup (it is hot)', 'six for a smile'].forEach((s, i) => chalk(g, s, w / 2, h * (0.26 + i * 0.15), h * 0.085, i === 4 ? '#e8a8a0' : '#f1efe6')); }, { cw: 150, ch: 260, rough: 0.95 });
    kit.clerks.push({
      id: 'bao', name: 'Bao', lot: 'yard', floor: CURB, reach: 24, look: { shape: 'squat', colour: '#e9e2d2', belly: '#f6efe0', trim: '#c8402f', hat: 'toque', eye: '#ffd0a0', blush: true, ring: 0xffb07a, tool: 'ladle', hover: 5.75 },
      serve: { machine: [cx - 2.2, -(cy + 3.0)], pickup: { xz: [cx + 1.0, -(cy + 3.25)], y: CURB + 4.5 }, food: { 'six dumplings': { bites: 6, note: 'Six dumplings, gone. Eighteen pleats each. You counted none of them.', build: T3 => {
        const g = new T3.Group(), bamboo = new T3.MeshStandardMaterial({ color: 0xc9a56a, roughness: 0.85 }), dough = new T3.MeshStandardMaterial({ color: 0xf1e6cf, roughness: 0.6 });
        const tray = new T3.Mesh(new T3.CylinderGeometry(0.34, 0.34, 0.12, 18, 1, true), bamboo), base = new T3.Mesh(new T3.CylinderGeometry(0.33, 0.33, 0.02, 18), bamboo); base.position.y = -0.05; g.add(tray, base);
        for (let i = 0; i < 6; i++) { const a = i / 5 * 6.283, m = new T3.Mesh(new T3.SphereGeometry(0.09, 8, 6), dough); m.scale.set(1.25, 0.8, 0.8); m.position.set(i ? Math.cos(a) * 0.19 : 0, 0.0, i ? Math.sin(a) * 0.19 : 0); m.rotation.y = -a; g.add(m); }
        return g; } } } },
      home: [cx - 0.4, -(cy + 3.0)], faces: [cx - 0.4, -(cy + 14)], posts: [[cx - 2.2, -(cy + 3.0)], [cx + 1.6, -(cy + 3.0)]],
      lines: {
        greet: ['Hungry? You look hungry. Everyone looks hungry at this hour.', 'Dumplings! Six for a smile. Seven if it is a good one.', 'Sit, sit. The fire is going and the steam is free.'],
        idle: ['*lifts a lid, nods, puts it back*', 'Eighteen pleats. Not seventeen. I can tell.', 'The oak dropped an acorn in the soup once. Best batch I ever made.', '*hums something with a lot of steam in it*'],
        bye: ['Come back hungry!', 'Tell Juniper the buns are on me.'],
        topics: [
          { q: 'Six dumplings, please.', a: 'Six! Pork and chive. Give me a moment; the steam does the work, I take the credit.', serve: 'six dumplings' },
          { q: 'What is good today?', a: 'Pork and chive, if you want to be happy. Mushroom, if you want to be happy and a bit smug about it.' },
          { q: 'What is "the spicy one"?', a: 'It is the spicy one. I do not name it. Naming it only encourages it.', next: [{ q: 'I will risk it.', a: 'Brave. There is a fire pit behind you if you need to compare.' }, { q: 'Perhaps not.', a: 'Wise. It respects you more for that.' }] },
          { q: 'How do you fold them so fast?', a: 'Eighteen pleats, two hands, and I do not think about it. The moment you think about a dumpling, it knows.' },
          { q: 'Why is the noodle shop shut?', a: 'Night Noodle opens when the sun goes down. They have been wiping the same counter since lunch. I bring them dumplings. They are fine.' },
          { q: 'Does the sun ever set here?', a: 'They say it does, for people who have been everywhere and then sit down at the very edge. I have never had the time. Dumplings.' },
        ],
      },
    });
    // tables, the fire, strings of lights
    K.model('wooden_picnic_table', -64, -88, 0.3, { y: CURB, collide: true }); K.model('wooden_picnic_table', -76, -108, 1.4, { y: CURB, collide: true });
    for (const [x, z, yaw] of [[-64, -84.6, Math.PI], [-64, -91.4, 0], [-72.6, -108, Math.PI / 2], [-79.4, -108, -Math.PI / 2]]) K.seat(x, CURB + 1.5, z, yaw, 'sit at the table');
    const fx = -66, fy = 100;
    K.model('stone_fire_pit', fx, -fy, 0, { y: CURB + 0.02 }); K.collide(fx - 2.2, fx + 2.2, -fy - 2.2, -fy + 2.2, 1.3, CURB);
    K.fire = { x: fx, y: CURB + 0.5, z: -fy };
    for (const a of [0.4, 1.8, 3.4, 4.9]) { const sx = fx + Math.cos(a) * 5.2, sz = -fy + Math.sin(a) * 5.2; K.cyl(WOODD, sx, CURB, CURB + 1.4, sz, 0.75, 0.7, 10); K.cyl('c#c9a56a/0.9', sx, CURB + 1.4, CURB + 1.42, sz, 0.72, 0.72, 10); K.seat(sx, CURB + 1.4, sz, Math.atan2(sx - fx, sz + fy), 'sit by the fire'); K.collide(sx - 0.7, sx + 0.7, sz - 0.7, sz + 0.7, 1.4, CURB); }
    const ps = [[-27, 80], [-27, 116], [-58, 119], [-88, 112], [-88, 82], [-58, 77]];
    for (const [x, y] of ps) { post(x, y, CURB, CURB + 13, 0.11, WOODD); K.collide(x - 0.3, x + 0.3, -y - 0.3, -y + 0.3, 12); }
    for (const [i, j] of [[0, 5], [5, 4], [4, 3], [3, 2], [2, 1], [0, 2], [5, 2], [5, 3]]) K.strand([ps[i][0], CURB + 12.7, -ps[i][1]], [ps[j][0], CURB + 12.7, -ps[j][1]], 2.2, 14);
    // the notice board by the pavement: what is on, what is lost
    const nx = -26.2, ny = 114.2;
    for (const dy of [-2.6, 2.6]) post(nx, ny + dy, CURB, CURB + 7.4, 0.14, WOODD);
    P(WOODD, nx - 0.1, nx + 0.1, ny - 2.7, ny + 2.7, CURB + 2.6, CURB + 7); P('c#b98f6a/0.95', nx + 0.1, nx + 0.13, ny - 2.5, ny + 2.5, CURB + 2.8, CURB + 6.8); P(GREEN, nx - 0.5, nx + 0.5, ny - 3, ny + 3, CURB + 7, CURB + 7.2);
    K.collide(nx - 0.4, nx + 0.4, -(ny + 2.8), -(ny - 2.8), 7);
    const flyer = (dy, dz, w, h, rot, draw) => kit.sign(kit.fr(nx + 0.14, ny + dy, 0, 3), 0, 0, CURB + 4.8 + dz, w, h, (g, cw, ch) => { g.save(); draw(g, cw, ch); g.restore(); disc(g, cw / 2, ch * 0.05, 4, '#c8402f'); }, { cw: Math.round(w * 130), ch: Math.round(h * 130) });
    flyer(-1.6, 0.7, 1.4, 1.8, 0.04, (g, w, h) => { paper(g, w, h, '#f6e9a8'); T(g, 'LOST', w / 2, h * 0.16, h * 0.16, '#17140f', { f: F.archivo }); T(g, 'one sock', w / 2, h * 0.34, h * 0.11, '#17140f', { f: F.caveat, w: 600 }); para(g, 'Grey. Left foot (probably). Sentimental value: immense. Last seen near the laundrette that does not exist.', w * 0.1, h * 0.44, h * 0.062, '#2a1c13', w * 0.8, { f: F.elite }); T(g, 'ask for Otis', w / 2, h * 0.9, h * 0.08, '#a8361f', { f: F.caveat, w: 600 }); });
    flyer(0.1, 0.9, 1.5, 1.5, -0.05, (g, w, h) => { paper(g, w, h, '#f3c9b8'); T(g, 'ROBOT CHOIR', w / 2, h * 0.2, h * 0.15, '#34405a', { f: F.bebas, ls: 2 }); T(g, 'practice tuesdays', w / 2, h * 0.4, h * 0.11, '#34405a', { f: F.fraunces, it: 1, w: 600 }); para(g, 'All ranges welcome: beep, boop, and the one Juniper does. Under the oak. Bring a hum.', w * 0.1, h * 0.52, h * 0.068, '#2a1c13', w * 0.8, { f: F.elite }); });
    flyer(1.7, 0.6, 1.3, 1.9, 0.03, (g, w, h) => { paper(g, w, h, '#cfe0d2'); T(g, 'TINNED FISH', w / 2, h * 0.12, h * 0.1, '#24382f', { f: F.abril }); T(g, 'SWAP', w / 2, h * 0.25, h * 0.14, '#a8361f', { f: F.abril }); ICON.fish(g, w / 2, h * 0.45, w * 0.6, '#24382f'); para(g, 'Bring a tin, leave with a different tin. No pilchards (you know why).', w * 0.1, h * 0.6, h * 0.058, '#2a1c13', w * 0.8, { f: F.elite }); T(g, 'Salt & Larder, sundown', w / 2, h * 0.92, h * 0.06, '#24382f', { f: F.caveat, w: 600 }); });
    flyer(-1.5, -1.1, 1.6, 1.2, -0.03, (g, w, h) => { paper(g, w, h, '#efe7d2'); T(g, 'FOUND: a very good stick', w / 2, h * 0.2, h * 0.13, '#17140f', { f: F.caveat, w: 600 }); para(g, 'Enquire within the Yard. Proof of ownership required (describe the stick).', w * 0.08, h * 0.38, h * 0.085, '#2a1c13', w * 0.84, { f: F.elite }); });
    flyer(0.3, -0.9, 1.7, 1.4, 0.05, (g, w, h) => { paper(g, w, h, '#e9d9f0'); T(g, 'tonight at THE LANTERN', w / 2, h * 0.16, h * 0.1, '#4a2240', { f: F.limelight }); T(g, 'The Longest Sunset', w / 2, h * 0.4, h * 0.15, '#4a2240', { f: F.playfair, w: 700, it: 1 }); T(g, 'directed by the sun · 4 hrs · no interval', w / 2, h * 0.6, h * 0.07, '#2a1c13', { f: F.elite, max: w * 0.9 }); T(g, 'round the back of Pickle Alley', w / 2, h * 0.84, h * 0.085, '#a8361f', { f: F.caveat, w: 600 }); });
    flyer(1.9, -1.2, 1.1, 1.1, -0.06, (g, w, h) => { paper(g, w, h, '#f6e9a8'); T(g, 'you look', w / 2, h * 0.3, h * 0.17, '#17140f', { f: F.caveat, w: 600 }); T(g, 'nice today', w / 2, h * 0.52, h * 0.17, '#17140f', { f: F.caveat, w: 600 }); T(g, '(take one)', w / 2, h * 0.82, h * 0.1, '#a8361f', { f: F.caveat, w: 600 }); });
    K.hopscotch = { x: -17.6, z: -96, y: CURB + 0.012 };
    for (let i = 0; i < 14; i++) K.F.add(K.pick(['grass', 'wildflowers', 'cosmos', 'lavender']), xb - 1 + (r() - 0.5) * 5, -(y0 + r() * 40), 0.8 + r() * 0.4, { y: CURB });
  }

  // ======================================================================================
  // THE OVERLOOK: the end of the street, and the reason for it
  // ======================================================================================
  {
    const y0 = 198, y1 = 236, hw = 34;
    P('pavers', -hw, hw, y0, y1, -0.6, CURB - 0.012); P('concrete', -hw - 0.7, hw + 0.7, y1, y1 + 0.7, -0.6, CURB); P('concrete', -ROAD - 0.7, ROAD + 0.7, y0 - 0.7, y0, -0.6, CURB);
    for (const s of [-1, 1]) P('concrete', s * hw, s * (hw + 0.7), y0, y1 + 0.7, -0.6, CURB);
    K.surface(-hw - 0.7, hw + 0.7, -(y1 + 0.7), -(y0 - 0.7), CURB);
    // the rail: iron, with a brass handrail worn bright
    const rail = (xa, xb) => { for (let x = xa; x <= xb + 0.01; x += (xb - xa) / Math.round((xb - xa) / 6)) post(x, y1 - 0.4, CURB, CURB + 3.5, 0.09); K.tube(PAINT.brass, [xa, CURB + 3.5, -(y1 - 0.4)], [xb, CURB + 3.5, -(y1 - 0.4)], 0.09, 6); for (const h of [1.2, 2.3]) K.tube(IRON, [xa, CURB + h, -(y1 - 0.4)], [xb, CURB + h, -(y1 - 0.4)], 0.04, 4); K.collide(xa, xb, -(y1 - 0.2), -(y1 - 0.6), 3.6); };
    rail(-hw + 0.5, -4); rail(4, hw - 0.5);
    for (const [x, yaw] of [[-20, 0], [-10.5, 0], [10.5, 0], [20, 0]]) { K.bench(x, -(y1 - 5.5), Math.PI, { y: CURB, w: 6 }); K.seat(x, CURB + 1.4, -(y1 - 5.5), 0, 'sit and watch the sun not set'); }
    // the telescope, on a plinth
    K.cyl('concrete', 27, CURB, CURB + 1.2, -(y1 - 5), 1.5, 1.7, 14); K.model('st_telescope', 27, -(y1 - 5), 0.2, { y: CURB + 1.2, scale: 0.8 }); K.collide(25.4, 28.6, -(y1 - 3.4), -(y1 - 6.6), 4);
    K.scope = { x: 27, y: CURB + 5.4, z: -(y1 - 5) };
    // a plaque on a stone
    K.rock?.(PAINT.stone, -27, CURB + 0.6, -(y1 - 5), 1.8, 1.5, 1.3, 0.4);
    kit.sign(kit.fr(-27, y1 - 6.22, 0, 2), 0, 0, CURB + 1.5, 1.7, 1.1, (g, w, h) => { fill(g, w, h, '#5a4a2c'); grain(g, w, h, 0.1); g.strokeStyle = '#d9b96a'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12); T(g, 'ON THIS SPOT', w / 2, h * 0.2, h * 0.12, '#e9cf8a', { f: F.bebas, ls: 3 }); para(g, 'the sun has been about to set for as long as anyone can remember. Nobody has complained.', w * 0.1, h * 0.34, h * 0.105, '#e9cf8a', w * 0.8, { f: F.fraunces, it: 1, w: 600, a: 'left' }); }, { cw: 240, ch: 156, tilt: 0.5 });
    // planters at the corners, and the meadow running on to the edge with one last bench
    for (const [x, y] of [[-hw + 2.5, y0 + 2.5], [hw - 2.5, y0 + 2.5]]) { K.box('c#4a4640/0.8', x - 2, x + 2, CURB, CURB + 1.6, -(y + 2), -(y - 2), { collide: true }); for (let i = 0; i < 12; i++) K.F.add(K.pick(['lavender', 'catmint', 'cosmos', 'grass']), x + (r() - 0.5) * 3.2, -(y + (r() - 0.5) * 3.2), 0.7 + r() * 0.3, { y: CURB + 1.55 }); }
    K.G.ribbon('gravel', [[0, -(y1 + 0.5)], [1.5, -(y1 + 12)], [-1, -(y1 + 24)], [0.5, -(y1 + 36)]], 3.2, { wobble: 0.15 });
    K.bench(0.5, -(y1 + 39), Math.PI, { w: 5 }); K.seat(0.5, 1.4, -(y1 + 39), 0, 'sit at the edge of everything');
    K.F.drift('wildflowers', -16, -(y1 + 18), 14, 12, 50, 0.9); K.F.drift('wildflowers', 17, -(y1 + 20), 13, 13, 46, 0.9); K.F.drift('grass', 0, -(y1 + 26), 30, 14, 60, 1); K.F.drift('cosmos', 8, -(y1 + 10), 8, 5, 16, 0.9); K.F.drift('lavender', -9, -(y1 + 9), 7, 4, 14, 0.9);
  }

  // a little wildness behind the buildings and along the rim
  for (const [x, z, rx, rz, n, kind] of [[78, -40, 10, 26, 40, 'grass'], [80, -150, 10, 30, 44, 'grass'], [-84, -40, 10, 24, 40, 'grass'], [-86, -170, 10, 28, 44, 'grass'], [84, -70, 8, 14, 22, 'wildflowers'], [-92, -150, 8, 16, 24, 'wildflowers'], [70, -196, 9, 9, 20, 'wildflowers'], [-66, -206, 9, 9, 20, 'cosmos'], [0, 44, 30, 8, 40, 'grass'], [30, 20, 8, 8, 16, 'wildflowers'], [-34, 20, 8, 8, 16, 'cosmos']]) K.F.drift(kind, x, z, rx, rz, n, 0.9);

  dressWindows(K, town);
}

// ---- what moves ------------------------------------------------------------------------------------
export function placesLife(ctx, K) {
  const { scene, animated, day, camera } = ctx;
  windowsLife(ctx, K);
  const on = () => 1 - THREE.MathUtils.smoothstep(day.light, 0.42, 0.97);
  // The picture: intertitles on the screen behind the cinema, with a little weave and flicker
  if (K.screen) {
    const sc = K.screen, w = sc.y1 - sc.y0, h = sc.h1 - sc.h0, c = document.createElement('canvas'); c.width = 640; c.height = 300; const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); mesh.rotation.y = Math.PI / 2; mesh.position.set(sc.x + 0.02, (sc.h0 + sc.h1) / 2, -(sc.y0 + sc.y1) / 2); mesh.name = 'screen'; mesh.userData.cat = 'screen'; scene.add(mesh);
    const CARDS = [['THE LONGEST SUNSET', 'a picture in one reel'], ['Meanwhile, on Vesper Street . . .', ''], ['"Is it evening yet?"', ''], ['"Nearly."', ''], ['She ordered the cà phê sữa đá.', 'It was very good.'], ['The sun considered setting.', ''], ['It thought better of it.', ''], ['"Olive, what is for dinner?"', '"Sardines. It is always sardines."'], ['INTERMISSION', 'there is no intermission'], ['Somewhere a record ended.', 'Otis turned it over.'], ['The robots hummed.', 'Nobody minded.'], ['THE END', '(see you tomorrow, which is today)']];
    let last = -1, flick = 0; const rr = rnd(77);
    const draw = (i, t) => {
      const [a, b] = CARDS[i]; g.fillStyle = '#0c0b0a'; g.fillRect(0, 0, 640, 300); g.strokeStyle = 'rgba(240,230,200,.5)'; g.lineWidth = 2; g.strokeRect(22, 22, 596, 256); g.strokeRect(30, 30, 580, 240);
      T(g, a, 320, b ? 128 : 150, a.length > 26 ? 34 : 44, '#f1e8d0', { f: /THE|INTER/.test(a) ? F.limelight : F.playfair, w: /THE|INTER/.test(a) ? 'normal' : 700, it: !/THE|INTER/.test(a), max: 540 });
      if (b) T(g, b, 320, 190, 26, '#d9cdb0', { f: F.fraunces, it: 1, w: 600, max: 540 });
      for (let k = 0; k < 5; k++) { g.fillStyle = `rgba(255,255,255,${0.05 + rr() * 0.1})`; g.fillRect(rr() * 640, 0, 1, 300); } for (let k = 0; k < 8; k++) { g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(rr() * 640, rr() * 300, 2, 2); }
      tex.needsUpdate = true;
    };
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
    if (K.projector) { const p = K.projector, L = p.x - sc.x; cone.geometry.rotateY(Math.PI / 4); cone.geometry.translate(0, -0.5, 0); cone.geometry.rotateZ(-Math.PI / 2); cone.scale.set(L, h * 0.72, w * 0.72); cone.position.set(p.x, p.y, p.z); cone.rotation.z = -Math.atan2((sc.h0 + sc.h1) / 2 - p.y, L); cone.name = 'projector beam'; cone.renderOrder = 3; scene.add(cone); }
    animated.push((t, dt) => {
      if (Math.hypot(camera.position.x - sc.x - 20, camera.position.z + (sc.y0 + sc.y1) / 2) > 150) return;
      const i = Math.floor(t / 5.5) % CARDS.length; flick += dt;
      if (i !== last || flick > 0.12) { last = i; flick = 0; draw(i, t); }
      const k = 0.5 + 0.5 * on(); mat.color.setScalar(k * (0.92 + 0.08 * Math.sin(t * 31) * Math.sin(t * 7.3))); cone.material.opacity = 0.05 * k * (0.9 + 0.1 * Math.sin(t * 31));
    });
  }
  // The fire in the Yard
  if (K.fire) {
    const f = K.fire, lamp = { x: f.x, y: f.y + 1.6, z: f.z, power: 0, kind: 'fire' }; ctx.items.lamps.push(lamp);
    const hearth = new THREE.Group(); hearth.position.set(f.x, f.y, f.z); scene.add(hearth);
    const logMat = new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 1, emissive: 0x401000, emissiveIntensity: 0 });
    for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 2.0, 7), logMat); l.rotation.set(Math.PI / 2 - 0.35, (i / 4) * Math.PI * 2, 0); l.position.set(Math.cos(i * 1.57) * 0.3, 0.35, Math.sin(i * 1.57) * 0.3); hearth.add(l); }
    const uT = { value: 0 }, flames = makeFlames(THREE, mergeGeometries, uT, [0, 1, 2, 3].map(i => [(i / 4) * Math.PI + 0.2, 0, 0, 2.0 - (i % 2) * 0.3, 2.7 - (i % 2) * 0.5, i * 2.9]), 0.25); hearth.add(flames);
    let lit = true;
    ctx.interact.push({ x: f.x, y: f.y + 0.9, z: f.z, reach: 8, label: () => (lit ? 'let the fire die down' : 'light the fire'), act: () => { lit = !lit; } });
    ctx.sound.places.fire = { x: f.x, z: f.z, get lit() { return lit; } };
    animated.push(t => { lamp.power = lit ? 0.9 : 0; logMat.emissiveIntensity = lit ? 0.5 + 0.2 * Math.sin(t * 7) : 0; flames.visible = lit; uT.value = t; });
  }
  // Steam off the dumplings, and the cart's chimney: soft puffs, one draw
  if (K.steam?.length) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 1, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c), N = K.steam.length * 5, geo = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1));
    const aPos = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3), aS = new THREE.InstancedBufferAttribute(new Float32Array(N), 1), aA = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
    geo.setAttribute('aPos', aPos); geo.setAttribute('aScale', aS); geo.setAttribute('aAlpha', aA); geo.instanceCount = N;
    const puffs = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: { map: { value: tex } }, transparent: true, depthWrite: false,
      vertexShader: 'attribute vec3 aPos; attribute float aScale, aAlpha; varying vec2 vUv; varying float vA;\nvoid main() { vUv = uv; vA = aAlpha; vec4 mv = viewMatrix * vec4(aPos, 1.0); mv.xy += position.xy * aScale; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform sampler2D map; varying vec2 vUv; varying float vA;\nvoid main() { vec4 c = texture2D(map, vUv); gl_FragColor = vec4(c.rgb, c.a * vA);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}' }));
    puffs.frustumCulled = false; puffs.name = 'cart steam'; scene.add(puffs);
    animated.push(t => { let n = 0; for (const [x, y, z] of K.steam) for (let i = 0; i < 5; i++) { const u = (t * 0.22 + i / 5) % 1; aPos.setXYZ(n, x + 0.25 * Math.sin(t * 0.9 + i * 2) * u, y + u * 3.2, z + 0.2 * Math.cos(t * 0.8 + i) * u); aS.setX(n, 0.5 + u * 1.6); aA.setX(n, 0.5 * Math.sin(Math.PI * u)); n++; } aPos.needsUpdate = aS.needsUpdate = aA.needsUpdate = true; });
  }
  // Hopscotch, chalked on the pavement by somebody
  if (K.hopscotch) {
    const c = document.createElement('canvas'); c.width = 180; c.height = 516; const g = c.getContext('2d'), w = 180, h = 516, CH = 'rgba(241,239,230,.8)';
    g.strokeStyle = CH; g.lineWidth = 5; g.lineCap = 'round';
    [[0.5, 0.92], [0.5, 0.8], [0.27, 0.68], [0.73, 0.68], [0.5, 0.56], [0.27, 0.44], [0.73, 0.44], [0.5, 0.32], [0.5, 0.2]].forEach(([x, y], i) => { g.strokeRect(w * (x - 0.22), h * (y - 0.06), w * 0.44, h * 0.12); T(g, String(i + 1), w * x, h * y, h * 0.07, CH, { f: F.caveat, w: 600 }); });
    T(g, 'sky', w / 2, h * 0.07, h * 0.07, 'rgba(233,196,106,.9)', { f: F.caveat, w: 600 });
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 8.6).rotateX(-Math.PI / 2).rotateY(Math.PI / 2), new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    m.position.set(K.hopscotch.x, K.hopscotch.y, K.hopscotch.z); m.receiveShadow = true; m.name = 'hopscotch'; scene.add(m);
  }
  // The windsock on the mooring mast
  if (K.windsock) {
    const w = K.windsock, geo = new THREE.CylinderGeometry(0.75, 0.3, 5.5, 10, 6, true); geo.rotateZ(Math.PI / 2); geo.translate(-2.75, 0, 0);
    const col = new Float32Array(geo.attributes.position.count * 3); for (let i = 0; i < geo.attributes.position.count; i++) { const k = Math.floor((-geo.attributes.position.getX(i)) / 0.92) % 2; col.set(k ? [0.85, 0.82, 0.74] : [0.72, 0.2, 0.12], i * 3); } geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sock = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.9 })); sock.position.set(w.x, w.y, w.z); sock.name = 'windsock'; scene.add(sock);
    animated.push(t => { sock.rotation.y = -0.5 + 0.25 * Math.sin(t * 0.4) + 0.08 * Math.sin(t * 1.7); sock.rotation.z = 0.28 + 0.1 * Math.sin(t * 1.1); });
  }
  // The airship stop's bell. TRANSIT.house is where the line to Anna's House goes: null until the two are joined.
  if (K.transit) {
    const t = K.transit;
    ctx.interact.push({ x: t.x, y: t.y, z: t.z, reach: 8, size: 1.4, label: () => (TRANSIT.house ? "ring for the airship to Anna's House" : 'ring the bell for the airship'), act: () => {
      ctx.sound?.note?.(81, 0, 2.4, 0.2); ctx.sound?.note?.(88, 0.02, 2.0, 0.08);
      if (TRANSIT.house) { ctx.flash("The airship comes about. All aboard for Anna's House."); setTimeout(() => { location.href = TRANSIT.house + (TRANSIT.house.includes('?') ? '&' : '?') + 'from=town' + (ctx.hourMoved ? '&time=' + ctx.hourNow().toFixed(2) : ''); }, 2600); }
      else ctx.flash("The bell rings out over the clouds. The line to Anna's House is not running yet; soon.");
    } });
  }
  // The telescope: look through it, and the sun is very close
  if (K.scope) {
    const s = K.scope;
    ctx.interact.push({ x: s.x, y: s.y, z: s.z, reach: 8, size: 2, label: () => (ctx.zoomed ? 'step back from the telescope' : 'look through the telescope'), act: () => { ctx.zoom(!ctx.zoomed); if (ctx.zoomed) ctx.flash('the sun, very close. it is not moving. it is thinking about it.'); } });
    animated.push(() => { if (ctx.zoomed && Math.hypot(camera.position.x - s.x, camera.position.z - s.z) > 9) ctx.zoom(false); });
  }
}
