import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../config/firebase"; 
import { Happening, HappeningCategory } from "../types/happening";

const COLLECTION_NAME = "happenings";

// Helper to compute distance in kilometers between two GPS coordinates
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const happeningService = {
  /**
   * Fetch happenings with optional category filter and distance calculation
   */
  async fetchHappenings(
    categoryFilter?: string,
    userLocation?: { latitude: number; longitude: number }
  ) {
    const constraints: QueryConstraint[] = [];

    // ONLY add the category filter if it's NOT "ALL" and NOT empty
    if (categoryFilter && categoryFilter !== "ALL") {
      constraints.push(where("category", "==", categoryFilter));
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();

      let distanceKm = 0;
      if (userLocation && data.location?.latitude && data.location?.longitude) {
        distanceKm = calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          data.location.latitude,
          data.location.longitude
        );
      }

      return {
        id: docSnap.id,
        ...data,
        distanceKm,
      } as Happening & { distanceKm: number };
    });
  },

  /**
   * Fetch all upcoming happenings
   */
  async getUpcomingHappenings(): Promise<Happening[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("dateTime", ">=", Timestamp.now()),
      orderBy("dateTime", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Happening));
  },

  /**
   * Fetch happenings by category
   */
  async getByCategory(category: HappeningCategory): Promise<Happening[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("category", "==", category),
      orderBy("dateTime", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Happening));
  },

  /**
   * Fetch a single happening by ID
   */
  async getById(id: string): Promise<Happening | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Happening;
  },

  /**
   * Toggle RSVP status for a user
   */
  async toggleRsvp(happeningId: string, userId: string, isRsvpd: boolean): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, happeningId);
    await updateDoc(docRef, {
      rsvps: isRsvpd ? arrayRemove(userId) : arrayUnion(userId),
    });
  },

  /**
   * Check-in an attendee
   */
  async checkInAttendee(happeningId: string, userId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, happeningId);
    await updateDoc(docRef, {
      attendees: arrayUnion(userId),
    });
  },

  /**
   * Create a new happening
   */
  async createHappening(data: Omit<Happening, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return docRef.id;
  },
};