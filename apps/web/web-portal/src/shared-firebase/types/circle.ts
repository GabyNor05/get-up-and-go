import { Timestamp } from 'firebase/firestore';

export interface CardBgTheme {
  light: string;
  dark: string;
}

export interface Circle {
  id?: string;                        // Firestore Document ID
  title: string;                      // Circle Name
  description?: string;               // Optional description
  emoji: string;                      // Selected icon/emoji
  accent: string;                     // Primary hex color
  card_bg: CardBgTheme;               // Light & Dark background colors
  tags: string[];                     // Category tags (up to 4)
  goer_ids: string[];                 // Array of member IDs (FK references to goers)
  max_size: number;                   // Max circle capacity (e.g. 20)
  everybody_sends_invites: boolean;   // Permissions toggle
  created_at: Timestamp;              // Server timestamp
  created_by: string;                 // UID of the creator
}

// DTO for creating a new Circle from your form UI
export interface CreateCircleDTO {
  title: string;
  emoji: string;
  accent: string;
  cardBg: CardBgTheme;
  tags: string[];
  maxSize: number;
  everybodySendsInvites?: boolean;
  creatorGoerId: string;
  inviteeGoerIds?: string[];           // Initial invitees added during creation
}