// ---- PORT CARD CONNECTION (pilot, 04.09.2026) ------------------------------
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
// further down the list, instead of stopping at row one and giving up —
// this is what makes currency_exchange usable without touching the card.
function getRealCardFact(subdetailKey) {
  const sd = typeof SUBDETAILS !== "undefined" ? SUBDETAILS[subdetailKey] : null;
  if (!sd || !Array.isArray(sd.sections)) return null;
  for (const section of sd.sections) {
    if (!Array.isArray(section.rows)) continue;
    for (const row of section.rows) {
      if (!row.title) continue;
      if (KNOWN_ADVICE_ROW_TITLES.has(row.title)) continue;
      if (/scam|warning|not confirmed|tbd|coming soon|stranger/i.test(row.title + " " + (row.sub || ""))) continue;
      return row.sub ? `${row.title} — ${row.sub}` : row.title;
    }
  }
  return null;
}

// intentQuestion is the .q field of the matched INTENTS[] entry (see
// findOfflineIntent() in offline-qa-match.js). Returns a Russian sentence
// wrapping the real fact, or null if there's no mapping for this intent,
// no data loaded for this port, or the port's card simply doesn't have
// this field filled in yet -- callers should fall back to intent.a in all
// of those cases exactly as before this feature existed.
function getPortSpecificAnswer(intentQuestion, portId) {
  const suffix = INTENT_CARD_MAP[intentQuestion];
  if (!suffix) return null;
  const prefix = PORT_PREFIX[portId];
  if (!prefix) return null;
  const fact = getRealCardFact(`${prefix}_${suffix}`);
  if (!fact) return null;
  // Note the English/Russian mix here: port card content is authored in
  // English across every terminal so far, while this sentence wrapper is
  // Russian -- a real language mismatch, not an oversight. Flagged to
  // Andrey as a known limitation of this first pass, not fixed here.
  return `По данным карточки этого порта: ${fact}.`;
}
