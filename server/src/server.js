const fs = require('fs');
const express = require('express');
const config = require('./config');

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

const bot = createBot();
bot.launch(() => console.log(`Telegram bot started (long polling, ${db.linking ? 'firestore' : 'sqlite'} backend)`));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
