import * as THREE from 'three';

export { MAINOBJ, camera, renderer }

let MAINOBJ = {
    /*
    
    objectType: [object1, object2, ...],
    otherObjectType: [obj1, obj2, obj3,...]

    */
};




//////// LIGHTS

const DirectionalLight = new THREE.DirectionalLight( 0x404040, 130 ); // soft white light
DirectionalLight.position.set(10, 10, 10);

MAINOBJ.lights = [DirectionalLight];




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