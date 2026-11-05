import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  initializeAuth, 
  getAuth, 
  // @ts-expect-error - getReactNativePersistence exists in RN runtime but is missing from static web types
  getReactNativePersistence, 
  Auth 
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

// Standard Expo environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

// Initialize App
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with official React Native persistence helper
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db: Firestore = getFirestore(app);

export { app, auth, db };