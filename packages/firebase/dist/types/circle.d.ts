import { Timestamp } from 'firebase/firestore';
export interface CardBgTheme {
    light: string;
    dark: string;
}
export interface Circle {
    id?: string;
    title: string;
    description?: string;
    emoji: string;
    accent: string;
    card_bg: CardBgTheme;
    tags: string[];
    goer_ids: string[];
    max_size: number;
    everybody_sends_invites: boolean;
    created_at: Timestamp;
    created_by: string;
}
export interface CreateCircleDTO {
    title: string;
    emoji: string;
    accent: string;
    cardBg: CardBgTheme;
    tags: string[];
    maxSize: number;
    everybodySendsInvites?: boolean;
    creatorGoerId: string;
    inviteeGoerIds?: string[];
}
//# sourceMappingURL=circle.d.ts.map