import React, { useEffect, useMemo, useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { CheckCircle2, LifeBuoy, Mail, RotateCcw } from "lucide-react";

import { db } from "../../shared-firebase/config/firebase";
import { formatDate } from "../../lib/format";
import { tsMillis, type SupportTicket, type TicketStatus } from "../../lib/adminData";

interface AdminSupportProps {
  tickets: SupportTicket[];
  loading: boolean;
  search: string;
}

type Filter = TicketStatus | "all";

export default function AdminSupport({ tickets, loading, search }: AdminSupportProps) {
  const [filter, setFilter] = useState<Filter>("open");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tickets
      .filter((t) => (filter === "all" ? true : (t.status ?? "open") === filter))
      .filter((t) => !term || `${t.subject} ${t.message} ${t.email ?? ""} ${t.username ?? ""}`.toLowerCase().includes(term))
      .sort((a, b) => tsMillis(b.created_at) - tsMillis(a.created_at));
  }, [tickets, filter, search]);

  const selected = rows.find((t) => t.id === selectedId) ?? rows[0] ?? null;

  useEffect(() => {
    setNote(selected?.admin_note ?? "");
    setError(null);
  }, [selected?.id, selected?.admin_note]);

  const save = async (status: TicketStatus) => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, "support_tickets", selected.id), {
        status,
        admin_note: note.trim(),
        ...(status === "resolved" ? { resolved_at: serverTimestamp() } : {}),
      });
    } catch (err) {
      console.error("Ticket update error:", err);
      setError("Couldn't update the ticket. Check the admin Firestore rules.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gng-page">
      <div className="gng-dash-grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(0, 1.4fr)" }}>
        <section className="gng-panel">
          <div className="gng-toolbar">
            <div className="gng-segment" role="group" aria-label="Show">
              {(["open", "resolved", "all"] as Filter[]).map((option) => (
                <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
            <span className="gng-muted">{rows.length}</span>
          </div>
          {loading ? (
            <p className="gng-muted">Loading tickets…</p>
          ) : rows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 8px" }}>
              <LifeBuoy size={32} color="var(--gng-text-brand)" aria-hidden="true" />
              <p className="gng-muted">
                {filter === "open" ? "No open tickets. Goers send these from Settings → Help & Support in the app." : "Nothing here."}
              </p>
            </div>
          ) : (
            <div className="gng-upnext gng-scroll">
              {rows.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="gng-upnext-row"
                  onClick={() => setSelectedId(t.id)}
                  style={{
                    border: 0,
                    borderBottom: "1px solid var(--gng-border-subtle)",
                    background: selected?.id === t.id ? "var(--gng-fill-brand-subtle)" : "transparent",
                    borderRadius: 12,
                    padding: "10px 12px",
                    textAlign: "left",
                    cursor: "pointer",
                    font: "inherit",
                    color: "inherit",
                  }}
                >
                  <span className="gng-avatar-sm">{(t.username ?? t.email ?? "?").charAt(0).toUpperCase()}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="gng-row-title">{t.subject}</div>
                    <div className="gng-row-sub">
                      {t.username ?? t.email ?? "Unknown"} · {formatDate(tsMillis(t.created_at))}
                    </div>
                  </div>
                  <span className={`gng-pill ${t.status === "resolved" ? "gng-pill-progress" : "gng-pill-danger"}`}>
                    {t.status === "resolved" ? "Resolved" : "Open"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="gng-panel">
          {!selected ? (
            <p className="gng-muted">Select a ticket to read it.</p>
          ) : (
            <div className="gng-scroll" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className={`gng-pill ${selected.status === "resolved" ? "gng-pill-progress" : "gng-pill-danger"}`}>
                    {selected.status === "resolved" ? "Resolved" : "Open"}
                  </span>
                  {selected.topic ? <span className="gng-pill gng-pill-brand">{selected.topic}</span> : null}
                  <span className="gng-pill gng-pill-muted">{selected.source === "portal" ? "From the portal" : "From the app"}</span>
                </div>
                <h2 style={{ fontSize: 24, lineHeight: "28px", marginTop: 12 }}>{selected.subject}</h2>
                <p className="gng-row-sub" style={{ marginTop: 4 }}>
                  {selected.username ?? "Unknown"} · {selected.email ?? "no email"} · {formatDate(tsMillis(selected.created_at))}
                </p>
              </div>

              <div style={{ padding: 16, borderRadius: 12, background: "var(--gng-bg-surface)", border: "1px solid var(--gng-border-subtle)", whiteSpace: "pre-wrap", lineHeight: "22px" }}>
                {selected.message}
              </div>

              <div className="gng-field">
                <label htmlFor="ticket-note">Internal note</label>
                <textarea id="ticket-note" className="gng-input" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you do about it?" />
              </div>

              {error ? <div className="gng-alert gng-alert-danger" role="alert">{error}</div> : null}

              <div className="gng-actions" style={{ justifyContent: "space-between" }}>
                {selected.email ? (
                  <a className="gng-btn gng-btn-ghost" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}>
                    <Mail size={18} aria-hidden="true" /> Reply by email
                  </a>
                ) : (
                  <span />
                )}
                {selected.status === "resolved" ? (
                  <button type="button" className="gng-btn gng-btn-secondary" onClick={() => save("open")} disabled={saving}>
                    <RotateCcw size={18} aria-hidden="true" /> Reopen
                  </button>
                ) : (
                  <button type="button" className="gng-btn gng-btn-primary" onClick={() => save("resolved")} disabled={saving}>
                    <CheckCircle2 size={18} aria-hidden="true" /> Mark resolved
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
