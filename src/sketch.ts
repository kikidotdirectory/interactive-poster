import type P5 from "p5";

// p5.js is used in instance mode, the script sourced from p5.js's CDN
declare const p5: new(sketch: (p: P5) => void) => P5;

// Colors for each generated shape, light and dark corresponding to a side of the poster.
const COLORS = {
	red: {
		light: "rgba(255, 132, 94, 0.85)",
		normal: "rgba(255, 81, 56, 0.80)",
		dark: "rgba(222, 54, 44, 0.75)",
	},
	blue: {
		light: "rgba(235, 255, 254, 0.76)",
		normal: "rgba(156, 178, 217, 0.75)",
		dark: "rgba(77, 79, 102, 0.75)",
	},
	green: {
		light: "rgba(247, 255, 211, 0.75)",
		normal: "rgba(84, 150, 94, 0.75)",
		dark: "rgba(48, 97, 56, 0.75)",
	},
	yellow: {
		light: "rgba(255, 244, 107, 0.84)",
		normal: "rgba(229, 176, 53, 0.75)",
		dark: "rgba(168, 137, 40, 0.75)",
	},
	neutral: {
		light: "rgba(255, 249, 235, 0.70)",
		dark: "rgba(173, 167, 151, 0.40)",
	},
};

// General poster configuration
const POSTER_CONFIG = {
	apex: { x: 0, y: 0 },
	margin: 8,
	// How often shapes will generate (every X frames)
	spawnRate: 10,
	// The angles from the apex from which that compose the lanes that the shapes travel on.
	angles: [
		-25,
		-23,
		-20,
		-16,
		-13,
		-11,
		-6.5,
		0,
		5.25,
		10,
		13,
		18,
		22,
		24,
		25.5,
	],
};

const sketch = (p: P5) => {
	let titleImage: P5.Image;
	let subTitleImage: P5.Image;
	let canvas: FalloutPoster;

	class FalloutPoster {
		w: number;
		h: number;
		apex: {
			x: number;
			y: number;
		};
		shapes: Shape[];
		title: { image: P5.Image; x: number; y: number; w: number; h: number };
		subTitle: { image: P5.Image; x: number; y: number; w: number; h: number };
		margin: number

		constructor(container: Element, titleImage: P5.Image, subTitleImage: P5.Image) {
			// load attributes from POSTER_CONFIG
			this.margin = POSTER_CONFIG.margin;

			const c = container.getBoundingClientRect();
			this.w = c.width;
			this.h = this.w * 4 / 3;
			this.apex = {
				x: p.floor(this.w / 2),
				y: p.floor(this.h / 4),
			};
			this.shapes = [];

			const { title, subTitle } = this.placeTitle(titleImage, subTitleImage);
			this.title = title;
			this.subTitle = subTitle;
		}

		// this is a mess that needs to be cleaned up
		placeTitle(titleImage: P5.Image, subTitleImage: P5.Image) {
			const subTitleSegment = this.apex.x - this.margin;
			const subTitleAspectRatio = subTitleImage.height / subTitleImage.width;
			const subTitleWidth = (subTitleSegment * 5) / 3;
			const subTitleHeight = subTitleWidth * subTitleAspectRatio;
			// Position subtitle at 5/3 of title width to center within ampersand
			const subTitle = {
				image: subTitleImage,
				w: subTitleWidth,
				h: subTitleHeight,
				x: this.margin,
				y: this.apex.y - subTitleHeight * 0.75,
			};

			const titleAspectRatio = titleImage.height / titleImage.width;
			const leftMargin = this.margin + 2;
			const rightMargin = this.margin;
			const titleWidth = this.w - leftMargin - rightMargin;
			const titleHeight = titleWidth * titleAspectRatio;
			const title = {
				image: titleImage,
				w: titleWidth,
				h: titleHeight,
				x: leftMargin,
				y: this.margin,
			};

			return { title, subTitle };
		}

		renderTitle() {
			p.image(this.title.image, this.title.x, this.title.y, this.title.w, this.title.h);
			p.image(this.subTitle.image, this.subTitle.x, this.subTitle.y, this.subTitle.w, this.subTitle.h);
		}
	}

	class Shape {
		lanes: {
			inner: number;
			outer: number;
		};
		y: number;
		segmentHeight: number;
		topOffset: number;
		bottomOffsetDeviation: number;
		color: string;
		isDead: boolean;

		constructor() {
			// Pick one of the lanes as the center
			const shapeIndex = p.floor(p.random(0, POSTER_CONFIG.angles.length - 1));
			// Generate the base height of the shape.
			const shapeHeight = p.floor(p.random(p.height / 20, p.height / 8));
			const heightDeviation = shapeHeight / 10;

			const colorName = p.random(["neutral", "red", "blue", "green", "yellow"]);
			let shapeColor = undefined;
			if (colorName === "neutral") {
				// Left half: light, Right half: dark
				shapeColor = shapeIndex < 7 ? COLORS.neutral.dark : COLORS.neutral.light;
			} else {
				const shade = p.random(["light", "normal", "normal", "dark"]); // Hacky weighting system
				shapeColor = COLORS[colorName][shade];
			}

			this.lanes = Shape.getLanes(shapeIndex);
			this.y = Math.floor(p.height + 1);
			this.segmentHeight = shapeHeight;
			this.topOffset = p.random(p.height / 100, p.height / 33);
			this.bottomOffsetDeviation = p.random(-heightDeviation, heightDeviation);
			this.color = shapeColor;
			this.isDead = false;
		}

		static getLanes(shapeIndex) {
			const leftAngle = POSTER_CONFIG.angles[shapeIndex];
			const rightAngle = POSTER_CONFIG.angles[shapeIndex + 1];

			// Ensure that shapes will always be angled towards the center.
			const inner = p.abs(leftAngle) < p.abs(rightAngle) ? leftAngle : rightAngle;
			const outer = leftAngle === inner ? rightAngle : leftAngle;

			return { inner, outer };
		}

		render() {
			p.noStroke();
			p.fill(this.color);
			if (this.y === canvas.apex.y) {
				this.shrink();
			} else {
				this.rise();
			}
			if (this.segmentHeight === 1) {
				this.isDead = true;
			}
		}

		shrink() {
			// Drawing a triangle instead of a quad when @ APEX
			const x1 = canvas.apex.x;
			const y1 = canvas.apex.y;
			const y2 = y1 + this.segmentHeight + this.topOffset;
			const x2 = this.getX(y2, this.lanes.outer);
			const y3 = y1 + this.segmentHeight + this.bottomOffsetDeviation;
			const x3 = this.getX(y3, this.lanes.inner);
			p.triangle(x1, y1, x2, y2, x3, y3);
			this.segmentHeight -= 1;
		}

		rise() {
			const y1 = this.y;
			const x1 = this.getX(y1, this.lanes.inner);
			const y2 = y1 + this.topOffset;
			const x2 = this.getX(y2, this.lanes.outer);
			const y3 = y2 + this.segmentHeight;
			const x3 = this.getX(y3, this.lanes.outer);
			const y4 = y1 + this.segmentHeight + this.bottomOffsetDeviation;
			const x4 = this.getX(y4, this.lanes.inner);
			p.quad(x1, y1, x2, y2, x3, y3, x4, y4);
			this.y -= 1;
		}

		getX(y, angleDegrees) {
			const angle = p.radians(angleDegrees + 90); // change orientation of provided angles to face downwards.
			const dy = y - canvas.apex.y;
			const distance = dy / p.sin(angle);
			const x = canvas.apex.x + distance * p.cos(angle);
			return x;
		}

		private riseSpeed(y: number) {
			p.map(y, canvas.h + 1, canvas.apex.y, 0, 1);
		}
	}

	p.preload = () => {
		titleImage = p.loadImage("/assets/title.png");
		subTitleImage = p.loadImage("/assets/subTitle.png");
	};

	p.setup = () => {
		const container = document.querySelector("#sketch-container");
		if (!container) {
			throw new Error("#sketch-container not found");
		}
		canvas = new FalloutPoster(container, titleImage, subTitleImage);
		p.createCanvas(canvas.w, canvas.h);
		p.select("canvas").parent("sketch-container");

		canvas.shapes.push(new Shape()); // Create a single shape so that the server does not crash on reload.
	};

	p.draw = () => {
		p.background("rgba(233, 221, 195, 1)");
		canvas.renderTitle();

		if (p.frameCount % POSTER_CONFIG.spawnRate === 0) {
			canvas.shapes.push(new Shape());
		}
		for (const shape of canvas.shapes) {
			shape.render();
		}
		canvas.shapes = canvas.shapes.filter((shape) => !shape.isDead);

		// safeguard memory leak
		if (canvas.shapes.length > 60) {
			console.log(`${canvas.shapes.length} is too many shapes, clearing them all.`);
			canvas.shapes.length = 0;
		}
	};
};

new p5(sketch);
