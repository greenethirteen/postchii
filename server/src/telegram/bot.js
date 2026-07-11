const { Telegraf } = require('telegraf');
const config = require('../config');
const { registerHandlers } = require('./handlers');

function createBot() {
  if (!config.telegram.botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set. Copy .env.example to .env and fill it in.');
  }
  const bot = new Telegraf(config.telegram.botToken);
  registerHandlers(bot);
  bot.catch((err, ctx) => {
    console.error('Bot error for update', ctx.update?.update_id, err);
    return ctx.reply('Something went wrong on our side. Please try again.').catch(() => {});
  });
  return bot;
}

module.exports = { createBot };
