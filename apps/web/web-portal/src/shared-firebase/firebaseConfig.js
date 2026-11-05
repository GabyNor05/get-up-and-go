// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4JZbgvsyhzIqReTpc2mG4T9toMk2GFTY",
  authDomain: "get-up-and-go-4cd29.firebaseapp.com",
  projectId: "get-up-and-go-4cd29",
  storageBucket: "get-up-and-go-4cd29.firebasestorage.app",
  messagingSenderId: "353001342742",
  appId: "1:353001342742:web:404586c132c47935b27237"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence for Expo/React Native
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app); // Fallback if already initialized
}

const db = getFirestore(app);

export { app, auth, db };