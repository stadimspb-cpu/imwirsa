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

const PORT_DATA = {
  centre: {
    title: "Seafarers' Centre",
    rows: [
      { icon: "🏛", title: "Tallinn Seafarers' Centre", sub: "Sadama 25 · 0.8 km from the terminal", tag: "Open until 20:00", action: "🧭" },
      { icon: "📞", title: "Call the centre", sub: "+372 5555 1234 · English, Russian spoken", action: "📞" },
      { icon: "🧑‍💼", title: "Port Welfare Manager", sub: "Marta Kask · available now", action: "💬" },
      { icon: "🌐", title: "Centre services", sub: "Wi-Fi, lounge, chapel, shop, laundry", action: "›" },
    ],
  },
  transport: {
    title: "Transport",
    rows: [
      { icon: "🚐", title: "Seafarers' Centre shuttle", sub: "Every 2 hours from Gate D · Free", tag: "Next: 14:30", action: "🧭" },
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
};

const state = {
  assistant: null,
  lang: null,
  name: "",
};

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

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const namePart = state.name ? `, ${state.name}` : "";
  document.getElementById("homeAbText").textContent =
    `${timeGreeting}${namePart}! Welcome to Tallinn. The Seafarers' Centre is 0.8 km away, open until 20:00.`;

  document.getElementById("settingsLangVal").textContent =
    (LANGUAGES.find((l) => l.code === state.lang) || {}).flag || "›";
}

function goToScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const target = document.querySelector(`.screen[data-screen="${name}"]`);
  if (target) target.classList.add("active");

  const bottomNav = document.getElementById("bottomNav");
  if (["home", "volunteer", "settings"].includes(name)) {
    bottomNav.style.display = "flex";
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.nav === name));
  } else {
    bottomNav.style.display = "none";
  }

  if (name === "intro" || name === "name" || name === "home" || name === "settings") updateAssistantUI();
}

function openDetail(key) {
  const data = PORT_DATA[key];
  if (!data) return;
  document.getElementById("detailTitle").textContent = data.title;
  document.getElementById("detailList").innerHTML = data.rows.map((r) => `
    <div class="d-row">
      <div class="d-icon">${r.icon}</div>
      <div class="d-body">
        <div class="d-title">${r.title}</div>
        <div class="d-sub">${r.sub}</div>
        ${r.tag ? `<span class="d-tag ${r.tagClosed ? 'closed' : ''}">${r.tag}</span>` : ""}
      </div>
      ${r.action ? `<div class="d-action">${r.action}</div>` : ""}
    </div>
  `).join("");
  goToScreen("detail");
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

document.addEventListener("DOMContentLoaded", () => {
  renderAssistantGrid("assistantGrid", false);
  renderLangGrid("langGrid", false);
  renderAssistantGrid("assistantGridModal", true);
  renderLangGrid("langGridModal", true);

  document.body.addEventListener("click", (e) => {
    const goEl = e.target.closest("[data-go]");
    if (goEl) { goToScreen(goEl.dataset.go); }

    const detailEl = e.target.closest("[data-detail]");
    if (detailEl) { openDetail(detailEl.dataset.detail); }

    const modalEl = e.target.closest("[data-modal]");
    if (modalEl) { openModal(modalEl.dataset.modal); }

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

    if (e.target.id === "nameSave") {
      state.name = document.getElementById("nameInput").value.trim();
    }

    if (e.target.id === "editNameRow" || e.target.closest("#editNameRow")) {
      goToScreen("name");
    }

    if (e.target.id === "chatSend") sendChatMessage();
  });

  document.getElementById("chatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChatMessage();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});
