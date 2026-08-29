import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  databaseURL: "SUA_DATABASE_URL",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;