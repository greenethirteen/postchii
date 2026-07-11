// Uploads local files to Firebase Storage and returns a stable download URL.
// Returns null when Firebase isn't configured (SQLite dev mode) so callers
// can fall back to serving the local file.
const crypto = require('crypto');
const config = require('../config');

async function uploadPublic(localPath, destPath) {
  if (!config.firebase.enabled || !config.firebase.storageBucket) return null;
  const { getStorage } = require('firebase-admin/storage');
  const bucket = getStorage().bucket();
  const token = crypto.randomUUID();
  await bucket.upload(localPath, {
    destination: destPath,
    metadata: { metadata: { firebaseStorageDownloadTokens: token } },
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
    destPath
  )}?alt=media&token=${token}`;
}

module.exports = { uploadPublic };
