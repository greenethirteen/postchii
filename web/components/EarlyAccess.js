'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, firebaseReady } from '@/lib/firebase';

// Google Ads "Submit lead form" conversion. Fired after the waitlist write
// succeeds, so a failed submit never counts as a lead. The email feeds enhanced
// conversions — gtag hashes it in the browser before sending.
const GADS_SEND_TO =
  process.env.NEXT_PUBLIC_GADS_EARLY_ACCESS_SEND_TO || 'AW-18339496959/HP5NCLTlhtQcEP-H-qhE';

function trackSignup(email) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('set', 'user_data', { email });
  window.gtag('event', 'conversion', {
    send_to: GADS_SEND_TO,
    value: 1.0,
    currency: 'AED',
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
