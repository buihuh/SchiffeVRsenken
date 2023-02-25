import * as THREE from 'three';
import {Player} from "./player.js";
import {GameState, getStartedField, Match, Players} from "./match.js";

export abstract class GameObject {
    mesh: THREE.Mesh;
    protected intersectionPoint: THREE.Vector3;
    protected scene: THREE.Scene;
    protected objectList: any[];
    protected meshList: any[];

    constructor(geometry: THREE.BufferGeometry, material: THREE.Material, position: THREE.Vector3,
                scene: THREE.Scene, meshList: any[], objectList: any[]) {
        this.scene = scene
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        scene.add(this.mesh);
        meshList.push(this.mesh);
        objectList.push(this);
        this.objectList = objectList;
        this.meshList = meshList;
    }

    /**
     * Triggers when the player presses the Select button while pointing at the object
     */
    onSelectStart() {
    }

    /**
     * Triggers when the player releases the Select button after interacting with the object
     */
    onSelectEnd() {
    }

    /**
     * Triggers when the player presses the Squeeze button while pointing at the object
     */
    onSqueezeStart() {
    }

    /**
     * Triggers when the player releases the Squeeze button after interacting with the object
     */
    onSqueezeEnd() {
    }

    /**
     * Triggers when the player points at the object
     */
    onFocus() {
    }

    /**
     * Triggers when the player no longer points at the object
     */
    onUnfocus() {
        this.intersectionPoint = null;
    }

    /**
     * Removes the object from the scene
     */
    delete() {
        this.scene.remove(this.mesh);
        this.meshList.splice(this.meshList.indexOf(this.mesh), 1)
        this.objectList.splice(this.objectList.indexOf(this), 1)
    }

    onIntersect(intersectPoint: THREE.Vector3) {
        this.intersectionPoint = intersectPoint;
    }
}

class PlayingField extends GameObject {
    private readonly grid: THREE.GridHelper;
    private readonly highlightMesh: THREE.Mesh;

    private ships1;
    private ships2;

    private shipMesh;

    constructor(position: THREE.Vector3, scene: THREE.Scene, meshList: any[], objectList: any[]) {
        super(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide, visible: false
        }), position, scene, meshList, objectList);
        this.mesh.rotateX(-Math.PI / 2);

        this.grid = new THREE.GridHelper(10, 10);
        this.scene.add(this.grid);

        this.highlightMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide
            })
        );
        this.highlightMesh.rotateX(-Math.PI / 2);
        this.highlightMesh.position.set(0.5, 0, 0.5);
        scene.add(this.highlightMesh);

        this.shipMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 4, 2),
            new THREE.MeshBasicMaterial({
                wireframe: true,
                color: 0xFFEA00
            })
        );

        this.ships1 = [];
        this.ships2 = [];
    }

    onFocus() {
        super.onFocus();
        const highlightMaterial = this.highlightMesh.material as THREE.MeshBasicMaterial;
        highlightMaterial.visible = true;
    }

    onUnfocus() {
        super.onUnfocus();
        const highlightMaterial = this.highlightMesh.material as THREE.MeshBasicMaterial;
        highlightMaterial.visible = false;
    }

    onIntersect(intersectPoint: THREE.Vector3) {
        super.onIntersect(intersectPoint);
        const highlightPos = intersectPoint.floor().addScalar(0.5);
        this.highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

        const shipExist = this.ships1.find(function (object) {
            return (object.position.x === highlightPos.x)
                && (object.position.z === highlightPos.z)
        });

        const highlightMaterial = this.highlightMesh.material as THREE.MeshBasicMaterial;
        if (!shipExist)
            highlightMaterial.color.setHex(0xFFFFFF);
        else
            highlightMaterial.color.setHex(0xFF0000);
    }

    onSelectStart() {
        super.onSelectStart();
        const highlightPos = this.highlightMesh.position;
        const objectExist = this.ships1.find(function (object) {
            return (object.position.x === highlightPos.x)
                && (object.position.z === highlightPos.z)
        });

        if (!objectExist) {
            const shipClone = this.shipMesh.clone();
            shipClone.position.copy(highlightPos);
            this.scene.add(shipClone);
            this.ships1.push(shipClone);
            const highlightMaterial = this.highlightMesh.material as THREE.MeshBasicMaterial;
            highlightMaterial.color.setHex(0xFF0000);
        }
    }
}

export class GameTrigger extends GameObject {

    onSelectStart() {
        new PlayingField(new THREE.Vector3(0, 0, 0), this.scene, this.meshList, this.objectList);
        this.delete();
        // const player1 = new Player(1, "Max", 0, true);
        // console.log(player1);
        //
        // const player2 = new Player(2, "Moritz", 0, false);
        // console.log(player2);
        //
        // const field1 = getStartedField();
        // const field2 = getStartedField();
        //
        // field1[0][0].hasShip = true;
        // field1[0][1].hasShip = true;
        // field2[0][0].hasShip = true;
        // field2[1][0].hasShip = true;
        //
        // const match = new Match(player1, player2, Players.Player1, 0, field1, field2);
        //
        // console.log("------------------------------------------")
        //
        // /**
        //  * Round 0
        //  */
        //
        // let result1: string = match.hit(Players.Player1, 0, 0);
        // console.log(result1)
        //
        // const check1 = match.checkState();
        // console.log("State: " + GameState[check1]);
        //
        // console.log("------------------------------------------")
        //
        // match.nextRound();
        //
        // /**
        //  * Round 1
        //  */
        //
        // let result2 = match.hit(Players.Player2, 1, 1);
        // console.log(result2)
        //
        // const check2 = match.checkState();
        // console.log("State: " + GameState[check2]);
        //
        // /**
        //  * Result
        //  */
        //
        // console.log("------------------------------------------")
        // console.log("Player 1:")
        // match.printField(match.fieldPlayer1);
        //
        // console.log("------------------------------------------")
        // console.log("Player 2:")
        // match.printField(match.fieldPlayer2);
    }

    onFocus() {
        const material = this.mesh.material as THREE.MeshLambertMaterial
        material.color = new THREE.Color(255, 255, 0);
    }

    onUnfocus() {
        const material = this.mesh.material as THREE.MeshLambertMaterial
        material.color = new THREE.Color(255, 0, 0);
    }
}