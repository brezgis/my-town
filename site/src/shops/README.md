# Fitting out a shop

Each shop is one file here: `export default function (kit, lot) { ... }`, called once at start-up.
It adds geometry through the furnishing kit; nothing in a shop file runs per frame unless you ask
for it with `kit.later.push(ctx => { ... })`. `coffee.js` is the worked example: read it first.

Units are feet. The town is Vesper Street: a main street on an island in the sky where it is
always nearly evening (golden, low sun; lamps and string lights on). The feel: a fancy little
neighbourhood strip with soul. Curated, warm, a bit funny, hand-lettered. Robots keep the shops.

## Your shop's coordinates

    a   along the frontage, 0 at the left wall as you face the shop from the street, up to lot.W
    d   depth, 0 at the inside of the front wall (the shop window), up to lot.D at the back wall
    h   height above the shop floor; the ceiling is at 12 (beams hang down to 11.3)

`lot.fr(kit, a, d, h, face)` makes a kit frame at that point. `face` is the way the piece faces:

    face       stands against        frame +y points       frame +x points
    'back'     the front wall        into the shop (+d)    toward larger a
    'street'   the back wall         toward the street     toward smaller a
    'right'    the left wall         toward larger a       toward the street (smaller d)
    'left'     the right wall        toward smaller a      toward the back (larger d)

So `lot.fr(kit, 0, 0, 0, 'back')` is "room coordinates": x = a, y = d, z = h, handy for anything
freestanding. For things on a wall, put the frame ON the wall with the right face: then y = 0 is
the wall and +y comes out into the room. Rule of thumb: frame +x is to the LEFT of someone
looking at the front of the piece. `f.sub(x, y, z, dq)` makes a child frame (dq quarter turns).

`lot.frOut(kit, a, out, h, face)` is the same on the pavement in front (out = feet out from the
shopfront, h above the pavement; the pavement is 13 ft deep, the kerb trees and lamps are at about
out = 9 to 11, and the shop's awning, if any, covers out = 0 to 4.4 above h = 8). Keep the doorway
clear: `lot.doorA` is the door's centre (it is 3.7 wide), leave 4 ft clear each side of the
threshold inside and out. `lot.world(a, d)` gives world [x, z] (for clerks and lights);
`lot.XY(a, d)` plan [X, Y]. The shop window is the whole front wall from h = 1.9 to 10.7: what
stands within about 6 ft of it is your window display and is seen from the street. Make it good.

## What you build with

- Frames: `f.box(mat, x0,x1, y0,y1, z0,z1, opts)`, `f.soft(...)` rounded, `f.cyl(mat, x, y, z0, z1, rBottom, rTop, seg)`
  upright, `f.block(x0,x1,y0,y1,z0,z1)` invisible obstacle, `f.sub(...)`, `f.bev`, `f.lathe`.
- `../shopkit.js`: `const K = tools(kit, seed), X = fixtures(kit, K)`. Wrap frames with `K.wrap(frame)`
  so plain colours snap to the shared palette. `K`: `ves` (turned shape from a profile), `hcyl`, `ball`,
  `tube`, `fruit`, `grapes`, `leaves`, `potted`, `jar`, `bottle`, `tin`, `plate`, `bowl`, `glass`,
  `cupSaucer`, `towel`, `run` (kitchen-style base cabinets), `rnd`, `pick`.
  `X`: `shelving(f, x0, x1, zs, o)`, `plinth` (display table), `counter`, `glassCase`, `pendant`
  (a hanging lamp that really lights), `stool` (sittable), `crate`, `slateBoard` (chalked menu on a
  wall), `aBoard` (pavement sign), `card` (a small standing ticket). Read their headers in shopkit.js.
- The furnishing kit (`kit.*`): see `../kit/README.md` (written for the house this engine came from:
  ignore its coordinates section, everything else applies). Most useful here: `kit.sign(f, x, y, z,
  w, tall, draw, { cw, ch, flat, tilt, round, glow })` (anything drawn: labels, posters, covers; with
  `flat: true` it lies face up), `kit.pack(f, x, y, z, w, d, tall, colour, draw, o)` (a box with a
  drawn front), `kit.model(id, f, x, y, z, dq, { scale, turn, seat, collide, outdoor })`,
  `kit.bookcase`, `kit.bookRow`, `kit.bookStack` (real titled spines), `kit.sofa`, `kit.armchair`,
  `kit.table`, `kit.tableLamp`, `kit.floorLamp`, `kit.candle` / `kit.jarCandle` / `kit.pillarCandle`
  (visitors can light them), `kit.posy`, `kit.pottedPlant`, `kit.mug`, `kit.rug(X0, X1, Y0, Y1, h, style)`
  (plan coordinates: use lot.XY), `kit.seat(f, x, y, z, label)`, `kit.clothes`, `kit.toteBag`, `kit.steam.push({x,y,z})`.
- Materials by name: textured `floor`, `plaster`, `brick`, `tile`, `tile_hex`, `tile_subway`,
  `marble`, `pavers`, `oak_light`, `fir`, `painted_wood`, `linen`, `wool`, `velvet`, `leather`,
  `wicker`, `glass`; any of them tinted as `'painted_wood#2f4a40'`. Plain colours `'c#rrggbb/roughness/metalness'`
  (`'c#b08d4a/0.35/1'` is brass). `'e#rrggbb/2'` glows (use few distinct ones: each is a draw call;
  the lamp glows `e#ffe2b4/1.7`, `e#fff4e0/3`, `e#fbf3e4/1.4`, `e#ffd9a0/2.2`, `e#f6e3c4/1.3` already exist and dim by day).
- Drawing: `../draw.js` has `T` (text), `para`, `chalk`, `slate`, `paper`, `board`, `grain`, `disc`,
  `rect`, `rrect`, `line`, `poly`, `glow`, `ICON.*` and the typefaces `F.*` (playfair, abril, pacifico,
  bebas, caveat (handwriting/chalk), limelight, dm, fraunces, shrikhand, elite (typewriter),
  yellowtail, archivo, goudy). Hand-lettered labels, tickets, posters and packaging are where the
  soul is: write real words on them, make them worth walking up to and reading.
- Models: `../../assets/models/CATALOG.md` lists what exists; only the folders actually present in
  `site/assets/models/` can be used (copy more from `/home/anna/projects/my_house/site/assets/models/`
  if you need one, they are CC0). Prefer building small goods from K's primitives over many models.

## The clerk

Push one description onto `kit.clerks` (see the header of `../clerks.js` and Juniper in coffee.js):
look, home, posts they drift to in a straight line (keep that line clear of furniture), and lines.
Give them a voice of their own. They float: a clerk behind a counter wants `hover` about 4.7.

## Rules

- Brands, band names, book blurbs, product names: invent them. No real logos, album covers or trademarks.
- Keep clear paths at least 3.5 ft wide; nothing within 4 ft of the door inside. Every solid piece
  needs a `block` (the fixtures add their own). The walker steps over anything lower than 1.4.
- Nothing may share a plane with a wall, floor or another piece (it flickers): leave 0.02.
- Budget per shop: about 250k triangles, a dozen models, and no more than about 30 lightable candles.
  Many small `kit.sign`s are fine (they are packed into one sheet per shop), but keep each canvas
  small: a shelf ticket 128 px, a poster 400 px, a big menu 1300 px.
- Lighting: shops are lit by a warm ambient plus the four nearest lamps. Hang `X.pendant`s (four to
  seven a shop) where you want pools of light; table lamps and candles add glow.
- Only edit your own shop file. If a shared helper is missing, write it locally in your file.
- Test with `tools/shot.sh shots/<shop>_NN.png "view=x,feetY,z,yaw,pitch"` from the project root
  (world x, z = -Y; inside a shop feetY is 0.55; yaw 0 looks west along the street, -1.5708 looks
  north, +1.5708 south, 3.14159 east; pitch in radians). It prints console errors. `tools/check.sh`
  syntax-checks everything first. Then LOOK at the picture (Read the PNG) before trusting it. The
  renderer is shared with other people working on the street at the same time: take at most a dozen
  screenshots, and never restart the server.

## Since the street grew (second round)

- The street now keeps the visitor's clock, so it must look right at every hour: morning, noon, dusk
  and night. Test with `&time=dusk`, `&time=13` and `&time=23` on the view. Lamps and glows come on by
  themselves toward evening (the named lamp glows dim by day); do not rely on it being dusk.
- Use `tools/tryshot.sh` (same arguments as shot.sh): the GPU is shared and sometimes drops a picture;
  this retries. `&fps` on a view shows draw calls and triangles. It must stay lightning fast on a laptop:
  merge geometry, share materials, keep canvases small, prefer one instanced mesh to many meshes.
- "Real elements wherever we can": where something in the world has a real counterpart, use the real
  thing (real artworks in the public domain, real species, real poses, real recipes, real constellations,
  real quotations with their authors). Shops, brands and products on the street stay invented.
- `kit.later.push(ctx => { ... })` runs once the scene exists. `ctx` has THREE, scene, camera, renderer,
  materials, interact (push `{ x, y, z, reach, size, label: () => '...', act: () => {} }` for anything
  usable with E), animated (push `(t, dt) => {}`), walker (walker.seated is the seat sat in, or null;
  walker.pos, walker.yaw, walker.pitch), sound (sound.note(midi, when, len, vol), sound.chirp), day
  (day.light 1 by day to 0 at night, day.night, day.hour), flash(text) for a passing note, loadModel(id).
- `kit.town.surfaces` is the list the walker stands on (`{ x0, x1, z0, z1, h }` in world feet, or with
  `h2` and `ramp: true` for a slope along z: h at z1, h2 at z0); `kit.B.colliders` the obstacles.

## Eating and drinking (hold.js)

Anything edible should be takeable, as in Anna's House: it is held in the hand, Q (or E with nothing
in front of you) takes a sip or a bite, R sets it down. Two ways in:
- Help yourself: `kit.eats.push({ x, y, z, name, model: 'croissant' })` (world position of the thing on
  show: `kit.world(frame, x, y)` gives x and z; y = frame.h + local z). Instead of `model` give
  `build: THREE => Object3D` (feet; build small things from a few meshes), or `drink: { vessel, liquid }`
  for something poured (vessels in clerks/drinks.js: demitasse, latte, teacup, mug, tumbler, highball,
  wine, rocks). Options: `bites` (default 3), `note` (said when finished), `scale`, `reach`, `plural`.
- To order: a clerk with `serve: { machine, pickup, drinks: { name: { vessel, liquid, note } }, food:
  { name: { build, bites, note } } }` makes whatever a topic's `serve: 'name'` asks for and sets it on
  the counter to be taken.
