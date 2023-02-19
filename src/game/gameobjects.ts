import * as THREE from 'three'


export abstract class GameObject {
    mesh: THREE.Mesh;
    private scene: THREE.Scene;
    private objectList: any[];

    constructor(geometry: THREE.BufferGeometry, material: THREE.Material, position: THREE.Vector3,
                scene: THREE.Scene, objectList: any[]) {
        this.scene = scene
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        scene.add(this.mesh);
        objectList.push(this.mesh);
    }

    onSelectStart() {
    }

    onSelectEnd() {
    }

    onSqueezeStart() {
    }

    onSqueezeEnd() {
    }

    onFocus() {
    }

    onUnfocus() {
    }

    delete() {
        this.scene.remove(this.mesh);
        this.objectList.splice(this.objectList.indexOf(this.mesh), 1)
    }
}

export class GameTrigger extends GameObject {

    onSelectStart() {
        const material = this.mesh.material as THREE.MeshLambertMaterial
        material.color = new THREE.Color(0, 255, 0);
    }

    onSelectEnd() {
        const material = this.mesh.material as THREE.MeshLambertMaterial
        material.color = new THREE.Color(255, 0, 0);
    }

    onSqueezeStart() {
        const material = this.mesh.material as THREE.MeshLambertMaterial
        material.color = new THREE.Color(0, 0, 255);
    }

    onSqueezeEnd() {
        const material = this.mesh.material as THREE.MeshLambertMaterial
        material.color = new THREE.Color(255, 0, 0);
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