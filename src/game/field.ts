import {FieldHitState, FieldStates} from "./fieldStates";

export class Field {

    positionX: number;
    positionY: number;
    shipState: FieldStates;
    hitState: FieldHitState;

    constructor(positionX: number, positionY: number, shipState: FieldStates, hitState: FieldHitState) {
        this.positionX = positionX
        this.positionY = positionY
        this.shipState = shipState
        this.hitState = hitState
    }
}