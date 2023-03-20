// @ts-ignore
import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js';
// @ts-ignore
import {getAnalytics} from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-analytics.js';
// @ts-ignore
import {getFirestore, doc, addDoc, serverTimestamp, collection, updateDoc, setDoc} from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js';
import {firebaseConfig} from './firebase-config.js';
import * as MATCH from './../game/match.js';


// Somehow this is not working:
// import {initializeApp} from "firebase/app";
// import {getAnalytics} from "firebase/analytics";

// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

export class Firebase {

    protected app : any;
    protected analytics: any;
    onlineId: number;
    protected db: any;

    constructor() {
        // Initialize Firebase
        this.app = initializeApp(firebaseConfig);
        this.analytics = getAnalytics(this.app);
        this.db = getFirestore(this.app);
    }

    async createGame(match: MATCH.Match) {
        let shortId = Math.floor(Math.random() * (9999 - 1000) + 1000);
        const docRef = await addDoc(collection(this.db, 'matches'), {
            created: serverTimestamp(),
            id: shortId,
            match: JSON.stringify(match),
            player1Position: [0.0, 0.0, 0.0],
            player1Rotation: [0.0, 0.0, 0.0],
            player1ControllerLeftPosition: [0.0, 0.0, 0.0],
            player1ControllerLeftRotation: [0.0, 0.0, 0.0],
            player2Position: [0.0, 0.0, 0.0],
            player2Rotation: [0.0, 0.0, 0.0],
            player2ControllerLeftPosition: [0.0, 0.0, 0.0],
            player2ControllerLeftRotation: [0.0, 0.0, 0.0]
            // state: 0,
            // player1: {id: match.player1.id, name: match.player1.name, winCounter: 0, isHost: true} as Player,
            // player2: {id: match.player2.id, name: match.player2.name, winCounter: 0, isHost: false} as Player,
            // attacker: match.attacker
        });
        this.onlineId = docRef.id;

        // await this.createField(match.fieldPlayer1, 1);
        // await this.createField(match.fieldPlayer2, 2);
        // return docRef;
    }


    // async createField(field: Field [][], player: number) {
    //
    //     for (let y: number = 0; y < field.length; y++) {
    //         for (let x: number = 0; x < field.length; x++) {
    //
    //             const c = doc(this.db,
    //                 'games',
    //                 this.gameid,
    //                 'fieldPlayer' + player,
    //                 'x'+x+'y'+y)
    //                 .withConverter(fieldConverter);
    //             await setDoc(c, new Field(
    //                     field[x][y].positionX,
    //                     field[x][y].positionY,
    //                     field[x][y].hasShip
    //                 )
    //             );
    //         // .then(res => {
    //         //         console.log('created playerfield ' +player)
    //         //     }).catch(err => {
    //         //         console.log('something went wrong '+ err)
    //         //     })
    //
    //         }
    //     }
    // }

    // updateMatch(match: MATCH.Match) {
    //     const docRef = doc(this.db, 'games', this.gameid);
    //     updateDoc(docRef, {
    //     });
    // }


}

// /*
// * TODO fix data types
// * */
// const matchConverter = {
//     toFirestore: (match) => {
//         return {
//             player1: match.player1.id,
//             player2: match.player2.id,
//             // fieldPlayer1: match.fieldPlayer1,
//             // fieldPlayer2: match.fieldPlayer2,
//             attacker: match.attacker
//         };
//     },
//     fromFirestore: (snapshot, options) => {
//         const data = snapshot.data(options);
//         return new MATCH.Match(data.player1, data.player2, data.attacker, data.fieldPlayer1, data.fieldPlayer2);
//     }
// };


// const fieldConverter = {
//     toFirestore: (field) => {
//         return {
//             x: field.positionX,
//             y: field.positionY,
//             hasShip: field.hasShip,
//             isHit: field.isHit
//         };
//     },
//     fromFirestore: (snapshot, options) => {
//         const data = snapshot.data(options);
//         return new Field(data.positionX, data.positionY, data.hasShip);
//     }
// };

// const playerConverter = {
//     toFirestore: (player) => {
//         return {
//             id: player.id,
//             name: player.name,
//             winCounter: player.winCounter,
//             isHost: player.isHost
//         };
//     },
//     fromFirestore: (snapshot, options) => {
//         const data = snapshot.data(options);
//         return new Player(data.id, data.name);
//     }
// };
