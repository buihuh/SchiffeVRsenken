import * as THREE from 'three'


export abstract class GameObject {
    mesh: THREE.Mesh;

    protected constructor(mesh: THREE.Mesh) {
        this.mesh = mesh;
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
}

export class GameTrigger extends GameObject {
    scene = null;

    constructor(mesh: THREE.Mesh, scene: THREE.Scene) {
        super(mesh);
        this.scene = scene
    }

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