import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from 'three';


export class ModelLoader {
    gltfLoader: GLTFLoader;
    scene: THREE.Scene;
    standardMaterial: THREE.Material;

    constructor(scene: THREE.Scene) {
        this.gltfLoader = new GLTFLoader();
        this.scene = scene;
        this.standardMaterial = new THREE.MeshStandardMaterial({color: new THREE.Color(255, 255, 255)});
    }

    loadEnemy() {
        const enemy = new THREE.Object3D();
        this.loadHead(enemy);
        this.loadHand(enemy, false);
        this.loadHand(enemy, true);
        enemy.rotateY(Math.PI);
        enemy.position.set(0, 2, -3);
        this.scene.add(enemy);
    }

    loadBoat(size, parent?) {
        const url = './resources/models/boat.gltf';
        this.load(url, parent = this.scene, this.adjustBoat, size);
    }

    private load(url: string, parent, changeModel, version?) {
        let object = new THREE.Group();
        this.gltfLoader.load(
            url,
            ( gltf ) => {
                object = gltf.scene;
                parent.add(object);
                changeModel(object, version);
            },
            function ( xhr ) {
                // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            function ( error ) {
                console.log( 'An error happened' + error.message);
            }
        );
    }

    private loadHead(enemy: THREE.Object3D) {
        const url = './resources/models/pirate+hat.glb';
        const geometry = new THREE.SphereGeometry(0.12, 32, 16);
        const sphere = new THREE.Mesh(geometry, this.standardMaterial);
        const head = new THREE.Object3D();

        this.load(url, head, this.adjustHat);
        head.add(sphere);
        head.name = 'playerHead';
        enemy.add(head);
        head.position.set(0,0,0);
    }

    private adjustHat(model: THREE.Group) {
        model.position.set(0,0.06,0);
        model.scale.set(0.1,0.1,0.1);
        model.rotateY(Math.PI);
    }

    private loadHand(enemy: THREE.Object3D, rightHand: boolean) {
        const urlHand = rightHand ? './resources/models/r_hand_skeletal_lowres.gltf' : './resources/models/l_hand_skeletal_lowres.gltf';
        if(rightHand) {
            this.load(urlHand, enemy, this.adjustHand, true);
        } else {
            this.load(urlHand, enemy, this.adjustHand, false);
        }
    }

    private adjustHand(model: THREE.Group, rightHand) {
        // @ts-ignore
        model.traverse((child, i) => {
            if (child.isMesh) {
                child.material = new THREE.MeshLambertMaterial({color: new THREE.Color(255, 255, 255)});
            }
        });

        model.scale.set(0.01, 0.01, 0.01);
        model.rotateY(Math.PI);
        if (rightHand) {
            model.position.set(-2, 0, 0);
            model.name = 'playerHandR';
        } else {
            model.position.set(2, 0, 0);
            model.name = 'playerHandL';
        }
    }

    private adjustBoat(model: THREE.Group, size) {
        // axes before rotation: x:width, y:height, z:length


        model.scale.set(0.75,0.75,0.75);
        model.rotateY(Math.PI/2);
    }
}