import EarlyAccess from '@/components/EarlyAccess';
import UseCases from '@/components/UseCases';

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
          <span className="eyebrow">🍡 PostChii — early access</span>
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
            <span className="tg-ava">🍡</span>
            <div>
              <b>PostChii</b>
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

            <div className="tg-note n2">2 · PostChii designs the post — with your photo</div>
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
        <p className="pain-kicker">Why PostChii</p>
        <h2>
          Post in <span className="grad-text">30 seconds</span>, not 2 hours.
        </h2>
        <p className="pain-sub">No design tools. No copy-paste. No missed posts.</p>
        <div className="vs-grid">
          <div className="vs bad">
            <h4>Without PostChii</h4>
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
            <h4>With PostChii</h4>
            <div className="chain">
              <span>💬 One text</span>
              <i>→</i>
              <span>🍡 PostChii</span>
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
          Three steps. <span className="grad-text">That's it.</span>
        </h2>
        <div className="steps">
          <div className="step">
            <span className="num">01</span>
            <h3>Brand with your logo</h3>
            <p>Set your logo, name and tone once. Every post inherits it automatically.</p>
            <div className="step-visual sv-brand">
              <span className="svb-logo">
                <HouseMark />
              </span>
              <div className="svb-info">
                <b>Betterhomes Dubai</b>
                <div className="svb-chips">
                  <span>💼 Professional</span>
                  <span className="on">✨ Luxury</span>
                </div>
              </div>
            </div>
          </div>
          <div className="step">
            <span className="num">02</span>
            <h3>Link with Telegram</h3>
            <p>One tap connects your Telegram to your brand. No new app to learn.</p>
            <div className="step-visual sv-link">
              <div className="svl-row">
                <span className="svl-node brand">
                  <HouseMark />
                </span>
                <span className="svl-line" />
                <span className="svl-node tg">✈️</span>
              </div>
              <span className="svl-badge">✓ Connected</span>
            </div>
          </div>
          <div className="step">
            <span className="num">03</span>
            <h3>Text to post</h3>
            <p>Message a plain business update. A finished, branded post comes back.</p>
            <div className="step-visual sv-text">
              <span className="svt-out">New listing! 3BR in DAMAC Hills 🏡</span>
              <span className="svt-in">
                <i className="svt-img" /> Post ready ✓
              </span>
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
        <p className="kicker">Under the hood</p>
        <h2 className="section-title">
          One message in. <span className="grad-text">Four systems at work.</span>
        </h2>
        <div className="pipeline">
          <div className="node">
            <span className="tag">Extract</span>
            <span className="nico">🔍</span>
            <h3>Understanding</h3>
            <p>
              AI parses your message — role, salary, address, price, date — into structured
              facts. No forms, no fields.
            </p>
            <span className="arrow">→</span>
          </div>
          <div className="node">
            <span className="tag">Write</span>
            <span className="nico">✍️</span>
            <h3>Copy engine</h3>
            <p>
              GPT-class models draft the caption, LinkedIn post and CTA — tuned to your
              brand tone.
            </p>
            <span className="arrow">→</span>
          </div>
          <div className="node">
            <span className="tag">Render</span>
            <span className="nico">🎨</span>
            <h3>Design engine</h3>
            <p>
              A pixel renderer composes your image — logo, colors, headline — at
              publish-ready resolution.
            </p>
            <span className="arrow">→</span>
          </div>
          <div className="node">
            <span className="tag">Publish</span>
            <span className="nico">🚀</span>
            <h3>Everywhere at once</h3>
            <p>
              Approve in Telegram and PostChii posts it — Instagram, LinkedIn, Facebook, or
              straight through your integrations.
            </p>
          </div>
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
              <span>🏠 Bayut</span>
              <span>🔑 Property Finder</span>
              <span>🏷️ dubizzle</span>
            </div>
          </div>
          <div className="cell">
            <span className="ico">🚀</span>
            <h3>Promote winners</h3>
            <p>Boost a post into an ad without leaving the chat. Set a budget, PostChii does the rest.</p>
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
        <p className="kicker">Why not just ChatGPT?</p>
        <h2 className="section-title">
          ChatGPT writes text. <span className="grad-text">PostChii ships posts.</span>
        </h2>
        <div className="compare">
          <div className="row head">
            <div />
            <div>ChatGPT</div>
            <div>🍡 PostChii</div>
          </div>
          <div className="row">
            <div>Remembers your brand</div>
            <div>
              <span className="no">✗</span> re-explain every time
            </div>
            <div>
              <span className="yes">✓</span> set once, applied always
            </div>
          </div>
          <div className="row">
            <div>Designed post image</div>
            <div>
              <span className="no">✗</span> generic AI art
            </div>
            <div>
              <span className="yes">✓</span> your logo, your template
            </div>
          </div>
          <div className="row">
            <div>Effort per post</div>
            <div>
              <span className="no">✗</span> craft a prompt
            </div>
            <div>
              <span className="yes">✓</span> one plain text
            </div>
          </div>
          <div className="row">
            <div>Consistent across posts</div>
            <div>
              <span className="no">✗</span> different every session
            </div>
            <div>
              <span className="yes">✓</span> same brand, every render
            </div>
          </div>
          <div className="row">
            <div>Post history & approval</div>
            <div>
              <span className="no">✗</span>
            </div>
            <div>
              <span className="yes">✓</span> approve or redo in chat
            </div>
          </div>
          <div className="row">
            <div>Publishes to socials & property portals</div>
            <div>
              <span className="no">✗</span> copy-paste yourself
            </div>
            <div>
              <span className="yes">✓</span> one tap from chat
            </div>
          </div>
          <div className="row">
            <div>Promote a post as an ad</div>
            <div>
              <span className="no">✗</span>
            </div>
            <div>
              <span className="yes">✓</span> set a budget in chat
            </div>
          </div>
          <div className="row">
            <div>API & integrations</div>
            <div>
              <span className="no">✗</span>
            </div>
            <div>
              <span className="yes">✓</span> REST, n8n, Make
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <p className="kicker">FAQ</p>
        <h2 className="section-title">Quick answers.</h2>
        <div className="faq">
          <details>
            <summary>Do I need any design or marketing skills?</summary>
            <p>
              No. You set your brand once — logo, name, tone — and PostChii handles design
              and copywriting on every post after that.
            </p>
          </details>
          <details>
            <summary>Where do the posts go?</summary>
            <p>
              Preview lands in Telegram first. Approve it and PostChii publishes to your
              connected accounts — Instagram, LinkedIn, Facebook — and pushes listings to
              portals like Bayut and Property Finder, or your own tools via the API.
            </p>
          </details>
          <details>
            <summary>Can I promote a post as an ad?</summary>
            <p>
              Yes — reply "promote" with a budget and duration, and PostChii boosts the post
              for you. Performance comes back in chat.
            </p>
          </details>
          <details>
            <summary>What if I don't like the result?</summary>
            <p>
              Reply "redo" or describe the change in plain words — "make it punchier",
              "mention the garden" — and a new version comes back in seconds.
            </p>
          </details>
          <details>
            <summary>How much does it cost?</summary>
            <p>
              Early access is free. Paid plans arrive at launch — early users get the best
              deal. 🍡
            </p>
          </details>
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
