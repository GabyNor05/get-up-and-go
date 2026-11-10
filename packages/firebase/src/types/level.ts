/** `levels` collection — Go-Points thresholds */
export interface Level {
  id?: string;
  level: number; // 1, 2, 3 …
  title: string; // e.g. "Explorer"
  gp_target: number; // total GP needed to reach this level
}
