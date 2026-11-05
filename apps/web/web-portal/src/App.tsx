import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./shared-firebase/config/firebase";
import { User, Partner } from "./shared-firebase/types";
import AuthPage, { GOER_NOTICE } from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          const userData = userDoc.exists() ? (userDoc.data() as User) : null;

          // Goers belong in the mobile app, not the partner portal.
          if (userData?.role === "goer") {
            setNotice(GOER_NOTICE);
            setUser(null);
            setPartner(null);
            await signOut(auth);
            setLoading(false);
            return;
          }

          const partnerDoc = await getDoc(doc(db, "partners", fbUser.uid));
          if (userData) setUser(userData);
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
      <div className="gng-centre">
        <p style={{ color: "var(--gng-text-secondary)", fontWeight: 700 }}>Loading the partner portal...</p>
      </div>
    );
  }

  return user && partner ? (
    <DashboardPage
      user={user}
      partner={partner}
      onLogout={() => {
        setNotice(null);
        signOut(auth);
      }}
    />
  ) : (
    <AuthPage
      notice={notice}
      onSuccess={(u, p) => {
        setNotice(null);
        setUser(u);
        setPartner(p);
      }}
    />
  );
}
