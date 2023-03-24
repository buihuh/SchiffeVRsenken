import * as FB from "./firebase.js";
import {Player} from "../game/player.js";
import {getStartedField, Match, Players} from "../game/match.js";

/**
 * TODO start create game test
 */

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

const firebase = new FB.Firebase();
firebase.createGame(match, '0000')
    .then(res => {
        console.log('match created')
        firebase.joinMatch(res);
    }).catch(err => {
    console.log('something went wrong ' + err)
});

match.player1.name = "Daym";

firebase.updateMatch('0000', match).then(res => {
    console.log('match updated')
}).catch(err => {
    console.log('something went wrong ' + err)
});

// firebase.listenMatch('0000');
/**
 * TODO end create game test
 */