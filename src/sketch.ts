let shapes = [];
let title;
let subTitle;

// constants
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

const CONFIG = {
  spawnRate: 10, // How often shapes will generate (every X frames)
  angles: [
    -25, -23, -20, -16, -13, -11, -6.5, 0, 5.25, 10, 13, 18, 22, 24, 25.5,
  ],
  apex: { x: 0, y: 0 },
  margin: 8,
  title: { x: 0, y: 0, w: 0, h: 0 },
  subTitle: { x: 0, y: 0, w: 0, h: 0 },
};

function newShape() {
  let shapeIndex = floor(random(0, CONFIG.angles.length - 1));
  let shapeHeight = floor(random(height / 20, height / 8));
  let startHeight = height + 1;
  let deviation = shapeHeight / 10;

  let colorName = random(["neutral", "red", "blue", "green", "yellow"]);
  let shapeColor = undefined;
  if (colorName === "neutral") {
    // Left half: light, Right half: dark
    shapeColor = shapeIndex < 7 ? COLORS.neutral.dark : COLORS.neutral.light;
  } else {
    let shade = random(["light", "normal", "normal", "dark"]); // Hacky weighting system
    shapeColor = COLORS[colorName][shade];
  }

  shapes.push(
    new Shape({
      lanes: getLanes(shapeIndex),
      y: startHeight,
      segmentHeight: shapeHeight,
      topOffset: random(height / 100, height / 33),
      bottomOffsetDeviation: random(-deviation, deviation),
      color: shapeColor,
    }),
  );
}

class Shape {
  constructor(shapeConfig) {
    this.lanes = shapeConfig.lanes;
    this.y = shapeConfig.y;
    this.segmentHeight = shapeConfig.segmentHeight;
    this.topOffset = shapeConfig.topOffset;
    this.bottomOffsetDeviation = shapeConfig.bottomOffsetDeviation;
    this.color = shapeConfig.color;
    this.isDead = false;
  }

  render() {
    noStroke();
    fill(this.color);
    if (this.y === CONFIG.apex.y) {
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
    let x1 = CONFIG.apex.x;
    let y1 = CONFIG.apex.y;
    let y2 = y1 + this.segmentHeight + this.topOffset;
    let x2 = getX(y2, this.lanes.outer);
    let y3 = y1 + this.segmentHeight + this.bottomOffsetDeviation;
    let x3 = getX(y3, this.lanes.inner);
    triangle(x1, y1, x2, y2, x3, y3);
    this.segmentHeight -= 1;
  }

  rise() {
    let y1 = this.y;
    let x1 = getX(y1, this.lanes.inner);
    let y2 = y1 + this.topOffset;
    let x2 = getX(y2, this.lanes.outer);
    let y3 = y2 + this.segmentHeight;
    let x3 = getX(y3, this.lanes.outer);
    let y4 = y1 + this.segmentHeight + this.bottomOffsetDeviation;
    let x4 = getX(y4, this.lanes.inner);
    quad(x1, y1, x2, y2, x3, y3, x4, y4);
    this.y -= 1;
  }
}

// Helper functions
function getLanes(shapeIndex) {
  let leftAngle = CONFIG.angles[shapeIndex];
  let rightAngle = CONFIG.angles[shapeIndex + 1];

  // Ensure that shapes will always be angled towards the center.
  let inner = abs(leftAngle) < abs(rightAngle) ? leftAngle : rightAngle;
  let outer = leftAngle === inner ? rightAngle : leftAngle;

  return { inner, outer };
}

function getX(y, angleDegrees) {
  const angle = radians(angleDegrees + 90); // change orientation of provided angles to face downwards.
  const dy = y - CONFIG.apex.y;
  const distance = dy / sin(angle);
  const x = CONFIG.apex.x + distance * cos(angle);
  return x;
}

function placeTitle() {
  let subTitleSegment = CONFIG.apex.x - CONFIG.margin;
  let subTitleAspectRatio = subTitle.height / subTitle.width;
  let subTitleWidth = (subTitleSegment * 5) / 3;
  let subTitleHeight = subTitleWidth * subTitleAspectRatio;
  // Position subtitle at 5/3 of title width to center within ampersand
  CONFIG.subTitle = {
    w: subTitleWidth,
    h: subTitleHeight,
    x: CONFIG.margin,
    y: CONFIG.apex.y - subTitleHeight * 0.75,
  };

  let titleAspectRatio = title.height / title.width;
  let leftMargin = CONFIG.margin + 2;
  let rightMargin = CONFIG.margin;
  let titleWidth = width - leftMargin - rightMargin;
  let titleHeight = titleWidth * titleAspectRatio;
  CONFIG.title = {
    w: titleWidth,
    h: titleHeight,
    x: leftMargin,
    y: CONFIG.margin,
  };
}

function preload() {
  title = loadImage("/assets/title.png");
  subTitle = loadImage("/assets/subTitle.png");
}

function setup() {
  let container = select("#sketch-container");
  let w = container.width;
  let h = container.height;
  createCanvas(w, h);
  select("canvas").parent("sketch-container");

  // Set APEX based off canvas size
  CONFIG.apex = {
    x: floor(width / 2),
    y: floor(height / 4),
  };

  placeTitle();
  newShape(); // Create a single shape so that the server does not crash on reload.
}

function draw() {
  background("rgba(233, 221, 195, 1)");
  const { x: titleX, y: titleY, w: titleW, h: titleH } = CONFIG.title;
  image(title, titleX, titleY, titleW, titleH);
  const { x: subX, y: subY, w: subW, h: subH } = CONFIG.subTitle;
  image(subTitle, subX, subY, subW, subH);

  if (frameCount % CONFIG.spawnRate === 0) {
    newShape();
  }
  for (let shape of shapes) {
    shape.render();
  }
  shapes = shapes.filter((shape) => !shape.isDead);
}

