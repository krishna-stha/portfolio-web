# Krishna Sharan Shrestha — Portfolio

A brutalist, AI/ML-themed portfolio built with **Next.js, React, and TypeScript**, with a
REST API backing a hidden admin panel served on its own subdomain.

---

## 1. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + TypeScript, Framer Motion for animation |
| Styling | Plain CSS (`app/globals.css`) — brutalist design tokens, no CSS framework |
| Content API | REST — `app/api/**/route.ts` (Next.js Route Handlers) |
| Content storage | A JSON file on the server (`data/site-data.json`), read/written by the API |
| Auth | Password (scrypt-hashed) + signed, stateless session cookie |

---

## 2. Running it locally

```bash
npm install
npm run dev
```

- **Public site:** http://localhost:3000
- **Admin panel:** http://admin.localhost:3000 (works out of the box — Chrome/Firefox/Safari
  all auto-resolve `*.localhost` to your own machine, no hosts-file editing needed)

**This zip already comes with your admin password set** (the one you chose). It's stored
hashed (scrypt) in `data/admin-auth.json` — never in plain text anywhere in the code or this
README. Change it any time from **Settings & Data → Change admin password**. If you ever
delete `data/admin-auth.json`, the app generates a random one-time password and prints it
to the server console on the next login attempt.

---

## 3. Accessing the admin panel

**The admin panel only exists on the `admin.` subdomain — never on the main site.** There's
no `/admin` link anywhere in the public site, and visiting `yourdomain.com/admin` directly
returns a plain 404, as if the route didn't exist. This is enforced in `middleware.ts` by
checking the request's `Host` header, not by hiding a link, so it can't be found by
guessing paths.

For production: deploy this app once, then add a DNS record for `admin.yourdomain.com`
pointing at the same place `yourdomain.com` does (same host, or — on a host that supports
it — add it as a second domain on the same project). One deployment serves both hostnames;
`middleware.ts` decides what each one is allowed to show.

---

## 4. Editing content

Everything editable lives behind tabs in the admin panel:

- **Hero** — name, role line, tagline, both CTA buttons, and the navigation logo
- **About** — profile picture, initials (fallback), bio, focus tags, and your downloadable resume
- **Skills** — your programming languages/tools (shown on the site, but intentionally left
  out of the top nav)
- **Experience**, **Education**, **Projects**, **Achievements**, **Socials** — add/edit/delete entries
- **Settings & Data** — change password, export/import a JSON backup, reset to defaults

Every save calls `PUT /api/data`, which writes straight to `data/site-data.json`. The
public homepage reads that same file on every request, so changes are live the moment you
save — no rebuild or redeploy needed.

### Reordering lists
Skills, Experience, Education, Projects, Achievements, and Socials can all be reordered in
the admin panel — drag a row by its grip handle, or use the up/down arrows (handy on touch
devices, or for keyboard/screen-reader use). The order you leave them in is exactly the
order they render in on the live site.

### Images, logo & resume
Three single-image spots (Hero → nav logo, About → profile picture, each Project → image)
use the same upload widget: PNG/JPEG/WEBP/GIF up to 5MB, saved to `data/uploads/` and
served at `/uploads/<file>` by `app/uploads/[name]/route.ts`. The About tab also takes a resume file (PDF/DOC/DOCX, up to
10MB) — once uploaded, a "Download resume" button appears in the About section.

### Achievements: multiple images + an expanding card
Each achievement can hold **several images**, managed as a small gallery in the admin form
— add as many as you like, drag-order them with the left/right arrows on each thumbnail
(the first one becomes the card's cover image), or remove any of them. On the live site,
clicking an achievement card **smoothly expands it into a full-size view** (a Framer Motion
shared-layout animation — the same card element grows in place rather than a new box
popping in), which shows a **swipeable image carousel** (drag/swipe, arrow buttons, and dot
navigation, with a deliberately slow/eased slide transition) alongside the full title,
year, description, and credential link. Press Escape, click the backdrop, or hit the close
button to collapse it back down.

### REST API reference
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/data` | none | Read current site content |
| PUT | `/api/data` | session + admin host | Overwrite site content |
| POST | `/api/upload` | session + admin host | Upload an image, or a document with `kind=document`; returns `{ url, name }` |
| GET | `/api/auth` | none | Check if the current visitor is logged in |
| POST | `/api/auth` | admin host | Log in with `{ password }` |
| DELETE | `/api/auth` | none | Log out |
| PATCH | `/api/auth/password` | session + admin host | Change the password |

---

## 5. Security

A few things worth knowing about how this is hardened, and where the honest limits are:

- **Brute-force protection:** login, password-change, upload, and data-save endpoints are
  all rate-limited per IP (`lib/rateLimit.ts`). It's in-memory and per-server-instance —
  fine for a single Node server/VPS, but not a shared limit across multiple serverless
  instances. Swap in a shared store (e.g. Redis) if you need that.
- **Strict CSP with per-request nonces:** `middleware.ts` generates a fresh nonce every
  request and sets a `Content-Security-Policy` header restricting scripts to same-origin
  plus that nonce (no `unsafe-inline` for scripts at all, including Next.js's own
  hydration scripts). `style-src` does allow `unsafe-inline`, because Framer Motion and a
  lot of ordinary React code (opacity/width toggles, drag styles, the carousel) rely
  directly on inline `style` attributes — that's a much lower-risk relaxation than
  allowing arbitrary inline scripts.
- **Security headers** (`next.config.js`): `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, a locked-down `Permissions-Policy`, HSTS, and `X-Frame-Options`
  (`DENY` specifically on `/admin`, so the panel can never be framed for clickjacking).
- **Upload validation:** both the declared MIME type *and* the file's actual magic bytes
  are checked before anything is written to disk — a mislabelled file (e.g. something
  claiming to be `image/png` that isn't) is rejected rather than trusted.
- **Uploaded files** are served through a route with a strict filename allowlist (so path
  traversal can't reach anything outside `data/uploads`), `nosniff`, and a `sandbox` CSP.
- **Sanitized links:** every admin-entered URL (hero buttons, socials, project/credential
  links) is passed through an allowlist (`lib/sanitizeUrl.ts`) before being used as an
  `href` — only `http:`, `https:`, `mailto:`, `tel:`, in-page anchors, and relative paths
  are permitted, so a stray `javascript:` URL can't end up clickable.
- **Session cookie:** httpOnly, `SameSite=Strict`, `Secure` in production, signed with
  HMAC-SHA256 and verified with a timing-safe comparison.
- **No framework fingerprint:** `poweredByHeader: false` — Next.js doesn't advertise
  itself in response headers.

**What this isn't:** a substitute for real infrastructure security. There's no 2FA, no
account-recovery flow, and the rate limiter is best-effort, not bulletproof. For a
higher-stakes deployment, add your host's own access control on the `admin.` subdomain as
a second layer (IP allowlisting, or a platform-level password gate), and set a real
`SESSION_SECRET` (see below) before going live.

### Environment variables
Copy `.env.example` to `.env.local` and set:
```
SESSION_SECRET=<a long random string, e.g. output of `openssl rand -hex 32`>
```
Without this, a fixed development secret is used — fine for local testing, **not safe for
a public deployment**, since anyone who read this source could forge a login session.

---

## 6. Deploying

This app needs a **Node.js server with a persistent, writable filesystem** — it can't be
exported as a static site, and it can't run on a purely serverless platform where the
filesystem resets between requests, since both `data/site-data.json` and everything in
`data/uploads/` are written to disk at runtime. Render, Railway, Fly.io, a plain VPS, or
a self-hosted Docker container all work well with `npm run build && npm start`. (Classic
serverless functions — including Vercel's default deployment model — have a read-only or
ephemeral filesystem, so saves and uploads wouldn't persist there without swapping the
storage layer for a database + object storage.)

---

## 7. Adding a new section

Every list-backed section (Skills, Experience, Education, Projects, Achievements, Socials)
is built from one shared engine, so adding something like "Certifications" is a few small
edits, not a rebuild:

1. **`lib/types.ts`** — add an interface and add the array to `SiteData`.
2. **`lib/defaultData.ts`** — add the empty array to `DEFAULT_DATA`.
3. **`lib/dataStore.ts`** — add it to `normalize()`.
4. **`components/admin/schemas.ts`** — add a `SCHEMAS` entry with its fields (this alone
   gives it a full add/edit/delete/reorder admin tab; use `type: "image"` for a single
   image or `type: "images"` for a gallery like Achievements has).
5. **`components/admin/AdminApp.tsx`** — add the tab.
6. **A new component** rendering the array, following `components/Achievements.tsx`.
7. Render it in **`components/SiteContent.tsx`**.

---

## 8. Project structure

```
app/
  layout.tsx              Root layout — fonts, CSP nonce, theme-init script
  globals.css              All styling (design tokens + every component's CSS)
  page.tsx                  Public homepage (server component)
  admin/page.tsx             Admin route (rendered only on the admin subdomain)
  api/
    data/route.ts            GET (public) / PUT (admin-only) site content
    upload/route.ts           POST an image or document, returns its public URL
  uploads/[name]/route.ts    Serves uploaded files (strict filename allowlist, locked-down headers)
    auth/route.ts              POST login, DELETE logout, GET session check
    auth/password/route.ts      PATCH change password
components/
  SiteContent.tsx           Assembles the public page
  Carousel.tsx               Swipeable image carousel (used by the achievement modal)
  Nav.tsx, Hero.tsx, About.tsx, Skills.tsx, Journey.tsx,
  Projects.tsx, Achievements.tsx, Contact.tsx, Footer.tsx, Reveal.tsx, icons.tsx
  admin/
    AdminApp.tsx              Login gate + dashboard shell
    ListEditor.tsx             Generic add/edit/delete/reorder list UI
    ImageUploadField.tsx        Single-image upload widget
    MultiImageUploadField.tsx    Multi-image gallery widget (achievement carousels)
    FileUploadField.tsx          Document upload widget (resume)
    schemas.ts                    Field definitions for every list section
lib/
  types.ts, defaultData.ts, dataStore.ts, auth.ts, hostGate.ts, rateLimit.ts, sanitizeUrl.ts
middleware.ts              Subdomain routing/gating + per-request CSP nonce
data/                      site-data.json (content), admin-auth.json (hashed password), uploads/ (your files)
                           — all live on disk; back this folder up
```
