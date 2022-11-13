import {VRButton} from 'https://unpkg.com/three@0.146.0//examples/jsm/webxr/VRButton.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setClearColor("#e5e5e5");
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

renderer.xr.enabled = true;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;

    camera.updateProjectionMatrix();
})


const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({color: 0xFFCC00});
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

const light = new THREE.PointLight(0xFFFFFF, 1, 500);
light.position.set(10, 10, 25);

scene.add(light);

//VR
renderer.setAnimationLoop(function(){
    renderer.render(scene, camera);
    mesh.rotation.y += 0.01;
})
//Browser
const render = function() {
    requestAnimationFrame(render);

    mesh.rotation.y += 0.01;

    renderer.render(scene, camera);
}

render();
