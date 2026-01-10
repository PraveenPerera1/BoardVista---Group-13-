import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Replace these values with your actual Firebase Project keys
const firebaseConfig = {
  apiKey: "AIzaSyD4l0COUqJEFikdwTyFUeKTt3KaoOz2RoM",
  authDomain: "uniproj-1.firebaseapp.com",
  projectId: "uniproj-1",
  storageBucket: "uniproj-1.firebasestorage.app",
  messagingSenderId: "384602472241",
  appId: "1:384602472241:web:cfae7bd1aa1b5828403a10",
  measurementId: "G-RBTKXNDZEL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);