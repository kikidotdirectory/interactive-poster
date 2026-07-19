# dependencies

- p5 types — installed via npm (`p5` in `deno.json` imports)
- p5.js — loaded at runtime from a CDN, hardcoded in `dist/index.html`
- [jsr:@kastrophony/live-server](https://jsr.io/@kastrophony/live-server) — dev server, run via `deno task serve`

# how the sketch works

`src/sketch.ts` is a single p5.js sketch (instance mode) that mimics [this poster by Erik Nitsche](https://www.moma.org/media/W1siZiIsIjIxMDczMyJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=f86609d331345a4c). it functions by continuously spawns colored quads which travel up the canvas along straight lanes converging on a single point (the "apex"), shrinking to a triangle as they arrive.

p5.js requires two functions: `setup()`, which is run once when the sketch is initiated and `draw()`, which handles the drawing of the canvas for every frame thereon out. `sketch.ts` additionally defines `onWindowResized()` to improve responsiveness of the poster and `preload()` to use its assets.

## initiation

`p.setup()` requires that the document it is being attached to has an element with the id `sketch-container`. it then constructs a `FalloutPoster` and calls its `init()` method, which initializes the canvas stores its dimensions for later calculations, and draws the first frame.

## drawing frames

as this sketch does not call `frameRate()`, it is drawn at the default frequency of 60fps.

every frame it:

1. redraws the background.
2. redraws the title.
3. checks if it needs to create a new shape, pushing a new `Shape` to `shapes` if it does.
4. calls the `render()` method of all the `Shape`s in `shapes`.
   - `Shape.render()` handles the drawing, position updating, and flagging shapes that need to be removed with `Shape.isDead`
5. remove all the `isDead` shapes from `shapes`.

## state ownership

`sketch.ts` splits its state across a few objects/classes. What each one should own:

### static configuration

- `COLORS`: the defined color palettes as hardcoded rgba() values. this absolutely needs to be replaced.
- `POSTER_CONFIG`: static tuning constants that define the appearance & behavior of `FalloutPoster`. `CONFIG` is read once when `FalloutPoster` is constructed; if any value is updated, the sketch needs to be re-initialized for them to apply (not relevant for development as the live-server reloads the entire page anyways)

