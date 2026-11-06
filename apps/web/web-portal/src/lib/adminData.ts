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
