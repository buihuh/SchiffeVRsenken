import * as THREE from 'three';
import {Player} from "./player.js";
import {GameState, getStartedField, Match, Players} from "./match.js";
import {Field} from "./field.js";

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

    private shipMesh;

    private fieldStatusMeshes;
    private player1: Player;
    private player2: Player;
    private activePlayer: Player;
    private playingField1: Field[][];
    private playingField2: Field[][];
    private gamePhase;

    constructor(position: THREE.Vector3, scene: THREE.Scene, meshList: any[], objectList: any[]) {
        super(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide, visible: false
        }), position, scene, meshList, objectList);
        this.mesh.rotateX(-Math.PI / 2);

        this.grid = new THREE.GridHelper(10, 10);
        this.grid.position.set(position.x, position.y, position.z);
        this.scene.add(this.grid);

        this.highlightMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 4, 2),
            new THREE.MeshBasicMaterial({
                wireframe: true,
                color: 0xFFEA00
            })
        );
        this.highlightMesh.position.set(0.5, 0, 0.5);
        scene.add(this.highlightMesh);

        this.fieldStatusMeshes = [];
        let fieldPositionX = position.x - 5 + 0.5;
        for (let i = 0; i < 10; i++) {
            let fieldPositionZ = position.z - 5 + 0.5;
            const meshRow = []
            for (let j = 0; j < 10; j++) {
                let field = new THREE.Mesh(
                    new THREE.PlaneGeometry(1, 1),
                    new THREE.MeshBasicMaterial({
                        side: THREE.DoubleSide,
                        color: 0xFFFFFF,
                        visible: true
                    })
                );
                field.rotateX(-Math.PI / 2);
                field.position.set(fieldPositionZ, 0, fieldPositionX);
                meshRow.push(field);
                this.scene.add(field);
                fieldPositionZ += 1.0;
            }
            this.fieldStatusMeshes.push(meshRow);
            fieldPositionX += 1.0;
        }

        this.shipMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 4, 2),
            new THREE.MeshBasicMaterial({
                wireframe: true,
                color: 0xFFEA00
            })
        );

        //Game Setup
        this.player1 = new Player(0, "Max");
        this.player2 = new Player(1, "Moritz");

        this.playingField1 = getStartedField();
        this.playingField2 = getStartedField();

        this.activePlayer = this.player1;
        this.gamePhase = "setup"

    }

    private showOwnPlayingFieldStatus(playingField: Field[][]) {
        for (let i = 0; i < playingField.length; i++) {
            for (let j = 0; j < playingField[i].length; j++) {
                const statusMesh = this.fieldStatusMeshes[j][i];
                const material = statusMesh.material as THREE.MeshBasicMaterial;
                console.log("(" + i + "," + j + "): " + playingField[i][j].hasShip)
                if (playingField[i][j].hasShip) {
                    material.color.setHex(0x00FF00);
                } else {
                    material.color.setHex(0xFFFFFF);
                }
                statusMesh.material;
            }
        }
    }

    private showTargetPlayingFieldStatus(enemyPlayingField: Field[][]) {
        for (let i = 0; i < enemyPlayingField.length; i++) {
            for (let j = 0; j < enemyPlayingField[i].length; j++) {
                if (enemyPlayingField[i][j].hasShip) {

                }
            }
        }
    }

    private getHighlightedGridPosition() {
        let highlightPosX = this.mesh.position.x + 5 + this.highlightMesh.position.x;
        let highlightPosZ = this.mesh.position.z + 5 + this.highlightMesh.position.z;

        return [Math.floor(highlightPosX), Math.floor(highlightPosZ)]
    }

    private update() {
        this.showOwnPlayingFieldStatus(this.playingField1);
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

        // const shipExist = this.ships1.find(function (object) {
        //     return (object.position.x === highlightPos.x)
        //         && (object.position.z === highlightPos.z)
        // });
        //
        // const highlightMaterial = this.highlightMesh.material as THREE.MeshBasicMaterial;
        // if (!shipExist)
        //     highlightMaterial.color.setHex(0xFFFFFF);
        // else
        //     highlightMaterial.color.setHex(0xFF0000);
    }

    onSelectStart() {
        super.onSelectStart();
        const highlightPos = this.getHighlightedGridPosition();
        console.log("Select on " + Math.floor(highlightPos[0]) + "," + Math.floor(highlightPos[1]));
        const currentField = this.playingField1[highlightPos[0]][highlightPos[1]];

        switch (this.gamePhase) {
            case "setup":
                //TODO setup code here
                currentField.hasShip = !currentField.hasShip;
                break;
        }
        this.update()
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