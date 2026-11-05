import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./shared-firebase/config/firebase";
import { User, Partner } from "./shared-firebase/types";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          const partnerDoc = await getDoc(doc(db, "partners", fbUser.uid));

          if (userDoc.exists()) setUser(userDoc.data() as User);
          if (partnerDoc.exists()) setPartner(partnerDoc.data() as Partner);
        } catch (err) {
          console.error("Auth listener error:", err);
        }
      } else {
        setUser(null);
        setPartner(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ backgroundColor: "#FAF8F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#24221B", fontWeight: "700" }}>Loading Goer Portal...</p>
      </div>
    );
  }

  return user && partner ? (
    <DashboardPage user={user} partner={partner} onLogout={() => signOut(auth)} />
  ) : (
    <AuthPage onSuccess={(u, p) => { setUser(u); setPartner(p); }} />
  );
}