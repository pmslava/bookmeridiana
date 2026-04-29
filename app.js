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
      chooseCourt: 'Choose a court',
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
      chooseCourt: 'Izaberite teren',
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
      chooseCourt: 'Выберите корт',
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
  let selectedDuration = 1;
  let expandedSlot = null; // { hour } — which slot has court picker open

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

  // ---- Init ----
  async function init() {
    try {
      const resp = await fetch('config.json');
      config = await resp.json();
    } catch (e) {
      document.getElementById('booking-app').innerHTML =
        `<div class="error-state"><p>${t('noConfig')}</p></div>`;
      return;
    }

    // Fetch business rules (prices, hours, contact, etc.) from the Apps Script
    // settings endpoint. config.json carries only the bootstrap URL + language
    // defaults; everything else lives in Script Properties so the friend can
    // edit it from the admin page without touching GitHub.
    try {
      const sResp = await fetch(config.appsScriptUrl + '?action=settings');
      const settings = await sResp.json();
      if (settings && !settings.error) {
        for (const k in settings) config[k] = settings[k];
      }
    } catch (e) {
      console.error('Settings fetch failed:', e);
      // Non-fatal: the availability fetch below will also fail and the UI
      // will render an error state.
    }

    currentLang = config.defaultLanguage || 'sr';

    applySiteNames();
    renderShell();
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
  async function loadAvailability() {
    if (currentMode !== 'court') return;
    renderLoading();
    try {
      const url = config.appsScriptUrl + '?action=availability&days=' + (config.daysAhead || 10);
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      availability = data;
    } catch (e) {
      console.error('Availability fetch failed:', e);
      // Use empty availability so the UI still renders (all slots appear free for demo)
      availability = { courts: {} };
    }
    renderCalendar();
    renderSlots();
  }

  // ---- Compute bookable slots ----
  function getWorkingHoursForDate(date) {
    const dayName = DAY_NAMES_MAP[date.getDay()];
    const hours = config.workingHours[dayName];
    if (!hours || hours.length === 0) return [];
    return hours;
  }

  function parseHour(timeStr) {
    return parseInt(timeStr.split(':')[0], 10);
  }

  function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }


  function isCourtBusy(courtNum, date, hour) {
    // API returns: courts[num].busy = [{start, end}, ...]
    const busyList = availability.courts?.[courtNum]?.busy;
    if (!busyList || busyList.length === 0) return false;
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    return busyList.some(b => {
      const bs = new Date(b.start);
      const be = new Date(b.end);
      return bs < slotEnd && be > slotStart;
    });
  }

  function getFreeCourtsForSlot(date, hour, duration) {
    // Returns array of court numbers that are free for `duration` consecutive hours
    const courtNums = Object.keys(config.calendars.courts);
    return courtNums.filter(cn => {
      for (let h = hour; h < hour + duration; h++) {
        if (isCourtBusy(cn, date, h)) return false;
      }
      return true;
    });
  }

  function getSlotsForDate(date, duration) {
    const wh = getWorkingHoursForDate(date);
    if (wh.length === 0) return [];

    const now = new Date();
    const slots = [];

    for (const range of wh) {
      const fromH = parseHour(range.from);
      const toH = parseHour(range.to);

      for (let h = fromH; h <= toH - duration; h++) {
        // Skip past hours for today
        if (dateKey(date) === dateKey(now) && h <= now.getHours()) continue;

        const freeCourts = getFreeCourtsForSlot(date, h, duration);
        if (freeCourts.length === 0) continue;

        slots.push({ hour: h, courts: freeCourts });
      }
    }

    return slots;
  }

  function hasAnySlots(date) {
    // Quick check: any 1h slots available?
    return getSlotsForDate(date, 1).length > 0;
  }

  function getPriceForHour(hour, courtId) {
    const overrides = config.courtPriceOverrides || {};
    const bands = (courtId != null && overrides[courtId])
      ? overrides[courtId]
      : config.courtPrices;
    for (const p of bands) {
      const from = parseHour(p.from);
      const to = parseHour(p.to);
      if (hour >= from && hour < to) return p;
    }
    return bands[0];
  }

  function getTotalPrice(hour, duration, courtId) {
    let total = 0;
    for (let h = hour; h < hour + duration; h++) {
      total += getPriceForHour(h, courtId).price;
    }
    return total;
  }

  function formatHour(h) {
    return String(h).padStart(2, '0') + ':00';
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
            renderCalendar();
            renderSlots();
          } else {
            renderTrainingForm();
          }
          // Update hero
          const tagline = document.querySelector('.tagline');
          if (tagline) tagline.textContent = t('tagline');
        });
      });
    }

    // Footer from config
    const footer = document.getElementById('site-footer');
    if (footer && config.contact) {
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
            ${[1, 2, 3].map(d =>
              `<button class="duration-btn ${d === selectedDuration ? 'active' : ''}" data-dur="${d}">${d}h</button>`
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
        const timeStr = formatHour(slot.hour);
        const isExpanded = expandedSlot && expandedSlot.hour === slot.hour;

        const courtPriceList = slot.courts.map(c => getPriceForHour(slot.hour, c).price);
        const minPrice = Math.min.apply(null, courtPriceList);
        const maxPrice = Math.max.apply(null, courtPriceList);
        const priceLabel = minPrice === maxPrice
          ? `${minPrice} ${currency}`
          : `${minPrice}-${maxPrice} ${currency}`;
        const courtLabel = slot.courts.length === 1
          ? `${t('court')} ${slot.courts[0]}`
          : `${t('courts')} ${slot.courts.join(', ')}`;
        html += `<button class="slot-btn ${isExpanded ? 'expanded' : ''}" data-hour="${slot.hour}">
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
        const hour = parseInt(btn.dataset.hour);
        const slot = slots.find(s => s.hour === hour);

        if (expandedSlot && expandedSlot.hour === hour) {
          if (slot.courts.length === 1) {
            openBookingForm(hour, slot.courts[0]);
            return;
          }
          // Toggle off
          expandedSlot = null;
          renderSlots();
          return;
        }

        // Expand or go straight to form
        if (slot.courts.length === 1) {
          openBookingForm(hour, slot.courts[0]);
        } else {
          expandedSlot = { hour };
          renderSlots();
        }
      });
    });

    // Court picker
    pane.querySelectorAll('.picker-pill[data-court]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const court = btn.dataset.court;
        const hour = expandedSlot.hour;
        openBookingForm(hour, court);
      });
    });
  }

  // ---- Booking form modal (court-only) ----
  function openBookingForm(hour, courtNum) {
    const timeStr = formatHour(hour);
    const endTimeStr = formatHour(hour + selectedDuration);
    const dateStr = formatDateShort(selectedDate);
    const total = getTotalPrice(hour, selectedDuration, courtNum);
    const currency = getCurrency();

    let summaryParts = [
      `${dateStr}, ${timeStr} – ${endTimeStr}`,
      `${t('court')} ${courtNum}`,
      `${t('total')}: ${total} ${currency}`,
    ];

    const overlay = document.createElement('div');
    overlay.className = 'booking-modal-overlay';
    overlay.innerHTML = `
      <div class="booking-modal">
        <button class="modal-close" id="modal-close-btn" aria-label="Close">&times;</button>
        <h4>${t('bookingTitle')}</h4>
        <div class="booking-summary">
          ${summaryParts.map(s => `<div><strong>${s}</strong></div>`).join('')}
        </div>
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
        startHour: hour,
        durationHours: selectedDuration,
        courtId: courtNum,
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        language: currentLang,
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
