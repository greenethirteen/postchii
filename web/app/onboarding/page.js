'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useUser } from '@/lib/useUser';

const INDUSTRIES = [
  { value: 'recruitment', label: 'Recruitment', icon: '🎯' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏡' },
];

const TONES = [
  { value: 'professional', label: 'Professional', icon: '💼' },
  { value: 'luxury', label: 'Luxury', icon: '✨' },
  { value: 'friendly', label: 'Friendly', icon: '👋' },
];

export default function OnboardingPage() {
  const user = useUser();
  const router = useRouter();
  const [industry, setIndustry] = useState('recruitment');
  const [companyName, setCompanyName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [tone, setTone] = useState('professional');
  const [logoFile, setLogoFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user === undefined)
    return (
      <div className="loading">
        <span className="spinner" /> Loading…
      </div>
    );
  if (user === null) {
    router.push('/login');
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      let logoPath = null;
      if (logoFile) {
        const logoRef = ref(storage(), `logos/${user.uid}`);
        await uploadBytes(logoRef, logoFile);
        logoPath = await getDownloadURL(logoRef);
      }

      const company = await addDoc(collection(db(), 'companies'), {
        ownerUid: user.uid,
        name: companyName,
        brandName: brandName || companyName,
        industry,
        brandTone: tone,
        logoPath,
        createdAt: new Date().toISOString(),
      });

      await setDoc(
        doc(db(), 'users', user.uid),
        {
          name: user.displayName || null,
          email: user.email || null,
          companyId: company.id,
          onboardingState: null,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '20px auto' }}>
      <div className="card glow">
        <span className="eyebrow" style={{ marginBottom: 14 }}>🍡 almost there</span>
        <h1 style={{ fontSize: 30 }}>Make it yours</h1>
        <p className="muted" style={{ fontSize: 15 }}>
          Every post gets built around this.
        </p>

        <form onSubmit={submit}>
          <label>Business type</label>
          <div className="segmented">
            {INDUSTRIES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={industry === opt.value ? 'active' : ''}
                onClick={() => setIndustry(opt.value)}
              >
                <span className="seg-ico">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          <label>Company name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Recruitment Ltd"
            required
          />

          <label>Brand name on posts (blank = company name)</label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Acme Talent"
          />

          <label>Brand tone</label>
          <div className="segmented">
            {TONES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={tone === opt.value ? 'active' : ''}
                onClick={() => setTone(opt.value)}
              >
                <span className="seg-ico">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          <label>Logo (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />

          <button type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Saving…' : "Let's go 🍡"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
