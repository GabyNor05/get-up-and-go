import React, { useState } from "react";
import { AlertCircle, ExternalLink, QrCode, Trash2 } from "lucide-react";

import type { Happening } from "../../shared-firebase/types";
import { happeningService } from "../../shared-firebase/services/happeningService";
import CategoryTag from "../../components/CategoryTag";
import { formatDateTime, millis, titleCase } from "../../lib/format";

interface PartnerHappeningsProps {
  happenings: Happening[];
  loading: boolean;
  error: string | null;
  search: string;
  onShowQr: (id: string) => void;
  onCreate: () => void;
}

type Filter = "upcoming" | "past" | "all";

export default function PartnerHappenings({ happenings, loading, error, search, onShowQr, onCreate }: PartnerHappeningsProps) {
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const now = Date.now();
  const term = search.trim().toLowerCase();
  const rows = happenings
    .filter((h) => (filter === "all" ? true : filter === "upcoming" ? millis(h) >= now : millis(h) < now))
    .filter((h) => !term || `${h.title} ${h.locationName} ${h.category}`.toLowerCase().includes(term));

  const handleDelete = async (h: Happening) => {
    setDeletingId(h.id);
    setActionError(null);
    try {
      await happeningService.deleteHappening(h.id);
    } catch (err) {
      console.error("Delete Happening error:", err);
      setActionError(`We couldn't delete "${h.title}". Try again.`);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="gng-page">
    <section className="gng-panel gng-panel-fill">
      <div className="gng-panel-head">
        <div className="gng-segment" role="group" aria-label="Show">
          {(["upcoming", "past", "all"] as Filter[]).map((option) => (
            <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)}>
              {titleCase(option)}
            </button>
          ))}
        </div>
        <span className="gng-muted">
          {rows.length} {rows.length === 1 ? "Happening" : "Happenings"}
        </span>
      </div>

      {error || actionError ? (
        <div className="gng-alert gng-alert-danger" role="alert" style={{ marginBottom: 16 }}>
          <AlertCircle size={18} aria-hidden="true" /> {error ?? actionError}
        </div>
      ) : null}

      {loading ? (
        <p className="gng-muted">Loading your Happenings…</p>
      ) : rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <h2 style={{ fontSize: 20 }}>{term ? "No matches" : "No Happenings here yet"}</h2>
          <p className="gng-muted" style={{ margin: "8px 0 16px" }}>
            {term ? "Try a different search." : "Create a Happening so Goers nearby can RSVP and check in."}
          </p>
          {!term ? (
            <button type="button" className="gng-btn gng-btn-primary" onClick={onCreate}>
              Create Happening
            </button>
          ) : null}
        </div>
      ) : (
        <div className="gng-table-wrap gng-scroll">
          <table className="gng-table">
            <thead>
              <tr>
                <th>Happening</th>
                <th>When</th>
                <th>Category</th>
                <th className="gng-num">RSVPs</th>
                <th className="gng-num">Check-ins</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => {
                const isPast = millis(h) < now;
                return (
                  <tr key={h.id}>
                    <td>
                      <div className="gng-cell-happening">
                        <img src={h.thumbnail_url} alt="" loading="lazy" />
                        <div style={{ minWidth: 0 }}>
                          <div className="gng-row-title">{h.title}</div>
                          <div className="gng-row-sub">{h.locationName?.split(",")[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(h)}</td>
                    <td>
                      <CategoryTag category={h.category} />
                    </td>
                    <td className="gng-num">{h.rsvps?.length ?? 0}</td>
                    <td className="gng-num">{h.attendees?.length ?? 0}</td>
                    <td>
                      <span className="gng-status">
                        <i
                          className="gng-dot"
                          style={{ background: isPast ? "var(--gng-text-secondary)" : "var(--gng-action-secondary)" }}
                        />
                        {isPast ? "Finished" : "Live in app"}
                      </span>
                    </td>
                    <td>
                      {confirmId === h.id ? (
                        <div className="gng-actions" style={{ flexWrap: "nowrap" }}>
                          <button
                            type="button"
                            className="gng-btn gng-btn-ghost gng-btn-small"
                            onClick={() => setConfirmId(null)}
                            disabled={deletingId === h.id}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="gng-btn gng-btn-danger gng-btn-small"
                            onClick={() => handleDelete(h)}
                            disabled={deletingId === h.id}
                          >
                            {deletingId === h.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      ) : (
                        <div className="gng-actions" style={{ flexWrap: "nowrap", justifyContent: "flex-end" }}>
                          <button type="button" className="gng-icon-btn" title="Venue QR" aria-label="Open venue QR" onClick={() => onShowQr(h.id)}>
                            <QrCode size={18} aria-hidden="true" />
                          </button>
                          {h.google_maps_link ? (
                            <a className="gng-icon-btn" href={h.google_maps_link} target="_blank" rel="noreferrer" title="Open in Google Maps" aria-label={`Open ${h.title} in Google Maps`}>
                              <ExternalLink size={18} aria-hidden="true" />
                            </a>
                          ) : null}
                          <button
                            type="button"
                            className="gng-icon-btn gng-icon-btn-danger"
                            title="Delete"
                            aria-label={`Delete ${h.title}`}
                            onClick={() => setConfirmId(h.id)}
                          >
                            <Trash2 size={18} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
    </div>
  );
}
