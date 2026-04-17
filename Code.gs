// ============================================================
// TennisKosmos — Google Apps Script Backend
// ============================================================
// This script is intended to be deployed TWICE as a Web App:
//
//   1) PUBLIC deployment  — Execute as: Me, Access: Anyone.
//      Its URL is stored in config.json on GitHub. Handles the
//      booking flow (availability, book, confirm, cancel) and the
//      redacted public settings endpoint (action=settings).
//
//   2) ADMIN deployment   — Execute as: Me, Access: Only myself.
//      Its URL is NEVER committed to git. Serves admin.html and
//      accepts google.script.run calls for reading/saving the full
//      settings blob. Google Login enforces auth at the deployment
//      layer; requireAdmin() is defence-in-depth.
//
// First-time setup (one-off):
//   - Run setupInitialSettings() from the script editor. This seeds
//     Script Properties `settings_json` from the hardcoded seed
//     below. The seed is the only place calendar IDs and admin
//     emails live as source code; after seeding, Script Properties
//     becomes the single source of truth.
//
// Requirements:
//   - Calendar Advanced Service enabled in the script editor.
//   - Script timezone set to Europe/Belgrade in Project Settings.
// ============================================================

// Admin email lives in Script Properties (key: admin_email). This keeps
// it out of the public git repo. Seed it once via setAdminEmail() from
// the script editor before running setupInitialSettings().
function getAdminEmail() {
  const email = PropertiesService.getScriptProperties().getProperty('admin_email');
  if (!email) {
    throw new Error('admin_email not configured. Run setAdminEmail("you@example.com") from the editor.');
  }
  return email;
}

function setAdminEmail(email) {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('setAdminEmail: provide a valid email string.');
  }
  PropertiesService.getScriptProperties().setProperty('admin_email', email);
  Logger.log('admin_email set.');
}

// Cosmetic fallback used ONLY by htmlResponse if Script Properties
// haven't been seeded yet. Never referenced by the booking logic.
const FALLBACK_SITE_NAME = 'Tennis Kosmos';

// ============================================================
// Settings — Script Properties is the single source of truth.
// ============================================================

function getSettings() {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('settings_json');
  if (!raw) {
    throw new Error('Settings not initialized. Run setupInitialSettings() once from the script editor.');
  }
  return JSON.parse(raw);
}

function publicSettings(full) {
  // Return only the fields the public frontend legitimately needs.
  // Strips calendar IDs, admin emails, fromEmail, internal TTLs.
  // Preserves the shape the frontend expects (calendars.courts keys,
  // coaches.*.name) so app.js needs no structural changes.
  const coachesPublic = {};
  for (const key in (full.coaches || {})) {
    coachesPublic[key] = { name: full.coaches[key].name };
  }
  const courtKeys = {};
  for (const key in (full.courts || {})) {
    courtKeys[key] = '';  // key presence matters; value intentionally blank
  }
  return {
    siteName: full.siteName,
    timezone: full.timezone,
    daysAhead: full.daysAhead,
    slotLengthMinutes: full.slotLengthMinutes,
    workingHours: full.workingHours,
    courtPrices: full.courtPrices,
    coachPrices: full.coachPrices,
    reminders: full.reminders,
    contact: full.contact,
    languages: full.languages,
    defaultLanguage: full.defaultLanguage,
    calendars: {
      courts: courtKeys,
      coaches: coachesPublic,
    },
  };
}

// Seeds settings_json with a neutral template. Calendar IDs, admin
// emails, coach emails, and fromEmail are LEFT BLANK on purpose so no
// tenniskosmos-specific data lives in this repo. Fill them from the
// admin page on first boot, or paste them directly into the
// settings_json property via Project Settings -> Script Properties.
function setupInitialSettings() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('settings_json')) {
    Logger.log('Settings already initialized. Delete the settings_json property to re-seed.');
    return;
  }
  const seed = {
    siteName: 'Tennis Kosmos',
    timezone: 'Europe/Belgrade',
    siteUrl: 'https://pmslava.github.io/bookmeridiana/',
    daysAhead: 10,
    slotLengthMinutes: 60,
    pendingTtlMinutes: 30,
    workingHours: {
      monday:    [{ from: '08:00', to: '22:00' }],
      tuesday:   [{ from: '08:00', to: '22:00' }],
      wednesday: [{ from: '08:00', to: '22:00' }],
      thursday:  [{ from: '08:00', to: '22:00' }],
      friday:    [{ from: '08:00', to: '22:00' }],
      saturday:  [{ from: '09:00', to: '20:00' }],
      sunday:    [{ from: '09:00', to: '20:00' }],
    },
    courtPrices: [
      { from: '08:00', to: '17:00', price: 600,  currency: 'RSD', label: 'Day' },
      { from: '17:00', to: '20:00', price: 800,  currency: 'RSD', label: 'Evening' },
      { from: '20:00', to: '22:00', price: 1200, currency: 'RSD', label: 'Lights' },
    ],
    coachPrices: {
      R: 1800,
      I: 2500,
      currency: 'RSD',
      note: 'Coach price is added on top of court price.',
    },
    reminders: { dayBefore: true, twoHoursBefore: true },
    contact: {
      phone: '',
      email: '',
      address: '',
      instagram: '',
    },
    languages: ['en', 'sr', 'ru'],
    defaultLanguage: 'sr',
    courts: {
      '1': '',
      '2': '',
      '3': '',
      '4': '',
    },
    coaches: {
      R: { name: 'Ratko', id: '', email: '' },
      I: { name: 'Ivan',  id: '', email: '' },
    },
    adminNotifications: {
      emails: [],
      coachGetsOwnBookings: false,
    },
    fromEmail: '',
  };
  props.setProperty('settings_json', JSON.stringify(seed));
  Logger.log('Settings initialized (template with blank private fields). Fill calendar IDs, admin emails, and contact info via the admin page.');
}

function validateSettings(s) {
  if (!s || typeof s !== 'object') throw new Error('Settings must be an object.');
  const required = ['siteName','timezone','daysAhead','slotLengthMinutes','workingHours',
    'courtPrices','coachPrices','reminders','contact','languages','defaultLanguage',
    'courts','coaches','adminNotifications','fromEmail'];
  for (const k of required) {
    if (s[k] === undefined) throw new Error('Missing required field: ' + k);
  }
  if (!Array.isArray(s.adminNotifications.emails) || s.adminNotifications.emails.length === 0) {
    throw new Error('At least one admin notification email is required.');
  }
  if (!Array.isArray(s.courtPrices) || s.courtPrices.length === 0) {
    throw new Error('At least one court price tier is required.');
  }
  for (const p of s.courtPrices) {
    if (typeof p.price !== 'number' || p.price < 0) {
      throw new Error('Prices must be non-negative numbers.');
    }
  }
  if (!s.courts['1'] || !s.courts['2'] || !s.courts['3'] || !s.courts['4']) {
    throw new Error('All four court calendar IDs are required.');
  }
  if (!s.coaches.R || !s.coaches.I || !s.coaches.R.id || !s.coaches.I.id) {
    throw new Error('Both coach calendar IDs (R and I) are required.');
  }
}

function saveSettingsToStore(settings) {
  const props = PropertiesService.getScriptProperties();
  const existing = props.getProperty('settings_json');
  if (existing) {
    // Last-known-good backup for restoreSettings().
    props.setProperty('settings_json_backup', existing);
  }
  props.setProperty('settings_json', JSON.stringify(settings));
}

function restoreSettings() {
  const props = PropertiesService.getScriptProperties();
  const backup = props.getProperty('settings_json_backup');
  if (!backup) {
    Logger.log('No backup found.');
    return;
  }
  props.setProperty('settings_json', backup);
  Logger.log('Settings restored from last backup.');
}

// ============================================================
// Admin auth guard + google.script.run endpoints
// ============================================================

function requireAdmin() {
  const email = Session.getActiveUser().getEmail();
  if (email !== getAdminEmail()) {
    throw new Error('Unauthorized');
  }
}

// Called from admin.html via google.script.run. google.script.run
// preserves the user session across the sandboxed iframe; a plain
// fetch from the iframe would lose credentials.
function adminGetSettings() {
  requireAdmin();
  return getSettings();
}

function adminSaveSettings(incoming) {
  requireAdmin();
  validateSettings(incoming);
  saveSettingsToStore(incoming);
  return { status: 'ok', savedAt: new Date().toISOString() };
}

// ============================================================
// i18n — email copy in EN / SR / RU
// ============================================================
// Use tr(lang, key, vars) to look up a string. Unknown lang falls back to EN.
// {placeholders} are replaced from the vars object.

const I18N = {
  en: {
    dayNames: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    monthNames: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    hi: 'Hi', date: 'Date', time: 'Time', court: 'Court', coach: 'Coach',
    confirmSubject: 'Confirm your booking — {date} at {time}',
    confirmIntro: 'Please confirm your tennis court booking:',
    clickToConfirm: 'Click here to confirm:',
    expiresIn: 'This link expires in {n} minutes.',
    confirmedSubject: 'Booking confirmed — {date} at {time}',
    confirmedIntro: 'Your booking is confirmed!',
    inviteNote: 'You will also receive a calendar invitation separately.',
    needCancel: 'Need to cancel? Click here:',
    cancelledSubject: 'Booking cancelled — {date} at {time}',
    cancelledIntro: 'Your booking has been cancelled:',
    bookAgain: 'You can book a new time at:',
    reminderSubjectDay: 'Reminder — your tennis booking is tomorrow',
    reminderSubjectHours: 'Reminder — your tennis booking is in 2 hours',
    reminderBodyDay: 'This is a reminder that your tennis booking is tomorrow:',
    reminderBodyHours: 'This is a reminder that your tennis booking is in 2 hours:',
    seeYou: 'See you on the court!',
    htmlConfirmedTitle: 'Booking confirmed!',
    htmlConfirmedBody: 'Your court is booked for {date} at {time}.<br><br>A confirmation email with a calendar invite has been sent to {email}.<br><br><a href="{url}">Back to {site}</a>',
    htmlCancelledTitle: 'Booking cancelled',
    htmlCancelledBody: 'Your booking for {date} at {time} has been cancelled.<br><br>A cancellation email has been sent to {email}.<br><br><a href="{url}">Book another time</a>',
  },
  sr: {
    dayNames: ['Ned','Pon','Uto','Sre','Čet','Pet','Sub'],
    monthNames: ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'],
    hi: 'Zdravo', date: 'Datum', time: 'Vreme', court: 'Teren', coach: 'Trener',
    confirmSubject: 'Potvrdite rezervaciju — {date} u {time}',
    confirmIntro: 'Molimo potvrdite vašu rezervaciju terena:',
    clickToConfirm: 'Kliknite ovde za potvrdu:',
    expiresIn: 'Link ističe za {n} minuta.',
    confirmedSubject: 'Rezervacija potvrđena — {date} u {time}',
    confirmedIntro: 'Vaša rezervacija je potvrđena!',
    inviteNote: 'Pozivnicu za kalendar ćete dobiti zasebno.',
    needCancel: 'Želite da otkažete? Kliknite ovde:',
    cancelledSubject: 'Rezervacija otkazana — {date} u {time}',
    cancelledIntro: 'Vaša rezervacija je otkazana:',
    bookAgain: 'Novu rezervaciju možete napraviti na:',
    reminderSubjectDay: 'Podsetnik — vaša rezervacija je sutra',
    reminderSubjectHours: 'Podsetnik — vaša rezervacija je za 2 sata',
    reminderBodyDay: 'Ovo je podsetnik da je vaša rezervacija sutra:',
    reminderBodyHours: 'Ovo je podsetnik da je vaša rezervacija za 2 sata:',
    seeYou: 'Vidimo se na terenu!',
    htmlConfirmedTitle: 'Rezervacija potvrđena!',
    htmlConfirmedBody: 'Vaš teren je rezervisan za {date} u {time}.<br><br>Email sa potvrdom i pozivnicom za kalendar je poslat na {email}.<br><br><a href="{url}">Nazad na {site}</a>',
    htmlCancelledTitle: 'Rezervacija otkazana',
    htmlCancelledBody: 'Vaša rezervacija za {date} u {time} je otkazana.<br><br>Email o otkazivanju je poslat na {email}.<br><br><a href="{url}">Rezervišite drugi termin</a>',
  },
  ru: {
    dayNames: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
    monthNames: ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'],
    hi: 'Здравствуйте', date: 'Дата', time: 'Время', court: 'Корт', coach: 'Тренер',
    confirmSubject: 'Подтвердите бронирование — {date} в {time}',
    confirmIntro: 'Пожалуйста, подтвердите бронирование корта:',
    clickToConfirm: 'Нажмите, чтобы подтвердить:',
    expiresIn: 'Ссылка действительна {n} минут.',
    confirmedSubject: 'Бронирование подтверждено — {date} в {time}',
    confirmedIntro: 'Ваше бронирование подтверждено!',
    inviteNote: 'Отдельно вы получите приглашение в календарь.',
    needCancel: 'Нужно отменить? Нажмите сюда:',
    cancelledSubject: 'Бронирование отменено — {date} в {time}',
    cancelledIntro: 'Ваше бронирование отменено:',
    bookAgain: 'Забронировать другое время можно на:',
    reminderSubjectDay: 'Напоминание — ваша тренировка завтра',
    reminderSubjectHours: 'Напоминание — ваша тренировка через 2 часа',
    reminderBodyDay: 'Напоминаем, что ваша тренировка завтра:',
    reminderBodyHours: 'Напоминаем, что ваша тренировка через 2 часа:',
    seeYou: 'До встречи на корте!',
    htmlConfirmedTitle: 'Бронирование подтверждено!',
    htmlConfirmedBody: 'Ваш корт забронирован на {date} в {time}.<br><br>На {email} отправлено письмо с подтверждением и приглашением в календарь.<br><br><a href="{url}">Вернуться на {site}</a>',
    htmlCancelledTitle: 'Бронирование отменено',
    htmlCancelledBody: 'Ваше бронирование на {date} в {time} отменено.<br><br>Письмо об отмене отправлено на {email}.<br><br><a href="{url}">Забронировать другое время</a>',
  },
};

function tr(lang, key, vars) {
  const pack = I18N[lang] || I18N.en;
  let s = pack[key];
  if (s === undefined) s = I18N.en[key];
  if (s === undefined) return key;
  if (vars) {
    for (const k in vars) {
      s = s.split('{' + k + '}').join(String(vars[k]));
    }
  }
  return s;
}

function formatFriendlyDateLang(date, lang) {
  const pack = I18N[lang] || I18N.en;
  return pack.dayNames[date.getDay()] + ' ' + date.getDate() + ' ' + pack.monthNames[date.getMonth()];
}

// ============================================================
// doGet — admin page, settings, availability, confirm, cancel
// ============================================================

function doGet(e) {
  try {
    const params = e ? e.parameter : {};

    // --- Admin page (served only from the Admin deployment) ---
    // The deployment-level "Only myself" setting is the primary gate.
    // requireAdmin() is defence-in-depth in case someone mis-deploys.
    if (params.admin === '1') {
      requireAdmin();
      return HtmlService.createHtmlOutputFromFile('admin')
        .setTitle('Admin — Tennis Kosmos')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    }

    // --- Admin: read full settings via URL (fallback for curl) ---
    // Preferred path from admin.html is google.script.run.adminGetSettings.
    if (params.action === 'getAdminSettings') {
      requireAdmin();
      return jsonResponse(getSettings());
    }

    // --- Public: read redacted settings ---
    if (params.action === 'settings') {
      return jsonResponse(publicSettings(getSettings()));
    }

    // --- Confirm a pending booking ---
    if (params.confirm) {
      if (!/^[0-9a-fA-F-]{8,64}$/.test(params.confirm)) {
        return htmlResponse('Invalid link', 'This link is not valid.');
      }
      return handleConfirm(params.confirm);
    }

    // --- Cancel a confirmed booking ---
    if (params.cancel) {
      if (!/^[0-9a-fA-F-]{8,64}$/.test(params.cancel)) {
        return htmlResponse('Invalid link', 'This link is not valid.');
      }
      return handleCancel(params.cancel);
    }

    // --- Default: return availability ---
    return handleAvailability(params);
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return htmlResponse('Forbidden', 'You do not have permission to access this page.');
    }
    Logger.log('doGet error: ' + err.message + '\n' + (err.stack || ''));
    return jsonResponse({ error: 'Server error. Please try again.' }, 500);
  }
}

// ============================================================
// doPost — save admin settings or create a pending booking
// ============================================================

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.action === 'saveSettings') {
      requireAdmin();
      validateSettings(body.settings);
      saveSettingsToStore(body.settings);
      return jsonResponse({ status: 'ok' });
    }

    return handleBookingRequest(body);
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return jsonResponse({ error: 'Unauthorized.' }, 403);
    }
    Logger.log('doPost error: ' + err.message + '\n' + (err.stack || ''));
    return jsonResponse({ error: 'Invalid request.' }, 400);
  }
}

// ============================================================
// Rate limiting
// ============================================================
// Limits:
//   - max 5 booking attempts per email per hour
//   - min 10 seconds between any two requests from the same email
// Stored in Script Properties as JSON: { ts: [unix_ms, ...] }
// Rejects WITHOUT sending any email.
const RATE_LIMIT_PER_HOUR = 5;
const RATE_LIMIT_MIN_GAP_MS = 10 * 1000;

function checkRateLimit(email) {
  const props = PropertiesService.getScriptProperties();
  const key = 'rl_' + email.toLowerCase();
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;

  let record = { ts: [] };
  const raw = props.getProperty(key);
  if (raw) {
    try { record = JSON.parse(raw); } catch (e) { record = { ts: [] }; }
  }
  // Keep only timestamps from the last hour
  record.ts = (record.ts || []).filter(function (t) { return t > hourAgo; });

  if (record.ts.length > 0) {
    const last = record.ts[record.ts.length - 1];
    if (now - last < RATE_LIMIT_MIN_GAP_MS) {
      return { ok: false, reason: 'Too many requests — please wait a few seconds and try again.' };
    }
  }
  if (record.ts.length >= RATE_LIMIT_PER_HOUR) {
    return { ok: false, reason: 'Too many booking attempts this hour. Please try again later.' };
  }

  record.ts.push(now);
  props.setProperty(key, JSON.stringify(record));
  return { ok: true };
}

function isValidEmail(s) {
  if (typeof s !== 'string' || s.length > 254) return false;
  // Simple, practical email regex — not RFC-complete, but catches malformed input.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function htmlEscape(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================
// Availability — FreeBusy for all 6 calendars
// ============================================================

function handleAvailability(params) {
  const cfg = getSettings();
  const days = Math.min(Math.max(parseInt(params.days) || 10, 1), 60);

  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const timeMax = new Date(timeMin);
  timeMax.setDate(timeMax.getDate() + days);

  // Build list of all calendar IDs
  const calendarIds = [];
  for (const key in cfg.courts) {
    calendarIds.push({ id: cfg.courts[key] });
  }
  for (const key in cfg.coaches) {
    calendarIds.push({ id: cfg.coaches[key].id });
  }

  const request = {
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    timeZone: cfg.timezone,
    items: calendarIds,
  };

  const response = Calendar.Freebusy.query(request);

  // Build a clean result keyed by our short names
  const result = {
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    timezone: cfg.timezone,
    courts: {},
    coaches: {},
  };

  for (const key in cfg.courts) {
    const calId = cfg.courts[key];
    const cal = response.calendars[calId];
    result.courts[key] = {
      busy: (cal && cal.busy) ? cal.busy : [],
      errors: (cal && cal.errors) ? cal.errors : undefined,
    };
  }

  for (const key in cfg.coaches) {
    const calId = cfg.coaches[key].id;
    const cal = response.calendars[calId];
    result.coaches[key] = {
      name: cfg.coaches[key].name,
      busy: (cal && cal.busy) ? cal.busy : [],
      errors: (cal && cal.errors) ? cal.errors : undefined,
    };
  }

  return jsonResponse(result);
}

// ============================================================
// Booking request — create pending hold + send confirm email
// ============================================================

function handleBookingRequest(body) {
  const cfg = getSettings();
  const GENERIC = 'Invalid booking request.';

  // Validate required fields (without echoing field names back to the client)
  const required = ['date', 'startHour', 'durationHours', 'courtId', 'name', 'email'];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      Logger.log('Missing field: ' + field);
      return jsonResponse({ error: GENERIC }, 400);
    }
  }

  // Email format
  if (!isValidEmail(String(body.email).trim())) {
    return jsonResponse({ error: GENERIC }, 400);
  }

  // Name length sanity
  const name = String(body.name).trim();
  if (name.length === 0 || name.length > 120) {
    return jsonResponse({ error: GENERIC }, 400);
  }

  // Date must be YYYY-MM-DD and within [today, today + 60d]
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.date))) {
    return jsonResponse({ error: GENERIC }, 400);
  }
  const reqDate = new Date(body.date + 'T00:00:00');
  if (isNaN(reqDate.getTime())) {
    return jsonResponse({ error: GENERIC }, 400);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxAhead = new Date(today);
  maxAhead.setDate(maxAhead.getDate() + 60);
  if (reqDate < today || reqDate > maxAhead) {
    return jsonResponse({ error: GENERIC }, 400);
  }

  // Validate whole-hour constraint (reject any non-integer, non-0-23)
  const startHour = parseInt(body.startHour, 10);
  if (!Number.isInteger(startHour) || startHour !== Number(body.startHour) || startHour < 0 || startHour > 23) {
    return jsonResponse({ error: GENERIC }, 400);
  }
  const durationHours = parseInt(body.durationHours, 10);
  if (![1, 2, 3].includes(durationHours)) {
    return jsonResponse({ error: GENERIC }, 400);
  }

  // Validate court allow-list
  if (!cfg.courts[body.courtId]) {
    return jsonResponse({ error: GENERIC }, 400);
  }

  // Validate coach allow-list if provided
  if (body.coachId && !cfg.coaches[body.coachId]) {
    return jsonResponse({ error: GENERIC }, 400);
  }

  // Rate limit BEFORE any side effect (no email sent on reject)
  const rl = checkRateLimit(String(body.email).trim());
  if (!rl.ok) {
    return jsonResponse({ error: rl.reason }, 429);
  }

  // Normalize name/email for downstream use
  body.name = name;
  body.email = String(body.email).trim();

  // Normalize language to the allow-list (EN / SR / RU), fallback to EN.
  const requestedLang = String(body.language || '').toLowerCase();
  body.language = I18N[requestedLang] ? requestedLang : 'en';

  // Build start/end timestamps
  const startDate = new Date(body.date + 'T' + padHour(startHour) + ':00:00');
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + durationHours);

  // Quick conflict check before creating pending hold
  const calendarsToCheck = [cfg.courts[body.courtId]];
  if (body.coachId) {
    calendarsToCheck.push(cfg.coaches[body.coachId].id);
  }

  const conflict = checkConflict(calendarsToCheck, startDate, endDate);
  if (conflict) {
    return jsonResponse({ error: 'This slot was just booked by someone else. Please pick another.' }, 409);
  }

  // Generate token and store pending booking
  const token = Utilities.getUuid();
  const pending = {
    token: token,
    date: body.date,
    startHour: startHour,
    durationHours: durationHours,
    courtId: body.courtId,
    coachId: body.coachId || null,
    name: body.name,
    email: body.email,
    phone: body.phone || '',
    language: body.language || 'en',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + cfg.pendingTtlMinutes * 60 * 1000).toISOString(),
  };

  const props = PropertiesService.getScriptProperties();
  props.setProperty('pending_' + token, JSON.stringify(pending));

  // Send confirmation email (in the client's chosen language)
  const lang = pending.language;
  const scriptUrl = ScriptApp.getService().getUrl();
  const confirmUrl = scriptUrl + '?confirm=' + token;
  const friendlyDate = formatFriendlyDateLang(startDate, lang);
  const timeStr = padHour(startHour) + ':00';
  const endTimeStr = padHour(startHour + durationHours) + ':00';

  const subject = tr(lang, 'confirmSubject', { date: friendlyDate, time: timeStr });
  const courtLabel = tr(lang, 'court') + ' ' + body.courtId;
  const coachLabel = body.coachId ? cfg.coaches[body.coachId].name : '';

  let emailBody = tr(lang, 'hi') + ' ' + body.name + ',\n\n';
  emailBody += tr(lang, 'confirmIntro') + '\n\n';
  emailBody += tr(lang, 'date') + ': ' + friendlyDate + '\n';
  emailBody += tr(lang, 'time') + ': ' + timeStr + ' – ' + endTimeStr + '\n';
  emailBody += courtLabel + '\n';
  if (coachLabel) {
    emailBody += tr(lang, 'coach') + ': ' + coachLabel + '\n';
  }
  emailBody += '\n' + tr(lang, 'clickToConfirm') + '\n' + confirmUrl + '\n\n';
  emailBody += tr(lang, 'expiresIn', { n: cfg.pendingTtlMinutes }) + '\n\n';
  emailBody += '— ' + cfg.siteName;

  GmailApp.sendEmail(body.email, subject, emailBody);

  return jsonResponse({ status: 'pending', message: 'Check your email to confirm the booking.' });
}

// ============================================================
// Confirm — finalize the booking
// ============================================================

function handleConfirm(token) {
  const cfg = getSettings();
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('pending_' + token);

  if (!raw) {
    return htmlResponse('Booking not found', 'This confirmation link is invalid or has expired.');
  }

  const pending = JSON.parse(raw);

  // Check expiry
  if (new Date() > new Date(pending.expiresAt)) {
    props.deleteProperty('pending_' + token);
    return htmlResponse('Link expired', 'This confirmation link has expired. Please book again.');
  }

  // Build start/end
  const startDate = new Date(pending.date + 'T' + padHour(pending.startHour) + ':00:00');
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + pending.durationHours);

  // Final conflict check
  const calendarsToCheck = [cfg.courts[pending.courtId]];
  if (pending.coachId) {
    calendarsToCheck.push(cfg.coaches[pending.coachId].id);
  }

  const conflict = checkConflict(calendarsToCheck, startDate, endDate);
  if (conflict) {
    props.deleteProperty('pending_' + token);
    return htmlResponse('Slot no longer available',
      'Sorry, this slot was just booked by someone else. Please go back and pick another time.');
  }

  // Create calendar event(s)
  const timeStr = padHour(pending.startHour) + ':00';
  const endTimeStr = padHour(pending.startHour + pending.durationHours) + ':00';
  const courtLabel = 'Court ' + pending.courtId;
  const coachLabel = pending.coachId ? cfg.coaches[pending.coachId].name : null;

  let eventTitle = coachLabel
    ? coachLabel + ', ' + courtLabel + ' — ' + pending.name
    : courtLabel + ' — ' + pending.name;

  const eventDescription = [
    'Booked by: ' + pending.name,
    'Email: ' + pending.email,
    pending.phone ? 'Phone: ' + pending.phone : '',
    courtLabel,
    coachLabel ? 'Coach: ' + coachLabel : '',
    'Time: ' + timeStr + ' – ' + endTimeStr,
  ].filter(Boolean).join('\n');

  // Create event on the court calendar with guest, using the Advanced Calendar API
  // so we can suppress Google Meet from the start (conferenceData: null +
  // conferenceDataVersion: 1). This avoids the problem where CalendarApp
  // auto-adds a Meet link and mails the guest BEFORE we can strip it.
  const courtCalId = cfg.courts[pending.courtId];
  const eventResource = {
    summary: eventTitle,
    description: eventDescription,
    start: { dateTime: startDate.toISOString(), timeZone: cfg.timezone },
    end: { dateTime: endDate.toISOString(), timeZone: cfg.timezone },
    attendees: [{ email: pending.email, displayName: pending.name }],
    conferenceData: null,
    reminders: { useDefault: true },
  };
  const createdCourtEvent = Calendar.Events.insert(
    eventResource, courtCalId,
    { sendUpdates: 'all', conferenceDataVersion: 1 }
  );
  // CalendarApp uses "<id>@google.com" form for getEventById, so store that form.
  const courtEventId = createdCourtEvent.id + '@google.com';

  // If coach booking, also create event on coach calendar (no guest / no invite).
  let coachEventId = null;
  if (pending.coachId) {
    const coachCalId = cfg.coaches[pending.coachId].id;
    const coachResource = {
      summary: eventTitle,
      description: eventDescription,
      start: { dateTime: startDate.toISOString(), timeZone: cfg.timezone },
      end: { dateTime: endDate.toISOString(), timeZone: cfg.timezone },
      conferenceData: null,
      reminders: { useDefault: true },
    };
    const createdCoachEvent = Calendar.Events.insert(
      coachResource, coachCalId,
      { sendUpdates: 'none', conferenceDataVersion: 1 }
    );
    coachEventId = createdCoachEvent.id + '@google.com';
  }

  // Store confirmed booking info (for cancellation and reminders)
  const cancelToken = Utilities.getUuid();
  const confirmed = {
    cancelToken: cancelToken,
    confirmToken: token,
    courtEventId: courtEventId,
    coachEventId: coachEventId,
    courtId: pending.courtId,
    coachId: pending.coachId,
    name: pending.name,
    email: pending.email,
    phone: pending.phone,
    language: pending.language,
    date: pending.date,
    startHour: pending.startHour,
    durationHours: pending.durationHours,
    confirmedAt: new Date().toISOString(),
  };

  props.setProperty('confirmed_' + cancelToken, JSON.stringify(confirmed));
  // Also index by confirm token for lookup
  props.setProperty('cancel_lookup_' + token, cancelToken);

  // Remove pending hold
  props.deleteProperty('pending_' + token);

  // Schedule reminder triggers
  scheduleReminders(cancelToken, startDate);

  // Generate .ics content
  const icsContent = generateIcs(pending, startDate, endDate, cancelToken);

  // Send confirmation email with .ics (in the client's chosen language)
  const lang = pending.language;
  const scriptUrl = ScriptApp.getService().getUrl();
  const cancelUrl = scriptUrl + '?cancel=' + cancelToken;
  const friendlyDate = formatFriendlyDateLang(startDate, lang);
  const localCourtLabel = tr(lang, 'court') + ' ' + pending.courtId;

  const subject = tr(lang, 'confirmedSubject', { date: friendlyDate, time: timeStr });
  let emailBody = tr(lang, 'hi') + ' ' + pending.name + ',\n\n';
  emailBody += tr(lang, 'confirmedIntro') + '\n\n';
  emailBody += tr(lang, 'date') + ': ' + friendlyDate + '\n';
  emailBody += tr(lang, 'time') + ': ' + timeStr + ' – ' + endTimeStr + '\n';
  emailBody += localCourtLabel + '\n';
  if (coachLabel) {
    emailBody += tr(lang, 'coach') + ': ' + coachLabel + '\n';
  }
  emailBody += '\n' + tr(lang, 'inviteNote') + '\n\n';
  emailBody += tr(lang, 'needCancel') + '\n' + cancelUrl + '\n\n';
  emailBody += '— ' + cfg.siteName;

  GmailApp.sendEmail(pending.email, subject, emailBody);

  // Notify admin(s) — and optionally the specific coach.
  notifyAdmins(cfg, pending, 'created');

  return htmlResponse(
    tr(lang, 'htmlConfirmedTitle'),
    tr(lang, 'htmlConfirmedBody', {
      date: htmlEscape(friendlyDate),
      time: htmlEscape(timeStr),
      email: htmlEscape(pending.email),
      url: htmlEscape(cfg.siteUrl),
      site: htmlEscape(cfg.siteName),
    })
  );
}

// ============================================================
// Cancel — delete events and triggers
// ============================================================

function handleCancel(cancelToken) {
  const cfg = getSettings();
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('confirmed_' + cancelToken);

  if (!raw) {
    return htmlResponse('Booking not found', 'This cancellation link is invalid or the booking was already cancelled.');
  }

  const booking = JSON.parse(raw);

  // Delete court event
  try {
    const courtCal = CalendarApp.getCalendarById(cfg.courts[booking.courtId]);
    const courtEvent = courtCal.getEventById(booking.courtEventId);
    if (courtEvent) courtEvent.deleteEvent();
  } catch (err) {
    Logger.log('Error deleting court event: ' + err.message);
  }

  // Delete coach event if applicable
  if (booking.coachEventId) {
    try {
      const coachCal = CalendarApp.getCalendarById(cfg.coaches[booking.coachId].id);
      const coachEvent = coachCal.getEventById(booking.coachEventId);
      if (coachEvent) coachEvent.deleteEvent();
    } catch (err) {
      Logger.log('Error deleting coach event: ' + err.message);
    }
  }

  // Delete scheduled reminder triggers
  deleteReminders(cancelToken);

  // Send cancellation email (in the client's chosen language)
  const lang = booking.language || 'en';
  const startDate = new Date(booking.date + 'T' + padHour(booking.startHour) + ':00:00');
  const friendlyDate = formatFriendlyDateLang(startDate, lang);
  const timeStr = padHour(booking.startHour) + ':00';
  const endTimeStr = padHour(booking.startHour + booking.durationHours) + ':00';
  const courtLabel = tr(lang, 'court') + ' ' + booking.courtId;
  const coachLabel = booking.coachId ? cfg.coaches[booking.coachId].name : null;

  const subject = tr(lang, 'cancelledSubject', { date: friendlyDate, time: timeStr });
  let emailBody = tr(lang, 'hi') + ' ' + booking.name + ',\n\n';
  emailBody += tr(lang, 'cancelledIntro') + '\n\n';
  emailBody += tr(lang, 'date') + ': ' + friendlyDate + '\n';
  emailBody += tr(lang, 'time') + ': ' + timeStr + ' – ' + endTimeStr + '\n';
  emailBody += courtLabel + '\n';
  if (coachLabel) {
    emailBody += tr(lang, 'coach') + ': ' + coachLabel + '\n';
  }
  emailBody += '\n' + tr(lang, 'bookAgain') + '\n' + cfg.siteUrl + '\n\n';
  emailBody += '— ' + cfg.siteName;

  GmailApp.sendEmail(booking.email, subject, emailBody);

  // Notify admin(s) — and optionally the specific coach.
  notifyAdmins(cfg, booking, 'cancelled');

  // Clean up properties
  props.deleteProperty('confirmed_' + cancelToken);
  if (booking.confirmToken) {
    props.deleteProperty('cancel_lookup_' + booking.confirmToken);
  }

  return htmlResponse(
    tr(lang, 'htmlCancelledTitle'),
    tr(lang, 'htmlCancelledBody', {
      date: htmlEscape(friendlyDate),
      time: htmlEscape(timeStr),
      email: htmlEscape(booking.email),
      url: htmlEscape(cfg.siteUrl),
    })
  );
}

// ============================================================
// Reminders — schedule and fire
// ============================================================

function scheduleReminders(cancelToken, startDate) {
  const props = PropertiesService.getScriptProperties();
  const triggerIds = [];

  // 1-day-before reminder
  const dayBefore = new Date(startDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  if (dayBefore > new Date()) {
    const t1 = ScriptApp.newTrigger('fireReminder')
      .timeBased()
      .at(dayBefore)
      .create();
    triggerIds.push(t1.getUniqueId());
    // Store which cancelToken this trigger belongs to
    props.setProperty('trigger_' + t1.getUniqueId(), JSON.stringify({
      cancelToken: cancelToken,
      type: 'dayBefore',
    }));
  }

  // 2-hours-before reminder
  const twoHoursBefore = new Date(startDate);
  twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
  if (twoHoursBefore > new Date()) {
    const t2 = ScriptApp.newTrigger('fireReminder')
      .timeBased()
      .at(twoHoursBefore)
      .create();
    triggerIds.push(t2.getUniqueId());
    props.setProperty('trigger_' + t2.getUniqueId(), JSON.stringify({
      cancelToken: cancelToken,
      type: 'twoHoursBefore',
    }));
  }

  // Store trigger IDs on the booking record for cleanup
  props.setProperty('triggers_' + cancelToken, JSON.stringify(triggerIds));
}

function fireReminder(e) {
  const cfg = getSettings();
  const props = PropertiesService.getScriptProperties();
  const triggerId = e.triggerUid;
  const triggerRaw = props.getProperty('trigger_' + triggerId);

  if (!triggerRaw) {
    Logger.log('Reminder trigger ' + triggerId + ' has no associated booking — skipping.');
    cleanupTrigger(triggerId);
    return;
  }

  const triggerInfo = JSON.parse(triggerRaw);
  const bookingRaw = props.getProperty('confirmed_' + triggerInfo.cancelToken);

  if (!bookingRaw) {
    Logger.log('Booking for trigger ' + triggerId + ' was cancelled — skipping.');
    cleanupTrigger(triggerId);
    props.deleteProperty('trigger_' + triggerId);
    return;
  }

  const booking = JSON.parse(bookingRaw);
  const lang = booking.language || 'en';
  const startDate = new Date(booking.date + 'T' + padHour(booking.startHour) + ':00:00');
  const friendlyDate = formatFriendlyDateLang(startDate, lang);
  const timeStr = padHour(booking.startHour) + ':00';
  const endTimeStr = padHour(booking.startHour + booking.durationHours) + ':00';
  const courtLabel = tr(lang, 'court') + ' ' + booking.courtId;
  const coachLabel = booking.coachId ? cfg.coaches[booking.coachId].name : null;

  const scriptUrl = ScriptApp.getService().getUrl();
  const cancelUrl = scriptUrl + '?cancel=' + triggerInfo.cancelToken;

  const isDayBefore = triggerInfo.type === 'dayBefore';
  const subject = tr(lang, isDayBefore ? 'reminderSubjectDay' : 'reminderSubjectHours');
  const bodyIntro = tr(lang, isDayBefore ? 'reminderBodyDay' : 'reminderBodyHours');

  let emailBody = tr(lang, 'hi') + ' ' + booking.name + ',\n\n';
  emailBody += bodyIntro + '\n\n';
  emailBody += tr(lang, 'date') + ': ' + friendlyDate + '\n';
  emailBody += tr(lang, 'time') + ': ' + timeStr + ' – ' + endTimeStr + '\n';
  emailBody += courtLabel + '\n';
  if (coachLabel) {
    emailBody += tr(lang, 'coach') + ': ' + coachLabel + '\n';
  }
  emailBody += '\n' + tr(lang, 'needCancel') + '\n' + cancelUrl + '\n\n';
  emailBody += tr(lang, 'seeYou') + '\n\n';
  emailBody += '— ' + cfg.siteName;

  GmailApp.sendEmail(booking.email, subject, emailBody);

  // Clean up this trigger
  cleanupTrigger(triggerId);
  props.deleteProperty('trigger_' + triggerId);
}

function deleteReminders(cancelToken) {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('triggers_' + cancelToken);
  if (!raw) return;

  const triggerIds = JSON.parse(raw);
  for (const tid of triggerIds) {
    cleanupTrigger(tid);
    props.deleteProperty('trigger_' + tid);
  }
  props.deleteProperty('triggers_' + cancelToken);
}

function cleanupTrigger(triggerId) {
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getUniqueId() === triggerId) {
      ScriptApp.deleteTrigger(trigger);
      return;
    }
  }
}

// ============================================================
// Conflict check — uses FreeBusy
// ============================================================

function checkConflict(calendarIds, startDate, endDate) {
  const cfg = getSettings();
  const items = calendarIds.map(function(id) { return { id: id }; });

  const response = Calendar.Freebusy.query({
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    timeZone: cfg.timezone,
    items: items,
  });

  for (const calId of calendarIds) {
    const cal = response.calendars[calId];
    if (cal && cal.busy && cal.busy.length > 0) {
      return true;
    }
  }
  return false;
}

// ============================================================
// .ics generation
// ============================================================

function generateIcs(booking, startDate, endDate, cancelToken) {
  const cfg = getSettings();
  const scriptUrl = ScriptApp.getService().getUrl();
  const cancelUrl = scriptUrl + '?cancel=' + cancelToken;
  const courtLabel = 'Court ' + booking.courtId;
  const coachLabel = booking.coachId ? cfg.coaches[booking.coachId].name : null;

  const uid = Utilities.getUuid() + '@tenniskosmos';
  const now = formatIcsDate(new Date());
  const dtStart = formatIcsDate(startDate);
  const dtEnd = formatIcsDate(endDate);

  let description = courtLabel;
  if (coachLabel) {
    description += '\\nCoach: ' + coachLabel;
  }
  description += '\\nCancel: ' + cancelUrl;

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TennisKosmos//Tennis//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + uid,
    'DTSTAMP:' + now,
    'DTSTART;TZID=Europe/Belgrade:' + dtStart,
    'DTEND;TZID=Europe/Belgrade:' + dtEnd,
    'SUMMARY:' + icsEscape((coachLabel ? coachLabel + ', ' : '') + courtLabel + ' — ' + booking.name),
    'DESCRIPTION:' + description,
    'LOCATION:' + cfg.siteName,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return ics;
}

// ============================================================
// Helpers
// ============================================================

function padHour(h) {
  return String(h).padStart(2, '0');
}

function icsEscape(s) {
  // RFC 5545 TEXT escaping: backslash, semicolon, comma, newline.
  return String(s == null ? '' : s)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function formatFriendlyDate(date) {
  // Returns e.g. "Sun 12 Apr"
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return days[date.getDay()] + ' ' + date.getDate() + ' ' + months[date.getMonth()];
}

function formatIcsDate(date) {
  // Returns e.g. "20260412T140000"
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return y + m + d + 'T' + hh + mm + ss;
}

// Send booking notification to admin(s). kind is 'created' or 'cancelled'.
// Recipients come from settings.adminNotifications.emails, plus — when
// coachGetsOwnBookings is true and the booking is a coach booking — the
// specific coach's email. Errors are swallowed so a notify failure never
// breaks the client-facing booking/cancel flow.
function notifyAdmins(cfg, booking, kind) {
  try {
    const notif = (cfg && cfg.adminNotifications) || {};
    const recipients = [];
    if (Array.isArray(notif.emails)) {
      for (const e of notif.emails) {
        if (e && typeof e === 'string') recipients.push(e);
      }
    }
    if (notif.coachGetsOwnBookings && booking.coachId
        && cfg.coaches && cfg.coaches[booking.coachId]
        && cfg.coaches[booking.coachId].email) {
      recipients.push(cfg.coaches[booking.coachId].email);
    }

    // Dedupe (case-insensitive).
    const seen = {};
    const unique = [];
    for (const e of recipients) {
      const key = e.toLowerCase();
      if (!seen[key]) { seen[key] = true; unique.push(e); }
    }
    if (unique.length === 0) return;

    const timeStr = padHour(booking.startHour) + ':00';
    const endTimeStr = padHour(booking.startHour + booking.durationHours) + ':00';
    const coachLabel = booking.coachId && cfg.coaches && cfg.coaches[booking.coachId]
      ? cfg.coaches[booking.coachId].name
      : null;
    const courtLabel = 'Court ' + booking.courtId;
    const verb = kind === 'cancelled' ? 'CANCELLED' : 'NEW BOOKING';

    const subject = '[' + cfg.siteName + '] ' + verb + ': '
      + booking.date + ' ' + timeStr + ' — ' + courtLabel
      + (coachLabel ? ' / ' + coachLabel : '');

    let body = verb + '\n\n';
    body += 'Date: ' + booking.date + '\n';
    body += 'Time: ' + timeStr + ' – ' + endTimeStr + '\n';
    body += courtLabel + '\n';
    if (coachLabel) body += 'Coach: ' + coachLabel + '\n';
    body += '\nClient: ' + booking.name + '\n';
    body += 'Email: ' + booking.email + '\n';
    if (booking.phone) body += 'Phone: ' + booking.phone + '\n';
    body += '\n— ' + cfg.siteName;

    GmailApp.sendEmail(unique.join(','), subject, body);
  } catch (err) {
    Logger.log('notifyAdmins error: ' + err.message);
  }
}

function jsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function htmlResponse(title, body) {
  // Use a cosmetic fallback if settings aren't yet seeded.
  let siteName = FALLBACK_SITE_NAME;
  try {
    const cfg = getSettings();
    if (cfg && cfg.siteName) siteName = cfg.siteName;
  } catch (e) { /* settings not initialized — use fallback */ }

  const html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<base target="_top">'
    + '<title>' + title + ' — ' + siteName + '</title>'
    + '<style>'
    + 'body{font-family:system-ui,sans-serif;max-width:480px;margin:60px auto;padding:0 20px;'
    + 'background:#0a0a0a;color:#e0e0e0;}'
    + 'h1{color:#c5e84c;font-size:1.5em;}'
    + 'a{color:#c5e84c;}'
    + '</style></head><body>'
    + '<h1>' + title + '</h1>'
    + '<p>' + body + '</p>'
    + '</body></html>';
  return HtmlService.createHtmlOutput(html);
}
