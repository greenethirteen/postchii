'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, firebaseReady } from '@/lib/firebase';

export default function EarlyAccess({ dark = false }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | busy | done | error

  async function submit(e) {
    e.preventDefault();
    if (!firebaseReady()) {
      setState('error');
      return;
    }
    setState('busy');
    try {
      await addDoc(collection(db(), 'waitlist'), {
        email: email.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
      });
      setState('done');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <p className={`ea-done ${dark ? 'on-dark' : ''}`}>
        🍡 You're on the list — we'll be in touch.
      </p>
    );
  }

  return (
    <form className={`ea-form ${dark ? 'on-dark' : ''}`} onSubmit={submit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        required
        aria-label="Email address"
      />
      <button type="submit" disabled={state === 'busy'}>
        {state === 'busy' ? 'Joining…' : 'Get early access'}
      </button>
      {state === 'error' && <span className="ea-err">Something hiccuped — try again.</span>}
    </form>
  );
}
