import { Timestamp } from 'firebase/firestore';
export interface Goer {
    id?: string;
    email: string;
    avatar_url: string;
    created_at: Timestamp;
}
export interface CreateGoerDTO {
    uid: string;
    email: string;
    avatarPublicId: string;
}
//# sourceMappingURL=goer.d.ts.map