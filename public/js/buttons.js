import * as THREE from 'three';

import { MATERIALS, TEXTURES, MODELS } from './VALUES.js';
import * as ldr from './modelsLoader.js';


export { BUTTONS }

let BUTTONS = {

    createButtons: (selector, funcName, combi, scene) => {
        let uls = document.querySelectorAll(selector);
        uls.forEach((el) => {
            let example = el.querySelector('.threejs-example');
            example.classList.remove('threejs-example');

            let newButtons = [];

            switch (funcName) {
                case "changeButtons":
                    newButtons = BUTTONS.changePartButtons(example, el, combi, scene);
                    break;
                case 'changeTexture':
                    newButtons = BUTTONS.changeTextures(example, el, combi, scene);
                    break;
            }

            for (let i = 0; i < newButtons.length; i++) {
                el.appendChild(newButtons[i]);
            }

            example.remove();
        });
    },

    changePartButtons: (example, list, combi, scene) => {
        let part = list.dataset.part;
        let newButtons = [];
        // clones example & adds functions
        for (let modelSuffix in MODELS[part]) {
            let allInfos = MODELS[part][modelSuffix];

            let newLi = example.cloneNode(true);
            let button = newLi.querySelector('button');
            
            // sets elevation to true or false, it will then (in later process) put right.position.y at correct value
            button.dataset.elevation = allInfos.elevation;
            
            // gives button the corect information
            button.innerHTML = allInfos.name;
            button.dataset.suffix = modelSuffix;
            button.dataset.part = part;


            // event listener : changes jukebox left/right values
            button.addEventListener(
                "click",

                (event) => {
                    combi.setWithSuffix(button.dataset.suffix);

                    
                    /* dev debug : verify if after loading there is the correct number of objects and previous ones are indeed deleted */
                    console.log('----------------- infos on model change');
                    let cur = 0;
                    scene.traverse((object) => {
                        cur++;
                        console.log(`object : ${object.name}`);
                    });
                    console.log(`Currently ${cur} objects in scene`);
                    console.log(scene);
                }
            );

            newButtons.push(newLi);
        }

        return newButtons;
    },

    changeTextures: (example, list, combi, scene) => {
        let newButtons = [];
        let texturetype = list.dataset.texturetype;
        let textureInfos = TEXTURES[texturetype];

        let possibilities = textureInfos.possibilities;


        for (let texture of possibilities) {
            let cloned = example.cloneNode(true);
            let button = cloned.querySelector('button');
            button.dataset.texturetype = texturetype;
            button.dataset.texturename = texture;

            button.innerHTML = MATERIALS[texture].displayedName;

            button.addEventListener(
                "click",
                function() {
                    let objects = textureInfos.objectNamesList;
                    let rgx = /^[LR]_[A-Z]{2,3}/;

                    scene.traverse((object) => {
                        let objectShortenedName = object.name.replace(rgx, '');

                        // early return, makes sure the element should change texture
                        if (!objects.includes(objectShortenedName)) return;

                        object.material = MATERIALS[texture].material;

                    });
                }
            );
            newButtons.push(cloned);
        }

        return newButtons;
    }
}

