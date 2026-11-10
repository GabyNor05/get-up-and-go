import type { User } from "../shared-firebase/types";

/** Accounts that are always admins on the portal, whatever their app role */
export const ADMIN_EMAILS = ["gabynorris616@gmail.com", "gabby.norris616@gmail.com"];

/**
 * Code a new admin types when signing up. This is a front-end check only:
 * real protection must come from Firestore security rules.
 */
export const ADMIN_INVITE_CODE = "GNG-ADMIN-2026";

export type PortalRole = "admin" | "partner" | "none";

export function portalRole(user: Pick<User, "role"> | null, email: string | null | undefined): PortalRole {
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) return "admin";
  if (user?.role === "admin") return "admin";
  if (user?.role === "partner") return "partner";
  return "none";
}
