require('dotenv').config();
const path = require('path');

const serverRoot = path.resolve(__dirname, '..', '..');
const storageRoot = process.env.STORAGE_DIR || path.join(serverRoot, 'storage');

const port = parseInt(process.env.PORT || '3210', 10);

module.exports = {
  port,

  // Base URL browsers use to load rendered posts / uploads.
  publicUrl: process.env.PUBLIC_URL || `http://localhost:${port}`,

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    // 'polling' (default) runs the bot; 'off' runs HTTP-only. Only ONE
    // process may poll a bot token at a time — set BOT_MODE=off locally
    // once the deployed server owns the bot.
    mode: process.env.BOT_MODE || 'polling',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  // Upload-Post (upload-post.com) — real Instagram/Facebook/LinkedIn publishing.
  // Without a key, social channels fall back to simulated publishing.
  uploadPost: {
    apiKey: process.env.UPLOAD_POST_API_KEY || null,
  },

  // Max AI-consuming bot interactions per user per day (cost guard).
  aiDailyLimit: parseInt(process.env.AI_DAILY_LIMIT || '25', 10),

  // When a service account is configured, Firestore + Cloud Storage back the
  // app. Without it we fall back to local SQLite so the bot still runs.
  // Locally: FIREBASE_SERVICE_ACCOUNT=./serviceAccount.json (a file path).
  // Deployed: FIREBASE_SERVICE_ACCOUNT_JSON=<the JSON itself> (no file on disk).
  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT || null,
    serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON || null,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || null,
    get enabled() {
      return Boolean(this.serviceAccountPath || this.serviceAccountJson);
    },
  },

  storage: {
    root: storageRoot,
    logosDir: path.join(storageRoot, 'logos'),
    postsDir: path.join(storageRoot, 'posts'),
  },

  database: {
    path: process.env.DATABASE_PATH || path.join(storageRoot, 'postpilot.db'),
  },
};
