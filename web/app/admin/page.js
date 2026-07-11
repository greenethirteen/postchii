'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3210';

export default function AdminPage() {
  const [pw, setPw] = useState('');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const r = await fetch(`${API}/admin/waitlist`, {
        headers: { 'X-Admin-Password': pw },
      });
      const d = await r.json();
      if (d.ok) setData(d);
      else setErr(d.error === 'wrong password' ? 'Wrong password.' : d.error);
    } catch {
      setErr('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  async function copyAll() {
    await navigator.clipboard.writeText(data.emails.map((e) => e.email).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!data) {
    return (
      <div className="auth-wrap">
        <div className="card glow">
          <h1 style={{ fontSize: 24, textAlign: 'center' }}>Admin 🤫</h1>
          <form onSubmit={load}>
            <label>Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
              required
            />
            <button type="submit" disabled={busy} style={{ width: '100%' }}>
              {busy ? 'Checking…' : 'Enter'}
            </button>
          </form>
          {err && <p className="error">{err}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dash-head">
        <h1>Early-access list</h1>
        <span className="sub">
          {data.count} signup{data.count === 1 ? '' : 's'}
        </span>
      </div>
      <div className="card">
        <button onClick={copyAll} className="secondary" style={{ marginTop: 0 }}>
          {copied ? '✓ Copied' : 'Copy all emails'}
        </button>
        <ul className="content-list" style={{ marginTop: 16 }}>
          {data.emails.map((e, i) => (
            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>{e.email}</span>
              <span className="muted" style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>
                {e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}
              </span>
            </li>
          ))}
        </ul>
        {data.count === 0 && <p className="muted">No signups yet — share the site! 🍡</p>}
      </div>
    </>
  );
}
