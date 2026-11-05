import React, { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronRight, Sparkles, Users } from "lucide-react";

import type { Happening } from "../shared-firebase/types";
import { CATEGORIES, categoryColor, formatDateTime, millis, titleCase } from "../lib/format";

interface OverviewPageProps {
  happenings: Happening[];
  loading: boolean;
  onOpenHappenings: () => void;
  onCreate: () => void;
}

const GP_PER_CHECK_IN = 50;
const CHART_LIMIT = 8;

// Validated pair (dataviz validator, light surface): Deep Indigo + darker celery
const RSVP_COLOR = "#5B4C9E";
const CHECKIN_COLOR = "#7A9440";

function shortTitle(title: string): string {
  return title.length > 11 ? `${title.slice(0, 10)}…` : title;
}

/** Rounded-top bar anchored to the baseline */
function barPath(x: number, y: number, w: number, h: number, r = 4): string {
  if (h <= 0) return "";
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}

function RsvpChart({ happenings }: { happenings: Happening[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const data = happenings.slice(0, CHART_LIMIT);

  const width = 720;
  const height = 330;
  const pad = { top: 16, right: 8, bottom: 40, left: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const maxValue = Math.max(4, ...data.flatMap((h) => [h.rsvps?.length ?? 0, h.attendees?.length ?? 0]));
  const niceMax = Math.ceil(maxValue / 4) * 4;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));
  const groupW = plotW / Math.max(data.length, 1);
  const barW = Math.min(22, groupW / 3);
  const y = (v: number) => pad.top + plotH - (v / niceMax) * plotH;

  if (data.length === 0) {
    return <p className="gng-muted">Create a Happening to see RSVPs and check-ins here.</p>;
  }

  const hovered = hover !== null ? data[hover] : null;
  const hoverX = hover !== null ? ((pad.left + groupW * hover + groupW / 2) / width) * 100 : 0;

  return (
    <div className="gng-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="RSVPs and check-ins per Happening">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="#E2DCC4" strokeWidth={1} />
            <text x={pad.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" fontSize={11} fill="#605E55">
              {tick}
            </text>
          </g>
        ))}
        {data.map((h, i) => {
          const cx = pad.left + groupW * i + groupW / 2;
          const rsvps = h.rsvps?.length ?? 0;
          const checkIns = h.attendees?.length ?? 0;
          const dim = hover !== null && hover !== i;
          return (
            <g key={h.id} opacity={dim ? 0.45 : 1}>
              <path d={barPath(cx - barW - 1, y(rsvps), barW, y(0) - y(rsvps))} fill={RSVP_COLOR} />
              <path d={barPath(cx + 1, y(checkIns), barW, y(0) - y(checkIns))} fill={CHECKIN_COLOR} />
              <text x={cx} y={height - pad.bottom + 18} textAnchor="middle" fontSize={11} fill="#605E55">
                {shortTitle(h.title)}
              </text>
              {/* Hit target bigger than the bars */}
              <rect
                x={pad.left + groupW * i}
                y={pad.top}
                width={groupW}
                height={plotH + 24}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
        <line x1={pad.left} x2={width - pad.right} y1={y(0)} y2={y(0)} stroke="#605E55" strokeWidth={1} />
      </svg>
      {hovered ? (
        <div className="gng-tooltip" style={{ left: `${hoverX}%`, top: 8 }}>
          <strong>{hovered.title}</strong>
          <br />
          {hovered.rsvps?.length ?? 0} RSVPs · {hovered.attendees?.length ?? 0} check-ins
        </div>
      ) : null}
    </div>
  );
}

export default function OverviewPage({ happenings, loading, onOpenHappenings, onCreate }: OverviewPageProps) {
  const stats = useMemo(() => {
    const now = Date.now();
    const upcoming = happenings.filter((h) => millis(h) >= now);
    const rsvps = happenings.reduce((sum, h) => sum + (h.rsvps?.length ?? 0), 0);
    const checkIns = happenings.reduce((sum, h) => sum + (h.attendees?.length ?? 0), 0);
    const byCategory = CATEGORIES.map((category) => ({
      category,
      count: happenings.filter((h) => h.category === category).length,
    }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count);
    return { upcoming, rsvps, checkIns, byCategory, showRate: rsvps ? Math.round((checkIns / rsvps) * 100) : 0 };
  }, [happenings]);

  const chartData = stats.upcoming.length ? stats.upcoming : [...happenings].reverse();
  const maxCategory = Math.max(1, ...stats.byCategory.map((row) => row.count));

  if (loading) return <p className="gng-muted">Loading your dashboard…</p>;

  const cards = [
    { label: "Upcoming Happenings", value: stats.upcoming.length, foot: `${happenings.length} in total`, Icon: CalendarDays, bg: "var(--gng-fill-brand-subtle)", fg: "var(--gng-text-brand)" },
    { label: "RSVPs", value: stats.rsvps, foot: "Goers who said they're going", Icon: Users, bg: "var(--gng-fill-brand-subtle)", fg: "var(--gng-text-brand)" },
    { label: "Check-ins", value: stats.checkIns, foot: `${stats.showRate}% of RSVPs showed up`, Icon: CheckCircle2, bg: "var(--gng-fill-progress-subtle)", fg: "#5F7330" },
    { label: "Go-Points earned", value: stats.checkIns * GP_PER_CHECK_IN, foot: `${GP_PER_CHECK_IN} GP per check-in`, Icon: Sparkles, bg: "var(--gng-fill-progress-subtle)", fg: "#5F7330" },
  ];

  return (
    <>
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

      <section className="gng-grid-2">
        <div className="gng-panel">
          <div className="gng-panel-head">
            <h2>RSVPs vs check-ins</h2>
            <div className="gng-legend" aria-hidden="true">
              <span>
                <i className="gng-swatch" style={{ background: RSVP_COLOR }} /> RSVPs
              </span>
              <span>
                <i className="gng-swatch" style={{ background: CHECKIN_COLOR }} /> Check-ins
              </span>
            </div>
          </div>
          <RsvpChart happenings={chartData} />
        </div>

        <div className="gng-panel">
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
            <div className="gng-upnext">
              {stats.upcoming.slice(0, 5).map((h) => {
                const date = h.dateTime.toDate();
                return (
                  <div key={h.id} className="gng-upnext-row">
                    <div className="gng-date-badge">
                      <strong>{date.getDate()}</strong>
                      <span>{date.toLocaleDateString("en-ZA", { month: "short" })}</span>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="gng-row-title">{h.title}</div>
                      <div className="gng-row-sub">{formatDateTime(h)}</div>
                    </div>
                    <span className="gng-row-sub" style={{ whiteSpace: "nowrap" }}>
                      {h.rsvps?.length ?? 0} going
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="gng-panel">
        <div className="gng-panel-head">
          <h2>Happenings by category</h2>
        </div>
        {stats.byCategory.length === 0 ? (
          <p className="gng-muted">No Happenings yet.</p>
        ) : (
          <div className="gng-cat-bars">
            {stats.byCategory.map(({ category, count }) => (
              <div key={category} className="gng-cat-bar-row">
                <span>{titleCase(category)}</span>
                <div className="gng-cat-track">
                  <div
                    className="gng-cat-fill"
                    style={{ width: `${(count / maxCategory) * 100}%`, background: categoryColor(category) }}
                  />
                </div>
                <strong style={{ textAlign: "right" }}>{count}</strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
