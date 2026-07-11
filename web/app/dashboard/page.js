'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/lib/useUser';

const BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'post_pilot_pro_bot';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3210';

const PUBLISH_CHANNELS = [
  { key: 'bayut', label: 'Bayut', icon: '🏠' },
  { key: 'property_finder', label: 'Property Finder', icon: '🔑' },
  { key: 'instagram', label: 'Instagram', icon: '📸' },
];

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function DashboardPage() {
  const user = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [items, setItems] = useState([]);
  const [linkCode, setLinkCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pub, setPub] = useState({}); // `${itemId}:${channel}` -> 'busy' | 'error'
  const [social, setSocial] = useState(null); // { enabled, connected } | null

  useEffect(() => {
    if (!user) return;
    // Live profile so the "Telegram connected" badge flips without a refresh.
    const unsub = onSnapshot(doc(db(), 'users', user.uid), async (snap) => {
      const data = snap.exists() ? snap.data() : null;
      setProfile(data);
      if (data?.companyId) {
        const c = await getDoc(doc(db(), 'companies', data.companyId));
        setCompany(c.exists() ? c.data() : null);
      }
      setLoading(false);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db(), 'content'), where('userId', '==', user.uid))).then((snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setItems(rows);
    });
  }, [user]);

  if (user === undefined || (user && loading))
    return (
      <div className="loading">
        <span className="spinner" /> Loading…
      </div>
    );
  if (user === null) {
    router.push('/login');
    return null;
  }
  if (profile && !profile.companyId) {
    router.push('/onboarding');
    return null;
  }

  async function generateLink() {
    const code = makeCode();
    await setDoc(doc(db(), 'linkCodes', code), {
      uid: user.uid,
      createdAt: new Date().toISOString(),
    });
    setLinkCode(code);
  }

  useEffect(() => {
    if (!user) return;
    user
      .getIdToken()
      .then((token) =>
        fetch(`${API}/social/status`, { headers: { Authorization: `Bearer ${token}` } })
      )
      .then((r) => r.json())
      .then((d) => d.ok && setSocial(d))
      .catch(() => {});
  }, [user]);

  async function connectSocials() {
    const token = await user.getIdToken();
    const r = await fetch(`${API}/social/connect-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ redirectUrl: window.location.href }),
    });
    const d = await r.json();
    if (d.ok) window.open(d.url, '_blank');
  }

  async function publish(itemId, channel) {
    const k = `${itemId}:${channel}`;
    setPub((p) => ({ ...p, [k]: 'busy' }));
    try {
      const token = await user.getIdToken();
      const r = await fetch(`${API}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contentId: itemId, channel }),
      });
      const data = await r.json();
      if (!data.ok) throw new Error(data.error);
      setItems((rows) =>
        rows.map((row) =>
          row.id === itemId
            ? { ...row, channels: { ...row.channels, [channel]: { status: 'live', url: data.url } } }
            : row
        )
      );
      setPub((p) => ({ ...p, [k]: undefined }));
    } catch {
      setPub((p) => ({ ...p, [k]: 'error' }));
    }
  }

  const telegramConnected = Boolean(profile?.telegramId);
  const displayName = company?.brandName || company?.name || 'Your brand';

  return (
    <>
      <div className="dash-head">
        <h1>Hey 👋</h1>
        <span className="sub">Your brand. Your posts.</span>
      </div>

      <div className="dash-grid">
        <div className="card glow">
          <div className="brand-row">
            {company?.logoPath ? (
              <img className="brand-logo" src={company.logoPath} alt="logo" />
            ) : (
              <span className="brand-logo placeholder">{displayName.charAt(0)}</span>
            )}
            <div>
              <div className="brand-name">{displayName}</div>
              <div className="badge-row">
                <span className="badge">
                  {company?.industry === 'real_estate' ? '🏡 Real Estate' : '🎯 Recruitment'}
                </span>
                {company?.brandTone && <span className="badge tone">✨ {company.brandTone}</span>}
              </div>
            </div>
          </div>
          {company?.name && company.name !== displayName && (
            <p className="muted" style={{ marginTop: 14, fontSize: 13.5 }}>
              Company: {company.name}
            </p>
          )}
        </div>

        <div className="card">
          <h2>
            Telegram{' '}
            <span className={`badge ${telegramConnected ? 'ok' : ''}`}>
              {telegramConnected ? 'Connected' : 'Not connected'}
            </span>
          </h2>
          {telegramConnected ? (
            <p className="muted" style={{ fontSize: 15 }}>
              Linked! Text <a href={`https://t.me/${BOT}`}>@{BOT}</a> to make a post.
            </p>
          ) : linkCode ? (
            <>
              <div className="boarding-pass">
                <div className="bp-label">One-time code</div>
                <code className="linkcode">{linkCode}</code>
              </div>
              <a className="btn" href={`https://t.me/${BOT}?start=${linkCode}`} target="_blank">
                Open Telegram
              </a>
            </>
          ) : (
            <>
              <p className="muted" style={{ fontSize: 15 }}>
                Link Telegram to make posts by text.
              </p>
              <button onClick={generateLink}>Connect Telegram</button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2>
          Publishing accounts{' '}
          {social?.enabled === false && <span className="badge">not configured</span>}
        </h2>
        <p className="muted" style={{ fontSize: 14.5 }}>
          Connect your socials once — then publish from chat or here.
        </p>
        <div className="badge-row" style={{ marginTop: 10 }}>
          {['instagram', 'facebook', 'linkedin'].map((k) => {
            const on = Boolean(social?.connected?.[k]);
            const labels = { instagram: '📸 Instagram', facebook: '📘 Facebook', linkedin: '💼 LinkedIn' };
            return (
              <span key={k} className={`badge ${on ? 'ok' : ''}`}>
                {labels[k]} {on ? 'connected' : 'not connected'}
              </span>
            );
          })}
        </div>
        <button onClick={connectSocials} disabled={!social?.enabled}>
          {social?.connected && Object.keys(social.connected).length > 0
            ? 'Manage accounts'
            : 'Connect accounts'}
        </button>
      </div>

      <div className="card">
        <h2>Your posts</h2>
        {items.length === 0 ? (
          <div className="empty-state">
            <span className="plane">🍡</span>
            <p>
              Nothing yet.
              <br />
              Text the bot your first update!
            </p>
          </div>
        ) : (
          <ul className="content-list">
            {items.map((item) => (
              <li key={item.id}>
                <span className={`badge ${item.status === 'delivered' ? 'ok' : ''}`}>{item.status}</span>{' '}
                <span style={{ marginLeft: 8 }}>{item.rawInput}</span>
                {item.imagePath && (
                  <div>
                    <img src={item.imagePath} alt="post" />
                  </div>
                )}
                <div className="pub-row">
                  {PUBLISH_CHANNELS.map((ch) => {
                    const info = item.channels?.[ch.key];
                    const state = pub[`${item.id}:${ch.key}`];
                    if (info?.status === 'live') {
                      return (
                        <a key={ch.key} className="pub-chip live" href={info.url} target="_blank">
                          ✓ Live on {ch.label}
                        </a>
                      );
                    }
                    return (
                      <button
                        key={ch.key}
                        className="pub-chip"
                        disabled={state === 'busy'}
                        onClick={() => publish(item.id, ch.key)}
                      >
                        {state === 'busy'
                          ? `Posting to ${ch.label}…`
                          : state === 'error'
                            ? `⚠ Retry ${ch.label}`
                            : `${ch.icon} Post to ${ch.label}`}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
