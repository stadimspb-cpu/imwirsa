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

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[«»"'.,!?;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Anchors are checked as substrings of the normalized message for anything
// 5+ characters (already pre-stemmed by whoever wrote them: "сигарет" is
// meant to catch "сигареты"/"сигарету"). SHORT anchors (<=4 chars, things
// like "ЕС", "SIM", "бар", "гол", "под") are far more dangerous as free
// substrings -- "ЕС" alone matched inside "повЕСиться" during testing on
// 04.09.2026, nearly routing a self-harm message to a CBD-legality answer
// (RED_LINE_KEYWORDS would have caught it first in the real app either
// way, but the underlying bug was real and not limited to that one word).
// Short anchors are therefore required to start at a genuine word boundary
// -- this still lets "бар" match "баре"/"баров" (the word STARTS there)
// but stops it from firing on a "бар" that only occurs mid-word.
const WORD_START = /[\wа-яё]/i;
function isWordCharAt(message, index) {
  if (index < 0 || index >= message.length) return false;
  return WORD_START.test(message[index]);
}

function containsAnchor(normalizedMessage, anchor) {
  const a = anchor.toLowerCase();
  if (a.length > 5) return normalizedMessage.includes(a);

  let from = 0;
  while (true) {
    const idx = normalizedMessage.indexOf(a, from);
    if (idx === -1) return false;
    const startOk = !isWordCharAt(normalizedMessage, idx - 1);
    // Anchors of 3 characters or fewer ("ЕС", "SIM"-style abbreviations,
    // "кто") are ambiguous enough that they also need the match to END a
    // word, not just start one -- "ЕС" starts the common word "есть" too,
    // which is how a hunger complaint nearly matched a CBD-legality answer
    // during testing on 04.09.2026. Anchors of 4-5 characters keep the
    // start-only rule, since those are usually a deliberate stem
    // ("гол"-length exceptions aside) meant to catch inflected endings.
    const endOk = a.length > 3 || !isWordCharAt(normalizedMessage, idx + a.length);
    if (startOk && endOk) return true;
    from = idx + 1;
  }
}

function countHits(normalizedMessage, anchors) {
  let n = 0;
  for (const a of anchors) if (containsAnchor(normalizedMessage, a)) n++;
  return n;
}

function anyExcluded(normalizedMessage, exclude) {
  for (const ex of exclude) if (containsAnchor(normalizedMessage, ex)) return true;
  return false;
}

// Primary anchors count double -- they were hand-picked as the SPECIFIC,
// unambiguous words for this exact intent (e.g. "сигарет"), while synonyms
// are looser/more casual phrasing that alone is weaker evidence. A message
// needs at least one primary hit, OR two synonym hits, to be considered at
// all -- a single loose synonym alone is not enough to commit to an answer.
function scoreIntent(normalizedMessage, intent) {
  if (anyExcluded(normalizedMessage, intent.exclude || [])) return -1;
  const primaryHits = countHits(normalizedMessage, intent.primary || []);
  const synonymHits = countHits(normalizedMessage, intent.synonyms || []);
  if (primaryHits === 0 && synonymHits < 2) return 0;
  return primaryHits * 2 + synonymHits;
}

function findOfflineAnswer(text) {
  const msg = normalizeText(text);
  if (!msg) return null;
  let best = null;
  let bestScore = 0;
  for (const intent of typeof INTENTS !== "undefined" ? INTENTS : []) {
    const score = scoreIntent(msg, intent);
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best ? best.a : null;
}

// Companion chat (Block 26): same anchor-matching mechanics, but picks one
// of several reply variants at random for natural variety, and is meant to
// be tried BEFORE the main Q&A intents for ordinary conversational
// messages -- see the priority order note in app.js where this is called.
function scoreCompanion(normalizedMessage, topic) {
  const hits = countHits(normalizedMessage, topic.primary || []);
  return hits;
}

function findCompanionReply(text) {
  const msg = normalizeText(text);
  if (!msg) return null;
  let best = null;
  let bestScore = 0;
  for (const topic of typeof COMPANION_INTENTS !== "undefined" ? COMPANION_INTENTS : []) {
    const score = scoreCompanion(msg, topic);
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }
  if (!best) return null;
  const variants = best.replies || [];
  if (variants.length === 0) return null;
  return variants[Math.floor(Math.random() * variants.length)];
}
