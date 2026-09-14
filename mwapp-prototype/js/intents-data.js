// 14.09.2026, Andrey: this file's offline FAQ was reviewed end to end and
// split into three categories -- what's genuinely needed offline (exit/
// navigation/connectivity/safety), what's fine to keep offline but isn't a
// priority, and what has no location/urgency dependency at all (Premium/
// Standard subscription mechanics, QR discount-code mechanics, the
// extended Wellness-zone FAQ, and the assistant's self-referential
// capability questions -- "do you remember me", "can I trust your
// advice", etc.). That third category (134 intents) has been REMOVED from
// this file -- the app is still demo-only with no real users yet, so nothing
// broke by doing this now rather than deferring it. The same content has
// been converted into a separate, technology-agnostic facts file (not
// Q&A pairs, just facts) for whatever the eventual online-AI backend turns
// out to be -- that backend doesn't exist yet either, so this is prep work,
// not a live integration.
//
// Practical consequence for anyone reading the large historical changelog
// immediately below: a lot of it documents real debugging work on Premium/
// Wellness/QR/assistant-capability intents specifically -- that work still
// happened and the reasoning is still worth keeping, but the intents it
// refers to are no longer in this file. Don't be confused into thinking
// something broke; it was a deliberate removal, see the reasoning above.
//
// Auto-generated 05.09.2026 (v37, final) -- CRITICAL SAFETY FIX: chto-delat
// removed as phrase-anchor from meta-question, was beating real crisis
// intents due to yesterday phrase-weight boost. bol removed from
// painkiller-shopping intent, was tying with chest-pain intent.
//
// v38, 06.09.2026 -- Markus's Block 2 regression, 4 systemic classes fixed:
// 1) broad-anchor collisions: "kafe" removed as standalone primary from the
//    Wi-Fi-cafe intent (was hijacking any cafe question with no Wi-Fi signal
//    at all -- "wi-fi" itself added to that intent's primary to compensate);
//    "normaln" demoted to synonym in the alcohol intent (was hijacking
//    "normalno poobedat'" purely on the quality-word match).
// 2) covered-but-UNKNOWN: poobedat/pozavtrakat/pouzhinat promoted
//    synonym->primary in the food intent per the existing diminutive/
//    colloquial rule (a bare stem like "obed" never matches a "po-"-prefixed
//    form due to the anchor start-boundary rule -- same root cause as the
//    "pit'/popit'" case below); vegan promoted synonym->primary in the
//    vegetarian intent for the same reason. Added vegetarian/vegan/halal to
//    the food intent's exclude list so a specific dietary request no longer
//    ties 3-3 with the generic food intent and gets swallowed by the
//    ambiguity margin.
// 3) natural water queries: "voda/vodu/vody/vodoy" (exact inflected forms)
//    added to the bottled-water intent's primary -- the 3-letter "vod" stem
//    requires a full word-boundary on both sides by design (see 05.09.2026
//    note on containsAnchor) and so never actually matched any inflected
//    form of "voda"; bottled water is now the correct default winner for a
//    bare "gde kupit' vodu?" per Andrey's rule, tap only wins when
//    kran/vodoprovod is explicitly present (unchanged, via existing
//    mutual excludes).
// 4) combined requests ("kafe + vegetarian food"): resolved as a side
//    effect of fix (1) -- once "kafe" no longer independently triggers the
//    Wi-Fi intent, the vegetarian intent's specific match wins outright
//    instead of tying with it.
//
// Also: "popit'"/"vypit'" checked for the tap-water intent per Markus's
// request. "popit'" added to primary (unambiguous, always about a
// beverage). "vypit'" added to SYNONYM only, not primary -- in casual
// Russian "vypit'" alone very often means alcohol ("khochu vypit'"), so
// making it independently sufficient would misroute alcohol questions to
// the water intent; verified empirically that "khochu vypit' piva/vodki"
// now correctly matches nothing (falls through to honest fallback) rather
// than firing the water intent. It still adds score when a real water
// anchor (kran/vod/popit'/vodoprovod) is already present.
//
// Also found (not reported by Markus, caught by a full self-match audit
// across all 181 intents -- see conversation): TWO unrelated exact
// duplicate intent pairs (gym/fitness, and port/military-object photo
// question) were silently producing a permanent 100%-identical scoring
// tie, i.e. BOTH topics always fell through to UNKNOWN regardless of
// phrasing, base-wide, since before this session. One copy of each pair
// removed (kept the version with the richer exclude list where they
// differed). The exact duplicate tap-water intent Markus already knew
// about is likewise now a single entry (details merged into it).
// Self-match audit run before/after: 38/181 -> 30/178 failures; the 8
// resolved are exactly the ones above (2 intents removed as duplicates
// count as -3 net toward the /181 -> /178 change, the rest are direct
// fixes). The remaining 30 are unrelated pre-existing items (SIM/CBD/
// harassment/massage/price meta-questions that look like documentation-
// only sub-questions, not real anchor bugs) -- NOT touched, flagged for
// Andrey/Markus to review separately, not fixed blind.
//
// v39, 06.09.2026 -- field-test follow-up after v38: "кафе" alone was
// still UNKNOWN ("Есть рядом недорогое кафе?", "Где кафе рядом?") because
// v38 only stopped it hijacking Wi-Fi, without giving it anywhere correct
// to land. Per Andrey: a bare "кафе" question is an unambiguous "where to
// eat" question and must not require a reformulation. Fix, still inside
// the existing anchor mechanism, no new intent, no if/else:
//   - "кафе" promoted synonym->primary on the generic FOOD intent
//     ("Где недорого поесть...") -- now food wins outright on "кафе" alone.
//   - "кафе" stays synonym-only (not primary) on the Wi-Fi-cafe intent, as
//     it already was after v38 -- unchanged.
//   - Cafe+Wi-Fi still correctly wins over FOOD when a Wi-Fi word is also
//     present ("Кафе с Wi-Fi") -- verified empirically: wifi scores
//     primary(wi-fi)=3 + synonym(кафе)=1 = 4 vs food's primary(кафе)=3,
//     margin 1 clears AMBIGUITY_MARGIN, no new tie introduced.
//   - "кофейня" is untouched and still resolves to the separate coffee
//     intent via that intent's own "кофе" anchors, verified unaffected.
// Also added: Макдональдс/макдак/KFC as primary anchors on the same FOOD
// intent -- specific chain-name questions get the same "where to eat"
// answer as any other food question, no dedicated intent needed for this.
// All four required phrases plus the fast-food additions are now locked
// into regression-tests.js (new this session, part 2 "NAMED_CASES") so
// they can never silently regress again.
// v40, 06.09.2026 -- Andrey's "Block 3" live test (7 FAIL of 22): PHARMACY
// intent's primary list had absorbed the exact anchor words of THREE other
// specific intents (dentist's "врач", painkiller's "таблетк"/"обезболив",
// lens/optics's "линз"/"очк"/"раствор для линз"), so specific requests
// tied or lost to the generic pharmacy answer instead of winning. Removed
// those from PHARMACY's primary, added as excludes instead -- same
// generic-defers-to-specific pattern as FOOD-vs-vegetarian/halal in v39,
// not a weight/scoring change. Two more instances of the identical
// broad-anchor pattern ("врач" in a CBD-prescription sub-question, bare
// "голова" in the hangover-remedy intent, bare "зубн" in the toiletries
// intent, "срочн" causing two unrelated intents to tie against an
// explicit "к зубному врачу" mention) turned up as a direct side effect
// of fixing the dentist case alone and are fixed the same way (demote or
// exclude), NOT by touching offline-qa-match.js -- engine untouched this
// round per Andrey's instruction. "срочн" itself was deliberately NOT
// weakened in the crisis/SOS intent (safety-critical anchor) -- excluded
// "зубн"/"стоматолог" from the competing intents instead, which fixes
// the tie without reducing real-emergency sensitivity.
// Class 2 (bare optics query UNKNOWN): "оптик" was synonym-only on the
// lens intent (promoted to primary -- same diminutive/colloquial rule as
// always). "очк" is a 3-letter stem that containsAnchor()'s word-boundary
// rule can never match against any real inflected form of "очки" (same
// root cause as "вод"/"обед" in v39) -- fixed with explicit inflected
// forms ("очки"/"очков"/"очках"), not by touching the boundary rule.
// Also removed the lens intent's own "аптека" exclude, which had been
// silently vetoing itself on any combined "аптека" + lens-product message
// -- the actual root cause of the "just shows аптека" symptom, arguably
// more than PHARMACY's overload.
// Class 3 (Benu/Specsavers): two more entries in the same BRAND_ENTITIES
// list from v11 (offline-qa-match.js) -- no new mechanism.
//
// v41, 06.09.2026 -- new MEDICAL_FACILITY intent ("Мне нужен врач или
// больница?") added per Andrey's report of a systemic gap: no offline
// category existed for doctor/hospital/clinic at all ("врач" was
// bleeding into PHARMACY's primary, "больница" went straight to UNKNOWN).
// Explicitly NOT fixed by adding "врач"/"больница" to PHARMACY -- "врач"
// removed from PHARMACY's primary entirely. New intent's anchors: врач,
// доктор, больниц, клиник, медцентр, поликлиник, "к врачу" (primary);
// дежурн/приём/недомогани/простыл (synonym -- "приём" kept out of primary
// deliberately, too generic/ambiguous across topics on its own, same
// reasoning as "нормальн"/"срочн" earlier); excludes зубн/стоматолог so
// "нужен зубной врач" stays DENTAL, not MEDICAL_FACILITY. No
// INTENT_CARD_MAP entry (port-card-answers.js) -- checked directly, no
// port's data/{portId}.json has ANY hospital/clinic field -- so this
// intent always falls to its own honest .a text, which states plainly
// there's no confirmed nearest hospital/clinic and points to Emergency
// Contact if genuinely needed, exactly per Andrey's spec; there is no
// path by which this could accidentally surface a PHARMACY address.
//
// Building this surfaced two SAFETY-CRITICAL side effects, both fixed
// carefully rather than papered over -- full reasoning in
// regression-charger.js's Block 6 comment, summary here: the crisis
// "У меня боль в груди" intent's own "боль" anchor was ALSO independently
// matching bare "больница" (shared root) -- demoted to synonym rather
// than excluding "больниц" from the crisis intent, since excluding would
// have silently killed a combined real emergency phrasing like "боль в
// груди, нужна больница". That demotion then exposed a LATENT self-match
// bug: the crisis intent's own primary "грудь" never actually matched
// its own canonical text's "груди" (case-inflected) -- invisible until
// "боль" stopped masking it. Fixed with an explicit "груди" form. Also
// demoted: dentist's bare "больн" (same root collision) -> synonym;
// vaccination's "медцентр" -> synonym (a bare "где медцентр" is a
// general facility question, not specifically about a vaccine).
//
// v42, 06.09.2026 -- MEDICAL_FACILITY given a stable "id": "medical_facility"
// field per Andrey's robustness request: app.js and port-card-answers.js
// were matching this ONE intent by comparing the literal .q text, so
// rewording the question later would silently break the hospital-card
// wiring (and the v41 fallback) with no error, just a quietly wrong
// answer. Deliberately added ONLY to this intent, not as a schema change
// across all 179 -- every other intent is untouched and still has no
// "id" field; nothing else reads or requires one.
//
// v43, 06.09.2026 -- Andrey's live test found "Мне нужна скорая помощь"
// landing in the generic "unclear" fallback, TWICE. Root cause: a
// PRE-EXISTING 4-4 tie between "Какой номер экстренных служб?" (now id
// "medical_emergency") and "Мне плохо, что делать?" (both anchor on
// "помощь"/"скор(а)") -- present before this session even started,
// simply never tested with the literal word "помощь" attached to
// "скорая" until now. Two changes here: (1) "medical_emergency" id added
// to "Какой номер экстренных служб?" for the same stable-routing reason
// as v42's "medical_facility". (2) "скорая"/"скорую" added to "Мне
// плохо"'s exclude -- an explicit ambulance request is a more specific,
// more actionable ask than the generic IMWIRSA-duty-office routing, and
// should win outright rather than tie with it. This is defense in depth
// only: the actual fix that guarantees this can never tie again is the
// new isMedicalEmergencyTopic() deterministic check in offline-qa-match.js
// (v14), called before this scored table runs at all -- see there and
// app.js's priority order for the full picture.
//
// v44, 06.09.2026 -- false positive found live: "Скоро буду в порту" was
// firing the emergency route. Root cause: this same intent's "скор" (4
// letters) primary anchor -- containsAnchor()'s boundary rule only
// checks a LEFT boundary for anchors longer than 3 characters, so "скор"
// happily prefix-matched "скоро"/"скорость"/"скоростной" too, none of
// which have anything to do with an ambulance. Replaced with the exact
// forms that actually mean ambulance: "скорая"/"скорую"/"скорой". No
// coverage lost -- every real ambulance mention is caught earlier anyway
// by isMedicalEmergencyTopic() (v15, offline-qa-match.js), which now
// ALSO checks word boundaries per Markus's request rather than raw
// substring. Checked directly: "скор" appeared as a bare anchor ONLY in
// this one intent, nowhere else in the base.
//
// v45, 06.09.2026 -- DENTAL given a stable "id": "dental" field, same
// reason as v42/v43 -- app.js now special-cases this intent's reply the
// same way it already does for medical_facility/medical_emergency (see
// dentalFallbackAnswer() in port-card-answers.js): a two-part answer
// pointing to the nearest CONFIRMED hospital when no dentistry is
// confirmed on the card, instead of stopping at "no data". No anchor or
// scoring change here at all -- purely wiring for the new reply logic.
//
// v46, 06.09.2026 -- DENTAL RU anchors expanded per Markus (Russian
// only for now -- EN/other languages deliberately deferred until this is
// stable). Added: "дантист", "стоматология", "зубной врач" as direct
// anchors. Added compoundAnchors (offline-qa-match.js v16, a new general
// engine mechanism, not dental-specific): tooth-noun forms
// "зуб"/"зуба"/"зубы"/"зубов" now count when combined, in ANY order,
// with a medical action/symptom word ("болит"/"болят"/"лечить"/
// "лечени"/"удалить"/"врач"/"помощь") -- covers "лечить зубы", "зубы
// лечить", "где лечить зубы" identically, without ever making a bare
// tooth-noun independently sufficient (Markus's explicit requirement, to
// keep this from becoming a general "зуб" trigger). The tooth-NOUN family
// ("зуб-") and the "зубная паста/щётка" ADJECTIVE family ("зубн-") are
// different stems and don't collide via containsAnchor's own boundary
// rule -- verified directly, not assumed; compoundAnchors solves the
// AND-condition problem, not a collision that didn't exist.
//
// v47, 06.09.2026 -- TRANSPORT/GATE batch, per Andrey's screenshot test
// (Markus prepared the phrases, screenshots sent directly, per the new
// workflow). Same root cause class throughout: a broad word ("такси",
// "автобус", "ворота", "выход", "пропуск") sitting as an independently-
// sufficient PRIMARY anchor in 2+ intents at once, tying the message into
// UNKNOWN. One genuine homonym found too: "терминал" (payment terminal)
// in the card-payment intent was also matching "терминал" (port terminal
// building), actively misrouting "Как попасть из терминала в город?" to
// a Wellness/payment answer -- demoted to synonym there, no intent
// currently covers "get from the terminal building to town" so this now
// correctly falls to UNKNOWN instead of a wrong answer.
//
// Unprompted safety-adjacent find while investigating: "карт"/"наличн"/
// bare "нет" were ALSO primary in "У меня совсем нет денег" (escalates
// to the IMWIRSA duty office) and in "Где ближайший банкомат?" -- an
// ordinary "can I pay by card" question could have been misrouted into
// either. Fixed the same way as always: demoted to synonym, kept each
// intent's own real distinguishing words ("денег"+"пусто" for the
// no-money escalation, "банкомат" for the ATM intent) as primary.
//
// Two self-inflicted regressions caught and fixed in the SAME round:
// consolidating "ворота" onto the port-gate intent made "Где ворота в
// старый город?" (a different topic) wrongly resolve there too (fixed
// with an exclude); demoting "автобус"/"поезд" in the last-bus intent
// broke ITS OWN self-match against the now-unweakened public-transport
// intent (fixed by excluding "последн" from public-transport). Full
// list of every phrase and every touched intent in regression-charger.js
// Block 13.
//
// v48, 06.09.2026 -- follow-up live test found "не хочу" (bare phrase,
// weight x5) as PRIMARY in the vessel-return-refusal intent, which
// escalates to the IMWIRSA duty office with a "legal consequences" reply
// -- "Такси не хочу" was firing that serious escalation for an ordinary
// taxi refusal. Demoted to synonym; the intent's own real signal
// ("судно"/"возвращатьс"/"берег"/"отказ") stays primary. See
// regression-charger.js Block 14.
//
// v49, 07.09.2026 -- chest-pain intent given a stable "id":
// "chest_pain_emergency" (same reason as medical_facility/medical_emergency/
// dental: stable routing, not tied to .q wording) and its own reply now
// leads with "звони 112" instead of only the Duty Office callback --
// per Andrey's review of the offline-mode restructuring, chest pain is a
// classic heart-attack symptom and deserves the same immediate priority
// as an explicit ambulance request. Primary fix is at the detection layer
// (offline-qa-match.js v17, MEDICAL_EMERGENCY_KEYWORDS) -- this intent is
// now defense-in-depth for phrasings that don't hit those exact markers.
//
// v50, 07.09.2026 -- "Можно выйти пешком?" found live, consistent across
// devices (not a cache issue -- checked and confirmed): a bare "пешком"
// mention ties 3-3 between two unrelated intents ("Как добраться до
// центра моряков" and "Это район безопасный для прогулки в форме"),
// neither of which is the right answer, so the actual gate/exit intent
// never even entered the race. The real answer was already sitting in
// this intent's own wired card data the whole time -- Vanasadam's
// confirmed gate row literally says "Pedestrian exit". Fixed by adding
// "выйти пешком"/"пройти пешком" as PRIMARY phrase anchors (weight x5)
// on the gate intent -- safely outscores the two colliding intents
// (weight 3 each) without touching their own "пешком" anchor or
// reopening that ambiguity for messages that don't mention exiting.
//
// v52, 09.09.2026 -- Premium/Wellness/QR & Discounts/Online AI Assistant
// content wired in (73 new intents + 3 existing intents updated for
// consistency with the finalized copy: Wellness definition, generic
// "Есть ли скидки" -> Partner Discounts, "профсоюз не даёт Premium").
// 9 draft Wellness questions were dropped as exact duplicates of already-
// coded intents (massage hands/chair, sauna/pool, card payment, advance
// booking, aromatherapy, "just lie in silence", bring a companion, session
// length, base price) rather than re-added -- existing entries left as-is.
// Self-match regression run across the full corpus after wiring: started
// at 47 new-content collisions (root cause: compoundAnchors phrases that
// were paraphrased rather than literal substrings of their own "q" --
// e.g. "на сколько дали" doesn't match "на сколько МНЕ дали"), fixed down
// to 0 new collisions -- the 16 remaining self-match misses are all
// pre-existing baseline noise from before this pass (matches the
// project's long-standing ~16/179 baseline, e.g. CBD/SIM-card tie,
// alcohol/supermarket ties -- untouched by this pass).
//
// v51, 09.09.2026 -- COMPANION_INTENTS "Раздражение на ассистента"
// (below) expanded per live sticky-Companion-Mode testing: meta-comments
// about the assistant repeating itself ("Ты опять почти то же самое
// говоришь", "Или у тебя только готовые ответы?") had no anchor at all
// and were falling through to the ordinary intent table (one landed on
// the POST OFFICE intent) -- see offline-qa-match.js v18 / app.js for
// the sticky-mode rewrite this is part of.
// v53, 10.09.2026 -- Markus's mixed-regression review after live on-device
// testing of the whole app together (Premium/Wellness/QR/AI + old content
// + Companion, mixed in one session -- see the 14-screenshot batch).
// Fixed all 4 points raised:
//   1. Companion exit-check dropped from the strict/marker-gated bar back
//      to the ORDINARY confidence threshold -- the raised bar was
//      blocking clean, unambiguous informational exits (pharmacy, Wi-Fi,
//      Seafarers' Centre, bus times, Wellness, Premium, QR all got stuck
//      in Companion's "still listening" fallback live).
//   2. New findProtectedIntent() check added, running BEFORE
//      findCompanionReply() even gets a chance to claim the message --
//      CBD/drugs/alcohol (11 intents, intents-data.js "protected": true)
//      now have the same unconditional this-always-wins guarantee medical
//      emergency already had structurally, instead of depending on
//      whichever classifier ran first.
//   3. (Premium/Wellness/QR/AI routing) -- covered by fix 1; the content
//      itself (73 intents from v52) was already correct, it just couldn't
//      escape Companion to be reached.
//   4. "Сколько стоит Wellness?" was answering with taxi-pricing text --
//      turned out to be a pre-existing COPY-PASTE bug in the Wellness
//      price intent's own .a field (not a genuine taxi/Wellness anchor
//      collision as first guessed), fixed at the source.
// Self-match regression re-run after all four: 16/250 failures, identical
// list to before this pass -- zero new collisions introduced.
//
// v54, 11.09.2026 -- Markus's second mixed-regression review (19
// screenshots). Fixed:
//   - "экипаж" alone (crew-entrance intent) was firing on "Начальство и
//     экипаж сегодня достали" -- moved to compoundAnchors, now requires
//     an actual entrance/gate word alongside it (point 5).
//   - "рейс" alone (transport intent, offline-qa-match.js side) -- see
//     that file's v21 note (point 4).
//   - QR/discount coverage: "Покажи мой QR" (bare imperative, no "где
//     найти") and "Могу дать свой СКИДОЧНЫЙ код товарищу" (no literal
//     "QR") both fell through -- both intents' compoundAnchors widened.
//   - Premium-expiry: "У меня ЗАКОНЧИЛСЯ Premium" (past tense, missed
//     because only "закончится доступ" was covered) and "Если Premium
//     закончится завтра, онлайн-AI ТОЖЕ ОТКЛЮЧИТСЯ" (AI-expiry intent's
//     own compoundAnchors phrases weren't literal substrings) -- both
//     widened with the actual live wording.
//   - Point 8: 5 unrendered {placeholder} templates found and fixed at
//     the source (alcohol/CBD/taxi/sauna/nightlife answers) -- some had
//     already been flagged and still weren't fixed until now.
// Self-match regression after all changes: 16/250, IDENTICAL list to
// before this pass -- zero new collisions.
// v56, 11.09.2026 -- Markus's fourth mixed-regression review (17-point
// doc + screenshots). Explicit instruction: fix via intent-family/
// semantic-marker combinations, not per-phrase hardcoding. Changes:
//   Point 2 (Port Exit): the physical-gate intent ("Через какие ворота
//   выйти в город") and the permit-need intent ("Нужен ли пропуск")
//   used to compete for the same vocabulary ("выбраться"/"из порта") and
//   the permit intent usually won, giving a permit-rules answer to a
//   plain "where's the gate" question. Consolidated: gate-direction now
//   owns "выбраться"/"попасть в город"/"из порта"/"выход" and its answer
//   leads with the physical direction, THEN appends the permit caveat;
//   permit-need is now reserved for messages that actually ask about a
//   permit/document (excludes gate-direction's own vocabulary).
//   Point 3 (Food near gate): added рядом/поблизости/недалеко/возле/
//   около and ворота/выход/терминал/gate as real synonyms on the food
//   intent; excluded food words from the shuttle-transport intent, which
//   was winning ties via bare "терминал".
//   Point 4 (Wellness family): found and fixed a 5-way tie on bare
//   "массаж" (same failure class as the CBD tie from the very first
//   session) -- massage-hands-vs-chair, the "happy ending" salon intent,
//   the fall-asleep-during-massage intent, and the AI-identity intent all
//   shared it as a bare anchor. Moved "массаж" into compoundAnchors on
//   each, paired with that intent's own real distinguishing marker.
//   Rewrote the hands/chair answer to stop guessing ("Обычно есть и то,
//   и другое") -- now honestly defers to confirmed port-card data or
//   Wellness Host. Broadened the Wellness "what's here" intent to also
//   catch "что есть"/"расслабиться"+"по premium"/"под premium".
//   Point 8/9: "понимать лучше" (infinitive) added alongside "понимает
//   лучше"; QR-troubleshoot broadened to "не читается"/"не считывает"/
//   "касса не видит" alongside "не сканируется" (with an exclude for
//   "везде"/"постоянно" so it doesn't swallow the separate systemic-
//   failure intent).
//   Point 14: removed the unconfirmed "по правилам IMO/ILO" claim from
//   both CBD-on-board intents, rewritten as "зависит от судовладельца и
//   судовой политики, не могу подтвердить конкретное правило"; removed
//   "можно спросить у местных/охраны" (where-to-buy suggestion) from all
//   three alcohol intents.
//   Family tagging (points 5/6): 28 Wellness intents tagged
//   `"family": "wellness"` -- read by app.js's new family-context
//   follow-up mechanism (see offline-qa-match.js / app.js changes).
// Self-match regression after all changes: 16/250, IDENTICAL list to
// every prior pass this session -- zero new collisions. Markus's full
// point-17 control-test list (10 scenarios, 17 messages) verified
// end-to-end against the actual companion/family/emergency pipeline.
//
// v55, 11.09.2026 -- Markus's third mixed-regression pass (4 remaining
// failures). Explicit instruction this time: fix via semantic markers of
// the intent family, not hardcoded phrase additions. Root cause in every
// case was the SAME pattern -- an existing intent already covered the
// underlying question, but its compoundAnchors/primary required one
// specific literal wording that the live phrasing didn't share:
//   - Port exit: "выбраться"/"покинуть" added as real synonym words for
//     "выйти" (shore-pass intent's primary) -- NOT a hardcoded phrase,
//     a genuine additional verb for the same "leave the port" concept.
//     (A compoundAnchors attempt using "город"/"порт" as the second
//     group failed silently -- both words are in GENERIC_CONTEXT_WORDS,
//     specifically excluded from ever counting as anchors because
//     they're too common; worth remembering before reaching for
//     compoundAnchors with a common noun as one side.)
//   - Wellness location: group2 only recognised "где находится" -- added
//     "где здесь" as a second real locative marker for the same "find
//     this place" semantic slot.
//   - Premium overview: group2 only recognised "что я получу" -- added
//     "что даёт"/"что дает" as the other natural verb for the same
//     "what does this give me" question.
//   - AI capabilities: previously required the literal word "standard"
//     alongside "не понимаешь"/"иногда" -- dropped the "standard"
//     requirement entirely, since "не понимаешь"+"иногда" together are
//     already a specific enough semantic pair for this exact family
//     without needing a third, unrelated anchor.
// Self-match regression after all four: 16/250, IDENTICAL list -- zero
// new collisions.
// v57, 11.09.2026 -- Wellness follow-up/access review (5 points, scoped
// deliberately narrow -- "остальную маршрутизацию не менять"). Verified
// nothing outside Wellness moved: Port Exit/Food/Premium AI/QR/Companion/
// Emergency all re-tested unchanged in the same pass.
//   3. Booking/access intent ("Где мне записаться в Wellness-зону?")
//      broadened with попасть/прийти/воспользоваться/записыва/запись/
//      бронировать/бронь/как туда попасть/нужна запись.
//   2. Location intent gained "где это"; hours intent gained "когда
//      работает" -- both so the family-context follow-up retry (app.js,
//      state.lastIntentFamily, already built in v56) actually lands on
//      the right specific intent for these short pronoun-less phrasings.
// (Points 1 and 5 -- "remember wellness for one turn" / "reset on any
// other explicit intent" -- were already correct as of v56, verified
// again here, not re-implemented.)
// Point 4 (bare "wellness"/"wellnes"/"велнес"/"веллнес" as a strong
// standalone marker) lives in offline-qa-match.js's SPELLING_VARIANTS,
// not here -- see that file's version note for a real bug found while
// building it: \b does not work as a word boundary around Cyrillic
// letters in JS regex.
// Self-match regression: 16/250, identical list. Full point-17 control
// set re-verified end to end, plus the 6 new follow-up phrasings.
// v58, 11.09.2026 -- Wellness follow-up chain fix (2 points, scoped
// narrow per explicit instruction -- "остальную маршрутизацию не
// менять", re-verified below).
//   Point 2: "Надо записываться заранее..." used to promise MWApp itself
//   would "подскажет свободные слоты и забронирует время" -- rewritten
//   to the honest unified line ("уточни у Wellness Host... MWApp не
//   отслеживает актуальные свободные слоты и не бронирует время"), and
//   its access-word coverage broadened ("запис" stem instead of the
//   exact "запись", plus "без записи"/"свободное время"/"свободные
//   слоты" via compoundAnchors requiring "wellness"). That broadening
//   immediately tied with two PRE-EXISTING, more specific sibling
//   intents ("Где узнать точное расписание и записаться?", "Я
//   записался, но передумал") that also happen to say "запис*" --
//   added their own distinguishing words to this intent's exclude list
//   so the more specific one still wins outright, no tie.
//   Point 1: the underlying cause of "Сколько это стоит?" losing the
//   chain was actually a pre-existing bug (already in the 16/250
//   baseline noise, just never live-evidenced until now): its own
//   primary phrase "сколько стоит" doesn't even match its OWN canonical
//   text "Сколько это стоит?" -- "это" sits between the two words,
//   breaking the phrase substring. Fixed with compoundAnchors using the
//   literal "сколько это стоит" alongside "сколько стоит"/"какая цена".
//   Hours intent ("Во сколько работает Wellness-зона?") broadened with
//   открывается/до скольки for the "Во сколько открывается?"/"До
//   скольки работает?" phrasings.
// The actual multi-turn PERSISTENCE fix (a message chain of several
// consecutive topic-less follow-ups all staying in Wellness, not just
// the first one) is in app.js's sendAssistantChatMessage(), not here --
// see that file's version note.
// Self-match regression: 16/250, identical list to every prior pass.
// Full point-17 control set + all today's new follow-up chains re-
// verified end to end; Port Exit/Food/Premium AI/QR/Companion/Emergency
// all confirmed unchanged.
// v59, 11.09.2026 -- "Blind test" review, 6 points, scoped narrow per
// explicit instruction ("Уже работающие Port Exit, Food, Supermarket,
// Wellness booking follow-up, Pharmacy и Transport не менять" --
// re-verified below, unaffected).
//   1. Wellness + Premium/recovery: "Я с Premium. Где можно немного
//      отдохнуть и восстановиться?" was winning on the NIGHTLIFE intent
//      (bare "отдохнуть"/"отдых", no "wellness"/"premium" exclude) --
//      added "premium"/"восстанов" to that intent's exclude, and
//      broadened the Wellness "what's here" intent's own compoundAnchors
//      with "где можно"/"с premium"/"что вообще предлагают" so it wins
//      instead. This is the SAME root pattern as the CBD-tie and
//      массаж-tie fixes earlier this session: a bare word ("отдохнуть")
//      shared across an unrelated intent family, fixed via exclude +
//      broadening the correct destination's own anchors, not a new
//      hardcoded answer.
//   2. Partner Discount troubleshooting: "Мой код скидки магазин не
//      принимает" was landing on the generic Partner Discounts
//      description (bare "скидк") instead of the troubleshooting intent
//      (which required literal "QR", not present here) -- broadened
//      that intent's own group1 to accept "код скидк"/"скидочн"/"мой
//      код" and group2 with не принимает/не работает/не проходит/не
//      срабатывает/не считывает/отказали в скидке/не берут; added the
//      same markers to the generic description intent's exclude so it
//      backs off cleanly instead of tying. Also excluded везде/
//      постоянно (already the systemic-failure intent's own territory,
//      added last session) to avoid re-opening that tie.
//   3. Premium AI: "Если подключится Premium AI, мне можно будет
//      говорить обычными словами?" was landing on a POLICE-stop intent
//      via its own bare "говорить" primary word -- added premium/ai to
//      that police intent's exclude (its own actual territory
//      untouched), and broadened the Premium-AI-capabilities intent's
//      group2 with обычными словами/обычная речь/свободно
//      формулировать/своими словами.
// Self-match regression: 16/250, identical list. Full point-17 set +
// this session's new scenarios re-verified end to end.
// ============================================================================
// v60, 11.09.2026 -- "Architecture" review (Markus): "точечное расширение
// словарей больше не решает проблему... новые естественные перефразировки
// снова выпадают, хотя близкие тестовые фразы уже работают." Rather than
// keep hand-writing near-duplicate compoundAnchors phrase lists per intent
// (which only ever covers exactly the wordings someone tested), this
// defines a small set of REUSABLE CONCEPT-GROUP word lists -- STEMS where
// it's safe (a stem like "отдохн" auto-catches отдохнуть/отдохну/отдохнём
// via containsAnchor's existing prefix-match rule for anchors >3 chars,
// with zero extra code), literal phrases only where a stem would be
// unsafe or meaningless (negations like "не работает" can't be stemmed).
// An intent is then built by COMBINING two or more of these groups via
// compoundAnchors (AND across groups, OR within each group -- the
// mechanism already existed, see hasCompoundAnchorMatch() in
// offline-qa-match.js; what's new here is building groups meant to be
// reused across several intents instead of writing one bespoke list per
// intent). A new paraphrase that combines the same concepts (e.g. any
// future rewording of "Premium" + "restore/recharge" for Wellness) is
// caught automatically, without another hand-added phrase.
// Applied this pass to the 5 areas flagged: Wellness+Premium/recovery,
// Partner Discounts sub-intents, Premium AI, the fatigue/cancellation
// companion vocabulary, and Return to Ship. NOT a full rewrite of the
// other ~245 intents -- that's a much larger undertaking than this pass,
// left for its own dedicated effort.
// Self-match regression after wiring these into the 5 flagged intents:
// 16/250, identical baseline list. Verified against NEW paraphrases the
// code had not seen before (not the ones in the review doc, which were
// deliberately withheld as external control) -- e.g. "После вахты хочу
// прийти в себя. У меня Premium." and "Мне отклонили скидку на кассе."
// both resolved correctly on the first try.
const PREMIUM_MARKERS = ["premium", "премиум"];
const RECOVERY_MARKERS = [
  "отдохн", "расслаб", "восстанов", "прийти в себя", "снять усталость", "отдых",
];
const WELLNESS_DIRECT_MARKERS = ["wellness", "массаж", "кресл"];
const AI_MARKERS = ["ai", "ии", "онлайн-ai", "онлайн-ии"];
const AI_CAPABILITY_MARKERS = [
  "понима", "обычными словами", "свободно говорить", "свободно писать",
  "без специальных фраз", "контекст", "естественная речь", "своими словами",
  "обычная речь",
];
const DISCOUNT_TOPIC_MARKERS = ["скидк", "qr"];
// Negations can't be stemmed the way an ordinary word can (the meaning
// flips entirely), so these stay as short literal phrases -- still a
// reusable GROUP, just not stem-generalized the way the others are.
const DISCOUNT_PROBLEM_MARKERS = [
  "не работает", "не принима", "не приня", "отказал", "отклонил",
  "не счита", "не примен", "не проходит", "не срабатывает", "не берут",
];
const RETURN_MARKERS = ["назад", "обратно", "верн", "попасть обратно", "добраться обратно"];
const SHIP_MARKERS = [
  "судно", "корабл", "борт", "наше судно", "где пришвартовано", "место стоянки", "к причалу",
];
const CANCELLATION_MARKERS = ["неважно", "ладно с", "забудь", "не надо", "уже неинтересно", "да ладно"];

const INTENTS = [
  {
    "q": "Где купить сигареты?",
    "primary": [
      "курить",
      "сигаретк",
      "табак",
      "сигарет"
    ],
    "synonyms": [
      "закурить",
      "курево",
      "покурить",
      "пачка"
    ],
    "exclude": [
      "кальян",
      "вейп",
      "жидкость",
      "эльфбар",
      "cbd",
      "трав",
      "план",
      "марихуан",
      "гигиена",
      "кося",
      "гашиш",
      "дунуть",
      "weed",
      "cannabis",
      "hash",
      "joint"
    ],
    "a": "«В большинстве портов сигареты продают в минимаркетах или на АЗС в городе. Уточни у охраны, где ближайший табачный ларёк — они точно знают.»"
  },
  {
    "q": "Где купить зарядное устройство или переходник?",
    "primary": [
      "чехол",
      "type-c",
      "карт памяти",
      "адаптер",
      "флешк",
      "зарядник",
      "защитн стекл",
      "переходник",
      "кабель",
      "заряд",
      "usb-c",
      "зарядк",
      "microsd",
      "micro-usb",
      "блок питани",
      "провод",
      "lightning"
    ],
    "synonyms": [
      "type-c",
      "пауэрбанк",
      "для розетки",
      "micro-usb"
    ],
    "exclude": [
      "какой тип",
      "алкоголь",
      "что за тип",
      "такси",
      "еда",
      "сигарет"
    ],
    "a": "«В карточке этого порта нет подтверждённого магазина с зарядными устройствами и переходниками. Можно спросить у охраны порта или судового агента.»"
  },
  {
    "q": "Где купить зонт?",
    "primary": [
      "зонт",
      "дожд",
      "непогод"
    ],
    "synonyms": [
      "складной",
      "от дождя"
    ],
    "exclude": [
      "еда",
      "такси",
      "сигареты"
    ],
    "a": "«В карточке этого порта нет подтверждённого магазина с зонтами. Можно спросить у охраны порта или судового агента.»"
  },
  {
    "q": "Где купить тёплые носки?",
    "primary": [
      "носк",
      "термобель"
    ],
    "synonyms": [
      "шерстян",
      "на ноги",
      "согрет"
    ],
    "exclude": [
      "обувь",
      "шлепанцы",
      "сланцы"
    ],
    "a": "«Точный адрес магазина для этого порта пока не подтверждён, но обычно такие вещи продаются в минимаркетах у входа в порт или на заправках. Спроси у охраны на проходной — они подскажут ближайший универсам.»"
  },
  {
    "q": "Где купить недорогую обувь или шлёпанцы?",
    "primary": [
      "стельк",
      "тапк",
      "тапоч",
      "ботинк",
      "обув",
      "кед",
      "туфл",
      "шнурк",
      "кроссовк",
      "сланц",
      "шлепанц",
      "сандал"
    ],
    "synonyms": [
      "ботиночк",
      "резинов",
      "сандал",
      "на ноги",
      "кроссы"
    ],
    "exclude": [
      "носки",
      "термобель",
      "одежда"
    ],
    "a": "«В карточке этого порта нет подтверждённого магазина с недорогой обувью. Можно спросить у охраны порта или судового агента.»"
  },
  {
    "q": "Где купить powerbank?",
    "primary": [
      "пауэрбанк",
      "powerbank"
    ],
    "synonyms": [
      "портативн заря",
      "аккумулятор"
    ],
    "exclude": [
      "кабель",
      "переходник",
      "розетка"
    ],
    "a": "«В карточке этого порта нет подтверждённого магазина с powerbank. Можно спросить у охраны порта или судового агента.»"
  },
  {
    "q": "Где купить наушники?",
    "primary": [
      "наушник",
      "гарнитур",
      "bluetooth"
    ],
    "synonyms": [
      "беспроводн",
      "проводн",
      "в уши"
    ],
    "exclude": [
      "зарядка",
      "пауэрбанк",
      "переходник"
    ],
    "a": "«В карточке этого порта нет подтверждённого магазина с наушниками. Можно спросить у охраны порта или судового агента.»"
  },
  {
    "q": "Где недорого поесть рядом с портом?",
    "primary": [
      "поест",
      "еда",
      "перекус",
      "обед",
      "пообедат",
      "позавтрак",
      "поужинат",
      "кафе",
      "макдональдс",
      "макдак",
      "kfc"
    ],
    "synonyms": [
      "покушат",
      "голодн",
      "столовк",
      "закусочн",
      "пожрат",
      "кушат",
      "ресторан",
      "фастфуд",
      "дешев",
      "недорог",
      "рядом",
      "поблизости",
      "недалеко",
      "возле",
      "около",
      "ворота",
      "выход",
      "терминал",
      "gate"
    ],
    "exclude": [
      "алкоголь",
      "бар",
      "выпить",
      "кофе",
      "сигареты",
      "такси",
      "вегетариан",
      "веган",
      "халяль",
      "халал"
    ],
    "a": "«В портовых городах почти всегда есть бюджетные закусочные недалеко от входа. Ищи вывески «еда» или фастфуд. В супермаркетах есть готовые салаты и сэндвичи — это самый дешёвый вариант.»"
  },
  {
    "q": "Где выпить кофе недорого?",
    "primary": [
      "кофе",
      "капучин",
      "эспресс",
      "американо"
    ],
    "synonyms": [
      "выпит кофе",
      "кофейн",
      "бодр"
    ],
    "exclude": [
      "еда",
      "поесть",
      "обед",
      "суп",
      "горячее"
    ],
    "a": "«В карточке этого порта нет подтверждённого места с недорогим кофе. Можно спросить у охраны порта или судового агента.»"
  },
  {
    "q": "Есть ли рядом вегетарианская еда?",
    "primary": [
      "вегетариан",
      "овощн",
      "без мяс",
      "веган"
    ],
    "synonyms": [
      "растительн",
      "постн"
    ],
    "exclude": [
      "мясо",
      "шашлык",
      "бургер",
      "рыба"
    ],
    "a": "«В карточке этого порта нет подтверждённого вегетарианского кафе. Можно спросить у охраны порта или судового агента.»"
  },
  {
    "q": "Есть ли рядом халяльная еда?",
    "primary": [
      "халяль",
      "халал",
      "мусульман",
      "баранин"
    ],
    "synonyms": [
      "дозволенн",
      "без свинин"
    ],
    "exclude": [
      "свинина",
      "алкоголь",
      "вегетарианство"
    ],
    "a": "«Информация о халяльных заведениях для этого порта пока не добавлена. Попробуй поискать в картах «halal food near me» или спроси у сотрудников Центра моряков.»"
  },
  {
    "q": "Можно ли пить воду из-под крана?",
    "primary": [
      "вод",
      "кран",
      "пить",
      "попить",
      "водопровод"
    ],
    "synonyms": [
      "из-под крана",
      "водя",
      "техническ",
      "безопасн",
      "качеств",
      "выпить"
    ],
    "exclude": [
      "бутилированн",
      "купить",
      "магазин",
      "цена"
    ],
    "a": "«Официальная информация о качестве воды в этом городе отсутствует. Рекомендую НЕ пить воду из-под крана и покупать бутилированную — это безопаснее.»"
  },
  {
    "q": "Где купить бутилированную воду?",
    "primary": [
      "бутилированн",
      "вод",
      "вода",
      "воду",
      "воды",
      "водой"
    ],
    "synonyms": [
      "питьев",
      "без газа",
      "минеральн",
      "магазин",
      "бутылк"
    ],
    "exclude": [
      "кран",
      "из-под крана",
      "водопровод"
    ],
    "a": "«В карточке этого порта нет подтверждённых данных о продаже воды. Можно уточнить у охраны порта или судового агента.»"
  },
  {
    "q": "Где ближайшая аптека?",
    "primary": [
      "аптек",
      "антисептик",
      "маск медицинск",
      "пластыр",
      "термометр",
      "лекарств",
      "бинт",
      "градусник"
    ],
    "synonyms": [
      "зелён крест",
      "фарма",
      "медицин"
    ],
    "exclude": [
      "еда",
      "супермаркет",
      "сигареты",
      "алкоголь",
      "зубн",
      "стоматолог",
      "линз",
      "очк",
      "обезболив",
      "таблетк",
      "cbd"
    ],
    "a": "«Обычно аптека есть рядом с портом или на главной улице. Ищи зелёный крест. Спроси охрану — они скажут, где ближайшая.»"
  },
  {
    "q": "Можно ли купить обезболивающее без рецепта?",
    "primary": [
      "обезболив",
      "таблетк",
      "рецепт"
    ],
    "synonyms": [
      "без рецепт",
      "от голов",
      "парацетамол",
      "ибупрофен"
    ],
    "exclude": [
      "антибиотик",
      "рецептурн",
      "сильн"
    ],
    "a": "«В большинстве стран простые обезболивающие продают без рецепта, но в некоторых могут попросить рецепт на сильные препараты. Спроси в аптеке.»"
  },
  {
    "id": "dental",
    "q": "Что делать, если заболел зуб?",
    "primary": [
      "зуб",
      "стоматолог",
      "стоматология",
      "зубн",
      "дантист",
      "зубной врач"
    ],
    "compoundAnchors": [
      ["зуб", "зуба", "зубы", "зубов"],
      ["болит", "болят", "лечить", "лечени", "удалить", "врач", "помощь"]
    ],
    "synonyms": [
      "больн",
      "пломб",
      "десн",
      "сверлит",
      "вырвать"
    ],
    "exclude": [
      "голова",
      "спина",
      "живот",
      "трава"
    ],
    "a": "«Мы не нашли стоматологию в базе этого порта. Обратись в центр моряков — у них часто есть список дежурных зубных врачей для моряков. Или звони в экстренную службу.»"
  },
  {
    "id": "medical_facility",
    "q": "Мне нужен врач или больница?",
    "primary": [
      "врач",
      "доктор",
      "больниц",
      "клиник",
      "медцентр",
      "поликлиник",
      "к врачу"
    ],
    "synonyms": [
      "дежурн",
      "приём",
      "недомогани",
      "простыл"
    ],
    "exclude": [
      "зубн",
      "стоматолог"
    ],
    "a": "«В карточке этого порта нет подтверждённых данных о ближайшей больнице или клинике. Если тебе действительно плохо и нужна срочная помощь — звони в экстренную службу или проси капитана вызвать скорую.»"
  },
  {
    "q": "Где купить раствор для контактных линз или очки?",
    "primary": [
      "линз",
      "очк",
      "очки",
      "очков",
      "очках",
      "раствор",
      "зрен",
      "оптик"
    ],
    "synonyms": [
      "контактн",
      "для глаз"
    ],
    "exclude": [
      "лекарства",
      "таблетки"
    ],
    "a": "«Раствор для линз продаётся в аптеках и оптиках. Очки (готовые) — в супермаркетах и на рынках.»"
  },
  {
    "id": "sim_purchase_location",
    "q": "Где купить местную SIM-карту?",
    "primary": [
      "sim",
      "сим-карт",
      "оператор",
      "мобильн"
    ],
    "synonyms": [
      "местн номер",
      "симка",
      "сотовый",
      "интернет на телефон",
      "сим",
      "симкарта",
      "prepaid",
      "предоплат",
      "связь"
    ],
    "exclude": [
      "wi-fi",
      "бесплатн",
      "роуминг",
      "esim",
      "зарядк",
      "документ",
      "паспорт",
      "seaman's book"
    ],
    "a": "«В карточке этого порта нет подтверждённого места продажи SIM-карт.»"
  },
  {
    "id": "sim_documents_required",
    "q": "Нужен ли документ для покупки SIM-карты?",
    "primary": [
      "документ",
      "паспорт",
      "регистрац",
      "seaman's book"
    ],
    "synonyms": [
      "загран",
      "удостовер",
      "копия",
      "нужн паспорт"
    ],
    "exclude": [
      "цена",
      "тариф",
      "интернет",
      "гигабайт",
      "минуты"
    ],
    "a": "«В карточке этого порта нет подтверждённых данных о документах для покупки SIM-карты.»"
  },
  {
    "id": "wifi_free",
    "q": "Есть ли рядом бесплатный Wi-Fi?",
    "primary": [
      "wi-fi",
      "бесплатн",
      "вайфай",
      "интернет"
    ],
    "synonyms": [
      "раздат",
      "подключитс",
      "сеть",
      "сигнал",
      "инет",
      "вай-фай",
      "wifi",
      "связь"
    ],
    "exclude": [
      "sim",
      "симка",
      "оператор",
      "минуты",
      "звонки"
    ],
    "a": "«В карточке этого порта нет подтверждённых данных о бесплатном Wi-Fi. Можно уточнить на ресепшн порта/терминала или в центре моряков — иногда там есть Wi-Fi для гостей.»"
  },
  {
    "q": "Где отправить письмо или посылку домой?",
    "primary": [
      "посылк",
      "письм",
      "почт",
      "отправит"
    ],
    "synonyms": [
      "бандерол",
      "открытк",
      "заказн",
      "dhl",
      "fedex"
    ],
    "exclude": [
      "wi-fi",
      "телефон",
      "sim",
      "позвонить"
    ],
    "a": "«В карточке этого порта нет подтверждённого почтового отделения. Для отправки посылки обычно нужен паспорт — это можно уточнить у судового агента вместе с адресом ближайшей точки.»"
  },
  {
    "q": "Какой тип розетки или переходника нужен?",
    "primary": [
      "вольт",
      "какой переходник",
      "вилка",
      "стандарт розетк",
      "какой адаптер",
      "какой тип"
    ],
    "synonyms": [
      "переходник",
      "розетк",
      "адаптер",
      "в этой стране",
      "220v",
      "тип розетк",
      "110v",
      "напряжение"
    ],
    "exclude": [
      "зарядк",
      "пауэрбанк",
      "кабель",
      "купить"
    ],
    "a": "«Информация о розетках в базе отсутствует. Обычно это легко гуглится по запросу «розетки [страна]», или спроси в отеле/центре моряков.»"
  },
  {
    "q": "Где ближайший обменник валюты?",
    "primary": [
      "обменник",
      "обмен",
      "валют",
      "курс",
      "доллар",
      "евро"
    ],
    "synonyms": [
      "обмен валют",
      "касса",
      "банк",
      "поменять"
    ],
    "exclude": [
      "банкомат",
      "карта",
      "снять",
      "наличные",
      "такси",
      "товар",
      "услуги",
      "cbd"
    ],
    "a": "«В карточке этого порта нет подтверждённого обменника валюты. НЕ меняй деньги с рук — обманут.»"
  },
  {
    "q": "Где ближайший банкомат?",
    "primary": [
      "банкомат",
      "снять"
    ],
    "synonyms": [
      "карт",
      "наличн",
      "atm",
      "денег",
      "получить",
      "выдать"
    ],
    "exclude": [
      "обменник",
      "курс",
      "валюта",
      "доллар",
      "евро"
    ],
    "a": "«В карточке этого порта нет подтверждённого банкомата. Если найдёшь банкомат — снимай деньги в дневное время и в людных местах.»"
  },
  {
    "q": "Можно ли расплатиться картой почти везде?",
    "primary": [
      "карт",
      "безнал",
      "visa",
      "mastercard",
      "оплат"
    ],
    "synonyms": [
      "терминал",
      "расплатитс",
      "банковск"
    ],
    "exclude": [
      "обменник",
      "наличные",
      "банкомат",
      "курс",
      "sim",
      "симка"
    ],
    "a": "«В крупных сетях карты принимают. В небольших магазинах и на рынках лучше иметь наличные.»"
  },
  {
    "q": "Принято ли давать чаевые и сколько?",
    "primary": [
      "чаев",
      "официант",
      "процент",
      "бонус"
    ],
    "synonyms": [
      "tip",
      "оставить",
      "сверх счета",
      "благодар"
    ],
    "exclude": [
      "цена",
      "курс",
      "налог",
      "комиссия",
      "штраф"
    ],
    "a": "«Информация о чаевых для этой страны не загружена. Обычно ориентируйся на 5–10% в кафе, такси — округлить до целого.»"
  },
  
  {
    "id": "taxi_pickup",
    "q": "Где сесть в такси и сколько это будет стоить?",
    "primary": [
      "час пик",
      "yandex",
      "счётчик",
      "стоянка",
      "bolt",
      "цена",
      "такси",
      "uber",
      "стоимость",
      "заказать машину"
    ],
    "synonyms": [
      "поймать",
      "машина",
      "доехать",
      "тариф",
      "фикс",
      "uber",
      "bolt",
      "машин",
      "вызват"
    ],
    "exclude": [
      "автобус",
      "маршрутка",
      "пешком",
      "шаттл",
      "велосипед",
      "без такси"
    ],
    "a": "«Такси берут сразу у ворот. Обязательно договорись о цене ДО посадки. Или попроси охрану вызвать официальное такси. В час пик цена может быть выше на 20–50%.»"
  },
  {
    "id": "public_transport_city",
    "q": "Как доехать до центра на общественном транспорте?",
    "primary": [
      "метро",
      "билет",
      "трамва",
      "автобус",
      "поезд",
      "обществ",
      "остановк",
      "номер",
      "маршрутк",
      "доехать",
      "добратьс",
      "ехать"
    ],
    "synonyms": [
      "общественн",
      "транспорт",
      "до центра",
      "электричк",
      "трамва",
      "метро",
      "поезд"
    ],
    "exclude": [
      "такси",
      "цена",
      "счётчик",
      "водитель",
      "шаттл",
      "последн"
    ],
    "a": "«Общественный транспорт останавливается рядом с воротами порта. Спроси у водителя или местных, какой автобус идёт в центр.»"
  },
  {
    "id": "city_safety",
    "q": "Безопасно ли гулять здесь вечером или ночью?",
    "primary": [
      "безопасн",
      "вечер",
      "ночь",
      "район",
      "гулять",
      "safe zone"
    ],
    "synonyms": [
      "опасно",
      "темно",
      "группа",
      "не ходить"
    ],
    "exclude": [
      "такси",
      "автобус",
      "дорога",
      "карта",
      "в форме",
      "пешей форме",
      "водк",
      "виск",
      "джин",
      "ром",
      "рома",
      "коньяк",
      "алкогол"
    ],
    "a": "«В карточке этого порта нет подтверждённых данных о безопасности. Рекомендую гулять в группах, не носить много наличных и вернуться на судно до наступления темноты.»"
  },
  {
    "id": "medical_emergency",
    "q": "Какой номер экстренных служб?",
    "primary": [
      "экстренн",
      "номер",
      "полици",
      "скорая",
      "скорую",
      "скорой",
      "пожар"
    ],
    "synonyms": [
      "112",
      "911",
      "мчс",
      "спасател",
      "помощь"
    ],
    "exclude": [
      "украли",
      "драка",
      "остановила",
      "такси",
      "цена",
      "задержа",
      "врач",
      "арестова",
      "больница"
    ],
    "a": "«Набери 112 — это международный номер экстренных служб, действует почти везде.»"
  },
  {
    "q": "Какая сегодня погода?",
    "primary": [
      "погод",
      "температу",
      "ветер",
      "дожд",
      "градус"
    ],
    "synonyms": [
      "завтра",
      "прогноз",
      "облачн",
      "солнечн"
    ],
    "exclude": [
      "одежда",
      "жилет",
      "форма",
      "куртка"
    ],
    "a": "«Мы не подгрузили погоду для этого порта. Посмотри в любом погодном приложении по названию города.»"
  },
  {
    "q": "Нужна ли мне тёплая одежда сегодня?",
    "primary": [
      "тепл"
    ],
    "synonyms": [
      "во что одеться",
      "замёрзн",
      "холодн"
    ],
    "exclude": [
      "погода",
      "ветер",
      "купить",
      "дождь",
      "температура",
      "приобрести"
    ],
    "a": "«Ориентируйся по своим ощущениям и проверь прогноз в интернете.»"
  },
  {
    "q": "Есть ли поблизости прачечная?",
    "primary": [
      "гладит",
      "стирк",
      "постират",
      "прачечн",
      "утюг",
      "сушилк",
      "химчистк",
      "глажк"
    ],
    "synonyms": [
      "wash",
      "сушк",
      "гладильн",
      "бель"
    ],
    "exclude": [
      "душ",
      "баня",
      "туалет",
      "вода"
    ],
    "a": "«В карточке этого порта нет подтверждённой прачечной. Можно спросить в центре моряков или у судового агента.»"
  },
  {
    "q": "Где можно принять душ на берегу?",
    "primary": [
      "душ",
      "умытьс",
      "помыт",
      "сануз",
      "кабинк"
    ],
    "synonyms": [
      "ванн",
      "ополоснут",
      "вод",
      "гигиен"
    ],
    "exclude": [
      "прачечна",
      "стирка",
      "порошок"
    ],
    "a": "«Информации о душевых для моряков для этого порта нет. Обычно душ есть в центре моряков.»"
  },
  {
    "q": "Где здесь можно нормально отдохнуть с девушкой? (досуг)",
    "primary": [
      "девушк",
      "девк",
      "отдых",
      "отдохну",
      "познаком",
      "бар",
      "клуб",
      "развлечени",
      "жену на час",
      "провести вечер",
      "доступная женщина",
      "доступную женщину",
      "доступных женщин",
      "доступные женщины",
      "закрутить любовь",
      "мама сан",
      "мама-сан",
      "чики чики",
      "чики-чики",
      "find a girl",
      "find a woman",
      "wife for an hour",
      "available woman",
      "available women",
      "get laid",
      "mama san",
      "mama-san",
      "chiki chiki",
      "chiki-chiki"
    ],
    "synonyms": [
      "провести время",
      "посидеть",
      "свидан",
      "компани",
      "знакомство"
    ],
    "exclude": [
      "массаж",
      "интим",
      "секс",
      "проститутк",
      "цена",
      "платн",
      "саун",
      "ночь",
      "wellness",
      "premium",
      "восстанов"
    ],
    "a": "«Если ты про обычный вечерний отдых — бары и клубы обычно отмечены в разделе «Развлечения», если подтверждены для этого порта. Если вопрос касается более личных или деликатных услуг, я не буду ничего рекомендовать или оценивать. В разделе Wellness можно связаться с Wellness Host — консультантом программы Wellness. Это живой человек, он сможет спокойно объяснить такие вопросы точнее меня. Доступ к разделу Wellness предусмотрен для участников профсоюзной программы.»"
  },
  {
    "q": "Есть ли здесь проститутки и где их искать?",
    "primary": [
      "проститутк",
      "интим",
      "секс",
      "платн",
      "ночь"
    ],
    "synonyms": [
      "девочки",
      "путан",
      "вызвать",
      "шлюх",
      "интим-услуг"
    ],
    "exclude": [
      "бар",
      "клуб",
      "отдых",
      "свидан",
      "девушк",
      "массаж"
    ],
    "a": "«Мы не даём контактов и адресов — это вне нашей роли. Такие вопросы лучше уточнить у Wellness Host — консультанта программы Wellness в приложении (раздел Wellness, нужна карта профсоюза). Это живой человек, он объяснит такие вопросы точнее меня.»"
  },
  {
    "q": "Где можно купить презервативы?",
    "primary": [
      "презерватив",
      "кондом",
      "резинк",
      "защит",
      "секс-шоп"
    ],
    "synonyms": [
      "гандон",
      "барьер",
      "контрацептив"
    ],
    "exclude": [
      "сигарет",
      "алкоголь",
      "еда",
      "аптек",
      "гасим"
    ],
    "a": "«Презервативы продаются в любой аптеке, супермаркете и даже на заправках. Спроси у фармацевта — они не задают лишних вопросов.»"
  },
  {
    "q": "Есть ли здесь массажный салон «со счастливым концом»?",
    "primary": [
      "салон",
      "счастлив",
      "конц",
      "интим"
    ],
    "compoundAnchors": [
      [
        "массаж"
      ],
      [
        "счастлив",
        "эротич",
        "интим",
        "со спец"
      ]
    ],
    "synonyms": [
      "эротич",
      "расслабляющ",
      "со спец",
      "услуга"
    ],
    "exclude": [
      "обычн",
      "спортив",
      "медицин",
      "спина",
      "шея"
    ],
    "a": "«Мы не отслеживаем и не рекомендуем подобные заведения. Обычный массаж для восстановления — это Wellness Zone в приложении. По остальным вопросам такого рода лучше обратиться к Wellness Host (раздел Wellness, нужна карта профсоюза).»"
  },
  {
    "q": "Сколько в среднем стоят интимные услуги в этом городе?",
    "primary": [
      "интим",
      "услуг",
      "цена",
      "стоимость",
      "ночь"
    ],
    "synonyms": [
      "скольк",
      "расценк",
      "платн",
      "час"
    ],
    "exclude": [
      "такси",
      "таксист",
      "обменник",
      "курс",
      "доллар",
      "еда"
    ],
    "a": "«Мы не отслеживаем цены на такие услуги. Такой вопрос лучше уточнить у Wellness Host — консультанта программы Wellness в приложении (раздел Wellness, нужна карта профсоюза).»"
  },
  {
    "q": "Есть ли здесь девушки, которые говорят по-английски (или по-русски)?",
    "primary": [],
    "compoundAnchors": [
      ["девушк"],
      ["говор", "английск", "русск", "язык"]
    ],
    "synonyms": [
      "иностранк",
      "общени",
      "понять"
    ],
    "exclude": [
      "проститутк",
      "интим",
      "секс",
      "платн",
      "цена"
    ],
    "a": "«В карточке этого порта нет подтверждённых данных об этом. Если нужно пообщаться на английском — можно попробовать сотрудников центра моряков или отеля.»"
  },
  {
    "q": "Легальна ли проституция в этой стране?",
    "primary": [
      "проституц",
      "легальн",
      "закон",
      "разрешен",
      "страна"
    ],
    "synonyms": [
      "запрещен",
      "наказани",
      "правил"
    ],
    "exclude": [
      "сигареты",
      "алкоголь",
      "наркотики",
      "cbd"
    ],
    "a": "«Точных данных о законодательстве этой страны у нас нет. В серой зоне рисковать не стоит: на практике наказание чаще применяется именно к иностранцам, чем к местным. Более предметные вопросы лучше уточнить у Wellness Host в приложении.»"
  },
  {
    "q": "Где здесь бани или сауны с девушками?",
    "primary": [
      "бан",
      "саун",
      "пар",
      "хамам"
    ],
    "synonyms": [
      "эротич",
      "расслаб",
      "с парилк",
      "девушк"
    ],
    "exclude": [
      "обычн",
      "спорт",
      "фитнес",
      "бассейн",
      "мальчики"
    ],
    "a": "«Мы не отслеживаем такие заведения. Если в карточке этого порта есть обычная сауна для отдыха, я покажу её название и адрес. По остальным вопросам такого рода лучше обратиться к Wellness Host в приложении (раздел Wellness, нужна карта профсоюза).»"
  },
  {
    "q": "Где здесь самый дешёвый алкоголь?",
    "protected": true,
    "primary": [],
    "compoundAnchors": [
      ["алкогол"],
      ["дешёв", "супермаркет", "цена"]
    ],
    "synonyms": [
      "выпивк",
      "спиртн",
      "коньяк",
      "пиво",
      "виск",
      "бутылк"
    ],
    "exclude": [
      "еда",
      "поесть",
      "обед",
      "закуск",
      "сигарет",
      "кальян",
      "cbd"
    ],
    "a": "«В карточке этого порта нет подтверждённого магазина с недорогим алкоголем. Не покупай с рук у ворот — могут подсунуть палёное или разбавленное.»"
  },
  {
    "q": "Есть ли здесь круглосуточный бар?",
    "primary": [
      "бар",
      "круглосуточ",
      "пить",
      "напитк",
      "ночн"
    ],
    "synonyms": [
      "паб",
      "пивнушк",
      "открыт",
      "ночью"
    ],
    "exclude": [
      "такси",
      "аптека",
      "банкомат",
      "супермаркет"
    ],
    "a": "«В карточке этого порта нет подтверждённого круглосуточного бара. Можно спросить у охраны порта или таксистов.»"
  },
  {
    "q": "Можно ли здесь купить марихуану или лёгкие наркотики?",
    "protected": true,
    "primary": [
      "марихуан",
      "трав",
      "наркотик",
      "шишк",
      "кося",
      "гашиш",
      "дунуть",
      "weed",
      "cannabis",
      "marijuana",
      "hash",
      "joint"
    ],
    "synonyms": [
      "анаша",
      "план",
      "thc",
      "гандж",
      "покурить",
      "курить"
    ],
    "exclude": [
      "cbd",
      "сигарет",
      "табак",
      "вейп",
      "кальян",
      "травма",
      "лёгкого поведения"
    ],
    "a": "«Официально мы НЕ рекомендуем и НЕ даём адреса. Покупка веществ у ворот порта в большинстве случаев приводит к аресту или шантажу; наказание за хранение даже малых доз в разных странах разное — от штрафа до тюрьмы и депортации. Судовладелец может снять тебя с рейса. Не рискуй.»"
  },
  {
    "q": "Где можно покурить кальян?",
    "primary": [
      "кальян",
      "покурить",
      "трубк",
      "уголь",
      "табак"
    ],
    "synonyms": [
      "шиша",
      "дым",
      "восточн",
      "лунг"
    ],
    "exclude": [
      "сигарет",
      "вейп",
      "эльфбар",
      "марихуан",
      "трава",
      "наркотик"
    ],
    "a": "«Кальянные есть в восточных ресторанах и барах. Спроси у местных.»"
  },
  {
    "q": "Где нормальный стриптиз-клуб где не кинут на деньги?",
    "primary": [
      "стриптиз",
      "клуб",
      "шест",
      "танц"
    ],
    "synonyms": [
      "стрип",
      "стриптизер",
      "шоу",
      "обнаженн"
    ],
    "exclude": [
      "бар",
      "паб",
      "отдых",
      "девушки",
      "массаж"
    ],
    "a": "«Такие вопросы лучше уточнить у Wellness Host в приложении (раздел Wellness, нужна карта профсоюза). Если решишь пойти сам — никогда не оставляй напиток без присмотра и уточняй цены в меню до заказа.»"
  },
  {
    "q": "Где выпить крепкого алкоголя рядом с портом?",
    "protected": true,
    "primary": [
      "алкогол",
      "крепк",
      "бар",
      "водк",
      "виск",
      "джин",
      "ром",
      "рома",
      "рому",
      "ромом",
      "коньяк",
      "текил",
      "бренди",
      "vodka",
      "whisky",
      "whiskey",
      "gin",
      "rum",
      "бухнуть",
      "рюмк",
      "рюмок",
      "стопк",
      "шот"
    ],
    "synonyms": [
      "выпивк",
      "спиртн"
    ],
    "exclude": [
      "еда",
      "поесть",
      "кофе",
      "сок",
      "пиво"
    ],
    "a": "«В карточке этого порта нет подтверждённого бара или магазина с алкоголем. Помни, что возвращение на судно в состоянии сильного опьянения может привести к списанию с судна за твой счёт. Правила проноса алкоголя на территорию порта отличаются от порта к порту — уточни у охраны на входе.»"
  },
  {
    "q": "Можно ли купить CBD в этом порту/стране?",
    "protected": true,
    "primary": [
      "cbd",
      "купить cbd",
      "каннабиноид",
      "каннабидиол",
      "масл",
      "капли",
      "разрешен",
      "легальн",
      "конфет"
    ],
    "synonyms": [
      "купить",
      "магазин",
      "ганж",
      "но без thc",
      "использов"
    ],
    "exclude": [
      "марихуан",
      "трава",
      "план",
      "шишк",
      "закладк"
    ],
    "a": "«В офлайн-режиме я не могу дать точный и актуальный ответ по этой стране — законы меняются, а ошибка здесь может дорого стоить. При подключении к интернету отвечу подробнее. А пока рекомендую воздержаться от покупки: не рискуй с CBD в порту.»"
  },
  {
    "q": "Можно ли провезти CBD через границу или на судно?",
    "protected": true,
    "primary": [],
    "compoundAnchors": [
      ["cbd"],
      ["провезти", "границ", "ввоз", "запрет", "таможн", "взять на судно", "пронести через порт", "пройти в порт", "пройти через порт", "через порт"]
    ],
    "synonyms": [
      "через границ",
      "на судн",
      "судно",
      "борт",
      "таможн",
      "штраф",
      "тюрьм"
    ],
    "exclude": [
      "легальн",
      "купить",
      "страна",
      "разреш",
      "цена"
    ],
    "a": "«Даже если CBD легален в стране, где ты сейчас находишься, правила провоза через границу и на борт судна могут быть строже и зависят от конкретной страны, судовладельца и судовой политики. Я не могу гарантировать, что провоз законен. На твоём месте я бы воздержался и уточнил официальные правила — при подключении к интернету или у судового агента.»"
  },

  {
    "id": "spiritual_prayer",
    "q": "Есть ли поблизости церковь, мечеть или храм?",
    "primary": [
      "церковь",
      "мечеть",
      "храм",
      "молитв",
      "молитьс",
      "религ"
    ],
    "synonyms": [
      "собор",
      "костел",
      "капелл",
      "синагог",
      "пагод"
    ],
    "exclude": [
      "бар",
      "клуб",
      "отдых",
      "еда",
      "туалет"
    ],
    "a": "«В карточке этого порта нет подтверждённых данных о религиозных объектах.»"
  },
  {
    "id": "seafarers_centre_location",
    "q": "Где ближайший центр моряков?",
    "primary": [
      "центр моряков",
      "seamen",
      "mission",
      "seafarer"
    ],
    "synonyms": [
      "звонить",
      "берут",
      "помощь",
      "позвонить",
      "seafarers centre",
      "номер телефона",
      "клуб моряк",
      "интернет",
      "чай",
      "seamen's club",
      "seafarers center",
      "морской клуб",
      "mission to seafarers"
    ],
    "exclude": [
      "порт",
      "таможня",
      "админ",
      "консул",
      "шаттл",
      "трансфер",
      "пешком",
      "добратьс",
      "как проехать",
      "далеко ли"
    ],
    "a": "«В карточке этого порта нет подтверждённого центра моряков. Проверь «Seamen's Mission» или «Seafarer's Centre» + город.»"
  },
  {
    "id": "seafarers_centre_distance",
    "q": "Как добраться до центра моряков и сколько это займёт?",
    "primary": [],
    "compoundAnchors": [
      ["центр моряков", "центра моряков"],
      ["пешком", "дорог", "добратьс", "как проехать", "далеко ли"]
    ],
    "synonyms": [
      "добратьс",
      "далеко ли",
      "как проехать"
    ],
    "exclude": [
      "такси",
      "автобус",
      "цена",
      "билет",
      "шаттл"
    ],
    "a": "«В карточке этого порта нет подтверждённых данных о расстоянии до центра моряков.»"
  },
  {
    "id": "seafarers_centre_shuttle",
    "q": "Есть ли бесплатный шаттл до центра моряков?",
    "primary": [],
    "compoundAnchors": [
      ["центр моряков", "центра моряков"],
      ["шаттл", "трансфер"]
    ],
    "synonyms": [
      "бесплатн",
      "автобус",
      "подвозк",
      "довезти",
      "маршрутк"
    ],
    "exclude": [
      "такси",
      "платн",
      "цена",
      "билет"
    ],
    "a": "«В карточке порта нет подтверждённых данных о бесплатном шаттле.»"
  },
  {
    "q": "Где можно спокойно посидеть и позвонить домой?",
    "primary": [
      "посидеть",
      "позвонить",
      "тих",
      "спокойн"
    ],
    "synonyms": [
      "комната отдыха",
      "зал",
      "уединен",
      "созвонитьс"
    ],
    "exclude": [
      "бар",
      "клуб",
      "кафе",
      "шумн",
      "тусовк"
    ],
    "a": "«В центре моряков всегда есть комната отдыха с розетками.»"
  },
  {
    "q": "Работает ли в порту капеллан?",
    "primary": [
      "капеллан",
      "священник",
      "часы"
    ],
    "synonyms": [
      "приём",
      "пастор",
      "отец",
      "духовн",
      "работает"
    ],
    "exclude": [
      "центр моряков",
      "клуб",
      "волонтер"
    ],
    "a": "«Информации о капеллане для этого порта нет. Спроси в центре моряков или у судового агента.»"
  },
  {
    "q": "Мне плохо, что делать?",
    "primary": [
      "плохо",
      "помощь",
      "срочн",
      "экстренн",
      "спасит"
    ],
    "synonyms": [
      "тяж",
      "умир",
      "скора",
      "больн",
      "тяжел"
    ],
    "exclude": [
      "голод",
      "устал",
      "сон",
      "хочу есть",
      "зубн",
      "стоматолог",
      "скорая",
      "скорую"
    ],
    "a": "«Это серьёзно — здесь нужна помощь человека, а не текстовый ответ. Если это неотложное состояние — звони 112. Также свяжись с Дежурным офисом IMWIRSA напрямую.»"
  },
  {
    "id": "chest_pain_emergency",
    "q": "У меня боль в груди",
    "primary": [
      "грудь",
      "груди",
      "сердц",
      "давлен",
      "инфаркт"
    ],
    "synonyms": [
      "боль",
      "колит",
      "жжёт",
      "сердечн",
      "грудн"
    ],
    "exclude": [
      "голов",
      "зуб",
      "живот",
      "ног",
      "спин"
    ],
    "a": "«Звони 112 прямо сейчас — это может быть сердечный приступ. Ничего не предпринимай самостоятельно, кроме звонка.»"
  },
  {
    "q": "Я потерял паспорт или seaman's book",
    "primary": [
      "документ",
      "потерял",
      "паспорт украли",
      "seaman's book",
      "украли паспорт",
      "паспорт"
    ],
    "synonyms": [
      "удостовер",
      "загран",
      "морск",
      "паспортин"
    ],
    "exclude": [
      "деньги",
      "карта",
      "телефон",
      "вещь"
    ],
    "a": "«Это серьёзная ситуация — здесь нужна помощь человека, а не текстовый ответ. Свяжитесь с Дежурным офисом IMWIRSA напрямую.»"
  },
  {
    "q": "Меня ограбили",
    "primary": [
      "ограбил",
      "напал"
    ],
    "synonyms": [
      "ограблен",
      "вор",
      "грабитель",
      "снял",
      "деньги"
    ],
    "exclude": [
      "потерял",
      "паспорт",
      "документ"
    ],
    "a": "«Это серьёзная ситуация — здесь нужна помощь человека, а не текстовый ответ. Свяжитесь с Дежурным офисом IMWIRSA напрямую. Пока — не трогайте ничего вокруг себя.»"
  },
  {
    "q": "У меня совсем нет денег",
    "primary": [
      "денег",
      "пусто"
    ],
    "synonyms": [
      "нет",
      "наличн",
      "карт",
      "без денег",
      "ни копейк",
      "нечем платить"
    ],
    "exclude": [
      "потерял",
      "ограбили",
      "документ"
    ],
    "a": "«Это серьёзная ситуация — здесь нужна помощь человека, а не текстовый ответ. Свяжитесь с Дежурным офисом IMWIRSA напрямую.»"
  },
  {
    "q": "Капитан плохо со мной обращается",
    "primary": [
      "капитан",
      "обращаетс",
      "хам",
      "унижа",
      "оскорб"
    ],
    "synonyms": [
      "плох отнош",
      "кричит",
      "бьёт",
      "давле"
    ],
    "exclude": [
      "условия труда",
      "работа",
      "график",
      "вахт"
    ],
    "a": "«Это серьёзная ситуация — здесь нужна помощь человека, а не текстовый ответ. Свяжитесь с Дежурным офисом IMWIRSA напрямую, это конфиденциально.»"
  },
  {
    "q": "Я хочу пожаловаться на условия труда на судне",
    "primary": [
      "услови",
      "жал",
      "тяжел"
    ],
    "synonyms": [
      "график",
      "нагрузк",
      "отдых",
      "питани",
      "смена",
      "работа",
      "судно"
    ],
    "exclude": [
      "капитан",
      "обращение",
      "лично",
      "оскорб"
    ],
    "a": "«Это серьёзная ситуация — здесь нужна помощь человека, а не текстовый ответ. Свяжитесь с Дежурным офисом IMWIRSA напрямую, это конфиденциально.»"
  },
  {
    "q": "Меня преследуют или домогаются на борту",
    "primary": [
      "преследу",
      "домогают",
      "борту",
      "насил",
      "страх"
    ],
    "synonyms": [
      "пристава",
      "унижа",
      "трога",
      "пуга"
    ],
    "exclude": [
      "капитан",
      "условия труда",
      "работа"
    ],
    "a": "«Это серьёзная ситуация — здесь нужна помощь человека, а не текстовый ответ. Свяжитесь с Дежурным офисом IMWIRSA напрямую.»"
  },
  {
    "q": "Мне очень тяжело морально, я не справляюсь",
    "primary": [
      "тяжел",
      "мораль",
      "психолог",
      "не справляюс",
      "депресси"
    ],
    "synonyms": [
      "плох настро",
      "плач",
      "тревож",
      "стресс"
    ],
    "exclude": [
      "боль",
      "грудь",
      "паспорт",
      "деньги"
    ],
    "a": "«Понимаю, это тяжело. Можно просто поговорить здесь, а если нужна помощь человека — свяжитесь с Дежурным офисом IMWIRSA напрямую.»"
  },
  {
    "q": "Я не хочу возвращаться на судно",
    "primary": [
      "возвращатьс",
      "судно",
      "берег",
      "отказ"
    ],
    "synonyms": [
      "не хочу",
      "остатьс",
      "не пойду",
      "уйти",
      "не верну"
    ],
    "exclude": [
      "капитан",
      "условия",
      "работа",
      "деньги",
      "водк",
      "виск",
      "джин",
      "ром",
      "рома",
      "коньяк",
      "рюмк",
      "рюмок",
      "стопк",
      "шот",
      "бухнуть",
      "алкогол",
      "марихуан",
      "cannabis",
      "weed",
      "cbd",
      "наркотик"
    ],
    "a": "«Это серьёзная ситуация — здесь нужна помощь человека, а не текстовый ответ. Свяжитесь с Дежурным офисом IMWIRSA напрямую, вам помогут разобраться с документами и правовыми последствиями.»"
  },
  {
    "q": "У меня проблема с визой или иммиграцией",
    "primary": [
      "виз",
      "иммиграци",
      "документ",
      "пограничн",
      "закон"
    ],
    "synonyms": [
      "просроч",
      "штамп",
      "разрешени",
      "въезд",
      "выезд"
    ],
    "exclude": [
      "паспорт",
      "seaman's book",
      "потерял"
    ],
    "a": "«Это серьёзная ситуация — здесь нужна помощь человека, а не текстовый ответ. Свяжитесь с Дежурным офисом IMWIRSA напрямую.»"
  },
  {
    "q": "Где здесь ближайший бесплатный Wi-Fi, чтобы позвонить жене по видео?",
    "primary": [
      "видео",
      "звонок",
      "жена"
    ],
    "synonyms": [
      "wi-fi",
      "ватсап",
      "скайп",
      "созвонитьс",
      "бесплатн",
      "вайфай"
    ],
    "exclude": [
      "sim",
      "симка",
      "телефон",
      "минуты"
    ],
    "a": "«В карточке этого порта нет подтверждённых данных о бесплатном Wi-Fi для видеозвонков. Можно уточнить на ресепшн терминала или в центре моряков.»"
  },
  {
    "q": "Где тут розетка, чтобы зарядить телефон, пока я пью пиво?",
    "primary": [
      "розетк",
      "зарядить",
      "бар"
    ],
    "synonyms": [
      "подключить",
      "разрядил",
      "сел",
      "usb"
    ],
    "exclude": [
      "wi-fi",
      "интернет",
      "звонок"
    ],
    "a": "«В карточке этого порта нет подтверждённых данных о розетках в кафе или баре. Можно попросить официанта — во многих заведениях есть розетки для клиентов.»"
  },
  {
    "q": "Есть ли магазин с нормальным (не туристическим) алкоголем и закуской?",
    "protected": true,
    "primary": [],
    "compoundAnchors": [
      ["алкогол"],
      ["закуск", "не турист", "дешёв", "местн", "спальн"]
    ],
    "synonyms": [
      "нормальн",
      "местн",
      "сетевой",
      "спальн",
      "район",
      "цены"
    ],
    "exclude": [
      "бар",
      "пиво",
      "сигареты",
      "еда"
    ],
    "a": "«В карточке этого порта нет подтверждённого магазина с недорогим алкоголем для местных цен.»"
  },
  {
    "q": "Это район вообще безопасный для пешей прогулки в форме?",
    "primary": [
      "форм",
      "пешком"
    ],
    "synonyms": [
      "гулять",
      "темно",
      "групп",
      "днём",
      "район",
      "безопасн",
      "прогулк"
    ],
    "exclude": [
      "вечер",
      "ночь",
      "такси",
      "автобус"
    ],
    "a": "«В форме лучше гулять группами и днём. Если сомневаешься — сними куртку поверх формы или надень штатское.»"
  },
  {
    "q": "Где находится вход на территорию порта для членов экипажа?",
    "primary": [
      "вход",
      "порт",
      "территория"
    ],
    "compoundAnchors": [
      [
        "экипаж",
        "член экипаж"
      ],
      [
        "вход",
        "ворота",
        "кпп",
        "проходн",
        "пропуск"
      ]
    ],
    "synonyms": [
      "ворота",
      "кпп",
      "проходн",
      "член экипаж",
      "пропуск"
    ],
    "exclude": [
      "такси",
      "автобус",
      "дорога",
      "центр",
      "водк",
      "виск",
      "джин",
      "ром",
      "алкогол"
    ],
    "a": "«Обычно для экипажа отдельный вход сбоку от главных ворот. Спроси у вахтенного у трапа.»"
  },
  {
    "q": "Где здесь самый дешёвый обменник, а не грабительский?",
    "primary": [
      "обменник",
      "дешёв",
      "курс",
      "банк"
    ],
    "synonyms": [
      "грабительск",
      "не обманут",
      "выгодн",
      "лучший"
    ],
    "exclude": [
      "банкомат",
      "карта",
      "снять",
      "наличные"
    ],
    "a": "«В порту курс всегда занижен. Иди в банк в центре города. Никогда не меняй на улице с рук — это почти всегда обман.»"
  },
  {
    "q": "Здесь можно торговаться в магазинах и на рынках?",
    "primary": [
      "торг",
      "рынок",
      "уместн",
      "торговаться"
    ],
    "synonyms": [
      "цен",
      "магазин",
      "скидк",
      "дешевл",
      "базар"
    ],
    "exclude": [
      "обменник",
      "курс",
      "доллар",
      "евро"
    ],
    "a": "«В большинстве портовых городов торг уместен на рынках и у частников. В супермаркетах и сетевых магазинах — нет.»"
  },
  {
    "q": "Можно ли расплатиться долларами прямо в магазине?",
    "primary": [
      "доллар",
      "расплатитс",
      "валюта"
    ],
    "synonyms": [
      "usd",
      "приним",
      "оплат",
      "магазин",
      "наличн"
    ],
    "exclude": [
      "евро",
      "рубль",
      "карта",
      "обменник"
    ],
    "a": "«Доллары принимают в туристических местах, но курс будет плохой. Лучше меняй на местную валюту.»"
  },
  {
    "q": "Где здесь самый дешёвый супермаркет, а не для туристов?",
    "primary": [
      "супермаркет",
      "дешёв",
      "не турист",
      "спальн"
    ],
    "synonyms": [
      "сетевой",
      "гипер",
      "рынок",
      "низк цен",
      "местн"
    ],
    "exclude": [
      "обменник",
      "аптека",
      "бар",
      "алкоголь"
    ],
    "a": "«Ищи супермаркеты в спальных районах, а не у порта. Спроси у местных.»"
  },
  {
    "q": "Меня хочет обсчитать или кинуть местный таксист, что делать?",
    "primary": [
      "таксист",
      "обсчита",
      "обманут",
      "кинуть",
      "цена"
    ],
    "synonyms": [
      "развод",
      "счётчик",
      "договоритьс",
      "охрана"
    ],
    "exclude": [
      "магазин",
      "рынок",
      "обменник",
      "продавец"
    ],
    "a": "«Не вступай в конфликт. Потребуй включить счётчик или показать цену в приложении. Обязательно договорись о цене ДО посадки. Если водитель вымогает деньги у КПП — спокойно иди к охране порта или звони в экстренную службу этого порта (обычно 112 или местный аналог). Водители обычно сразу уезжают при виде охраны.»"
  },
  {
    "q": "Где купить б/у телефон, если мой упал за борт или разбился?",
    "primary": [
      "б/у",
      "разбил",
      "упал",
      "борт",
      "ремонт"
    ],
    "synonyms": [
      "подержанн",
      "срочн",
      "купить",
      "сломал"
    ],
    "exclude": [
      "зарядк",
      "пауэрбанк",
      "наушник",
      "переходник"
    ],
    "a": "«Специализированных точек в базе нет — доезжай до ближайшего крупного ТЦ, там почти всегда есть островки с б/у техникой и сервисы ремонта.»"
  },
  
  {
    "q": "Есть ли интернет-кафе с быстрым компьютером?",
    "primary": [
      "интернет-кафе",
      "компьютер",
      "печат",
      "принтер",
      "отчёты"
    ],
    "synonyms": [],
    "exclude": [
      "wi-fi",
      "sim",
      "звонок"
    ],
    "a": "«Интернет-кафе почти исчезли, но в центре моряков всегда есть рабочее место. Или попроси у агента.»"
  },
  {
    "q": "Где отправить факс или распечатать документы?",
    "primary": [
      "pdf",
      "сканир",
      "напечат",
      "скан",
      "фото на документ",
      "печат",
      "ламинац",
      "распечат",
      "факс",
      "принтер",
      "копир",
      "ксерокс"
    ],
    "synonyms": [
      "документ"
    ],
    "exclude": [
      "интернет",
      "почта",
      "qr",
      "штрихкод",
      "скидочн",
      "посылка"
    ],
    "a": "«Печать и сканирование есть в копировальных центрах в городе. Спроси у местных.»"
  },

  {
    "q": "Сколько добираться от порта до центра?",
    "primary": [
      "время",
      "минут",
      "добиратьс",
      "центр",
      "порт"
    ],
    "synonyms": [],
    "exclude": [
      "такси",
      "метро",
      "поезд",
      "автобус",
      "uber",
      "bolt",
      "цена",
      "трамвай"
    ],
    "a": "«В карточке этого порта нет подтверждённого времени в пути до центра — оно сильно зависит от конкретного порта. Можно спросить у охраны порта или судового агента.»"
  },
  {
    "q": "Если опоздаю на судно, сколько будут ждать?",
    "primary": [
      "опоздал",
      "судно",
      "ждать",
      "время",
      "отход"
    ],
    "synonyms": [],
    "exclude": [
      "такси",
      "шаттл",
      "агент",
      "алкогол",
      "водк",
      "виск",
      "джин",
      "ром",
      "рома",
      "коньяк",
      "рюмк",
      "рюмок",
      "стопк",
      "шот",
      "бухнуть",
      "марихуан",
      "cannabis",
      "weed",
      "cbd",
      "наркотик"
    ],
    "a": "«Это решает капитан. Обычно моряков ждут, но если ты не выходишь на связь — могут оставить. Будь на причале за час до отхода.»"
  },
  {
    "q": "Что делать, если не успеваю на шаттл?",
    "primary": [
      "шаттл",
      "не успева",
      "срочн",
      "звонок"
    ],
    "synonyms": [],
    "exclude": [
      "такси",
      "пешком",
      "зубн",
      "стоматолог"
    ],
    "a": "«Срочно звони на судно (вахтенному) или агенту. Скажи, где ты.»"
  },
  {
    "q": "Как найти судового агента у ворот?",
    "primary": [
      "агент",
      "контакт",
      "диспетчер"
    ],
    "synonyms": [
      "ворота"
    ],
    "exclude": [
      "такси",
      "карта"
    ],
    "a": "«В каждом порту есть диспетчерская — иди туда, скажи название судна, они вызовут агента. Или позвони старпому.»"
  },
  {
    "q": "Заберут ли пропуск или паспорт на КПП?",
    "primary": [
      "паспорт",
      "кпп",
      "заберут",
      "охрана"
    ],
    "synonyms": [
      "пропуск"
    ],
    "exclude": [
      "такси",
      "бар",
      "магазин"
    ],
    "a": "«Никогда не оставляй в залог оригинальный паспорт или seaman's book частным лицам (таксистам, барам). Оригиналы документов может проверять только пограничная служба или полиция.»"
  },
  {
    "q": "Где сдать анализы на венерические заболевания?",
    "primary": [
      "анализы",
      "венерич",
      "заболеван",
      "проверить",
      "кожно"
    ],
    "synonyms": [],
    "exclude": [
      "аптека",
      "лекарства",
      "таблетки"
    ],
    "a": "«Венерические заболевания проверяют в городских кожно-венерологических диспансерах. В центре моряков могут подсказать анонимный кабинет.»"
  },
  {
    "q": "Есть ли аптека с антибиотиками без рецепта?",
    "primary": [
      "антибиотик",
      "рецепт"
    ],
    "synonyms": [
      "аптека"
    ],
    "exclude": [
      "обезболивающ",
      "таблетки от головы"
    ],
    "a": "«В большинстве стран антибиотики теперь только по рецепту. Спроси у фармацевта напрямую — мы не рекомендуем заниматься самолечением.»"
  },

  {
    "q": "Меня остановила полиция, что говорить?",
    "primary": [
      "документ",
      "говорить",
      "остановила",
      "задержа",
      "арестова",
      "полиция"
    ],
    "synonyms": [],
    "exclude": [
      "такси",
      "бар",
      "драка",
      "premium",
      "ai"
    ],
    "a": "«Не паникуй и не груби. Покажи документы. Если требуют деньги «на месте» — скажи, что вызовешь консула. После инцидента сразу звони в Центральный офис IMWIRSA.»"
  },
  {
    "q": "Меня хотят забрать в полицию из-за драки — что делать?",
    "primary": [
      "полиция",
      "забрать",
      "драка",
      "бар",
      "адвокат"
    ],
    "synonyms": [],
    "exclude": [
      "остановила",
      "документы",
      "паспорт"
    ],
    "a": "«Это серьёзная ситуация — здесь нужна помощь человека, а не текстовый ответ. Свяжитесь с Дежурным офисом IMWIRSA напрямую. Ничего не подписывай до разговора с ними.»"
  },
  {
    "q": "У меня украли телефон — куда идти?",
    "primary": [
      "украли телефон",
      "телефон украли",
      "полиция",
      "заявление",
      "страховк"
    ],
    "synonyms": [],
    "exclude": [
      "паспорт",
      "деньги",
      "seaman's book"
    ],
    "a": "«Иди в любое отделение полиции и пиши заявление. Без заявления страховка не выплатит. Или позвони в Центральный офис IMWIRSA.»"
  },
  {
    "q": "Может ли меня депортировать за нарушение?",
    "primary": [
      "депортаци",
      "нарушени",
      "закон",
      "штраф",
      "тюрьм"
    ],
    "synonyms": [],
    "exclude": [
      "виза",
      "паспорт",
      "документ"
    ],
    "a": "«За серьёзные нарушения — могут депортировать и запретить въезд. За мелкие — штраф. Будь особенно осторожен с наркотиками и драками.»"
  },
  {
    "q": "Где найти русскоговорящего?",
    "primary": [
      "русскоговор",
      "русский",
      "перевод",
      "помочь",
      "понять"
    ],
    "synonyms": [],
    "exclude": [
      "девушки",
      "общение",
      "отдых"
    ],
    "a": "«В карточке этого порта нет подтверждённых данных о русскоговорящих контактах. Можно спросить в центре моряков, у судового агента или на судне.»"
  },

  {
    "q": "Где купить местную SIM с дешёвым интернетом?",
    "primary": [],
    "compoundAnchors": [
      ["sim", "симка", "сим-карт"],
      ["дешёв", "тариф"]
    ],
    "synonyms": [
      "интернет"
    ],
    "exclude": [
      "туристич",
      "роуминг",
      "wi-fi"
    ],
    "a": "«В карточке этого порта нет подтверждённого места продажи SIM-карт.»"
  },
  {
    "q": "Где сходить в туалет у ворот?",
    "primary": [
      "туалет",
      "бесплатн",
      "азс"
    ],
    "synonyms": [
      "ворота"
    ],
    "exclude": [
      "еда",
      "кафе",
      "бар"
    ],
    "a": "«В карточке этого порта нет подтверждённого туалета у ворот. Можно уточнить в центре моряков или у охраны порта.»"
  },

  {
    "q": "Что нельзя делать, чтобы не вляпаться?",
    "primary": [
      "нельзя",
      "делать",
      "табу",
      "культур",
      "оскорблен"
    ],
    "synonyms": [],
    "exclude": [
      "закон",
      "штраф",
      "полиция"
    ],
    "a": "«В каждой стране свои табу. В мусульманских — не пей на улице и не трогай женщин. В Азии — не трогай голову. Спроси у местных.»"
  },
  {
    "q": "Принято целоваться или здороваться за руку?",
    "primary": [
      "целовать",
      "здороваться",
      "рука",
      "щека",
      "приветстви"
    ],
    "synonyms": [],
    "exclude": [
      "еда",
      "одежда",
      "погода"
    ],
    "a": "«В Европе и Америке — рукопожатие. В Азии — поклон или лёгкий кивок. Не лезь с объятиями первым — смотри, как делают местные.»"
  },
  {
    "q": "Что считается оскорблением?",
    "primary": [
      "оскорблен",
      "нога",
      "палец",
      "политик",
      "религ"
    ],
    "synonyms": [],
    "exclude": [
      "полиция",
      "штраф",
      "закон"
    ],
    "a": "«В мусульманских странах — не показывай подошву ног, не указывай пальцем, не пей на людях. Будь внимателен.»"
  },
  
  {
    "q": "Можно ли носить открытый крест?",
    "primary": [
      "крест",
      "носить",
      "открыт",
      "религи",
      "страна"
    ],
    "synonyms": [],
    "exclude": [
      "купить",
      "цена",
      "магазин"
    ],
    "a": "«В большинстве стран — можно. В мусульманских — лучше не выставлять напоказ, чтобы не провоцировать. Носи под одеждой.»"
  },
  {
    "id": "wifi_cafe",
    "q": "Кафе с Wi-Fi",
    "primary": [],
    "compoundAnchors": [
      ["кафе"],
      ["интернет", "вайфай", "wi-fi"]
    ],
    "synonyms": [
      "бесплатн",
      "подключиться",
      "посидеть с ноутбуком",
      "пароль"
    ],
    "exclude": [
      "еда",
      "поесть",
      "обед",
      "кофе",
      "супермаркет"
    ],
    "a": "«В карточке этого порта нет подтверждённого кафе с Wi-Fi. Можно уточнить на ресепшн порта/терминала — иногда там есть Wi-Fi для гостей.»"
  },
  {
    "q": "Лёгкая травма (куда обратиться)",
    "primary": [
      "травм",
      "ушиб",
      "порез",
      "медпункт",
      "порт",
      "помощь"
    ],
    "synonyms": [
      "легк",
      "царапин",
      "растяжени",
      "перевязк",
      "пластыр"
    ],
    "exclude": [
      "больница",
      "скорая",
      "тяжел",
      "сердц",
      "грудь",
      "голова"
    ],
    "a": "«В карточке этого порта нет подтверждённого медпункта. При лёгкой травме можно обратиться в ближайшую аптеку — там подскажут, где примут без записи.»"
  },
  {
    "q": "Последний автобус / поезд (когда ходит)",
    "primary": [
      "последн",
      "расписани"
    ],
    "compoundAnchors": [
      [
        "рейс"
      ],
      [
        "автобус",
        "поезд",
        "останов",
        "маршрут",
        "ходит",
        "отправляетс"
      ]
    ],
    "synonyms": [
      "автобус",
      "поезд",
      "во сколько",
      "ходит",
      "отправляетс",
      "конечн",
      "маршрут"
    ],
    "exclude": [
      "такси",
      "цена",
      "билет",
      "остановк"
    ],
    "a": "«Время последнего рейса не зафиксировано в базе. Посмотри расписание на остановке или спроси у водителя. Если опоздаешь — бери такси.»"
  },
  {
    "id": "port_internal_shuttle",
    "q": "Внутрипортовый транспорт (шаттл от причала до ворот)",
    "primary": [
      "внутрипортов",
      "шаттл",
      "причал",
      "по территории",
      "терминал"
    ],
    "synonyms": [
      "ворота",
      "транспорт внутри порта",
      "довезти до ворот",
      "внутренний"
    ],
    "exclude": [
      "такси",
      "город",
      "автобус",
      "центр",
      "цена",
      "моряков",
      "перекус",
      "поест",
      "еда",
      "кафе",
      "ресторан",
      "продукт",
      "магазин",
      "супермаркет",
      "водк",
      "виск",
      "джин",
      "ром",
      "алкогол"
    ],
    "a": "«В карточке этого порта нет подтверждённых данных о внутреннем транспорте (шаттл/автобус от причала до ворот). Уточни у судового агента или охраны — если внутреннего транспорта нет, до ворот придётся идти пешком.»"
  },
  {
    "id": "avoid_area",
    "q": "Район, которого стоит избегать",
    "primary": [
      "район",
      "избегать",
      "опасн",
      "не ходить",
      "криминал",
      "какой район",
      "считается небезопасн"
    ],
    "synonyms": [
      "небезопасн",
      "глух",
      "тёмн",
      "бандитск"
    ],
    "exclude": [
      "безопасно ли",
      "гулять",
      "вечер",
      "ночь",
      "центр",
      "если спрашивают"
    ],
    "a": "«Информация об опасных районах для этого порта отсутствует. Спроси у охраны порта или в центре моряков.»"
  },
  {
    "id": "curfew",
    "q": "Комендантский час (крайнее время возвращения)",
    "primary": [
      "комендантск",
      "час",
      "крайне",
      "до какого времени",
      "находиться на берегу"
    ],
    "synonyms": [
      "до скольки",
      "нужно вернутьс",
      "нельзя позже",
      "возвращени"
    ],
    "exclude": [
      "полиция",
      "штраф",
      "пропуск",
      "документ"
    ],
    "a": "«В карточке порта нет подтверждённых данных о комендантском часе. Уточни у вахтенного офицера на судне.»"
  },
  {
    "q": "Через какие ворота выйти в город",
    "primary": [
      "ворота",
      "через какие",
      "кпп",
      "выйти пешком",
      "пройти пешком",
      "выбраться",
      "попасть в город",
      "из порта"
    ],
    "synonyms": [
      "выход",
      "проходн",
      "выйти",
      "калитк",
      "главные ворота",
      "покинуть"
    ],
    "exclude": [
      "улица",
      "экипаж",
      "такси",
      "центр",
      "автобус",
      "старый город",
      "пропуск",
      "разрешени",
      "документ"
    ],
    "a": "«Обычно в порту одни главные ворота — спроси у охраны, где именно они находятся и как до них дойти. Если в карточке этого порта есть подтверждённые данные о выходе или маршруте, они приоритетнее общего совета. Отдельно: пропускные правила (нужен ли пропуск/документ) в каждом порту свои — это уточняется отдельно у охраны или судового агента.»"
  },
  {
    "q": "Нужен ли пропуск, чтобы выйти из порта",
    "primary": [
      "пропуск",
      "shore pass",
      "нужен",
      "shore leave",
      "разрешени"
    ],
    "synonyms": [
      "требуют",
      "выйти на берег",
      "выход",
      "shore pass",
      "пропуск на берег",
      "документ",
      "кпп"
    ],
    "exclude": [
      "паспорт",
      "виза",
      "seaman's book",
      "деньги"
    ],
    "a": "«Пропускные правила в каждом порту свои. Проверь на судне перед выходом — старпом должен знать.»"
  },
  {
    "q": "Какие документы взять с собой на берег",
    "primary": [
      "документ",
      "берег",
      "паспорт",
      "seaman's book"
    ],
    "synonyms": [
      "с собой",
      "удостоверени",
      "копи",
      "виз"
    ],
    "exclude": [
      "пропуск",
      "деньги",
      "телефон",
      "карта"
    ],
    "a": "«Всегда бери с собой удостоверение моряка (seaman's book) и паспорт.»"
  },
  {
    "q": "Обязателен ли светоотражающий жилет",
    "primary": [
      "жилет",
      "светоотражающ",
      "обязателен",
      "порт",
      "территория"
    ],
    "synonyms": [
      "надевать",
      "безопасность",
      "видимость"
    ],
    "exclude": [
      "одежда",
      "форма",
      "куртка",
      "обувь"
    ],
    "a": "«В большинстве портов жилет обязателен. Лучше перестраховаться.»"
  },
  
  {
    "q": "Можно ли фотографироваться на фоне порта / военных объектов",
    "primary": [
      "фотограф",
      "порт",
      "военн",
      "объект",
      "разрешен"
    ],
    "synonyms": [
      "снимок",
      "на фоне",
      "камера",
      "запрещен"
    ],
    "exclude": [
      "сувенир",
      "рынок",
      "улица",
      "здание",
      "город"
    ],
    "a": "«Военные объекты, здания береговой охраны и ворота порта часто фотографировать запрещено. Не рискуй — могут отобрать камеру и оштрафовать.»"
  },

  {
    "q": "Можно ли получить прививку в порту?",
    "primary": [
      "прививк",
      "вакцин",
      "укол"
    ],
    "synonyms": [
      "сделать прививку",
      "привить",
      "вакцинация",
      "медцентр"
    ],
    "exclude": [
      "лекарства",
      "таблетки",
      "анализы",
      "больница",
      "травма"
    ],
    "a": "«Прививки в порту делают не всегда. Лучше обратиться в городскую клинику или в центр моряков.»"
  },

  {
    "q": "Где ближайший супермаркет?",
    "primary": [
      "банан",
      "мусорн пакет",
      "губк",
      "яйц",
      "супермаркет",
      "есть магазин",
      "магазин рядом",
      "где магазин",
      "ближайший магазин",
      "рыб",
      "молок",
      "хлебуш",
      "пивк",
      "мясо",
      "фрукт",
      "колбас",
      "мандарин",
      "соль",
      "йогурт",
      "батарейк",
      "морков",
      "овощ",
      "кефир",
      "стиральн порошок",
      "ведр",
      "пиво",
      "рис",
      "сыр",
      "сосиск",
      "зажигалк",
      "лампочк",
      "бекон",
      "шоколад",
      "творог",
      "сок",
      "салфетк",
      "куриц",
      "верёвк",
      "макарон",
      "виноград",
      "моющ средств",
      "ножниц",
      "апельсин",
      "капуст",
      "конфет",
      "продуктовый",
      "картофел",
      "магазин продукт",
      "яблок",
      "ветчин",
      "помидор",
      "минералк",
      "шнур",
      "сметан",
      "средство для посуды",
      "тряпк",
      "клей",
      "багет",
      "сахар",
      "скотч",
      "картош",
      "огурец",
      "батон",
      "молочк",
      "гречк",
      "продукты",
      "сливк",
      "изолент",
      "овсянк",
      "томат",
      "хлеб",
      "газировк",
      "булк",
      "спичк",
      "фонарик",
      "печенье",
      "прищепк",
      "лимонад"
    ],
    "synonyms": [
      "колбаск",
      "гипермаркет",
      "рыбк",
      "булочк",
      "магазин",
      "сырок",
      "пакетик",
      "картошечк",
      "яблочк",
      "минералочк",
      "бананчик",
      "маркет",
      "тряпочк",
      "веревочк",
      "шоколадк",
      "печеньк",
      "губочк",
      "курочк",
      "водичк"
    ],
    "exclude": [
      "алкогол",
      "сувенир",
      "антибиотик",
      "аптека",
      "cbd"
    ],
    "a": "«В карточке этого порта нет подтверждённого супермаркета. Можно спросить у охраны порта — они обычно подскажут направление.»"
  },
  {
    "q": "Какому такси здесь можно доверять?",
    "primary": [],
    "compoundAnchors": [
      ["такси"],
      ["доверять", "лицензи", "официальн"]
    ],
    "synonyms": [
      "обманут",
      "надёжн",
      "не кинут",
      "проверенн"
    ],
    "exclude": [],
    "a": "«Доверяй такси с лицензией, счётчиком и логотипом компании. Не садись в частные машины у порта без опознавательных знаков.»"
  },
  
  {
    "q": "Где купить дезодорант, шампунь или другие гигиенические принадлежности?",
    "primary": [
      "расческ",
      "расчёск",
      "зубн нит",
      "зубочистк",
      "ватн палочк",
      "крем",
      "дезодорант",
      "гигиен",
      "антиперспирант",
      "бритв",
      "ватн диск",
      "шампун",
      "гребен",
      "лезви",
      "мыл",
      "мочалк",
      "туалетн бумаг",
      "паст",
      "щетк",
      "флосс"
    ],
    "synonyms": [
      "расчесочк",
      "шампуньк",
      "гель для бритья",
      "кремчик",
      "паст",
      "щётк",
      "мыльц",
      "лосьон",
      "салфеточк"
    ],
    "exclude": [],
    "a": "«В карточке этого порта нет подтверждённого магазина с гигиеническими принадлежностями. Можно спросить у охраны порта или судового агента.»"
  },
  {
    "q": "Где купить простую одежду (футболку, шорты)?",
    "primary": [
      "шапк",
      "шорт",
      "майк",
      "кофт",
      "джинс",
      "трус",
      "толстовк",
      "худи",
      "кепк",
      "дождевик",
      "ремен",
      "куртк",
      "бель",
      "свитер",
      "брюки",
      "футболк",
      "рубашк",
      "штан"
    ],
    "synonyms": [
      "курточк",
      "кофточк",
      "футболочк",
      "маечк",
      "шапочк",
      "простую одежду",
      "переодеться"
    ],
    "exclude": [],
    "a": "«В карточке этого порта нет подтверждённого магазина с одеждой. Можно спросить у охраны порта, где ближайший рынок или торговый центр.»"
  },

  {
    "q": "Где купить полотенце, подушку или беруши для каюты?",
    "primary": [
      "полотенц",
      "подушк",
      "наволочк",
      "одеял",
      "плед",
      "простын",
      "постельн бель",
      "маск для сна",
      "беруш",
      "рюкзак",
      "чемодан",
      "органайзер"
    ],
    "synonyms": [
      "полотенчик",
      "подушечк",
      "пледик",
      "рюкзачок",
      "сумочк",
      "чемоданчик"
    ],
    "exclude": [
      "wellness",
      "массаж",
      "восстановлени"
    ],
    "a": "«В карточке этого порта пока нет подтверждённой точки с такими бытовыми и дорожными товарами — попробуй супермаркет или ближайший торговый центр.»"
  },

];

const COMPANION_INTENTS = [
  {
    "topic": "Приветствие (нейтральное — по реальному времени порта)",
    "primary": [
      "привет",
      "здравствуй",
      "салют",
      "хай",
      "хеллоу",
      "hello",
      "hi"
    ],
    "timeReplies": [
      {
        "from": 5,
        "to": 11,
        "text": "Доброе утро! Как настроение с утра?"
      },
      {
        "from": 11,
        "to": 18,
        "text": "Добрый день! Чем могу помочь?"
      },
      {
        "from": 18,
        "to": 23,
        "text": "Добрый вечер! Как прошёл день?"
      },
      {
        "from": 23,
        "to": 5,
        "text": "Доброй ночи! Если не спится — я здесь."
      }
    ],
    "replies": [
      "Привет! Чем могу помочь?"
    ]
  },
  {
    "topic": "Приветствие (Утро/День)",
    "primary": [
      "доброе утро",
      "добрый день"
    ],
    "replies": [
      "Привет! Доброе утро. Как у тебя начинается день?",
      "Добрый день! Рад тебя слышать. Что сегодня происходит?"
    ]
  },
  {
    "topic": "Приветствие (Вечер/Ночь)",
    "primary": [
      "добрый вечер",
      "спокойной ночи",
      "привет ночью"
    ],
    "replies": [
      "Добрый вечер! Как прошёл день?",
      "Привет. Если не спится и хочется поболтать — я здесь."
    ]
  },
  {
    "topic": "Прощание (Пока/До связи)",
    "primary": [
      "до свидания",
      "до встречи",
      "до связи",
      "выхожу",
      "ну всё пока",
      "я пошёл"
    ],
    "replies": [
      "Хорошо поговорили. До связи!",
      "Спокойной ночи. Увидимся, когда захочешь снова поболтать."
    ]
  },
  {
    "topic": "Жалоба на скуку / Одиночество",
    "primary": [
      "скучно",
      "одиноко",
      "не с кем",
      "тоскливо",
      "каюта",
      "вахта"
    ],
    "replies": [
      "Давай немного поболтаем. Можешь рассказать, как прошёл день, а могу предложить тему сам.",
      "Если скучно, можем поговорить о порте, море, фильмах, еде — о чём захочешь."
    ]
  },
  {
    "topic": "Ностальгия по дому",
    "primary": [
      "дом",
      "домой",
      "жена",
      "дети",
      "скучаю",
      "фото",
      "мама"
    ],
    "replies": [
      "Понимаю, о доме хочется говорить. Что тебе сейчас больше всего вспоминается?",
      "Хочешь рассказать о доме или лучше переключимся на другую тему?"
    ]
  },
  {
    "topic": "Усталость после вахты",
    "primary": [
      "устал",
      "вахта",
      "сил нет",
      "спать хочу",
      "тяжел",
      "достал",
      "достали",
      "надоел",
      "надоели",
      "бесит",
      "выбесил",
      "замотала",
      "замотал",
      "вымотал",
      ...RECOVERY_MARKERS
    ],
    "replies": [
      "Похоже, вахта вымотала. Хочешь немного поговорить или просто посидим здесь без сложных тем?",
      "Тяжёлый день? Расскажи, если хочется выговориться. Я послушаю."
    ]
  },
  {
    "topic": "Беспричинная тревога / Страх",
    "primary": [
      "тревожно",
      "страшно",
      "беспокоюсь",
      "боюсь",
      "шторм"
    ],
    "replies": [
      "Слышу тебя. Хочешь рассказать, что именно сейчас беспокоит, или лучше отвлечёмся и поговорим о чём-нибудь другом?",
      "Если это связано со штормом, судном или реальной опасностью, лучше сразу обратиться к члену экипажа или офицеру."
    ]
  },
  {
    "topic": "Вопрос «Зачем я здесь?» (Смысл)",
    "primary": [
      "зачем",
      "смысл",
      "надоело",
      "бросить"
    ],
    "replies": [
      "Похоже, тебе сейчас многое надоело. Не буду придумывать за тебя ответы. Хочешь рассказать, что именно больше всего достало в этом рейсе?",
      "Можем просто поговорить — без советов и больших слов."
    ]
  },
  {
    "topic": "Просто сказать «Я тут»",
    "primary": [
      "слушай",
      "послушай",
      "проверка связи",
      "ты здесь"
    ],
    "replies": [
      "Я здесь. Слушаю.",
      "Да, я на месте. О чём хочешь поговорить?"
    ]
  },
  {
    "topic": "Шутка / Поднять настроение",
    "primary": [
      "рассмеши",
      "анекдот",
      "шутка",
      "смешно",
      "весело"
    ],
    "replies": [
      "Конечно. Могу рассказать короткую морскую шутку — только без обещаний, что она хорошая!",
      "Давай попробуем поднять настроение. Морскую или обычную?"
    ]
  },
  {
    "topic": "Как дела? / Как ты?",
    "primary": [
      "как дела",
      "как ты",
      "настроение",
      "чем занят",
      "как поживаешь"
    ],
    "replies": [
      "У меня всё спокойно — я здесь и готов поболтать. А у тебя как дела?",
      "Спасибо, что спросил. Лучше расскажи, как ты сегодня?"
    ]
  },
  {
    "topic": "Благодарность",
    "primary": [
      "спасибо",
      "благодарю",
      "помог",
      "выручил",
      "молодец"
    ],
    "replies": [
      "Пожалуйста! Рад, что пригодилось.",
      "Не за что. Обращайся, когда понадобится."
    ]
  },
  {
    "topic": "Раздражение на ассистента",
    "primary": [
      "не понял",
      "неправильно",
      "ерунда",
      "бесишь",
      "глупость",
      "опять не то",
      "то же самое",
      "одно и то же",
      "по кругу",
      "готовые ответы",
      "заготовк"
    ],
    "replies": [
      "Понял, значит я промахнулся. Скажи другими словами, что именно тебе нужно, и попробуем ещё раз.",
      "Да, этот ответ не попал в вопрос. Давай уточним.",
      "Ты прав, я сейчас повторяюсь — офлайн у меня правда немного вариантов. Расскажи своими словами, что происходит, попробую ответить точнее."
    ]
  },
  {
    "topic": "Просто хочется поговорить",
    "primary": [
      "поговори",
      "поболтаем",
      "поговорить",
      "расскажи что-нибудь",
      "составь компанию"
    ],
    "replies": [
      "Конечно. Выбирай: море, порт, фильмы, еда, путешествия — или просто расскажи, что сегодня было.",
      "Давай. Можешь начать с чего угодно."
    ]
  },
  {
    "topic": "Хорошая новость / Хорошее настроение",
    "primary": [
      "рад",
      "отлично",
      "получилось",
      "хорошая новость",
      "счастлив",
      "повезло"
    ],
    "replies": [
      "Отлично! Рассказывай, что случилось.",
      "Вот это уже приятно слышать. Что сегодня получилось?"
    ]
  },
  {
    "topic": "Чем заняться в свободное время?",
    "primary": [
      "нечего делать",
      "чем заняться",
      "свободное время",
      "посоветуй"
    ],
    "replies": [
      "Могу предложить несколько вариантов: посмотреть, что есть рядом с портом, выбрать место в City Life или просто поболтать здесь. Что больше подходит?"
    ]
  }
];
