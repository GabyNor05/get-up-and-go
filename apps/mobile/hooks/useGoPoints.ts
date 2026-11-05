import { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';

import { db } from '../../../packages/firebase/src/config/firebase';
import type { Goer } from '../../../packages/firebase/src/types/goer';
import type { Level } from '../../../packages/firebase/src/types/level';

export interface GoPointsState {
  goer: Goer | null;
  totalGp: number;
  monthlyGp: number;
  currentLevel: Level | null;
  nextLevel: Level | null;
  /** 0–1 progress from the current level's target to the next one */
  progress: number;
  gpToNext: number;
  loading: boolean;
}

/** Fallback so the UI still works before `levels` is seeded */
const DEFAULT_LEVELS: Level[] = [
  { level: 1, title: 'Starter', gp_target: 0 },
  { level: 2, title: 'Explorer', gp_target: 150 },
  { level: 3, title: 'Regular', gp_target: 400 },
  { level: 4, title: 'Trailblazer', gp_target: 800 },
  { level: 5, title: 'Local Legend', gp_target: 1500 },
];

/** Live Go-Points + level for a Goer (goers/{uid}) */
export function useGoPoints(uid: string | null): GoPointsState {
  const [goer, setGoer] = useState<Goer | null>(null);
  const [levels, setLevels] = useState<Level[]>(DEFAULT_LEVELS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'levels'), orderBy('gp_target', 'asc')));
        if (!snapshot.empty) {
          setLevels(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Level) })));
        }
      } catch (err) {
        console.warn('Could not load levels, using defaults', err);
      }
    };
    loadLevels();
  }, []);

  useEffect(() => {
    if (!uid) {
      setGoer(null);
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(
      doc(db, 'goers', uid),
      (snap) => {
        setGoer(snap.exists() ? (snap.data() as Goer) : null);
        setLoading(false);
      },
      (err) => {
        console.warn('Could not load Go-Points', err);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [uid]);

  return useMemo(() => {
    const totalGp = goer?.total_gp ?? 0;
    const monthlyGp = goer?.monthly_gp ?? 0;
    const reached = levels.filter((l) => totalGp >= l.gp_target);
    const currentLevel = reached[reached.length - 1] ?? levels[0] ?? null;
    const nextLevel = levels.find((l) => l.gp_target > totalGp) ?? null;
    const base = currentLevel?.gp_target ?? 0;
    const progress = nextLevel ? (totalGp - base) / (nextLevel.gp_target - base) : 1;
    return {
      goer,
      totalGp,
      monthlyGp,
      currentLevel,
      nextLevel,
      progress: Math.max(0, Math.min(1, progress)),
      gpToNext: nextLevel ? nextLevel.gp_target - totalGp : 0,
      loading,
    };
  }, [goer, levels, loading]);
}
