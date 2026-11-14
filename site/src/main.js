import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Builder } from './builder.js';
import { makeMaterials } from './materials.js';
import { buildTown, FL, CEIL } from './town.js';
import { furnish } from './shops/index.js';
import { buildIsland } from './island.js';
import { layStreet, TREES, ISLAND, placeName } from './street.js';
import { makeTrees } from './trees.js';
import { bringToLife } from './life.js';
import { Walker, eyeHeight, setEyeHeight } from './walk.js';
import { buildSky } from './sky.js';
import { makeSound } from './sound.js';
import { makeAbout } from './about.js';
import { namedView, statsDump, VIEWS } from './perf.js';
import { makeVisibility } from './visibility.js';
import { chooseQuality, rememberSlow, QUALITY_OPTIONS, storedChoice, chooseTier } from './quality.js';
import { setTextureTier, sharpenTextures } from './materials.js';
import { HL, installHouseLight, setHourLight, makeLampPool, makeExposure, makeWindowGlow, makeVignette, makeHalos } from './lighting.js';
import { makeWarmer } from './warm.js';
import { makeShade } from './shade.js';

import { loadFonts } from './fonts.js';

// Every sign, label, leaf and face on the street is painted on a 2D canvas and handed to the renderer as
// a texture. Browsers keep such canvases on the graphics card unless told otherwise, and a card that is
// short of memory can silently drop them: the canvas comes back blank, and trees lose their leaves or signs
// go black. Kept in ordinary memory they cannot be lost, and they upload to WebGL without a read-back.
{ const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type, opts) { return get.call(this, type, type === '2d' ? { willReadFrequently: true, ...opts } : opts); }; }
await loadFonts();      // signs are painted at start-up: their typefaces first (fonts.js)
const Q = new URLSearchParams(location.search);
const $ = id => document.getElementById(id);
const lerp = THREE.MathUtils.lerp, clamp = THREE.MathUtils.clamp;
const sound = makeSound();

// ---- Renderer -------------------------------------------------------------------
// Sharpness is traded for speed automatically: the drawing resolution starts
// modest and drops further if the frame rate cannot keep up.
// The quality tier (quality.js) sets the starting resolution, antialiasing, shadow detail
// and texture sizes; ?quality=low|medium|high forces one.
const QUALITY = chooseQuality(Q);
setTextureTier(QUALITY.tex);
const MAX_RATIO = Math.min(devicePixelRatio, Number(Q.get('ratio') ?? QUALITY.ratio));
let ratio = MAX_RATIO;
const renderer = new THREE.WebGLRenderer({ antialias: QUALITY.antialias, powerPreference: 'high-performance' });
renderer.setPixelRatio(ratio);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = QUALITY.softShadow ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.25, 3000);

// ---- Sky, sun and the hour ---------------------------------------------------------
// The light follows the visitor's own clock (see sky.js).
const sky = buildSky(scene, renderer, new THREE.Vector3(0, 8, -62));
const sun = sky.sun, day = sky.state;
sun.shadow.mapSize.set(QUALITY.shadow, QUALITY.shadow);
const now = new Date();
// The street keeps the visitor's own clock, as the house does (so the two agree when you travel between
// them); ?time=17.5 or ?time=dusk sets it, and [ and ] and the settings card move it.
let hour = Q.has('time') ? (Q.get('time') === 'dusk' ? sky.dusk : Number(Q.get('time'))) : now.getHours() + now.getMinutes() / 60;
function setHour(h) {
  sky.setHour(h); hour = day.hour;
  setHourLight(day, materials);
  const hh = Math.floor(hour), mm = String(Math.floor((hour % 1) * 60)).padStart(2, '0');
  const part = hour < 5 ? 'at night' : hour < 12 ? 'in the morning' : hour < 17 ? 'in the afternoon' : hour < 21 ? 'in the evening' : 'at night';
  $('clock').textContent = `${((hh + 11) % 12) + 1}:${mm} ${part}`;
}

// ---- The house, its furniture, garden and trees ---------------------------------------
const builder = new Builder();
builder.zone = 'shell';                                   // the house itself is always drawn (see visibility.js)
const STAGE = {}, mark = k => { STAGE[k] = Math.round(performance.now()); };      // start-up timings, for perf.js
mark('start');
const house = buildTown(builder); mark('house');
installHouseLight(house.boxes, FL, CEIL);                                      // indoor light, patched into the shaders before anything compiles (lighting.js)
const { surfaces, rooms, lamps, spawn } = house;
const vis = makeVisibility({ rooms, portals: house.portals ?? [], footprints: house.footprints, quality: QUALITY });
builder.zone = null; builder.zoner = vis.zoner;          // furniture and garden go to the zone they stand in
for (const l of lamps) l.kind = l.fire ? 'fire' : (l.kind ?? 'fill');
const items = furnish(builder, house); mark('furnish');
lamps.push(...items.lamps); items.lamps = lamps;
const garden = Q.get('street') === '0' ? null : layStreet(builder, items, house); mark('garden');
const materials = makeMaterials(renderer, QUALITY);
const zoned = builder.finalize(scene, materials); mark('finalize');
// Everything outdoors hangs from one group, hidden whenever no window or outside door is in view.
const outdoors = new THREE.Group(); outdoors.name = 'outdoors'; scene.add(outdoors);

if (Q.get('trees') !== '0') makeTrees(outdoors, materials, builder.colliders, TREES);
mark('trees');

// The ground: a floating island. Lawn on top, a soft shoulder of rough grass rolling over a ragged lip of sod,
// and a rocky underside hanging in the clouds (island.js). Nothing lies beyond it but sky.
function outlineAt(a) {                                 // smooth radius from ISLAND.outline at angle a
  const o = ISLAND.outline, n = o.length, t = ((a / (Math.PI * 2)) % 1 + 1) % 1 * n, i = Math.floor(t), f = t - i;
  const p0 = o[(i - 1 + n) % n], p1 = o[i % n], p2 = o[(i + 1) % n], p3 = o[(i + 2) % n];
  return 0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);
}
// The island need not be round: ISLAND.outline (street.js) gives radii in feet at equal angles round the
// centre, smoothly joined. It is built exactly as the island of Anna's House is (island.js, copied from there:
// keep the two the same): mown grass to where the walker stops, a shoulder of rough grass rolling over a
// ragged lip of sod, earth and strata, and rock tapering down into the clouds.
buildIsland({ ISLAND, outlineAt, materials, outdoors });

mark('island');
const life = bringToLife({ scene, outdoors, vis, quality: QUALITY, renderer, camera, items, garden, materials, doors: house.doors, colliders: builder.colliders, onChange: () => { sun.shadow.needsUpdate = true; } });

// Hooks for the parts of the house that move and answer back. The garden may
// return setup(ctx); the staff (robots, cats) live in staff.js if it exists.
const ctx = { THREE, scene, camera, renderer, materials, house, items, flash: t => flash(t), zoom: on => { camera.fov = on ? 13 : WALK_FOV; camera.updateProjectionMatrix(); walker.lookScale = on ? 0.22 : 1; ctx.zoomed = !!on; }, garden, colliders: builder.colliders, interact: life.interact, animated: life.animated, loadModel: life.loadModel, track: life.track, zoneAt: life.zoneAt, sound, day, get walker() { return walker; }, get mode() { return mode; }, get aimed() { return aimed; }, get flashlight() { return torch.intensity > 0; } };
mark('life');
garden?.setup?.(Object.create(ctx, { scene: { value: outdoors } }));      // the street's own things go in the outdoors group
mark('gardenSetup');
import('./story.js').then(m => m.setupStory(ctx, { setHour: h => setHour(h), getHour: () => hour, dusk: sky.dusk, night: sky.hourAt(-0.17), flash: t => flash(t) })).catch(e => console.warn('story', e));
for (const f of items.later ?? []) { try { f(ctx); } catch (e) { console.warn('shop', e); } }      // what the shops set going once the scene exists
sound.places.music = (l => (l ? { x: l.world(l.W / 2, l.D / 2)[0], z: l.world(l.W / 2, l.D / 2)[1], lot: 'records' } : null))(house.lots.records);
import('./hold.js').then(m => m.setupHold(ctx)).catch(e => console.warn('hold', e));      // eating and drinking: what is in your hand (hold.js)
if (Q.get('clerks') !== '0') import('./clerks.js').then(m => m.hireClerks?.(ctx)).catch(e => console.warn('clerks', e));      // the robots who keep the shops
import('./reticle.js').then(m => m.setupReticle(ctx)).catch(e => console.warn('reticle', e));      // the mark in the middle, and the ring on what it has hold of
import('./welcome.js').then(m => m.setupWelcome(ctx)).catch(e => console.warn('welcome', e));      // the fade into the hall, the card on the hall table

// ---- Lamps ---------------------------------------------------------------------------
// Only four lights are ever lit (three on the low tier), shared out among the lamps nearest
// you, the room you are in first; each fades out before it is moved, so nothing pops. By day
// soft fills stand in for daylight bouncing round the rooms; from dusk the lamps, candles and
// fire take over. Glows, indoor light and the window light are in lighting.js.
const lampPool = makeLampPool({ scene, lamps, vis, size: QUALITY.lamps, day, camera });
const winGlow = makeWindowGlow({ scene: outdoors, materials, windows: house.windows ?? [], rooms });
const vignette = makeVignette();
const halos = makeHalos({ scene, lamps, day });
const shade = Q.get('shade') === '0' ? null : makeShade({ scene, rooms, colliders: builder.colliders, lampPool, camera });      // soft shade on the floor under the furniture (shade.js)
const exposure = makeExposure(Q);
const warmer = makeWarmer({ renderer, scene, camera, range: 60 });      // textures and shaders made ready a little ahead of the visitor (warm.js)

// ---- Two ways of looking: circling outside, and walking -----------------------------
const WALK_FOV = Number(Q.get('fov') ?? 56);
// Circling outside, nothing is nearer than the trees: a near plane of 2 ft rather than 0.25 gives the
// depth buffer eight times the precision at a distance, where the garden's layers lie close together.
const ORBIT_NEAR = 2; camera.near = ORBIT_NEAR; camera.updateProjectionMatrix();
const walker = new Walker(camera, renderer.domElement, { colliders: builder.colliders, surfaces });
walker.rim = { x: ISLAND.x, z: ISLAND.z, r: ISLAND.r * 0.965, at: ISLAND.outline ? a => outlineAt(a) * 0.965 : null };
for (const s of garden?.surfaces ?? []) surfaces.push(s);

// A lantern to carry in the dark (F): a warm glow all round, with the lantern itself
// held low at the edge of view. Its light is one of the lamp pool's four while it is lit.
scene.add(camera);
const torch = { get intensity() { return lampPool.lanternOn ? 1 : 0; } };
const lanternMesh = new THREE.Group();
{
  const brass = new THREE.MeshStandardMaterial({ color: 0x6b5330, roughness: 0.5, metalness: 0.8 }), glow = new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false });
  const cage = (y, h, r) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), brass); m.position.y = y; lanternMesh.add(m); };
  cage(0.19, 0.03, 0.1); cage(-0.19, 0.04, 0.1); cage(0.26, 0.08, 0.04);
  for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.36, 0.012), brass); p.position.set(Math.cos(i * Math.PI / 2 + 0.78) * 0.095, 0, Math.sin(i * Math.PI / 2 + 0.78) * 0.095); lanternMesh.add(p); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.008, 6, 16), brass); ring.position.y = 0.36; lanternMesh.add(ring);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), glow); flame.scale.set(0.8, 1.5, 0.8); lanternMesh.add(flame);
  lanternMesh.position.set(0.62, -0.62, -1.25); lanternMesh.visible = false;
}
camera.add(lanternMesh);
if (Q.has('lantern')) { lampPool.setLantern(true, { at: [0.62, -0.42, -1.25] }); lanternMesh.visible = true; }      // ?lantern: lit from the start (test shots)
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(0, 12, -70); orbit.enableDamping = true; orbit.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches; orbit.autoRotateSpeed = 0.35;
orbit.maxPolarAngle = Math.PI / 2 + 0.2; orbit.minDistance = 60; orbit.maxDistance = 1100;
const ABOVE = [-250, 165, 150];
camera.position.set(...ABOVE);

if (Q.has('cam')) { camera.position.set(...Q.get('cam').split(',').map(Number)); orbit.autoRotate = false; }      // a fixed outside viewpoint, for test shots
let mode = 'orbit';
function walk(place = true) {
  mode = 'walk'; orbit.enabled = false; walker.enabled = true; camera.fov = WALK_FOV; camera.near = 0.25; camera.updateProjectionMatrix();
  const sp = Q.get('from') === 'house' && garden?.arrive ? garden.arrive : spawn;      // off the airship from Anna's House: set down at the stop
  if (place) walker.place(sp.x, sp.y ?? 0, sp.z, sp.yaw);
  document.body.classList.add('walking');
}
function overview() {
  mode = 'orbit'; walker.enabled = false; walker.seated = null; orbit.enabled = true; camera.fov = 42; camera.near = ORBIT_NEAR; camera.updateProjectionMatrix();
  camera.position.set(...ABOVE); document.exitPointerLock?.(); document.body.classList.remove('walking');
}

const flash = text => { window.houseUI ? window.houseUI.toast(text) : ($('clock').textContent = text); };      // ui.js hook: passing notes go to the toast
sound.onNote = flash;

const ray = new THREE.Raycaster(), mid = new THREE.Vector2(0, 0);
let atBoard = false;
const chalking = () => {};

// Sources and citations (I), also reachable from labels in the house
const about = makeAbout();

// Things in the rooms that do something when used (rooms list them as kit.spots)
const platters = [];
for (const sp of items.spots ?? []) {
  if (sp.action === 'record') {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.02, 40), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.35 }));
    const lbl = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.022, 24), new THREE.MeshStandardMaterial({ color: 0xb8452e, roughness: 0.7 }));
    disc.add(lbl); disc.position.set(sp.x, sp.y, sp.z); scene.add(disc); platters.push(disc); disc.userData.cat = 'record'; life.track(disc, life.zoneAt(sp.x, sp.y, sp.z, 0.5));
    life.interact.push({ x: sp.x, y: sp.y, z: sp.z, reach: 6, label: () => `put on another record${sound.nowPlaying() ? ' (now: ' + sound.nowPlaying() + ')' : ''}`, act: () => { sound.start().then(() => flash('now playing: ' + sound.next())); } });
  }
}

let aimed = null;
function use() {
  if (mode !== 'walk') return;
  if (ctx.capture?.()) return;                                   // a game in progress takes the click (toys.js)
  // Sat down, you can still use what is in front of you (talk to whoever is behind the counter, take the bowl they
  // set down) and eat or drink what you are holding; with neither, E stands you up, as any step does.
  if (walker.seated) { if (aimed) aimed.act(); else if (ctx.holding?.()) ctx.sip?.(); else walker.seated = null; return; }
  if (!aimed) { ctx.sip?.(); return; }                           // nothing in front of you: take a sip of what you are holding (staff.js)
  if (aimed.seat) walker.sit(aimed.seat); else aimed.act();
}
const touch = 'ontouchstart' in window;
$('enter').addEventListener('click', () => { walk(); sound.start(); if (!touch) renderer.domElement.requestPointerLock?.(); });
renderer.domElement.addEventListener('click', () => {
  if (mode !== 'walk') return;
  if (!touch && document.pointerLockElement !== renderer.domElement) { renderer.domElement.requestPointerLock?.(); return; }
  use();
});
addEventListener('keydown', e => {
  if (e.code === 'KeyO') mode === 'walk' ? overview() : walk();
  if (e.code === 'KeyI') about.toggle();
  if (e.code === 'Escape' && about.open) about.hide();
  if (about.open) return;
  if (e.code === 'KeyE') use();
  if (e.code === 'KeyF') { lampPool.setLantern(!lampPool.lanternOn, { at: [0.62, -0.42, -1.25] }); lanternMesh.visible = lampPool.lanternOn; flash(lampPool.lanternOn ? 'lantern lit' : 'lantern out'); }
  if (e.code === 'KeyM') flash(sound.toggleMute() ? 'sound off' : 'sound on');
  if (e.code === 'BracketRight') { setHour(hour + 0.5); ctx.hourMoved = true; }
  if (e.code === 'BracketLeft') { setHour(hour - 0.5); ctx.hourMoved = true; }
  if (e.code === 'Minus' || e.code === 'Equal') { const v = setEyeHeight(eyeHeight() + (e.code === 'Equal' ? 0.1 : -0.1)); flash(`eye height ${Math.floor(v)}'-${Math.round((v % 1) * 12)}"`); }      // ui.js hook: was a direct write to #clock
});

// ?view=x,feetY,z,yaw,pitch drops you somewhere directly (used for test shots); ?at=name uses a named one (perf.js)
function setView(v) {
  if (v.walk) { walk(false); walker.place(...v.walk); }
  else { overview(); orbit.autoRotate = false; camera.position.set(...v.orbit.slice(0, 3)); orbit.target.set(...v.orbit.slice(3)); orbit.update(); }
}
if (Q.has('at') && namedView(Q.get('at'))) { setView(namedView(Q.get('at'))); if (Q.has('view') === false) Q.set('view', '1'); }
else if (Q.has('view')) {
  const [x, y, z, yaw = 0, pitch = 0] = Q.get('view').split(',').map(Number);
  walk(false); walker.place(x, y, z, yaw, pitch);
}
if (!Q.has('view') && !Q.has('at') && Q.get('from') === 'house') walk(false);      // off the airship from Anna's House: no welcome card; the ride in sets you down at the Landing
if (Q.has('view') && Q.has('open')) for (const d of house.doors) if (!d.fixed) { d.isOpen = true; d.stop.off = true; }

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---- What to draw this frame (visibility.js) -------------------------------------------
const SMALL_NEAR = 34 * QUALITY.reach;                                 // clutter further off than this is not drawn
for (const m of zoned) { m.geometry.computeBoundingBox(); m.userData.box = m.geometry.boundingBox; m.userData.small = vis.isSmall(m.userData.zone); }
const cullOff = Q.get('cull') === '0';
function cullScene(all = cullOff) {
  vis.update(camera);
  const eye = camera.position;
  for (const m of zoned) { const z = m.userData.zone, b = m.userData.box; m.visible = all || (vis.shows(z) && (!m.userData.small || b.distanceToPoint(eye) < SMALL_NEAR) && vis.inView(z, b)); }
  outdoors.visible = all || vis.state.out;
  sky.setOutdoors?.(all || vis.state.out);
  life.cull(all);
  // The household staff (staff.js) move about: each one is drawn only where its room can be seen
  staffGroup ??= scene.children.find(o => o.name === 'clerks') ?? null;
  if (staffGroup) for (const o of staffGroup.children) { const p = o.position; o.visible = all || vis.shows(life.zoneAt(p.x, p.y + 1.5, p.z, 0.4)); }
}
// When the sun's shadows are redrawn, rooms and garden out of sight must still cast theirs. The
// renderer makes its list of what to draw before it draws the shadow map, and reads `visible`
// again for the shadow map: so everything is shown at that moment, which puts it all in the
// shadows without drawing it all in the picture (drawing it all, as this used to, sent every
// texture in the house to the graphics card in one frame: a stall of up to a second). The next
// frame's cullScene puts things back. (This leans on the order of work in three r170's
// WebGLRenderer.render: projectObject, then shadowMap.render. If that changes, shadows of
// things out of view go missing; nothing worse.)
{
  const update = sun.shadow.updateMatrices.bind(sun.shadow);
  sun.shadow.updateMatrices = (light, vp) => {
    for (const m of zoned) m.visible = true;
    outdoors.visible = true; life.cull(true);
    if (staffGroup) for (const o of staffGroup.children) o.visible = true;
    update(light, vp);
  };
}
let staffGroup;

// ---- Loop -----------------------------------------------------------------------------
const clock = new THREE.Clock();
let caption = '', frames = 0, since = 0, settled = 0, shown = '', fast = 0, slow = 0;
let nextRatio = null, slowFrames = 0, slowSecs = 0, raisedAt = -1e9, ceiling = MAX_RATIO, holdUntil = 0, hold = 30;      // the drawing resolution's own bookkeeping
const fpsBox = Q.has('fps') ? $('room') : null;
setHour(hour);

renderer.setAnimationLoop(() => {
  const raw = clock.getDelta(), dt = Math.min(raw, 0.05), t = clock.elapsedTime;
  // A change of drawing resolution is made here, before the frame is drawn. (Made after drawing, it
  // emptied the canvas, and the page's dark background showed for a frame: a full-screen blink.)
  if (nextRatio !== null) { ratio = nextRatio; nextRatio = null; renderer.setPixelRatio(ratio); }
  let where = 'out';
  if (mode === 'walk') {
    walker.update(dt);
    const p = walker.pos;
    const r = rooms.find(r => p.x >= r.x0 && p.x <= r.x1 && p.z >= r.z0 && p.z <= r.z1 && p.y >= r.y0 && p.y <= r.y1);
    const name = r ? r.name : placeName(p.x, p.z);
    if (name !== caption && !fpsBox) { caption = name; $('room').textContent = name; }
    where = r ? 'in' : 'out';
    ctx.room = r ?? null;
    aimed = life.target(camera); if (walker.seated && aimed?.seat) aimed = null;      // (no hopping from seat to seat)
    chalking();
    const toyHint = ctx.hint?.();
    const having = walker.seated && !aimed ? ctx.holding?.() : null;
    const text = toyHint ? toyHint : aimed ? aimed.label() : having ? `have some of the ${having.name ?? 'food'} · any step stands you up` : walker.seated ? 'stand up' : '';
    if (text !== shown) { shown = text; $('prompt').innerHTML = text ? (toyHint ? text : `<b>E</b>${text}`) : ''; $('prompt').classList.toggle('on', !!text); }
  } else orbit.update();
  // Eyes adjust: rooms are far dimmer than the garden, and night dimmer still (lighting.js).
  exposure.update(renderer, where, day, dt, Q.has('view'));
  lampPool.update(camera.position, Q.has('view') ? 1 : dt, t);
  winGlow.update(day.night, where === 'out', 1 - THREE.MathUtils.smoothstep(day.light, 0.42, 0.97));      // third: how far the lamps are on (as lighting.js lampOn)
  vignette.set(day.night);
  halos.update(t);
  shade?.update(1 - THREE.MathUtils.smoothstep(day.light, 0.42, 0.97), dt);      // as lighting.js lampOn
  life.update(t, dt);
  if (sound.nowPlaying()) for (const d of platters) d.rotation.y -= dt * 3.49;      // 33 1/3 rpm
  sound.update(dt, { where, light: day.light, room: ctx.room, pos: camera.position });
  sky.update(dt, t, camera);
  // The first frame: every shader the house needs is compiled now, behind the welcome, rather than
  // one by one as rooms are first seen
  if (!perf.frames && !cullOff) { cullScene(true); renderer.compile(scene, camera); warmer.settle(); }
  cullScene();
  renderer.render(scene, camera);
  warmer.update(dt);
  perf.frames++; perf.lastCalls = renderer.info.render.calls; perf.lastTris = renderer.info.render.triangles;
  if (perf.firstFrameMs === undefined) perf.firstFrameMs = Math.round(performance.now());
  if (Q.has('stages') && perf.frames === 3) console.log('STAGES', JSON.stringify(STAGE), 'first frame', perf.firstFrameMs, 'calls', renderer.info.render.calls, 'tris', renderer.info.render.triangles, 'tex', renderer.info.memory.textures, 'geo', renderer.info.memory.geometries, 'programs', renderer.info.programs.length);

  // Keep it quick: if most frames run slow for two seconds together, draw at a lower resolution.
  // (One slow second is not enough: a single hitch, as when a room's pictures first load, used
  // to drop the resolution, which then crept back up in steps, each one a visible change.)
  frames++; since += raw; if (raw > 1 / 46) slowFrames++;
  if (since >= 1) {
    const fps = frames / since, mostlySlow = slowFrames > frames * 0.6; frames = 0; since = 0; slowFrames = 0; settled++;
    if (fpsBox) fpsBox.textContent = `${fps.toFixed(0)} fps · ×${ratio.toFixed(2)} · ${QUALITY.name} · ${renderer.info.render.calls} calls · ${(renderer.info.render.triangles / 1000).toFixed(0)}k tris · ${(renderer.info.memory.textures)} tex`;
    slowSecs = settled > 3 && mostlySlow && !life.pending() ? slowSecs + 1 : 0;      // not while the furniture is still arriving: that is the processor, not the picture
    if (slowSecs >= 2 && ratio > 0.7 && !Q.has('ratio')) {
      nextRatio = Math.max(0.7, ratio - 0.2); fast = 0; slowSecs = 0;
      // If this undoes a recent sharpening, that level is too much for this machine here: hold
      // below it for a while (longer each time), so the resolution does not pump up and down.
      if (t - raisedAt < 20) { ceiling = nextRatio; holdUntil = t + hold; hold = Math.min(hold * 2, 600); }
    }
    // ...and sharpens again, slowly, when there is time to spare
    fast = fps > 58 ? fast + 1 : 0;
    const top = t < holdUntil ? Math.min(MAX_RATIO, ceiling) : MAX_RATIO;
    if (fast >= 4 && ratio < top - 0.001 && nextRatio === null && !Q.has('ratio')) { nextRatio = Math.min(top, ratio + 0.1); fast = 0; raisedAt = t; }
    // Still slow at the lowest resolution: the next visit starts at a lower quality tier
    slow = ratio <= 0.7 && fps < 30 ? slow + 1 : 0;
    if (slow === 8 && !QUALITY.forced) rememberSlow(QUALITY.name);
  }
});

// ---- Measuring (perf.js): ?statsdump visits the test viewpoints and writes the numbers into the page
let loading = 0;
THREE.DefaultLoadingManager.onStart = () => { loading++; };
THREE.DefaultLoadingManager.onProgress = (url, done, total) => { loading = total - done; };
const perf = { quality: QUALITY.name, gpu: QUALITY.gpu, stages: STAGE, visTime: () => vis.visMs(), resetVisTime: () => vis.resetMs(), vis, frames: 0, items, renderer, scene, camera, setView, setHour: h => setHour(h), pending: () => loading + life.pending() };
window.__house = perf; perf.light = { HL, lampPool, sun, exposure };      // for looking at one light at a time (tools/evaljs.sh)
// Which lamps the pool would light at each test viewpoint, for checking its choices (?statsdump's eval=)
perf.lampChoice = (names = Object.keys(VIEWS), h) => { if (h !== undefined) setHour(h); const out = {}; for (const n of names) { setView(VIEWS[n]); camera.updateMatrixWorld(); vis.update(camera); out[n] = (vis.state.here.join('+') || 'out').replace(/r:/g, '') + ' -> ' + lampPool.choose(camera.position, QUALITY.lamps).map(lampPool.describe).join(', '); } return out; };
if (Q.has('statsdump')) statsDump(perf, Q.get('statsdump') || null, (Q.get('hours') ?? '13,22').split(',').map(Number));

let sharpened = false;
THREE.DefaultLoadingManager.onLoad = () => { sun.shadow.needsUpdate = true; document.body.classList.add('ready'); window.__ready = true; if (!sharpened) { sharpened = true; setTimeout(() => sharpenTextures(), 2500); } };      // (the photos came at half size; now the full ones, one at a time)
if (Q.has('view') || Q.has('shot')) { renderer.domElement.style.transition = 'none'; document.body.classList.add('ready'); }
window.house = { ctx, setHour: h => { setHour(h); ctx.hourMoved = true; }, get hour() { return hour; } };
ctx.hourMoved = Q.has('time'); ctx.hourNow = () => hour;      // carried on the airship, so the sky is the same at both ends
// ?keys=KeyE:2000,Digit1:4500 presses keys at those milliseconds after start-up (test shots of things that need a key)
// (Run20:5000 runs the street's life on by 20 seconds at once: the headless renderer draws only a few frames)
let testT = 1000;
if (Q.has('keys')) for (const k of Q.get('keys').split(',')) { const [code, ms] = k.split(':'); setTimeout(() => /^Run/.test(code) ? (() => { for (let i = 0; i < Number(code.slice(3)) * 20; i++) { testT += 0.05; life.update(testT, 0.05); } renderer.render(scene, camera); })() : dispatchEvent(new KeyboardEvent('keydown', { code, key: code.replace(/^(Key|Digit)/, '').toLowerCase(), bubbles: true })), Number(ms)); setTimeout(() => console.log('KEY', code, 'frames', perf.frames, 'mode', mode, 'aimed', aimed?.label?.(), 'clerk', JSON.stringify(Object.values(ctx.clerks ?? {}).slice(0, 1).map(c => [c.name, c.state, c.queue.length, c.making, c.drink ? c.drink.g.position.toArray().map(v => +v.toFixed(1)) : null, c.spec.serve]))), Number(ms) + 300); }      // ui.js hook: what the settings card needs
// The quality choice for the settings card (quality.js); changing it reloads the page
window.house.quality = { options: QUALITY_OPTIONS, get: () => storedChoice() ?? 'auto', set: v => { chooseTier(v); location.reload(); }, get current() { return QUALITY.name; } };

await import('./ui.js');      // the interface reads window.house, so it comes after it
