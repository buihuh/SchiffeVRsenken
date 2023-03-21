import {Player} from "./player.js";
import {Field} from "./field.js";

export enum Players {
    Player1, Player2
}

export enum GameState {
    Running, GameOver
}

export function getStartedField(): Field[][] {
    const field: Field[][] = [];
    for (let y: number = 0; y < 10; y++) {
        field[y] = [];
        for (let x: number = 0; x < 10; x++) {
            field[y][x] = new Field(x, y, false);
        }
    }
    return field;
}

export class Match {

    player1: Player;
    player2: Player;
    fieldPlayer1: Field[][];
    fieldPlayer2: Field[][];
    attacker: Players;

    gameIsFinished: boolean;
    winner: Players;
    player1Ready = false;
    player2Ready = false;

    private roundCounter: number;

    constructor(player1: Player, player2: Player, starter?: Players, stepCounter?: number, fieldPlayer1?: Field[][], fieldPlayer2?: Field[][]) {
        this.player1 = player1;
        this.player2 = player2;
        this.attacker = starter ? starter : Players.Player1;
        this.roundCounter = stepCounter ? stepCounter : 0;
        this.gameIsFinished = false;
        this.fieldPlayer1 = fieldPlayer1 ? fieldPlayer1 : getStartedField();
        this.fieldPlayer2 = fieldPlayer2 ? fieldPlayer2 : getStartedField();
    }

    nextRound(): number {
        this.roundCounter++;
        this.attacker = this.attacker == Players.Player1 ? Players.Player2 : Players.Player1;
        return this.roundCounter;
    }

    hit(attacker: Players, x: number, y: number) {
        if (attacker != this.attacker) {
            return "Wrong Player!";
        }
        const target: Field[][] = attacker == Players.Player1 ? this.fieldPlayer2 : this.fieldPlayer1;
        const targetField: Field = target[y][x];

        target[y][x].isHit = true;
        target[y][x].isVisible = true;

        return !targetField.hasShip ? "No Target!" : "Target!";
    }

    checkState(): GameState {
        let result_1 = this.checkField(this.fieldPlayer1);
        let result_2 = this.checkField(this.fieldPlayer2);

        if (result_1 == GameState.GameOver) {
            this.winner = Players.Player2;
            this.player2.winCounter++;
        } else if (result_2 == GameState.GameOver) {
            this.winner = Players.Player1;
            this.player1.winCounter++;
        }

        return this.winner ? GameState.GameOver : GameState.Running;
    }

    checkField(field: Field[][]) {
        for (let y: number = 0; y < field.length; y++) {
            for (let x: number = 0; x < field.length; x++) {
                const hasShip: boolean = field[y][x].hasShip;
                const isHit: boolean = field[y][x].isHit;
                if (hasShip && !isHit) {
                    return GameState.Running;
                }
            }
        }
        return GameState.GameOver;
    }

    printField(field: Field[][]) {
        let board = "   0  1  2  3  4  5  6  7  8  9 (x)";
        for (let y: number = 0; y < 10; y++) {
            board += "\n" + y + "  ";
            for (let x: number = 0; x < 10; x++) {
                if (field[y][x].hasShip) {
                    board += field[y][x].isHit ? "H  " : "S  ";
                } else {
                    board += field[y][x].isHit ? "*  " : "~  ";
                }
            }
        }
        board += "\n(y)" + "\n~ = Water + Unhit" + "\n* = Water + Hit" + "\nS = Ship + Unhit" + "\nH = Ship + Hit";
        console.log(board);
    }

    copyFrom(match: Match) {
        this.player1 = match.player1;
        this.player2 = match.player2;
        this.fieldPlayer1 = match.fieldPlayer1;
        this.fieldPlayer2 = match.fieldPlayer2;
        this.attacker = match.attacker;
        this.gameIsFinished = match.gameIsFinished;
        this.winner = match.winner;
        this.player1Ready = match.player1Ready;
        this.player2Ready = match.player2Ready;
        this.roundCounter = match.roundCounter;
    }
}