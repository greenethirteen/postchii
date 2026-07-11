# PostChii server (repo-root build for zero-config deploys).
# The web app deploys separately (e.g. Vercel with root directory `web`).
FROM node:20-bookworm-slim

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

# Chromium + fonts for the post renderer, build tools for better-sqlite3.
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium fonts-liberation fonts-noto-color-emoji \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY server/src ./src

EXPOSE 3210
CMD ["node", "src/server.js"]
