export class Player {
    constructor(public id: number, public name: string = "Unknown", public winCounter: number = 0, public isHost: boolean = false) {
    }
}