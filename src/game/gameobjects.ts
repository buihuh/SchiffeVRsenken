import * as THREE from 'three'
import {BoxGeometry, MeshLambertMaterial} from "three";


export abstract class GameObject {
    mesh: THREE.Mesh;
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
    }

    /**
     * Removes the object from the scene
     */
    delete() {
        this.scene.remove(this.mesh);
        this.meshList.splice(this.meshList.indexOf(this.mesh), 1)
        this.objectList.splice(this.objectList.indexOf(this), 1)
    }
}

export class GameTrigger extends GameObject {

    onSelectStart() {
        new GameTrigger(new BoxGeometry(1, 1, 1),
            new MeshLambertMaterial({color: new THREE.Color(255, 0, 0)}),
            new THREE.Vector3(this.mesh.position.x + 1, this.mesh.position.y, this.mesh.position.z), this.scene,
            this.meshList, this.objectList);
        new GameTrigger(new BoxGeometry(1, 1, 1),
            new MeshLambertMaterial({color: new THREE.Color(255, 0, 0)}),
            new THREE.Vector3(this.mesh.position.x - 1, this.mesh.position.y, this.mesh.position.z), this.scene,
            this.meshList, this.objectList);

        this.delete();
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