// ---- PORT CARD CONNECTION (pilot, 04.09.2026) ------------------------------
//
// v3, 06.09.2026 -- noConfirmedBrandDataAnswer() added: the honest "no
// confirmed data for this specific place" reply used when
// detectBrandEntity() (offline-qa-match.js) flags a brand/named-entity
// request, so getPortSpecificAnswer()'s generic first-fact-in-category
// result is never shown as if it answered a brand-specific question.
//
// v4, 06.09.2026 -- BRAND_CATEGORY_FOLLOWUP extended with "pharmacy" and
// "optics" entries (Benu/Specsavers, see conversation) -- same mechanism
// as v3, just two more categories.
//
// v5, 06.09.2026 -- getRawCardFact() split out of getPortSpecificAnswer()
// so categoryFallbackAnswer() (new) can build the CATEGORY-ANCHOR
// OVERRIDE reply (see offline-qa-match.js) around the same raw fact
// without duplicating the suffix/prefix lookup. getPortSpecificAnswer()
// itself is unchanged behavior, just now a thin wrapper.
//
// v6, 06.09.2026 -- getHospitalCardFact() + medicalFacilityAnswer() added:
// the MEDICAL_FACILITY intent's v41 "no confirmed hospital data" fallback
// was factually wrong — every port DOES have one, it just lives in
// categories.emergency.rows (top-level, icon "🩺"), not a subdetail, so
// the existing SUBDETAILS-only lookup could never see it. See the block
// itself for the full audit (all 15 ports checked directly).
//
// v7, 06.09.2026 -- robustness pass per Andrey: matching switched from
// the intent's .q TEXT to its stable "id" field (see intents-data.js
// v42) so rewording that question later can't silently break this
// wiring; the "🩺" icon lookup pulled into a named HOSPITAL_ROW_ICON
// constant and documented as an explicit CONTRACT (see the block below)
// -- regression-charger.js's new Block 8 checks it against all 15 real
// port files on disk, not a synthetic fixture, so a future icon change
// anywhere fails loudly instead of silently degrading to the generic
// fallback text.
// First working version of "the assistant reads the real port card" per
// Andrey's decision to start this now rather than wait for the offline
// dialogue system to be fully polished first. Deliberately scoped to a
// SMALL, high-confidence set of fields to prove the mechanism end-to-end
// (piloted on Vanasadam, which has the most real coordinator-confirmed
// data) — not an attempt to wire up all 173 intents in one pass. Extending
// coverage to more intents is straightforward from here: add a line to
// INTENT_CARD_MAP, confirm the subdetail's first row is actually a usable
// standalone fact (see note below), done.
//
// How it fits together with the existing SUBDETAILS data: each port's
// data/{portId}.json keys its subdetail records like "vanasadam_shops_
// pharmacies" — a per-port PREFIX plus a field suffix that's shared across
// all ports ("shops_pharmacies", "transport_taxi", ...). PORT_PREFIX below
// was extracted directly from the real files, not derived from portId by a
// formula — the prefix doesn't follow one consistent rule (compare
// "hamburg_cta" vs bare "poti" vs bare "muuga" for tallinn-muuga.json).
const PORT_PREFIX = {
  "batumi-main": "batumi",
  "constanta-north": "constanta_north",
  "constanta-south": "constanta_south",
  "hamburg-altona": "hamburg_altona",
  "hamburg-cta": "hamburg_cta",
  "hamburg-eurogate": "hamburg_eurogate",
  "hamburg-steinwerder": "hamburg_steinwerder",
  "istanbul-ambarli": "istanbul_ambarli",
  "istanbul-galataport": "istanbul_galataport",
  "istanbul-haydarpasa": "istanbul_haydarpasa",
  "klaipeda-kn-energies": "klaipeda_kn",
  "klaipeda-passenger": "klaipeda_passenger",
  "poti-main": "poti",
  "tallinn-muuga": "muuga",
  "tallinn-vanasadam": "vanasadam",
};

// Intent question -> subdetail field suffix. Picked only where the data
// is reliably a standalone usable fact across MOST of the 15 ports where
// the field exists — checked 05.09.2026 by auditing every port's actual
// first row(s) for each field, not just Vanasadam. Fields NOT here yet:
//   - centre_about / centre_services: empty on every port audited so
//     far — genuinely no confirmed Seafarers' Centre data yet almost
//     anywhere, not a bug. getPortSpecificAnswer() correctly returns
//     null for these and falls back to the generic answer.
//   - Anything not yet audited port-by-port — add here only after
//     checking, not by assumption that "similar" fields behave the same.
const INTENT_CARD_MAP = {
  "Где сесть в такси и сколько это будет стоить?": "transport_taxi",
  "Где ближайший супермаркет?": "shops_supermarkets",
  "Где купить местную SIM-карту?": "shops_sim",
  "Как доехать до центра на общественном транспорте?": "transport_public",
  "Через какие ворота выйти в город": "transport_leaving",
  "Где ближайшая аптека?": "shops_pharmacies",
  "Где недорого поесть рядом с портом?": "shops_food",
  "Безопасно ли гулять здесь вечером или ночью?": "city_safety",
  "Где ближайший обменник валюты?": "currency_exchange",
  // добавлено 05.09.2026, второй проход по всем 26 полям карточки
  "Можно ли купить местные сувениры?": "shops_souvenirs",
  "Есть ли магазин рабочей одежды?": "shops_seafarer",
  "Внутрипортовый транспорт (шаттл от причала до ворот)": "transport_internal",
  "Как добраться до центра моряков и сколько это займёт?": "centre_location",
  "Есть ли рядом бесплатный Wi-Fi?": "city_free",
  "Есть ли поблизости церковь, мечеть или храм?": "spiritual_prayer",
  "Что интересного посмотреть рядом, куда сходить погулять?": "city_culture",
  // centre_about uses a different data shape (contacts[]/hours[]) than
  // most fields -- getRealCardFact() was updated 05.09.2026 to also read
  // that shape, found via a live test asking for the seamen's centre
  // phone number, which Vanasadam's card actually has (chaplain's direct
  // line, main line) but the old extraction never looked in the right place.
  "Где ближайший центр моряков?": "centre_about",
};

// Rows that are universal safety-education advice, not a specific fact —
// found by auditing currency_exchange across all 15 ports on 05.09.2026:
// every single port leads with these exact same 5 scam-warning rows
// before the real exchange-office facts. This is a deliberate, sensible
// order for a human reading the Port tab top to bottom (learn the risk,
// then get the address) — restructuring the underlying card data would
// fix extraction but risks making that human-facing reading flow worse
// for no real reason. Skipping these known rows during EXTRACTION (not
// reordering the data itself) gets the assistant a real fact without
// touching the card. Exact-title match, not a keyword guess — these
// titles are identical verbatim across every port's currency_exchange
// field, so hardcoding them is safe and won't over-match anything else.
const KNOWN_ADVICE_ROW_TITLES = new Set([
  "A stranger offers you a better rate",
  "Being asked to go somewhere private",
  "No receipt offered",
  "Know the rough official rate first",
  "Count what you receive, before you walk away",
]);

// Pulls the first genuinely-populated, fact-like row out of a subdetail
// record. Walks ALL rows in ALL sections (not just the first one) so a
// field that leads with advice/caution rows still yields the real fact
// further down the list, instead of stopping at row one and giving up.
//
// NOT every subdetail uses the {sections:[{rows:[...]}]} shape -- found
// 05.09.2026 while chasing why "centre_about" looked empty on every port
// during the 04.09.2026 audit: it actually has real data (phone numbers,
// hours, chaplain contact for Vanasadam), just under a DIFFERENT shape —
// {title, hours:[[day,time]], contacts:[{title,sub}], note}. This function
// now also checks a top-level `contacts` array. Other "centre_*" fields
// use yet other shapes again (centre_shuttle: {from, directions, note};
// centre_services: {groups, note}) — not handled here yet, audit each
// before wiring it up rather than assuming they behave like this one.
function getRealCardFact(subdetailKey) {
  const sd = typeof SUBDETAILS !== "undefined" ? SUBDETAILS[subdetailKey] : null;
  if (!sd) return null;

  if (Array.isArray(sd.contacts)) {
    for (const c of sd.contacts) {
      if (!c.title) continue;
      return c.sub ? `${c.title} — ${c.sub}` : c.title;
    }
  }

  if (Array.isArray(sd.sections)) {
    for (const section of sd.sections) {
      if (!Array.isArray(section.rows)) continue;
      for (const row of section.rows) {
        if (!row.title) continue;
        if (KNOWN_ADVICE_ROW_TITLES.has(row.title)) continue;
        if (/scam|warning|not confirmed|tbd|coming soon|stranger/i.test(row.title + " " + (row.sub || ""))) continue;
        return row.sub ? `${row.title} — ${row.sub}` : row.title;
      }
    }
  }
  return null;
}

// intentQuestion is the .q field of the matched INTENTS[] entry (see
// findOfflineIntent() in offline-qa-match.js). Returns the raw fact
// string, or null if there's no mapping for this intent, no data loaded
// for this port, or the port's card simply doesn't have this field
// filled in yet. Split out from getPortSpecificAnswer() (which wraps this
// in a Russian sentence) 06.09.2026 so categoryFallbackAnswer() below can
// build its OWN sentence around the same raw fact instead of duplicating
// the suffix/prefix lookup.
function getRawCardFact(intentQuestion, portId) {
  const suffix = INTENT_CARD_MAP[intentQuestion];
  if (!suffix) return null;
  const prefix = PORT_PREFIX[portId];
  if (!prefix) return null;
  return getRealCardFact(`${prefix}_${suffix}`);
}

// Returns a Russian sentence wrapping the real fact, or null in all the
// cases getRawCardFact() returns null -- callers fall back to intent.a
// exactly as before this feature existed.
function getPortSpecificAnswer(intentQuestion, portId) {
  const fact = getRawCardFact(intentQuestion, portId);
  if (!fact) return null;
  // Note the English/Russian mix here: port card content is authored in
  // English across every terminal so far, while this sentence wrapper is
  // Russian -- a real language mismatch, not an oversight. Flagged to
  // Andrey as a known limitation of this first pass, not fixed here.
  return `По данным карточки этого порта: ${fact}.`;
}

// ---- CATEGORY-ANCHOR OVERRIDE, 06.09.2026 -----------------------------
// Builds the reply for resolveCategoryOverride()'s result (see
// offline-qa-match.js for the full rationale): a known CATEGORY was named
// alongside an organization name this base doesn't and won't track. If
// the port card has a real fact for the category, wrap it in the
// category's own honest "that specific place isn't confirmed, but here's
// the confirmed one" template. If the card has nothing for this field at
// this port either, fall back to the category intent's plain generic
// answer -- exactly the same fallback as an ordinary unnamed "Где
// аптека?" question gets, since claiming "the nearest one is X" when
// there is no X to point to would be worse than the plain generic advice.
function categoryFallbackAnswer(category, portId) {
  const fact = getRawCardFact(category.intentQ, portId);
  if (fact) return category.template(fact);
  const intents = typeof INTENTS !== "undefined" ? INTENTS : [];
  const intent = intents.find((i) => i.q === category.intentQ);
  return intent ? intent.a : null;
}

// ---- MEDICAL_FACILITY (hospital) CARD DATA, 06.09.2026 ----------------
// Andrey confirmed every port's card DOES have a confirmed hospital — the
// v41 "no confirmed data" fallback was wrong not because the mechanism
// was wrong, but because it was pointed at the wrong data. Checked
// directly across all 15 real port files (not assumed): the hospital
// lives in the TOP-LEVEL categories.emergency.rows array — the exact
// same data the Port tab's "Emergency Contacts" screen already renders —
// NOT in a subdetail, so getRealCardFact()/getPortSpecificAnswer() above
// can never see it (those only ever read SUBDETAILS). categories data is
// cached per-port in PORT_CONTENT_CACHE (see ensurePortContentLoaded()
// in app.js), a separate cache from SUBDETAILS, so this needs its own
// lookup rather than reusing getRawCardFact()'s subdetail-shaped path.
//
// CONTRACT, v6/v7, 06.09.2026: every one of the 15 real ports marks its
// hospital row with icon HOSPITAL_ROW_ICON below, uniquely (never more
// than one such row per port) -- checked directly, this is a real,
// working signal, not a guess. But it is a SILENT contract: nothing
// enforces it structurally, so if a future edit to any port's
// data/{portId}.json ever changes or drops that icon, or a future code
// edit changes the constant below, getHospitalCardFact() doesn't error —
// it just returns null and MEDICAL_FACILITY quietly falls back to the
// generic "no confirmed data" text for that port, with nothing in the UI
// to say why. regression-charger.js's Block 8 loads every port's REAL
// data/{portId}.json directly off disk and asserts each one still has
// exactly one row tagged with this exact icon -- run it after any change
// to either a port's emergency category or this constant.
const HOSPITAL_ROW_ICON = "🩺";

function getHospitalCardFact(portId) {
  const cache = typeof PORT_CONTENT_CACHE !== "undefined" ? PORT_CONTENT_CACHE[portId] : null;
  const rows = cache && cache.categories && cache.categories.emergency && cache.categories.emergency.rows;
  if (!Array.isArray(rows)) return null;
  const row = rows.find((r) => r.icon === HOSPITAL_ROW_ICON);
  if (!row || !row.title) return null;
  // Same "this isn't actually confirmed yet" guard as getRealCardFact()
  // above, plus the exact phrasing istanbul-haydarpasa's card uses for
  // its one still-unconfirmed hospital ("Not yet confirmed for this
  // terminal — ask your agent") -- checked directly: the shorter
  // "not confirmed" pattern does NOT match "not YET confirmed", so it's
  // added explicitly rather than assumed covered.
  if (/scam|warning|not confirmed|not yet confirmed|tbd|coming soon|stranger/i.test(row.title + " " + (row.sub || ""))) return null;
  return row.sub ? `${row.title} — ${row.sub}` : row.title;
}

// Reply builder for the MEDICAL_FACILITY intent specifically (wired in
// app.js by matching on that intent's stable "id" (v42) — see intents-
// data.js — the same way brand/category overrides are special-cased
// rather than forced through the generic getPortSpecificAnswer() path
// they don't fit). Falls back to the intent's own honest .a text —
// unchanged from v41 — when the port's hospital row isn't loaded yet or
// is itself marked unconfirmed (istanbul-haydarpasa today), so that one
// port keeps getting the correct honest answer instead of a broken
// lookup.
function medicalFacilityAnswer(portId) {
  const fact = getHospitalCardFact(portId);
  if (fact) return `«Ближайшая подтверждённая больница по данным карточки порта: ${fact}.»`;
  const intents = typeof INTENTS !== "undefined" ? INTENTS : [];
  const intent = intents.find((i) => i.id === "medical_facility");
  return intent ? intent.a : null;
}

// ---- SPECIFIC BRAND / NAMED ENTITY HANDLING, 06.09.2026 --------------
// A request naming a SPECIFIC place or chain (McDonald's, KFC, ...) --
// see BRAND_ENTITIES in offline-qa-match.js -- must never be answered
// with getPortSpecificAnswer()'s generic first-fact-in-category result:
// that's a real fact about the category (e.g. a Seamen's Centre canteen)
// but not about the brand that was actually asked about, and presenting
// it as if it answers the brand question would be actively misleading,
// not just unhelpful.
//
// No port's data/{portId}.json currently records brand-level facts at
// all (checked directly across the real files, not assumed) -- so today
// this always resolves to the honest "no confirmed data for this place"
// branch below. If brand-level card data is ever added, wiring an actual
// lookup here is the one place that needs to change; per the project's
// standing rule, that lookup must check the REAL structure of that new
// field in the JSON first, not assume it looks like any existing field.
const BRAND_CATEGORY_FOLLOWUP = {
  food: "Могу показать места, где точно можно поесть, по данным карточки этого порта — просто спроси «где поесть».",
  pharmacy: "Могу показать ближайшую аптеку по данным карточки этого порта — просто спроси «где аптека».",
  optics: "Могу показать, где купить очки или раствор для линз, по данным карточки этого порта — просто спроси «где оптика».",
};

function noConfirmedBrandDataAnswer(brand) {
  const base = `«Подтверждённых данных именно про ${brand.label} в карточке этого порта нет.»`;
  const followup = BRAND_CATEGORY_FOLLOWUP[brand.category];
  return followup ? `${base} ${followup}` : base;
}
