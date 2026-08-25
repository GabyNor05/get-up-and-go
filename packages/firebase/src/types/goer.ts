export interface Goer {
  id?: string;
  uid: string;
  goer_id: string; // e.g. "ZDUX-08-DP"
  avatarPublicId: string;
  level_id?: string;
  circles: string[];
  circle_manager?: string;
  ping_mes: string[];
  total_gp: number;
  monthly_gp: number;
  preferences?: Record<string, any>;
  privacy?: Record<string, any>;
}

export interface CreateGoerData {
  uid: string;
  goer_id: string;
  avatarPublicId: string;
}