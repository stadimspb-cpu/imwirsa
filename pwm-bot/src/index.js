/**
 * IMWIRSA PWM Bot — Cloudflare Worker
 * ------------------------------------------------------------------
 * A Telegram bot for Port Welfare coordinators to report changes,
 * corrections, additions and warnings about their port's MWApp data —
 * without re-filling the full onboarding questionnaire each time.
 *
 * Deliberately NOT a replacement for MWApp (that idea was already
 * considered and rejected — see mwapp-prototype/ROADMAP.md). This bot
 * has a different audience (coordinators, not seafarers) and a
 * different job (fast structured field reports, not a welfare chat).
 *
 * Deliberately NOT full auto-sync into the live port JSON files either.
 * Every report is a human-readable message that lands in Andrey's
 * Telegram + inbox for review before anything changes in the app —
 * "one tap instead of refilling the questionnaire", not an unattended
 * pipeline. Direct-write-to-GitHub is a possible future upgrade (see
 * README) once report volume justifies the extra complexity — the same
 * "start manual, automate later" pattern used for Premium codes.
 *
 * ── Required Cloudflare setup (see README.md) ──────────────────────
 * - KV namespace SESSIONS   (per-chat conversation state, short TTL)
 * - KV namespace COORDINATORS (telegram user id → {name, ports[], lang})
 * - Secret TELEGRAM_BOT_TOKEN
 * - Secret RESEND_API_KEY
 * - Var    ADMIN_CHAT_ID      (Andrey's own Telegram chat id)
 * - Var    NOTIFY_EMAIL       (e.g. info@imwirsa.org)
 * - Var    RESEND_FROM        (e.g. PWM Bot <pwm@imwirsa.org>)
 */

import { PORTS } from "./ports.js";
import { t, DEFAULT_LANG } from "./i18n.js";

const SESSION_TTL_SECONDS = 60 * 60 * 6; // 6h — a field report shouldn't span longer than that

// ---------------------------------------------------------------- utils

function tg(env, method) {
  return `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`;
}

async function tgCall(env, method, payload) {
  const res = await fetch(tg(env, method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("Telegram API error", method, await res.text());
  }
  return res;
}

function sendMessage(env, chatId, text, extra = {}) {
  return tgCall(env, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}

function answerCallback(env, callbackQueryId, text) {
  return tgCall(env, "answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false,
  });
}

function kbRow(buttons) {
  return buttons.map(([text, data]) => ({ text, callback_data: data }));
}

async function getSession(env, chatId) {
  const raw = await env.SESSIONS.get(`session:${chatId}`);
  return raw ? JSON.parse(raw) : null;
}

async function setSession(env, chatId, session) {
  await env.SESSIONS.put(`session:${chatId}`, JSON.stringify(session), {
    expirationTtl: SESSION_TTL_SECONDS,
  });
}

async function clearSession(env, chatId) {
  await env.SESSIONS.delete(`session:${chatId}`);
}

async function getCoordinator(env, userId) {
  const raw = await env.COORDINATORS.get(`coord:${userId}`);
  return raw ? JSON.parse(raw) : null;
}

// ---------------------------------------------------------------- menus

function portMenu(coordinator, lang) {
  const ids = coordinator.ports && coordinator.ports.length ? coordinator.ports : Object.keys(PORTS);
  const rows = [];
  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    const meta = PORTS[id];
    if (!meta) continue;
    const label = `${meta.flag} ${meta.city} — ${meta.terminal}`;
    rows.push([{ text: label, callback_data: `port:${id}` }]);
  }
  return { inline_keyboard: rows };
}

function typeMenu(lang) {
  return {
    inline_keyboard: [
      kbRow([[t(lang, "type.verify"), "type:verify"]]),
      kbRow([[t(lang, "type.correction"), "type:correction"]]),
      kbRow([[t(lang, "type.addition"), "type:addition"]]),
      kbRow([[t(lang, "type.warning"), "type:warning"]]),
      kbRow([[t(lang, "type.urgent"), "type:urgent"]]),
      kbRow([[t(lang, "nav.cancel"), "nav:cancel"]]),
    ],
  };
}

function sectionMenu(lang) {
  const sections = [
    ["hours", "section.hours"],
    ["transport", "section.transport"],
    ["wifi", "section.wifi"],
    ["currency", "section.currency"],
    ["contacts", "section.contacts"],
    ["services", "section.services"],
    ["safety", "section.safety"],
    ["other", "section.other"],
  ];
  const rows = [];
  for (let i = 0; i < sections.length; i += 2) {
    const pair = sections.slice(i, i + 2).map(([id, key]) => [t(lang, key), `section:${id}`]);
    rows.push(kbRow(pair));
  }
  rows.push(kbRow([[t(lang, "nav.cancel"), "nav:cancel"]]));
  return { inline_keyboard: rows };
}

function confirmMenu(lang) {
  return {
    inline_keyboard: [
      kbRow([
        [t(lang, "nav.send"), "nav:send"],
        [t(lang, "nav.cancel"), "nav:cancel"],
      ]),
    ],
  };
}

// ---------------------------------------------------------------- flow

async function startFlow(env, chatId, userId, lang) {
  const coordinator = await getCoordinator(env, userId);
  if (!coordinator) {
    await sendMessage(env, chatId, t(lang, "notRegistered"));
    return;
  }
  await setSession(env, chatId, { step: "port", coordinator, data: {} });
  await sendMessage(env, chatId, t(lang, "chooseGreeting", { name: coordinator.name }), {
    reply_markup: portMenu(coordinator, lang),
  });
}

function fieldLabel(lang, sectionId) {
  return t(lang, `section.${sectionId}`);
}

function summaryText(lang, session) {
  const { data } = session;
  const port = PORTS[data.portId];
  const lines = [
    `<b>${t(lang, "summary.title")}</b>`,
    "",
    `${t(lang, "summary.port")}: ${port.flag} ${port.city} — ${port.terminal}`,
    `${t(lang, "summary.type")}: ${t(lang, `type.${data.type}`)}`,
  ];
  if (data.section) lines.push(`${t(lang, "summary.section")}: ${fieldLabel(lang, data.section)}`);
  if (data.text) lines.push("", data.text);
  return lines.join("\n");
}

async function notifyAdmin(env, session, coordinator) {
  const { data } = session;
  const port = PORTS[data.portId];
  const now = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

  const typeLabels = {
    verify: "✅ DATA CONFIRMED CURRENT",
    correction: "✏️ CORRECTION",
    addition: "➕ ADDITION",
    warning: "⚠️ WARNING",
    urgent: "🆘 URGENT — needs attention today",
  };

  const header = typeLabels[data.type] || data.type.toUpperCase();
  const bodyLines = [
    `Port: ${port.flag} ${port.city} — ${port.terminal} (${data.portId})`,
    `Coordinator: ${coordinator.name}${coordinator.telegramUsername ? " @" + coordinator.telegramUsername : ""}`,
    `When: ${now}`,
  ];
  if (data.section) bodyLines.push(`Section: ${fieldLabel("en", data.section)}`);
  if (data.text) bodyLines.push("", data.text);

  const telegramText = [`<b>${header}</b>`, ...bodyLines].join("\n");
  const emailText = [header, ...bodyLines].join("\n");

  if (env.ADMIN_CHAT_ID) {
    await sendMessage(env, env.ADMIN_CHAT_ID, telegramText);
  }

  if (env.RESEND_API_KEY && env.NOTIFY_EMAIL) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM || "PWM Bot <pwm@imwirsa.org>",
        to: [env.NOTIFY_EMAIL],
        subject: `[PWM] ${header} — ${port.city} ${port.terminal}`,
        text: emailText,
      }),
    }).catch((err) => console.error("Resend error", err));
  }
}

// ---------------------------------------------------------------- update handlers

async function handleCallback(env, update) {
  const cb = update.callback_query;
  const chatId = cb.message.chat.id;
  const userId = cb.from.id;
  const lang = DEFAULT_LANG;
  const data = cb.data;

  await answerCallback(env, cb.id, "");

  let session = await getSession(env, chatId);
  if (!session) {
    const coordinator = await getCoordinator(env, userId);
    if (!coordinator) {
      await sendMessage(env, chatId, t(lang, "notRegistered"));
      return;
    }
    session = { step: "port", coordinator, data: {} };
  }

  if (data === "nav:cancel") {
    await clearSession(env, chatId);
    await sendMessage(env, chatId, t(lang, "cancelled"));
    return;
  }

  if (data.startsWith("port:")) {
    session.data.portId = data.slice("port:".length);
    session.step = "type";
    await setSession(env, chatId, session);
    await sendMessage(env, chatId, t(lang, "chooseType"), { reply_markup: typeMenu(lang) });
    return;
  }

  if (data.startsWith("type:")) {
    const type = data.slice("type:".length);
    session.data.type = type;

    if (type === "verify") {
      await notifyAdmin(env, session, session.coordinator);
      await clearSession(env, chatId);
      await sendMessage(env, chatId, t(lang, "verifiedThanks"));
      return;
    }

    session.step = "section";
    await setSession(env, chatId, session);
    await sendMessage(env, chatId, t(lang, "chooseSection"), { reply_markup: sectionMenu(lang) });
    return;
  }

  if (data.startsWith("section:")) {
    session.data.section = data.slice("section:".length);
    session.step = "text";
    await setSession(env, chatId, session);
    const prompt =
      session.data.type === "urgent" ? t(lang, "askUrgentText") : t(lang, "askDetailText");
    await sendMessage(env, chatId, prompt);
    return;
  }

  if (data === "nav:send") {
    await notifyAdmin(env, session, session.coordinator);
    await clearSession(env, chatId);
    await sendMessage(env, chatId, t(lang, "sentThanks"));
    return;
  }
}

async function handleMessage(env, update) {
  const msg = update.message;
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const lang = DEFAULT_LANG;
  const text = (msg.text || "").trim();

  if (text === "/start" || text === "/report") {
    await startFlow(env, chatId, userId, lang);
    return;
  }

  if (text === "/cancel") {
    await clearSession(env, chatId);
    await sendMessage(env, chatId, t(lang, "cancelled"));
    return;
  }

  if (text === "/help") {
    await sendMessage(env, chatId, t(lang, "help"));
    return;
  }

  const session = await getSession(env, chatId);

  if (session && session.step === "text") {
    session.data.text = text;
    session.step = "confirm";
    await setSession(env, chatId, session);
    await sendMessage(env, chatId, summaryText(lang, session), { reply_markup: confirmMenu(lang) });
    return;
  }

  await sendMessage(env, chatId, t(lang, "fallback"));
}

async function handlePhoto(env, update) {
  const msg = update.message;
  const chatId = msg.chat.id;
  const lang = DEFAULT_LANG;
  const session = await getSession(env, chatId);

  if (!session || session.step !== "text") {
    await sendMessage(env, chatId, t(lang, "photoNoContext"));
    return;
  }

  const fileId = msg.photo[msg.photo.length - 1].file_id;
  session.data.photoFileId = fileId;
  session.data.text = (msg.caption || session.data.text || "").trim() || t(lang, "photoOnlyPlaceholder");
  session.step = "confirm";
  await setSession(env, chatId, session);

  if (env.ADMIN_CHAT_ID) {
    await tgCall(env, "forwardMessage", {
      chat_id: env.ADMIN_CHAT_ID,
      from_chat_id: chatId,
      message_id: msg.message_id,
    });
  }

  await sendMessage(env, chatId, summaryText(lang, session), { reply_markup: confirmMenu(lang) });
}

// ---------------------------------------------------------------- entry point

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/webhook") {
      let update;
      try {
        update = await request.json();
      } catch {
        return new Response("bad request", { status: 400 });
      }

      try {
        if (update.callback_query) {
          await handleCallback(env, update);
        } else if (update.message && update.message.photo) {
          await handlePhoto(env, update);
        } else if (update.message) {
          await handleMessage(env, update);
        }
      } catch (err) {
        console.error("Handler error", err);
      }

      return new Response("ok");
    }

    if (request.method === "GET" && url.pathname === "/register-webhook") {
      const target = url.searchParams.get("url");
      if (!target) return new Response("missing ?url=", { status: 400 });
      const res = await fetch(tg(env, "setWebhook"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      return new Response(await res.text(), { headers: { "Content-Type": "application/json" } });
    }

    return new Response("IMWIRSA PWM Bot — see README.md for setup.", { status: 200 });
  },
};
