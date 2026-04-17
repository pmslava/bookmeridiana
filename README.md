# Tennis Kosmos — Booking Site

Static tennis-court booking site for Tennis Kosmos in Novi Sad, hosted on GitHub Pages, backed by Google Calendar and Google Apps Script.

## Setup

1. Deploy `Code.gs` to Google Apps Script as a Web App
2. Paste the Web App URL into `config.json` → `appsScriptUrl`
3. Push to GitHub and enable GitHub Pages on the `main` branch
4. Site goes live at `https://pmslava.github.io/bookmeridiana/`

## Files

- `index.html` — landing page with hero, booking interface, footer
- `app.js` — booking engine (calendar grid, slot list, booking flow, i18n)
- `style.css` — dark theme, Cal.com-style layout, tennis accents
- `config.json` — all business rules (prices, hours, calendar IDs)
- `Code.gs` — Google Apps Script backend (not deployed to Pages)

## Configuration

Edit `config.json` to change:
- Working hours per weekday
- Court and coach prices
- Number of days shown ahead (`daysAhead`)
- Supported languages
- Contact info
