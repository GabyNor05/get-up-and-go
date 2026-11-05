import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../shared-firebase/config/firebase";
import { User, Partner } from "../shared-firebase/types";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, PlusCircle, Calendar, Sparkles, LogOut, Building2 } from "lucide-react";

interface EventItem {
  id: string;
  partnerUid: string;
  title: string;
  date: string;
  location: string;
  qrPayload: string;
  checkIns: number;
}

interface Props {
  user: User;
  partner: Partner;
  onLogout: () => void;
}

export default function DashboardPage({ user, partner, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<"qr_code" | "create" | "listings">("qr_code");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const q = query(collection(db, "events"), where("partnerUid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents: EventItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<EventItem, "id">),
      }));
      setEvents(fetchedEvents);
      if (fetchedEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(fetchedEvents[0].id);
      }
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const docRef = await addDoc(collection(db, "events"), {
      partnerUid: user.uid,
      title,
      date: date || "Today",
      location: location || "Main Venue",
      qrPayload: JSON.stringify({ partnerUid: user.uid, title, type: "event_checkin" }),
      checkIns: 0,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setDate("");
    setLocation("");
    setSelectedEventId(docRef.id);
    setActiveTab("qr_code");
  };

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <div style={{ backgroundColor: "#FAF8F0", minHeight: "100vh", fontFamily: "sans-serif", color: "#24221B" }}>
      <header style={{ backgroundColor: "#24221B", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ backgroundColor: "#A88AED", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={20} color="#FAF8F0" />
          </div>
          <span style={{ color: "#FAF8F0", fontWeight: "700", fontSize: "20px" }}>Goer Partner Portal</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FAF8F0" }}>
            <Building2 size={16} />
            <span style={{ fontWeight: "600", fontSize: "14px" }}>{user.username}</span>
          </div>
          <button onClick={onLogout} style={{ backgroundColor: "rgba(250,248,240,0.1)", border: "none", padding: "8px 12px", borderRadius: "10px", color: "#FAF8F0", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <LogOut size={14} /> Exit
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
          <button onClick={() => setActiveTab("qr_code")} style={{ padding: "12px 20px", borderRadius: "14px", border: "none", backgroundColor: activeTab === "qr_code" ? "#24221B" : "#FFFFFF", color: activeTab === "qr_code" ? "#FAF8F0" : "#24221B", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <QrCode size={18} /> Display Venue QR Code
          </button>
          <button onClick={() => setActiveTab("create")} style={{ padding: "12px 20px", borderRadius: "14px", border: "none", backgroundColor: activeTab === "create" ? "#24221B" : "#FFFFFF", color: activeTab === "create" ? "#FAF8F0" : "#24221B", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusCircle size={18} /> Create New Event
          </button>
          <button onClick={() => setActiveTab("listings")} style={{ padding: "12px 20px", borderRadius: "14px", border: "none", backgroundColor: activeTab === "listings" ? "#24221B" : "#FFFFFF", color: activeTab === "listings" ? "#FAF8F0" : "#24221B", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={18} /> Manage Happenings ({events.length})
          </button>
        </div>

        {activeTab === "qr_code" && activeEvent && (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "40px", textAlign: "center", border: "1px solid rgba(36,34,27,0.08)" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 6px 0" }}>{activeEvent.title}</h2>
            <p style={{ color: "#605E55", fontSize: "14px", marginBottom: "24px" }}>{user.username} • {activeEvent.location}</p>
            <div style={{ backgroundColor: "#FAF8F0", padding: "24px", borderRadius: "20px", display: "inline-block", marginBottom: "20px" }}>
              <QRCodeSVG value={activeEvent.qrPayload} size={220} fgColor="#24221B" bgColor="#FAF8F0" level="H" />
            </div>
            <p style={{ fontSize: "13px", fontWeight: "600" }}>📱 Goers: Open your app and scan this code to check in!</p>
          </div>
        )}

        {activeTab === "create" && (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "32px", maxWidth: "560px", margin: "0 auto", border: "1px solid rgba(36,34,27,0.08)" }}>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "16px" }}>Publish New Event</h3>
            <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input type="text" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: "12px", borderRadius: "12px", border: "1px solid rgba(36,34,27,0.18)" }} required />
              <input type="text" placeholder="Date & Time" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: "12px", borderRadius: "12px", border: "1px solid rgba(36,34,27,0.18)" }} />
              <input type="text" placeholder="Venue Area" value={location} onChange={(e) => setLocation(e.target.value)} style={{ padding: "12px", borderRadius: "12px", border: "1px solid rgba(36,34,27,0.18)" }} />
              <button type="submit" style={{ padding: "14px", borderRadius: "14px", backgroundColor: "#A88AED", color: "#FFFFFF", border: "none", fontWeight: "700", cursor: "pointer" }}>Generate Event QR Code</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}