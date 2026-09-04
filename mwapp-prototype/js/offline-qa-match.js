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
  "город", "время", "минут",
  "это", "мне", "меня", "я", "и", "в", "на", "с",
  "where", "buy", "can", "near", "here", "there", "how much", "want", "need",
  "price", "cost", "allowed", "port", "city", "time", "minutes",
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
function scoreIntent(normalizedMessage, intent) {
  if (anyExcluded(normalizedMessage, intent.exclude)) return -1;
  const primaryHits = countHits(normalizedMessage, intent.primary, { excludeGeneric: true });
  if (primaryHits === 0) return 0; // no topic-defining word present -> not a candidate, full stop
  const synonymHits = countHits(normalizedMessage, intent.synonyms, { excludeGeneric: true });
  return primaryHits * 3 + synonymHits;
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

function findOfflineAnswer(text) {
  const msg = normalizeText(text);
  if (!msg) return null;
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
  return best.a;
}

// Companion chat (Block 26): same generic-word and confidence-floor rules,
// lower stakes (worst case is a slightly-off friendly reply, not a wrong
// factual answer), so no ambiguity-margin check here -- picking one warm
// reply over another tied one costs nothing.
function scoreCompanion(normalizedMessage, topic) {
  return countHits(normalizedMessage, topic.primary, { excludeGeneric: true });
}

function findCompanionReply(text) {
  const msg = normalizeText(text);
  if (!msg) return null;
  let best = null, bestScore = 0;
  for (const topic of typeof COMPANION_INTENTS !== "undefined" ? COMPANION_INTENTS : []) {
    const score = scoreCompanion(msg, topic);
    if (score > bestScore) { bestScore = score; best = topic; }
  }
  if (!best || bestScore < 1) return null;
  const variants = best.replies || [];
  if (variants.length === 0) return null;
  return variants[Math.floor(Math.random() * variants.length)];
}
