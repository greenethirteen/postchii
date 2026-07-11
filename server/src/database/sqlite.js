const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

for (const dir of [config.storage.root, config.storage.logosDir, config.storage.postsDir]) {
  fs.mkdirSync(dir, { recursive: true });
}
fs.mkdirSync(path.dirname(config.database.path), { recursive: true });

const db = new Database(config.database.path);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT NOT NULL UNIQUE,
    name TEXT,
    company_id INTEGER REFERENCES companies(id),
    onboarding_state TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand_name TEXT,
    industry TEXT NOT NULL,
    logo_path TEXT,
    brand_tone TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    raw_input TEXT NOT NULL,
    content_type TEXT,
    generated_copy TEXT,
    image_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
