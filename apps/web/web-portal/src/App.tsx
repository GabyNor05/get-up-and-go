import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar,
  QrCode,
  PlusCircle,
  Sparkles,
  LogOut,
  Building2,
  Clock,
  MapPin,
  Globe,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

// --- Types matching your Firestore Schema ---
export type UserRole = "goer" | "partner" | "admin";

export interface User {
  uid: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO String / Timestamp representation
}

export interface Partner {
  id?: string;
  uid: string;
  bio?: string;
  profileImg?: string;
  venue_images: string[];
  website?: string;
  google_maps_link?: string;
}

interface Happening {
  id: string;
  title: string;
  date: string;
  location: string;
  qrPayload: string;
  checkIns: number;
}

export default function PartnerPortal() {
  // Auth & Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form States (User & Partner Models)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Venue / Display Name
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");

  // Portal View State
  const [activeTab, setActiveTab] = useState<"qr_code" | "create" | "listings">("qr_code");
  const [selectedEventId, setSelectedEventId] = useState<string>("venue-main");

  // Initial Happenings Data
  const [happenings, setHappenings] = useState<Happening[]>([
    {
      id: "venue-main",
      title: "Main Entrance Check-In",
      date: "Always Active",
      location: "Main Door",
      qrPayload: JSON.stringify({ partnerUid: "mock-uid-123", type: "venue_checkin" }),
      checkIns: 84,
    },
  ]);

  // Form State for New Happening
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // --- Auth Handlers ---
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (isSignUp) {
      // 1. Create Base User Model
      const newUid = `user_${Date.now()}`;
      const newUser: User = {
        uid: newUid,
        username: username || "New Venue Partner",
        email: email,
        role: "partner", // Forces partner role on sign-up through this portal
        createdAt: new Date().toISOString(),
      };

      // 2. Create Extended Partner Model
      const newPartner: Partner = {
        id: `partner_${Date.now()}`,
        uid: newUid,
        bio: bio || "",
        venue_images: [],
        website: website || "",
      };

      setCurrentUser(newUser);
      setCurrentPartner(newPartner);
    } else {
      // Mock Login Validation Logic
      if (email.includes("goer")) {
        setAuthError("Access denied: Goer accounts cannot access the Partner Portal.");
        return;
      }

      // Successful Partner/Admin Auth
      const mockUser: User = {
        uid: "uid_partner_99",
        username: "The Velvet Lounge",
        email: email,
        role: "partner",
        createdAt: new Date().toISOString(),
      };

      const mockPartner: Partner = {
        id: "partner_99",
        uid: "uid_partner_99",
        bio: "Premium lounge and event venue.",
        venue_images: [],
        website: "https://velvetlounge.com",
      };

      setCurrentUser(mockUser);
      setCurrentPartner(mockPartner);
    }
  };

  const handleCreateHappening = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !currentUser) return;

    const newId = `event-${Date.now()}`;
    const created: Happening = {
      id: newId,
      title: newTitle,
      date: newDate || "Today",
      location: newLocation || "Main Venue",
      qrPayload: JSON.stringify({
        partnerUid: currentUser.uid,
        eventId: newId,
        title: newTitle,
        type: "event_checkin",
      }),
      checkIns: 0,
    };

    setHappenings([created, ...happenings]);
    setSelectedEventId(newId);
    setNewTitle("");
    setNewDate("");
    setNewLocation("");
    setActiveTab("qr_code");
  };

  const activeHappening = happenings.find((h) => h.id === selectedEventId) || happenings[0];

  // ----------------------------------------------------
  // AUTH SCREEN (LOGIN / SIGN UP WITH MODEL VALIDATION)
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div style={{ backgroundColor: "#FAF8F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "40px", width: "100%", maxWidth: "440px", border: "1px solid rgba(36,34,27,0.08)", boxShadow: "0 10px 25px rgba(0,0,0,0.03)" }}>
          
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ backgroundColor: "#A88AED", width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
              <Sparkles size={24} color="#FAF8F0" />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#24221B", margin: 0 }}>
              {isSignUp ? "Register Partner Account" : "Partner Portal Login"}
            </h2>
            <p style={{ color: "#605E55", fontSize: "14px", marginTop: "6px" }}>
              {isSignUp ? "Set up your venue profile and start generating check-in codes" : "Exclusively for Partner & Admin users"}
            </p>
          </div>

          {authError && (
            <div style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", border: "1px solid #DC2626", borderRadius: "12px", padding: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: "#DC2626", fontSize: "13px" }}>
              <AlertCircle size={18} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {isSignUp && (
              <>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#24221B", marginBottom: "4px" }}>VENUE / PARTNER NAME (USERNAME)</label>
                  <input
                    type="text"
                    placeholder="e.g. Velvet Lounge"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", border: "1px solid rgba(36,34,27,0.18)", boxSizing: "border-box" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#24221B", marginBottom: "4px" }}>WEBSITE (OPTIONAL)</label>
                  <input
                    type="url"
                    placeholder="https://venue.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", border: "1px solid rgba(36,34,27,0.18)", boxSizing: "border-box" }}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#24221B", marginBottom: "4px" }}>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="partner@venue.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", border: "1px solid rgba(36,34,27,0.18)", boxSizing: "border-box" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#24221B", marginBottom: "4px" }}>PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", border: "1px solid rgba(36,34,27,0.18)", boxSizing: "border-box" }}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: "10px",
                padding: "14px",
                borderRadius: "14px",
                backgroundColor: "#A88AED",
                color: "#FFFFFF",
                border: "none",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              {isSignUp ? "Create Partner Profile" : "Sign In to Portal"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => {
                setAuthError(null);
                setIsSignUp(!isSignUp);
              }}
              style={{ background: "none", border: "none", color: "#A88AED", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
            >
              {isSignUp ? "Already registered? Sign In" : "Apply for a Partner Account"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN DASHBOARD (AUTHENTICATED PARTNER)
  // ----------------------------------------------------
  return (
    <div style={{ backgroundColor: "#FAF8F0", minHeight: "100vh", fontFamily: "sans-serif", color: "#24221B" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#24221B", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ backgroundColor: "#A88AED", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={20} color="#FAF8F0" />
          </div>
          <span style={{ color: "#FAF8F0", fontWeight: "700", fontSize: "20px" }}>Goer Partner Portal</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Building2 size={16} color="rgba(250,248,240,0.6)" />
            <span style={{ color: "#FAF8F0", fontWeight: "600", fontSize: "14px" }}>{currentUser.username}</span>
            <span style={{ backgroundColor: "#A88AED", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "2px 6px", borderRadius: "6px", textTransform: "uppercase" }}>{currentUser.role}</span>
          </div>

          <button
            onClick={() => {
              setCurrentUser(null);
              setCurrentPartner(null);
            }}
            style={{ backgroundColor: "rgba(250,248,240,0.1)", border: "none", padding: "8px 12px", borderRadius: "10px", color: "#FAF8F0", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 20px" }}>
        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
          <button
            onClick={() => setActiveTab("qr_code")}
            style={{
              padding: "12px 20px",
              borderRadius: "14px",
              border: "none",
              backgroundColor: activeTab === "qr_code" ? "#24221B" : "#FFFFFF",
              color: activeTab === "qr_code" ? "#FAF8F0" : "#24221B",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <QrCode size={18} /> Display Venue QR Code
          </button>

          <button
            onClick={() => setActiveTab("create")}
            style={{
              padding: "12px 20px",
              borderRadius: "14px",
              border: "none",
              backgroundColor: activeTab === "create" ? "#24221B" : "#FFFFFF",
              color: activeTab === "create" ? "#FAF8F0" : "#24221B",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <PlusCircle size={18} /> Create New Event
          </button>

          <button
            onClick={() => setActiveTab("listings")}
            style={{
              padding: "12px 20px",
              borderRadius: "14px",
              border: "none",
              backgroundColor: activeTab === "listings" ? "#24221B" : "#FFFFFF",
              color: activeTab === "listings" ? "#FAF8F0" : "#24221B",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Calendar size={18} /> Manage Happenings ({happenings.length})
          </button>
        </div>

        {/* TAB 1: DISPLAY QR CODE */}
        {activeTab === "qr_code" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "40px", textAlign: "center", border: "1px solid rgba(36,34,27,0.08)" }}>
              <div style={{ display: "inline-block", backgroundColor: "rgba(168,138,237,0.12)", padding: "6px 14px", borderRadius: "100px", color: "#A88AED", fontWeight: "700", fontSize: "12px", marginBottom: "16px" }}>
                GOER CHECK-IN STATION
              </div>

              <h2 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 6px 0", color: "#24221B" }}>{activeHappening.title}</h2>
              <p style={{ color: "#605E55", fontSize: "14px", margin: "0 0 28px 0" }}>{currentUser.username} • {activeHappening.location}</p>

              <div style={{ backgroundColor: "#FAF8F0", padding: "24px", borderRadius: "20px", display: "inline-block", marginBottom: "24px" }}>
                <QRCodeSVG
                  value={activeHappening.qrPayload}
                  size={220}
                  fgColor="#24221B"
                  bgColor="#FAF8F0"
                  level="H"
                />
              </div>

              <p style={{ fontSize: "13px", fontWeight: "600", color: "#24221B" }}>
                📱 Goers: Open your app and scan this code to check in and earn points!
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(36,34,27,0.08)" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>Active Codes</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {happenings.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedEventId(item.id)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor: selectedEventId === item.id ? "#A88AED" : "rgba(36,34,27,0.1)",
                        backgroundColor: selectedEventId === item.id ? "rgba(168,138,237,0.1)" : "transparent",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: "700", fontSize: "13px", color: "#24221B" }}>{item.title}</div>
                      <div style={{ fontSize: "11px", color: "#605E55" }}>{item.checkIns} Check-ins</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 & 3: Standard Form / List Handlers Render Here */}
      </div>
    </div>
  );
}