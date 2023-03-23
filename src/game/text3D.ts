import {GameObject} from './gameobjects.js';
import * as THREE from 'three';
import {Vector3} from 'three';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';

export class Text3D extends GameObject {
    started:boolean = false;
    text: string;
    font;
    size;
    counter = 0;
    material;
    callbackFunction = null;

    standardColor = 0xdbffeb;
    selectColor = 0x27ae60;
    focusColor = 0xf39c12;

    constructor(position, scene, meshList, objectList, // for super
                text: string, font, size= 1, rotation: THREE.Vector3 = null, callbackFunction = null // for this class
    ) {
        super(new TextGeometry(text, {
            font: font,
            size: size,
            height: 0.2,
            curveSegments: 10,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        }), new THREE.MeshPhongMaterial({
            color: new THREE.Color(219, 255, 235),
            specular: new THREE.Color(219, 255, 235)
        }), position, scene, meshList, objectList, rotation);
        this.text = text;
        this.font = font;
        this.mesh.geometry.center();
        this.meshList.push(this.mesh);
        this.callbackFunction = callbackFunction;
        this.onFocus();
        this.onUnfocus();
    }

    onSelectStart() {
        (this.mesh.material as THREE.MeshPhongMaterial).color.setHex(this.selectColor);
        (this.mesh.material as THREE.MeshPhongMaterial).specular.setHex(this.selectColor);
    }

    onSelectEnd() {
        (this.mesh.material as THREE.MeshPhongMaterial).color.setHex(this.standardColor);
        (this.mesh.material as THREE.MeshPhongMaterial).specular.setHex(this.standardColor);
        if (this.callbackFunction) {
            this.callbackFunction();
        }
    }

    onFocus() {
        (this.mesh.material as THREE.MeshPhongMaterial).color.setHex(this.focusColor);
        (this.mesh.material as THREE.MeshPhongMaterial).specular.setHex(this.focusColor);
    }

    onUnfocus() {
        (this.mesh.material as THREE.MeshPhongMaterial).color.setHex(this.standardColor);
        (this.mesh.material as THREE.MeshPhongMaterial).specular.setHex(this.standardColor);
    }

    /**
     * Start Setter
     */

    setText(newText: string) {
        this.text = newText;
        this.mesh.geometry.dispose();
        this.mesh.geometry = this.getGeometry();
    }

    setCallback(newCallbackFunction) {
        this.callbackFunction = newCallbackFunction;
    }

    /**
     * End Setter
     */

    /**
     * Start Helper
     */

    getMaterial() {
        const material = this.mesh.material as THREE.MeshPhongMaterial;
        material.color = new THREE.Color(219, 255, 235);
        material.specular = new THREE.Color(219, 255, 235);
        return material;
    }

    getGeometry() {
        const geometry = new TextGeometry(this.text, {
            font: this.font,
            size: this.size,
            height: 0.2,
            curveSegments: 10,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        });
        geometry.center();
        geometry.computeBoundingBox();
        return geometry;
    }


    getSizesOfObject(): Vector3 {
        let size: Vector3 = new Vector3();
        let boundingBox = new THREE.Box3().setFromObject(this.mesh);
        boundingBox.getSize(size);
        return size;
    }

    /**
     * End Helper
     */
}