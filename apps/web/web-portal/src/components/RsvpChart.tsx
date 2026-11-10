import React, { useEffect, useRef, useState } from "react";

import type { Happening } from "../shared-firebase/types";

const CHART_LIMIT = 8;

// Validated pair (dataviz validator, light surface): Deep Indigo + darker celery
export const RSVP_COLOR = "#5B4C9E";
export const CHECKIN_COLOR = "#7A9440";

function shortTitle(title: string, max = 11): string {
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

/** Rounded-top bar anchored to the baseline */
function barPath(x: number, y: number, w: number, h: number, r = 4): string {
  if (h <= 0) return "";
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}

export default function RsvpChart({ happenings }: { happenings: Happening[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [size, setSize] = useState({ width: 720, height: 300 });
  const boxRef = useRef<HTMLDivElement>(null);
  const data = happenings.slice(0, CHART_LIMIT);

  // Fill whatever space the panel gives us (the dashboard doesn't scroll)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      if (w > 0 && h > 0) setSize({ width: Math.round(w), height: Math.round(Math.max(h, 180)) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;
  const pad = { top: 16, right: 8, bottom: 40, left: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const maxValue = Math.max(4, ...data.flatMap((h) => [h.rsvps?.length ?? 0, h.attendees?.length ?? 0]));
  const niceMax = Math.ceil(maxValue / 4) * 4;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));
  const groupW = plotW / Math.max(data.length, 1);
  const barW = Math.min(28, groupW / 3);
  const y = (v: number) => pad.top + plotH - (v / niceMax) * plotH;

  if (data.length === 0) {
    return (
      <div ref={boxRef} className="gng-chart">
        <p className="gng-muted">Create a Happening to see RSVPs and check-ins here.</p>
      </div>
    );
  }

  const hovered = hover !== null ? data[hover] : null;
  const hoverX = hover !== null ? pad.left + groupW * hover + groupW / 2 : 0;

  return (
    <div ref={boxRef} className="gng-chart">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="RSVPs and check-ins per Happening">
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
                {shortTitle(h.title, Math.max(8, Math.floor(groupW / 7.5)))}
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
        <div className="gng-tooltip" style={{ left: hoverX, top: 8 }}>
          <strong>{hovered.title}</strong>
          <br />
          {hovered.rsvps?.length ?? 0} RSVPs · {hovered.attendees?.length ?? 0} check-ins
        </div>
      ) : null}
    </div>
  );
}

