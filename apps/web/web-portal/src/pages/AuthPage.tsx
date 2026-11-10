import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { AlertCircle, Building2, Loader2, ShieldCheck } from "lucide-react";

import { auth, db } from "../shared-firebase/config/firebase";
import { ADMIN_EMAILS, ADMIN_INVITE_CODE } from "../lib/roles";

export const GOER_NOTICE = "This portal is for venues and the Get Up & Go team. Goers, please use the app.";

/** Plain, short messages for the Firebase Auth error codes people actually hit */
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
  "permission-denied": "We couldn't save your details. Try again in a moment.",
};

class FormError extends Error {}

function friendlyError(err: unknown): string {
  if (err instanceof FormError) return err.message;
  const code = (err as { code?: unknown })?.code;
  if (typeof code === "string" && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  console.error("Auth error:", err);
  return "Something went wrong. Please try again.";
}

interface AuthPageProps {
  /** Message set by App, e.g. when a Goer's session was signed out */
  notice?: string | null;
}

type Mode = "login" | "signup";
type SignupRole = "partner" | "admin";

export default function AuthPage({ notice }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<SignupRole>("partner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === "signup";
  const isAdminEmail = ADMIN_EMAILS.includes(email.trim().toLowerCase());

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      if (!isSignUp) {
        // App's auth listener routes to the right dashboard
        await signInWithEmailAndPassword(auth, email.trim(), password);
        return;
      }

      if (role === "admin" && !isAdminEmail && inviteCode.trim() !== ADMIN_INVITE_CODE) {
        throw new FormError("That admin access code isn't right. Ask the Get Up & Go team for one.");
      }

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;
      const batch = writeBatch(db);
      batch.set(doc(db, "users", uid), {
        uid,
        username: name.trim() || (role === "admin" ? "Admin" : "New Partner"),
        email: email.trim(),
        role,
        createdAt: serverTimestamp(),
      });
      if (role === "partner") {
        batch.set(doc(db, "partners", uid), {
          uid,
          venue_name: name.trim(),
          locationName: locationName.trim(),
          google_maps_link: mapsLink.trim(),
          venue_images: [],
        });
      }
      await batch.commit();
    } catch (err) {
      setError({ message: friendlyError(err), code: (err as { code?: string })?.code });
      setSubmitting(false);
    }
  };

  const shownError = error?.message ?? notice ?? null;

  return (
    <div className="gng-auth">
      <section className="gng-auth-brand" aria-hidden="false">
        <div className="gng-auth-glow" />
        <img className="gng-auth-watermark" src={`${process.env.PUBLIC_URL}/logo.png`} alt="" aria-hidden="true" />

        <div className="gng-auth-logo-row">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="" />
          <span>Get Up &amp; Go</span>
        </div>

        <div className="gng-auth-hero">
          <h2>Less scrolling. More showing up.</h2>
          <p>
            The Get Up &amp; Go portal is where venues publish Happenings and print their check-in QR, and where the
            team looks after partners, Goers, Circles and support.
          </p>
        </div>

        <div className="gng-auth-points">
          <span>Publish Happenings</span>
          <span>QR check-ins</span>
          <span>RSVP insights</span>
          <span>Team admin</span>
        </div>
      </section>

      <section className="gng-auth-form-side">
        <div className="gng-card gng-auth-card">
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 30, lineHeight: "34px" }}>{isSignUp ? "Create your account" : "Welcome back"}</h1>
            <p className="gng-muted" style={{ marginTop: 6 }}>
              {isSignUp ? "Join the Get Up & Go portal." : "Log in to the Get Up & Go portal."}
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

          {shownError ? (
            <div className="gng-alert gng-alert-danger" role="alert" style={{ marginBottom: 16 }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
              <div>
                {shownError}
                {error?.code === "auth/email-already-in-use" ? (
                  <div style={{ marginTop: 6 }}>
                    <button type="button" className="gng-link-btn" onClick={() => switchMode("login")}>
                      Switch to Log in
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="gng-form" style={{ flex: 1 }}>
            {isSignUp ? (
              <div className="gng-field">
                <label>I'm signing up as</label>
                <div className="gng-segment" role="group" aria-label="Account type">
                  <button type="button" aria-pressed={role === "partner"} onClick={() => setRole("partner")}>
                    <Building2 size={16} aria-hidden="true" style={{ verticalAlign: -3, marginRight: 6 }} />
                    Venue partner
                  </button>
                  <button type="button" aria-pressed={role === "admin"} onClick={() => setRole("admin")}>
                    <ShieldCheck size={16} aria-hidden="true" style={{ verticalAlign: -3, marginRight: 6 }} />
                    Admin
                  </button>
                </div>
              </div>
            ) : null}

            {isSignUp ? (
              <div className="gng-field">
                <label htmlFor="name">{role === "partner" ? "Venue name" : "Your name"}</label>
                <input
                  id="name"
                  className="gng-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === "partner" ? "Irene Farm" : "Gaby Norris"}
                  required
                  autoComplete={role === "partner" ? "organization" : "name"}
                />
              </div>
            ) : null}

            {isSignUp && role === "partner" ? (
              <div className="gng-row">
                <div className="gng-field">
                  <label htmlFor="location-name">Location</label>
                  <input id="location-name" className="gng-input" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Irene, Centurion" required />
                </div>
                <div className="gng-field">
                  <label htmlFor="maps-link">Google Maps link</label>
                  <input id="maps-link" className="gng-input" type="url" value={mapsLink} onChange={(e) => setMapsLink(e.target.value)} placeholder="Optional" />
                </div>
              </div>
            ) : null}

            <div className="gng-field">
              <label htmlFor="email">Email</label>
              <input id="email" className="gng-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@venue.co.za" required autoComplete="email" />
            </div>

            <div className="gng-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="gng-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? "At least 6 characters" : "Your password"}
                required
                minLength={isSignUp ? 6 : undefined}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>

            {isSignUp && role === "admin" && !isAdminEmail ? (
              <div className="gng-field">
                <label htmlFor="invite">Admin access code</label>
                <input id="invite" className="gng-input" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="From the Get Up & Go team" required />
              </div>
            ) : null}

            <button
              type="submit"
              className="gng-btn gng-btn-primary"
              disabled={submitting}
              aria-busy={submitting}
              style={{ marginTop: isSignUp ? "auto" : 8, width: "100%" }}
            >
              {submitting ? <Loader2 size={18} className="gng-spin" aria-hidden="true" /> : null}
              {submitting
                ? isSignUp
                  ? "Creating account…"
                  : "Logging in…"
                : isSignUp
                  ? role === "admin"
                    ? "Create admin account"
                    : "Create partner account"
                  : "Log in"}
            </button>

            {!isSignUp ? (
              <p className="gng-auth-switch">
                New here?{" "}
                <button type="button" className="gng-link-btn" onClick={() => switchMode("signup")}>
                  Sign up your venue
                </button>{" "}
                and get your check-in QR in a minute. Venues and admins both log in here; we'll take you to the right dashboard.
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </div>
  );
}
