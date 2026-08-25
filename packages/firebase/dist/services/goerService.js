import { db } from '../config/firebase.ts'; // Adjust to your Firebase config import path
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
const GOERS_COLLECTION = 'goers';
export const goerService = {
    /**
     * Create or initialize a Goer record in Firestore upon sign up
     */
    async createGoer(data) {
        const userRef = doc(db, GOERS_COLLECTION, data.uid);
        await setDoc(userRef, {
            email: data.email,
            avatar_url: data.avatarPublicId, // Storing public ID directly
            created_at: serverTimestamp(),
        });
    },
    /**
     * Fetch Goer profile details by UID
     */
    async getGoerById(uid) {
        const userRef = doc(db, GOERS_COLLECTION, uid);
        const snap = await getDoc(userRef);
        if (!snap.exists())
            return null;
        return { id: snap.id, ...snap.data() };
    },
    /**
     * Update avatar public ID for an existing Goer
     */
    async updateAvatar(uid, avatarPublicId) {
        const userRef = doc(db, GOERS_COLLECTION, uid);
        await updateDoc(userRef, {
            avatar_url: avatarPublicId,
        });
    }
};
//# sourceMappingURL=goerService.js.map