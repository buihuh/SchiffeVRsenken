export class Player {

    position: number[] = [0.0, 0.0, 0.0];
    rotation: number[] = [0.0, 0.0, 0.0];
    controllerLeftPosition: number[] = [0.0, 0.0, 0.0];
    controllerLeftRotation: number[] = [0.0, 0.0, 0.0];
    controllerRightPosition: number[] = [0.0, 0.0, 0.0];
    controllerRightRotation: number[] = [0.0, 0.0, 0.0];

    constructor(public id: number, public name: string = "Unknown", public winCounter: number = 0, public isHost: boolean = false) {
    }
}