const fs = require('fs');
const express = require('express');
const config = require('./config');

// Never let a background failure (e.g. Telegram polling conflict) kill the
// HTTP server. Log loudly instead.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err?.message || err);
});

// Startup diagnostics — makes deploy-time misconfiguration obvious in logs.
console.log('PostChii server starting with:', {
  botToken: Boolean(config.telegram.botToken),
  botMode: config.telegram.mode,
  openai: Boolean(config.openai.apiKey),
  firebase: config.firebase.enabled ? (config.firebase.serviceAccountJson ? 'env-json' : 'file') : 'off (sqlite)',
  storageBucket: config.firebase.storageBucket || null,
  uploadPost: Boolean(config.uploadPost.apiKey),
  publicUrl: config.publicUrl,
  port: config.port,
});

// Ensure local storage dirs exist regardless of database backend.
for (const dir of [config.storage.root, config.storage.logosDir, config.storage.postsDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = require('./database'); // initializes Firestore or SQLite
const { createBot } = require('./telegram/bot');

const app = express();

// The Next.js dev app on :3220 calls us directly from the browser.
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());

// Rendered posts + uploaded assets, loadable by the web dashboard.
app.use('/storage', express.static(config.storage.root));

app.get('/', (req, res) => {
  res.json({
    service: 'PostChii API 🍡',
    docs: 'This is the bot/API server — the web app lives elsewhere.',
    health: '/health',
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, backend: db.linking ? 'firestore' : 'sqlite', uptime: process.uptime() });
});

const { CHANNELS, publishTo } = require('./publish/channels');

// Resolves the caller's uid. With Firestore, a Firebase ID token is required;
// the SQLite dev fallback trusts the uid in the body.
async function callerUid(req) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (db.linking) {
    if (!token) return null;
    const { getAuth } = require('firebase-admin/auth');
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
  }
  return req.body?.uid || null;
}

app.post('/publish', async (req, res) => {
  try {
    const { contentId, channel } = req.body || {};
    if (!contentId || !CHANNELS[channel]) {
      return res.status(400).json({ ok: false, error: 'contentId and a valid channel are required' });
    }

    let uid;
    try {
      uid = await callerUid(req);
    } catch {
      uid = null;
    }
    if (!uid) return res.status(401).json({ ok: false, error: 'sign in required' });

    const item = await db.content.getById(contentId);
    if (!item) return res.status(404).json({ ok: false, error: 'content not found' });
    if (String(item.user_id) !== String(uid)) {
      return res.status(403).json({ ok: false, error: 'content does not belong to this user' });
    }

    const info = await publishTo(contentId, channel);
    res.json({ ok: true, channel, ...info });
  } catch (err) {
    if (err.code === 'NOT_CONNECTED') {
      return res.status(409).json({ ok: false, error: 'not_connected', channel: err.channel });
    }
    console.error('publish failed:', err);
    res.status(500).json({ ok: false, error: 'publish failed' });
  }
});

// ——— Social account connection (Upload-Post) ———
const uploadPost = require('./publish/uploadPost');

// Which platforms the signed-in user has connected.
app.get('/social/status', async (req, res) => {
  try {
    const uid = await callerUid(req).catch(() => null);
    if (!uid) return res.status(401).json({ ok: false, error: 'sign in required' });
    if (!uploadPost.enabled()) return res.json({ ok: true, enabled: false, connected: {} });
    const connected = await uploadPost.connectedAccounts(uid);
    res.json({ ok: true, enabled: true, connected });
  } catch (err) {
    console.error('social status failed:', err);
    res.status(500).json({ ok: false, error: 'status failed' });
  }
});

// Hosted link where the user connects Instagram/Facebook/LinkedIn.
app.post('/social/connect-link', async (req, res) => {
  try {
    const uid = await callerUid(req).catch(() => null);
    if (!uid) return res.status(401).json({ ok: false, error: 'sign in required' });
    if (!uploadPost.enabled()) {
      return res.status(503).json({ ok: false, error: 'publishing is not configured yet' });
    }
    const url = await uploadPost.connectLink(uid, req.body?.redirectUrl);
    res.json({ ok: true, url });
  } catch (err) {
    console.error('connect link failed:', err);
    res.status(500).json({ ok: false, error: 'could not create connect link' });
  }
});

app.listen(config.port, () => {
  console.log(`HTTP server listening on :${config.port}`);
});

// The bot is optional per-process: HTTP keeps serving even if polling can't
// start (missing token, or another process already owns the token → 409).
if (config.telegram.botToken && config.telegram.mode !== 'off') {
  const bot = createBot();
  const launch = (attempt = 1) =>
    bot
      .launch(() =>
        console.log(`Telegram bot started (long polling, ${db.linking ? 'firestore' : 'sqlite'} backend)`)
      )
      .catch((err) => {
        console.error(`Bot launch failed (attempt ${attempt}):`, err?.message || err);
        if (/409/.test(String(err?.message))) {
          console.error(
            'Another process is polling this bot token. Stop the other instance ' +
              '(or set BOT_MODE=off on it), then this one will connect on retry.'
          );
        }
        const delay = Math.min(60_000, 5_000 * attempt);
        setTimeout(() => launch(attempt + 1), delay);
      });
  launch();

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
} else {
  console.log(`Telegram bot disabled (${config.telegram.botToken ? 'BOT_MODE=off' : 'no token set'}).`);
}
