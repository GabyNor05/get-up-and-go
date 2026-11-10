import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "../shared-firebase/config/firebase";
import type { Happening } from "../shared-firebase/types";
import { millis } from "../lib/format";

export interface PartnerHappeningsState {
  happenings: Happening[];
  loading: boolean;
  error: string | null;
}

/** Live list of a partner's Happenings, soonest first */
export function usePartnerHappenings(partnerUid: string): PartnerHappeningsState {
  const [happenings, setHappenings] = useState<Happening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "happenings"), where("partner_id", "==", partnerUid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setHappenings(
          snapshot.docs
            .map((d) => ({ ...(d.data() as Omit<Happening, "id">), id: d.id }))
            .sort((a, b) => millis(a) - millis(b))
        );
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Happenings listener error:", err);
        setError("We couldn't load your Happenings. Refresh the page to try again.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [partnerUid]);

  return { happenings, loading, error };
}
