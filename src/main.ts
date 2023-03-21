import {VRButton} from 'three/examples/jsm/webxr/VRButton.js';
import {XRControllerModelFactory} from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import * as THREE from 'three';
import * as GAME from "./game/gameobjects.js";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as TextTest from './game/text.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const meshesInScene = [];
const gameObjects = [];

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let player = new THREE.Group();
player.add(camera);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor("#0055ff");
renderer.setSize(window.innerWidth, window.innerHeight);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();


document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

renderer.xr.enabled = true;
let vrControllers = null;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
});

const light = new THREE.PointLight(0xFFFFFF, 1, 500);
light.position.set(10, 10, 10);

scene.add(light);

//<editor-fold desc="GameObjects">
//--------------------------------
//  GameObjects
//--------------------------------

const hostTrigger = new GAME.HostTrigger(new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({color: 0xFF3232}),
    new THREE.Vector3(2, 2, -3), scene, meshesInScene, gameObjects);

const guestTrigger = new GAME.GuestTrigger(new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({color: 0x3232FF}),
    new THREE.Vector3(-2, 2, -3), scene, meshesInScene, gameObjects);


//</editor-fold>

/**
 * TODO: start Test Text
 */

const text = new TextTest.TextTest("This is a test!");

/**
 * TODO: end Test Text
 */

function getGameObjectFromMesh(mesh): GAME.GameObject {
    if (!mesh) return null;

    for (const object of gameObjects) {
        if (object instanceof GAME.GameObject && object.mesh === mesh) return object;
    }

    return null;
}

/*
 * TODO: start test load model
 */

const gltfLoader = new GLTFLoader();
const url = './resources/models/boat.gltf';
const boat = new THREE.Object3D();

// Load a glTF resource
gltfLoader.load(
    url,
    function ( gltf ) {
        boat.add(gltf.scene);
        scene.add(boat);
    },
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
        console.log( 'An error happened' + error.message);
    }
);

/*
 * TODO: end test load model
 */


/*
 * TODO: start test load player model
 */
const geometry = new THREE.SphereGeometry( 0.5, 32, 16 );
const material = new THREE.MeshLambertMaterial({color: new THREE.Color(255, 0, 0)});
const sphere = new THREE.Mesh( geometry, material );
sphere.position.set(camera.position.x, camera.position.y, camera.position.z+10);
scene.add( sphere );

const urlhand_r = './resources/models/r_hand_skeletal_lowres.gltf';
const urlhand_l = './resources/models/l_hand_skeletal_lowres.gltf';

gltfLoader.load(
    urlhand_r,
    function ( gltf ) {
        let hand_r = gltf.scene;

        // @ts-ignore
        hand_r.traverse((child, i) => {
            if (child.isMesh) {
                child.material = material;
            }
        });
        hand_r.scale.set(0.05, 0.05, 0.05)
        hand_r.position.set(camera.position.x-2, camera.position.y-2, camera.position.z+10);
        scene.add(hand_r);
    },
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded r hand' );
    },
    function ( error ) {
        console.log( 'An error happened' + error.message);
    }
);

gltfLoader.load(
    urlhand_l,
    function ( gltf ) {
        let hand_l = gltf.scene;
        // @ts-ignore
        hand_l.traverse((child, i) => {
            if (child.isMesh) {
                child.material = material;
            }
        });
        hand_l.scale.set(0.05, 0.05, 0.05)
        hand_l.position.set(camera.position.x+2, camera.position.y-2, camera.position.z+10);
        scene.add(hand_l);
    },
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded l hand' );
    },
    function ( error ) {
        console.log( 'An error happened' + error.message);
    }
);

/*
 * TODO: end test load player model
 */

//VR-Controllers
function buildControllers() {
    const controllerModelFactory = new XRControllerModelFactory();
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1)
    ]);

    const material = new THREE.LineBasicMaterial({
        color: "#ff4c7c"
    });
    const line = new THREE.Line(geometry, material);
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
        player.add(controller);
        controllers.push(controller);

        const grip = renderer.xr.getControllerGrip(i);
        grip.add(controllerModelFactory.createControllerModel(grip));
        player.add(grip);
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

let selectedGameObject = null;
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
    const intersects = raycaster.intersectObjects(meshesInScene);
    if (intersects.length > 0) {
        //Controller points at something
        controller.children[0].scale.z = intersects[0].distance;
        let foundGameObject = getGameObjectFromMesh(intersects[0].object);
        if (selectedGameObject && selectedGameObject != foundGameObject) {
            selectedGameObject.onUnfocus();
        }
        selectedGameObject = foundGameObject;
        if (selectedGameObject) {
            if (!interacting)
                selectedGameObject.onFocus();

            selectedGameObject.onIntersect(new THREE.Vector3().copy(intersects[0].point));
        }
    } else {
        //Controller is not pointing at an object
        controller.children[0].scale.z = 10;
        if (selectedGameObject) {
            selectedGameObject.onUnfocus();
            selectedGameObject = null;
        }
    }
    //SelectButton
    if (controller.userData.selectPressed) {
        if (!controller.userData.selectPressedPrev && selectedGameObject && !interacting) {
            //Select is pressed
            selectedGameObject.onSelectStart();
            interacting = true;
        }
    } else if (controller.userData.selectPressedPrev) {
        //Select is released
        if (selectedGameObject) {
            selectedGameObject.onSelectEnd();
        }
        interacting = false;
    }
    controller.userData.selectPressedPrev = controller.userData.selectPressed;
    //SqueezeButton
    if (controller.userData.squeezePressed) {
        if (!controller.userData.squeezePressedPrev && selectedGameObject && !interacting) {
            //Squeeze is pressed
            selectedGameObject.onSqueezeStart();
            interacting = true;
        }
    } else if (controller.userData.squeezePressedPrev) {
        //Squeeze is released
        if (selectedGameObject) {
            selectedGameObject.onSqueezeEnd();
        }
        interacting = false;
    }
    controller.userData.squeezePressedPrev = controller.userData.squeezePressed;
}

initVRControllers();
player.position.set(0, 5, 15);
scene.add(player);
if (vrControllers[0]) {
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

    if (hostTrigger.playingField) {
        hostTrigger.playingField.update();
        if (guestTrigger)
            (guestTrigger.mesh.material as THREE.MeshLambertMaterial).visible = false;
    }

    if (guestTrigger.playingField) {
        guestTrigger.playingField.update();

        if (hostTrigger)
            (hostTrigger.mesh.material as THREE.MeshLambertMaterial).visible = false;
    }

    /*scene.remove(text.planeMesh);
    text.refreshText();
    scene.add(text.planeMesh);*/

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
