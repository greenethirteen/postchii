'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseReady } from './firebase';

// undefined = still loading, null = signed out, object = signed in
export function useUser() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (!firebaseReady()) {
      setUser(null);
      return;
    }
    return onAuthStateChanged(auth(), setUser);
  }, []);

  return user;
}
