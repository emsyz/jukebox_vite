import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { MATERIALS, TEXTURES, MODELS } from './VALUES.js';

export { addAndLoad, loader, Combi, elevationEl, MODELS, TEXTURES, MATERIALS, startModelLoader }

const loader = new GLTFLoader();

// debug = 1, put it at 0 to hide the axes
let axesSize = 1;


let elevationEl = document.querySelector('.threejs-elevation');


// loads materials and introduce them in materials 3D scene
loader.load(
    "/assets/3DModels/materials.gltf",
    function ( gltf ) {
        let cubes = gltf.scene.children;
        for (let cube of cubes) {
            let material = cube.material;
            if (MATERIALS[material.name]) {
                MATERIALS[material.name].material = material;
            } else {
                MATERIALS[material.name] = {
                    displayedName: material.name
                            .replace(/(\W+)|(_+)/g, ' ')
                            .replace(/^\s+|\s+$/g, ''),
                    material: material
                }
            }
        }

        console.log(MATERIALS);
    },
    undefined,
    function ( error ) {
        console.error( error );
    }
);

function startModelLoader(combi) {
}



/**
 * 
 * @param {*} pathname 3D model pathname
 * @param {*} scene general scene where the model will be displayed
 * @param {*} infos directly applied transformations to the model (combi & combiPart should only be precised if this model is a left or right part combination of the jukebox)
 * {
 * position: [positionX: number, positionY: number, positionZ: number],
 * rotation: [rotationDegX: number, rotationDegY: number, rotationDegZ: number],
 * combi: combiObject: Combi,
 * combiPart: 'left'/'right': string
 * }
 * @returns the model
 */
function addAndLoad(pathname, scene, infos) {
    let model;

    loader.load(pathname, function ( gltf ) {

        // will only take 1st child of loaded scene and all its children
        model = gltf.scene.children[0];
        scene.add( model );

        model.receiveShadow = true;
        
        // if part of combi
        if (infos.combi && infos.combiPart) {
            switch (infos.combiPart) {
                case 'left':
                    infos.combi.setLeft(model);
                    break;
                case 'right':
                    infos.combi.setRight(model);
                    break;
            }
        }

        // sets positio n& rotation (whether its combi or not)
        if (infos.position) {
            model.position.x = infos.position[0],
            model.position.y = infos.position[1],
            model.position.z = infos.position[2]
        }

        if (infos.rotation) {
            model.rotation.x = THREE.MathUtils.degToRad(infos.rotation[0]);
            model.rotation.y = THREE.MathUtils.degToRad(infos.rotation[1]);
            model.rotation.z = THREE.MathUtils.degToRad(infos.rotation[2]);
        }
         
        
        // placement correction : if jukebox with asymetric foot, right part needs to be elevated
        if (infos.combi && infos.combi.right && elevationEl.dataset.elevation == 'true') {
            infos.combi.modifElevationRight(true);
        } else if (infos.combi && infos.combi.right) {
            infos.combi.modifElevationRight(false);
        }


    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    return model;
}






class Combi {
    /* given model loading is async, left & right are very most likely to be undefined if constructor called at file initialization; use setLeft & setRight to initiate everything */
    constructor(left, right, scene, axesPosition, partsOffset) {
        this.left = left;
        this.right = right;

        this.leftSuffix;
        this.rightSuffix;

        // true if automatically rotates at loading page; also used later on
        this.automaticRotate = false;

        if (partsOffset) this.partsOffset = partsOffset;

        // main pivot point
        this.axes = new THREE.AxesHelper(axesSize);

        // if fixed other than [0,0,0] by user
        if (axesPosition) {
            this.axes.position.x = axesPosition[0];
            this.axes.position.y = axesPosition[1];
            this.axes.position.z = axesPosition[2];
        }

        // adds axe to scene
        scene.add(this.axes);

        try {
            this.basicRotation = left.rotation;
        } catch (e) {
            this.basicRotation = null;
        }
    }

    setWithSuffix(suffix) {
        let part = (suffix.match(/^L_/) != null) ? "left" : "right";
        let model = MODELS[part][suffix].model;
        if (part == "left") this.setLeft(model, suffix);
        else this.setRight(model, suffix);

        if (this.leftSuffix) {
            let elevate = MODELS["left"][this.leftSuffix].elevation;
            this.modifElevationRight(elevate);
        }
    }

    /* set left part of combi & basicRotation if undefined*/
    setLeft(left, suffix) {
        if (this.left != undefined) {
            this.left.removeFromParent();
        }

        this.left = left;
        this.leftSuffix = suffix;
        this.axes.add(left);
        if (!this.basicRotation) {
            this.basicRotation = [
                left.rotation.x,
                left.rotation.y,
                left.rotation.z];
        }
    }

    /* set right part of combi & basicRotation if undefined */
    setRight(right, suffix) {
        if (this.right != undefined) {
            this.right.removeFromParent();
        }

        this.right = right;
        this.rightSuffix = suffix;
        this.axes.add(right);
        if (!this.basicRotation) {
            this.basicRotation = [
                right.rotation.x,
                right.rotation.y,
                right.rotation.z];
        }
    }

    /* modif elevation : to 0 or to MODELS.elevation (float) */
    modifElevationRight(isElevated) {
        if (!this.right) return;
        if (isElevated) {
            this.right.position.y = MODELS.elevation;
        } else {
            this.right.position.y = 0;
        }
    }

    // external method used to remove left or right part from scene
    removecccc(part) {
        switch (part) {
            case "left":
                if (!this.left) return;
                this.left.removeFromParent();
                this.left = undefined;
                break;
            case "right":
                if (!this.right) return;
                this.right.removeFromParent();
                this.right = undefined;
                break;
        }
    }

    // if both parts are complete
    isLoaded() {
        return (this.left && this.right);
    }

    isAutomaticallyRotating() {
        if (!this.isLoaded()) return false;
        return this.automaticRotate;
    }

    /* toggle automatic rotation on screen :
        restartAtPause : sets Combi back to place if true on toggling pause
        
        restartAtPlay : sets Combi back to place if true on toggling play
    */
    toggleAutomaticRotate(restartAtPause, restartAtPlay) {
        let rstPause = restartAtPause && (this.automaticRotate);
        let rstPlay = restartAtPlay && (!this.automaticRotate);

        if (rstPause || rstPlay) {
            this.rotateBasic();
        } 
        this.automaticRotate = !this.automaticRotate;
    }

    /* rotates back to place */
    rotateBasic() {
        if (this.basicRotation) {
            this.axes.rotation.x = this.basicRotation[0];
            this.axes.rotation.y = this.basicRotation[1];
            this.axes.rotation.z = this.basicRotation[2];
        }
    }

    /* sets rotation (regardless of its current rotation) */
    rotate(x, y, z) {
        this.axes.rotation.x += THREE.MathUtils.degToRad(x);
        this.axes.rotation.y += THREE.MathUtils.degToRad(y);
        this.axes.rotation.z += THREE.MathUtils.degToRad(z);
    }

    /* adds rotation to current rotation : allows continuous rotation */
    rotateMove(x, y, z) {
        this.axes.rotation.x += THREE.MathUtils.degToRad(x);
        this.axes.rotation.y += THREE.MathUtils.degToRad(y);
        this.axes.rotation.z += THREE.MathUtils.degToRad(z);
    }
}

