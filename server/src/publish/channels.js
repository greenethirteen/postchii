// Publishing targets, shared by the HTTP API and the Telegram bot.
// The portal/social API calls are stubbed until real integrations land
// (Bayut/Property Finder ingest via CRM feeds, Meta via API/aggregator);
// the state transitions and storage are the real thing.
const { content } = require('../database');

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

  // Simulated round-trip to the channel's API.
  await new Promise((r) => setTimeout(r, 700));
  const ref = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const info = { status: 'live', url: spec.url(ref), publishedAt: new Date().toISOString() };
  await content.setChannel(contentId, channelKey, info);
  return info;
}

module.exports = { CHANNELS, publishTo };
