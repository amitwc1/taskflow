import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initFirebase() {
  try {
    const app =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    return {
      auth: getAuth(app),
      db: getFirestore(app),
      storage: getStorage(app),
    };
  } catch {
    // Firebase init can fail during build when env vars are missing/invalid.
    // The app will initialise properly at runtime in the browser.
    return { auth: undefined!, db: undefined!, storage: undefined! };
  }
}

const firebase = initFirebase();

export const auth = firebase.auth;
export const db = firebase.db;
export const storage = firebase.storage;
export const googleProvider = new GoogleAuthProvider();
