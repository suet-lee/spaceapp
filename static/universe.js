const canvas = document.querySelector("#draw");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

function Universe() {
    this.objects = new Array();
    this.addObject = function (object) {
        this.objects.push(object);
    };
    this.draw = function (context) {
        for (i = 0; i < this.objects.length; i++) {
            this.objects[i].draw(context);
        }
    };
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

function CelestialObject(type, size, pos, attribs) {
    this.type = type;
    this.pos = pos;
    this.size = size;
    this.attribs = attribs;
    this.draw = function (ctx) {
        if ("parent" in this.attribs) {
            let x_diff = this.pos.x - this.attribs.parent.pos.x;
            let y_diff = this.pos.y - this.attribs.parent.pos.y;
            let radius = Math.sqrt(x_diff * x_diff + y_diff * y_diff);
            drawOrbit(ctx, this.attribs.parent.pos, radius);
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

let sun = new CelestialObject("star", 20, { x: canvas.width / 2, y: canvas.height / 2 }, {
    color: "yellow"
});

universe.addObject(sun);

universe.addObject(new CelestialObject("planet", 3, { x: canvas.width / 3, y: canvas.height / 2 }, { color: "cyan", parent: sun }));

universe.addObject(new CelestialObject("planet", 2, { x: canvas.width / 4, y: canvas.height / 2 }, { color: "red", parent: sun }));

universe.addObject(new CelestialObject(
    "planet", 5, { x: canvas.width / 5, y: canvas.height / 2 }, { color: "brown", parent: sun }));

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

/*
function expand() {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle("white");
  ctx.fill();
  window.requestAnimationFrame(expand);
}

window.requestAnimationFrame(expand);
*/

