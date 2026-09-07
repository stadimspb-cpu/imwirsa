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
// Block 7 additionally needs a PORT_CONTENT_CACHE global with real
// categories data (see port-card-answers.js v6) -- skips itself
// gracefully if that isn't injected, everything else still runs.

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
//
// "Где аптека Скорая помощь?" -- the ORIGINAL example used here -- was
// replaced 06.09.2026: it's now correctly intercepted by the new
// MEDICAL_EMERGENCY priority check in app.js (isMedicalEmergencyTopic(),
// checked before category override even runs, see the emergency-priority
// section below) and answered with the deterministic 112 reply instead.
// That's the CORRECT behavior per Andrey's explicit priority ordering,
// not a regression -- but it meant this exact phrase stopped being a
// valid test of category override specifically, since a real user would
// never reach that code path with it. "Где аптека Экстренная?" is a
// clean replacement: it hits the SAME underlying 3-way anchor collision
// (PHARMACY "аптек" / emergency-numbers "экстренн" / "Мне плохо, что
// делать?" "экстренн") without containing any MEDICAL_EMERGENCY_KEYWORDS
// marker, so it still reaches category override in the real pipeline too.
const CASES_CATEGORY_OVERRIDE_POSITIVE = [
  ["Где аптека Экстренная?", "pharmacy"],
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
  // is a self-contained different topic, not "category + unknown name".
  // Was "UNKNOWN" until 06.09.2026's medical-emergency fix (v43): this
  // exact phrase used to tie with "Мне плохо, что делать?" (see Block 9
  // below and offline-qa-match.js's isMedicalEmergencyTopic() for the
  // full story) -- now resolves cleanly to "Какой номер экстренных
  // служб?" even at the data layer alone, which is the CORRECT fixed
  // behavior, not a regression. Updating this expectation is itself part
  // of confirming the fix, not a weakening of the test.
  ["Мне нужна скорая помощь", "Какой номер экстренных служб?"],
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
// Block 6 — MEDICAL_FACILITY (врач/больница/клиника), 06.09.2026, per
// Andrey's report of a systemic gap: no offline category existed for
// "find a doctor/hospital/clinic" at all, so those messages either got
// dragged into PHARMACY (bare "врач" was primary there) or fell to
// UNKNOWN. New dedicated intent added -- NOT by adding "врач"/"больница"
// to PHARMACY, which Andrey explicitly ruled out (аптека != врач !=
// больница).
//
// Two SAFETY-CRITICAL side effects surfaced while building this, both
// pinned down here so they can't quietly regress:
//   1) The crisis "У меня боль в груди" intent's own primary "боль" was
//      ALSO independently matching bare "больница" (they share the
//      "боль-" root) -- exactly the same broad-anchor problem fixed
//      repeatedly this session, but on a genuinely safety-critical
//      intent, so it was NOT simply removed. "боль" was demoted to
//      synonym (still boosts score combined with "грудь"/"сердц", never
//      independently sufficient alone) rather than excluding "больниц"
//      from the crisis intent -- excluding would have silently killed a
//      combined real emergency phrasing like "боль в груди, нужна
//      больница", which is a far worse failure mode than losing a
//      completely bare, contextless "боль" with no location at all.
//   2) Demoting "боль" then exposed that the crisis intent's OWN
//      canonical text ("У меня боль в груди") was passing self-match
//      ONLY because of "боль" -- "грудь" (primary) never actually
//      matched "груди" (the real case-inflected form used in the actual
//      phrasing) due to the same word-boundary rule seen all session.
//      This was a LATENT bug, invisible until "боль" stopped masking it.
//      Fixed by adding "груди" as its own exact primary form -- verified
//      self-match AND "Боль в груди" (without "У меня") both pass now.
// Also demoted: dentist's bare "больн" (matched "больница" too, same
// root) -> synonym; vaccination's "медцентр" -> synonym (a bare "где
// медцентр" is about finding a facility in general, not specifically
// about getting a vaccine -- MEDICAL_FACILITY owns that word now).
//
// The MEDICAL_FACILITY-expected cases below check the intent's stable
// "id" (v42, intents-data.js), not its .q text -- per Andrey's
// robustness request, app.js/port-card-answers.js route on that id, so
// this test checks the same thing they actually rely on. If it checked
// .q instead, renaming that question later would fail this test even
// though the real routing still works correctly.
function runIdCases(label, cases) {
  let pass = 0;
  for (const [text, expectedId] of cases) {
    const intent = findOfflineIntent(text);
    const gotId = intent ? intent.id || "(no id)" : "UNKNOWN";
    const ok = gotId === expectedId;
    if (ok) pass++;
    console.log(ok ? "OK" : "!!", text.padEnd(45), "-> id:", gotId, intent ? "(\"" + intent.q + "\")" : "");
  }
  console.log(`${label}: ${pass}/${cases.length} passed\n`);
  return pass === cases.length;
}

const CASES_MEDICAL_FACILITY_ID = [
  ["Я простыл и мне нужно к врачу", "medical_facility"],
  ["Надо больницу", "medical_facility"],
  ["Дежурная больница", "medical_facility"],
  ["Мне нужен врач", "medical_facility"],
  ["Где больница?", "medical_facility"],
  ["Где клиника?", "medical_facility"],
  ["Где медцентр?", "medical_facility"],
];
const medicalFacilityIdOk = runIdCases("Block 6a (MEDICAL_FACILITY routes by stable id)", CASES_MEDICAL_FACILITY_ID);

const CASES_MEDICAL_FACILITY = [
  // dentistry stays its own category, not swallowed by the new general one
  ["Нужен зубной врач", "Что делать, если заболел зуб?"],
  // emergency/crisis intents keep priority -- none of these should ever
  // resolve to MEDICAL_FACILITY
  ["Мне очень плохо", "Мне плохо, что делать?"],
  ["Мне нужна скорая", "Какой номер экстренных служб?"],
  ["Боль в груди", "У меня боль в груди"],
  ["У меня боль в груди", "У меня боль в груди"],
  // must NOT regress -- PHARMACY no longer claims "врач" at all, but
  // everything that's actually about medicine/the pharmacy itself is fine
  ["Есть ли аптека с антибиотиками без рецепта?", "Есть ли аптека с антибиотиками без рецепта?"],
  ["У меня болит голова. Где купить таблетки?", "Можно ли купить обезболивающее без рецепта?"],
  ["Мне нужен раствор для линз — есть аптека рядом?", "Где купить раствор для контактных линз или очки?"],
  ["Где ближайшая аптека?", "Где ближайшая аптека?"],
  ["Можно ли получить прививку в порту?", "Можно ли получить прививку в порту?"],
];
const medicalFacilityOk = runCases("Block 6b (dentist/emergency/pharmacy still correctly separate)", CASES_MEDICAL_FACILITY) && medicalFacilityIdOk;

// ---------------------------------------------------------------------
// Block 7 — MEDICAL_FACILITY hospital CARD DATA, 06.09.2026. Andrey
// caught that Block 6's "no confirmed hospital data" fallback was
// factually wrong -- every port's card DOES have one, it just lives in
// categories.emergency.rows (top-level, icon "🩺"), not a subdetail. See
// getHospitalCardFact()/medicalFacilityAnswer() in port-card-answers.js.
//
// Needs PORT_CONTENT_CACHE (not just SUBDETAILS) to test the real path --
// that's a separate cache (see ensurePortContentLoaded() in app.js), so
// this block is skipped gracefully, not silently "passed", when it isn't
// loaded (e.g. running the shorter documented pipeline without it).
let medicalFacilityCardOk = true;
if (typeof PORT_CONTENT_CACHE !== "undefined" && typeof medicalFacilityAnswer === "function") {
  const CASES_MEDICAL_FACILITY_CARD = [
    // confirmed hospital -- must show it, never the v41 generic fallback
    ["tallinn-vanasadam", "Ida-Tallinna Keskhaigla"],
    ["tallinn-muuga", "Ida-Tallinna Keskhaigla"],
    // this ONE port's card itself says the hospital isn't confirmed yet --
    // must fall back to the honest generic text, not crash or show a
    // half-broken "Nearest hospital — Not yet confirmed..." sentence
    ["istanbul-haydarpasa", "нет подтверждённых данных"],
  ];
  for (const [portId, expectSubstr] of CASES_MEDICAL_FACILITY_CARD) {
    const reply = medicalFacilityAnswer(portId);
    const ok = reply && reply.includes(expectSubstr);
    if (!ok) medicalFacilityCardOk = false;
    console.log(ok ? "OK" : "!!", portId.padEnd(22), "-> reply:", (reply || "NULL").slice(0, 80));
  }
  console.log(`Block 7 (MEDICAL_FACILITY hospital card data): ${medicalFacilityCardOk ? "all passed" : "FAILED"}\n`);
} else {
  console.log("Block 7 (MEDICAL_FACILITY hospital card data): SKIPPED -- PORT_CONTENT_CACHE not loaded in this run\n");
}

// ---------------------------------------------------------------------
// Block 8 — hospital-icon CONTRACT, 06.09.2026, per Andrey's robustness
// request. getHospitalCardFact() (port-card-answers.js) finds the
// hospital by icon HOSPITAL_ROW_ICON ("🩺") in categories.emergency.rows.
// That's a real, working signal (checked across all 15 ports when it was
// built) but a SILENT one: if a future edit to any port's
// data/{portId}.json ever changes or drops that icon, getHospitalCardFact()
// doesn't error — it just returns null and MEDICAL_FACILITY quietly falls
// back to the generic "no confirmed data" text, with nothing to say why.
//
// This block makes that failure LOUD: it reads every port's REAL
// data/{portId}.json directly off disk -- not a synthetic fixture, so it
// catches an actual future data edit, not just a hypothetical one -- and
// asserts each one still has exactly one row tagged with the SAME
// constant the real code uses (falls back to the literal "🩺" only if
// port-card-answers.js wasn't loaded in this run, so the check still
// means something on its own).
//
// Reads ../data/*.json relative to the CURRENT WORKING DIRECTORY, not
// __dirname -- a stdin-piped script has no __dirname. Run this from
// mwapp-prototype/js/ (where the other files in the `cat ... | node`
// command already have to live) so ../data/ resolves to the real sibling
// folder. If it can't be read from wherever this happens to run, the
// block says so and skips itself rather than failing the whole suite for
// an environment problem unrelated to the actual contract.
let hospitalIconContractOk = true;
try {
  const fs = require("fs");
  const path = require("path");
  const expectedIcon = typeof HOSPITAL_ROW_ICON !== "undefined" ? HOSPITAL_ROW_ICON : "🩺";
  const dataDir = path.join(process.cwd(), "..", "data");
  const portFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json") && f !== "manifest.json");
  if (portFiles.length === 0) throw new Error("no port .json files found in " + dataDir);
  for (const file of portFiles) {
    const portId = file.replace(/\.json$/, "");
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
    const rows = data.categories && data.categories.emergency && data.categories.emergency.rows;
    const hospitalRows = Array.isArray(rows) ? rows.filter((r) => r.icon === expectedIcon) : [];
    const ok = hospitalRows.length === 1;
    if (!ok) hospitalIconContractOk = false;
    const detail = hospitalRows.length === 0
      ? "CONTRACT BROKEN -- no row with icon \"" + expectedIcon + "\" found (hospital row missing or icon changed)"
      : hospitalRows.length > 1
      ? "CONTRACT BROKEN -- " + hospitalRows.length + " rows with this icon, ambiguous"
      : hospitalRows[0].title;
    console.log(ok ? "OK" : "!!", portId.padEnd(24), "->", detail);
  }
  console.log(`Block 8 (hospital-icon contract, ${portFiles.length} real port files on disk, icon "${expectedIcon}"): ${hospitalIconContractOk ? "all passed" : "FAILED"}\n`);
} catch (e) {
  console.log(`Block 8 (hospital-icon contract): SKIPPED -- couldn't read ../data/*.json from cwd (${e.message}). Run from mwapp-prototype/js/ to exercise it.\n`);
}

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

// ---------------------------------------------------------------------
// Block 9 — MEDICAL EMERGENCY (ambulance) priority, 06.09.2026, per
// Andrey's live test: "Мне нужна скорая помощь" (and variants) landed in
// the generic "unclear" fallback. Root cause: a PRE-EXISTING 4-4 tie
// between "Какой номер экстренных служб?" (id "medical_emergency") and
// "Мне плохо, что делать?" (both anchor on "помощь"/"скор(а)") -- see the
// full writeup in offline-qa-match.js's isMedicalEmergencyTopic() and
// intents-data.js v43. Two layers tested here:
//   9a) isMedicalEmergencyTopic() directly -- the deterministic,
//       DOM-free detector app.js checks BEFORE the scored intent table
//       even runs, so this can never again lose a tie to anything.
//   9b) findOfflineIntent() itself, defense in depth -- confirms the
//       underlying tie is ALSO fixed at the data layer (the "id" +
//       exclude changes in intents-data.js v43), for the case where a
//       phrasing doesn't hit 9a's keyword list but still reaches the
//       scored table.
// Every example is exactly one Andrey gave, covering case, punctuation,
// extra spaces, word order, added words, and EN -- per his explicit
// robustness requirement, not a single exact-phrase match.
let medicalEmergencyOk = true;
if (typeof isMedicalEmergencyTopic === "function") {
  const CASES_MEDICAL_EMERGENCY_KEYWORD = [
    "Мне нужна скорая помощь", "мне нужна скорая", "Нужна срочно скорая!",
    "Как вызвать скорую?", "Вызови скорую помощь", "Мне очень плохо, нужна скорая",
    "  мне   нужна    скорая  ", "МНЕ НУЖНА СКОРАЯ ПОМОЩЬ",
    "ambulance please", "I need an ambulance", "call an ambulance now", "medical emergency!",
  ];
  for (const text of CASES_MEDICAL_EMERGENCY_KEYWORD) {
    const ok = isMedicalEmergencyTopic(text);
    if (!ok) medicalEmergencyOk = false;
    console.log(ok ? "OK" : "!!", text.padEnd(35), "-> isMedicalEmergencyTopic:", ok);
  }
  // must NOT fire for unrelated messages that merely share a word
  const CASES_MEDICAL_EMERGENCY_NEGATIVE = ["Помогите скорее, пожалуйста", "Нужен зубной врач", "Где больница?"];
  for (const text of CASES_MEDICAL_EMERGENCY_NEGATIVE) {
    const ok = !isMedicalEmergencyTopic(text);
    if (!ok) medicalEmergencyOk = false;
    console.log(ok ? "OK" : "!!", text.padEnd(35), "-> isMedicalEmergencyTopic:", isMedicalEmergencyTopic(text), "(expected false)");
  }
} else {
  console.log("Block 9a SKIPPED -- isMedicalEmergencyTopic() not loaded in this run");
}
console.log(`Block 9a (isMedicalEmergencyTopic direct): ${medicalEmergencyOk ? "all passed" : "FAILED"}\n`);

const CASES_MEDICAL_EMERGENCY_ID = [
  ["Мне нужна скорая помощь", "medical_emergency"],
  ["Где ближайшая аптека?", null], // must NOT regress -- plain pharmacy question
];
let medicalEmergencyIdOk = true;
for (const [text, expectedId] of CASES_MEDICAL_EMERGENCY_ID) {
  const intent = findOfflineIntent(text);
  const gotId = intent ? intent.id || null : null;
  const ok = gotId === expectedId;
  if (!ok) medicalEmergencyIdOk = false;
  console.log(ok ? "OK" : "!!", text.padEnd(35), "-> id:", gotId, "(expected", expectedId, ")");
}
console.log(`Block 9b (findOfflineIntent tie fixed at data layer too): ${medicalEmergencyIdOk ? "all passed" : "FAILED"}\n`);

// ---------------------------------------------------------------------
// Block 10 — "скор" root false positive, 06.09.2026, per Markus's live
// test: "Скоро буду в порту" was firing the emergency route. Root cause
// was NOT isMedicalEmergencyTopic() (Block 9a already tested clean
// against these before this fix) -- it was the SEPARATE scored intent
// "Какой номер экстренных служб?" (id "medical_emergency"), whose bare
// "скор" (4-letter) primary anchor prefix-matched "скоро"/"скорость"/
// "скоростной" too, since containsAnchor()'s boundary rule only checks a
// LEFT boundary for anchors longer than 3 characters. Fixed by replacing
// "скор" with the exact forms "скорая"/"скорую"/"скорой" (intents-data.js
// v44), and isMedicalEmergencyTopic() itself switched from raw substring
// to containsAnchor() (word-boundary aware) per Markus's explicit
// request. Positive and negative sets kept SEPARATE below, exactly as
// Markus ran them, rather than interleaved with Block 9's.
const CASES_ROOT_FALSE_POSITIVE_NEGATIVE = [
  "скоро буду в порту", "какая скорость автобуса", "скоростной поезд",
  "надо ускорить погрузку", "скоро откроется магазин",
];
const CASES_ROOT_FALSE_POSITIVE_POSITIVE = [
  "нужна скорая", "вызови скорую", "как вызвать скорую помощь", "мне плохо, нужна скорая",
];
let rootFalsePositiveOk = true;
if (typeof isMedicalEmergencyTopic === "function") {
  console.log("-- positive (must be true) --");
  for (const text of CASES_ROOT_FALSE_POSITIVE_POSITIVE) {
    const ok = isMedicalEmergencyTopic(text);
    if (!ok) rootFalsePositiveOk = false;
    console.log(ok ? "OK" : "!!", text.padEnd(35), "-> isMedicalEmergencyTopic:", ok);
  }
  console.log("-- negative (must be false, AND must not reach medical_emergency via the scored table either) --");
  for (const text of CASES_ROOT_FALSE_POSITIVE_NEGATIVE) {
    const detectorOk = !isMedicalEmergencyTopic(text);
    const intent = findOfflineIntent(text);
    const scoredOk = !intent || intent.id !== "medical_emergency";
    const ok = detectorOk && scoredOk;
    if (!ok) rootFalsePositiveOk = false;
    console.log(ok ? "OK" : "!!", text.padEnd(35), "-> detector:", !detectorOk, "| scored table:", intent ? (intent.id || intent.q) : "UNKNOWN");
  }
} else {
  console.log("Block 10 SKIPPED -- isMedicalEmergencyTopic() not loaded in this run");
}
console.log(`Block 10 ("скор" root false positive, positive/negative tested separately): ${rootFalsePositiveOk ? "all passed" : "FAILED"}\n`);

// ---------------------------------------------------------------------
// Block 11 — DENTAL fallback, 06.09.2026, per Andrey's general MWApp
// principle: when a specialized service isn't on the card, give a safe
// next step from CONFIRMED data instead of stopping at "no data". See
// dentalFallbackAnswer() in port-card-answers.js for the full rationale.
// Needs PORT_CONTENT_CACHE (same as Block 7) -- skipped gracefully when
// it isn't loaded, everything else still runs.
let dentalFallbackOk = true;
if (typeof PORT_CONTENT_CACHE !== "undefined" && typeof dentalFallbackAnswer === "function") {
  const CASES_DENTAL_FALLBACK = [
    // no dental data on any port (checked directly across all 15) --
    // must point to the confirmed hospital, not stop at "no data"
    ["tallinn-vanasadam", "Ida-Tallinna Keskhaigla", "нет подтверждённой стоматологии"],
    // this port's hospital row happens to include a phone number in the
    // card's own text -- must show it, since it's part of the confirmed fact
    ["batumi-main", "+995 422 22 22 14", "нет подтверждённой стоматологии"],
    // this port's hospital is ITSELF unconfirmed -- must fall back to the
    // original honest dental .a text, not a broken half-answer
    ["istanbul-haydarpasa", "экстренную службу", null],
  ];
  for (const [portId, expectSubstr, alsoExpect] of CASES_DENTAL_FALLBACK) {
    const reply = dentalFallbackAnswer(portId);
    const hasFirst = reply && reply.includes(expectSubstr);
    const hasSecond = alsoExpect === null || (reply && reply.includes(alsoExpect));
    // must NEVER claim the hospital treats dental issues -- only that the
    // seafarer can go there to ask/get directed further
    const noOverclaim = !reply || !/стоматологи[а-я]* доступна|лечит зуб|зубной кабинет в больниц/i.test(reply);
    const ok = hasFirst && hasSecond && noOverclaim;
    if (!ok) dentalFallbackOk = false;
    console.log(ok ? "OK" : "!!", portId.padEnd(22), "-> reply:", (reply || "NULL").slice(0, 90));
  }
  console.log(`Block 11 (DENTAL fallback to confirmed hospital): ${dentalFallbackOk ? "all passed" : "FAILED"}\n`);
} else {
  console.log("Block 11 (DENTAL fallback to confirmed hospital): SKIPPED -- PORT_CONTENT_CACHE not loaded in this run\n");
}

// Emergency priority over dental wording, defense in depth: a message
// combining dental words with a real ambulance signal must still be
// caught by isMedicalEmergencyTopic() BEFORE reaching dental at all (the
// actual guarantee lives in app.js's priority order, checked here at the
// detector level since regression-charger.js has no DOM to run app.js's
// real branching).
let dentalEmergencyPriorityOk = true;
if (typeof isMedicalEmergencyTopic === "function") {
  const text = "Зуб болит невыносимо, вызовите скорую!";
  const ok = isMedicalEmergencyTopic(text);
  if (!ok) dentalEmergencyPriorityOk = false;
  console.log(ok ? "OK" : "!!", text.padEnd(40), "-> isMedicalEmergencyTopic:", ok, "(emergency must win over dental wording)");
}
console.log(`Block 11b (emergency priority over dental wording): ${dentalEmergencyPriorityOk ? "all passed" : "FAILED"}\n`);

// ---------------------------------------------------------------------
// Block 12 — DENTAL RU anchor expansion, 06.09.2026, per Markus (Russian
// only for now, by explicit request -- EN/other languages deferred until
// this is stable). Tests both the new direct anchors ("дантист",
// "стоматология", "зубной врач") and the new COMPOUND ANCHORS mechanism
// (offline-qa-match.js v16): tooth-noun forms combined with a medical
// action/symptom word, in ANY order, without ever making a bare
// tooth-noun independently sufficient.
const CASES_DENTAL_RU = [
  // previously passing -- must not regress
  ["Где стоматолог?", "dental"],
  ["Мне нужен зубной врач", "dental"],
  ["У меня болит зуб", "dental"],
  ["Где можно лечить зуб?", "dental"],
  ["Нужна стоматология", "dental"],
  // previously failing -- must now resolve to dental
  ["Есть дантист рядом?", "dental"],
  ["зубы лечить", "dental"],
  ["где лечить зубы", "dental"],
  ["лечить зубы", "dental"],
];
let dentalRuOk = true;
for (const [text, expectedId] of CASES_DENTAL_RU) {
  const got = findOfflineIntent(text);
  const gotId = got ? got.id || null : null;
  const ok = gotId === expectedId;
  if (!ok) dentalRuOk = false;
  console.log(ok ? "OK" : "!!", text.padEnd(30), "-> id:", gotId, "(expected", expectedId, ")");
}
// must NEVER trigger dental on a bare tooth-noun with no medical action --
// this is the whole point of compoundAnchors over just adding "зубы" etc.
// straight to primary
const CASES_DENTAL_RU_NEGATIVE = [
  ["Где купить зубную пасту?", "dental"],
  ["Где купить зубную щётку?", "dental"],
  ["Просто зубы у меня красивые", "dental"],
];
for (const [text, mustNotBeId] of CASES_DENTAL_RU_NEGATIVE) {
  const got = findOfflineIntent(text);
  const gotId = got ? got.id || null : null;
  const ok = gotId !== mustNotBeId;
  if (!ok) dentalRuOk = false;
  console.log(ok ? "OK" : "!!", text.padEnd(30), "-> id:", gotId, "(must NOT be", mustNotBeId, ")");
}
console.log(`Block 12 (DENTAL RU anchor expansion + compoundAnchors): ${dentalRuOk ? "all passed" : "FAILED"}\n`);

// ---------------------------------------------------------------------
// Block 13 — TRANSPORT/GATE anchor collisions, 06.09.2026, per Andrey's
// live screenshot batch (topic: transport). Same root cause class as
// every prior block: a broad word ("такси","автобус","ворота","выход",
// "пропуск","терминал","карт","наличн","нет") sitting as an
// independently-sufficient PRIMARY anchor in 2+ intents at once, so the
// message ties and falls to UNKNOWN, or in one case actively resolves to
// the WRONG intent via a genuine homonym ("терминал" = port building vs
// payment terminal). Also found, unprompted, while investigating: "карт"/
// "наличн"/bare "нет" were ALSO primary in the no-money-distress intent,
// which escalates to the IMWIRSA duty office -- an ordinary "can I pay by
// card" question could have been misrouted into that escalation. Fixed
// the same way as always: the broad word demoted to synonym everywhere
// except the ONE intent that should own it as a genuine default/general
// case, never by weakening a safety-relevant intent's real signal words.
//
// Two self-inflicted regressions caught and fixed in the SAME round, not
// after: consolidating "ворота" onto the port-gate intent made "Где
// ворота в старый город?" (a different topic, old-town gates) wrongly
// resolve there too (fixed with an exclude on "старый город"); demoting
// "автобус"/"поезд" in the last-bus intent made ITS OWN canonical text
// score lower than the general public-transport intent, breaking its
// self-match (fixed by excluding "последн" from public-transport, so the
// schedule-specific question defers to the schedule-specific intent).
const CASES_TRANSPORT_GATE = [
  // taxi -- was tying with the taxi-trust intent on bare "такси"
  ["Где взять такси?", "Где сесть в такси и сколько это будет стоить?"],
  ["Мне нужно такси", "Где сесть в такси и сколько это будет стоить?"],
  ["Хочу заказать машину", "Где сесть в такси и сколько это будет стоить?"],
  ["Сколько стоит такси до центра?", "Где сесть в такси и сколько это будет стоить?"],
  ["Какому такси здесь можно доверять?", "Какому такси здесь можно доверять?"],
  // negation isn't understood generally (bag-of-words), but this one
  // explicit phrase must not actively give TAXI info for a "without
  // taxi" question -- UNKNOWN is the honest, safe outcome here
  ["Как доехать до города без такси?", "UNKNOWN"],
  // bus/public transport -- was tying with the "last bus" intent on bare
  // "автобус"/"поезд"
  ["Где автобус?", "Как доехать до центра на общественном транспорте?"],
  ["Как доехать на автобусе до центра?", "Как доехать до центра на общественном транспорте?"],
  ["Есть общественный транспорт?", "Как доехать до центра на общественном транспорте?"],
  ["Где автобусная остановка?", "Как доехать до центра на общественном транспорте?"],
  ["Какой автобус идёт в центр?", "Как доехать до центра на общественном транспорте?"],
  ["Последний автобус / поезд (когда ходит)", "Последний автобус / поезд (когда ходит)"],
  // gate/exit -- was tying across up to 5 different intents that all
  // happened to carry bare "ворота"/"выход"/"пропуск" as primary
  ["Где выход?", "Нужен ли пропуск, чтобы выйти из порта"],
  ["Как выйти из порта?", "Нужен ли пропуск, чтобы выйти из порта"],
  ["Можно выйти без пропуска?", "Нужен ли пропуск, чтобы выйти из порта"],
  ["Как пройти к воротам?", "Через какие ворота выйти в город"],
  ["Где главные ворота?", "Через какие ворота выйти в город"],
  ["Через какие ворота выйти в город", "Через какие ворота выйти в город"],
  ["Как найти судового агента у ворот?", "Как найти судового агента у ворот?"],
  ["Где сходить в туалет у ворот?", "Где сходить в туалет у ворот?"],
  ["Заберут ли пропуск или паспорт на КПП?", "Заберут ли пропуск или паспорт на КПП?"],
  ["Где находится вход на территорию порта для членов экипажа?", "Где находится вход на территорию порта для членов экипажа?"],
  ["Внутрипортовый транспорт (шаттл от причала до ворот)", "Внутрипортовый транспорт (шаттл от причала до ворот)"],
  // a DIFFERENT kind of gate (old town, not the port) must NOT be
  // swallowed by the port-gate intent just because "ворота" is now its
  // sole owner -- this is the exact regression caught mid-round
  ["Где ворота в старый город?", "UNKNOWN"],
  // "терминал" homonym (port building vs payment terminal) -- must not
  // actively misroute to the payment/Wellness answer any more
  ["Как попасть из терминала в город?", "UNKNOWN"],
  // payment -- self-match was broken by inflected forms ("картой" doesn't
  // match "карта", "оплатить" doesn't match "оплата") even before today;
  // found and fixed as a side effect of touching this intent
  ["Можно ли оплатить картой или только наличные?", "Можно ли оплатить картой или только наличные?"],
  // safety-relevant find, unprompted: an ordinary payment question must
  // NEVER get redirected to the no-money-distress escalation intent just
  // because both used to share bare "карт"/"наличн"/"нет"
  ["Можно расплатиться картой в кафе?", "Можно ли оплатить картой или только наличные?"],
  ["Где ближайший банкомат?", "Где ближайший банкомат?"],
  ["У меня совсем нет денег", "У меня совсем нет денег"],
];
const transportGateOk = runCases("Block 13 (transport/gate anchor collisions + payment/no-money safety find)", CASES_TRANSPORT_GATE);

if (!chargerOk || !block2Ok || !brandOk || !block4Ok || !brand2Ok || !categoryOverridePositiveOk || !categoryOverrideNegativeOk || !medicalFacilityOk || !medicalFacilityCardOk || !hospitalIconContractOk || !medicalEmergencyOk || !medicalEmergencyIdOk || !rootFalsePositiveOk || !dentalFallbackOk || !dentalEmergencyPriorityOk || !dentalRuOk || !transportGateOk) {
  console.log("❌ REGRESSION: named-case failures above must be fixed before shipping.");
} else {
  console.log("✅ All named regression cases pass.");
}
