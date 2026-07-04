// src/sketch.ts
var COLORS = {
  red: {
    light: "rgba(255, 132, 94, 0.85)",
    normal: "rgba(255, 81, 56, 0.80)",
    dark: "rgba(222, 54, 44, 0.75)"
  },
  blue: {
    light: "rgba(235, 255, 254, 0.76)",
    normal: "rgba(156, 178, 217, 0.75)",
    dark: "rgba(77, 79, 102, 0.75)"
  },
  green: {
    light: "rgba(247, 255, 211, 0.75)",
    normal: "rgba(84, 150, 94, 0.75)",
    dark: "rgba(48, 97, 56, 0.75)"
  },
  yellow: {
    light: "rgba(255, 244, 107, 0.84)",
    normal: "rgba(229, 176, 53, 0.75)",
    dark: "rgba(168, 137, 40, 0.75)"
  },
  neutral: {
    light: "rgba(255, 249, 235, 0.70)",
    dark: "rgba(173, 167, 151, 0.40)"
  }
};
var sketch = (p) => {
  let shapes = [];
  let title;
  let subTitle;
  const CONFIG = {
    apex: {
      x: 0,
      y: 0
    },
    margin: 8,
    title: {
      x: 0,
      y: 0,
      w: 0,
      h: 0
    },
    subTitle: {
      x: 0,
      y: 0,
      w: 0,
      h: 0
    },
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
      25.5
    ]
  };
  function newShape() {
    const shapeIndex = p.floor(p.random(0, CONFIG.angles.length - 1));
    const shapeHeight = p.floor(p.random(p.height / 20, p.height / 8));
    const heightDeviation = shapeHeight / 10;
    const colorName = p.random([
      "neutral",
      "red",
      "blue",
      "green",
      "yellow"
    ]);
    let shapeColor = void 0;
    if (colorName === "neutral") {
      shapeColor = shapeIndex < 7 ? COLORS.neutral.dark : COLORS.neutral.light;
    } else {
      const shade = p.random([
        "light",
        "normal",
        "normal",
        "dark"
      ]);
      shapeColor = COLORS[colorName][shade];
    }
    shapes.push(new Shape({
      lanes: getLanes(shapeIndex),
      y: p.height + 1,
      segmentHeight: shapeHeight,
      topOffset: p.random(p.height / 100, p.height / 33),
      bottomOffsetDeviation: p.random(-heightDeviation, heightDeviation),
      color: shapeColor
    }));
  }
  class Shape {
    lanes;
    y;
    segmentHeight;
    topOffset;
    bottomOffsetDeviation;
    color;
    isDead;
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
      p.noStroke();
      p.fill(this.color);
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
      const x1 = CONFIG.apex.x;
      const y1 = CONFIG.apex.y;
      const y2 = y1 + this.segmentHeight + this.topOffset;
      const x2 = getX(y2, this.lanes.outer);
      const y3 = y1 + this.segmentHeight + this.bottomOffsetDeviation;
      const x3 = getX(y3, this.lanes.inner);
      p.triangle(x1, y1, x2, y2, x3, y3);
      this.segmentHeight -= 1;
    }
    rise() {
      const y1 = this.y;
      const x1 = getX(y1, this.lanes.inner);
      const y2 = y1 + this.topOffset;
      const x2 = getX(y2, this.lanes.outer);
      const y3 = y2 + this.segmentHeight;
      const x3 = getX(y3, this.lanes.outer);
      const y4 = y1 + this.segmentHeight + this.bottomOffsetDeviation;
      const x4 = getX(y4, this.lanes.inner);
      p.quad(x1, y1, x2, y2, x3, y3, x4, y4);
      this.y -= 1;
    }
  }
  function getLanes(shapeIndex) {
    const leftAngle = CONFIG.angles[shapeIndex];
    const rightAngle = CONFIG.angles[shapeIndex + 1];
    const inner = p.abs(leftAngle) < p.abs(rightAngle) ? leftAngle : rightAngle;
    const outer = leftAngle === inner ? rightAngle : leftAngle;
    return {
      inner,
      outer
    };
  }
  function getX(y, angleDegrees) {
    const angle = p.radians(angleDegrees + 90);
    const dy = y - CONFIG.apex.y;
    const distance = dy / p.sin(angle);
    const x = CONFIG.apex.x + distance * p.cos(angle);
    return x;
  }
  function placeTitle() {
    const subTitleSegment = CONFIG.apex.x - CONFIG.margin;
    const subTitleAspectRatio = subTitle.height / subTitle.width;
    const subTitleWidth = subTitleSegment * 5 / 3;
    const subTitleHeight = subTitleWidth * subTitleAspectRatio;
    CONFIG.subTitle = {
      w: subTitleWidth,
      h: subTitleHeight,
      x: CONFIG.margin,
      y: CONFIG.apex.y - subTitleHeight * 0.75
    };
    const titleAspectRatio = title.height / title.width;
    const leftMargin = CONFIG.margin + 2;
    const rightMargin = CONFIG.margin;
    const titleWidth = p.width - leftMargin - rightMargin;
    const titleHeight = titleWidth * titleAspectRatio;
    CONFIG.title = {
      w: titleWidth,
      h: titleHeight,
      x: leftMargin,
      y: CONFIG.margin
    };
  }
  p.preload = () => {
    title = p.loadImage("/assets/title.png");
    subTitle = p.loadImage("/assets/subTitle.png");
  };
  p.setup = () => {
    const container = p.select("#sketch-container");
    const w = container.width;
    const h = container.height;
    p.createCanvas(w, h);
    p.select("canvas").parent("sketch-container");
    CONFIG.apex = {
      x: p.floor(p.width / 2),
      y: p.floor(p.height / 4)
    };
    placeTitle();
    newShape();
  };
  p.draw = () => {
    p.background("rgba(233, 221, 195, 1)");
    const { x: titleX, y: titleY, w: titleW, h: titleH } = CONFIG.title;
    p.image(title, titleX, titleY, titleW, titleH);
    const { x: subX, y: subY, w: subW, h: subH } = CONFIG.subTitle;
    p.image(subTitle, subX, subY, subW, subH);
    if (p.frameCount % CONFIG.spawnRate === 0) {
      newShape();
    }
    for (let shape of shapes) {
      shape.render();
    }
    shapes = shapes.filter((shape) => !shape.isDead);
  };
};
new p5(sketch);
