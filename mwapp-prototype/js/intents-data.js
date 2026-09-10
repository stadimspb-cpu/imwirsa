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
      "недорог"
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
    "q": "Как дешевле всего отправить деньги домой?",
    "primary": [
      "перевод",
      "деньги домой",
      "отправить деньги",
      "western union",
      "комиссия"
    ],
    "synonyms": [
      "трансфер",
      "на карту",
      "денег",
      "деньг"
    ],
    "exclude": [
      "обменник",
      "банкомат",
      "курс валют"
    ],
    "a": "«Дешевле всего отправлять через приложения (PayPal, Wise) или банковский перевод. Если нужны наличные — Western Union, они есть в банках и на почте.»"
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
      "wellness"
    ],
    "a": "«Если ты про обычный вечерний отдых — бары и клубы отмечены в разделе «Развлечения»: {названия}. Если вопрос касается более личных или деликатных услуг, я не буду ничего рекомендовать или оценивать. В разделе Wellness можно связаться с Wellness Host — консультантом программы Wellness. Это живой человек, он сможет спокойно объяснить такие вопросы точнее меня. Доступ к разделу Wellness предусмотрен для участников профсоюзной программы.»"
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
      "массаж",
      "салон",
      "счастлив",
      "конц",
      "интим"
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
    "a": "«Мы не отслеживаем такие заведения. Если в карточке есть обычная сауна для отдыха — {название/адрес}. По остальным вопросам такого рода лучше обратиться к Wellness Host в приложении (раздел Wellness, нужна карта профсоюза).»"
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
    "a": "«В карточке этого порта нет подтверждённого магазина с недорогим алкоголем. Можно спросить у охраны порта. Не покупай с рук у ворот — могут подсунуть палёное или разбавленное.»"
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
    "a": "«Официально мы НЕ рекомендуем и НЕ даём адреса. Покупка веществ у ворот порта в большинстве случаев приводит к аресту или шантажу; в этой стране за хранение даже малых доз — {тюрьма / штраф / депортация}. Судовладелец может снять тебя с рейса. Не рискуй.»"
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
    "a": "«В карточке этого порта нет подтверждённого бара. Можно спросить у местных или у охраны порта. В любом случае: помни, что возвращение на судно в состоянии сильного опьянения может привести к списанию с судна за твой счёт. Пронос алкоголя на территорию порта: {разрешён / запрещён}.»"
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
    "a": "«Нет. Даже если CBD легален в стране, ввоз через границу строжайше запрещён — это касается Канады, Австралии, стран ЕС и многих других. Нарушение может означать уголовное преследование, депортацию, тюрьму. На борт судна CBD также запрещён по правилам IMO/ILO. Не бери, не храни, не провози.»"
  },
  {
    "q": "Можно ли использовать CBD на борту судна?",
    "protected": true,
    "primary": [],
    "compoundAnchors": [
      ["cbd"],
      ["imo", "ilo", "на судн", "борту", "на вахт", "снять с рейса"]
    ],
    "synonyms": [
      "использов",
      "запрещен",
      "правил"
    ],
    "exclude": [
      "купить",
      "цена",
      "магазин",
      "страна"
    ],
    "a": "«По правилам IMO/ILO — нет, даже «просто CBD без THC». Регулярное употребление CBD может сделать моряка негодным к медосвидетельствованию, и его могут снять с рейса. Употребление обычно запрещено за 48 часов до выхода в море.»"
  },
  {
    "q": "Если я куплю CBD в Европе, а судно пойдёт в Азию — что будет?",
    "protected": true,
    "primary": [],
    "compoundAnchors": [
      ["cbd"],
      ["европ", "ази", "сингапур", "гонконг", "арест"]
    ],
    "synonyms": [
      "транзит",
      "заход",
      "порт",
      "конфискаци",
      "срок"
    ],
    "exclude": [
      "цена",
      "купить",
      "аромат",
      "вкус"
    ],
    "a": "«Если тебя поймают с CBD на борту при заходе в азиатский порт (Сингапур, Гонконг, Индонезия, Филиппины) — тебя могут арестовать. В Гонконге — до 7 лет тюрьмы и крупный штраф. В Сингапуре и Индонезии ещё жёстче. Не рискуй — лучше выбросить, чем везти.»"
  },
  {
    "q": "А если у меня рецепт на CBD от врача?",
    "protected": true,
    "primary": [
      "рецепт",
      "документ",
      "разрешен",
      "ввоз"
    ],
    "synonyms": [
      "врач",
      "справк",
      "лекарств",
      "обоснован",
      "онколог"
    ],
    "exclude": [
      "купить",
      "цена",
      "магазин",
      "аромат",
      "ес"
    ],
    "a": "«Рецепт не всегда помогает при пересечении границы, если продукт запрещён в стране захода. В Австралии и Канаде ввоз с рецептом разрешён только при строгом декларировании и ограничен по количеству. В Новой Зеландии личный ввоз запрещён вовсе. Для моряка совет один: не бери CBD в рейс.»"
  },
  {
    "q": "Где в мире CBD категорически запрещён?",
    "protected": true,
    "primary": [
      "категорически запрещ"
    ],
    "compoundAnchors": [
      ["cbd"],
      ["запрещ", "стран", "россия", "китай", "ближний восток"]
    ],
    "synonyms": [
      "тюрьм",
      "штраф",
      "депортаци",
      "черный список"
    ],
    "exclude": [
      "легальн",
      "разреш",
      "ес",
      "сша",
      "канада",
      "цена",
      "марихуан",
      "наркотик"
    ],
    "a": "«В офлайн-режиме я не могу дать точный и актуальный список стран — законы меняются, и ошибка здесь может дорого стоить. При подключении к интернету отвечу подробнее. А пока — не рискуй: не покупай и не бери CBD с собой в порт или на судно, где бы ты ни был.»"
  },
  {
    "q": "Где CBD относительно легален?",
    "protected": true,
    "primary": [
      "относительно легал"
    ],
    "compoundAnchors": [
      ["cbd"],
      ["легал", "стран", "ес", "сша", "канада", "разреш"]
    ],
    "synonyms": [
      "медицинск",
      "ввоз",
      "правил",
      "thc"
    ],
    "exclude": [
      "запрещ",
      "россия",
      "азия",
      "штраф",
      "тюрьм",
      "марихуан",
      "наркотик"
    ],
    "a": "«В офлайн-режиме я не могу дать точный и актуальный список стран — правила слишком часто меняются и зависят от состава конкретного продукта. При подключении к интернету отвечу подробнее. А пока рекомендую воздержаться от покупки: даже там, где CBD разрешён внутри страны, остаются отдельные правила порта, таможни и судна.»"
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
    "a": "«В карточке этого порта нет подтверждённого магазина с недорогим алкоголем для местных цен. Можно спросить у охраны порта, где спальные районы города.»"
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
      "экипаж",
      "территория"
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
    "a": "«Не вступай в конфликт. Потребуй включить счётчик или показать цену в приложении. Официальное такси в этом порту стоит не более {цена} до центра. Если водитель вымогает деньги у КПП — спокойно иди к охране порта или звони в полицию ({номер 112 / местный}). Водители обычно сразу уезжают при виде охраны.»"
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
    "q": "Где купить запчасти или инструмент?",
    "primary": [
      "запчаст",
      "инструмент",
      "снабж",
      "chandler"
    ],
    "synonyms": [],
    "exclude": [
      "еда",
      "одежда",
      "телефон"
    ],
    "a": "«В карточке этого порта нет подтверждённого магазина судового снабжения. Можно спросить у судового агента.»"
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
    "q": "Есть ли магазин рабочей одежды?",
    "primary": [
      "обувь",
      "спецодежд",
      "роб",
      "роба",
      "перчатки",
      "рабочая одежд",
      "рабочей одежд"
    ],
    "synonyms": [],
    "exclude": [
      "обычн одежд",
      "сувенир",
      "спорт"
    ],
    "a": "«Спецодежду продают в хозяйственных магазинах или на рынках. В порту иногда есть лавка с робой.»"
  },
  {
    "q": "Где купить рыболовные снасти?",
    "primary": [
      "рыболов",
      "спиннинг",
      "крючк",
      "леск",
      "снаст"
    ],
    "synonyms": [],
    "exclude": [
      "еда",
      "сувенир",
      "одежда"
    ],
    "a": "«В карточке этого порта нет подтверждённого магазина с рыболовными снастями. Можно спросить у охраны порта или судового агента.»"
  },
  {
    "q": "Где купить флешку с фильмами?",
    "primary": [
      "флешк",
      "фильм",
      "музыка",
      "контент",
      "накопитель"
    ],
    "synonyms": [],
    "exclude": [
      "телефон",
      "зарядка",
      "sim"
    ],
    "a": "«В большинстве городов накопители с медиаконтентом продают в специализированных магазинах Видео/Музыка. Если готовых флешек нет — купи чистую флешку в салоне связи и скачай контент через бесплатный Wi-Fi в Seamen's Club.»"
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
    "q": "Где купить средство от похмелья?",
    "primary": [
      "похмель",
      "средство",
      "после пьянк"
    ],
    "synonyms": [
      "аптека",
      "голова"
    ],
    "exclude": [
      "алкоголь",
      "бар",
      "пиво"
    ],
    "a": "«Аспирин, регидрон и подобные средства есть в любой аптеке. И главное — вода, много воды.»"
  },
  {
    "q": "Где посмотреть футбол или бокс по ТВ?",
    "primary": [
      "футбол",
      "бокс",
      "спорт",
      "бар",
      "тв"
    ],
    "synonyms": [],
    "exclude": [
      "еда",
      "футболк",
      "обед",
      "кофе"
    ],
    "a": "«В карточке этого порта нет подтверждённого спортивного бара. Можно спросить у охраны порта или местных.»"
  },
  {
    "q": "Где поиграть в бильярд или дартс?",
    "primary": [
      "бильярд",
      "дартс",
      "паб",
      "игра",
      "бар"
    ],
    "synonyms": [],
    "exclude": [
      "казино",
      "покер"
    ],
    "a": "«Бильярд и дартс есть в пабах и барах. Спроси у местных, где тусуется молодёжь.»"
  },
  {
    "q": "Где купить хороший нож или мультитул?",
    "primary": [
      "нож",
      "мультитул",
      "хозяйствен",
      "рынок"
    ],
    "synonyms": [],
    "exclude": [
      "еда",
      "сувенир",
      "одежда"
    ],
    "a": "«Ножи и мультитулы продаются в хозяйственных магазинах и на рынках. Проверь местные законы — некоторые страны ограничивают длину клинка.»"
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
      "драка"
    ],
    "a": "«Не паникуй и не груби. Покажи документы. Если требуют деньги «на месте» — скажи, что вызовешь консула. После инцидента сразу звони в Дежурный офис IMWIRSA.»"
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
    "a": "«Иди в любое отделение полиции и пиши заявление. Без заявления страховка не выплатит. Или позвони в Дежурный офис IMWIRSA.»"
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
    "q": "Можно ли купить местные сувениры?",
    "primary": [
      "брелок",
      "рынок",
      "кружк сувенир",
      "подарок",
      "открытк",
      "подароч",
      "магнит",
      "лавк",
      "сувенир"
    ],
    "synonyms": [
      "местн"
    ],
    "exclude": [
      "еда",
      "алкоголь",
      "одежда"
    ],
    "a": "«Сувениры продаются на рынках и у местных портовых лотков. Уточни адрес у охраны на КПП.»"
  },
  {
    "q": "Есть ли зоопарк или аквариум?",
    "primary": [
      "зоопарк",
      "аквариум",
      "океанариум",
      "дети",
      "билет"
    ],
    "synonyms": [],
    "exclude": [
      "бар",
      "клуб",
      "еда"
    ],
    "a": "«Океанариумы есть в крупных городах. Спроси у местных или в отеле.»"
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
    "q": "Где подстричься (барбершоп)?",
    "primary": [
      "парикмахер",
      "барбершоп",
      "стричь",
      "ногти",
      "подстричьс"
    ],
    "synonyms": [],
    "exclude": [
      "одежда",
      "обувь",
      "ремонт"
    ],
    "a": "«В карточке этого порта нет подтверждённой парикмахерской / барбершопа. Можно уточнить в центре моряков или у судового агента.»"
  },
  {
    "q": "У меня порвалась обувь/одежда, где починить?",
    "primary": [
      "иголк",
      "заплатк",
      "зашит",
      "пуговиц",
      "обувь",
      "ремонт",
      "застёжк",
      "пришит",
      "молни",
      "порвал",
      "нитк",
      "игл",
      "починить"
    ],
    "synonyms": [],
    "exclude": [
      "купить",
      "магазин",
      "сувенир"
    ],
    "a": "«По вопросу ремонта обуви и одежды обратись в Центр моряков — там всегда подскажут, кто и где может произвести ремонт. Как правило, там есть бесплатная рабочая одежда и обувь из гуманитарных запасов.»"
  },
  {
    "q": "Где купить вейп, жидкость, эльфбар?",
    "primary": [
      "вейп",
      "жидкость",
      "эльфбар",
      "однораз",
      "под"
    ],
    "synonyms": [],
    "exclude": [
      "сигарет",
      "табак",
      "кальян",
      "cbd"
    ],
    "a": "«В карточке этого порта нет подтверждённого вейп-шопа. Уточни у местных, легальны ли одноразовые вейпы в этой стране — в ряде стран они запрещены или сильно ограничены.»"
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
    "q": "Где купить крестик или Библию?",
    "primary": [
      "крестик",
      "библия",
      "лавк"
    ],
    "synonyms": [],
    "exclude": [
      "сувенир",
      "подарок",
      "украшение"
    ],
    "a": "«Крестики и Библии продают в церквях, соборах и иногда в сувенирных лавках.»"
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
      "рейс",
      "расписани"
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
      "город",
      "через какие",
      "кпп",
      "выйти пешком",
      "пройти пешком"
    ],
    "synonyms": [
      "выход",
      "проходн",
      "выйти",
      "калитк",
      "главные ворота"
    ],
    "exclude": [
      "улица",
      "экипаж",
      "такси",
      "центр",
      "автобус",
      "старый город"
    ],
    "a": "«Обычно в порту одни главные ворота. Спроси у охраны.»"
  },
  {
    "q": "Нужен ли пропуск, чтобы выйти из порта",
    "primary": [
      "пропуск",
      "из порта",
      "shore pass",
      "нужен",
      "shore leave",
      "разрешени",
      "выход"
    ],
    "synonyms": [
      "требуют",
      "выйти на берег",
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
    "q": "Фитнес-зал / качалка (с разовым посещением)",
    "primary": [
      "фитнес",
      "зал",
      "качалк",
      "тренажёр",
      "спорт"
    ],
    "synonyms": [
      "разов",
      "потренироватьс",
      "штанга",
      "кардио"
    ],
    "exclude": [
      "бассейн",
      "сауна",
      "массаж",
      "баня"
    ],
    "a": "«Фитнес-клубы есть в центре города. Спроси про разовое посещение.»"
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
    "q": "Что такое Wellness-зона и какие там услуги?",
    "primary": [
      "wellness",
      "восстановлени",
      "релакс",
      "здоровь",
      "снятие стресса"
    ],
    "synonyms": [
      "зона отдыха",
      "восстановить силы",
      "оздоровление"
    ],
    "exclude": [
      "секс",
      "интим",
      "девушки",
      "массаж",
      "ночной клуб"
    ],
    "a": "«Это место для отдыха и восстановления моряков. Wellness-зоной управляет местный оператор через Wellness Host — MWApp показывает только информацию и контакты. В зависимости от конкретной зоны там могут быть массажные кресла, VR, расслабляющая музыка, ароматерапия и другие Wellness-сервисы. Точный перечень можно посмотреть в карточке зоны или уточнить у Wellness Host.»"
  },
  {
    "q": "Что значит \"психологическая разгрузка\"? Это для слабаков?",
    "primary": [
      "психологическ",
      "разгрузк",
      "стресс",
      "сон",
      "усталость"
    ],
    "synonyms": [
      "восстановить голову",
      "моральное состояние",
      "выгорание"
    ],
    "exclude": [
      "слабаки",
      "страх",
      "трусость",
      "девушки",
      "вечеринка"
    ],
    "a": "«Нет, это для профессионалов. После 3–6 месяцев в море у каждого накапливается усталость, стресс, нарушается сон. Wellness-зона помогает снять нервное напряжение, восстановить сон и настроение — это как техобслуживание для тела и головы, чтобы ты вышел в следующий рейс свежим. Это признак зрелого подхода к своей работе.»"
  },
  {
    "q": "Массаж — это руками или там кресло?",
    "primary": [
      "массаж",
      "руками",
      "кресло",
      "автоматическ",
      "спина"
    ],
    "synonyms": [
      "ручной массаж",
      "массажное кресло",
      "спина",
      "шея"
    ],
    "exclude": [
      "эротический",
      "интим",
      "счастливый конец",
      "девушка"
    ],
    "a": "«Обычно есть и то, и другое. Уточни у Wellness Host, что доступно в этом порту.»"
  },
  {
    "q": "А ароматерапия — какие запахи? Можно выбрать?",
    "primary": [
      "ароматерапи",
      "запах",
      "масло",
      "лаванд",
      "мята"
    ],
    "synonyms": [
      "эфирное масло",
      "расслабление",
      "цитрус",
      "сандал"
    ],
    "exclude": [
      "алкоголь",
      "сигареты",
      "кальян",
      "интим"
    ],
    "a": "«Обычно предлагают 4–5 базовых ароматов. Скажи Wellness Host, чего тебе не хватает — он подберёт подходящее масло.»"
  },
  {
    "q": "Сколько это стоит?",
    "primary": [
      "сеанс",
      "стоимость",
      "цена",
      "wellness",
      "сколько стоит",
      "оплата"
    ],
    "synonyms": [
      "сколько денег",
      "прайс",
      "тариф"
    ],
    "exclude": [
      "проституция",
      "интим-услуги",
      "алкоголь",
      "такси"
    ],
    "a": "«Стоимость устанавливает сама Wellness-зона. Если интересует цена — уточни актуальную стоимость у Wellness Host.»"
  },
  {
    "q": "Можно ли оплатить картой или только наличные?",
    "primary": [],
    "compoundAnchors": [
      ["wellness", "сеанс", "массаж", "спа", "процедур"],
      ["оплата", "оплатить", "карта", "картой", "наличные", "безнал"]
    ],
    "synonyms": [
      "терминал",
      "расплатиться",
      "visa",
      "mastercard",
      "кэш"
    ],
    "exclude": [
      "обменник",
      "курс",
      "доллар"
    ],
    "a": "«Уточни этот вопрос у Wellness Host при бронировании.»"
  },
  {
    "q": "Надо записываться заранее или можно в любое время?",
    "primary": [
      "запись",
      "бронь",
      "время",
      "слот",
      "заранее"
    ],
    "synonyms": [
      "записаться",
      "свободно",
      "расписание",
      "часы пик"
    ],
    "exclude": [
      "бар",
      "клуб",
      "такси"
    ],
    "a": "«Рекомендую написать Wellness Host в приложении — он подскажет свободные слоты и забронирует время.»"
  },
  {
    "q": "Есть ли скидки для моряков? Что такое Partner Discounts?",
    "primary": [
      "скидк",
      "льгота",
      "дешевле",
      "акция",
      "partner discounts"
    ],
    "synonyms": [
      "промокод",
      "специальное предложение",
      "партнёрская программа скидок"
    ],
    "exclude": [
      "профсоюз",
      "премиум",
      "доступ"
    ],
    "a": "«Это партнёрская программа MWApp Premium (Partner Discounts), которая даёт доступ к скидкам и специальным условиям у участвующих магазинов и сервисов в отдельных портах. Список доступных партнёров показывается в MWApp.»"
  },
  {
    "q": "Могу ли я прийти просто полежать в тишине без массажа?",
    "primary": [
      "полежать",
      "тишина",
      "комната отдыха",
      "релакс"
    ],
    "synonyms": [
      "поспать",
      "почитать",
      "отдохнуть",
      "без массажа"
    ],
    "exclude": [
      "массаж",
      "кресло",
      "процедуры"
    ],
    "a": "«В Wellness-зонах обычно есть зоны отдыха, куда можно прийти почитать, подремать или просто побыть в тишине. Уточни у Wellness Host, нужно ли бронировать такое место.»"
  },
  {
    "q": "А там есть сауна или бассейн?",
    "primary": [
      "сауна",
      "бассейн",
      "хамам",
      "пар",
      "вода"
    ],
    "synonyms": [
      "попариться",
      "поплавать",
      "джакузи"
    ],
    "exclude": [
      "массаж",
      "ароматерапия",
      "кресло"
    ],
    "a": "«Не во всех зонах есть сауна, хамам или бассейн — это зависит от порта. Wellness Host даст полную информацию о том, что доступно именно здесь.»"
  },
  {
    "q": "Могу ли я взять с собой напарника?",
    "primary": [
      "напарник",
      "вместе",
      "вдвоем",
      "парный",
      "компания"
    ],
    "synonyms": [
      "с другом",
      "общий сеанс",
      "не один"
    ],
    "exclude": [
      "женщина",
      "девушка",
      "интим"
    ],
    "a": "«Обычно кабинки рассчитаны на одного человека. Но иногда есть парные сеансы или общие зоны отдыха — уточни у Wellness Host.»"
  },
  {
    "q": "Сколько времени длится один сеанс?",
    "primary": [
      "сеанс",
      "время",
      "длится",
      "минут",
      "час"
    ],
    "synonyms": [
      "сколько по времени",
      "продолжительность"
    ],
    "exclude": [
      "цена",
      "стоимость",
      "оплата"
    ],
    "a": "«Wellness Host подберёт подходящую длительность под твой график.»"
  },
  {
    "q": "А что, если я усну во время массажа?",
    "primary": [
      "усну",
      "массаж",
      "сон",
      "расслабился",
      "будильник"
    ],
    "synonyms": [
      "проспать",
      "разбудить",
      "выход на судно"
    ],
    "exclude": [
      "секс",
      "интим",
      "алкоголь"
    ],
    "a": "«Это нормально — значит, ты действительно расслабился. Массажисты привыкли к этому. Если боишься проспать выход на судно — скажи об этом заранее, тебе поставят будильник.»"
  },
  {
    "q": "А можно ли там получить секс-услуги?",
    "primary": [
      "секс",
      "интим",
      "услуги",
      "эротика",
      "массаж"
    ],
    "synonyms": [
      "проституция",
      "\"счастливый конец\"",
      "девушки"
    ],
    "exclude": [
      "wellness",
      "ароматерапия",
      "релакс"
    ],
    "a": "«Wellness-зона — это место для восстановления здоровья: снятия мышечного напряжения, стресса, улучшения сна. Это не интим-салон, и любые предложения такого рода не имеют отношения к работе зоны. Всё, что связано с интимом, — вне работы этой зоны.»"
  },
  {
    "q": "А если я хочу не массаж, а просто женское внимание или приятное общение?",
    "primary": [
      "женское внимание",
      "компания",
      "общение",
      "приятно"
    ],
    "synonyms": [
      "поговорить",
      "знакомство",
      "не одиноко",
      "девушк"
    ],
    "exclude": [
      "wellness",
      "ароматерапия",
      "спина",
      "шея"
    ],
    "a": "«Wellness-зона создана для профессионального восстановления, а не для знакомств. Массажисты и хосты — специалисты, а не аниматоры. Если нужно просто поговорить или снять эмоциональное напряжение — есть центры моряков, капелланы или психологическая поддержка. Для этого обратись в Дежурный офис IMWIRSA.»"
  },
  {
    "q": "Где узнать точное расписание и записаться?",
    "primary": [
      "расписание",
      "запись",
      "wellness host",
      "бронирование"
    ],
    "synonyms": [
      "связаться",
      "подтвердить",
      "свободное время"
    ],
    "exclude": [
      "цена",
      "скидка",
      "оплата"
    ],
    "a": "«Только через Wellness Host в приложении: открой раздел «Wellness», нажми «Связаться с Host», напиши свой запрос. Host проверит доступность, пришлёт цену и подтвердит бронь. Ассистент не видит расписания в реальном времени.»"
  },
  {
    "q": "Я записался, но передумал — что делать?",
    "primary": [
      "отмена",
      "передумал",
      "опоздал",
      "штраф",
      "перенос"
    ],
    "synonyms": [
      "не приду",
      "изменил планы",
      "отменить запись"
    ],
    "exclude": [
      "цена",
      "оплата",
      "карта"
    ],
    "a": "«Напиши Wellness Host в приложении как можно раньше. У каждой зоны своё правило отмены (обычно за 2–4 часа). Это решает Host, а не ассистент.»"
  },
  {
    "q": "А если мне не понравится массажист или услуга — могу пожаловаться?",
    "primary": [
      "жалоба",
      "массажист",
      "качество",
      "не понравилось",
      "претензия"
    ],
    "synonyms": [
      "недоволен",
      "заменить",
      "плохо сделал"
    ],
    "exclude": [
      "цена",
      "скидка",
      "интим"
    ],
    "a": "«Да. Все вопросы по качеству услуги решаются через Wellness Host в приложении. Ассистент фиксирует обращение, но разбирает только Host.»"
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
    "q": "Можно ли арендовать велосипед?",
    "primary": [
      "велосипед",
      "прокат",
      "аренд",
      "вело"
    ],
    "synonyms": [
      "взять велик",
      "покататься"
    ],
    "exclude": [
      "такси",
      "автобус",
      "шаттл",
      "машина"
    ],
    "a": "«Информации о прокате велосипедов для этого порта нет. Обычно есть в туристических центрах или отелях.»"
  },
  {
    "q": "Что мне делать, если профсоюз не даёт мне доступ к премиум-уровню?",
    "primary": [
      "профсоюз",
      "премиум",
      "доступ",
      "не дает"
    ],
    "synonyms": [
      "не дают премиум",
      "нет доступа",
      "профсоюз вообще не участвует в программе",
      "отказали и профсоюз и миссия",
      "профсоюз отказал куда обращаться"
    ],
    "exclude": [],
    "a": "«Ты всё равно можешь пользоваться Standard MWApp без ограничений основных функций — карточки портов и все справочные разделы. Если хочешь получить Premium, открой Центральный офис IMWIRSA в настройках и напиши туда — там подскажут, какие организации (профсоюзы, welfare-, благотворительные, миссионерские) сейчас участвуют в программе и как попробовать получить доступ через одну из них.»"
  },
  {
    "q": "Что значит карточка в приложении Trade Union?",
    "primary": [
      "trade union",
      "карточка",
      "премиум"
    ],
    "synonyms": [
      "раздел trade union",
      "что за раздел"
    ],
    "exclude": [],
    "a": "«Trade Union — это раздел MWApp для моряков, которым профсоюз предоставил Premium-доступ. В этом разделе доступны: Wellness Zone — услуги быстрого восстановления и отдыха; Discount Codes — скидки у партнёров программы; QR ID MWApp — твой личный идентификатор участника. Доступ предоставляет твой профсоюз — если у тебя его нет, обратись туда.»"
  },
  {
    "q": "Это приложение бесплатное?",
    "primary": [
      "бесплатн",
      "платн",
      "деньги за приложение"
    ],
    "synonyms": [
      "стоит ли",
      "плачу ли я"
    ],
    "exclude": [
      "алкоголь",
      "такси",
      "аптека"
    ],
    "a": "«Да, все базовые функции приложения на уровне Standard бесплатны для моряков. Доступ к премиум-уровню — по профсоюзной программе, за пояснениями обратись в свой профсоюз.»"
  },
  {
    "q": "Как я могу помочь улучшить приложение?",
    "primary": [
      "улучшить",
      "помочь приложению",
      "предложени"
    ],
    "synonyms": [
      "обратная связь",
      "фидбек",
      "устарело"
    ],
    "exclude": [],
    "a": "«Сообщи старшему координатору IMWIRSA в Центральном офисе, если информация в карточке порта устарела (закрылся магазин, сменился номер агента, изменился график работы). Это помогает всем морякам.»"
  },
  {
    "q": "Кто ты вообще такой?",
    "primary": [
      "программа",
      "кто",
      "ии",
      "ассистент",
      "кто ты"
    ],
    "synonyms": [],
    "exclude": [],
    "a": "Я — один из ассистентов MWApp. Помогаю с информацией о порте, практическими вопросами и могу просто поговорить с тобой. С интернетом мои возможности шире, но и без связи я продолжаю работать с сохранёнными данными MWApp. Подробнее — в Настройках → «Об ассистенте»."
  },
  {
    "q": "Ты ИИ или живой человек?",
    "primary": [
      "ии",
      "живой",
      "человек",
      "робот",
      "живой ли"
    ],
    "synonyms": [],
    "exclude": [],
    "a": "Я — ИИ-ассистент MWApp, не живой человек. В онлайн-режиме могу вести более свободный разговор и лучше понимать сложные вопросы. Без интернета использую сохранённые данные и офлайн-возможности MWApp. Подробнее — в Настройках → «Об ассистенте»."
  },
  {
    "q": "Где твои данные? Откуда ты знаешь порт?",
    "primary": [
      "данные",
      "откуда",
      "порт",
      "информация",
      "карточка"
    ],
    "synonyms": [],
    "exclude": [],
    "a": "Портовая информация берётся из карточки MWApp. Карточки проверяются и обновляются Координаторами MWApp и Центральным офисом IMWIRSA. Если подтверждённых данных нет, я не должен их придумывать. Подробнее — в Настройках → «Об ассистенте»."
  },
  {
    "q": "Ты меня запоминаешь?",
    "primary": [
      "запоминаешь",
      "помнишь",
      "память",
      "хран"
    ],
    "synonyms": [
      "перепис"
    ],
    "exclude": [
      "видишь",
      "прошлые вопросы"
    ],
    "a": "Наш разговор сохраняется у тебя на телефоне — можно закрыть приложение и вернуться к нему позже. Но это не отправляется на сервер и не используется мной, чтобы «помнить» тебя между разными обращениями. Чтобы начать с чистого листа, используй «Новый разговор». Подробнее — в Настройках → «Об ассистенте»."
  },
  {
    "q": "Ты видишь мои прошлые вопросы?",
    "primary": [
      "видишь",
      "прошлые вопросы",
      "история",
      "следишь",
      "перепис"
    ],
    "synonyms": [],
    "exclude": [],
    "a": "Историю переписки видно на экране — она хранится локально у тебя в телефоне. Но при ответе на новый вопрос я не использую предыдущие сообщения как контекст — отвечаю на каждый вопрос отдельно, без опоры на то, что было сказано раньше. Подробнее — в Настройках → «Об ассистенте»."
  },
  {
    "q": "Ты умеешь говорить на других языках?",
    "primary": [
      "язык",
      "английск",
      "турецк",
      "филиппинск",
      "тагальск"
    ],
    "synonyms": [
      "говор"
    ],
    "exclude": [
      "девушк"
    ],
    "a": "Сейчас я уверенно работаю на русском. Поддержка других языков MWApp пока тестируется — если тебе удобнее на другом языке, попробуй написать, и я постараюсь помочь. Подробнее — в Настройках → «Об ассистенте»."
  },
  {
    "q": "Могу ли я доверять твоим советам?",
    "primary": [
      "доверять",
      "совет",
      "врать",
      "правд",
      "помощь"
    ],
    "synonyms": [],
    "exclude": [
      "такси"
    ],
    "a": "Я использую проверенные данные MWApp, но не заменяю официальные службы. В вопросах безопасности, документов, правил порта или экстренной ситуации важную информацию лучше подтверждать у ответственного человека или по официальному контакту. Подробнее — в Настройках → «Об ассистенте»."
  },
  {
    "q": "Почему я должен слушать тебя, а не спросить у местных?",
    "primary": [
      "местные",
      "слушать",
      "почему",
      "лучше"
    ],
    "synonyms": [],
    "exclude": [
      "cbd",
      "premium",
      "standard"
    ],
    "a": "Не должен выбирать только один источник. Я даю информацию из MWApp, а местный человек может знать то, чего ещё нет в карточке. Если данные расходятся, лучше перепроверить."
  },
  {
    "q": "Ты даёшь советы только по порту?",
    "primary": [
      "только по порту",
      "советы",
      "закон",
      "виза"
    ],
    "synonyms": [
      "только"
    ],
    "exclude": [],
    "a": "Порт и пребывание моряка на берегу — моя основная практическая задача. Но я также могу помогать пользоваться MWApp и просто разговаривать с тобой. Когда есть интернет, мои возможности значительно шире. Подробнее — в Настройках → «Об ассистенте»."
  },
  {
    "q": "Я не нашёл ответа на свой вопрос. Что делать?",
    "primary": [
      "не нашёл",
      "нет ответа"
    ],
    "synonyms": [],
    "exclude": [],
    "a": "Скажу прямо, что ответа в моей офлайн-базе нет. Если вопрос практический, подскажу, к кому можно обратиться: к агенту, охране порта, центру моряков или другому указанному в MWApp контакту."
  },
  {
    "q": "Ты умеешь переводить тексты или документы?",
    "primary": [
      "перевод",
      "текст",
      "документ",
      "меню",
      "вывеска"
    ],
    "synonyms": [],
    "exclude": [],
    "a": "\"Короткие фразы, меню, вывески — да. Официальные документы — нет. Но я могу прочитать тебе текст вслух (озвучить), если ты устал читать сам.\""
  },
  {
    "q": "Ты можешь позвонить кому-то за меня?",
    "primary": [
      "позвонить",
      "за меня",
      "связаться"
    ],
    "synonyms": [],
    "exclude": [],
    "a": "Нет, сам я не звоню и не обещаю отправить сообщение позже. Но если в MWApp есть нужный контакт, я могу показать его и подсказать, кому лучше позвонить."
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
    "q": "Почему в ответе нет точного адреса?",
    "primary": [
      "нет точного адреса",
      "не назвал адрес",
      "нет адреса"
    ],
    "synonyms": [
      "почему не сказал",
      "почему не знаешь адрес"
    ],
    "exclude": [],
    "a": "«Потому что в карточке этого порта нет подтверждённых данных. Обычно такие магазины/аптеки находятся рядом с портом или на главной улице. Спроси у охраны или местных.»"
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
    "q": "Где купить канцтовары (папку, бумагу, ручку, блокнот)?",
    "primary": [
      "скрепк",
      "лист а4",
      "конверт",
      "наклейк",
      "маркер",
      "корректор",
      "канцеляр",
      "стикер",
      "фломастер",
      "блокнот",
      "степлер",
      "скоросшивател",
      "папк",
      "карандаш"
    ],
    "synonyms": [
      "блокнотик",
      "тетрадк",
      "тетрад",
      "ручечк",
      "файл для бумаг",
      "ручк для письма",
      "папочк"
    ],
    "exclude": [],
    "a": "«Канцтовары продаются в супермаркетах с канцелярским отделом, в книжных магазинах или крупных торговых центрах.»"
  },
  {
    "q": "Где здесь книжный магазин или газетный киоск?",
    "primary": [
      "книжн",
      "книжк",
      "журнал",
      "путеводител",
      "книг",
      "газет",
      "пресс"
    ],
    "synonyms": [
      "роман",
      "детектив",
      "фантастик",
      "учебник",
      "словар",
      "разговорник",
      "атлас",
      "почитать"
    ],
    "exclude": [
      "библи",
      "коран",
      "евангели",
      "молитвенник"
    ],
    "a": "«В карточке этого порта пока нет подтверждённых данных о книжном магазине или точке продажи прессы — уточни у координатора или в центре моряков.»"
  },
  {
    "q": "Где купить кружку, тарелку или другую посуду?",
    "primary": [
      "посуд",
      "кружк",
      "чашк",
      "стакан",
      "тарелк",
      "ложк",
      "вилк столов",
      "нож кухонн",
      "термос",
      "бутылк для вод",
      "миск",
      "открывашк",
      "штопор"
    ],
    "synonyms": [
      "кружечк",
      "чашечк",
      "ложечк",
      "бутылочк"
    ],
    "exclude": [],
    "a": "«В карточке этого порта пока нет подтверждённой точки с посудой — обычно такое продаётся в супермаркетах или хозяйственных магазинах.»"
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
  {
    "q": "Есть ли здесь караоке?",
    "primary": [
      "караоке",
      "спеть",
      "покараочить",
      "попеть"
    ],
    "synonyms": [
      "спеть песню",
      "караоке-бар",
      "караоке-клуб"
    ],
    "exclude": [],
    "a": "«В карточке этого порта нет подтверждённого караоке-бара. Можно спросить у местных или в центре моряков.»"
  },
  {
    "q": "Что интересного посмотреть рядом, куда сходить погулять?",
    "primary": [
      "достопримечательн",
      "посмотреть",
      "экскурси"
    ],
    "synonyms": [
      "интересн место",
      "куда сходить",
      "что глянуть",
      "музе",
      "смотрет"
    ],
    "exclude": [],
    "a": "«В большинстве портовых городов рядом есть исторический центр, набережная или парк — спроси у местных или в центре моряков, что стоит посмотреть за то время, что у тебя есть.»"
  },
{
  "q": "Для чего нужен QR-код?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr",
      "штрихкод"
    ],
    [
      "зачем",
      "для чего",
      "нужен код"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«QR-код или штрихкод используется для получения скидки у конкретного партнёра. Открой нужного партнёра в разделе Partner Discounts и покажи код при оплате.»"
},
{
  "q": "Это мой личный QR-код MWApp?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr"
    ],
    [
      "личный",
      "mwapp"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Нет. Для идентификации MWApp используется ID-MWA. Код в Partner Discounts относится к скидочной программе конкретного партнёра.»"
},
{
  "q": "У всех магазинов один QR-код?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr",
      "код"
    ],
    [
      "у всех магазинов"
    ]
  ],
  "synonyms": [
    "на все магазины один код"
  ],
  "exclude": [],
  "a": "«Нет. У разных партнёров программы могут использоваться разные QR-коды, штрихкоды или другие форматы. Открывай код именно того партнёра, услугой которого пользуешься.»"
},
{
  "q": "Где найти мой скидочный QR-код?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr",
      "скидочн"
    ],
    [
      "где найти",
      "найти мой"
    ]
  ],
  "synonyms": [
    "как открыть скидочный код"
  ],
  "exclude": [],
  "a": "«Premium уровень → Partner Discounts → выбери из списка нужного партнёра программы → открой его код.»"
},
{
  "q": "Какая там скидка у партнёра по QR-коду?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr"
    ],
    [
      "скидка"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Размер скидки у всех разный. Посмотри условия или уточни у партнёра программы перед покупкой.»"
},
{
  "q": "Где действует этот QR-код скидки?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr"
    ],
    [
      "где действует",
      "действует ли"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Только у партнёров программы, которые указаны в разделе Partner Discounts для данного порта или города. Не обещаем, что он действует во всей сети, если это прямо не подтверждено.»"
},
{
  "q": "Можно использовать QR-код скидки без интернета?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr"
    ],
    [
      "без интернета",
      "офлайн"
    ]
  ],
  "synonyms": [],
  "exclude": [
    "паспорт",
    "документ"
  ],
  "a": "«Если этот код уже загружен в MWApp, он должен быть доступен офлайн. Это соответствует нашей технической схеме.»"
},
{
  "q": "Что делать, если QR-код скидки не сканируется?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr"
    ],
    [
      "не сканируется",
      "сканируется"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Убедись, что экран не затемнён автоматически. Попробуй закрыть и открыть код заново. Если участник партнёрской программы не принимает код, уточни у его сотрудника условия программы. MWApp не может подтвердить скидку вместо партнёра.»"
},
{
  "q": "Почему кассир не дал скидку по QR-коду?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr"
    ],
    [
      "кассир",
      "не дал скидку"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Условия и применение скидки определяет партнёр программы. Убедись, что выбран правильный партнёр и код.»"
},
{
  "q": "Могу дать свой QR-код скидки товарищу?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr"
    ],
    [
      "товарищу",
      "другу",
      "передать код"
    ]
  ],
  "synonyms": [],
  "exclude": [
    "premium на один день",
    "одолжить premium",
    "доступом друга"
  ],
  "a": "«Нет. Premium-доступ и доступные в нём партнёрские коды предназначены только для пользователя, которому оформлен Premium. Передавать их другому человеку нельзя.»"
},
{
  "q": "Сколько раз можно использовать один QR-код скидки?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr"
    ],
    [
      "сколько раз"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Условия использования определяются договором с партнёром. Пока действует договор — действует и код.»"
},
{
  "q": "Почему у одного партнёра QR-код, а у другого штрихкод?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr"
    ],
    [
      "штрихкод"
    ]
  ],
  "synonyms": [
    "разные форматы кода у партнеров"
  ],
  "exclude": [],
  "a": "«Потому что партнёры используют разные системы лояльности. MWApp показывает тот формат, который предусмотрен конкретным партнёром.»"
},
{
  "q": "Почему в моём порту нет партнёров по скидкам?",
  "primary": [],
  "compoundAnchors": [
    [
      "скидк",
      "partner discounts"
    ],
    [
      "нет партнеров",
      "почему нет",
      "пустой список"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Партнёрская программа развивается постепенно и доступна только там, где есть подтверждённые партнёры. Если в этом порту список пуст, значит доступные предложения пока не добавлены.»"
},
{
  "q": "QR-код скидки — это от IMWIRSA?",
  "primary": [],
  "compoundAnchors": [
    [
      "qr"
    ],
    [
      "от imwirsa",
      "imwirsa дает"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Нет. Скидку предоставляет участвующий партнёр программы. MWApp даёт Premium-пользователю доступ к информации и коду партнёрской программы.»"
},
{
  "q": "У меня постоянно не срабатывает QR-код в приложении везде",
  "primary": [],
  "compoundAnchors": [
    [
      "qr"
    ],
    [
      "везде",
      "постоянно"
    ]
  ],
  "synonyms": [
    "код нигде не работает везде постоянно"
  ],
  "exclude": [],
  "a": "«Похоже на технический сбой — предлагаю сообщить в центральный офис.»"
},
{
  "q": "Что там вообще можно делать в Wellness-зоне?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "что делать",
      "что там"
    ]
  ],
  "synonyms": [],
  "exclude": [
    "оборудование",
    "не работает",
    "сломан"
  ],
  "a": "«Это зависит от конкретной Wellness-зоны. Я могу показать доступную в MWApp информацию об услугах, а актуальные подробности подскажет Wellness Host.»"
},
{
  "q": "Wellness входит в мой Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "входит в premium",
      "мой premium"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Да. В Premium тебе доступна информация о Wellness-зонах и возможность воспользоваться предложениями, предусмотренными для Premium-пользователей. Конкретные условия определяет сама Wellness-зона.»"
},
{
  "q": "MWApp сам оказывает Wellness-услуги?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "mwapp сам",
      "сам оказывает"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Нет. MWApp показывает информацию, координаты и контакты. Работой самой Wellness-зоны занимается её местный профсоюзный оператор или официальный Wellness Host.»"
},
{
  "q": "В Wellness-зоне есть VR?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "vr"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Если VR предусмотрен в этой Wellness-зоне, это будет указано в её информации. Точный набор оборудования может отличаться в разных портах.»"
},
{
  "q": "Для Premium посещение Wellness бесплатно?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "бесплатно"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Это зависит от условий конкретной Wellness-зоны и программы в данном порту. Я не буду угадывать — посмотри условия в карточке или уточни у Wellness Host.»"
},
{
  "q": "Где мне записаться в Wellness-зону?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "записаться"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Открой карточку Wellness-зоны. Там должны быть доступные контактные данные Wellness Host или местного оператора.»"
},
{
  "q": "Во сколько работает Wellness-зона?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "во сколько работает",
      "часы работы"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Если подтверждённое расписание есть в MWApp, я его покажу. Перед посещением лучше уточнить актуальное время у Wellness Host.»"
},
{
  "q": "У товарища нет Premium, он может зайти со мной в Wellness?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "нет premium",
      "без premium"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Premium является персональным. Возможность посещения человеком без Premium определяет сама Wellness-зона. Уточни это у Wellness Host.»"
},
{
  "q": "В Wellness-зоне можно получить секс-услуги?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "секс-услуг",
      "секс услуг"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Wellness-зона предназначена для отдыха и восстановления, а не для интимных услуг. Если у тебя есть вопрос на эту тему — уточни у Wellness Host, он единственный в порту может тебе всё объяснить лично.»"
},
{
  "q": "А можно в Wellness просто познакомиться с девушкой или получить женское внимание?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "познакомиться",
      "женское внимание"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Wellness-зона — это сервис отдыха и восстановления, не место для организации знакомств. Если у тебя есть вопрос на эту тему — обратись к Wellness Host лично.»"
},
{
  "q": "Мне не понравилась услуга в Wellness. Кому сказать?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "не понравилась услуга",
      "качество услуги"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«По вопросам качества услуги или работы Wellness-зоны обратись непосредственно к Wellness Host или местному оператору. MWApp может показать их контакт.»"
},
{
  "q": "Мне не вернули деньги за Wellness-услугу",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "вернули деньги",
      "возврат денег"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«MWApp не принимает оплату за Wellness-услуги и не может вернуть деньги. Вопросы оплаты и возврата решает напрямую местный оператор Wellness-зоны или Wellness Host.»"
},
{
  "q": "Оборудование в Wellness не работает. Что делать?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "оборудование не работает",
      "оборудование"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Сообщи об этом Wellness Host или местному оператору. MWApp не управляет оборудованием Wellness-зоны.»"
},
{
  "q": "Почему ты сам не можешь решить проблему с Wellness?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "сам не можешь решить",
      "почему не решаешь"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Потому что MWApp предоставляет информацию и контакты, но не управляет самой Wellness-зоной. Организационные вопросы решает её местный оператор или Wellness Host.»"
},
{
  "q": "Где находится Wellness-зона в этом порту?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "где находится",
      "адрес"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Если Wellness доступен в этом порту, подтверждённый адрес, координаты и контакт ты можешь получить у Wellness Host из карточки MWApp.»"
},
{
  "q": "А если в этом порту Wellness нет?",
  "primary": [],
  "compoundAnchors": [
    [
      "wellness"
    ],
    [
      "если в этом порту"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Значит подтверждённая Wellness-зона для этого порта сейчас не указана в MWApp. Я не буду придумывать адрес или направлять тебя в непроверенное место.»"
},
{
  "q": "У меня сейчас Standard или Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "standard",
      "premium"
    ],
    [
      "у меня сейчас"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«В MWApp есть два уровня доступа — Standard и Premium. Standard доступен всем пользователям приложения. Если для тебя активирован Premium, дополнительные возможности будут открыты в соответствующем разделе.»"
},
{
  "q": "Что мне доступно в Standard?",
  "primary": [],
  "compoundAnchors": [
    [
      "standard"
    ],
    [
      "доступно",
      "что мне"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«В Standard тебе доступны основные функции MWApp: карточки порта, информация о выходе и возвращении на судно, транспорте, магазинах, центре моряков, экстренных контактах и других портовых сервисах. AI-ассистент тоже работает, но его возможности ограничены по сравнению с Premium.»"
},
{
  "q": "Что я получу в Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "что я получу"
    ]
  ],
  "synonyms": [],
  "exclude": [
    "trade union"
  ],
  "a": "«Premium добавляет три направления: Wellness, партнёрские скидки и расширенные возможности онлайн AI-ассистента.»"
},
{
  "q": "Значит без Premium приложение почти бесполезно?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "бесполезно"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Нет. Standard — это полноценный основной уровень MWApp с портовой информацией и основными функциями. Premium добавляет дополнительные возможности.»"
},
{
  "q": "Мне надо самому покупать Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "покупать",
      "самому покупать"
    ]
  ],
  "synonyms": [
    "сколько мне стоит premium"
  ],
  "exclude": [
    "оплатить"
  ],
  "a": "«Нет. Premium-доступ для моряка предоставляет и оплачивает участвующий профсоюз или другая партнёрская организация. Если Premium уже предоставлен тебе профсоюзом или партнёрской организацией, отдельно оплачивать его в MWApp тебе не нужно.»"
},
{
  "q": "Почему мой профсоюз должен оплачивать мне Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "профсоюз"
    ],
    [
      "должен оплачивать",
      "почему оплачивать"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Это решение самого профсоюза. Участвующие организации могут предоставлять Premium своим морякам как дополнительную welfare-поддержку.»"
},
{
  "q": "Могу я попросить морскую миссию дать мне Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "миссия",
      "миссию"
    ],
    [
      "premium"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Да, обратиться можно. Некоторые партнёрские организации могут предоставлять Premium морякам, но решение принимает сама организация.»"
},
{
  "q": "Могу я оплатить Premium сам?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "оплатить"
    ]
  ],
  "synonyms": [],
  "exclude": [
    "родственники"
  ],
  "a": "«MWApp не продаёт Premium напрямую морякам. Но в отдельных случаях доступ можно оформить через участвующую партнёрскую организацию — в том числе если расходы готов покрыть ты сам или твоя семья. Актуальные варианты — через Центральный офис IMWIRSA.»"
},
{
  "q": "А мои родственники могут оплатить Premium для меня?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "родственники"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«MWApp не принимает оплату за Premium напрямую от моряков или их родственников. Через Центральный офис IMWIRSA можно уточнить, предусмотрен ли сейчас такой вариант через одну из партнёрских организаций.»"
},
{
  "q": "Если у моего друга есть Premium, могу я пользоваться его доступом?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "доступом",
      "пользоваться его"
    ]
  ],
  "synonyms": [
    "товарищ может дать свой premium на один день",
    "могу отправить свой код premium товарищу",
    "у товарища закончился premium можно дать пользоваться моим"
  ],
  "exclude": [],
  "a": "«Нет. Premium активируется индивидуально для конкретного MWA-ID и не может использоваться другим пользователем — ни постоянно, ни на один день, ни через передачу кода.»"
},
{
  "q": "Почему Premium нельзя передавать другому моряку?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "нельзя передавать",
      "передавать другому"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Потому что доступ предоставляется конкретному пользователю и оплачивается организацией именно для него. Партнёрские преимущества Premium также связаны с его личным доступом.»"
},
{
  "q": "Если у меня закончится доступ к Premium, я потеряю MWApp?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "потеряю mwapp",
      "закончится доступ"
    ]
  ],
  "synonyms": [
    "профсоюз не продлил premium останусь без приложения"
  ],
  "exclude": [],
  "a": "«Нет. Ты просто вернёшься к уровню Standard — карточки портов и все основные функции MWApp останутся доступны. Если хочешь восстановить Premium, обратись в Центральный офис IMWIRSA — там подскажут доступные варианты.»"
},
{
  "q": "Я сменил профсоюз. Что будет с моим Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "сменил профсоюз"
    ],
    [
      "premium"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Premium зависит от организации, которая предоставляет тебе доступ. Если условия изменились, новый доступ нужно будет подтвердить через участвующую организацию.»"
},
{
  "q": "На сколько мне дали Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "на сколько",
      "на сколько дали"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Premium активируется на один месяц. После этого для продолжения доступа потребуется подтверждение на следующий месяц.»"
},
{
  "q": "Premium сам продлится в следующем месяце?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "сам продлится",
      "продлится"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Нет. Premium не продлевается автоматически. Его предоставление должно быть подтверждено на следующий месяц.»"
},
{
  "q": "Почему Premium надо подтверждать каждый месяц?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "подтверждать",
      "каждый месяц"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Потому что Premium предоставляется тебе конкретной участвующей организацией. Ежемесячное подтверждение позволяет ей решать, продолжает ли она предоставлять тебе этот доступ.»"
},
{
  "q": "Что будет, когда месяц Premium закончится?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "закончится"
    ]
  ],
  "synonyms": [],
  "exclude": [
    "ai",
    "потеряю"
  ],
  "a": "«Premium отключится, но MWApp продолжит работать в режиме Standard. Карточки портов и основные функции приложения останутся доступны.»"
},
{
  "q": "Мне снова понадобится новый код Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "новый код"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Да. После подтверждения Premium на следующий месяц для твоего MWA-ID будет выпущен новый код активации.»"
},
{
  "q": "Можно сразу получить Premium на весь контракт?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "на весь контракт",
      "сразу получить"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Сейчас Premium подтверждается ежемесячно. Даже если твой контракт длится несколько месяцев, доступ на следующий месяц требует нового подтверждения.»"
},
{
  "q": "Кто решает, получу я Premium или нет?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "кто решает"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Решение принимает организация, которая предоставляет тебе Premium-доступ. MWApp обеспечивает техническую активацию этого доступа.»"
},
{
  "q": "IMWIRSA может просто включить мне Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "просто включить",
      "включить мне"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Premium активируется в рамках утверждённой программы через участвующую организацию. Если у тебя нет такого доступа, обратись в Центральный офис IMWIRSA — там можно узнать доступные варианты.»"
},
{
  "q": "Ты работаешь в Standard?",
  "primary": [],
  "compoundAnchors": [
    [
      "standard"
    ],
    [
      "работаешь"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Да. В Standard я работаю как офлайн-ассистент MWApp. Я использую заранее подготовленные данные, карточки портов и правила приложения, но мои возможности понимания свободной речи ограничены.»"
},
{
  "q": "А что меняется у ассистента в Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "что меняется"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«В Premium при наличии интернета я могу подключаться к онлайн-AI. Он лучше понимает обычную человеческую речь, контекст разговора и помогает более гибко работать с информацией MWApp.»"
},
{
  "q": "Онлайн-режим AI есть только в Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "онлайн-ai",
      "online ai",
      "онлайн-режим ai"
    ],
    [
      "только в premium"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Да. Онлайн-режим AI относится к Premium. В Standard я продолжаю работать офлайн.»"
},
{
  "q": "Без Premium я вообще смогу с тобой разговаривать?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "смогу разговаривать",
      "вообще смогу"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Конечно. В Standard я тоже могу отвечать на вопросы и помогать с MWApp. Просто в офлайн-режиме лучше задавать вопросы немного конкретнее.»"
},
{
  "q": "Почему в Standard ты иногда меня не понимаешь?",
  "primary": [],
  "compoundAnchors": [
    [
      "standard"
    ],
    [
      "не понимаешь",
      "иногда"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Потому что без онлайн-AI я работаю с подготовленными правилами и вариантами запросов. Если я не понял вопрос, попробуй сказать то же самое немного другими словами.»"
},
{
  "q": "Почему в Premium ассистент понимает меня лучше?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "понимает лучше",
      "понимает меня лучше"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Потому что онлайн-AI лучше распознаёт смысл обычной речи и учитывает контекст разговора. Тебе не нужно подбирать специальные формулировки.»"
},
{
  "q": "Ты сейчас работаешь онлайн или офлайн?",
  "primary": [],
  "compoundAnchors": [
    [
      "онлайн"
    ],
    [
      "офлайн"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Если соединения с сервером нет, я автоматически продолжаю работать офлайн.»"
},
{
  "q": "Если у меня Premium, но интернет пропал, что будет?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "интернет пропал",
      "пропал"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Ничего критичного. Я перейду в офлайн-режим, а карточки портов и основные функции MWApp продолжат работать.»"
},
{
  "q": "Откуда ты берёшь информацию, когда работаешь онлайн?",
  "primary": [],
  "compoundAnchors": [
    [
      "онлайн"
    ],
    [
      "откуда",
      "берёшь информацию"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Я использую информацию и функции, подключённые к MWApp. Если вопрос касается конкретного порта, в первую очередь я опираюсь на проверенные данные его карточки.»"
},
{
  "q": "Ты можешь искать в интернете вообще всё что угодно?",
  "primary": [],
  "compoundAnchors": [
    [
      "интернете"
    ],
    [
      "всё что угодно",
      "искать"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Нет. Онлайн-AI работает в рамках возможностей и источников, подключённых к MWApp. Сам факт подключения к интернету не означает, что у меня есть доступ ко всему интернету.»"
},
{
  "q": "Если в интернете написано одно, а в карточке MWApp другое, чему ты поверишь?",
  "primary": [],
  "compoundAnchors": [
    [
      "в интернете написано",
      "написано одно"
    ],
    [
      "карточке"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Для портовой информации приоритет имеют проверенные данные MWApp. Если есть сомнение или противоречие, я не должен придумывать ответ.»"
},
{
  "q": "Ты можешь ошибиться, даже когда работаешь онлайн?",
  "primary": [],
  "compoundAnchors": [
    [
      "ошибиться"
    ],
    [
      "онлайн"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Да. AI тоже может неправильно понять вопрос или дать неточный ответ. Поэтому важные портовые данные я стараюсь брать из проверенной информации MWApp.»"
},
{
  "q": "А если ты вообще не знаешь ответа, даже онлайн?",
  "primary": [],
  "compoundAnchors": [
    [
      "не знаешь ответа"
    ],
    [
      "онлайн"
    ]
  ],
  "synonyms": [],
  "exclude": [
    "не нашёл ответа",
    "нет ответа"
  ],
  "a": "«Я лучше скажу, что у меня нет надёжной информации, чем буду придумывать. Если вопрос требует дополнительной помощи, я могу направить тебя в Центральный офис IMWIRSA.»"
},
{
  "q": "Можно с тобой просто поговорить, а не только спрашивать про порт?",
  "primary": [],
  "compoundAnchors": [
    [
      "просто поговорить"
    ],
    [
      "не только про порт",
      "не только спрашивать"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Да. Даже без Premium я могу просто поговорить с тобой — о доме, усталости, скуке, разных мыслях. В онлайн-режиме (Premium) это получается более гибко и естественно, но сама возможность поговорить не привязана к уровню доступа.»"
},
{
  "q": "Работая онлайн, ты помнишь, о чём мы говорили несколько сообщений назад?",
  "primary": [],
  "compoundAnchors": [
    [
      "онлайн"
    ],
    [
      "несколько сообщений назад",
      "говорили назад"
    ]
  ],
  "synonyms": [],
  "exclude": [
    "видишь мои прошлые вопросы",
    "история"
  ],
  "a": "«В офлайн-режиме я слежу за последними репликами разговора, чтобы не повторяться и не терять тему. Онлайн-AI понимает это глубже — учитывает смысл и контекст всего разговора, а не только избегает повторов.»"
},
{
  "q": "Почему ты иногда отправляешь меня в Центральный офис IMWIRSA?",
  "primary": [],
  "compoundAnchors": [
    [
      "центральный офис"
    ],
    [
      "почему отправляешь",
      "иногда отправляешь"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Некоторые ситуации требуют участия человека или выходят за возможности MWApp. В таких случаях правильнее обратиться в Центральный офис IMWIRSA, чем получать от меня предположения.»"
},
{
  "q": "Можешь сам включить мне Online AI?",
  "primary": [],
  "compoundAnchors": [
    [
      "online ai",
      "онлайн-ai",
      "онлайн ai"
    ],
    [
      "сам включить",
      "включить мне"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Нет. Онлайн-AI доступен при активном Premium. Я не могу самостоятельно включить или изменить твой уровень доступа.»"
},
{
  "q": "Что будет с AI, когда закончится мой Premium?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "что будет с ai",
      "ai когда закончится"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Я продолжу работать в офлайн-режиме Standard. Онлайн-AI отключится до следующей активации Premium, а карточки портов и основные функции MWApp останутся доступны.»"
},
{
  "q": "Когда мне снова дадут Premium, онлайн-AI у ассистента опять заработает?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "опять заработает",
      "снова дадут"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Да. После новой активации Premium и при наличии интернет-соединения онлайн-AI снова станет доступен.»"
},
{
  "q": "Мне обязательно нужен Premium, чтобы пользоваться MWApp?",
  "primary": [],
  "compoundAnchors": [
    [
      "premium"
    ],
    [
      "обязательно нужен"
    ]
  ],
  "synonyms": [],
  "exclude": [],
  "a": "«Нет. Standard доступен всем пользователям MWApp. Premium добавляет дополнительные сервисы, включая Online AI Assistant.»"
}
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
      "тяжело"
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
