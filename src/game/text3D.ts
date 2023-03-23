import {GameObject} from './gameobjects.js';
import * as THREE from 'three';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import {Vector3} from 'three';

export class Text3D extends GameObject {
    text: string;
    started:boolean = false;
    font;
    counter = 0;

    onFocus() {
        if (!this.started) {
            const material = this.mesh.material as THREE.MeshPhongMaterial;
            material.color = new THREE.Color(219, 255, 235);
            material.specular = new THREE.Color(219, 255, 235);

            this.mesh.geometry = new TextGeometry("SchiffeVRsenken " + this.counter++, {
                font: this.font, size: 1, height: 0.2, curveSegments: 10, bevelEnabled: true,
                bevelThickness: 0.02,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            });
            this.mesh.geometry.center();
            this.mesh.geometry.computeBoundingBox();

            this.started = true;
        }
    }


    onUnfocus() {
        const material = this.mesh.material as THREE.MeshPhongMaterial;
        material.color = new THREE.Color(219, 255, 235);
        material.specular = new THREE.Color(219, 228, 235);
        this.started = false;
    }


    getSizesOfObject(): Vector3 {
        let size: Vector3 = new Vector3();
        let boundingBox = new THREE.Box3().setFromObject(this.mesh);
        boundingBox.getSize(size);
        return size;
    }
}