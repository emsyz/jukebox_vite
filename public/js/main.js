// THREEJS imports
import * as THREE from 'three';

// local imports
import * as ldr from './modelsLoader.js';
import { MAINOBJ, camera, renderer } from './mainSceneComponents.js';





/////////////////////// SCENE SETUP

const scene = new THREE.Scene();

for (let arrays in MAINOBJ) {
    for (let item of MAINOBJ[arrays]) scene.add(item);
}







/////////////////////// GLTFLoader

let combi1 = new ldr.Combi(null, null);

let left = ldr.addAndLoad(
    ldr.MODELS['left'][0].path,
    scene,
    {
        position: [0,0,0],
        rotation: [0, -90, 0],
        combi: combi1,
        combiPart: 'left'
    }
);

let right = ldr.addAndLoad(
    ldr.MODELS['right'][2].path,
    scene,
    {
        position: [0,0,0],
        rotation: [0, -90, 0],
        combi: combi1,
        combiPart: 'right'
    }
);

let ground = ldr.addAndLoad(
    '/assets/3DModels/ground.glb',
    scene,
    {
        position: [12,0,0],
        rotation: [0, -90, 0]
    }
);



////////// rotate

let rotationButton = document.querySelector('.threejs-button[data-fct="automatic-rotate"]');

rotationButton.addEventListener(
    "click",
    function() {
        combi1.toggleAutomaticRotate(false, true);
    }
);




////////// change model

let uls = document.querySelectorAll(".threejs-options");


uls.forEach((el) => {
    let part = el.dataset.part;

    let example = el.querySelector('.example');
    example.classList.remove('example');

    for (let modelInfos of ldr.MODELS[part]) {
        let newLi = example.cloneNode(true);
        let button = newLi.querySelector('button');
        
        if (modelInfos.elevation != undefined) button.dataset.elevation = modelInfos.elevation;
        
        button.dataset.path = modelInfos.path;
        button.innerHTML = modelInfos.name;
        button.dataset.part = part;

        button.addEventListener(
            "click",

            (event) => {

                combi1.rotateBasic();
                combi1.remove(scene, part);

                ldr.addAndLoad(
                    button.dataset.path,
                    scene,
                    {
                        position: [0,0,0],
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

                
                /* verify if after loading there is the correct number of objects and previous ones are indeed deleted
                right now this is the case for jukebox components but an object scene is added each time and i don't know why */
                let cur = 0;
                console.log('-------------------------------- ' + cur);
                scene.traverse((object) => {
                    cur++;
                    //console.log(object.name);
                });
                console.log(cur);
            }
        );
        el.appendChild(newLi);
    }

    example.remove();
});






/////////////////////// ANIMATE


/* mobile : touchmove */

let lastTouchMove = 0;
let newTouchMove;
let delta;
let speedMultiplier = 2;
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
        combi1.rotateMove(0, event.movementX/18, 0);
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

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    if (combi1.isAutomaticallyRotating()) {
        combi1.rotateMove(0, 0.1, 0);
    } 
}

animate();