// ============================================================
// MWApp prototype — vanilla JS state machine, no build step.
// ============================================================

const ASSISTANTS = {
  alex:   { id: "alex",   name: "Alex",   icon: "⚓", tag: "General guide",     grad: ["#0D6E8A", "#0A5A72"], greet: "Hello! My name is Alex. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language at any time in Settings. How may I help you today?" },
  omar:   { id: "omar",   name: "Omar",   icon: "🧭", tag: "Steady & familiar", grad: ["#1B3A6B", "#B8860B"], greet: "Hello, my friend. My name is Omar. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language any time in Settings. How may I help you today?" },
  sophia: { id: "sophia", name: "Sophia", icon: "⭐", tag: "Warm & welcoming",  grad: ["#5DD3F0", "#0D6E8A"], greet: "Hello! My name is Sophia. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language at any time in Settings. How may I help you today?" },
  amina:  { id: "amina",  name: "Amina",  icon: "🌙", tag: "Respectful guide",  grad: ["#E8523A", "#B8860B"], greet: "Hello! My name is Amina. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language at any time in Settings. How may I help you today?" },
};

const LANGUAGES = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "tr", flag: "🇹🇷", label: "Türkçe" },
  { code: "fil", flag: "🇵🇭", label: "Filipino" },
];

// Placeholder used for fields curators haven't filled in yet via the PWM Telegram bot.
const TBD = "Информация уточняется куратором порта";

// ---- SUB-DETAILS (Level 3) --------------------------------------------
// Rendered by openSubDetail(). type: "hours_contacts" | "schedule" | "note"
const SUBDETAILS = {
  tallinn_centre_main: {
    type: "hours_contacts",
    title: "Tallinn Seafarers' Centre",
    hours: [
      ["Понедельник", "08:00 – 20:00", true], ["Вторник", "08:00 – 20:00"], ["Среда", "08:00 – 20:00"],
      ["Четверг", "08:00 – 20:00"], ["Пятница", "08:00 – 20:00"], ["Суббота", "09:00 – 17:00"], ["Воскресенье", "10:00 – 15:00"],
    ],
    contacts: [
      { icon: "📞", title: "+372 5555 1234", sub: "Основная линия · Рус/Eng", action: "📞" },
      { icon: "💬", title: "WhatsApp", sub: "Написать заранее", action: "💬" },
      { icon: "🧑‍💼", title: "Marta Kask (PWM)", sub: "Куратор порта · доступна сейчас", action: "💬" },
    ],
    directions: [
      { icon: "🚐", title: "Шаттл от причала D", sub: "Каждые 2 часа · бесплатно", action: "›" },
      { icon: "🚶", title: "Пешком: 12 минут", sub: "Sadama tn → поворот у маяка", action: "🗺" },
    ],
  },
  tallinn_transport_shuttle: {
    type: "schedule",
    title: "Shuttle — расписание",
    from: "Отправление от Причала D",
    times: ["09:00", "12:00", "14:30", "17:00", "19:00"],
    nextIndex: 2,
    note: "Стоимость возврата в порт после 20:00 — " + TBD.toLowerCase() + ".",
  },
  wellness_gated: {
    type: "hours_contacts", gated: true,
    title: "Wellness Recovery Zone",
    contacts: [
      { icon: "💆", title: "Массаж 30 мин", sub: "По записи · бесплатно по карте", action: "🧭" },
      { icon: "🧠", title: "Психолог", sub: "+372 5555 9911", action: "📞" },
      { icon: "🧘", title: "Тихая комната", sub: "Открыто сейчас", action: "🧭" },
    ],
  },
};

// ---- PORTS --------------------------------------------------------------
const PORTS = {
  tallinn: {
    meta: { flag: "🇪🇪", name: "Tallinn", sub: "Estonia · Old City Harbour", tz: "UTC+3" },
    categories: {
      centre: {
        title: "Seafarers' Centre",
        rows: [
          { icon: "🏛", title: "Tallinn Seafarers' Centre", sub: "Sadama 25 · 0.8 km from the terminal", tag: "Open until 20:00", action: "🧭", sd: "tallinn_centre_main" },
          { icon: "📞", title: "Call the centre", sub: "+372 5555 1234 · English, Russian spoken", action: "📞" },
          { icon: "🧑‍💼", title: "Port Welfare Manager", sub: "Marta Kask · available now", action: "💬" },
          { icon: "🌐", title: "Centre services", sub: "Wi-Fi, lounge, chapel, shop, laundry", action: "›" },
        ],
      },
      transport: {
        title: "Transport",
        rows: [
          { icon: "🚐", title: "Seafarers' Centre shuttle", sub: "Every 2 hours from Gate D · Free", tag: "Next: 14:30", action: "🧭", sd: "tallinn_transport_shuttle" },
          { icon: "🚕", title: "Taxi", sub: "Bolt, Uber available · ~€5 to city centre", action: "›" },
          { icon: "🚎", title: "City bus", sub: "Route 2 · Stop 300m from the gate", action: "🧭" },
        ],
      },
      connect: {
        title: "SIM & Wi-Fi",
        rows: [
          { icon: "📡", title: "SIM card", sub: "Tele2, Elisa — R-Kiosk at port exit · ~€5 / 3GB", action: "›" },
          { icon: "📶", title: "Port Wi-Fi", sub: "Network: TallinnPort · Password: seafarer2026", action: "📋" },
          { icon: "💱", title: "ATM / currency exchange", sub: "SEB Bank · 400m from the gate · EUR", action: "🧭" },
        ],
      },
      shops: {
        title: "Shops & Food",
        rows: [
          { icon: "🛍", title: "Rimi Supermarket", sub: "600m from the gate · 08:00–22:00", tag: "Open now", action: "🧭" },
          { icon: "☕", title: "Seafarers' Centre café", sub: "Hot meals · lunch ~€6 · free coffee", tag: "Until 19:00", action: "🧭" },
          { icon: "💊", title: "Apotheka Pharmacy", sub: "Sadama 15 · 500m · Mon–Fri 9:00–20:00", tag: "Closed weekends", tagClosed: true, action: "🧭" },
        ],
      },
      medical: {
        title: "Medical",
        rows: [
          { icon: "🏥", title: "Emergency services", sub: "112 · Free · 24/7", action: "📞" },
          { icon: "🩺", title: "Tallinn Medical Clinic", sub: "1.2 km · paid service · English spoken", action: "🧭" },
        ],
      },
      safety: {
        title: "Safety",
        rows: [
          { icon: "🟢", title: "General area risk", sub: "Low risk — normal precautions apply" },
          { icon: "🪪", title: "Port pass", sub: "Seafarer ID required · Gate 1 checkpoint", action: "›" },
          { icon: "⚠️", title: "Notice", sub: "Icy walkways reported near Gate 2 this week" },
        ],
      },
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🏛", title: "Seafarers' Centre", sub: "+372 5555 1234", action: "📞" },
          { icon: "🌐", title: "ISWAN 24/7 Helpline", sub: "+44 20 7283 2922 · Multilingual", action: "📞" },
        ],
      },
      wellness: {
        title: "Wellness Recovery Zone", gated: true,
        rows: [
          { icon: "💆", title: "Relaxation massage — 30 min", sub: "At the Seafarers' Centre · by appointment", tag: "Union card price: Free", action: "🧭", sd: "wellness_gated" },
          { icon: "🧠", title: "Confidential counselling session", sub: "Licensed counsellor · English, Russian", tag: "Union card price: Free", action: "💬", sd: "wellness_gated" },
          { icon: "🧘", title: "Quiet room", sub: "Open now · no booking needed", action: "🧭", sd: "wellness_gated" },
        ],
      },
    },
  },

  constanta: {
    meta: { flag: "🇷🇴", name: "Constanța", sub: "Romania · Port of Constanța", tz: "UTC+2" },
    categories: {
      centre: {
        title: "Seafarers' Centre",
        rows: [
          { icon: "🏛", title: "Seamen's Club Constanța", sub: "Str. Traian 62, Bloc K4 · Constanța", action: "🧭" },
          { icon: "📞", title: "Call the centre", sub: "+40 241 584 800", action: "📞" },
          { icon: "🧑‍💼", title: "Port Welfare Manager", sub: "Olesja Hudu · Seamen's Club Romania", action: "💬" },
          { icon: "🌐", title: "Website", sub: "romania.seamensclub.ro", action: "›" },
        ],
      },
      transport: { title: "Transport", rows: [ { icon: "🚐", title: "Shuttle", sub: "По запросу · бесплатно", action: "🧭" } ] },
      connect: { title: "SIM & Wi-Fi", rows: [ { icon: "ℹ️", title: TBD, sub: "Появится после обновления через Telegram-бот" } ] },
      shops: { title: "Shops & Food", rows: [ { icon: "ℹ️", title: TBD, sub: "Появится после обновления через Telegram-бот" } ] },
      medical: { title: "Medical", rows: [ { icon: "🏥", title: "Emergency services", sub: "112 · Free · 24/7", action: "📞" } ] },
      safety: { title: "Safety", rows: [ { icon: "🟢", title: "General area risk", sub: "Данные уточняются" } ] },
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🏛", title: "Seamen's Club Constanța", sub: "+40 241 584 800", action: "📞" },
        ],
      },
      wellness: { title: "Wellness Recovery Zone", gated: true, rows: [ { icon: "ℹ️", title: TBD, sub: "Партнёрские услуги по профсоюзной карте уточняются" } ] },
    },
  },

  hamburg: {
    meta: { flag: "🇩🇪", name: "Hamburg", sub: "Germany · Port of Hamburg", tz: "UTC+2" },
    categories: {
      centre: {
        title: "Seafarers' Centre",
        rows: [
          { icon: "🏛", title: "Duckdalben International Seamen's Club", sub: "Zellmannstraße 16, Hamburg", action: "🧭" },
          { icon: "📞", title: "Call the centre", sub: "+49 40 740 1661", action: "📞" },
          { icon: "🧑‍💼", title: "Port Welfare Manager", sub: "Husemm Darkou", action: "💬" },
          { icon: "🌐", title: "Website", sub: "duckdalben.de", action: "›" },
        ],
      },
      transport: { title: "Transport", rows: [ { icon: "🚐", title: "Shuttle", sub: "По запросу · бесплатно", action: "🧭" } ] },
      connect: { title: "SIM & Wi-Fi", rows: [ { icon: "ℹ️", title: TBD, sub: "Появится после обновления через Telegram-бот" } ] },
      shops: { title: "Shops & Food", rows: [ { icon: "ℹ️", title: TBD, sub: "Появится после обновления через Telegram-бот" } ] },
      medical: { title: "Medical", rows: [ { icon: "🏥", title: "Emergency services", sub: "112 · Free · 24/7", action: "📞" } ] },
      safety: { title: "Safety", rows: [ { icon: "🟢", title: "General area risk", sub: "Данные уточняются" } ] },
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🏛", title: "Duckdalben Club", sub: "+49 40 740 1661", action: "📞" },
        ],
      },
      wellness: { title: "Wellness Recovery Zone", gated: true, rows: [ { icon: "ℹ️", title: TBD, sub: "Партнёрские услуги по профсоюзной карте уточняются" } ] },
    },
  },

  istanbul: {
    meta: { flag: "🇹🇷", name: "Istanbul", sub: "Türkiye · Haydarpaşa Port", tz: "UTC+3" },
    categories: {
      centre: {
        title: "Seafarers' Centre",
        rows: [
          { icon: "🏛", title: "Istanbul Seafarers' Contact Centre", sub: "Kadıköy / İstanbul · ~2 km", action: "🧭" },
          { icon: "📞", title: "Call the centre", sub: "+90 216 347 3771", action: "📞" },
          { icon: "💬", title: "WhatsApp", sub: "+90 532 657 1252", action: "💬" },
          { icon: "🧑‍💼", title: "Port Welfare Manager", sub: "Kety Kumman", action: "💬" },
        ],
      },
      transport: { title: "Transport", rows: [ { icon: "🚐", title: "Shuttle", sub: "По запросу · бесплатно", action: "🧭" } ] },
      connect: { title: "SIM & Wi-Fi", rows: [ { icon: "ℹ️", title: TBD, sub: "Появится после обновления через Telegram-бот" } ] },
      shops: { title: "Shops & Food", rows: [ { icon: "ℹ️", title: TBD, sub: "Появится после обновления через Telegram-бот" } ] },
      medical: { title: "Medical", rows: [ { icon: "🏥", title: "Emergency services", sub: "112 · Free · 24/7", action: "📞" } ] },
      safety: { title: "Safety", rows: [ { icon: "🟢", title: "General area risk", sub: "Данные уточняются" } ] },
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🏛", title: "Istanbul Seafarers' Contact Centre", sub: "+90 216 347 3771", action: "📞" },
        ],
      },
      wellness: { title: "Wellness Recovery Zone", gated: true, rows: [ { icon: "ℹ️", title: TBD, sub: "Партнёрские услуги по профсоюзной карте уточняются" } ] },
    },
  },
};

function currentPort() { return PORTS[state.portId] || PORTS.tallinn; }
function currentCategories() { return currentPort().categories; }

const state = {
  assistant: null,
  lang: null,
  name: "",
  unionActive: false,
  portId: "tallinn",      // will be set automatically once geolocation is wired in; manual for now
  context: "at_port",     // "at_port" | "in_city" — reserved for the planned geolocation feature
  accessView: "std",      // "std" | "vip" — which toggle is selected on the port card
};

function saveState() {
  try {
    localStorage.setItem("mwapp_state", JSON.stringify(state));
  } catch (e) {}
}
function loadState() {
  try {
    const raw = localStorage.getItem("mwapp_state");
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch (e) {}
}

function gradientStyle(grad) {
  return `background: linear-gradient(135deg, ${grad[0]}, ${grad[1]});`;
}

function renderAssistantGrid(containerId, isModal) {
  const el = document.getElementById(containerId);
  el.innerHTML = Object.values(ASSISTANTS).map((a) => `
    <button class="assistant-card ${state.assistant === a.id ? 'selected' : ''}" data-assistant="${a.id}" data-modal-target="${isModal ? 'assistantModal' : ''}">
      <div class="assistant-avatar" style="${gradientStyle(a.grad)}">${a.icon}</div>
      <div class="assistant-name">${a.name}</div>
      <div class="assistant-tag">${a.tag}</div>
    </button>
  `).join("");
}

function renderLangGrid(containerId, isModal) {
  const el = document.getElementById(containerId);
  el.innerHTML = LANGUAGES.map((l) => `
    <button class="lang-pill ${state.lang === l.code ? 'selected' : ''}" data-lang="${l.code}" data-modal-target="${isModal ? 'langModal' : ''}">
      <span class="lang-flag">${l.flag}</span> ${l.label}
    </button>
  `).join("");
}

function refreshOnboardContinue() {
  const btn = document.getElementById("onboardContinue");
  btn.disabled = !(state.assistant && state.lang);
}

function updateAssistantUI() {
  const a = ASSISTANTS[state.assistant];
  if (!a) return;

  document.getElementById("introAvatar").style.cssText = gradientStyle(a.grad);
  document.getElementById("introAvatar").textContent = a.icon;
  document.getElementById("introName").textContent = a.name;
  document.getElementById("introMsg").textContent = a.greet;

  document.getElementById("nameAvatar").style.cssText = gradientStyle(a.grad);
  document.getElementById("nameAvatar").textContent = a.icon;

  document.getElementById("homeAbAvatar").style.cssText = gradientStyle(a.grad);
  document.getElementById("homeAbAvatar").textContent = a.icon;
  document.getElementById("homeAbName").textContent = a.name;

  document.getElementById("settingsAvatar").style.cssText = gradientStyle(a.grad);
  document.getElementById("settingsAvatar").textContent = a.icon;
  document.getElementById("settingsName").textContent = a.name;

  const port = currentPort();
  document.getElementById("homePortName").textContent = `${port.meta.flag} ${port.meta.name}`;
  document.getElementById("homePortSub").textContent = port.meta.sub;

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const namePart = state.name ? `, ${state.name}` : "";
  document.getElementById("homeAbText").textContent =
    `${timeGreeting}${namePart}! Welcome to ${port.meta.name}. Tap a category below for local help.`;

  document.getElementById("settingsLangVal").textContent =
    (LANGUAGES.find((l) => l.code === state.lang) || {}).flag || "›";

  document.getElementById("premiumBanner").classList.toggle("hidden", !state.unionActive);
  const unionVal = document.getElementById("unionStatusVal");
  if (unionVal) unionVal.textContent = state.unionActive ? "Active ✓" : "Not activated ›";

  document.getElementById("btnAccessStd").classList.toggle("active", !state.unionActive || state.accessView !== "vip");
  document.getElementById("btnAccessVip").classList.toggle("active", state.accessView === "vip");
  document.getElementById("btnAccessVip").classList.toggle("vip", state.accessView === "vip");

  const portSel = document.getElementById("settingsPortVal");
  if (portSel) portSel.textContent = `${port.meta.flag} ${port.meta.name} ›`;
  const ctxVal = document.getElementById("settingsContextVal");
  if (ctxVal) ctxVal.textContent = state.context === "in_city" ? "In the city ›" : "At the port ›";

  saveState();
}

function goToScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const target = document.querySelector(`.screen[data-screen="${name}"]`);
  if (target) target.classList.add("active");

  const bottomNav = document.getElementById("bottomNav");
  if (["home", "volunteer", "settings", "detail", "subdetail"].includes(name)) {
    bottomNav.style.display = "flex";
    document.querySelectorAll(".nav-item[data-nav]").forEach((n) => n.classList.toggle("active", n.dataset.nav === name));
  } else {
    bottomNav.style.display = "none";
  }

  if (name === "intro" || name === "name" || name === "home" || name === "settings") updateAssistantUI();
  if (name === "home") maybeShowInstallBanner();
}

let lastDetailKey = null;

function openDetail(key) {
  const data = currentCategories()[key];
  if (!data) return;
  lastDetailKey = key;
  const port = currentPort();
  const locked = !!data.gated && !state.unionActive;

  document.getElementById("detailCrumbPort").textContent = `← ${port.meta.name}`;
  document.getElementById("detailCrumbLevel").textContent = "Уровень 2";
  document.getElementById("detailTitle").textContent = data.title + (locked ? " 🔒" : "");

  document.getElementById("detailList").innerHTML = data.rows.map((r) => `
    <div class="d-row ${r.sd ? 'clickable' : ''}" ${r.sd ? `data-sd="${r.sd}"` : ""}>
      <div class="d-icon">${r.icon}</div>
      <div class="d-body">
        <div class="d-title">${r.title}</div>
        <div class="d-sub">${r.sub}</div>
        ${r.tag ? `<span class="d-tag ${r.tagClosed ? 'closed' : ''}">${r.tag}</span>` : ""}
        ${r.sd ? `<div class="d-tap-hint">Нажмите для подробностей →</div>` : ""}
      </div>
      ${r.action ? `<div class="d-action">${r.action}</div>` : ""}
    </div>
  `).join("");
  goToScreen("detail");
}

function openSubDetail(sdKey) {
  const sd = SUBDETAILS[sdKey];
  if (!sd) return;
  const port = currentPort();
  const locked = !!sd.gated && !state.unionActive;

  document.getElementById("subdetailCrumbPort").textContent = `← ${port.meta.name}`;
  document.getElementById("subdetailTitle").textContent = sd.title;

  let bodyHtml = "";
  if (sd.type === "hours_contacts") {
    let inner = "";
    if (sd.hours) {
      inner += `<div class="sd-card"><div class="sd-card-title">🕐 Часы работы</div><table class="hours-table">` +
        sd.hours.map(([day, time, today]) => `<tr class="${today ? 'hours-today' : ''}"><td>${day}</td><td>${time}</td></tr>`).join("") +
        `</table></div>`;
    }
    if (sd.contacts) {
      inner += `<div class="sd-card"><div class="sd-card-title">📞 Контакты</div>` +
        sd.contacts.map((c) => `<div class="contact-row"><div class="c-icon">${c.icon}</div><div class="c-body"><div class="c-title">${c.title}</div><div class="c-sub">${c.sub}</div></div>${c.action ? `<div class="c-action">${c.action}</div>` : ""}</div>`).join("") +
        `</div>`;
    }
    if (sd.directions) {
      inner += `<div class="sd-card"><div class="sd-card-title">📍 Как добраться</div>` +
        sd.directions.map((c) => `<div class="contact-row"><div class="c-icon">${c.icon}</div><div class="c-body"><div class="c-title">${c.title}</div><div class="c-sub">${c.sub}</div></div>${c.action ? `<div class="c-action">${c.action}</div>` : ""}</div>`).join("") +
        `</div>`;
    }
    bodyHtml = wrapGate(inner, locked, sd);
  } else if (sd.type === "schedule") {
    let inner = `<div class="sd-card"><div class="sd-card-title">${sd.from}</div>` +
      sd.times.map((t, i) => `<div class="sched-row ${i === sd.nextIndex ? 'next' : ''}"><span>${t}</span>${i === sd.nextIndex ? '<span class="sched-tag">БЛИЖАЙШИЙ</span>' : ''}</div>`).join("") +
      `</div>`;
    if (sd.note) inner += `<div class="sd-card"><div class="sd-card-title">ℹ️ Уточняется</div><div class="sd-note">${sd.note}</div></div>`;
    bodyHtml = wrapGate(inner, locked, sd);
  }

  document.getElementById("subdetailBody").innerHTML = bodyHtml;
  goToScreen("subdetail");
}

function wrapGate(innerHtml, locked, sd) {
  if (!locked) return innerHtml;
  return `<div class="gate-wrap">
    <div class="gate-blur">${innerHtml}</div>
    <div class="gate-overlay">
      <div class="gate-lock">🔒</div>
      <div class="gate-msg">Доступно держателям профсоюзной карты</div>
      <div class="gate-sub">Контакты и запись открываются после подтверждения действующей карты профсоюза.</div>
      <button class="gate-btn" data-modal="unionModal">Подтвердить карту</button>
    </div>
  </div>`;
}

function openModal(id) {
  document.getElementById(id).classList.add("open");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

const CHAT_REPLIES = [
  "Thank you for sharing that. I'm listening — take your time.",
  "That sounds difficult. You're not alone in this, and I'm here with you right now.",
  "Would it help to talk through what's on your mind, or would you prefer some practical suggestions?",
];
let chatReplyIndex = 0;

function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  const body = document.getElementById("chatBody");
  body.insertAdjacentHTML("beforeend", `<div class="chat-msg me">${text}</div>`);
  input.value = "";
  body.scrollTop = body.scrollHeight;
  setTimeout(() => {
    const reply = CHAT_REPLIES[chatReplyIndex % CHAT_REPLIES.length];
    chatReplyIndex++;
    body.insertAdjacentHTML("beforeend", `<div class="chat-msg them">${reply}</div>`);
    body.scrollTop = body.scrollHeight;
  }, 900);
}

let deferredInstallPrompt = null;

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function maybeShowInstallBanner() {
  if (isStandalone()) return;
  if (localStorage.getItem("mwapp_install_dismissed") === "1") return;
  const banner = document.getElementById("installBanner");
  const sub = document.getElementById("installSub");
  if (isIOS()) {
    sub.textContent = "Tap 'Add', then follow 2 quick steps.";
    banner.classList.remove("hidden");
  } else if (deferredInstallPrompt) {
    sub.textContent = "Get one-tap access next time, like a real app.";
    banner.classList.remove("hidden");
  }
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  maybeShowInstallBanner();
});

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  renderAssistantGrid("assistantGrid", false);
  renderLangGrid("langGrid", false);
  renderAssistantGrid("assistantGridModal", true);
  renderLangGrid("langGridModal", true);
  refreshOnboardContinue();

  if (state.assistant && state.lang) {
    // Returning user — first-launch screens are shown once in a lifetime only.
    goToScreen("home");
  }

  document.body.addEventListener("click", (e) => {
    if (e.target.id === "nameSave") {
      state.name = document.getElementById("nameInput").value.trim();
    }

    const goEl = e.target.closest("[data-go]");
    if (goEl) { goToScreen(goEl.dataset.go); }

    const detailEl = e.target.closest("[data-detail]");
    if (detailEl) { openDetail(detailEl.dataset.detail); }

    const sdEl = e.target.closest("[data-sd]");
    if (sdEl) { openSubDetail(sdEl.dataset.sd); }

    const modalEl = e.target.closest("[data-modal]");
    if (modalEl) { openModal(modalEl.dataset.modal); }

    const accessEl = e.target.closest("[data-access]");
    if (accessEl) {
      const view = accessEl.dataset.access;
      if (view === "vip" && !state.unionActive) {
        openModal("unionModal");
      } else {
        state.accessView = view;
        updateAssistantUI();
      }
    }

    const portEl = e.target.closest("[data-port]");
    if (portEl) {
      state.portId = portEl.dataset.port;
      updateAssistantUI();
      closeModal("portModal");
    }

    const ctxEl = e.target.closest("[data-context]");
    if (ctxEl) {
      state.context = ctxEl.dataset.context;
      updateAssistantUI();
      closeModal("contextModal");
    }

    const assistantEl = e.target.closest("[data-assistant]");
    if (assistantEl) {
      state.assistant = assistantEl.dataset.assistant;
      renderAssistantGrid("assistantGrid", false);
      renderAssistantGrid("assistantGridModal", true);
      refreshOnboardContinue();
      updateAssistantUI();
      if (assistantEl.dataset.modalTarget) closeModal(assistantEl.dataset.modalTarget);
    }

    const langEl = e.target.closest("[data-lang]");
    if (langEl) {
      state.lang = langEl.dataset.lang;
      renderLangGrid("langGrid", false);
      renderLangGrid("langGridModal", true);
      refreshOnboardContinue();
      updateAssistantUI();
      if (langEl.dataset.modalTarget) closeModal(langEl.dataset.modalTarget);
    }

    if (e.target === document.getElementById("langModal")) closeModal("langModal");
    if (e.target === document.getElementById("assistantModal")) closeModal("assistantModal");
    if (e.target === document.getElementById("portModal")) closeModal("portModal");
    if (e.target === document.getElementById("contextModal")) closeModal("contextModal");

    if (e.target.id === "editNameRow" || e.target.closest("#editNameRow")) {
      goToScreen("name");
    }

    if (e.target.id === "unionRow" || e.target.closest("#unionRow")) {
      if (state.unionActive) {
        document.getElementById("unionModalTitle").textContent = "Your Union Card is active";
        document.getElementById("unionModalText").textContent = "Premium Welfare Services, including the Wellness Recovery Zone, are unlocked on your device.";
        document.getElementById("unionActivateBtn").classList.add("hidden");
      } else {
        document.getElementById("unionModalTitle").textContent = "Activate your Union Card";
        document.getElementById("unionModalText").textContent = "Union and club card members get access to Premium Welfare Services, including the Wellness Recovery Zone — local massage, physiotherapy and counselling near the seafarers' centre.";
        document.getElementById("unionActivateBtn").classList.remove("hidden");
      }
      openModal("unionModal");
    }

    if (e.target.id === "unionActivateBtn") {
      state.unionActive = true;
      updateAssistantUI();
      closeModal("unionModal");
    }

    if (e.target.id === "unionCloseBtn") {
      closeModal("unionModal");
    }

    if (e.target.id === "resetAppRow" || e.target.closest("#resetAppRow")) {
      localStorage.removeItem("mwapp_state");
      location.reload();
    }

    if (e.target.id === "installBtn") {
      if (isIOS()) {
        openModal("iosInstallModal");
      } else if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.finally(() => {
          deferredInstallPrompt = null;
          document.getElementById("installBanner").classList.add("hidden");
        });
      }
    }

    if (e.target.id === "installCloseBtn") {
      document.getElementById("installBanner").classList.add("hidden");
      localStorage.setItem("mwapp_install_dismissed", "1");
    }

    if (e.target.id === "iosInstallCloseBtn") {
      closeModal("iosInstallModal");
      document.getElementById("installBanner").classList.add("hidden");
      localStorage.setItem("mwapp_install_dismissed", "1");
    }

    if (e.target === document.getElementById("unionModal")) closeModal("unionModal");

    if (e.target.id === "chatSend") sendChatMessage();
  });

  document.getElementById("chatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChatMessage();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});
