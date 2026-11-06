import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import { auth, db } from "./shared-firebase/config/firebase";
import type { Partner, User } from "./shared-firebase/types";
import { portalRole } from "./lib/roles";
import AuthPage, { GOER_NOTICE } from "./pages/AuthPage";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

type Session =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "admin"; user: User }
  | { kind: "partner"; user: User; partner: Partner };

export default function App() {
  const [session, setSession] = useState<Session>({ kind: "loading" });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let stopUser: (() => void) | undefined;
    let stopPartner: (() => void) | undefined;

    const stopAuth = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      stopUser?.();
      stopPartner?.();
      if (!fbUser) {
        setSession({ kind: "signed-out" });
        return;
      }

      // Live users doc: on sign-up it appears a moment after the Auth account
      stopUser = onSnapshot(
        doc(db, "users", fbUser.uid),
        (snap) => {
          const data = snap.exists() ? (snap.data() as User) : null;
          const role = portalRole(data, fbUser.email);
          const user: User =
            data ?? ({ uid: fbUser.uid, username: fbUser.email?.split("@")[0] ?? "Admin", email: fbUser.email ?? "", role: "admin" } as User);

          if (role === "partner" && (data as (User & { status?: string }) | null)?.status === "suspended") {
            setNotice("This venue account is suspended. Contact the Get Up & Go team.");
            signOut(auth);
            return;
          }
          if (role === "admin") {
            setNotice(null);
            setSession({ kind: "admin", user });
            return;
          }
          if (role === "partner") {
            stopPartner?.();
            stopPartner = onSnapshot(doc(db, "partners", fbUser.uid), (partnerSnap) => {
              const partner = partnerSnap.exists()
                ? (partnerSnap.data() as Partner)
                : ({ uid: fbUser.uid, venue_images: [] } as Partner);
              setNotice(null);
              setSession({ kind: "partner", user, partner });
            });
            return;
          }
          if (data?.role === "goer") {
            setNotice(GOER_NOTICE);
            signOut(auth);
            return;
          }
          if (data) {
            setNotice("This account isn't set up for the portal. Sign up as a partner or ask an admin.");
            signOut(auth);
          }
          // No users doc yet (sign-up still writing it): stay on the loading screen
        },
        (err) => {
          console.error("Profile listener error:", err);
          setNotice("We couldn't load your account. Try again.");
          signOut(auth);
        }
      );
    });

    return () => {
      stopUser?.();
      stopPartner?.();
      stopAuth();
    };
  }, []);

  const logout = () => {
    setNotice(null);
    signOut(auth);
  };

  if (session.kind === "loading") {
    return (
      <div className="gng-centre">
        <p style={{ color: "var(--gng-text-secondary)", fontWeight: 700 }}>Loading the Get Up &amp; Go portal…</p>
      </div>
    );
  }
  if (session.kind === "admin") return <AdminDashboard user={session.user} onLogout={logout} />;
  if (session.kind === "partner") {
    return <PartnerDashboard user={session.user} partner={session.partner} onLogout={logout} />;
  }
  return <AuthPage notice={notice} />;
}
