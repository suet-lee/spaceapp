const canvas = document.querySelector("#draw");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

function Universe() {
    this.time = 0;
    this.objects = new Array();
    this.addObject = function(object) {
        this.objects.push(object);
    };
    this.draw = function(context) {
        for (i=0; i<this.objects.length; i++) {
            this.objects[i].draw(context);
        }
    };
    this.timeStep = function(step = 1) {
      this.time += step;
      this.objects.forEach(function(object, idx) {
        if (object.attribs.parent == undefined) {
            return;
        }
        moveObject(object, step);
      });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      universe.draw(ctx);
    }
};

function getColor(attribs) {
    if ("color" in attribs) {
        return attribs["color"];
    }
    return "green";
}

function drawOrbit(ctx, pos, radius) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2*Math.PI);
    ctx.strokeStyle = '#424242';
    ctx.stroke();
}

function moveObject(object, step) {
  let w = object.attribs.w*step;
  let parent = object.attribs.parent;
  let px = parent.pos.x;
  let py = parent.pos.y;
  let ox = object.pos.x;
  let oy = object.pos.y;

  let x_diff = ox - px;
  let y_diff = oy - py;
  let r = Math.sqrt(x_diff*x_diff+y_diff*y_diff);
  let t = Math.atan(y_diff/x_diff);
  let a = w + t

  object.pos.x = px - r*Math.sin(a);
  object.pos.y = py - r*Math.sin(a);
}

function CelestialObject(type, size, pos, attribs) {
    this.type = type;
    this.pos = pos;
    this.size = size;
    this.attribs = attribs;
    this.draw = function(ctx) {
        if ("parent" in this.attribs)
        {
            let x_diff = this.pos.x - this.attribs.parent.pos.x;
            let y_diff = this.pos.y - this.attribs.parent.pos.y;
            let r = Math.sqrt(x_diff*x_diff+y_diff*y_diff);
            drawOrbit(ctx, this.attribs.parent.pos, r);
        }
        ctx.fillStyle = getColor(this.attribs);
        ctx.beginPath();
        ctx.arc(
            this.pos.x,
            this.pos.y,
            this.size / 2,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
}

let universe = new Universe();

function init() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();
}

init();

let sun = new CelestialObject("star", 20, {x : canvas.width /2, y: canvas.height / 2}, {
  color: "yellow"
});

universe.addObject(sun);

universe.addObject(new CelestialObject("planet", 3, {x: canvas.width / 3, y:canvas.height / 2}, { color: "cyan", parent: sun, w: 0.1 }));

universe.addObject(new CelestialObject("planet", 2, {x: canvas.width / 4, y:  canvas.height / 2}, { color: "red", parent: sun, w: 0.6 }));

universe.addObject(new CelestialObject("planet", 5, {x:canvas.width / 5, y: canvas.height / 2}, { color: "brown", parent: sun, w: 0.2 }));

universe.draw(ctx);

canvas.addEventListener("dblclick", function(e) {
    universe.addObject(new CelestialObject(
        "planet", 10, {x: e.x, y: e.y }, {parent: sun}));
    universe.draw(ctx);
});

document.onkeydown = checkKey;
function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
    }
    else if (e.keyCode == '40') {
        // down arrow
    }
    else if (e.keyCode == '37') {
        console.log('timestepping back');
        universe.timeStep(-1);
    }
    else if (e.keyCode == '39') {
      console.log('timestepping forward');
      universe.timeStep();
    }

}

/*
function expand() {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle("white");
  ctx.fill();
  window.requestAnimationFrame(expand);
}

window.requestAnimationFrame(expand);
*/
