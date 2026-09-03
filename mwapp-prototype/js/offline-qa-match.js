// ---- OFFLINE Q&A MATCHING ------------------------------------------------
// Keyword-overlap lookup against the 185-question table approved 03.09.2026
// (see offline-qa-data.js). No generative model, no network call — every
// possible output is one of the pre-approved answer strings, verbatim.
//
// This runs AFTER isRedLineTopic() and isComplexTopic() below, never before
// — a message that looks like a safety/escalation situation must still get
// the human-escalation toggle even if it also happens to share keywords
// with an ordinary Q&A entry. This function only fills the gap that used to
// fall through to a meaningless rotating placeholder reply.
//
// Known limitation, flagged deliberately rather than silently: categories
// 10/12/24 of the 185-question table (crisis, intimate-services safety
// notes, Wellness Zone boundaries) are NOT cross-checked against this
// matcher's output for whether they should ALSO trigger the interactive
// escalation buttons -- that merge is a follow-up task, not done here.
// isRedLineTopic/isComplexTopic's own keyword lists are what currently
// decide whether the escalation UI appears, independent of this file.

function normalizeForMatch(text) {
  return text
    .toLowerCase()
    .replace(/[«»"'.,!?;:()\-–—]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// Crude suffix-agnostic "stem": Russian grammatical endings are almost
// always 2-4 characters, so truncating longer words to 6 characters lets
// "сигарет", "сигареты", "сигаретами" collide on the same token without a
// real morphological analyzer. Cheap, imperfect, good enough as a first
// pass -- same spirit as the isComplexTopic() keyword heuristic already in
// this file.
function stem(word) {
  return word.length > 6 ? word.slice(0, 6) : word;
}

const MATCH_STOPWORDS = new Set([
  "где", "как", "что", "можно", "ли", "есть", "здесь", "тут", "мне", "я", "и", "в", "на",
  "с", "по", "до", "от", "для", "это", "а", "но", "или", "у", "из", "за", "то", "же", "бы",
  "не", "он", "она", "если", "меня", "мне", "мой", "моя",
  "the", "a", "an", "is", "are", "can", "where", "what", "how", "do", "i", "to", "in", "on",
  "of", "for", "this", "that",
]);

function keywordsOf(text) {
  return normalizeForMatch(text)
    .filter((w) => w.length > 2 && !MATCH_STOPWORDS.has(w))
    .map(stem);
}

// Built once at load time -- OFFLINE_QA comes from offline-qa-data.js,
// loaded before this file.
const OFFLINE_QA_INDEX = (typeof OFFLINE_QA !== "undefined" ? OFFLINE_QA : []).map((entry) => ({
  q: entry.q,
  a: entry.a,
  tokens: new Set(keywordsOf(entry.q)),
}));

// Requires at least 2 shared keywords AND at least half of the DATABASE
// question's own keywords to be present -- guards against a long rambling
// message spuriously matching a short question by raw word-count alone.
// Both thresholds are a starting point, not a tuned value; revisit once we
// have real seafarer phrasing to test against instead of our own guesses.
function findOfflineAnswer(text) {
  const queryTokens = new Set(keywordsOf(text));
  if (queryTokens.size === 0) return null;

  let best = null;
  let bestScore = 0;
  for (const entry of OFFLINE_QA_INDEX) {
    if (entry.tokens.size === 0) continue;
    let overlap = 0;
    for (const tok of entry.tokens) if (queryTokens.has(tok)) overlap++;
    const coverage = overlap / entry.tokens.size;
    if (overlap >= 2 && coverage >= 0.5 && overlap > bestScore) {
      best = entry;
      bestScore = overlap;
    }
  }
  return best ? best.a : null;
}
