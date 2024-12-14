import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdQjzgHo2HaAhmRw-5x4VNVqRoEB0AeCQ",
  authDomain: "christmas-a65d6.firebaseapp.com",
  projectId: "christmas-a65d6",
  storageBucket: "christmas-a65d6.firebasestorage.app",
  messagingSenderId: "19584571001",
  appId: "1:19584571001:web:eef6108ea2240858fae6a8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
