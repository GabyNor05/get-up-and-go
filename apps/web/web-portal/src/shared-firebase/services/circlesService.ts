import { 
  db 
} from '../config/firebase'; // Adjust to your Firebase config import path
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { Circle, CreateCircleDTO } from '../types/circle';

const CIRCLES_COLLECTION = 'circles';

export const circleService = {
  /**
   * Create a new Circle document in Firestore
   */
  async createCircle(data: CreateCircleDTO): Promise<string> {
    const initialMembers = [
      data.creatorGoerId, 
      ...(data.inviteeGoerIds || [])
    ];

    const newCircleData = {
      title: data.title.trim(),
      emoji: data.emoji,
      accent: data.accent,
      card_bg: data.cardBg,
      tags: data.tags || [],
      goer_ids: initialMembers,
      max_size: data.maxSize || 20,
      everybody_sends_invites: data.everybodySendsInvites ?? true,
      created_by: data.creatorGoerId,
      created_at: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, CIRCLES_COLLECTION), newCircleData);
    return docRef.id;
  },

  /**
   * Fetch a single Circle by Document ID
   */
  async getCircleById(circleId: string): Promise<Circle | null> {
    const docRef = doc(db, CIRCLES_COLLECTION, circleId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Circle;
  },

  /**
   * Fetch all Circles that a specific Goer belongs to
   */
  async getCirclesForGoer(goerId: string): Promise<Circle[]> {
    const q = query(
      collection(db, CIRCLES_COLLECTION),
      where('goer_ids', 'array-contains', goerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Circle[];
  },

  /**
   * Add a new member (Goer) to a Circle
   */
  async addMemberToCircle(circleId: string, goerId: string): Promise<void> {
    const docRef = doc(db, CIRCLES_COLLECTION, circleId);
    await updateDoc(docRef, {
      goer_ids: arrayUnion(goerId)
    });
  },

  /**
   * Remove a member (Goer) from a Circle / Leave Circle
   */
  async removeMemberFromCircle(circleId: string, goerId: string): Promise<void> {
    const docRef = doc(db, CIRCLES_COLLECTION, circleId);
    await updateDoc(docRef, {
      goer_ids: arrayRemove(goerId)
    });
  }
};

