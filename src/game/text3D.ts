import {GameObject} from './gameobjects.js';
import * as THREE from 'three';

export class Text3D extends GameObject {
    text: string;
    started:boolean = false;

    onFocus() {
        const material = this.mesh.material as THREE.MeshPhongMaterial;
        material.color = new THREE.Color(255, 0, 0);
        material.specular = new THREE.Color(255, 0, 0);
    }


    onUnfocus() {
        const material = this.mesh.material as THREE.MeshPhongMaterial;
        material.color = new THREE.Color(255, 255, 0);
        material.specular = new THREE.Color(255, 255, 0);
    }
}