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
      text: "Welcome, Seafarer. The sea has connected people and nations for thousands of years. You are not alone. MWA is here to guide and support you wherever your journey takes you.",
      cta: "CONTINUE",
    },
    onboard: {
      title: "Welcome aboard",
      sub: "Before we begin — choose the assistant you'd like to talk with, and your preferred language.",
      chooseAssistant: "Choose your assistant",
      chooseLanguage: "Choose your language",
      continueBtn: "Continue",
    },
    intro: {
      continueBtn: "Continue",
    },
    name: {
      msg: "One more thing — completely optional. How would you like me to address you? You can skip this at any time.",
      placeholder: "Enter your name or a nickname",
      save: "Save",
      skip: "Skip",
    },
    home: {
      whatDoYouNeed: "What do you need?",
      tapToChat: "Tap to chat →",
      emergencyContacts: "Emergency contacts",
      categories: {
        centre: "Seafarers'<br>Centre",
        transport: "Transport",
        connect: "SIM &<br>Wi-Fi",
        shops: "Shops &<br>Food",
        medical: "Medical",
        safety: "Safety",
      },
      premium: {
        title: "Premium Welfare Services",
        sub: "For active Trade Union or partner club card holders only",
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
      greetingMorning: "Good morning",
      greetingAfternoon: "Good afternoon",
      greetingEvening: "Good evening",
      welcomeToPort: "Welcome to {port}. Tap a category below for local help.",
      tradeUnionSupportName: "Trade Union Support",
      tradeUnionActiveText: "Welcome back{name}! Your Trade Union card is active this month — explore Premium Welfare Services below.",
      tradeUnionInactiveText: "Discover Premium Welfare Services — legal help, extended medical, wellness zone and more. Available to Trade Union card holders.",
    },
    chat: {
      inputPlaceholder: "Type a message…",
    },
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
      unionNotActivated: "Not activated ›",
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
    nav: {
      port: "Port",
      coordinator: "Coordinator",
      settings: "Settings",
      language: "Language",
      assistant: "Assistant",
    },
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
        tag: "General guide",
        greet: "Hello! My name is Alex. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language at any time in Settings. How may I help you today?",
      },
      omar: {
        name: "Omar",
        tag: "Steady & familiar",
        greet: "Hello, my friend. My name is Omar. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language any time in Settings. How may I help you today?",
      },
      sophia: {
        name: "Sophia",
        tag: "Warm & welcoming",
        greet: "Hello! My name is Sophia. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language at any time in Settings. How may I help you today?",
      },
      amina: {
        name: "Amina",
        tag: "Respectful guide",
        greet: "Hello! My name is Amina. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language at any time in Settings. How may I help you today?",
      },
    },
    escalation: {
      alex: "This sounds like something worth talking through with a real person. I can connect you to the IMWIRSA Welfare Coordinator right now, or we can keep talking here — your choice.",
      omar: "My friend, this is something worth speaking about with a real person, not just with me. I can bring in the IMWIRSA Welfare Coordinator right now — or if you'd rather keep talking to me a little longer, that's alright too.",
      sophia: "Thank you for telling me this. It matters, and I want you to talk to someone who can really help — I can connect you with the IMWIRSA Welfare Coordinator right now, or stay here with you a little longer if you'd rather. Whatever feels right.",
      amina: "This is important, and you deserve to speak with someone who can properly help. I can connect you with the IMWIRSA Welfare Coordinator now, if you wish — or, if you prefer, we can continue speaking here. The choice is yours.",
    },
    escalationToggle: {
      continueBtn: "Continue",
      coordinatorBtn: "Coordinator",
    },
    categoryPrompts: {
      centre: "Any questions about the seafarers' centre — opening hours, services, how to get there? Ask me, and I'll bring in the centre's own team if it's something only they can help with.",
      transport: "Need help getting around — shuttle times, taxis, buses? Just ask, I'm right here.",
      connect: "Questions about SIM cards, Wi-Fi, or getting cash? I can walk you through it.",
      shops: "Looking for food, supplies, or a pharmacy nearby? Let me know what you need.",
      medical: "If you're unwell or need medical advice, tell me what's going on and I'll help you find the right care.",
      safety: "Any safety concerns in the port area? I'm listening — let me know.",
      emergency: "If this is urgent, use the contacts below right away. I'm also here if you want to talk it through.",
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
  },

  // ---------------------------------------------------------------
  // RUSSIAN — TODO: replace with real translations.
  // Leave keys empty ({}) until ready; the app will show English
  // for this language until this object is filled in.
  // ---------------------------------------------------------------
  ru: {},

  // ---------------------------------------------------------------
  // TURKISH — TODO: replace with real translations.
  // ---------------------------------------------------------------
  tr: {},

  // ---------------------------------------------------------------
  // FILIPINO — TODO: replace with real translations.
  // ---------------------------------------------------------------
  fil: {},
};

// ---- lookup helpers ---------------------------------------------------

function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

// t("home.whatDoYouNeed") reads the current language (state.lang), and
// falls back to English for any language object that's empty or missing
// that specific key — so partially-translated languages never break.
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

// Returns an assistant persona merged with its translated name/tag/greet
// for the current (or given) language. Visual fields — icon, gradient,
// photo — never change with language, so those stay on ASSISTANTS in
// app.js; only the text fields are looked up here.
function getAssistant(id, lang) {
  const base = ASSISTANTS[id];
  if (!base) return null;
  const useLang = lang || (typeof state !== "undefined" ? state.lang : "en") || "en";
  const langNode = (I18N[useLang] && I18N[useLang].assistants && I18N[useLang].assistants[id]) || {};
  const enNode = I18N.en.assistants[id];
  return {
    ...base,
    name: langNode.name || enNode.name,
    tag: langNode.tag || enNode.tag,
    greet: langNode.greet || enNode.greet,
  };
}

// ---- static "chrome" text ---------------------------------------------
// Walks every element carrying a data-i18n* attribute and fills it from
// the dictionary. Call once on load, and again whenever the language
// changes, to refresh every static label/button/placeholder in one pass.
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
