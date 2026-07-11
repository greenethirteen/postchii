'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, firebaseReady } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function afterAuth(cred) {
    const snap = await getDoc(doc(db(), 'users', cred.user.uid));
    const onboarded = snap.exists() && snap.data().companyId;
    router.push(onboarded ? '/dashboard' : '/onboarding');
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!firebaseReady()) {
      setError('Firebase is not configured yet — add web/.env.local first.');
      return;
    }
    setBusy(true);
    try {
      const cred =
        mode === 'signin'
          ? await signInWithEmailAndPassword(auth(), email, password)
          : await createUserWithEmailAndPassword(auth(), email, password);
      await afterAuth(cred);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError('');
    if (!firebaseReady()) {
      setError('Firebase is not configured yet — add web/.env.local first.');
      return;
    }
    setBusy(true);
    try {
      const cred = await signInWithPopup(auth(), new GoogleAuthProvider());
      await afterAuth(cred);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card glow">
        <h1 style={{ fontSize: 28, textAlign: 'center' }}>
          {mode === 'signin' ? 'Hey again 👋' : 'Join PostChii 🍡'}
        </h1>
        <p className="muted" style={{ textAlign: 'center', fontSize: 15, marginBottom: 20 }}>
          {mode === 'signin' ? 'Sign in and start posting.' : 'Free account. Two minutes.'}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'signin' ? 'active' : ''}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
          <button type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'One sec…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="divider">or</div>
        <button type="button" className="secondary" style={{ width: '100%' }} onClick={google} disabled={busy}>
          Continue with Google
        </button>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
