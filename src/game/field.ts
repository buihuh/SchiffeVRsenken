export class Field {

    positionX: number;
    positionY: number;
    hasShip: boolean;
    isHit: boolean;
    isVisible: boolean;

    constructor(positionX: number, positionY: number, hasShip: boolean) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.hasShip = hasShip;
        this.isHit = false;
        this.isVisible = false;
    }
}