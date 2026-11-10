import { jsPDF } from "jspdf";

const BEIGE = "#F4F0DD";
const INK = "#1A1A1A";
const INK_SOFT = "#605E55";
const BRAND = "#5B4C9E";

async function loadImage(src: string): Promise<string | null> {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** A4 "Check in here" poster with the venue QR, ready to print or share */
export async function buildVenuePoster(venueName: string, qrCanvasId: string): Promise<jsPDF> {
  const canvas = document.getElementById(qrCanvasId) as HTMLCanvasElement | null;
  if (!canvas) throw new Error("QR code isn't on the page yet");

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;

  pdf.setFillColor(BEIGE);
  pdf.rect(0, 0, W, H, "F");

  const logo = await loadImage(`${process.env.PUBLIC_URL}/logo.png`);
  if (logo) pdf.addImage(logo, "PNG", W / 2 - 11, 18, 22, 24);

  pdf.setTextColor(BRAND);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("GET UP & GO", W / 2, 52, { align: "center" });

  pdf.setTextColor(INK);
  pdf.setFontSize(40);
  pdf.text("Check in here", W / 2, 72, { align: "center" });

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(INK_SOFT);
  pdf.text(venueName, W / 2, 84, { align: "center" });

  // White card behind the QR
  const qrSize = 120;
  const qrX = (W - qrSize) / 2;
  const qrY = 96;
  pdf.setFillColor("#FFFFFF");
  pdf.roundedRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 6, 6, "F");
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", qrX, qrY, qrSize, qrSize);

  const steps = [
    "1. Open the Get Up & Go app and find this Happening",
    "2. Tap Check in and point your camera at this code",
    "3. Earn +50 Go-Points and level up",
  ];
  pdf.setTextColor(INK);
  pdf.setFontSize(15);
  steps.forEach((line, i) => pdf.text(line, W / 2, 246 + i * 10, { align: "center" }));

  pdf.setFontSize(11);
  pdf.setTextColor(INK_SOFT);
  pdf.text("Less scrolling. More showing up.", W / 2, H - 14, { align: "center" });

  return pdf;
}

export function posterFileName(venueName: string): string {
  return `${venueName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "venue"}-check-in-qr.pdf`;
}
