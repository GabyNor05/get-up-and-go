import { useEffect, useState } from 'react';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';

import { db } from '../../../packages/firebase/src/config/firebase';
import type { Circle } from '../../../packages/firebase/src/types/circle';

export interface CircleMember {
  uid: string;
  username: string;
  monthlyGp: number;
  totalGp: number;
}

/** Live list of the Circles a Goer belongs to */
export function useMyCircles(uid: string | null) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setCircles([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'circles'), where('goer_ids', 'array-contains', uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs
          .map((d) => ({ id: d.id, ...(d.data() as Circle) }))
          .sort((a, b) => a.title.localeCompare(b.title));
        setCircles(next);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.warn('Could not load Circles', err);
        setError("We couldn't load your Circles. Pull to try again.");
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [uid]);

  return { circles, loading, error };
}

async function loadMember(uid: string): Promise<CircleMember> {
  try {
    const [userSnap, goerSnap] = await Promise.all([getDoc(doc(db, 'users', uid)), getDoc(doc(db, 'goers', uid))]);
    const goer = goerSnap.data();
    return {
      uid,
      username: (userSnap.data()?.username as string | undefined) ?? 'Goer',
      monthlyGp: (goer?.monthly_gp as number | undefined) ?? 0,
      totalGp: (goer?.total_gp as number | undefined) ?? 0,
    };
  } catch {
    return { uid, username: 'Goer', monthlyGp: 0, totalGp: 0 };
  }
}

/** Live single Circle plus its members ranked by GP this month */
export function useCircle(circleId: string | undefined) {
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!circleId) return;
    const unsubscribe = onSnapshot(
      doc(db, 'circles', circleId),
      async (snap) => {
        if (!snap.exists()) {
          setCircle(null);
          setMembers([]);
          setLoading(false);
          return;
        }
        const next = { id: snap.id, ...(snap.data() as Circle) };
        setCircle(next);
        const loaded = await Promise.all((next.goer_ids ?? []).map(loadMember));
        setMembers(loaded.sort((a, b) => b.monthlyGp - a.monthlyGp));
        setLoading(false);
      },
      (err) => {
        console.warn('Could not load Circle', err);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [circleId]);

  return { circle, members, loading };
}
