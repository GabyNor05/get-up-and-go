import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import { auth, db } from '../../../packages/firebase/src/config/firebase';

/** Emails that see the developer tools in Settings */
const ADMIN_EMAILS = ['gabynorris616@gmail.com', 'gabby.norris616@gmail.com'];

export interface GoerIdentity {
  /** Firebase Auth UID */
  goerId: string | null;
  username: string;
  email: string | null;
  role: string | null;
  /** Gaby's account (or any `admin` role): shows dev tools */
  isAdmin: boolean;
  loading: boolean;
}

const FALLBACK_NAME = 'A goer';

/** The signed-in Goer, kept live with their `users` doc (so profile edits show straight away) */
export function useGoer(): GoerIdentity {
  const [goerId, setGoerId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState(FALLBACK_NAME);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeUser?.();
      unsubscribeUser = undefined;

      if (!firebaseUser) {
        setGoerId(null);
        setEmail(null);
        setUsername(FALLBACK_NAME);
        setRole(null);
        setLoading(false);
        return;
      }

      setGoerId(firebaseUser.uid);
      setEmail(firebaseUser.email);
      unsubscribeUser = onSnapshot(
        doc(db, 'users', firebaseUser.uid),
        (snap) => {
          const data = snap.data();
          setUsername((data?.username as string | undefined) || firebaseUser.email?.split('@')[0] || FALLBACK_NAME);
          setRole((data?.role as string | undefined) ?? null);
          setLoading(false);
        },
        (err) => {
          console.warn('Could not load user profile', err);
          setLoading(false);
        },
      );
    });

    return () => {
      unsubscribeUser?.();
      unsubscribeAuth();
    };
  }, []);

  const isAdmin = role === 'admin' || (!!email && ADMIN_EMAILS.includes(email.toLowerCase()));

  return { goerId, username, email, role, isAdmin, loading };
}
