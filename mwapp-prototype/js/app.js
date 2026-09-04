// ============================================================
// MWApp prototype — vanilla JS state machine, no build step.
// ============================================================

// Visual identity only — name/tag/greet text lives in js/i18n.js so it can be
// translated per language. Use getAssistant(id) (defined in i18n.js) to get an
// assistant merged with its translated text fields.
// Cache-busting: the avatar PNGs were reprocessed (recropped to a uniform
// scale, Grace's logo fixed) on 2026-08-14, but their filenames stayed the
// same — some browsers/edges keep serving the old bytes at an unchanged URL
// until it changes. Bump AVATAR_V any time these files are replaced again.
const AVATAR_V = 2;
const ASSISTANTS = {
  alex:   { id: "alex",   icon: "⚓", grad: ["#0D6E8A", "#0A5A72"], accent: "#29C5FF", photo: `assets/avatars/alex.png?v=${AVATAR_V}`,   photos: [`assets/avatars/alex.png?v=${AVATAR_V}`] },
  omar:   { id: "omar",   icon: "🧭", grad: ["#1B3A6B", "#B8860B"], accent: "#2AD9A8", photo: `assets/avatars/omar.png?v=${AVATAR_V}`,   photos: [`assets/avatars/omar.png?v=${AVATAR_V}`] },
  sophia: { id: "sophia", icon: "⭐", grad: ["#5DD3F0", "#0D6E8A"], accent: "#B15CFF", photo: `assets/avatars/sophia.png?v=${AVATAR_V}`, photos: [`assets/avatars/sophia.png?v=${AVATAR_V}`] },
  grace:  { id: "grace",  icon: "🌙", grad: ["#E8523A", "#B8860B"], accent: "#FFA83D", photo: `assets/avatars/grace.png?v=${AVATAR_V}`,  photos: [`assets/avatars/grace.png?v=${AVATAR_V}`] },
};
const LANGUAGES = [
  { code: "en", flag: "🇬🇧", label: "English", accent: "#29C5FF" },
  { code: "ru", flag: "🇷🇺", label: "Русский", accent: "#2AD9A8" },
  { code: "tr", flag: "🇹🇷", label: "Türkçe", accent: "#FF4D6D" },
  { code: "fil", flag: "🇵🇭", label: "Filipino", accent: "#FFA83D" },
];

// Placeholder used for fields curators haven't filled in yet via the PWM Telegram bot.
const TBD = "Details coming soon from the port curator";

// ---- SUB-DETAILS (Level 3) --------------------------------------------
// Rendered by openSubDetail(), which walks a fixed block order:
//   hours → groups → contacts → directions → maps → schedule → qr → note → updated
// A subdetail only needs the fields it actually uses; missing blocks are skipped.
const SUBDETAILS = {

  // ── UNIVERSAL — same content on every port, not port-specific data ──
  currency_exchange_safety: {
    title: "Currency Exchange",
    callout: { tone: "warn", text: "Never exchange money on the street, even for a good rate someone offers you. In some countries this is a criminal offence — and it's one of the most common ways seafarers get scammed near a port." },
    sections: [
      { icon: "🚩", title: "Red flags — walk away", rows: [
        { icon: "🗣", title: "A stranger offers you a better rate", sub: "On the street, at the gate, or \"just around the corner\" — always a scam" },
        { icon: "🚗", title: "Being asked to go somewhere private", sub: "A car, a back room, an alley — a legitimate exchange never needs this" },
        { icon: "🧾", title: "No receipt offered", sub: "A real exchange always gives you a printed receipt with the rate used" },
        { icon: "🔢", title: "Know the rough official rate first", sub: "Check on your phone before you go — so you can spot a bad deal immediately" },
        { icon: "🧮", title: "Count what you receive, before you walk away", sub: "In front of the person who gave it to you, not after" },
      ]},
      { icon: "🏦", title: "Where to Exchange", rows: [
        { icon: "🏦", title: "A bank or licensed exchange office", sub: "Specific addresses for this terminal are still being confirmed by the coordinator" },
        { icon: "🏧", title: "An ATM", sub: "Usually the safest option where available — official bank rate, no one to negotiate with" },
      ]},
    ],
    note: "This terminal's coordinator hasn't confirmed specific exchange addresses yet — once they do, this page will list the checked options directly.",
  },



  // ── TALLINN · TRANSPORT ────────────────────────────────────────────
  // "Leaving the Port" is the single most-asked question ashore and also the
  // riskiest to state as fact — a wrong gate or document rule can strand a
  // seafarer at the checkpoint. So it carries `updated` (provenance line) and



  // ── TALLINN · CITY LIFE ────────────────────────────────────────────
  // Static places only — no timed walking routes and no live event feed.
  // Both were deliberately dropped: a route implies the app has worked out
  // that the seafarer will be back before the ship sails, which we cannot


  // ── TALLINN · SPIRITUAL CARE ───────────────────────────────────────
  // Static contacts only. No built-in chat with anyone outside IMWIRSA:
  // that would create a second escalation path around the Coordinator.
  // The neutral "no particular faith" row is kept first on the level-2
  // list, because a seafarer who simply wants a human conversation should


  // ── MUUGA HARBOUR · SEAFARERS' CENTRE ──────────────────────────────
  // Unlike Vanasadam, the real centre building is physically here — this is




  // ── MUUGA HARBOUR · SPIRITUAL CARE ──────────────────────────────────
  // Unlike Vanasadam, the Estonian Seamen's Mission chapel is physically


  // hamburg_centre_about removed 13 August 2026 — Hamburg split into four
  // real terminals (EUROGATE, HHLA CTA Altenwerder, Cruise Center Steinwerder,
  // Cruise Center Altona) with verified data from the coordinator's
  // questionnaire; see data/hamburg-*.json. This placeholder was a guess
  // from before the questionnaire came back and is now superseded.
  // constanta_centre_about removed 12 August 2026 — Constanța split into two
  // real terminals (constanta-south / constanta-north) with verified data
  // from the coordinator's questionnaire; see data/constanta-south.json and
  // data/constanta-north.json. This placeholder contact info was a guess
  // from before the questionnaire came back and is now superseded.

  // Pattern for future ports: duplicate this object as wellness_zone_{portId}
  // once a real cabin is confirmed there (e.g. wellness_zone_hamburg). Until
  // then, that port's "wellness" row in its own Level-2 skeleton stays a
  // single PENDING row — see e.g. Hamburg below — so nothing here needs to
  // Psychological Support as a Premium service was dropped entirely on
  // 7 August 2026 — union legal advice: a real, licensed psychologist could
  // plausibly be found and vetted for one port like Tallinn, but doing this
  // safely at scale across many ports and jurisdictions carries real
  // liability risk, and IMWIRSA isn't positioned to carry it. If revisited,


};

// ---- Level-2 skeletons -------------------------------------------------
// Rows marked pending:true are shown greyed and are NOT clickable — the third
// level behind them opens only once a port curator fills it in via the PWM
// Telegram bot. Deliberately NOT the 🔒 lock icon: that means "needs a Trade
// Union card", and reusing it here would send seafarers to ask about cards.
const PENDING = (icon, title, sub) => ({ icon, title, sub, pending: true });

function transportSkeleton(realShuttleSd) {
  return {
    title: "Transport",
    rows: [
      PENDING("🚪", "Leaving the Port", "Exit rules, required documents, gate information"),
      realShuttleSd
        ? { icon: "🚐", title: "Port Shuttle", sub: "Timetable, pickup point, how to recognise it", action: "›", sd: realShuttleSd }
        : PENDING("🚐", "Port Shuttle", "Timetable, pickup point, how to recognise it"),
      PENDING("🚕", "Taxi", "Trusted companies, apps, estimated fare, safety tips"),
      PENDING("🚎", "Public Transport", "Nearest stop, routes, tickets, journey to the city"),
    ],
  };
}
function shopsSkeleton() {
  return {
    title: "Shops & Food",
    rows: [
      { icon: "💱", title: "Currency Exchange", sub: "How to exchange money safely — read this first, before you need it", action: "›", sd: "currency_exchange_safety" },
      PENDING("🛒", "Supermarkets", "Nearest stores, shopping centres, 24/7 shops"),
      PENDING("🍽", "Food & Drinks", "Fast food, local restaurants, seafarer-friendly places"),
      PENDING("📱", "Electronics & SIM Cards", "Mobile operators, SIM cards, chargers & adapters"),
      PENDING("💊", "Pharmacies", "Nearest and 24/7 pharmacies, prescription & OTC medicines"),
      PENDING("🎁", "Souvenirs", "Where to find something to take home"),
      PENDING("⚓", "Seafarer Supplies", "Workwear, safety gear, ship's stores"),
    ],
  };
}
function citylifeSkeleton() {
  return {
    title: "City Life",
    rows: [
      PENDING("🌳", "Parks & Waterfronts", "Nearest park, promenade, quiet green zone, viewpoints"),
      PENDING("🏛", "Culture & Must-See", "Top 5 city places, museums, historic buildings"),
      PENDING("🧘", "Free Time & Relax", "Free attractions, viewpoints, Wi-Fi & chill spots"),
      PENDING("🛡", "Safety", "What to know before going into the city"),
      // "What can I do right after the gate?" (rows above) vs. "Where do I go
      // if I have more time?" (this one) — deliberately last in the list, and
      // filled from the questionnaire's shared Part 7 "City Centre" section
      // (one submission per city, not per terminal — see port-questionnaire.html),
      // never redone per-terminal like the rows above it.
      PENDING("🏙", "City Centre", "Where to go, shop & explore"),
    ],
  };
}
function spiritualSkeleton() {
  return {
    title: "Spiritual Care",
    rows: [
      // Available in every port regardless of curator data: wanting to talk to
      // someone doesn't depend on which missions a port has registered yet.
      { icon: "💬", title: "No particular faith — I'd just like to talk", sub: "Speak with your assistant, who can bring in the IMWIRSA Coordinator", action: "›", go: "assistantchat" },
      PENDING("🕊", "Missions & Chaplains", "Seafarers' missions, chaplains and local contacts"),
      PENDING("🙏", "Places for Prayer", "Prayer rooms, quiet places, opening hours"),
    ],
  };
}

// ---- PORTS --------------------------------------------------------------
// Data unit is the TERMINAL, not the city — a city can have several
// physically distinct terminals (Tallinn: Vanasadam + Muuga Harbour;
// Saint Petersburg would be 6+; Hamburg is effectively its own small
// country). City is kept on every terminal's meta as a mandatory
// "umbrella" field for recognisability, never as the lookup key itself.
// Key format: "{city-slug}-{terminal-slug}", stable even for ports that
// currently have only one known terminal, so a future split never
// requires renaming an existing key — only adding a new one.
//
// "Vanasadam, Tallinn" — the combined terminal+city label the seafarer
// sees everywhere a location is named. Falls back to just the city once a
// port has only one terminal and that terminal has no name of its own
// distinct from the city (nothing to disambiguate yet).
function portDisplayName(port) {
  const { terminal, city } = port.meta;
  return terminal && terminal !== city ? `${terminal}, ${city}` : city;
}

const PORTS = {
  "tallinn-vanasadam": {
    meta: { flag: "🇪🇪", terminal: "Vanasadam", city: "Tallinn", country: "Estonia", tz: "UTC+3", lat: 59.4451, lng: 24.7654 },
    categories: null, // loaded lazily from data/tallinn-vanasadam.json — see ensurePortContentLoaded()
  },

  // Second Tallinn terminal — cargo/Ro-Ro harbour ~17 km east of Vanasadam.
  // Field-verified by an IMWIRSA volunteer on 5 August 2026 — this is the
  // terminal where the real Seafarers' Centre building actually stands
  // (Estonian Seamen's Mission, Altmetsa tee 1), unlike Vanasadam, which has
  // no centre of its own and instead sits directly in central Tallinn.
  // Coordinates below are Gate 1 / Peavärav, from the questionnaire —
  // more precise than the general-harbour estimate used before verification.
  "tallinn-muuga": {
    meta: { flag: "🇪🇪", terminal: "Muuga Harbour", city: "Tallinn", country: "Estonia", tz: "UTC+3", lat: 59.4925, lng: 24.9540 },
    categories: null, // loaded lazily from data/tallinn-muuga.json — see ensurePortContentLoaded()
  },

  // Constanța split into two real terminals on 12 August 2026, replacing the
  // old single "constanta-main" skeleton — the coordinator's questionnaire
  // showed the South Port (Agigea) and North Port are practically two
  // different worlds for a seafarer (shuttle-only vs. walk-into-town), so
  // they need separate entries rather than one shared skeleton. Full data
  // loaded lazily from data/constanta-south.json and data/constanta-north.json.
  "constanta-south": {
    meta: { flag: "🇷🇴", terminal: "South Port / Agigea", city: "Constanța", country: "Romania", tz: "UTC+3", lat: 44.0953, lng: 28.6369 },
    categories: null, // loaded lazily from data/constanta-south.json — see ensurePortContentLoaded()
  },
  "constanta-north": {
    meta: { flag: "🇷🇴", terminal: "North Port", city: "Constanța", country: "Romania", tz: "UTC+3", lat: 44.1706, lng: 28.6588 },
    categories: null, // loaded lazily from data/constanta-north.json — see ensurePortContentLoaded()
  },

  // Hamburg split into four real terminals on 13 August 2026, replacing the
  // old single "hamburg-main" skeleton — the coordinator's questionnaire
  // covered two container terminals (EUROGATE, HHLA CTA Altenwerder — both
  // walk-free, shuttle-only, industrial Waltershof/Altenwerder side) and two
  // cruise terminals (Steinwerder, Altona — both walkable, Altona especially
  // so, right on the Große Elbstraße waterfront). Full data loaded lazily
  // from data/hamburg-*.json.
  "hamburg-eurogate": {
    meta: { flag: "🇩🇪", terminal: "EUROGATE Container Terminal", city: "Hamburg", country: "Germany", tz: "UTC+2", lat: 53.518611, lng: 9.932222 },
    categories: null, // loaded lazily from data/hamburg-eurogate.json — see ensurePortContentLoaded()
  },
  "hamburg-cta": {
    meta: { flag: "🇩🇪", terminal: "HHLA CTA Altenwerder", city: "Hamburg", country: "Germany", tz: "UTC+2", lat: 53.502778, lng: 9.934722 },
    categories: null, // loaded lazily from data/hamburg-cta.json — see ensurePortContentLoaded()
  },
  "hamburg-steinwerder": {
    meta: { flag: "🇩🇪", terminal: "Cruise Center Steinwerder", city: "Hamburg", country: "Germany", tz: "UTC+2", lat: 53.5386, lng: 9.9686 },
    categories: null, // loaded lazily from data/hamburg-steinwerder.json — see ensurePortContentLoaded()
  },
  "hamburg-altona": {
    meta: { flag: "🇩🇪", terminal: "Cruise Center Altona", city: "Hamburg", country: "Germany", tz: "UTC+2", lat: 53.5462, lng: 9.9375 },
    categories: null, // loaded lazily from data/hamburg-altona.json — see ensurePortContentLoaded()
  },

  // Field-verified by the IMWIRSA Istanbul coordinator, 10 August 2026 — this
  // is one of three Istanbul terminals in the same submission (see Ambarlı
  // and Galataport below). Still genuinely thin — most of what's here is
  // "not found yet" from the coordinator, marked honestly rather than guessed.
  "istanbul-haydarpasa": {
    meta: { flag: "🇹🇷", terminal: "Haydarpaşa", city: "Istanbul", country: "Türkiye", tz: "UTC+3", lat: 41.0053, lng: 29.0194 },
    categories: null, // loaded lazily from data/istanbul-haydarpasa.json — see ensurePortContentLoaded()
  },
  "istanbul-ambarli": {
    meta: { flag: "🇹🇷", terminal: "Ambarlı Port Complex", city: "Istanbul", country: "Türkiye", tz: "UTC+3", lat: 40.9682, lng: 28.6811 },
    categories: null, // loaded lazily from data/istanbul-ambarli.json — see ensurePortContentLoaded()
  },
  "istanbul-galataport": {
    meta: { flag: "🇹🇷", terminal: "Galataport Cruise Terminal", city: "Istanbul", country: "Türkiye", tz: "UTC+3", lat: 41.0256, lng: 28.9821 },
    categories: null, // loaded lazily from data/istanbul-galataport.json — see ensurePortContentLoaded()
  },

  // ── GEORGIA · BATUMI ────────────────────────────────────────────────
  // Field-verified by the IMWIRSA Georgia coordinator, 7 August 2026.
  // The Seafarers' Centre is CURRENTLY CLOSED FOR RENOVATION — flagged
  // prominently rather than silently listing normal hours. No reopening
  // date given yet; update batumi_centre_about once one is confirmed.
  "batumi-main": {
    meta: { flag: "🇬🇪", terminal: "Batumi", city: "Batumi", country: "Georgia", tz: "UTC+4", lat: 41.651979, lng: 41.643751 },
    categories: null, // loaded lazily from data/batumi-main.json — see ensurePortContentLoaded()
  },

  // ── GEORGIA · POTI ──────────────────────────────────────────────────
  // Field-verified by the IMWIRSA Georgia coordinator, 7 August 2026.
  "poti-main": {
    meta: { flag: "🇬🇪", terminal: "Poti", city: "Poti", country: "Georgia", tz: "UTC+4", lat: 42.1462, lng: 41.6710 },
    categories: null, // loaded lazily from data/poti-main.json — see ensurePortContentLoaded()
  },

  // ── LITHUANIA · KLAIPĖDA ────────────────────────────────────────────
  // Submitted 8 August 2026 at partial completion, by design — the
  // coordinator is still tracking down centre phone numbers, transport
  // details and city-life content, and will resubmit as it's found. Per
  // Andrey's 8 Aug decision: waiting for a "complete" submission before
  // publishing anything discourages coordinators mid-effort more than it
  // protects anyone, since nothing here is yet shown to real seafarers.
  // Before this goes live for real use, re-verify everything currently
  // marked PENDING or "not found" below — do not assume it got filled in
  // just because the port appears in the app.
  "klaipeda-passenger": {
    meta: { flag: "🇱🇹", terminal: "Passenger Terminal", city: "Klaipėda", country: "Lithuania", tz: "UTC+3", lat: 55.7061, lng: 21.1278 },
    categories: null, // loaded lazily from data/klaipeda-passenger.json — see ensurePortContentLoaded()
  },
  "klaipeda-kn-energies": {
    meta: { flag: "🇱🇹", terminal: "KN Energies Oil Terminal", city: "Klaipėda", country: "Lithuania", tz: "UTC+3", lat: 55.7332, lng: 21.1025 },
    categories: null, // loaded lazily from data/klaipeda-kn-energies.json — see ensurePortContentLoaded()
  },
};

function currentPort() { return PORTS[state.portId] || PORTS["tallinn-vanasadam"]; }

// ---- Lazy port content loading -------------------------------------------
// Full port content (categories + their subdetail cards) used to be baked
// directly into this file for every port, which meant every phone downloaded
// every terminal's data on first load — fine for 5 terminals, not fine once
// the catalog grows toward the planned 95. Ports with categories: null here
// instead fetch their content from data/{portId}.json the first time it's
// actually needed (when the seafarer opens a category), and the result is
// cached in memory for the rest of the session. The Service Worker then
// caches that JSON on disk too, so a port already visited stays available
// offline — just not preloaded before it's ever opened.
//
// This only needed to touch two functions in the whole rendering pipeline:
// currentCategories() (below) and openDetail() (which now awaits the fetch
// before building its screen). Nothing else — including updateAssistantUI(),
// the home screen, Settings — ever reads .categories, only .meta, so none of
// that needed to change at all.
const PORT_CONTENT_CACHE = {};

async function ensurePortContentLoaded(portId) {
  const port = PORTS[portId];
  if (!port) return null;
  if (port.categories) return port.categories; // no remaining inline-skeleton ports as of 13 Aug 2026 — every port now loads from data/*.json
  if (PORT_CONTENT_CACHE[portId]) return PORT_CONTENT_CACHE[portId].categories;

  const res = await fetch(`data/${portId}.json`);
  if (!res.ok) throw new Error(`Failed to load port data for ${portId}`);
  const data = await res.json();

  // Merge this port's subdetail cards into the global SUBDETAILS lookup so
  // the existing SUBDETAILS[key] access in openDetail()'s statusFrom check
  // and in openSubDetail() keeps working completely unchanged.
  Object.assign(SUBDETAILS, data.subdetails || {});
  PORT_CONTENT_CACHE[portId] = data;
  return data.categories;
}

function currentCategories() {
  const port = currentPort();
  if (port.categories) return port.categories; // inline skeleton port
  const cached = PORT_CONTENT_CACHE[state.portId];
  return cached ? cached.categories : null;
}

// ---- Opening-hours status ------------------------------------------------
// Computes "Open until 20:00" / "Closed · opens 09:00" from an hours table,
// rather than storing a hardcoded status string that silently goes stale.
// hours rows are ordered Monday-first; JS getDay() is Sunday-first, hence the shift.
function todayHoursIndex() { return (new Date().getDay() + 6) % 7; }

function computeStatus(hours) {
  if (!hours || !hours.length) return null;
  const row = hours[todayHoursIndex()];
  if (!row) return null;
  const m = String(row[1]).match(/(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})/);
  if (!m) return { open: false, text: row[1] };
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const from = (+m[1]) * 60 + (+m[2]);
  const to = (+m[3]) * 60 + (+m[4]);
  if (mins >= from && mins < to) return { open: true, text: t("status.openUntil", { time: `${m[3]}:${m[4]}` }) };
  if (mins < from) return { open: false, text: t("status.closedOpensAt", { time: `${m[1]}:${m[2]}` }) };
  return { open: false, text: t("status.closedForToday") };
}

// ---- Geolocation — nearest-port detection ---------------------------------
// Privacy design: raw coordinates are used only in-memory, for the duration of
// a single calculation, and are never written to state, localStorage, or sent
// anywhere over the network. Only the *result* (which port, how far) is kept.
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestPort(lat, lng) {
  let best = null;
  for (const id of Object.keys(PORTS)) {
    const m = PORTS[id].meta;
    if (typeof m.lat !== "number" || typeof m.lng !== "number") continue;
    const d = haversineKm(lat, lng, m.lat, m.lng);
    if (!best || d < best.distanceKm) best = { portId: id, distanceKm: d };
  }
  return best;
}

const AT_PORT_RADIUS_KM = 3;

function requestLocation(onDone) {
  if (!("geolocation" in navigator)) { onDone(false); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords; // used only here, never persisted
      const nearest = nearestPort(latitude, longitude);
      if (nearest) {
        state.portId = nearest.portId;
        state.context = nearest.distanceKm <= AT_PORT_RADIUS_KM ? "at_port" : "in_city";
        updateAssistantUI();
      }
      onDone(true);
    },
    () => { onDone(false); },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
  );
}

// ---- Ship location — mark exit point, navigate back -----------------------
function mapsUrl(lat, lng) {
  const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isIOSDevice
    ? `https://maps.apple.com/?daddr=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function formatShipTimestamp(ts) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return sameDay ? `${t("ship.markedToday") || "Today"}, ${time}` : `${d.toLocaleDateString()}, ${time}`;
}

function renderShipScreen() {
  const noPointEl = document.getElementById("shipNoPoint");
  const hasPointEl = document.getElementById("shipHasPoint");
  const errorEl = document.getElementById("shipError");
  if (!noPointEl || !hasPointEl) return;
  errorEl.classList.add("hidden");
  if (state.shipPoint) {
    noPointEl.classList.add("hidden");
    hasPointEl.classList.remove("hidden");
    document.getElementById("shipMarkedTime").textContent = formatShipTimestamp(state.shipPoint.ts);
  } else {
    noPointEl.classList.remove("hidden");
    hasPointEl.classList.add("hidden");
  }
}

function shipMarkLocation() {
  const errorEl = document.getElementById("shipError");
  const btn = document.getElementById("shipMarkBtn");
  if (!("geolocation" in navigator)) { errorEl.classList.remove("hidden"); return; }
  if (btn) btn.disabled = true;

  const done = (pos) => {
    state.shipPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now() };
    saveState();
    if (btn) btn.disabled = false;
    renderShipScreen();
  };
  const fail = () => {
    if (btn) btn.disabled = false;
    errorEl.classList.remove("hidden");
  };

  // A precise GPS fix is what we want — the whole point is finding one gate
  // among several. But alongside a steel hull, or inside a terminal, that fix
  // can take far longer than the timeout, and iOS then reports a plain error
  // rather than falling back on its own. So: try for accuracy first, and if it
  // doesn't arrive, take the coarse network fix rather than giving the seafarer
  // nothing. A rough point still beats no point when you're looking for the ship.
  navigator.geolocation.getCurrentPosition(
    done,
    () => navigator.geolocation.getCurrentPosition(
      done, fail,
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    ),
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
  );
}

function shipNavigateBack() {
  if (!state.shipPoint) return;
  window.open(mapsUrl(state.shipPoint.lat, state.shipPoint.lng), "_blank");
}

function shipClearPoint() { state.shipPoint = null; saveState(); renderShipScreen(); }

function dismissLocationBanner() {
  localStorage.setItem("mwapp_geo_dismissed", "1");
  const banner = document.getElementById("locationBanner");
  if (banner) banner.classList.add("hidden");
}

function maybeShowLocationBanner() {
  const banner = document.getElementById("locationBanner");
  if (!banner) return;
  if (!("geolocation" in navigator)) { banner.classList.add("hidden"); return; }
  if (localStorage.getItem("mwapp_geo_dismissed") === "1") { banner.classList.add("hidden"); return; }
  banner.classList.remove("hidden");
}

// ---- Trade Union Premium activation (code-based, 30-day expiry) ----
// Demo model: the union issues ONE code per month to itself (not a
// per-seafarer code), sent to approved members by SMS. Entering it activates
// Premium for exactly 30 days from today; after that it turns off on its
// own — no reconfirmation step, no separate "deactivate" action needed.
// This is a deliberate, simpler first version — see project notes on the
// tradeoff (a shared monthly code can be forwarded to someone the union
// didn't approve) and the planned upgrade to one-time personal codes once
// real usage volume justifies the backend work that requires.
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDaysISO(isoDate, days) {
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isUnionValid() {
  if (!state.unionActive || !state.unionExpiresAt) return false;
  return todayISO() <= state.unionExpiresAt;
}
function formatDateHuman(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString(state.lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Demo union codes — one shared code per union per month, exactly as agreed
// with the three unions currently piloting this (Estonian Seafarers' Union,
// RPSM, Serbian Seafarers' Union). Real codes will be generated and rotated
// by IMWIRSA, not hardcoded like this demo.
const UNION_CODES = {
  "ESTUNION-2608": { en: "Estonian Seafarers' Union", ru: "Профсоюз моряков Эстонии" },
  "RPSM-2608": { en: "RPSM (Russian Union of Seafarers)", ru: "РПСМ" },
  "SERBIA-2608": { en: "Serbian Seafarers' Union", ru: "Профсоюз моряков Сербии" },
};

function activateUnionCode() {
  const input = document.getElementById("unionCodeInput");
  const errorEl = document.getElementById("unionCodeError");
  const code = (input.value || "").trim().toUpperCase();
  const match = UNION_CODES[code];

  if (!match) {
    errorEl.classList.remove("hidden");
    input.focus();
    return;
  }

  errorEl.classList.add("hidden");
  const activatedAt = todayISO();
  state.unionActive = true;
  state.unionCode = code;
  state.unionName = match[state.lang === "ru" ? "ru" : "en"];
  state.unionActivatedAt = activatedAt;
  state.unionExpiresAt = addDaysISO(activatedAt, 30);
  saveState();

  input.value = "";
  closeModal("unionModal");
  state.accessView = "vip";
  updateAssistantUI();
  openDetail("wellness");
}

const state = {
  assistant: null,
  lang: null,
  name: "",
  mwaId: null,
  unionActive: false,
  unionCode: null,
  unionName: null,
  unionActivatedAt: null,
  unionExpiresAt: null,
  portId: "tallinn-vanasadam",
  context: "at_port",
  accessView: "std",
  shipPoint: null,
  // Assistant chat (Alex/Omar/Sophia/Grace персонажи) — persisted like the
  // rest of state so the conversation survives a full app close/reopen.
  // Cleared ONLY when the seafarer explicitly taps "New conversation" —
  // never as a side effect of ordinary navigation.
  chatMessages: [],       // [{ who: "me" | "them", text }]
  chatStarted: false,
  assistantReplyIndex: 0,
  surveyAnswers: [],      // [{ context, portId, q1, q2, q3, free, at }] — local + best-effort emailed, see submitSurvey()
  // "std" | "large" — controls ONLY --content-text-scale (assistant
  // messages, descriptions, card info, Port Card, transport rows,
  // warnings). Deliberately does NOT touch Top Bar, Tab Bar, button
  // labels, or assistant portrait composition — those stay fixed so the
  // layout can't come apart the way it did under uncontrolled iOS
  // Dynamic Type inheritance. See applyTextSize().
  textSize: "std",
};

// Удаляет всё, что приложение хранит на устройстве, и возвращает его
// в состояние первого запуска. Когда появится бэкенд, отсюда же пойдёт
// запрос на удаление серверных данных.
function clearAllLocalData() {
  try {
    localStorage.removeItem("mwapp_state");
    localStorage.removeItem("mwapp_install_dismissed");
    localStorage.removeItem("mwapp_geo_dismissed");
    localStorage.removeItem("mwapp_launch_counted");   // чтобы обещание «удаляется всё» было буквально верным
  } catch (e) {}
  location.reload();
}

function ensureMwaId() {
  if (state.mwaId) return;
  const n = Math.floor(1000000 + Math.random() * 8999999);
  state.mwaId = `MWA-${n}`;
  saveState();
}

function saveState() { try { localStorage.setItem("mwapp_state", JSON.stringify(state)); } catch (e) {} }

// City-only port IDs used before the city→terminal migration (Aug 2026).
// A seafarer's phone may still have one of these saved from before the
// update; map it forward once rather than silently dropping them back to
// the default terminal.
const LEGACY_PORT_ID_MAP = {
  tallinn: "tallinn-vanasadam",
  constanta: "constanta-south",
  "constanta-main": "constanta-south", // pre-12-Aug-2026 single skeleton port, now split in two
  hamburg: "hamburg-eurogate",
  "hamburg-main": "hamburg-eurogate", // pre-13-Aug-2026 single skeleton port, now split in four
  istanbul: "istanbul-haydarpasa",
};

function loadState() {
  try {
    const raw = localStorage.getItem("mwapp_state");
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch (e) {}
  if (state.portId && LEGACY_PORT_ID_MAP[state.portId]) {
    state.portId = LEGACY_PORT_ID_MAP[state.portId];
  }
}

function gradientStyle(grad) { return `background: linear-gradient(135deg, ${grad[0]}, ${grad[1]});`; }

function renderAssistantGrid(containerId, modalTargetId) {
  const el = document.getElementById(containerId);
  el.innerHTML = Object.keys(ASSISTANTS).map((id) => {
    const a = getAssistant(id);
    const photo = getAssistantPhoto(id, "onboardGrid");
    return `
    <button class="assistant-card ${state.assistant === a.id ? 'selected' : ''}" data-assistant="${a.id}" data-modal-target="${modalTargetId || ''}" style="--accent:${a.accent}">
      <div class="assistant-avatar"><img src="${photo}" alt="${a.name}" loading="lazy"></div>
      <div class="assistant-name" style="color:${a.accent}">${a.name}</div>
    </button>`;
  }).join("");
}

function renderLangGrid(containerId, modalTargetId) {
  const el = document.getElementById(containerId);
  el.innerHTML = LANGUAGES.map((l) => `
    <button class="lang-pill ${state.lang === l.code ? 'selected' : ''}" data-lang="${l.code}" data-modal-target="${modalTargetId || ''}" style="--accent:${l.accent}">
      <span class="lang-flag">${l.flag}</span> ${l.label}
    </button>`).join("");
}

function refreshOnboardContinue() {
  const btn = document.getElementById("onboardContinue");
  const wasDisabled = btn.disabled;
  const nowEnabled = !!(state.assistant && state.lang);
  btn.disabled = !nowEnabled;
  if (wasDisabled && nowEnabled) {
    const wave = document.getElementById("btnWave");
    if (wave) { wave.classList.remove("pulse"); void wave.offsetWidth; wave.classList.add("pulse"); }
  }
}

function setAvatarPhoto(elId, a, screenKey) {
  const el = document.getElementById(elId);
  if (!el) return;
  const photo = screenKey ? getAssistantPhoto(a.id, screenKey) : a.photo;
  el.style.cssText = gradientStyle(a.grad);
  el.innerHTML = `<img src="${photo}" alt="${a.name}" loading="lazy">`;
}

// Settings → Text size (Standard / Large). Only moves --content-text-scale,
// which only the deliberately-listed content selectors in app.css read
// (chat-msg, home-hero-bubble, ab-text, d-title/d-sub, sd-card-title,
// svc-chip, sd-callout .sc-text, sd-note, contact-row texts, hours-table,
// sched-row, home-port-sub, gate-msg/gate-sub, hero-status). Top Bar,
// Tab Bar, category/button labels, and the assistant portrait containers
// never read this variable, so they can't be pushed out of place by it —
// that decoupling is the whole point after the Dynamic Type layout bug.
function applyTextSize() {
  const scale = state.textSize === "large" ? "1.2" : "1";
  document.documentElement.style.setProperty("--content-text-scale", scale);
  const btnStd = document.getElementById("btnTextStd");
  const btnLarge = document.getElementById("btnTextLarge");
  if (btnStd) btnStd.classList.toggle("active", state.textSize !== "large");
  if (btnLarge) btnLarge.classList.toggle("active", state.textSize === "large");
}

function updateAssistantUI() {
  applyTextSize();
  const a = getAssistant(state.assistant);
  if (!a) return;

  const introPhoto = getAssistantPhoto(a.id, "introHero");
  document.getElementById("introAvatar").innerHTML = `<img src="${introPhoto}" alt="${a.name}" loading="lazy">`;
  document.getElementById("introName").textContent = a.name;
  document.getElementById("introMsg").textContent = t("intro.msg") || a.greet;

  const namePhoto = getAssistantPhoto(a.id, "nameScreen");
  document.getElementById("nameAvatar").innerHTML = `<img src="${namePhoto}" alt="${a.name}" loading="lazy">`;

  setDetailHeaderPhoto(a, "settingsHeaderPhoto");
  setDetailHeaderPhoto(a, "shipHeaderPhoto");

  const port = currentPort();
  document.getElementById("homePortName").textContent = `${port.meta.flag} ${portDisplayName(port)}`;
  document.getElementById("homePortSub").textContent = port.meta.country;
  const tzEl = document.getElementById("homeTz");
  if (tzEl) tzEl.textContent = `⏱ ${port.meta.tz}`;

  const heroImg = document.getElementById("homeHeroImg");
  if (heroImg) heroImg.src = getAssistantPhoto(a.id, "homeBubble");
  const heroBubble = document.getElementById("homeHeroBubble");
  if (heroBubble) heroBubble.textContent = t("home.heroGreeting", { port: portDisplayName(port) });

  document.getElementById("settingsLangVal").textContent =
    (LANGUAGES.find((l) => l.code === state.lang) || {}).flag || "›";

  const unionVal = document.getElementById("unionStatusVal");
  if (unionVal) {
    if (isUnionValid()) unionVal.textContent = `${t("settings.unionActiveUntil")} ${formatDateHuman(state.unionExpiresAt)}`;
    else unionVal.textContent = t("settings.unionNotConfirmed");
  }

  const mwaIdVal = document.getElementById("settingsMwaId");
  if (mwaIdVal) mwaIdVal.textContent = state.mwaId || "";

  document.getElementById("btnAccessStd").classList.toggle("active", state.accessView !== "vip");
  document.getElementById("btnAccessVip").classList.toggle("active", state.accessView === "vip");
  // Gold = "your card is valid this month" — independent of which view the
  // seafarer is currently browsing. Standard/Premium selection (.active,
  // above) and card status (.vip, below) are two different questions.
  document.getElementById("btnAccessVip").classList.toggle("vip", isUnionValid());

  const portSel = document.getElementById("settingsPortVal");
  if (portSel) portSel.textContent = `${port.meta.flag} ${portDisplayName(port)} ›`;
  const ctxVal = document.getElementById("settingsContextVal");
  if (ctxVal) ctxVal.textContent = state.context === "in_city" ? t("settings.contextInCity") : t("settings.contextAtPort");

  saveState();
}

function goToScreen(name) {
  // Capture where we're coming FROM, before we switch screens — but only
  // when heading into the chat, and only if we're not already there (so
  // re-entering the chat via its own re-render calls doesn't overwrite the
  // real origin with "assistantchat" itself).
  const currentActive = document.querySelector(".screen.active");
  const currentName = currentActive ? currentActive.dataset.screen : null;
  if (name === "assistantchat" && currentName && currentName !== "assistantchat") {
    chatReturnTarget = currentName;
  }

  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const target = document.querySelector(`.screen[data-screen="${name}"]`);
  if (target) target.classList.add("active");

  const bottomNav = document.getElementById("bottomNav");
  if (["home", "volunteer", "settings", "detail", "subdetail", "assistantchat", "ship"].includes(name)) {
    bottomNav.style.display = "flex";
    document.querySelectorAll(".nav-item[data-nav]").forEach((n) => n.classList.toggle("active", n.dataset.nav === name));
  } else {
    bottomNav.style.display = "none";
  }

  if (name === "intro" || name === "name" || name === "home" || name === "settings") updateAssistantUI();
  if (name === "assistantchat") openAssistantChat();
  if (name === "ship") renderShipScreen();
  if (name === "home") { maybeShowInstallBanner(); maybeShowLocationBanner(); }
}

let qrCountdownTimer = null;

function setDetailHeaderPhoto(a, elId = "detailHeaderPhoto") {
  const el = document.getElementById(elId);
  if (!el) return;
  const photo = getAssistantPhoto(a.id, "detailHeader");
  el.innerHTML = `<img src="${photo}" alt="${a.name}" loading="lazy">`;
}

// ---- LEVEL 2 -----------------------------------------------------------
async function openDetail(key) {
  try {
    await ensurePortContentLoaded(state.portId);
  } catch (e) {
    console.error("Could not load port content:", e);
    return; // stays on the current screen rather than opening a broken/empty one
  }
  const categories = currentCategories();
  const data = categories && categories[key];
  if (!data) return;
  const port = currentPort();
  const valid = isUnionValid();
  const locked = !!data.gated && !valid;

  document.getElementById("detailCrumbPort").textContent = port.meta.terminal;
  document.getElementById("detailTitle").textContent = data.title + (locked ? " 🔒" : "");

  const a = getAssistant(state.assistant) || getAssistant("alex");
  setDetailHeaderPhoto(a);

  // Hero status strip — shown ONLY where a category declares statusFrom
  // (today: the Seafarers' Centre). Deliberately not repeated on every
  // category: while a seafarer is looking at Transport or Shops, the
  // centre's opening status is noise that steals screen space.
  let statusHtml = "";
  if (data.statusFrom) {
    const st = computeStatus((SUBDETAILS[data.statusFrom] || {}).hours);
    if (st) {
      statusHtml = `<div class="hero-status ${st.open ? 'is-open' : 'is-closed'}">
        <span class="hs-dot"></span><span class="hs-text">${escapeHtml(st.text)}</span>
      </div>`;
    }
  }

  let bubbleHtml = "";
  if (data.gated) {
    const msg = valid ? t("wellness.unlockedIntro") : t("wellness.lockedIntro");
    bubbleHtml = `
      <div class="assistant-bubble premium" style="margin:0 0 14px;">
        <div class="ab-name">${a.name} · ${t("wellness.roleSuffix")}</div>
        <div class="ab-text">${msg}</div>
        <button class="ab-cta" data-go="assistantchat">${t("askMe.wellness") || t("askMe.default")}</button>
      </div>`;
  } else {
    const msg = t(`categoryPrompts.${key}`) || t("categoryPrompts.fallback");
    const langNote = state.lang && state.lang !== "en"
      ? `<div style="font-size:12px; color:var(--gray, #8A93A3); margin-top:6px; line-height:1.4;">${t("common.englishContentNote")}</div>`
      : "";
    bubbleHtml = `
      <div class="assistant-bubble" style="margin:0 0 14px;">
        <div class="ab-name">${a.name}</div>
        <div class="ab-text">${msg}</div>
        ${langNote}
        <button class="ab-cta" data-go="assistantchat">${t(`askMe.${key}`) || t("askMe.default")}</button>
      </div>`;
  }

  const rowsHtml = data.rows.map((r) => {
    if (r.pending) {
      return `
    <div class="d-row pending">
      <div class="d-icon">${r.icon}</div>
      <div class="d-body">
        <div class="d-title">${r.title}</div>
        <div class="d-sub">${r.sub}</div>
        <span class="d-tag awaiting">${t("common.awaitingData")}</span>
      </div>
    </div>`;
    }
    // A row normally opens a level-3 subdetail (`sd`). A few rows instead
    // hand straight off to a screen (`go`) — used for the neutral "I'd just
    // like to talk" entry in Spiritual Care, which belongs in that list but
    // has no reference page behind it, only the assistant.
    const rowClickable = (!!r.sd || !!r.go) && !locked;
    const attrs = locked ? "" : (r.sd ? `data-sd="${r.sd}"` : (r.go ? `data-go="${r.go}"` : ""));
    return `
    <div class="d-row ${rowClickable ? 'clickable' : ''}" ${attrs}>
      <div class="d-icon">${r.icon}</div>
      <div class="d-body">
        <div class="d-title">${r.title}</div>
        <div class="d-sub">${r.sub}</div>
        ${r.tag ? `<span class="d-tag ${r.tagClosed ? 'closed' : ''}">${r.tag}</span>` : ""}
      </div>
      ${(r.sd || r.go) ? `<div class="d-action">${locked ? '🔒' : '›'}</div>` : (r.action ? `<div class="d-action">${r.action}</div>` : "")}
    </div>`;
  }).join("");

  document.getElementById("detailList").innerHTML = statusHtml + bubbleHtml + rowsHtml;
  goToScreen("detail");
}

// ---- LEVEL 3 -----------------------------------------------------------
// Renders whichever blocks a subdetail declares, in a fixed reading order.
function openSubDetail(sdKey) {
  const sd = SUBDETAILS[sdKey];
  if (!sd) return;
  const port = currentPort();
  const locked = !!sd.gated && !isUnionValid();

  document.getElementById("subdetailCrumbPort").textContent = port.meta.terminal;
  document.getElementById("subdetailTitle").textContent = sd.title;

  const contactRows = (list) => list.map((c) => `
    <div class="contact-row">
      <div class="c-icon">${c.icon}</div>
      <div class="c-body"><div class="c-title">${c.title}</div><div class="c-sub">${c.sub}</div></div>
      ${c.action ? `<div class="c-action">${c.action}</div>` : ""}
    </div>`).join("");

  let inner = "";

  // A callout answers the one blunt question the seafarer actually opened the
  // screen with ("can I even leave the port?") before any list of details.
  if (sd.callout) {
    inner += `<div class="sd-callout ${sd.callout.tone === "warn" ? "warn" : "ok"}">
      <div class="sc-icon">${sd.callout.tone === "warn" ? "⚠️" : "✅"}</div>
      <div class="sc-text">${sd.callout.text}</div>
    </div>`;
  }

  // Generic titled card with plain info rows — used wherever the content is
  // "things to know", not contacts to call or a schedule to read.
  if (sd.sections) {
    inner += sd.sections.map((sec) => `
      <div class="sd-card">
        <div class="sd-card-title">${sec.icon} ${sec.title}</div>
        ${contactRows(sec.rows)}
      </div>`).join("");
  }

  if (sd.hours) {
    const todayIdx = todayHoursIndex();
    inner += `<div class="sd-card"><div class="sd-card-title">🕐 ${t("common.hours")}</div><table class="hours-table">` +
      sd.hours.map(([day, time], i) => `<tr class="${i === todayIdx ? 'hours-today' : ''}"><td>${day}</td><td>${time}</td></tr>`).join("") +
      `</table></div>`;
  }

  if (sd.groups) {
    inner += sd.groups.map((g) => `
      <div class="sd-card">
        <div class="sd-card-title">${g.icon} ${g.label}</div>
        <div class="svc-list">${g.items.map((i) => `<span class="svc-chip">${i}</span>`).join("")}</div>
      </div>`).join("");
  }

  if (sd.contacts) {
    inner += `<div class="sd-card"><div class="sd-card-title">📞 ${t("common.contacts")}</div>${contactRows(sd.contacts)}</div>`;
  }

  if (sd.times) {
    inner += `<div class="sd-card"><div class="sd-card-title">${sd.from || t("common.schedule")}</div>` +
      sd.times.map((time, i) => `<div class="sched-row ${i === sd.nextIndex ? 'next' : ''}"><span>${time}</span>${i === sd.nextIndex ? `<span class="sched-tag">${t("common.next")}</span>` : ''}</div>`).join("") +
      `</div>`;
  }

  if (sd.directions) {
    inner += `<div class="sd-card"><div class="sd-card-title">📍 ${t("common.gettingThere")}</div>${contactRows(sd.directions)}</div>`;
  }

  if (sd.maps) {
    inner += `<div class="sd-card">
      <div class="sd-card-title">🗺 ${t("common.openInMaps")}</div>
      <button class="map-btn" data-map="${sd.maps.lat},${sd.maps.lng}">🧭 ${t("common.openMapsBtn")}</button>
      <div class="sd-note" style="margin-top:10px;">${sd.maps.lat.toFixed(4)}, ${sd.maps.lng.toFixed(4)}</div>
    </div>`;
  }

  if (sd.type === "qr_code") {
    // Код рисуется на самом устройстве (js/qr.js). Раньше это делал сторонний
    // сервис, то есть MWA-ID моряка уходил на чужой сервер, а без интернета
    // экран оставался пустым. Теперь ни того, ни другого.
    const svg = qrSvg(state.mwaId || "MWA-DEMO", 180);
    inner += `<div class="sd-card qr-card">
      <div class="sd-card-title" style="justify-content:center;">🔳 ${sd.title}</div>
      <div class="qr-id">${state.mwaId || ""}</div>
      <div class="qr-image-wrap">${svg}</div>
      <div class="qr-countdown" id="qrCountdown"></div>
    </div>`;
  }

  if (sd.note) inner += `<div class="sd-card"><div class="sd-card-title">ℹ️ ${t("common.goodToKnow")}</div><div class="sd-note">${sd.note}</div></div>`;

  // Provenance line for anything supplied by a port curator, so a seafarer can
  // judge how fresh it is instead of assuming the app is authoritative.
  if (sd.updated) inner += `<div class="sd-updated">${t("common.lastUpdated", { date: sd.updated })}</div>`;

  document.getElementById("subdetailBody").innerHTML = wrapGate(inner, locked, sd);
  clearInterval(qrCountdownTimer);
  if (sd.type === "qr_code" && !locked) startQrCountdown();
  goToScreen("subdetail");
}

function startQrCountdown() {
  let seconds = 60;
  const paint = (s) => {
    const el = document.getElementById("qrCountdown");
    if (!el) { clearInterval(qrCountdownTimer); return false; }
    el.textContent = t("common.qrRefresh", { s });
    return true;
  };
  if (!paint(seconds)) return;
  qrCountdownTimer = setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) seconds = 60; // demo loop — real rotation happens server-side once backend is live
    paint(seconds);
  }, 1000);
}

function wrapGate(innerHtml, locked, sd) {
  if (!locked) return innerHtml;
  return `<div class="gate-wrap">
    <div class="gate-blur">${innerHtml}</div>
    <div class="gate-overlay">
      <div class="gate-lock">🔒</div>
      <div class="gate-msg">${t("modals.gate.msg")}</div>
      <div class="gate-sub">${t("modals.gate.sub")}</div>
      <button class="gate-btn" data-modal="unionModal">${t("modals.gate.confirm")}</button>
    </div>
  </div>`;
}

function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }

// ---- SURVEY (Settings "How are things going?" + Ship-return prompt) -----
// Two contexts share one modal: "settings" (general pulse-check, reachable
// any time) and "ship" (tied to the port visit just ending). Same UI shell,
// different questions — see i18n survey.settings / survey.ship.
//
// Responses are stored locally like the rest of state (state.surveyAnswers,
// wiped by "Clear my data" same as everything else) AND, best-effort, sent
// to IMWIRSA over the same FormSubmit channel already used by the port
// questionnaire — MWApp v0.1 has no real backend yet, so without this the
// data would never leave the seafarer's own phone and couldn't feed the
// Research Observatory / Maritime Welfare Review at all. If the send fails
// (no connection, etc.) the local copy still exists; nothing blocks on it.
let surveyContext = "settings"; // "settings" | "ship"
let surveyAnswers = { q1: null, q2: null, q3: null, free: "" };

function surveyQuestions() {
  return surveyContext === "ship" ? t("survey.ship") : t("survey.settings");
}

function renderSurveyScale(containerId, onPick) {
  const el = document.getElementById(containerId);
  const options = t("survey.scaleOptions");
  el.innerHTML = options.map((emoji, i) =>
    `<button type="button" class="survey-scale-btn" data-val="${i + 1}">${emoji}</button>`
  ).join("");
  el.querySelectorAll(".survey-scale-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      el.querySelectorAll(".survey-scale-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      onPick(Number(btn.dataset.val));
    });
  });
}

function renderSurveyYesNo(containerId, onPick) {
  const el = document.getElementById(containerId);
  const options = t("survey.yesNoOptions");
  el.innerHTML = options.map((label) =>
    `<button type="button" class="survey-yesno-btn" data-val="${escapeHtml(label)}">${escapeHtml(label)}</button>`
  ).join("");
  el.querySelectorAll(".survey-yesno-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      el.querySelectorAll(".survey-yesno-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      onPick(btn.dataset.val);
    });
  });
}

function openSurvey(context) {
  surveyContext = context;
  surveyAnswers = { q1: null, q2: null, q3: null, free: "" };
  const q = surveyQuestions();

  document.getElementById("surveyFormState").classList.remove("hidden");
  document.getElementById("surveyThanksState").classList.add("hidden");

  document.getElementById("surveyTitle").textContent = q.title;
  document.getElementById("surveyIntro").textContent = q.intro;
  document.getElementById("surveyQ1Label").textContent = q.q1;
  document.getElementById("surveyQ2Label").textContent = q.q2;
  document.getElementById("surveySubmitBtn").textContent = t("survey.submitBtn");
  document.getElementById("surveySkipBtn").textContent = t("survey.skipBtn");

  renderSurveyScale("surveyQ1Scale", (v) => { surveyAnswers.q1 = v; });
  renderSurveyYesNo("surveyQ2Choices", (v) => { surveyAnswers.q2 = v; });

  const q3Wrap = document.getElementById("surveyQ3Wrap");
  const freeLabel = document.getElementById("surveyFreeLabel");
  const freeText = document.getElementById("surveyFreeText");
  freeText.value = "";

  if (surveyContext === "settings") {
    q3Wrap.classList.remove("hidden");
    document.getElementById("surveyQ3Label").textContent = q.q3;
    renderSurveyYesNo("surveyQ3Choices", (v) => { surveyAnswers.q3 = v; });
    freeLabel.textContent = q.q4Label;
    freeText.placeholder = q.q4Placeholder;
  } else {
    q3Wrap.classList.add("hidden");
    freeLabel.textContent = q.q3Label;
    freeText.placeholder = q.q3Placeholder;
  }

  openModal("surveyModal");
}

function submitSurvey() {
  surveyAnswers.free = document.getElementById("surveyFreeText").value.trim();

  if (!Array.isArray(state.surveyAnswers)) state.surveyAnswers = [];
  state.surveyAnswers.push({
    context: surveyContext,
    portId: state.portId,
    mwaId: state.mwaId,
    lang: state.lang,
    at: new Date().toISOString(),
    ...surveyAnswers,
  });
  saveState();

  // Best-effort delivery — same channel as the port questionnaire. Never
  // blocks the thank-you screen on network success; this is a pulse-check,
  // not a form the seafarer is depending on a confirmation for.
  try {
    const body = new FormData();
    body.append("_subject", `MWApp survey (${surveyContext}) — ${state.portId || "unknown port"}`);
    body.append("context", surveyContext);
    body.append("port", state.portId || "");
    body.append("q1_scale", surveyAnswers.q1 ?? "");
    body.append("q2", surveyAnswers.q2 ?? "");
    if (surveyContext === "settings") body.append("q3", surveyAnswers.q3 ?? "");
    body.append("free_text", surveyAnswers.free || "");
    body.append("mwa_id", state.mwaId || "");
    body.append("lang", state.lang || "");
    fetch("https://formsubmit.co/ajax/info@imwirsa.org", { method: "POST", headers: { Accept: "application/json" }, body }).catch(() => {});
  } catch (e) { /* offline or blocked — local copy above is enough for now */ }

  document.getElementById("surveyFormState").classList.add("hidden");
  document.getElementById("surveyThanksState").classList.remove("hidden");
  document.getElementById("surveyThanksTitle").textContent = t("survey.thanksTitle");
  document.getElementById("surveyThanksText").textContent = t("survey.thanksText");
  document.getElementById("surveyDoneBtn").textContent = t("survey.doneBtn");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// .chat-body / #assistantChatBody never scroll themselves — they're plain
// flex children (flex:1, no overflow set). The actual scrolling element is
// the ancestor .screen (overflow-y:auto). Scrolling the chat-body element
// directly was a silent no-op, which is why new messages kept piling up
// out of view instead of auto-scrolling into sight.
function scrollChatToBottom(bodyEl) {
  const screen = bodyEl.closest(".screen");
  if (screen) screen.scrollTop = screen.scrollHeight;
}

let chatReplyIndex = 0;

function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  const body = document.getElementById("chatBody");
  body.insertAdjacentHTML("beforeend", `<div class="chat-msg me">${escapeHtml(text)}</div>`);
  input.value = "";
  input.style.height = "auto";
  scrollChatToBottom(body);
  setTimeout(() => {
    const replies = t("coordinator.demoReplies");
    const reply = replies[chatReplyIndex % replies.length];
    chatReplyIndex++;
    body.insertAdjacentHTML("beforeend", `<div class="chat-msg them">${escapeHtml(reply)}</div>`);
    scrollChatToBottom(body);
  }, 900);
}

// ---- ASSISTANT CHAT (demo) --------------------------------------------
// Prototype-level only: keyword matching stands in for the real AI classification
// described in the scope of work (section 5).
//
// RED-LINE topics (self-harm, suicide, immediate danger) are handled
// SEPARATELY from ordinary "complex" topics below, and checked first.
// A genuine safety emergency must never be routed through the same soft
// "continue chatting or talk to the coordinator?" toggle as a lifestyle
// question — it needs local emergency services / Emergency Contacts
// surfaced immediately, not an optional escalation a tired or distressed
// person might decline. This does not replace real crisis-detection (see
// isComplexTopic's own prototype caveat) — same limitation applies here,
// even more so given the stakes.
const RED_LINE_KEYWORDS = [
  "suicide", "kill myself", "want to die", "hurt myself", "harm myself", "end my life",
  "no point living", "hang myself",
  "самоубийств", "покончить с собой", "убью себя", "не хочу жить", "причинить себе вред",
  "повеситься", "не вижу смысла",
  "intihar", "kendimi öldür", "yaşamak istemiyorum", "kendime zarar",
  "magpakamatay", "papatayin ko ang sarili ko", "ayoko na mabuhay",
];
// "повеситься"/"не вижу смысла" added 4 сентября from Markus's Block 26
// companion-chat draft — deliberately did NOT add "конец" or "всё ужасно"
// from that same draft: "конец" collides with an unrelated massage-service
// question elsewhere in the Q&A base, and "всё ужасно" is too generic
// (would fire on an ordinary bad-day complaint). EN/TR/FIL phrasings for
// the two new additions are a good-faith translation, not verified by a
// native speaker — same caveat as the rest of this list.
function isRedLineTopic(text) {
  const lower = text.toLowerCase();
  return RED_LINE_KEYWORDS.some((kw) => lower.includes(kw));
}

// Rough proxy for "this reads as an actual question, just about a topic we
// don't cover" vs "this message is unclear on its own terms" — see the
// 04.09.2026 note where this is used, next to demoReplies/unclearReplies.
// Deliberately simple (a fixed word list, not real language understanding,
// consistent with everything else in this file): presence of an ordinary
// question word is treated as "the question came through fine".
const QUESTION_MARKERS = [
  "где", "можно ли", "можно", "сколько", "нужно ли", "нужно", "как", "есть ли",
  "куда", "почему", "какой", "какая", "какие", "кто", "что такое", "разрешено ли",
  "разрешено", "во сколько", "когда",
  "where", "how", "can i", "is there", "are there", "do i need", "what", "why",
  "when", "which", "who", "how much", "how many",
  "nerede", "nasıl", "ne zaman", "kaç", "var mı", "gerekli mi",
  "saan", "paano", "kailan", "magkano", "meron ba", "pwede ba",
];

function looksLikeAQuestion(text) {
  const lower = text.toLowerCase();
  return QUESTION_MARKERS.some((w) => lower.includes(w));
}

const COMPLEX_TOPIC_KEYWORDS = [
  "captain", "master", "argue", "argued", "fight", "shouted", "yelled", "threat", "threatened",
  "bar", "alcohol", "drink", "girl", "girlfriend", "women", "woman", "dating", "meet someone",
  "police", "arrest", "arrested", "detained", "robbed", "stole", "stolen", "theft", "deport",
  "deported", "visa problem", "immigration",
  // Added 03.09.2026 after a live test surfaced a real gap: "меня арестовала
  // полиция" fell through this English-only list straight to a meaningless
  // filler reply instead of the escalation toggle. This list was English-
  // only from the start (unlike RED_LINE_KEYWORDS, which already has all
  // four app languages) — treat that as its own standing gap, not something
  // fixed just by adding today's specific misses.
  "капитан", "старпом", "поругались", "поругался", "кричит", "накричал", "угрожает", "угрожали",
  "бар", "алкоголь", "выпить", "девушка", "девушкой", "познакомиться", "свидание",
  "полиция", "арестовал", "арестовала", "арестован", "задержал", "задержали", "ограбили",
  "украли", "кража", "депортация", "депортируют", "проблема с визой", "иммиграция",
  "polis", "tutuklandı", "gözaltına", "soyuldu", "çaldı", "hırsızlık", "sınır dışı", "vize sorunu",
  "pulis", "inaresto", "hinuli", "ninakawan", "nawalan", "deport", "problema sa visa",
];
// Pruned 04.09.2026: removed "sad/lonely/alone/depressed/hopeless/грустно/
// одиноко/подавлен/безнадёжно/плохие новости из дома/проблемы в семье/
// развод" and their kin. Plain loneliness, boredom, homesickness and
// fatigue after watch are now handled by the Block 26 companion-chat
// intents (offline-qa-match.js) with a warm conversational reply instead
// of immediately offering the escalation toggle — offering "talk to Duty
// Office" every time someone says they're bored risked feeling like an
// overreaction. This list is now reserved for things that plausibly need
// a human either way: on-board conflict, police/legal trouble, ambiguous
// shore-leave topics. The companion layer still defers to RED_LINE_KEYWORDS
// first for anything that reads as a genuine crisis, same priority order
// as before this change.

function isComplexTopic(text) {
  const lower = text.toLowerCase();
  return COMPLEX_TOPIC_KEYWORDS.some((kw) => lower.includes(kw));
}

// Same prototype-level caveat as above — this is a keyword heuristic, not
// real intent classification. Used ONLY for the one reply right after the
// assistant asks "why do you want the coordinator" (see
// awaitingCoordinatorReason below), to tell genuine idle/lonely small talk
// apart from an actual reason to reach a human.
const IDLE_CHAT_KEYWORDS = [
  "just want to talk", "just wanted to chat", "how are you", "how's it going",
  "nothing much", "bored", "weather", "small talk", "just chatting", "just saying hi",
  "просто поговорить", "просто пообщаться", "как дела", "скучно", "погода", "ни о чём", "ни о чем", "просто так", "поболтать",
  "sadece konuşmak", "sadece sohbet", "nasılsın", "sıkıldım", "hava durumu", "boş konuşma",
  "gusto ko lang makipag-usap", "kamusta ka", "nainip ako", "panahon", "walang tema",
];

function isIdleChatTopic(text) {
  const lower = text.toLowerCase();
  return IDLE_CHAT_KEYWORDS.some((kw) => lower.includes(kw));
}

// Remembers which screen the seafarer was on right before opening the
// assistant chat (home / detail / subdetail / volunteer / ship), so the
// chat's own back arrow returns them exactly there instead of always
// dropping back to Home. Content on that screen is untouched — openDetail/
// openSubDetail only re-render on demand, so it's still showing whatever
// was last opened (e.g. the taxi subdetail the seafarer came from).
let chatReturnTarget = "home";

// Set for exactly one round-trip when the seafarer taps "Talk to IMWIRSA
// Welfare Coordinator" in Settings: true until openAssistantChat() asks
// why, then stays true through that ONE reply so sendAssistantChatMessage
// knows to branch it specially (idle chat → Spiritual Care, anything else
// → offer the coordinator) before falling back to ordinary chat behaviour.
let awaitingCoordinatorReason = false;

function setChatHeaderPhoto(a) {
  const el = document.getElementById("chatAssistantPhoto");
  if (!el) return;
  el.innerHTML = `<img src="${getAssistantPhoto(a.id, "chatHero")}" alt="${a.name}" loading="lazy">`;
}

// Collapses the big full-bleed photo header down to a slim bar once the
// seafarer has actually sent a message — before that, the greeting alone
// doesn't count as "the conversation is under way" (see backlog item:
// compact chat header after the exchange starts).
function updateChatHeaderCompact() {
  const header = document.getElementById("assistantChatHeader");
  if (!header) return;
  const started = state.chatMessages.some((m) => m.who === "me");
  header.classList.toggle("compact", started);
}

// Rebuilds the chat body from state.chatMessages every time — this is what
// makes reopening the chat work identically whether the seafarer just came
// back from Level-2/3 a moment ago, or fully closed and reopened MWApp.
function renderAssistantChatMessages() {
  const body = document.getElementById("assistantChatBody");
  if (!body) return;
  body.innerHTML = state.chatMessages.map((m) =>
    `<div class="chat-msg ${m.who === "me" ? "me" : "them"}">${escapeHtml(m.text)}</div>`
  ).join("");
  scrollChatToBottom(body);
}

function openAssistantChat() {
  const a = getAssistant(state.assistant) || getAssistant("alex");
  setChatHeaderPhoto(a);
  document.getElementById("chatAssistantName").textContent = a.name;
  const input = document.getElementById("assistantChatInput");
  if (input) input.value = "";

  if (!state.chatStarted) {
    state.chatMessages = [{ who: "them", text: a.greet }];
    state.chatStarted = true;
  }
  if (awaitingCoordinatorReason) {
    state.chatMessages.push({ who: "them", text: t("coordinator.askReason") });
  }
  saveState();
  renderAssistantChatMessages();
  updateChatHeaderCompact();
}

// Explicit, seafarer-initiated reset — the only thing that clears the
// conversation. Triggered from the "New conversation" button in the chat
// header, after a confirmation modal (see newChatModal).
function startNewAssistantChat() {
  state.chatMessages = [];
  state.chatStarted = false;
  state.assistantReplyIndex = 0;
  awaitingCoordinatorReason = false;
  saveState();
  const toggle = document.getElementById("escalationToggle");
  if (toggle) toggle.remove();
  openAssistantChat();
}

function sendAssistantChatMessage() {
  const input = document.getElementById("assistantChatInput");
  const text = input.value.trim();
  if (!text) return;
  const body = document.getElementById("assistantChatBody");
  const existingToggle = document.getElementById("escalationToggle");
  if (existingToggle) existingToggle.remove();

  // Only the ONE reply right after the coordinator-reason question gets the
  // special three-way handling below; every other message in the chat uses
  // the normal two-way isComplexTopic() check, unchanged.
  const isCoordinatorReasonReply = awaitingCoordinatorReason;
  awaitingCoordinatorReason = false;

  state.chatMessages.push({ who: "me", text });
  saveState();
  body.insertAdjacentHTML("beforeend", `<div class="chat-msg me">${escapeHtml(text)}</div>`);
  input.value = "";
  input.style.height = "auto";
  updateChatHeaderCompact();
  scrollChatToBottom(body);

  const a = getAssistant(state.assistant) || getAssistant("alex");
  setTimeout(() => {
    if (isRedLineTopic(text)) {
      // Safety takes priority over everything else, including whether this
      // reply was meant to answer "why do you want the coordinator" — a
      // red-line message is a red-line message regardless of context.
      const msg = t("redline.message") || t(`escalation.${a.id}`) || t("escalation.alex");
      state.chatMessages.push({ who: "them", text: msg });
      saveState();
      body.insertAdjacentHTML("beforeend", `<div class="chat-msg them">${escapeHtml(msg)}</div>`);
      body.insertAdjacentHTML("beforeend", `
        <div class="escalation-toggle" id="escalationToggle">
          <button class="esc-btn esc-coordinator" data-detail="emergency">${t("redline.emergencyBtn") || t("settings.talkToCoordinator")}</button>
          <button class="esc-btn esc-coordinator" id="escCoordinatorBtn">${t("redline.talkToPersonBtn") || t("escalationToggle.coordinatorBtn")}</button>
        </div>`);
    } else if (isCoordinatorReasonReply && isIdleChatTopic(text)) {
      // Explicitly asked for the coordinator, but the reason reads as idle/
      // lonely small talk rather than a real issue — point to Spiritual
      // Care's "just want to talk" option instead of paging a human.
      const msg = t("coordinator.pointToSpiritual");
      state.chatMessages.push({ who: "them", text: msg });
      saveState();
      body.insertAdjacentHTML("beforeend", `<div class="chat-msg them">${escapeHtml(msg)}</div>`);
      body.insertAdjacentHTML("beforeend", `
        <div class="escalation-toggle" id="escalationToggle">
          <button class="esc-btn esc-coordinator" data-detail="spiritual">${t("coordinator.openSpiritualBtn")}</button>
        </div>`);
    } else if (isComplexTopic(text) || isCoordinatorReasonReply) {
      // Genuine reason — either the usual keyword check flagged it, or the
      // seafarer explicitly came here via "Talk to Coordinator" and this
      // reply wasn't idle chat, so default to offering the same escalation
      // toggle used everywhere else rather than a generic demo reply.
      const msg = t(`escalation.${a.id}`) || t("escalation.alex");
      state.chatMessages.push({ who: "them", text: msg });
      saveState();
      body.insertAdjacentHTML("beforeend", `<div class="chat-msg them">${escapeHtml(msg)}</div>`);
      body.insertAdjacentHTML("beforeend", `
        <div class="escalation-toggle" id="escalationToggle">
          <button class="esc-btn esc-continue" id="escContinueBtn">${t("escalationToggle.continueBtn")}</button>
          <button class="esc-btn esc-coordinator" id="escCoordinatorBtn">${t("escalationToggle.coordinatorBtn")}</button>
        </div>`);
    } else {
      // Priority order below RED_LINE_KEYWORDS / COMPLEX_TOPIC_KEYWORDS
      // (checked earlier in this function, unchanged):
      //   1. Companion chat (Block 26) — ordinary conversation.
      //   2. The intent-anchor Q&A table (offline-qa-match.js).
      //   3. If neither matched: a genuinely unclear message ("расч
      //      уыекуцй") gets a DIFFERENT reply than a clear question about
      //      a topic we simply don't cover ("where can I buy a comb?").
      //      Telling someone to "try rephrasing" when the real issue is
      //      that the topic isn't in the table would just have them retry
      //      forever for nothing — see 04.09.2026 discussion. Distinguishing
      //      the two isn't exact (no real language understanding here,
      //      same as everywhere else in this file) — it's a rough proxy:
      //      the presence of an ordinary question word is treated as
      //      "the question came through fine, we just don't have this
      //      topic"; its absence is treated as "unclear, ask them to say
      //      it differently".
      const companionReply = typeof findCompanionReply === "function" ? findCompanionReply(text) : null;
      const offlineAnswer = companionReply || (typeof findOfflineAnswer === "function" ? findOfflineAnswer(text) : null);
      const replyKey = offlineAnswer ? null : (looksLikeAQuestion(text) ? "demoReplies" : "unclearReplies");
      const reply = offlineAnswer || t(replyKey)[state.assistantReplyIndex % t(replyKey).length];
      if (!offlineAnswer) state.assistantReplyIndex++;
      state.chatMessages.push({ who: "them", text: reply });
      saveState();
      body.insertAdjacentHTML("beforeend", `<div class="chat-msg them">${escapeHtml(reply)}</div>`);
    }
    scrollChatToBottom(body);
  }, 900);
}

let deferredInstallPrompt = null;

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }

function maybeShowInstallBanner() {
  if (isStandalone()) return;
  if (localStorage.getItem("mwapp_install_dismissed") === "1") return;
  const banner = document.getElementById("installBanner");
  const sub = document.getElementById("installSub");
  if (isIOS()) { sub.textContent = t("home.install.subIOS"); banner.classList.remove("hidden"); }
  else if (deferredInstallPrompt) { sub.textContent = t("home.install.subDefault"); banner.classList.remove("hidden"); }
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  maybeShowInstallBanner();
});

// ---- Lighthouse beam positioning ---------------------------------------
const LH_IMG_W = 992, LH_IMG_H = 1586;
const LH_LAMP_X_PCT = 15.62, LH_LAMP_Y_PCT = 48.55;

function positionBeamAndEmblem() {
  const beam = document.getElementById("lhBeamLive");
  const bgEl = document.querySelector(".lh-bg");
  if (!beam || !bgEl) return;
  const rect = bgEl.getBoundingClientRect();
  const cw = rect.width, ch = rect.height;
  if (!cw || !ch) return;

  const scaleW = cw / LH_IMG_W, scaleH = ch / LH_IMG_H;
  let lampPctX, lampPctY;

  if (scaleH >= scaleW) {
    const scale = scaleH;
    const scaledW = LH_IMG_W * scale;
    const cropX = (scaledW - cw) / 2;
    lampPctX = (((LH_LAMP_X_PCT / 100) * scaledW - cropX) / cw) * 100;
    lampPctY = LH_LAMP_Y_PCT;
  } else {
    const scale = scaleW;
    const scaledH = LH_IMG_H * scale;
    lampPctX = LH_LAMP_X_PCT;
    lampPctY = (((LH_LAMP_Y_PCT / 100) * scaledH) / ch) * 100;
  }

  beam.style.setProperty("--beam-left", lampPctX + "%");
  beam.style.setProperty("--beam-bottom", (100 - lampPctY) + "%");
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  ensureMwaId();
  applyTextSize();
  applyStaticI18n();
  renderAssistantGrid("assistantGrid", "");
  renderLangGrid("langGrid", "");
  renderAssistantGrid("assistantGridModal", "assistantModal");
  renderLangGrid("langGridModal", "langModal");
  renderAssistantGrid("assistantGridPrefs", "prefsModal");
  renderLangGrid("langGridPrefs", "prefsModal");
  refreshOnboardContinue();
  positionBeamAndEmblem();
  window.addEventListener("resize", positionBeamAndEmblem);
  window.addEventListener("orientationchange", () => setTimeout(positionBeamAndEmblem, 150));

  if (state.assistant && state.lang) goToScreen("home");

  document.body.addEventListener("click", (e) => {
    if (e.target.id === "nameSave") state.name = document.getElementById("nameInput").value.trim();

    if (e.target.id === "shipMarkBtn" || e.target.closest("#shipMarkBtn")) shipMarkLocation();
    if (e.target.id === "shipNavigateBtn" || e.target.closest("#shipNavigateBtn")) shipNavigateBack();
    if (e.target.id === "shipRemarkBtn" || e.target.closest("#shipRemarkBtn")) shipClearPoint();
    if (e.target.id === "shipSurveyBtn" || e.target.closest("#shipSurveyBtn")) openSurvey("ship");
    if (e.target.id === "settingsSurveyBtn" || e.target.closest("#settingsSurveyBtn")) openSurvey("settings");
    if (e.target.id === "surveySubmitBtn") submitSurvey();
    if (e.target.id === "surveySkipBtn" || e.target.id === "surveyDoneBtn") closeModal("surveyModal");
    if (e.target === document.getElementById("surveyModal")) closeModal("surveyModal");

    const mapEl = e.target.closest("[data-map]");
    if (mapEl) {
      const [la, ln] = mapEl.dataset.map.split(",");
      window.open(mapsUrl(la, ln), "_blank");
    }

    const goEl = e.target.closest("[data-go]");
    if (goEl) {
      const target = goEl.dataset.go;

      // "Talk to IMWIRSA Welfare Coordinator" in Settings no longer jumps
      // straight to the human coordinator chat. It goes through the
      // assistant first, which asks why — genuine/urgent reasons still
      // reach the coordinator (via the same escalation toggle used
      // everywhere else), but idle small talk gets pointed to Spiritual
      // Care instead of quietly becoming a second, unofficial "chat with
      // AI for company" channel that bypasses the human coordinator's time.
      if (target === "__coordinatorViaAssistant") {
        awaitingCoordinatorReason = true;
        goToScreen("assistantchat");
        return;
      }

      // The chat header's own back arrow: return to wherever the seafarer
      // was before opening the chat (Level-2, Level-3, Home…), and leave
      // the conversation exactly as it is — this is a "step back to keep
      // browsing", not "end the chat".
      if (target === "__chatBack") {
        goToScreen(chatReturnTarget || "home");
        return;
      }

      // Going home resets the access view (Standard/Premium toggle) back to
      // Standard — but no longer ends the assistant-chat session. Ending the
      // conversation is now a deliberate action (the "New conversation"
      // button in the chat header), not a side effect of ordinary browsing.
      if (target === "home") {
        state.accessView = "std";
      }
      goToScreen(target);
    }

    const detailEl = e.target.closest("[data-detail]");
    if (detailEl) openDetail(detailEl.dataset.detail);

    const sdEl = e.target.closest("[data-sd]");
    if (sdEl) openSubDetail(sdEl.dataset.sd);

    const modalEl = e.target.closest("[data-modal]");
    if (modalEl) openModal(modalEl.dataset.modal);

    const accessEl = e.target.closest("[data-access]");
    if (accessEl) {
      state.accessView = accessEl.dataset.access;
      updateAssistantUI();
      if (accessEl.dataset.access === "vip") openDetail("wellness");
    }

    const portEl = e.target.closest("[data-port]");
    if (portEl) { state.portId = portEl.dataset.port; updateAssistantUI(); closeModal("portModal"); }

    const ctxEl = e.target.closest("[data-context]");
    if (ctxEl) { state.context = ctxEl.dataset.context; updateAssistantUI(); closeModal("contextModal"); }

    const textSizeEl = e.target.closest("[data-textsize]");
    if (textSizeEl) { state.textSize = textSizeEl.dataset.textsize; applyTextSize(); saveState(); }

    const assistantEl = e.target.closest("[data-assistant]");
    if (assistantEl) {
      state.assistant = assistantEl.dataset.assistant;
      document.querySelectorAll(".assistant-card").forEach((card) => {
        card.classList.toggle("selected", card.dataset.assistant === state.assistant);
      });
      refreshOnboardContinue();
      updateAssistantUI();
      if (assistantEl.dataset.modalTarget) closeModal(assistantEl.dataset.modalTarget);
    }

    const langEl = e.target.closest("[data-lang]");
    if (langEl) {
      state.lang = langEl.dataset.lang;
      renderLangGrid("langGrid", "");
      renderLangGrid("langGridModal", "langModal");
      renderLangGrid("langGridPrefs", "prefsModal");
      renderAssistantGrid("assistantGrid", "");
      renderAssistantGrid("assistantGridModal", "assistantModal");
      renderAssistantGrid("assistantGridPrefs", "prefsModal");
      refreshOnboardContinue();
      applyStaticI18n();
      updateAssistantUI();
      if (langEl.dataset.modalTarget) closeModal(langEl.dataset.modalTarget);
    }

    if (e.target === document.getElementById("langModal")) closeModal("langModal");
    if (e.target === document.getElementById("assistantModal")) closeModal("assistantModal");
    if (e.target === document.getElementById("portModal")) closeModal("portModal");
    if (e.target === document.getElementById("contextModal")) closeModal("contextModal");

    if (e.target.id === "editNameRow" || e.target.closest("#editNameRow")) goToScreen("name");
    if (e.target.id === "unionRow" || e.target.closest("#unionRow")) openModal("unionModal");

    if (e.target.id === "unionActivateBtn") activateUnionCode();

    if (e.target.id === "unionNoCodeBtn") {
      closeModal("unionModal");
      openModal("unionDeniedModal");
    }

    if (e.target.id === "unionCloseBtn") closeModal("unionModal");
    if (e.target.id === "unionDeniedCloseBtn") closeModal("unionDeniedModal");

    if (e.target.id === "clearDataRow" || e.target.closest("#clearDataRow")) {
      openModal("clearDataModal");
    }
    if (e.target.id === "clearDataCancelBtn") closeModal("clearDataModal");
    if (e.target === document.getElementById("clearDataModal")) closeModal("clearDataModal");

    if (e.target.id === "clearDataConfirmBtn") {
      // Всё, что приложение о моряке знает, лежит только здесь — сервера нет.
      // Поэтому удаление действительно окончательное, о чём и предупреждает модалка.
      clearAllLocalData();
    }

    if (e.target.id === "chatNewBtn" || e.target.closest("#chatNewBtn")) {
      openModal("newChatModal");
    }
    if (e.target.id === "newChatCancelBtn") closeModal("newChatModal");
    if (e.target === document.getElementById("newChatModal")) closeModal("newChatModal");
    if (e.target.id === "newChatConfirmBtn") {
      closeModal("newChatModal");
      startNewAssistantChat();
    }

    if (e.target.id === "resetAppRow" || e.target.closest("#resetAppRow")) {
      localStorage.removeItem("mwapp_state");
      location.reload();
    }

    if (e.target.id === "installBtn") {
      if (isIOS()) openModal("iosInstallModal");
      else if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.finally(() => {
          deferredInstallPrompt = null;
          document.getElementById("installBanner").classList.add("hidden");
        });
      }
    }

    if (e.target.id === "installCloseBtn") {
      document.getElementById("installBanner").classList.add("hidden");
      localStorage.setItem("mwapp_install_dismissed", "1");
    }

    if (e.target.id === "locationEnableBtn") {
      const btn = document.getElementById("locationEnableBtn");
      const originalText = btn.textContent;
      btn.textContent = t("settings.detectLocating");
      btn.disabled = true;
      requestLocation(() => {
        dismissLocationBanner();
        btn.textContent = originalText;
        btn.disabled = false;
      });
    }

    if (e.target.id === "locationCloseBtn") dismissLocationBanner();

    if (e.target.id === "detectLocationRow" || e.target.closest("#detectLocationRow")) {
      const valEl = document.getElementById("detectLocationVal");
      if (valEl) valEl.textContent = t("settings.detectLocating");
      requestLocation((ok) => {
        if (valEl) valEl.textContent = ok ? t("settings.detectUpdated") : t("settings.detectUnavailable");
      });
    }

    if (e.target.id === "iosInstallCloseBtn") {
      closeModal("iosInstallModal");
      document.getElementById("installBanner").classList.add("hidden");
      localStorage.setItem("mwapp_install_dismissed", "1");
    }

    if (e.target === document.getElementById("unionModal")) closeModal("unionModal");
    if (e.target === document.getElementById("unionDeniedModal")) closeModal("unionDeniedModal");

    if (e.target.id === "chatSend") sendChatMessage();
    if (e.target.id === "assistantChatSend") sendAssistantChatMessage();

    if (e.target.id === "escContinueBtn") {
      const toggle = document.getElementById("escalationToggle");
      if (toggle) toggle.remove();
    }
    if (e.target.id === "escCoordinatorBtn") {
      const toggle = document.getElementById("escalationToggle");
      if (toggle) toggle.remove();
      goToScreen("volunteer");
    }
  });

  function autoGrowChatInput(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  document.getElementById("chatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
  });
  document.getElementById("chatInput").addEventListener("input", (e) => autoGrowChatInput(e.target));
  document.getElementById("assistantChatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAssistantChatMessage(); }
  });
  document.getElementById("assistantChatInput").addEventListener("input", (e) => autoGrowChatInput(e.target));

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
});
