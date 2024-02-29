import * as THREE from 'three';

export { MAINOBJ, camera, renderer }

let MAINOBJ = {
    /*
    
    objectType: [object1, object2, ...],
    otherObjectType: [obj1, obj2, obj3,...]

    */
};




//////// LIGHTS

const sun = new THREE.DirectionalLight( 0x404040, 130 ); // soft white light
sun.castShadow = true;
sun.position.set(10, 10, 10);

const ambientLight = new THREE.AmbientLight(404040, 1);

// used to create both lights in front of the jukebox, left and right
const secLights = {

    // physical distance from jukebox to the lights
    distance: 4,

    // physical height where the lights are placed
    height: 1.2,

    // lights color
    color: 0xffffff,

    // numeric value of the lights' strength/intensity
    power: 20,

    // light max range (default : 0 (no limit))
    fadeDistance: 20,

    // amount the lights dim along the distance (default : 2)
    decay: 0.6,

    createLight: function(xDistanceMultiplicator) {
        let newLight = new THREE.PointLight(
            secLights.color,
            secLights.power,
            secLights.fadeDistance,
            secLights.decay
        );

        newLight.position.set(
            xDistanceMultiplicator * secLights.distance,
            secLights.height,
            secLights.distance
        );

        newLight.castShadow = true;

        return newLight;
    }
};

const secLightLeft = secLights.createLight(-1);
const secLightRight = secLights.createLight(1);

MAINOBJ.lights = [sun, secLightLeft, ambientLight, secLightRight];




//////// MAIN CAMERAS

let sizes = {
    w: window.innerWidth,
    h: window.innerWidth * (9/16),
    ar: function() {
        return sizes.w/sizes.h
    },

    recalculate: function() {
        sizes.w = window.innerWidth;
        sizes.h = window.innerWidth * (9/16);

        renderer.setSize(sizes.w, sizes.h);
    },

    log: function() {
        console.log(`${sizes.w}w - ${sizes.h}h`);
    }
}

let camera = new THREE.PerspectiveCamera(

    // field of view : extent of the scene that can be displayed
    75,
    
    // aspect ratio
    sizes.ar(),
    
    // near clipping plane (before won't be rendered)
    0.1,
    
    // far clipping plane (after won't be rendered)
    1000 );

// automatically adds to the scene at (0,0,0)
//scene.add( cube );
camera.position.z = 2.2;
camera.position.y = 0.56;




//////// RENDERER

const renderer = new THREE.WebGLRenderer();
sizes.recalculate();
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;

// adds renderer to doc
document.querySelector("main").appendChild( renderer.domElement );

window.onresize = () => {
    sizes.recalculate();
    sizes.log();
}




//////// MAIN ARRAYS