// Upload-Post client (https://docs.upload-post.com) — real social publishing.
// Each PostChii user maps to an Upload-Post "profile" (username pc_<userId>);
// users connect their social accounts through a hosted link, then we post
// on their behalf.
const config = require('../config');

const BASE = 'https://api.upload-post.com/api';

function enabled() {
  return Boolean(config.uploadPost.apiKey);
}

function profileName(userId) {
  return `pc_${String(userId).replace(/[^a-zA-Z0-9_-]/g, '')}`.slice(0, 60);
}

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Apikey ${config.uploadPost.apiKey}`,
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 409) {
    throw new Error(`upload-post ${path} failed (${res.status}): ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data;
}

// Idempotent: creating an existing profile is treated as success.
async function ensureProfile(userId) {
  const username = profileName(userId);
  try {
    await api('/uploadposts/users', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  } catch (err) {
    if (!/exist/i.test(err.message)) throw err;
  }
  return username;
}

// Which platforms this user has connected (e.g. { instagram: {...}, facebook: {...} }).
async function connectedAccounts(userId) {
  const username = profileName(userId);
  const data = await api('/uploadposts/users');
  const profile = (data.profiles || []).find((p) => p.username === username);
  const accounts = profile?.social_accounts || {};
  return Object.fromEntries(
    Object.entries(accounts).filter(([, v]) => v && (typeof v === 'object' || String(v).length > 0))
  );
}

// Hosted page where the user connects Instagram/Facebook/LinkedIn/etc.
async function connectLink(userId, redirectUrl) {
  const username = await ensureProfile(userId);
  const data = await api('/uploadposts/users/generate-jwt', {
    method: 'POST',
    body: JSON.stringify({
      username,
      ...(redirectUrl ? { redirect_url: redirectUrl } : {}),
    }),
  });
  if (!data.access_url) throw new Error('upload-post did not return an access_url');
  return data.access_url;
}

// Publishes a photo post. `photoUrl` must be publicly fetchable (our Firebase
// Storage URLs are). Returns whatever per-platform results the API gives us.
async function postPhoto({ userId, platform, photoUrl, caption }) {
  const username = profileName(userId);
  const form = new FormData();
  form.append('user', username);
  form.append('platform[]', platform);
  form.append('photos[]', photoUrl);
  form.append('title', caption || '');

  const data = await api('/upload_photos', { method: 'POST', body: form });
  if (data.success === false) {
    throw new Error(`upload-post publish failed: ${JSON.stringify(data).slice(0, 300)}`);
  }

  // Best-effort extraction of a public post URL from the per-platform results.
  const result = data.results?.[platform] ?? data.results ?? data;
  const url =
    result?.post_url || result?.url || result?.share_url || result?.permalink || null;
  return { url, raw: data };
}

module.exports = { enabled, profileName, ensureProfile, connectedAccounts, connectLink, postPhoto };
