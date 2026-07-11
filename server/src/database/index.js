const config = require('../config');

// Both backends expose the same async models API:
//   users.findByTelegramId / create / setCompany / setOnboardingState
//   companies.create / findById
//   content.create / update
// Firestore additionally exposes `linking` (web account <-> Telegram).
module.exports = config.firebase.enabled
  ? require('./firestore')
  : require('./models');
