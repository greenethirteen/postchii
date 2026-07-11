const models = require('../database');
const { users, companies } = models;

async function findOrCreateUser(telegramUser) {
  const existing = await users.findByTelegramId(telegramUser.id);
  if (existing) return existing;
  const name = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ');
  return users.create({ telegramId: telegramUser.id, name });
}

async function getUser(telegramId) {
  return users.findByTelegramId(telegramId);
}

async function getCompany(user) {
  return user.company_id ? companies.findById(user.company_id) : null;
}

function isOnboarded(user) {
  return Boolean(user.company_id);
}

function getOnboardingState(user) {
  return user.onboarding_state ? JSON.parse(user.onboarding_state) : null;
}

async function setOnboardingState(user, state) {
  await users.setOnboardingState(user.id, state);
}

async function completeOnboarding(user, data) {
  const company = await companies.create({
    name: data.companyName,
    brandName: data.brandName,
    industry: data.industry,
    logoPath: data.logoPath,
    brandTone: data.tone,
  });
  await users.setCompany(user.id, company.id);
  await users.setOnboardingState(user.id, null);
  return company;
}

// Web account <-> Telegram linking (Firestore backend only).
function canLinkAccounts() {
  return Boolean(models.linking);
}

async function linkTelegram(code, telegramUser) {
  if (!models.linking) return null;
  return models.linking.linkTelegram(code, telegramUser);
}

module.exports = {
  findOrCreateUser,
  getUser,
  getCompany,
  isOnboarded,
  getOnboardingState,
  setOnboardingState,
  completeOnboarding,
  canLinkAccounts,
  linkTelegram,
};
