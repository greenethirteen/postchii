// SQLite backend (local fallback when Firebase is not configured).
// All methods are async to match the Firestore backend's interface.
const db = require('./sqlite');

const users = {
  async findByTelegramId(telegramId) {
    return db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(String(telegramId));
  },

  async create({ telegramId, name }) {
    const result = db
      .prepare('INSERT INTO users (telegram_id, name) VALUES (?, ?)')
      .run(String(telegramId), name || null);
    return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  },

  async setCompany(userId, companyId) {
    db.prepare('UPDATE users SET company_id = ? WHERE id = ?').run(companyId, userId);
  },

  async setOnboardingState(userId, state) {
    db.prepare('UPDATE users SET onboarding_state = ? WHERE id = ?').run(
      state ? JSON.stringify(state) : null,
      userId
    );
  },
};

const companies = {
  async create({ name, brandName, industry, logoPath, brandTone }) {
    const result = db
      .prepare(
        'INSERT INTO companies (name, brand_name, industry, logo_path, brand_tone) VALUES (?, ?, ?, ?, ?)'
      )
      .run(name, brandName || null, industry, logoPath || null, brandTone || null);
    return db.prepare('SELECT * FROM companies WHERE id = ?').get(result.lastInsertRowid);
  },

  async findById(id) {
    return db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
  },
};

// Older local databases predate the channels column.
try {
  db.prepare('ALTER TABLE content ADD COLUMN channels TEXT').run();
} catch {
  /* column already exists */
}

const content = {
  async create({ userId, rawInput }) {
    const result = db
      .prepare('INSERT INTO content (user_id, raw_input) VALUES (?, ?)')
      .run(userId, rawInput);
    return db.prepare('SELECT * FROM content WHERE id = ?').get(result.lastInsertRowid);
  },

  async getById(id) {
    const row = db.prepare('SELECT * FROM content WHERE id = ?').get(id);
    if (!row) return undefined;
    return { ...row, channels: row.channels ? JSON.parse(row.channels) : {} };
  },

  async setChannel(id, channel, info) {
    const row = db.prepare('SELECT channels FROM content WHERE id = ?').get(id);
    const channels = row?.channels ? JSON.parse(row.channels) : {};
    channels[channel] = info;
    db.prepare('UPDATE content SET channels = ? WHERE id = ?').run(JSON.stringify(channels), id);
  },

  async update(id, { contentType, generatedCopy, imagePath, status }) {
    db.prepare(
      `UPDATE content SET
         content_type = COALESCE(?, content_type),
         generated_copy = COALESCE(?, generated_copy),
         image_path = COALESCE(?, image_path),
         status = COALESCE(?, status)
       WHERE id = ?`
    ).run(contentType || null, generatedCopy || null, imagePath || null, status || null, id);
  },
};

module.exports = { users, companies, content };
