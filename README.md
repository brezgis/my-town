# Vesper Street

A little main street you can walk down, in the browser: an island in the sky where it is always
nearly evening. Six shops are open (coffee, records, a grocer of tinned fish and good oil, books,
plants, candles), four are shut with their windows lit, there is a dumpling cart in the Yard and a
picture house whose screen is round the back. Robots keep the shops and like to be talked to.

It is built on the engine of Anna's House (`~/projects/my_house`): three.js, plain ES modules,
no build step, everything batched into a few dozen draw calls.

## Visiting

    python3 -m http.server 5188 --directory site

then open http://localhost:5188/. W A S D to walk, the mouse to look, E to use things, H for the
keys. `[` and `]` move the hour, though the street prefers dusk.

## Where things are

- `site/src/town.js`: the ten lots and their buildings (shopfronts, upstairs flats), and each
  lot's own coordinates for the shop files.
- `site/src/shops/`: one file per open shop (see the README there); `shopkit.js` and `draw.js`
  hold the shared fittings, small goods and sign-painting tools; `kit/` is the furniture kit.
- `site/src/street.js`: the island, road, pavements, trees, lamps, string lights, benches.
  `fronts.js`: names over the doors, awnings, hanging signs, ghost signs, the flats' windows.
  `places.js`: the Landing, Pickle Alley and the picture garden, the Yard, the Overlook.
  `displays.js`: the four shut shops' windows.
- `site/src/clerks.js`: the robots (bodies, wandering, conversation, coffee).
  `story.js`: the stamps, and what happens when you have all six.
- `site/src/main.js`, `lighting.js`, `sky.js`, `visibility.js`, `life.js`, `walk.js`, `sound.js`,
  `ui.js`: the engine, lightly adapted from the house.
- `tools/shot.sh` takes a screenshot with headless Chrome; `tools/check.sh` syntax-checks the
  modules. `archive/marigold-v1/` is the first version of this town (vite), kept for reference.

Credits are in `site/assets/CREDITS.md`. Built by Anna with Claude.
