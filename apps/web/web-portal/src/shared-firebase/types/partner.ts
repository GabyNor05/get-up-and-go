import { GeoPoint } from "firebase/firestore";

export interface Partner {
  id?: string;
  uid: string;
  venue_name?: string; // shown on the portal and venue QR
  locationName?: string;
  bio?: string;
  profileImg?: string;
  venue_images: string[]; // Public IDs / URLs of venue images
  website?: string;
  coordinates?: GeoPoint;
  google_maps_link?: string;
}

export interface CreatePartnerData {
  uid: string;
  venue_name?: string;
  locationName?: string;
  google_maps_link?: string;
  bio?: string;
  profileImg?: string;
  venue_images?: string[];
  website?: string;
}