import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Goer, CreateGoerData, GoerPermissions } from "../types/goer";

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
        trend_notifications: true, // Retained preference, push_notifications removed
        disliked_category: null,
        ...data.preferences,
      },
      permissions: {
        location: false,
        camera: false,
        pushNotifications: false,
        showLocation: true,
        profileVisibility: "public",
        ...data.permissions,
      },
    };

    await setDoc(goerRef, newGoer);
  },

  /**
   * Finds a Goer by their public Goer ID (e.g. "ZDUX-08-DP")
   */
  async findByGoerId(goerId: string): Promise<Goer | null> {
    const q = query(
      collection(db, GOERS_COLLECTION),
      where("goer_id", "==", goerId.trim().toUpperCase()),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : (snap.docs[0].data() as Goer);
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
   * Specifically update permission settings for a Goer
   */
  async updatePermissions(uid: string, permissions: Partial<GoerPermissions>): Promise<void> {
    const goerRef = doc(db, GOERS_COLLECTION, uid);
    await updateDoc(goerRef, {
      permissions: permissions,
    });
  },

  /**
   * Adds a Circle ID to the Goer's circles array
   */
  async joinCircle(uid: string, circleId: string): Promise<void> {
    const goerRef = doc(db, GOERS_COLLECTION, uid);
    // merge: works even if the goers doc hasn't been created yet
    await setDoc(goerRef, { circles: arrayUnion(circleId) }, { merge: true });
  },

  /**
   * Removes a Circle ID from the Goer's circles array
   */
  async leaveCircle(uid: string, circleId: string): Promise<void> {
    const goerRef = doc(db, GOERS_COLLECTION, uid);
    await setDoc(goerRef, { circles: arrayRemove(circleId) }, { merge: true });
  }
};