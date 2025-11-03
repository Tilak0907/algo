// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdUd--lx8P6dH7OOnmah5L12h_Mk0rYmw",
  authDomain: "algopilot-7124c.firebaseapp.com",
  projectId: "algopilot-7124c",
  storageBucket: "algopilot-7124c.firebasestorage.app",
  messagingSenderId: "101066783383",
  appId: "1:101066783383:web:73db0065caa32e1df787d2",
  measurementId: "G-GV1C6DVDBB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
