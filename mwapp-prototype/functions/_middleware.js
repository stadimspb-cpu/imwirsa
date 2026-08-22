// MWApp — private-preview password gate.
//
// This is a Cloudflare Pages Function: any file placed at functions/_middleware.js
// in a Pages project runs automatically before every request, no separate Worker
// or Route to wire up — it deploys the same way as the rest of the site (upload
// to GitHub, Cloudflare Pages builds it).
//
// ── Why this isn't plain HTTP Basic Auth ────────────────────────────────
// An earlier version used the browser's built-in Basic Auth prompt. That
// works fine in a normal browser tab, but breaks silently when MWApp is
// opened from an iOS "Add to Home Screen" icon: standalone (home-screen)
// web apps on iOS run in an isolated WebKit context that does not show
// the native username/password dialog for a 401 challenge — the visitor
// just sees the raw "Authentication required." response body with no way
// to type credentials at all. Since "add it to your home screen and use
// it like an app" is the intended way people use MWApp, this isn't an
// edge case — it's the default case, so plain Basic Auth is unusable here.
//
// Instead, this gate shows its own small login page (plain HTML, no
// external assets) and, on success, sets a signed cookie. That's just a
// normal HTTP response + Set-Cookie header — no native browser dialog
// involved — so it works identically in a regular Safari/Chrome tab and
// inside a standalone home-screen web app.
//
// The cookie is a signed, stateless token (timestamp + HMAC-SHA256
// signature), not a random id looked up in a database — so no KV/session
// storage is needed. The signing key is derived from MWAPP_USER +
// MWAPP_PASS, which has a convenient side effect: rotating the password
// in Cloudflare automatically invalidates every existing session, which
// is the behaviour you want after a password change.
//
// ── Required Cloudflare setup ────────────────────────────────────────
// Pages project → Settings → Environment variables → add as "Secret",
// for BOTH Production and Preview environments:
//   MWAPP_USER
//   MWAPP_PASS
// (Same two secrets as before — nothing new to configure if this is
// replacing the earlier Basic Auth version.)
//
// Redeploy trigger (no functional change): 2026-08-22 — forcing a fresh
// Cloudflare Pages deployment so the current MWAPP_USER / MWAPP_PASS
// values are picked up (a "Retry deployment" reuses the old snapshot).

const COOKIE_NAME = "mwapp_auth";
const SESSION_DAYS = 30;
const LOGIN_PATH = "/__mwapp-login";

function textEncode(str) {
  return new TextEncoder().encode(str);
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    textEncode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(secret, message) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, textEncode(message));
  return toHex(sig);
}

async function makeSessionCookieValue(secret) {
  const expiry = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const signature = await sign(secret, String(expiry));
  return `${expiry}.${signature}`;
}

async function isValidSession(secret, cookieValue) {
  if (!cookieValue) return false;
  const dotIndex = cookieValue.indexOf(".");
  if (dotIndex === -1) return false;
  const expiryStr = cookieValue.slice(0, dotIndex);
  const signature = cookieValue.slice(dotIndex + 1);
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;
  const expected = await sign(secret, expiryStr);
  // Fixed-length hex strings from the same HMAC — safe to compare directly
  // for this use case (not a general-purpose constant-time-compare need).
  return expected === signature;
}

function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function loginPageHtml(errorMessage) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>MWApp — Sign in</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1B3A6B;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 24px;
  }
  .card {
    background: white;
    border-radius: 16px;
    padding: 32px 28px;
    width: 100%;
    max-width: 340px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.25);
  }
  .title { font-size: 20px; font-weight: 800; color: #1B3A6B; margin: 0 0 4px; }
  .subtitle { font-size: 13px; color: #64748B; margin: 0 0 24px; }
  label { display: block; font-size: 13px; font-weight: 600; color: #1B3A6B; margin: 14px 0 6px; }
  input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    font-size: 16px;
    outline: none;
  }
  input:focus { border-color: #1B3A6B; }
  button {
    width: 100%;
    margin-top: 22px;
    padding: 13px;
    background: #1B3A6B;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }
  button:active { opacity: 0.85; }
  .error {
    margin: 0 0 16px;
    padding: 10px 12px;
    background: #FEE2E2;
    color: #B91C1C;
    border-radius: 8px;
    font-size: 13px;
  }
</style>
</head>
<body>
  <div class="card">
    <p class="title">MWApp — private preview</p>
    <p class="subtitle">Sign in to continue.</p>
    ${errorMessage ? `<p class="error">${errorMessage}</p>` : ""}
    <form method="POST" action="${LOGIN_PATH}">
      <label for="u">Username</label>
      <input id="u" name="username" type="text" autocomplete="username" autocapitalize="off" autocorrect="off" required>
      <label for="p">Password</label>
      <input id="p" name="password" type="password" autocomplete="current-password" required>
      <button type="submit">Sign in</button>
    </form>
  </div>
</body>
</html>`;
}

export async function onRequest(context) {
  const { request, next, env } = context;

  const validUser = env.MWAPP_USER;
  const validPass = env.MWAPP_PASS;

  // Safety net: if the env vars haven't been set yet in Cloudflare, fail
  // CLOSED (block everyone) rather than open (let everyone through) — better
  // to notice the app is unreachable than to silently have zero protection.
  if (!validUser || !validPass) {
    return new Response(
      "Password gate is misconfigured — MWAPP_USER / MWAPP_PASS are not set in Cloudflare Pages environment variables.",
      { status: 500 }
    );
  }

  const secret = `${validUser}:${validPass}`;
  const url = new URL(request.url);

  // ── TEMPORARY diagnostic route ──────────────────────────────────────
  // Visit /__mwapp-debug?check=1 to see the CHARACTER LENGTH (not the
  // actual value) of what Cloudflare currently has stored for
  // MWAPP_USER / MWAPP_PASS. Useful for confirming "what I typed in the
  // Cloudflare dashboard" actually matches "what I typed on the login
  // page" length-for-length, without ever exposing the real secret.
  // Remove this block once the login issue is confirmed fixed.
  if (url.pathname === "/__mwapp-debug" && url.searchParams.get("check") === "1") {
    return new Response(
      `MWAPP_USER length: ${validUser.length} (trimmed: ${validUser.trim().length})\n` +
      `MWAPP_PASS length: ${validPass.length} (trimmed: ${validPass.trim().length})\n`,
      { status: 200, headers: { "Content-Type": "text/plain; charset=UTF-8" } }
    );
  }

  // Handle the login form submission.
  if (request.method === "POST" && url.pathname === LOGIN_PATH) {
    const form = await request.formData();
    const user = String(form.get("username") || "");
    const pass = String(form.get("password") || "");

    if (user.trim() === validUser.trim() && pass.trim() === validPass.trim()) {
      const cookieValue = await makeSessionCookieValue(secret);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie":
            `${COOKIE_NAME}=${encodeURIComponent(cookieValue)}; Path=/; Max-Age=${SESSION_DAYS * 24 * 60 * 60}; ` +
            `Secure; HttpOnly; SameSite=Lax`,
        },
      });
    }

    return new Response(loginPageHtml("Incorrect username or password."), {
      status: 401,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  }

  // Any other request: check for a valid session cookie.
  const cookieValue = getCookie(request, COOKIE_NAME);
  if (await isValidSession(secret, cookieValue)) {
    return next(); // valid session — let the request through
  }

  return new Response(loginPageHtml(null), {
    status: 401,
    headers: { "Content-Type": "text/html; charset=UTF-8" },
  });
}
