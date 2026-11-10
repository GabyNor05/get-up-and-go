import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, FileDown, Loader2, Printer, Share2 } from "lucide-react";

import { downloadCanvas } from "../../lib/format";
import { buildVenuePoster, posterFileName } from "../../lib/venuePoster";

interface VenueQrProps {
  partnerUid: string;
  venueName: string;
}

export const VENUE_QR_ID = "gng-venue-qr";

// Canvas pixels can't read CSS variables: --gng-text-primary on white
const QR_FG = "#1A1A1A";
const QR_BG = "#FFFFFF";

type Busy = "pdf" | "print" | "share" | null;

export default function VenueQr({ partnerUid, venueName }: VenueQrProps) {
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<string | null>(null);

  const run = async (kind: Exclude<Busy, null>) => {
    setBusy(kind);
    setMessage(null);
    try {
      const pdf = await buildVenuePoster(venueName, VENUE_QR_ID);
      const fileName = posterFileName(venueName);

      if (kind === "pdf") {
        pdf.save(fileName);
      } else if (kind === "print") {
        pdf.autoPrint();
        window.open(pdf.output("bloburl"), "_blank");
      } else {
        const file = new File([pdf.output("blob")], fileName, { type: "application/pdf" });
        const shareData = { title: `${venueName} check-in QR`, text: "Scan to check in with Get Up & Go", files: [file] };
        if (navigator.canShare?.(shareData)) {
          await navigator.share(shareData);
        } else {
          pdf.save(fileName);
          setMessage("Sharing files isn't supported in this browser, so we downloaded the PDF instead.");
        }
      }
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        console.error("Venue poster error:", err);
        setMessage("Couldn't create the PDF. Try again.");
      }
    } finally {
      setBusy(null);
    }
  };

  const icon = (kind: Exclude<Busy, null>, Icon: typeof Download) =>
    busy === kind ? <Loader2 size={18} className="gng-spin" aria-hidden="true" /> : <Icon size={18} aria-hidden="true" />;

  return (
    <div className="gng-page">
      <div className="gng-qr-stage">
        <section className="gng-poster" aria-label="Venue check-in poster">
          <img className="gng-poster-logo" src={`${process.env.PUBLIC_URL}/logo.png`} alt="" />
          <div>
            <span className="gng-nav-label" style={{ margin: 0 }}>Get Up &amp; Go</span>
            <h2>Check in here</h2>
            <p className="gng-muted" style={{ margin: "4px 0 0", fontSize: 17 }}>{venueName}</p>
          </div>
          <QRCodeCanvas id={VENUE_QR_ID} value={`partner:${partnerUid}`} size={840} level="H" marginSize={2} fgColor={QR_FG} bgColor={QR_BG} />
          <span className="gng-pill gng-pill-progress">+50 Go-Points for every check-in</span>
        </section>

        <aside className="gng-panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20 }}>Put it at the door</h2>
            <p className="gng-muted" style={{ margin: "6px 0 0", fontSize: 14 }}>
              One code for your venue. It checks Goers in to whichever of your Happenings is on.
            </p>
          </div>

          <ol className="gng-steps">
            <li><b>1</b><span>Goers open your Happening in the app</span></li>
            <li><b>2</b><span>They tap <strong>Check in</strong> and scan this code</span></li>
            <li><b>3</b><span>They earn +50 GP and you see the check-in on your dashboard</span></li>
          </ol>

          {message ? <div className="gng-alert gng-alert-success" role="status">{message}</div> : null}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
            <button type="button" className="gng-btn gng-btn-primary" onClick={() => run("pdf")} disabled={busy !== null}>
              {icon("pdf", FileDown)} Download PDF poster
            </button>
            <button type="button" className="gng-btn gng-btn-secondary" onClick={() => run("print")} disabled={busy !== null}>
              {icon("print", Printer)} Print
            </button>
            <button type="button" className="gng-btn gng-btn-ghost" onClick={() => run("share")} disabled={busy !== null}>
              {icon("share", Share2)} Share
            </button>
            <button type="button" className="gng-btn gng-btn-ghost" onClick={() => downloadCanvas(VENUE_QR_ID, `${venueName} venue QR`)}>
              <Download size={18} aria-hidden="true" /> Download PNG only
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
