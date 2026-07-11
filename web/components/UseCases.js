'use client';

import { useState } from 'react';

const CASES = [
  {
    key: 'listing',
    icon: '🏡',
    label: 'New listing',
    text: 'Just listed: 2BR in Dubai Marina, AED 1.6M, sea view',
    post: {
      flag: 'JUST LISTED',
      headline: '2BR Apartment · Dubai Marina',
      meta: '🛏 2 Beds · 🛁 2 Baths · 🌊 Sea view',
      price: 'AED 1.6M',
      cta: '📩 DM “VIEW” TO BOOK A VIEWING',
    },
    caption:
      'Wake up to full Marina views 🌊 Two beds, floor-to-ceiling glass, and the sea for a neighbour.',
    tags: ['DubaiMarina', 'JustListed', 'DubaiRealEstate'],
  },
  {
    key: 'open',
    icon: '🔑',
    label: 'Open house',
    text: 'Open house Sat 2–5pm at the Maple Ave townhouse',
    post: {
      flag: 'OPEN HOUSE',
      headline: 'This Saturday · 2–5pm',
      meta: '🏡 Maple Ave Townhouse · walk-ins welcome',
      price: 'SAT 2PM',
      cta: '📍 SAVE YOUR SPOT',
    },
    caption:
      "Doors open this Saturday ☕ Come see why Maple Ave doesn't stay on the market long.",
    tags: ['OpenHouse', 'MapleAve', 'HouseHunting'],
  },
  {
    key: 'drop',
    icon: '📉',
    label: 'Price drop',
    text: 'Price reduced — Palm villa now AED 5.4M, was 5.9',
    post: {
      flag: 'PRICE DROP',
      headline: 'Palm Villa · now AED 5.4M',
      meta: '🛏 5 Beds · 🏊 Private pool · was 5.9M',
      price: '−8.5%',
      cta: '⚡ ENQUIRE BEFORE IT GOES',
    },
    caption:
      'The Palm villa just got AED 500k more interesting. Serious buyers — this one moves fast ⚡',
    tags: ['PalmJumeirah', 'PriceDrop', 'DubaiVillas'],
  },
  {
    key: 'vacancy',
    icon: '🎯',
    label: 'New vacancy',
    text: 'Hiring: senior React dev, remote, up to £85k + equity',
    post: {
      flag: "WE'RE HIRING",
      headline: 'Senior React Developer',
      meta: '⚛️ React 18 · TypeScript · Next.js',
      price: 'APPLY NOW',
      cta: '🚀 APPLY IN 2 MINUTES',
      mid: { type: 'chips', items: ['🌍 Remote-first', '💰 Up to £85k', '📈 Real equity'] },
    },
    caption:
      "We're looking for a senior React dev who wants real ownership — remote-first, equity included 🚀",
    tags: ['Hiring', 'ReactJobs', 'RemoteWork'],
  },
  {
    key: 'win',
    icon: '🤝',
    label: 'Placement win',
    text: 'Placed a CFO at a Series B fintech in 3 weeks 💪',
    post: {
      flag: 'PLACED ✓',
      headline: 'CFO → Series B fintech',
      meta: '🤝 Retained search · London',
      price: 'FILLED',
      cta: '💬 HIRING? LET’S TALK',
      mid: { type: 'big', main: '3 weeks', sub: 'from brief to signed offer' },
    },
    caption:
      'From first call to signed offer in 21 days. Congratulations to our client and their new CFO 🥂',
    tags: ['ExecutiveSearch', 'Fintech', 'Placed'],
  },
  {
    key: 'market',
    icon: '📊',
    label: 'Market update',
    text: 'Marina rents up 8% this quarter — tenants moving early',
    post: {
      flag: 'MARKET UPDATE',
      headline: 'Marina rents +8% this quarter',
      meta: '📈 Q3 data · Dubai Marina',
      price: '+8%',
      cta: '📩 GET THE FULL REPORT',
      mid: { type: 'bars' },
    },
    caption:
      "Marina rents climbed 8% this quarter — renewing soon? Know your numbers before you sign 📊",
    tags: ['DubaiRealEstate', 'MarketUpdate', 'Rents'],
  },
];

function PostMid({ mid }) {
  if (!mid) return null;
  if (mid.type === 'chips') {
    return (
      <div className="ucp-mid">
        {mid.items.map((c) => (
          <span key={c} className="ucp-chip">
            {c}
          </span>
        ))}
      </div>
    );
  }
  if (mid.type === 'big') {
    return (
      <div className="ucp-mid">
        <span className="ucp-big">{mid.main}</span>
        <span className="ucp-bigsub">{mid.sub}</span>
      </div>
    );
  }
  if (mid.type === 'bars') {
    return (
      <div className="ucp-mid">
        <div className="ucp-bars">
          <i style={{ height: '34%' }} />
          <i style={{ height: '48%' }} />
          <i style={{ height: '63%' }} />
          <i style={{ height: '88%' }} className="hot" />
        </div>
      </div>
    );
  }
  return null;
}

export default function UseCases() {
  const [active, setActive] = useState('listing');
  const c = CASES.find((x) => x.key === active);

  return (
    <div className="uc-show">
      <div className="uc-tabs">
        {CASES.map((x) => (
          <button
            key={x.key}
            type="button"
            className={active === x.key ? 'on' : ''}
            onClick={() => setActive(x.key)}
          >
            <span>{x.icon}</span> {x.label}
          </button>
        ))}
      </div>

      <div className="uc-stage" key={c.key}>
        <div className="uc-side">
          <b>You text</b>
          <div className="uc-bubble">
            {c.text}
            <span className="uc-ticks">✓✓</span>
          </div>
          <div className="uc-later">
            <span className="uc-dots">
              <i />
              <i />
              <i />
            </span>
            30 seconds later…
          </div>
        </div>

        <div className="uc-arrow">→</div>

        <div className="uc-side">
          <b>You get</b>
          <div className={`uc-post art-${c.key}`}>
            <em className="ucp-flag">{c.post.flag}</em>
            <i className="ucp-brand">YOUR BRAND</i>
            <PostMid mid={c.post.mid} />
            <div className="ucp-bottom">
              <strong>{c.post.headline}</strong>
              <span className="ucp-meta">{c.post.meta}</span>
              <span className="ucp-price">{c.post.price}</span>
            </div>
            <div className="ucp-cta">{c.post.cta}</div>
          </div>
          <div className="ucp-caption">
            <p>{c.caption}</p>
            <div className="ucp-tags">
              {c.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
