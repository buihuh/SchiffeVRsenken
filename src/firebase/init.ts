// import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-app.src';
// import {getAnalytics} from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-analytics.src';

// Somehow this is not working:
// import {initializeApp} from "firebase/app";
// import {getAnalytics} from "firebase/analytics";

import {getAnalytics} from "firebase/analytics";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "./firebase-config";

// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
console.log(analytics)