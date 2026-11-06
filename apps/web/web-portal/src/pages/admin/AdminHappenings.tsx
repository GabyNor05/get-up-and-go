import React, { useMemo, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";

import { happeningService } from "../../shared-firebase/services/happeningService";
import CategoryTag from "../../components/CategoryTag";
import { formatDateTime, millis } from "../../lib/format";
import type { HappeningDoc } from "../../lib/adminData";

interface AdminHappeningsProps {
  happenings: HappeningDoc[];
  venueNames: Map<string, string>;
  search: string;
}

type Filter = "upcoming" | "past" | "all";
type Source = "all" | "partners" | "demo";

export default function AdminHappenings({ happenings, venueNames, search }: AdminHappeningsProps) {
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [source, setSource] = useState<Source>("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const now = Date.now();
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return happenings
      .filter((h) => (filter === "all" ? true : filter === "upcoming" ? millis(h) >= now : millis(h) < now))
      .filter((h) => (source === "all" ? true : source === "demo" ? h.demo : !h.demo))
      .filter((h) => !term || `${h.title} ${h.locationName} ${h.category} ${venueNames.get(h.partner_id) ?? ""}`.toLowerCase().includes(term))
      .sort((a, b) => (filter === "past" ? millis(b) - millis(a) : millis(a) - millis(b)));
  }, [happenings, filter, source, search, venueNames, now]);

  const remove = async (h: HappeningDoc) => {
    setError(null);
    try {
      await happeningService.deleteHappening(h.id);
    } catch (err) {
      console.error("Delete Happening error:", err);
      setError(`Couldn't delete "${h.title}".`);
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div className="gng-page">
      <section className="gng-panel gng-panel-fill">
        <div className="gng-toolbar">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div className="gng-segment" role="group" aria-label="When">
              {(["upcoming", "past", "all"] as Filter[]).map((option) => (
                <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
            <div className="gng-segment" role="group" aria-label="Source">
              {(["all", "partners", "demo"] as Source[]).map((option) => (
                <button key={option} type="button" aria-pressed={source === option} onClick={() => setSource(option)}>
                  {option === "all" ? "All sources" : option === "partners" ? "Partners" : "Demo"}
                </button>
              ))}
            </div>
          </div>
          <span className="gng-muted">{rows.length} Happenings</span>
        </div>
        {error ? <div className="gng-alert gng-alert-danger" role="alert" style={{ marginBottom: 12 }}>{error}</div> : null}
        <div className="gng-table-wrap gng-scroll">
          <table className="gng-table">
            <thead>
              <tr>
                <th>Happening</th>
                <th>Partner</th>
                <th>When</th>
                <th>Category</th>
                <th className="gng-num">RSVPs</th>
                <th className="gng-num">Check-ins</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="gng-muted" style={{ textAlign: "center", padding: 32 }}>
                    No Happenings match.
                  </td>
                </tr>
              ) : (
                rows.map((h) => (
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
                    <td>
                      {h.demo ? (
                        <span className="gng-pill gng-pill-muted">Demo</span>
                      ) : (
                        venueNames.get(h.partner_id) ?? <span className="gng-muted">Unknown</span>
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(h)}</td>
                    <td>
                      <CategoryTag category={h.category} />
                    </td>
                    <td className="gng-num">{h.rsvps?.length ?? 0}</td>
                    <td className="gng-num">{h.attendees?.length ?? 0}</td>
                    <td>
                      {confirmId === h.id ? (
                        <div className="gng-actions" style={{ flexWrap: "nowrap" }}>
                          <button type="button" className="gng-btn gng-btn-ghost gng-btn-small" onClick={() => setConfirmId(null)}>
                            Cancel
                          </button>
                          <button type="button" className="gng-btn gng-btn-danger gng-btn-small" onClick={() => remove(h)}>
                            Delete
                          </button>
                        </div>
                      ) : (
                        <div className="gng-actions" style={{ flexWrap: "nowrap", justifyContent: "flex-end" }}>
                          {h.google_maps_link ? (
                            <a className="gng-icon-btn" href={h.google_maps_link} target="_blank" rel="noreferrer" title="Open in Google Maps" aria-label={`Open ${h.title} in Google Maps`}>
                              <ExternalLink size={18} aria-hidden="true" />
                            </a>
                          ) : null}
                          <button type="button" className="gng-icon-btn gng-icon-btn-danger" title="Delete" aria-label={`Delete ${h.title}`} onClick={() => setConfirmId(h.id)}>
                            <Trash2 size={18} aria-hidden="true" />
                          </button>
                        </div>
                      )}
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
