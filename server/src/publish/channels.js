// Publishing targets, shared by the HTTP API and the Telegram bot.
// Social channels publish for real through Upload-Post when an API key is
// configured and the user has connected accounts; portals stay stubbed until
// their feed integrations land (Bayut/Property Finder via CRM feeds).
const { content } = require('../database');
const uploadPost = require('./uploadPost');

const SOCIAL = new Set(['instagram', 'facebook', 'linkedin']);

const CHANNELS = {
  instagram: { label: 'Instagram', icon: '📸', url: (ref) => `https://www.instagram.com/p/${ref}/` },
  facebook: { label: 'Facebook', icon: '📘', url: (ref) => `https://www.facebook.com/${ref}` },
  linkedin: { label: 'LinkedIn', icon: '💼', url: (ref) => `https://www.linkedin.com/feed/update/${ref}/` },
  bayut: { label: 'Bayut', icon: '🏠', url: (ref) => `https://www.bayut.com/property/details-${ref}.html` },
  property_finder: {
    label: 'Property Finder',
    icon: '🔑',
    url: (ref) => `https://www.propertyfinder.ae/en/plp/buy/listing-${ref}.html`,
  },
  dubizzle: { label: 'dubizzle', icon: '🏷️', url: (ref) => `https://dubai.dubizzle.com/property-for-sale/${ref}/` },
};

class NotConnectedError extends Error {
  constructor(channel) {
    super(`${channel} account not connected`);
    this.code = 'NOT_CONNECTED';
    this.channel = channel;
  }
}

function postCaption(item) {
  try {
    const { copy } = JSON.parse(item.generated_copy || '{}');
    if (!copy) return item.raw_input || '';
    const hashtags = (copy.hashtags || []).map((h) => `#${String(h).replace(/^#/, '')}`).join(' ');
    return [copy.caption, hashtags].filter(Boolean).join('\n\n');
  } catch {
    return item.raw_input || '';
  }
}

// Publishes one content record to one channel. Idempotent: republish
// returns the existing live info instead of double-posting.
async function publishTo(contentId, channelKey) {
  const spec = CHANNELS[channelKey];
  if (!spec) throw new Error(`unknown channel: ${channelKey}`);

  const item = await content.getById(contentId);
  if (!item) throw new Error('content not found');
  if (item.channels?.[channelKey]?.status === 'live') {
    return { alreadyLive: true, ...item.channels[channelKey] };
  }

  let info;
  if (SOCIAL.has(channelKey) && uploadPost.enabled() && item.image_path) {
    // Real publish via Upload-Post.
    const connected = await uploadPost.connectedAccounts(item.user_id);
    if (!connected[channelKey]) throw new NotConnectedError(channelKey);

    const result = await uploadPost.postPhoto({
      userId: item.user_id,
      platform: channelKey,
      photoUrl: item.image_path,
      caption: postCaption(item),
    });
    info = {
      status: 'live',
      url: result.url || null,
      via: 'upload-post',
      publishedAt: new Date().toISOString(),
    };
  } else {
    // Simulated round-trip (portals, or social before Upload-Post is configured).
    await new Promise((r) => setTimeout(r, 700));
    const ref = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    info = {
      status: 'live',
      url: spec.url(ref),
      simulated: true,
      publishedAt: new Date().toISOString(),
    };
  }

  await content.setChannel(contentId, channelKey, info);
  return info;
}

module.exports = { CHANNELS, publishTo, NotConnectedError };
