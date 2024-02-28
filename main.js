import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const loader = new GLTFLoader();

// basic camera type
const camera = new THREE.PerspectiveCamera(

    // field of view : extent of the scene that can be displayed
    75,
    
    // aspect ratio
    window.innerWidth / window.innerHeight,
    
    // near clipping plane (before won't be rendered)
    0.1,
    
    // far clipping plane (after won't be rendered)
    1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

// adds renderer to doc
document.querySelector("main").appendChild( renderer.domElement );






/////////////////////// CUBE

// adds a box geometry : object containing all vertices and faces
const geometry = new THREE.BoxGeometry( 2, 2, 2 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

// mesh
const cube = new THREE.Mesh( geometry, material );
cube.position.y = 0;

// automatically adds to the scene at (0,0,0)
//scene.add( cube );

camera.position.z = 2;
camera.position.y = 0.5;






/////////////////////// GLTFLoader
// loader.load( '/assets/3DModels/slats_simple.glb', function ( gltf ) {
//     console.log(gltf);
// 	scene.add( gltf.scene );

// }, undefined, function ( error ) {

// 	console.error( error );

// } );

let slats_simple = addAndLoad('/assets/3DModels/slats_simple.glb');
let ground = addAndLoad('/assets/3DModels/ground.glb');

function addAndLoad(pathname) {
    let model;
    loader.load(pathname, function ( gltf ) {
        console.log(gltf);
        scene.add( gltf.scene );
        model = gltf.scene.children[0];
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );
    return model;
}






/////////////////////// LIGHTS
const light = new THREE.AmbientLight( 0x404040,50 ); // soft white light
scene.add( light );






/////////////////////// RENDER

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
}

animate();