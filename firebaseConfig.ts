import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// SUBSTITUA COM SUAS CHAVES DO CONSOLE FIREBASE
// Vá em: Console -> Configurações do Projeto -> Geral -> Apps da Web
const firebaseConfig = {
  apiKey: "AIzaSyAg40lOf6qxPJflTzXD1GP8vQ4sZXDIAwQ",
  authDomain: "jarvis-e3c4a.firebaseapp.com",
  projectId: "jarvis-e3c4a",
  storageBucket: "jarvis-e3c4a.firebasestorage.app",
  messagingSenderId: "519433120434",
  appId: "1:519433120434:web:95d6b4b12a00d189a0b7ab",
  measurementId: "G-E8NCZ2KYQM"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);