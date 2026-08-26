// apps/mobile/hooks/useGoer.ts
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../packages/firebase/src/config/firebase";

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role: string;
}

export function useGoer() {
  const [goerId, setGoerId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("A goer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Goer ID is the Firebase Auth UID
        const currentUid = firebaseUser.uid;
        setGoerId(currentUid);

        try {
          // Fetch the user document from the 'users' collection using the goer's uid
          const userDocRef = doc(db, "users", currentUid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const userData = userSnap.data() as UserProfile;
            if (userData.username) {
              setUsername(userData.username);
            }
          } else {
            // Fallback username if doc hasn't loaded yet
            setUsername(firebaseUser.email?.split("@")[0] || "A goer");
          }
        } catch (err) {
          console.error("Error fetching user document by uid:", err);
          setUsername("A goer");
        }
      } else {
        setGoerId(null);
        setUsername("A goer");
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    goerId,
    username,
    loading,
  };
}