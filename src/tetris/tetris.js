import * as threejs from 'three';
import { SHAPES } from './shapes.js';


const renderer = new threejs.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new threejs.Scene();
const camera = new threejs.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(5, 10, 40);

const axesHelper = new threejs.AxesHelper(20);
scene.add(axesHelper);

const boxesData = [
    [0, 0, 1, 0x00FF00], // Green   -> Z
    [0, 1, 0, 0xFF0000], // Red     -> Y
    [1, 0, 0, 0x0000FF], // Blue    -> X
];
boxesData.forEach(boxData => {
    const boxGeometry = new threejs.BoxGeometry();
    const boxMaterial = new threejs.MeshBasicMaterial({ color: boxData[3]});
    const box = new threejs.Mesh(boxGeometry, boxMaterial);
    box.position.set(boxData[0], boxData[1], boxData[2]);
    scene.add(box);
});

renderer.render(scene, camera);