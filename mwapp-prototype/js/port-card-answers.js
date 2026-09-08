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
//
// v8, 06.09.2026 -- dentalFallbackAnswer() added: the general MWApp
// principle of "no specialized data on the card -> safe next step from
// CONFIRMED data, not just 'no data'" applied to dental, per Andrey.
// Checks for real dental data first (none exists on any of the 15 ports
// today, checked directly), then falls back to the nearest CONFIRMED
// hospital (reusing getHospitalCardFact()) with an explicit caveat that
// this is not a claim the hospital treats dental issues -- see the block
// itself for the full reasoning.
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
  // 08.09.2026: same underlying question as above ("Кафе с Wi-Fi" is the
  // cafe-flavoured phrasing) -- mapped to the SAME field so whichever of
  // the two intents wins the match, a confirmed Wi-Fi spot (e.g. a
  // Seamen's Centre) is shown identically, never two different answers
  // for what's really one port fact. See publicTransportAnswer-style
  // reasoning: don't let two intents for one real-world question diverge
  // on which one happens to be wired to card data.
  "Кафе с Wi-Fi": "city_free",
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

// ---- SEAFARERS' CENTRE COMBINED ANSWER, 08.09.2026 ---------------------
// Found via Andrey/Markus's control-block screenshots: "centre_about"'s
// {title, hours, contacts, note} shape (documented above, 05.09.2026) has
// the CENTRE'S OWN NAME in its top-level `title` field -- but
// getRealCardFact()'s contacts-shape branch never reads that field, it
// jumps straight to contacts[0], which on the real data is a PHONE entry
// ("+372 631 8234 — Main line"). So "Где ближайший центр моряков?" was
// answering with a phone number and nothing else -- never the centre's
// actual name -- while the separate "Как добраться..." intent already
// had the real address+distance the whole time (centre_location, a
// different field, wired and working since 04.09.2026). This combines
// all three CONFIRMED pieces (name from centre_about.title, address+
// distance from centre_location, phone from centre_about.contacts) into
// one answer for the base "where is the seafarers' centre" question, per
// Andrey: "название, адрес, расстояние... телефон можно добавить".
//
// NOTE: relies on centre_about actually having a top-level `title` field
// on the real port JSON, per the 05.09.2026 audit comment above -- I
// don't have the real data/{portId}.json files in this session to verify
// directly (the project's own standing rule is to check the real
// structure before wiring a new field, not assume) -- confirm against a
// real port file before shipping; if `title` isn't actually populated,
// this degrades gracefully to address+distance+phone, still strictly
// better than the phone-only answer it replaces, never worse.
function getSeafarersCentreName(portId) {
  const prefix = PORT_PREFIX[portId];
  if (!prefix) return null;
  const sd = typeof SUBDETAILS !== "undefined" ? SUBDETAILS[`${prefix}_centre_about`] : null;
  return sd && sd.title ? sd.title : null;
}

function getSeafarersCentrePhone(portId) {
  return getRawCardFact("Где ближайший центр моряков?", portId); // still the contacts[0] phone extraction, unchanged
}

function seafarersCentreAnswer(portId) {
  const name = getSeafarersCentreName(portId);
  const location = getRawCardFact("Как добраться до центра моряков и сколько это займёт?", portId); // address + distance
  const phone = getSeafarersCentrePhone(portId);
  const facts = [name, location].filter(Boolean);
  if (facts.length === 0 && !phone) return null; // nothing confirmed at all -- caller falls back to intent.a
  let text = facts.join(" — ");
  if (phone) text += text ? `. Контакт: ${phone}` : `Контакт: ${phone}`;
  return `«По данным карточки этого порта: ${text}.»`;
}

// Shuttle-to-centre fallback (Andrey, 08.09.2026): when no confirmed
// shuttle data exists, state that plainly -- never the old "Обычно центр
// моряков сам организует трансфер" (an unconfirmed generalization about
// how centres behave, not a port fact) -- and add the confirmed centre
// phone if one exists, so the seafarer still has a way to ask directly.
function seafarersShuttleAnswer(portId) {
  const phone = getSeafarersCentrePhone(portId);
  return phone
    ? `«В карточке порта нет подтверждённых данных о бесплатном шаттле. Контакт Seafarers' Centre: ${phone}.»`
    : null; // no phone either -- caller falls back to the intent's own honest .a text
}

// ---- DENOMINATION-SPECIFIC PRAYER QUESTIONS, 08.09.2026 ----------------
// Andrey/Markus, live test: "Есть ли рядом православная церковь?" was
// getting the confirmed ECUMENICAL chapel handed back as if it answered
// the Orthodox-specific question -- factually wrong (an ecumenical chapel
// is not a claim of any specific denomination) even though the underlying
// data (spiritual_prayer) is genuinely confirmed. General principle: a
// confirmed fact about a BROADER category must never be presented as if
// it confirms a more SPECIFIC sub-question the card never actually
// answered -- same shape as BRAND_ENTITIES (a category fact isn't a
// brand fact) and the public-transport sub-questions above (a stop fact
// isn't a route-number fact). No port's card currently records
// denomination-specific data (only the general spiritual_prayer field),
// so this always states that plainly, then offers the confirmed general
// option as a next step -- never silently substitutes it as the answer.
const DENOMINATION_LABELS = [
  ["православн", "православную церковь"],
  ["католич", "католическую церковь"],
  ["протестант", "протестантскую церковь"],
  ["баптист", "баптистскую церковь"],
  ["лютеран", "лютеранскую церковь"],
  ["суннит", "суннитскую мечеть"],
  ["шиит", "шиитскую мечеть"],
  ["буддист", "буддийский храм"],
  ["иудей", "синагогу конкретно"],
  ["синагог", "синагогу"],
];

function spiritualAnswer(text, portId) {
  const msg = normalizeText(text);
  const match = DENOMINATION_LABELS.find(([marker]) => containsAnchor(msg, marker));
  if (!match) return null; // ordinary "any place to pray" phrasing -- normal card-fact path handles it
  const label = match[1];
  const fact = getRawCardFact("Есть ли поблизости церковь, мечеть или храм?", portId);
  return fact
    ? `«В карточке этого порта нет подтверждённых данных именно про ${label}. Ближайшее подтверждённое место для молитвы: ${fact}.»`
    : `«В карточке этого порта нет подтверждённых данных о религиозных объектах.»`;
}

// ---- TAXI PRICE SUB-QUESTION + OFFLINE-USABLE FALLBACK, 08.09.2026 -----
// Andrey, live test: the confirmed card fact is app-based pickup
// instructions ("Bolt — Set pickup to ..."). Andrey pointed out the real
// gap -- a rideshare app needs internet to actually REQUEST a ride, not
// just to be installed, so this instruction alone isn't actually
// actionable for a seafarer who is offline precisely because they're
// asking Sofia. The intent's own generic .a text (used when nothing is
// confirmed at all) already had a good internet-free fallback ("ask port
// security/the agent to call an official taxi"), but the old either/or
// wiring (card fact OR .a) meant that advice silently disappeared the
// moment a port had confirmed app-based data -- exactly backwards, since
// that's the port where the advice is MOST needed. Now: append the
// security/agent tip whenever the confirmed fact doesn't itself contain
// something phone-shaped (a coordinator-confirmed taxi phone number would
// make the tip redundant, so it's skipped in that case; no such field is
// mapped today, so `hasPhone` will practically always be false until one
// is -- see the conversation with Andrey on adding a dedicated phone
// field to the coordinator questionnaire, not done here).
//
// Price sub-question detection unchanged from the first pass: check for a
// price-shaped question; if the confirmed fact doesn't itself contain a
// price (crude currency/number-with-currency check -- "Gate 1" has a
// digit but isn't a price), state plainly that cost isn't confirmed.
const TAXI_PRICE_MARKERS = ["сколько стоит", "стоимост", "почем", "цена такси"];
const PRICE_SHAPED = /[€$£]\s?\d+|\d+\s?(eur|usd|gbp|€|\$)/i;
const PHONE_LIKE = /\+?\d[\d\s\-()]{6,}\d/;

function taxiAnswer(text, portId) {
  const msg = normalizeText(text);
  const fact = getRawCardFact("Где сесть в такси и сколько это будет стоить?", portId);
  if (!fact) return null; // nothing confirmed -- caller falls back to the intent's own generic .a, which already suggests asking security

  const hasPhone = PHONE_LIKE.test(fact);
  const securityTip = hasPhone ? "" : " Также можно попросить охрану порта или судового агента вызвать такси.";
  const asksPrice = TAXI_PRICE_MARKERS.some((m) => containsAnchor(msg, m));
  const hasPrice = PRICE_SHAPED.test(fact);

  if (asksPrice && !hasPrice) {
    return `«В карточке этого порта нет подтверждённых данных о стоимости такси. Для заказа: ${fact}.${securityTip}»`;
  }
  return `«По данным карточки этого порта: ${fact}.${securityTip}»`;
}

// ---- CITY SAFETY: TIME-OF-DAY SCOPE + SAFE ZONE, 08.09.2026 -----------
// Andrey/Markus, live test: the confirmed city_safety fact on real port
// cards is itself DAY-scoped ("Safe but inconvenient by day — Industrial
// zone, missing pavements in places") -- Muuga's card text says so
// explicitly. Handing that same fact back for an evening/night question
// would silently claim it covers night safety when the card never said
// that -- the same "a confirmed fact about a narrower scope must never
// answer a broader/different one" principle as the transport sub-
// questions and the denomination check above, just running the check
// against the FACT's own wording instead of a fixed field-shape gap.
// DAY-scope detection is a plain substring check on the card's own text
// (English-authored port cards, per the known language-mismatch note on
// getPortSpecificAnswer above) -- not a guess about what the port is
// actually like.
//
// "Safe Zone" (capitalised term Andrey/Markus use) is a separate check:
// no port's city_safety field is confirmed to name a formally-designated
// Safe Zone today, so a "Safe Zone?" question gets its own honest
// no-data line unless the raw fact text itself happens to say so.
const DAY_ONLY_MARKERS = /\bby day\b|\bdaytime\b|\bduring the day\b/i;
const NIGHT_MARKERS = /\bnight\b|\bevening\b|\bafter dark\b/i;
const EVENING_NIGHT_QUESTION = /вечер|ночь/;
const SAFE_ZONE_QUESTION = /safe zone/i;

function citySafetyAnswer(text, portId) {
  const msg = normalizeText(text);
  const fact = getRawCardFact("Безопасно ли гулять здесь вечером или ночью?", portId);

  if (SAFE_ZONE_QUESTION.test(msg)) {
    return fact && SAFE_ZONE_QUESTION.test(fact)
      ? `«По данным карточки этого порта: ${fact}.»`
      : "«В карточке этого порта нет подтверждённых данных о Safe Zone.»";
  }

  if (EVENING_NIGHT_QUESTION.test(msg) && fact && DAY_ONLY_MARKERS.test(fact) && !NIGHT_MARKERS.test(fact)) {
    return "«В карточке этого порта нет подтверждённых данных о безопасности вечером/ночью.»";
  }

  return null; // ordinary phrasing, or the fact isn't day-only -- normal card-fact path handles it
}


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

// ---- DENTAL FALLBACK, 06.09.2026 --------------------------------------
// General MWApp principle behind this, per Andrey: if a specialized
// service isn't on the card, don't stop at "no data" -- give a safe next
// step built ONLY from what the card actually confirms. Dental is the
// first concrete case of this, not a one-off: the same shape (try the
// specific service, then fall back to the nearest confirmed general
// facility with an explicit "this isn't a claim that place offers X"
// caveat) is the template for any future specialized service that turns
// out not to be tracked on a card.
//
// Step 1 -- check for CONFIRMED dental data the normal way, through
// INTENT_CARD_MAP, exactly like every other intent. Checked directly,
// 06.09.2026: no port's data/{portId}.json has ANY dental-specific field
// today, in subdetails or categories -- not guessed, actually searched
// all 15 real files. So this always falls through to step 2 right now.
// If a coordinator ever adds real dental data and someone maps it in
// INTENT_CARD_MAP (intents-data.js's "q" -> subdetail suffix, same
// process as every other field), this picks it up automatically with NO
// further code change here.
//
// Step 2 -- no confirmed dentistry: state that plainly, then point to
// the nearest CONFIRMED hospital -- reusing getHospitalCardFact(), the
// exact same categories.emergency "🩺" data medical_facility already
// uses, not a new lookup. Critically, this NEVER claims the hospital
// itself provides dental care -- it directs the seafarer to ask there,
// nothing stronger. Only whatever text the card itself confirms (title,
// address, distance, hours) is shown; a phone number appears ONLY when
// the port's own row text happens to include one (checked directly:
// batumi/constanta/poti do, tallinn/klaipeda/istanbul mostly don't) --
// nothing is invented either way.
//
// Step 3 -- no confirmed hospital either (istanbul-haydarpasa today, or
// data not loaded yet): falls back to the DENTAL intent's own original
// .a text, unchanged, which already points to the Seafarers' Centre and
// Emergency Contacts.
//
// Emergency priority is untouched by any of this: isMedicalEmergencyTopic()
// (offline-qa-match.js) is checked in app.js BEFORE the intent table is
// even reached, so a message with real emergency signals never gets this
// far regardless of dental wording in the same message.
function dentalFallbackAnswer(portId) {
  const dentalFact = getRawCardFact("Что делать, если заболел зуб?", portId);
  if (dentalFact) return `«По данным карточки этого порта: ${dentalFact}.»`;

  const noDentalLine = "В карточке этого порта нет подтверждённой стоматологии.";
  const hospitalFact = getHospitalCardFact(portId);
  if (hospitalFact) {
    return `«${noDentalLine} Но вы можете обратиться в приёмное отделение ближайшей подтверждённой больницы и уточнить, где получить срочную стоматологическую помощь: ${hospitalFact}.»`;
  }
  const intents = typeof INTENTS !== "undefined" ? INTENTS : [];
  const intent = intents.find((i) => i.id === "dental");
  return intent ? intent.a : `«${noDentalLine}»`;
}

// ---- PUBLIC TRANSPORT SUB-QUESTION HONESTY, 08.09.2026 ----------------
// Found via Markus's control-block screenshots: "public_transport_city"
// is one OFFLINE_CORE bucket for several genuinely different
// sub-questions -- "how do I get to the centre", "where's the stop",
// "which bus number", "how long does it take" -- but every port's card
// only ever has ONE unstructured transport_public fact (almost always
// just the confirmed STOP location, never a route number or a travel
// time). Handing that same stop fact back as if it answered "which bus
// number?" or "how long does it take?" would be misleading, not just
// unhelpful -- it reads as an answer to a question the card never
// actually confirmed.
//
// Checks the SEAFARER'S OWN WORDING (the matched intent is identical for
// all these sub-phrasings, so this can't be told apart at the intent
// level) for two narrow, high-confidence patterns and answers those
// honestly instead of silently substituting the stop fact. Anything else
// (the ordinary "how do I get to the centre" / "where's the stop" shape)
// falls through to the existing getPortSpecificAnswer() path, unchanged.
// Wired in app.js by the intent's stable "id" (public_transport_city,
// intents-data.js), same pattern as medicalFacilityAnswer/dentalFallbackAnswer.
const BUS_NUMBER_MARKERS = ["какой автобус", "номер автобуса", "номер маршрута", "какой маршрут", "какой номер"];
const TRAVEL_TIME_MARKERS = ["сколько времени", "сколько времен", "как долго", "за сколько времени", "минут ехать", "минут на автобусе"];

function publicTransportAnswer(text, portId) {
  const msg = normalizeText(text);
  if (TRAVEL_TIME_MARKERS.some((m) => containsAnchor(msg, m))) {
    return "«В карточке порта нет подтверждённых данных о времени поездки до центра.»";
  }
  if (BUS_NUMBER_MARKERS.some((m) => containsAnchor(msg, m))) {
    const stopFact = getRawCardFact("Как доехать до центра на общественном транспорте?", portId);
    return stopFact
      ? `«Подтверждённого номера автобусного маршрута в карточке порта нет. Ближайшая остановка по данным карточки: ${stopFact}.»`
      : "«Подтверждённого номера автобусного маршрута в карточке порта нет.»";
  }
  return null; // ordinary "how to get there" phrasing -- let the normal card-fact path answer it
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
