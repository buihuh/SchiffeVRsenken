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

    private setShipMeshes;

    private shipMesh;

    private fieldStatusMeshes;
    private activePlayer: Players;
    private activePlayingField: Field[][];
    private gamePhase;
    private match: Match;
    private shipCounter = 0;
    private setShipHorizontal = true;
    private shipSize = 1;
    public winner;
    public finished = false;

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

        //Game Setup
        let player1 = new Player(0, "Max");
        let player2 = new Player(1, "Moritz");

        let playingField1 = getStartedField();
        let playingField2 = getStartedField();

        this.activePlayer = Players.Player1;
        this.activePlayingField = playingField1
        this.gamePhase = "setup"
        this.match = new Match(player1, player2, null, 0, playingField1, playingField2);

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

    private update() {
        //Check if match is over
        if (this.match.checkState() == GameState.GameOver) {
            this.finished = true;
            this.winner = this.match.winner;
            console.log(this.winner + " won");
            return;
        }
        switch (this.gamePhase) {
            //this is needed as long we only have one grid
            case "setup":
                this.showOwnPlayingFieldStatus(this.activePlayingField);
                break;
            case "running":
                if (this.activePlayer == Players.Player1) {
                    this.showTargetPlayingFieldStatus(this.activePlayingField);
                } else {
                    this.showTargetPlayingFieldStatus(this.activePlayingField);
                }
                break;
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

    private setShip(currentFieldX: number, currentFieldY: number) {
        if (!this.checkShipPlacement(currentFieldX, currentFieldY, this.setShipHorizontal,
            this.shipSize, this.activePlayingField))
            return;

        for (let i = 0; i < this.shipSize; i++) {
            if (this.setShipHorizontal) {
                this.activePlayingField[currentFieldX + i][currentFieldY].hasShip = true;
            } else {
                this.activePlayingField[currentFieldX][currentFieldY + i].hasShip = true;
            }
        }

        if (this.shipCounter >= 9) {
            this.shipCounter = 0;
            this.shipSize = 1;
            for (let i = 1; i < this.setShipMeshes.length; i++) {
                (this.setShipMeshes[i].material as THREE.MeshBasicMaterial).visible = false;
            }
            this.nextTurn();
            return;
        }
        this.shipCounter++;
    }

    nextTurn() {
        if (this.activePlayer == Players.Player1) {
            this.activePlayer = Players.Player2;
            this.activePlayingField = this.gamePhase == "setup" ? this.match.fieldPlayer2 : this.match.fieldPlayer1;
        } else {
            this.activePlayer = Players.Player1;
            this.activePlayingField = this.match.fieldPlayer2;

            if (this.gamePhase == "setup") {
                this.gamePhase = "running";
                (this.highlightMesh.material as THREE.MeshBasicMaterial).color.setHex(0xFFEA00);
            }
        }
        this.update();
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
                this.setShipHorizontal, this.shipSize, this.activePlayingField);

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
                this.setShip(highlightPos[0], highlightPos[1]);
                break;
            case "running":
                this.match.hit(this.match.attacker, highlightPos[1], highlightPos[0])
                break;
            default:
                break;
        }
        this.update()
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
            this.playingField = new PlayingField(new THREE.Vector3(0, 0, 0), this.scene, this.meshList, this.objectList);
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