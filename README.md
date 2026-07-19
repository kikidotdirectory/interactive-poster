# Fallout: Atoms for War and Peace

a procedurally generated poster built with [p5.js](https://v1.p5js.org/) by [kiki.directory](https://kiki.directory). for how it works, see the [technical writeup in docs/](docs/docs.md).

## setup

requires [Deno](https://deno.com).

1. clone and cd into repository
2. run `deno install` to install [dependencies](docs/docs.md#dependencies)
3. start the dev server with `deno task dev`, which runs [`transpile`](deno.json) and [`serve`](deno.json) in parallel
4. for a production build, run `deno task build`, which bundles and minifies the output to `dist/sketch.js`

## colophon

- runs on Deno
- built with [p5.js](https://v1.p5js.org/) in [instance mode](https://github.com/processing/p5.js/wiki/Global-and-instance-mode)

## attribution

- the title & logomark are from the [Poster House](https://posterhouse.org)'s [Fallout: Atoms for War and Peace](https://posterhouse.org/exhibition/fallout-atoms-for-war-peace/), exhibition designed by [Kudos](https://www.kudos.nyc/project/fallout-atoms-for-war-and-peace-exhibition/).
- the design is derived from the exhibition designed by [Kudos](https://www.kudos.nyc/project/fallout-atoms-for-war-and-peace-exhibition/), which itself is derived from one of [Erik Nitsche](https://en.wikipedia.org/wiki/Erik_Nitsche)'s posters for General Dynamics. (specifically, [this one](https://www.moma.org/media/W1siZiIsIjIxMDczMyJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=f86609d331345a4c))
