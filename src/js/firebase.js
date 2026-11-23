
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDHxK8Rj_2QNIPV2TFXsHeGsT12hD23CEA",
    authDomain: "twopaws-9c704.firebaseapp.com",
    databaseURL: "https://twopaws-9c704-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "twopaws-9c704",
    storageBucket: "twopaws-9c704.firebasestorage.app",
    messagingSenderId: "561629036048",
    appId: "1:561629036048:web:8e27d70f076b214c809495"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Initialise Firebase services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const realtimeDB = getDatabase(app);

// Make Firebase services accessible to TwoPaws
window.twoPawsFirebase = {
    app,
    auth,
    googleProvider,
    realtimeDB
};

console.log("TwoPaws Firebase initialised successfully!");
