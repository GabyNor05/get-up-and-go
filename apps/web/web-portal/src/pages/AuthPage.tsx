import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { auth, db } from "../shared-firebase/config/firebase";
import { User, Partner } from "../shared-firebase/types";
import { AlertCircle, Loader2 } from "lucide-react";

export const GOER_NOTICE = "This portal is for partners. Use the Get Up & Go app.";
const NOT_PARTNER_NOTICE = "This account isn't set up as a partner. Sign up with a different email.";

/** Plain, short messages for the Firebase Auth error codes partners actually hit. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists. Log in instead.",
  "auth/invalid-credential": "That email and password don't match. Check them and try again.",
  "auth/invalid-login-credentials": "That email and password don't match. Check them and try again.",
  "auth/wrong-password": "That password is incorrect. Try again.",
  "auth/user-not-found": "We couldn't find an account with that email. Sign up instead.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/missing-password": "Enter your password.",
  "auth/weak-password": "Use a password with at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/network-request-failed": "Can't reach the server. Check your internet connection and try again.",
  "auth/user-disabled": "This account has been disabled. Contact the Get Up & Go team.",
  "permission-denied": "We couldn't save your venue details. Try again in a moment.",
};
const GENERIC_ERROR = "Something went wrong. Please try again.";

class PortalAccessError extends Error {}

function friendlyError(err: unknown): string {
  if (err instanceof PortalAccessError) return err.message;
  const code = (err as { code?: unknown })?.code;
  if (typeof code === "string" && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  console.error("Auth error:", err);
  return GENERIC_ERROR;
}

interface Props {
  onSuccess: (user: User, partner: Partner) => void;
  /** Message set by App, e.g. when a Goer's saved session was signed out. */
  notice?: string | null;
}

type Mode = "login" | "signup";

export default function AuthPage({ onSuccess, notice }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [venueName, setVenueName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === "signup";

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const uid = cred.user.uid;
        const batch = writeBatch(db);

        const userData: User = {
          uid,
          username: venueName.trim() || "New Partner",
          email: email.trim(),
          role: "partner",
          createdAt: serverTimestamp() as any,
        };

        const partnerData: Partner = {
          uid,
          venue_name: venueName.trim(),
          locationName: locationName.trim(),
          google_maps_link: mapsLink.trim(),
          venue_images: [],
        };

        batch.set(doc(db, "users", uid), userData);
        batch.set(doc(db, "partners", uid), partnerData);
        await batch.commit();
        onSuccess(userData, partnerData);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const uid = cred.user.uid;

        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.exists() ? (userDoc.data() as User) : null;

        if (userData?.role === "goer") {
          await signOut(auth);
          throw new PortalAccessError(GOER_NOTICE);
        }
        if (!userData || (userData.role !== "partner" && userData.role !== "admin")) {
          await signOut(auth);
          throw new PortalAccessError(NOT_PARTNER_NOTICE);
        }

        const partnerDoc = await getDoc(doc(db, "partners", uid));
        const partnerData = partnerDoc.exists()
          ? (partnerDoc.data() as Partner)
          : { uid, venue_images: [] };

        onSuccess(userData, partnerData);
      }
    } catch (err) {
      setError({ message: friendlyError(err), code: (err as { code?: string })?.code });
      setSubmitting(false);
    }
  };

  const shownError = error?.message ?? notice ?? null;

  return (
    <main className="gng-centre">
      <div className="gng-card" style={{ width: "100%", maxWidth: 460, padding: 36 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p className="gng-logo" style={{ fontSize: 30 }}>Get Up &amp; Go</p>
          <h1 style={{ fontSize: 20, marginTop: 8 }}>Partner Portal</h1>
          <p className="gng-muted" style={{ marginTop: 6 }}>
            Publish Happenings and show your venue check-in QR.
          </p>
        </div>

        <div className="gng-tabs" role="tablist" aria-label="Log in or sign up">
          <button type="button" role="tab" className="gng-tab" aria-selected={!isSignUp} onClick={() => switchMode("login")}>
            Log in
          </button>
          <button type="button" role="tab" className="gng-tab" aria-selected={isSignUp} onClick={() => switchMode("signup")}>
            Sign up
          </button>
        </div>

        {shownError && (
          <div className="gng-alert gng-alert-danger" role="alert" style={{ marginBottom: 16 }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              {shownError}
              {error?.code === "auth/email-already-in-use" && (
                <div style={{ marginTop: 6 }}>
                  <button type="button" className="gng-link-btn" onClick={() => switchMode("login")}>
                    Switch to Log in
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleAuth} className="gng-form">
          {isSignUp && (
            <>
              <div className="gng-field">
                <label htmlFor="venue-name">Venue name</label>
                <input id="venue-name" className="gng-input" type="text" placeholder="Velvet Lounge" value={venueName} onChange={(e) => setVenueName(e.target.value)} required autoComplete="organization" />
              </div>
              <div className="gng-field">
                <label htmlFor="location-name">Location name</label>
                <input id="location-name" className="gng-input" type="text" placeholder="Hatfield, Pretoria" value={locationName} onChange={(e) => setLocationName(e.target.value)} required />
              </div>
              <div className="gng-field">
                <label htmlFor="maps-link">Google Maps link</label>
                <input id="maps-link" className="gng-input" type="url" placeholder="https://maps.app.goo.gl/..." value={mapsLink} onChange={(e) => setMapsLink(e.target.value)} />
                <p className="gng-hint">Optional. Helps Goers find you.</p>
              </div>
            </>
          )}

          <div className="gng-field">
            <label htmlFor="email">Email</label>
            <input id="email" className="gng-input" type="email" placeholder="partner@venue.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div className="gng-field">
            <label htmlFor="password">Password</label>
            <input id="password" className="gng-input" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={isSignUp ? 6 : undefined} autoComplete={isSignUp ? "new-password" : "current-password"} />
          </div>

          <button type="submit" className="gng-btn gng-btn-primary" disabled={submitting} aria-busy={submitting} style={{ marginTop: 6, width: "100%" }}>
            {submitting && <Loader2 size={18} className="gng-spin" aria-hidden="true" />}
            {submitting ? (isSignUp ? "Creating account..." : "Logging in...") : isSignUp ? "Create partner account" : "Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}
