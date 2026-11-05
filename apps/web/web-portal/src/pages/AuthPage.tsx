import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
// Import directly from your shared packages & initialized firebase instance
import { auth, db } from "../shared-firebase/config/firebase";
import { User, Partner } from "../shared-firebase/types";
import { Sparkles, AlertCircle } from "lucide-react";

interface Props {
  onSuccess: (user: User, partner: Partner) => void;
}

export default function AuthPage({ onSuccess }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        const batch = writeBatch(db);

        const userData: User = {
          uid,
          username: username || "New Partner",
          email,
          role: "partner",
          createdAt: serverTimestamp() as any,
        };

        const partnerData: Partner = {
          uid,
          venue_images: [],
          website: website || "",
        };

        batch.set(doc(db, "users", uid), userData);
        batch.set(doc(db, "partners", uid), partnerData);

        await batch.commit();
        onSuccess(userData, partnerData);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        const userDoc = await getDoc(doc(db, "users", uid));
        if (!userDoc.exists()) throw new Error("User record not found.");

        const userData = userDoc.data() as User;

        if (userData.role !== "partner" && userData.role !== "admin") {
          throw new Error("Access denied: Account is not a registered partner.");
        }

        const partnerDoc = await getDoc(doc(db, "partners", uid));
        const partnerData = partnerDoc.exists()
          ? (partnerDoc.data() as Partner)
          : { uid, venue_images: [] };

        onSuccess(userData, partnerData);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    }
  };

  return (
    <div style={{ backgroundColor: "#FAF8F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px" }}>
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "40px", width: "100%", maxWidth: "440px", border: "1px solid rgba(36,34,27,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ backgroundColor: "#A88AED", width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
            <Sparkles size={24} color="#FAF8F0" />
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#24221B", margin: 0 }}>
            {isSignUp ? "Register Partner Account" : "Partner Portal Login"}
          </h2>
        </div>

        {error && (
          <div style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", border: "1px solid #DC2626", borderRadius: "12px", padding: "12px", marginBottom: "20px", color: "#DC2626", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {isSignUp && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>VENUE / USERNAME</label>
                <input type="text" placeholder="Velvet Lounge" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", padding: "11px", borderRadius: "12px", border: "1px solid rgba(36,34,27,0.18)", boxSizing: "border-box" }} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>WEBSITE</label>
                <input type="url" placeholder="https://venue.com" value={website} onChange={(e) => setWebsite(e.target.value)} style={{ width: "100%", padding: "11px", borderRadius: "12px", border: "1px solid rgba(36,34,27,0.18)", boxSizing: "border-box" }} />
              </div>
            </>
          )}

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>EMAIL</label>
            <input type="email" placeholder="partner@venue.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "11px", borderRadius: "12px", border: "1px solid rgba(36,34,27,0.18)", boxSizing: "border-box" }} required />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>PASSWORD</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "11px", borderRadius: "12px", border: "1px solid rgba(36,34,27,0.18)", boxSizing: "border-box" }} required />
          </div>

          <button type="submit" style={{ marginTop: "10px", padding: "14px", borderRadius: "14px", backgroundColor: "#A88AED", color: "#FFFFFF", border: "none", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
            {isSignUp ? "Create Partner Profile" : "Sign In to Portal"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: "none", border: "none", color: "#A88AED", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
            {isSignUp ? "Already registered? Sign In" : "Apply for a Partner Account"}
          </button>
        </div>
      </div>
    </div>
  );
}