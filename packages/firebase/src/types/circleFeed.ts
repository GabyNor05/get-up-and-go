import { Timestamp } from "firebase/firestore";

export type CircleFeedType = "rsvp" | "check_in" | "me_too" | "joined";

/** `circle_feed` collection — the "What We're Doing" feed inside a Circle */
export interface CircleFeedItem {
  id?: string;
  circle_id: string;
  goer_uid: string;
  username: string; // denormalised for display
  type: CircleFeedType;
  happening_id?: string;
  happening_title?: string; // denormalised so the feed doesn't need a second read
  created_at: Timestamp;
}
