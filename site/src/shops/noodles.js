// Night Noodle  (south side, 21 ft wide by 24.7 deep: a narrow room)  "open late-ish"
// One long counter down the room, nine red stools on the left of it, the open kitchen on the right:
// two stock pots that have never boiled, the noodle boiler with its baskets, the wok, a hood with the
// menu hung on it as wooden tablets and the ladles and strainers under it. A pass along the counter
// with bowls waiting for hands, a ticket rail, the till and a cat that waves. Down the left wall: the
// note about the sun, HOW TO SLURP, the regulars' chopstick boxes, the house rules; on the back wall a
// slate that keeps count of how long the pot has been on, and the soup question. In the window the wax
// bowls on their stands, and somebody has drawn a face in the steam on the glass.
// Kombu is behind the counter, talking to the broth.
import * as THREE from 'three';
import { tools, fixtures, snapMat } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { T, F, fill, slate, chalk, paper, grain, disc, rect, rrect, line, poly, para, ICON, rnd, TAU } from '../draw.js';

const OAK = 'oak_light#a3825c', DARK = 'fir#3a2c24', BLACK = 'painted_wood#2a2320', REDW = 'painted_wood#a8361f', INDIGO = 'linen#26364f';
const STEEL = 'c#c9ccd0/0.3/1', CHROME = 'c#d4d6d8/0.12/1', IRON = 'c#2b2724/0.45/1', PORC = 'c#ebe6dc/0.18', LACQ = 'c#17140f/0.2', REDB = 'c#b8361f/0.2';
const NOOD = 'c#f3d96a/0.6', WHITE = 'c#f4f1ea/0.45', YOLK = 'c#c9952a/0.45', PORK = 'c#b08a5a/0.8', NORI = 'c#2f4a2a/0.8', GREEN = 'c#5d8a3a/0.8', LEAFY = 'c#4a6e38/0.8', CORN = 'c#e8c73a/0.45';
const BROTH = { shoyu: 'c#8a5a2a/0.2', miso: 'c#c9952a/0.2', tantan: 'c#e0782a/0.2' };
const INK = '#1d1b18', CREAM = '#f3e9d2', RED = '#b3261e';

// ---- the menu, in full (the counter cards and the case in the window) ---------------------------------------
const DISHES = [
  ['Shoyu ramen', '13', 'Chicken and pork-bone broth, fourteen hours at a bare simmer. Tare: two soy sauces, mirin, sake, kombu, dried shiitake. Chashu, a six-and-a-half-minute egg, menma, nori, narutomaki.'],
  ['Miso & corn', '14', 'Sapporo style. Red and white miso fried in the wok with garlic, ginger and lard. Sweet corn, bean sprouts, scallion, a pat of butter. The butter is not optional.'],
  ['Tantanmen  (the spicy one)', '14', 'Sesame paste and soy milk in the broth, our chilli oil with Sichuan pepper on top. Minced pork fried in sweet bean sauce, bok choy. Napkins are on your left.'],
  ['Cold sesame noodles', '11', 'Hiyashi. Chilled noodles, sesame and rice-vinegar dressing, cucumber, egg ribbons, scallion, crushed peanuts. For when the sun will not go down.'],
  ['Gyoza, six', '7', 'Pork, cabbage, garlic chives, ginger. Fried, then steamed under a lid: crisp one side, soft the other. Dip: soy, rice vinegar, chilli oil.'],
];
const MENU = (g, w, h) => {
  paper(g, w, h, CREAM, 21); g.strokeStyle = RED; g.lineWidth = Math.max(2, w * 0.008); g.strokeRect(w * 0.03, w * 0.03, w * 0.94, h - w * 0.06);
  ICON.bowl(g, w * 0.5, h * 0.052, h * 0.06, RED); T(g, 'NIGHT NOODLE', w / 2, h * 0.115, h * 0.05, INK, { f: F.abril, max: w * 0.84 });
  T(g, 'open late-ish · the pot has never been off', w / 2, h * 0.156, h * 0.027, RED, { f: F.caveat, w: 700, max: w * 0.86 });
  let y = h * 0.18;
  for (const [n, p, d] of DISHES) {
    T(g, n, w * 0.08, y + h * 0.017, h * 0.031, INK, { f: F.fraunces, w: 700, a: 'left', max: w * 0.72 }); T(g, p, w * 0.92, y + h * 0.017, h * 0.031, RED, { f: F.fraunces, w: 700, a: 'right' });
    y = para(g, d, w * 0.08, y + h * 0.036, h * 0.0205, '#3a2c24', w * 0.84, { lh: 1.2 }) + h * 0.01;
  }
  line(g, [[w * 0.08, y], [w * 0.92, y]], RED, 1.5); y += h * 0.024;
  for (const [n, p] of [['Barley tea (mugicha), hot or cold. Refills free', '2'], ['A small beer, in a tumbler', '4'], ['Extra egg · more noodles (kaedama)', '2']]) { T(g, n, w * 0.08, y, h * 0.024, INK, { f: F.fraunces, a: 'left', max: w * 0.76 }); T(g, p, w * 0.92, y, h * 0.026, RED, { f: F.fraunces, w: 700, a: 'right' }); y += h * 0.03; }
  T(g, 'slurping: free, and expected', w / 2, Math.min(h * 0.962, y + h * 0.008), h * 0.027, RED, { f: F.caveat, w: 700, max: w * 0.84 });
};
// a wooden tablet, the kind hung in a row over a kitchen
const wood = (g, w, h, c = '#c79a5e', seed = 3) => { fill(g, w, h, c); const r = rnd(seed); for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? '70,40,10' : '255,230,180'},${0.05 + r() * 0.1})`; g.lineWidth = 1 + r() * 2; const x = r() * w; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + (r() - 0.5) * 14, h * 0.3, x + (r() - 0.5) * 14, h * 0.7, x + (r() - 0.5) * 8, h); g.stroke(); } };
const TABLET = (name, sub, price, seed) => (g, w, h) => {
  wood(g, w, h, '#c79a5e', seed); g.strokeStyle = 'rgba(60,30,10,.55)'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4); disc(g, w / 2, h * 0.07, w * 0.035, '#3a2414');
  const ln = name.split('|'); ln.forEach((s, i) => T(g, s, w / 2, h * (ln.length > 1 ? 0.25 + i * 0.17 : 0.33), h * 0.15, INK, { f: F.shrikhand, max: w * 0.88 }));
  T(g, sub, w / 2, h * 0.62, h * 0.085, RED, { f: F.caveat, w: 700, max: w * 0.9 });
  disc(g, w / 2, h * 0.82, h * 0.105, RED); T(g, price, w / 2, h * 0.825, h * 0.11, CREAM, { f: F.abril });
};
const TAG = (txt, c = CREAM, ink = INK) => (g, w, h) => { paper(g, w, h, c); T(g, txt, w / 2, h / 2, h * 0.44, ink, { f: F.caveat, w: 700, max: w * 0.92 }); };
const TAG2 = (a, b, c = CREAM) => (g, w, h) => { paper(g, w, h, c); T(g, a, w / 2, h * 0.31, h * 0.32, INK, { f: F.fraunces, w: 700, max: w * 0.92 }); T(g, b, w / 2, h * 0.72, h * 0.34, RED, { f: F.caveat, w: 700, max: w * 0.92 }); };
const TICKET = (no, l1, l2) => (g, w, h) => { paper(g, w, h, '#f6f1e2', no); T(g, '#' + no, w / 2, h * 0.14, h * 0.15, RED, { f: F.elite, w: 700 }); line(g, [[w * 0.1, h * 0.25], [w * 0.9, h * 0.25]], '#9a9590', 1); T(g, l1, w / 2, h * 0.43, h * 0.15, INK, { f: F.elite, max: w * 0.9 }); T(g, l2, w / 2, h * 0.7, h * 0.19, RED, { f: F.caveat, w: 700, max: w * 0.92 }); };
const NARUTO = (g, w, h) => {
  g.clearRect(0, 0, w, h); fill(g, w, h, '#f4f1ea'); g.strokeStyle = '#e88aa8'; g.lineWidth = w * 0.09; g.lineCap = 'round'; g.beginPath();
  for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU * 1.9, r = w * (0.05 + 0.27 * i / 40); const x = w / 2 + Math.cos(a) * r, y = h / 2 + Math.sin(a) * r; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
};
const NOTE = (g, w, h) => {
  paper(g, w, h, '#f6efdc', 8); for (const x of [0.2, 0.8]) { g.save(); g.translate(w * x, h * 0.03); g.rotate(x < 0.5 ? -0.2 : 0.16); rect(g, -w * 0.07, -h * 0.045, w * 0.14, h * 0.09, 'rgba(214,190,120,.8)'); g.restore(); }
  T(g, 'We open when the sun goes down.', w / 2, h * 0.28, h * 0.125, INK, { f: F.caveat, w: 700, max: w * 0.9 });
  T(g, 'Also when it comes up.', w / 2, h * 0.47, h * 0.125, INK, { f: F.caveat, w: 700, max: w * 0.9 });
  T(g, 'Also in between.', w / 2, h * 0.66, h * 0.125, RED, { f: F.caveat, w: 700, max: w * 0.9 });
  T(g, '(sorry about the door.  K.)', w / 2, h * 0.87, h * 0.085, '#6a4a2a', { f: F.caveat, w: 600, max: w * 0.9 });
};
const SLURP = (g, w, h) => {
  paper(g, w, h, '#f1e4c6', 17); rect(g, 0, 0, w, h * 0.15, RED); T(g, 'HOW TO SLURP', w / 2, h * 0.08, h * 0.085, CREAM, { f: F.archivo, max: w * 0.9 });
  // the bowl, and noodles on their way up
  const bx = w * 0.5, by = h * 0.36; g.strokeStyle = '#d9a82e'; g.lineWidth = w * 0.012; g.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const x = bx - w * 0.07 + i * w * 0.028; g.beginPath(); g.moveTo(x, by - h * 0.13); g.bezierCurveTo(x - w * 0.03, by - h * 0.07, x + w * 0.03, by - h * 0.03, x, by + h * 0.02); g.stroke(); }
  line(g, [[bx - w * 0.16, by - h * 0.17], [bx + w * 0.06, by - h * 0.115]], INK, w * 0.012); line(g, [[bx - w * 0.16, by - h * 0.15], [bx + w * 0.06, by - h * 0.135]], INK, w * 0.012);
  g.fillStyle = INK; g.beginPath(); g.arc(bx, by, w * 0.2, 0, Math.PI); g.closePath(); g.fill(); rect(g, bx - w * 0.07, by + w * 0.2 - 2, w * 0.14, h * 0.014, INK); rect(g, bx - w * 0.2, by - 3, w * 0.4, 6, RED);
  for (const dx of [-0.3, 0.3]) for (let i = 0; i < 2; i++) { g.strokeStyle = 'rgba(29,27,24,.4)'; g.lineWidth = w * 0.008; const x = bx + dx * w + i * w * 0.04 * Math.sign(dx); g.beginPath(); g.moveTo(x, by - h * 0.02); g.bezierCurveTo(x - w * 0.03, by - h * 0.06, x + w * 0.03, by - h * 0.1, x, by - h * 0.14); g.stroke(); }
  const steps = [['1', 'LIFT', 'A few noodles, not all of them. Up high. Look at them. Good.'], ['2', 'LEAN', 'Face to the bowl. The bowl does not come to you.'], ['3', 'SLURP', 'Pull air in with the noodles. Loudly. That is the cooling, and the compliment.'], ['4', 'DRINK', 'Both hands, from the bowl. Finish the broth and Kombu will pretend not to notice.']];
  steps.forEach(([n, t, d], i) => { const y = h * (0.535 + i * 0.094); disc(g, w * 0.1, y + h * 0.012, h * 0.028, RED); T(g, n, w * 0.1, y + h * 0.014, h * 0.036, CREAM, { f: F.abril }); T(g, t, w * 0.18, y, h * 0.038, INK, { f: F.archivo, a: 'left' }); para(g, d, w * 0.37, y - h * 0.02, h * 0.0245, '#3a2c24', w * 0.57, { lh: 1.2 }); });
  rect(g, 0, h * 0.895, w, h * 0.105, INK); T(g, 'It is polite.  It cools the noodles.', w / 2, h * 0.928, h * 0.03, CREAM, { f: F.fraunces, it: 1, max: w * 0.92 }); T(g, 'IT IS THE LAW HERE.', w / 2, h * 0.968, h * 0.036, '#e9c46a', { f: F.archivo, max: w * 0.9 });
};
const RULES = (g, w, h) => {
  wood(g, w, h, '#3a2c24', 11); g.strokeStyle = '#c8402f'; g.lineWidth = 4; g.strokeRect(8, 8, w - 16, h - 16);
  T(g, 'HOUSE RULES', w / 2, h * 0.085, h * 0.07, '#e9c46a', { f: F.bebas, ls: 3, max: w * 0.84 });
  let y = h * 0.15;
  ['Noodles wait for no one. Eat first, talk after.', 'No phones in the broth.', 'Say hello to the pot. It has been here longer than you.', 'One stool each. Coats may not have a stool.', 'Robots: the steam is free.', 'If you cannot finish, that is fine. Kombu will be brave about it.', 'No tipping. Tell the broth it did well.']
    .forEach((s, i) => { T(g, String(i + 1), w * 0.11, y + h * 0.022, h * 0.05, '#e8553f', { f: F.abril }); y = para(g, s, w * 0.19, y, h * 0.039, '#f3e9d2', w * 0.72, { f: F.caveat, w: 700, lh: 1.08 }) + h * 0.022; });
};
const SOUPQ = (g, w, h) => {
  slate(g, w, h, '#232826', 31); chalk(g, 'THE SOUP QUESTION', w / 2, h * 0.08, h * 0.075, '#e9c46a', { max: w * 0.9 }); chalk(g, 'whose is it?', w / 2, h * 0.155, h * 0.06, '#9aa39d');
  line(g, [[w / 2, h * 0.22], [w / 2, h * 0.8]], '#f1efe6', 2); chalk(g, 'noodles', w * 0.26, h * 0.26, h * 0.07, '#e8a8a0'); chalk(g, 'dumplings', w * 0.74, h * 0.26, h * 0.07, '#9fc6b0');
  const tally = (x0, n, c) => { for (let i = 0; i < n; i++) { const k = i % 5, grp = Math.floor(i / 5), x = x0 + (grp % 2) * w * 0.2, y = h * 0.36 + Math.floor(grp / 2) * h * 0.11; if (k < 4) line(g, [[x + k * w * 0.03, y], [x + k * w * 0.03 + 2, y + h * 0.07]], c, 3); else line(g, [[x - w * 0.015, y + h * 0.055], [x + w * 0.11, y + h * 0.012]], c, 3); } };
  tally(w * 0.07, 33, '#f1efe6'); tally(w * 0.56, 33, '#f1efe6');
  chalk(g, '(Kombu)', w * 0.26, h * 0.76, h * 0.045, '#9aa39d'); chalk(g, '(Bao)', w * 0.74, h * 0.76, h * 0.045, '#9aa39d');
  chalk(g, 'one mark per visit. no, Bao, you may not vote twice.', w / 2, h * 0.87, h * 0.047, '#f1efe6', { max: w * 0.92 }); chalk(g, 'it is a tie. it is always a tie.', w / 2, h * 0.94, h * 0.047, '#e9c46a', { max: w * 0.92 });
};
const NOREN = (ch, small) => (g, w, h) => { fill(g, w, h, '#22324c'); grain(g, w, h, 0.09, ch.charCodeAt(0)); T(g, ch, w / 2, h * 0.42, h * 0.5, '#f1ebdd', { f: F.abril }); if (small) T(g, small, w / 2, h * 0.82, h * 0.1, '#e8907a', { f: F.caveat, w: 700, max: w * 0.9 }); };
const BACKDROP = (g, w, h) => {
  fill(g, w, h, '#1d1b18'); g.strokeStyle = 'rgba(200,64,47,.5)'; g.lineWidth = 2; const r = h * 0.2;                 // seigaiha: the old wave pattern
  for (let j = 0; j < 7; j++) for (let i = -1; i < w / (r * 2) + 1; i++) for (const k of [1, 0.66, 0.33]) { g.beginPath(); g.arc(i * r * 2 + (j % 2) * r, h + r * 0.2 - j * r * 0.5, r * k, Math.PI, 0); g.stroke(); }
  rrect(g, w * 0.3, h * 0.2, w * 0.4, h * 0.6, 8, '#1d1b18', '#c8402f', 3); T(g, "TODAY'S BOWLS", w / 2, h * 0.42, h * 0.26, '#f1ebdd', { f: F.abril, max: w * 0.36 }); T(g, 'as modelled by wax. the real ones steam', w / 2, h * 0.67, h * 0.14, '#e9c46a', { f: F.caveat, w: 700, max: w * 0.37 });
};
const NAMEBOX = (name, c, ink) => (g, w, h) => { fill(g, w, h, c); grain(g, w, h, 0.05); rrect(g, w * 0.24, h * 0.14, w * 0.52, h * 0.72, 3, '#f3e9d2'); T(g, name, w / 2, h * 0.52, h * 0.5, INK, { f: F.caveat, w: 700, max: w * 0.48 }); disc(g, w * 0.1, h / 2, h * 0.12, ink); disc(g, w * 0.9, h / 2, h * 0.12, ink); };
const JARL = (a, b) => (g, w, h) => { paper(g, w, h, '#f3e9d2'); g.strokeStyle = RED; g.lineWidth = 2; g.strokeRect(2, 2, w - 4, h - 4); T(g, a, w / 2, h * 0.34, h * 0.34, INK, { f: F.bebas, ls: 1, max: w * 0.9 }); T(g, b, w / 2, h * 0.72, h * 0.3, RED, { f: F.caveat, w: 700, max: w * 0.9 }); };
const POTCLOCK = hour => (g, w, h) => {
  slate(g, w, h, '#232826', 13); const el = ((hour - 5) % 24 + 24) % 24, hh = Math.floor(el), mm = Math.floor((el - hh) * 60);
  chalk(g, 'THE POT', w / 2, h * 0.13, h * 0.15, '#e9c46a'); chalk(g, 'has been on since five this morning', w / 2, h * 0.3, h * 0.085, '#f1efe6', { max: w * 0.92 });
  chalk(g, el < 0.4 ? 'new bones in. be patient with it' : `${hh} h ${String(mm).padStart(2, '0')} min`, w / 2, h * 0.52, el < 0.4 ? h * 0.11 : h * 0.22, '#e8a8a0', { max: w * 0.92 });
  chalk(g, 'times it has boiled:   0', w / 2, h * 0.74, h * 0.09, '#f1efe6'); chalk(g, 'times Kombu has checked:  all of them', w / 2, h * 0.88, h * 0.075, '#9aa39d', { max: w * 0.92 });
};

// ---- what Kombu makes, to hold in the hand (THREE, y up, feet) -----------------------------------------------
function plateUp(T3, kind) {
  const g = new T3.Group(), mats = {}, M = (c, r = 0.6) => (mats[c + r] ??= new T3.MeshStandardMaterial({ color: c, roughness: r, side: T3.DoubleSide }));
  const add = (geo, c, x = 0, y = 0, z = 0, r) => { const m = new T3.Mesh(geo, M(c, r)); m.position.set(x, y, z); g.add(m); return m; };
  const turned = (prof, seg = 20) => new T3.LatheGeometry(prof.map(([r, y]) => new T3.Vector2(r, y)), seg);
  const sticks = y => { for (const dz of [-0.02, 0.02]) { const s = add(new T3.CylinderGeometry(0.008, 0.006, 0.78, 5), 0x3a2414, 0.02, y, 0.2 + dz, 0.5); s.rotation.z = Math.PI / 2; s.rotation.y = dz * 2; } };
  const scallion = (n, y, R) => { for (let i = 0; i < n; i++) { const a = i * 2.4, r = R * (0.3 + 0.7 * ((i * 37) % 10) / 10); add(new T3.CylinderGeometry(0.014, 0.014, 0.01, 6), 0x6f9a3e, Math.cos(a) * r, y, Math.sin(a) * r); } };
  if (kind === 'gyoza') {
    add(new T3.BoxGeometry(0.72, 0.03, 0.4), 0x2a2320, 0, 0.015, 0, 0.35);
    for (let i = 0; i < 6; i++) { const d = add(new T3.SphereGeometry(0.075, 9, 6), 0xf1e6cf, -0.25 + i * 0.085, 0.07, -0.04); d.scale.set(0.62, 0.62, 1.45); d.rotation.z = 0.5; const b = add(new T3.SphereGeometry(0.06, 7, 4), 0xb9772e, -0.235 + i * 0.085, 0.085, -0.04, 0.75); b.scale.set(0.5, 0.5, 1.35); b.rotation.z = 0.5; }
    add(turned([[0, 0], [0.06, 0], [0.085, 0.045], [0.075, 0.045], [0.05, 0.012], [0, 0.012]], 12), 0xebe6dc, 0.26, 0.03, 0.1, 0.25); add(new T3.CylinderGeometry(0.068, 0.068, 0.004, 12), 0x3a1c10, 0.26, 0.068, 0.1, 0.15);
    return g;
  }
  const cold = kind === 'cold';
  add(turned(cold ? [[0, 0], [0.17, 0], [0.3, 0.07], [0.35, 0.12], [0.33, 0.12], [0.27, 0.07], [0.15, 0.03], [0, 0.03]] : [[0, 0], [0.13, 0], [0.16, 0.03], [0.27, 0.12], [0.33, 0.24], [0.31, 0.24], [0.25, 0.13], [0.14, 0.05], [0, 0.05]], 22), cold ? 0x26364f : kind === 'tantan' ? 0xebe6dc : 0x1d1b18, 0, 0, 0, 0.25);
  const y = cold ? 0.08 : 0.195, R = cold ? 0.27 : 0.285;
  if (!cold) add(new T3.CylinderGeometry(R, R, 0.01, 22), { shoyu: 0x7a4a22, miso: 0xc48a3a, tantan: 0xc8551e }[kind], 0, y - 0.005, 0, 0.12);
  for (let i = 0; i < (cold ? 7 : 4); i++) { const a = i * 1.9, n = add(new T3.TorusGeometry(0.075 + (i % 3) * 0.022, 0.015, 5, 14), 0xf0d98a, Math.cos(a) * 0.06 - (cold ? 0 : 0.03), y + (cold ? 0.012 + i * 0.012 : 0.004 + (i % 2) * 0.008), Math.sin(a) * 0.06); n.rotation.x = Math.PI / 2 + (i % 2 ? 0.12 : -0.1); n.rotation.z = a; }
  const egg = (x, z) => { const e = add(new T3.SphereGeometry(0.07, 10, 6, 0, 6.2832, 0, Math.PI / 2), 0xf6f1e4, x, y - 0.012, z, 0.4); e.scale.set(0.85, 0.55, 1.15); e.rotation.x = Math.PI; e.position.y = y + 0.03; add(new T3.CylinderGeometry(0.036, 0.036, 0.006, 10), 0xe8952a, x, y + 0.032, z, 0.35); };
  if (kind === 'shoyu') {
    egg(0.15, 0.08); for (const [x, z] of [[-0.02, -0.16], [0.1, -0.12]]) { const c = add(new T3.CylinderGeometry(0.085, 0.085, 0.018, 12), 0xb07a52, x, y + 0.012, z, 0.8); c.rotation.z = 0.12; }
    const n = add(new T3.BoxGeometry(0.2, 0.22, 0.006), 0x1f2a1c, -0.2, y + 0.07, 0.02, 0.8); n.rotation.y = Math.PI / 2 - 0.25; n.rotation.z = 0.2;
    add(new T3.CylinderGeometry(0.05, 0.05, 0.012, 12), 0xf6f1e4, -0.05, y + 0.014, 0.17, 0.5); const sw = add(new T3.TorusGeometry(0.022, 0.007, 4, 12), 0xe88aa8, -0.05, y + 0.021, 0.17); sw.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) { const m = add(new T3.BoxGeometry(0.1, 0.012, 0.026), 0xc9a15a, 0.13 + i * 0.012, y + 0.01 + i * 0.008, -0.02 + i * 0.03); m.rotation.y = 0.4; }
    scallion(8, y + 0.012, 0.1);
  } else if (kind === 'miso') {
    for (let i = 0; i < 16; i++) { const a = i * 2.4, r = 0.03 + (i % 4) * 0.022; add(new T3.SphereGeometry(0.017, 5, 4), 0xf0c93a, 0.1 + Math.cos(a) * r, y + 0.012 + (i % 3) * 0.006, 0.08 + Math.sin(a) * r, 0.45); }
    add(new T3.BoxGeometry(0.07, 0.03, 0.07), 0xf6e39a, -0.02, y + 0.03, -0.02, 0.35).rotation.y = 0.5;
    for (let i = 0; i < 7; i++) { const s = add(new T3.CylinderGeometry(0.008, 0.008, 0.13, 4), 0xf1ead6, -0.14 + (i % 3) * 0.02, y + 0.014 + i * 0.004, -0.1 + i * 0.012); s.rotation.z = Math.PI / 2; s.rotation.y = i * 0.5; }
    egg(-0.12, 0.14); scallion(10, y + 0.012, 0.22);
  } else if (kind === 'tantan') {
    const o = add(new T3.TorusGeometry(0.2, 0.03, 4, 22), 0xa82414, 0, y + 0.001, 0, 0.1); o.rotation.x = Math.PI / 2; o.scale.z = 0.12;
    for (let i = 0; i < 12; i++) { const a = i * 2.4, r = 0.02 + (i % 4) * 0.02; add(new T3.SphereGeometry(0.022, 5, 4), 0x7a4a2a, Math.cos(a) * r, y + 0.016 + (i % 2) * 0.012, Math.sin(a) * r, 0.9); }
    for (const [x, z, t] of [[-0.17, 0.08, 0.6], [-0.13, 0.16, 1.0]]) { const b = add(new T3.SphereGeometry(0.06, 8, 5), 0x4f8a3a, x, y + 0.015, z); b.scale.set(1.5, 0.4, 0.7); b.rotation.y = t; const st = add(new T3.SphereGeometry(0.035, 6, 4), 0xdfe8c8, x + 0.07 * Math.cos(t), y + 0.014, z - 0.07 * Math.sin(t)); st.scale.set(1.4, 0.45, 0.8); st.rotation.y = t; }
    scallion(7, y + 0.03, 0.08);
  } else {
    for (let i = 0; i < 7; i++) { const c = add(new T3.BoxGeometry(0.16, 0.01, 0.014), 0x5d9a4a, -0.1 + (i % 2) * 0.012, y + 0.09 + i * 0.003, -0.07 + i * 0.016); c.rotation.y = 0.5 + i * 0.05; }
    for (let i = 0; i < 6; i++) { const c = add(new T3.BoxGeometry(0.15, 0.008, 0.013), 0xf0cf5a, 0.1 - (i % 2) * 0.012, y + 0.09 + i * 0.003, -0.02 + i * 0.016); c.rotation.y = -0.6 + i * 0.05; }
    const d = add(new T3.TorusGeometry(0.1, 0.012, 4, 16), 0xb88a4a, 0, y + 0.085, 0.02, 0.3); d.rotation.x = Math.PI / 2;
    for (let i = 0; i < 9; i++) { const a = i * 2.4; add(new T3.SphereGeometry(0.012, 4, 3), 0xc9a15a, Math.cos(a) * 0.07, y + 0.1, 0.03 + Math.sin(a) * 0.07, 0.9); }
    scallion(6, y + 0.1, 0.1);
  }
  sticks(cold ? 0.135 : 0.255);
  return g;
}

export default function noodles(kit, lot) {
  const K = tools(kit, 71), X = fixtures(kit, K), { ves, hcyl, ball, tube, jar, bottle, plate, bowl, glass } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0), W = lot.W, D = lot.D, FLH = lot.fr(kit, 0, 0).h;       // R: x = a, y = d, z = height
  const sg = (a, d, h, face, w, tall, draw, o) => kit.sign(at(a, d, 0, face), 0, 0.012, h, w, tall, draw, o);
  const framed = (a, d, h, face, w, tall, draw, o, mat = LACQ) => { const f = at(a, d, 0, face); f.box(mat, -w / 2 - 0.07, w / 2 + 0.07, 0.008, 0.05, h - tall / 2 - 0.07, h + tall / 2 + 0.07); kit.sign(f, 0, 0.058, h, w, tall, draw, o); };
  const steam = (f, x, y, z) => { const [sx, sz] = kit.world(f, x, y); kit.steam.push({ x: sx, y: f.h + z, z: sz }); };
  const put = (f, g, mat) => K.put(f, g, mat);
  // noodles: a flat ring of them, lying in the bowl
  const ring = (f, x, y, z, RR, r = 0.016, mat = NOOD) => put(f, new THREE.TorusGeometry(RR, r, 4, 12).translate(x, y, z), mat);
  const blob = (f, mat, x, y, z, r, sx, sy, sz, turn = 0) => put(f, new THREE.SphereGeometry(r, 8, 5).scale(sx, sy, sz).rotateZ(turn).translate(x, y, z), mat);
  // a finished bowl built from turned shapes: broth, noodles, an egg half, greens, nori, narutomaki
  function dish(f, x, y, z, kind, r = 0.36, col) {
    if (kind === 'gyoza') {
      f.box(col ?? LACQ, x - r * 1.05, x + r * 1.05, y - r * 0.6, y + r * 0.6, z, z + 0.035);
      for (let i = 0; i < 6; i++) { blob(f, 'c#efe2bc/0.45', x - r * 0.72 + i * r * 0.25, y + r * 0.05, z + 0.09, 0.075, 0.6, 1.4, 0.65, 0.25); blob(f, 'c#a8784a/0.8', x - r * 0.69 + i * r * 0.25, y + r * 0.05, z + 0.115, 0.06, 0.5, 1.3, 0.5, 0.25); }
      ves(f, PORC, x + r * 0.72, y - r * 0.3, z + 0.035, [[0, 0], [0.06, 0], [0.09, 0.05], [0.08, 0.05], [0.05, 0.015], [0, 0.015]], 10); f.cyl('c#3a2214/0.2', x + r * 0.72, y - r * 0.3, z + 0.07, z + 0.076, 0.07, 0.07, 10);
      return;
    }
    const cold = kind === 'cold', h = cold ? r * 0.36 : r * 0.66, zb = z + h * (cold ? 0.55 : 0.8), rb = r * 0.86;
    bowl(f, x, y, z, r, h, col ?? (cold ? 'c#26364f/0.2' : kind === 'tantan' ? PORC : LACQ), 18);
    if (!cold) f.cyl(BROTH[kind], x, y, zb - 0.03, zb, rb, rb, 18);
    for (let i = 0; i < (cold ? 6 : 3); i++) { const a = i * 2.1; ring(f, x + Math.cos(a) * r * 0.16, y + Math.sin(a) * r * 0.16, zb + 0.012 + (cold ? i * 0.013 : 0), r * (0.24 + (i % 3) * 0.06)); }
    const egg = (ex, ey) => { f.cyl(WHITE, ex, ey, zb, zb + 0.035, 0.085, 0.07, 10); f.cyl(YOLK, ex, ey, zb + 0.035, zb + 0.041, 0.042, 0.042, 8); };
    const greens = (n, R0, zz) => { for (let i = 0; i < n; i++) { const a = i * 2.4, rr = R0 * (0.3 + ((i * 7) % 10) / 14); f.cyl(GREEN, x + Math.cos(a) * rr, y + Math.sin(a) * rr, zz, zz + 0.012, 0.016, 0.016, 5); } };
    if (kind === 'shoyu') {
      egg(x + r * 0.42, y + r * 0.2); for (const [dx, dy] of [[-0.1, -0.45], [0.28, -0.35]]) f.cyl(PORK, x + dx * r, y + dy * r, zb, zb + 0.022, 0.1, 0.1, 10);
      f.box(NORI, x - r * 0.7, x - r * 0.68, y - r * 0.3, y + r * 0.3, zb - 0.03, zb + 0.24);
      f.cyl(WHITE, x - r * 0.1, y + r * 0.5, zb, zb + 0.016, 0.062, 0.062, 12); kit.sign(f, x - r * 0.1, y + r * 0.5, zb + 0.019, 0.115, 0.115, NARUTO, { cw: 48, ch: 48, flat: true, round: true });
      greens(7, r * 0.4, zb + 0.03);
    } else if (kind === 'miso') {
      for (let i = 0; i < 14; i++) { const a = i * 2.4, rr = 0.03 + (i % 4) * 0.024; ball(f, CORN, x + r * 0.3 + Math.cos(a) * rr, y + r * 0.2 + Math.sin(a) * rr, zb + (i % 3) * 0.006, 0.018, 5); }
      f.box('c#f3d96a/0.2', x - 0.07, x + 0.01, y - 0.07, y + 0.01, zb + 0.02, zb + 0.055); egg(x - r * 0.4, y + r * 0.35); greens(9, r * 0.75, zb + 0.004);
    } else if (kind === 'tantan') {
      put(f, new THREE.TorusGeometry(rb * 0.72, 0.035, 4, 20).scale(1, 1, 0.1).translate(x, y, zb + 0.002), 'c#b8361f/0.2');
      for (let i = 0; i < 10; i++) { const a = i * 2.4, rr = 0.02 + (i % 4) * 0.022; ball(f, 'c#6a4a2a/0.8', x + Math.cos(a) * rr, y + Math.sin(a) * rr, zb + 0.01 + (i % 2) * 0.012, 0.024, 5); }
      blob(f, LEAFY, x - r * 0.5, y + r * 0.25, zb + 0.03, 0.07, 1.5, 0.7, 0.4, 0.7); blob(f, 'c#e8e2d4/0.45', x - r * 0.36, y + r * 0.4, zb + 0.03, 0.04, 1.3, 0.8, 0.45, 0.7); greens(6, r * 0.3, zb + 0.045);
    } else {
      for (let i = 0; i < 6; i++) f.box(i % 2 ? GREEN : LEAFY, x - r * 0.5, x - r * 0.05, y - r * 0.3 + i * 0.03, y - r * 0.3 + i * 0.03 + 0.016, zb + 0.09, zb + 0.1);
      for (let i = 0; i < 5; i++) f.box(CORN, x + r * 0.05, x + r * 0.5, y - r * 0.1 + i * 0.03, y - r * 0.1 + i * 0.03 + 0.014, zb + 0.09, zb + 0.098);
      ring(f, x, y + r * 0.1, zb + 0.095, r * 0.3, 0.012, 'c#b08a5a/0.45'); greens(6, r * 0.4, zb + 0.105);
    }
  }
  // chopsticks standing in a pot
  const sticksPot = (f, x, y, z) => { f.cyl(LACQ, x, y, z, z + 0.42, 0.11, 0.13, 10); for (let i = 0; i < 7; i++) { const a = i * 0.9, dx = Math.cos(a) * 0.06, dy = Math.sin(a) * 0.06; tube(f, i % 3 ? 'c#b08a5a/0.8' : 'c#3a2214/0.8', [[x + dx * 0.4, y + dy * 0.4, z + 0.05], [x + dx * 1.5, y + dy * 1.5, z + 0.85]], 0.012, 4); } };
  // a ladle hanging from z (its hook) down by len
  const ladle = (f, x, y, z, len = 1.1, mat = STEEL) => { tube(f, mat, [[x, y - 0.05, z - 0.06], [x, y, z], [x, y + 0.02, z - 0.1], [x, y + 0.02, z - len]], 0.016, 5); ves(f, mat, x, y + 0.08, z - len - 0.1, [[0, 0], [0.09, 0.02], [0.14, 0.1], [0.15, 0.17], [0.135, 0.17], [0.12, 0.1], [0.08, 0.035], [0, 0.02]], 10); };
  const strainer = (f, x, y, z, len = 1.0) => { tube(f, 'c#8a5a2a/0.8', [[x, y - 0.05, z - 0.06], [x, y, z], [x, y + 0.02, z - 0.1], [x, y + 0.02, z - len]], 0.02, 5); ves(f, IRON, x, y + 0.02, z - len - 0.42, [[0.02, 0], [0.11, 0.06], [0.16, 0.36], [0.17, 0.42], [0.155, 0.42], [0.1, 0.07], [0.02, 0.02]], 10); };

  // ---- THE COUNTER: down the room; stools to the left of it, the kitchen to the right ------------------------
  const c = at(11.2, 0, 0, 'left');                             // x = d (toward the back), +y = the customers' side
  const TOP = X.counter(c, 3.5, 22.2, -2.0, 0, 3.4, { front: BLACK, top: OAK, overhang: 0.45, kick: 'c#17140f/0.8' });
  c.box(REDW, 3.5, 22.2, -0.02, 0.012, 3.12, 3.22);                                                   // a red line under the lip
  c.box(BRASS, 3.8, 22, 0.3, 0.36, 0.62, 0.68); for (const x of [4, 8.6, 13, 17.4, 21.8]) c.box(BRASS, x - 0.03, x + 0.03, 0, 0.33, 0.6, 0.66);
  for (let i = 0; i < 9; i++) X.stool(c.sub(6.2 + i * 1.8, 1.02, 0, 2), 0, 0, 2.35, { label: 'sit at the counter', mat: REDW });      // turned about: whoever sits faces the kitchen
  // the pass: a raised shelf on the kitchen side, tiled red on its face
  const PASS = 4.0;
  c.box('tile_subway#c8402f', 6.3, 22.2, -2.0, -1.2, 3.4, PASS - 0.08); c.box(OAK, 6.24, 22.26, -2.07, -1.13, PASS - 0.08, PASS, G);
  // bowls on the pass, waiting for hands
  [['shoyu', 9.9], ['miso', 11.0], ['tantan', 12.1]].forEach(([k, x]) => { dish(c, x, -1.6, PASS, k, 0.36); steam(c, x, -1.6, PASS + 0.45); });
  dish(c, 13.25, -1.6, PASS, 'gyoza', 0.36);
  X.card(c, 11.0, -1.17, PASS, 1.5, 0.24, TAG('these three are spoken for. yours will be hotter'), { cw: 300, ch: 48, tilt: 0.05 });
  // the ticket rail
  for (const x of [14.6, 18.6]) c.cyl(STEEL, x, -1.62, PASS, PASS + 1.5, 0.03, 0.03, 6); hcyl(c, STEEL, 'x', 16.6, -1.62, PASS + 1.5, 4.1, 0.025, 0.025, 6);
  [['41', 'SHOYU · firm', 'Otis. he just looks at it'], ['42', 'TANTAN x2', 'extra chilli oil. brave'], ['43', 'GYOZA', 'for Bao. "quality control"'], ['44', 'MISO · butter x2', 'Juniper. on a break'], ['45', 'COLD SESAME', 'Moss says it is too hot out']]
    .forEach(([n, a, b], i) => kit.sign(c, 18.25 - i * 0.82, -1.59, PASS + 1.08, 0.62, 0.8, TICKET(n, a, b), { cw: 124, ch: 160 }));
  // stacks of bowls at the far end of the pass
  for (const [x, n, col] of [[20.0, 6, LACQ], [20.9, 5, PORC], [21.7, 4, REDB]]) for (let i = 0; i < n; i++) bowl(c, x, -1.6, PASS + i * 0.075, 0.33, 0.24, col, 14);
  // on the customers' side: chopsticks, chilli oil, vinegar, napkins; two menus; water
  for (const x of [7.1, 10.7, 14.3, 17.9]) {
    sticksPot(c, x - 0.25, -0.82, TOP); jar(c, x + 0.08, -0.86, TOP, 0.09, 0.2, 'c#b8361f/0.2', 0.7, 'c#17140f/0.45'); bottle(c, x + 0.34, -0.84, TOP, { r: 0.06, h: 0.42, col: 'c#3a2214/0.2', cap: 'c#b8361f/0.45' });
    c.box(LACQ, x + 0.5, x + 0.84, -1.0, -0.72, TOP, TOP + 0.2); c.box('c#f4f1ea/0.8', x + 0.53, x + 0.81, -0.97, -0.75, TOP + 0.2, TOP + 0.24);
  }
  for (const x of [12.5, 16.1, 19.7]) kit.sign(c, x, -0.9, TOP + 0.56, 0.78, 1.1, MENU, { cw: 400, ch: 564, tilt: 0.2, rough: 0.6 });
  for (const x of [8.2, 13.1, 15.5]) glass(c, x, -0.5, TOP, 0.09, 0.3, 'c#c9d6d8/0.2');
  X.card(c, 9.35, -0.95, TOP, 0.6, 0.22, TAG('your order lands here'));
  lot.pickup = { xz: kit.world(c, 8.9, -0.42), y: FLH + TOP };
  // the till end: a till with a paper roll, the lucky cat, a bowl of sweets
  { const x = 5.25, y = -1.1, z = TOP;
    c.soft(LACQ, x - 0.5, x + 0.5, y - 0.5, y + 0.4, z, z + 0.42, 0.05); c.soft(LACQ, x - 0.45, x + 0.45, y - 0.5, y - 0.02, z + 0.42, z + 0.86, 0.06);
    for (let i = 0; i < 12; i++) c.cyl(i === 11 ? 'c#b8361f/0.45' : 'c#e8e2d4/0.45', x - 0.3 + (i % 4) * 0.2, y + 0.08 + Math.floor(i / 4) * 0.09, z + 0.42, z + 0.47, 0.05, 0.05, 8);
    kit.sign(c, x, y - 0.012, z + 0.66, 0.66, 0.26, (g, w, h) => { fill(g, w, h, '#0f1a12'); T(g, 'SLURP  0.00', w / 2, h * 0.55, h * 0.56, '#9fe0a0', { f: F.elite, w: 700, max: w * 0.9 }); }, { cw: 132, ch: 52 });
    hcyl(c, 'c#f4f1ea/0.8', 'x', x, y - 0.3, z + 0.86, 0.3, 0.09, 0.09, 10);
    // the cat: one paw up (it waves; see below)
    const cx = 4.15, cy = -0.75;
    ball(c, WHITE, cx, cy, z, 0.17, 12, 1.05); ball(c, WHITE, cx, cy + 0.01, z + 0.29, 0.14, 12); for (const s of [-1, 1]) { ves(c, WHITE, cx + s * 0.08, cy, z + 0.52, [[0.05, 0], [0, 0.08]], 6); ball(c, 'c#17140f/0.2', cx + s * 0.05, cy + 0.125, z + 0.44, 0.016, 6); }
    ball(c, 'c#e88aa8/0.45', cx, cy + 0.14, z + 0.4, 0.012, 5); c.cyl('c#b8361f/0.45', cx, cy, z + 0.27, z + 0.31, 0.125, 0.125, 12); ball(c, BRASS, cx, cy + 0.13, z + 0.23, 0.03, 6);
    ball(c, WHITE, cx + 0.13, cy + 0.1, z + 0.03, 0.05, 6); c.cyl(BRASS, cx - 0.02, cy + 0.165, z + 0.06, z + 0.2, 0.05, 0.05, 10); c.cyl('c#b8361f/0.45', cx, cy, z - 0.0, z + 0.025, 0.2, 0.2, 14);
    lot.cat = { xz: kit.world(c, cx - 0.14, cy + 0.06), y: FLH + z + 0.33 };
    X.card(c, 4.15, -0.38, z, 0.62, 0.22, TAG('waves at everyone. means it'));
    bowl(c, 6.0, -0.55, z, 0.2, 0.12, REDB, 12); for (let i = 0; i < 9; i++) ball(c, K.pick(['c#f4f1ea/0.45', 'c#e88aa8/0.45', 'c#7fa04a/0.45']), 6.0 + Math.cos(i * 2.4) * 0.09, -0.55 + Math.sin(i * 2.4) * 0.09, z + 0.07 + (i % 2) * 0.02, 0.03, 5);
    X.card(c, 6.0, -0.28, z, 0.5, 0.2, TAG('one. (two.)'));
  }
  // the way into the kitchen: a flap at the back
  R.box(OAK, 11.25, 13.15, 22.32, D - 0.02, 3.26, 3.36, G); R.block(11.2, 13.2, 22.2, D, 0, 3.4);
  sg(11.24, 23.5, 2.2, 'left', 1.5, 1.0, (g, w, h) => { wood(g, w, h, '#3a2c24', 5); T(g, 'COOK ONLY', w / 2, h * 0.3, h * 0.26, '#e9c46a', { f: F.bebas, ls: 2 }); T(g, 'the pots are shy', w / 2, h * 0.62, h * 0.2, '#f3e9d2', { f: F.caveat, w: 700 }); T(g, 'and the floor is wet', w / 2, h * 0.84, h * 0.15, '#e8907a', { f: F.caveat, w: 700 }); }, { cw: 210, ch: 140 });
  R.box(DARK, 11.235, 11.26, 22.75, 24.25, 1.68, 2.72);

  // ---- THE KITCHEN: along the right wall ------------------------------------------------------------------------
  const k = at(W, 0, 0, 'left');                                // x = d, y = feet out from the right wall
  k.box('tile_subway', 3.42, D - 0.02, 0.012, 0.05, 0, 7.4);
  const bench = (x0, x1, h = 3.0) => { k.box('c#9a9590/0.45/1', x0 + 0.03, x1 - 0.03, 0.06, 2.42, 0.25, h - 0.08); k.box(CHROME, x0, x1, 0.055, 2.5, h - 0.08, h); for (const x of [x0 + 0.08, x1 - 0.08]) k.box(STEEL, x - 0.05, x + 0.05, 2.3, 2.4, 0, 0.25); };
  // prep: the rice cooker, the jars of tare and chilli oil, eggs, scallions on the board
  bench(3.6, 7.7);
  { const z = 3.0;
    k.soft('c#f4f1ea/0.2', 3.95, 4.95, 0.75, 1.75, z, z + 0.62, 0.16); k.cyl('c#e8e2d4/0.2', 4.45, 1.25, z + 0.62, z + 0.7, 0.42, 0.3, 16); ball(k, LACQ, 4.45, 1.25, z + 0.7, 0.05, 6); k.box('c#b8361f/0.45', 4.3, 4.6, 1.75, 1.77, z + 0.2, z + 0.3);
    [['SHOYU TARE', 'batch 212', 'c#3a2214/0.2'], ['MISO TARE', 'red + white', 'c#a8784a/0.8'], ['CHILLI OIL', 'do not sniff', 'c#b8361f/0.2']].forEach(([a, b, col], i) => { const x = 7.25 - i * 0.62; jar(k, x, 0.55, z, 0.24, 0.72, col, 0.75, 'c#17140f/0.45'); kit.sign(k, x, 0.55 + 0.25, z + 0.34, 0.36, 0.24, JARL(a, b), { cw: 108, ch: 72 }); });
    k.box(OAK, 5.5, 6.9, 1.35, 2.25, z, z + 0.07, G); for (let i = 0; i < 4; i++) { tube(k, i % 2 ? GREEN : LEAFY, [[5.65, 1.55 + i * 0.07, z + 0.1], [6.3, 1.6 + i * 0.07, z + 0.1]], 0.022, 5); tube(k, WHITE, [[6.3, 1.6 + i * 0.07, z + 0.1], [6.6, 1.62 + i * 0.07, z + 0.1]], 0.024, 5); }
    for (let i = 0; i < 12; i++) k.cyl(GREEN, 6.55 + (i % 4) * 0.06, 2.0 + Math.floor(i / 4) * 0.06, z + 0.07, z + 0.085, 0.022, 0.022, 5);
    k.box('c#c9a77a/0.8', 5.0, 5.42, 1.9, 2.4, z, z + 0.06); for (let i = 0; i < 6; i++) ball(k, i === 4 ? 'c#c9a77a/0.8' : 'c#efe2bc/0.45', 5.11 + (i % 2) * 0.2, 2.0 + Math.floor(i / 2) * 0.16, z + 0.04, 0.075, 8, 1.25);
    kit.sign(k, 5.21, 2.42, z + 0.03, 0.4, 0.055, TAG('6½ min. not 7', '#c9a77a'), { cw: 120, ch: 20 });
  }
  // shelf over the prep bench: bowls, more bowls
  k.box(STEEL, 3.6, 7.7, 0.05, 1.1, 5.72, 5.78); for (const x of [3.7, 7.6]) tube(k, STEEL, [[x, 0.06, 5.2], [x, 1.05, 5.72]], 0.02, 4);
  for (const [x, n, col] of [[4.2, 7, LACQ], [5.05, 6, LACQ], [5.9, 7, PORC], [6.75, 5, REDB]]) for (let i = 0; i < n; i++) bowl(k, x, 0.58, 5.78 + i * 0.075, 0.34, 0.24, col, 14);
  // the noodle boiler, six baskets
  bench(8.1, 10.9);
  { const z = 3.0; k.box('c#9fb0a4/0.2', 8.3, 10.7, 0.3, 2.2, z, z + 0.012); k.box(STEEL, 8.25, 10.75, 0.07, 0.25, z, z + 0.5);
    for (let i = 0; i < 6; i++) { const x = 8.72 + (i % 3) * 0.78, y = 0.75 + Math.floor(i / 3) * 0.95; ves(k, CHROME, x, y, z - 0.1, [[0.2, 0], [0.26, 0.32], [0.28, 0.34], [0.26, 0.36], [0.18, 0.02]], 10); if (i % 2 === 0) for (const rr of [0.1, 0.17]) ring(k, x, y, z + 0.08 + rr * 0.3, rr, 0.02); tube(k, 'c#8a5a2a/0.8', [[x, y + 0.26, z + 0.25], [x, y + 0.55, z + 0.5], [x, y + 0.9, z + 0.55]], 0.025, 5); }
    tube(k, CHROME, [[10.4, 0.16, z + 0.5], [10.4, 0.16, z + 1.1], [10.4, 0.5, z + 1.2], [10.4, 0.62, z + 1.0]], 0.035, 6);
    for (const [x, y] of [[8.9, 1.0], [9.6, 1.5], [10.2, 0.9]]) steam(k, x, y, z + 0.5);
    lot.machine = kit.world(k, 9.5, 3.7);
  }
  // the pots: the long one and the shared one
  k.box(IRON, 11.3, 16.7, 0.06, 2.5, 0, 1.95); for (const x of [12.7, 15.3]) { k.cyl('c#17140f/0.8', x, 1.3, 1.95, 2.02, 0.7, 0.7, 14); k.cyl(BRASS, x, 2.52, 1.3, 1.5, 0.07, 0.07, 8); }
  { const pot = (x, broth, bits) => {
      ves(k, STEEL, x, 1.3, 2.02, [[0, 0], [0.86, 0], [0.86, 2.0], [0.92, 2.0], [0.92, 2.06], [0.8, 2.06], [0.8, 0.1], [0, 0.1]], 24);
      for (const s of [-1, 1]) { k.box(STEEL, x + s * 0.86 - 0.04, x + s * 0.86 + 0.04, 1.12, 1.48, 3.7, 3.76); for (const y of [1.12, 1.44]) k.box(STEEL, x + s * 0.9 - 0.08, x + s * 0.9 + 0.08, y, y + 0.04, 3.7, 3.76); }
      k.cyl(broth, x, 1.3, 3.8, 3.84, 0.8, 0.8, 22); bits(x, 3.84);
      for (const [dx, dy] of [[-0.3, -0.2], [0.3, 0.1], [0, 0.35]]) steam(k, x + dx, 1.3 + dy, 4.25);
    };
    pot(12.7, 'c#d9cdb2/0.2', (x, z) => { k.box(NORI, x - 0.5, x - 0.05, 0.95, 1.3, z, z + 0.012); for (const [dx, dy] of [[0.3, -0.3], [0.45, 0.2], [-0.2, 0.45]]) ball(k, 'c#e8e2d4/0.45', x + dx, 1.3 + dy, z - 0.07, 0.11, 7); tube(k, GREEN, [[x - 0.1, 1.7, z + 0.01], [x + 0.5, 1.85, z + 0.01]], 0.035, 5); tube(k, STEEL, [[x + 0.2, 1.2, z], [x + 0.75, 0.6, z + 1.1], [x + 0.8, 0.55, z + 1.25]], 0.022, 5); });
    pot(15.3, 'c#8a5a2a/0.2', (x, z) => { for (const [dx, dy] of [[-0.3, 0.2], [0.25, -0.35], [0.1, 0.4], [-0.45, -0.25]]) k.cyl('c#6a4a2a/0.8', x + dx, 1.3 + dy, z, z + 0.02, 0.09, 0.09, 8); k.box(NORI, x + 0.1, x + 0.6, 1.2, 1.5, z, z + 0.012); });
    kit.sign(k, 12.7, 2.18, 3.0, 0.9, 0.5, TAG2('DO NOT STIR', 'I mean it. K.'), { cw: 180, ch: 100 }); kit.sign(k, 15.3, 2.18, 3.0, 0.9, 0.5, TAG2('THIS POT IS SHARED', "bottom half: Bao's"), { cw: 180, ch: 100 });
    lot.pot = { xz: kit.world(k, 12.7, 1.3), y: FLH + 4.0 };
  }
  // the wok
  bench(17.2, 19.9);
  { const z = 3.0, x = 18.4; k.cyl(IRON, x, 1.25, z, z + 0.16, 0.5, 0.56, 14); ves(k, IRON, x, 1.25, z + 0.1, [[0, 0], [0.3, 0.03], [0.6, 0.2], [0.8, 0.44], [0.77, 0.45], [0.58, 0.24], [0.3, 0.08], [0, 0.05]], 20);
    tube(k, 'c#8a5a2a/0.8', [[x, 2.0, z + 0.52], [x + 0.1, 2.75, z + 0.62]], 0.045, 6); for (let i = 0; i < 7; i++) blob(k, i % 2 ? LEAFY : GREEN, x + Math.cos(i * 2.4) * 0.2, 1.25 + Math.sin(i * 2.4) * 0.2, z + 0.22, 0.09, 1.3, 0.8, 0.4, i);
    for (let i = 0; i < 3; i++) { const bx = 19.3 + (i % 2) * 0.3, by = 0.45 + i * 0.3; ves(k, ['c#b8361f/0.45', 'c#3a2214/0.45', 'c#d9b35a/0.45'][i], bx, by, z, [[0, 0], [0.085, 0], [0.085, 0.4], [0.03, 0.47], [0.012, 0.62], [0, 0.62]], 8); } }
  // the sink, a stack of trays
  bench(20.4, 22.9); k.box('c#5a5a56/0.45/1', 20.65, 21.85, 0.5, 2.0, 3.0, 3.012); tube(k, CHROME, [[21.25, 0.25, 3.0], [21.25, 0.25, 3.9], [21.25, 0.7, 4.0], [21.25, 0.85, 3.75]], 0.04, 6);
  for (let i = 0; i < 5; i++) k.box(i % 2 ? 'c#c9ccd0/0.45' : 'c#9a9590/0.45', 22.0, 22.8, 0.5, 2.1, 3.0 + i * 0.07, 3.06 + i * 0.07); K.towel(k, 22.1, 22.6, 2.52, 2.9, 0.9, 'c#f4f1ea/0.8', 'c#b8361f/0.8');
  // the hood, the menu hung along it as wooden tablets, and everything that hangs under it
  k.box(STEEL, 7.8, 20.2, 0.055, 3.5, 7.4, 9.45); k.box('c#9a9590/0.45/1', 12.4, 15.6, 0.3, 2.3, 9.45, 11.98);
  { const hf = at(W - 3.5, 0, 0, 'left');
    [['Shoyu', 'the one Kombu eats', '13'], ['Miso|& corn', 'with butter. yes', '14'], ['Tantan-|men', 'the spicy one', '14'], ['Cold|sesame', 'for hot heads', '11'], ['Gyoza', 'six. crisp one side', '7'], ['Barley|tea', 'hot or cold', '2'], ['Small|beer', 'in a tumbler', '4']]
      .forEach(([n, s, p], i) => { const x = 19.2 - i * 1.7; hf.box('c#8a5a2a/0.8', x - 0.76, x + 0.76, 0.006, 0.035, 7.48, 9.36); kit.sign(hf, x, 0.04, 8.42, 1.5, 1.86, TABLET(n, s, p, 3 + i), { cw: 210, ch: 260 }); });
    tube(hf, BRASS, [[8.2, 0.14, 7.28], [19.8, 0.14, 7.28]], 0.025, 5); for (const x of [8.2, 14, 19.8]) hf.box(BRASS, x - 0.02, x + 0.02, 0.02, 0.16, 7.26, 7.42);
    [8.7, 9.3, 12.2, 15.9, 17.0].forEach((x, i) => ladle(hf, x, 0.14, 7.28, 1.0 + (i % 2) * 0.15)); [10.2, 10.9, 13.3, 18.0, 18.8].forEach((x, i) => strainer(hf, x, 0.14, 7.28, 0.7 + (i % 2) * 0.12));
    hf.cyl(IRON, 14.6, 0.16, 6.3, 7.2, 0.016, 0.016, 4); ves(hf, IRON, 14.6, 0.16, 6.2, [[0.3, 0], [0.31, 0.02], [0.3, 0.04], [0, 0.04]], 14);           // a skimmer
  }
  // the back door to the yard, a calendar, crates of bottles by it
  { const b = at(14.6, D, 0, 'street'); b.box(REDW, -1.5, 1.5, 0.012, 0.07, 0, 6.9, G); b.box(BLACK, -1.65, 1.65, 0.01, 0.05, 0, 7.05); ball(b, BRASS, -1.2, 0.12, 3.3, 0.07, 8);
    kit.sign(b, 0, 0.075, 5.3, 1.6, 0.7, (g, w, h) => { fill(g, w, h, '#1d1b18'); T(g, 'YARD', w / 2, h * 0.36, h * 0.44, '#e9c46a', { f: F.bebas, ls: 4 }); T(g, 'mind the stool. it is my stool', w / 2, h * 0.78, h * 0.24, '#f3e9d2', { f: F.caveat, w: 700, max: w * 0.9 }); }, { cw: 200, ch: 88 });
    for (const [x, z] of [[-2.8, 0], [-2.8, 0.85], [-4.5, 0]]) { X.crate(b, x, 0.75, z, 1.5, 1.1, 0.8, 'c#c8202a/0.8'); for (let i = 0; i < 12; i++) bottle(b, x - 0.52 + (i % 4) * 0.35, 0.42 + Math.floor(i / 4) * 0.32, z + 0.06, { r: 0.085, h: 0.82, col: x < -4 ? 'c#2f4a2a/0.2' : 'c#6a4a2a/0.2', cap: 'c#d9b35a/0.45' }); } }

  // ---- THE WINDOW: wax bowls on stands, the menu in its case; a low screen behind ------------------------------
  R.box(BLACK, 9.3, W - 0.02, 3.1, 3.4, 0, 5.4); R.box(OAK, 9.24, W - 0.02, 3.04, 3.46, 5.4, 5.48, G); R.block(9.3, W, 3.1, 3.4, 0, 5.5);
  sg(15.2, 3.09, 4.42, 'street', 10.6, 1.7, BACKDROP, { cw: 1060, ch: 170 });
  R.box(BLACK, 9.0, 20.2, 0.3, 3.1, 0, 2.0); R.box('linen#a8361f', 8.97, 20.23, 0.27, 3.1, 2.0, 2.05); R.box(LACQ, 9.2, 20.2, 2.0, 3.09, 2.05, 2.8); R.block(9.0, W, 0, 3.1, 0, 3.0);
  { const stand = (a, d, z, r = 0.3, h = 0.5) => { R.cyl('c#c9a77a/0.8', a, d, z, z + h, r * 0.7, r, 12); return z + h; };
    const tick = (a, d, z, n, p) => X.card(at(a, d, 0, 'street'), 0, 0, z, 0.72, 0.36, TAG2(n, p), { cw: 180, ch: 90 });
    [['shoyu', 10.4, 'SHOYU RAMEN', '13 · the classic', REDB], ['miso', 12.4, 'MISO & CORN', '14 · butter included', PORC], ['tantan', 15.0, 'TANTANMEN', '14 · the spicy one', 'c#f4f1ea/0.2'], ['cold', 16.9, 'COLD SESAME', '11 · no steam, on purpose', 'c#9fb0a4/0.2']]
      .forEach(([kd, a, n, p, col]) => { dish(R, a, 1.2, stand(a, 1.2, 2.05), kd, 0.46, col); tick(a, 0.55, 2.05, n, p); });
    dish(R, 11.4, 2.55, stand(11.4, 2.55, 2.8, 0.34, 0.4), 'gyoza', 0.4, 'c#f4f1ea/0.2'); tick(11.4, 2.02, 2.8, 'GYOZA, SIX', '7 · crisp one side');
    // extra noodles, an egg, the drinks
    { const z = stand(13.7, 2.55, 2.8, 0.3, 0.4); plate(R, 13.7, 2.55, z, 0.32, REDB); for (let i = 0; i < 5; i++) ring(R, 13.7 + Math.cos(i * 1.3) * 0.04, 2.55 + Math.sin(i * 1.3) * 0.04, z + 0.05 + i * 0.022, 0.15 - i * 0.02, 0.018); tick(13.7, 2.02, 2.8, 'KAEDAMA', '2 · more noodles'); }
    { const z = stand(15.9, 2.55, 2.8, 0.26, 0.4); plate(R, 15.9, 2.55, z, 0.24, PORC); for (const s of [-1, 1]) { blob(R, WHITE, 15.9 + s * 0.09, 2.55, z + 0.07, 0.08, 0.85, 1.15, 0.6); R.cyl(YOLK, 15.9 + s * 0.09, 2.55, z + 0.113, z + 0.119, 0.04, 0.04, 8); } tick(15.9, 2.02, 2.8, 'THE EGG', '2 · 6½ minutes'); }
    { const z = stand(17.6, 2.55, 2.8, 0.34, 0.4); glass(R, 17.42, 2.55, z, 0.12, 0.4, 'c#c9952a/0.2'); R.cyl('c#f4f1ea/0.8', 17.42, 2.55, z + 0.28, z + 0.35, 0.105, 0.11, 12); ves(R, 'c#9fb0a4/0.45', 17.8, 2.55, z, [[0, 0], [0.07, 0], [0.11, 0.06], [0.12, 0.24], [0.105, 0.24], [0.09, 0.07], [0, 0.04]], 12); R.cyl('c#8a5a2a/0.2', 17.8, 2.55, z + 0.2, z + 0.206, 0.1, 0.1, 10); tick(17.6, 2.02, 2.8, 'BEER · BARLEY TEA', '4 · 2 · small, both'); }
    // the menu case
    R.box(LACQ, 18.15, 20.05, 0.72, 0.98, 2.05, 5.5); R.box(BRASS, 18.1, 20.1, 0.68, 1.02, 5.5, 5.56);
    sg(19.1, 0.71, 3.82, 'street', 1.66, 3.2, MENU, { cw: 480, ch: 924, glow: 0.55 });
  }
  // an umbrella stand in the corner by the door
  kit.umbrellaStand(R, 1.1, 1.1, {}); R.block(0.7, 1.5, 0.7, 1.5, 0, 2.6);
  sg(0, 1.1, 3.6, 'right', 1.0, 0.5, TAG2('BORROW ONE', 'bring back one. any one'), { cw: 160, ch: 80 });

  // ---- THE LEFT WALL: the note, the poster, the regulars, the rules ---------------------------------------------
  sg(0, 2.9, 5.5, 'right', 2.1, 1.5, NOTE, { cw: 336, ch: 240 });
  framed(0, 6.7, 6.1, 'right', 3.2, 4.4, SLURP, { cw: 416, ch: 572 });
  { const l = at(0, 12.3, 0, 'right');                         // x toward the street
    const who = [['Juniper', '#2f5a4a'], ['Otis', '#b8452e'], ['Olive', '#26364f'], ['Folio', '#6a4a2a'], ['Moss', '#4a6e38'], ['Ember', '#8a1c1c'], ['Bao', '#d9cdb2'], ['Gus', '#17140f']];
    for (const z of [4.3, 5.2]) { l.box(DARK, -2.3, 2.3, 0.012, 0.52, z - 0.07, z, G); for (const x of [-2.0, 0, 2.0]) tube(l, BRASS, [[x, 0.02, z - 0.4], [x, 0.45, z - 0.07]], 0.02, 4); }
    who.forEach(([n, col], i) => { const x = 1.68 - (i % 4) * 1.12, z = i < 4 ? 5.2 : 4.3; kit.pack(l, x, 0.3, z, 1.0, 0.3, 0.26, snapMat(`c${col}/0.2`), NAMEBOX(n, col, '#c9a45c'), { cw: 200, ch: 52 }); });
    kit.sign(l, 0, 0.02, 6.25, 4.4, 0.72, (g, w, h) => { wood(g, w, h, '#3a2c24', 9); T(g, "THE REGULARS' OWN CHOPSTICKS", w / 2, h * 0.36, h * 0.4, '#e9c46a', { f: F.bebas, ls: 2, max: w * 0.92 }); T(g, 'kept here, washed, and never mixed up (once. sorry, Gus)', w / 2, h * 0.76, h * 0.27, '#f3e9d2', { f: F.caveat, w: 700, max: w * 0.92 }); }, { cw: 440, ch: 72 });
    kit.sign(l, 0, 0.02, 3.72, 2.6, 0.4, TAG('they do not eat. they like having a box.  a box of your own: ask'), { cw: 364, ch: 56 });
  }
  framed(0, 17.4, 6.0, 'right', 2.5, 3.7, RULES, { cw: 300, ch: 444 });
  // a narrow ledge for bags and coats, hooks over it
  { const l = at(0, 21.6, 0, 'right'); l.box(DARK, -2.2, 2.2, 0.012, 0.09, 5.5, 5.75, G); for (let i = 0; i < 5; i++) tube(l, BRASS, [[-1.8 + i * 0.9, 0.09, 5.66], [-1.8 + i * 0.9, 0.3, 5.62], [-1.8 + i * 0.9, 0.34, 5.78]], 0.022, 5);
    l.box(DARK, -2.2, 2.2, 0.012, 1.1, 1.42, 1.52, G); for (const x of [-2.1, 2.1]) l.box(DARK, x - 0.05, x + 0.05, 0.9, 1.0, 0, 1.42, G); l.block(-2.2, 2.2, 0, 1.1, 0, 1.52);
    for (const x of [-1.0, 1.0]) kit.seat(l, x, 0.6, 1.52, 'wait for a stool'); }

  // ---- THE BACK WALL: the pot's slate (it keeps count: see below), the soup question -----------------------------
  { const b = at(4.0, D, 0, 'street'); b.box(DARK, -2.25, 2.25, 0.012, 0.07, 4.95, 7.75, G); lot.slate = { xz: lot.world(4.0, D - 0.085), y: FLH + 6.35, w: 4.26, h: 2.56 }; }
  framed(8.6, D, 6.2, 'street', 2.9, 3.3, SOUPQ, { cw: 348, ch: 396 }, DARK);
  kit.pottedPlant(R, 10.4, 23.7, 0, 'snake', { size: 1.25 }); R.block(9.9, 10.9, 23.2, 24.2, 0, 3);
  R.box('c#f4f1ea/0.8', 8.2, 9.0, D - 0.3, D - 0.05, 4.1, 4.16); for (let i = 0; i < 3; i++) R.cyl('c#f4f1ea/0.8', 8.4 + i * 0.2, D - 0.18, 4.16, 4.4, 0.02, 0.02, 5);                        // the chalk ledge

  // ---- lanterns ------------------------------------------------------------------------------------------------------
  for (const d of [6.4, 11.0, 15.6, 20.2]) X.pendant(R, 10.7, d, { kind: 'paper', drop: 3.5, power: 1.0 });
  X.pendant(R, 4.2, 12.6, { kind: 'paper', drop: 3.2, power: 0.9 });
  for (const a of [11.6, 16.2]) X.pendant(R, a, 1.5, { kind: 'bulb', drop: 4.6, power: 0.7 });

  // ---- OUTSIDE: the noren over the door, a bench for the queue, the board, the empties -------------------------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));           // x = a along the frontage, y = -feet out from the shopfront
  { const A = lot.doorA, z0 = 7.0, z1 = 8.72;
    hcyl(o, DARK, 'x', A, -0.225, z1 + 0.04, 3.9, 0.04, 0.04, 8); for (const s of [-1, 1]) o.box(IRON, A + s * 1.9 - 0.03, A + s * 1.9 + 0.03, -0.26, -0.02, z1 + 0.0, z1 + 0.08);
    ['O', 'P', 'E', 'N'].forEach((ch, i) => { const a = A - 1.29 + i * 0.86; o.box(INDIGO, a - 0.41, a + 0.41, -0.24, -0.21, z0, z1);
      kit.sign(K.wrap(lot.frOut(kit, a, 0.24, 0, 'street')), 0, 0.004, (z0 + z1) / 2, 0.82, z1 - z0, NOREN(ch, ['yes', 'really', 'come', 'in'][i]), { cw: 100, ch: 210, rough: 0.95 });
      kit.sign(K.wrap(lot.frOut(kit, a, 0.21, 0, 'back')), 0, 0.004, (z0 + z1) / 2, 0.82, z1 - z0, NOREN('NOOS'[i], ['', 'back', 'come', ''][i]), { cw: 100, ch: 210, rough: 0.95 }); });
  }
  // the bench
  o.box(REDW, 10.2, 16.2, -1.95, -0.55, 1.4, 1.52, G); for (const x of [10.5, 13.2, 15.9]) o.box(BLACK, x - 0.08, x + 0.08, -1.85, -0.65, 0, 1.4); o.block(10.2, 16.2, -1.95, -0.55, 0, 1.52);
  for (const x of [11.6, 14.8]) kit.seat(o.sub(x, -1.25, 0, 2), 0, 0, 1.52, 'join the queue');
  X.card(K.wrap(lot.frOut(kit, 13.2, 0.75, 0, 'street')), 0, 0, 1.52, 1.1, 0.5, TAG2('THE QUEUE STARTS HERE', 'at the moment it is you'), { cw: 220, ch: 100 });
  X.aBoard(K.wrap(lot.frOut(kit, 18.4, 5.6, 0, 'left')), 0, 0, (g, w, h) => { slate(g, w, h, '#1f1d1b', 23); ICON.bowl(g, w / 2, h * 0.14, h * 0.17, '#e8553f'); chalk(g, 'NIGHT NOODLE', w / 2, h * 0.3, h * 0.1, '#f1efe6', { max: w * 0.9 }); chalk(g, 'is open.', w / 2, h * 0.42, h * 0.11, '#e9c46a'); chalk(g, 'no, really. come in', w / 2, h * 0.53, h * 0.07, '#9aa39d');
    chalk(g, 'shoyu · miso · the spicy one', w / 2, h * 0.68, h * 0.066, '#f1efe6', { max: w * 0.9 }); chalk(g, 'gyoza · a small beer', w / 2, h * 0.77, h * 0.066, '#f1efe6', { max: w * 0.9 }); chalk(g, 'follow the steam', w / 2, h * 0.91, h * 0.075, '#e8a8a0'); });
  // a crate of empties under the small window
  X.crate(o, 2.1, -0.85, 0, 1.5, 1.1, 0.8, 'c#c8202a/0.8'); for (let i = 0; i < 10; i++) bottle(o, 1.58 + (i % 4) * 0.35, -1.17 + Math.floor(i / 4) * 0.32, 0.06, { r: 0.085, h: 0.82, col: i % 3 ? 'c#6a4a2a/0.2' : 'c#2f4a2a/0.2' });
  o.block(1.35, 2.85, -1.4, -0.3, 0, 1.5); X.card(K.wrap(lot.frOut(kit, 2.1, 1.45, 0, 'street')), 0, 0, 0, 0.9, 0.36, TAG2('EMPTIES', 'they had a good night'), { cw: 180, ch: 72 });

  // ---- things that move: the cat's paw, the pot's slate, the steamed-up window ----------------------------------------
  kit.later.push(ctx => {
    const T3 = ctx.THREE ?? THREE, { scene } = ctx;
    // the cat waves
    { const paw = new T3.Group(), m = new T3.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.45 });
      const arm = new T3.Mesh(new T3.CylinderGeometry(0.035, 0.04, 0.17, 8).translate(0, 0.085, 0), m), hand = new T3.Mesh(new T3.SphereGeometry(0.05, 8, 6).translate(0, 0.19, 0), m); paw.add(arm, hand);
      paw.position.set(lot.cat.xz[0], lot.cat.y, lot.cat.xz[1]); scene.add(paw); ctx.animated?.push(t => { paw.rotation.x = 0.25 + Math.sin(t * 2.6) * 0.45; }); }
    // the slate that keeps count of the pot
    { const cv = document.createElement('canvas'); cv.width = 426; cv.height = 256; const tex = new T3.CanvasTexture(cv); tex.colorSpace = T3.SRGBColorSpace; tex.anisotropy = 4;
      const mesh = new T3.Mesh(new T3.PlaneGeometry(lot.slate.w, lot.slate.h), new T3.MeshStandardMaterial({ map: tex, roughness: 0.95, envMapIntensity: 0.15 }));
      mesh.position.set(lot.slate.xz[0], lot.slate.y, lot.slate.xz[1]); mesh.rotation.y = Math.PI / 2; scene.add(mesh);
      let last = -1; const draw = () => { const hr = ctx.day?.hour ?? 18, mn = Math.floor(hr * 60); if (mn === last) return; last = mn; POTCLOCK(hr)(cv.getContext('2d'), cv.width, cv.height); tex.needsUpdate = true; };
      draw(); ctx.animated?.push(draw); }
    // condensation on the big window: mostly clear, fogged low down, and somebody has drawn in it
    { const cv = document.createElement('canvas'); cv.width = 768; cv.height = 448; const g = cv.getContext('2d'), w = cv.width, h = cv.height, r = rnd(77);
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(236,240,238,0.42)'); gr.addColorStop(0.3, 'rgba(236,240,238,0.3)'); gr.addColorStop(0.56, 'rgba(236,240,238,0.07)'); gr.addColorStop(1, 'rgba(236,240,238,0.02)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 9; i++) { const x = r() * w, y = h * (0.05 + r() * 0.38), rg = g.createRadialGradient(x, y, 0, x, y, w * 0.14); rg.addColorStop(0, 'rgba(240,244,242,0.22)'); rg.addColorStop(1, 'rgba(240,244,242,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h); }
      g.globalCompositeOperation = 'destination-out'; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = 'rgba(0,0,0,0.92)';
      const fx = w * 0.2, fy = h * 0.3, fr = h * 0.13; g.lineWidth = 9;
      g.beginPath(); g.arc(fx, fy, fr, 0, TAU); g.stroke(); g.beginPath(); g.arc(fx, fy - fr * 0.05, fr * 0.55, 0.55, Math.PI - 0.55); g.stroke();
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(fx + s * fr * 0.36, fy - fr * 0.42); g.lineTo(fx + s * fr * 0.36, fy - fr * 0.2); g.stroke(); }
      g.lineWidth = 3; for (const [dx, len] of [[-0.56, 0.5], [0.3, 0.9], [0.98, 0.35]]) { g.beginPath(); g.moveTo(fx + dx * fr, fy + fr * 0.8); g.lineTo(fx + dx * fr + 2, fy + fr * (0.8 + len)); g.stroke(); }
      g.lineWidth = 7; g.font = `700 ${Math.round(h * 0.13)}px ${F.caveat}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeText('hi', w * 0.31, h * 0.3);
      for (let i = 0; i < 14; i++) { g.lineWidth = 1 + r() * 1.5; const x = r() * w, y = h * (0.05 + r() * 0.3); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 4, y + h * (0.04 + r() * 0.13)); g.stroke(); }
      g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 160; i++) { const x = r() * w, y = h * (r() * 0.6); g.fillStyle = `rgba(250,252,252,${0.1 + r() * 0.2})`; g.beginPath(); g.arc(x, y, 0.5 + r() * 0.9, 0, TAU); g.fill(); }
      const tex = new T3.CanvasTexture(cv); tex.colorSpace = T3.SRGBColorSpace;
      const a0 = 7.86, a1 = 20.04, [x0, zA] = lot.world(a0, -0.45), [, zB] = lot.world(a1, -0.45);
      const mesh = new T3.Mesh(new T3.PlaneGeometry(a1 - a0, 7.1), new T3.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 1, metalness: 0, side: T3.DoubleSide, envMapIntensity: 0.1, emissive: 0xfff0dc, emissiveMap: tex, emissiveIntensity: 0.15 }));
      mesh.position.set(x0, FLH + 1.95 + 3.55, (zA + zB) / 2); mesh.rotation.y = Math.PI / 2; mesh.renderOrder = 3; scene.add(mesh); }
    // rule three
    { const said = ['The pot says nothing. It is concentrating.', '"Blup."', 'The pot heard you. Kombu nods, once.', '"Blup-blup." That one means more kombu.']; let n = 0;
      ctx.interact?.push({ x: lot.pot.xz[0], y: lot.pot.y, z: lot.pot.xz[1], reach: 11.5, size: 0.9, label: () => 'say hello to the pot', act: () => { ctx.flash?.(said[n++ % said.length]); ctx.sound?.note?.(38, 0, 0.25, 0.07); } }); }
  });

  // ---- Kombu ---------------------------------------------------------------------------------------------------------
  kit.clerks.push({
    id: 'kombu', name: 'Kombu', lot: 'noodles', look: { shape: 'round', colour: '#2a2320', belly: '#f1ebdd', trim: '#c8402f', hat: 'beanie', hatColour: '#f1ebdd', apron: '#8a1c1c', eye: '#ffd9a0', ring: 0xffb07a, tool: 'ladle', hover: 5.0 },
    home: lot.world(14.3, 11.0), faces: lot.world(6, 11.0), posts: [lot.world(14.3, 7.4), lot.world(14.3, 17.2), lot.world(14.3, 11.0)],
    serve: { machine: lot.machine, pickup: lot.pickup,
      food: {
        'shoyu ramen': { build: T3 => plateUp(T3, 'shoyu'), bites: 5, note: 'You finish the shoyu ramen, broth and all. Kombu pretends not to notice. Kombu noticed.' },
        'miso and corn ramen': { build: T3 => plateUp(T3, 'miso'), bites: 5, note: 'You finish the miso and corn. The butter was not optional, and it was right.' },
        'tantanmen': { build: T3 => plateUp(T3, 'tantan'), bites: 5, note: 'You finish the tantanmen. Your lips are humming. That is the Sichuan pepper saying goodbye.' },
        'cold sesame noodles': { build: T3 => plateUp(T3, 'cold'), bites: 4, note: 'You finish the cold sesame noodles. Somewhere a peanut is still crunching.' },
        'gyoza': { build: T3 => plateUp(T3, 'gyoza'), bites: 6, note: 'Six gyoza, gone. Crisp one side, soft the other. You do not tell Bao which side you preferred.' } },
      drinks: {
        'barley tea': { vessel: 'teacup', liquid: 0x9a6a2e, note: 'You finish the barley tea. Toasty. Refills are free; so is the nod.' },
        'small beer': { vessel: 'tumbler', liquid: 0xd9a22a, note: 'You finish the small beer. It was exactly the right size, which is small.' } } },
    lines: {
      greet: ['Sit. Any stool. They are all the good one.', 'You came in. Good. The broth heard the door.', 'Open. Yes. I know what the door used to say.'],
      idle: ['*lifts a lid, looks, puts it back* ...Good. Stay like that.', '*to the pot* Nobody is rushing you.', 'Fourteen hours. It has never boiled. Not once.', '*taps the ladle twice on the rim, for luck*', '*straightens a bowl that was already straight*', '*to the pot* That was a customer. Be nice.'],
      bye: ['Come back hungry.', 'Slurp louder next time. I was listening.'],
      served: ['Eat it now. Noodles wait for no one.', 'Loud is good. Loud means it is working.', 'Drink the broth. The broth is the point.'],
      topics: [
        { q: 'Shoyu ramen, please.', a: 'Shoyu. The one I eat. Two soy sauces in the tare, fourteen hours in the pot, three minutes from you.', serve: 'shoyu ramen' },
        { q: 'What should I have?', a: 'All of it is good. You want me to choose. Fine. Tell me how you feel.', next: [
          { q: 'Cold and tired.', a: 'Miso and corn. Wok-fried miso, sweet corn, butter on top. It is a blanket with noodles in.', serve: 'miso and corn ramen' },
          { q: 'Brave.', a: 'Tantanmen. The spicy one. Sesame, chilli oil, Sichuan pepper. Your mouth will hum. That is correct.', serve: 'tantanmen' },
          { q: 'Too warm already.', a: 'Cold sesame noodles. No steam. I allow it, in summer and for you.', serve: 'cold sesame noodles' }] },
        { q: 'Six gyoza.', a: 'Six. Fried, then steamed under the lid. Bao pleats, I fry, we both take the credit.', serve: 'gyoza' },
        { q: 'Something to drink?', a: 'Two things. Both small. Both correct.', next: [
          { q: 'Barley tea.', a: 'Mugicha. Roasted barley, nothing else. Refills are free.', serve: 'barley tea' },
          { q: 'A small beer.', a: 'In a tumbler. If you wanted a big one you wanted a different shop.', serve: 'small beer' }] },
        { q: 'Do you talk to the broth?', a: 'It has been here longer than you. It is polite to include it.', next: [
          { q: 'What does it say?', a: '"Blup." Mostly. Sometimes "blup-blup". That one means more kombu. I am named after the seaweed, not the other way.' }] },
        { q: 'Bao says soup belongs to dumplings.', a: 'Bao is my friend. Bao is wrong. We share the big pot: top half mine, bottom half theirs. The tally is on the back wall. Do not let Bao vote twice.' },
        { q: 'The door said you open when the sun goes down.', a: 'It did. Then the street got a clock and the sun started moving. I thought about it for one whole broth. Now: when it goes down, when it comes up, and in between.' },
      ],
    },
  });
}
