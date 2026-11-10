import React, { useMemo, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Ban, ExternalLink, RotateCcw } from "lucide-react";

import { db } from "../../shared-firebase/config/firebase";
import { formatDate } from "../../lib/format";
import { tsMillis, type DetailRef, type HappeningDoc, type PartnerDoc, type UserDoc } from "../../lib/adminData";

interface AdminPartnersProps {
  users: UserDoc[];
  partners: PartnerDoc[];
  happenings: HappeningDoc[];
  search: string;
  onOpen: (detail: DetailRef) => void;
}

type Filter = "all" | "active" | "suspended";

export default function AdminPartners({ users, partners, happenings, search, onOpen }: AdminPartnersProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    const partnerById = new Map(partners.map((p) => [p.uid ?? p.id, p]));
    const term = search.trim().toLowerCase();
    return users
      .filter((u) => u.role === "partner")
      .map((u) => {
        const partner = partnerById.get(u.uid ?? u.id);
        const own = happenings.filter((h) => h.partner_id === (u.uid ?? u.id));
        return {
          user: u,
          partner,
          venue: partner?.venue_name || u.username,
          happenings: own.length,
          rsvps: own.reduce((sum, h) => sum + (h.rsvps?.length ?? 0), 0),
          checkIns: own.reduce((sum, h) => sum + (h.attendees?.length ?? 0), 0),
          suspended: u.status === "suspended",
        };
      })
      .filter((row) => (filter === "all" ? true : filter === "suspended" ? row.suspended : !row.suspended))
      .filter((row) => !term || `${row.venue} ${row.user.email} ${row.partner?.locationName ?? ""}`.toLowerCase().includes(term))
      .sort((a, b) => a.venue.localeCompare(b.venue));
  }, [users, partners, happenings, search, filter]);

  const toggleSuspended = async (user: UserDoc, suspend: boolean) => {
    setBusyId(user.id);
    setError(null);
    try {
      await updateDoc(doc(db, "users", user.id), { status: suspend ? "suspended" : "active" });
    } catch (err) {
      console.error("Partner status error:", err);
      setError("Couldn't update that partner. Check the admin Firestore rules.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="gng-page">
      <section className="gng-panel gng-panel-fill">
        <div className="gng-toolbar">
          <div className="gng-segment" role="group" aria-label="Show">
            {(["all", "active", "suspended"] as Filter[]).map((option) => (
              <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
          <span className="gng-muted">{rows.length} partners</span>
        </div>
        {error ? <div className="gng-alert gng-alert-danger" role="alert" style={{ marginBottom: 12 }}>{error}</div> : null}
        <div className="gng-table-wrap gng-scroll">
          <table className="gng-table">
            <thead>
              <tr>
                <th>Venue</th>
                <th>Email</th>
                <th className="gng-num">Happenings</th>
                <th className="gng-num">RSVPs</th>
                <th className="gng-num">Check-ins</th>
                <th>Joined</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="gng-muted" style={{ textAlign: "center", padding: 32 }}>
                    No partners match.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.user.id} className="gng-row-click" tabIndex={0} onClick={() => onOpen({ kind: "partner", id: row.user.uid ?? row.user.id })} onKeyDown={(e) => e.key === "Enter" && onOpen({ kind: "partner", id: row.user.uid ?? row.user.id })}>
                    <td>
                      <div className="gng-cell-happening" style={{ minWidth: 220 }}>
                        <span className="gng-avatar-sm">{row.venue.charAt(0).toUpperCase()}</span>
                        <div style={{ minWidth: 0 }}>
                          <div className="gng-row-title">{row.venue}</div>
                          <div className="gng-row-sub">{row.partner?.locationName || "No location yet"}</div>
                        </div>
                      </div>
                    </td>
                    <td>{row.user.email}</td>
                    <td className="gng-num">{row.happenings}</td>
                    <td className="gng-num">{row.rsvps}</td>
                    <td className="gng-num">{row.checkIns}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(tsMillis(row.user.createdAt))}</td>
                    <td>
                      <span className={`gng-pill ${row.suspended ? "gng-pill-danger" : "gng-pill-progress"}`}>
                        {row.suspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="gng-actions" style={{ flexWrap: "nowrap", justifyContent: "flex-end" }}>
                        {row.partner?.google_maps_link ? (
                          <a className="gng-icon-btn" href={row.partner.google_maps_link} target="_blank" rel="noreferrer" title="Open in Google Maps" aria-label={`Open ${row.venue} in Google Maps`}>
                            <ExternalLink size={18} aria-hidden="true" />
                          </a>
                        ) : null}
                        {row.suspended ? (
                          <button type="button" className="gng-btn gng-btn-ghost gng-btn-small" disabled={busyId === row.user.id} onClick={() => toggleSuspended(row.user, false)}>
                            <RotateCcw size={16} aria-hidden="true" /> Restore
                          </button>
                        ) : (
                          <button type="button" className="gng-btn gng-btn-ghost gng-btn-small" disabled={busyId === row.user.id} onClick={() => toggleSuspended(row.user, true)} style={{ color: "var(--gng-danger)" }}>
                            <Ban size={16} aria-hidden="true" /> Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
