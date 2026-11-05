import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer } from "lucide-react";

import type { Happening } from "../shared-firebase/types";
import { downloadCanvas, formatDateTime, millis } from "../lib/format";

interface VenueQrPageProps {
  partnerUid: string;
  venueName: string;
  happenings: Happening[];
  selectedId: string;
  onSelect: (id: string) => void;
}

// Canvas pixels can't read CSS variables: --gng-text-primary on white
const QR_FG = "#1A1A1A";
const QR_BG = "#FFFFFF";
const VENUE_QR_ID = "gng-venue-qr";
const HAPPENING_QR_ID = "gng-happening-qr";

export default function VenueQrPage({ partnerUid, venueName, happenings, selectedId, onSelect }: VenueQrPageProps) {
  const now = Date.now();
  const upcoming = happenings.filter((h) => millis(h) >= now);
  const options = upcoming.length ? upcoming : happenings;
  const selected = happenings.find((h) => h.id === selectedId) ?? null;

  return (
    <div className="gng-grid-2">
      <section className="gng-panel gng-qr-panel">
        <div className="gng-panel-head" style={{ justifyContent: "center", flexDirection: "column", gap: 4, margin: 0 }}>
          <h2>{venueName}</h2>
          <p className="gng-muted" style={{ margin: 0 }}>
            Venue check-in. Works for every Happening at your venue.
          </p>
        </div>
        <div className="gng-qr-frame">
          <QRCodeCanvas id={VENUE_QR_ID} value={`partner:${partnerUid}`} size={300} level="H" marginSize={2} fgColor={QR_FG} bgColor={QR_BG} />
        </div>
        <p className="gng-muted" style={{ fontSize: 14, margin: 0, maxWidth: 420 }}>
          Goers open a Happening in the app, tap <strong>Check in</strong> and scan this code for +50 GP.
        </p>
        <div className="gng-actions" style={{ justifyContent: "center" }}>
          <button type="button" className="gng-btn gng-btn-primary" onClick={() => downloadCanvas(VENUE_QR_ID, `${venueName} venue QR`)}>
            <Download size={18} aria-hidden="true" /> Download PNG
          </button>
          <button type="button" className="gng-btn gng-btn-secondary" onClick={() => window.print()}>
            <Printer size={18} aria-hidden="true" /> Print
          </button>
        </div>
      </section>

      <section className="gng-panel gng-qr-panel">
        <div className="gng-panel-head" style={{ flexDirection: "column", alignItems: "stretch", gap: 12, margin: 0, width: "100%" }}>
          <h2>Happening QR</h2>
          <select className="gng-input" value={selectedId} onChange={(e) => onSelect(e.target.value)} aria-label="Choose a Happening">
            <option value="">Choose a Happening</option>
            {options.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title} · {formatDateTime(h)}
              </option>
            ))}
          </select>
        </div>
        {selected ? (
          <>
            <div className="gng-qr-frame">
              <QRCodeCanvas id={HAPPENING_QR_ID} value={selected.id} size={220} level="H" marginSize={2} fgColor={QR_FG} bgColor={QR_BG} />
            </div>
            <p className="gng-muted" style={{ fontSize: 14, margin: 0, maxWidth: 420 }}>
              Only checks Goers in to <strong>{selected.title}</strong>.
            </p>
            <button type="button" className="gng-btn gng-btn-primary" onClick={() => downloadCanvas(HAPPENING_QR_ID, `${selected.title} QR`)}>
              <Download size={18} aria-hidden="true" /> Download PNG
            </button>
          </>
        ) : (
          <p className="gng-muted">
            {happenings.length === 0 ? "Create a Happening to get its own QR." : "Pick a Happening to show its own check-in QR."}
          </p>
        )}
      </section>
    </div>
  );
}
