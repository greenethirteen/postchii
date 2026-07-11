import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Local dev against `firebase emulators:start` — no real Firebase project needed.
const useEmulator = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === '1';

// Lazy init so importing this module never touches Firebase at build time.
function app() {
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

// connect*Emulator may only be called once per service instance; the globals
// guard against re-runs under Next.js hot reload.
const g = globalThis;

export const auth = () => {
  const a = getAuth(app());
  if (useEmulator && !a.emulatorConfig) {
    connectAuthEmulator(a, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
  return a;
};

export const db = () => {
  const d = getFirestore(app());
  if (useEmulator && !g.__ppFirestoreEmu) {
    connectFirestoreEmulator(d, '127.0.0.1', 8080);
    g.__ppFirestoreEmu = true;
  }
  return d;
};

export const storage = () => {
  const s = getStorage(app());
  if (useEmulator && !g.__ppStorageEmu) {
    connectStorageEmulator(s, '127.0.0.1', 9199);
    g.__ppStorageEmu = true;
  }
  return s;
};

export const firebaseReady = () => Boolean(firebaseConfig.apiKey);
