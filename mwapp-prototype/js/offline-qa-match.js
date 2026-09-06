// ---- OFFLINE INTENT MATCHING (v2, 04.09.2026) -----------------------------
//
// v11, 06.09.2026 -- BRAND_ENTITIES + detectBrandEntity() added: a general,
// extensible mechanism so a request naming a SPECIFIC brand/place (see
// conversation) is flagged independently of intent scoring, letting the
// caller (app.js) refuse to answer it with a generic category card fact.
// See the block itself for the full rationale.
//
// v12, 06.09.2026 -- Benu (pharmacy) and Specsavers (optics) added to
// BRAND_ENTITIES per Andrey's "Block 3" live test -- same mechanism,
// no code change, confirming the list is genuinely extensible as
// designed.
//
// v13, 06.09.2026 -- CATEGORY_ANCHORS + resolveCategoryOverride() added:
// a general (non-brand-database) rule so an unrecognized organization
// NAME attached to a known CATEGORY word ("аптека", "супермаркет",
// "кафе") can never tie the category into UNKNOWN or hijack an unrelated
// intent via incidental word overlap. See the block itself for the full
// rationale and why it deliberately reuses each category intent's
// existing `exclude` list rather than adding a new mechanism for
// "deliberate vs accidental" deferral.
//
// v14, 06.09.2026 -- MEDICAL_EMERGENCY_KEYWORDS + isMedicalEmergencyTopic()
// added: a dedicated, deterministic, DOM-free ambulance/emergency
// detector, called from app.js BEFORE the scored intent table at all.
// Root cause and full rationale in the block itself; lives here (not
// app.js) specifically so regression-charger.js can test it directly,
// same reason detectBrandEntity/resolveCategoryOverride live here.
//
// v15, 06.09.2026 -- false positive found live ("Скоро буду в порту" ->
// emergency): root cause was the SEPARATE scored intent's bare "скор"
// stem (fixed in intents-data.js v44), not this function, but this
// function was also switched from plain substring to containsAnchor()
// (word-boundary aware) per Markus's request, and a conditional
// "медицинская помощь" + explicit urgency word check was added. Full
// story in the block itself.
//
// v16, 06.09.2026 -- COMPOUND ANCHORS added to scoreIntent(): a general,
// reusable mechanism (Markus explicitly wants the same shape reused for
// other languages later) for topics that only make sense when two
// independent word groups are BOTH present, order-independent -- e.g.
// DENTAL: a tooth-noun form AND a medical action/symptom word, since a
// bare tooth-noun must not be a standalone trigger. See the block itself
// for the full rationale and why this is additive/zero-risk for every
// other intent.
// Replaces the 03.09.2026 approach (compare seafarer's message to the
// QUESTION TEXT itself) with matching against hand-picked ANCHOR WORDS per
// intent, built by Andrey/Markus/Olga from real field phrasing. This fixes
// the two root causes of yesterday's live bugs:
//   - the question text has accidental filler words ("в этом городе") that
//     used to compete with real content words for the match score;
//   - the question text doesn't include synonyms ("перекусить" vs "поесть")
//     that a real seafarer might actually type.
// Anchors are already synonym-aware and curated by hand instead.
//
// No generative model, no network call — every output is one of the
// pre-approved INTENTS[].a strings (or a COMPANION_INTENTS[].replies pick),
// or no match at all. Still keyword-based, not understanding, so it will
// still miss a genuinely novel phrasing nobody anticipated — that's an
// inherent limit of this approach, not a bug to chase to zero.

// ---- GENERIC / CONTEXT WORDS -----------------------------------------
// Proposed by Markus after a live test (04.09.2026) surfaced exactly this
// failure: "где купить папку для бумаг" and "где купить подарок жене" were
// both getting pulled toward unrelated intents (antibiotics, lost-way-back)
// purely because "купить"/"порт" happened to sit in those intents' anchor
// lists too. Rather than hunting down every intent that happens to list a
// generic word (which is what the two manual fixes earlier today were —
// "купить" removed from the antibiotics intent, "взять" from the
// documents-ashore intent) — this list makes it a CODE-LEVEL rule instead
// of a data-hygiene one: these words score ZERO no matter which anchor
// list they're found in, on any intent, present or future. A word ending
// up here should never need a second manual per-intent fix again.
const GENERIC_CONTEXT_WORDS = new Set([
  "где", "купить", "можно", "рядом", "здесь", "тут", "порт", "сколько", "хочу",
  "нужен", "нужна", "нужны", "нужно", "взять", "надо", "есть", "цена", "стоит",
  "разрешен", "разрешено", "делать", "далеко", "близко", "туда", "сюда", "там",
  "город", "время", "минут", "центр",
  "это", "мне", "меня", "я", "и", "в", "на", "с",
  "where", "buy", "can", "near", "here", "there", "how much", "want", "need",
  "price", "cost", "allowed", "port", "city", "time", "minutes", "center", "centre",
]);

function isGeneric(anchor) {
  return GENERIC_CONTEXT_WORDS.has(anchor.toLowerCase());
}

// Suggested by Markus 05.09.2026, both cheap and clearly worth doing:
// ё/е are the same letter for matching purposes (мёрзну/мерзну), and
// common tech-term spelling variants (Type-C / Type C / TypeC, USB-C /
// USB C / USBC) should all collide to one anchor instead of needing every
// spelling enumerated separately in every intent that mentions them.
const SPELLING_VARIANTS = [
  [/\btype[\s-]?c\b/gi, "type-c"],
  [/\busb[\s-]?c\b/gi, "usb-c"],
  [/\bmicro[\s-]?usb\b/gi, "micro-usb"],
  [/\bwi[\s-]?fi\b/gi, "wi-fi"],
];

function normalizeText(text) {
  let t = text.toLowerCase().replace(/ё/g, "е");
  for (const [pattern, replacement] of SPELLING_VARIANTS) {
    t = t.replace(pattern, replacement);
  }
  return t
    .replace(/[«»"'.,!?;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isWordCharAt(message, index) {
  if (index < 0 || index >= message.length) return false;
  return WORD_START.test(message[index]);
}

const WORD_START = /[\wа-яё]/i;

function containsAnchor(normalizedMessage, anchor) {
  // ё->е must happen on the ANCHOR too, not just the incoming message --
  // normalizeText() already converts а seafarer's "нашел" and a stored
  // anchor's "нашёл" to the same "е", but containsAnchor() was still
  // comparing the RAW anchor string. Found 05.09.2026: this silently broke
  // 24 anchors across the base ("нашёл", "дешёв", "счётчик", "тёплая"...),
  // including the meta-question's own "не нашёл" failing to match its own
  // canonical text once "что делать" was removed as a competing anchor.
  const a = anchor.toLowerCase().replace(/ё/g, "е");
  if (a.length > 5) return normalizedMessage.includes(a);
  let from = 0;
  while (true) {
    const idx = normalizedMessage.indexOf(a, from);
    if (idx === -1) return false;
    const startOk = !isWordCharAt(normalizedMessage, idx - 1);
    const endOk = a.length > 3 || !isWordCharAt(normalizedMessage, idx + a.length);
    if (startOk && endOk) return true;
    from = idx + 1;
  }
}

function countHits(normalizedMessage, anchors, { excludeGeneric } = {}) {
  let n = 0;
  for (const a of anchors || []) {
    if (excludeGeneric && isGeneric(a)) continue;
    if (containsAnchor(normalizedMessage, a)) n++;
  }
  return n;
}

function anyExcluded(normalizedMessage, exclude) {
  for (const ex of exclude || []) if (containsAnchor(normalizedMessage, ex)) return true;
  return false;
}

// Rewritten 04.09.2026 per Markus's proposal: generic words are worth
// nothing (handled by countHits' excludeGeneric flag, not by weight alone —
// a word can't "win by volume" by appearing in five different intents'
// lists), a real PRIMARY hit is mandatory for the intent to be considered
// at all, and the weighting (primary x3, synonym x1) makes a single
// specific word outweigh several generic ones every time.
//
// Refined 05.09.2026: a multi-word PHRASE anchor ("центр моряков") is
// inherently much stronger evidence than a single common word ("номер",
// "телефон", "позвонить") -- found via a real long message ("я хочу
// позвонить в центр моряков, есть номер телефона") that tied 12 different
// intents at score 3 each, one common word apiece, with the actually-
// correct phrase match getting no more credit than any of them. Anchors
// containing a space now score higher (x5) than single-word primary hits
// (x3) -- a phrase match essentially never happens by accident the way a
// bare common word does.
function countWeightedPrimaryHits(normalizedMessage, anchors) {
  let score = 0;
  for (const a of anchors || []) {
    if (isGeneric(a)) continue;
    if (!containsAnchor(normalizedMessage, a)) continue;
    score += a.includes(" ") ? 5 : 3;
  }
  return score;
}

function scoreIntent(normalizedMessage, intent) {
  if (anyExcluded(normalizedMessage, intent.exclude)) return -1;
  let primaryScore = countWeightedPrimaryHits(normalizedMessage, intent.primary);
  if (primaryScore === 0 && hasCompoundAnchorMatch(normalizedMessage, intent.compoundAnchors)) {
    primaryScore = COMPOUND_ANCHOR_SCORE;
  }
  if (primaryScore === 0) return 0; // no topic-defining word present -> not a candidate, full stop
  const synonymHits = countHits(normalizedMessage, intent.synonyms, { excludeGeneric: true });
  return primaryScore + synonymHits;
}

// ---- COMPOUND ANCHORS, 06.09.2026 --------------------------------------
// Added for DENTAL per Markus, scoped as a genuinely new, general
// mechanism (not a one-off dental hack) since he explicitly wants the
// same shape reused for other languages once Russian is stable: some
// topics are only real when TWO independent word groups are BOTH
// present, with word ORDER irrelevant ("зубы лечить" / "лечить зубы" /
// "где лечить зубы" must all resolve the same way) -- a plain PRIMARY
// list can't express "A AND B", only "A OR B".
//
// `intent.compoundAnchors` is an optional array of anchor-groups, e.g.
// `[["зуб","зубы"], ["болит","лечить"]]` -- ALL groups must have at
// least one matching anchor SOMEWHERE in the message (any order, any
// distance apart) for this to count. Deliberately does NOT replace or
// weaken `primary`: an intent can have both, and compoundAnchors is only
// even checked when primary alone found nothing (primaryScore === 0) --
// see scoreIntent above. Every other intent's `compoundAnchors` is
// simply undefined, so this is a no-op for all 179 other intents;
// nothing about their scoring changes.
//
// Why this exists instead of just adding "зуб"/"зубы"/"зубов" etc.
// straight to DENTAL's primary list: Markus was explicit that a bare
// tooth-noun must NOT be a standalone trigger on its own, specifically
// so a message that only mentions teeth in an unrelated way stays out of
// dental -- the topic only becomes real once combined with an actual
// medical action or symptom word. (Separately, and worth noting: the
// tooth-NOUN family "зуб/зуба/зубы/зубов" and the "зубная паста"/"зубная
// щётка" ADJECTIVE family both happen to start with visually similar
// letters but are different stems -- "зуб-" vs "зубн-" -- and were
// already proven not to collide via containsAnchor's boundary rule
// before this change; that's not what compoundAnchors is protecting
// against. It exists for the AND-condition itself.)
const COMPOUND_ANCHOR_SCORE = 4;

function hasCompoundAnchorMatch(normalizedMessage, compoundAnchors) {
  if (!Array.isArray(compoundAnchors) || compoundAnchors.length === 0) return false;
  return compoundAnchors.every((group) =>
    (group || []).some((a) => !isGeneric(a) && containsAnchor(normalizedMessage, a))
  );
}

// Minimum score to accept ANY answer at all (roughly: one real primary hit).
// Below this, findOfflineAnswer returns null and the caller falls through
// to the honest "not my topic" / "didn't understand" replies instead of
// guessing — this is the INTENT_UNKNOWN floor Markus asked for.
const CONFIDENCE_THRESHOLD = 3;

// If the best and second-best candidates are this close, treat it as a
// genuine tie between two different topics rather than picking one --
// e.g. a message that could plausibly be about either a shop or a taxi.
// Better to say nothing (and let the honest fallback handle it) than to
// silently pick one and be wrong half the time.
const AMBIGUITY_MARGIN = 1;

// Composite-query override, proposed by Markus/Andrey 04.09.2026 for the
// FOOD <-> COFFEE mutual-exclusion deadlock: "Где выпить кофе и что-нибудь
// поесть?" mentions both topics' own strong anchors, so each intent's
// exclusion of the OTHER topic (correct when asked about alone) cancels
// both out and the message falls to UNKNOWN. Rather than removing the
// exclusions (which would reintroduce the original cross-contamination
// risk for single-topic questions), this checks for "both topics'
// anchors present at once" as a distinct case FIRST and answers a
// combined "cafe that does both" reply directly, bypassing both
// exclusions only for this specific combination. Add more entries here
// the same way if another such deadlock pair turns up.
const COMBO_OVERRIDES = [
  {
    id: "food_coffee",
    aAnchors: ["поест", "еда", "перекус", "обед"],
    bAnchors: ["кофе", "капучин", "эспресс", "американо"],
    answer:
      "«В портовых городах почти всегда есть кафе, где можно и перекусить, и выпить кофе — обычно недалеко от входа в порт. Ищи вывески «кафе» или заведения фастфуда, там обычно есть и то, и другое.»",
  },
];

function findComboOverride(normalizedMessage) {
  for (const combo of COMBO_OVERRIDES) {
    const hasA = combo.aAnchors.some((a) => containsAnchor(normalizedMessage, a));
    const hasB = combo.bAnchors.some((a) => containsAnchor(normalizedMessage, a));
    if (hasA && hasB) return combo.answer;
  }
  return null;
}

// ---- SPECIFIC BRAND / NAMED ENTITY DETECTION, 06.09.2026 -------------
// General principle from Andrey/Markus's live test: a request naming a
// SPECIFIC place or chain must never be silently answered with a generic
// category fact from the port card. "макдак"/"KFC" correctly matched the
// FOOD intent's category (that part is right) but then got handed the
// FIRST unrelated fact in that port's shops_food card field (a Seamen's
// Centre canteen) as if it were an answer about McDonald's specifically.
// This is a genuinely different concern than intent SCORING (which anchor
// list an intent belongs to) -- it's about what the REPLY is allowed to
// be once a category is known, so it's checked independently, not as
// another anchor tier inside scoreIntent().
//
// Deliberately a flat, extensible list, not per-brand code: add a brand
// here and both the FOOD intent match (existing anchors, unchanged) and
// the "don't fall back to a generic card fact" behavior in app.js cover
// it automatically. See noConfirmedBrandDataAnswer() in
// port-card-answers.js for how the honest reply text is built from
// `category`.
const BRAND_ENTITIES = [
  { anchors: ["макдональдс", "макдак", "mcdonald"], category: "food", label: "McDonald's" },
  { anchors: ["kfc", "кфс"], category: "food", label: "KFC" },
  { anchors: ["бургер кинг", "burger king"], category: "food", label: "Burger King" },
  { anchors: ["benu"], category: "pharmacy", label: "Benu" },
  { anchors: ["specsavers"], category: "optics", label: "Specsavers" },
];

function detectBrandEntity(text) {
  const msg = normalizeText(text);
  if (!msg) return null;
  for (const brand of BRAND_ENTITIES) {
    if (brand.anchors.some((a) => containsAnchor(msg, a))) return brand;
  }
  return null;
}

// ---- MEDICAL EMERGENCY (ambulance) DETECTION, 06.09.2026 --------------
// Found live: "Мне нужна скорая помощь" was landing in the generic
// "unclear" fallback. Root cause, confirmed by running the FULL message
// pipeline (not just findOfflineIntent() in isolation, which is all prior
// testing this session had actually exercised): the scored intent "Какой
// номер экстренных служб?" (primary "скор", synonym "помощь") TIES 4-4
// with the unrelated "Мне плохо, что делать?" intent (primary "помощь",
// synonym "скора" -- "скора" is a substring of "скорая", both anchors
// firing on the same message). A genuine tie under AMBIGUITY_MARGIN
// returns null, which is exactly the UNKNOWN that fell through to
// "unclear". This is a PRE-EXISTING collision, not something introduced
// by any change this session -- neither intent's anchors were touched
// before now -- it simply hadn't been tested with the literal word
// "помощь" attached to "скорая" until this report. (The intent-level tie
// is ALSO fixed directly -- "Мне плохо" now excludes "скорая"/"скорую",
// intents-data.js v43 -- as defense in depth, but that alone wasn't
// judged sufficient given the safety stakes; see below.)
//
// Given those stakes, this is handled the same way BRAND_ENTITIES/
// CATEGORY_ANCHORS are: a dedicated, deterministic check, independent of
// intent SCORING, so a call for an ambulance can never again lose a tie
// to an unrelated intent no matter what anchors get added to either side
// in the future. Lives here (not app.js) specifically so it has no DOM
// dependency and regression-charger.js can test it directly, the same
// reason detectBrandEntity/resolveCategoryOverride live here. app.js
// calls this BEFORE isComplexTopic, companion chat, or the intent table
// -- see the priority order in sendAssistantChatMessage.
//
// v15, 06.09.2026 -- FALSE POSITIVE found live: "Скоро буду в порту" was
// firing this check. Root cause was NOT this function -- it tested clean
// against every negative example even before this fix -- it was the
// SEPARATE scored intent "Какой номер экстренных служб?", whose PRIMARY
// anchor was bare "скор" (4 letters): containsAnchor()'s boundary rule
// only checks a LEFT boundary for anchors longer than 3 characters, not a
// right one, so "скор" happily prefix-matched "скоро"/"скорость"/
// "скоростной" too. Fixed at the data layer the same way every other
// over-broad stem has been fixed all session: "скор" replaced with the
// exact inflected forms that actually mean ambulance -- "скорая"/
// "скорую"/"скорой" -- intents-data.js v44.
//
// Also switched this function from plain normalizedMessage.includes(kw)
// to containsAnchor(), per Markus's explicit request to check word
// boundaries rather than raw substring/root matching. All markers here
// are either exact 6+ letter words (already effectively safe even under
// containsAnchor's right-boundary exemption, since nothing in real RU
// extends "скорая"/"скорую"/"скорой" into an unrelated word the way
// "скор" did) or clean multi-word phrases -- containsAnchor's LEFT
// boundary check is what actually matters here, and is worth having
// uniformly rather than only where it happened to bite.
//
// Also added, per Markus's spec: "медицинская помощь" alone is too
// generic to fire on its own (a seafarer could mention needing ongoing
// medical care with zero urgency), so it only counts combined with an
// explicit urgency word -- see MEDICAL_URGENCY_WORDS below. This is a
// narrow AND-condition, not a new broad anchor: it requires the specific
// 2-word phrase "медицинская помощь" AND a separate urgency word, not
// just "помощь" alone (which is exactly the kind of bare generic word
// that caused the original "Мне плохо" tie in the first place).
const MEDICAL_EMERGENCY_KEYWORDS = [
  "скорая", "скорую", "скорой",
  "вызвать скорую", "нужна скорая", "скорая помощь",
  "экстренная помощь", "срочная медицинская помощь",
  "ambulance", "emergency", "medical emergency",
  "call an ambulance", "need an ambulance",
];

const MEDICAL_URGENCY_WORDS = ["срочно", "срочная", "срочный", "экстренно", "немедленно"];

function isMedicalEmergencyTopic(text) {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  if (MEDICAL_EMERGENCY_KEYWORDS.some((kw) => containsAnchor(normalized, kw))) return true;
  if (containsAnchor(normalized, "медицинская помощь") && MEDICAL_URGENCY_WORDS.some((w) => containsAnchor(normalized, w))) {
    return true;
  }
  return false;
}

// Returns the matched INTENT OBJECT itself (not just .a) -- needed so a
// caller can look up port-specific real data for this exact intent (see
// port-card-answers.js) before falling back to the generic .a text.
// findOfflineAnswer() below is now a thin wrapper kept for anything that
// only ever needed the text.
function findOfflineIntent(text) {
  const msg = normalizeText(text);
  if (!msg) return null;
  if (findComboOverride(msg)) return null; // combo answers have no single backing intent to attach card data to
  let best = null, bestScore = 0, secondScore = 0;
  for (const intent of typeof INTENTS !== "undefined" ? INTENTS : []) {
    const score = scoreIntent(msg, intent);
    if (score > bestScore) {
      secondScore = bestScore;
      bestScore = score;
      best = intent;
    } else if (score > secondScore) {
      secondScore = score;
    }
  }
  if (!best || bestScore < CONFIDENCE_THRESHOLD) return null;
  if (bestScore - secondScore < AMBIGUITY_MARGIN) return null;
  return best;
}

function findOfflineAnswer(text) {
  const msg = normalizeText(text);
  if (!msg) return null;
  const combo = findComboOverride(msg);
  if (combo) return combo;
  const intent = findOfflineIntent(text);
  return intent ? intent.a : null;
}

// ---- CATEGORY-ANCHOR OVERRIDE, 06.09.2026 -----------------------------
// General principle from Andrey: when a message explicitly names a KNOWN
// CATEGORY (pharmacy/supermarket/cafe/...) alongside a specific
// organization NAME the offline base has never heard of -- and never will,
// per Andrey's explicit instruction NOT to build a database of every
// pharmacy/shop/cafe brand in Europe -- the unrecognized name must never
// (a) tie the category into UNKNOWN, or (b) accidentally activate a
// DIFFERENT intent just because the name happens to share a real word
// with that intent's own anchors (e.g. a pharmacy literally named "Скорая
// помощь" sharing a word with the emergency-services intent). The
// category is the confirmed part of the request; the name is not, and
// must never outweigh it.
//
// Deliberately NOT a brand database (see BRAND_ENTITIES above for the
// small, curated, name-specific exception to that rule) -- this is a
// content-free structural rule about a handful of CATEGORY-DEFINING
// intents, not about any specific organization. "Where's the [category]
// [unknown name]?" is a shape of question, not a lookup table entry.
//
// Deliberately reuses each category intent's own `exclude` list as one
// signal for "this is a DELIBERATE handoff", and, more importantly, only
// treats a result as a name collision when normal resolution produced
// NO winner at all (a genuine tie, or nothing above the confidence floor)
// -- never when some OTHER intent won CLEANLY with a real margin. That
// second condition is what keeps this from swallowing legitimate wins:
// "Есть ли аптека с антибиотиками без рецепта?" contains "аптек" (the
// category anchor) but the antibiotics intent WINS outright (score 4 vs
// pharmacy's 3, via its own "аптека" synonym) -- a real, specific,
// correctly-scored match, not a name collision, and must be left alone.
// PHARMACY already excludes itself for "зубн"/"обезболив"/"линз"/etc (see
// v40) so DENTIST/PAINKILLER/LENS also win cleanly this same way. This
// mechanism can only ever fire on the ambiguity/UNKNOWN failure mode
// (like the "Скорая помощь" example) -- it deliberately does NOT try to
// catch a foreign intent winning outright via an unlucky word in the
// unrecognized name, since telling that apart from a real topic match
// (antibiotics) isn't reliably decidable by keyword matching, and a
// missed edge case here is a far smaller risk than reopening the
// specific-beats-generic fixes from the last two rounds.
//
// Only 3 categories today because only 3 have a dedicated intent in the
// base (checked directly, 06.09.2026: no "shopping centre / mall" intent
// exists yet) -- the mechanism extends to a 4th the moment one does, same
// as BRAND_ENTITIES: add an entry, no other code changes.
const CATEGORY_ANCHORS = [
  {
    id: "pharmacy",
    anchors: ["аптек"],
    intentQ: "Где ближайшая аптека?",
    template: (fact) => `«Адрес именно этой аптеки у меня не подтверждён. Ближайшая аптека по данным карточки порта: ${fact}.»`,
  },
  {
    id: "supermarket",
    anchors: ["супермаркет"],
    intentQ: "Где ближайший супермаркет?",
    template: (fact) => `«Адрес именно этого супермаркета у меня не подтверждён. Ближайший супермаркет по данным карточки порта: ${fact}.»`,
  },
  {
    id: "food",
    anchors: ["кафе"],
    intentQ: "Где недорого поесть рядом с портом?",
    template: (fact) => `«Это конкретное заведение у меня не подтверждено. Подтверждённый вариант, где поесть, по данным карточки порта: ${fact}.»`,
  },
];

function resolveCategoryOverride(text) {
  const msg = normalizeText(text);
  if (!msg) return null;
  const intents = typeof INTENTS !== "undefined" ? INTENTS : [];
  for (const category of CATEGORY_ANCHORS) {
    if (!category.anchors.some((a) => containsAnchor(msg, a))) continue;
    const categoryIntent = intents.find((i) => i.q === category.intentQ);
    if (!categoryIntent) continue;
    if (anyExcluded(msg, categoryIntent.exclude)) return null; // deliberate handoff -- leave the normal result alone
    if (findOfflineIntent(text)) return null; // something won cleanly (the category itself, or a legitimately more specific intent) -- never override a clean win
    return { category, categoryIntent };
  }
  return null;
}

// Companion chat (Block 26): same generic-word and confidence-floor rules,
// lower stakes (worst case is a slightly-off friendly reply, not a wrong
// factual answer), so no ambiguity-margin check here -- picking one warm
// reply over another tied one costs nothing.
//
// Some topics (currently just the neutral "привет"-style greeting) carry
// a `timeReplies` array instead of a flat `replies` list -- each entry
// tagged with an hour range (`from`/`to`, wraps past midnight when
// from > to, e.g. 23→5). When the caller passes `localHour` (the PORT's
// local hour, not the device's own -- see getPortLocalHour() in app.js,
// computed from the port's tz offset, no internet required), the
// matching range is used instead of a random pick. A topic matched via an
// EXPLICIT time word the seafarer typed ("добрый вечер") still just uses
// its own flat `replies` list -- say what they said, don't second-guess
// it with the real clock.
function pickCompanionReply(topic, localHour) {
  if (Array.isArray(topic.timeReplies) && topic.timeReplies.length > 0) {
    if (typeof localHour === "number") {
      for (const slot of topic.timeReplies) {
        const inRange = slot.from <= slot.to
          ? localHour >= slot.from && localHour < slot.to
          : localHour >= slot.from || localHour < slot.to; // wraps past midnight
        if (inRange) return slot.text;
      }
    }
    return topic.timeReplies[Math.floor(Math.random() * topic.timeReplies.length)].text;
  }
  const variants = topic.replies || [];
  if (variants.length === 0) return null;
  return variants[Math.floor(Math.random() * variants.length)];
}

function scoreCompanion(normalizedMessage, topic) {
  return countHits(normalizedMessage, topic.primary, { excludeGeneric: true });
}

function findCompanionReply(text, localHour) {
  const msg = normalizeText(text);
  if (!msg) return null;
  let best = null, bestScore = 0;
  for (const topic of typeof COMPANION_INTENTS !== "undefined" ? COMPANION_INTENTS : []) {
    const score = scoreCompanion(msg, topic);
    if (score > bestScore) { bestScore = score; best = topic; }
  }
  if (!best || bestScore < 1) return null;
  return pickCompanionReply(best, localHour);
}
