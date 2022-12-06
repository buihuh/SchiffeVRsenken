import {Player} from "./player";
import {Field} from "./field";
import {FieldHitState, FieldStates} from "./fieldStates";

export enum Players {
    Player1, Player2
}

export class Match {

    player1: Player;
    player2: Player;
    fieldPlayer1: Field[][];
    fieldPlayer2: Field[][];
    whoIsPlaying: Players;
    private roundCounter: number;

    constructor(player1: Player, player2: Player, starter?: Players, stepCounter?: number, fieldPlayer1?: Field[][], fieldPlayer2?: Field[][]) {
        this.player1 = player1;
        this.player2 = player2;
        this.whoIsPlaying = starter ? starter : Players.Player1;
        this.roundCounter = stepCounter ? stepCounter : 0;

        // fill all fields
        if (!fieldPlayer1 && !fieldPlayer2) {
            console.log("Create fields")
            this.fieldPlayer1 = []
            this.fieldPlayer2 = []
            for (let y: number = 0; y < 10; y++) {
                this.fieldPlayer1[y] = [];
                this.fieldPlayer2[y] = [];
                for (let x: number = 0; x < 10; x++) {
                    this.fieldPlayer1[y][x] = new Field(x, y, FieldStates.NoShip, FieldHitState.NoHit);
                    this.fieldPlayer2[y][x] = new Field(x, y, FieldStates.NoShip, FieldHitState.NoHit);
                }
            }
        } else {
            console.log("Use fields")
            this.fieldPlayer1 = fieldPlayer1;
            this.fieldPlayer2 = fieldPlayer2;
        }
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
        if (targetField.shipState == FieldStates.NoShip) {
            target[y][x].hitState = FieldHitState.WaterHit;
            console.log("No Hit!");
            return "No Hit!"
        } else {
            target[y][x].hitState = FieldHitState.PartialHit;
            console.log("Hit!");
            return "Hit!"
        }
    }

    checkField(field: Field[][]): boolean {
        for (let y: number = 0; y < 10; y++) {
            for (let x: number = 0; x < 10; x++) {
                let shipState: FieldStates = field[y][x].shipState;
                let hitState: FieldHitState = field[y][x].hitState;
                if (!(shipState == FieldStates.Ship && hitState != FieldHitState.NoHit)) {
                    return true;
                }
            }
        }
        return false;
    }

    printField(field: Field[][]) {
        let board = "";
        for (let y: number = 0; y < 10; y++) {
            board += "\n";
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
        console.log(board);
    }
}