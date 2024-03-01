// THREEJS imports
import * as THREE from 'three';

// local imports
import * as ldr from './modelsLoader.js';
import * as buttons from './buttons.js';
import { MATERIALS, TEXTURES, MODELS } from './VALUES.js';
import { MAINOBJ, camera, renderer } from './mainSceneComponents.js';






/////////////////////// SCENE SETUP

const scene = new THREE.Scene();
const scene_stock = new THREE.Scene();
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



ldr.loader.load(
    '/assets/3DModels/jukeboxAll.glb',
    (gltf) => {
        let combi = combi1;
        let models = gltf.scene.children;

        models.forEach((model) => {

            // fix from blender
            model.position.x = 0;
            model.position.y = 0;
            model.position.z = 0;

            model.rotation.y = THREE.MathUtils.degToRad(-90);

            // 
            let name = model.name;
            let suffix = name.match(/^[A-Z]_[A-Z]{2,3}_/)[0];
            let displayedName;
            let elevation = undefined;

            switch (suffix) {
                case "L_SS_":
                    displayedName = 'Shelves (simple foot)';
                    elevation = false;
                    break;
                case "L_SA_":
                    displayedName = 'Shelves (Asymetric foot)';
                    elevation = true;
                    break;
                case "L_DS_":
                    displayedName = 'Door (simple foot)';
                    elevation = false;
                    break;
                case "L_DA_":
                    displayedName = 'Door (Asymetric foot)';
                    elevation = true;
                    break;

                case "R_BD_":
                    displayedName = 'Big (with drawer)';
                    break;
                case "R_BND_":
                    displayedName = 'Big (no drawer)';
                    break;
                case "R_SD_":
                    displayedName = 'Small (with drawer)';
                    break;
                case "R_SND_":
                    displayedName = 'Small (no drawer)';
                    break;
            }

            let part;
            if (name.match(/^L_/) != undefined) part = 'left';
            else part = 'right';

            let modelInfos = {
                name: displayedName,
                model: model,
                elevation: elevation
            };

            MODELS[part][suffix] = modelInfos;
        });

        combi.setWithSuffix("L_DA_");
        combi.setWithSuffix("R_BD_");




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
        
    },
    undefined,
    (error) => {
        console.log(error);
    }
);



////////// enables automatic rotation

let rotationButton = document.querySelector('.threejs-button[data-fct="automatic-rotate"]');

rotationButton.addEventListener(
    "click",
    function() {
        combi1.toggleAutomaticRotate();
    }
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



function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    if (combi1.isAutomaticallyRotating()) {
        combi1.rotateMove(0, 0.1, 0);
    } 
}

animate();