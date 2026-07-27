// ============================================================
// MWApp — i18n scaffold
//
// "en" is the source of truth. Every other language falls back to
// "en" for any key that's empty or missing, so the app never shows
// a blank string while translations are still in progress.
//
// HOW TO FINISH A TRANSLATION (for a translator, not a developer):
//   1. Find the language block below (ru / tr / fil).
//   2. Fill in the value for each key — copy the structure from
//      "en", keep the key names exactly as they are, translate only
//      the text on the right of each colon.
//   3. Save the file. Nothing else needs to change — every screen
//      pulls its text from here automatically.
//
// SCOPE NOTE: this file covers app "chrome" — buttons, labels,
// assistant persona text, system/escalation messages. It does NOT
// cover port content (hours, contacts, addresses — the PORTS and
// SUBDETAILS objects in app.js). That's real-world data that needs
// a curator/translator per port, and is a separate pass once the
// port data model is finalised.
// ============================================================
const I18N = {
  en: {
    lighthouse: {
      sub: "IMWIRSA presents",
      headline: "Welcome, Seafarer.",
      text: "The sea has connected people and nations for thousands of years. You are not alone. MWApp is here to guide and support you wherever your journey takes you.",
      cta: "CONTINUE",
    },
    onboard: {
      title: "Choose your assistant",
      sub: "We're here to support you every step of the way.",
      chooseAssistant: "Choose your assistant",
      chooseLanguage: "Choose your language",
      continueBtn: "Continue",
    },
    intro: {
      hello: "Hello!",
      imText: "I'm",
      role: "your MWA Assistant.",
      changeLink: "Change assistant or language",
      continueBtn: "Continue",
    },
    name: {
      msg: "One more thing — completely optional. How would you like me to address you? You can skip this at any time.",
      placeholder: "Enter your name or a nickname",
      save: "Save",
      skip: "Skip",
    },
    home: {
      tapToChat: "Tap to chat →",
      heroGreeting: "Welcome to the Port of {port}. Choose a category below for local help, or just ask me.",
      emergencyContacts: "Emergency contacts",
      categories: {
        centre: "Seafarers'<br>Centre",
        transport: "Transport",
        shops: "Shops &<br>Food",
        citylife: "City Life",
        spiritual: "Spiritual<br>Care",
        ask: "Ask the<br>assistant",
      },
      install: {
        title: "Add MWApp to your Home Screen",
        subDefault: "Get one-tap access next time, like a real app.",
        subIOS: "Tap 'Add', then follow 2 quick steps.",
        add: "Add",
      },
      location: {
        title: "Find your port automatically?",
        sub: "Used once, on this device, to detect the nearest port. Never sent to our servers or stored.",
        enable: "Enable",
      },
    },
    // Shared labels used inside Level-3 content blocks.
    common: {
      awaitingData: "Awaiting port data",
      hours: "Hours",
      contacts: "Contacts",
      gettingThere: "Getting there",
      schedule: "Schedule",
      next: "NEXT",
      openInMaps: "Map",
      openMapsBtn: "Open in Maps",
      goodToKnow: "Good to know",
      lastUpdated: "Last updated: {date} · source: Port Welfare Manager",
      qrRefresh: "Refreshes in {s}s",
    },
    status: {
      openUntil: "Open until {time}",
      closedOpensAt: "Closed · opens at {time}",
      closedForToday: "Closed for today",
    },
    chat: { inputPlaceholder: "Type a message…" },
    coordinator: {
      title: "💬 IMWIRSA Welfare Coordinator",
      statusAnonymous: "Anonymous · Available 24/7 ·",
      connecting: "Connecting you with a Coordinator…",
      firstMessage: "Hello, this is Kadri, your IMWIRSA Welfare Coordinator. I'm here to listen — how are you doing today?",
      demoReplies: [
        "Thank you for sharing that. I'm listening — take your time.",
        "That sounds difficult. You're not alone in this, and I'm here with you right now.",
        "Would it help to talk through what's on your mind, or would you prefer some practical suggestions?",
      ],
    },
    settings: {
      title: "Settings",
      subtitleRole: "Your Maritime Welfare Assistant",
      preferences: "Preferences",
      changeAssistant: "Change assistant",
      language: "Language",
      myName: "My name",
      talkToCoordinator: "Talk to IMWIRSA Welfare Coordinator",
      membership: "Membership",
      yourMwaId: "Your MWA-ID",
      unionCard: "Union / Club Card",
      unionActive: "Active this month ✓",
      unionNeedsReconfirm: "Needs reconfirmation ›",
      unionNotConfirmed: "Not confirmed yet ›",
      portLocationDev: "Port & Location (dev preview)",
      detectLocation: "Detect port by location",
      detectLocating: "Locating…",
      detectUpdated: "Updated ✓",
      detectUnavailable: "Unavailable — pick manually below",
      testPort: "Test port",
      context: "Context (auto once GPS is added)",
      contextAtPort: "At the port ›",
      contextInCity: "In the city ›",
      dataPrivacy: "Data & Privacy",
      nameStoredNote: "Your name is stored only on this device",
      clearData: "Clear my data",
      startOver: "Start over (show first launch again)",
      about: "About",
      versionLabel: "MWApp v0.1 (prototype)",
      website: "imwirsa.org",
    },
    nav: { port: "Port", ship: "Ship", settings: "Settings" },
    modals: {
      lang: { title: "Choose your language" },
      assistant: { title: "Choose your assistant" },
      union: {
        title: "Check your card status",
        text1: "This confirms your Trade Union or partner club card is active. Confirmation is required once a month — first on setup, then again on the 1st of every following month.",
        text2: "Demo mode: real-time verification with your union is coming soon. For now, simulate a result below.",
        simActive: "Simulate: card is Active",
        simInactive: "Simulate: card is Not active",
        cancel: "Cancel",
      },
      unionDenied: {
        title: "Premium Welfare Services unavailable",
        text1: "Your Trade Union / club card isn't currently active, so this level isn't available right now. You can keep using everything under <strong>Standard</strong>.",
        text2: "To get or renew a card, contact IMWIRSA support:",
        whatsapp: "💬 WhatsApp +372 5561 3815",
        close: "Close",
      },
      port: { title: "Test port (dev preview)" },
      context: {
        title: "Where is the seafarer right now?",
        text: "This will be detected automatically once GPS is connected. For now, switch manually to preview both states.",
        atPort: "At the port",
        inCity: "In the city",
      },
      iosInstall: {
        title: "Add to Home Screen",
        step1: 'Tap the <strong>Share</strong> button <span class="ios-icon">⬆️</span> in your browser\'s toolbar',
        step2: 'Scroll down and tap <strong>"Add to Home Screen"</strong> <span class="ios-icon">➕</span>',
        step3: 'Tap <strong>"Add"</strong> in the top corner',
        gotIt: "Got it",
      },
      gate: {
        msg: "Available to Trade Union card holders",
        sub: "Contacts and booking unlock once your active Trade Union card is confirmed.",
        confirm: "Confirm card",
      },
    },
    assistants: {
      alex: {
        name: "Alex",
        tag: "I'll help you find information and guidance.",
        greet: "Hello! My name is Alex. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language at any time in Settings. How may I help you today?",
      },
      omar: {
        name: "Omar",
        tag: "I'll make sure you feel supported and informed.",
        greet: "Hello, my friend. My name is Omar. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language any time in Settings. How may I help you today?",
      },
      sophia: {
        name: "Sophia",
        tag: "I'll guide you with care and answer your questions.",
        greet: "Hello! My name is Sophia. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language at any time in Settings. How may I help you today?",
      },
      grace: {
        name: "Grace",
        tag: "I'll support you every step of your journey.",
        greet: "Hello! My name is Grace. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language at any time in Settings. How may I help you today?",
      },
    },
    escalation: {
      alex: "This sounds like something worth talking through with a real person. I can connect you to the IMWIRSA Welfare Coordinator right now, or we can keep talking here — your choice.",
      omar: "My friend, this is something worth speaking about with a real person, not just with me. I can bring in the IMWIRSA Welfare Coordinator right now — or if you'd rather keep talking to me a little longer, that's alright too.",
      sophia: "Thank you for telling me this. It matters, and I want you to talk to someone who can really help — I can connect you with the IMWIRSA Welfare Coordinator right now, or stay here with you a little longer if you'd rather. Whatever feels right.",
      grace: "This is important, and you deserve to speak with someone who can properly help. I can connect you with the IMWIRSA Welfare Coordinator now, if you wish — or, if you prefer, we can continue speaking here. The choice is yours.",
    },
    escalationToggle: { continueBtn: "Continue", coordinatorBtn: "Coordinator" },
    categoryPrompts: {
      centre: "Any questions about the seafarers' centre — opening hours, services, how to get there? Ask me, and I'll bring in the centre's own team if it's something only they can help with.",
      transport: "Need help getting around — shuttle times, taxis, buses, or leaving the port? Just ask, I'm right here.",
      shops: "Looking for food, supplies, a SIM card or a pharmacy nearby? Let me know what you need.",
      citylife: "Thinking of going into the city? I can tell you what's nearby and what's worth knowing before you go.",
      spiritual: "If you'd like to speak with a chaplain, find a quiet place, or simply have someone to talk to — I can help you find who's here.",
      emergency: "If this is urgent, use the contacts below right away. I'm also here if you want to talk it through.",
    },
    askMe: {
      centre: "Not sure where to start? Ask me →",
      transport: "Can't find your ride? Ask me →",
      shops: "Looking for something specific? Ask me →",
      citylife: "Not sure where to go? Ask me →",
      spiritual: "Would you rather just talk? Ask me →",
      emergency: "Need help right now? Ask me →",
      wellness: "Have a question about this? Ask me →",
      default: "Not sure? Ask me →",
    },
    wellness: {
      unlockedIntro: "Welcome back — your Trade Union card is confirmed for this month. Here's what's available to you.",
      lockedIntro: "These are Trade Union member services. To unlock them, please confirm your card status in Settings → Union / Trade Card.",
      roleSuffix: "Trade Union Support",
    },
    demoReplies: [
      "Got it — let me know if you'd like directions or more details on that.",
      "I can help with that. Is there anything else on your mind?",
      "Sure thing. Feel free to ask me anything else about the port or the app.",
    ],
    ship: {
      title: "My Ship",
      introText: "Before you go ashore, mark exactly where your ship is docked. If you're not sure how to get back — especially at night, or if the port has several gates — MWApp will guide you to this exact spot, not just \"the port\".",
      markBtn: "📍 Mark my ship's location",
      markedLabel: "Location marked",
      markedToday: "Today",
      navigateBtn: "🧭 Navigate back to my ship",
      remarkBtn: "Mark a new location",
      errorText: "Couldn't get your location. Please check that location access is allowed for this browser, then try again.",
      privacyNote: "Saved only on this device. Never sent to our servers.",
    },
  },
  // ---------------------------------------------------------------
  // RUSSIAN / TURKISH / FILIPINO — TODO: replace with real translations.
  // Leave keys empty ({}) until ready; the app shows English until filled.
  // ---------------------------------------------------------------
  ru: {},
  tr: {},
  fil: {},
};

// ---- lookup helpers ---------------------------------------------------
function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}
// t("home.tapToChat") reads the current language (state.lang), and falls back
// to English for any language object that's empty or missing that specific
// key — so partially-translated languages never break.
function t(path, vars) {
  const lang = (typeof state !== "undefined" && state.lang) ? state.lang : "en";
  let node = getPath(I18N[lang], path);
  if (node === undefined) node = getPath(I18N.en, path);
  if (typeof node === "string" && vars) {
    Object.keys(vars).forEach((k) => {
      node = node.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]);
    });
  }
  return node;
}
function getAssistant(id, lang) {
  const base = ASSISTANTS[id];
  if (!base) return null;
  const useLang = lang || (typeof state !== "undefined" ? state.lang : "en") || "en";
  const langNode = (I18N[useLang] && I18N[useLang].assistants && I18N[useLang].assistants[id]) || {};
  const enNode = I18N.en.assistants[id];
  return { ...base, name: langNode.name || enNode.name, tag: langNode.tag || enNode.tag, greet: langNode.greet || enNode.greet };
}
const PHOTO_SCREEN_ORDER = [
  "onboardGrid", "introHero", "nameScreen", "homeBubble",
  "chatHeader", "chatHero", "detailHeader", "settings",
];
function getAssistantPhoto(id, screenKey) {
  const base = ASSISTANTS[id];
  if (!base || !base.photos || !base.photos.length) return base ? base.photo : "";
  if (base.photos.length === 1) return base.photos[0];
  const idx = PHOTO_SCREEN_ORDER.indexOf(screenKey);
  const pos = idx === -1 ? 0 : idx % base.photos.length;
  return base.photos[pos];
}
// ---- static "chrome" text ---------------------------------------------
function applyStaticI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const val = t(el.getAttribute("data-i18n"));
    if (val !== undefined) el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const val = t(el.getAttribute("data-i18n-html"));
    if (val !== undefined) el.innerHTML = val;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const val = t(el.getAttribute("data-i18n-placeholder"));
    if (val !== undefined) el.placeholder = val;
  });
}
