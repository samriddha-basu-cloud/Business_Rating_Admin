// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDKtRjxLAvBf-_Zgacnuz219FkK528-2FI",
  authDomain: "businesstool-64e87.firebaseapp.com",
  projectId: "businesstool-64e87",
  storageBucket: "businesstool-64e87.appspot.com",
  messagingSenderId: "439391378811",
  appId: "1:439391378811:web:e77da0ab54110cfc0871de",
  measurementId: "G-KF0F8SWBMK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
