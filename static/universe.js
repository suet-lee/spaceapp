const canvas = document.querySelector("#draw");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

function Universe() {
    this.time = 0;
    this.objects = new Array();
    this.addObject = function (object) {
        this.objects.push(object);
    };
    this.draw = function (context) {
        for (i = 0; i < this.objects.length; i++) {
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
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
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

  let x_diff = px - ox;
  let y_diff = py - oy;
  let r = Math.sqrt(x_diff*x_diff+y_diff*y_diff);

  let t = Math.atan(Math.abs(y_diff/x_diff));

  if (x_diff == 0 && y_diff >= 0) {
      t *= -1;
      console.log('x0, y>0', t)
  } else if (x_diff == 0 && y_diff < 0) {
      t *= -1;
      console.log('x0, y<0', t)
  } else if (y_diff == 0 && x_diff >= 0) {
      t *= -1;
      console.log('y0, x>0', t)
  } else if (y_diff == 0 && x_diff < 0) {
      t *= -1;
      console.log('y0, x<0', t)
  }
  t0 = Math.atan(0)
  t1 = Math.atan(1/0)
  consol
  console.log()
  let a = w + t;

  object.pos.x = px - r*Math.cos(a);
  object.pos.y = py - r*Math.sin(a);
}

function CelestialObject(type, size, pos, attribs) {
    this.type = type;
    this.pos = pos;
    this.size = size;
    this.attribs = attribs;
    this.draw = function (ctx) {
        if ("parent" in this.attribs) {
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

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/* gasRatio entries should be between 0 - 1 */
/* eg. {'carbon': 0.2, 'oxygen': 0.1} */
function Atmosphere(thickness = 0, gasRatio) {
    let self = this;
    self.thickness = thickness;
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

let universe = new Universe();

let planets = {
  'carbon': {
    'gasRatio': {'carbon': 0.2, 'oxygen': 0.2, 'co2': 0.4},
    'core': {'metallic': true}
  },
  'gas': {
    'gasRatio': {'hydrogen': 0.4, 'helium': 0.4},
    'core': {'molten': 0.8}
  },
  'helium': {
    'gasRatio': {'helium': 0.8, 'co2': 0.1}
  },
  'terrestrial': {

  },
  'ocean': {

  }
};


function init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
}

init();

let sun = new CelestialObject("star", 20, { x: canvas.width / 2, y: canvas.height / 2 }, {
    color: "yellow"
});

universe.addObject(sun);

universe.addObject(new CelestialObject("planet", 3, {x: canvas.width / 3, y:canvas.height / 2}, { color: "cyan", parent: sun, w: 0.01,
  atmosphere: new Atmosphere(planets.carbon.thickness, planets.carbon.gasRatio), core: new Core(false, false, true)
}));

// universe.addObject(new CelestialObject("planet", 3, {x: canvas.width / 3, y:canvas.height / 2}, { color: "cyan", parent: sun, w: Math.PI/4 }));

// universe.addObject(new CelestialObject("planet", 2, {x: canvas.width / 4, y:  canvas.height / 2}, { color: "red", parent: sun, w: 0.6 }));
//
// universe.addObject(new CelestialObject("planet", 5, {x:canvas.width / 5, y: canvas.height / 2}, { color: "brown", parent: sun, w: 0.2 }));

universe.draw(ctx);

canvas.addEventListener("dblclick", function (e) {
    $("#xpos_input").val(e.x);
    $("#ypos_input").val(e.y);
    $("#add_object_form").css("display", "block");
});

$(document).ready(function(e){
    $("#create_btn").click(function () {
        pos = { x: $("#xpos_input").val(), y: $("#ypos_input").val() };
        size = $("#size").val();
        type = "planet";
        color = $("#color").val();
        universe.addObject(new CelestialObject(
            type, size, pos, { color: color, parent: sun }));
        universe.draw(ctx);
        $("#add_object").trigger("reset");
        $("#add_object_form").css("display", "none");
    });

    $("#clear_btn").click(function() {
        $("#name").val("");
        $("#size").val("");
        $("#color").val("");
    });

    $("#cancel_btn").click(function() {
        $("#add_object").trigger("reset");
        $("#add_object_form").css("display", "none");
    });

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
