import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../config/firebase";
import { User, CreateUserData } from "../types/user";

const USERS_COLLECTION = "users";

export const userService = {
  /**
   * Create base user credential record upon signup
   */
  async createUser(data: CreateUserData): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, data.uid);
    await setDoc(userRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Fetch base user data by auth UID
   */
  async getUser(uid: string): Promise<User | null> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? (snap.data() as User) : null;
  },

  /**
   * Update core user attributes (e.g., username)
   */
  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, updates);
  }
};