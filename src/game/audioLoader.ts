import * as THREE from "three";

export class AudioLoader {
    listener: THREE.AudioListener;
    camera: THREE.PerspectiveCamera;
    loader: THREE.AudioLoader;

    constructor(camera: THREE.PerspectiveCamera) {
        this.listener = new THREE.AudioListener();
        this.camera = camera;
        this.camera.add(this.listener);
        this.loader = new THREE.AudioLoader();
    }

    load(url: string, loop: boolean = false, volume: number = 0.4) {
        // create a global audio source
        const sound = new THREE.Audio(this.listener);
        this.loader.load(url, function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(loop);
            sound.setVolume(volume);
        });
        return sound;
    }

}
