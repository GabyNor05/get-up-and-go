import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../shared-firebase/config/firebase";

export interface LiveCollection<T> {
  items: (T & { id: string })[];
  loading: boolean;
  error: string | null;
}

/** Live snapshot of a whole collection (admin views; small datasets) */
export function useLiveCollection<T>(name: string): LiveCollection<T> {
  const [items, setItems] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, name),
      (snapshot) => {
        setItems(snapshot.docs.map((d) => ({ ...(d.data() as T), id: d.id })));
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error(`${name} listener error:`, err);
        setError(`Couldn't load ${name.replace("_", " ")}. Check Firestore rules for admins.`);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [name]);

  return { items, loading, error };
}
