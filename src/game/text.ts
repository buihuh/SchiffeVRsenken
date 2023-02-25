import * as THREE from 'three';
import {Object3D} from 'three/src/core/Object3D';

export class TextTest {
    public planeMesh: Object3D;
    protected counter = 0;
    protected fontName = "Verdana";
    protected textureFontSize = 100;
    protected textCanvas;
    protected textCtx;
    protected string;

    constructor(string) {
        this.counter = 0;
        this.fontName = "Verdana";
        this.textureFontSize = 100;
        this.textCanvas = document.createElement("canvas");
        this.textCanvas.width = this.textCanvas.height = 0;
        this.textCtx = this.textCanvas.getContext("2d");
        this.string = string;
        this.refreshText();
    }

    refreshText() {
        this.sampleCoordinates();
        this.createPlane();
        this.counter++;
    }

    sampleCoordinates() {
        // Parse text
        const lines = this.string.split(`\n`);
        lines.push(this.counter.toString());
        const linesMaxLength = [...lines].sort((a, b) => b.length - a.length)[0].length;
        const wTexture = this.textureFontSize * 0.7 * linesMaxLength;
        const hTexture = this.textureFontSize * lines.length;

        // Draw text
        const linesNumber = lines.length;
        this.textCanvas.width = wTexture;
        this.textCanvas.height = hTexture;
        this.textCtx.font = "200 " + this.textureFontSize + "px " + this.fontName;
        this.textCtx.fillStyle = "#2a9d8f";
        this.textCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
        for (let i = 0; i < linesNumber; i++) {
            this.textCtx.fillText(lines[i], 0, ((i + 0.8) * hTexture) / linesNumber);
        }
    }

    createPlane() {
        const texture = new THREE.CanvasTexture(this.textCanvas);
        const planeGeometry = new THREE.PlaneGeometry(this.textCanvas.width / 100, this.textCanvas.height / 100);
        const planeMaterial = new THREE.MeshBasicMaterial({
            map: texture
        });
        this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.planeMesh.rotation.set(Math.PI, 0, Math.PI);
        this.planeMesh.position.set(0, 1.7, 6);
    }
}