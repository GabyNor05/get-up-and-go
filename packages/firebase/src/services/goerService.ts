import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Goer, CreateGoerData } from "../types/goer";

const GOERS_COLLECTION = "goers";

export const goerService = {
  /**
   * Initializes a new Goer document in Firestore
   */
  async createGoer(data: CreateGoerData): Promise<void> {
    const goerRef = doc(db, GOERS_COLLECTION, data.uid);
    
    const newGoer: Goer = {
      uid: data.uid,
      goer_id: data.goer_id,
      avatarPublicId: data.avatarPublicId,
      circles: [],
      ping_mes: [],
      total_gp: 0,
      monthly_gp: 0,
      preferences: {
        theme: "light",
        font_size: 14,
        font: "System",
        units: "metric",
        push_notifications: true,
        trend_notifications: true,
        disliked_category: null,
      },
      privacy: {
        hide_email: false,
        location_sharing: true,
        profile_sharing: true,
      },
    };

    await setDoc(goerRef, newGoer);
  },

  /**
   * Retrieves a Goer profile by auth UID
   */
  async getGoer(uid: string): Promise<Goer | null> {
    const goerRef = doc(db, GOERS_COLLECTION, uid);
    const snap = await getDoc(goerRef);
    return snap.exists() ? (snap.data() as Goer) : null;
  },

  /**
   * Partial updates for Goer profile (e.g., updating preferences or avatar)
   */
  async updateGoer(uid: string, updates: Partial<Goer>): Promise<void> {
    const goerRef = doc(db, GOERS_COLLECTION, uid);
    await updateDoc(goerRef, updates);
  },

  /**
   * Adds a Circle ID to the Goer's circles array
   */
  async joinCircle(uid: string, circleId: string): Promise<void> {
    const goerRef = doc(db, GOERS_COLLECTION, uid);
    await updateDoc(goerRef, {
      circles: arrayUnion(circleId),
    });
  },

  /**
   * Removes a Circle ID from the Goer's circles array
   */
  async leaveCircle(uid: string, circleId: string): Promise<void> {
    const goerRef = doc(db, GOERS_COLLECTION, uid);
    await updateDoc(goerRef, {
      circles: arrayRemove(circleId),
    });
  }
};