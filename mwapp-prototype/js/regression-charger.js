// Persistent offline-intent regression suite.
// Started 05.09.2026 (CHARGER/CABLE/ADAPTER, per Andrey/Markus) — grows
// over time, run before every change to this codebase, never thrown away.
// 06.09.2026: Markus's Block 2 (cafe/food/water/vegetarian/halal/wifi)
// plus the follow-up cafe->FOOD fix and Макдональдс/KFC folded in as a
// second CASES block below, so this is now the single persistent file —
// the separate regression-tests.js written earlier the same session is
// superseded by this file and should not be deployed alongside it.
//
// Usage: cat intents-data.js offline-qa-match.js port-card-answers.js regression-charger.js | node

// ---------------------------------------------------------------------
// Block 1 — CHARGER / CABLE / ADAPTER, 05.09.2026
// ---------------------------------------------------------------------
const TARGET_CHARGER = "Где купить зарядное устройство или переходник?";

const CASES_CHARGER = [
  ["Где мне купить зарядку?", TARGET_CHARGER],
  ["Где купить зарядник?", TARGET_CHARGER],
  ["Мне нужен переходник для розетки", TARGET_CHARGER],
  ["Где найти адаптер для телефона?", TARGET_CHARGER],
  ["Где купить кабель?", TARGET_CHARGER],
  ["Где купить кабель для зарядки?", TARGET_CHARGER],
  ["Где купить Type-C кабель?", TARGET_CHARGER],
  ["Где купить USB-C зарядку?", TARGET_CHARGER],
  ["Где купить блок питания?", TARGET_CHARGER],
  ["Где купить зарядное устройство или переходник?", TARGET_CHARGER],
  // adjacent intents that must NOT be swallowed by the fixes above
  ["Какой тип розетки или переходника нужен в этой стране?", "Какой тип розетки или переходника нужен?"],
  ["Меня ограбили, помогите", "Меня ограбили"],
  ["У меня украли телефон, куда идти?", "У меня украли телефон — куда идти?"],
  ["Мой телефон упал за борт, где купить б/у?", "Где купить б/у телефон, если мой упал за борт или разбился?"],
  ["Где купить powerbank?", "Где купить powerbank?"],
];

// ---------------------------------------------------------------------
// Block 2 — cafe/food/water/vegetarian/halal/Wi-Fi, 06.09.2026, per
// Markus's live-test report (4 systemic classes) plus the same-day
// follow-up field test ("кафе" needed to reach FOOD, not just stop
// hijacking Wi-Fi) and the Макдональдс/KFC addition.
// ---------------------------------------------------------------------
const CASES_BLOCK2 = [
  // broad-anchor collisions
  ["Есть рядом недорогое кафе?", "Где недорого поесть рядом с портом?"],
  ["Где кафе рядом?", "Где недорого поесть рядом с портом?"],
  ["Где можно нормально пообедать?", "Где недорого поесть рядом с портом?"],
  // Cafe+Wi-Fi must still win over generic FOOD when a Wi-Fi word is present
  ["Кафе с Wi-Fi есть?", "Кафе с Wi-Fi"],
  // "кофейня" stays on the separate coffee intent, not FOOD
  ["Есть рядом кофейня?", "Где выпить кофе недорого?"],
  // covered-but-UNKNOWN: specific dietary request must outrank generic FOOD
  ["Есть ли рядом вегетарианская еда?", "Есть ли рядом вегетарианская еда?"],
  ["Есть ли рядом халяльная еда?", "Есть ли рядом халяльная еда?"],
  ["поесть халяль", "Есть ли рядом халяльная еда?"],
  ["Есть веганская еда?", "Есть ли рядом вегетарианская еда?"],
  ["кафе с вегетарианской едой", "Есть ли рядом вегетарианская еда?"],
  // natural water queries
  ["попить воды из крана", "Можно ли пить воду из-под крана?"],
  ["Где купить воду?", "Где купить бутилированную воду?"],
  // "выпить" must stay ambiguous with alcohol, not fire the water intent alone
  ["хочу выпить пива", "UNKNOWN"],
  ["хочу выпить водки в баре", "UNKNOWN"],
  // Макдональдс/KFC, 06.09.2026 — same FOOD answer as any other food question
  ["Есть тут Макдональдс?", "Где недорого поесть рядом с портом?"],
  ["Где ближайший KFC?", "Где недорого поесть рядом с портом?"],
  ["Хочу в макдак", "Где недорого поесть рядом с портом?"],
];

function runCases(label, cases) {
  let pass = 0;
  for (const [text, expected] of cases) {
    const intent = findOfflineIntent(text);
    const got = intent ? intent.q : "UNKNOWN";
    const ok = got === expected;
    if (ok) pass++;
    console.log(ok ? "OK" : "!!", text.padEnd(58), "->", got.slice(0, 60));
  }
  console.log(`${label}: ${pass}/${cases.length} passed\n`);
  return pass === cases.length;
}

const chargerOk = runCases("CHARGER/CABLE/ADAPTER", CASES_CHARGER);
const block2Ok = runCases("Block 2 (cafe/food/water/vegetarian/halal/wifi)", CASES_BLOCK2);

// ---------------------------------------------------------------------
// Block 3 — brand/named-entity requests must not fall back to a generic
// category card fact, 06.09.2026, per Andrey's live test ("макдак"/"KFC"
// were getting handed an unrelated Port Card fact -- e.g. a canteen --
// as if it answered the brand question). This mirrors the ACTUAL
// app.js reply-composition branch (brand check -> honest "no confirmed
// data" reply, generic card lookup only when no brand is named), not
// just findOfflineIntent() in isolation, since the bug lived in that
// composition, not in intent scoring. Uses real Vanasadam data if it's
// been concatenated in (via the SUBDETAILS global) so the "must not leak
// the real card fact" assertion is genuine; otherwise (SUBDETAILS
// undefined) it only checks the brand-detection half, still catching a
// regression to the old "silently returns the FOOD intent's plain
// .a text or the card fact" behavior.
function simulateReply(text, portId) {
  const brand = typeof detectBrandEntity === "function" ? detectBrandEntity(text) : null;
  const matchedIntent = findOfflineIntent(text);
  if (matchedIntent) {
    if (brand) return typeof noConfirmedBrandDataAnswer === "function" ? noConfirmedBrandDataAnswer(brand) : matchedIntent.a;
    const cardAnswer = typeof getPortSpecificAnswer === "function" ? getPortSpecificAnswer(matchedIntent.q, portId) : null;
    return cardAnswer || matchedIntent.a;
  }
  if (brand) return typeof noConfirmedBrandDataAnswer === "function" ? noConfirmedBrandDataAnswer(brand) : null;
  return "UNKNOWN";
}

const CASES_BRAND = [
  // must still classify as FOOD-category (per point 1 of the request)...
  ["макдак", "food"],
  ["Есть тут KFC?", "food"],
  ["Где тут Макдональдс?", "food"],
  ["Burger King есть?", "food"],
];
let brandOk = true;
for (const [text, category] of CASES_BRAND) {
  const brand = typeof detectBrandEntity === "function" ? detectBrandEntity(text) : null;
  const reply = typeof SUBDETAILS !== "undefined" ? simulateReply(text, "tallinn-vanasadam") : null;
  const brandDetectedOk = brand && brand.category === category;
  // ...but the actual reply must NEVER be a plain Port Card fact sentence
  // ("По данным карточки этого порта: ...") when a brand was named --
  // that's exactly the leak this block exists to catch.
  const noLeak = reply === null || !reply.startsWith("По данным карточки этого порта");
  const ok = brandDetectedOk && noLeak;
  if (!ok) brandOk = false;
  console.log(ok ? "OK" : "!!", text.padEnd(30), "brand:", brand ? brand.label : "NONE", reply ? "| reply: " + reply.slice(0, 70) : "");
}
console.log(`Block 3 (brand/named-entity, ${typeof SUBDETAILS !== "undefined" ? "with real card data" : "brand-detection only, port-card-answers.js not loaded"}): ${brandOk ? "all passed" : "FAILED"}\n`);

// ---------------------------------------------------------------------
// Self-check #1, added 05.09.2026 per Andrey/Markus: every intent's OWN
// canonical question must produce at least one real (non-generic) primary
// hit against its OWN anchor list. Catches an anchor cleanup that removed
// the one word letting a question trigger itself.
//
// Known accepted exception: "Сколько это стоит?" (Wellness follow-up
// pricing question) genuinely cannot self-trigger on its own text --
// "стоит" is deliberately generic (shared by dozens of price questions)
// and the question is designed to be asked as a natural follow-up inside
// an ongoing Wellness conversation, not recognized standalone. Not a bug;
// documented here so it doesn't get "fixed" into a meaningless anchor.
const SELF_CHECK_EXCEPTIONS = new Set(["Сколько это стоит?"]);

let selfCheckBroken = 0;
for (const intent of INTENTS) {
  if (SELF_CHECK_EXCEPTIONS.has(intent.q)) continue;
  const msg = normalizeText(intent.q);
  const ok = (intent.primary || []).some((a) => !isGeneric(a) && containsAnchor(msg, a));
  if (!ok) {
    selfCheckBroken++;
    console.log("SELF-CHECK #1 BROKEN:", intent.q, "| primary:", intent.primary);
  }
}
console.log(`Self-check #1 (has a real primary hit): ${INTENTS.length - selfCheckBroken}/${INTENTS.length} intents self-trigger (excluding ${SELF_CHECK_EXCEPTIONS.size} documented exception(s))\n`);

// ---------------------------------------------------------------------
// Self-check #2, added 06.09.2026: stronger than #1. #1 only checks that
// a real primary anchor exists and matches -- it does NOT check that the
// intent actually WINS findOfflineIntent(q) uniquely. That gap is exactly
// how two unrelated exact-duplicate intent pairs (gym/fitness, and
// port/military-object photo question) went unnoticed since before this
// session: both intents in each pair had perfectly valid, matching
// primary anchors (so #1 passed for both) but tied 1:1 against EACH
// OTHER every time, so BOTH always fell through to UNKNOWN via the
// ambiguity margin. This check calls the real findOfflineIntent() (same
// entry point the app uses) on every canonical q and requires it to
// resolve back to that exact intent, not just any intent.
//
// Known accepted exceptions: entries whose "q" is a documentation-only
// sub-question grouped under a broader FAQ topic (price/meta follow-ups,
// contextual "what if" questions inside a Wellness/CBD/complaint thread)
// rather than a standalone trigger phrase. Not exhaustively reviewed --
// treat new names appearing here as "needs a human look", not "is a bug".
for (const intent of INTENTS) {
  if (SELF_CHECK_EXCEPTIONS.has(intent.q)) continue;
  const got = findOfflineIntent(intent.q);
  if (!got || got.q !== intent.q) {
    console.log("SELF-CHECK #2 BROKEN (ties/loses to another intent):", intent.q, "-> got:", got ? got.q : "UNKNOWN");
  }
}
const selfMatchCount = INTENTS.filter((i) => {
  if (SELF_CHECK_EXCEPTIONS.has(i.q)) return true;
  const g = findOfflineIntent(i.q);
  return g && g.q === i.q;
}).length;
console.log(`Self-check #2 (uniquely wins its own match): ${selfMatchCount}/${INTENTS.length} intents\n`);

if (!chargerOk || !block2Ok || !brandOk) {
  console.log("❌ REGRESSION: named-case failures above must be fixed before shipping.");
} else {
  console.log("✅ All named regression cases pass.");
}
