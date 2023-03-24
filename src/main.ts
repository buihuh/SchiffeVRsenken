import {VRButton} from 'three/examples/jsm/webxr/VRButton.js';
import {XRControllerModelFactory} from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import * as THREE from 'three';
import * as GAME from "./game/gameobjects.js";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {Text3D} from './game/text3D.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {Water} from 'three/examples/jsm/objects/Water.js';
import {Sky} from 'three/examples/jsm/objects/Sky.js';


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

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.toneMapping = THREE.ACESFilmicToneMapping;

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

/**
 * START Options
 */

let rotateCenterText = false;

/**
 * END Options
 */

/**
 * Water
 */

let water;

function initWater() {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('resources/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    water.position.setY(-1);
    water.rotation.x = -Math.PI / 2;
}

initWater();
scene.add( water );


/**
 * Sky
 */

let sun = new THREE.Vector3();

function initSky() {

    let sky = new Sky();
    sky.scale.setScalar( 10000 );
    scene.add( sky );

    const skyUniforms = sky.material.uniforms;

    skyUniforms[ 'turbidity' ].value = 10;
    skyUniforms[ 'rayleigh' ].value = 2;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;

    const parameters = {
        elevation: 2.5,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    let renderTarget;

    function updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);
        sun.setFromSphericalCoords(1, phi, theta);
        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();
        if (renderTarget !== undefined) renderTarget.dispose();
        renderTarget = pmremGenerator.fromScene(sky as any);
        scene.environment = renderTarget.texture;
    }
    updateSun();
}

initSky();

/**
 * START LIGHTING & BACKGROUND
 */

// const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
// dirLight.position.set(1, 4, 1).normalize();
// scene.add(dirLight);
//
// const pointLight = new THREE.PointLight(0xffffff);
// pointLight.distance = 20
// pointLight.intensity = 1
// pointLight.power = 12
// pointLight.color.setHex(0xffffff)
// pointLight.position.set(0, 2, 6);
// scene.add(pointLight);
//
// const ambientLight = new THREE.AmbientLight( 0xeb349b, .05 );
// scene.add( ambientLight );

/**
 * END LIGHTING & BACKGROUND
 */

const playingField = new GAME.PlayingField(new THREE.Vector3(0, 0, 0), scene, meshesInScene, gameObjects);

/**
 * Start Table
 */

addTable()

function addTable() {
    const geometry = new THREE.BoxGeometry(11, 0.7, 11);
    const material = new THREE.MeshStandardMaterial( { roughness: 0 } );
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, -0.351, 0);
    scene.add(cube);
}

/**
 * End Table
 */

function hostGameStart(playingField: GAME.PlayingField) {
    rotateCenterText = false;
    if(centerText){
        centerText.mesh.rotation.set(0, 0, 0);
    }
    playingField.startMatch('6666');
    rightText.setCallback(null);
    leftText.setCallback(null);
    (rightText.mesh.material as THREE.MeshStandardMaterial).visible = false;
    (leftText.mesh.material as THREE.MeshStandardMaterial).visible = false;
    centerText.setText("PLACE SHIPS");
}

function guestGameStart(playingField: GAME.PlayingField) {
    rotateCenterText = false;
    if(centerText){
        centerText.mesh.rotation.set(0, 0, 0);
    }
    playingField.startMatch('6666', false);
    rightText.setCallback(null);
    leftText.setCallback(null);
    (rightText.mesh.material as THREE.MeshStandardMaterial).visible = false;
    (leftText.mesh.material as THREE.MeshStandardMaterial).visible = false;
    centerText.setText("PLACE SHIPS");
}

function nextTurn(playingField: GAME.PlayingField) {
    playingField.nextTurn();
    centerText.setCallback(null);
}

/**
 * Start Text Objects
 */

loadTextObjects();

let centerText: Text3D;
let leftText: Text3D;
let rightText: Text3D;

function loadTextObjects() {
    const loader = new FontLoader();

    loader.load('./resources/helvetiker_bold.typeface.json', function (font) {
        centerText = new Text3D(new THREE.Vector3(0, 3, 0), scene, meshesInScene, gameObjects, gameTitleText, font, 1, undefined, null);
        let rotationLeft = new THREE.Vector3(0, Math.PI / 2, 0);
        let rotationRight = new THREE.Vector3(0, -Math.PI / 2, 0);
        leftText = new Text3D(new THREE.Vector3(-5, 1, 0), scene, meshesInScene, gameObjects, createGameText, font,
            1, rotationLeft, function () {
                hostGameStart(playingField)
            });
        rightText = new Text3D(new THREE.Vector3(5, 1, 0), scene, meshesInScene, gameObjects, joinGameText, font,
            1, rotationRight, function () {
                guestGameStart(playingField)
            });
    });
}

/**
 * End Text Objects
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
const boat1 = new THREE.Object3D();
const boat2 = new THREE.Object3D();
boat1.position.setX(12);
boat1.position.setY(-0.90);

boat2.position.setX(-12);
boat2.position.setY(-0.90);
boat2.rotation.set(0,Math.PI,0)

const boatSpinning = new THREE.Object3D();
boatSpinning.add(boat1);
boatSpinning.add(boat2);
scene.add(boatSpinning)

gltfLoader.load(
    url,
    function (gltf) {
        boat1.add(gltf.scene);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.log('An error happened' + error.message);
    }
);

gltfLoader.load(
    url,
    function (gltf) {
        boat2.add(gltf.scene);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.log('An error happened' + error.message);
    }
);

/*
 * TODO: end test load model
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
            if (!interacting) {
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

initVRControllers();
player.position.set(0, 2, 7);
scene.add(player);
if (vrControllers[0]) {
    setActiveController(vrControllers[0]);
}

let whosTurn = null;
//VR animation loop
renderer.setAnimationLoop(function () {
    //Handle Controllers
    if (vrControllers) {
        vrControllers.forEach(controller => {
            handleController(controller);
        });
    }
    if (playingField.gameStarted) {
        playingField.update();

        if (playingField.finished) {
            (leftText.mesh.material as THREE.MeshStandardMaterial).visible = false;
            (rightText.mesh.material as THREE.MeshStandardMaterial).visible = false;
            let endText = playingField.winner == playingField.activePlayer ? "YOU WIN!" : "YOU LOSE!";
            (centerText.mesh.material as THREE.MeshStandardMaterial).visible = true;
            centerText.setText(endText);
        } else {

            if (playingField.gamePhase == "running") {
                if (playingField.match.attacker != whosTurn) {
                    whosTurn = playingField.match.attacker;
                    (leftText.mesh.material as THREE.MeshStandardMaterial).visible = true;
                    leftText.setText("Player " + (whosTurn + 1).toString() + "'s turn");
                }
            }

            if (playingField.waiting) {
                if (centerText.text != "WAITING") {
                    centerText.setText("WAITING");
                    (centerText.mesh.material as THREE.MeshStandardMaterial).visible = true;
                }
            } else if (playingField.gamePhase != "setup" && !playingField.doneHitting) {
                (centerText.mesh.material as THREE.MeshStandardMaterial).visible = false;
            }

            if (playingField.doneHitting && !centerText.callbackFunction) {
                centerText.setCallback(function () {
                    nextTurn(playingField)
                });
                centerText.setText("CONFIRM");
                (centerText.mesh.material as THREE.MeshStandardMaterial).visible = true;
            }
        }
    }

    if (rotateCenterText && centerText) {
        centerText.mesh.rotation.y += 0.004;
    }
    if (boat1 && boat2) {
        boatSpinning.rotation.y -= 0.003;
    }
    water.material.uniforms['time'].value += 1.0 / 200.0;
    renderer.render(scene, camera);
});

//Browser animation loop
const render = function () {
    requestAnimationFrame(render);
    if (rotateCenterText && centerText) {
        centerText.mesh.rotation.y += 0.004;
    }
    if (boat1 && boat2) {
        boatSpinning.rotation.y -= 0.003;
    }
    renderer.render(scene, camera);
    water.material.uniforms['time'].value += 1.0 / 200.0;
};

render();
