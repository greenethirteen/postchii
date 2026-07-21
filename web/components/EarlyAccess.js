'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, firebaseReady } from '@/lib/firebase';

const GADS_ID = 'AW-18339496959';
const GADS_LABEL = process.env.NEXT_PUBLIC_GADS_EARLY_ACCESS_LABEL || '';

// Google Ads conversion for an early-access signup. Needs the conversion label
// from the Ads UI (Goals → Conversions → the action → tag setup) in
// NEXT_PUBLIC_GADS_EARLY_ACCESS_LABEL; without it we still push a plain event
// so the signup shows up in the tag's event stream.
function trackSignup(email) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('set', 'user_data', { email });
  window.gtag('event', 'conversion', {
    send_to: GADS_LABEL ? `${GADS_ID}/${GADS_LABEL}` : GADS_ID,
  });
}

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
    const clean = email.trim().toLowerCase();
    try {
      await addDoc(collection(db(), 'waitlist'), {
        email: clean,
        createdAt: new Date().toISOString(),
      });
      trackSignup(clean);
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
