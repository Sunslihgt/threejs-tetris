import * as threejs from 'three';


const renderer = new threejs.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new threejs.Scene();
const camera = new threejs.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(1, 2, 5);

const axesHelper = new threejs.AxesHelper(5);
scene.add(axesHelper);

const boxGeometry = new threejs.BoxGeometry();
const boxMaterial = new threejs.MeshBasicMaterial({ color: 0x00FF00 });
const box = new threejs.Mesh(boxGeometry, boxMaterial);
scene.add(box);

renderer.render(scene, camera);