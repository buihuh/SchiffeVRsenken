import * as FB from "../firebase/firebase.js";
import * as THREE from 'three';
import {Player} from "./player.js";
import {GameState, getStartedField, Match, Players} from "./match.js";
import {Field} from "./field.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";


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

    private setShipMeshes;

    private shipMesh;

    private fieldStatusMeshes;
    private activePlayer: Players;
    //private activePlayingField: Field[][];
    private gamePhase;
    private match: Match;
    private shipCounter = 0;
    private setShipHorizontal = true;
    private shipSize = 1;
    private firebase;
    private setupField: Field[][];
    public winner;
    public finished = false;

    constructor(position: THREE.Vector3, scene: THREE.Scene, meshList: any[], objectList: any[], matchID: string, host: boolean = true) {
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

        this.setShipMeshes = [];
        this.setShipMeshes.push(this.highlightMesh);
        for (let i = 1; i < 4; i++) {
            const setShipMesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.4, 4, 2),
                new THREE.MeshBasicMaterial({
                    wireframe: true,
                    color: 0xFFEA00,
                    visible: false
                })
            );
            scene.add(setShipMesh);
            this.setShipMeshes.push(setShipMesh);
        }

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

        this.firebase = new FB.Firebase();

        //Game Setup
        let player1 = new Player(0, "Max");
        let player2 = new Player(1, "Moritz");

        let playingField1 = getStartedField();
        let playingField2 = getStartedField();

        this.setupField = getStartedField();
        this.gamePhase = "setup"
        this.match = new Match(player1, player2, null, 0, playingField1, playingField2);
        if (host) {
            this.activePlayer = Players.Player1;
            player1.isHost = true;
            this.firebase.createGame(this.match)
                .then(res => {
                    console.log('match created')
                    this.firebase.listenMatch(res, this.match);
                }).catch(err => {
                console.log('something went wrong ' + err)
            });
            console.log("Player 1 initialized");
        } else {
            this.activePlayer = Players.Player2;
            this.firebase.listenMatch(matchID, this.match);
            console.log("Player 2 initialized");
        }

        /*
        * TODO: start test load player model
        */
        const gltfLoader = new GLTFLoader();
        const geometry = new THREE.SphereGeometry( 0.5, 32, 16 );
        const material = new THREE.MeshLambertMaterial({color: new THREE.Color(255, 255, 255)});
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.set(0, 5, -10);
        sphere.name = 'playerHead';
        this.scene.add( sphere );

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
                hand_r.position.set(-2, 3, -10);
                hand_r.name = 'playerHandR';
                scene.add(hand_r);
            },
            function ( xhr ) {
                // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded r hand' );
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
                hand_l.position.set(2, 3, -10);
                hand_l.name = 'playerHandL';
                scene.add(hand_l);
            },
            function ( xhr ) {
                // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded l hand' );
            },
            function ( error ) {
                console.log( 'An error happened' + error.message);
            }
        );

        /*
         * TODO: end test load player model
         */


    }


    private showOwnPlayingFieldStatus(playingField: Field[][]) {
        for (let i = 0; i < playingField.length; i++) {
            for (let j = 0; j < playingField[i].length; j++) {
                const statusMesh = this.fieldStatusMeshes[j][i];
                const material = statusMesh.material as THREE.MeshBasicMaterial;
                if (playingField[i][j].hasShip) {
                    if (playingField[i][j].isHit)
                        material.color.setHex(0xFF0000);
                    else
                        material.color.setHex(0x00FF00);
                } else {
                    if (playingField[i][j].isHit)
                        material.color.setHex(0x0000FF);
                    else
                        material.color.setHex(0xFFFFFF);
                }
                statusMesh.material;
            }
        }
    }

    private showTargetPlayingFieldStatus(enemyPlayingField: Field[][]) {
        for (let i = 0; i < enemyPlayingField.length; i++) {
            for (let j = 0; j < enemyPlayingField[i].length; j++) {
                const statusMesh = this.fieldStatusMeshes[j][i];
                const material = statusMesh.material as THREE.MeshBasicMaterial;
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

        return [Math.floor(highlightPosX), Math.floor(highlightPosZ)]
    }

    update() {
        //Check if match is over
        if (this.gamePhase == "running" && this.match.checkState() == GameState.GameOver) {
            this.finished = true;
            this.winner = this.match.winner;
            console.log(this.winner + " won");
            return;
        }
        //Check if players have set up
        if (this.gamePhase == "setup" && this.match.player1Ready && this.match.player2Ready) {
            switch (this.activePlayer) {
                case Players.Player1:
                    this.match.fieldPlayer1 = this.setupField;
                    break;
                case Players.Player2:
                    this.match.fieldPlayer2 = this.setupField;
                    break;
            }
            this.gamePhase = "running";
            for (let i = 1; i < this.setShipMeshes.length; i++) {
                (this.setShipMeshes[i].material as THREE.MeshBasicMaterial).visible = false;
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
                    this.showTargetPlayingFieldStatus(this.getActivePlayingField());
                } else {
                    this.showOwnPlayingFieldStatus(this.getActivePlayingField());
                }
                break;
        }
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
        if ((horizontal && posX + shipSize > 10) || (!horizontal && posY + shipSize > 10))
            return false;

        // check if placing ship directly onto another ship
        if (playingField[posX][posY].hasShip)
            return false;

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
            if (hasShip)
                return false;
        }
        return true;
    }

    private setShip(currentFieldX: number, currentFieldY: number, field: Field[][]) {
        if (!this.checkShipPlacement(currentFieldX, currentFieldY, this.setShipHorizontal,
            this.shipSize, field))
            return;

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
            for (let i = 1; i < this.setShipMeshes.length; i++) {
                (this.setShipMeshes[i].material as THREE.MeshBasicMaterial).visible = false;
            }
            switch (this.activePlayer) {
                case Players.Player1:
                    this.match.player1Ready = true;
                    break;
                case Players.Player2:
                    this.match.player2Ready = true;
                    break;
            }
            this.firebase.updateMatch('0000', this.match).then(res => {
                console.log('match updated')
            }).catch(err => {
                console.log('something went wrong ' + err)
            });
        }
    }

    nextTurn() {
        this.match.nextRound();
        console.log(this.match.attacker + "'s turn!")
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

    private updateEnemyPosition() {

        // changed to mirror own movement to not exceed firebase limit
        //const enemy = this.activePlayer == Players.Player2 ? this.match.player1 : this.match.player2;
        const enemy = this.activePlayer == Players.Player1 ? this.match.player1 : this.match.player2;

        let head = this.scene.getObjectByName('playerHead');
        let handL = this.scene.getObjectByName('playerHandL');
        let handR = this.scene.getObjectByName('playerHandR');

        if(head) {
            head.position.set(-enemy.position[0], enemy.position[1] + 5, -enemy.position[2] - 10);
            head.rotation.set(-enemy.rotation[0], enemy.rotation[1], -enemy.rotation[2]);
        }
        if(handL) {
            handL.position.set(-enemy.controllerLeftPosition[0] + 2, enemy.controllerLeftPosition[1] + 3, -enemy.controllerLeftPosition[2] - 10);
            handL.rotation.set(-enemy.controllerLeftRotation[0], enemy.controllerLeftRotation[1], -enemy.controllerLeftRotation[2]);
        }
        if(handR) {
            handR.position.set(-enemy.controllerRightPosition[0] - 2, enemy.controllerRightPosition[1] + 3, -enemy.controllerRightPosition[2] - 10);
            handR.rotation.set(-enemy.controllerRightRotation[0], enemy.controllerRightRotation[1], -enemy.controllerRightRotation[2]);
        }
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

            const gridPos = this.getHighlightedGridPosition()
            const placeable = this.checkShipPlacement(gridPos[0], gridPos[1],
                this.setShipHorizontal, this.shipSize, this.getOwnPlayingField());

            for (let i = 0; i < this.shipSize; i++) {
                (this.setShipMeshes[i].material as THREE.MeshBasicMaterial).visible = true;

                if (this.setShipHorizontal) {
                    this.setShipMeshes[i].position.set(highlightPos.x + i, 0, highlightPos.z);
                } else {
                    this.setShipMeshes[i].position.set(highlightPos.x, 0, highlightPos.z + i);
                }

                if (placeable) {
                    (this.setShipMeshes[i].material as THREE.MeshBasicMaterial).color.setHex(0xFFEA00);
                } else {
                    (this.setShipMeshes[i].material as THREE.MeshBasicMaterial).color.setHex(0xFF0000);
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
                if (this.activePlayer == this.match.attacker) {
                    if (this.match.hit(this.match.attacker, highlightPos[1], highlightPos[0]) == "No Target!")
                        this.nextTurn();

                    this.firebase.updateMatch('0000', this.match).then(res => {
                        console.log('match updated')
                    }).catch(err => {
                        console.log('something went wrong ' + err)
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
}

export class GameTrigger extends GameObject {
    started = false;
    playingField;

    onSelectStart() {
        if (!this.started) {
            this.playingField = new PlayingField(new THREE.Vector3(0, 0, 0), this.scene, this.meshList, this.objectList, "");
            this.started = true;
            return;
        }

        this.playingField.nextTurn();
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

export class HostTrigger extends GameObject {
    started = false;
    playingField: PlayingField;

    onSelectStart() {
        if (!this.started) {
            this.playingField = new PlayingField(new THREE.Vector3(0, 0, 0), this.scene, this.meshList,
                this.objectList, '0000');
            this.started = true;
            const material = this.mesh.material as THREE.MeshLambertMaterial;
            material.visible = false;
        }
    }

    onFocus() {
        const material = this.mesh.material as THREE.MeshLambertMaterial
        material.color = new THREE.Color(255, 0, 0);
    }

    onUnfocus() {
        const material = this.mesh.material as THREE.MeshLambertMaterial
        material.color.setHex(0xFF3232);
    }
}

export class GuestTrigger extends GameObject {
    started = false;
    playingField: PlayingField;

    onSelectStart() {
        if (!this.started) {
            this.playingField = new PlayingField(new THREE.Vector3(0, 0, 0), this.scene, this.meshList,
                this.objectList, '0000', false);
            this.started = true;
            const material = this.mesh.material as THREE.MeshLambertMaterial;
            material.visible = false;
        }
    }

    onFocus() {
        const material = this.mesh.material as THREE.MeshLambertMaterial
        material.color = new THREE.Color(0, 0, 255);
    }

    onUnfocus() {
        const material = this.mesh.material as THREE.MeshLambertMaterial
        material.color.setHex(0x3232FF);
    }
}