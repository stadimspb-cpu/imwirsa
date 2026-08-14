// Bot UI text. English by default — coordinators are local port staff in
// Estonia, Germany, Türkiye, Georgia, Lithuania, Romania etc., not
// necessarily Russian speakers, so English is the safer shared default
// (same reasoning MWApp uses for seafarers). Structured the same way as
// mwapp-prototype/js/i18n.js so a RU (or other) translation is just adding
// a sibling object — nothing else in index.js needs to change.

export const DEFAULT_LANG = "en";

const STRINGS = {
  en: {
    notRegistered:
      "You're not registered as an IMWIRSA port coordinator yet. " +
      "Contact {team} to get set up, then send /start again.",
    chooseGreeting: "Hi {name} 👋\nWhich port/terminal is this about?",
    chooseType: "What would you like to report?",
    chooseSection: "Which part of the listing does this concern?",
    askDetailText: "Go ahead — describe it in a few sentences (a photo is welcome too).",
    askUrgentText:
      "🆘 Describe what's happening and how urgent it is. If this needs action in the " +
      "next hour, also contact {team} directly — this bot is not a monitored SOS line.",
    photoOnlyPlaceholder: "(photo only, no description provided)",
    photoNoContext: "Send /report first, then attach your photo at the right step.",
    cancelled: "Cancelled — nothing was sent. Send /report to start again anytime.",
    verifiedThanks: "✅ Thanks — logged as confirmed current. That's it, no further steps needed.",
    sentThanks: "✅ Sent — thank you, {team} will review it and update the app.",
    fallback: "Send /report to start a new update, or /help for what this bot does.",
    help:
      "<b>IMWIRSA PWM Bot</b>\n\n" +
      "For port coordinators to report changes to their port's MWApp listing " +
      "without re-filling the full questionnaire.\n\n" +
      "/report — start a new update\n" +
      "/cancel — cancel the update in progress\n" +
      "/help — this message",

    "type.verify": "✅ Data is still accurate",
    "type.correction": "✏️ Correction to existing info",
    "type.addition": "➕ Something new to add",
    "type.warning": "⚠️ Warning / heads-up for others",
    "type.urgent": "🆘 Urgent — closure or incident today",

    "section.hours": "🕐 Hours",
    "section.transport": "🚌 Transport / shuttle",
    "section.wifi": "📶 Wi-Fi & connectivity",
    "section.currency": "💱 Currency exchange",
    "section.contacts": "☎️ Contacts",
    "section.services": "🛍 Services / shops",
    "section.safety": "🦺 Safety",
    "section.other": "❓ Other",

    "nav.send": "Send",
    "nav.cancel": "Cancel",

    "summary.title": "Please confirm",
    "summary.port": "Port",
    "summary.type": "Type",
    "summary.section": "Section",
  },
};

export function t(lang, key, vars = {}) {
  const dict = STRINGS[lang] || STRINGS[DEFAULT_LANG];
  let str = dict[key] ?? STRINGS[DEFAULT_LANG][key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replaceAll(`{${k}}`, v);
  }
  return str;
}
