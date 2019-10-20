const canvas = document.querySelector("#draw");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

function UniverseContext(ctx) {
    this.ctx = ctx;
    this.scale = 1;
    this.speed = 0;
    this.time = 0;
    this.loc = { x: 0, y: 0 };
    this.translatePos = function(pos) {
        return { x: pos.x * this.scale - this.loc.x, y: pos.y * this.scale - this.loc.y };
    };
    this.scaleLength = function(l) {
        return this.scale * l;
    };
    this.passTime = function() {
        this.time += this.speed;
        this.time = Math.round(this.time);
    };
};

let context = new UniverseContext(ctx);

function init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    ctx.fillStyle = "yellow";
    ctx.fillText("scale", 10, 10);
    ctx.fillText(context.scale, 50, 10);
    ctx.fillText("location", 10, 20);
    ctx.fillText(context.loc.x + "," + context.loc.y, 50, 20);
    ctx.fillText("speed", 10, 30);
    ctx.fillText(context.speed, 50, 30);
    ctx.fillText("time", 10, 40);
    ctx.fillText(context.time, 50, 40);
}

function Universe(ctx) {
    this.ctx = ctx
    this.objects = new Array();
    this.addObject = function (object) {
        this.objects.push(object);
    };
    this.draw = function () {
        init();
        for (i = 0; i < this.objects.length; i++) {
            this.objects[i].draw(this.ctx);
        }
    };
    this.move = function () {
        for (i = 0; i < this.objects.length; i++) {
            this.objects[i].move(this.ctx.speed / 9);
        }
        this.draw();
    };
    this.animate = function() {
        if (this.ctx.speed != 0) {
            this.ctx.passTime();
            this.move();
            window.requestAnimationFrame(this.animate.bind(this));
        }
    }
};

function getColor(attribs) {
    if ("color" in attribs) {
        return attribs["color"];
    }
    return "green";
}

function drawOrbit(ctx, pos, radius) {
    ctx.ctx.beginPath();
    let newPos = ctx.translatePos(pos);
    let newRadius = ctx.scaleLength(radius);
    ctx.ctx.arc(newPos.x, newPos.y, newRadius, 0, 2 * Math.PI);
    ctx.ctx.strokeStyle = '#424242';
    ctx.ctx.stroke();
}

function drawObject(ctx, pos, radius, color) {
    ctx.ctx.fillStyle = color;
    ctx.ctx.beginPath();
    let newPos = ctx.translatePos(pos);
    let newRadius = ctx.scaleLength(radius);
    ctx.ctx.arc(
        newPos.x,
        newPos.y,
        newRadius,
        0,
        2 * Math.PI
    );
    ctx.ctx.fill();
}

function moveObject(object, step) {
  let w = object.attribs.w*step;
  let parent = object.attribs.parent;
  let px = parent.pos.x;
  let py = parent.pos.y;
  let ox = object.pos.x;
  let oy = object.pos.y;

  let x_diff = px - ox;
  let y_diff = py - oy;
  let r = Math.sqrt(x_diff*x_diff+y_diff*y_diff);
  let t = Math.atan2(y_diff, x_diff);
  let a = w + t;

  object.pos.x = px - r*Math.cos(a);
  object.pos.y = py - r*Math.sin(a);
}

function CelestialObject(type, size, pos, attribs) {
    this.type = type;
    this.pos = pos;
    this.size = size;
    this.attribs = attribs;
    
    if ("parent" in attribs)
    {
        let parent = attribs.parent;
        let px = parent.pos.x;
        let py = parent.pos.y;
        let ox = pos.x;
        let oy = pos.y;
        let x_diff = px - ox;
        let y_diff = py - oy;
        this.attribs.parent_d = Math.sqrt(x_diff*x_diff+y_diff*y_diff);
        this.attribs.parent_angle = Math.atan2(y_diff, x_diff);
    }

    this.draw = function (ctx) {
        if ("parent" in this.attribs) {
            let x_diff = this.pos.x - this.attribs.parent.pos.x;
            let y_diff = this.pos.y - this.attribs.parent.pos.y;
            let r = Math.sqrt(x_diff*x_diff+y_diff*y_diff);
            drawOrbit(ctx, this.attribs.parent.pos, r);
        }
        drawObject(ctx, this.pos, this.size / 2, getColor(this.attribs));
    };

    if (type in planets) {
      let planet = planets[type];
      this.attribs.atmosphere = new Atmosphere(planet['gasRatio']);
      this.attribs.core = new Core(
        planet.core.metallic,
        planet.core.rocky,
        planet.core.molten
      );
      if (planet.water == undefined) {
          this.attribs.water = Math.random();
      } else {
          this.attribs.water = planet.water;
      }
    }

    this.move = function (animationRate) {
        if ("parent" in this.attribs && "speed" in this.attribs) {
            this.attribs.parent_angle += this.attribs.speed*animationRate;
            this.pos.x = this.attribs.parent.pos.x -  this.attribs.parent_d*Math.cos(this.attribs.parent_angle);
            this.pos.y = 
            this.attribs.parent.pos.y - this.attribs.parent_d*Math.sin(this.attribs.parent_angle);
        }
    };
}

let universe = new Universe(context);

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/* gasRatio entries should be between 0 - 1 */
/* eg. {'carbon': 0.2, 'oxygen': 0.1} */
function Atmosphere(gasRatio) {
    let self = this;
    self.thickness = Math.random();
    let gases = ['carbon', 'nitrogen', 'oxygen', 'co2', 'methane', 'ozone', 'hydrogen', 'helium'];
    let equalSplit = [];
    let total = 0;
    gases.forEach(function(gas, idx) {
        if (gas in gasRatio) {
            self[gas] = getRandomArbitrary(gasRatio[gas]/2, gasRatio[gas]);
            total += self[gas];
        } else {
            equalSplit.push(gas);
        }
    });
    let remain = 1-total;
    equalSplit.forEach(function(gas, idx) {
        self[gas] = remain/equalSplit.length;
    });
}

function Core(metallic = false, rocky = false, molten) {
    if (!metallic && !rocky || metallic && rocky || metallic == undefined || rocky == undefined){
        this.metallic = Boolean(Math.round(Math.random()));
        this.rocky = !this.metallic;
    } else {
        this.metallic = metallic;
        this.rocky = rocky;
    }
    if (molten == undefined) {
        this.molten = Math.random();
    } else {
        this.molten = getRandomArbitrary(3*molten/4, molten);
    }
}

let planets = {
  'carbon': {
    'gasRatio': {'carbon': 0.2, 'oxygen': 0.2, 'co2': 0.4},
    'core': {'metallic': true},
  },
  'gas': {
    'gasRatio': {'hydrogen': 0.4, 'helium': 0.4},
    'core': {'molten': 0.8}
  },
  'helium': {
    'gasRatio': {'helium': 0.8, 'co2': 0.1}
  },
  'terrestrial': {
    'gasRatio': {'hydrogen': 0.4, 'helium': 0.4},
    'core': {'metallic': true},
    'water': 0.8
  },
  'ocean': {
    'water': 1
  }
};

let sun = new CelestialObject("star", 20, { x: canvas.width / 2, y: canvas.height / 2 }, {
    color: "yellow",
    temperature: 400,
    fusion: 0
});

universe.addObject(sun);

universe.draw(ctx);

canvas.addEventListener("dblclick", function (e) {
    $("#xpos_input").val(e.x);
    $("#ypos_input").val(e.y);
    $("#add_object_form").css("display", "block");
});

canvas.addEventListener("keydown", function (e) {
    let key = String.fromCharCode(e.keyCode);
    if (key.toLowerCase() == "i") {
        if (context.scale >= 1) {
            context.scale += 1;
        }
        else
        {
            context.scale *= 2;
        }
        universe.draw();
    }
    else if (key.toLowerCase() == "o") {
        if (context.scale > 1) {
            context.scale -= 1;
        }
        else {
            context.scale /= 2;
        }
        universe.draw();        
    }
    else if (key.toLowerCase() == 'w') {
        context.loc.y -= context.scale * 5;
        universe.draw();
    }
    else if (key.toLowerCase() == 's') {
        context.loc.y += context.scale * 5;
        universe.draw();
    }
    else if (key.toLowerCase() == 'a') {
        context.loc.x -= context.scale * 5;
        universe.draw();
    }
    else if (key.toLowerCase() == 'd') {
        context.loc.x += context.scale * 5;
        universe.draw();
    }
    else if (key.toLowerCase() == 'm') {
        universe.move();
    }
    else if (Number(key) != NaN) {
        let oldVal = context.speed;
        context.speed = Number(key);
        if (context.speed != 0 && oldVal == 0)
        {
            universe.animate();
        }
    }
});

$(document).ready(function(e){
    $("#create_btn").click(function () {
        pos = { x: $("#xpos_input").val(), y: $("#ypos_input").val() };
        speed = $("#speed").val();
        size = $("#size").val();
        type = "planet";
        color = $("#color").val();
        universe.addObject(new CelestialObject(
            type, Number(size), pos, { color: color, parent: sun, speed: Number(speed) }));
        universe.draw(context);
        $("#add_object").trigger("reset");
        $("#add_object_form").css("display", "none");
    });

    $("#clear_btn").click(function() {
        $("#name").val("");
        $("#size").val("");
        $("#speed").val("");
        $("#color").val("");
    });

    $("#cancel_btn").click(function() {
        $("#add_object").trigger("reset");
        $("#add_object_form").css("display", "none");
    });
});
