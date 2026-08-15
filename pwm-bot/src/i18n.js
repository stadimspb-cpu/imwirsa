// Bot UI text. English is the default for coordinators without a saved
// language preference (port staff across Estonia, Germany, Türkiye, Georgia,
// Lithuania, Romania etc. aren't necessarily Russian speakers). Which
// language a given coordinator sees is decided by their own `lang` field in
// the COORDINATORS KV record (see index.js) — "en" or "ru" today, and any
// further language is just another sibling object here, nothing else in
// index.js needs to change.

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

  ru: {
    notRegistered:
      "Вы ещё не зарегистрированы как координатор порта IMWIRSA. " +
      "Свяжитесь с {team}, чтобы вас добавили, и затем снова отправьте /start.",
    chooseGreeting: "Привет, {name} 👋\nО каком порте/терминале речь?",
    chooseType: "Что вы хотите сообщить?",
    chooseSection: "К какому разделу это относится?",
    askDetailText: "Опишите в нескольких предложениях (фото тоже приветствуется).",
    askUrgentText:
      "🆘 Опишите, что происходит, и насколько это срочно. Если нужны действия в течение " +
      "ближайшего часа, свяжитесь с {team} напрямую — этот бот не отслеживаемая SOS-линия.",
    photoOnlyPlaceholder: "(только фото, без описания)",
    photoNoContext: "Сначала отправьте /report, затем прикрепите фото на нужном шаге.",
    cancelled: "Отменено — ничего не отправлено. В любой момент можно снова начать через /report.",
    verifiedThanks: "✅ Спасибо — зафиксировано как подтверждённое актуальное. Больше ничего делать не нужно.",
    sentThanks: "✅ Отправлено — спасибо, {team} рассмотрит и обновит приложение.",
    fallback: "Отправьте /report, чтобы начать новое обновление, или /help — что умеет этот бот.",
    help:
      "<b>Бот IMWIRSA PWM</b>\n\n" +
      "Для портовых координаторов — сообщать об изменениях в карточке порта в MWApp, " +
      "не заполняя анкету заново.\n\n" +
      "/report — начать новое обновление\n" +
      "/cancel — отменить текущее обновление\n" +
      "/help — это сообщение",

    "type.verify": "✅ Данные всё ещё актуальны",
    "type.correction": "✏️ Исправление существующей информации",
    "type.addition": "➕ Добавить что-то новое",
    "type.warning": "⚠️ Предупреждение для других",
    "type.urgent": "🆘 Срочно — закрытие или инцидент сегодня",

    "section.hours": "🕐 Часы работы",
    "section.transport": "🚌 Транспорт / шаттл",
    "section.wifi": "📶 Wi-Fi и связь",
    "section.currency": "💱 Обмен валюты",
    "section.contacts": "☎️ Контакты",
    "section.services": "🛍 Услуги / магазины",
    "section.safety": "🦺 Безопасность",
    "section.other": "❓ Другое",

    "nav.send": "Отправить",
    "nav.cancel": "Отмена",

    "summary.title": "Подтвердите, пожалуйста",
    "summary.port": "Порт",
    "summary.type": "Тип",
    "summary.section": "Раздел",
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
