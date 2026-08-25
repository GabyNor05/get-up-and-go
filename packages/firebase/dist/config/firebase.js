import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Web app Firebase configuration typed explicitly
const firebaseConfig = {
    apiKey: "AIzaSyD4JZbgvsyhzIqReTpc2mG4T9toMk2GFTY",
    authDomain: "get-up-and-go-4cd29.firebaseapp.com",
    projectId: "get-up-and-go-4cd29",
    storageBucket: "get-up-and-go-4cd29.firebasestorage.app",
    messagingSenderId: "353001342742",
    appId: "1:353001342742:web:404586c132c47935b27237",
};
// Initialize Firebase App instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
// Initialize Auth with AsyncStorage persistence for React Native / Expo
let auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}
catch (e) {
    auth = getAuth(app); // Fallback if already initialized (prevents hot-reload errors)
}
// Initialize Firestore Database instance
const db = getFirestore(app);
export { app, auth, db };
//# sourceMappingURL=firebase.js.map