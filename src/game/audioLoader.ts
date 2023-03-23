// create an AudioListener and add it to the camera
import * as THREE from "three";

export class AudioLoader {
    listener: THREE.AudioListener;
    camera: THREE.PerspectiveCamera;
    sound: THREE.Audio;
    loader: THREE.AudioLoader;

    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
        this.listener = new THREE.AudioListener();
        this.loader = new THREE.AudioLoader();
        // create a global audio source
        this.sound = new THREE.Audio(this.listener);
    }

    load(url: string, loop: boolean = false, volume: number = 0.4) {
        this.loader.load(url,function( buffer ) {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(loop);
            this.sound.setVolume(volume);
            this.sound.play();
        });
    }

}
