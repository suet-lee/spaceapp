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
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // var background = new Image();
    // background.onload = function(){
    //     background.src = "/static/images/starry_sky_texture.png";
    //     ctx.drawImage(background,0,0);
    // }
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
    this.update = function () {
        for (i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            updateComposition(obj, this.animationRate);
            if (obj.attribs.parent != undefined) {
                computeHabitability(obj, this.animationRate);
            }
        }
    }
    this.animate = function() {
        if (this.ctx.speed != 0) {
            this.ctx.passTime();
            this.move();
            this.update();
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

function randomProperty(obj) {
    var keys = Object.keys(obj)
    return obj[keys[ keys.length * Math.random() << 0]];
};

/* Update composition of planet, temperature, atmosphere */
/* Overtime, methane + water + light => co2 */
/* h2o => h + o2 */
/* h, he, and o2 lost */
/* organisms take in n and co2, add o2 */
function updateComposition(object, step) {
  let atmos = object.attribs.atmosphere;
  let temp = object.attribs.temp;
  let comp = object.attribs.core;
  let unit = 0.01*step;

  if ("methane" in atmos && "h2o" in atmos && temp > 0) {
    atmos.methane -= unit;
    atmos.h2o -= unit;
    atmos.co2 += 2*unit;
  }
  if ("h2o" in atmos) {
      atmos.h2o -= 2*unit;
      atmos.h += unit;
      atmos.oxygen += unit;
  }
  if ("hydrogen" in atmos) {
      atmos.hydrogen -= unit;
  }
  if ("helium" in atmos) {
      atmos.helium -= unit;
  }
  if ("oxygen" in atmos) {
      atmos.oxygen -= unit;
  }
  if (object.life > 0) {
      atmos.nitrogen -= object.life*unit;
      atmos.co2 -= object.life*unit;
      atmos.oxygen += object.life*unit;
  }

  var total = 0;
  var count = 0;
  for (var atm in atmos) {
      if (atm == 'thickness') {
          continue;
      }
      var val = atmos[atm];
      if (val < 0) {
          atmos[atm] = 0;
      }
      total += atmos[atm];
      count += 1;
  }

  var remain = (1-total)/count;
  if (remain > 0) {
      for (var atm in atmos) {
          if (atm == 'thickness') {
              continue;
          }
          atmos[atm] += remain;
      }
  }

  if (atmos.co2 > 0.5) {
      temp += temp*Math.pow((1+atmos.co2), step);
  }

  object.attribs.atmosphere = atmos;
  object.attribs.temp = temp
}

function computeHabitability(object, step) {
  if (object.attribs.habitability == undefined) {
      object.attribs.habitability = 0;
  }
  var moltenScale = object.attribs.core.molten - 0.5;
  if (object.attribs.atmosphere.thickness <= 0 || moltenScale == -0.5) {
      return 0;
  }

  let px = object.attribs.parent.pos.x;
  let py = object.attribs.parent.pos.y;
  let ox = object.pos.x;
  let oy = object.pos.y;
  let x_diff = px - ox;
  let y_diff = py - oy;
  let r = Math.sqrt(x_diff*x_diff+y_diff*y_diff);

  if (r < 100 || r > 200 || object.size < 5) {
      object.attribs.habitability += Math.pow(object.attribs.habitability, 1.125);
  } else {
      object.attribs.habitability -= Math.pow(object.attribs.habitability, 1.125);
  }
}

function computeLife(object, step) {
    if (object.habitability > 0.7) {
        object.life = object.life + object.habitability*100;
        return;
    }
    var rollDice = Math.random();
    if (rollDice > 0.5) {
        object.life += object.life + rollDice*100;
    } else {
        object.life -= rollDice*100;
    }
}

function CelestialObject(type, size, pos, attribs) {
    this.type = type.toLowerCase();
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
            drawOrbit(ctx, this.attribs.parent.pos, this.attribs.parent_d);
        }
        drawObject(ctx, this.pos, this.size / 2, getColor(this.attribs));
    };

    if ("parent" in this.attribs) {
        this.attribs.baseTemp = 1/Math.sqrt(this.attribs.parent_d);
        if (this.attribs.temp == undefined) {
            this.attribs.temp = this.attribs.baseTemp;
        }
        this.attribs.temp = this.attribs.baseTemp*0.2 + this.attribs.temp*0.8;
    } else {
        this.attribs.temp = 10000;
    }

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
            this.pos.y = this.attribs.parent.pos.y - this.attribs.parent_d*Math.sin(this.attribs.parent_angle);
        }
    };

    this.life = 0;
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
    let gases = ['carbon', 'nitrogen', 'oxygen', 'co2', 'methane', 'ozone', 'hydrogen', 'helium', 'h20'];
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
    'gasRatio': {'hydrogen': 0.35, 'helium': 0.35, 'h2o': 0.2},
    'core': {'metallic': true},
    'water': 0.8
  },
  'ocean': {
    'gasRatio': {},
    'water': 1
    },
  'star': {
    'gasRatio': {'hydrogen': 0.4, 'helium': 0.4},
    'core': {'molten': true, 'rocky': false},
    'water': 0
  }
};

let sun = new CelestialObject("star", 20, { x: canvas.width / 2, y: canvas.height / 2 }, {
    color: "yellow",
    temp: 400,
    fusion: 0
});

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
}, true);

$(document).ready(function(e){
    $("#create_btn").click(function () {
        pos = { x: $("#xpos_input").val(), y: $("#ypos_input").val() };
        speed = $("#speed").val();
        size = $("#size").val();
        type = "planet";
        color = '#fff';
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
    });

    $("#cancel_btn").click(function() {
        $("#add_object").trigger("reset");
        $("#add_object_form").css("display", "none");
    });
});

init();
universe.addObject(sun);

universe.addObject(new CelestialObject("carbon", 3, {x: canvas.width / 3, y:canvas.height / 2}, { color: "cyan", parent: sun, speed: 1 }));

universe.draw(ctx);
