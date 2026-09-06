// ---- PERSISTENT OFFLINE-INTENT REGRESSION SUITE --------------------------
// v1, 06.09.2026. Run after ANY edit to intents-data.js or
// offline-qa-match.js, before shipping:
//   cat intents-data.js offline-qa-match.js regression-tests.js | node
//
// Two parts:
//   1) SELF-MATCH AUDIT -- every intent's own canonical `.q` text must
//      resolve back to that exact intent. This is a general safety net,
//      not a hand-picked phrase list: it silently caught two unrelated
//      exact-duplicate intent pairs (gym/fitness, port/military-object
//      photo) on 06.09.2026 that had been permanently unreachable
//      (100% self-tie -> always UNKNOWN) since before this session,
//      with nobody having noticed because nobody happened to test those
//      two topics. Keep this running on every future edit -- it is the
//      cheapest possible check and it already found real bugs nobody
//      was looking for.
//   2) NAMED CASES -- hand-picked phrases from real Andrey/Markus live
//      testing, each asserting which intent (by unique q-substring) it
//      must resolve to, or that it must resolve to nothing (UNKNOWN) on
//      purpose. Add a new case here whenever a live test finds a bug --
//      never delete a passing case, only add.
//
// ⚠️ KNOWN GAP, 06.09.2026: an earlier regression-charger.js (created
// 05.09.2026, covering the CHARGER/CABLE/ADAPTER regression class -- see
// HANDOFF_MEMO_MASTER.md) was never actually committed to GitHub --
// confirmed missing via the repo's real file listing. Its ~15 named
// phrases are lost; only the 3 systemic classes it found are recorded in
// the memo, not the literal test strings. If Andrey/Markus still has
// that file (or the original phrases) locally, resupply it so those
// cases can be folded into part 2 below. Until then this suite does NOT
// cover CHARGER/CABLE/ADAPTER regressions -- a change touching those
// anchors needs manual re-testing.

function findOfflineIntentSafe(text) {
  return typeof findOfflineIntent === "function" ? findOfflineIntent(text) : null;
}

// ---- Part 1: self-match audit ---------------------------------------
function runSelfMatchAudit() {
  const list = typeof INTENTS !== "undefined" ? INTENTS : [];
  const fails = [];
  for (const intent of list) {
    const got = findOfflineIntentSafe(intent.q);
    if (!got || got.q !== intent.q) {
      fails.push({ q: intent.q, got: got ? got.q : "UNKNOWN" });
    }
  }
  console.log(`[self-match] ${list.length - fails.length}/${list.length} intents match themselves.`);
  if (fails.length) {
    console.log(`[self-match] ${fails.length} non-self-matching (may be intentional doc-only sub-questions -- review, don't assume all are bugs):`);
    for (const f of fails) console.log(`   "${f.q}" -> ${f.got}`);
  }
  return fails;
}

// ---- Part 2: named regression cases -----------------------------------
// expect: substring (case-insensitive) that must appear in the matched
// intent's `.q`, or the literal string "UNKNOWN" if no match is correct.
const NAMED_CASES = [
  // 06.09.2026 -- Markus's Block 2, 4 systemic classes (all fixed this
  // session; see v38 changelog at the top of intents-data.js)
  { text: "Есть рядом недорогое кафе?", expect: "поесть", note: "broad-anchor collision: bare 'кафе' must NOT hit Wi-Fi" },
  { text: "Где можно нормально пообедать?", expect: "поесть", note: "'нормальн' must not hijack alcohol intent" },
  { text: "Есть ли рядом вегетарианская еда?", expect: "вегетариан", note: "must not tie with generic food on 'еда'" },
  { text: "Есть ли рядом халяльная еда?", expect: "халял", note: "must not tie with generic food on 'еда'" },
  { text: "поесть халяль", expect: "халял" },
  { text: "попить воды из крана", expect: "кран" },
  { text: "Где купить воду?", expect: "бутилированн", note: "bottled water is the default winner absent кран/водопровод" },
  { text: "кафе с вегетарианской едой", expect: "вегетариан", note: "specific dietary constraint must outrank generic 'кафе'" },
  { text: "Есть веганская еда?", expect: "вегетариан" },
  { text: "хочу выпить пива", expect: "UNKNOWN", note: "'выпить' alone must NOT fire the tap-water intent (alcohol ambiguity)" },
  { text: "хочу выпить водки в баре", expect: "UNKNOWN" },

  // 06.09.2026 -- follow-up round after v38 field test: "кафе" needed to
  // reach the generic FOOD intent, not just stop hijacking Wi-Fi.
  { text: "Где кафе рядом?", expect: "поесть" },
  { text: "Кафе с Wi-Fi есть?", expect: "wi-fi", note: "specific Wi-Fi anchor must still outrank generic FOOD's 'кафе'" },
  { text: "Есть рядом кофейня?", expect: "кофе", note: "coffee-shop wording stays on the coffee intent, not FOOD" },

  // 06.09.2026 -- fast-food chain names added to the FOOD intent
  { text: "Есть тут Макдональдс?", expect: "поесть" },
  { text: "Где ближайший KFC?", expect: "поесть" },
  { text: "Хочу в макдак", expect: "поесть" },
];

function runNamedCases() {
  let pass = 0;
  const fails = [];
  for (const c of NAMED_CASES) {
    const got = findOfflineIntentSafe(c.text);
    const gotQ = got ? got.q : "UNKNOWN";
    const ok = c.expect === "UNKNOWN" ? gotQ === "UNKNOWN" : gotQ.toLowerCase().includes(c.expect.toLowerCase());
    if (ok) pass++;
    else fails.push({ ...c, got: gotQ });
  }
  console.log(`[named cases] ${pass}/${NAMED_CASES.length} passed.`);
  if (fails.length) {
    console.log(`[named cases] FAILURES:`);
    for (const f of fails) console.log(`   "${f.text}" expected "${f.expect}", got "${f.got}"${f.note ? " -- " + f.note : ""}`);
  }
  return fails;
}

const selfMatchFails = runSelfMatchAudit();
const namedFails = runNamedCases();
if (namedFails.length > 0) {
  console.log("\n❌ REGRESSION: named-case failures above must be fixed before shipping.");
} else {
  console.log("\n✅ All named regression cases pass.");
}
