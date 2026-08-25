import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Partner, CreatePartnerData } from "../types/partner";

const PARTNERS_COLLECTION = "partners";

export const partnerService = {
  /**
   * Initialize a new Partner profile in Firestore
   */
  async createPartner(data: CreatePartnerData): Promise<void> {
    const partnerRef = doc(db, PARTNERS_COLLECTION, data.uid);
    
    const newPartner: Partner = {
      uid: data.uid,
      bio: data.bio || "",
      profileImg: data.profileImg || "",
      venue_images: data.venue_images || [],
      website: data.website || "",
      google_maps_link: "",
    };

    await setDoc(partnerRef, newPartner);
  },

  /**
   * Fetch partner profile details by UID
   */
  async getPartner(uid: string): Promise<Partner | null> {
    const partnerRef = doc(db, PARTNERS_COLLECTION, uid);
    const snap = await getDoc(partnerRef);
    return snap.exists() ? (snap.data() as Partner) : null;
  },

  /**
   * Update partner fields (bio, website, coordinates, etc.)
   */
  async updatePartner(uid: string, updates: Partial<Partner>): Promise<void> {
    const partnerRef = doc(db, PARTNERS_COLLECTION, uid);
    await updateDoc(partnerRef, updates);
  },

  /**
   * Add image identifier(s) to the venue_images array
   */
  async addVenueImages(uid: string, imageIds: string[]): Promise<void> {
    const partnerRef = doc(db, PARTNERS_COLLECTION, uid);
    await updateDoc(partnerRef, {
      venue_images: arrayUnion(...imageIds),
    });
  },

  /**
   * Remove an image identifier from the venue_images array
   */
  async removeVenueImage(uid: string, imageId: string): Promise<void> {
    const partnerRef = doc(db, PARTNERS_COLLECTION, uid);
    await updateDoc(partnerRef, {
      venue_images: arrayRemove(imageId),
    });
  }
};