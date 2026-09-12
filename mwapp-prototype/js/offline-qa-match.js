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
//
// v21, 11.09.2026 -- Markus's second mixed-regression review (19
// screenshots, fresh session on top of v53/v19). Fixed, with live-tested
// evidence for each:
//   Point 1 (safety-critical, authorized as an exception to "stop
//   expanding vocabulary"): MEDICAL_EMERGENCY_KEYWORDS was missing the
//   ADJECTIVE forms of chest pain/breathing distress -- "больно в груди"
//   (only the noun "боль в груди" was covered) and "трудно
//   дышать"/"тяжело дышать"/"не могу дышать" entirely. Both phrasings
//   were caught live falling through to the unclear/companion fallback
//   instead of 112 -- confirmed fixed against the exact failing text.
//   Point 4: transport intent's bare "рейс" primary anchor was firing on
//   "этот рейс меня достал" (an emotional complaint, not a transport
//   question) -- moved into intents-data.js's compoundAnchors, now
//   requires an actual transport marker alongside it.
//   Point 10: "Ты сейчас работаешь через интернет?" was answered with
//   the port's Wi-Fi hotspot location (matched via bare "интернет") --
//   the existing online/offline-status intent's compoundAnchors widened
//   to also catch this self-status phrasing and a self-referential "ты
//   сейчас"/"ты работаешь" marker, which now reliably outscores the
//   Wi-Fi intent by the ordinary AMBIGUITY_MARGIN.
// intents-data.js v54 has the corresponding data changes (crew-entrance
// anchor, QR/Premium-expiry/AI-expiry coverage, 5 removed {placeholder}
// templates). Self-match regression after all changes: 16/250, IDENTICAL
// list to before this pass.
//
// v19, 10.09.2026 -- findOfflineIntent's {strict} option is now UNUSED by
// its only caller (app.js's companion exit-check, per Markus's mixed-
// regression review point 1 -- the raised bar was blocking too many clean
// informational exits live). Left in place (harmless, callable) rather
// than deleted, in case a genuinely different future caller needs it --
// see app.js v52+ for the actual routing change. 11 CBD/drugs/alcohol
// intents in intents-data.js tagged "protected": true (point 2) so
// app.js can give them unconditional priority over Companion Mode
// regardless of dialog state; scoreIntent()/findOfflineIntent() are
// unchanged by this, the flag is only read by app.js's new
// findProtectedIntent().
//
// v18, 09.09.2026 -- sticky Companion Mode support, per Markus's proposal
// (confirmed live: "какой автобус, я про свой рейс на судне" and
// "Начальство достало" hijacked by unrelated port intents mid-companion-
// chat, because findCompanionReply() was a per-message classifier with no
// persistent mode of its own). Added: findOfflineIntent(text, {strict})
// for the mode-exit check (raises both confidence bars so only an
// unambiguous fresh port question breaks the conversation); pickAvoidingRecent()
// + recentTexts param on pickCompanionReply()/findCompanionReply() so a
// repeated topic hit doesn't visibly repeat the same line; COMPANION_STAY_REPLIES
// + findCompanionFallback() as a warm "still listening" fallback instead of
// falling through to the ordinary demoReplies/unclearReplies pool while a
// companion conversation is active. The sticky state itself
// (state.companionActive) lives in app.js -- this file only exposes the
// pieces app.js's state machine calls.
//
// v17, 07.09.2026 -- chest-pain markers ("боль в груди", "инфаркт", ...)
// added to MEDICAL_EMERGENCY_KEYWORDS per Andrey: chest pain deserves the
// same un-tie-able 112 priority as an explicit ambulance request, not
// only the Duty Office callback the scored intent gives. Full rationale
// in the block itself.
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
// v22, 11.09.2026 -- Wellness follow-up/access review, point 4: bare
// "wellness"/"wellnes"/"велнес"/"веллнес" added as normalized spelling
// variants (see below) so a plain mention is a strong standalone marker
// everywhere the "wellness" anchor is already used, no code changes
// needed anywhere else. Found and fixed a real bug while building this:
// \b does NOT work as a word boundary around Cyrillic letters in JS
// regex (\bвелнес\b silently matched nothing at all, confirmed live --
// \b is only ASCII-\w-aware, and Cyrillic letters count as \W on both
// sides) -- explicit negative lookaround used for the Cyrillic variants
// instead. intents-data.js v57 has the matching Wellness-family data
// changes (points 1-3, 5) -- see that file's version note.
const SPELLING_VARIANTS = [
  [/\btype[\s-]?c\b/gi, "type-c"],
  [/\busb[\s-]?c\b/gi, "usb-c"],
  [/\bmicro[\s-]?usb\b/gi, "micro-usb"],
  [/\bwi[\s-]?fi\b/gi, "wi-fi"],
  // 11.09.2026, Markus's Wellness follow-up review point 4: a bare
  // mention of the topic word itself (in any spelling seafarers actually
  // type) must be a strong standalone Wellness marker on its own, not
  // require pairing with another word like "услуга"/"расслабиться". This
  // normalizes every variant to the single "wellness" anchor already used
  // everywhere in the Wellness family, so no individual intent needs its
  // own copy of this list.
  // NOTE: \b does NOT work as a word boundary around Cyrillic letters in
  // JS regex (\b is only ASCII-\w-aware, and Cyrillic letters count as
  // \W) -- confirmed live: \bвелнес\b silently never matched anything.
  // Explicit negative lookaround used instead for the Cyrillic variants.
  [/\bwellnes\b/gi, "wellness"],
  [/(?<![a-zа-яё])велнес(?![а-яё])/gi, "wellness"],
  [/(?<![a-zа-яё])веллнес(?![а-яё])/gi, "wellness"],
  // 11.09.2026, "architecture" review point 6: "онлайн-AI" and "онлайн AI"
  // (hyphen vs space vs nothing) must normalize to ONE form before
  // scoring, not require every intent's AI_MARKERS group (intents-data.js)
  // to separately list both variants -- one normalization rule here fixes
  // it everywhere "онлайн ai"/AI_MARKERS is used.
  [/онлайн[\s-]?ai/gi, "онлайн-ai"],
  [/онлайн[\s-]?ии/gi, "онлайн-ии"],
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
//
// v17, 07.09.2026 -- chest-pain markers added per Andrey's review of the
// offline-mode restructuring plan: "У меня боль в груди" was previously
// ONLY a scored intent routing to the IMWIRSA Duty Office callback ("в
// течение минуты") -- correct as a parallel channel, but chest pain is a
// classic heart-attack symptom and deserves the SAME immediate,
// un-tie-able 112 priority as an explicit ambulance request, not a
// callback that takes a minute. Added here (not just left to the scored
// intent) for the same reason "скорая" itself is here: this check runs
// BEFORE the intent table and can never lose a tie or be reworded away
// by unrelated anchor edits elsewhere. The scored intent (intents-data.js)
// is kept as a defense-in-depth layer for phrasings that don't hit these
// exact markers, and its own reply now leads with 112 too -- see there.
// v20, 11.09.2026 -- Markus's mixed-regression point 1: live testing found
// "Мне очень плохо и больно в груди" and "Мне трудно дышать" both fell
// through to the ordinary unclear/companion fallback -- neither phrasing
// (adjective "больно"/"трудно" rather than the noun "боль") was covered.
// Chest pain and breathing difficulty are both textbook emergency
// symptoms and must reach 112 regardless of exact wording or dialog
// state -- this list is checked unconditionally before Companion Mode
// and before the scored intent table (see isMedicalEmergencyTopic() and
// its caller in app.js), so adding phrasings here is safety-critical
// coverage, not the kind of "точечная формулировка" expansion Markus
// asked to stop doing elsewhere in the corpus.
// v23, 11.09.2026 -- "Blind test" review point 5 (flagged CRITICAL
// priority): "Не могу нормально вдохнуть, воздуха не хватает" fell
// through to the unclear fallback -- the breathing-distress family only
// had "дышать" phrasings, missing the equally common "вдохнуть" verb and
// "не хватает воздуха" entirely. Added as more members of the SAME
// existing family, not a new topic. See intents-data.js v59 for this
// session's other 5 points (routing/anchor changes; this file only
// needed the emergency-keyword addition).
const MEDICAL_EMERGENCY_KEYWORDS = [
  "скорая", "скорую", "скорой",
  "вызвать скорую", "нужна скорая", "скорая помощь",
  "экстренная помощь", "срочная медицинская помощь",
  "боль в груди", "больно в груди", "давит в груди", "давление в груди",
  "сжимает в груди", "сжатие в груди", "жжёт в груди", "жжет в груди",
  "боль в сердце",
  "трудно дышать", "тяжело дышать", "не могу дышать", "нечем дышать",
  "задыхаюсь",
  // 11.09.2026, Markus's "blind test" review point 5 (flagged as
  // CRITICAL priority): "Не могу нормально вдохнуть, воздуха не
  // хватает" fell through to the ordinary unclear fallback -- the
  // existing breathing markers all used "дышать" as the verb, missing
  // the equally common "вдохнуть" (to inhale) phrasing and "не хватает
  // воздуха" (short of air) entirely. This is the same breathing-
  // distress family as the markers above, not a new topic -- grouped
  // here rather than off in its own list.
  "не могу вдохнуть", "трудно вдохнуть", "тяжело вдохнуть",
  "не хватает воздуха", "воздуха не хватает",
  "инфаркт", "сердечный приступ",
  "ambulance", "emergency", "medical emergency",
  "call an ambulance", "need an ambulance", "chest pain", "heart attack",
  "can't breathe", "cant breathe", "hard to breathe", "difficulty breathing",
  "can't inhale", "cant inhale", "not enough air",
  // 12.09.2026, Layer A audit (Andrey/Markus, English-gap pass): RU has
  // separate phrasings for pressure/tightness/burning in the chest and for
  // heart pain specifically ("давит в груди", "сжимает в груди", "жжёт в
  // груди", "боль в сердце") that had no EN equivalent -- same symptom
  // family as "chest pain" above, listed explicitly rather than assumed
  // covered by that one phrase, same reasoning as the RU list itself.
  "pressure in my chest", "tightness in my chest", "burning in my chest",
  "heart pain", "cardiac arrest",
];

const MEDICAL_URGENCY_WORDS = ["срочно", "срочная", "срочный", "экстренно", "немедленно", "urgent", "urgently", "immediately", "right now"];

// 12.09.2026, Andrey's on-device RU retest — 5 systemic gaps, fixed as
// FAMILIES (stem/compound-based), not single exact-match test sentences.
//
// Gap 1: chest-pain family. The existing literal phrases above ("боль в
// груди", "давит в груди", ...) only match that EXACT word order — a
// paraphrase like "в груди очень больно и давит" (chest word and symptom
// word both present, different order/sentence shape) fell through. Built
// as a compound instead: a CHEST location marker AND a SYMPTOM word,
// anywhere in the message, order-independent -- same shape as the
// RETURN_VERBS/SHIP_LOCATION_MARKERS combo in app.js.
// containsAnchor()'s word-boundary check keeps "груд" (4 chars, start
// boundary only, no end boundary needed for >3-char anchors) from a bare
// false hit; the one accepted collision is "грудинка" (a food-menu item,
// pork brisket) -- combined with a symptom word this is not a realistic
// real message, so left as an accepted trade-off rather than special-cased.
// Symptom words chosen to avoid the "боль"/"большой" ("big") substring
// collision: "больно"/"болит" are used instead of a bare "боль" stem
// (they diverge from "большой" by the 5th letter, so no boundary trick is
// needed). "давит" has one accepted narrow collision ("выдавить", to
// squeeze out) -- realistically never co-occurs with a chest-location
// word in the same message, same trade-off class as above.
const CHEST_LOCATION_MARKERS = ["груд"];
const CHEST_SYMPTOM_MARKERS = [
  "болит", "больно", "боль в", "давит", "давление", "сжимает", "сжатие", "жжет",
];

// Gap 2: unconscious/unresponsive family. "потерял сознание"/"без
// сознания" as literal 2-word phrases already cover the canonical
// wording; added a few more common shapes (сознание "пропало", "нет
// сознания") rather than assuming those are covered by the two originals.
// "не реагирует"/"не отвечает" are checked as their own strong markers
// (not requiring the "сознание" word at all, since a real report is often
// just "он не реагирует" with no explicit "сознание" mention) -- accepted
// risk: "не отвечает" alone can also mean "isn't replying" to a message/
// call in an unrelated context; kept anyway, consistent with this layer's
// standing bias toward escalating rather than missing a real emergency.
const UNCONSCIOUS_MARKERS = [
  "потерял сознание", "потеряла сознание", "без сознания", "нет сознания",
  "сознание пропало", "не приходит в сознание", "не приходит в себя",
  "не реагирует", "не отвечает",
];

function isMedicalEmergencyTopic(text) {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  if (MEDICAL_EMERGENCY_KEYWORDS.some((kw) => containsAnchor(normalized, kw))) return true;
  if (CHEST_LOCATION_MARKERS.some((m) => containsAnchor(normalized, m))
      && CHEST_SYMPTOM_MARKERS.some((s) => containsAnchor(normalized, s))) {
    return true;
  }
  if (UNCONSCIOUS_MARKERS.some((m) => containsAnchor(normalized, m))) return true;
  // 12.09.2026, Layer A audit: this combo check only recognized the RU
  // phrase "медицинская помощь" as the anchor half -- the EN urgency words
  // just added above (urgent/urgently/immediately/right now) had nothing
  // to combine with, since "medical help" wasn't checked at all. Added so
  // "I need medical help urgently" reaches this combo the same way its RU
  // equivalent does.
  if ((containsAnchor(normalized, "медицинская помощь") || containsAnchor(normalized, "medical help"))
      && MEDICAL_URGENCY_WORDS.some((w) => containsAnchor(normalized, w))) {
    return true;
  }
  return false;
}

// 09.09.2026 -- found while building the sticky-Companion-Mode exit check
// below: raw score/margin alone CANNOT tell a genuine topic change
// ("Ладно, где ближайший супермаркет?") apart from an unrelated word
// showing up inside an emotional message ("какой автобус, я про свой рейс
// на судне") -- both score the exact same 4-vs-3 (margin 1) profile in
// this engine, because scoreIntent() only ever looks at anchor words, not
// at WHY the seafarer said them. A blunt higher threshold would block
// both alike. The one real signal available offline is the discourse
// marker itself -- Andrey's own example already contains it ("Ладно, ...")
// -- so an explicit switch word is what actually gates a clean exit;
// without one, the bar stays high enough that stray anchor words inside a
// sentence about something else basically never win.
// Note: normalizeText() strips punctuation before this ever runs, so these
// are bare words/phrases, not "ладно," with a comma -- containsAnchor()'s
// own word-boundary check is what keeps a short word like "ок" from
// matching mid-word, not the marker's own punctuation.
const TOPIC_SWITCH_MARKERS = [
  "ладно", "окей", "ок", "кстати", "проехали",
  "короче", "в общем", "забудь", "неважно", "вернемся к",
  "anyway", "okay",
];

function hasTopicSwitchMarker(normalizedMessage) {
  return TOPIC_SWITCH_MARKERS.some((m) => containsAnchor(normalizedMessage, m));
}

// Returns the matched INTENT OBJECT itself (not just .a) -- needed so a
// caller can look up port-specific real data for this exact intent (see
// port-card-answers.js) before falling back to the generic .a text.
// findOfflineAnswer() below is now a thin wrapper kept for anything that
// only ever needed the text.
//
// 09.09.2026, opts.strict -- added for sticky Companion Mode (see app.js):
// while a seafarer is inside an ongoing companion conversation, an
// ordinary port-topic match must NOT be enough on its own to yank him
// back out of it. With an explicit TOPIC_SWITCH_MARKERS marker present,
// this behaves exactly like the normal (non-strict) call -- the seafarer
// clearly signalled he's done with the conversation, no extra bar needed.
// WITHOUT one, both bars are raised well past anything a single stray
// anchor word can realistically clear (see the comment above
// TOPIC_SWITCH_MARKERS for the live example that showed why a moderate
// bump isn't enough) -- every other caller (the ordinary non-companion
// path) is unaffected, opts is optional and defaults to non-strict.
function findOfflineIntent(text, opts) {
  const strict = !!(opts && opts.strict);
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
  const marked = strict && hasTopicSwitchMarker(msg);
  const strictNoMarker = strict && !marked;
  const confidenceFloor = strictNoMarker ? CONFIDENCE_THRESHOLD + 4 : CONFIDENCE_THRESHOLD;
  const marginFloor = strictNoMarker ? AMBIGUITY_MARGIN + 3 : AMBIGUITY_MARGIN;
  if (!best || bestScore < confidenceFloor) return null;
  if (bestScore - secondScore < marginFloor) return null;
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
//
// 09.09.2026, Andrey: a real emotional conversation (homesickness,
// anxiety, loneliness, "why am I here") can run much longer than the
// handful of scripted variants each topic carries -- past roughly 20-30
// minutes the same few warm replies start visibly cycling, which reads as
// not-listening rather than as care. Rather than trying to write an
// unbounded set of variants (impossible to keep genuinely fresh) or
// dropping offline companion chat for these topics entirely (Andrey
// considered this, decided against it -- a seafarer who deliberately went
// offline and writes "мне одиноко" still deserves more than silence or a
// "try rephrasing" prompt), these four topics specifically get a SHARED,
// SEPARATE reply pool that activates once state.consecutiveDeepTalk
// (tracked in app.js, incremented each time one of these topics fires in
// a row, reset the moment anything else happens) crosses
// DEEP_TALK_THRESHOLD. That pool is deliberately honest about the ceiling
// -- it says plainly that offline capacity is limited, rather than
// pretending the warmth is inexhaustible, and points to Duty Office or
// waiting for a connection for anyone who genuinely needs to keep
// talking. Lighter companion topics (greetings, thanks, a joke, "how are
// you", idle chat) are NOT in this set -- repeating one of THOSE costs
// nothing, there's no emotional stakes to a repeated "glad to hear it!".
const DEEP_TALK_TOPICS = new Set([
  "Жалоба на скуку / Одиночество",
  "Ностальгия по дому",
  "Беспричинная тревога / Страх",
  "Вопрос «Зачем я здесь?» (Смысл)",
]);

const DEEP_TALK_THRESHOLD = 3;

// 12.09.2026, Andrey's correction: this pool had the SAME two problems he
// flagged in redline.message -- old "Дежурный офис IMWIRSA" terminology
// (renamed to "Центральный офис IMWIRSA" everywhere else), and several
// variants went further, actively claiming the office is reachable
// "и без интернета"/"на связи прямо сейчас" regardless of the seafarer's
// actual connectivity -- offline mode has no way to verify that, same
// overclaim class already fixed for SHIP_DEPARTED (08.09.2026) and
// redline.message (12.09.2026). Reworded so contacting the Central
// Office is conditional on having a connection, not asserted as always-on.
const DEEP_TALK_LIMIT_REPLIES = [
  "Честно: офлайн я хожу примерно по одному и тому же кругу тёплых фраз — не хочу повторять одно и то же и делать вид, что это настоящий долгий разговор. Я рядом, но если это по-настоящему тяжело — лучше дождаться связи и написать в Центральный офис IMWIRSA.",
  "Тут мои возможности офлайн правда ограничены — я не смогу вести этот разговор так долго, как, может, тебе хочется. Если не отпускает — напиши в Центральный офис IMWIRSA, когда будет связь, или дождись сети, и поговорим по-настоящему.",
  "Не хочу крутить один и тот же набор слов по кругу — офлайн я так устроен. Знай, что я рядом. А если совсем тяжело — это повод написать в Центральный офис IMWIRSA, как только появится связь, не только мне.",
  "Тема явно не закрыта, но офлайн я быстро упрусь в одни и те же ответы, и это будет только раздражать. Если хочется по-настоящему выговориться — напиши в Центральный офис IMWIRSA, как только будет связь, или дождись сети, и поговорим подробнее.",
  "Я не притворяюсь, что офлайн могу говорить об этом бесконечно — возможностей правда немного. Но ты не один: как только будет связь, можно написать в Центральный офис IMWIRSA, а пока я рядом, насколько могу.",
];

// 09.09.2026, recentTexts -- added for sticky Companion Mode: without it,
// a topic with only 1-2 reply variants (e.g. "Просто хочется поговорить")
// visibly repeats itself within the same conversation the moment its
// anchor word ("поговорить") comes up again mid-conversation, which reads
// as the assistant not tracking what was already said (live example:
// "Давай. Можешь начать с чего угодно." three times in one chat). When
// more than one variant exists, this skips whichever one was JUST used as
// long as an alternative is available -- a topic with a single reply (or a
// single time-slot) is left as-is, repeating there is unavoidable and
// harmless (e.g. a plain "Привет! Чем могу помочь?").
function pickCompanionReply(topic, localHour, recentTexts) {
  const recent = Array.isArray(recentTexts) ? recentTexts : [];
  if (Array.isArray(topic.timeReplies) && topic.timeReplies.length > 0) {
    if (typeof localHour === "number") {
      for (const slot of topic.timeReplies) {
        const inRange = slot.from <= slot.to
          ? localHour >= slot.from && localHour < slot.to
          : localHour >= slot.from || localHour < slot.to; // wraps past midnight
        if (inRange) return slot.text;
      }
    }
    const pool = topic.timeReplies.map((s) => s.text);
    return pickAvoidingRecent(pool, recent) || topic.timeReplies[0].text;
  }
  const variants = topic.replies || [];
  if (variants.length === 0) return null;
  return pickAvoidingRecent(variants, recent) || variants[0];
}

function pickAvoidingRecent(pool, recentTexts) {
  if (pool.length === 0) return null;
  const fresh = pool.filter((v) => !recentTexts.includes(v));
  const from = fresh.length > 0 ? fresh : pool;
  return from[Math.floor(Math.random() * from.length)];
}

function scoreCompanion(normalizedMessage, topic) {
  return countHits(normalizedMessage, topic.primary, { excludeGeneric: true });
}

// Returns { text, isDeep } or null. `deepTalkCount` (state.consecutiveDeepTalk
// from app.js) decides whether a matched DEEP_TALK_TOPICS topic gets its own
// warm reply or the shared honest-limit pool -- see the comment above
// DEEP_TALK_TOPICS for the full rationale. Callers that don't pass a count
// (or pass undefined) simply never cross the threshold, so this stays
// backward-compatible for anything that doesn't care about the distinction.
// `recentTexts` (09.09.2026, sticky Companion Mode) -- last 1-2 of the
// assistant's OWN companion replies in this conversation, so a repeated
// topic hit doesn't visibly repeat itself -- see pickCompanionReply().
function findCompanionReply(text, localHour, deepTalkCount, recentTexts) {
  const msg = normalizeText(text);
  if (!msg) return null;
  let best = null, bestScore = 0;
  for (const topic of typeof COMPANION_INTENTS !== "undefined" ? COMPANION_INTENTS : []) {
    const score = scoreCompanion(msg, topic);
    if (score > bestScore) { bestScore = score; best = topic; }
  }
  if (!best || bestScore < 1) return null;
  const isDeep = DEEP_TALK_TOPICS.has(best.topic);
  if (isDeep && typeof deepTalkCount === "number" && deepTalkCount >= DEEP_TALK_THRESHOLD) {
    return { text: DEEP_TALK_LIMIT_REPLIES[Math.floor(Math.random() * DEEP_TALK_LIMIT_REPLIES.length)], isDeep };
  }
  return { text: pickCompanionReply(best, localHour, recentTexts), isDeep };
}

// 09.09.2026 -- sticky Companion Mode "stay" fallback (see app.js). While
// state.companionActive is true, a message that matches NEITHER a
// companion topic NOR a strict-confidence port intent must NOT fall
// through to the ordinary demoReplies/unclearReplies pool -- that pool's
// wording ("возможно, это не по моей части") reads as leaving the
// conversation, which is exactly wrong mid-companion-chat (live example:
// "У всех свои дела. Иногда чувствуешь себя совсем один." matched no
// topic anchor at all and got the generic "не совсем понял" instead of
// staying present). This pool stays warm and explicitly invites the
// seafarer to keep going, without pretending to have understood something
// specific.
const COMPANION_STAY_REPLIES = [
  "Не совсем уловил детали, но я тебя слушаю — продолжай, что на душе.",
  "Расскажи ещё — не обязательно точными словами, я рядом и слушаю.",
  "Не так важно, как это сформулировать — просто говори, что думаешь.",
  "Я здесь. Даже если я не сразу пойму каждое слово — продолжай.",
];

function findCompanionFallback(recentTexts) {
  return pickAvoidingRecent(COMPANION_STAY_REPLIES, Array.isArray(recentTexts) ? recentTexts : []);
}
