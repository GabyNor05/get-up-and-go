import { Goer, CreateGoerDTO } from '../types/circle.ts';
export declare const goerService: {
    /**
     * Create or initialize a Goer record in Firestore upon sign up
     */
    createGoer(data: CreateGoerDTO): Promise<void>;
    /**
     * Fetch Goer profile details by UID
     */
    getGoerById(uid: string): Promise<Goer | null>;
    /**
     * Update avatar public ID for an existing Goer
     */
    updateAvatar(uid: string, avatarPublicId: string): Promise<void>;
};
//# sourceMappingURL=goerService.d.ts.map