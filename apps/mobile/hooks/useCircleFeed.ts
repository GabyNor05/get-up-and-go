import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { db } from '../../../packages/firebase/src/config/firebase';
import type { CircleFeedItem } from '../../../packages/firebase/src/types/circleFeed';

export interface CircleFeedState {
  items: CircleFeedItem[];
  loading: boolean;
}

const MAX_IN_QUERY = 10; // Firestore `in` limit

/**
 * Live "What We're Doing" feed for one or more Circles, newest first.
 * Sorted on the client so no composite index is needed.
 */
export function useCircleFeed(circleIds: string[], max = 20): CircleFeedState {
  const [items, setItems] = useState<CircleFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const key = circleIds.slice(0, MAX_IN_QUERY).sort().join('|');

  useEffect(() => {
    const ids = key ? key.split('|') : [];
    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'circle_feed'), where('circle_id', 'in', ids));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs
          .map((d) => ({ id: d.id, ...(d.data() as CircleFeedItem) }))
          .sort((a, b) => (b.created_at?.toMillis?.() ?? 0) - (a.created_at?.toMillis?.() ?? 0))
          .slice(0, max);
        setItems(next);
        setLoading(false);
      },
      (err) => {
        console.warn('Could not load Circle feed', err);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [key, max]);

  return { items, loading };
}

/** "DesiP checked in at Wild Café" */
export function describeFeedItem(item: CircleFeedItem): string {
  const title = item.happening_title ?? 'a Happening';
  switch (item.type) {
    case 'rsvp':
      return `is going to ${title}`;
    case 'check_in':
      return `checked in at ${title}`;
    case 'me_too':
      return `said Me Too to ${title}`;
    case 'joined':
      return 'joined the Circle';
    default:
      return 'was out and about';
  }
}

/** "25m ago", "3h ago", "2d ago" */
export function timeAgo(millis: number): string {
  const minutes = Math.max(1, Math.round((Date.now() - millis) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
