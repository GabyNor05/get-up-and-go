import { Circle, CreateCircleDTO } from '../types/circle.ts';
export declare const circleService: {
    /**
     * Create a new Circle document in Firestore
     */
    createCircle(data: CreateCircleDTO): Promise<string>;
    /**
     * Fetch a single Circle by Document ID
     */
    getCircleById(circleId: string): Promise<Circle | null>;
    /**
     * Fetch all Circles that a specific Goer belongs to
     */
    getCirclesForGoer(goerId: string): Promise<Circle[]>;
    /**
     * Add a new member (Goer) to a Circle
     */
    addMemberToCircle(circleId: string, goerId: string): Promise<void>;
    /**
     * Remove a member (Goer) from a Circle / Leave Circle
     */
    removeMemberFromCircle(circleId: string, goerId: string): Promise<void>;
};
//# sourceMappingURL=circlesService.d.ts.map