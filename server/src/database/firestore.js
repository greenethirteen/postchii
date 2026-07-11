// Firestore backend (used when FIREBASE_SERVICE_ACCOUNT is set).
// Documents use camelCase fields; rows returned to services keep the
// snake_case shape the rest of the app expects.
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const config = require('../config');

const serviceAccount = require(path.resolve(config.firebase.serviceAccountPath));

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: config.firebase.storageBucket || undefined,
});

const db = getFirestore(app);

function userRow(doc) {
  if (!doc || !doc.exists) return undefined;
  const d = doc.data();
  return {
    id: doc.id,
    telegram_id: d.telegramId || null,
    name: d.name || null,
    company_id: d.companyId || null,
    onboarding_state: d.onboardingState ? JSON.stringify(d.onboardingState) : null,
    created_at: d.createdAt || null,
  };
}

function companyRow(doc) {
  if (!doc || !doc.exists) return undefined;
  const d = doc.data();
  return {
    id: doc.id,
    name: d.name || null,
    brand_name: d.brandName || null,
    industry: d.industry || null,
    logo_path: d.logoPath || null,
    brand_tone: d.brandTone || null,
    created_at: d.createdAt || null,
  };
}

const users = {
  async findByTelegramId(telegramId) {
    const snap = await db
      .collection('users')
      .where('telegramId', '==', String(telegramId))
      .limit(1)
      .get();
    return snap.empty ? undefined : userRow(snap.docs[0]);
  },

  async create({ telegramId, name }) {
    const ref = await db.collection('users').add({
      telegramId: String(telegramId),
      name: name || null,
      companyId: null,
      onboardingState: null,
      createdAt: new Date().toISOString(),
    });
    return userRow(await ref.get());
  },

  async setCompany(userId, companyId) {
    await db.collection('users').doc(String(userId)).update({ companyId });
  },

  async setOnboardingState(userId, state) {
    await db.collection('users').doc(String(userId)).update({ onboardingState: state || null });
  },
};

const companies = {
  async create({ name, brandName, industry, logoPath, brandTone }) {
    const ref = await db.collection('companies').add({
      name,
      brandName: brandName || null,
      industry,
      logoPath: logoPath || null,
      brandTone: brandTone || null,
      createdAt: new Date().toISOString(),
    });
    return companyRow(await ref.get());
  },

  async findById(id) {
    return companyRow(await db.collection('companies').doc(String(id)).get());
  },
};

const content = {
  async create({ userId, rawInput }) {
    const ref = await db.collection('content').add({
      userId: String(userId),
      rawInput,
      contentType: null,
      generatedCopy: null,
      imagePath: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    const doc = await ref.get();
    const d = doc.data();
    return { id: doc.id, user_id: d.userId, raw_input: d.rawInput, status: d.status };
  },

  async update(id, { contentType, generatedCopy, imagePath, status }) {
    const patch = {};
    if (contentType) patch.contentType = contentType;
    if (generatedCopy) patch.generatedCopy = generatedCopy;
    if (imagePath) patch.imagePath = imagePath;
    if (status) patch.status = status;
    await db.collection('content').doc(String(id)).update(patch);
  },

  async getById(id) {
    const doc = await db.collection('content').doc(String(id)).get();
    if (!doc.exists) return undefined;
    const d = doc.data();
    return {
      id: doc.id,
      user_id: d.userId,
      raw_input: d.rawInput,
      status: d.status,
      image_path: d.imagePath || null,
      generated_copy: d.generatedCopy || null,
      channels: d.channels || {},
    };
  },

  async setChannel(id, channel, info) {
    await db
      .collection('content')
      .doc(String(id))
      .set({ channels: { [channel]: info } }, { merge: true });
  },
};

// Web dashboard writes linkCodes/{code} = { uid }. When a Telegram user opens
// t.me/<bot>?start=<code>, we bind their telegram_id to that web account.
const linking = {
  async linkTelegram(code, telegramUser) {
    const codeRef = db.collection('linkCodes').doc(String(code).toUpperCase());
    const codeDoc = await codeRef.get();
    if (!codeDoc.exists) return null;

    const { uid } = codeDoc.data();
    const userRef = db.collection('users').doc(uid);

    // Detach this telegram_id from any previous bot-only profile.
    const existing = await db
      .collection('users')
      .where('telegramId', '==', String(telegramUser.id))
      .get();
    for (const doc of existing.docs) {
      if (doc.id !== uid) await doc.ref.update({ telegramId: null });
    }

    const name = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ');
    await userRef.set(
      { telegramId: String(telegramUser.id), name: name || null },
      { merge: true }
    );
    await codeRef.delete();
    return userRow(await userRef.get());
  },
};

module.exports = { users, companies, content, linking };
