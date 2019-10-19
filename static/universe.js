const canvas = document.querySelector("#draw");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

function init() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();
}

function draw(x, y, r, properties) {
  ctx.fillStyle = properties.color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

function drawObject(object) {
  ctx.fillStyle = object.color;
  ctx.beginPath();
  ctx.arc(
    object.position.x,
    object.position.y,
    object.size / 2,
    0,
    2 * Math.PI
  );
  ctx.fill();
}

function drawOrbit(object) {
  var ppos = object.parent.position;
  var x_diff = object.position.x-ppos.x;
  var y_diff = object.position.y-ppos.y;
  var radius = Math.sqrt(x_diff*x_diff + y_diff*y_diff);
  ctx.beginPath();
  ctx.arc(
    ppos.x,
    ppos.y,
    radius,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = '#424242';
  ctx.stroke();
}

let sun = {
  position: { x: canvas.width / 2, y: canvas.height / 2 },
  type: "star",
  color: "yellow",
  size: 20
};

let p1 = {
    parent: sun,
    position: { x: sun.position.x+180, y: sun.position.y+120 },
    type: "star",
    color: "blue",
    size: 13
}

init();
drawObject(sun);
drawOrbit(p1);
drawObject(p1);
// draw(canvas.width / 3, canvas.height / 2, 3, { color: "cyan" });
// draw(canvas.width / 4, canvas.height / 2, 2, { color: "red" });
// draw(canvas.width / 5, canvas.height / 2, 5, { color: "brown" });

/*
function expand() {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle("white");
  ctx.fill();
  window.requestAnimationFrame(expand);
}

window.requestAnimationFrame(expand);
*/
