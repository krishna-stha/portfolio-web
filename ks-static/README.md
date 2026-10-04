# Krishna Sharan Shrestha — Portfolio (static version)

A brutalist, AI/ML-themed portfolio as a **plain static site** — just HTML, CSS, and
vanilla JavaScript. No build step, no server, no Node.js required. This is the version to
use on ordinary web hosting (the kind that asks for an `index.html`).

---

## 1. Hosting it

Upload all five files — `index.html`, `admin.html`, `styles.css`, `script.js`, `admin.js`
— to your host's root folder (often called `public_html`, `www`, or similar), exactly as
they are, with nothing renamed. That's it; there's nothing to build or install.

This works on essentially any static host: shared hosting via FTP/cPanel, GitHub Pages,
Netlify, Cloudflare Pages, Firebase Hosting, Surge, etc.

---

## 2. The admin panel

Open `yourdomain.com/admin.html`. Default password: **`krishna123`** — change it
immediately under **Settings & Data → Change admin password**.

**Important differences from a server-backed admin panel**, since there's no server here:

- **Content is saved in your browser's local storage, not on the server.** Edits you make
  only show up for *you*, in *that browser*, until you do something about it — visitors to
  your live site won't see them, because the site's actual files on the server never
  change. To actually publish your edits:
  1. In the admin panel, go to **Settings & Data → Export data.json**.
  2. *(Optional but recommended)* Rename `script.js`'s `DEFAULT_DATA` object to match your
     exported content, so the site shows your content even before localStorage is set —
     see §4 below. Simpler alternative: just re-import the JSON file in the admin panel on
     whichever browser/device you use to view the live site.
  - Export regularly as a backup. Clearing your browser's site data erases everything.
- **The password screen is a deterrent, not real security.** It's a client-side check
  with no server to keep a secret — anyone who opens their browser's dev tools could get
  past it. Don't use this panel to gate anything sensitive, and don't reuse an important
  password here.
- **Images and your resume are embedded directly in your content** (as data), so
  everything still works with zero server. Each image is capped at 1.5MB and your resume
  at 3MB, because all of this has to fit in the browser's local storage, which typically
  holds 5–10MB total. If you hit that ceiling, paste an external image URL instead of
  uploading (there's a text field for this right under every image upload button) —
  e.g. host images on GitHub, Imgur, or your own server if you have one.

---

## 3. What's in each section

- **Hero, About, Skills, Experience, Education, Contact/Socials** — same as before: add,
  edit, delete, and (for Skills/Experience/Education/Socials) drag-reorder entries from
  the admin panel.
- **Projects** — each project can hold several images shown as an **inline carousel
  directly on the card** in the grid — round pill-shaped nav buttons and a thin progress
  rail along the bottom edge. No click needed; it's immediately browsable.
- **Achievements** — each achievement can also hold several images, but shown
  differently: clicking the card **smoothly expands it in place** into a larger centered
  view (a manually-animated "grow from where you clicked" effect, done in plain CSS/JS),
  revealing a **swipeable carousel** — square arrow buttons and dot indicators, a slower
  easing than the Projects carousel — plus the full description and a credential link.
  Escape, the backdrop, or the close button all collapse it back down.

These two carousels were deliberately given different visual languages (pill nav + rail
vs. square arrows + dots, inline vs. click-to-expand) so Projects and Achievements don't
feel identical, while both still clearly belong to the same design system.

---

## 4. Setting your "real" default content

Right now, if someone visits your site in a browser that's never opened the admin panel,
they see the built-in placeholder content (empty Projects/Achievements, a generic bio,
etc.) — because there's no server-saved content to fall back to, only whatever's in that
visitor's own `localStorage` (which is nothing, for a first-time visitor).

To make your actual content the one everyone sees by default:
1. Finish editing everything in the admin panel, then **Export data.json**.
2. Open `script.js` and `admin.js` in a text editor. Near the top of each, find the
   `DEFAULT_DATA` object.
3. Replace the contents of `DEFAULT_DATA` with your exported JSON's contents (keep the
   `const DEFAULT_DATA = { ... };` wrapper — just swap what's inside the braces).
4. Re-upload the two edited files to your host.

Now your real content ships with the site itself, and the admin panel becomes a way to
*preview and tweak* changes locally before you repeat this export-and-paste step — rather
than the single source of truth.

---

## 5. If you get real Node.js hosting later

This static version trades some things away for the "just upload it anywhere" simplicity:
there's no real server-side content storage, no genuinely hidden admin subdomain, and no
server-verified login. If you later get a host that runs Node.js (Render, Railway, a VPS,
etc.), the fuller version of this site — real server-saved content with an admin panel
that updates your live site immediately and no export/import dance, a truly hidden admin
subdomain enforced by server middleware, rate-limited login — is worth switching to
instead. Ask for that version by name if you get there.

---

## 6. File overview

```
index.html    The public site's HTML structure
admin.html    The admin panel's HTML structure
styles.css    All styling (shared by both pages)
script.js     Public site: rendering, theme, scroll, both carousels, the achievement modal
admin.js      Admin panel: auth, the generic add/edit/delete/reorder engine, image uploads
```
