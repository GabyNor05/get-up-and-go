import React, { useMemo } from "react";
import { Building2, CalendarDays, ChevronRight, LifeBuoy, Users, UsersRound } from "lucide-react";

import RsvpChart, { CHECKIN_COLOR, RSVP_COLOR } from "../../components/RsvpChart";
import { formatDate, millis } from "../../lib/format";
import { tsMillis, type CircleDoc, type DetailRef, type HappeningDoc, type SupportTicket, type UserDoc } from "../../lib/adminData";

interface AdminOverviewProps {
  users: UserDoc[];
  happenings: HappeningDoc[];
  circles: CircleDoc[];
  tickets: SupportTicket[];
  venueNames: Map<string, string>;
  onOpen: (view: "partners" | "support" | "happenings") => void;
  onDetail: (detail: DetailRef) => void;
}

export default function AdminOverview({ users, happenings, circles, tickets, venueNames, onOpen, onDetail }: AdminOverviewProps) {
  const stats = useMemo(() => {
    const now = Date.now();
    const partners = users.filter((u) => u.role === "partner");
    const goers = users.filter((u) => u.role === "goer");
    const upcoming = happenings.filter((h) => millis(h) >= now);
    const openTickets = tickets.filter((t) => t.status !== "resolved").sort((a, b) => tsMillis(b.created_at) - tsMillis(a.created_at));
    const topUpcoming = [...upcoming].sort((a, b) => (b.rsvps?.length ?? 0) - (a.rsvps?.length ?? 0));
    const newestPartners = [...partners].sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
    const checkIns = happenings.reduce((sum, h) => sum + (h.attendees?.length ?? 0), 0);
    return { partners, goers, upcoming, openTickets, topUpcoming, newestPartners, checkIns };
  }, [users, happenings, tickets]);

  const cards = [
    { label: "Venue partners", value: stats.partners.length, foot: "Publishing Happenings", Icon: Building2 },
    { label: "Goers", value: stats.goers.length, foot: `${stats.checkIns} check-ins so far`, Icon: Users },
    { label: "Upcoming Happenings", value: stats.upcoming.length, foot: `${happenings.length} in total`, Icon: CalendarDays },
    { label: "Circles", value: circles.length, foot: "Groups getting out together", Icon: UsersRound },
    { label: "Open tickets", value: stats.openTickets.length, foot: `${tickets.length} all time`, Icon: LifeBuoy },
  ];

  return (
    <div className="gng-page">
      <section className="gng-stats gng-stats-5" aria-label="Platform numbers">
        {cards.map(({ label, value, foot, Icon }) => (
          <div key={label} className="gng-stat">
            <div className="gng-stat-head">
              <span>{label}</span>
              <span className="gng-stat-icon" style={{ background: "var(--gng-fill-brand-subtle)", color: "var(--gng-text-brand)" }}>
                <Icon size={18} aria-hidden="true" />
              </span>
            </div>
            <div className="gng-stat-value">{value.toLocaleString("en-ZA")}</div>
            <div className="gng-stat-foot">{foot}</div>
          </div>
        ))}
      </section>

      <div className="gng-dash-grid">
        <section className="gng-panel">
          <div className="gng-panel-head">
            <h2>Most popular upcoming Happenings</h2>
            <div className="gng-legend" aria-hidden="true">
              <span><i className="gng-swatch" style={{ background: RSVP_COLOR }} /> RSVPs</span>
              <span><i className="gng-swatch" style={{ background: CHECKIN_COLOR }} /> Check-ins</span>
            </div>
          </div>
          <RsvpChart happenings={stats.topUpcoming} />
        </section>

        <div className="gng-dash-col">
          <section className="gng-panel" style={{ flex: 1 }}>
            <div className="gng-panel-head">
              <h2>Open support tickets</h2>
              <button type="button" className="gng-link-btn" onClick={() => onOpen("support")}>
                View all <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
            {stats.openTickets.length === 0 ? (
              <p className="gng-muted">All caught up. No open tickets.</p>
            ) : (
              <div className="gng-upnext gng-scroll">
                {stats.openTickets.slice(0, 8).map((t) => (
                  <div key={t.id} className="gng-upnext-row">
                    <span className="gng-avatar-sm">{(t.username ?? t.email ?? "?").charAt(0).toUpperCase()}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="gng-row-title">{t.subject}</div>
                      <div className="gng-row-sub">
                        {t.username ?? t.email ?? "Unknown"} · {formatDate(tsMillis(t.created_at))}
                      </div>
                    </div>
                    <span className="gng-pill gng-pill-danger">Open</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="gng-panel" style={{ flex: 1 }}>
            <div className="gng-panel-head">
              <h2>Newest partners</h2>
              <button type="button" className="gng-link-btn" onClick={() => onOpen("partners")}>
                View all <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
            {stats.newestPartners.length === 0 ? (
              <p className="gng-muted">No partners yet.</p>
            ) : (
              <div className="gng-upnext gng-scroll">
                {stats.newestPartners.slice(0, 6).map((p) => (
                  <div key={p.id} className="gng-upnext-row gng-row-click" role="button" tabIndex={0} onClick={() => onDetail({ kind: "partner", id: p.uid ?? p.id })} onKeyDown={(e) => e.key === "Enter" && onDetail({ kind: "partner", id: p.uid ?? p.id })}>
                    <span className="gng-avatar-sm">{(venueNames.get(p.uid) ?? p.username).charAt(0).toUpperCase()}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="gng-row-title">{venueNames.get(p.uid) ?? p.username}</div>
                      <div className="gng-row-sub">{p.email}</div>
                    </div>
                    <span className="gng-row-sub">{formatDate(tsMillis(p.createdAt))}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
