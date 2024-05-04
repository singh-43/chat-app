import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "chat-app-74289.firebaseapp.com",
  projectId: "chat-app-74289",
  storageBucket: "chat-app-74289.appspot.com",
  messagingSenderId: "66799785731",
  appId: "1:66799785731:web:a7c88f71cb4d39fc11fb36"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const dbt = getDatabase(app);
export const db = getFirestore(app);
export const storage = getStorage(app)
