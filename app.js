/* ============================================
   Tennis Kosmos — Booking App
   Vanilla JS, no frameworks
   ============================================ */

(function () {
  'use strict';

  // ---- i18n strings ----
  const STRINGS = {
    en: {
      bookCourt: 'Book the court',
      requestTraining: 'Request training',
      tagline: 'Book your court or request a training',
      loading: 'Loading availability…',
      noSlots: 'No available slots for this day',
      noConfig: 'No available hours configured — please contact us',
      selectDay: 'Select a day to see available times',
      name: 'Name',
      namePlaceholder: 'Your full name',
      email: 'Email',
      emailPlaceholder: 'your@email.com',
      phoneOptional: 'Phone (optional)',
      phone: 'Phone',
      phonePlaceholder: '+381 ...',
      book: 'Book',
      submit: 'Send request',
      cancel: 'Cancel',
      bookingTitle: 'Complete your booking',
      court: 'Court',
      courts: 'Courts',
      total: 'Total',
      checkEmail: 'Check your email!',
      checkEmailDesc: 'We sent a confirmation link to your email. Click it to finalize your booking.',
      checkEmailTraining: 'We sent a confirmation link to your email. Click it to send your training request — we\'ll call you back after that.',
      bookingError: 'Something went wrong. Please try again.',
      slotTaken: 'This slot was just booked. Please pick another.',
      nudgeMessage: 'Could you please consider adjusting? This would leave 30 minutes next to your slot that nobody else can book.',
      chooseCourt: 'Choose a court',
      availabilityError: 'Couldn\'t load availability. Please try again.',
      retry: 'Retry',
      // Training request form
      trainingTitle: 'Request a training',
      trainingIntro: 'Fill out this form and one of our coaches will call you back to arrange a training session that fits you.',
      level: 'Your level',
      levelBeginner: 'Beginner',
      levelIntermediate: 'Intermediate',
      levelAdvanced: 'Advanced',
      rackets: 'Rackets',
      racketsHave: 'I have my own',
      racketsBorrow: 'I need to borrow',
      group: 'Who\'s training',
      groupSolo: 'Solo',
      groupPartner: 'With partner',
      groupFamily: 'Family',
      groupKids: 'Kids',
      notes: 'When do you want to play? Anything else we should know?',
      notesPlaceholder: 'E.g. weekday evenings, Saturday mornings, preferred coach, injuries…',
      openInMap: 'Open in Google Maps',
      dismiss: 'Dismiss',
    },
    sr: {
      bookCourt: 'Rezervišite teren',
      requestTraining: 'Zakažite trening',
      tagline: 'Rezervišite teren ili zakažite trening',
      loading: 'Učitavanje dostupnosti…',
      noSlots: 'Nema slobodnih termina za ovaj dan',
      noConfig: 'Nema podešenih radnih sati — kontaktirajte nas',
      selectDay: 'Izaberite dan da vidite slobodne termine',
      name: 'Ime',
      namePlaceholder: 'Vaše puno ime',
      email: 'Email',
      emailPlaceholder: 'vaš@email.com',
      phoneOptional: 'Telefon (opciono)',
      phone: 'Telefon',
      phonePlaceholder: '+381 ...',
      book: 'Rezervišite',
      submit: 'Pošalji zahtev',
      cancel: 'Otkaži',
      bookingTitle: 'Završite rezervaciju',
      court: 'Teren',
      courts: 'Tereni',
      total: 'Ukupno',
      checkEmail: 'Proverite email!',
      checkEmailDesc: 'Poslali smo link za potvrdu na vaš email. Kliknite na njega da finalizujete rezervaciju.',
      checkEmailTraining: 'Poslali smo link za potvrdu na vaš email. Kliknite na njega da pošaljete zahtev — posle toga ćemo vas pozvati.',
      bookingError: 'Nešto nije u redu. Pokušajte ponovo.',
      slotTaken: 'Ovaj termin je upravo rezervisan. Izaberite drugi.',
      nudgeMessage: 'Da li biste razmislili o prilagođavanju? Ostavili biste 30 slobodnih minuta pored vašeg termina koje niko drugi ne može da rezerviše.',
      chooseCourt: 'Izaberite teren',
      availabilityError: 'Greška pri učitavanju dostupnosti. Pokušajte ponovo.',
      retry: 'Pokušaj ponovo',
      // Training request form
      trainingTitle: 'Zakažite trening',
      trainingIntro: 'Popunite formular i jedan od naših trenera će vas pozvati da dogovorite trening koji vam odgovara.',
      level: 'Vaš nivo',
      levelBeginner: 'Početnik',
      levelIntermediate: 'Srednji',
      levelAdvanced: 'Napredan',
      rackets: 'Reketi',
      racketsHave: 'Imam svoj',
      racketsBorrow: 'Treba mi',
      group: 'Ko trenira',
      groupSolo: 'Sam',
      groupPartner: 'Sa partnerom',
      groupFamily: 'Porodica',
      groupKids: 'Deca',
      notes: 'Kada želite da igrate? Još nešto što treba da znamo?',
      notesPlaceholder: 'Npr. radnim danima uveče, subota ujutru, željeni trener, povrede…',
      openInMap: 'Otvori u Google Maps',
      dismiss: 'Zatvori',
    },
    ru: {
      bookCourt: 'Забронировать корт',
      requestTraining: 'Заявка на тренировку',
      tagline: 'Забронируйте корт или закажите тренировку',
      loading: 'Загрузка доступности…',
      noSlots: 'Нет свободных слотов на этот день',
      noConfig: 'Нет настроенных рабочих часов — свяжитесь с нами',
      selectDay: 'Выберите день, чтобы увидеть доступное время',
      name: 'Имя',
      namePlaceholder: 'Ваше полное имя',
      email: 'Email',
      emailPlaceholder: 'ваш@email.com',
      phoneOptional: 'Телефон (необязательно)',
      phone: 'Телефон',
      phonePlaceholder: '+381 ...',
      book: 'Забронировать',
      submit: 'Отправить заявку',
      cancel: 'Отмена',
      bookingTitle: 'Завершите бронирование',
      court: 'Корт',
      courts: 'Корты',
      total: 'Итого',
      checkEmail: 'Проверьте почту!',
      checkEmailDesc: 'Мы отправили ссылку для подтверждения на ваш email. Нажмите на неё, чтобы завершить бронирование.',
      checkEmailTraining: 'Мы отправили ссылку для подтверждения на ваш email. Нажмите на неё, чтобы отправить заявку — после этого мы вам перезвоним.',
      bookingError: 'Что-то пошло не так. Попробуйте снова.',
      slotTaken: 'Этот слот только что забронирован. Выберите другой.',
      nudgeMessage: 'Не могли бы вы немного скорректировать? Рядом со слотом останется 30 свободных минут, которые никто другой не сможет забронировать.',
      chooseCourt: 'Выберите корт',
      availabilityError: 'Не удалось загрузить доступность. Попробуйте снова.',
      retry: 'Повторить',
      // Training request form
      trainingTitle: 'Заявка на тренировку',
      trainingIntro: 'Заполните форму и один из наших тренеров перезвонит вам, чтобы договориться о подходящей тренировке.',
      level: 'Ваш уровень',
      levelBeginner: 'Начинающий',
      levelIntermediate: 'Средний',
      levelAdvanced: 'Продвинутый',
      rackets: 'Ракетки',
      racketsHave: 'Своя есть',
      racketsBorrow: 'Нужна напрокат',
      group: 'Кто тренируется',
      groupSolo: 'Один',
      groupPartner: 'С партнёром',
      groupFamily: 'Семья',
      groupKids: 'Дети',
      notes: 'Когда хотите играть? Что-нибудь ещё, что нам нужно знать?',
      notesPlaceholder: 'Напр. будни вечером, суббота утром, предпочитаемый тренер, травмы…',
      openInMap: 'Открыть в Google Maps',
      dismiss: 'Скрыть',
    }
  };

  const LOCALE_MAP = { en: 'en-US', sr: 'sr-Latn-RS', ru: 'ru-RU' };
  const DAY_NAMES_MAP = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  // Training request pill-selector value maps
  const LEVEL_KEYS   = [['beginner', 'levelBeginner'], ['intermediate', 'levelIntermediate'], ['advanced', 'levelAdvanced']];
  const RACKETS_KEYS = [['have', 'racketsHave'], ['borrow', 'racketsBorrow']];
  const GROUP_KEYS   = [['solo', 'groupSolo'], ['partner', 'groupPartner'], ['family', 'groupFamily'], ['kids', 'groupKids']];

  // ---- State ----
  let config = null;
  let availability = null; // raw busy intervals from Apps Script
  let currentLang = 'sr';
  let currentMode = 'court'; // 'court' or 'training'
  let selectedDate = null;
  // Duration of the candidate booking in minutes. Slot grid step is 30 min,
  // smallest booking is 60 min — see BookMeridiana note 2026-04-27.
  let selectedDuration = 60;
  // Allowed durations in minutes. Display labels are localised (decimal
  // separator: "." in en, "," in sr/ru).
  const DURATION_CHOICES = [60, 90, 120];
  // Slot grid step. Hardcoded; the `slotLengthMinutes` setting is exposed
  // in the schema as a future hook but is not read here.
  const SLOT_STEP_MIN = 30;
  // Smallest bookable duration. A leftover fragment shorter than this can
  // never be filled by a future booking, which is what the modal nudge
  // surfaces to bookers — but it never blocks the submission.
  const MIN_BOOKING_MIN = 60;
  let expandedSlot = null; // { startMin } — which slot has court picker open

  function t(key) { return STRINGS[currentLang]?.[key] || STRINGS.en[key] || key; }
  function locale() { return LOCALE_MAP[currentLang] || 'en-US'; }
  function getCurrency() {
    return (config && config.currency)
      || (config && Array.isArray(config.courtPrices) && config.courtPrices[0] && config.courtPrices[0].currency)
      || 'RSD';
  }

  // ---- Tennis ball SVG inline ----
  function tennisBallSVG(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#c5e84c"/>
      <path d="M 22 15 Q 50 50, 22 85" stroke="white" stroke-width="3" fill="none" opacity="0.7"/>
      <path d="M 78 15 Q 50 50, 78 85" stroke="white" stroke-width="3" fill="none" opacity="0.7"/>
    </svg>`;
  }

  // ---- Map pin SVG inline ----
  function mapPinSVG(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>`;
  }

  // ---- Theme (light/dark) ----
  // Initial resolution happens in an inline <head> script before paint to
  // avoid a flash. This module owns the runtime toggle, persistence, and
  // live system-preference tracking when the user has no explicit choice.
  const THEME_KEY = 'tk_theme';
  let themeToggleBound = false;

  function getStoredTheme() {
    try {
      const v = localStorage.getItem(THEME_KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch (e) { return null; }
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    // Mirror the inline-style overrides set by the pre-paint script: light
    // mode pins the html element's bg + color-scheme, dark mode clears
    // them so the inline <style> default ('dark') reasserts.
    if (theme === 'light') {
      document.documentElement.style.backgroundColor = '#ffffff';
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.style.backgroundColor = '';
      document.documentElement.style.colorScheme = '';
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#0a0a0a');
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const next = theme === 'light' ? 'dark' : 'light';
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      btn.setAttribute('aria-label', `Switch to ${next} theme`);
    }
  }

  function bindThemeToggle() {
    if (themeToggleBound) return;
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    // Sync ARIA state with whatever the pre-paint script picked.
    applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    btn.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyTheme(next);
    });
    if (window.matchMedia) {
      const mql = window.matchMedia('(prefers-color-scheme: light)');
      const onChange = e => { if (!getStoredTheme()) applyTheme(e.matches ? 'light' : 'dark'); };
      if (mql.addEventListener) mql.addEventListener('change', onChange);
      else if (mql.addListener) mql.addListener(onChange);
    }
    themeToggleBound = true;
  }

  // ---- Settings cache (localStorage) ----
  // Bootstrap config.json carries only the apps script URL + language
  // defaults. The rest of the business rules (workingHours, prices,
  // courts, contact, branding) live in Apps Script Script Properties and
  // are fetched via ?action=settings — a ~3s round-trip on cold start.
  // We cache the response so subsequent visits render from cache instantly
  // while a fresh fetch revalidates in the background. If the fresh
  // result differs, the UI updates without disturbing an open booking
  // modal or in-progress training form.
  const SETTINGS_CACHE_KEY = 'tk_settings_v1'; // bump suffix on incompatible changes

  function loadCachedSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function saveCachedSettings(settings) {
    try { localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings)); } catch (e) {}
  }

  // Stringification is good enough — settings is a small JSON tree
  // serialized the same way both times (we never mutate the cached blob).
  function settingsEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  // Re-render the parts of the UI that depend on settings, after a fresh
  // fetch revealed a real diff vs the cached values we initially rendered
  // with. Skips: an open booking modal (preserves the flow), the training
  // form (preserves any user input). Always safe to call.
  function refreshAfterSettingsChange() {
    // selectedDate may now sit outside a smaller daysAhead window.
    if (selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysAhead = config.daysAhead || 10;
      const lastDate = new Date(today);
      lastDate.setDate(lastDate.getDate() + daysAhead - 1);
      if (selectedDate < today || selectedDate > lastDate) {
        selectedDate = null;
        expandedSlot = null;
      }
    }

    applySiteNames();
    renderFooter();
    renderNotice();

    if (document.querySelector('.booking-modal-overlay')) return;
    if (currentMode !== 'court') return;
    if (!availability) return;

    renderCalendar();
    renderSlots();
  }

  // ---- Init ----
  async function init() {
    // Theme toggle lives in static HTML and is independent of config —
    // bind it first so it works even if config.json fails to load.
    bindThemeToggle();

    try {
      const resp = await fetch('config.json');
      config = await resp.json();
    } catch (e) {
      document.getElementById('booking-app').innerHTML =
        `<div class="error-state"><p>${t('noConfig')}</p></div>`;
      return;
    }

    // Hydrate from settings cache so the first paint isn't blocked on the
    // ~3s Apps Script round-trip. The fresh fetch (kicked off below)
    // revalidates in the background and only refreshes the UI on a real
    // diff. If there's no cache, loadAvailability fetches settings in
    // parallel with availability and waits for both before rendering.
    const cachedSettings = loadCachedSettings();
    if (cachedSettings) Object.assign(config, cachedSettings);

    currentLang = config.defaultLanguage || 'sr';
    applySiteNames();
    renderShell();

    if (cachedSettings) {
      fetch(config.appsScriptUrl + '?action=settings')
        .then(r => r.json())
        .then(fresh => {
          if (!fresh || fresh.error) return;
          saveCachedSettings(fresh);
          if (settingsEqual(cachedSettings, fresh)) return;
          Object.assign(config, fresh);
          refreshAfterSettingsChange();
        })
        .catch(e => console.error('Settings revalidation failed:', e));
    }

    loadAvailability();
  }

  // Apply the four independently-configurable names from settings:
  // titleName (browser tab), heroName (big headline), footerName (rendered
  // in renderShell), emailName (backend-only). Each falls back to siteName
  // when blank, matching the helpers in Code.gs.
  function applySiteNames() {
    const base = config.siteName || 'Tennis Kosmos';
    const titleName = config.titleName || base;
    const heroName  = config.heroName  || base;

    // Preserve any existing " — subtitle" suffix already in <title>.
    const currentTitle = document.title || '';
    const sepIdx = currentTitle.indexOf(' — ');
    const suffix = sepIdx >= 0 ? currentTitle.slice(sepIdx) : '';
    document.title = titleName + suffix;

    // Hero H1: first word stays wrapped in .accent, rest in plain text.
    // If heroName is a single word, the whole thing is accented.
    const h1 = document.querySelector('.hero h1');
    if (h1) {
      const parts = heroName.trim().split(/\s+/);
      if (parts.length <= 1) {
        h1.innerHTML = `<span class="accent">${escapeHtml(heroName)}</span>`;
      } else {
        const first = parts[0];
        const rest = parts.slice(1).join(' ');
        h1.innerHTML = `<span class="accent">${escapeHtml(first)}</span> ${escapeHtml(rest)}`;
      }
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---- Fetch availability from Apps Script ----
  // On failure (network error, timeout, malformed payload, server error)
  // we show a visible error + retry instead of silently treating every
  // court as free — that fallback was misleading users into booking
  // slots that were actually taken.
  //
  // If settings haven't been loaded yet (cold start with no cache, or a
  // previous settings fetch failed), we kick off the settings fetch in
  // parallel here and wait for both before rendering. Sequential fetches
  // costed ~5s on cold start; parallelizing brings it to max(settings,
  // availability) ≈ ~3s.
  async function loadAvailability() {
    if (currentMode !== 'court') return;
    renderLoading();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    // Hold the loading state visible for at least this long so the user
    // perceives the transition (especially on Retry, where errors can
    // resolve in <50ms and the bouncing-ball flash is otherwise missed).
    const minLoadingDelay = new Promise(r => setTimeout(r, 400));
    const signal = controller.signal;

    const settingsLoad = config.workingHours
      ? Promise.resolve(true)
      : fetch(config.appsScriptUrl + '?action=settings', { signal })
          .then(r => r.json())
          .then(s => {
            if (!s || s.error) return false;
            Object.assign(config, s);
            saveCachedSettings(s);
            applySiteNames();
            renderFooter();
            renderNotice();
            return true;
          })
          .catch(e => { console.error('Settings fetch failed:', e); return false; });

    try {
      const url = config.appsScriptUrl + '?action=availability&days=' + (config.daysAhead || 10);
      const fetchAndParse = fetch(url, { signal }).then(r => r.json());
      const [data, , settingsOk] = await Promise.all([fetchAndParse, minLoadingDelay, settingsLoad]);
      if (data.error) throw new Error(data.error);
      // Without settings the calendar renders all days as unavailable
      // (no workingHours, no courts) — surface this as a load error
      // instead of a misleading empty state.
      if (!settingsOk || !config.workingHours || !config.calendars || !config.calendars.courts) {
        throw new Error('settings unavailable');
      }
      availability = data;
    } catch (e) {
      console.error('Availability fetch failed:', e);
      await minLoadingDelay;
      availability = null;
      renderAvailabilityError();
      return;
    } finally {
      clearTimeout(timeoutId);
    }
    renderCalendar();
    renderSlots();
  }

  function renderAvailabilityError() {
    const pane = document.getElementById('calendar-pane');
    if (pane) {
      pane.innerHTML = `<div class="error-state">
        ${tennisBallSVG(32)}
        <p>${t('availabilityError')}</p>
        <button class="btn-primary error-retry" id="retry-availability">${t('retry')}</button>
      </div>`;
      pane.querySelector('#retry-availability').addEventListener('click', loadAvailability);
    }
    const slotPane = document.getElementById('slot-pane');
    if (slotPane) slotPane.innerHTML = '';
  }

  // ---- Compute bookable slots ----
  function getWorkingHoursForDate(date) {
    const dayName = DAY_NAMES_MAP[date.getDay()];
    const hours = config.workingHours[dayName];
    if (!hours || hours.length === 0) return [];
    return hours;
  }

  // "HH:MM" → minutes from midnight. Returns NaN on bad input.
  function parseTime(timeStr) {
    if (typeof timeStr !== 'string') return NaN;
    const m = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
    if (!m) return NaN;
    const h = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    if (h < 0 || h > 23 || mm < 0 || mm > 59) return NaN;
    return h * 60 + mm;
  }

  function formatTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  // Localised "1h" / "1.5h" / "1,5h" style for booking durations. Decimal
  // separator follows the current language (EN = ".", SR/RU = ",").
  function durationLabel(mins) {
    const decimal = currentLang === 'en' ? '.' : ',';
    if (mins % 60 === 0) return (mins / 60) + 'h';
    const half = (mins % 60 === 30) ? '5' : String(mins % 60);
    return Math.floor(mins / 60) + decimal + half + 'h';
  }

  function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Pull busy intervals for one court on `date`, expressed as
  // {startMin, endMin} from local midnight. Events overlapping the day
  // boundary are clamped.
  function getCourtBusyOfDay(courtNum, date) {
    const busyList = availability.courts?.[courtNum]?.busy;
    if (!busyList || busyList.length === 0) return [];
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEndMin = 1440;
    const out = [];
    for (const b of busyList) {
      const bs = new Date(b.start);
      const be = new Date(b.end);
      let startMin = Math.round((bs - dayStart) / 60000);
      let endMin = Math.round((be - dayStart) / 60000);
      if (endMin <= 0 || startMin >= dayEndMin) continue;
      if (startMin < 0) startMin = 0;
      if (endMin > dayEndMin) endMin = dayEndMin;
      if (endMin > startMin) out.push({ startMin, endMin });
    }
    return out;
  }

  // Slot availability check (matches Code.gs isSlotAvailable_). Candidate
  // must sit within working hours and must not overlap any existing event.
  // A 30-min orphan fragment beside the candidate is allowed — the booking
  // modal nudges users toward filling it but never blocks the booking.
  function isSlotAvailable(busyOfDay, fromMin, toMin, startMin, endMin) {
    if (startMin < fromMin || endMin > toMin) return false;
    for (const b of busyOfDay) {
      if (startMin < b.endMin && endMin > b.startMin) return false; // overlap
    }
    return true;
  }

  // Returns a pair of {beforeGap, afterGap} indicating whether the candidate
  // leaves exactly 30 minutes of unbookable space (the smallest fragment that
  // can never be filled by another booking) between itself and the nearest
  // wall on each side. Both are 0 when there's no orphan.
  function detectOrphan(busyOfDay, fromMin, toMin, startMin, endMin) {
    let prevWall = fromMin;
    for (const b of busyOfDay) {
      if (b.endMin <= startMin && b.endMin > prevWall) prevWall = b.endMin;
    }
    let nextWall = toMin;
    for (const b of busyOfDay) {
      if (b.startMin >= endMin && b.startMin < nextWall) nextWall = b.startMin;
    }
    return {
      beforeGap: startMin - prevWall === 30 ? 30 : 0,
      afterGap: nextWall - endMin === 30 ? 30 : 0,
    };
  }

  // Build the option list shown in the booking-modal nudge. Each suggested
  // alternative must (a) use a valid duration, (b) sit within `range`, (c)
  // not overlap an existing booking, AND (d) be itself orphan-free — we
  // don't want to suggest something that still leaves a 30-min gap on one
  // side, because then the nudge wouldn't have actually helped. "keep" is
  // always the last option and is shown even though it has the orphan
  // (that's the whole point of the nudge).
  function generateCandidates(busyOfDay, range, startMin, durationMin, orphan) {
    // The user's original pick goes first so the form starts on the choice
    // they made — and we flag it as orphan-creating so the chip can carry
    // a warning icon. Every other option is filtered to be orphan-free
    // (we never suggest something that still leaves a 30-min gap).
    const options = [{ kind: 'keep', startMin, durationMin, hasOrphan: true }];
    const tryAdd = (kind, newStart, newDuration) => {
      if (newDuration < MIN_BOOKING_MIN) return;
      if (!DURATION_CHOICES.includes(newDuration)) return;
      const newEnd = newStart + newDuration;
      if (!isSlotAvailable(busyOfDay, range.fromMin, range.toMin, newStart, newEnd)) return;
      const newOrphan = detectOrphan(busyOfDay, range.fromMin, range.toMin, newStart, newEnd);
      if (newOrphan.beforeGap || newOrphan.afterGap) return;
      options.push({ kind, startMin: newStart, durationMin: newDuration, hasOrphan: false });
    };
    // Both-sides orphan: the only "extend" that fully fixes it adds 30 min
    // on each side (start −= 30, duration += 60). Try that first, then the
    // single-side extends — but those will be filtered out by the orphan-
    // free check above when there's still a gap on the other side.
    if (orphan.afterGap && orphan.beforeGap) {
      tryAdd('extend', startMin - 30, durationMin + 60);
    }
    if (orphan.afterGap) tryAdd('extend', startMin, durationMin + 30);
    if (orphan.beforeGap) tryAdd('extend', startMin - 30, durationMin + 30);
    // Shift variants keep the user's chosen duration but move the booking
    // by 30 min so the orphan disappears. Useful when the user picked their
    // duration deliberately and doesn't want to play longer or shorter.
    tryAdd('shiftEarlier', startMin - 30, durationMin);
    tryAdd('shiftLater', startMin + 30, durationMin);
    tryAdd('shortenStartLater', startMin + 30, durationMin - 30);
    tryAdd('shortenEndEarlier', startMin, durationMin - 30);
    return options;
  }

  function getFreeCourtsForSlot(date, startMin, durationMin) {
    // Returns array of court numbers where the candidate slot is valid
    // (no overlap, fits within working hours of THAT court — currently
    // working hours are global, but the call shape is future-proof for
    // per-court hours).
    const wh = getWorkingHoursForDate(date);
    const endMin = startMin + durationMin;
    let range = null;
    for (const r of wh) {
      const f = parseTime(r.from);
      const t = parseTime(r.to);
      if (!isNaN(f) && !isNaN(t) && startMin >= f && endMin <= t) {
        range = { fromMin: f, toMin: t };
        break;
      }
    }
    if (!range) return [];
    const courtNums = Object.keys(config.calendars.courts);
    return courtNums.filter(cn => {
      const busy = getCourtBusyOfDay(cn, date);
      return isSlotAvailable(busy, range.fromMin, range.toMin, startMin, endMin);
    });
  }

  function getSlotsForDate(date, durationMin) {
    const wh = getWorkingHoursForDate(date);
    if (wh.length === 0) return [];

    const now = new Date();
    const isToday = dateKey(date) === dateKey(now);
    const nowMin = isToday ? now.getHours() * 60 + now.getMinutes() : -1;
    const slots = [];

    for (const range of wh) {
      const fromMin = parseTime(range.from);
      const toMin = parseTime(range.to);
      if (isNaN(fromMin) || isNaN(toMin)) continue;

      for (let s = fromMin; s + durationMin <= toMin; s += SLOT_STEP_MIN) {
        // Skip past slots for today
        if (isToday && s <= nowMin) continue;

        const freeCourts = getFreeCourtsForSlot(date, s, durationMin);
        if (freeCourts.length === 0) continue;

        slots.push({ startMin: s, courts: freeCourts });
      }
    }

    return slots;
  }

  function hasAnySlots(date) {
    // Quick check: any minimum-duration slots available today?
    return getSlotsForDate(date, MIN_BOOKING_MIN).length > 0;
  }

  // Look up the price band that contains the given minute-of-day, on
  // the bands that apply to `courtId` (per-court override if present,
  // otherwise the default `courtPrices`). Bands are configured by
  // hour-aligned strings ("17:00") but parseTime also accepts "HH:MM",
  // so half-hour band edges work transparently.
  function getPriceForMinute(minute, courtId) {
    const overrides = config.courtPriceOverrides || {};
    const bands = (courtId != null && overrides[courtId])
      ? overrides[courtId]
      : config.courtPrices;
    for (const p of bands) {
      const from = parseTime(p.from);
      const to = parseTime(p.to);
      if (minute >= from && minute < to) return p;
    }
    return bands[0];
  }

  // Walk 30-min increments inside the booking and sum half-of-hourly-rate
  // per increment. Correct across band boundaries: a 1.5h booking that
  // straddles 17:00 (Day → Evening band) is summed correctly.
  function getTotalPrice(startMin, durationMin, courtId) {
    let total = 0;
    for (let m = startMin; m < startMin + durationMin; m += SLOT_STEP_MIN) {
      total += getPriceForMinute(m, courtId).price / 2;
    }
    return total;
  }

  function formatDateShort(date) {
    const weekday = new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(date);
    // Capitalize first letter
    const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${cap} ${date.getDate()}`;
  }

  function formatMonthYear(year, month) {
    const d = new Date(year, month, 1);
    const name = new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric' }).format(d);
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  function getWeekdayHeaders() {
    // MON TUE WED THU FRI SAT SUN (ISO week start)
    const headers = [];
    // Use a known Monday: 2026-01-05
    for (let i = 0; i < 7; i++) {
      const d = new Date(2026, 0, 5 + i); // Jan 5, 2026 is Monday
      const name = new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(d);
      headers.push(name.toUpperCase());
    }
    return headers;
  }

  // ---- Render shell ----
  function renderShell() {
    const app = document.getElementById('booking-app');
    app.innerHTML = `
      <div class="tabs">
        <button class="tab-btn ${currentMode === 'court' ? 'active' : ''}" data-mode="court">${t('bookCourt')}</button>
        <button class="tab-btn ${currentMode === 'training' ? 'active' : ''}" data-mode="training">${t('requestTraining')}</button>
      </div>
      <div id="calendar-pane"></div>
      <div id="slot-pane"></div>
      <div id="training-pane"></div>
    `;

    app.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentMode = btn.dataset.mode;
        expandedSlot = null;
        renderShell();
        if (currentMode === 'court') {
          if (availability) {
            renderCalendar();
            renderSlots();
          } else {
            loadAvailability();
          }
        } else {
          renderTrainingForm();
        }
      });
    });

    // Theme toggle (lives in static HTML; bind once)
    bindThemeToggle();

    // Language switcher
    const langSwitcher = document.getElementById('lang-switcher');
    if (langSwitcher) {
      langSwitcher.innerHTML = config.languages.map(lang =>
        `<button class="lang-btn ${lang === currentLang ? 'active' : ''}" data-lang="${lang}">${lang.toUpperCase()}</button>`
      ).join('');
      langSwitcher.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentLang = btn.dataset.lang;
          renderShell();
          if (currentMode === 'court') {
            if (availability) {
              renderCalendar();
              renderSlots();
            } else {
              // Either first load hasn't finished or it errored out — re-run
              // the fetch so the new-language loading or error UI shows up.
              loadAvailability();
            }
          } else {
            renderTrainingForm();
          }
          // Update hero
          const tagline = document.querySelector('.tagline');
          if (tagline) tagline.textContent = t('tagline');
        });
      });
    }

    renderFooter();
    renderNotice();
  }

  // Footer is its own element outside #booking-app, so we can refresh it
  // without disturbing the main pane. Called from renderShell on initial
  // render, and from refreshAfterSettingsChange when fresh settings arrive.
  function renderFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer || !config.contact) return;
    const c = config.contact;
    footer.innerHTML = `
      <svg class="footer-court" width="400" height="200" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="200" height="100" rx="4" fill="#c66c4d"/>
        <rect x="10" y="5" width="180" height="90" fill="none" stroke="white" stroke-width="1.5"/>
        <line x1="100" y1="5" x2="100" y2="95" stroke="white" stroke-width="1.5"/>
        <rect x="40" y="5" width="120" height="90" fill="none" stroke="white" stroke-width="1"/>
        <line x1="40" y1="50" x2="160" y2="50" stroke="white" stroke-width="1"/>
      </svg>
      <div class="footer-content">
        <div class="footer-name">${config.footerName || config.siteName || 'Tennis Kosmos'}</div>
        <div class="footer-info">
          ${c.address || c.googleMapsUrl ? '<div class="footer-map">' +
            (c.googleMapsUrl ? '<span class="footer-map-pin">' + mapPinSVG(14) + '</span>' : '') +
            (c.address ? '<span class="footer-map-addr">' + escapeHtml(c.address) + '</span>' : '') +
            (c.googleMapsUrl ? '<span class="footer-map-sep"> · </span><a href="' + c.googleMapsUrl + '" target="_blank" rel="noopener">' + t('openInMap') + '</a>' : '') +
            '</div>' : ''}
          ${c.email ? '<a href="mailto:' + c.email + '">' + c.email + '</a><br>' : ''}
          ${c.phone ? 'Ratko: <a href="tel:' + c.phone.replace(/\s/g, '') + '">' + c.phone + '</a><br>' : ''}
          ${c.phone2 ? 'Ivan: <a href="tel:' + c.phone2.replace(/\s/g, '') + '">' + c.phone2 + '</a><br>' : ''}
          ${c.instagram ? '<a href="https://instagram.com/' + c.instagram.replace('@', '') + '" target="_blank" rel="noopener">' + c.instagram + '</a>' : ''}
        </div>
      </div>
    `;
  }

  // ---- Site notice / scarcity banner ----
  // A single admin-configurable banner (e.g. "tournament coming — fewer
  // courts available, book early") shown on the public site only while the
  // current time sits inside a [from, to] window. The window is evaluated in
  // the club's timezone (config.timezone) so it flips at the intended
  // wall-clock time regardless of the visitor's own timezone. Text is
  // per-language with graceful fallback. Dismissible; the dismissal is
  // remembered per run so editing the dates *or the text* re-shows it to
  // everyone who dismissed the previous version.
  const NOTICE_DISMISS_KEY = 'tk_notice_dismissed';

  // Small stable string hash (djb2). Folded into the dismissal key so that
  // re-wording an active notice mints a new identity and re-surfaces it.
  function noticeHash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  // Current wall-clock time in `tz` as "YYYY-MM-DDTHH:MM". That format sorts
  // lexicographically in chronological order, so it compares directly against
  // the admin's naive datetime-local strings (which are club-local too).
  // Falls back to the visitor's local clock if the timezone is missing or
  // Intl rejects it — good enough, since the audience is overwhelmingly local.
  function nowInTimezone(tz) {
    try {
      if (!tz) throw new Error('no tz');
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
      }).formatToParts(new Date());
      const get = type => (parts.find(p => p.type === type) || {}).value || '';
      let hh = get('hour');
      if (hh === '24') hh = '00'; // some engines emit 24 for midnight
      return `${get('year')}-${get('month')}-${get('day')}T${hh}:${get('minute')}`;
    } catch (e) {
      const d = new Date();
      const p = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    }
  }

  // Best available text: current language → default language → any non-empty.
  function noticeText(notice) {
    const text = (notice && notice.text) || {};
    const order = [currentLang, config.defaultLanguage, 'sr', 'en', 'ru'];
    for (const lang of order) {
      const v = lang && text[lang];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return '';
  }

  function noticeIsActive(notice) {
    if (!notice || !notice.enabled) return false;
    if (!noticeText(notice)) return false;
    const now = nowInTimezone(config.timezone);
    if (notice.from && now < String(notice.from)) return false;
    if (notice.to && now > String(notice.to)) return false;
    return true;
  }

  function megaphoneSVG() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 11v2a1 1 0 0 0 1 1h2l3.5 4.5a1 1 0 0 0 1.8-.6V6.1a1 1 0 0 0-1.8-.6L6 10H4a1 1 0 0 0-1 1z"/>
      <path d="M15 8a4 4 0 0 1 0 8"/>
    </svg>`;
  }

  // Renders (or clears) the banner into #site-notice — a standalone element
  // outside #booking-app, so booking re-renders never disturb it. Safe to
  // call repeatedly; called on first render, on language switch, and when a
  // background settings refresh changes the notice.
  function renderNotice() {
    const mount = document.getElementById('site-notice');
    if (!mount) return;
    const notice = config && config.notice;
    if (!noticeIsActive(notice)) { mount.innerHTML = ''; return; }

    // Dismissal identity — sticks only for this exact run + wording.
    const windowKey = `${notice.from || ''}|${notice.to || ''}|${noticeHash(JSON.stringify(notice.text || {}))}`;
    let dismissed = null;
    try { dismissed = localStorage.getItem(NOTICE_DISMISS_KEY); } catch (e) {}
    if (dismissed === windowKey) { mount.innerHTML = ''; return; }

    mount.innerHTML = `
      <div class="site-notice" role="status">
        <span class="site-notice-icon">${megaphoneSVG()}</span>
        <p class="site-notice-text">${escapeHtml(noticeText(notice))}</p>
        <button type="button" class="site-notice-close" aria-label="${escapeHtml(t('dismiss'))}">&times;</button>
      </div>`;

    const closeBtn = mount.querySelector('.site-notice-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        try { localStorage.setItem(NOTICE_DISMISS_KEY, windowKey); } catch (e) {}
        mount.innerHTML = '';
      });
    }
  }

  // ---- Render loading ----
  function renderLoading() {
    const pane = document.getElementById('calendar-pane');
    if (pane) {
      pane.innerHTML = `<div class="loading-state">
        <div class="ball-bounce">${tennisBallSVG(40)}</div>
        <p>${t('loading')}</p>
      </div>`;
    }
  }

  // ---- Render calendar ----
  function renderCalendar() {
    if (currentMode !== 'court') return;
    if (!availability) return;

    const pane = document.getElementById('calendar-pane');
    if (!pane) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysAhead = config.daysAhead || 10;
    const lastDate = new Date(today);
    lastDate.setDate(lastDate.getDate() + daysAhead - 1);

    const headers = getWeekdayHeaders();

    // Header label: single month when the window fits inside one month,
    // otherwise show both month names so users understand the day tiles
    // cross a month boundary.
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    let headerLabel;
    if (today.getFullYear() === lastDate.getFullYear() && today.getMonth() === lastDate.getMonth()) {
      headerLabel = formatMonthYear(today.getFullYear(), today.getMonth());
    } else {
      const firstMonthName = cap(new Intl.DateTimeFormat(locale(), { month: 'long' }).format(today));
      const lastMonthName = cap(new Intl.DateTimeFormat(locale(), { month: 'long' }).format(lastDate));
      if (today.getFullYear() === lastDate.getFullYear()) {
        headerLabel = `${firstMonthName} – ${lastMonthName} ${lastDate.getFullYear()}`;
      } else {
        headerLabel = `${firstMonthName} ${today.getFullYear()} – ${lastMonthName} ${lastDate.getFullYear()}`;
      }
    }

    let html = `
      <div class="calendar-header">
        <h2>${headerLabel}</h2>
      </div>
      <div class="weekday-row">
        ${headers.map(h => `<div class="weekday-cell">${h}</div>`).join('')}
      </div>
      <div class="calendar-grid">
    `;

    // Align the first day to its weekday column (Mon=0..Sun=6).
    let firstDow = today.getDay() - 1;
    if (firstDow < 0) firstDow = 6;
    for (let i = 0; i < firstDow; i++) {
      html += `<div class="day-cell empty"></div>`;
    }

    // Emit one tile per bookable day, continuously across month boundaries.
    const cursor = new Date(today);
    while (cursor <= lastDate) {
      const isToday = cursor.getTime() === today.getTime();
      const isSelected = selectedDate && dateKey(cursor) === dateKey(selectedDate);
      const d = cursor.getDate();

      let classes = 'day-cell';
      if (isToday) classes += ' today';

      const avail = hasAnySlots(cursor);
      if (avail) {
        classes += ' available';
        if (isSelected) classes += ' selected';
        html += `<div class="${classes}" data-date="${dateKey(cursor)}">${d}</div>`;
      } else {
        classes += ' unavailable';
        html += `<div class="${classes}">${d}</div>`;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    html += `</div>`;
    pane.innerHTML = html;

    pane.querySelectorAll('.day-cell.available').forEach(cell => {
      cell.addEventListener('click', () => {
        const parts = cell.dataset.date.split('-');
        selectedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        expandedSlot = null;
        renderCalendar();
        renderSlots();
      });
    });
  }

  // ---- Render slots ----
  function renderSlots() {
    if (currentMode !== 'court') return;
    const pane = document.getElementById('slot-pane');
    if (!pane) return;

    if (!selectedDate) {
      pane.innerHTML = `<div class="empty-state">
        ${tennisBallSVG(32)}
        <p>${t('selectDay')}</p>
      </div>`;
      return;
    }

    const slots = getSlotsForDate(selectedDate, selectedDuration);
    const currency = getCurrency();

    let html = `
      <div class="slot-section">
        <div class="slot-header">
          <h3>${formatDateShort(selectedDate)}</h3>
          <div class="duration-picker">
            ${DURATION_CHOICES.map(d =>
              `<button class="duration-btn ${d === selectedDuration ? 'active' : ''}" data-dur="${d}">${durationLabel(d)}</button>`
            ).join('')}
          </div>
        </div>
    `;

    if (slots.length === 0) {
      html += `<div class="empty-state">
        ${tennisBallSVG(28)}
        <p>${t('noSlots')}</p>
      </div>`;
    } else {
      html += `<div class="slot-list">`;
      for (const slot of slots) {
        const timeStr = formatTime(slot.startMin);
        const isExpanded = expandedSlot && expandedSlot.startMin === slot.startMin;

        const courtPriceList = slot.courts.map(c => getPriceForMinute(slot.startMin, c).price);
        const minPrice = Math.min.apply(null, courtPriceList);
        const maxPrice = Math.max.apply(null, courtPriceList);
        const priceLabel = minPrice === maxPrice
          ? `${minPrice} ${currency}`
          : `${minPrice}-${maxPrice} ${currency}`;
        const courtLabel = slot.courts.length === 1
          ? `${t('court')} ${slot.courts[0]}`
          : `${t('courts')} ${slot.courts.join(', ')}`;
        html += `<button class="slot-btn ${isExpanded ? 'expanded' : ''}" data-start="${slot.startMin}">
          <span class="slot-time">${timeStr}</span>
          <span class="slot-info"><span class="slot-price">${priceLabel}</span><span class="slot-courts">· ${courtLabel}</span></span>
        </button>`;

        if (isExpanded && slot.courts.length > 1) {
          const pickerPriceDiffers = minPrice !== maxPrice;
          html += `<div class="picker">
            <span class="picker-label">${t('chooseCourt')}</span>
            ${slot.courts.map((c, i) => {
              const label = pickerPriceDiffers
                ? `${t('court')} ${c} - ${courtPriceList[i]} ${currency}`
                : `${t('court')} ${c}`;
              return `<button class="picker-pill" data-court="${c}">${label}</button>`;
            }).join('')}
          </div>`;
        }
      }
      html += `</div>`;
    }

    html += `</div>`;
    pane.innerHTML = html;

    // Duration picker
    pane.querySelectorAll('.duration-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedDuration = parseInt(btn.dataset.dur);
        expandedSlot = null;
        renderSlots();
      });
    });

    // Slot click
    pane.querySelectorAll('.slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const startMin = parseInt(btn.dataset.start);
        const slot = slots.find(s => s.startMin === startMin);

        if (expandedSlot && expandedSlot.startMin === startMin) {
          if (slot.courts.length === 1) {
            openBookingForm(startMin, slot.courts[0]);
            return;
          }
          // Toggle off
          expandedSlot = null;
          renderSlots();
          return;
        }

        // Expand or go straight to form
        if (slot.courts.length === 1) {
          openBookingForm(startMin, slot.courts[0]);
        } else {
          expandedSlot = { startMin };
          renderSlots();
        }
      });
    });

    // Court picker
    pane.querySelectorAll('.picker-pill[data-court]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const court = btn.dataset.court;
        const startMin = expandedSlot.startMin;
        openBookingForm(startMin, court);
      });
    });
  }

  // ---- Booking form modal (court-only) ----
  function openBookingForm(initialStartMin, courtNum) {
    // Mutable candidate that can be swapped from the in-modal nudge chips.
    // Initialized from the slot the user picked in the grid.
    const state = {
      startMin: initialStartMin,
      durationMin: selectedDuration,
    };

    const dateStr = formatDateShort(selectedDate);
    const currency = getCurrency();

    // Compute the orphan-aware option list once. The day's busy data and
    // the working-hours range are stable for the lifetime of the modal, so
    // there's no need to recompute as the user clicks between chips.
    const busy = getCourtBusyOfDay(courtNum, selectedDate);
    const wh = getWorkingHoursForDate(selectedDate);
    const initialEnd = initialStartMin + selectedDuration;
    let range = null;
    for (const r of wh) {
      const f = parseTime(r.from);
      const tEnd = parseTime(r.to);
      if (!isNaN(f) && !isNaN(tEnd) && initialStartMin >= f && initialEnd <= tEnd) {
        range = { fromMin: f, toMin: tEnd };
        break;
      }
    }
    const orphan = range
      ? detectOrphan(busy, range.fromMin, range.toMin, initialStartMin, initialEnd)
      : { beforeGap: 0, afterGap: 0 };
    const candidates = (orphan.beforeGap || orphan.afterGap)
      ? generateCandidates(busy, range, initialStartMin, selectedDuration, orphan)
      : [];

    const summaryParts = () => {
      const timeStr = formatTime(state.startMin);
      const endTimeStr = formatTime(state.startMin + state.durationMin);
      const total = getTotalPrice(state.startMin, state.durationMin, courtNum);
      return [
        `${dateStr}, ${timeStr} – ${endTimeStr}`,
        `${t('court')} ${courtNum}`,
        `${t('total')}: ${total} ${currency}`,
      ];
    };

    const warnIcon = `<svg class="nudge-warn" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M8 1.8 L14.7 14 H1.3 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 6.3 V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="12" r="0.9" fill="currentColor"/></svg>`;
    const renderChip = (opt) => {
      const isSelected = opt.startMin === state.startMin && opt.durationMin === state.durationMin;
      const timeRange = `${formatTime(opt.startMin)} – ${formatTime(opt.startMin + opt.durationMin)}`;
      const cls = ['nudge-option'];
      if (isSelected) cls.push('selected');
      if (opt.hasOrphan) cls.push('has-orphan');
      return `
        <button type="button" class="${cls.join(' ')}"
                data-start="${opt.startMin}" data-duration="${opt.durationMin}"
                role="radio" aria-checked="${isSelected}">${opt.hasOrphan ? warnIcon : ''}${timeRange} · ${durationLabel(opt.durationMin)}</button>
      `;
    };

    const nudgeHtml = candidates.length > 0 ? `
      <div class="booking-nudge">
        <p class="booking-nudge-message">${t('nudgeMessage')}</p>
        <div class="booking-nudge-options" role="radiogroup">
          ${candidates.map(renderChip).join('')}
        </div>
      </div>
    ` : '';

    const overlay = document.createElement('div');
    overlay.className = 'booking-modal-overlay';
    overlay.innerHTML = `
      <div class="booking-modal">
        <button class="modal-close" id="modal-close-btn" aria-label="Close">&times;</button>
        <h4>${t('bookingTitle')}</h4>
        <div class="booking-summary">
          ${summaryParts().map(s => `<div><strong>${s}</strong></div>`).join('')}
        </div>
        ${nudgeHtml}
        <form id="booking-form">
          <div class="form-group">
            <label>${t('name')} *</label>
            <input type="text" name="name" required placeholder="${t('namePlaceholder')}">
          </div>
          <div class="form-group">
            <label>${t('email')} *</label>
            <input type="email" name="email" required placeholder="${t('emailPlaceholder')}">
          </div>
          <div class="form-group">
            <label>${t('phoneOptional')}</label>
            <input type="tel" name="phone" placeholder="${t('phonePlaceholder')}">
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" id="cancel-booking">${t('cancel')}</button>
            <button type="submit" class="btn-primary" id="submit-booking">${t('book')}</button>
          </div>
        </form>
        <div id="form-status" style="display:none;"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    const summaryEl = overlay.querySelector('.booking-summary');
    const chipsEl = overlay.querySelector('.booking-nudge-options');

    const rerenderSummary = () => {
      summaryEl.innerHTML = summaryParts().map(s => `<div><strong>${s}</strong></div>`).join('');
    };
    const rerenderChips = () => {
      if (!chipsEl) return;
      chipsEl.innerHTML = candidates.map(renderChip).join('');
    };

    if (chipsEl) {
      chipsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.nudge-option');
        if (!btn) return;
        const newStart = Number(btn.dataset.start);
        const newDuration = Number(btn.dataset.duration);
        if (newStart === state.startMin && newDuration === state.durationMin) return;
        state.startMin = newStart;
        state.durationMin = newDuration;
        rerenderSummary();
        rerenderChips();
      });
    }

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.getElementById('cancel-booking').addEventListener('click', () => overlay.remove());
    document.getElementById('modal-close-btn').addEventListener('click', () => overlay.remove());

    document.getElementById('booking-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const submitBtn = document.getElementById('submit-booking');

      // Client-side validation: required name and plausible email.
      const nameVal = form.name.value.trim();
      const emailVal = form.email.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      if (!nameVal || !emailOk) {
        form.reportValidity();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = '…';

      const isoDate = dateKey(selectedDate);
      const payload = {
        action: 'book',
        date: isoDate,
        startTime: formatTime(state.startMin),
        durationMinutes: state.durationMin,
        courtId: courtNum,
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        language: currentLang,
        theme: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
      };

      try {
        const resp = await fetch(config.appsScriptUrl, {
          method: 'POST',
          body: JSON.stringify(payload),
          redirect: 'follow',
        });
        const text = await resp.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { error: text }; }

        if (data.status === 'pending') {
          form.style.display = 'none';
          const status = document.getElementById('form-status');
          status.style.display = 'block';
          status.innerHTML = `
            <div class="success-state">
              ${tennisBallSVG(40)}
              <h4></h4>
              <p></p>
            </div>
          `;
          status.querySelector('h4').textContent = t('checkEmail');
          status.querySelector('p').textContent = t('checkEmailDesc');
        } else {
          // Prefer our localized strings; only fall back to server error if present.
          const msg = data.error === 'CONFLICT'
            ? t('slotTaken')
            : (typeof data.error === 'string' && data.error ? data.error : t('bookingError'));
          form.style.display = 'none';
          const status = document.getElementById('form-status');
          status.style.display = 'block';
          status.innerHTML = `
            <div class="error-state">
              ${tennisBallSVG(28)}
              <p></p>
            </div>
          `;
          // textContent — never render server strings as HTML.
          status.querySelector('p').textContent = msg;
        }
      } catch (err) {
        console.error('Booking error:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = t('book');
        document.getElementById('form-status').style.display = 'block';
        document.getElementById('form-status').innerHTML = `
          <div class="error-state"><p>${t('bookingError')}</p></div>
        `;
      }
    });
  }

  // ---- Render training request form ----
  function renderTrainingForm() {
    // In training mode the calendar/slot panes are empty; the request
    // form lives in its own pane. Clear any leftover DOM from the court tab.
    const calPane = document.getElementById('calendar-pane');
    const slotPane = document.getElementById('slot-pane');
    if (calPane) calPane.innerHTML = '';
    if (slotPane) slotPane.innerHTML = '';

    const pane = document.getElementById('training-pane');
    if (!pane) return;

    const pillGroup = (name, keys) => keys.map(([val, tkey]) =>
      `<button type="button" class="request-pill" data-field="${name}" data-value="${val}">${t(tkey)}</button>`
    ).join('');

    pane.innerHTML = `
      <div class="request-section">
        <h3>${t('trainingTitle')}</h3>
        <p class="request-intro">${t('trainingIntro')}</p>
        <form id="request-form" novalidate>
          <div class="form-group">
            <label>${t('name')} *</label>
            <input type="text" name="name" required placeholder="${t('namePlaceholder')}">
          </div>
          <div class="form-group">
            <label>${t('phone')} *</label>
            <input type="tel" name="phone" required placeholder="${t('phonePlaceholder')}">
          </div>
          <div class="form-group">
            <label>${t('email')} *</label>
            <input type="email" name="email" required placeholder="${t('emailPlaceholder')}">
          </div>
          <div class="form-group">
            <label>${t('level')}</label>
            <div class="pill-group" data-group="level">${pillGroup('level', LEVEL_KEYS)}</div>
          </div>
          <div class="form-group">
            <label>${t('rackets')}</label>
            <div class="pill-group" data-group="rackets">${pillGroup('rackets', RACKETS_KEYS)}</div>
          </div>
          <div class="form-group">
            <label>${t('group')}</label>
            <div class="pill-group" data-group="group">${pillGroup('group', GROUP_KEYS)}</div>
          </div>
          <div class="form-group">
            <label>${t('notes')}</label>
            <textarea name="notes" rows="3" placeholder="${t('notesPlaceholder')}"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" id="submit-request">${t('submit')}</button>
          </div>
        </form>
        <div id="request-status" style="display:none;"></div>
      </div>
    `;

    // Pill-group single-select
    pane.querySelectorAll('.pill-group').forEach(group => {
      group.addEventListener('click', (e) => {
        const btn = e.target.closest('.request-pill');
        if (!btn) return;
        e.preventDefault();
        const isActive = btn.classList.contains('active');
        group.querySelectorAll('.request-pill').forEach(b => b.classList.remove('active'));
        if (!isActive) btn.classList.add('active');
      });
    });

    document.getElementById('request-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const submitBtn = document.getElementById('submit-request');

      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const email = form.email.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !phone || !emailOk) {
        // Surface native required/pattern messages if present.
        form.reportValidity();
        return;
      }

      const readPill = (field) => {
        const active = pane.querySelector(`.pill-group[data-group="${field}"] .request-pill.active`);
        return active ? active.dataset.value : '';
      };

      submitBtn.disabled = true;
      submitBtn.textContent = '…';

      const payload = {
        action: 'requestTraining',
        name: name,
        phone: phone,
        email: email,
        level: readPill('level'),
        rackets: readPill('rackets'),
        group: readPill('group'),
        notes: form.notes.value.trim(),
        language: currentLang,
        theme: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
      };

      try {
        const resp = await fetch(config.appsScriptUrl, {
          method: 'POST',
          body: JSON.stringify(payload),
          redirect: 'follow',
        });
        const text = await resp.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { error: text }; }

        if (data.status === 'pending') {
          // Replace the entire pane so the form title/intro/form all disappear
          // — the success card is self-contained. Uses the same X-in-corner
          // close affordance as the court booking modal for consistency.
          pane.innerHTML = `
            <div class="request-section">
              <button class="modal-close" id="training-close-btn" aria-label="Close">&times;</button>
              <div class="success-state">
                ${tennisBallSVG(40)}
                <h4></h4>
                <p></p>
              </div>
            </div>
          `;
          pane.querySelector('h4').textContent = t('checkEmail');
          pane.querySelector('p').textContent = t('checkEmailTraining');
          pane.querySelector('#training-close-btn').addEventListener('click', () => {
            renderTrainingForm();
          });
        } else {
          const msg = typeof data.error === 'string' && data.error ? data.error : t('bookingError');
          // Keep the form visible so the user can correct and retry.
          submitBtn.disabled = false;
          submitBtn.textContent = t('submit');
          const status = document.getElementById('request-status');
          status.style.display = 'block';
          status.innerHTML = `
            <div class="error-state">
              ${tennisBallSVG(28)}
              <p></p>
            </div>
          `;
          status.querySelector('p').textContent = msg;
        }
      } catch (err) {
        console.error('Request error:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = t('submit');
        const status = document.getElementById('request-status');
        if (status) {
          status.style.display = 'block';
          status.innerHTML = `
            <div class="error-state"><p>${t('bookingError')}</p></div>
          `;
        }
      }
    });
  }

  // ---- Boot ----
  document.addEventListener('DOMContentLoaded', init);
})();
