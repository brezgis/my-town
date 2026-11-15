// What the clerks do with their hands. A clerk's day is a string of small jobs, each at a place in its shop
// (its till, its machine, a shelf, a counter, a bin, a chair) and each with a way of working there: tamping
// and pulling a shot, wiping down, flipping through a bin of records, straightening apples, reshelving,
// watering, trimming wicks, carrying a tray of loaves to the window. The trade table below says which, for
// whom, and how often; the poses say where the two mittens go, how the body leans, and where the eyes look.
// Calm, after the town's rule: slow hands, small movements, a pause between strokes.
//
//   TRADES[id]   { till, machine, tall, low, seat, carry, step }: lists of pose names (or one) for each kind of
//                place; seat: the pose when sitting (null: never sits); carry: what it carries from its machine
//                to the window (only the baker); step: how often it potters off to a job, 0..1
//   pose(name, t, D) -> { L, R, lean, rise, ly, pour, look }
//     t   seconds into the job; D: the body's measures { x, y, f, lo, mid, hi } (bob frame: x the hand's rest
//         across, y its rest height, f in front of the body, lo, mid, hi heights for low, middle and high work)
//     L, R   where the left and right hands go (bob frame); lean: tip forward (radians); rise: up or down (feet);
//     ly: where the eyes look, -1 up to 1 down; pour: tip the right hand forward (the watering can, the ladle)

const TAU = Math.PI * 2;
const ease = x => x * x * (3 - 2 * x);
const wave = (t, p) => 0.5 - 0.5 * Math.cos(t * TAU / p);          // 0..1..0 over a period p
const pulse = (t, p, on) => { const k = (t % p) / p; return k < on ? Math.sin(Math.PI * k / on) : 0; };  // a stroke, then a rest

export const TRADES = {
  juniper: { till: ['wipe', 'polish'], machine: ['tamp', 'pull', 'pull'], tall: ['restock'], low: ['wipe', 'restock'], seat: 'rest', step: 0.8 },
  otis: { till: ['swap', 'nod'], machine: ['swap'], tall: ['shelve', 'flip'], low: ['flip', 'flip'], seat: 'listen', step: 0.85 },
  olive: { till: ['wipe', 'straighten'], tall: ['restock'], low: ['straighten', 'straighten', 'wipe'], seat: null, step: 0.85 },
  folio: { till: ['read', 'straighten'], tall: ['shelve', 'shelve'], low: ['straighten', 'shelve'], seat: 'read', step: 0.75 },
  moss: { till: ['trim'], tall: ['water'], low: ['water', 'water', 'trim'], seat: null, step: 0.9 },
  ember: { till: ['trim', 'polish'], tall: ['dust', 'restock'], low: ['trim', 'trim'], seat: 'rest', step: 0.75 },
  crumb: { till: ['wipe'], machine: ['oven'], tall: ['restock'], low: ['wipe', 'straighten'], carry: 'tray', seat: null, step: 0.8 },
  kombu: { till: ['wipe', 'stir'], machine: ['stir', 'stir'], tall: ['restock'], low: ['wipe'], seat: null, step: 0.7 },
  pascal: { till: ['tinker'], tall: ['restock', 'tinker'], low: ['tinker', 'tinker', 'wipe'], seat: 'tinker', step: 0.8 },
  quill: { till: ['straighten'], tall: ['dust'], low: ['dust', 'polish'], seat: 'read', step: 0.75 },
  hesper: { till: ['polish', 'wipe'], machine: ['shake', 'polish'], tall: ['restock'], low: ['wipe', 'polish'], seat: null, step: 0.7 },
  wren: { till: ['tend'], tall: ['tend', 'dust'], low: ['tend', 'tend'], seat: 'rest', step: 0.7 },
  sol: { till: ['stretch', 'breathe'], seat: null, step: 0 },
  bao: { till: ['pleat', 'pleat', 'stir'], machine: ['stir'], seat: null, step: 0.25 },
  gus: { till: ['tend'], tall: ['tend'], low: ['tend', 'water'], seat: 'rest', step: 0.6 },
};
export const tradeOf = id => TRADES[id] ?? { till: ['wipe'], tall: ['restock'], low: ['wipe', 'straighten'], seat: 'rest', step: 0.7 };

// How long each job lasts, about (seconds)
export const SECS = { wipe: 11, polish: 12, tamp: 5, pull: 8, restock: 13, swap: 10, nod: 14, flip: 14, shelve: 14, straighten: 12, read: 34, listen: 28, water: 13, trim: 13, dust: 12,
  oven: 5, stir: 14, tinker: 15, tend: 14, shake: 6, stretch: 14, breathe: 12, pleat: 11, rest: 24, tray: 0, idle: 6 };

export function pose(name, t, D) {
  const { x, y, f, lo, mid, hi } = D, o = { L: [-x, y, 0.1], R: [x, y, 0.1], lean: 0, rise: 0, ly: 0, pour: 0 };
  const at = (side, px, py, pz) => { o[side] = [px, py, pz]; };
  switch (name) {
    case 'wipe': {                                                                   // a cloth in circles on the counter, the other hand steadying
      const k = t * 1.6; at('R', x * 0.4 + 0.16 * Math.cos(k), lo, f + 0.12 + 0.1 * Math.sin(k)); at('L', -x * 0.55, lo + 0.04, f); o.lean = 0.16; o.ly = 0.7; break;
    }
    case 'polish': {                                                                 // a glass held up in one hand, turned in a cloth with the other
      const k = t * 2.2; at('L', -0.1, mid + 0.06, f + 0.06); at('R', 0.08 + 0.05 * Math.cos(k), mid + 0.08 + 0.04 * Math.sin(k), f + 0.1); o.ly = 0.35; break;
    }
    case 'tamp': {                                                                   // the portafilter steadied, pressed down twice, a twist
      const p = pulse(t, 1.6, 0.5); at('L', -0.12, mid - 0.02, f + 0.04); at('R', 0.04, mid + 0.1 - 0.12 * p, f + 0.06); o.lean = 0.12 + 0.05 * p; o.ly = 0.8; break;
    }
    case 'pull': {                                                                   // a hand up to the group head, then waiting for the shot
      const k = Math.min(1, t / 1.2); at('R', x * 0.5, mid + 0.35 * (1 - ease(k)) + 0.15, f + 0.1); at('L', -x * 0.5, lo + 0.1, f + 0.1); o.ly = 0.5 + 0.3 * k; o.lean = 0.06; break;
    }
    case 'restock': case 'shelve': {                                                 // up to a shelf and back down to the stack, slowly
      const up = ease(wave(t, 3.4)), hy = lo + (hi - lo) * up;
      at('R', x * 0.4, hy, f + 0.18 + 0.1 * up); at('L', -x * 0.5, lo + (hi - lo) * ease(wave(t + 0.5, 3.4)) * 0.85, f + 0.1); o.ly = 0.6 - 1.4 * up; o.lean = 0.04 - 0.08 * up; o.rise = 0.12 * up; break;
    }
    case 'flip': {                                                                   // fingering through a bin: a flick, a look, a flick
      const p = pulse(t, 1.1, 0.35), pick = (t % 7.7) > 6.2 ? ease(Math.min(1, ((t % 7.7) - 6.2) / 0.6)) : 0;
      at('R', x * 0.25, lo - 0.05 + 0.2 * pick, f + 0.2 - 0.12 * p); at('L', -x * 0.3, lo, f + 0.08); o.lean = 0.2 - 0.12 * pick; o.ly = 0.9 - 0.8 * pick; break;
    }
    case 'swap': {                                                                   // a record lifted off the platter, looked at, the other one put on
      const k = wave(t, 4.5); at('R', x * 0.3, lo + 0.45 * k, f + 0.15); at('L', -x * 0.35, lo + 0.4 * k, f + 0.12); o.ly = 0.8 - 0.9 * k; o.lean = 0.12 * (1 - k); break;
    }
    case 'nod': case 'listen': {                                                     // nodding along to whatever is on
      at('L', -x, y + 0.04 * Math.sin(t * 4), 0.1); at('R', x, y + 0.04 * Math.sin(t * 4 + 1), 0.1); o.lean = 0.05 * Math.sin(t * 4.2); o.ly = -0.2; break;
    }
    case 'straighten': {                                                             // patting things into line along a shelf
      const s = Math.sin(t * 0.9), p = pulse(t, 1.4, 0.4);
      at('R', x * 0.3 + 0.2 * s, lo + 0.06 - 0.06 * p, f + 0.16); at('L', -x * 0.3 + 0.2 * s, lo + 0.06 - 0.05 * pulse(t + 0.7, 1.4, 0.4), f + 0.16); o.lean = 0.14; o.ly = 0.8; break;
    }
    case 'read': {                                                                   // a book open in both hands; now and then a page
      const turn = pulse(t, 7, 0.12); at('L', -0.2, mid - 0.05, f + 0.18); at('R', 0.2 - 0.32 * turn, mid - 0.05 + 0.08 * turn, f + 0.18); o.lean = 0.1; o.ly = 0.7; break;
    }
    case 'water': {                                                                  // the can tipped over a pot, moved slowly along
      const tip = ease(Math.min(1, t / 1.5)) * (0.7 + 0.1 * Math.sin(t * 1.3)); at('R', x * 0.5 + 0.12 * Math.sin(t * 0.6), lo + 0.15, f + 0.25); at('L', -x * 0.6, y, 0.12); o.pour = tip; o.lean = 0.12; o.ly = 0.8; break;
    }
    case 'trim': {                                                                   // close work: a wick, a leaf; small snips
      const p = pulse(t, 0.9, 0.3); at('R', 0.08 + 0.03 * p, lo + 0.1, f + 0.14); at('L', -0.1, lo + 0.08, f + 0.12); o.lean = 0.2; o.ly = 0.9; break;
    }
    case 'dust': {                                                                   // a duster along a shelf or a case, side to side
      at('R', x * 0.3 + 0.28 * Math.sin(t * 1.5), mid + 0.2 + 0.1 * Math.sin(t * 3), f + 0.22); at('L', -x * 0.7, y, 0.1); o.ly = 0.2 - 0.3 * Math.sin(t * 1.5) * 0; o.lean = 0.04; break;
    }
    case 'oven': {                                                                   // the peel in, the tray out
      const k = ease(Math.min(1, t / 2)); at('R', 0.2, lo + 0.05, f + 0.15 + 0.25 * (1 - k)); at('L', -0.2, lo + 0.05, f + 0.15 + 0.25 * (1 - k)); o.lean = 0.18 * (1 - k); o.ly = 0.7; break;
    }
    case 'tray': {                                                                   // carrying the tray out in front, level
      at('R', 0.32, lo + 0.04, f + 0.18); at('L', -0.32, lo + 0.04, f + 0.18); o.ly = 0.2; break;
    }
    case 'stir': {                                                                   // the ladle round the pot, slow
      const k = t * 1.3; at('R', x * 0.3 + 0.12 * Math.cos(k), lo + 0.05, f + 0.22 + 0.1 * Math.sin(k)); at('L', -x * 0.6, lo + 0.1, f + 0.05); o.pour = 0.3; o.lean = 0.14; o.ly = 0.8; break;
    }
    case 'tinker': {                                                                 // a spanner on a nut: a quarter turn, a look, again
      const p = pulse(t, 1.8, 0.6); at('R', x * 0.3, lo - 0.05, f + 0.2); at('L', -x * 0.25, lo - 0.02, f + 0.16); o.pour = -0.6 * p; o.lean = 0.22; o.ly = 0.9; break;
    }
    case 'tend': {                                                                   // a taper held to a wick, then straightening the candle
      const k = wave(t, 5); at('R', x * 0.3, mid + 0.1 + 0.15 * k, f + 0.25); at('L', -x * 0.3, mid - 0.05, f + 0.12); o.ly = 0.4 - 0.3 * k; o.lean = 0.08; break;
    }
    case 'shake': {                                                                  // a shaker over the shoulder
      const s = Math.sin(t * 9) * 0.06; at('R', x * 0.6, mid + 0.35 + s, 0.1); at('L', x * 0.3, mid + 0.25 + s, 0.16); o.ly = -0.1; break;
    }
    case 'stretch': {                                                                // slow arms up, a lean one way, down, the other
      const k = ease(wave(t, 7)), side = Math.sin(t * TAU / 14);
      at('R', x + 0.1 * (1 - k), y + (hi + 0.4 - y) * k, 0.05); at('L', -x - 0.1 * (1 - k), y + (hi + 0.4 - y) * k, 0.05); o.lean = -0.05 * k; o.side = 0.12 * side * k; o.ly = -0.3 * k; break;
    }
    case 'breathe': {                                                                // hands together in front, rising and falling with breath
      const k = wave(t, 5); at('R', 0.1, mid - 0.1 + 0.1 * k, f + 0.08); at('L', -0.1, mid - 0.1 + 0.1 * k, f + 0.08); o.rise = 0.06 * k; o.ly = 0.3; o.calm = true; break;
    }
    case 'pleat': {                                                                  // a dumpling in one hand, pleated with the other, quickly
      const p = pulse(t, 0.6, 0.4); at('L', -0.08, lo + 0.1, f + 0.12); at('R', 0.06 + 0.04 * p, lo + 0.12 + 0.03 * p, f + 0.14); o.lean = 0.16; o.ly = 0.9; break;
    }
    case 'rest': {                                                                   // sitting a moment, hands in the lap
      at('R', 0.18, lo, f + 0.05); at('L', -0.18, lo, f + 0.05); o.ly = 0.1; o.calm = true; break;
    }
    default: break;
  }
  return o;
}
