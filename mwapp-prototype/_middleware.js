// MWApp — private-preview password gate.
//
// This is a Cloudflare Pages Function: any file placed at functions/_middleware.js
// in a Pages project runs automatically before every request, no separate Worker
// or Route to wire up — it deploys the same way as the rest of the site (upload
// to GitHub, Cloudflare Pages builds it).
//
// The username and password are NOT stored here. They live in Cloudflare's
// dashboard as environment variables (Pages project → Settings → Environment
// variables → add MWAPP_USER and MWAPP_PASS as "Secret" type, for BOTH the
// Production and Preview environments). Keeping them out of this file matters
// because the GitHub repo is public — anything written directly in this file
// would be visible to anyone who finds the repo.
//
// Once set, every visitor to app.imwirsa.org gets the browser's built-in
// login prompt (no custom page, no extra library) before seeing anything.

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

  const auth = request.headers.get("Authorization");

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      let decoded = "";
      try {
        decoded = atob(encoded);
      } catch {
        decoded = "";
      }
      const separatorIndex = decoded.indexOf(":");
      const user = decoded.slice(0, separatorIndex);
      const pass = decoded.slice(separatorIndex + 1);

      if (user === validUser && pass === validPass) {
        return next(); // credentials correct — let the request through
      }
    }
  }

  // No credentials, or wrong ones — show the browser's native login prompt.
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="MWApp — private preview", charset="UTF-8"',
    },
  });
}
