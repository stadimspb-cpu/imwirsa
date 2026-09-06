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
// Block 4 — pharmacy/dentist/painkiller/optics, 06.09.2026, per Andrey's
// live test (Block 3 in his terms, "22 questions", 7 FAIL). Root cause
// across all three "Class 1" cases was the same: the generic PHARMACY
// intent's primary anchor list had grown to include the exact anchor
// words of THREE separate specific intents (dentist's "врач", painkiller's
// "таблетк"/"обезболив", lens's "линз"/"очк"/"раствор для линз"), so any
// specific request tied or outright outscored the specific intent instead
// of deferring to it. Fixed by removing those anchors from PHARMACY's
// primary and excluding them instead (mirrors the FOOD-vs-vegetarian/halal
// fix from Block 2 -- generic defers to specific via exclude, not by
// weight tuning). Two more of the SAME "врач"/"голова"/bare-"зубн"/
// "срочн" broad-anchor pattern turned up as a direct side effect of
// fixing case #12 alone (see conversation) and are covered by the same
// mechanism, not hand-patched per phrase. Class 2 (`оптик` was
// synonym-only so could never independently trigger; `очк` is a 3-letter
// stem that the containsAnchor() word-boundary rule can never match
// against any real inflected form of "очки" -- same root cause as
// "вод"/"обед" in Block 2 -- fixed the same way, with explicit inflected
// forms, not by touching the boundary rule). Class 3 reuses the
// BRAND_ENTITIES/detectBrandEntity mechanism from Block 3 unchanged --
// Benu and Specsavers are just two more entries in that same list.
const CASES_BLOCK4 = [
  ["Нужно срочно к зубному врачу", "Что делать, если заболел зуб?"],
  ["У меня болит голова. Где купить таблетки?", "Можно ли купить обезболивающее без рецепта?"],
  ["Мне нужен раствор для линз — есть аптека рядом?", "Где купить раствор для контактных линз или очки?"],
  ["Где здесь оптика?", "Где купить раствор для контактных линз или очки?"],
  ["Мне нужны очки. Где купить?", "Где купить раствор для контактных линз или очки?"],
];
const block4Ok = runCases("Block 4 (pharmacy/dentist/painkiller/optics)", CASES_BLOCK4);

const CASES_BRAND2 = [
  ["Где аптека Benu?", "pharmacy"],
  ["Где Specsavers?", "optics"],
];
let brand2Ok = true;
for (const [text, category] of CASES_BRAND2) {
  const brand = typeof detectBrandEntity === "function" ? detectBrandEntity(text) : null;
  const reply = typeof SUBDETAILS !== "undefined" ? simulateReply(text, "tallinn-vanasadam") : null;
  const brandDetectedOk = brand && brand.category === category;
  const noLeak = reply === null || !reply.startsWith("По данным карточки этого порта");
  const ok = brandDetectedOk && noLeak;
  if (!ok) brand2Ok = false;
  console.log(ok ? "OK" : "!!", text.padEnd(30), "brand:", brand ? brand.label : "NONE", reply ? "| reply: " + reply.slice(0, 70) : "");
}
console.log(`Block 4 brand cases (pharmacy/optics): ${brand2Ok ? "all passed" : "FAILED"}\n`);

// ---------------------------------------------------------------------
// Block 5 — category-anchor override, 06.09.2026, per Andrey's general
// principle: a known CATEGORY word ("аптека"/"супермаркет"/"кафе") plus
// an unrecognized organization NAME must never tie into UNKNOWN or
// hijack an unrelated intent. NOT a brand database -- see
// resolveCategoryOverride() in offline-qa-match.js.
//
// The negative cases here matter as much as the positive ones: this
// mechanism's first draft (compare the winner to the category intent by
// identity) silently broke "Есть ли аптека с антибиотиками без
// рецепта?" -- a real, more-specific intent that legitimately outscores
// bare PHARMACY -- by dragging it back to the generic pharmacy answer.
// Caught before shipping by testing it alongside the fix, not after.
// The corrected version only overrides a genuine UNKNOWN (tie / no
// candidate), never a clean win by a different intent -- these cases
// pin that distinction down so it can't quietly regress back.
const CASES_CATEGORY_OVERRIDE_POSITIVE = [
  // the exact example from the conversation: unknown name must not tie
  // pharmacy into UNKNOWN via the emergency-services intent's "скор" anchor
  ["Где аптека Скорая помощь?", "pharmacy"],
  // constructed collisions proving this isn't pharmacy-only: "обменник"
  // is the currency-exchange intent's own word; "ночной" is the
  // 24-hour-bar intent's word -- both would otherwise tie their category
  // into UNKNOWN the same way
  ["Где кафе Ночной?", "food"],
];
let categoryOverridePositiveOk = true;
for (const [text, categoryId] of CASES_CATEGORY_OVERRIDE_POSITIVE) {
  const override = typeof resolveCategoryOverride === "function" ? resolveCategoryOverride(text) : null;
  const idOk = override && override.category.id === categoryId;
  // when real card data is loaded, also check the actual reply uses the
  // category's own "not confirmed for this specific place" template, not
  // the plain getPortSpecificAnswer() wrapper (that would mean the
  // override fired but categoryFallbackAnswer() was bypassed somewhere).
  const reply = idOk && typeof categoryFallbackAnswer === "function" && typeof SUBDETAILS !== "undefined"
    ? categoryFallbackAnswer(override.category, "tallinn-vanasadam")
    : null;
  const replyOk = reply === null || !reply.startsWith("По данным карточки этого порта");
  const ok = idOk && replyOk;
  if (!ok) categoryOverridePositiveOk = false;
  console.log(ok ? "OK" : "!!", text.padEnd(30), "-> override:", override ? override.category.id : "NONE (expected " + categoryId + ")", reply ? "| reply: " + reply.slice(0, 60) : "");
}
console.log(`Block 5a (category override fires when it should): ${categoryOverridePositiveOk ? "all passed" : "FAILED"}\n`);

const CASES_CATEGORY_OVERRIDE_NEGATIVE = [
  // must NOT be dragged back to generic PHARMACY -- each of these is a
  // real, specific intent that legitimately outscores or excludes it
  ["Есть ли аптека с антибиотиками без рецепта?", "Есть ли аптека с антибиотиками без рецепта?"],
  ["Нужно срочно к зубному врачу", "Что делать, если заболел зуб?"],
  ["У меня болит голова. Где купить таблетки?", "Можно ли купить обезболивающее без рецепта?"],
  ["Мне нужен раствор для линз — есть аптека рядом?", "Где купить раствор для контактных линз или очки?"],
  // must NOT trigger PHARMACY at all -- no category anchor present, this
  // is a self-contained different topic, not "category + unknown name"
  ["Мне нужна скорая помощь", "UNKNOWN"],
  // plain category questions with no trailing name must resolve exactly
  // as before this feature existed
  ["Где ближайшая аптека?", "Где ближайшая аптека?"],
  ["Где ближайший супермаркет?", "Где ближайший супермаркет?"],
  ["Где недорого поесть рядом с портом?", "Где недорого поесть рядом с портом?"],
];
let categoryOverrideNegativeOk = true;
for (const [text, expected] of CASES_CATEGORY_OVERRIDE_NEGATIVE) {
  const got = findOfflineIntent(text);
  const gotQ = got ? got.q : "UNKNOWN";
  const ok = gotQ === expected;
  if (!ok) categoryOverrideNegativeOk = false;
  console.log(ok ? "OK" : "!!", text.padEnd(50), "->", gotQ.slice(0, 55));
}
console.log(`Block 5b (category override must NOT fire / must not regress): ${categoryOverrideNegativeOk ? "all passed" : "FAILED"}\n`);

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

if (!chargerOk || !block2Ok || !brandOk || !block4Ok || !brand2Ok || !categoryOverridePositiveOk || !categoryOverrideNegativeOk) {
  console.log("❌ REGRESSION: named-case failures above must be fixed before shipping.");
} else {
  console.log("✅ All named regression cases pass.");
}
