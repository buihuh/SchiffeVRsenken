import {Player} from "./player";
import {Match, Players} from "./match";
import {Field} from "./field";
import {FieldHitState, FieldStates} from "./fieldStates";

const player1 = new Player(1, "Max");
console.log(player1);

const player2 = new Player(2, "Moritz");
console.log(player2);

let fieldPlayer1: Field[][] = [];
let fieldPlayer2: Field[][] = [];
for (let y: number = 0; y < 10; y++) {
    fieldPlayer1[y] = [];
    fieldPlayer2[y] = [];
    for (let x: number = 0; x < 10; x++) {
        fieldPlayer1[y][x] = new Field(x, y, x < 5 ? FieldStates.NoShip : FieldStates.Ship, FieldHitState.NoHit);
        fieldPlayer2[y][x] = new Field(x, y, x < 5 ? FieldStates.NoShip : FieldStates.Ship, FieldHitState.NoHit);
    }
}

const match = new Match(player1, player2, Players.Player1, 0, fieldPlayer1, fieldPlayer2);

let promise = Promise.resolve([match.hit(Players.Player1, 7, 0)]);
match.printField(match.fieldPlayer2);

// console.log(JSON.stringify(match, null, 2));
// console.log(promise);