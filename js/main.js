import {VRButton} from 'https://unpkg.com/three@0.146.0//examples/jsm/webxr/VRButton.js';
import {XRControllerModelFactory} from 'https://unpkg.com/three@0.146.0//examples/jsm/webxr/XRControllerModelFactory';
import * as THREE from 'three';

const scene = new THREE.Scene();
const interactableObjects = [];

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor("#0055ff");
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

renderer.xr.enabled = true;
let vrControllers = null;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
});


const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({color: 0xFF0000});
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0, 0, -3);

scene.add(mesh);
interactableObjects.push(mesh);

const light = new THREE.PointLight(0xFFFFFF, 1, 500);
light.position.set(10, 10, 10);

scene.add(light);


//VR-Controllers
function buildControllers() {
    const controllerModelFactory = new XRControllerModelFactory();
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1)
    ]);

    const line = new THREE.Line(geometry);
    line.scale.z = 0;

    const controllers = [];

    for (let i = 0; i < 2; i++) {
        const controller = renderer.xr.getController(i);
        controller.add(line.clone());
        controller.userData.selectPressed = false;
        controller.userData.selectPressedPrev = false;
        controller.userData.squeezePressed = false;
        controller.userData.squeezePressedPrev = false;
        controller.userData.isActiveController = false;
        scene.add(controller);
        controllers.push(controller);

        const grip = renderer.xr.getControllerGrip(i);
        grip.add(controllerModelFactory.createControllerModel(grip));
        scene.add(grip);
    }
    return controllers;
}

function initVRControllers() {
    vrControllers = buildControllers();

    //The this-keyword in the following functions refers to the controller
    function onSelectStart() {
        this.userData.selectPressed = true;
        setActiveController(this);
    }

    function onSelectEnd() {
        this.userData.selectPressed = false;
    }

    function onSqueezeStart() {
        this.userData.squeezePressed = true;
        // setActiveController(this);
    }

    function onSqueezeEnd() {
        this.userData.squeezePressed = false;
    }

    vrControllers.forEach(controller => {
        controller.addEventListener('selectstart', onSelectStart);
        controller.addEventListener('selectend', onSelectEnd);
        controller.addEventListener('squeezestart', onSqueezeStart);
        controller.addEventListener('squeezeend', onSqueezeEnd);
    });
}

let selectedObject = null;
let selectedObjectDistance = null;
let interacting = false;

function setActiveController(controller) {
    if (vrControllers) {
        vrControllers.forEach(vrController => {
            vrController.userData.isActiveController = false;
            vrController.children[0].scale.z = 0;
        });
    }
    controller.userData.isActiveController = true;
}

function handleController(controller) {
    if (!controller.userData.isActiveController) {
        return;
    }
    controller.children[0].scale.z = 10;
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.extractRotation(controller.matrixWorld);
    const raycaster = new THREE.Raycaster();
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(rotationMatrix);
    const intersects = raycaster.intersectObjects(interactableObjects);
    if (intersects.length > 0) {
        controller.children[0].scale.z = intersects[0].distance;
        selectedObject = intersects[0].object;
        selectedObjectDistance = selectedObject.position.distance;
        if (!interacting) {
            selectedObject.material.color = new THREE.Color(255, 255, 0);
        }
    } else {
        controller.children[0].scale.z = 10;
        if (selectedObject) {
            selectedObject.material.color = new THREE.Color(255, 0, 0);
            selectedObject = null;
        }
    }
    //SelectButton
    if (controller.userData.selectPressed) {
        if (!controller.userData.selectPressedPrev && selectedObject && !interacting) {
            //Select is pressed
            selectedObject.material.color = new THREE.Color(0, 255, 0);
            interacting = true;
        } /*else if (selectedObject != null) {
            //Select is held => Drag the cube around
            const moveVector = controller.getWorldDirection(new THREE.Vector3())
                .multiplyScalar(selectedObjectDistance).negate();
            selectedObject.position.copy(controller.position.clone().add(moveVector));
        }*/
    } else if (controller.userData.selectPressedPrev) {
        //Select is released
        interacting = false;
    }
    controller.userData.selectPressedPrev = controller.userData.selectPressed;
    //SqueezeButton
    if (controller.userData.squeezePressed) {
        if (!controller.userData.squeezePressedPrev && selectedObject && !interacting) {
            //Squeeze is pressed
            selectedObject.material.color = new THREE.Color(0, 0, 255);
            interacting = true;
        }
    } else if (controller.userData.squeezePressedPrev) {
        //Squeeze is released
        interacting = false;
    }
    controller.userData.squeezePressedPrev = controller.userData.squeezePressed;
}

initVRControllers();
if (vrControllers.count > 0) {
    setActiveController(vrControllers[0]);
}

//VR animation loop
renderer.setAnimationLoop(function () {
    //Handle Controllers
    if (vrControllers) {
        vrControllers.forEach(controller => {
            handleController(controller);
        });
    }


    //Cube rotation
    // mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
});
//Browser animation loop
const render = function () {
    requestAnimationFrame(render);

    // mesh.rotation.y += 0.01;

    renderer.render(scene, camera);
};

render();
