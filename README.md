# PostChii 🍡

AI marketing assistant for recruitment & real-estate teams.
Set up your brand on the web, then message the Telegram bot a business update
and get back a branded, ready-to-publish social media post — and publish it
to your channels from chat.

## Structure

```
server/   Express + Telegraf bot + AI pipeline + renderer (Node.js)
web/      Next.js app — Firebase Auth, brand onboarding, dashboard
firestore.rules / storage.rules   Firebase security rules
```

## Data backends

The server uses **Firestore + Firebase Storage** when `FIREBASE_SERVICE_ACCOUNT`
is set in `server/.env`, and falls back to **local SQLite** otherwise (handy for
offline dev). The web app always requires Firebase (`web/.env.local`).

## Run locally

```bash
# bot + pipeline (port 3210)
cd server && npm install && npm start

# web app (port 3220)
cd web && npm install && npm run dev
```

## Firebase setup (one time)

1. Create a project at console.firebase.google.com
2. Authentication → enable Email/Password and Google sign-in
3. Firestore → create database (production mode), paste `firestore.rules`
4. Storage → enable, paste `storage.rules`
5. Project settings → Your apps → add a **Web app** → copy the config into
   `web/.env.local` (see `web/.env.local.example`)
6. Project settings → Service accounts → generate private key → save JSON as
   `server/serviceAccount.json`, set `FIREBASE_SERVICE_ACCOUNT=./serviceAccount.json`
   and `FIREBASE_STORAGE_BUCKET` in `server/.env`

## Telegram linking

Dashboard → "Connect Telegram" writes a one-time code to `linkCodes/{code}`
and deep-links to `t.me/<bot>?start=<code>`; the bot binds that `telegram_id`
to the Firebase user and deletes the code.

## Pipeline status

- ✅ Web auth, onboarding, dashboard, Telegram linking
- ✅ Bot onboarding (for bot-only users) + message intake (text/photo/PDF)
- ✅ AI extraction + copywriting (OpenAI)
- ✅ Renderer (brand template + user photo → Puppeteer → 1080×1080 PNG → Firebase Storage)
- ✅ Deliver post + approve/revise loop + channel picker in chat
- ✅ Publish state machine (`POST /publish`, ID-token auth) — channel API calls stubbed
- ⏳ Real social publishing (aggregator), portal feeds (Bayut/Property Finder), promote-as-ad
- ⏳ Deployment (currently local), rate limiting
