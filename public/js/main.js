// THREEJS imports
import * as THREE from 'three';

// local imports
import * as ldr from './modelsLoader.js';
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
let combi1 = new ldr.Combi(null, null, scene, combi1PivotPointPosition);

// adds default left part; it will be replaced with buttons later on
ldr.addAndLoad(
    ldr.MODELS['left'][0].path,
    scene,
    {
        position: combi1PartsOffset,
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
        position: combi1PartsOffset,
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
        combi1.toggleAutomaticRotate(false, true);
    }
);




////////// change model

let uls = document.querySelectorAll(".threejs-options[data-fct='changepart']");

uls.forEach((el) => {
    let part = el.dataset.part;

    // example to be removed later on
    let example = el.querySelector('.threejs-example');
    example.classList.remove('threejs-example');

    // clones example & adds functions
    for (let modelInfos of ldr.MODELS[part]) {
        let newLi = example.cloneNode(true);
        let button = newLi.querySelector('button');
        
        // if if modelInfos elevation is set to true or false (normally only for left side) :
        // sets elevation to true or false, it will then (in addAndLoad) put right.position.y at correct value
        if (modelInfos.elevation != undefined) button.dataset.elevation = modelInfos.elevation;
        
        // gives button the corect information
        button.dataset.path = modelInfos.path;
        button.innerHTML = modelInfos.name;
        button.dataset.part = part;

        // event listener : changes jukebox left/right values
        button.addEventListener(
            "click",

            (event) => {

                // resets combi rotation
                //combi1.rotateBasic();
                combi1.remove(scene, part);

                // adds the new part
                ldr.addAndLoad(
                    button.dataset.path,
                    scene,
                    {
                        position: combi1PartsOffset,
                        rotation: [0, -90, 0],
                        combi: combi1,
                        combiPart: part
                    }
                );

                // SETS ELEVATION for right part
                // given the async load of parts,
                // it will set before right part is loaded
                // so elevation is automatically done within the AddAndLoad function
                if (part == 'left') {
                    ldr.elevationEl.dataset.elevation = button.dataset.elevation;
                }

                
                /* dev debug : verify if after loading there is the correct number of objects and previous ones are indeed deleted */
                console.log('----------------- infos on model change');
                let cur = 0;
                scene.traverse((object) => {
                    cur++;
                    //console.log(`object : ${object.name}`);
                });
                console.log(`Currently ${cur} objects in scene`);
                console.log(scene);
            }
        );

        // appends new button to options list
        el.appendChild(newLi);
    }

    // deletes example after all buttons are placed
    example.remove();
});






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