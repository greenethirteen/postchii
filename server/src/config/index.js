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
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  // When a service account is configured, Firestore + Cloud Storage back the
  // app. Without it we fall back to local SQLite so the bot still runs.
  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT || null,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || null,
    get enabled() {
      return Boolean(this.serviceAccountPath);
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
