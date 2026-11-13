// Eating and drinking, as in Anna's House: what you are given or help yourself to is held in the hand
// at the edge of view. Q (or E / a tap with nothing in front of you) takes a sip or a bite: the hand
// comes up to the mouth and back. A drink goes down a sixth at a sip, and slowly by itself; food goes
// in three bites. R sets it down on the nearest table or counter, where it can be picked up again;
// when it is finished the empty is set down for you (or simply gone, if it was a bun).
//
// For the shops:
//   kit.eats.push({ x, y, z, name, model: 'croissant' | build: THREE => Object3D, scale, bites, note, reach,
//                   drink: { vessel, liquid } })       (world position of the thing on its plate or shelf)
//       makes "take a croissant" appear there; the one on show stays where it is, a copy comes away in the hand.
//       `note` is said (as a passing line) when it is finished. A `drink` is poured into one of drinks.js's vessels.
//   ctx.hold(item, object3d?, { from: Vector3 })       puts something in the visitor's hand directly
//   clerks with `serve` hand their drinks and dishes over through this (clerks.js).

import { buildDrink, setFill, useThreeDrinks } from './clerks/drinks.js';

export function setupHold(ctx) {
  const { THREE, scene, camera } = ctx;
  useThreeDrinks(THREE);
  const group = new THREE.Group(); group.name = 'in hand'; scene.add(group);
  let held = null, sipAt = -1e9, now = 0, told = false;
  const down = [];
  const fwd = new THREE.Vector3(), right = new THREE.Vector3();
  const isFood = d => !!d.food;
  const fillOf = h => (isFood(h.d) ? 1 : Math.max(0.06, 1 - (now - h.since) / (h.d.last ?? 90)));

  // a table, counter or shelf top near the visitor to put a thing on
  function surfaceNear() {
    const p = ctx.walker.pos; let best = null, bd = 7;
    for (const c of ctx.colliders) {
      if (c.off || c.y1 < p.y + 1.3 || c.y1 > p.y + 4.2 || (c.x1 - c.x0) * (c.z1 - c.z0) > 90 || Math.min(c.x1 - c.x0, c.z1 - c.z0) < 0.8) continue;
      const x = Math.max(c.x0 + 0.3, Math.min(c.x1 - 0.3, p.x)), z = Math.max(c.z0 + 0.3, Math.min(c.z1 - 0.3, p.z)), d = Math.hypot(x - p.x, z - p.z);
      if (d < bd) { bd = d; best = { x, y: c.y1 + 0.005, z }; }
    }
    return best;
  }
  function leave(rec) {
    rec.ent = { x: rec.x, y: rec.y + 0.2, z: rec.z, reach: 5.5, size: 0.6, label: () => (held ? '' : rec.empty ? '' : `pick up the ${rec.d.name}`), act: () => { if (held || rec.empty) return; forget(rec); hold(rec.d, rec.g, { fill: rec.fill, bites: rec.bites, s0: rec.s0, again: true }); } };
    if (!rec.empty) ctx.interact.push(rec.ent);
    down.push(rec);
    if (down.length > 10) { const old = down.shift(); forget(old); group.remove(old.g); }      // the robots clear up eventually
  }
  function forget(rec) { const i = ctx.interact.indexOf(rec.ent); if (i >= 0) ctx.interact.splice(i, 1); const j = down.indexOf(rec); if (j >= 0) down.splice(j, 1); }
  function putDown() {
    if (!held) return false;
    const s = surfaceNear(); if (!s) { ctx.flash('Nowhere to put it down here.'); return false; }
    const h = held; held = null;
    h.g.position.set(s.x, s.y, s.z); h.g.rotation.set(0, Math.random() * 6, 0);
    if (isFood(h.d)) h.g.scale.setScalar(h.s0 * (1 - 0.27 * Math.min(h.bites, 3)));
    leave({ g: h.g, d: h.d, fill: fillOf(h), bites: h.bites, s0: h.s0, x: s.x, y: s.y, z: s.z });
    return true;
  }
  function hold(d, g, o = {}) {
    if (held && !putDown()) { group.remove(held.g); held = null; }
    g = g ?? (d.drink ? buildDrink({ id: d.name, vessel: d.drink.vessel ?? 'latte', liquid: d.drink.liquid ?? 0xc9a27a }) : null); if (!g) return;
    g.removeFromParent(); group.add(g);
    const fill = o.fill ?? 1; if (!isFood(d)) setFill(g, fill, 0);
    held = { d, g, since: now - (1 - fill) * (d.last ?? 90), s0: o.s0 ?? g.scale.x, bites: o.bites ?? 0, from: o.from ?? null, at: now };
    ctx.flash(o.again ? `You pick up the ${d.name} again.` : `You take the ${d.name}.${told ? '' : isFood(d) ? ' Q to eat, R to put it down.' : ' Q to sip, R to put it down.'}`); told = true;
  }
  function sip() {
    if (!held || now - sipAt < 1.25) return false;
    sipAt = now; const d = held.d;
    if (isFood(d)) { if (++held.bites >= (d.bites ?? 3)) held.gone = true; } else held.since -= (d.last ?? 90) / 6;
    ctx.sound?.note?.(isFood(d) ? 50 : 62, 0.35, 0.12, 0.03);
    return true;
  }
  ctx.hold = hold; ctx.sip = sip; ctx.holding = () => held?.d ?? null;
  addEventListener('keydown', e => {
    if (e.repeat || ctx.mode !== 'walk' || /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName ?? '')) return;
    if (e.code === 'KeyQ' || e.code === 'KeyB') sip();
    if (e.code === 'KeyR' && held) putDown();
  });

  ctx.animated.push(t => {
    now = t; if (!held) return;
    const h = held, g = h.g, sk = (now - sipAt) / 1.1, bell = sk > 0 && sk < 1 ? Math.sin(Math.PI * sk) : 0;
    if (h.gone && sk >= 0.55) {                                             // the last bite
      group.remove(g); held = null; ctx.flash(h.d.note ?? `You finish the ${h.d.name}.`); return;
    }
    if (!isFood(h.d)) {
      const f = fillOf(h); setFill(g, f, now);
      if (f <= 0.065) {                                                      // finished: the empty goes down nearby
        held = null; const s = surfaceNear();
        if (s) { g.position.set(s.x, s.y, s.z); leave({ g, d: h.d, empty: true, x: s.x, y: s.y, z: s.z }); ctx.flash(h.d.note ?? `You finish the ${h.d.name} and set the empty down.`); }
        else { group.remove(g); ctx.flash(h.d.note ?? `You finish the ${h.d.name}.`); }
        return;
      }
    }
    camera.getWorldDirection(fwd); right.set(-fwd.z, 0, fwd.x).normalize();
    g.position.copy(camera.position).addScaledVector(fwd, 0.95 - 0.42 * bell).addScaledVector(right, 0.4 - 0.33 * bell); g.position.y -= 0.6 - 0.34 * bell - Math.sin(now * 1.3) * 0.006;
    if (h.from) { const k = Math.min(1, (now - h.at) / 0.45), e = k * k * (3 - 2 * k); g.position.lerpVectors(h.from, g.position, e); if (k >= 1) h.from = null; }
    g.rotation.order = 'YXZ'; g.rotation.set(0.75 * bell, Math.atan2(-fwd.x, -fwd.z) + 0.5, 0);
    if (isFood(h.d)) g.scale.setScalar(h.s0 * (1 - 0.27 * Math.min(h.bites, 3) * (sk > 0.5 || h.bites === 0 ? 1 : (h.bites - 1) / h.bites)));
  });

  // ---- things to help yourself to, listed by the shops ---------------------------------------------------
  for (const e of ctx.items.eats ?? []) {
    const d = { name: e.name, food: !e.drink, bites: e.bites ?? 3, note: e.note, drink: e.drink, last: e.last };
    const an = /^[aeiou]/i.test(e.name) ? 'an' : 'a';
    ctx.interact.push({ x: e.x, y: e.y, z: e.z, reach: e.reach ?? 6, size: e.size ?? 0.7, label: () => e.label ?? (e.drink ? `pour yourself ${an} ${e.name}` : `take ${e.plural ? 'some' : an} ${e.name}`), act: async () => {
      const from = new THREE.Vector3(e.x, e.y, e.z);
      if (e.drink) { hold(d, null, { from }); return; }
      let g = null;
      try { g = e.build ? e.build(THREE) : await ctx.loadModel(e.model); } catch { g = null; }
      if (!g) return;
      if (e.scale) g.scale.multiplyScalar(e.scale);
      const wrap = new THREE.Group(); wrap.add(g); new THREE.Box3().setFromObject(g).getCenter(g.position).multiplyScalar(-1);      // held by its middle
      hold(d, wrap, { from });
    } });
  }
  return { hold, sip, putDown };
}
