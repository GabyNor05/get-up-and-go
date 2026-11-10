import type { Timestamp } from "firebase/firestore";

import type { Circle, Goer, Happening, Partner, User } from "../shared-firebase/types";

export type UserDoc = User & { id: string; status?: "active" | "suspended" };
export type PartnerDoc = Partner & { id: string };
export type GoerDoc = Goer & { id: string };
export type CircleDoc = Circle & { id: string };
export type HappeningDoc = Happening & { demo?: boolean };

export type TicketStatus = "open" | "resolved";

/** `support_tickets` collection (written by the app's Help & Support form) */
export interface SupportTicket {
  id: string;
  uid?: string;
  username?: string;
  email?: string;
  subject: string;
  message: string;
  topic?: string;
  status: TicketStatus;
  source?: "app" | "portal";
  admin_note?: string;
  created_at?: Timestamp;
  resolved_at?: Timestamp;
}

export const tsMillis = (value: unknown): number => {
  const ts = value as { toMillis?: () => number } | undefined;
  return ts?.toMillis?.() ?? 0;
};

/** Same thresholds as the app's `levels` collection */
export const LEVELS = [
  { level: 1, title: "Starter", target: 0 },
  { level: 2, title: "Explorer", target: 150 },
  { level: 3, title: "Regular", target: 400 },
  { level: 4, title: "Trailblazer", target: 800 },
  { level: 5, title: "Local Legend", target: 1500 },
];

export function levelFor(gp: number) {
  return [...LEVELS].reverse().find((l) => gp >= l.target) ?? LEVELS[0];
}

export function nextLevelFor(gp: number) {
  return LEVELS.find((l) => l.target > gp) ?? null;
}

export type DetailKind = "goer" | "circle" | "happening" | "partner";
export type DetailRef = { kind: DetailKind; id: string } | null;
