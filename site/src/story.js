// The one thing that happens. It is always nearly evening on Vesper Street; but if you have been
// into every shop and then walk out past the rail to the last bench and sit down, the sun
// finally sets for you: the sky goes through its colours, the stars come out, the windows glow.
// A card is stamped as you go (kept in localStorage), so the street remembers you next time.

const SHOPS = ['yoga', 'coffee', 'books', 'grocery', 'plants', 'museum', 'records', 'bakery', 'apothecary', 'noodles'];
const NAMES = { yoga: 'Low Sun Yoga', museum: 'The Museum of Small Wonders', bakery: 'Tomorrow Bread', noodles: 'Night Noodle', coffee: 'Slow Hand Coffee', books: 'Marginalia', grocery: 'Salt & Larder', plants: 'Frond', records: 'Low Tide Records', apothecary: 'Wick & Sundry' };

export function setupStory(ctx, { setHour, getHour, dusk, night, flash }) {
  const N = SHOPS.length;
  let seen = new Set();
  try { seen = new Set(JSON.parse(localStorage.getItem('vesper.stamps') ?? '[]')); } catch { /* private window */ }
  const save = () => { try { localStorage.setItem('vesper.stamps', JSON.stringify([...seen])); } catch { /* private window */ } };
  let last = null, setting = null, done = false, hinted = false;
  ctx.story = { seen, get all() { return SHOPS.every(s => seen.has(s)); }, get setting() { return !!setting; } };
  ctx.animated.push((t, dt) => {
    const lot = ctx.room?.lot ?? null;
    if (lot !== last) {
      last = lot;
      if (lot && SHOPS.includes(lot) && !seen.has(lot)) {
        seen.add(lot); save();
        const n = SHOPS.filter(s => seen.has(s)).length;
        setTimeout(() => flash(n < N ? `${NAMES[lot]}: stamped, ${n} of ${N}` : 'Every shop stamped. They say the last bench, out past the rail, is worth sitting on now.'), 2600);
      }
    }
    const seat = ctx.walker?.seated;
    const atEdge = !!seat && /edge of everything/.test(seat.label ?? '');
    if (atEdge && !setting && !done) {
      const h = getHour(), dark = h >= night || h < 5;
      if (dark) { done = true; flash('The sun has gone down already. Look up instead.'); }
      else if (ctx.story.all) { setting = { from: h, to: night, t: 0, secs: Math.max(30, Math.min(75, (night - h) * 9)) }; flash(h < dusk - 1 ? 'The day, seeing you settled, hurries politely toward evening.' : 'The sun, after some thought, sets.'); }
      else if (!hinted) { hinted = true; const n = N - SHOPS.filter(s => seen.has(s)).length; flash(`A good bench. (${n} ${n === 1 ? 'shop' : 'shops'} still unvisited; the sun seems to be waiting for something.)`); }
    }
    if (setting) {
      // the rest of the day in about a minute, in steps (each step remakes the light)
      setting.t += dt; setting.acc = (setting.acc ?? 0) + dt;
      if (setting.acc > 0.8) { setting.acc = 0; const k = Math.min(1, setting.t / setting.secs), e = k * k * (3 - 2 * k); setHour(setting.from + (setting.to - setting.from) * e); if (k >= 1) { setting = null; done = true; setTimeout(() => flash('Evening. The street will be here when you get up.'), 1500); } }
    }
  });
}
