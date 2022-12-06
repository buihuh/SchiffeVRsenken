import {Player} from "./player";
import {Field} from "./field";
import {FieldHitState, FieldStates} from "./fieldStates";

export enum Players {
    Player1, Player2
}

export function getStartedField(): Field[][] {
    const field: Field[][] = [];
    for (let y: number = 0; y < 10; y++) {
        field[y] = [];
        for (let x: number = 0; x < 10; x++) {
            field[y][x] = new Field(x, y, FieldStates.NoShip, FieldHitState.NoHit);
        }
    }
    return field;
}

export class Match {

    player1: Player;
    player2: Player;
    fieldPlayer1: Field[][];
    fieldPlayer2: Field[][];
    whoIsPlaying: Players;

    gameIsFinished: boolean;
    winner: Players;

    private roundCounter: number;

    constructor(player1: Player, player2: Player, starter?: Players, stepCounter?: number, fieldPlayer1?: Field[][], fieldPlayer2?: Field[][]) {
        this.player1 = player1;
        this.player2 = player2;
        this.whoIsPlaying = starter ? starter : Players.Player1;
        this.roundCounter = stepCounter ? stepCounter : 0;
        this.gameIsFinished = false;
        this.fieldPlayer1 = fieldPlayer1 ? fieldPlayer1 : getStartedField();
        this.fieldPlayer2 = fieldPlayer2 ? fieldPlayer2 : getStartedField();
    }

    incRound(): number {
        this.roundCounter++;
        return this.roundCounter;
    }

    switchPlayer(): void {
        this.whoIsPlaying = this.whoIsPlaying == Players.Player1 ? Players.Player2 : Players.Player1;
    }

    async hit(attacker: Players, x: number, y: number) {
        const target: Field[][] = attacker == Players.Player1 ? this.fieldPlayer2 : this.fieldPlayer1;
        const targetField: Field = target[y][x];
        let result;
        if (targetField.shipState == FieldStates.NoShip) {
            target[y][x].hitState = FieldHitState.WaterHit;
            console.log("No Hit!");
            result = "No Hit!";
        } else {
            target[y][x].hitState = FieldHitState.PartialHit;
            console.log("Hit!");
            result = "Hit!";
        }
        const check = this.checkField(target);
        console.log(check);
        return result;
    }

    checkField(field: Field[][]) {
        for (let y: number = 0; y < 10; y++) {
            for (let x: number = 0; x < 10; x++) {
                let shipState: FieldStates = field[y][x].shipState;
                let hitState: FieldHitState = field[y][x].hitState;
                if (shipState == FieldStates.Ship && (hitState == FieldHitState.NoHit || hitState == FieldHitState.WaterHit)) {
                    return "Game is not over";
                }
            }
        }
        return "Game is over";
    }

    printField(field: Field[][]) {
        let board = "   0  1  2  3  4  5  6  7  8  9 (x)";
        for (let y: number = 0; y < 10; y++) {
            board += "\n" + y + "  ";
            for (let x: number = 0; x < 10; x++) {
                if (field[y][x].shipState == FieldStates.Ship) {
                    if (field[y][x].hitState == FieldHitState.PartialHit) {
                        board += "P  ";
                    } else if (field[y][x].hitState == FieldHitState.FullHit) {
                        board += "F  ";
                    } else {
                        board += "S  ";
                    }
                } else {
                    board += "~  ";
                }
            }
        }
        board += "\n(y)" + "\n~ = Water" + "\nS = Ship + Unhit" + "\nP = Ship + Partial Hit" + "\nF = Ship + Full Hit";
        console.log(board);
    }
}