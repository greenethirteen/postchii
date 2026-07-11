const path = require('path');
const { Markup } = require('telegraf');
const config = require('../config');
const { content } = require('../database');
const userService = require('../users/userService');
const { extract, updateExtraction } = require('../ai/extractor');
const { writeCopy, editContent } = require('../ai/copywriter');
const renderer = require('../renderer/renderer');
const { CHANNELS, publishTo } = require('../publish/channels');
const uploadPost = require('../publish/uploadPost');
const { uploadPublic } = require('../storage/upload');

// Required fields before we generate; everything else is optional.
const REQUIRED = {
  job: ['title', 'company', 'location'],
  property: ['title', 'location', 'price'],
};

const FIELD_QUESTIONS = {
  title: 'What role/property is this? (e.g. "Senior Accountant" or "3BR Villa")',
  company: 'Which company is hiring?',
  location: 'Where is it located?',
  price: 'What is the price?',
};

// In-memory drafts keyed by user id. MVP trade-off: a server restart drops
// in-progress drafts (users just resend); finished posts are in the DB.
const drafts = new Map();

const reviewKeyboard = Markup.inlineKeyboard([
  Markup.button.callback('✅ Approve', 'post:approve'),
  Markup.button.callback('🗑 Discard', 'post:discard'),
]);

function missingFields(extracted) {
  const required = REQUIRED[extracted.type] || REQUIRED.job;
  return required.filter((f) => !String(extracted[f] || '').trim());
}

async function handleIncoming(ctx, user, { text, photoFileId, documentFileId, mimeType }) {
  const draft = drafts.get(user.id);
  const hasMedia = Boolean(photoFileId || documentFileId);

  // Plain text while a draft is open = answer to a question, or an edit.
  if (draft && !hasMedia && text) {
    if (draft.step === 'gathering') return handleGapAnswer(ctx, user, draft, text);
    if (draft.step === 'review') return handleEdit(ctx, user, draft, text);
  }

  return startDraft(ctx, user, { text, photoFileId, documentFileId, mimeType });
}

async function startDraft(ctx, user, { text, photoFileId, documentFileId, mimeType }) {
  await ctx.reply('👀 Reading that…');

  let imageDataUri = null;
  let pdfText = null;

  try {
    if (photoFileId) imageDataUri = await downloadAsDataUri(ctx, photoFileId);
    if (documentFileId) {
      if (mimeType === 'application/pdf') {
        pdfText = await downloadPdfText(ctx, documentFileId);
      } else if ((mimeType || '').startsWith('image/')) {
        imageDataUri = await downloadAsDataUri(ctx, documentFileId);
      } else {
        await ctx.reply('I can read text, photos, screenshots and PDFs — that file type I can’t handle yet.');
        return;
      }
    }
  } catch (err) {
    console.error('Media download failed', err);
    await ctx.reply('I couldn’t download that file — please try sending it again.');
    return;
  }

  const inputText = [text, pdfText].filter(Boolean).join('\n\n');
  const record = await content.create({
    userId: user.id,
    rawInput: inputText || '[image]',
  });

  try {
    const extracted = await extract(inputText, imageDataUri);
    // The user's photo doubles as the post background.
    const draft = { recordId: record.id, extracted, step: 'gathering', photo: imageDataUri };
    drafts.set(user.id, draft);
    await continueDraft(ctx, user, draft);
  } catch (err) {
    console.error('Extraction failed for record', record.id, err);
    await content.update(record.id, { status: 'failed' });
    drafts.delete(user.id);
    await ctx.reply('Sorry — I couldn’t make sense of that. Try rephrasing or a clearer image.');
  }
}

async function handleGapAnswer(ctx, user, draft, text) {
  try {
    draft.extracted = await updateExtraction(draft.extracted, text);
    await continueDraft(ctx, user, draft);
  } catch (err) {
    console.error('Update extraction failed', err);
    await ctx.reply('Hmm, I didn’t catch that — could you say it differently?');
  }
}

// Asks for the next missing field, or generates the post when complete.
async function continueDraft(ctx, user, draft) {
  const missing = missingFields(draft.extracted);
  if (missing.length > 0) {
    const field = missing[0];
    await ctx.reply(
      `Almost there — ${FIELD_QUESTIONS[field] || `what is the ${field}?`}`
    );
    return;
  }
  await generateAndPreview(ctx, user, draft);
}

async function generateAndPreview(ctx, user, draft) {
  const company = await userService.getCompany(user);
  await ctx.reply('🎨 Building your post…');

  try {
    if (!draft.copy) draft.copy = await writeCopy(draft.extracted, company);
    const imagePath = await renderer.buildPost(draft.copy, draft.extracted, company, {
      photo: draft.photo,
    });
    draft.imagePath = imagePath;
    draft.step = 'review';

    // The DB stores a URL the web dashboard can load; the bot keeps the fs path.
    // Prefer Firebase Storage (survives server restarts/redeploys); fall back
    // to serving the local file in dev.
    let imageUrl = null;
    try {
      imageUrl = await uploadPublic(imagePath, `posts/${path.basename(imagePath)}`);
    } catch (err) {
      console.error('Storage upload failed, falling back to local URL', err.message);
    }
    if (!imageUrl) imageUrl = `${config.publicUrl}/storage/posts/${path.basename(imagePath)}`;
    await content.update(draft.recordId, {
      contentType: draft.extracted.type || null,
      generatedCopy: JSON.stringify({ extracted: draft.extracted, copy: draft.copy }),
      imagePath: imageUrl,
      status: 'review',
    });

    await ctx.replyWithPhoto({ source: imagePath }, { caption: draft.copy.headline || '' });

    const hashtags = (draft.copy.hashtags || []).map((h) => `#${h.replace(/^#/, '')}`).join(' ');
    await ctx.reply(
      `📸 Instagram caption:\n${draft.copy.caption}\n\n` +
        `💼 LinkedIn version:\n${draft.copy.linkedin_caption}\n\n` +
        `👉 ${draft.copy.cta}\n\n${hashtags}\n\n` +
        '✏️ Want changes? Just tell me — e.g. "make the headline shorter", "remove the salary".',
      reviewKeyboard
    );
  } catch (err) {
    console.error('Generation failed for record', draft.recordId, err);
    await content.update(draft.recordId, { status: 'failed' });
    await ctx.reply('Sorry — something broke while building the post. Send it again?');
    drafts.delete(user.id);
  }
}

async function handleEdit(ctx, user, draft, instruction) {
  await ctx.reply('✏️ Updating…');
  try {
    const updated = await editContent(draft.extracted, draft.copy, instruction);
    draft.extracted = updated.extracted || draft.extracted;
    draft.copy = updated.copy || draft.copy;
    await generateAndPreview(ctx, user, draft);
  } catch (err) {
    console.error('Edit failed', err);
    await ctx.reply('I couldn’t apply that change — try phrasing it differently.');
  }
}

// Channels offered in the picker; portals only make sense for properties.
function channelKeysFor(draft) {
  const base = ['instagram', 'facebook', 'linkedin'];
  return draft.extracted?.type === 'property'
    ? [...base, 'bayut', 'property_finder', 'dubizzle']
    : base;
}

function pickerKeyboard(draft) {
  const selected = draft.channels || new Set();
  const rows = channelKeysFor(draft).map((key) => {
    const ch = CHANNELS[key];
    const on = selected.has(key);
    return [Markup.button.callback(`${on ? '✅' : ch.icon} ${ch.label}`, `pub:t:${key}`)];
  });
  rows.push([
    Markup.button.callback('🚀 Publish selected', 'pub:go'),
    Markup.button.callback('Later', 'pub:skip'),
  ]);
  return Markup.inlineKeyboard(rows);
}

async function approve(ctx, user) {
  const draft = drafts.get(user.id);
  if (!draft || draft.step !== 'review') {
    await ctx.reply('Nothing to approve right now — send me a new job or listing.');
    return;
  }
  await content.update(draft.recordId, { status: 'approved' });
  draft.step = 'publish';
  draft.channels = new Set();
  await ctx.reply('✅ Approved! Where should I post it?', pickerKeyboard(draft));
}

async function togglePublishChannel(ctx, user, channelKey) {
  const draft = drafts.get(user.id);
  if (!draft || draft.step !== 'publish' || !CHANNELS[channelKey]) return;
  if (draft.channels.has(channelKey)) draft.channels.delete(channelKey);
  else draft.channels.add(channelKey);
  await ctx.editMessageReplyMarkup(pickerKeyboard(draft).reply_markup).catch(() => {});
}

async function publishSelected(ctx, user) {
  const draft = drafts.get(user.id);
  if (!draft || draft.step !== 'publish') {
    await ctx.reply('Nothing queued to publish — send me a new update.');
    return;
  }
  if (!draft.channels || draft.channels.size === 0) {
    await ctx.reply('Pick at least one channel first. 👆');
    return;
  }

  const keys = [...draft.channels];
  await ctx.reply(`🚀 Publishing to ${keys.length} channel${keys.length > 1 ? 's' : ''}…`);

  const lines = [];
  let needsConnect = false;
  for (const key of keys) {
    const ch = CHANNELS[key];
    try {
      const info = await publishTo(draft.recordId, key);
      lines.push(`${ch.icon} ${ch.label} ✓${info.url ? `\n${info.url}` : ''}`);
      draft.channels.delete(key);
    } catch (err) {
      if (err.code === 'NOT_CONNECTED') {
        needsConnect = true;
        lines.push(`${ch.icon} ${ch.label} — account not connected yet`);
      } else {
        console.error(`Publish to ${key} failed for record`, draft.recordId, err);
        lines.push(`${ch.icon} ${ch.label} ✗ — failed, try again from the dashboard`);
        draft.channels.delete(key);
      }
    }
  }

  if (needsConnect) {
    // Keep the draft alive so the user can connect and hit Publish again.
    let connectMsg = 'Connect your accounts from the web dashboard, then tap Publish again.';
    try {
      const url = await uploadPost.connectLink(user.id);
      connectMsg = `Connect your accounts here (takes a minute):\n${url}\n\nThen tap 🚀 Publish again.`;
    } catch (err) {
      console.error('connect link failed', err);
    }
    await ctx.reply(`${lines.join('\n\n')}\n\n🔗 ${connectMsg}`, pickerKeyboard(draft));
    return;
  }

  await content.update(draft.recordId, { status: 'published' });
  drafts.delete(user.id);
  await ctx.reply(
    `All done 🎉\n\n${lines.join('\n\n')}\n\nLinks are also in your dashboard. Send me the next one!`
  );
}

async function skipPublish(ctx, user) {
  const draft = drafts.get(user.id);
  if (draft) drafts.delete(user.id);
  await ctx.reply(
    '👍 Saved without publishing — you can publish it any time from your dashboard.\n\nSend me the next update whenever.'
  );
}

async function discard(ctx, user) {
  const draft = drafts.get(user.id);
  if (draft) {
    await content.update(draft.recordId, { status: 'discarded' });
    drafts.delete(user.id);
  }
  await ctx.reply('🗑 Discarded. Send me something new whenever.');
}

function hasOpenDraft(user) {
  return drafts.has(user.id);
}

async function downloadAsDataUri(ctx, fileId) {
  const { buffer, contentType } = await downloadBuffer(ctx, fileId);
  return `data:${contentType || 'image/jpeg'};base64,${buffer.toString('base64')}`;
}

async function downloadPdfText(ctx, fileId) {
  const pdfParse = require('pdf-parse');
  const { buffer } = await downloadBuffer(ctx, fileId);
  const data = await pdfParse(buffer);
  return (data.text || '').trim();
}

async function downloadBuffer(ctx, fileId) {
  const link = await ctx.telegram.getFileLink(fileId);
  const res = await fetch(link.href);
  if (!res.ok) throw new Error(`Telegram file download failed: ${res.status}`);
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    contentType: res.headers.get('content-type'),
  };
}

module.exports = {
  handleIncoming,
  approve,
  discard,
  hasOpenDraft,
  togglePublishChannel,
  publishSelected,
  skipPublish,
};
