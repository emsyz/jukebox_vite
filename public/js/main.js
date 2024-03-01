// THREEJS imports
import * as THREE from 'three';

// local imports
import * as ldr from './modelsLoader.js';
import * as buttons from './buttons.js';
import { MAINOBJ, camera, renderer } from './mainSceneComponents.js';





/////////////////////// SCENE SETUP

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9d9d9);

for (let arrays in MAINOBJ) {
    for (let item of MAINOBJ[arrays]) scene.add(item);
}







/////////////////////// GLTFLoader

// combi1PartsOffset[2] : left & right parts displacement from the pivot point, used to center pivot point on jukebox for its rotation
let combi1PartsOffset = [0,0, -0.35];
let combi1PivotPointPosition = [0,0,0];

// currently only one combi used in scene
// currently pivot point at [0,0,0]
let combi1 = new ldr.Combi(null, null, scene, combi1PivotPointPosition, combi1PartsOffset);

// adds default left part; it will be replaced with buttons later on
ldr.addAndLoad(
    ldr.MODELS['left'][0].path,
    scene,
    {
        position: combi1.partsOffset,
        rotation: [0, -90, 0],
        combi: combi1,
        combiPart: 'left'
    }
);

// adds default right part; it will be replaced with buttons later on
ldr.addAndLoad(
    ldr.MODELS['right'][2].path,
    scene,
    {
        position: combi1.partsOffset,
        rotation: [0, -90, 0],
        combi: combi1,
        combiPart: 'right'
    }
);

/*
// mesh for ground, unused here since scene.background is used with a color
let ground = ldr.addAndLoad(
    '/assets/3DModels/ground.glb',
    scene,
    {
        position: [12,0,0],
        rotation: [0, -90, 0]
    }
);*/



////////// enables automatic rotation

let rotationButton = document.querySelector('.threejs-button[data-fct="automatic-rotate"]');

rotationButton.addEventListener(
    "click",
    function() {
        combi1.toggleAutomaticRotate();
    }
);




////////// change model : done in buttons.js

buttons.BUTTONS.createButtons(
    ".threejs-options[data-fct='changepart']",
    'changeButtons',
    combi1,
    scene
);

buttons.BUTTONS.createButtons(
    ".threejs-options[data-fct='changetexture']",
    'changeTexture',
    combi1,
    scene
);






/////////////////////// ANIMATE


/* mobile : touchmove */

let lastTouchMove = 0;
let newTouchMove;
let delta;
let speedMultiplier = 2;
let speedMultiplierComputer = 6;
let ontouchmove = (event) => {
    newTouchMove = event.touches[0].clientX;
    delta = newTouchMove - lastTouchMove;
    lastTouchMove = newTouchMove;

    if (delta < 0) delta = -speedMultiplier;
    else if (delta > 0) delta = speedMultiplier;

    combi1.rotateMove(0, delta, 0);
}

document.querySelector("canvas").addEventListener(
    "touchmove",
    ontouchmove
);

/* computer : mousedown, mouseup, mousemove */

let onmousemove = (event) => {
    if (!combi1.isAutomaticallyRotating() && combi1.isLoaded()) {
        combi1.rotateMove(0, event.movementX/speedMultiplierComputer, 0);
    }
}

document.querySelector("canvas").addEventListener(
    "mousedown",
    (event) => {
        document.addEventListener(
            "mousemove",
            onmousemove
        );
    }
);

document.addEventListener(
    "mouseup",
    (event) => {
        document.removeEventListener(
            "mousemove",
            onmousemove
        );
    }
);



// setTimeout(() => {
//     const axesHelper = new THREE.AxesHelper( 1 );
//     axesHelper.attach(combi1.left);
//     axesHelper.position.z = 0.3;
//     scene.add( axesHelper );
// }, 4000);


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    if (combi1.isAutomaticallyRotating()) {
        combi1.rotateMove(0, 0.1, 0);
    } 
}

animate();