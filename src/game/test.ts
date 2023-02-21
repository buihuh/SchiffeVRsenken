import {Player} from "./player";
import {GameState, getStartedField, Match, Players} from "./match";

const player1 = new Player(1, "Max", 0, true);
console.log(player1);

const player2 = new Player(2, "Moritz", 0, false);
console.log(player2);

const field1 = getStartedField();
const field2 = getStartedField();

field1[0][0].hasShip = true;
field1[0][1].hasShip = true;
field2[0][0].hasShip = true;
field2[1][0].hasShip = true;

const match = new Match(player1, player2, Players.Player1, 0, field1, field2);

console.log("------------------------------------------")

/**
 * Round 0
 */

let result1: string = match.hit(Players.Player1, 0, 0);
console.log(result1)

const check1 = match.checkState();
console.log("State: " + GameState[check1]);

console.log("------------------------------------------")

match.nextRound();

/**
 * Round 1
 */

let result2 = match.hit(Players.Player2, 1, 1);
console.log(result2)

const check2 = match.checkState();
console.log("State: " + GameState[check2]);

/**
 * Result
 */

console.log("------------------------------------------")
console.log("Player 1:")
match.printField(match.fieldPlayer1);

console.log("------------------------------------------")
console.log("Player 2:")
match.printField(match.fieldPlayer2);

// console.log(JSON.stringify(match, null, 2));