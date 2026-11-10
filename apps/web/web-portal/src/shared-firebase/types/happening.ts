import { Timestamp, GeoPoint } from "firebase/firestore";

export type HappeningCategory =
  | "ALL"
  | "NATURE"
  | "MUSIC"
  | "GAMES"
  | "FAMILY"
  | "SPORT"
  | "FOOD"
  | "COMMUNITY";

export interface Happening {
  id: string;
  /** Firebase Auth UID of the partner who owns this Happening. Venue QR = `partner:<partner_id>` */
  partner_id: string;
  title: string;
  thumbnail_url: string;
  description: string;
  dateTime: Timestamp;
  google_maps_link: string;
  locationName: string;
  coordinates: GeoPoint;
  rsvps: string[]; // Goer UIDs who RSVP'd
  attendees: string[]; // Goer UIDs who checked in
  category: HappeningCategory;
}

/** Fields a partner can edit after creation */
export type HappeningUpdate = Partial<Omit<Happening, "id" | "partner_id" | "rsvps" | "attendees">>;
