let size = 15//50;
let scale = 20//7;
let bears0 = 3;
let cities0 = 1;
let factories0 = 2;

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let tileTypes = {
    TERRAIN: 0,
    WATER: 1,
    ICE: 2
}

let terrain = [];
let water = [];
let ice = [];
let bears = [];
let cities = [];
let factories = [];

class Tile {
    constructor (id, center, type, level=5) {
        this.id = id;
        this.center = center
        this.type = type;
        this.level = level;

        this.x = center[0]*scale;
        this.y = center[1]*scale;

        // this.up = null;
        // this.down = null;
        // this.right = null;
        // this.left = null;

        this.draw();
        // this.getNeighbours();
    }

    draw () {
        ctx.beginPath();
        ctx.moveTo(this.x - scale*2, this.y);
        ctx.lineTo(this.x, this.y - scale);
        ctx.lineTo(this.x + scale*2, this.y);
        ctx.lineTo(this.x, this.y + scale);
        ctx.lineTo(this.x - scale*2, this.y);

        var colour = '#fff';
        if (this.type == tileTypes.TERRAIN) {
            var rand = Math.random();
            if (rand < 0.2) {
                 colour = '#6cbf54';
            } else if (rand < 0.6) {
                colour = '#6dc255';
            } else {
                colour = '#70c259';
            }
        } else if (this.type == tileTypes.WATER) {
            colour = 'rgba(0, 129, 194, 0.8)';
            // colour = '#0081c2';
            // ctx.strokeStyle = colour;
            // ctx.lineJoin = 'round';
            // ctx.stroke();
        } else {
            if (Math.random() < 0.08) {
                colour = '#dae7eb';
            } else {
                colour = '#e1edf0';
            }
            ctx.strokeStyle = '#dedede';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }

        ctx.fillStyle = colour;
        ctx.fill();
        // ctx.strokeStyle = colour;
        // ctx.lineJoin = 'round';
        // ctx.stroke();
    }

    neighbours() {
        if (typeof this.nbs !== 'undefined') {
            return this.nbs;
        }

        var nbs = {'u': null, 'd': null, 'l': null, 'r': null}; // Up, down, left, right

        var u = this.id - size;
        var d = this.id + size;

        if (u < size*size && u >= 0) {
            nbs['u'] = u;
        }

        if (d < size*size && d >= 0) {
            nbs['d'] = d;
        }

        if (this.id % size != 0) {
            nbs['l'] = this.id - 1;
        }

        var r = this.id + 1;
        if (r % size != 0) {
            nbs['r'] = r;
        }

        return nbs;
    }
}

class Unit {
    constructor (tiles, availablePos, existingUnits) {
        this.id = this.generatePos(availablePos, existingUnits);
        this.tile = tiles[this.id];
    }

    generatePos (available, existing) {
        var i = 0;
        while (i < 200) {
            var idx = Math.floor(Math.random()*available.length);
            var val = available[idx];
            if (existing.indexOf(val) == -1) {
                return val;
            }
            i++;
        }
    }

    drawImage (imageId, offsetX, offsetY, scale) {
        var self = this;
        var image = new Image();
        image.onload = function () {
            var x = self.tile.x - offsetX;
            var y = self.tile.y - offsetY;
            ctx.drawImage(image, x, y, scale*2, scale*2);
        }

        image.src = document.getElementById(imageId).src;
    }
}

class Bear extends Unit {
    constructor (tiles) {
        super(tiles, ice, bears);
        bears.push(this.id);

        // ctx.beginPath();
        // ctx.ellipse(this.tile.x - scale, this.tile.y - scale, scale*2, scale, Math.PI / 4, 0, 0);
        // ctx.fillStyle = '#dedede';
        // ctx.fill();
        // ctx.stroke();
        // ctx.closePath();
        this.drawImage('bear', scale*0.75, scale*1.25, scale);
    }
}

class City extends Unit {
    constructor (tiles) {
        super(tiles, terrain, cities.concat(factories));
        cities.push(this.id);

        // ctx.beginPath();
        // ctx.ellipse(this.tile.x - scale, this.tile.y - scale, scale*2, scale, Math.PI / 4, 0, 0);
        // ctx.fillStyle = '#dedede';
        // ctx.fill();
        // ctx.stroke();
        // ctx.closePath();
        this.drawImage('city', scale*1.4, scale*2.5, scale*1.5, scale*1.5);
        // this.drawImage('city', scale, scale*1.5, scale, scale);
    }
}

class Factory extends Unit {
    constructor (tiles) {
        super(tiles, terrain, cities.concat(factories));
        factories.push(this.id);

        // ctx.beginPath();
        // ctx.ellipse(this.tile.x - scale, this.tile.y - scale, scale*2, scale, Math.PI / 4, 0, 0);
        // ctx.fillStyle = '#dedede';
        // ctx.fill();
        // ctx.stroke();
        // ctx.closePath();
        this.drawImage('factory', this.tile.x-scale, this.tile.y-scale, scale, scale);
    }
}

class Grid {
    constructor () {
        this.generateTiles();
        this.generateUnits();
    }

    generateTiles () {
        var centers = [];
        for (var j = 0; j < size; j++) {
            for (var i = 0; i < size; i++) {
                var x = 2 + 2*j + 2*i;
                var y = size + j - i;
                centers.push([x, y]);
            }
        }

        var nf = new NoiseField();
        var noise = nf.generate(size, size, 150, 0.9, 0.3);

        this.tiles = [];
        centers.forEach((point, id) => {
            var n = noise[id];
            var level = 5;
            var type = null;

            if (n < 0.4) {
                type = tileTypes.TERRAIN;
                terrain.push(id);
            } else if (n < 0.7) {
                type = tileTypes.WATER;
                water.push(id);
            } else {
                type = tileTypes.ICE;
                ice.push(id);
                level = Math.round(n*12.5); // @todo
            }

            this.tiles.push(new Tile(id, point, type));
        });
    }

    generateUnits () {
        var self = this;

        for (var i = 0; i < bears0; i++) {
            var bear = new Bear(this.tiles);
            if (bears.length == ice.length) {
                break;
            }
        }

        for (var i = 0; i < cities0; i++) {
            var city = new City(this.tiles);
            if (cities.length + factories.length == terrain.length) {
                break;
            }
        }

        for (var i = 0; i < cities0; i++) {
            var factory = new Factory(this.tiles);
            if (cities.length + factories.length == terrain.length) {
                break;
            }
        }
    }

    generateUnitPos (available, existing) {
        var i = 0;
        while (i < 200) {
            var idx = Math.floor(Math.random()*available.length);
            if (existing.indexOf(idx) == -1) {
                return idx;
            }
            i++;
        }
    }
}

window.onload = function () {
    var map = new Grid();
}

// every player move updates a tile, updates objects
// a = new Grid(2, scale);
