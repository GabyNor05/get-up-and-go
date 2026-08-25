import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from "firebase/auth";
import { auth } from "../config/firebase";
import { userService } from "./userService";
import { goerService } from "./goerService";
import { partnerService } from "./partnerService";
import { generateGoerId } from "../utils/generateGoerId";
import { UserRole } from "../types/user";

export interface SignUpParams {
  email: string;
  password: string;
  username: string;
  role: UserRole;
  avatarPublicId?: string; // Goer only
  bio?: string;            // Partner only
  profileImg?: string;     // Partner only
  venue_images?: string[]; // Partner only
  website?: string;        // Partner only
}

export const authService = {
  async signUp({ 
    email, 
    password, 
    username, 
    role, 
    avatarPublicId, 
    bio,
    profileImg,
    venue_images,
    website
  }: SignUpParams): Promise<FirebaseUser> {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const firebaseUser = credential.user;

    // 1. Create base user document
    await userService.createUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email || email,
      username,
      role,
    });

    // 2. Delegate to role-specific service
    if (role === "goer" && avatarPublicId) {
      const goerId = generateGoerId(username, role);

      await goerService.createGoer({
        uid: firebaseUser.uid,
        goer_id: goerId,
        avatarPublicId,
      });
    } else if (role === "partner") {
      await partnerService.createPartner({
        uid: firebaseUser.uid,
        bio: bio || "",
        profileImg: profileImg || "",
        venue_images: venue_images || [],
        website: website || "",
      });
    }

    return firebaseUser;
  },

  async login(email: string, password: string): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};