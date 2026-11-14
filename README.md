# Vesper Street

A little main street you can walk down, in the browser: an island in the sky with the sun going down
at the end of the street. It keeps the visitor's clock. Eleven shops are open (coffee, records, yoga, a
small museum of real things, books, bread, a grocer of tinned fish and good oil, plants, candles, a
noodle bar, bicycles), there is a chapel at the far end, a bar on the plant shop's roof, a dumpling cart in the
Yard, and a picture house whose screen is round the back. Robots keep the shops and like to be talked to;
what they make you can eat and drink. Live at https://town.brezgis.com/.

It is built on the engine of Anna's House (https://house.brezgis.com/): three.js, plain ES modules,
no build step.

## Visiting

    python3 -m http.server 5188 --directory site

then open http://localhost:5188/. W A S D to walk, the mouse to look, E to use things, H for the
keys. `[` and `]` move the hour, though the street prefers dusk.

## Where things are

- `site/src/town.js`: the ten lots and their buildings (shopfronts, upstairs flats), and each
  lot's own coordinates for the shop files.
- `site/src/shops/`: one file per open shop (see the README there); `shopkit.js` and `draw.js`
  hold the shared fittings, small goods and sign-painting tools; `kit/` is the furniture kit.
  `shops/arch.js` is the shared joinery of an old shop room (dado, picture rail, partitions for the back rooms).
- `site/src/street.js`: the island, road, pavements, trees, lamps, string lights, benches.
  `fronts.js`: names over the doors, awnings, hanging signs, ghost signs, the flats' windows.
  `places.js`: the Landing, Pickle Alley and the picture garden, the Yard, the Overlook.
  `displays.js`: the picture house's front. `backs.js`: the backs of the buildings and their yards.
  `grounds.js`: the walks that join the lanes up, and the planting on the lawns.
  `flats.js`: the flats' windows upstairs. `chapel.js`, `chapel/`: the chapel. `creatures.js`,
  `creatures/`: the animals. `eggs.js`: what is hidden in the grass.
- `site/src/clerks.js`: the robots (who looks like what, roaming, conversation, making things to order).
  `hold.js`: eating and drinking.
  `story.js`: the stamps, and what happens when you have all six.
- `site/src/main.js`, `lighting.js`, `sky.js`, `visibility.js`, `life.js`, `walk.js`, `sound.js`,
  `ui.js`: the engine, lightly adapted from the house.
- `tools/shot.sh` (and `tryshot.sh`, which retries) take a screenshot with headless Chrome;
  `tools/drive.py` opens the street in real time, presses keys and measures; `tools/check.sh`
  syntax-checks the modules; `tools/zfight.py` looks for faces that share a plane (flicker). `archive/marigold-v1/` is the first version of this town (vite), kept for reference.

Credits are in `site/assets/CREDITS.md`. Built by Anna with Claude.
