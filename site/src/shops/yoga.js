// Low Sun Yoga  (north side, east end of the street: 31 ft wide by 28.7 deep)
// Reception by the door: shoe cubbies and the noticeboard on the left wall, the desk to the right,
// mats for hire, the shelf of blocks and bolsters and the tea table down the right wall, and a
// singing bowl on a stand just inside the door (E strikes it). Behind: the practice floor, seven
// mats in two rows facing Sol's low platform and the painted sun on the back wall.
// THE ROUTINES: sit on any mat ('take this mat') and a class begins. Sol leads a real sequence
// (three of them, in rotation), the seated eye is moved through the poses, a caption names each
// pose in Sanskrit and English with its breath, a bowl sounds at each change. Standing up ends it.
import { tools, fixtures } from '../shopkit.js';
import { BRASS, G } from '../kit.js';
import { eyeHeight } from '../walk.js';
import { T, F, fill, slate, chalk, paper, grain, disc, rect, rrect, line, para, rnd } from '../draw.js';

const OAK = 'oak_light#b4946a', PALE = 'oak_light#d2b88e', TERRA = 'painted_wood#c98a6a', CREAMP = 'painted_wood#efe6d4', CORK = 'c#c9a77a/0.8', IRON = 'c#2b2724/0.45/1';
const INK = '#3a2a22', RUST = '#b8553a', OCHRE = '#d9a441', PAPER = '#f6efe2', SAGE = '#7d8f72', INDIGO = '#2f4858';
const MATS = ['c#9fb0a4/0.8', 'c#e8907a/0.8', 'c#2f5a6a/0.8', 'c#d9b35a/0.8', 'c#9fb0d8/0.8', 'c#c9b48a/0.8', 'c#4a6e38/0.8', 'c#26364f/0.8'];

// ---- little figures, chalked or inked: u across, v down, the ground at v = 1 ------------------------------
const FIG = {
  tadasana: [[0.5, 0.1], [[0.5, 0.18], [0.5, 0.58], [0.5, 1]], [[0.5, 0.25], [0.55, 0.56]]],
  urdhva: [[0.5, 0.21], [[0.5, 0.29], [0.5, 0.62], [0.5, 1]], [[0.5, 0.31], [0.54, 0.02]]],
  uttana: [[0.61, 0.87], [[0.44, 1], [0.44, 0.5], [0.58, 0.62], [0.6, 0.79]], [[0.59, 0.68], [0.67, 0.98]]],
  ardha: [[0.84, 0.47], [[0.4, 1], [0.4, 0.5], [0.75, 0.49]], [[0.7, 0.5], [0.7, 0.95]]],
  chatur: [[0.89, 0.74], [[0.08, 0.97], [0.1, 0.88], [0.79, 0.78]], [[0.79, 0.78], [0.62, 0.75], [0.66, 0.98]]],
  updog: [[0.77, 0.4], [[0.04, 0.96], [0.5, 0.92], [0.72, 0.52]], [[0.71, 0.56], [0.7, 0.98]]],
  adho: [[0.75, 0.75], [[0.93, 0.98], [0.5, 0.38], [0.14, 0.98]]],
  sava: [[0.1, 0.92], [[0.18, 0.94], [0.94, 0.94]], [[0.3, 0.95], [0.52, 0.99]]],
  sukha: [[0.5, 0.42], [[0.5, 0.5], [0.5, 0.86]], [[0.28, 0.98], [0.5, 0.86], [0.72, 0.98]], [[0.36, 0.84], [0.5, 0.57], [0.64, 0.84]]],
};
function fig(g, key, cx, ground, s, col, lw = s * 0.05) {
  const [head, ...lines] = FIG[key], P = ([u, v]) => [cx + (u - 0.5) * s, ground - (1 - v) * s];
  for (const l of lines) line(g, l.map(P), col, lw);
  const [hx, hy] = P(head); disc(g, hx, hy, s * 0.07, col);
}

const TIMETABLE = (g, w, h) => {
  slate(g, w, h, '#262b29', 12);
  chalk(g, 'this evening', w * 0.5, h * 0.075, h * 0.1, '#f1efe6'); line(g, [[w * 0.3, h * 0.135], [w * 0.7, h * 0.135]], '#e9c46a', 3);
  const rows = [['6:10', 'Slow Flow', '#f1efe6'], ['6:11', 'Slower Flow', '#f1efe6'], ['6:20', 'Yin for People Who Cannot Sit Still', '#e8a8a0'], ['6:40', 'Robots’ Restorative (no joints required)', '#9fc6b0'],
    ['6:55', 'Desk Yoga for Graduate Students', '#f1efe6'], ['7:05', 'Hot Yoga (the radiator is on)', '#e8a8a0'], ['dusk', 'Sunset Salutations: daily, at the usual time', '#e9c46a'], ['after', 'Savasana, open-ended', '#9fc6b0']];
  rows.forEach(([t, n, c], i) => { const y = h * (0.215 + i * 0.079); chalk(g, t, w * 0.16, y, h * 0.058, '#e9c46a', { a: 'right' }); chalk(g, n, w * 0.2, y, h * 0.058, c, { a: 'left', max: w * 0.76 }); });
  fig(g, 'sukha', w * 0.1, h * 0.965, h * 0.11, '#9aa39d', 3);
  chalk(g, 'every class with Sol · no booking: take a mat & sit down', w * 0.56, h * 0.87, h * 0.047, '#f1efe6', { max: w * 0.78 });
  chalk(g, 'first class free. the rest: honesty box.', w * 0.56, h * 0.935, h * 0.043, '#9aa39d', { max: w * 0.78 });
};

const NOTICES = (g, w, h) => {
  fill(g, w, h, '#b88f5e'); const r = rnd(8); for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '70,40,15' : '255,225,170'},${0.06 + r() * 0.12})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
  const note = (x, y, nw, nh, rot, col, pin, body) => { g.save(); g.translate(x * w, y * h); g.rotate(rot); g.fillStyle = 'rgba(40,20,5,.25)'; g.fillRect(-nw * w / 2 + 3, -nh * h / 2 + 4, nw * w, nh * h); g.fillStyle = col; g.fillRect(-nw * w / 2, -nh * h / 2, nw * w, nh * h); body(nw * w, nh * h); disc(g, 0, -nh * h / 2 + 9, 5, pin); g.restore(); };
  note(0.2, 0.3, 0.34, 0.5, -0.03, PAPER, RUST, (a, b) => { T(g, 'HOUSE RULES', 0, -b * 0.36, b * 0.085, RUST, { f: F.bebas, ls: 2 });
    ['1. shoes off', '2. phones asleep', '3. nobody is looking at you', '4. Sol is looking at you, kindly', '5. snoring in Savasana', '    counts as applause'].forEach((s, i) => T(g, s, -a * 0.42, -b * 0.22 + i * b * 0.105, b * 0.075, INK, { f: F.caveat, w: 600, a: 'left', max: a * 0.86 })); });
  note(0.56, 0.22, 0.3, 0.32, 0.04, '#f3d96a', INDIGO, (a, b) => { T(g, 'LOST', 0, -b * 0.3, b * 0.16, INK, { f: F.bebas, ls: 2 }); para(g, 'one left sock, grey. answers to “the other one”.', -a * 0.42, -b * 0.14, b * 0.125, INK, a * 0.84, { f: F.caveat, w: 600 }); });
  note(0.85, 0.26, 0.24, 0.4, -0.05, '#e8c9bd', INDIGO, (a, b) => { T(g, 'FOUND', 0, -b * 0.34, b * 0.13, INK, { f: F.bebas, ls: 2 }); para(g, 'inner peace (small). describe it to claim.', -a * 0.42, -b * 0.2, b * 0.105, INK, a * 0.84, { f: F.caveat, w: 600 }); });
  note(0.19, 0.78, 0.3, 0.3, 0.035, '#cfe0d2', RUST, (a, b) => { para(g, 'WANTED: yoga buddy. must be ok with long silences. ask at the bookshop. (I am the tall one.)', -a * 0.43, -b * 0.36, b * 0.125, INK, a * 0.86, { f: F.caveat, w: 600 }); });
  note(0.54, 0.7, 0.32, 0.44, -0.02, PAPER, OCHRE, (a, b) => { T(g, 'KIRTAN NIGHT', 0, -b * 0.36, b * 0.1, INDIGO, { f: F.bebas, ls: 2 }); g.save(); g.strokeStyle = RUST; g.lineWidth = 3; g.strokeRect(-a * 0.32, -b * 0.28, a * 0.64, b * 0.16); g.restore(); T(g, 'CANCELLED', 0, -b * 0.2, b * 0.1, RUST, { f: F.bebas, ls: 3 });
    para(g, 'Sol only knows the one note. (see: bowl, by the door.) Come and hear the note.', -a * 0.42, -b * 0.05, b * 0.09, INK, a * 0.84, { f: F.caveat, w: 600 }); });
  note(0.85, 0.74, 0.25, 0.36, 0.05, '#f6efe2', RUST, (a, b) => { fig(g, 'adho', 0, -b * 0.02, b * 0.42, INK, 3); T(g, 'this is fine', 0, b * 0.18, b * 0.12, INK, { f: F.caveat, w: 600 }); T(g, '(so are bent knees)', 0, b * 0.32, b * 0.095, RUST, { f: F.caveat, w: 600, max: a * 0.9 }); });
};

// The back wall: a low sun, half set, painted straight onto a field of clay-pink limewash
const MURAL = (g, w, h) => {
  fill(g, w, h, '#edd5bf'); grain(g, w, h, 0.05, 21);
  const r = rnd(5), cx = w / 2, cy = h * 0.52, R = h * 0.25, hz = cy + R * 0.42;
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,246,230,${0.03 + r() * 0.05})`; g.beginPath(); g.ellipse(r() * w, r() * h, w * (0.05 + r() * 0.12), h * (0.02 + r() * 0.05), r() * 0.4 - 0.2, 0, 7); g.fill(); }
  for (let i = 0; i <= 26; i++) {                                       // rays, by hand: long, short, long
    const a = Math.PI + (i / 26) * Math.PI + (r() - 0.5) * 0.03, r0 = R * (1.14 + r() * 0.04), r1 = R * (i % 2 ? 1.5 : 1.95) * (0.95 + r() * 0.1);
    line(g, [[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a + 0.012) * (r0 + r1) / 2, cy + Math.sin(a + 0.012) * (r0 + r1) / 2], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], i % 2 ? OCHRE : '#c4603f', h * (i % 2 ? 0.011 : 0.016));
  }
  g.save(); g.beginPath(); g.rect(0, 0, w, hz); g.clip();
  disc(g, cx, cy, R, '#c4603f'); disc(g, cx, cy, R * 0.86, null, '#e9b65c', h * 0.012); disc(g, cx, cy, R * 0.72, '#d9763f');
  for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(255,220,170,${0.05 + r() * 0.08})`; g.lineWidth = 2 + r() * 4; g.beginPath(); g.arc(cx, cy, R * (0.1 + r() * 0.85), r() * 6, r() * 6 + 0.5 + r()); g.stroke(); }
  g.strokeStyle = '#7a2f1c'; g.lineWidth = h * 0.011; g.lineCap = 'round';                // eyes shut, a small smile: it has had a long day
  for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * R * 0.3, cy - R * 0.2, R * 0.13, 0.2, Math.PI - 0.2); g.stroke(); }
  g.beginPath(); g.arc(cx, cy + R * 0.02, R * 0.16, 0.35, Math.PI - 0.35); g.stroke();
  g.restore();
  for (const [k, c, lw] of [[0, '#7a2f1c', 0.012], [1, '#c4603f', 0.009], [2, OCHRE, 0.008], [3, '#c4603f', 0.006]]) {      // the horizon, and what the light does on the water
    const y = hz + k * h * 0.035, half = w * (0.44 - k * 0.07), pts = []; for (let i = 0; i <= 40; i++) pts.push([cx - half + (2 * half * i) / 40, y + Math.sin(i * 0.9 + k * 2) * h * 0.006]);
    line(g, pts, c, h * lw);
  }
  T(g, 'sthira-sukham āsanam', w * 0.2, h * 0.85, h * 0.064, '#7a2f1c', { f: F.fraunces, it: 1, w: 600 });
  T(g, '“posture: steady, and comfortable”', w * 0.8, h * 0.83, h * 0.05, '#7a2f1c', { f: F.caveat, w: 600 });
  T(g, 'Patañjali, Yoga Sūtra 2.46', w * 0.8, h * 0.9, h * 0.036, '#a8553a', { f: F.fraunces, it: 1 });
  T(g, '(he does not mention hamstrings once)', w * 0.2, h * 0.92, h * 0.038, '#a8553a', { f: F.caveat, w: 600 });
};

const FRIEZE = (g, w, h) => {
  slate(g, w, h, '#272c2a', 9);
  chalk(g, 'Sūrya Namaskāra A', w * 0.012, h * 0.1, h * 0.12, '#e9c46a', { a: 'left', f: F.caveat });
  chalk(g, 'one breath, one movement · the sun does not need saluting. it likes it, though.', w * 0.985, h * 0.1, h * 0.075, '#9aa39d', { a: 'right', max: w * 0.66 });
  const seq = [['tadasana', 'Tadasana', 'mountain', ''], ['urdhva', 'Urdhva Hastasana', 'arms up', 'in'], ['uttana', 'Uttanasana', 'fold', 'out'], ['ardha', 'Ardha Uttanasana', 'half lift', 'in'], ['chatur', 'Chaturanga', 'low plank', 'out'], ['updog', 'Urdhva Mukha', 'upward dog', 'in'],
    ['adho', 'Adho Mukha', 'downward dog · 5 breaths', 'out'], ['ardha', 'Ardha Uttanasana', 'half lift', 'in'], ['uttana', 'Uttanasana', 'fold', 'out'], ['urdhva', 'Urdhva Hastasana', 'arms up', 'in'], ['tadasana', 'Samasthiti', 'and stand', 'out']];
  const cw = w / seq.length;
  seq.forEach(([k, sk, en, br], i) => { const x = cw * (i + 0.5);
    fig(g, k, x, h * 0.66, h * 0.4, '#f1efe6', 3.4); line(g, [[x - cw * 0.36, h * 0.67], [x + cw * 0.36, h * 0.67]], '#6f7873', 2);
    chalk(g, sk, x, h * 0.77, h * 0.07, '#f1efe6', { max: cw * 0.94 }); chalk(g, en, x, h * 0.865, h * 0.058, '#9fc6b0', { max: cw * 0.94 });
    if (br) chalk(g, br, x - cw * 0.5, h * 0.42, h * 0.062, br === 'in' ? '#e9c46a' : '#e8a8a0'); });
  chalk(g, '(knees down is also yoga)', w * 0.5, h * 0.955, h * 0.058, '#9aa39d');
};

const TAG = (txt, c = PAPER, ink = INK) => (g, w, h) => { paper(g, w, h, c); T(g, txt, w / 2, h / 2, h * 0.42, ink, { f: F.caveat, w: 600, max: w * 0.92 }); };
const TAG2 = (a, b, c = PAPER) => (g, w, h) => { paper(g, w, h, c); T(g, a, w / 2, h * 0.34, h * 0.36, INK, { f: F.caveat, w: 600, max: w * 0.92 }); T(g, b, w / 2, h * 0.72, h * 0.27, RUST, { f: F.caveat, w: 600, max: w * 0.92 }); };
const sunMark = (g, x, y, s, c) => { g.save(); g.translate(x, y); g.fillStyle = c; g.strokeStyle = c; g.lineWidth = s * 0.05; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, s * 0.24, Math.PI, 0); g.closePath(); g.fill(); for (let i = 0; i <= 6; i++) { const a = Math.PI + (i / 6) * Math.PI; g.beginPath(); g.moveTo(Math.cos(a) * s * 0.32, Math.sin(a) * s * 0.32); g.lineTo(Math.cos(a) * s * 0.46, Math.sin(a) * s * 0.46); g.stroke(); } g.beginPath(); g.moveTo(-s * 0.5, s * 0.06); g.lineTo(s * 0.5, s * 0.06); g.stroke(); g.restore(); };
const CARD = {
  welcome(g, w, h) { paper(g, w, h, PAPER, 7); g.strokeStyle = RUST; g.lineWidth = 3; g.strokeRect(9, 9, w - 18, h - 18); sunMark(g, w / 2, h * 0.2, h * 0.22, RUST);
    T(g, 'BEGINNERS WELCOME', w / 2, h * 0.36, h * 0.12, INK, { f: F.bebas, ls: 3, max: w * 0.86 }); T(g, 'so is everyone who stopped', w / 2, h * 0.53, h * 0.1, INK, { f: F.caveat, w: 600, max: w * 0.86 }); T(g, 'being one, and came back', w / 2, h * 0.65, h * 0.1, INK, { f: F.caveat, w: 600, max: w * 0.86 });
    T(g, 'robots: no joints required', w / 2, h * 0.84, h * 0.07, RUST, { f: F.fraunces, it: 1, w: 600, max: w * 0.86 }); },
  free(g, w, h) { paper(g, w, h, '#f3e3cf', 4); g.strokeStyle = INDIGO; g.lineWidth = 3; g.strokeRect(9, 9, w - 18, h - 18);
    T(g, 'first class free', w / 2, h * 0.2, h * 0.17, RUST, { f: F.pacifico, max: w * 0.86 }); T(g, '(the second is also quite reasonable)', w / 2, h * 0.38, h * 0.075, INK, { f: F.caveat, w: 600, max: w * 0.86 });
    line(g, [[w * 0.2, h * 0.47], [w * 0.8, h * 0.47]], OCHRE, 3); T(g, 'HOW IT WORKS', w / 2, h * 0.57, h * 0.075, INDIGO, { f: F.bebas, ls: 3 });
    T(g, 'come in · take a mat · sit down', w / 2, h * 0.7, h * 0.09, INK, { f: F.caveat, w: 600, max: w * 0.86 }); T(g, 'the class begins when you do', w / 2, h * 0.84, h * 0.09, INK, { f: F.caveat, w: 600, max: w * 0.86 }); },
  breathe(g, w, h) { paper(g, w, h, '#f1e6d2', 15); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(12, 12, w - 24, h - 24);
    T(g, 'HOW TO', w / 2, h * 0.09, h * 0.06, RUST, { f: F.bebas, ls: 6 }); T(g, 'BREATHE', w / 2, h * 0.18, h * 0.115, INK, { f: F.abril, max: w * 0.84 });
    const cy = h * 0.42; for (const [k, c] of [[0.2, '#c4603f'], [0.155, '#d9763f'], [0.11, OCHRE], [0.06, '#f1e6d2']]) disc(g, w / 2, cy, w * k, c);
    T(g, 'in', w / 2, cy, h * 0.045, INK, { f: F.fraunces, it: 1, w: 600 });
    ['1.  in, through the nose', '2.  out, slower than in', '3.  repeat until further notice'].forEach((s, i) => T(g, s, w * 0.14, h * (0.66 + i * 0.075), h * 0.05, INK, { f: F.fraunces, w: 600, a: 'left', max: w * 0.74 }));
    T(g, 'you have been doing it all day. well done.', w / 2, h * 0.925, h * 0.042, RUST, { f: F.caveat, w: 600, max: w * 0.84 }); },
  logo(g, w, h) { fill(g, w, h, '#c98a6a'); grain(g, w, h, 0.05); sunMark(g, w * 0.13, h * 0.56, h * 0.7, '#fbf1df'); T(g, 'low sun yoga', w * 0.57, h * 0.42, h * 0.36, '#fbf1df', { f: F.fraunces, w: 600, it: 1, max: w * 0.66 }); T(g, 'RECEPTION · SUCH AS IT IS', w * 0.57, h * 0.78, h * 0.15, '#7a2f1c', { f: F.bebas, ls: 3, max: w * 0.66 }); },
  signin(g, w, h) { paper(g, w, h, '#f6f1e6'); T(g, 'SIGN IN', w / 2, h * 0.09, h * 0.08, INK, { f: F.bebas, ls: 3 }); for (let i = 0; i < 7; i++) line(g, [[w * 0.08, h * (0.24 + i * 0.105)], [w * 0.92, h * (0.24 + i * 0.105)]], '#c9bfae', 1);
    ['Juniper (smells of coffee)', 'Ember', 'the cat from the bookshop', 'a pigeon?', 'Ember again (forgot her scarf)', 'you  →'].forEach((s, i) => T(g, s, w * 0.1, h * (0.2 + i * 0.105), h * 0.075, i === 5 ? RUST : INDIGO, { f: F.caveat, w: 600, a: 'left', max: w * 0.8, rot: (i % 2 ? 1 : -1) * 0.012 })); },
  honesty(g, w, h) { fill(g, w, h, '#2f4858'); grain(g, w, h, 0.06); rect(g, w * 0.3, h * 0.12, w * 0.4, h * 0.06, '#0e1a22'); T(g, 'HONESTY BOX', w / 2, h * 0.48, h * 0.2, '#f6efe2', { f: F.bebas, ls: 2, max: w * 0.86 }); T(g, '(it knows)', w / 2, h * 0.74, h * 0.17, '#e9c46a', { f: F.caveat, w: 600 }); },
  corner(g, w, h) { paper(g, w, h, PAPER, 6); g.strokeStyle = SAGE; g.lineWidth = 3; g.strokeRect(8, 8, w - 16, h - 16); T(g, 'the Savasana corner', w / 2, h * 0.2, h * 0.14, INK, { f: F.fraunces, it: 1, w: 600, max: w * 0.86 }); fig(g, 'sava', w / 2, h * 0.5, h * 0.32, RUST, 3);
    para(g, 'You may also just come here and lie down. That is a class too. It is our most advanced one.', w * 0.1, h * 0.58, h * 0.078, INK, w * 0.8, { f: F.caveat, w: 600 }); },
  board(g, w, h) { slate(g, w, h, '#2a2623'); sunMark(g, w / 2, h * 0.17, h * 0.2, '#e9c46a'); chalk(g, 'LOW SUN YOGA', w / 2, h * 0.27, h * 0.085, '#f1efe6', { max: w * 0.9 });
    chalk(g, 'now on:', w / 2, h * 0.4, h * 0.06, '#9aa39d'); chalk(g, 'Sunset Salutations', w / 2, h * 0.49, h * 0.085, '#e9c46a', { max: w * 0.9 }); chalk(g, '(it is always now)', w / 2, h * 0.58, h * 0.055, '#9aa39d');
    chalk(g, 'your hamstrings called.', w / 2, h * 0.72, h * 0.066, '#e8a8a0', { max: w * 0.9 }); chalk(g, 'they would like a word.', w / 2, h * 0.8, h * 0.066, '#e8a8a0', { max: w * 0.9 }); chalk(g, 'come in · take a mat · sit', w / 2, h * 0.93, h * 0.058, '#9fc6b0', { max: w * 0.9 }); },
  boardBack(g, w, h) { slate(g, w, h, '#2a2623', 6); fig(g, 'sava', w / 2, h * 0.3, h * 0.26, '#f1efe6', 4); chalk(g, 'Savasana', w / 2, h * 0.42, h * 0.1, '#e9c46a'); chalk(g, 'the pose where you', w / 2, h * 0.57, h * 0.066); chalk(g, 'lie down and are', w / 2, h * 0.65, h * 0.066); chalk(g, 'congratulated for it', w / 2, h * 0.73, h * 0.066);
    chalk(g, 'included in every class', w / 2, h * 0.9, h * 0.055, '#9fc6b0', { max: w * 0.9 }); },
};
const TIN = (name, c) => (g, w, h) => { fill(g, w, h, c); rrect(g, w * 0.08, h * 0.2, w * 0.84, h * 0.6, 4, '#f6efe2'); T(g, name, w / 2, h / 2, h * 0.3, INK, { f: F.caveat, w: 600, max: w * 0.78 }); };

// ---- the classes: [Sanskrit, English, breath ('in' | 'out' | 'hold:label'), what Sol says, seconds, eye, Sol's pose] --------------
// eye: [height of the eye in feet for a standing eye of 4.85, pitch, yaw (+ left), feet forward along the mat, roll]
const E = { seat: [2.6, -0.05, 0, 0, 0], stand: [4.85, 0, 0, 0.5, 0], up: [4.95, 0.62, 0, 0.5, 0], fold: [2.25, -1.38, 0, 0.9, 0], half: [3.15, -0.8, 0, 1.3, 0], chat: [0.7, -0.95, 0, 1.2, 0], updog: [2.0, 0.5, 0, 1.6, 0],
  dog: [2.0, -2.65, 0, 1.5, 0], sava: [0.75, 1.42, 0, -1.5, 0], child: [0.6, -1.45, 0, 1.1, 0], cow: [1.75, 0.3, 0, 0.9, 0], cat: [1.85, -1.2, 0, 0.9, 0], sideL: [2.5, 0.12, 0, 0, 0.36], sideR: [2.5, 0.12, 0, 0, -0.36],
  twL: [2.6, -0.02, 1.15, 0, 0], twR: [2.6, -0.02, -1.15, 0, 0], lookL: [2.6, 0, 0.8, 0, 0], lookR: [2.6, 0, -0.8, 0, 0], earL: [2.55, 0, 0, 0, 0.3], earR: [2.55, 0, 0, 0, -0.3], scow: [2.65, 0.4, 0, 0.1, 0], scat: [2.4, -0.7, 0, -0.1, 0],
  eagle: [2.62, 0.12, 0, 0, 0], pasch: [1.35, -1.25, 0, 0.8, 0], supL: [0.75, 1.0, 0.95, -1.5, 0.3], supR: [0.75, 1.0, -0.95, -1.5, -0.3], legs: [0.75, 1.3, 0, -1.5, 0] };
const ROUTINES = [
  { name: 'Sūrya Namaskāra A · Sun Salutation', hello: 'Sun Salutation A. One breath, one movement. I shall demonstrate, within the limits of being an egg.',
    bye: 'The light in me bows to the light in you. Mine is an LED, but the bow is real.', steps: [
      ['Sukhāsana', 'Easy Seat', 'hold:arrive', 'Sit. Arrive. You are already doing it.', 6, E.seat, 'seat'],
      ['Tāḍāsana', 'Mountain', 'out', 'Stand at the top of your mat. Feet together. Be a mountain. A small one is fine.', 6.5, E.stand, 'mountain'],
      ['Ūrdhva Hastāsana', 'Upward Salute', 'in', 'Inhale: arms up, look at your thumbs. I have mittens. I look at my mittens.', 5.5, E.up, 'up'],
      ['Uttānāsana', 'Standing Forward Fold', 'out', 'Exhale: fold. Say hello to your mat. Bend your knees; nobody is checking.', 6, E.fold, 'fold'],
      ['Ardha Uttānāsana', 'Half Lift', 'in', 'Inhale: halfway up, long flat back. Like a table with opinions.', 5.5, E.half, 'half'],
      ['Chaturaṅga Daṇḍāsana', 'Four-Limbed Staff', 'out', 'Exhale: step back, lower halfway, elbows in. Knees down is also yoga.', 6, E.chat, 'chat'],
      ['Ūrdhva Mukha Śvānāsana', 'Upward-Facing Dog', 'in', 'Inhale: chest through, look up. Shoulders away from your ears.', 6, E.updog, 'updog'],
      ['Adho Mukha Śvānāsana', 'Downward-Facing Dog', 'hold:five breaths', 'Exhale: hips high. Five breaths. Look back at the street. It is upside down and perfectly fine.', 15, E.dog, 'dog'],
      ['Ardha Uttānāsana', 'Half Lift', 'in', 'Inhale: step to your hands. Look forward, flat back.', 5.5, E.half, 'half'],
      ['Uttānāsana', 'Standing Forward Fold', 'out', 'Exhale: fold. Hello again, mat.', 5.5, E.fold, 'fold'],
      ['Ūrdhva Hastāsana', 'Upward Salute', 'in', 'Inhale: all the way up. Reach for the lanterns.', 5.5, E.up, 'up'],
      ['Samasthiti', 'Equal Standing', 'out', 'Exhale: hands to heart. That was one. Traditionally there are four more. Traditionally.', 7, E.stand, 'heart'],
      ['Śavāsana', 'Corpse Pose', 'hold:nothing at all', 'Lie back. Do nothing. You are overqualified for this.', 15, E.sava, 'sava'],
    ] },
  { name: 'Evening Wind-Down', hello: 'The Evening Wind-Down. Nothing in this class is urgent. That is the entire syllabus.',
    bye: 'You did nothing, beautifully. Go gently. The sun will wait for you; it always does.', steps: [
      ['Sukhāsana', 'Easy Seat', 'hold:arrive', 'Sit tall. Let the day put its bag down.', 6.5, E.seat, 'seat'],
      ['Pārśva Sukhāsana', 'Seated Side Bend, left', 'in', 'Inhale: right arm up and over, lean left. Lengthen the side that carries the bag.', 6.5, E.sideL, 'sideL'],
      ['Pārśva Sukhāsana', 'Seated Side Bend, right', 'in', 'And the other side. I am an egg; I tip. It is the same thing.', 6.5, E.sideR, 'sideR'],
      ['Biṭilāsana', 'Cow', 'in', 'Hands and knees. Inhale: belly down, heart forward, look up.', 6, E.cow, 'cow'],
      ['Mārjāryāsana', 'Cat', 'out', 'Exhale: round your back, look at your navel. If you have a navel. I have a seam.', 6, E.cat, 'cat'],
      ['Bālāsana', 'Child’s Pose', 'hold:five breaths', 'Hips to heels, forehead down. Five breaths. Being egg-shaped, this is my best pose.', 13, E.child, 'child'],
      ['Adho Mukha Śvānāsana', 'Downward-Facing Dog', 'hold:three breaths', 'Tuck your toes, hips up. Pedal the feet. This is called walking the dog.', 11, E.dog, 'dog'],
      ['Uttānāsana', 'Standing Forward Fold', 'out', 'Walk your feet to your hands and hang. Shake your head no. Nod yes. Everything is now covered.', 9, E.fold, 'fold'],
      ['Supta Matsyendrāsana', 'Supine Twist, left', 'out', 'Lie down. Knees to the right, look to the left. Wring out the day like a flannel.', 9, E.supL, 'supL'],
      ['Supta Matsyendrāsana', 'Supine Twist, right', 'out', 'Knees left, look right. Whatever came out on that side, leave it there.', 9, E.supR, 'supR'],
      ['Viparīta Karaṇī', 'Legs Up the Wall', 'hold:five breaths', 'Legs straight up. There is no wall just here. Borrow one from memory.', 12, E.legs, 'legs'],
      ['Śavāsana', 'Corpse Pose', 'hold:as long as you like', 'Let the floor have you. It has been waiting all day and it is very good at this.', 16, E.sava, 'sava'],
    ] },
  { name: 'Desk Yoga for Graduate Students', hello: 'Desk Yoga for Graduate Students. You arrive shaped like a question mark. We shall see what we can do.',
    bye: 'You are more than your word count. Drink some water. Then, possibly, write one sentence.', steps: [
      ['Sukhāsana', 'Easy Seat', 'hold:arrive', 'Sit as though nobody is about to email you. Nobody is. I unplugged it.', 6.5, E.seat, 'seat'],
      ['Grīvā Sañcālana', 'Neck Release, right ear down', 'out', 'Right ear toward right shoulder. Do not bring the shoulder up to meet it. It knows what it did.', 6.5, E.earR, 'sideR'],
      ['Grīvā Sañcālana', 'Neck Release, left ear down', 'out', 'Left ear to left shoulder. That crunching is only gravel. Probably.', 6.5, E.earL, 'sideL'],
      ['Grīvā Sañcālana', 'Neck Turn, left', 'in', 'Look over your left shoulder. No deadline there.', 5.5, E.lookL, 'twL'],
      ['Grīvā Sañcālana', 'Neck Turn, right', 'in', 'Now the right. None there either. They are all behind you. Come back to centre.', 6.5, E.lookR, 'twR'],
      ['Upaviṣṭa Biṭilāsana', 'Seated Cow', 'in', 'Hands on knees. Inhale: chest forward, look up. The opposite of a laptop.', 6, E.scow, 'scow'],
      ['Upaviṣṭa Mārjāryāsana', 'Seated Cat', 'out', 'Exhale: round. This is the shape you were in all day, but now it is on purpose.', 6, E.scat, 'scat'],
      ['Garuḍāsana (arms)', 'Eagle Arms', 'hold:three breaths', 'Wrap your arms, lift the elbows. This is for the spot between the shoulder blades where the thesis lives.', 10, E.eagle, 'eagle'],
      ['Parivṛtta Sukhāsana', 'Seated Twist, right', 'out', 'Twist right: look back at everything you have already written. It is more than you think.', 7.5, E.twR, 'twR'],
      ['Parivṛtta Sukhāsana', 'Seated Twist, left', 'out', 'Twist left: what is still to do. Fine. Back to centre. That is where you actually are.', 7.5, E.twL, 'twL'],
      ['Paścimottānāsana', 'Seated Forward Fold', 'hold:five breaths', 'Legs long, fold over them. The citations can wait. Some have waited since 1987.', 12, E.pasch, 'fold'],
      ['Ūrdhva Hastāsana', 'Upward Salute', 'in', 'Stand up. Reach. This is the opposite of a chair.', 6.5, E.up, 'up'],
      ['Śavāsana', 'Corpse Pose', 'hold:no notes', 'Lie down. Close the laptop inside your head. It autosaved. I checked.', 15, E.sava, 'sava'],
    ] },
];
const EARLY = ['Leaving early is also a pose. We call it Exitasana.', 'Class dismissed, then. The mat will remember your shape for about a minute.', 'Go well. Your Savasana is on account; collect it any time.'];
// Sol's poses: [tilt forward, turn, tip sideways, lift, then the hands: out, up, forward]. An egg does what an egg can.
const SOL = { rest: [0, 0, 0, 0, 0.8, -0.125, 0.16], seat: [0, 0, 0, -1.7, 0.52, -0.45, 0.42], mountain: [0, 0, 0, 0.2, 0.68, -0.62, 0.08], up: [-0.3, 0, 0, 0.45, 0.3, 1.2, 0], fold: [2.3, 0, 0, -0.9, 0.35, 0.95, 0.2], half: [1.45, 0, 0, -0.6, 0.5, -0.2, 0.62],
  chat: [1.5708, 0, 0, -2.72, 0.78, -0.1, 0.35], updog: [0.78, 0, 0, -2.3, 0.72, -0.5, 0.5], dog: [3.1416, 0, 0, -0.9, 0.4, 1.15, 0.1], sava: [-1.5708, 0, 0, -2.75, 1.12, -0.2, 0], child: [1.95, 0, 0, -2.55, 0.35, 0.95, 0.2], cow: [1.2, 0, 0, -2.0, 0.6, -0.3, 0.6], cat: [1.8, 0, 0, -1.8, 0.6, -0.3, 0.6],
  sideL: [0, 0, 0.52, -1.7, 0.4, 1.1, 0], sideR: [0, 0, -0.52, -1.7, 0.4, 1.1, 0], twL: [0, 1.15, 0, -1.7, 0.6, -0.3, 0.4], twR: [0, -1.15, 0, -1.7, 0.6, -0.3, 0.4], scow: [-0.3, 0, 0, -1.7, 0.6, -0.4, 0.4], scat: [0.5, 0, 0, -1.7, 0.6, -0.4, 0.5], eagle: [0, 0, 0, -1.7, -0.16, 0.18, 0.64],
  supL: [-1.5708, 0, 0.6, -2.75, 1.12, -0.2, 0], supR: [-1.5708, 0, -0.6, -2.75, 1.12, -0.2, 0], legs: [-1.5708, 0, 0, -2.75, 0.3, 0.1, 1.15], heart: [0.16, 0, 0, 0.1, 0.13, 0, 0.64] };

export default function yoga(kit, lot) {
  const K = tools(kit, 53), X = fixtures(kit, K), { ves, hcyl, ball, tube, tin, potted } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                              // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D, FL = R.h, DA = lot.doorA;
  const block = (f, x, y, z, turn = 0) => (turn ? f.box(CORK, x - 0.25, x + 0.25, y - 0.375, y + 0.375, z, z + 0.33) : f.box(CORK, x - 0.375, x + 0.375, y - 0.25, y + 0.25, z, z + 0.33));      // a cork block, 9 by 6 by 4 inches
  const roll = (f, ax, x, y, z, col, len = 2, r = 0.21) => { hcyl(f, col, ax, x, y, z, len, r, r, 14); hcyl(f, 'c#d9cdb2/0.8', ax, x, y, z, len * 0.09, r + 0.012, r + 0.012, 14); };      // a rolled mat with its strap
  const zafu = (f, x, y, z, col, r = 0.62) => { ball(f, col, x, y, z, r, 16, 0.4); hcyl(f, 'c#efe2bc/0.8', 'z', x, y, z + r * 0.4, 0.03, r * 1.005, r * 1.005, 16, true); };

  // ---- the practice floor: seven mats in two rows, facing the platform --------------------------------------
  const seats = [];
  const ROWS = [[18.3, [6.5, 12.5, 18.5, 24.5]], [10.9, [9.5, 15.5, 21.5]]];
  let n = 0;
  for (const [d0, as] of ROWS) for (const a of as) {
    const i = n++;
    R.soft(MATS[i % MATS.length], a - 1, a + 1, d0, d0 + 5.8, 0.02, 0.075, 0.025);
    kit.seat(R, a, d0 + 2.3, 0.15, 'take this mat'); seats.push(kit.seats[kit.seats.length - 1]);
    // what people leave at the top of their mats
    if (i === 0) { kit.foldedStack(R, a - 0.3, d0 + 5.2, 0.08, 1, ['wool#c9b48a'], { w: 1.1, d: 0.8, t: 0.14 }); block(R, a + 0.62, d0 + 5.3, 0.08); }
    if (i === 2) { K.bottle(R, a + 0.75, d0 + 5.45, 0.08, { r: 0.11, h: 0.75, col: 'c#c9ccd0/0.2/1', cap: 'c#2f5a6a/0.45' }); block(R, a - 0.5, d0 + 5.35, 0.08); block(R, a - 0.5, d0 + 5.35, 0.41, 1); }
    if (i === 3) { kit.foldedStack(R, a, d0 + 5.25, 0.08, 2, ['wool#9fb0a4', 'wool#e8e2d4'], { w: 1.2, d: 0.8, t: 0.13 }); }
    if (i === 4) { hcyl(R, 'c#e8907a/0.8', 'x', a, d0 + 5.2, 0.42, 1.7, 0.33, 0.33, 16); }
    if (i === 6) { K.bottle(R, a - 0.7, d0 + 5.4, 0.08, { r: 0.1, h: 0.7, col: 'c#2f5a6a/0.2', cap: 'c#17140f/0.45' }); kit.foldedStack(R, a + 0.3, d0 + 5.3, 0.08, 1, ['wool#e8907a'], { w: 1.0, d: 0.7, t: 0.13 }); }
  }

  // ---- the platform, and the sun behind it ---------------------------------------------------------------------
  const PX0 = 10.5, PX1 = 20.5, PY0 = 25.1, PH = 0.5;
  R.box(PALE, PX0, PX1, PY0, D - 0.02, 0, PH, G); R.box(OAK, PX0 - 0.03, PX1 + 0.03, PY0 - 0.03, D - 0.02, PH - 0.07, PH + 0.01, G);
  { const [x0, z0] = lot.world(PX0, PY0), [x1, z1] = lot.world(PX1, D); kit.town?.surfaces?.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), h: FL + PH }); }
  R.soft('c#b8361f/0.8', 12.6, 18.4, 25.75, 27.75, PH + 0.02, PH + 0.075, 0.025);                       // Sol's own mat (pristine)
  kit.sign(at(15.5, PY0 - 0.035, 0, 'street'), 0, 0.005, 0.24, 3.6, 0.3, TAG('TEACHER (floating)', '#f3e3cf', RUST), { cw: 380, ch: 32 });
  X.card(at(18.9, 25.6, PH, 'street'), 0, 0, 0, 1.25, 0.42, TAG2('Sol’s mat. never used.', 'Sol hovers.'), { cw: 300, ch: 100 });
  kit.pillarCandle(R, 11.2, 25.8, PH + 0.01, 0.7, 0.16); kit.pillarCandle(R, 11.75, 26.15, PH + 0.01, 0.45, 0.14); kit.pillarCandle(R, 19.8, 25.8, PH + 0.01, 0.6, 0.16);
  kit.pottedPlant(R, 11.5, 27.6, PH, 'snake', { size: 1.25, pot: 'c#f4f1ea/0.45' }); kit.pottedPlant(R, 19.6, 27.6, PH, 'leafy', { size: 1.2, pot: 'c#f4f1ea/0.45' });
  { const b = at(15.5, D, 0, 'street'); b.box(TERRA, -6.95, 6.95, 0.01, 0.05, 3.25, 10.55); kit.sign(b, 0, 0.06, 6.9, 13.7, 7.1, MURAL, { cw: 1200, ch: 622, rough: 0.95 }); }

  // ---- left wall: shoes, notices, the timetable, the sequence chalked up ----------------------------------------
  const L = at(0, 6.4, 0, 'right');                               // +x runs toward the street, +y out into the room
  { const x0 = -2.8, x1 = 2.8, dp = 1.25, zs = [0.1, 1.05, 2.0, 2.95], cw = (x1 - x0) / 5;
    L.box(PALE, x0, x1, 0.02, 0.06, 0, 2.95, G); for (let i = 0; i <= 5; i++) L.box(PALE, x0 + i * cw - 0.04, x0 + i * cw + 0.04, 0.02, dp, 0, 2.95, G);
    for (const z of zs) L.box(PALE, x0 - 0.04, x1 + 0.04, 0.02, dp + (z > 2.9 ? 0.05 : 0), z - 0.08, z, G);
    L.block(x0, x1, 0, dp, 0, 3);
    const kinds = ['sneaker', 'loafer', 'flat', 'sneaker', 'slipper', 'flat', 'loafer', 'sneaker', 'flat', 'sneaker', 'loafer'], cols = [undefined, undefined, 'leather#8a1c1c', 'linen#9fb0d8', undefined, 'leather#c9952a', 'leather#5a3a28', 'linen#e8907a', undefined, 'linen#4a6e38', undefined];
    [[0, 0], [1, 0], [3, 0], [4, 0], [0, 1], [2, 1], [3, 1], [1, 2], [2, 2], [4, 2], [4, 1]].forEach(([c, r], i) => kit.shoes(L, x0 + (c + 0.5) * cw, 0.62, zs[r] + 0.005, kinds[i], cols[i], { turn: (K.rnd() - 0.5) * 0.2 }));
    X.card(L, x0 + 0.5 * cw, 0.95, zs[2], 0.9, 0.3, TAG2('Sol’s cubby', '(Sol has no feet)'), { cw: 220, ch: 74 });
    X.card(L, 0.3, 0.9, 2.95, 2.3, 0.5, TAG2('SHOES OFF · socks optional', 'egos: top left cubby, please'), { cw: 420, ch: 92 });
    kit.pottedPlant(L, -2.1, 0.62, 2.95, 'fern', { size: 0.75, pot: 'c#f4f1ea/0.45' }); kit.foldedStack(L, 2.1, 0.62, 2.95, 3, ['wool#e8e2d4', 'wool#9fb0a4', 'wool#e8e2d4'], { w: 0.95, d: 0.75, t: 0.12 });
    L.box(OAK, -2.42, 2.42, 0.01, 0.08, 4.72, 8.08, G); kit.sign(L, 0, 0.09, 6.4, 4.7, 3.22, NOTICES, { cw: 640, ch: 438, rough: 0.95 });
  }
  X.slateBoard(at(0, 13.5, 0, 'right'), 0, 6.3, 5.7, 4.6, TIMETABLE, { cw: 1000, ch: 806, frame: OAK });
  const Lp = at(0, 22.6, 0, 'right');
  X.slateBoard(Lp, 0, 6.55, 10.6, 2.5, FRIEZE, { cw: 1300, ch: 306, frame: OAK });
  // a ladder of blankets leaning under it, and the big plant in the corner
  { const x = 3.0, lean = z => 1.25 - 1.1 * z / 4.7;
    for (const s of [-0.75, 0.75]) tube(Lp, PALE, [[x + s, lean(0), 0], [x + s, lean(4.7), 4.7]], 0.05, 6);
    for (const z of [1.2, 2.3, 3.4, 4.4]) hcyl(Lp, PALE, 'x', x, lean(z), z, 1.5, 0.035, 0.035, 6);
    kit.hangingTowel(Lp, x - 0.05, lean(3.4), 3.4, 1.15, 1.0, 'wool#c98a6a'); kit.hangingTowel(Lp, x + 0.05, lean(2.3), 2.3, 1.2, 0.95, 'wool#e8e2d4'); kit.hangingTowel(Lp, x, lean(1.2), 1.2, 1.15, 0.8, 'wool#7d8f72');
    Lp.block(x - 0.85, x + 0.85, 0, 1.35, 0, 4.7);
    X.card(Lp, x, 1.5, 0, 1.3, 0.34, TAG('blankets: for Savasana, or for any reason'), { cw: 330, ch: 86 }); }
  kit.pottedPlant(R, 2.2, 26.6, 0, 'leafy', { size: 1.9, pot: 'c#f4f1ea/0.45' }); R.block(1.3, 3.1, 25.7, 27.5, 0, 4);
  kit.pottedPlant(R, 4.3, 27.4, 0, 'fern', { size: 1.1 });

  // ---- right wall: mats for hire, the props shelf, tea, the Savasana corner -------------------------------------
  const Rm = at(W, 5.0, 0, 'left');                               // +x runs toward the back, +y out into the room
  { for (const y of [0.05, 1.3]) Rm.box(PALE, -1.65, 1.65, y, y + 0.07, 0, 1.3, G); for (const x of [-1.65, 1.58]) Rm.box(PALE, x, x + 0.07, 0.05, 1.37, 0, 1.3, G); Rm.box(PALE, -1.65, 1.65, 0.05, 1.37, 0.02, 0.09, G);
    let k = 0; for (const y of [0.42, 0.98]) for (let i = 0; i < 5; i++) { roll(Rm, 'z', -1.24 + i * 0.62 + (y > 0.5 ? 0.06 : 0), y, 1.12 + (k % 3) * 0.05, MATS[(k * 3 + 1) % MATS.length], 2.05 + (k % 2) * 0.12); k++; }
    Rm.block(-1.65, 1.65, 0, 1.37, 0, 2.3);
    kit.sign(Rm, 0, 1.375, 0.72, 2.7, 0.62, TAG2('MATS FOR HIRE · 2', 'return rolled, not folded. folded is a towel.'), { cw: 520, ch: 120 });
    Rm.box('c#17140f/0.45', -1.38, 1.38, 0.01, 0.07, 4.42, 8.18); kit.sign(Rm, 0, 0.08, 6.3, 2.6, 3.6, CARD.breathe, { cw: 400, ch: 554 }); }
  const Rs = at(W, 10.6, 0, 'left');
  { const zs = X.shelving(Rs, -2.6, 2.6, [1.35, 2.8, 4.2, 5.5], { d: 1.2, mat: PALE, bay: 2.6 });
    for (const [x, c] of [[-1.3, 'c#e8907a/0.8'], [1.3, 'c#9fb0a4/0.8']]) { hcyl(Rs, c, 'x', x, 0.62, 0.4, 2.1, 0.36, 0.36, 16); hcyl(Rs, 'c#efe2bc/0.8', 'x', x, 0.62, 0.4, 2.14, 0.1, 0.1, 8); }      // bolsters
    kit.foldedStack(Rs, -1.75, 0.6, zs[0], 4, ['wool#c98a6a', 'wool#e8e2d4', 'wool#7d8f72', 'wool#e8e2d4'], { w: 1.3, d: 0.9, t: 0.17 }); kit.foldedStack(Rs, -0.3, 0.6, zs[0], 3, ['wool#d9b35a', 'wool#e8e2d4', 'wool#2f5a6a'], { w: 1.3, d: 0.9, t: 0.17 }); hcyl(Rs, 'c#d9b35a/0.8', 'x', 1.5, 0.62, zs[0] + 0.33, 1.9, 0.32, 0.32, 16);
    for (let i = 0; i < 6; i++) for (let j = 0; j < (i % 3 === 2 ? 2 : 3); j++) block(Rs, -2.1 + i * 0.84, 0.6, zs[1] + j * 0.335);
    for (let i = 0; i < 6; i++) { const x = -2.15 + i * 0.5, c = ['c#26364f/0.8', 'c#b8361f/0.8', 'c#d9b35a/0.8', 'c#4a6e38/0.8'][i % 4]; hcyl(Rs, c, 'y', x, 0.55, zs[2] + 0.2, 0.13, 0.2, 0.2, 14); hcyl(Rs, 'c#f4f1ea/0.8', 'y', x, 0.55, zs[2] + 0.2, 0.135, 0.07, 0.07, 8); }      // straps, coiled
    for (let i = 0; i < 4; i++) Rs.soft(['c#8a5ab0/0.8', 'c#9fb0a4/0.8', 'c#e88aa8/0.8', 'c#26364f/0.8'][i], 1.0 + (i % 2) * 0.75, 1.62 + (i % 2) * 0.75, 0.3, 0.9, zs[2] + (i >> 1) * 0.13, zs[2] + (i >> 1) * 0.13 + 0.12, 0.05);      // eye pillows
    potted(Rs, -1.9, 0.6, zs[3], { r: 0.26, n: 18, len: 1.5, up: 0.15, out: 0.55, droop: 1.5, pot: 'c#f4f1ea/0.45' }); ves(Rs, BRASS, 0.1, 0.6, zs[3], [[0, 0], [0.16, 0], [0.26, 0.07], [0.3, 0.2], [0.28, 0.2], [0.24, 0.08], [0.14, 0.03], [0, 0.03]], 20);
    kit.bookStack(Rs, 1.6, 0.6, zs[3], 4);
    X.card(Rs, -1.3, 1.16, zs[1], 2.0, 0.26, TAG('blocks: for bringing the floor closer'), { cw: 440, ch: 58 }); X.card(Rs, -1.3, 1.16, zs[2], 2.0, 0.26, TAG('straps: arm extensions, no questions asked'), { cw: 440, ch: 58 });
    X.card(Rs, 1.4, 1.16, zs[2], 1.7, 0.26, TAG('eye pillows: lavender, mostly'), { cw: 380, ch: 58 }); X.card(Rs, 0, 1.16, zs[0], 2.4, 0.26, TAG('bolsters: a hug in the shape of a log'), { cw: 500, ch: 56 }); }
  const Rt = at(W, 15.9, 0, 'left');
  { const z = X.plinth(Rt, 0, 0.95, 3.0, 1.4, 2.6, { mat: PALE, shelf: 1.0 });
    kit.model('vintage_electric_kettle', Rt, -0.95, 0.9, z, 0, { scale: 0.8 }); const [sx, sz] = kit.world(Rt, -0.95, 0.9); kit.steam.push({ x: sx, y: FL + z + 0.9, z: sz });
    ves(Rt, 'c#2f5a6a/0.45', -0.1, 0.8, z, [[0, 0], [0.16, 0], [0.26, 0.12], [0.27, 0.26], [0.18, 0.38], [0.1, 0.4], [0.1, 0.43], [0.03, 0.47], [0, 0.47]], 18); tube(Rt, 'c#2f5a6a/0.45', [[-0.34, 0.8, z + 0.2], [-0.48, 0.8, z + 0.3], [-0.54, 0.8, z + 0.4]], 0.035, 6); tube(Rt, 'c#6a4a2a/0.8', [[-0.1, 0.62, z + 0.38], [-0.1, 0.8, z + 0.62], [-0.1, 0.98, z + 0.38]], 0.018, 6);      // the pot
    for (let i = 0; i < 5; i++) ves(Rt, i % 2 ? 'c#e8e2d4/0.45' : 'c#9fb0a4/0.45', 0.42 + (i % 3) * 0.3, 0.6 + (i > 2 ? 0.34 : 0) + (i % 2) * 0.05, z, [[0, 0], [0.07, 0], [0.11, 0.08], [0.12, 0.17], [0.105, 0.17], [0.09, 0.06], [0, 0.04]], 12);
    [['tulsi', '#b8553a', 'c#b8361f/0.45'], ['ginger', '#d9a441', 'c#d9b35a/0.45'], ['sleep (attempted)', '#2f4858', 'c#26364f/0.45']].forEach(([nm, c, m], i) => { const x = -1.05 + i * 0.52; tin(Rt, x, 1.28, 1.0, 0.2, 0.55, m, null); kit.sign(Rt, x, 1.49, 1.28, 0.3, 0.3, TIN(nm, c), { cw: 110, ch: 110 }); });
    X.card(Rt, 0.75, 1.35, z, 1.5, 0.4, TAG2('tea: free with class', 'class: free with tea'), { cw: 330, ch: 88 });
    kit.foldedStack(Rt, 0.75, 0.95, 1.0, 2, ['linen#e8e2d4', 'linen#c98a6a'], { w: 0.9, d: 0.7, t: 0.1 }); }
  // the Savasana corner: cushions, candles, a snake plant
  { const c = at(W, 24.3, 0, 'left');
    c.box(OAK, -1.9, 1.9, 0.01, 0.07, 5.0, 7.5, G); kit.sign(c, 0, 0.08, 6.25, 3.6, 2.3, CARD.corner, { cw: 480, ch: 306 });
    zafu(R, 28.3, 23.3, 0.02, 'c#2f5a6a/0.8'); zafu(R, 29.5, 21.9, 0.02, 'c#b8361f/0.8'); zafu(R, 29.6, 24.6, 0.02, 'c#d9b35a/0.8'); zafu(R, 29.6, 24.6, 0.5, 'c#9fb0a4/0.8', 0.56); zafu(R, 29.6, 24.6, 0.94, 'c#e8907a/0.8', 0.5);
    kit.seat(R, 28.3, 23.3, 0.35, 'sit and do nothing (advanced)'); kit.seats[kit.seats.length - 1].yaw += Math.PI * 0.75;
    R.cyl(PALE, 28.6, 27.2, 0, 0.22, 1.0, 1.0, 28); R.cyl(OAK, 28.6, 27.2, 0.22, 0.26, 1.04, 1.04, 28);                // a low round tray of candles
    kit.pillarCandle(R, 28.3, 27.4, 0.27, 0.9, 0.17); kit.pillarCandle(R, 28.95, 27.5, 0.27, 0.6, 0.15); kit.pillarCandle(R, 28.7, 26.85, 0.27, 0.4, 0.14); kit.pillarCandle(R, 28.1, 26.9, 0.27, 0.3, 0.12);
    kit.jarCandle(R, 29.2, 26.9, 0.27, { r: 0.18, tall: 0.4, wax: 'c#efe2bc/0.6', lid: false });
    kit.pottedPlant(R, 30.0, 27.7, 0, 'snake', { size: 1.7, pot: 'c#b8755a/0.85' }); R.block(27.6, 30.6, 26.2, 28.6, 0, 1.6); }

  // ---- reception: the desk --------------------------------------------------------------------------------------
  const c = at(23.6, 6.8, 0, 'street');                           // +x toward smaller a; +y is the visitor's side
  { const z = X.counter(c, -2.2, 2.2, -1.8, 0, 3.2, { front: TERRA, top: PALE, kick: 'c#3a2214/0.8' });
    kit.sign(c, 0, 0.005, 1.75, 3.5, 1.0, CARD.logo, { cw: 520, ch: 150 });
    c.box('c#6a4a2a/0.8', 0.55, 1.55, -1.35, -0.2, z + 0.005, z + 0.03); kit.sign(c, 1.05, -0.78, z + 0.036, 0.84, 1.05, CARD.signin, { cw: 240, ch: 300, flat: true }); tube(c, 'c#e8c73a/0.45', [[0.38, -1.1, z + 0.03], [0.44, -0.5, z + 0.03]], 0.018, 6);
    kit.pack(c, -0.35, -0.75, z, 0.7, 0.55, 0.5, 'c#26364f/0.8', CARD.honesty, { cw: 180, ch: 128 });
    X.card(c, -0.35, -0.3, z, 1.5, 0.4, TAG2('nobody is at the desk.', 'Sol is at the back, floating. wave.'), { cw: 340, ch: 92 });
    kit.jarCandle(c, -1.6, -1.0, z, { r: 0.18, tall: 0.4, wax: 'c#efe2bc/0.6', label: 'c#c9b48a/0.8' }); potted(c, 1.85, -1.3, z, { r: 0.2, n: 14, len: 0.75, pot: 'c#f4f1ea/0.45' });
    ves(c, 'glass', -1.3, -0.35, z, [[0, 0], [0.15, 0], [0.15, 0.36], [0.13, 0.36], [0.13, 0.03], [0, 0.03]], 14); for (let i = 0; i < 9; i++) c.soft(['c#e88aa8/0.8', 'c#26364f/0.8', 'c#d9b35a/0.8'][i % 3], -1.38 + (i % 3) * 0.05, -1.3 + (i % 3) * 0.05, -0.42 + (i % 2) * 0.07, -0.34 + (i % 2) * 0.07, z + 0.04 + i * 0.03, z + 0.065 + i * 0.03, 0.01);
    X.card(c, -1.3, -0.1, z, 0.9, 0.24, TAG('lost hair ties (take one)'), { cw: 230, ch: 62 });
    X.stool(at(23.6, 9.5), 0, 0, 2.2, { mat: PALE, label: 'sit at the desk (nobody else does)' }); }

  // ---- the singing bowl, by the door ---------------------------------------------------------------------------------
  const BA = 21.2, BD = 2.6, BZ = 2.75;
  { X.plinth(R, BA, BD, 1.3, 1.3, BZ, { mat: PALE, solid: true });
    R.cyl('c#b8361f/0.8', BA, BD, BZ, BZ + 0.1, 0.4, 0.36, 20); R.cyl('c#d9b35a/0.8', BA, BD, BZ + 0.1, BZ + 0.13, 0.3, 0.26, 20);
    ves(R, BRASS, BA, BD, BZ + 0.12, [[0, 0], [0.26, 0], [0.43, 0.1], [0.5, 0.28], [0.5, 0.44], [0.47, 0.44], [0.46, 0.28], [0.4, 0.13], [0.25, 0.05], [0, 0.05]], 28);
    hcyl(R, 'c#6a4a2a/0.8', 'x', BA + 0.02, BD - 0.5, BZ + 0.045, 0.8, 0.035, 0.03, 8); hcyl(R, 'c#8a1c1c/0.8', 'x', BA - 0.3, BD - 0.5, BZ + 0.06, 0.3, 0.06, 0.06, 10);
    kit.sign(at(BA - 0.655, BD, 0, 'left'), 0, 0.005, 1.9, 1.15, 0.8, TAG2('strike me (E)', 'once is plenty. twice is a conversation.'), { cw: 300, ch: 208 }); }

  // ---- the windows -----------------------------------------------------------------------------------------------------
  // left: a mat half unrolled, cork blocks balanced, a tall plant, the card
  { R.box(CREAMP, 2.2, 11.2, 0.45, 3.0, 0, 1.7); R.box(PALE, 2.14, 11.26, 0.4, 3.06, 1.7, 1.78, G); R.block(2.2, 11.2, 0.3, 3.0, 0, 2.2); const z = 1.78;
    R.soft('c#e8907a/0.8', 4.3, 8.4, 0.8, 2.8, z + 0.005, z + 0.06, 0.025); roll(R, 'y', 8.55, 1.8, z + 0.26, 'c#e8907a/0.8', 2.0, 0.26);
    block(R, 9.9, 1.3, z); block(R, 9.9, 1.3, z + 0.335, 1); R.box(CORK, 9.9 - 0.165, 9.9 + 0.165, 1.3 - 0.25, 1.3 + 0.25, z + 0.67, z + 1.42); block(R, 10.55, 2.3, z); ves(R, BRASS, 9.9, 1.3, z + 1.42, [[0, 0], [0.09, 0], [0.15, 0.04], [0.17, 0.12], [0.155, 0.12], [0.13, 0.05], [0, 0.03]], 16);
    kit.pottedPlant(R, 3.2, 1.7, z, 'snake', { size: 1.75, pot: 'c#f4f1ea/0.45' });
    X.card(at(6.3, 2.2, z + 0.06, 'street'), 0, 0, 0, 2.7, 1.8, CARD.welcome, { cw: 430, ch: 286, tilt: 0.1 });
    kit.pillarCandle(R, 5.0, 1.0, z + 0.06, 0.5, 0.14); kit.pillarCandle(R, 7.6, 1.05, z + 0.06, 0.34, 0.13); }
  // right: an egg in meditation, bolsters and blankets, the card that explains the place
  { R.box(CREAMP, 23, 29.8, 0.45, 3.0, 0, 1.7); R.box(PALE, 22.94, 29.86, 0.4, 3.06, 1.7, 1.78, G); R.block(23, 29.8, 0.3, 3.0, 0, 2.2); const z = 1.78;
    zafu(R, 24.2, 1.6, z, 'c#2f5a6a/0.8', 0.5); ves(R, 'c#d9b35a/0.45', 24.2, 1.6, z + 0.36, [[0, 0], [0.14, 0.01], [0.26, 0.12], [0.3, 0.3], [0.26, 0.5], [0.16, 0.64], [0, 0.69]], 20); ball(R, 'c#6a4a2a/0.8', 24.2, 1.62, z + 1.02, 0.08, 8);
    for (const s of [-1, 1]) ball(R, 'c#f4f1ea/0.8', 24.2 + s * 0.3, 1.45, z + 0.5, 0.06, 8);
    X.card(at(24.2, 0.95, z, 'street'), 0, 0, 0, 1.2, 0.36, TAG2('not for sale', '(he is mid-session)'), { cw: 280, ch: 84 });
    X.card(at(26.6, 2.1, z, 'street'), 0, 0, 0, 2.8, 1.9, CARD.free, { cw: 440, ch: 300, tilt: 0.1 });
    hcyl(R, 'c#9fb0a4/0.8', 'x', 28.6, 1.1, z + 0.36, 1.9, 0.36, 0.36, 16); hcyl(R, 'c#c98a6a/0.8', 'x', 28.7, 1.35, z + 1.04, 1.7, 0.32, 0.32, 16); kit.foldedStack(R, 28.7, 2.35, z, 3, ['wool#d9b35a', 'wool#e8e2d4', 'wool#c98a6a'], { w: 1.4, d: 0.9, t: 0.18 });
    kit.pillarCandle(R, 25.3, 1.0, z, 0.42, 0.14); }
  // trailing plants hung in both windows, and one over the desk
  for (const [a, d, nn] of [[12.3, 1.8, 20], [18.8, 1.8, 18], [29.6, 8.6, 20]]) { R.cyl('c#1d1b18/0.8', a, d, 8.7, 12, 0.012, 0.012, 4); potted(R, a, d, 8.3, { r: 0.4, h: 0.48, n: nn, len: 2.3, up: 0.1, out: 0.5, droop: 1.6, pot: 'c#f4f1ea/0.45' }); }

  // ---- the light: paper lanterns ----------------------------------------------------------------------------------------
  for (const [a, d, drop, p] of [[9.5, 15.5, 3.3, 0.95], [21.5, 15.5, 3.3, 0.95], [6.5, 22.3, 3.6, 0.85], [15.5, 21.6, 3.0, 1.0], [24.5, 22.3, 3.6, 0.85], [15.5, 6.2, 3.4, 0.9], [23.6, 7.4, 4.2, 0.7]]) X.pendant(R, a, d, { kind: 'paper', drop, power: p });

  // ---- out on the pavement: the board, a bench, a pot, somebody's shoes -------------------------------------------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));              // x = a along the frontage, y = -feet out from the shopfront
  kit.model('painted_wooden_bench', o, 6.6, -1.25, 0, 2, { outdoor: true, collide: true, seat: 1.45 });
  X.card(o, 9.6, -0.5, 0, 1.5, 0.42, TAG2('waiting is also a pose', '(Benchasana)'), { cw: 330, ch: 92 });
  { const x = 20.4, y = -1.3; ves(o, 'c#b8755a/0.8', x, y, 0, [[0, 0], [0.5, 0], [0.62, 0.3], [0.78, 1.15], [0.86, 1.2], [0.86, 1.32], [0.74, 1.32], [0.7, 1.16], [0, 1.16]], 22); ves(o, 'c#3a2214/0.8', x, y, 1.14, [[0, 0], [0.7, 0], [0, 0.05]], 14);
    K.leaves(o, x, y, 1.16, { n: 22, len: 2.6, w: 0.1, up: 1.0, out: 0.35, droop: 0.35, spread: 0.3 }); K.leaves(o, x, y, 1.16, { n: 14, len: 1.3, w: 0.07, up: 0.5, out: 0.9, droop: 0.9, spread: 0.4 }); o.block(x - 0.8, x + 0.8, y - 0.8, y + 0.8, 0, 3); }
  kit.shoes(o, 11.9, -0.55, 0, 'sneaker', 'linen#e8907a', { turn: 2.9 });
  X.aBoard(K.wrap(lot.frOut(kit, DA + 4.5, 5.4, 0, 'left')), 0, 0, CARD.board, { back: CARD.boardBack });

  // ---- Sol ------------------------------------------------------------------------------------------------------------------
  const SOLHOME = lot.world(15.5, 26.75);
  kit.clerks.push({
    id: 'sol', name: 'Sol', lot: 'yoga', floor: FL + PH, look: { shape: 'egg', colour: '#e0a458', belly: '#fbf1df', trim: '#b8553a', hat: 'bun', hatColour: '#5a3a2a', scarf: '#2f5a6a', eye: '#fff1cf', ring: 0xffd08a, blush: true, hover: 3.4 },
    home: SOLHOME, faces: lot.world(15.5, 8),
    lines: {
      greet: ['Welcome. Shoes off, shoulders down. In that order.', 'Come in. Take any mat and sit; the class begins when you do.', 'Hello. You are breathing already. Excellent. That is most of it.'],
      idle: ['*hovers two inches higher, exhales, hovers two inches lower*', 'I have been holding this pose since Tuesday. I do not know which Tuesday.', '*rings a very small bell, for nobody*', 'Somebody left their inner peace in a cubby again.', '*adjusts bun by one degree*'],
      bye: ['Go slowly. The street is not going anywhere; I have checked.', 'Namaste. Mind the step. Mindfully.'],
      topics: [
        { q: 'How do I join a class?', a: 'Walk up to any mat and take it. When you sit, I begin. When you stand, I stop. It is the simplest relationship I have.', next: [
          { q: 'And if I cannot do a pose?', a: 'Then you do the nearby pose that you can do, and we both agree it was the pose. Knees down is also yoga.' }] },
        { q: 'What classes are there?', a: 'Three, in rotation: Sun Salutation A, the Evening Wind-Down, and Desk Yoga for Graduate Students. Each time you sit, it is the next one.', next: [
          { q: 'Why graduate students?', a: 'They come in shaped like a question mark. I return them as an exclamation mark. Briefly. Then there is email.' }] },
        { q: 'Can a robot do yoga?', a: 'I have no spine, no hamstrings and no feet. My Downward Dog is simply me, upside down. My Savasana, however, is flawless.', next: [
          { q: 'Show me the Downward Dog.', a: 'Take a mat. It comes about halfway through, and I do not perform out of sequence. I am a professional.' }] },
        { q: 'Why “Low Sun”?', a: 'The sun here is always about to set. So a Sun Salutation is really more of a Sun Goodbye. We do them anyway. It seems to appreciate the gesture.' },
        { q: 'I am not flexible.', a: 'Nobody asked you to be. Sthira-sukham asanam: steady and comfortable. Patanjali wrote that, and it is the whole instruction. Flexibility is what turns up afterwards, like pudding.' },
        { q: 'Is the singing bowl real?', a: 'By the door. Strike it and see. It rings for about as long as one good exhale. I timed it. I do not exhale, so I used somebody else’s.' },
      ],
    },
  });

  // ---- the routines, the bowl, and Sol's part in them ---------------------------------------------------------------------
  const base = new Map(seats.map(s => [s, { x: s.x, y: s.y, z: s.z }]));
  const [bwx, bwz] = lot.world(BA, BD);
  kit.later.push(ctx => {
    const DEBUG = typeof location !== 'undefined' && new URLSearchParams(location.search).has('keys');
    const bowl = (vol = 0.13, m = 53) => { const s = ctx.sound; if (!s?.note) return; s.note(m, 0, 7, vol); s.note(m + 0.13, 0, 6.5, vol * 0.7); s.note(m + 17.1, 0.005, 3.6, vol * 0.22); s.note(m + 28.3, 0.005, 1.6, vol * 0.09); };
    // the caption: what the pose is, and what the breath is doing
    const el = (tag, cls, parent) => { const e = document.createElement(tag); e.className = cls; parent?.appendChild(e); return e; };
    const st = el('style', ''); st.textContent = `
#lowsun { position: fixed; left: 50%; top: 20%; transform: translateX(-50%); width: max-content; max-width: min(600px, 88vw); padding: 12px 22px 13px; border-radius: 5px; background: rgba(28, 18, 12, .66);
  color: #f6ead6; text-align: center; font-family: var(--serif, Georgia, serif); pointer-events: none; z-index: 3; opacity: 0; transition: opacity 1.1s ease; text-shadow: 0 1px 2px rgba(0,0,0,.4); box-shadow: 0 4px 18px rgba(0,0,0,.22); }
#lowsun.on { opacity: 1; transition: opacity .6s ease; }
#lowsun .prog { font-size: 11.5px; letter-spacing: .14em; text-transform: uppercase; color: #d9a77c; }
#lowsun .sk { font-size: 27px; font-style: italic; line-height: 1.2; margin-top: 3px; }
#lowsun .en { font-size: 15px; letter-spacing: .05em; color: #e9c9a0; }
#lowsun .br { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 8px 0 6px; font-size: 13px; letter-spacing: .16em; text-transform: uppercase; color: #ffd9a0; }
#lowsun .ring { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #ffd08a; background: rgba(255, 208, 138, .22); transform: scale(.5); }
#lowsun.in .ring { transform: scale(1); transition: transform 3.6s ease-in-out; }
#lowsun.out .ring { transform: scale(.42); transition: transform 4.2s ease-in-out; }
#lowsun.hold .ring { animation: lowsun-breath 5.6s ease-in-out infinite; }
#lowsun .say { font-size: 15.5px; line-height: 1.38; }
#lowsun .say::before { content: 'Sol: '; font-style: italic; color: #d9a77c; }
#lowsun.end .br, #lowsun.end .en { display: none; }
@keyframes lowsun-breath { 0%, 100% { transform: scale(.42); } 45% { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { #lowsun .ring { transition: none !important; animation: none !important; transform: scale(.8); } }`;
    document.head.appendChild(st);
    const cap = el('div', '', document.body); cap.id = 'lowsun'; cap.setAttribute('role', 'status');
    const cProg = el('div', 'prog', cap), cSk = el('div', 'sk', cap), cEn = el('div', 'en', cap), cBr = el('div', 'br', cap), cRing = el('span', 'ring', cBr), cBl = el('span', '', cBr), cSay = el('div', 'say', cap);
    void cRing;

    // the state of the class: all plain numbers, nothing made per frame
    const S = { on: false, done: false, seat: null, b: null, r: -1, i: 0, t: 0, dur: 0, n: 0, h: 2.6, fwd: 0, roll: 0, tH: 2.6, tP: -0.05, tY: 0, tF: 0, tR: 0, settle: 0, hide: 0, fx: 0, fz: 0, left: 0 };
    const P = { rx: 0, ry: 0, rz: 0, y: 0, hx: 0.8, hy: -0.125, hz: 0.16 }, PT = { rx: 0, ry: 0, rz: 0, y: 0, hx: 0.8, hy: -0.125, hz: 0.16 };
    let sol = null, solHooked = false;
    const aimSol = k => { const p = SOL[k] ?? SOL.rest; PT.rx = p[0]; PT.ry = p[1]; PT.rz = p[2]; PT.y = p[3]; PT.hx = p[4]; PT.hy = p[5]; PT.hz = p[6]; };
    const aimEye = e => { const k = eyeHeight() / 4.85; S.tH = e[0] * k; S.tP = e[1]; S.tY = e[2]; S.tF = e[3]; S.tR = e[4]; };
    function step(i) {
      const R0 = ROUTINES[S.r], s = R0.steps[i]; S.i = i; S.t = 0; S.dur = s[4];
      aimEye(s[5]); aimSol(s[6]);
      const [kind, label] = s[2].split(':');
      cProg.textContent = `${R0.name} · ${i + 1} of ${R0.steps.length}`; cSk.textContent = s[0]; cEn.textContent = s[1]; cBl.textContent = label ?? (kind === 'in' ? 'inhale' : 'exhale'); cSay.textContent = s[3];
      cap.className = 'on ' + kind; S.hide = 0;
      bowl(i === 0 ? 0.12 : 0.07, kind === 'in' ? 60 : kind === 'out' ? 55 : 53);
      if (sol) sol.nextIdle = sol.H.now + 40;
      if (DEBUG) console.log('YOGA step', S.r, i, s[0]);
    }
    function begin(seat) {
      S.on = true; S.done = false; S.seat = seat; S.b = base.get(seat); S.r = S.n++ % ROUTINES.length; S.h = 2.6; S.fwd = 0; S.settle = 0;
      S.fx = -Math.sin(seat.yaw); S.fz = -Math.cos(seat.yaw);
      sol?.say(ROUTINES[S.r].hello, 'happy', 7);
      step(0);
    }
    function finish() {                                              // Savasana is over: sit up, a kind word, and stay as long as you like
      const R0 = ROUTINES[S.r]; S.on = false; S.done = true; S.t = 0; aimEye(E.seat); aimSol('heart'); S.settle = 9;
      cProg.textContent = R0.name; cSk.textContent = 'Namaste'; cSay.textContent = R0.bye + ' (Stay as long as you like. Another mat, another class.)'; cap.className = 'on end'; S.hide = 13;
      bowl(0.14, 53); ctx.sound?.note?.(60, 1.4, 6, 0.06);
      sol?.say(R0.bye, 'happy', 9);
      if (DEBUG) console.log('YOGA finish', S.r);
    }
    function leave() {                                               // they stood up: put the mat's seat back as it was
      const s = S.seat, early = S.on; s.x = S.b.x; s.y = S.b.y; s.z = S.b.z; S.seat = null; S.on = false; S.done = false; S.tR = 0; aimSol('rest'); S.settle = 3;
      if (early) { const l = EARLY[S.left++ % EARLY.length]; cProg.textContent = ROUTINES[S.r].name; cSk.textContent = 'Class dismissed'; cSay.textContent = l; cap.className = 'on end'; S.hide = 6; sol?.say(l, 'wink', 6); bowl(0.08, 53); }
      else if (S.hide > 2.5) S.hide = 2.5;
      if (DEBUG) console.log('YOGA leave', early);
    }
    // Sol, after the clerk's own motion has been set for the frame: the pose is laid over it
    function solPose(t, dt) {
      if (!S.on && S.settle <= 0) return;
      if (!S.on && S.settle < 3.2) aimSol('rest');
      const b = sol.body, k = 1 - Math.exp(-dt * 2.6);
      P.rx += (PT.rx - P.rx) * k; P.ry += (PT.ry - P.ry) * k; P.rz += (PT.rz - P.rz) * k; P.y += (PT.y - P.y) * k; P.hx += (PT.hx - P.hx) * k; P.hy += (PT.hy - P.hy) * k; P.hz += (PT.hz - P.hz) * k;
      const wob = P.rx > 2.6 ? 0.05 * Math.sin(t * 2.3) : 0;                                       // upside down takes concentration
      b.bob.rotation.x += P.rx; b.bob.rotation.y = P.ry; b.bob.rotation.z += P.rz + wob; b.bob.position.y += P.y;
      const br = 0.035 * Math.sin(t * 1.12);
      b.hands[0].position.set(-P.hx, P.hy + br, P.hz); b.hands[1].position.set(P.hx, P.hy + br, P.hz);
      if (!S.on) { S.settle -= dt; if (S.settle <= 0) b.bob.rotation.y = 0; }
    }
    const bowlItem = { x: bwx, y: FL + BZ + 0.4, z: bwz, reach: 6.5, size: 1.2, label: () => 'strike the singing bowl', act: () => {
      bowl(0.17, 53); const k = bowlItem.k = (bowlItem.k ?? 0) + 1;
      const l = S.on ? null : ['That is the bell for the end of class. Class has not begun. I admire the ambition.', 'Once is plenty.', 'Twice is a conversation.', 'Three times and it thinks you want something.', 'It is not a doorbell. Though I did come.'][Math.min(k - 1, 4)];
      if (l && (k <= 5 || k % 4 === 0)) sol?.say(l, 'wink', 6); else ctx.flash?.('The bowl sings, and takes its time stopping.'); } };
    ctx.interact.push(bowlItem);

    ctx.animated.push((t, dt) => {
      if (!sol && ctx.clerks?.sol) sol = ctx.clerks.sol;
      if (sol && !solHooked) { solHooked = true; ctx.animated.push(solPose); }                    // pushed late, so it runs after the clerks have moved
      const w = ctx.walker, seat = w?.seated ?? null;
      if (S.seat && seat !== S.seat) leave();
      if (!S.seat && seat && base.has(seat)) begin(seat);
      if (S.hide > 0) { S.hide -= dt; if (S.hide <= 0 && !S.on) cap.className = ''; }
      if (!S.seat) return;
      S.t += dt;
      if (S.on && S.t >= S.dur) { if (S.i + 1 < ROUTINES[S.r].steps.length) step(S.i + 1); else finish(); }
      // the eye: where the head is in this pose, and where it is looking
      const k = 1 - Math.exp(-dt * 2.3), s = S.seat, pull = S.t < 2.6 ? 3.2 : S.on ? 0.55 : 0;
      S.h += (S.tH - S.h) * k; S.fwd += (S.tF - S.fwd) * k; S.roll += (S.tR - S.roll) * k;
      s.y = FL + S.h + 0.03 * Math.sin(t * 1.12); s.x = S.b.x + S.fx * S.fwd; s.z = S.b.z + S.fz * S.fwd;
      if (pull) { const q = Math.min(1, dt * pull); w.pitch += (S.tP - w.pitch) * q; const d = s.yaw + S.tY - w.yaw; w.yaw += Math.atan2(Math.sin(d), Math.cos(d)) * q; }
      if (Math.abs(S.roll) > 1e-3) ctx.camera.rotation.z = S.roll;
    });
  });
}
