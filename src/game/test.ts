import {Player} from "./player";
import {getStartedField, Match, Players} from "./match";
import {FieldStates} from "./fieldStates";

const player1 = new Player(1, "Max");
console.log(player1);

const player2 = new Player(2, "Moritz");
console.log(player2);

const field1 = getStartedField();
const field2 = getStartedField();

field2[0][0].shipState = FieldStates.Ship;
field2[1][0].shipState = FieldStates.Ship;

const match = new Match(player1, player2, Players.Player1, 0, field1, field2);

let promise = Promise.resolve([match.hit(Players.Player1, 0, 0)]);
match.printField(match.fieldPlayer2);

// console.log(JSON.stringify(match, null, 2));