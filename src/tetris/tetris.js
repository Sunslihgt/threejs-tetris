import * as threejs from 'three';
import { SHAPES } from './shapes.js';


class Shape {
    constructor(shapeId, spawnX, spawnY, color) {
        this.shapeId = shapeId;
        this.x = spawnX;
        this.y = spawnY;
        this.direction = 0;
        this.color = color || colors[Math.floor(Math.random() * colors.length)];
        this.cubes = [];
    }

    createShape() {
        this.cubes = [];
        for (let x = 0; x < SHAPES[this.shapeId][0].length; x++) {
            for (let y = 0; y < SHAPES[this.shapeId][0][0].length; y++) {
                if (SHAPES[this.shapeId][0][x][y] == 1) {
                    this.cubes.push(new Cube(x, y, this.color));
                }
            }
        }
    }

    fall(gameCubes) {
        let collided = this.testCollision(0, 1, 0, gameCubes);
        if (!collided) this.y++;
        return collided;
    }

    move(gameCubes, xVel) {
        if (xVel == 0) return;

        let collided = this.testCollision(xVel, 0, 0, gameCubes);
        if (!collided) this.x += xVel;
        return collided;
    }

    rotate(gameCubes, directionVel) {
        if (directionVel == 0) return;

        let collided = this.testCollision(0, 0, directionVel, gameCubes);
        if (!collided) {
            this.direction = (this.direction + directionVel) % SHAPES[this.shapeId].length;
            while (this.direction < 0) this.direction += SHAPES[this.shapeId].length;

            this.cubes.forEach(cube => {
                cube.removeCube();
            })
            this.cubes = [];

            for (let x = 0; x < SHAPES[this.shapeId][this.direction].length; x++) {
                for (let y = 0; y < SHAPES[this.shapeId][this.direction][0].length; y++) {
                    if (SHAPES[this.shapeId][this.direction][x][y] == 1) {
                        this.cubes.push(new Cube(x, y, this.color));
                    }
                }
            }
        }
        return collided;
    }

    testCollision(xVel, yVel, directionVel, gameCubes) {
        let newDirection = (this.direction + directionVel) % SHAPES[this.shapeId].length;
        while (newDirection < 0) newDirection += SHAPES[this.shapeId].length;
        let newCubes = [];
        console.log("Direction: " + this.direction + " -> " + newDirection);
        console.log(SHAPES[this.shapeId])
        for (let x = 0; x < SHAPES[this.shapeId][newDirection].length; x++) {
            for (let y = 0; y < SHAPES[this.shapeId][newDirection][0].length; y++) {
                if (SHAPES[this.shapeId][newDirection][x][y] == 1) {
                    newCubes.push(new Cube(x, y, this.color));
                }
            }
        }


        for (let shapeCube of newCubes) {
            if (shapeCube.x + this.x + xVel < 0 || shapeCube.x + this.x + xVel >= game_width) {
                return true;
            } else if (shapeCube.y + this.y + yVel < 0 || shapeCube.y + this.y + yVel >= game_height) {
                return true;
            }
            for (let gameCube of gameCubes) {
                if (gameCube.x == shapeCube.x + this.x + xVel && gameCube.y == shapeCube.y + this.y + yVel) {
                    return true;
                }
            }
        }
        return false;
    }

    draw() {
        for (let cube of this.cubes) {
            cube.draw(this.x, this.y);
        }
    }

}


class Cube {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.mesh = new threejs.Mesh(
            new threejs.BoxGeometry(),
            new threejs.MeshBasicMaterial({ color: color })
        );
        this.mesh.visible = false;
        scene.add(this.mesh);
    }

    removeCube() {
        this.mesh.visible = false;
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        scene.remove(this.mesh);
        console.log("-Cube removed from scene", this);
    }

    draw(xOffset = 0, yOffset = 0) {
        this.mesh.position.set(this.x + xOffset, game_height - (this.y + yOffset) - 1, 0);
        this.mesh.visible = true;
    }
}


// Check for full line and erase them
function checkLines(gameCubes) {
    for (let y = game_height - 1; y > 0; y--) {
        let line = true;
        while (line) {
            for (let x = 0; x < game_width; x++) {
                let cubeFound = false;
                for (let cube of gameCubes) {
                    if (cube.x == x && cube.y == y) {
                        cubeFound = true;
                        break;
                    }
                }
                if (!cubeFound) {
                    line = false;
                    break;
                }
            }
            if (line) { // Full line found
                score += 50; // TODO: Use correct score count
                // tetris_score_p.innerHTML = "Score: " + score; // TODO: Display score
                console.log("Full line found: " + y);

                // Remove cubes from scene
                const deletedCubes = gameCubes.filter((cube) => cube.y == y)
                for (deletedCube of deletedCubes) {
                    deletedCube.removeCube();
                }

                // Delete line
                gameCubes = gameCubes.filter((cube) => cube.y !== y);

                // Drop cubes above
                for (let newY = y - 1; newY > 0; newY--) {
                    for (let newX = 0; newX < game_width; newX++) {
                        const gameCube = find_cube(newX, newY, gameCubes);
                        if (gameCube != null) {
                            gameCube.y++;
                        }
                    }
                }
            }
        }
    }

    console.log("Cubes after line delete:", gameCubes);
    return gameCubes;
}

// Return the cube at position (x, y) or null
function find_cube(x, y, cubes) {
    for (let cube of cubes) {
        if (cube.x == x && cube.y == y) {
            return cube;
        }
    }
    return null;
}

function drawGame() {
    console.log(cubes, shape);
    // ctx.fillStyle = "black";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let cube of cubes) {
        cube.draw();
    }

    if (shape != null) {
        shape.draw();
    }
    renderer.render(scene, camera)
}


// let canvas_padding = canvas.width * 0.05;
const game_width = 10;
const game_height = 20;
// let cube_total_size = Math.min(
//     (win_width * 0.7) / game_width,
//     (win_height * 0.7) / game_height
// );
// let cube_size = Math.floor(cube_total_size * 0.95);
// let cube_padding = cube_total_size - cube_size;

const renderer = new threejs.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// canvas.width = game_width * cube_total_size + canvas_padding * 2;
// canvas.height = game_height * cube_total_size + canvas_padding * 2;
document.body.appendChild(renderer.domElement);

const scene = new threejs.Scene();

const camera = new threejs.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(5, 10, 40);

const axesHelper = new threejs.AxesHelper(10);
scene.add(axesHelper);

let score = 0;
let cubes = [];
const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0x800080, 0xFFA500, 0xFFC0CB];
let shape = new Shape(Math.floor(Math.random() * SHAPES.length), 4, 0, null);

drawGame();

shape.createShape();

let gameLoop = setInterval(function () {
    // Move shape down
    if (shape != null) {
        let shapeCollided = shape.fall(cubes);

        console.log(shapeCollided);

        if (shapeCollided) {
            for (let cube of shape.cubes) {
                cubes.push(new Cube(cube.x + shape.x, cube.y + shape.y, cube.color));
            }
            shape = null;
            cubes = checkLines(cubes);
            console.log("MAIN -> Cubes after line delete:", cubes);
        }
    }

    // Create new shape if none exists
    if (shape == null) {
        shape = new Shape(Math.floor(Math.random() * SHAPES.length), 4, 0, null);
        shape.createShape();
        // Test if game over (collision at spawn)
        if (shape.testCollision(0, 0, 0, cubes)) {
            shape = null;
            drawGame(cubes, shape);
            clearInterval(gameLoop);
        }
    }

    drawGame(cubes, shape);
}, 300);

document.addEventListener('keydown', function (event) {
    if (shape == null) return;

    moved = false;

    if (event.key == "ArrowLeft" || event.key == "q") {
        shape.move(cubes, -1);
        moved = true;
    } else if (event.key == "ArrowRight" || event.key == "d") {
        shape.move(cubes, 1);
        moved = true;
    } else if (event.key == "ArrowDown" || event.key == "s") {
        shape.fall(cubes);
        moved = true;
    } else if (event.key == "a") {
        shape.rotate(cubes, -1);
        moved = true;
    } else if (event.key == "ArrowUp" || event.key == "e" || event.key == " ") {
        shape.rotate(cubes, 1);
        moved = true;
    }

    if (moved) {
        drawGame(cubes, shape);
    }
});