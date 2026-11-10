import React, { useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { CalendarDays, CheckCircle2, ChevronRight, QrCode, Sparkles, Users } from "lucide-react";

import type { Happening } from "../../shared-firebase/types";
import RsvpChart, { CHECKIN_COLOR, RSVP_COLOR } from "../../components/RsvpChart";
import CategoryTag from "../../components/CategoryTag";
import { millis } from "../../lib/format";

interface PartnerOverviewProps {
  partnerUid: string;
  happenings: Happening[];
  loading: boolean;
  onOpenHappenings: () => void;
  onOpenQr: () => void;
  onCreate: () => void;
}

const GP_PER_CHECK_IN = 50;

export default function PartnerOverview({ partnerUid, happenings, loading, onOpenHappenings, onOpenQr, onCreate }: PartnerOverviewProps) {
  const stats = useMemo(() => {
    const now = Date.now();
    const upcoming = happenings.filter((h) => millis(h) >= now);
    const rsvps = happenings.reduce((sum, h) => sum + (h.rsvps?.length ?? 0), 0);
    const checkIns = happenings.reduce((sum, h) => sum + (h.attendees?.length ?? 0), 0);
    return { upcoming, rsvps, checkIns, showRate: rsvps ? Math.round((checkIns / rsvps) * 100) : 0 };
  }, [happenings]);

  if (loading) return <p className="gng-muted">Loading your dashboard…</p>;

  const chartData = stats.upcoming.length ? stats.upcoming : [...happenings].reverse();
  const cards = [
    { label: "Upcoming Happenings", value: stats.upcoming.length, foot: `${happenings.length} in total`, Icon: CalendarDays, bg: "var(--gng-fill-brand-subtle)", fg: "var(--gng-text-brand)" },
    { label: "RSVPs", value: stats.rsvps, foot: "Goers who said they're going", Icon: Users, bg: "var(--gng-fill-brand-subtle)", fg: "var(--gng-text-brand)" },
    { label: "Check-ins", value: stats.checkIns, foot: `${stats.showRate}% of RSVPs showed up`, Icon: CheckCircle2, bg: "var(--gng-fill-progress-subtle)", fg: "#5F7330" },
    { label: "Go-Points earned", value: stats.checkIns * GP_PER_CHECK_IN, foot: `${GP_PER_CHECK_IN} GP per check-in at your venue`, Icon: Sparkles, bg: "var(--gng-fill-progress-subtle)", fg: "#5F7330" },
  ];

  return (
    <div className="gng-page">
      <section className="gng-stats" aria-label="Key numbers">
        {cards.map(({ label, value, foot, Icon, bg, fg }) => (
          <div key={label} className="gng-stat">
            <div className="gng-stat-head">
              <span>{label}</span>
              <span className="gng-stat-icon" style={{ background: bg, color: fg }}>
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
            <h2>RSVPs vs check-ins</h2>
            <div className="gng-legend" aria-hidden="true">
              <span><i className="gng-swatch" style={{ background: RSVP_COLOR }} /> RSVPs</span>
              <span><i className="gng-swatch" style={{ background: CHECKIN_COLOR }} /> Check-ins</span>
            </div>
          </div>
          <RsvpChart happenings={chartData} />
        </section>

        <div className="gng-dash-col">
          <section className="gng-panel" style={{ flex: 1 }}>
            <div className="gng-panel-head">
              <h2>Up next</h2>
              <button type="button" className="gng-link-btn" onClick={onOpenHappenings}>
                View all <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
            {stats.upcoming.length === 0 ? (
              <div>
                <p className="gng-muted">Nothing scheduled yet.</p>
                <button type="button" className="gng-btn gng-btn-primary gng-btn-small" onClick={onCreate}>
                  Create Happening
                </button>
              </div>
            ) : (
              <div className="gng-upnext gng-scroll">
                {stats.upcoming.map((h) => {
                  const date = h.dateTime.toDate();
                  return (
                    <div key={h.id} className="gng-upnext-row">
                      <div className="gng-date-badge">
                        <strong>{date.getDate()}</strong>
                        <span>{date.toLocaleDateString("en-ZA", { month: "short" })}</span>
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="gng-row-title">{h.title}</div>
                        <div className="gng-row-sub">
                          {date.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} · {h.rsvps?.length ?? 0} going
                        </div>
                      </div>
                      <CategoryTag category={h.category} />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="gng-panel">
            <div className="gng-mini-qr">
              <QRCodeCanvas value={`partner:${partnerUid}`} size={88} level="M" marginSize={1} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: 18, lineHeight: "22px" }}>Your venue QR</h2>
                <p className="gng-row-sub" style={{ margin: "4px 0 10px" }}>
                  Goers scan it to check in and earn GP.
                </p>
                <button type="button" className="gng-btn gng-btn-secondary gng-btn-small" onClick={onOpenQr}>
                  <QrCode size={16} aria-hidden="true" /> Open poster
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
