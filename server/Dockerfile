# PostChii server — bot + AI pipeline + renderer + publish API.
# System Chromium is installed for Puppeteer (skipping its own download).
FROM node:20-bookworm-slim

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

# Chromium + fonts for rendering, build tools for better-sqlite3.
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium fonts-liberation fonts-noto-color-emoji \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 3210
CMD ["node", "src/server.js"]
