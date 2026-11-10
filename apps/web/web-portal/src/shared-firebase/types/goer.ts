export interface GoerPermissions {
  location: boolean;
  camera: boolean;
  pushNotifications: boolean;
  showLocation?: boolean;
  profileVisibility?: "public" | "friends" | "private";
  [key: string]: any; // Allows additional dynamic permission/privacy flags if needed
}

export interface GoerPreferences {
  darkMode?: boolean;

  [key: string]: any; // General app preferences (pushNotifications removed)
}

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
  preferences?: GoerPreferences;
  permissions?: GoerPermissions; // Replaced privacy with permissions
}

export interface CreateGoerData {
  uid: string;
  goer_id: string;
  avatarPublicId: string;
  permissions?: GoerPermissions;
  preferences?: GoerPreferences;
}