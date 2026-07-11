const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');
const config = require('../config');
const userService = require('../users/userService');
const contentService = require('../content/contentService');

const INDUSTRIES = {
  recruitment: 'Recruitment',
  real_estate: 'Real Estate',
};

const TONES = {
  luxury: 'Luxury',
  professional: 'Professional',
  friendly: 'Friendly',
};

const industryKeyboard = Markup.inlineKeyboard(
  Object.entries(INDUSTRIES).map(([key, label]) =>
    Markup.button.callback(label, `industry:${key}`)
  )
);

const toneKeyboard = Markup.inlineKeyboard(
  Object.entries(TONES).map(([key, label]) => Markup.button.callback(label, `tone:${key}`))
);

const skipLogoKeyboard = Markup.inlineKeyboard([
  Markup.button.callback('Skip for now', 'logo:skip'),
]);

function registerHandlers(bot) {
  bot.start(async (ctx) => {
    // Deep link from the web dashboard: t.me/<bot>?start=<link-code>
    const payload = (ctx.payload || '').trim();
    if (payload && userService.canLinkAccounts()) {
      const linked = await userService.linkTelegram(payload, ctx.from);
      if (linked) {
        const company = await userService.getCompany(linked);
        await ctx.reply(
          '🔗 Telegram connected to your Mochii account!\n\n' +
            (company
              ? `Brand: ${company.brand_name || company.name}\n\nSend me a business update and I'll turn it into a branded post.`
              : 'Finish your brand setup on the web dashboard, then send me a business update here.')
        );
        return;
      }
      await ctx.reply(
        'That link code is invalid or expired. Generate a new one from the web dashboard.'
      );
      return;
    }

    const user = await userService.findOrCreateUser(ctx.from);

    if (userService.isOnboarded(user)) {
      const company = await userService.getCompany(user);
      await ctx.reply(
        `Welcome back to ${company.brand_name || company.name}'s marketing assistant! 👋\n\n` +
          'Send me a business update — a new vacancy or a property listing — and ' +
          "I'll turn it into a branded social media post."
      );
      return;
    }

    await userService.setOnboardingState(user, { step: 'industry', data: {} });
    await ctx.reply(
      'Welcome! 👋 I turn your business updates into branded social media posts.\n\n' +
        'First, a quick setup. What type of business are you creating content for?',
      industryKeyboard
    );
  });

  bot.action(/^industry:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const user = await userService.getUser(ctx.from.id);
    if (!user) return;
    const state = userService.getOnboardingState(user);
    if (!state || state.step !== 'industry') return;

    state.data.industry = ctx.match[1];
    state.step = 'company_name';
    await userService.setOnboardingState(user, state);

    await ctx.reply(`Great — ${INDUSTRIES[ctx.match[1]]} it is. 🏢\n\nWhat is your company name?`);
  });

  bot.action(/^tone:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const user = await userService.getUser(ctx.from.id);
    if (!user) return;
    const state = userService.getOnboardingState(user);
    if (!state || state.step !== 'tone') return;

    state.data.tone = ctx.match[1];
    const company = await userService.completeOnboarding(user, state.data);

    await ctx.reply(
      `You're all set! ✅\n\n` +
        `Company: ${company.name}\n` +
        `Brand: ${company.brand_name}\n` +
        `Industry: ${INDUSTRIES[company.industry]}\n` +
        `Tone: ${TONES[company.brand_tone]}\n` +
        `Logo: ${company.logo_path ? 'uploaded' : 'not set'}\n\n` +
        'Now send me a business update, for example:\n' +
        (company.industry === 'recruitment'
          ? '"New vacancy: Senior Accountant at Deloitte Bahrain. Apply at deloitte.com/careers"'
          : '"Luxury 3 bedroom villa in Saadiyat Island. AED 6 million."')
    );
  });

  bot.action('logo:skip', async (ctx) => {
    await ctx.answerCbQuery();
    const user = await userService.getUser(ctx.from.id);
    if (!user) return;
    const state = userService.getOnboardingState(user);
    if (!state || state.step !== 'logo') return;

    state.data.logoPath = null;
    state.step = 'tone';
    await userService.setOnboardingState(user, state);
    await ctx.reply('No problem — you can add a logo later.\n\nWhat tone fits your brand?', toneKeyboard);
  });

  bot.command('new', async (ctx) => {
    const user = await userService.getUser(ctx.from.id);
    if (user) await contentService.discard(ctx, user);
  });

  bot.action('post:approve', async (ctx) => {
    await ctx.answerCbQuery();
    const user = await userService.getUser(ctx.from.id);
    if (user) await contentService.approve(ctx, user);
  });

  bot.action('post:discard', async (ctx) => {
    await ctx.answerCbQuery();
    const user = await userService.getUser(ctx.from.id);
    if (user) await contentService.discard(ctx, user);
  });

  // Channel picker after approval: toggle targets, publish, or defer.
  bot.action(/^pub:t:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const user = await userService.getUser(ctx.from.id);
    if (user) await contentService.togglePublishChannel(ctx, user, ctx.match[1]);
  });

  bot.action('pub:go', async (ctx) => {
    await ctx.answerCbQuery();
    const user = await userService.getUser(ctx.from.id);
    if (user) await contentService.publishSelected(ctx, user);
  });

  bot.action('pub:skip', async (ctx) => {
    await ctx.answerCbQuery();
    const user = await userService.getUser(ctx.from.id);
    if (user) await contentService.skipPublish(ctx, user);
  });

  bot.on('document', async (ctx) => {
    const user = await userService.findOrCreateUser(ctx.from);
    if (!userService.isOnboarded(user)) {
      await ctx.reply('Let’s set up first — send /start.');
      return;
    }
    await contentService.handleIncoming(ctx, user, {
      text: ctx.message.caption || '',
      documentFileId: ctx.message.document.file_id,
      mimeType: ctx.message.document.mime_type,
    });
  });

  bot.on('photo', async (ctx) => {
    const user = await userService.findOrCreateUser(ctx.from);
    const state = userService.getOnboardingState(user);

    if (state?.step === 'logo') {
      const photos = ctx.message.photo;
      const fileId = photos[photos.length - 1].file_id; // largest size
      state.data.logoPath = await downloadFile(ctx, fileId, config.storage.logosDir, `logo_${user.id}`);
      state.step = 'tone';
      await userService.setOnboardingState(user, state);
      await ctx.reply('Logo saved. 🎨\n\nWhat tone fits your brand?', toneKeyboard);
      return;
    }

    if (!userService.isOnboarded(user)) {
      await ctx.reply('Let’s finish setup first — send /start to begin.');
      return;
    }

    await contentService.handleIncoming(ctx, user, {
      text: ctx.message.caption || '',
      photoFileId: ctx.message.photo[ctx.message.photo.length - 1].file_id,
    });
  });

  bot.on('text', async (ctx) => {
    const user = await userService.findOrCreateUser(ctx.from);
    const state = userService.getOnboardingState(user);

    if (state) {
      await handleOnboardingText(ctx, user, state);
      return;
    }

    if (!userService.isOnboarded(user)) {
      await ctx.reply('Welcome! Send /start to set up your brand first.');
      return;
    }

    await contentService.handleIncoming(ctx, user, { text: ctx.message.text });
  });
}

async function handleOnboardingText(ctx, user, state) {
  const text = ctx.message.text.trim();

  switch (state.step) {
    case 'industry':
      await ctx.reply('Please pick your business type:', industryKeyboard);
      break;

    case 'company_name':
      state.data.companyName = text;
      state.step = 'brand_name';
      await userService.setOnboardingState(user, state);
      await ctx.reply(
        'And your brand name — the name that appears on your posts?\n' +
          '(Reply with the same name if it matches your company name.)'
      );
      break;

    case 'brand_name':
      state.data.brandName = text;
      state.step = 'logo';
      await userService.setOnboardingState(user, state);
      await ctx.reply('Now upload your logo as a photo. 🖼', skipLogoKeyboard);
      break;

    case 'logo':
      await ctx.reply('Please upload your logo as a photo, or skip:', skipLogoKeyboard);
      break;

    case 'tone':
      await ctx.reply('Please pick a tone:', toneKeyboard);
      break;

    default:
      await userService.setOnboardingState(user, null);
      await ctx.reply('Something got out of sync — send /start to restart setup.');
  }
}

async function downloadFile(ctx, fileId, dir, baseName) {
  const link = await ctx.telegram.getFileLink(fileId);
  const ext = path.extname(new URL(link.href).pathname) || '.jpg';
  const filePath = path.join(dir, `${baseName}${ext}`);
  const res = await fetch(link.href);
  if (!res.ok) throw new Error(`Failed to download Telegram file: ${res.status}`);
  fs.writeFileSync(filePath, Buffer.from(await res.arrayBuffer()));
  return filePath;
}

module.exports = { registerHandlers, downloadFile };
