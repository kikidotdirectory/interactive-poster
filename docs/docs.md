# dependencies

- p5 types — installed via npm (`p5` in `deno.json` imports)
- p5.js — loaded at runtime from a CDN, hardcoded in `dist/index.html`
- [jsr:@kastrophony/live-server](https://jsr.io/@kastrophony/live-server) — dev server, run via `deno task serve`

# how the sketch works

`src/sketch.ts` is a single p5.js sketch (instance mode) that mimics [this poster by Erik Nitsche](https://www.moma.org/media/W1siZiIsIjIxMDczMyJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=f86609d331345a4c). it functions by continuously spawns colored quads which travel up the canvas along straight lanes converging on a single point (the "apex"), shrinking to a triangle as they arrive.

`sketch.ts` makes hard separations of roles with the goal of conveying the function of the sketch on a high level.

as a result, the p5-specific functions (`preload()`, `setup()`, `draw`) are kept intentionally lean. `setup()`, which is run once when the sketch is initiated and `draw()`, which handles the drawing of the canvas for every frame thereon out. `sketch.ts` additionally defines `preload()` to use its assets.

- `preload`: preloads the title images to make them available to p5
- `setup`: checks for `#sketch-container`, then creates the sketch and initializes a `FalloutPoster` which holds the configuration for this instance of the sketch.
- `draw`: every frame the sketch:
    1. redraws the background.
    2. redraws the title.
    3. checks if it needs to create a new shape, pushing a new `Shape` to `shapes` if it does.
    4. calls the `render()` method of all the `Shape`s in `shapes`.
       - `Shape.render()` handles the drawing, position updating, and flagging shapes that need to be removed with `Shape.isDead`
    5. remove all the `isDead` shapes from `shapes`.

note: as this sketch does not call `frameRate()`, it is drawn at the default frequency of 60fps.
