// Measuring. A fixed set of test viewpoints covering the street (arrival, both ways down it, the Yard, the
// alley, the picture garden, the Overlook, the airship stop), every shop you can walk into (just inside the door,
// and in the back room looking back toward the street, which is the costliest way to look: the back room, the
// front room through the partition's openings and the street through the window), the chapel and the air, and
// a stats dump that visits each of them in turn and writes what one frame there costs (draw calls,
// triangles, textures and geometry in memory, lights, the CPU time of the visibility code) as JSON into
// <pre id="statsdump">.
//
//   ?at=coffee_front            stand at a named viewpoint (for tools/shot.sh)
//   ?statsdump                  visit every viewpoint by day and at night
//   ?statsdump=arrival,chapel   only these
//   ?statsdump&hours=13         only this hour
// (These were the house's rooms when the engine was forked from Anna's House, and measured nothing here.)

import { LOTS, FL, FRONT } from './town.js';
import { CHAPEL } from './chapel.js';

const PI = Math.PI, CURB = 0.5;
// The direction (dx, dz) as a walker's yaw: yaw 0 looks toward -z (west, down the street into the sunset),
// PI/2 toward -x (south).
const yawOf = (dx, dz) => Math.atan2(-dx, -dz);

// walk: [x, feetY, z, yaw, pitch]
// orbit: [camX, camY, camZ, targetX, targetY, targetZ]
export const VIEWS = {
  arrival: { walk: [3, CURB, 26, 0, 0] },                         // where a visitor is set down (town.js spawn)
  airship_stop: { walk: [6, CURB, 50, yawOf(1, -0.3), 0] },        // the post and the bench, the street behind
  street_west: { walk: [-3, 0, -70, 0, 0.02] },                   // halfway down, into the sunset
  street_east: { walk: [3, 0, -130, PI, 0.02] },                  // halfway down, back toward the Landing
  yard: { walk: [-44, CURB, -98, yawOf(1, 0.2), -0.04] },         // the dumpling cart, the oak, the fire
  alley: { walk: [30, CURB, -116, yawOf(1, 0), 0] },              // Pickle Alley, toward the picture garden
  cinema_yard: { walk: [58, CURB, -100, yawOf(-1, 0), 0.05] },    // the picture garden, facing the screen
  overlook: { walk: [0, CURB, -224, 0, -0.03] },                  // the rail and the whole sky
  overlook_back: { walk: [0, CURB, -228, PI, 0.02] },             // the street from its west end, all of it in view
  aerial: { orbit: [-250, 165, 150, 0, 12, -70] },                // the overview you arrive to (main.js ABOVE)
  aerial_low: { orbit: [-90, 60, 40, 0, 10, -100] },
};
// Every shop you can walk into: just inside its door looking in, and at the back looking out toward the street
{
  const WALL = 0.8, SIDE = 0.5;
  // how deep the shop's back room is: where its partition stands (shops/*.js), and stand halfway between that and the back wall
  const PART = { coffee: 27.5, records: 27.5, museum: 26.6, bakery: 19.8, grocery: 32.2, plants: 29.2, apothecary: 31.0, yoga: 33.5, noodles: 35.4, books: 30, bikes: 28.5 };
  for (const lot of LOTS) {
    if (!lot.enter) continue;
    const s = lot.side, ui = FRONT + WALL, D = FRONT + lot.depth - SIDE - ui, W = lot.y1 - lot.y0 - 2 * SIDE;
    const at = (a, d) => [s * (ui + d), -(s > 0 ? (lot.y1 - SIDE) - a : (lot.y0 + SIDE) + a)];
    const door = W * (s > 0 ? 1 - lot.door : lot.door);
    const [fx, fz] = at(door, 4), [bx, bz] = at(W * 0.35, ((PART[lot.id] ?? 28) + D) / 2), [cx, cz] = at(W * 0.6, 0);
    VIEWS[lot.id + '_front'] = { walk: [fx, FL, fz, yawOf(s, 0), -0.06] };
    VIEWS[lot.id + '_back'] = { walk: [bx, FL, bz, yawOf(cx - bx, cz - bz), -0.04] };
  }
  // the chapel: just inside its west door, looking up the nave to the table
  const I = CHAPEL.inside, ix = I.x1 - 5, iz = (I.z0 + I.z1) / 2;
  VIEWS.chapel = { walk: [ix, CHAPEL.floor, iz, yawOf(-1, 0), 0.04] };
  VIEWS.chapel_door = { walk: [I.x0 + 6, CHAPEL.floor, iz, yawOf(1, 0), 0] };      // from the table back to the door and the street
}

// For ?at=name: [x, feetY, z, yaw, pitch] or null
export function namedView(name) { return VIEWS[name] ?? null; }

let H_ = null;
const waitFrames = async n => { const f0 = H_.frames; for (let i = 0; i < 2000 && H_.frames < f0 + n; i++) await sleep(16); };
const sleep = ms => new Promise(ok => setTimeout(ok, ms));

// H: { renderer, scene, camera, setView(v), setHour(h), pending(), visTime() }
export async function statsDump(H, which, hours) {
  H_ = H; const out = { views: {}, startup: {} };
  const pre = document.createElement('pre'); pre.id = 'statsdump'; pre.textContent = 'running'; document.body.append(pre);
  const t0 = performance.now();
  // wait for the first load to settle
  for (let i = 0; i < 600 && (H.pending() > 0 || !window.__ready); i++) await sleep(100);
  out.startup.settledMs = Math.round(performance.now() - t0);
  pre.textContent = 'settled ' + out.startup.settledMs + ' pending ' + H.pending() + ' ready ' + window.__ready;
  out.startup.firstFrameMs = H.firstFrameMs ?? null;
  out.startup.stages = H.stages;
  const res = performance.getEntriesByType('resource');
  out.startup.requests = res.length;
  out.startup.bytes = Math.round(res.reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0) / 1024) + ' KB';
  const names = which ? which.split(',') : Object.keys(VIEWS);
  const tally = {}; let tallyOn = false, tallyFrame = -1;
  // Count what is drawn, by kind, through onBeforeRender
  H.scene.traverse(o => { if (o.isMesh || o.isPoints || o.isLine || o.isSprite) tag(o); });
  function tag(o) {
    if (o.userData.__tagged) return; o.userData.__tagged = true;
    const prev = o.onBeforeRender;
    o.onBeforeRender = function (r, s, cam, geo, mat, group) {
      prev.apply(this, arguments);
      if (!tallyOn || H.frames !== tallyFrame || r.getRenderTarget()) return;      // one frame exactly (two were sometimes caught, doubling the count)
      let k = o.userData.cat, p = o; while (!k && p.parent) { p = p.parent; k = p.userData.cat ?? (p.parent && !p.parent.parent && p.name ? p.name : undefined); }
      k = k ?? (o.name || 'other');
      if (k === 'outdoors') k = 'outdoors:' + (o.name || o.parent?.name || 'anon');
      const g = geo, n = group ? group.count : g.index ? g.index.count : g.attributes.position.count;
      const tris = (o.isMesh ? n / 3 : 0) * (o.isInstancedMesh ? o.count : 1);
      const t = tally[k] ??= [0, 0]; t[0]++; t[1] += tris;
    };
  }
  for (const h of hours) {
    H.setHour(h);
    for (const name of names) {
      const v = VIEWS[name]; if (!v) continue;
      H.setView(v); pre.textContent = 'at ' + name + ' ' + h + ' ' + Math.round(performance.now() - t0) + ' frames ' + H.frames + ' pending ' + H.pending();
      await waitFrames(3);
      for (let i = 0; i < 400 && H.pending() > 0; i++) await sleep(50);
      await waitFrames(12);
      H.scene.traverse(o => { if ((o.isMesh || o.isPoints || o.isSprite) && !o.userData.__tagged) tag(o); });
      for (const k in tally) delete tally[k];
      H.resetVisTime?.();
      tallyFrame = H.frames; tallyOn = true; await waitFrames(1); tallyOn = false;
      const info = H.renderer.info, mem = memory(H);
      await waitFrames(1);
      const top = Object.entries(tally).sort((a, b) => b[1][1] - a[1][1]).slice(0, 12).map(([k, [c, t]]) => `${k}:${c}/${(t / 1000).toFixed(0)}k`);
      const topc = Object.entries(tally).sort((a, b) => b[1][0] - a[1][0]).slice(0, 8).map(([k, [c]]) => `${k}:${c}`);
      const fam = {}; for (const [k, [c, t]] of Object.entries(tally)) { const f = k.split(':')[0]; fam[f] ??= [0, 0]; fam[f][0] += c; fam[f][1] += t; }
      const byFam = Object.entries(fam).sort((a, b) => b[1][1] - a[1][1]).map(([k, [c, t]]) => `${k}:${c}/${(t / 1000).toFixed(0)}k`).join(' ');
      let mc = 0, mt = 0; for (const [c, t] of Object.values(tally)) { mc += c; mt += t; }
      out.views[`${name}@${h}`] = { byFam, calls: mc, tris: Math.round(mt), frameCalls: H.lastCalls, frameTris: H.lastTris, textures: info.memory.textures, geometries: info.memory.geometries, programs: info.programs?.length, texMB: mem.texMB, geoMB: mem.geoMB, visMs: H.visTime?.() ?? null, seen: H.vis ? [...H.vis.state.seen].map(([k, v]) => k.slice(2) + '/' + v.level).join(', ') : '', quality: H.quality, byTris: top.join(' '), byCalls: topc.join(' ') };
    }
  }
  out.totalMs = Math.round(performance.now() - t0);
  pre.textContent = JSON.stringify(out, null, 1);
  document.title = 'statsdump done';
  return out;
}

// Texture and geometry bytes actually uploaded to the GPU (estimated from sizes).
function memory(H) {
  const props = H.renderer.properties, seen = new Set(), geos = new Set();
  let tex = 0, geo = 0;
  const KEYS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap', 'bumpMap', 'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap', 'sheenColorMap', 'sheenRoughnessMap', 'transmissionMap', 'thicknessMap', 'specularIntensityMap', 'specularColorMap', 'iridescenceMap', 'lightMap', 'displacementMap', 'anisotropyMap'];
  H.scene.traverse(o => {
    if (o.geometry && !geos.has(o.geometry)) { geos.add(o.geometry); for (const a of Object.values(o.geometry.attributes)) geo += a.array?.byteLength ?? 0; if (o.geometry.index) geo += o.geometry.index.array.byteLength; }
    // (a streamed sheet's copies, life.js, are counted whether or not the one in use: any of them may be on the card)
    for (const t of [...[].concat(o.material ?? []).flatMap(m => KEYS.map(k => m[k])), ...(o.userData.textures ?? [])]) {
      const id = t && (t.source?.uuid ?? t.uuid); if (!t || seen.has(id)) continue; seen.add(id);
      const src = t.source?.data ?? t.image; if (!src) continue;
      if (!props.get(t).__webglTexture) continue;
      const w = src.width ?? 0, h = src.height ?? 0;
      tex += w * h * 4 * (t.generateMipmaps !== false && t.minFilter !== 1006 ? 1.333 : 1);
    }
  });
  return { texMB: +(tex / 1048576).toFixed(1), geoMB: +(geo / 1048576).toFixed(1) };
}
