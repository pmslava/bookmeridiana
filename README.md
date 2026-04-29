# Tenis Kosmos — Booking Site

Static booking site for [Tenis Kosmos](https://teniskosmos.com/), a 5-court tennis academy in Novi Sad. Hosted on GitHub Pages, backed by Google Apps Script + Google Calendar + Google Tasks.

## Live

- Primary: https://teniskosmos.com/
- Misspelling redirect (HTTP only, 301): https://tenniskosmos.com/
- Legacy GitHub Pages URL also redirects: https://pmslava.github.io/bookmeridiana/

## Two booking flows

- **Court booking** — instant confirmation, email-link verified, written to the relevant court calendar.
- **Training request** — callback form. A coach receives a Google Task, phones the client back, and creates the event on the relevant court calendar manually.

## Files

- `index.html`, `app.js`, `style.css` — frontend (vanilla, no build step)
- `config.json` — 4-field bootstrap stub (Apps Script URL, site name, default language, language list). Business rules are NOT here.
- `Code.gs`, `appsscript.json` — Google Apps Script backend (deployed manually to script.google.com)
- `CNAME` — GitHub Pages custom-domain pin (`teniskosmos.com`)
- `court-*.png`, `gen-court-cards.py`, `build_qr_poster.py` — court QR card / poster generators
- `admin.html` — admin settings page (lives in the Apps Script project; gitignored here)

## Configuration

All user-editable settings — prices, working hours, contact info, admin notification list, court calendar IDs, site URL, brand names — live in the Apps Script project's Script Properties as a single `settings_json` blob. Edit them via the **admin page** (a separate Apps Script deployment with `Access: Only myself`), not via this repo.

## Setup (fork)

1. Create an Apps Script project; paste in `Code.gs`, `admin.html`, and `appsscript.json` (which declares the Calendar advanced service and the OAuth scopes for Mail, Calendar, Tasks).
2. Deploy twice: a public Web App (`Access: Anyone`) for the booking API, and an admin Web App (`Access: Only myself`) for the settings page.
3. Paste the public Web App URL into `config.json` → `appsScriptUrl`.
4. Push to GitHub and enable Pages on `main`. Optionally point a custom domain via `CNAME`.
5. Open the admin URL once to seed `settings_json` with prices, working hours, and the 5 court calendar IDs.

## Cost

~€20/year (two Namecheap domains — primary `teniskosmos.com` + misspelling-redirect `tenniskosmos.com`). GitHub Pages, Apps Script, and the Google APIs are all free.
