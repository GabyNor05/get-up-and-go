// Portal-specific Firebase config (web SDK, no React Native persistence).
// Not synced from packages/firebase — see claude/PLAN_PORTAL.md.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// The Firebase web config is public by design (it ships in every web bundle).
// REACT_APP_FIREBASE_* env vars override it, e.g. for a second Firebase project.
const DEFAULT_CONFIG = {
  apiKey: "AIzaSyD4JZbgvsyhzIqReTpc2mG4T9toMk2GFTY",
  authDomain: "get-up-and-go-4cd29.firebaseapp.com",
  projectId: "get-up-and-go-4cd29",
  storageBucket: "get-up-and-go-4cd29.firebasestorage.app",
  messagingSenderId: "353001342742",
  appId: "1:353001342742:web:404586c132c47935b27237",
};

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || DEFAULT_CONFIG.apiKey,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || DEFAULT_CONFIG.authDomain,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || DEFAULT_CONFIG.projectId,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || DEFAULT_CONFIG.storageBucket,
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_CONFIG.messagingSenderId,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || DEFAULT_CONFIG.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
