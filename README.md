# TITANIC HUB — React + Node rebuild (file-based storage)

The full rebuild of the static site as a real app — no database server to install.

## 1. Prerequisites

Just Node.js 18+.

## 2. Configure and run

```bash
cd server
cp .env.example .env    # set a random JWT_SECRET
npm install
npm run dev              # http://localhost:4000
```

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

Site: `http://localhost:5173`. Admin: `http://localhost:5173/admin/login`.

**Default login: `admin` / `change-me-now`.** Change it immediately — Site Settings isn't where that lives anymore, it's under the new **Accounts** tab (see below).

## 3. What's in the admin panel now

| Tab | What it does |
|---|---|
| **Scripts** | name, slug, status, **draft/published visibility**, summary, overview, tags, features, requirements, loadstring URL, YouTube link, cover image, version, changelog |
| **Executors** | name, platform, status, image, visit-site link |
| **Site settings** | branding, Discord (invite + live member count + announce webhook), YouTube channel, announcement banner, hero text, why-us pillars, field report, FAQ, disclaimer — all freely editable |
| **Analytics** | views and "Get script" clicks per script, with a click-through rate |
| **Backups** | every data file auto-snapshots before each save; browse, restore, or download a full export |
| **Activity log** | who changed what, and when |
| **Accounts** | create/delete admin logins, change your own password |

## 4. Draft vs. Published

New scripts default to **draft** — invisible on the public site (both the archive list and its direct URL 404) until you flip it to **Published** in the admin form. Existing scripts were migrated to `published` automatically, so nothing you already had went dark.

## 5. Multiple admin accounts

Auth moved from a single `.env` login to `server/src/data/admins.json` (bcrypt-hashed, never exposed over the API). From **Accounts**:
- Add as many logins as you want.
- Delete anyone except yourself or the last remaining account (both are blocked, so you can't lock yourself out).
- Change your own password (requires your current one).

**Rate limiting**: `/api/auth/login` allows 10 attempts per IP per 15 minutes, then returns 429 until the window resets — basic brute-force protection.

## 6. Backups

Every write to any data file snapshots the *previous* version first (`server/src/data/backups/`, capped at the last 15 snapshots per file — older ones are pruned automatically). This means:

- Every save is individually undoable from **Backups**.
- Restoring a snapshot itself snapshots the current state first — a restore is never a one-way door.
- **"Download full backup"** exports scripts + executors + settings + activity log as one JSON file (admin passwords and analytics are deliberately excluded from this export).

This is still file-based, not a real database — back up the whole `server/src/data/` folder externally too (rsync it somewhere, commit it to a private repo, whatever) for anything that matters. The built-in snapshots protect against "I made a bad edit," not "the disk died."

## 7. Analytics

Two events get tracked automatically, no setup needed: a **view** every time someone loads a script's page, and a **click** every time they hit "Copy script." See the numbers under the **Analytics** tab, sorted by views.

## 8. Discord integration

- **Live member count** (footer): needs two things to actually show a number instead of "—" — enable *Server Settings → Widget → Enable Server Widget* in Discord, and put your real server ID into Site Settings → Branding & Discord. Both steps are spelled out right under that field in the admin panel now.
- **Announcements**: paste a Discord webhook URL into the same section, and the server will post automatically whenever a *published* script goes live or gets a new changelog entry. Nothing posts if the field is empty.
- **YouTube channel icon**: add a channel URL in the same section and an icon appears next to Discord in the header/footer; leave it blank and the icon just doesn't render.

## 9. Tags and related scripts

Tags on a script's page are now clickable — they jump to the archive pre-filtered to that tag (`/?tag=Auto-farm`), with a "clear" link to drop the filter. Each script's page also lists other active scripts in a **Related scripts** section at the bottom.

## 10. Bugs fixed from the original React migration

A few CSS rules got dropped when the static site became a React app — fixed now:
- **Field report** had no base grid layout, so its two columns just stacked instead of sitting side-by-side on desktop.
- Clicking **Archive** or **FAQ** in the nav scrolled content partly behind the sticky header (missing `scroll-margin-top`).
- The small Discord icon in the footer was oversized relative to its button.

## 11. Image uploads

Both Scripts (cover image) and Executors (logo) support real file uploads — pick a file, it uploads and fills the field in. Manual URL entry still works as an alternative. PNG/JPEG/WEBP/GIF only, capped at 5MB, served from `server/src/uploads/`.

## 12. SEO

Dynamic `sitemap.xml` and `rss.xml` (generated live from whatever scripts exist, served by the Express server), `robots.txt`, and per-page `<title>`/meta description/JSON-LD via a small custom hook (`useDocumentHead`).

## 13. Things you still need to fill in

- **Loadstring URL**, **YouTube demo link**, **executor images/visit links** — same placeholders as before, editable from the admin panel.
- **`discordGuildId`** and **`discordWebhookUrl`** — see section 8.
- **`SITE_URL`** env var on the server — used to build sitemap/RSS URLs.
- **Canonical URL / OG tags** in `client/index.html` — still placeholder, update once deployed.

## 14. Deploying: Vercel (frontend) + Wispbyte (backend)

**Why split like this**: Vercel resets its filesystem between requests — the JSON data files and uploaded images this app relies on wouldn't survive. Vercel is great for the static React build though, so: **client → Vercel, server → Wispbyte** (or any host that keeps a Node process running with a real, persistent disk).

### Step 1 — push the code to GitHub
Vercel deploys from a git repo. Push this whole project (both `client/` and `server/` folders) to a GitHub repo if it isn't already.

### Step 2 — deploy the backend to Wispbyte first
You need its live URL before the frontend build, since that URL gets baked into the frontend at build time.
1. In Wispbyte's panel, create a new server/project for a Node.js app (not the Discord-bot-specific flow — the generic "website/backend" option).
2. Point it at your repo's `server/` folder (or upload it directly if Wispbyte's panel doesn't support subfolder-of-monorepo deploys — check their file manager/git clone options).
3. Startup command: `npm install && npm start`.
4. Set environment variables in Wispbyte's panel (same values as your local `server/.env`, **except** `CLIENT_ORIGIN` — leave that for step 4):
   - `JWT_SECRET` — a long random string
   - `SITE_URL` — your eventual public domain (for sitemap/RSS)
   - `PORT` — Wispbyte usually injects this automatically; only set it if their docs say to
5. Start the server and note the public URL Wispbyte gives it (something like `https://your-project.wispbyte.app`, or a custom subdomain if you set one up).
6. Confirm it's actually up: visit `https://your-backend-url/api/health` — it should return `{"ok":true}`.

### Step 3 — point the frontend at that backend
```bash
cd client
cp .env.example .env.production
```
Edit `.env.production`:
```
VITE_API_URL=https://your-backend-url-from-step-2
```

### Step 4 — deploy the frontend to Vercel
1. Go to vercel.com → **Add New Project** → import your GitHub repo.
2. When it asks for the root directory, set it to `client` (not the repo root — this is a monorepo with `client/` and `server/` side by side).
3. Framework preset: Vite (Vercel usually auto-detects this).
4. Build command: `npm run build`. Output directory: `dist`.
5. Under **Environment Variables**, add `VITE_API_URL` with the same value as `.env.production` above (Vercel needs it set there too — it doesn't read your local `.env.production` file).
6. Deploy. Vercel gives you a URL like `https://your-project.vercel.app`.

### Step 5 — allow the frontend's origin on the backend
Back in Wispbyte's environment variables, set:
```
CLIENT_ORIGIN=https://your-project.vercel.app
```
Restart the backend so it picks up the new CORS setting. Without this step, the browser will block every request from the deployed frontend to the backend (CORS error in the console) even though both are individually running fine.

### Step 6 — test it for real
Open your Vercel URL and check: the archive loads (confirms the frontend can reach the backend), `/admin/login` works, and uploading an image in the admin panel actually shows up on the public site (confirms the `/uploads` path resolution is working correctly across the two domains).

### Ongoing: two separate deploys
Since this is now two projects instead of one, remember: pushing to your repo auto-redeploys the Vercel frontend, but the backend on Wispbyte needs its own restart/redeploy through their panel (or whatever auto-deploy hook they offer) when you change server code. Data files (`server/src/data/`) live on Wispbyte's disk and aren't touched by either deploy process — that's the point.

## 15. Project structure

```
server/
  src/
    data/        scripts.json, executors.json, settings.json, admins.json, activity.json, analytics.json
    data/backups/  auto-generated snapshots (not hand-edited)
    uploads/     uploaded images
    db/          store.js (read/write + snapshots), activityLog.js, discordAnnounce.js
    controllers/ scripts, executors, settings, auth, admins, analytics, backups, activity
    routes/      one file per resource, + feeds.js (sitemap/rss), upload.js
    middleware/  auth.js (JWT guard), rateLimiter.js, upload.js (multer)
    app.js, index.js

client/
  src/
    pages/       Home, ScriptDetail, Executors, Disclaimer, NotFound
    pages/admin/ Login, layout, Scripts, Executors, Settings, Accounts, Activity, Backups, Analytics
    components/  Header (+ AnnouncementBanner), Footer, cards, scroll chrome, toasts
    hooks/       useAuth, useToast, useScrollReveal, useSettings, useDocumentHead
    api/client.js
    styles/global.css
```

## 16. Roles: owner vs. editor

Every account is one or the other:
- **Owner** — everything an editor can do, plus creating/deleting accounts and changing anyone's role.
- **Editor** — full access to Scripts, Executors, Site Settings, Analytics, Backups, and the Activity log. Can see the Accounts list (so they know who else has access) but can't add, remove, or promote/demote anyone.

There's always guaranteed to be at least one owner — you can't delete or demote your own account, and since only owners can reach the account-management endpoints at all, there's no path to zero owners.

**One thing worth knowing**: role changes take effect on that person's *next login*, not instantly — permissions are baked into their login session (JWT) at sign-in time, so if you promote or demote someone while they're already logged in, they'll need to log out and back in before the new role applies.

## 17. What's still NOT wired up

- A "you have unsaved changes" warning when leaving a Site Settings tab mid-edit.
- Real-time updates — editing something in the admin panel doesn't push to anyone with the public page already open; they need to reload.
