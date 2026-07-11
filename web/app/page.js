import EarlyAccess from '@/components/EarlyAccess';
import UseCases from '@/components/UseCases';

// Telegram logo for the chat mock's avatar
function TelegramMark() {
  return (
    <svg viewBox="0 0 240 240" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="tgAva" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2AABEE" />
          <stop offset="1" stopColor="#229ED9" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="120" fill="url(#tgAva)" />
      <path
        fill="#fff"
        d="M44.7 118.8c48.1-21 80.2-34.8 96.3-41.5 45.8-19 55.4-22.4 61.6-22.5 1.4 0 4.4.3 6.4 1.9 1.6 1.3 2.1 3 2.3 4.3.2 1.2.5 4 .3 6.2-2.5 26.1-13.2 89.4-18.7 118.6-2.3 12.4-6.9 16.5-11.3 16.9-9.6.9-16.9-6.3-26.2-12.4-14.6-9.6-22.8-15.5-36.9-24.9-16.4-10.8-5.8-16.7 3.6-26.4 2.5-2.5 45-41.2 45.8-44.7.1-.4.2-2.1-.8-3-1-.9-2.4-.6-3.5-.3-1.5.3-25.2 16-71.1 47-6.7 4.6-12.8 6.9-18.3 6.8-6-.1-17.6-3.4-26.2-6.2-10.6-3.4-19-5.2-18.3-11 .4-3 4.5-6.1 12.3-9.3z"
      />
    </svg>
  );
}

// Minimal house mark used as the demo brand's logo
function HouseMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11.2 12 4l9 7.2" />
      <path d="M5.6 9.9V19a1 1 0 0 0 1 1h10.8a1 1 0 0 0 1-1V9.9" />
      <path d="M10 20v-5.4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero" id="early">
        <div>
          <span className="eyebrow">🍡 Mochii — early access</span>
          <h1>
            Send a text.
            <br />
            <span className="grad-text">Get a post.</span>
            <br />
            Publish <span className="grad-text">everywhere</span>.
          </h1>
          <p className="sub sub-caps">ALL IN TELEGRAM</p>
          <EarlyAccess />
        </div>

        <div className="tg-wrap" aria-hidden="true">
        <div className="tg">
          <div className="tg-head">
            <span className="tg-ava">
              <TelegramMark />
            </span>
            <div>
              <b>Mochii</b>
              <i>bot · online</i>
            </div>
          </div>
          <div className="tg-body">
            <div className="tg-scroll">
            <div className="tg-note n1">1 · You send a photo + details</div>
            <div className="tg-msg out m1">
              <span className="tg-photo" />
              3BR townhouse in DAMAC Hills 2, AED 2.1M, landscaped garden — post it for me 🙏
              <span className="tg-time">9:41 ✓✓</span>
            </div>

            <div className="tg-typing t1">
              <i />
              <i />
              <i />
            </div>

            <div className="tg-note n2">2 · Mochii designs the post — with your photo</div>
            <div className="tg-msg in m2">
              <div className="tg-post">
                <div className="tg-art">
                  <em className="ta-flag">JUST LISTED</em>
                  <i className="ta-brand">BETTERHOMES</i>
                  <div className="ta-bottom">
                    <strong>3BR Townhouse · DAMAC Hills 2</strong>
                    <span className="ta-specs">🛏 3 Beds · 🛁 4 Baths · 📐 2,208 sqft</span>
                    <span className="ta-price">AED 2.1M</span>
                  </div>
                  <div className="ta-cta">📩 DM “VIEW” TO BOOK A VIEWING</div>
                </div>
                <p>Family-ready 3BR with a landscaped garden in DAMAC Hills 2 🌿 #DubaiRealEstate #JustListed</p>
              </div>
            </div>

            <div className="tg-note n3">3 · You pick the channels</div>
            <div className="tg-msg in m2b">
              Looks good? Where should I post it?
              <div className="tg-select">
                <span className="s1">📸 Instagram</span>
                <span className="s2">🏠 Bayut</span>
                <span className="s3">🔑 Property Finder</span>
                <span>💼 LinkedIn</span>
              </div>
              <div className="tg-btns">
                <span className="go">🚀 Publish</span>
              </div>
            </div>

            <div className="tg-msg in m3">
              Publishing to 3 channels…
              <span className="tg-plats">
                <em>📸 Instagram ✓</em>
                <em>🏠 Bayut ✓</em>
                <em>🔑 Property Finder ✓</em>
              </span>
            </div>

            <div className="tg-msg in m4">All live 🎉 Links are in your dashboard.</div>
            </div>
          </div>
          <div className="tg-foot">
            <span className="tg-clip">📎</span>
            <span className="tg-field">Message</span>
            <span className="tg-mic">🎤</span>
          </div>
        </div>

        <div className="pop pop-ig">
          <div className="pop-head">
            <i className="ig-av" /> betterhomes.uae <b>· Just now</b>
          </div>
          <span className="pop-img" />
          <div className="pop-meta">❤️ 128 · 3BR Townhouse · DAMAC Hills 2</div>
        </div>
        <div className="pop pop-by">
          <div className="pop-head by">🏠 Bayut <b>· Live</b></div>
          <span className="pop-img" />
          <div className="pop-meta">AED 2,100,000 · 3 Beds · 4 Baths</div>
        </div>
        <div className="pop pop-pf">
          <div className="pop-head pf">🔑 Property Finder <b>· Live</b></div>
          <span className="pop-img" />
          <div className="pop-meta">Townhouse · DAMAC Hills 2 · 2,208 sqft</div>
        </div>
        </div>
      </section>

      <div className="pain-band">
        <p className="pain-kicker">Why Mochii</p>
        <h2 className="pain-title">
          Post in <span className="grad-text">30 seconds</span>.
          <br />
          Not 2 hours.
        </h2>
        <p className="pain-sub">No design tools. No copy-paste. No missed posts.</p>
        <div className="vs-grid">
          <div className="vs bad">
            <h4>Without Mochii</h4>
            <div className="chain">
              <span>🎨 Design it</span>
              <i>→</i>
              <span>✍️ Write caption</span>
              <i>→</i>
              <span>📸 Post it</span>
              <i>→</i>
              <span>💼 Post it again</span>
              <i>→</i>
              <span>📘 Again</span>
              <i>→</i>
              <span>🏠 Again…</span>
            </div>
            <div className="vs-time">≈ 2 hours per post 😮‍💨</div>
          </div>
          <div className="vs good">
            <h4>With Mochii</h4>
            <div className="chain">
              <span>💬 One text</span>
              <i>→</i>
              <span>🍡 Mochii</span>
              <i>→</i>
              <span className="win">✅ Live everywhere</span>
            </div>
            <div className="vs-time win">⚡ 30 seconds</div>
          </div>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="n">&lt;30s</span>
          <span className="l">from text to post</span>
        </div>
        <div className="stat">
          <span className="n">3</span>
          <span className="l">formats per reply</span>
        </div>
        <div className="stat">
          <span className="n">2 min</span>
          <span className="l">brand setup</span>
        </div>
        <div className="stat">
          <span className="n">0</span>
          <span className="l">new apps to learn</span>
        </div>
      </div>

      <section className="section" id="how">
        <p className="kicker">How it works</p>
        <h2 className="section-title">
          One chat. Every channel. <span className="grad-text">Zero effort.</span>
        </h2>
        <div className="steps four">
          <div className="step">
            <span className="num">01</span>
            <h3>Tell AI what you need</h3>
            <p className="step-sub">One text. No forms, no fields.</p>
            <div className="step-visual sv-text">
              <span className="svt-out">New listing! 3BR in DAMAC Hills, AED 2.1M 🏡</span>
            </div>
          </div>
          <div className="step">
            <span className="num">02</span>
            <h3>It creates the post</h3>
            <p className="step-sub">Design + caption, in your brand.</p>
            <div className="step-visual sv-text">
              <span className="svt-in">
                <i className="svt-img" /> Post ready ✓
              </span>
            </div>
          </div>
          <div className="step">
            <span className="num">03</span>
            <h3>You approve it</h3>
            <p className="step-sub">One tap, right in Telegram.</p>
            <div className="step-visual sv-approve">
              <span className="ok">✓ Approve</span>
              <span>✎ Tweak</span>
            </div>
          </div>
          <div className="step">
            <span className="num">04</span>
            <h3>It publishes everywhere</h3>
            <p className="step-sub">Socials & portals, at once.</p>
            <div className="step-visual sv-publish">
              <span className="f1">📸 Instagram ✓</span>
              <span className="f2">📘 Facebook ✓</span>
              <span className="f3">🏠 Bayut ✓</span>
              <span className="f4">🔑 Property Finder ✓</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="usecases">
        <div className="uc-band">
          <p className="pain-kicker">Use cases</p>
          <h2>
            One bot. <span className="grad-text">Endless use cases.</span>
          </h2>
          <UseCases />
        </div>
      </section>

      

      <section className="section">
        <p className="kicker">Distribution</p>
        <h2 className="section-title">
          Don't just draft it. <span className="grad-text">Ship it.</span>
        </h2>
        <div className="bento three">
          <div className="cell">
            <span className="ico">📤</span>
            <h3>Publish direct</h3>
            <p>Approve in chat → live on your socials and the property portals.</p>
            <div className="platforms">
              <span>📸 Instagram</span>
              <span>💼 LinkedIn</span>
              <span>📘 Facebook</span>
              <span className="soon">🏠 Bayut</span>
              <span className="soon">🔑 Property Finder</span>
              <span className="soon">🏷️ dubizzle</span>
              <span className="soon">🎵 TikTok</span>
              <span className="soon">💬 WhatsApp</span>
              <span className="soon">📍 Google Business</span>
            </div>
          </div>
          <div className="cell">
            <span className="ico">🚀</span>
            <h3>
              Promote winners <em className="soon-pill">coming soon</em>
            </h3>
            <p>Boost a post into an ad without leaving the chat. Set a budget, Mochii does the rest.</p>
            <div className="budget-row">
              🚀 Boost · £50
              <span className="bar">
                <i />
              </span>
              7 days
            </div>
          </div>
          <div className="cell">
            <span className="ico">🔌</span>
            <h3>Post via API</h3>
            <p>Pipe posts into your own stack — CRM triggers, n8n, Make, or plain REST.</p>
            <div className="code-snip">
              <span className="k">POST</span> /v1/posts{'\n'}
              {'{'} <span className="s">"text"</span>: <span className="s">"New listing…"</span>,{' '}
              <span className="s">"publish"</span>: <span className="s">"instagram"</span> {'}'}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <p className="kicker">Features</p>
        <h2 className="section-title">
          Everything ships <span className="grad-text">in the reply.</span>
        </h2>
        <div className="bento">
          <div className="cell wide">
            <span className="ico">🎨</span>
            <h3>Always on-brand</h3>
            <p>Your logo, colors and tone — locked into every render.</p>
            <div className="swatches">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="cell">
            <span className="ico">🖼️</span>
            <h3>Image included</h3>
            <p>Designed, publish-ready visuals at full resolution.</p>
          </div>
          <div className="cell">
            <span className="ico">📝</span>
            <h3>All the copy</h3>
            <p>Caption, LinkedIn, CTA — one reply.</p>
            <div className="copy-lines">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="cell wide">
            <span className="ico">💬</span>
            <h3>Approve in chat</h3>
            <p>Ship it or redo it, without leaving Telegram.</p>
            <div className="chip-row">
              <span className="hot">✓ Post it</span>
              <span>↻ Redo</span>
              <span>✎ Tweak caption</span>
            </div>
          </div>
        </div>
      </section>

      

      

      <section className="section">
        <div className="cta-band">
          <h2>
            Your next post is <span className="grad-text">one text away</span>
          </h2>
          <p style={{ marginBottom: 22 }}>Join the early-access list.</p>
          <EarlyAccess dark />
        </div>
      </section>
    </>
  );
}
