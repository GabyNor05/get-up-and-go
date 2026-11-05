import { Timestamp, GeoPoint } from "firebase/firestore";

export type HappeningCategory = 
  | "ALL"
  | "NATURE"
  | "MUSIC"
  | "GAMES"
  | "FAMILY"
  | "SPORT"
  | "FOOD"; // Adjust ENUM values as needed

export interface Happening {
  id: string;
  partner_id: number;
  title: string;
  thumbnail_url: string;
  description: string;
  dateTime: Timestamp;
  google_maps_link: string;
  locationName: string;
  coordinates: GeoPoint;
  rsvps: string[]; // User IDs who RSVP'd
  attendees: string[]; // User IDs who checked in/attended
  category: HappeningCategory;
}

