import type { Happening } from "../shared-firebase/types";

export type Category = "NATURE" | "MUSIC" | "GAMES" | "FAMILY" | "SPORT" | "FOOD" | "COMMUNITY";

export const CATEGORIES: Category[] = ["NATURE", "MUSIC", "GAMES", "FAMILY", "SPORT", "FOOD", "COMMUNITY"];

/** Category colours from the design system (always shown with their label, dark text on top) */
export const CATEGORY_COLORS: Record<Category, string> = {
  NATURE: "#A6C261",
  MUSIC: "#A88AED",
  GAMES: "#E87D6C",
  FAMILY: "#E8A84C",
  FOOD: "#6CB8E8",
  SPORT: "#7DC98A",
  COMMUNITY: "#A88AED",
};

/** Emails that always get the Admin page (plus any users.role === "admin") */
export const ADMIN_EMAILS = ["gabynorris616@gmail.com", "gabby.norris616@gmail.com"];

export const millis = (h: Happening): number => h.dateTime?.toMillis?.() ?? 0;

export function formatDateTime(h: Happening): string {
  if (!h.dateTime?.toDate) return "No date set";
  return h.dateTime.toDate().toLocaleString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDay(date: Date): string {
  return date.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" });
}

export function titleCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function categoryColor(category: string | undefined): string {
  return CATEGORY_COLORS[(category ?? "COMMUNITY") as Category] ?? CATEGORY_COLORS.COMMUNITY;
}

export function downloadCanvas(canvasId: string, fileName: string): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${fileName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "qr"}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
