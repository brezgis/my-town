// Low Sun Yoga  (303 Mulberry Street: narrow and deep, about 19 ft wide by 43 deep)
// Three rooms, front to back, as the building had them. RECEPTION behind the shop window: shoe cubbies and a
// bench on the left, the desk and the evening's slate on the right, the singing bowl on its stand in the window
// (E strikes it). Through a wide cased opening, THE PRACTICE ROOM: seven mats in two rows facing Sol's low
// platform and the painted sun, one long shelf of props down the right wall, the sun salutation painted along
// the left, paper lanterns in pairs. Behind the sun, through a door either side of it, THE BACK ROOM: the back
// door, the window with its blind down, tea on the counter under it.
// THE ROUTINES: sit on any mat ('take this mat') and a class begins. Sol leads a real sequence
// (three of them, in rotation), the seated eye is moved through the poses, a caption names each
// pose in Sanskrit and English with its breath, a bowl sounds at each change. Standing up ends it.
import { tools, fixtures } from '../shopkit.js';
import { arch } from './arch.js';
import { BRASS, G } from '../kit.js';
import { eyeHeight } from '../walk.js';
import { T, F, fill, slate, chalk, paper, grain, disc, line, rnd } from '../draw.js';

const OAK = 'oak_light#b4946a', PALE = 'oak_light#d2b88e', TERRA = 'painted_wood#c98a6a', SAGE = 'painted_wood#aab5a0', CORK = 'c#c9a77a/0.8';
const INK = '#3a2a22', RUST = '#b8553a', OCHRE = '#d9a441', PAPER = '#f6efe2';
const MATS = ['c#9fb0a4/0.8', 'c#e8907a/0.8', 'c#2f5a6a/0.8', 'c#d9b35a/0.8', 'c#9fb0d8/0.8', 'c#c9b48a/0.8', 'c#7d8f72/0.8'];

// The readable things indoors: the slate, the card on the cubbies, how to breathe, the sun salutation, and the words under the sun.
const TIMETABLE = (g, w, h) => {
  slate(g, w, h, '#262b29', 12);
  chalk(g, 'this evening', w * 0.5, h * 0.13, h * 0.14, '#f1efe6'); line(g, [[w * 0.3, h * 0.23], [w * 0.7, h * 0.23]], '#e9c46a', 3);
  [['6:10', 'Slow Flow'], ['6:11', 'Slower Flow'], ['dusk', 'Sunset Salutations']].forEach(([t, n], i) => { const y = h * (0.38 + i * 0.15); chalk(g, t, w * 0.27, y, h * 0.1, '#e9c46a', { a: 'right' }); chalk(g, n, w * 0.33, y, h * 0.1, '#f1efe6', { a: 'left', max: w * 0.62 }); });
  chalk(g, 'take a mat and sit down', w * 0.5, h * 0.88, h * 0.08, '#9aa39d', { max: w * 0.86 });
};

// The end wall: a low sun, half set, painted straight onto a field of clay-pink limewash
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
  T(g, 'sthira-sukham āsanam', w * 0.21, h * 0.85, h * 0.064, '#7a2f1c', { f: F.fraunces, it: 1, w: 600, max: w * 0.36 });
  T(g, '“posture: steady, and comfortable”', w * 0.79, h * 0.83, h * 0.05, '#7a2f1c', { f: F.caveat, w: 600, max: w * 0.36 });
  T(g, 'Patañjali, Yoga Sūtra 2.46', w * 0.79, h * 0.9, h * 0.036, '#a8553a', { f: F.fraunces, it: 1 });
  T(g, '(he does not mention hamstrings once)', w * 0.21, h * 0.92, h * 0.038, '#a8553a', { f: F.caveat, w: 600, max: w * 0.36 });
};

// The sun salutation, figure by figure, inked along the wall on the same limewash as the sun: u across, v down, the ground at v = 1
const FIG = {
  tadasana: [[0.5, 0.1], [[0.5, 0.18], [0.5, 0.58], [0.5, 1]], [[0.5, 0.25], [0.55, 0.56]]],
  urdhva: [[0.5, 0.21], [[0.5, 0.29], [0.5, 0.62], [0.5, 1]], [[0.5, 0.31], [0.54, 0.02]]],
  uttana: [[0.61, 0.87], [[0.44, 1], [0.44, 0.5], [0.58, 0.62], [0.6, 0.79]], [[0.59, 0.68], [0.67, 0.98]]],
  ardha: [[0.84, 0.47], [[0.4, 1], [0.4, 0.5], [0.75, 0.49]], [[0.7, 0.5], [0.7, 0.95]]],
  chatur: [[0.89, 0.74], [[0.08, 0.97], [0.1, 0.88], [0.79, 0.78]], [[0.79, 0.78], [0.62, 0.75], [0.66, 0.98]]],
  updog: [[0.77, 0.4], [[0.04, 0.96], [0.5, 0.92], [0.72, 0.52]], [[0.71, 0.56], [0.7, 0.98]]],
  adho: [[0.75, 0.75], [[0.93, 0.98], [0.5, 0.38], [0.14, 0.98]]],
};
function fig(g, key, cx, ground, s, col, lw = s * 0.05) {
  const [head, ...lines] = FIG[key], P = ([u, v]) => [cx + (u - 0.5) * s, ground - (1 - v) * s];
  for (const l of lines) line(g, l.map(P), col, lw);
  const [hx, hy] = P(head); disc(g, hx, hy, s * 0.07, col);
}
const FRIEZE = (g, w, h) => {
  fill(g, w, h, '#edd5bf'); grain(g, w, h, 0.05, 9);
  const seq = [['tadasana', 'Tāḍāsana'], ['urdhva', 'Ūrdhva Hastāsana'], ['uttana', 'Uttānāsana'], ['ardha', 'Ardha Uttānāsana'], ['chatur', 'Chaturaṅga'], ['updog', 'Ūrdhva Mukha'], ['adho', 'Adho Mukha'], ['ardha', 'Ardha Uttānāsana'], ['uttana', 'Uttānāsana'], ['urdhva', 'Ūrdhva Hastāsana'], ['tadasana', 'Samasthiti']];
  const cw = w / (seq.length + 0.6), x0 = cw * 0.3;
  line(g, [[w * 0.025, h * 0.715], [w * 0.975, h * 0.715]], '#c4603f', h * 0.009);
  seq.forEach(([k, sk], i) => { const x = x0 + cw * (i + 0.5); fig(g, k, x, h * 0.7, h * 0.46, '#7a2f1c', h * 0.022); T(g, sk, x, h * 0.86, h * 0.075, '#a8553a', { f: F.fraunces, it: 1, max: cw * 0.92 }); });
};
const BREATHE = (g, w, h) => { paper(g, w, h, '#f1e6d2', 15); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(12, 12, w - 24, h - 24);
  T(g, 'HOW TO', w / 2, h * 0.09, h * 0.06, RUST, { f: F.bebas, ls: 6 }); T(g, 'BREATHE', w / 2, h * 0.18, h * 0.115, INK, { f: F.abril, max: w * 0.84 });
  const cy = h * 0.42; for (const [k, c] of [[0.2, '#c4603f'], [0.155, '#d9763f'], [0.11, OCHRE], [0.06, '#f1e6d2']]) disc(g, w / 2, cy, w * k, c);
  T(g, 'in', w / 2, cy, h * 0.045, INK, { f: F.fraunces, it: 1, w: 600 });
  ['1.  in, through the nose', '2.  out, slower than in', '3.  repeat until further notice'].forEach((s, i) => T(g, s, w * 0.14, h * (0.66 + i * 0.075), h * 0.05, INK, { f: F.fraunces, w: 600, a: 'left', max: w * 0.74 }));
  T(g, 'you have been doing it all day. well done.', w / 2, h * 0.925, h * 0.042, RUST, { f: F.caveat, w: 600, max: w * 0.84 }); };

const TAG2 = (a, b, c = PAPER) => (g, w, h) => { paper(g, w, h, c); T(g, a, w / 2, h * 0.34, h * 0.36, INK, { f: F.caveat, w: 600, max: w * 0.92 }); T(g, b, w / 2, h * 0.72, h * 0.27, RUST, { f: F.caveat, w: 600, max: w * 0.92 }); };
const sunMark = (g, x, y, s, c) => { g.save(); g.translate(x, y); g.fillStyle = c; g.strokeStyle = c; g.lineWidth = s * 0.05; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, s * 0.24, Math.PI, 0); g.closePath(); g.fill(); for (let i = 0; i <= 6; i++) { const a = Math.PI + (i / 6) * Math.PI; g.beginPath(); g.moveTo(Math.cos(a) * s * 0.32, Math.sin(a) * s * 0.32); g.lineTo(Math.cos(a) * s * 0.46, Math.sin(a) * s * 0.46); g.stroke(); } g.beginPath(); g.moveTo(-s * 0.5, s * 0.06); g.lineTo(s * 0.5, s * 0.06); g.stroke(); g.restore(); };
const LOGO = (g, w, h) => { fill(g, w, h, '#c98a6a'); grain(g, w, h, 0.05); sunMark(g, w * 0.14, h * 0.58, h * 0.7, '#fbf1df'); T(g, 'low sun yoga', w * 0.58, h * 0.5, h * 0.42, '#fbf1df', { f: F.fraunces, w: 600, it: 1, max: w * 0.66 }); };
const BOARD = (g, w, h) => { slate(g, w, h, '#2a2623'); sunMark(g, w / 2, h * 0.22, h * 0.24, '#e9c46a'); chalk(g, 'LOW SUN YOGA', w / 2, h * 0.34, h * 0.085, '#f1efe6', { max: w * 0.9 });
  chalk(g, 'now on:', w / 2, h * 0.52, h * 0.06, '#9aa39d'); chalk(g, 'Sunset Salutations', w / 2, h * 0.62, h * 0.085, '#e9c46a', { max: w * 0.9 }); chalk(g, '(it is always now)', w / 2, h * 0.72, h * 0.055, '#9aa39d'); };

// ---- the classes: [Sanskrit, English, breath ('in' | 'out' | 'hold:label'), what Sol says, seconds, eye, Sol's pose] --------------
// eye: [height of the eye in feet for a standing eye of 4.85, pitch, yaw (+ left), feet forward along the mat, roll]
const E = { seat: [2.6, -0.05, 0, 0, 0], stand: [4.85, 0, 0, 0.5, 0], up: [4.95, 0.62, 0, 0.5, 0], fold: [2.25, -1.38, 0, 0.9, 0], half: [3.15, -0.8, 0, 1.3, 0], chat: [0.7, -0.95, 0, 1.2, 0], updog: [2.0, 0.5, 0, 1.6, 0],
  dog: [2.0, -2.65, 0, 1.5, 0], sava: [0.75, 1.42, 0, -1.5, 0], child: [0.6, -1.45, 0, 1.1, 0], cow: [1.75, 0.3, 0, 0.9, 0], cat: [1.85, -1.2, 0, 0.9, 0], sideL: [2.5, 0.12, 0, 0, 0.36], sideR: [2.5, 0.12, 0, 0, -0.36],
  twL: [2.6, -0.02, 1.15, 0, 0], twR: [2.6, -0.02, -1.15, 0, 0], lookL: [2.6, 0, 0.8, 0, 0], lookR: [2.6, 0, -0.8, 0, 0], earL: [2.55, 0, 0, 0, 0.3], earR: [2.55, 0, 0, 0, -0.3], scow: [2.65, 0.4, 0, 0.1, 0], scat: [2.4, -0.7, 0, -0.1, 0],
  eagle: [2.62, 0.12, 0, 0, 0], pasch: [1.35, -1.25, 0, 0.8, 0], supL: [0.75, 1.0, 0.95, -1.5, 0.3], supR: [0.75, 1.0, -0.95, -1.5, -0.3], legs: [0.75, 1.3, 0, -1.5, 0] };
const ROUTINES = [
  { name: 'Sūrya Namaskāra A · Sun Salutation', hello: 'Sun Salutation A. One breath, one movement.',
    bye: 'The light in me bows to the light in you. Mine is an LED.', steps: [
      ['Sukhāsana', 'Easy Seat', 'hold:arrive', 'Sit. Arrive. You are already doing it.', 6, E.seat, 'seat'],
      ['Tāḍāsana', 'Mountain', 'out', 'Stand at the top of your mat. Be a mountain. A small one is fine.', 6.5, E.stand, 'mountain'],
      ['Ūrdhva Hastāsana', 'Upward Salute', 'in', 'Inhale: arms up, look at your thumbs. I look at my mittens.', 5.5, E.up, 'up'],
      ['Uttānāsana', 'Standing Forward Fold', 'out', 'Exhale: fold. Bend your knees; nobody is checking.', 6, E.fold, 'fold'],
      ['Ardha Uttānāsana', 'Half Lift', 'in', 'Inhale: halfway up, long flat back. Like a table with opinions.', 5.5, E.half, 'half'],
      ['Chaturaṅga Daṇḍāsana', 'Four-Limbed Staff', 'out', 'Exhale: step back, lower halfway. Knees down is also yoga.', 6, E.chat, 'chat'],
      ['Ūrdhva Mukha Śvānāsana', 'Upward-Facing Dog', 'in', 'Inhale: chest through, look up. Shoulders away from your ears.', 6, E.updog, 'updog'],
      ['Adho Mukha Śvānāsana', 'Downward-Facing Dog', 'hold:five breaths', 'Exhale: hips high. Five breaths. The street is upside down and perfectly fine.', 15, E.dog, 'dog'],
      ['Ardha Uttānāsana', 'Half Lift', 'in', 'Inhale: step to your hands. Look forward, flat back.', 5.5, E.half, 'half'],
      ['Uttānāsana', 'Standing Forward Fold', 'out', 'Exhale: fold. Hello again, mat.', 5.5, E.fold, 'fold'],
      ['Ūrdhva Hastāsana', 'Upward Salute', 'in', 'Inhale: all the way up. Reach for the lanterns.', 5.5, E.up, 'up'],
      ['Samasthiti', 'Equal Standing', 'out', 'Exhale: hands to heart. That was one. Traditionally there are four more.', 7, E.stand, 'heart'],
      ['Śavāsana', 'Corpse Pose', 'hold:nothing at all', 'Lie back. Do nothing. You are overqualified for this.', 15, E.sava, 'sava'],
    ] },
  { name: 'Evening Wind-Down', hello: 'The Evening Wind-Down. Nothing in this class is urgent.',
    bye: 'You did nothing, beautifully. Go gently.', steps: [
      ['Sukhāsana', 'Easy Seat', 'hold:arrive', 'Sit tall. Let the day put its bag down.', 6.5, E.seat, 'seat'],
      ['Pārśva Sukhāsana', 'Seated Side Bend, left', 'in', 'Inhale: right arm up and over, lean left.', 6.5, E.sideL, 'sideL'],
      ['Pārśva Sukhāsana', 'Seated Side Bend, right', 'in', 'And the other side. I have no waist; I tip.', 6.5, E.sideR, 'sideR'],
      ['Biṭilāsana', 'Cow', 'in', 'Hands and knees. Inhale: belly down, heart forward, look up.', 6, E.cow, 'cow'],
      ['Mārjāryāsana', 'Cat', 'out', 'Exhale: round your back, look at your navel. I have a seam.', 6, E.cat, 'cat'],
      ['Bālāsana', 'Child’s Pose', 'hold:five breaths', 'Hips to heels, forehead down. Five breaths. This is my best pose.', 13, E.child, 'child'],
      ['Adho Mukha Śvānāsana', 'Downward-Facing Dog', 'hold:three breaths', 'Tuck your toes, hips up. Pedal the feet. This is called walking the dog.', 11, E.dog, 'dog'],
      ['Uttānāsana', 'Standing Forward Fold', 'out', 'Walk your feet to your hands and hang. Shake your head no. Nod yes.', 9, E.fold, 'fold'],
      ['Supta Matsyendrāsana', 'Supine Twist, left', 'out', 'Lie down. Knees to the right, look left. Wring out the day like a flannel.', 9, E.supL, 'supL'],
      ['Supta Matsyendrāsana', 'Supine Twist, right', 'out', 'Knees left, look right. Whatever came out, leave it there.', 9, E.supR, 'supR'],
      ['Viparīta Karaṇī', 'Legs Up the Wall', 'hold:five breaths', 'Legs straight up. There is no wall just here. Borrow one from memory.', 12, E.legs, 'legs'],
      ['Śavāsana', 'Corpse Pose', 'hold:as long as you like', 'Let the floor have you. It is very good at this.', 16, E.sava, 'sava'],
    ] },
  { name: 'Desk Yoga for Graduate Students', hello: 'Desk Yoga for Graduate Students. You arrive shaped like a question mark.',
    bye: 'You are more than your word count. Drink some water.', steps: [
      ['Sukhāsana', 'Easy Seat', 'hold:arrive', 'Sit as though nobody is about to email you. I unplugged it.', 6.5, E.seat, 'seat'],
      ['Grīvā Sañcālana', 'Neck Release, right ear down', 'out', 'Right ear toward right shoulder. Do not bring the shoulder up to meet it.', 6.5, E.earR, 'sideR'],
      ['Grīvā Sañcālana', 'Neck Release, left ear down', 'out', 'Left ear to left shoulder. That crunching is only gravel.', 6.5, E.earL, 'sideL'],
      ['Grīvā Sañcālana', 'Neck Turn, left', 'in', 'Look over your left shoulder. No deadline there.', 5.5, E.lookL, 'twL'],
      ['Grīvā Sañcālana', 'Neck Turn, right', 'in', 'Now the right. None there either. Come back to centre.', 6.5, E.lookR, 'twR'],
      ['Upaviṣṭa Biṭilāsana', 'Seated Cow', 'in', 'Hands on knees. Inhale: chest forward, look up. The opposite of a laptop.', 6, E.scow, 'scow'],
      ['Upaviṣṭa Mārjāryāsana', 'Seated Cat', 'out', 'Exhale: round. The shape you were in all day, but now on purpose.', 6, E.scat, 'scat'],
      ['Garuḍāsana (arms)', 'Eagle Arms', 'hold:three breaths', 'Wrap your arms, lift the elbows. This is for the spot where the thesis lives.', 10, E.eagle, 'eagle'],
      ['Parivṛtta Sukhāsana', 'Seated Twist, right', 'out', 'Twist right: look back at everything you have already written. It is more than you think.', 7.5, E.twR, 'twR'],
      ['Parivṛtta Sukhāsana', 'Seated Twist, left', 'out', 'Twist left: what is still to do. Fine. Back to centre.', 7.5, E.twL, 'twL'],
      ['Paścimottānāsana', 'Seated Forward Fold', 'hold:five breaths', 'Legs long, fold over them. The citations can wait.', 12, E.pasch, 'fold'],
      ['Ūrdhva Hastāsana', 'Upward Salute', 'in', 'Stand up. Reach.', 6.5, E.up, 'up'],
      ['Śavāsana', 'Corpse Pose', 'hold:no notes', 'Lie down. Close the laptop inside your head. It autosaved.', 15, E.sava, 'sava'],
    ] },
];
const EARLY = ['Leaving early is also a pose. We call it Exitasana.', 'Class dismissed, then. The mat will remember your shape for about a minute.', 'Go well. Your Savasana is on account; collect it any time.'];
// Sol's poses: [tilt forward, turn, tip sideways, lift, then the hands: out, up, forward]. An egg does what an egg can.
const SOL = { rest: [0, 0, 0, 0, 0.8, -0.125, 0.16], seat: [0, 0, 0, -1.7, 0.52, -0.45, 0.42], mountain: [0, 0, 0, 0.2, 0.68, -0.62, 0.08], up: [-0.3, 0, 0, 0.45, 0.3, 1.2, 0], fold: [2.3, 0, 0, -0.9, 0.35, 0.95, 0.2], half: [1.45, 0, 0, -0.6, 0.5, -0.2, 0.62],
  chat: [1.5708, 0, 0, -2.72, 0.78, -0.1, 0.35], updog: [0.78, 0, 0, -2.3, 0.72, -0.5, 0.5], dog: [3.1416, 0, 0, -0.9, 0.4, 1.15, 0.1], sava: [-1.5708, 0, 0, -2.75, 1.12, -0.2, 0], child: [1.95, 0, 0, -2.55, 0.35, 0.95, 0.2], cow: [1.2, 0, 0, -2.0, 0.6, -0.3, 0.6], cat: [1.8, 0, 0, -1.8, 0.6, -0.3, 0.6],
  sideL: [0, 0, 0.52, -1.7, 0.4, 1.1, 0], sideR: [0, 0, -0.52, -1.7, 0.4, 1.1, 0], twL: [0, 1.15, 0, -1.7, 0.6, -0.3, 0.4], twR: [0, -1.15, 0, -1.7, 0.6, -0.3, 0.4], scow: [-0.3, 0, 0, -1.7, 0.6, -0.4, 0.4], scat: [0.5, 0, 0, -1.7, 0.6, -0.4, 0.5], eagle: [0, 0, 0, -1.7, -0.16, 0.18, 0.64],
  supL: [-1.5708, 0, 0.6, -2.75, 1.12, -0.2, 0], supR: [-1.5708, 0, -0.6, -2.75, 1.12, -0.2, 0], legs: [-1.5708, 0, 0, -2.75, 0.3, 0.1, 1.15], heart: [0.16, 0, 0, 0.1, 0.13, 0, 0.64] };

export default function yoga(kit, lot) {
  const K = tools(kit, 53), X = fixtures(kit, K), A = arch(kit, lot, K), { ves, hcyl, tube, ball } = K;
  const at = (a, d, h = 0, face = 'back') => K.wrap(lot.fr(kit, a, d, h, face));
  const R = at(0, 0);                                              // room coordinates: x = a, y = d, z = height
  const W = lot.W, D = lot.D, FL = R.h, DA = lot.doorA, MID = W / 2;
  const DADO = 3.4, RAIL = 9.6;
  const roll = (f, ax, x, y, z, col, len = 2, r = 0.21) => { hcyl(f, col, ax, x, y, z, len, r, r, 12); hcyl(f, 'c#d9cdb2/0.8', ax, x, y, z, len * 0.09, r + 0.012, r + 0.012, 12); };      // a rolled mat with its strap
  const bolster = (f, x, y, z, col, len = 1.7) => { hcyl(f, col, 'x', x, y, z + 0.33, len, 0.33, 0.33, 14); hcyl(f, 'c#efe2bc/0.8', 'x', x, y, z + 0.33, len + 0.03, 0.09, 0.09, 8); };
  const zafu = (f, x, y, z, col, r = 0.62) => { ball(f, col, x, y, z, r, 16, 0.4); hcyl(f, 'c#efe2bc/0.8', 'z', x, y, z + r * 0.4, 0.03, r * 1.005, r * 1.005, 16, true); };
  const dado = (wall, s0, s1) => A.wainscot(wall, s0, s1, { h: DADO, mat: SAGE });

  // ---- the room itself: reception, a screen with a wide opening, the practice room, and a back room for tea ------------
  const P1 = A.partition(10.2, { openings: [{ a0: MID - 4.6, a1: MID + 4.6, z1: 8.6 }] });
  const P2 = A.partition(D - 7.1, { openings: [{ a0: 0.75, a1: 4.25, z1: 7.6 }, { a0: W - 4.25, a1: W - 0.75, z1: 7.6 }] });
  const F1 = { d: P1.front, side: 'front' }, B1 = { d: P1.back, side: 'back' }, F2 = { d: P2.front, side: 'front' }, B2 = { d: P2.back, side: 'back' };
  const SH0 = 14, SH1 = 30;                                        // the long shelf on the right wall of the practice room
  const DOORA = W - (0.72 * (W + 1) - 0.5), WINA = W - (0.3 * (W + 1) - 0.5);      // the real back door and back window
  const TC0 = WINA - 3.4, TC1 = WINA + 3.4;                        // the tea counter under the window
  for (const [s0, s1] of [[0.05, P1.front - 0.005], [P1.back + 0.005, P2.front - 0.005], [P2.back + 0.005, D - 0.05]]) { A.rail('left', s0, s1, { z: RAIL }); A.rail('right', s0, s1, { z: RAIL }); dado('left', s0, s1); }
  dado('right', 0.05, P1.front - 0.005); dado('right', P1.back + 0.005, SH0 - 0.07); dado('right', SH1 + 0.07, P2.front - 0.005); dado('right', P2.back + 0.005, D - 0.05);
  for (const f of [F1, B1, F2, B2, 'back']) A.rail(f, 0.07, W - 0.07, { z: RAIL });
  dado(F1, 0.076, MID - 4.98); dado(B1, 0.076, MID - 4.98); dado(B1, MID + 4.98, W - 0.076);
  dado(F2, 4.63, W - 4.63); dado(B2, 4.63, W - 4.63);
  dado('back', 0.076, DOORA - 1.88); dado('back', DOORA + 1.88, TC0 - 0.1); dado('back', TC1 + 0.1, W - 0.076);

  // ---- the platform at the far end of the practice room, and the sun behind it ----------------------------------------
  const PX0 = MID - 4.5, PX1 = MID + 4.5, PY1 = P2.front - 0.21, PY0 = PY1 - 5.2, PH = 0.5;
  R.box(PALE, PX0, PX1, PY0, PY1, 0, PH - 0.02, G); R.box(OAK, PX0 - 0.03, PX1 + 0.03, PY0 - 0.03, PY1 + 0.02, PH - 0.07, PH + 0.01, G);
  { const [x0, z0] = lot.world(PX0, PY0), [x1, z1] = lot.world(PX1, PY1); kit.town?.surfaces?.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), h: FL + PH }); }
  R.soft('c#b8361f/0.8', MID - 2.9, MID + 2.9, PY0 + 0.65, PY0 + 2.65, PH + 0.02, PH + 0.075, 0.025);            // Sol's own mat (pristine: Sol hovers)
  kit.pillarCandle(R, PX0 + 0.7, PY0 + 0.7, PH + 0.01, 0.7, 0.16); kit.pillarCandle(R, PX0 + 1.25, PY0 + 1.05, PH + 0.01, 0.45, 0.14);
  kit.pottedPlant(R, PX1 - 0.9, PY1 - 0.9, PH, 'snake', { size: 1.25, pot: 'c#f4f1ea/0.45' });
  { const b = at(MID, P2.front, 0, 'street'), hw = 4.7; b.box(TERRA, -hw - 0.1, hw + 0.1, 0.01, 0.05, 3.62, 9.28); kit.sign(b, 0, 0.06, 6.45, hw * 2, 5.46, MURAL, { cw: 1200, ch: 697, rough: 0.95 }); }

  // ---- the practice floor: two rows of mats facing the platform --------------------------------------------------------
  const seats = [];
  const ROWS = [[PY0 - 8.4, [MID - 4.2, MID, MID + 4.2]], [PY0 - 16.4, [MID - 6.3, MID - 2.1, MID + 2.1, MID + 6.3]]];
  let n = 0;
  for (const [d0, as] of ROWS) for (const a of as) {
    const i = n++;
    R.soft(MATS[i % MATS.length], a - 1, a + 1, d0, d0 + 5.8, 0.02, 0.075, 0.025);
    kit.seat(R, a, d0 + 2.3, 0.15, 'take this mat'); seats.push(kit.seats[kit.seats.length - 1]);
    // what two people left at the top of their mats
    if (i === 0) { kit.foldedStack(R, a - 0.3, d0 + 5.2, 0.08, 1, ['wool#c9b48a'], { w: 1.1, d: 0.8, t: 0.14 }); R.box(CORK, a + 0.25, a + 1.0, d0 + 5.05, d0 + 5.55, 0.08, 0.41); }
    if (i === 5) K.bottle(R, a + 0.75, d0 + 5.45, 0.08, { r: 0.11, h: 0.75, col: 'c#c9ccd0/0.2/1', cap: 'c#2f5a6a/0.45' });
  }

  // ---- right wall of the practice room: one long low shelf of props, its top level with the dado ----------------------
  { const Rs = at(W, (SH0 + SH1) / 2, 0, 'left'), h = (SH1 - SH0) / 2, z1 = 1.15, z2 = 2.2, TOP = 3.4;      // +x runs toward the back, +y out into the room
    X.shelving(Rs, -h, h, [z1, z2], { d: 1.25, mat: PALE, bay: 4, over: 1.1 });
    const stack = (x, z, k) => { for (const [y, dz, j] of [[0.36, 0, 0], [0.84, 0, 1], [0.6, 0.365, 2]]) roll(Rs, 'x', x + (j - 1) * 0.05, y, z + 0.215 + dz, MATS[(k + j * 2) % MATS.length], 1.7); };
    const cork = (x0, z, cols, hi) => { for (let i = 0; i < cols; i++) for (let j = 0; j < (i % 3 === 2 ? hi - 1 : hi); j++) Rs.box(CORK, x0 + i * 0.84, x0 + i * 0.84 + 0.75, 0.35, 0.85, z + 0.004 + j * 0.335, z + 0.334 + j * 0.335); };
    // on the floor
    bolster(Rs, -7, 0.62, 0.02, 'c#c98a6a/0.85'); bolster(Rs, -5, 0.62, 0.02, 'c#9fb0a4/0.85');
    kit.foldedStack(Rs, -3, 0.62, 0.02, 4, ['wool#c98a6a', 'wool#e8e2d4', 'wool#7d8f72', 'wool#e8e2d4'], { w: 1.4, d: 0.9, t: 0.17 }); kit.foldedStack(Rs, -1, 0.62, 0.02, 3, ['wool#d9b35a', 'wool#e8e2d4', 'wool#2f5a6a'], { w: 1.4, d: 0.9, t: 0.17 });
    cork(0.45, 0.02, 4, 3);
    bolster(Rs, 5, 0.62, 0.02, 'c#d9b35a/0.85'); bolster(Rs, 7, 0.62, 0.02, 'c#c9b48a/0.85');
    // the first shelf
    stack(-7, z1, 0); stack(-5, z1, 1); stack(-3, z1, 2); stack(-1, z1, 3);
    bolster(Rs, 1, 0.62, z1, 'c#9fb0a4/0.85'); bolster(Rs, 3, 0.62, z1, 'c#c98a6a/0.85');
    kit.foldedStack(Rs, 5, 0.62, z1, 4, ['wool#e8e2d4', 'wool#9fb0a4', 'wool#e8e2d4', 'wool#c98a6a'], { w: 1.4, d: 0.9, t: 0.17 }); kit.foldedStack(Rs, 7, 0.62, z1, 3, ['wool#7d8f72', 'wool#e8e2d4', 'wool#d9b35a'], { w: 1.4, d: 0.9, t: 0.17 });
    // the second: some of it left empty
    kit.foldedStack(Rs, -7, 0.62, z2, 3, ['wool#e8e2d4', 'wool#c9b48a', 'wool#e8e2d4'], { w: 1.4, d: 0.9, t: 0.17 });
    cork(-3.55, z2, 4, 2);
    stack(5, z2, 4); stack(7, z2, 1);
    // along the top
    kit.pottedPlant(Rs, -6.9, 0.65, TOP, 'fern', { size: 0.9, pot: 'c#f4f1ea/0.45' });
    kit.tableLamp(Rs, 0, 0.65, TOP, 'c#c98a6a/0.4');
    K.potted(Rs, 6.9, 0.7, TOP, { r: 0.3, n: 18, len: 1.5, up: 0.15, out: 0.55, droop: 1.5, pot: 'c#f4f1ea/0.45' }); }

  // ---- left wall of the practice room: the sun salutation, painted along it -------------------------------------------
  { const Lf = at(0, (P1.back + PY0) / 2 + 1, 0, 'right');
    Lf.box(TERRA, -6.58, 6.58, 0.01, 0.04, 5.07, 7.53); kit.sign(Lf, 0, 0.05, 6.3, 13, 2.3, FRIEZE, { cw: 1300, ch: 230, rough: 0.95 }); }
  // a ladder of blankets against the screen, and a big plant in the other front corner
  { const Lp = at(2.55, P1.back, 0, 'back'), lean = z => 1.3 - 1.05 * z / 4.7;
    for (const s of [-0.75, 0.75]) tube(Lp, PALE, [[s, lean(0), 0], [s, lean(4.7), 4.7]], 0.05, 6);
    for (const z of [1.2, 2.3, 3.4, 4.4]) hcyl(Lp, PALE, 'x', 0, lean(z), z, 1.5, 0.035, 0.035, 6);
    kit.hangingTowel(Lp, -0.05, lean(4.4), 4.4, 1.15, 0.9, 'wool#c98a6a'); kit.hangingTowel(Lp, 0.05, lean(3.4), 3.4, 1.2, 0.9, 'wool#e8e2d4'); kit.hangingTowel(Lp, 0, lean(2.3), 2.3, 1.15, 0.85, 'wool#7d8f72');
    Lp.block(-0.85, 0.85, 0, 1.4, 0, 4.7); }
  kit.pottedPlant(R, W - 2.0, P1.back + 1.75, 0, 'leafy', { size: 1.9, pot: 'c#f4f1ea/0.45' }); R.block(W - 2.9, W - 1.1, P1.back + 0.85, P1.back + 2.65, 0, 4);

  // ---- reception, left: shoes, and a bench to take them off on ---------------------------------------------------------
  const L = at(0.21, 5.6, 0, 'right');                            // +x runs toward the street, +y out into the room
  { const x0 = -2.2, x1 = 2.2, dp = 1.25, zs = [0.1, 1.05, 2.0, 2.95], nc = 4, cw = (x1 - x0) / nc;
    L.box(PALE, x0, x1, 0.02, 0.035, 0, 2.95, G); for (let i = 0; i <= nc; i++) L.box(PALE, x0 + i * cw - 0.04, x0 + i * cw + 0.04, 0.035, dp, 0, 2.87, G);
    for (const z of zs) L.box(PALE, x0 - (z > 2.9 ? 0.04 : 0.025), x1 + (z > 2.9 ? 0.04 : 0.025), 0.035, dp + (z > 2.9 ? 0.05 : 0), z - 0.08, z, G);
    L.block(x0, x1, 0, dp, 0, 3);
    const kinds = ['sneaker', 'loafer', 'flat', 'slipper', 'sneaker', 'flat'], cols = [undefined, 'leather#5a3a28', 'leather#8a1c1c', undefined, 'linen#9fb0d8', 'leather#c9952a'];
    [[0, 0], [1, 0], [3, 0], [2, 1], [0, 1], [3, 2]].forEach(([c, r], i) => kit.shoes(L, x0 + (c + 0.5) * cw, 0.62, zs[r] + 0.005, kinds[i], cols[i], { turn: (K.rnd() - 0.5) * 0.2 }));
    X.card(L, 0.5, 0.9, 2.95, 2.1, 0.5, TAG2('SHOES OFF', 'egos: top left cubby, please'), { cw: 400, ch: 96 });
    kit.pottedPlant(L, -1.6, 0.62, 2.95, 'fern', { size: 0.75, pot: 'c#f4f1ea/0.45' }); }
  { const bf = at(2.6, P1.front - 0.22, 0, 'street');             // the bench, its back to the screen; +y is toward the street
    bf.box(PALE, -1.9, 1.9, 0.02, 1.25, 1.38, 1.5, G); for (const s of [-1, 1]) bf.box(PALE, s * 1.65 - 0.06, s * 1.65 + 0.06, 0.1, 1.17, 0, 1.38, G); bf.box(PALE, -1.59, 1.59, 0.56, 0.68, 0.5, 0.66, G);
    bf.block(-1.9, 1.9, 0, 1.25, 0, 1.5); kit.seat(bf, 0, 0.7, 1.5, 'sit on the bench');
    kit.shoes(bf, 0.95, 0.75, 0.005, 'sneaker', 'linen#e8e2d4', { turn: 0.15 });
    // a peg rail over it: somebody's bag, somebody's mat
    A.rail(F1, 0.7, 4.5, { z: 5.75, deep: 0.09, tall: 0.3, mat: PALE });
    for (const x of [-1.5, -0.75, 0, 0.75, 1.5]) hcyl(bf, PALE, 'y', x, -0.01, 5.6, 0.24, 0.045, 0.045, 8);
    bf.soft('linen#d8ccb4', 0.3, 1.2, -0.11, 0.08, 3.75, 4.85, 0.05); tube(bf, 'linen#d8ccb4', [[0.5, -0.02, 4.8], [0.72, 0.03, 5.6], [0.78, 0.03, 5.6], [1.0, -0.02, 4.8]], 0.025, 5);
    roll(bf, 'z', -0.75, 0.1, 4.3, MATS[2], 2.0, 0.2); tube(bf, 'c#d9cdb2/0.8', [[-0.75, 0.1, 5.25], [-0.75, 0.03, 5.6]], 0.02, 5); }
  // one tall plant in the left half of the window
  kit.pottedPlant(R, 2.3, 2.0, 0, 'snake', { size: 2.4, pot: 'c#b8755a/0.85' }); R.block(1.5, 3.1, 1.2, 2.8, 0, 3);
  // a round jute mat in the middle
  R.cyl('c#a8906a/0.95', MID, 6.5, 0.006, 0.03, 3.2, 3.2, 48); R.cyl('c#c9b48a/0.95', MID, 6.5, 0.03, 0.045, 3.0, 3.0, 48);

  // ---- reception, right: the desk against the screen with the evening's slate over it; mats to borrow; how to breathe ---
  { const c = at(W - 2.6, P1.front, 0, 'street');                 // +x toward smaller a; +y toward the street (the visitor's side)
    const z = X.counter(c, -1.9, 1.9, 0.03, 1.7, 3.2, { front: TERRA, top: PALE, kick: 'c#3a2214/0.8', panels: false });
    kit.sign(c, 0, 1.705, 1.75, 3.0, 0.9, LOGO, { cw: 500, ch: 150, rough: 0.95 });
    X.slateBoard(c, 0, 6.3, 3.0, 2.4, TIMETABLE, { cw: 420, ch: 336, frame: OAK });
    kit.jarCandle(c, 1.35, 1.0, z + 0.015, { r: 0.18, tall: 0.4, wax: 'c#efe2bc/0.6', label: 'c#c9b48a/0.8' }); K.potted(c, -1.35, 0.8, z, { r: 0.2, n: 14, len: 0.75, pot: 'c#f4f1ea/0.45' });
    kit.foldedStack(c, 0.1, 0.85, z, 3, ['linen#e8e2d4', 'linen#c98a6a', 'linen#e8e2d4'], { w: 0.9, d: 0.7, t: 0.1 }); }
  { const Rm = at(W - 0.21, 5.8, 0, 'left');                      // +x runs toward the back, +y out into the room
    for (const y of [0.05, 0.78]) Rm.box(PALE, -1.65, 1.65, y, y + 0.07, 0, 1.3, G); for (const x of [-1.65, 1.58]) Rm.box(PALE, x, x + 0.07, 0.065, 0.835, 0, 1.3, G); Rm.box(PALE, -1.635, 1.635, 0.065, 0.835, 0.02, 0.09, G);
    for (let i = 0; i < 5; i++) roll(Rm, 'z', -1.24 + i * 0.62, 0.44, 1.12 + (i % 3) * 0.05, MATS[(i * 3 + 1) % MATS.length], 2.05 + (i % 2) * 0.12);
    Rm.block(-1.65, 1.65, 0, 0.85, 0, 2.3);
    const Rw = at(W, 5.8, 0, 'left'); Rw.box('c#17140f/0.45', -1.38, 1.38, 0.01, 0.07, 4.72, 8.48); kit.sign(Rw, 0, 0.08, 6.6, 2.6, 3.6, BREATHE, { cw: 400, ch: 554, rough: 0.95 }); }

  // ---- the singing bowl, on its stand in the window ---------------------------------------------------------------
  const BA = W - 3.4, BD = 2.6, BZ = 2.75;
  { X.plinth(R, BA, BD, 1.3, 1.3, BZ, { mat: PALE, solid: true });
    R.cyl('c#b8361f/0.8', BA, BD, BZ, BZ + 0.1, 0.4, 0.36, 20);
    ves(R, BRASS, BA, BD, BZ + 0.1, [[0, 0], [0.26, 0], [0.43, 0.1], [0.5, 0.28], [0.5, 0.44], [0.47, 0.44], [0.46, 0.28], [0.4, 0.13], [0.25, 0.05], [0, 0.05]], 28);
    hcyl(R, 'c#6a4a2a/0.8', 'x', BA + 0.02, BD - 0.5, BZ + 0.045, 0.8, 0.035, 0.03, 8); hcyl(R, 'c#8a1c1c/0.8', 'x', BA - 0.3, BD - 0.5, BZ + 0.06, 0.3, 0.06, 0.06, 10); }

  // ---- the back room: the back door, the window with its blind down, tea under it, the cushions ---------------------------
  { const bd = at(DOORA, D, 0, 'street');                          // the real back door is hung by town.js: here, only its casing (the opening is 3.1 wide, 6.95 high)
    for (const s of [-1, 1]) bd.box(A.TRIM, s * 1.7 - 0.15, s * 1.7 + 0.15, 0.004, 0.06, 0.004, 6.95, G);
    bd.box(A.TRIM, -1.85, 1.85, 0.004, 0.06, 6.95, 7.45, G);
    const wn = at(WINA, D, 0, 'street');
    wn.box(A.TRIM, -1.8, 1.8, 0.004, 0.06, 4.1, 8.7, G); wn.box(A.TRIM, -1.92, 1.92, 0.004, 0.3, 4.0, 4.1, G);
    wn.box('linen#ece2cc', -1.5, 1.5, 0.06, 0.08, 4.4, 8.4); wn.box(PALE, -1.53, 1.53, 0.06, 0.11, 4.36, 4.44, G);
    const tc = at(WINA, D, 0, 'street'), z = X.counter(tc, -3.4, 3.4, 0.03, 1.8, 3.0, { front: SAGE, top: PALE, kick: 'c#3a2214/0.8' });
    kit.model('vintage_electric_kettle', tc, 2.3, 0.9, z - 0.02, 0, { scale: 0.8 }); { const [sx, sz] = kit.world(tc, 2.3, 0.9); kit.steam.push({ x: sx, y: FL + z + 0.9, z: sz }); }
    ves(tc, 'c#2f5a6a/0.45', 1.2, 0.85, z, [[0, 0], [0.16, 0], [0.26, 0.12], [0.27, 0.26], [0.18, 0.38], [0.1, 0.4], [0.1, 0.43], [0.03, 0.47], [0, 0.47]], 18); tube(tc, 'c#2f5a6a/0.45', [[0.96, 0.85, z + 0.2], [0.82, 0.85, z + 0.3], [0.76, 0.85, z + 0.4]], 0.035, 6); tube(tc, 'c#6a4a2a/0.8', [[1.2, 0.67, z + 0.38], [1.2, 0.85, z + 0.62], [1.2, 1.03, z + 0.38]], 0.018, 6);      // the pot
    for (let i = 0; i < 5; i++) ves(tc, i % 2 ? 'c#e8e2d4/0.45' : 'c#9fb0a4/0.45', -0.1 + (i % 3) * 0.32, 0.75 + (i > 2 ? 0.36 : 0) + (i % 2) * 0.05, z, [[0, 0], [0.07, 0], [0.11, 0.08], [0.12, 0.17], [0.105, 0.17], [0.09, 0.06], [0, 0.04]], 12);
    ['c#b8553a/0.5', 'c#d9a441/0.5', 'c#2f4858/0.5'].forEach((m, i) => K.tin(tc, -1.2 - i * 0.5, 0.5, z, 0.2, 0.55, m, null));
    kit.tableLamp(tc, -2.75, 0.8, z, 'c#9fb0a4/0.4');
    { const [ex, ez] = kit.world(tc, 0.22, 1.16); kit.eats.push({ x: ex, y: FL + z + 0.1, z: ez, name: 'cup of tulsi tea', drink: { vessel: 'teacup', liquid: 0xb9772e }, note: 'Tulsi and ginger. It comes free with the class, or the other way round.', reach: 7 }); }
    // a bench against the back of the sun's wall, to sit on with the tea
    { const bb = at(MID - 1.5, P2.back + 0.22, 0, 'back');
      bb.box(PALE, -3, 3, 0.02, 1.1, 1.38, 1.5, G); for (const x of [-2.7, 0, 2.7]) bb.box(PALE, x - 0.06, x + 0.06, 0.1, 1.02, 0, 1.38, G); bb.box(PALE, -2.64, 2.64, 0.5, 0.62, 0.5, 0.66, G);
      bb.block(-3, 3, 0, 1.1, 0, 1.5); kit.seat(bb, 0.9, 0.6, 1.5, 'sit on the bench');
      kit.foldedStack(bb, -2.1, 0.56, 1.5, 2, ['wool#c98a6a', 'wool#e8e2d4'], { w: 1.2, d: 0.85, t: 0.16 }); }
    // cushions in the corner, and a tall plant between the door and the counter
    zafu(R, 1.25, D - 1.3, 0.02, 'c#2f5a6a/0.8'); zafu(R, 1.25, D - 1.3, 0.5, 'c#d9b35a/0.8', 0.56); zafu(R, 1.25, D - 1.3, 0.94, 'c#c98a6a/0.8', 0.5); zafu(R, 1.4, D - 2.75, 0.02, 'c#9fb0a4/0.8');
    R.block(0.5, 2.1, D - 3.4, D - 0.6, 0, 1.5);
    kit.pottedPlant(R, (DOORA + 1.9 + TC0) / 2, D - 1.2, 0, 'snake', { size: 1.7, pot: 'c#b8755a/0.85' }); R.block((DOORA + 1.9 + TC0) / 2 - 0.7, (DOORA + 1.9 + TC0) / 2 + 0.7, D - 1.9, D - 0.5, 0, 3); }

  // ---- the light: paper lanterns, one in reception and three pairs down the practice room --------------------------------
  X.pendant(R, MID, 5.8, { kind: 'paper', drop: 3.3, power: 0.9 });
  for (const d of [16.2, 21.4, 26.6]) for (const s of [-1, 1]) X.pendant(R, MID + s * 4.2, d, { kind: 'paper', drop: 3.4, power: 0.95 });

  // ---- out on the pavement: a bench and the board ------------------------------------------------------------------
  const o = K.wrap(lot.frOut(kit, 0, 0, 0, 'back'));              // x = a along the frontage, y = -feet out from the shopfront
  kit.model('painted_wooden_bench', o, Math.max(3.4, DA - 5.6), -1.25, 0, 2, { outdoor: true, collide: true, seat: 1.45 });
  X.aBoard(K.wrap(lot.frOut(kit, DA + 4.5, 5.4, 0, 'left')), 0, 0, BOARD);

  // ---- Sol ------------------------------------------------------------------------------------------------------------------
  const SOLHOME = lot.world(MID, PY0 + 1.7);
  kit.clerks.push({
    id: 'sol', name: 'Sol', lot: 'yoga', floor: FL + PH, look: { shape: 'egg', colour: '#e0a458', belly: '#fbf1df', trim: '#b8553a', hat: 'bun', hatColour: '#5a3a2a', scarf: '#2f5a6a', eye: '#fff1cf', ring: 0xffd08a, blush: true, hover: 3.4 },
    home: SOLHOME, faces: lot.world(MID, 8),
    lines: {
      greet: ['Welcome. Shoes off, shoulders down. In that order.', 'Take any mat and sit. The class begins when you do.'],
      idle: ['*hovers two inches higher, exhales, hovers two inches lower*', 'I have been holding this pose since Tuesday.', '*rings a very small bell, for nobody*'],
      bye: ['Go slowly. The street is not going anywhere.', 'Come back when your shoulders are up again.'],
      topics: [
        { q: 'How do I join a class?', a: 'Take any mat. When you sit, I begin. When you stand, I stop.' },
        { q: 'What classes are there?', a: 'Three, in rotation. Each time you sit, it is the next one.' },
        { q: 'Can a robot do yoga?', a: 'I have no spine and no feet. My Savasana, however, is flawless.' },
        { q: 'Why “Low Sun”?', a: 'The sun here is always about to set. So it is less a Sun Salutation, more a Sun Goodbye.' },
        { q: 'I am not flexible.', a: 'Nobody asked you to be. Steady and comfortable: that is the whole instruction.' },
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
    if (typeof location !== 'undefined') S.n = Math.max(0, Number(new URLSearchParams(location.search).get('yoga')) || 0);      // ?yoga=1 or 2 starts with the second or third class (for test shots)
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
      cProg.textContent = R0.name; cSk.textContent = 'Namaste'; cSay.textContent = R0.bye + ' (Another mat, another class.)'; cap.className = 'on end'; S.hide = 13;
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
      const l = S.on ? null : ['That is the bell for the end of class. Class has not begun.', 'Once is plenty.', 'Twice is a conversation.'][Math.min(k - 1, 2)];
      if (l && (k <= 3 || k % 4 === 0)) sol?.say(l, 'wink', 6); else ctx.flash?.('The bowl sings, and takes its time stopping.'); } };
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
