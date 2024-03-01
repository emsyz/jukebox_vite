import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export { addAndLoad, loader, Combi, elevationEl, MODELS, TEXTURES, MATERIALS }

const loader = new GLTFLoader();

// debug = 1, put it at 0 to hide the axes
let axesSize = 1;


let elevationEl = document.querySelector('.threejs-elevation');

let MATERIALS = {

    "M_Glass": {
        displayedName: "Glass",
        material: undefined
    },
    "M_Glass_Black": {
        displayedName: "Black Glass",
        material: undefined
    },
    "M_Gold": {
        displayedName: "Gold",
        material: undefined
    },
    "M_Metal": {
        displayedName: "Metal",
        material: undefined
    },
    "M_Wood_Dark": {
        displayedName: "Dark Wood",
        material: undefined
    },
    "M_Wood_Brown": {
        displayedName: "Brown Wood",
        material: undefined
    },
    "M_Wood_Orange": {
        displayedName: "Orange Wood",
        material: undefined
    },
    "M_Wood_Light": {
        displayedName: "Light Wood",
        material: undefined
    },
    "M_White": {
        displayedName: "White",
        material: undefined
    },

    get: (name) => {
        return MATERIALS[name];
    }

    // new materials might be loaded with following loader.load() call
};


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


let TEXTURES = {

    'details': {
        name: 'Details',
        possibilities: [
            "M_Wood_Dark",
            "M_Wood_Brown",
            "M_Wood_Orange",
            "M_Wood_Light",

            "M_Metal",
            "M_White"
        ],
        objectNamesList: [
            '_details_inner',
            '_details_outer',
            '_details_lines',
            '_details_border'
        ]
    },

    'outerShell': {
        name: 'Outer shell',
        possibilities: [
            "M_Wood_Dark",
            "M_Wood_Brown",
            "M_Wood_Orange",
            "M_Wood_Light",

            "M_Metal",
            "M_White"
        ],

        objectNamesList: [
            '_shell',
            '_lid',
            '_smallAperture',
            '_ventilation',
            '_speakers_door'
        ]
    },

    'doors': {
        name: 'Doors',
        possibilities: [
            "M_Glass",
            "M_Glass_Black"
        ],

        objectNamesList: [
            '_door_left',
            '_door_right'
        ]
    }
};


let MODELS = {
    elevation: 0.129896,
    'left': [
        {
            path: '/assets/3DModels/LEFT_shelves_simpleFoot.glb',
            name: 'Shelves simple foot',
            elevation: false
        },
        {
            path: '/assets/3DModels/LEFT_shelves_asymetricFoot.glb',
            name: 'Shelves asymetric foot',
            elevation: true
        },
        {
            path: '/assets/3DModels/LEFT_door_simpleFoot.glb',
            name: 'Door simple foot',
            elevation: false
        },
        {
            path: '/assets/3DModels/LEFT_door_asymetricFoot.glb',
            name: 'Door asymetric foot',
            elevation: true
        }
    ],
    'right': [
        {
            path: '/assets/3DModels/RIGHT_big_drawer.glb',
            name: 'Big with a drawer'
        },
        {
            path: '/assets/3DModels/RIGHT_big_noDrawer.glb',
            name: 'Big without a drawer'
        },
        {
            path: '/assets/3DModels/RIGHT_small_drawer.glb',
            name: 'Small with a drawer'
        },
        {
            path: '/assets/3DModels/RIGHT_small_noDrawer.glb',
            name: 'Small without a drawer'
        }
    ]
};

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

    /* set left part of combi & basicRotation if undefined*/
    setLeft(left) {
        this.left = left;
        this.axes.add(left);
        if (!this.basicRotation) {
            this.basicRotation = [
                left.rotation.x,
                left.rotation.y,
                left.rotation.z];
        }
    }

    /* set right part of combi & basicRotation if undefined */
    setRight(right) {
        this.right = right;
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
        if (isElevated) {
            this.right.position.y = MODELS.elevation;
        } else {
            this.right.position.y = 0;
        }
    }

    // external method used to remove left or right part from scene
    remove(scene, part) {
        switch (part) {
            case "left":
                if (!this.left) return;
                // this.left.removeFromParent();
                this.removeObject(this.left);
                this.left = undefined;
                break;
            case "right":
                if (!this.right) return;
                // this.right.removeFromParent();
                this.removeObject(this.right);
                this.right = undefined;
                break;
        }
    }

    // removes specific object from parent & dispose of its geometry & material
    removeObject(obj) {
        obj.geometry.dispose();
        obj.material.dispose();
        obj.removeFromParent();
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

