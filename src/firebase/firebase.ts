// @ts-ignore
import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js';
// @ts-ignore
import {getAnalytics} from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-analytics.js';
// @ts-ignore
import {getFirestore, doc, addDoc, serverTimestamp, collection, updateDoc, setDoc, getDoc} from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js';
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
    protected db;

    constructor() {
        // Initialize Firebase
        this.app = initializeApp(firebaseConfig);
        this.analytics = getAnalytics(this.app);
        this.db = getFirestore(this.app);
    }

    async createGame(match: MATCH.Match) {
        let onlineId = Math.floor(Math.random() * (9999 - 1000) + 1000).toString();
        await setDoc(doc(this.db, 'matches', onlineId), {
            created: serverTimestamp(),
            match: JSON.stringify(match),
            player1Position: [0.0, 0.0, 0.0],
            player1Rotation: [0.0, 0.0, 0.0],
            player1ControllerLeftPosition: [0.0, 0.0, 0.0],
            player1ControllerLeftRotation: [0.0, 0.0, 0.0],
            player1ControllerRightPosition: [0.0, 0.0, 0.0],
            player1ControllerRightRotation: [0.0, 0.0, 0.0],

            player2Position: [0.0, 0.0, 0.0],
            player2Rotation: [0.0, 0.0, 0.0],
            player2ControllerLeftPosition: [0.0, 0.0, 0.0],
            player2ControllerLeftRotation: [0.0, 0.0, 0.0],
            player2ControllerRightPosition: [0.0, 0.0, 0.0],
            player2ControllerRightRotation: [0.0, 0.0, 0.0],
        });
        return onlineId;
    }

    async updateMatch(id: String, match: MATCH.Match) {
        const docRef = doc(this.db, 'matches', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            await updateDoc(docRef, {
                match: JSON.stringify(match)
            });
        } else {
            console.log("No such document")
        }

        this.db.ref()

    }

    async joinMatch(onlineId) {
        console.log(onlineId)
        const docRef = doc(this.db, "matches",  onlineId.toString());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
        } else {
            console.log("No such document!");
        }
        return docSnap.data();
    }

    async listenMatch(onlineId) {
       // here
    }
}