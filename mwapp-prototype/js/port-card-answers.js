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

// Intent question -> subdetail field suffix. Picked only where the FIRST
// row of the FIRST section is reliably a standalone usable fact across
// ports, not a warning, a category header, or empty. Checked this by hand
// against the real Vanasadam file before adding each line -- do the same
// before adding more, rather than assuming every field behaves the same
// way. Known fields that do NOT belong here yet:
//   - currency_exchange: first row on Vanasadam is a scam warning, not a
//     place to exchange money -- needs smarter extraction (skip warning
//     rows, or a dedicated "location" row), not "take row one".
//   - centre_about / centre_shuttle: genuinely empty for ports without a
//     physical Seafarers' Centre (correctly so, e.g. Vanasadam) -- getReal
//     CardFact() already returns null for these and falls back to the
//     generic answer, which is the right behaviour, not a bug to fix.
const INTENT_CARD_MAP = {
  "Где сесть в такси и сколько это будет стоить?": "transport_taxi",
  "Где ближайший супермаркет?": "shops_supermarkets",
  "Где купить местную SIM-карту?": "shops_sim",
  "Как доехать до центра на общественном транспорте?": "transport_public",
  "Через какие ворота выйти в город": "transport_leaving",
};

// Pulls the first genuinely-populated row's fact out of a subdetail record,
// skipping anything that reads as a warning/disclaimer rather than a fact
// (a crude filter, same spirit as everything else in this file -- a real
// per-field extraction strategy can replace this one field at a time as
// coverage grows past this pilot set).
function getRealCardFact(subdetailKey) {
  const sd = typeof SUBDETAILS !== "undefined" ? SUBDETAILS[subdetailKey] : null;
  if (!sd || !Array.isArray(sd.sections)) return null;
  for (const section of sd.sections) {
    if (!Array.isArray(section.rows)) continue;
    for (const row of section.rows) {
      if (!row.title) continue;
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
