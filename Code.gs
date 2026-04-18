// ============================================================
// TennisKosmos — Google Apps Script Backend
// ============================================================
// This script is intended to be deployed TWICE as a Web App:
//
//   1) PUBLIC deployment  — Execute as: Me, Access: Anyone.
//      Its URL is stored in config.json on GitHub. Handles the
//      booking flow (availability, book, confirm, cancel), the
//      training-request flow (requestTraining, confirmTraining),
//      and the redacted public settings endpoint (action=settings).
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
//   - Tasks Advanced Service enabled (for training-request Google Tasks).
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
  // Preserves the shape the frontend expects (calendars.courts keys).
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
    currency: full.currency,
    reminders: full.reminders,
    contact: full.contact,
    languages: full.languages,
    defaultLanguage: full.defaultLanguage,
    calendars: {
      courts: courtKeys,
    },
  };
}

// Seeds settings_json with a neutral template. Calendar IDs, admin
// emails, and fromEmail are LEFT BLANK on purpose so no
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
    siteUrl: 'https://tenniskosmos.com/',
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
      { from: '08:00', to: '17:00', price: 600,  label: 'Day' },
      { from: '17:00', to: '20:00', price: 800,  label: 'Evening' },
      { from: '20:00', to: '22:00', price: 1200, label: 'Lights' },
    ],
    currency: 'RSD',
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
    adminNotifications: {
      emails: [],
    },
    fromEmail: '',
  };
  props.setProperty('settings_json', JSON.stringify(seed));
  Logger.log('Settings initialized (template with blank private fields). Fill calendar IDs, admin emails, and contact info via the admin page.');
}

// One-shot migration: strips coach-related fields from an existing
// settings_json, and lifts currency out of coachPrices to the top level.
// Safe to run more than once (idempotent). Run this from the script
// editor after deploying the new code.
function migrateRemoveCoaches() {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('settings_json');
  if (!raw) {
    Logger.log('No settings_json to migrate. Run setupInitialSettings() first.');
    return;
  }
  const s = JSON.parse(raw);
  // Back up before touching anything.
  props.setProperty('settings_json_backup', raw);

  // Lift currency if still nested under coachPrices (or a band).
  if (!s.currency) {
    if (s.coachPrices && s.coachPrices.currency) {
      s.currency = s.coachPrices.currency;
    } else if (Array.isArray(s.courtPrices) && s.courtPrices[0] && s.courtPrices[0].currency) {
      s.currency = s.courtPrices[0].currency;
    } else {
      s.currency = 'RSD';
    }
  }
  // Drop per-band currency (redundant now).
  if (Array.isArray(s.courtPrices)) {
    s.courtPrices.forEach(function (b) { delete b.currency; });
  }
  // Delete coach branches.
  delete s.coaches;
  delete s.coachPrices;
  if (s.adminNotifications) {
    delete s.adminNotifications.coachGetsOwnBookings;
  }

  props.setProperty('settings_json', JSON.stringify(s));
  Logger.log('Migration complete. Old settings backed up to settings_json_backup.');
}

// DEBUG: run this directly from the editor (function dropdown → debugBookingFlow → Run)
// to exercise doPost's booking path with fake POST data. This bypasses
// the Web App deployment layer entirely, so any logging or thrown
// exception is guaranteed to appear in the editor's Execution log.
function debugBookingFlow() {
  Logger.log('=== debugBookingFlow starting ===');
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        action: 'book',
        date: '2026-04-20',
        startHour: 10,
        durationHours: 1,
        courtId: '1',
        name: 'Debug Test',
        email: 'debug-' + Date.now() + '@example.com',
        phone: '',
        language: 'sr',
      }),
    },
  };
  const response = doPost(fakeEvent);
  // ContentService responses expose getContent() to read the body back.
  try {
    Logger.log('doPost returned body: ' + response.getContent());
  } catch (e) {
    Logger.log('doPost returned object (no getContent): ' + JSON.stringify(response));
  }
  Logger.log('=== debugBookingFlow finished ===');
}

function validateSettings(s) {
  if (!s || typeof s !== 'object') throw new Error('Settings must be an object.');
  const required = ['siteName','timezone','daysAhead','slotLengthMinutes','workingHours',
    'courtPrices','currency','reminders','contact','languages','defaultLanguage',
    'courts','adminNotifications','fromEmail'];
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
    hi: 'Hi', date: 'Date', time: 'Time', court: 'Court',
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
    // Training request flow
    trConfirmSubject: 'Confirm your training request',
    trConfirmIntro: 'Thank you for your training request! Please click the link below to confirm that this is really you:',
    trConfirmedSubject: 'Training request received',
    trConfirmedIntro: 'Thanks! We have received your training request and will call you back shortly.',
    trHtmlConfirmedTitle: 'Training request received',
    trHtmlConfirmedBody: 'Thanks, {name}! We will call you back shortly at {phone}.<br><br><a href="{url}">Back to {site}</a>',
  },
  sr: {
    dayNames: ['Ned','Pon','Uto','Sre','Čet','Pet','Sub'],
    monthNames: ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'],
    hi: 'Zdravo', date: 'Datum', time: 'Vreme', court: 'Teren',
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
    // Training request flow
    trConfirmSubject: 'Potvrdite zahtev za trening',
    trConfirmIntro: 'Hvala na zahtevu za trening! Kliknite na link ispod da potvrdite da ste to stvarno vi:',
    trConfirmedSubject: 'Zahtev za trening primljen',
    trConfirmedIntro: 'Hvala! Primili smo vaš zahtev za trening i uskoro ćemo vas pozvati.',
    trHtmlConfirmedTitle: 'Zahtev za trening primljen',
    trHtmlConfirmedBody: 'Hvala, {name}! Uskoro ćemo vas pozvati na {phone}.<br><br><a href="{url}">Nazad na {site}</a>',
  },
  ru: {
    dayNames: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
    monthNames: ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'],
    hi: 'Здравствуйте', date: 'Дата', time: 'Время', court: 'Корт',
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
    // Training request flow
    trConfirmSubject: 'Подтвердите заявку на тренировку',
    trConfirmIntro: 'Спасибо за заявку на тренировку! Нажмите на ссылку ниже, чтобы подтвердить, что это действительно вы:',
    trConfirmedSubject: 'Заявка на тренировку получена',
    trConfirmedIntro: 'Спасибо! Мы получили вашу заявку на тренировку и скоро перезвоним.',
    trHtmlConfirmedTitle: 'Заявка на тренировку получена',
    trHtmlConfirmedBody: 'Спасибо, {name}! Мы скоро перезвоним вам на номер {phone}.<br><br><a href="{url}">Вернуться на {site}</a>',
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

    // --- Confirm a pending court booking ---
    if (params.confirm) {
      if (!/^[0-9a-fA-F-]{8,64}$/.test(params.confirm)) {
        return htmlResponse('Invalid link', 'This link is not valid.');
      }
      return handleConfirm(params.confirm);
    }

    // --- Confirm a pending training request ---
    if (params.confirmTraining) {
      if (!/^[0-9a-fA-F-]{8,64}$/.test(params.confirmTraining)) {
        return htmlResponse('Invalid link', 'This link is not valid.');
      }
      return handleConfirmTraining(params.confirmTraining);
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
// doPost — save admin settings, create a pending court booking,
//          or create a pending training request.
// ============================================================

function doPost(e) {
  Logger.log('[doPost] entered. raw body: ' + (e && e.postData && e.postData.contents ? e.postData.contents : '<missing>'));
  try {
    const body = JSON.parse(e.postData.contents);
    Logger.log('[doPost] parsed body action=' + body.action + ' courtId=' + body.courtId + ' date=' + body.date + ' startHour=' + body.startHour + ' duration=' + body.durationHours);

    if (body.action === 'saveSettings') {
      Logger.log('[doPost] -> saveSettings branch');
      requireAdmin();
      validateSettings(body.settings);
      saveSettingsToStore(body.settings);
      return jsonResponse({ status: 'ok' });
    }

    if (body.action === 'requestTraining') {
      Logger.log('[doPost] -> requestTraining branch');
      return handleTrainingRequest(body);
    }

    Logger.log('[doPost] -> handleBookingRequest branch');
    return handleBookingRequest(body);
  } catch (err) {
    Logger.log('[doPost] CAUGHT: ' + err.message + '\n' + (err.stack || ''));
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
// Availability — FreeBusy for the 4 court calendars
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
  };

  for (const key in cfg.courts) {
    const calId = cfg.courts[key];
    const cal = response.calendars[calId];
    result.courts[key] = {
      busy: (cal && cal.busy) ? cal.busy : [],
      errors: (cal && cal.errors) ? cal.errors : undefined,
    };
  }

  return jsonResponse(result);
}

// ============================================================
// Court booking request — create pending hold + send confirm email
// ============================================================

function handleBookingRequest(body) {
  Logger.log('[handleBookingRequest] enter. body keys=' + Object.keys(body || {}).join(','));
  const cfg = getSettings();
  Logger.log('[handleBookingRequest] cfg.courts keys=' + Object.keys(cfg.courts || {}).join(',') + ' ; cfg.courts[' + body.courtId + ']=' + cfg.courts[body.courtId]);
  const GENERIC = 'Invalid booking request.';

  // Validate required fields (without echoing field names back to the client)
  const required = ['date', 'startHour', 'durationHours', 'courtId', 'name', 'email'];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      Logger.log('[guard] missing field: ' + field);
      return jsonResponse({ error: GENERIC }, 400);
    }
  }

  // Email format
  if (!isValidEmail(String(body.email).trim())) {
    Logger.log('[guard] email invalid: ' + body.email);
    return jsonResponse({ error: GENERIC }, 400);
  }

  // Name length sanity
  const name = String(body.name).trim();
  if (name.length === 0 || name.length > 120) {
    Logger.log('[guard] name length bad: ' + name.length);
    return jsonResponse({ error: GENERIC }, 400);
  }

  // Date must be YYYY-MM-DD and within [today, today + 60d]
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.date))) {
    Logger.log('[guard] date format bad: ' + body.date);
    return jsonResponse({ error: GENERIC }, 400);
  }
  const reqDate = new Date(body.date + 'T00:00:00');
  if (isNaN(reqDate.getTime())) {
    Logger.log('[guard] date parse NaN: ' + body.date);
    return jsonResponse({ error: GENERIC }, 400);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxAhead = new Date(today);
  maxAhead.setDate(maxAhead.getDate() + 60);
  if (reqDate < today || reqDate > maxAhead) {
    Logger.log('[guard] date out of window. reqDate=' + reqDate.toISOString() + ' today=' + today.toISOString());
    return jsonResponse({ error: GENERIC }, 400);
  }

  // Validate whole-hour constraint (reject any non-integer, non-0-23)
  const startHour = parseInt(body.startHour, 10);
  if (!Number.isInteger(startHour) || startHour !== Number(body.startHour) || startHour < 0 || startHour > 23) {
    Logger.log('[guard] startHour bad: ' + body.startHour);
    return jsonResponse({ error: GENERIC }, 400);
  }
  const durationHours = parseInt(body.durationHours, 10);
  if (![1, 2, 3].includes(durationHours)) {
    Logger.log('[guard] durationHours bad: ' + body.durationHours);
    return jsonResponse({ error: GENERIC }, 400);
  }

  // Validate court allow-list
  if (!cfg.courts[body.courtId]) {
    Logger.log('[guard] courtId not in allow-list. body.courtId=' + body.courtId + ' courts=' + JSON.stringify(Object.keys(cfg.courts || {})));
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
  const conflict = checkConflict([cfg.courts[body.courtId]], startDate, endDate);
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

  let emailBody = tr(lang, 'hi') + ' ' + body.name + ',\n\n';
  emailBody += tr(lang, 'confirmIntro') + '\n\n';
  emailBody += tr(lang, 'date') + ': ' + friendlyDate + '\n';
  emailBody += tr(lang, 'time') + ': ' + timeStr + ' – ' + endTimeStr + '\n';
  emailBody += courtLabel + '\n';
  emailBody += '\n' + tr(lang, 'clickToConfirm') + '\n' + confirmUrl + '\n\n';
  emailBody += tr(lang, 'expiresIn', { n: cfg.pendingTtlMinutes }) + '\n\n';
  emailBody += '— ' + cfg.siteName;

  GmailApp.sendEmail(body.email, subject, emailBody);

  return jsonResponse({ status: 'pending', message: 'Check your email to confirm the booking.' });
}

// ============================================================
// Training request — create pending hold + send confirm email
// ============================================================
// Training requests are intentionally NOT availability-checked and
// NOT written to any calendar. A coach calls the client back from
// the admin email/task and manually creates the event on the court
// calendar if they agree to take the training.

function handleTrainingRequest(body) {
  const GENERIC = 'Invalid training request.';

  // Required fields
  const required = ['name', 'phone', 'email'];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
      return jsonResponse({ error: GENERIC }, 400);
    }
  }

  const name = String(body.name).trim();
  if (name.length === 0 || name.length > 120) {
    return jsonResponse({ error: GENERIC }, 400);
  }

  if (!isValidEmail(String(body.email).trim())) {
    return jsonResponse({ error: GENERIC }, 400);
  }

  const phone = String(body.phone).trim();
  if (phone.length === 0 || phone.length > 40) {
    return jsonResponse({ error: GENERIC }, 400);
  }

  // Validate pill-selector values against allow-lists. Missing = accepted
  // (treated as unspecified), but any non-empty value must be in the list.
  const LEVEL_ALLOWED   = ['beginner', 'intermediate', 'advanced'];
  const RACKETS_ALLOWED = ['have', 'borrow'];
  const GROUP_ALLOWED   = ['solo', 'partner', 'family', 'kids'];
  const level   = body.level   ? String(body.level).toLowerCase()   : '';
  const rackets = body.rackets ? String(body.rackets).toLowerCase() : '';
  const group   = body.group   ? String(body.group).toLowerCase()   : '';
  if (level   && LEVEL_ALLOWED.indexOf(level)     === -1) return jsonResponse({ error: GENERIC }, 400);
  if (rackets && RACKETS_ALLOWED.indexOf(rackets) === -1) return jsonResponse({ error: GENERIC }, 400);
  if (group   && GROUP_ALLOWED.indexOf(group)     === -1) return jsonResponse({ error: GENERIC }, 400);

  const notes = body.notes ? String(body.notes).slice(0, 2000) : '';

  // Normalize language
  const requestedLang = String(body.language || '').toLowerCase();
  const language = I18N[requestedLang] ? requestedLang : 'en';

  // Rate limit by email
  const rl = checkRateLimit(String(body.email).trim());
  if (!rl.ok) {
    return jsonResponse({ error: rl.reason }, 429);
  }

  const cfg = getSettings();
  const token = Utilities.getUuid();
  const pending = {
    token: token,
    kind: 'training',
    name: name,
    phone: phone,
    email: String(body.email).trim(),
    level: level,
    rackets: rackets,
    group: group,
    notes: notes,
    language: language,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + cfg.pendingTtlMinutes * 60 * 1000).toISOString(),
  };

  const props = PropertiesService.getScriptProperties();
  props.setProperty('pendingTraining_' + token, JSON.stringify(pending));

  // Send confirmation email (in client's chosen language)
  const scriptUrl = ScriptApp.getService().getUrl();
  const confirmUrl = scriptUrl + '?confirmTraining=' + token;

  const subject = tr(language, 'trConfirmSubject');
  let emailBody = tr(language, 'hi') + ' ' + name + ',\n\n';
  emailBody += tr(language, 'trConfirmIntro') + '\n\n';
  emailBody += confirmUrl + '\n\n';
  emailBody += tr(language, 'expiresIn', { n: cfg.pendingTtlMinutes }) + '\n\n';
  emailBody += '— ' + cfg.siteName;

  GmailApp.sendEmail(pending.email, subject, emailBody);

  return jsonResponse({ status: 'pending', message: 'Check your email to confirm the request.' });
}

// ============================================================
// Confirm a court booking — finalize the booking
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
  const conflict = checkConflict([cfg.courts[pending.courtId]], startDate, endDate);
  if (conflict) {
    props.deleteProperty('pending_' + token);
    return htmlResponse('Slot no longer available',
      'Sorry, this slot was just booked by someone else. Please go back and pick another time.');
  }

  // Create calendar event
  const timeStr = padHour(pending.startHour) + ':00';
  const endTimeStr = padHour(pending.startHour + pending.durationHours) + ':00';
  const courtLabel = 'Court ' + pending.courtId;
  const eventTitle = courtLabel + ' — ' + pending.name;

  const eventDescription = [
    'Booked by: ' + pending.name,
    'Email: ' + pending.email,
    pending.phone ? 'Phone: ' + pending.phone : '',
    courtLabel,
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

  // Store confirmed booking info (for cancellation and reminders)
  const cancelToken = Utilities.getUuid();
  const confirmed = {
    cancelToken: cancelToken,
    confirmToken: token,
    courtEventId: courtEventId,
    courtId: pending.courtId,
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

  // Send confirmation email (in the client's chosen language)
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
  emailBody += '\n' + tr(lang, 'inviteNote') + '\n\n';
  emailBody += tr(lang, 'needCancel') + '\n' + cancelUrl + '\n\n';
  emailBody += '— ' + cfg.siteName;

  GmailApp.sendEmail(pending.email, subject, emailBody);

  // Notify admin(s).
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
// Confirm a training request — create Google Task + email admins
// ============================================================

function handleConfirmTraining(token) {
  const cfg = getSettings();
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('pendingTraining_' + token);

  if (!raw) {
    return htmlResponse('Request not found', 'This confirmation link is invalid or has expired.');
  }

  const pending = JSON.parse(raw);

  if (new Date() > new Date(pending.expiresAt)) {
    props.deleteProperty('pendingTraining_' + token);
    return htmlResponse('Link expired', 'This confirmation link has expired. Please submit your request again.');
  }

  // Create Google Task. Wrapped in try/catch because the Tasks REST call
  // can fail for many reasons (quota, auth scope revoked, transient 5xx),
  // and we don't want that to break the admin email, which is the backup
  // channel — a missed task is annoying, a missed admin email is a lost
  // lead.
  try {
    createTrainingTask(pending);
  } catch (err) {
    Logger.log('Could not create Google Task: ' + err.message);
  }

  // Notify admins by email (backup channel).
  notifyAdminsTraining(cfg, pending);

  // Remove pending hold
  props.deleteProperty('pendingTraining_' + token);

  const lang = pending.language || 'en';
  return htmlResponse(
    tr(lang, 'trHtmlConfirmedTitle'),
    tr(lang, 'trHtmlConfirmedBody', {
      name: htmlEscape(pending.name),
      phone: htmlEscape(pending.phone),
      url: htmlEscape(cfg.siteUrl),
      site: htmlEscape(cfg.siteName),
    })
  );
}

// Create a task in bookmeridiana@gmail.com's default task list via the
// Tasks REST API. We call it directly through UrlFetchApp (rather than
// through the `Tasks` advanced service) so the script works on any GCP
// project configuration without needing the advanced service enabled in
// the editor's Services sidebar. The `tasks` OAuth scope is declared in
// appsscript.json, which is all Google requires for this REST call.
function createTrainingTask(pending) {
  // Only the date portion of `due` is displayed in Google Tasks — time
  // is discarded. Setting it to today makes the task show up as
  // today's todo item for the coaches.
  const today = new Date();
  const dueIso = today.toISOString();

  const title = 'Training request: ' + pending.name + (pending.phone ? ' — ' + pending.phone : '');
  const notes = buildTrainingNotes(pending);

  const task = { title: title, notes: notes, due: dueIso };

  const response = UrlFetchApp.fetch(
    'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks',
    {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      payload: JSON.stringify(task),
      muteHttpExceptions: true,
    }
  );

  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Tasks API returned HTTP ' + code + ': ' + response.getContentText());
  }
}

function buildTrainingNotes(pending) {
  const lines = [];
  lines.push('Name: ' + pending.name);
  lines.push('Phone: ' + pending.phone);
  lines.push('Email: ' + pending.email);
  if (pending.level)   lines.push('Level: ' + pending.level);
  if (pending.rackets) lines.push('Rackets: ' + pending.rackets);
  if (pending.group)   lines.push('Group: ' + pending.group);
  if (pending.notes)   lines.push('Notes: ' + pending.notes);
  lines.push('Language: ' + (pending.language || 'en'));
  lines.push('Submitted: ' + pending.createdAt);
  return lines.join('\n');
}

// ============================================================
// Cancel — delete court event and triggers
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

  // Delete scheduled reminder triggers
  deleteReminders(cancelToken);

  // Send cancellation email (in the client's chosen language)
  const lang = booking.language || 'en';
  const startDate = new Date(booking.date + 'T' + padHour(booking.startHour) + ':00:00');
  const friendlyDate = formatFriendlyDateLang(startDate, lang);
  const timeStr = padHour(booking.startHour) + ':00';
  const endTimeStr = padHour(booking.startHour + booking.durationHours) + ':00';
  const courtLabel = tr(lang, 'court') + ' ' + booking.courtId;

  const subject = tr(lang, 'cancelledSubject', { date: friendlyDate, time: timeStr });
  let emailBody = tr(lang, 'hi') + ' ' + booking.name + ',\n\n';
  emailBody += tr(lang, 'cancelledIntro') + '\n\n';
  emailBody += tr(lang, 'date') + ': ' + friendlyDate + '\n';
  emailBody += tr(lang, 'time') + ': ' + timeStr + ' – ' + endTimeStr + '\n';
  emailBody += courtLabel + '\n';
  emailBody += '\n' + tr(lang, 'bookAgain') + '\n' + cfg.siteUrl + '\n\n';
  emailBody += '— ' + cfg.siteName;

  GmailApp.sendEmail(booking.email, subject, emailBody);

  // Notify admin(s).
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
// Helpers
// ============================================================

function padHour(h) {
  return String(h).padStart(2, '0');
}

// Send court-booking notification to admin(s). kind is 'created' or 'cancelled'.
// Recipients come from settings.adminNotifications.emails. Errors are swallowed
// so a notify failure never breaks the client-facing booking/cancel flow.
function notifyAdmins(cfg, booking, kind) {
  try {
    const notif = (cfg && cfg.adminNotifications) || {};
    const recipients = [];
    if (Array.isArray(notif.emails)) {
      for (const e of notif.emails) {
        if (e && typeof e === 'string') recipients.push(e);
      }
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
    const courtLabel = 'Court ' + booking.courtId;
    const verb = kind === 'cancelled' ? 'CANCELLED' : 'NEW BOOKING';

    const subject = '[' + cfg.siteName + '] ' + verb + ': '
      + booking.date + ' ' + timeStr + ' — ' + courtLabel;

    let body = verb + '\n\n';
    body += 'Date: ' + booking.date + '\n';
    body += 'Time: ' + timeStr + ' – ' + endTimeStr + '\n';
    body += courtLabel + '\n';
    body += '\nClient: ' + booking.name + '\n';
    body += 'Email: ' + booking.email + '\n';
    if (booking.phone) body += 'Phone: ' + booking.phone + '\n';
    body += '\n— ' + cfg.siteName;

    GmailApp.sendEmail(unique.join(','), subject, body);
  } catch (err) {
    Logger.log('notifyAdmins error: ' + err.message);
  }
}

// Send training-request notification to admin(s). Sent once, on confirm.
// Errors are swallowed so a notify failure never breaks the client flow.
function notifyAdminsTraining(cfg, req) {
  try {
    const notif = (cfg && cfg.adminNotifications) || {};
    const recipients = [];
    if (Array.isArray(notif.emails)) {
      for (const e of notif.emails) {
        if (e && typeof e === 'string') recipients.push(e);
      }
    }
    const seen = {};
    const unique = [];
    for (const e of recipients) {
      const key = e.toLowerCase();
      if (!seen[key]) { seen[key] = true; unique.push(e); }
    }
    if (unique.length === 0) return;

    const subject = '[' + cfg.siteName + '] TRAINING REQUEST: '
      + req.name + ' — ' + req.phone;

    let body = 'NEW TRAINING REQUEST\n\n';
    body += 'Call this person back.\n\n';
    body += 'Name: '   + req.name  + '\n';
    body += 'Phone: '  + req.phone + '\n';
    body += 'Email: '  + req.email + '\n';
    if (req.level)   body += 'Level: '   + req.level   + '\n';
    if (req.rackets) body += 'Rackets: ' + req.rackets + '\n';
    if (req.group)   body += 'Group: '   + req.group   + '\n';
    if (req.notes)   body += '\nNotes:\n' + req.notes + '\n';
    body += '\nLanguage: '  + (req.language || 'en') + '\n';
    body += 'Submitted: ' + req.createdAt + '\n';
    body += '\n— ' + cfg.siteName;

    GmailApp.sendEmail(unique.join(','), subject, body);
  } catch (err) {
    Logger.log('notifyAdminsTraining error: ' + err.message);
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
