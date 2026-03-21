import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDaVjtQimSkNwM-Aa45Q397RAoIaGHNUHs",
    authDomain: "project-techni.firebaseapp.com",
    projectId: "project-techni",
    storageBucket: "project-techni.firebasestorage.app",
    messagingSenderId: "183569548741",
    appId: "1:183569548741:web:36992d19c06637d0d677ac",
    measurementId: "G-C8ZCT2SNH8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Database එක Export කරනවා අනිත් පේජ් වලට (Dashboard, Pricing) ගන්න පුළුවන් වෙන්න
export const db = getFirestore(app);
export const auth = getAuth(app);