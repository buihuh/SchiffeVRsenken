// noinspection JSUnusedLocalSymbols

import * as FB from "../firebase/firebase.js";
import * as THREE from 'three';
import {Player} from "./player.js";
import {GameState, getStartedField, Match, Players} from "./match.js";
import {Field} from "./field.js";
import {ModelLoader} from "./modelLoader.js";

export abstract class GameObject {
    mesh: THREE.Mesh;
    protected intersectionPoint: THREE.Vector3;
    protected scene: THREE.Scene;
    protected objectList: any[];
    protected meshList: any[];

    constructor(geometry: THREE.BufferGeometry, material: THREE.Material, position: THREE.Vector3, scene: THREE.Scene, meshList: any[], objectList: any[], rotation: THREE.Vector3 = null) {
        this.scene = scene;
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        if (rotation) {
            this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        }
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
        this.meshList.splice(this.meshList.indexOf(this.mesh), 1);
        this.objectList.splice(this.objectList.indexOf(this), 1);
    }

    onIntersect(intersectPoint: THREE.Vector3) {
        this.intersectionPoint = intersectPoint;
    }
}

export class PlayingField extends GameObject {
    activePlayer: Players;
    gamePhase;
    match: Match;
    waiting = false;
    public winner;
    public finished = false;
    public gameStarted = false;
    doneHitting = false;
    private readonly grid: THREE.GridHelper;
    private readonly highlightMesh: THREE.Mesh;
    private setShipMeshes;
    private shipMesh;
    private fieldStatusMeshes;
    private shipCounter = 0;
    private setShipHorizontal = true;
    private shipSize = 1;
    private firebase;
    private setupField: Field[][];
    private matchID: string;

    constructor(position: THREE.Vector3, scene: THREE.Scene, meshList: any[], objectList: any[]) {
        super(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide, visible: false
        }), position, scene, meshList, objectList);
        this.mesh.rotateX(-Math.PI / 2);

        this.grid = new THREE.GridHelper(10, 10, new THREE.Color(0xffffff), new THREE.Color(0xffffff));
        this.grid.position.set(position.x, position.y, position.z);
        // this.grid.material = new THREE.MeshStandardMaterial({roughness:1});
        this.scene.add(this.grid);

        this.highlightMesh = new THREE.Mesh(new THREE.SphereGeometry(0.4, 4, 2), new THREE.MeshBasicMaterial({
            wireframe: true, wireframeLinewidth: 3, color: 0xFFEA00
        }));
        this.highlightMesh.position.set(0.5, 0, 0.5);
        scene.add(this.highlightMesh);

        this.setShipMeshes = [];
        this.setShipMeshes.push(this.highlightMesh);
        for (let i = 1; i < 4; i++) {
            const setShipMesh = new THREE.Mesh(new THREE.SphereGeometry(0.4, 4, 2), new THREE.MeshBasicMaterial({
                wireframe: true, wireframeLinewidth: 3, color: 0xFFEA00, visible: false
            }));
            scene.add(setShipMesh);
            this.setShipMeshes.push(setShipMesh);
        }

        this.fieldStatusMeshes = [];
        let fieldPositionX = position.x - 5 + 0.5;
        for (let i = 0; i < 10; i++) {
            let fieldPositionZ = position.z - 5 + 0.5;
            const meshRow = [];
            for (let j = 0; j < 10; j++) {
                let field = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({
                    side: THREE.DoubleSide, roughness: 0.1, visible: true
                }));
                field.rotateX(-Math.PI / 2);
                field.position.set(fieldPositionZ, 0, fieldPositionX);
                meshRow.push(field);
                this.scene.add(field);
                fieldPositionZ += 1.0;
            }
            this.fieldStatusMeshes.push(meshRow);
            fieldPositionX += 1.0;
        }

        this.shipMesh = new THREE.Mesh(new THREE.SphereGeometry(0.4, 4, 2), new THREE.MeshBasicMaterial({
            wireframe: true, wireframeLinewidth: 3, color: 0xFFEA00
        }));
    }

    startMatch(matchID: string, host: boolean = true) {
        //Game Setup
        this.firebase = new FB.Firebase();
        let player1 = new Player(0, "Max");
        let player2 = new Player(1, "Moritz");

        let playingField1 = getStartedField();
        let playingField2 = getStartedField();

        this.setupField = getStartedField();
        this.gamePhase = "setup";
        this.match = new Match(player1, player2, null, 0, playingField1, playingField2);
        if (host) {
            this.activePlayer = Players.Player1;
            player1.isHost = true;
            this.firebase.createGame(this.match, matchID)
                .then(res => {
                    console.log('match created');
                    this.firebase.listenMatch(res, this.match);
                }).catch(err => {
                console.log('something went wrong ' + err);
            });
            console.log("Player 1 initialized");
        } else {
            this.activePlayer = Players.Player2;
            this.firebase.listenMatch(matchID, this.match);
            console.log("Player 2 initialized");
        }

        this.matchID = matchID;
        this.gameStarted = true;
        const modelLoader = new ModelLoader(this.scene);
        modelLoader.loadEnemy();
        console.log(this.scene);
    }

    update() {
        //Check if match is over
        if (!this.match.hasEmptyField() && this.gamePhase == "running" && this.match.checkState() == GameState.GameOver) {
            this.finished = true;
            this.winner = this.match.winner;
            console.log(this.winner + " won");
            return;
        }
        //Check if players have set up
        if (this.gamePhase == "setup" && this.match.player1Ready && this.match.player2Ready) {
            this.waiting = false;
            switch (this.activePlayer) {
                case Players.Player1:
                    this.match.fieldPlayer1 = this.setupField;
                    break;
                case Players.Player2:
                    this.match.fieldPlayer2 = this.setupField;
                    break;
            }
            this.firebase.updateMatch(this.matchID, this.match).then(res => {
                console.log('match updated');
            }).catch(err => {
                console.log('something went wrong ' + err);
            });
            this.gamePhase = "running";
            this.highlightMesh.visible = true;
            for (let i = 1; i < this.setShipMeshes.length; i++) {
                (this.setShipMeshes[i].material as THREE.MeshStandardMaterial).visible = false;
            }
            (this.highlightMesh.material as THREE.MeshBasicMaterial).color.setHex(0xFFEA00);
        }

        switch (this.gamePhase) {
            //this is needed as long we only have one grid
            case "setup":
                this.showOwnPlayingFieldStatus(this.setupField);
                break;
            case "running":
                if (this.match.attacker == this.activePlayer) {
                    this.waiting = false;
                    this.showTargetPlayingFieldStatus(this.getActivePlayingField());
                } else {
                    this.waiting = true;
                    this.showOwnPlayingFieldStatus(this.getOwnPlayingField());
                }
                break;
        }
    }

    nextTurn() {
        this.match.nextRound();
        this.doneHitting = false;

        this.waiting = !(this.match.attacker == this.activePlayer);

        this.firebase.updateMatch(this.matchID, this.match).then(res => {
            console.log('match updated');
        }).catch(err => {
            console.log('something went wrong ' + err);
        });

        console.log("Player 1 Field");
        this.match.printField(this.match.fieldPlayer1);
        console.log("Player 2 Field");
        this.match.printField(this.match.fieldPlayer2);
        console.log(this.match.attacker + "'s turn!");
    }

    updatePlayerData(vrControllers: any, camera: THREE.PerspectiveCamera) {

        let player = this.activePlayer == Players.Player1 ? this.match.player1 : this.match.player2;

        player.position = [camera.position.x, camera.position.y, camera.position.z];
        player.rotation = [camera.rotation.x, camera.rotation.y, camera.rotation.z];
        player.controllerRightPosition = [vrControllers[0].position.x, vrControllers[0].position.y, vrControllers[0].position.z];
        player.controllerRightRotation = [vrControllers[0].rotation.x, vrControllers[0].rotation.y, vrControllers[0].rotation.z];
        player.controllerLeftPosition = [vrControllers[1].position.x, vrControllers[1].position.y, vrControllers[1].position.z];
        player.controllerLeftRotation = [vrControllers[1].rotation.x, vrControllers[1].rotation.y, vrControllers[1].rotation.z];

        // this.firebase.updatePlayerPosition('0000', player).then(res => {
        //     // console.log('player updated')
        this.updateEnemyPosition();
        // }).catch(err => {
        //     console.log('something went wrong ' + err)
        // });

    }

    onFocus() {
        super.onFocus();
        const highlightMaterial = this.highlightMesh.material as THREE.MeshStandardMaterial;
        highlightMaterial.visible = true;
    }

    onUnfocus() {
        super.onUnfocus();
        const highlightMaterial = this.highlightMesh.material as THREE.MeshStandardMaterial;
        highlightMaterial.visible = false;
    }

    onIntersect(intersectPoint: THREE.Vector3) {
        super.onIntersect(intersectPoint);
        const highlightPos = intersectPoint.floor().addScalar(0.5);

        this.highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

        if (this.gamePhase == "setup") {
            switch (this.shipCounter) {
                case 4:
                    this.shipSize = 2;
                    break;
                case 7:
                    this.shipSize = 3;
                    break;
                case 9:
                    this.shipSize = 4;
                    break;
                default:
                    break;
            }

            const gridPos = this.getHighlightedGridPosition();
            const placeable = this.checkShipPlacement(gridPos[0], gridPos[1], this.setShipHorizontal, this.shipSize, this.setupField);

            for (let i = 0; i < this.shipSize; i++) {
                (this.setShipMeshes[i].material as THREE.MeshStandardMaterial).visible = true;

                if (this.setShipHorizontal) {
                    this.setShipMeshes[i].position.set(highlightPos.x + i, 0, highlightPos.z);
                } else {
                    this.setShipMeshes[i].position.set(highlightPos.x, 0, highlightPos.z + i);
                }

                if (placeable) {
                    (this.setShipMeshes[i].material as THREE.MeshStandardMaterial).color.setHex(0xFFEA00);
                } else {
                    (this.setShipMeshes[i].material as THREE.MeshStandardMaterial).color.setHex(0xFF0000);
                }
            }
        }
    }

    onSelectStart() {
        super.onSelectStart();
        const highlightPos = this.getHighlightedGridPosition();

        switch (this.gamePhase) {
            case "setup":
                this.setShip(highlightPos[0], highlightPos[1], this.setupField);
                break;
            case "running":
                if (this.activePlayer == this.match.attacker && !this.doneHitting) {
                    if (this.match.hit(this.match.attacker, highlightPos[1], highlightPos[0]) == "No Target!") this.doneHitting = true;

                    this.firebase.updateMatch(this.matchID, this.match).then(res => {
                        console.log('match updated');
                    }).catch(err => {
                        console.log('something went wrong ' + err);
                    });
                }
                break;
            default:
                break;
        }
    }

    onSqueezeStart() {
        if (this.gamePhase == "setup") {
            this.setShipHorizontal = !this.setShipHorizontal;
        }
    }

    private showOwnPlayingFieldStatus(playingField: Field[][]) {
        for (let i = 0; i < playingField.length; i++) {
            for (let j = 0; j < playingField[i].length; j++) {
                const statusMesh = this.fieldStatusMeshes[j][i];
                const material = statusMesh.material as THREE.MeshStandardMaterial;
                if (playingField[i][j].hasShip) {
                    if (playingField[i][j].isHit) material.color.setHex(0xFF0000); else material.color.setHex(0x00FF00);
                } else {
                    if (playingField[i][j].isHit) material.color.setHex(0x0000FF); else material.color.setHex(0xFFFFFF);
                }
                statusMesh.material;
            }
        }
    }

    private showTargetPlayingFieldStatus(enemyPlayingField: Field[][]) {
        for (let i = 0; i < enemyPlayingField.length; i++) {
            for (let j = 0; j < enemyPlayingField[i].length; j++) {
                const statusMesh = this.fieldStatusMeshes[j][i];
                const material = statusMesh.material as THREE.MeshStandardMaterial;
                if (!enemyPlayingField[i][j].isHit) {
                    material.color.setHex(0xFFFFFF);
                    continue;
                }
                if (enemyPlayingField[i][j].hasShip) {
                    material.color.setHex(0xFF0000);
                } else {
                    material.color.setHex(0x0000FF);
                }
            }
        }
    }

    private getHighlightedGridPosition() {
        let highlightPosX = this.mesh.position.x + 5 + this.highlightMesh.position.x;
        let highlightPosZ = this.mesh.position.z + 5 + this.highlightMesh.position.z;

        return [Math.floor(highlightPosX), Math.floor(highlightPosZ)];
    }

    private getActivePlayingField() {
        switch (this.match.attacker) {
            case Players.Player1:
                return this.match.fieldPlayer2;
            case Players.Player2:
                return this.match.fieldPlayer1;
        }
    }

    private getOwnPlayingField() {
        switch (this.activePlayer) {
            case Players.Player1:
                return this.match.fieldPlayer1;
            case Players.Player2:
                return this.match.fieldPlayer2;
        }
    }

    private checkShipPlacement(posX: number, posY: number, horizontal: boolean, shipSize: number, playingField: Field[][]) {
        // check if ship is completely on playing field
        if ((horizontal && posX + shipSize > 10) || (!horizontal && posY + shipSize > 10)) return false;

        // check if placing ship directly onto another ship
        if (playingField[posX][posY].hasShip) return false;

        // check if one of the ship tiles is adjacent to another ship
        for (let i = 0; i < shipSize; i++) {
            let hasShip = false;
            if (horizontal) {
                if (posX + i - 1 >= 0) {
                    hasShip = hasShip || playingField[posX + i - 1][posY].hasShip;
                    if (posY > 0) {
                        hasShip = hasShip || playingField[posX + i - 1][posY - 1].hasShip;
                    }
                    if (posY < 9) {
                        hasShip = hasShip || playingField[posX + i - 1][posY + 1].hasShip;
                    }
                }
                if (posX + i + 1 < 10) {
                    hasShip = hasShip || playingField[posX + i + 1][posY].hasShip;
                    if (posY > 0) {
                        hasShip = hasShip || playingField[posX + i + 1][posY - 1].hasShip;
                    }
                    if (posY < 9) {
                        hasShip = hasShip || playingField[posX + i + 1][posY + 1].hasShip;
                    }
                }
                if (posY > 0) {
                    hasShip = hasShip || playingField[posX + i][posY - 1].hasShip;
                }
                if (posY < 9) {
                    hasShip = hasShip || playingField[posX + i][posY + 1].hasShip;
                }
            } else {
                if (posY + i - 1 >= 0) {
                    hasShip = hasShip || playingField[posX][posY + i - 1].hasShip;
                    if (posX > 0) {
                        hasShip = hasShip || playingField[posX - 1][posY + i - 1].hasShip;
                    }
                    if (posX < 9) {
                        hasShip = hasShip || playingField[posX + 1][posY + i - 1].hasShip;
                    }
                }
                if (posY + i + 1 < 10) {
                    hasShip = hasShip || playingField[posX][posY + i + 1].hasShip;
                    if (posX > 0) {
                        hasShip = hasShip || playingField[posX - 1][posY + i + 1].hasShip;
                    }
                    if (posX < 9) {
                        hasShip = hasShip || playingField[posX + 1][posY + i + 1].hasShip;
                    }
                }
                if (posX > 0) {
                    hasShip = hasShip || playingField[posX - 1][posY + i].hasShip;
                }
                if (posX < 9) {
                    hasShip = hasShip || playingField[posX + 1][posY + i].hasShip;
                }
            }
            if (hasShip) return false;
        }
        return true;
    }

    private setShip(currentFieldX: number, currentFieldY: number, field: Field[][]) {
        if (!this.checkShipPlacement(currentFieldX, currentFieldY, this.setShipHorizontal, this.shipSize, field)) return;

        if (this.shipCounter <= 9) {
            for (let i = 0; i < this.shipSize; i++) {
                if (this.setShipHorizontal) {
                    field[currentFieldX + i][currentFieldY].hasShip = true;
                } else {
                    field[currentFieldX][currentFieldY + i].hasShip = true;
                }
            }
        }
        this.shipCounter++;

        if (this.shipCounter > 9) {
            this.shipSize = 0;
            this.highlightMesh.visible = false; // temporary disable visibility
            for (let i = 1; i < this.setShipMeshes.length; i++) {
                (this.setShipMeshes[i].material as THREE.MeshStandardMaterial).visible = false;
            }
            switch (this.activePlayer) {
                case Players.Player1:
                    this.match.player1Ready = true;
                    break;
                case Players.Player2:
                    this.match.player2Ready = true;
                    break;
            }
            this.waiting = true;
            this.firebase.updateMatch(this.matchID, this.match).then(res => {
                console.log('match updated');
            }).catch(err => {
                console.log('something went wrong ' + err);
            });
        }
    }

    private updateEnemyPosition() {

        // changed to mirror own movement to not exceed firebase limit
        //const enemy = this.activePlayer == Players.Player2 ? this.match.player1 : this.match.player2;
        const enemy = this.activePlayer == Players.Player1 ? this.match.player1 : this.match.player2;

        let head = this.scene.getObjectByName('playerHead');
        let handL = this.scene.getObjectByName('playerHandL');
        let handR = this.scene.getObjectByName('playerHandR');

        if (head) {
            head.position.set(enemy.position[0], enemy.position[1], enemy.position[2]);
            head.rotation.set(enemy.rotation[0], enemy.rotation[1], enemy.rotation[2]);
        }
        if (handL) {
            handL.position.set(enemy.controllerLeftPosition[0], enemy.controllerLeftPosition[1], enemy.controllerLeftPosition[2]);
            handL.rotation.set(enemy.controllerLeftRotation[0], enemy.controllerLeftRotation[1] + Math.PI, enemy.controllerLeftRotation[2]);
        }
        if (handR) {
            handR.position.set(enemy.controllerRightPosition[0], enemy.controllerRightPosition[1], enemy.controllerRightPosition[2]);
            handR.rotation.set(enemy.controllerRightRotation[0], enemy.controllerRightRotation[1] + Math.PI, enemy.controllerRightRotation[2]);
        }
    }
}