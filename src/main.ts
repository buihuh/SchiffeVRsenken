import {VRButton} from 'three/examples/jsm/webxr/VRButton.js';
import {XRControllerModelFactory} from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import * as THREE from 'three';
import * as GAME from "./game/gameobjects.js";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {Text3D} from './game/text3D.js';

THREE.Cache.enabled = true;

const gameTitleText = "SchiffeVRsenken".toUpperCase();
const createGameText = "Create Game".toUpperCase();
const joinGameText = "Join Game".toUpperCase();

const scene = new THREE.Scene();
const meshesInScene = [];
const gameObjects = [];

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let player = new THREE.Group();
player.add(camera);

/**
 * START LIGHTING & BACKGROUND
 */

scene.background = new THREE.Color( 0x0055ff );
scene.fog = new THREE.Fog( 0x0055ff, 10, 40 );

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry( 1000, 1000 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.4, transparent: true } )
);
plane.rotation.x = - Math.PI / 2;
plane.position.y = -1.1
scene.add( plane );

const dirLight = new THREE.DirectionalLight( 0xffffff, 0.8);
dirLight.position.set( 1, 4, 1 ).normalize();
scene.add( dirLight );

const pointLight = new THREE.PointLight( 0xffffff);
pointLight.distance = 10
pointLight.intensity = 1
pointLight.power = 20
pointLight.color.setHex(0xffffff)
pointLight.position.set( 0, 3, 10 ).normalize();
scene.add( pointLight );

/**
 * END LIGHTING & BACKGROUND
 */

const renderer = new THREE.WebGLRenderer({antialias: true});
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

const hostTrigger = new GAME.HostTrigger(new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({color: 0xFF3232}),
    new THREE.Vector3(2, 2, -3), scene, meshesInScene, gameObjects);

const guestTrigger = new GAME.GuestTrigger(new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({color: 0x3232FF}),
    new THREE.Vector3(-2, 2, -3), scene, meshesInScene, gameObjects);


/**
 * Start Table
 */

addTable()

function addTable(){
    const geometry = new THREE.BoxGeometry(11, 0.7, 11);
    const material = new THREE.MeshPhongMaterial ({color: 0xffffff, specular: 0xffffff });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, -0.3501, 0);
    scene.add(cube);
}

/**
 * End Table
 */

/**
 * Start Title
 */

loadTextObjects();

let centerText: Text3D;
let leftText: Text3D;
let rightText: Text3D;

function textCallback() {
    console.log("1");
}
function textCallback2() {
    console.log("2");
}

function loadTextObjects() {
    const loader = new FontLoader();
    // loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function (font) {
        centerText = new Text3D(new THREE.Vector3(0, 3, 0), scene, meshesInScene, gameObjects, gameTitleText, font, undefined, undefined, textCallback);
        let rotationLeft = new THREE.Vector3(0, Math.PI / 2, 0);
        let rotationRight = new THREE.Vector3(0, -Math.PI / 2, 0);
        leftText = new Text3D(new THREE.Vector3(-5, 1, 0), scene, meshesInScene, gameObjects, createGameText, font, undefined, rotationLeft);
        rightText = new Text3D(new THREE.Vector3(5, 1, 0), scene, meshesInScene, gameObjects, joinGameText, font, undefined, rotationRight);
    });
}

/**
 * End Title
 */

function getGameObjectFromMesh(mesh): GAME.GameObject {
    if (!mesh) return null;

    for (const object of gameObjects) {
        if (object instanceof GAME.GameObject && object.mesh === mesh) return object;
    }

    return null;
}

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
    const rayCaster = new THREE.Raycaster();
    rayCaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    rayCaster.ray.direction.set(0, 0, -1).applyMatrix4(rotationMatrix);
    const intersects = rayCaster.intersectObjects(meshesInScene);
    if (intersects.length > 0) {
        //Controller points at something
        controller.children[0].scale.z = intersects[0].distance;
        let foundGameObject = getGameObjectFromMesh(intersects[0].object);
        if (selectedGameObject && selectedGameObject != foundGameObject) {
            selectedGameObject.onUnfocus();
        }
        selectedGameObject = foundGameObject;
        if (selectedGameObject) {
            if (!interacting){
                selectedGameObject.onFocus();
            }
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

let counter = 0;

initVRControllers();
player.position.set(0, 2, 7);
scene.add(player);
if (vrControllers[0]) {
    setActiveController(vrControllers[0]);
}

let framecount = 0;
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
        // if(framecount % 10 == 0) {
            hostTrigger.playingField.updatePlayerData(vrControllers, camera);
        // }
        if (guestTrigger)
            (guestTrigger.mesh.material as THREE.MeshLambertMaterial).visible = false;
    }

    if (guestTrigger.playingField) {
        guestTrigger.playingField.update();
        // if(framecount % 10 == 0) {
            guestTrigger.playingField.updatePlayerData(vrControllers, camera);
        // }
        if (hostTrigger)
            (hostTrigger.mesh.material as THREE.MeshLambertMaterial).visible = false;
    }
    centerText.setCallback(textCallback2);
    centerText.mesh.rotation.y += 0.004;
    renderer.render(scene, camera);
    framecount++;
});
//Browser animation loop
const render = function () {
    requestAnimationFrame(render);
    centerText.mesh.rotation.y += 0.004;
    renderer.render(scene, camera);
};

render();
