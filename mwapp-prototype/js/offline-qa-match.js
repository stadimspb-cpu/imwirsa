// ---- OFFLINE INTENT MATCHING (v2, 04.09.2026) -----------------------------
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

function normalizeText(text) {
  return text
    .toLowerCase()
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
  const a = anchor.toLowerCase();
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
  const primaryScore = countWeightedPrimaryHits(normalizedMessage, intent.primary);
  if (primaryScore === 0) return 0; // no topic-defining word present -> not a candidate, full stop
  const synonymHits = countHits(normalizedMessage, intent.synonyms, { excludeGeneric: true });
  return primaryScore + synonymHits;
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
