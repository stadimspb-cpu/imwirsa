// ============================================================
// MWApp prototype — vanilla JS state machine, no build step.
// ============================================================

// Visual identity only — name/tag/greet text now lives in js/i18n.js so it
// can be translated per language. Use getAssistant(id) (defined in i18n.js)
// to get an assistant merged with its translated text fields.
// "photos" holds every pose variant available for a persona. Right now each
// one has just a single image, so getAssistantPhoto() (in i18n.js) returns
// the same photo everywhere — safe default. To add more poses (see partner
// reference sheet), just add more entries in file/angle order, e.g.:
//   photos: ["assets/avatars/alex.png", "assets/avatars/alex-2.png", "assets/avatars/alex-3.png"]
// Different screens will then automatically start showing different
// angles of the same character — no other code changes needed.
// onboardScale corrects for inconsistent framing between the source photos
// (some were shot/cropped closer than others, making heads look bigger or
// smaller relative to each other). Measured from each photo's actual
// head-to-shoulder proportion — if a photo is replaced, this should be
// re-measured and updated, not left as-is.
const ASSISTANTS = {
  alex:   { id: "alex",   icon: "⚓", grad: ["#0D6E8A", "#0A5A72"], accent: "#29C5FF", photo: "assets/avatars/alex.png",   photos: ["assets/avatars/alex.png"],   onboardScale: 1.08 },
  omar:   { id: "omar",   icon: "🧭", grad: ["#1B3A6B", "#B8860B"], accent: "#2AD9A8", photo: "assets/avatars/omar.png",   photos: ["assets/avatars/omar.png"],   onboardScale: 0.85 },
  sophia: { id: "sophia", icon: "⭐", grad: ["#5DD3F0", "#0D6E8A"], accent: "#B15CFF", photo: "assets/avatars/sophia.png", photos: ["assets/avatars/sophia.png"], onboardScale: 1.16 },
  grace:  { id: "grace",  icon: "🌙", grad: ["#E8523A", "#B8860B"], accent: "#FFA83D", photo: "assets/avatars/grace.png",  photos: ["assets/avatars/grace.png"],  onboardScale: 0.96 },
};

// Trade Union / Premium services are now presented by the seafarer's own chosen assistant
// (Alex / Omar / Sophia / Grace) rather than a separate persona — Linda has been retired.

const LANGUAGES = [
  { code: "en", flag: "🇬🇧", label: "English", accent: "#29C5FF" },
  { code: "ru", flag: "🇷🇺", label: "Русский", accent: "#2AD9A8" },
  { code: "tr", flag: "🇹🇷", label: "Türkçe", accent: "#FF4D6D" },
  { code: "fil", flag: "🇵🇭", label: "Filipino", accent: "#FFA83D" },
];

// Placeholder used for fields curators haven't filled in yet via the PWM Telegram bot.
const TBD = "Details coming soon from the port curator";

// ---- SUB-DETAILS (Level 3) --------------------------------------------
// Rendered by openSubDetail(). type: "hours_contacts" | "schedule" | "note"
const SUBDETAILS = {
  tallinn_centre_main: {
    type: "hours_contacts",
    title: "Tallinn Seafarers' Centre",
    hours: [
      ["Monday", "08:00 – 20:00", true], ["Tuesday", "08:00 – 20:00"], ["Wednesday", "08:00 – 20:00"],
      ["Thursday", "08:00 – 20:00"], ["Friday", "08:00 – 20:00"], ["Saturday", "09:00 – 17:00"], ["Sunday", "10:00 – 15:00"],
    ],
    contacts: [
      { icon: "📞", title: "+372 5555 1234", sub: "Main line · English, Russian spoken", action: "📞" },
      { icon: "💬", title: "WhatsApp", sub: "Message ahead of time", action: "💬" },
      { icon: "🧑‍💼", title: "Marta Kask (PWM)", sub: "Port curator · available now", action: "💬" },
    ],
    directions: [
      { icon: "🚐", title: "Shuttle from Gate D", sub: "Every 2 hours · free", action: "›" },
      { icon: "🚶", title: "On foot: 12 minutes", sub: "Sadama tn → turn at the lighthouse", action: "🗺" },
    ],
  },
  tallinn_transport_shuttle: {
    type: "schedule",
    title: "Shuttle — schedule",
    from: "Departs from Gate D",
    times: ["09:00", "12:00", "14:30", "17:00", "19:00"],
    nextIndex: 2,
    note: "Return fare after 20:00 — " + TBD.toLowerCase() + ".",
  },
  hamburg_centre_main: {
    type: "hours_contacts",
    title: "Duckdalben International Seamen's Club",
    hours: [
      ["Monday", "10:00 – 21:00", true], ["Tuesday", "10:00 – 21:00"], ["Wednesday", "10:00 – 21:00"],
      ["Thursday", "10:00 – 21:00"], ["Friday", "10:00 – 21:00"], ["Saturday", "15:00 – 21:00"], ["Sunday", "15:00 – 21:00"],
    ],
    contacts: [
      { icon: "📞", title: "+49 40 740 1661", sub: "Main line", action: "📞" },
      { icon: "☎️", title: "Freecall 0800 382 5325236", sub: "For pickup requests from your ship", action: "📞" },
      { icon: "🌐", title: "duckdalben.de", sub: "Club website", action: "›" },
    ],
    directions: [
      { icon: "🚐", title: "Free shuttle to your ship", sub: "Call ahead · last pickup 19:30 daily", action: "📞" },
      { icon: "🚌", title: "Bus 150 / 151 / 250 / 451", sub: "Nearest stop: Container Terminal Eurogate · ~6 min walk", action: "🧭" },
      { icon: "⛴", title: "Ferry line 61", sub: "Waltershof stop", action: "🧭" },
    ],
  },
  constanta_centre_main: {
    type: "hours_contacts",
    title: "Seamen's Club Constanța",
    contacts: [
      { icon: "📞", title: "+40 723 000 555", sub: "Constanța & Midia-Năvodari · also for shuttle pickup", action: "📞" },
      { icon: "📞", title: "+40 723 218 090", sub: "Agigea (South Constanța)", action: "📞" },
      { icon: "🌐", title: "romania.seamensclub.ro", sub: "Club website", action: "›" },
    ],
    directions: [
      { icon: "🚐", title: "Free shuttle to your ship", sub: "Call ahead, or ask the gate guard to call for you", action: "📞" },
    ],
  },
  premium_qr: {
    type: "qr_code", gated: true,
    title: "Your Premium QR Code",
    note: "Show this code to partner staff for verification — supermarkets, cafés and transport partners near the centre. Demo mode: this is a static illustrative code. Live rotating verification, tied to your real MWA-ID and checked against IMWIRSA's server, will connect once the backend is ready.",
  },
  wellness_zone_tallinn: {
    type: "hours_contacts", gated: true,
    title: "Wellness Recovery Zone — Tallinn",
    contacts: [
      { icon: "🧑‍💼", title: "Kadri Saar — Wellness Coordinator", sub: "Book a session via WhatsApp", action: "💬" },
      { icon: "💆", title: "Massage & physiotherapy", sub: "Partner specialist on-site, by appointment", action: "🧭" },
      { icon: "🧠", title: "Confidential counselling", sub: "Private booking through MWApp, discreet", action: "🧭" },
    ],
    directions: [
      { icon: "📍", title: "Next to the Seafarers' Centre", sub: "Sadama 25, Tallinn", action: "🧭" },
    ],
  },
  legal_help: {
    type: "hours_contacts", gated: true,
    title: "Legal Assistance",
    contacts: [
      { icon: "⚖️", title: "ITF Inspector — Baltic region", sub: "Free legal advice for union members", action: "📞" },
      { icon: "💬", title: "WhatsApp consultation", sub: "Response within 24h", action: "💬" },
    ],
    directions: [
      { icon: "🏛", title: "In person at the Seafarers' Centre", sub: "By appointment only", action: "🧭" },
    ],
  },
  medical_extended: {
    type: "hours_contacts", gated: true,
    title: "Medical — Extended Access",
    hours: [
      ["Monday", "08:00 – 20:00", true], ["Tuesday", "08:00 – 20:00"], ["Wednesday", "08:00 – 20:00"],
      ["Thursday", "08:00 – 20:00"], ["Friday", "08:00 – 20:00"], ["Saturday", "09:00 – 15:00"], ["Sunday", "Emergency only"],
    ],
    contacts: [
      { icon: "🩺", title: "Tallinn Medical Clinic — priority booking", sub: "Union card covers consultation fee", action: "📞" },
      { icon: "🚑", title: "Emergency services", sub: "112 · Free · 24/7", action: "📞" },
    ],
  },
  psych_support: {
    type: "hours_contacts", gated: true,
    title: "Psychological Support",
    contacts: [
      { icon: "🧠", title: "Licensed counsellor", sub: "+372 5555 9911 · English, Russian", action: "📞" },
      { icon: "💬", title: "Confidential chat", sub: "Available 24/7 via this app", action: "💬" },
      { icon: "🧘", title: "Quiet room at the centre", sub: "Open now · no booking needed", action: "🧭" },
    ],
  },
  port_discounts: {
    type: "hours_contacts", gated: true,
    title: "Port Discounts & Privileges",
    contacts: [
      { icon: "🛍", title: "Rimi Supermarket", sub: "5% off with union card", action: "🧭" },
      { icon: "☕", title: "Seafarers' Centre café", sub: "Free coffee, discounted meals", action: "🧭" },
      { icon: "🚕", title: "Partner taxi service", sub: "Fixed reduced rate to city centre", action: "🧭" },
    ],
  },
};

// ---- PORTS --------------------------------------------------------------
const PORTS = {
  tallinn: {
    meta: { flag: "🇪🇪", name: "Tallinn", sub: "Estonia · Old City Harbour", tz: "UTC+3", lat: 59.4451, lng: 24.7654 },
    categories: {
      centre: {
        title: "Seafarers' Centre",
        rows: [
          { icon: "🏛", title: "Tallinn Seafarers' Centre", sub: "Sadama 25 · 0.8 km from the terminal", tag: "Open until 20:00", action: "›", sd: "tallinn_centre_main" },
          { icon: "📞", title: "Call the centre", sub: "+372 5555 1234 · English, Russian spoken", action: "📞" },
          { icon: "🌐", title: "Centre services", sub: "Wi-Fi, lounge, chapel, shop, laundry", action: "›" },
        ],
      },
      transport: {
        title: "Transport",
        rows: [
          { icon: "🚐", title: "Seafarers' Centre shuttle", sub: "Every 2 hours from Gate D · Free", tag: "Next: 14:30", action: "›", sd: "tallinn_transport_shuttle" },
          { icon: "🚕", title: "Taxi", sub: "Bolt, Uber available · ~€5 to city centre", action: "›" },
          { icon: "🚎", title: "City bus", sub: "Route 2 · Stop 300m from the gate", action: "🧭" },
        ],
      },
      connect: {
        title: "SIM & Wi-Fi",
        rows: [
          { icon: "📡", title: "SIM card", sub: "Tele2, Elisa — R-Kiosk at port exit · ~€5 / 3GB", action: "›" },
          { icon: "📶", title: "Port Wi-Fi", sub: "Network: TallinnPort · Password: seafarer2026", action: "📋" },
          { icon: "💱", title: "ATM / currency exchange", sub: "SEB Bank · 400m from the gate · EUR", action: "🧭" },
        ],
      },
      shops: {
        title: "Shops & Food",
        rows: [
          { icon: "🛍", title: "Rimi Supermarket", sub: "600m from the gate · 08:00–22:00", tag: "Open now", action: "🧭" },
          { icon: "☕", title: "Seafarers' Centre café", sub: "Hot meals · lunch ~€6 · free coffee", tag: "Until 19:00", action: "🧭" },
          { icon: "💊", title: "Apotheka Pharmacy", sub: "Sadama 15 · 500m · Mon–Fri 9:00–20:00", tag: "Closed weekends", tagClosed: true, action: "🧭" },
        ],
      },
      medical: {
        title: "Medical",
        rows: [
          { icon: "🏥", title: "Emergency services", sub: "112 · Free · 24/7", action: "📞" },
          { icon: "🩺", title: "Tallinn Medical Clinic", sub: "1.2 km · paid service · English spoken", action: "🧭" },
        ],
      },
      safety: {
        title: "Safety",
        rows: [
          { icon: "🟢", title: "General area risk", sub: "Low risk — normal precautions apply" },
          { icon: "🪪", title: "Port pass", sub: "Seafarer ID required · Gate 1 checkpoint", action: "›" },
          { icon: "⚠️", title: "Notice", sub: "Icy walkways reported near Gate 2 this week" },
        ],
      },
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🏛", title: "Seafarers' Centre", sub: "+372 5555 1234", action: "📞" },
          { icon: "🌐", title: "ISWAN 24/7 Helpline", sub: "+44 20 7283 2922 · Multilingual", action: "📞" },
        ],
      },
      wellness: {
        title: "Premium Welfare Services", gated: true,
        rows: [
          { icon: "🔳", title: "Your Premium QR Code", sub: "Show this to partner staff to verify your status", action: "›", sd: "premium_qr" },
          { icon: "🌊", title: "Wellness Recovery Zone", sub: "Massage, counselling and quiet space near the centre", action: "›", sd: "wellness_zone_tallinn" },
          { icon: "⚖️", title: "Legal Assistance", sub: "ITF inspector, contract & wage disputes", action: "›", sd: "legal_help" },
          { icon: "🩺", title: "Medical — Extended Access", sub: "Priority booking, covered consultation fee", action: "›", sd: "medical_extended" },
          { icon: "🧠", title: "Psychological Support", sub: "Confidential counselling, 24/7 chat", action: "›", sd: "psych_support" },
          { icon: "🏷", title: "Port Discounts & Privileges", sub: "Shops, café, transport near the terminal", action: "›", sd: "port_discounts" },
        ],
      },
    },
  },

  constanta: {
    meta: { flag: "🇷🇴", name: "Constanța", sub: "Romania · Port of Constanța", tz: "UTC+2", lat: 44.1730, lng: 28.6520 },
    categories: {
      centre: {
        title: "Seafarers' Centre",
        rows: [
          { icon: "🏛", title: "Seamen's Club Constanța", sub: "Str. Traian 62, Bloc K4 · Constanța", action: "›", sd: "constanta_centre_main" },
          { icon: "📞", title: "Call the centre", sub: "+40 723 000 555 · Constanța & Midia-Năvodari", action: "📞" },
          { icon: "🌐", title: "Club facilities", sub: "Wi-Fi, gym, library, billiards, city tours", action: "›" },
        ],
      },
      transport: {
        title: "Transport",
        rows: [
          { icon: "🚐", title: "Free shuttle to your ship", sub: "Call +40 723 000 555, or ask the gate guard", action: "📞" },
          { icon: "🚕", title: "Taxi", sub: "Use authorised taxis only · confirm the fare first", action: "🧭" },
        ],
      },
      connect: {
        title: "SIM & Wi-Fi",
        rows: [
          { icon: "📶", title: "Wi-Fi at the Seamen's Club", sub: "Free for laptops, phones and tablets", action: "📋" },
          { icon: "📡", title: "SIM card", sub: "Orange, Vodafone, Digi — available in the city", action: "›" },
          { icon: "💱", title: "Currency exchange", sub: "Use only authorised exchange offices", action: "🧭" },
        ],
      },
      shops: {
        title: "Shops & Food",
        rows: [
          { icon: "🛍", title: "City Park Mall / VIVO Mall / TOM Centre", sub: "Free van transport from the Seamen's Club on request", action: "🧭" },
          { icon: "🛒", title: "Kaufland Hypermarket", sub: "Free van transport via the Seamen's Club", action: "🧭" },
        ],
      },
      medical: { title: "Medical", rows: [ { icon: "🏥", title: "Emergency services", sub: "112 · Free · 24/7", action: "📞" } ] },
      safety: {
        title: "Safety",
        rows: [
          { icon: "🪪", title: "Gate 1 only", sub: "Non-European seafarers must use Gate 1 to exit/enter the port" },
          { icon: "⚠️", title: "Beware of scams", sub: "Some people falsely claim to represent the Seamen's Club and ask for money. Real staff never do — ignore them or call the police" },
          { icon: "🧑‍🤝‍🧑", title: "Go out with colleagues", sub: "It's safer not to walk into town alone" },
        ],
      },
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🏛", title: "Seamen's Club Constanța", sub: "+40 723 000 555", action: "📞" },
          { icon: "🌐", title: "ISWAN 24/7 Helpline", sub: "+44 20 7283 2922 · Multilingual", action: "📞" },
        ],
      },
      wellness: { title: "Premium Welfare Services", gated: true, rows: [ { icon: "ℹ️", title: TBD, sub: "Trade Union partner services pending confirmation" } ] },
    },
  },

  hamburg: {
    meta: { flag: "🇩🇪", name: "Hamburg", sub: "Germany · Port of Hamburg", tz: "UTC+2", lat: 53.5335, lng: 9.9481 },
    categories: {
      centre: {
        title: "Seafarers' Centre",
        rows: [
          { icon: "🏛", title: "Duckdalben International Seamen's Club", sub: "Zellmannstraße 16, Hamburg", tag: "Mon–Fri 10:00–21:00", action: "›", sd: "hamburg_centre_main" },
          { icon: "📞", title: "Call the centre", sub: "+49 40 740 1661", action: "📞" },
          { icon: "🌐", title: "Club facilities", sub: "On-site shop, café, chapel, Wi-Fi, billiards, library", action: "›" },
        ],
      },
      transport: {
        title: "Transport",
        rows: [
          { icon: "🚐", title: "Free shuttle to your ship", sub: "Call the club's freecall number to arrange pickup · last pickup 19:30", action: "📞" },
          { icon: "🚌", title: "Bus 150 / 151 / 250 / 451", sub: "Nearest stop: Container Terminal Eurogate · ~6 min walk", action: "🧭" },
          { icon: "⛴", title: "Ferry line 61", sub: "Waltershof stop · scenic route into the city", action: "🧭" },
        ],
      },
      connect: {
        title: "SIM & Wi-Fi",
        rows: [
          { icon: "📶", title: "Wi-Fi at Duckdalben", sub: "Free for all visiting seafarers", action: "📋" },
          { icon: "📡", title: "SIM card", sub: "Telekom, Vodafone, O2 — ask club staff for the nearest shop", action: "›" },
        ],
      },
      shops: {
        title: "Shops & Food",
        rows: [
          { icon: "🛍", title: "Club shop & supermarket", sub: "On-site at Duckdalben · snacks and essentials", tag: "During club hours", action: "🧭" },
          { icon: "☕", title: "Club café", sub: "Coffee and budget-friendly meals", tag: "During club hours", action: "🧭" },
        ],
      },
      medical: {
        title: "Medical",
        rows: [
          { icon: "🏥", title: "Emergency services", sub: "112 · Free · 24/7", action: "📞" },
          { icon: "🩺", title: "Port medical service (HPHC)", sub: "Free, anonymous consultation at the club — ask staff for current hours", action: "🧭" },
        ],
      },
      safety: { title: "Safety", rows: [ { icon: "🟢", title: "General area risk", sub: "Low risk — normal precautions apply" } ] },
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🏛", title: "Duckdalben Club", sub: "+49 40 740 1661", action: "📞" },
          { icon: "🌐", title: "ISWAN 24/7 Helpline", sub: "+44 20 7283 2922 · Multilingual", action: "📞" },
        ],
      },
      wellness: { title: "Premium Welfare Services", gated: true, rows: [ { icon: "ℹ️", title: TBD, sub: "Trade Union partner services pending confirmation" } ] },
    },
  },

  istanbul: {
    meta: { flag: "🇹🇷", name: "Istanbul", sub: "Türkiye · Haydarpaşa Port", tz: "UTC+3", lat: 41.0011, lng: 29.0192 },
    categories: {
      centre: {
        title: "Seafarers' Centre",
        rows: [
          { icon: "🏛", title: "Istanbul Seafarers' Contact Centre", sub: "Kadıköy / İstanbul · ~2 km", action: "🧭" },
          { icon: "📞", title: "Call the centre", sub: "+90 216 347 3771", action: "📞" },
          { icon: "💬", title: "WhatsApp", sub: "+90 532 657 1252", action: "💬" },
        ],
      },
      transport: { title: "Transport", rows: [ { icon: "🚐", title: "Shuttle", sub: "On request · free", action: "🧭" } ] },
      connect: { title: "SIM & Wi-Fi", rows: [ { icon: "ℹ️", title: TBD, sub: "Will appear once updated via the PWM Telegram bot" } ] },
      shops: { title: "Shops & Food", rows: [ { icon: "ℹ️", title: TBD, sub: "Will appear once updated via the PWM Telegram bot" } ] },
      medical: { title: "Medical", rows: [ { icon: "🏥", title: "Emergency services", sub: "112 · Free · 24/7", action: "📞" } ] },
      safety: { title: "Safety", rows: [ { icon: "🟢", title: "General area risk", sub: "Details pending" } ] },
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🏛", title: "Istanbul Seafarers' Contact Centre", sub: "+90 216 347 3771", action: "📞" },
          { icon: "🌐", title: "ISWAN 24/7 Helpline", sub: "+44 20 7283 2922 · Multilingual", action: "📞" },
        ],
      },
      wellness: { title: "Premium Welfare Services", gated: true, rows: [ { icon: "ℹ️", title: TBD, sub: "Trade Union partner services pending confirmation" } ] },
    },
  },
};

function currentPort() { return PORTS[state.portId] || PORTS.tallinn; }

// ---- Geolocation — nearest-port detection ---------------------------------
// Privacy design: raw coordinates are used only in-memory, for the duration of
// a single calculation, and are never written to state, localStorage, or sent
// anywhere over the network. Only the *result* (which port, how far) is kept.
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius, km
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

const AT_PORT_RADIUS_KM = 3; // within this distance of a port's reference point, treat as "at the port"

function requestLocation(onDone) {
  if (!("geolocation" in navigator)) { onDone(false); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords; // used only for the next two lines, never persisted
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
function currentCategories() { return currentPort().categories; }

// ---- Trade Union card validity (must be reconfirmed every calendar month) ----
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function monthKeyOf(isoDate) { return isoDate ? isoDate.slice(0, 7) : null; } // "YYYY-MM"
function isUnionValid() {
  if (!state.unionActive || !state.unionLastConfirmed) return false;
  return monthKeyOf(state.unionLastConfirmed) === monthKeyOf(todayISO());
}

const state = {
  assistant: null,
  lang: null,
  name: "",
  mwaId: null,             // demo-only, generated and stored on-device. Real MWA-ID issuance and
                           // cross-device recovery requires the backend described in the scope of work (section 4).
  unionActive: false,
  unionLastConfirmed: null,  // ISO date "YYYY-MM-DD" of the last confirmation check
  portId: "tallinn",      // will be set automatically once geolocation is wired in; manual for now
  context: "at_port",     // "at_port" | "in_city" — reserved for the planned geolocation feature
  accessView: "std",      // "std" | "vip" — which toggle is selected on the port card
};

function ensureMwaId() {
  if (state.mwaId) return;
  const n = Math.floor(1000000 + Math.random() * 8999999); // 7-digit demo number
  state.mwaId = `MWA-${n}`;
  saveState();
}

function saveState() {
  try {
    localStorage.setItem("mwapp_state", JSON.stringify(state));
  } catch (e) {}
}
function loadState() {
  try {
    const raw = localStorage.getItem("mwapp_state");
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch (e) {}
}

function gradientStyle(grad) {
  return `background: linear-gradient(135deg, ${grad[0]}, ${grad[1]});`;
}

function renderAssistantGrid(containerId, isModal) {
  const el = document.getElementById(containerId);
  el.innerHTML = Object.keys(ASSISTANTS).map((id) => {
    const a = getAssistant(id);
    const photo = getAssistantPhoto(id, "onboardGrid");
    const scale = a.onboardScale || 1;
    return `
    <button class="assistant-card ${state.assistant === a.id ? 'selected' : ''}" data-assistant="${a.id}" data-modal-target="${isModal ? 'assistantModal' : ''}" style="--accent:${a.accent}">
      <div class="assistant-avatar"><img src="${photo}" alt="${a.name}" loading="lazy" style="transform: scale(${scale}); transform-origin: bottom center;"></div>
      <div class="assistant-name" style="color:${a.accent}">${a.name}</div>
    </button>
  `;
  }).join("");
}

function renderLangGrid(containerId, isModal) {
  const el = document.getElementById(containerId);
  el.innerHTML = LANGUAGES.map((l) => `
    <button class="lang-pill ${state.lang === l.code ? 'selected' : ''}" data-lang="${l.code}" data-modal-target="${isModal ? 'langModal' : ''}" style="--accent:${l.accent}">
      <span class="lang-flag">${l.flag}</span> ${l.label}
    </button>
  `).join("");
}

function refreshOnboardContinue() {
  const btn = document.getElementById("onboardContinue");
  const wasDisabled = btn.disabled;
  const nowEnabled = !!(state.assistant && state.lang);
  btn.disabled = !nowEnabled;
  if (wasDisabled && nowEnabled) {
    const wave = document.getElementById("btnWave");
    if (wave) {
      wave.classList.remove("pulse");
      void wave.offsetWidth; // restart animation even if triggered again later
      wave.classList.add("pulse");
    }
  }
}

function setAvatarPhoto(elId, a, screenKey) {
  const el = document.getElementById(elId);
  if (!el) return;
  const photo = screenKey ? getAssistantPhoto(a.id, screenKey) : a.photo;
  el.style.cssText = gradientStyle(a.grad);
  el.innerHTML = `<img src="${photo}" alt="${a.name}" loading="lazy">`;
}

function updateAssistantUI() {
  const a = getAssistant(state.assistant);
  if (!a) return;

  setAvatarPhoto("introAvatar", a, "introHero");
  document.getElementById("introName").textContent = a.name;
  document.getElementById("introMsg").textContent = a.greet;

  setAvatarPhoto("nameAvatar", a, "nameScreen");

  setAvatarPhoto("settingsAvatar", a, "settings");
  document.getElementById("settingsName").textContent = a.name;

  const port = currentPort();
  document.getElementById("homePortName").textContent = `${port.meta.flag} ${port.meta.name}`;
  document.getElementById("homePortSub").textContent = port.meta.sub;
  const tzEl = document.getElementById("homeTz");
  if (tzEl) tzEl.textContent = `⏱ ${port.meta.tz}`;

  // Home hero — full-bleed portrait + guidance bubble. This replaced the old
  // small circular "assistant bubble" (partner feedback: make the assistant
  // read as the main guide of the screen, not an icon).
  const heroImg = document.getElementById("homeHeroImg");
  if (heroImg) heroImg.src = getAssistantPhoto(a.id, "homeBubble");
  const heroBubble = document.getElementById("homeHeroBubble");
  if (heroBubble) heroBubble.textContent = t("home.heroGreeting", { port: port.meta.name });

  document.getElementById("settingsLangVal").textContent =
    (LANGUAGES.find((l) => l.code === state.lang) || {}).flag || "›";

  const unionVal = document.getElementById("unionStatusVal");
  if (unionVal) {
    if (isUnionValid()) unionVal.textContent = t("settings.unionActive");
    else if (state.unionLastConfirmed) unionVal.textContent = t("settings.unionNeedsReconfirm");
    else unionVal.textContent = t("settings.unionNotConfirmed");
  }

  const mwaIdVal = document.getElementById("settingsMwaId");
  if (mwaIdVal) mwaIdVal.textContent = state.mwaId || "";

  document.getElementById("btnAccessStd").classList.toggle("active", state.accessView !== "vip");
  document.getElementById("btnAccessVip").classList.toggle("active", state.accessView === "vip");
  document.getElementById("btnAccessVip").classList.toggle("vip", state.accessView === "vip");

  const portSel = document.getElementById("settingsPortVal");
  if (portSel) portSel.textContent = `${port.meta.flag} ${port.meta.name} ›`;
  const ctxVal = document.getElementById("settingsContextVal");
  if (ctxVal) ctxVal.textContent = state.context === "in_city" ? t("settings.contextInCity") : t("settings.contextAtPort");

  saveState();
}

function goToScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const target = document.querySelector(`.screen[data-screen="${name}"]`);
  if (target) target.classList.add("active");

  const bottomNav = document.getElementById("bottomNav");
  if (["home", "volunteer", "settings", "detail", "subdetail", "assistantchat"].includes(name)) {
    bottomNav.style.display = "flex";
    document.querySelectorAll(".nav-item[data-nav]").forEach((n) => n.classList.toggle("active", n.dataset.nav === name));
  } else {
    bottomNav.style.display = "none";
  }

  if (name === "intro" || name === "name" || name === "home" || name === "settings") updateAssistantUI();
  if (name === "volunteer") {
    const ctxEl = document.getElementById("chatPortContext");
    if (ctxEl) ctxEl.textContent = currentPort().meta.name;
  }
  if (name === "assistantchat") openAssistantChat();
  if (name === "home") { maybeShowInstallBanner(); maybeShowLocationBanner(); }
}

let lastDetailKey = null;
let qrCountdownTimer = null;

// Category prompt text (categoryPrompts.*) and escalation/persona text now
// live in js/i18n.js so they can be translated. "wellness" has no chat
// prompt here — it's handled separately below, presented by the
// seafarer's own chosen assistant.

function openDetail(key) {
  const data = currentCategories()[key];
  if (!data) return;
  lastDetailKey = key;
  const port = currentPort();
  const valid = isUnionValid();
  const locked = !!data.gated && !valid;

  document.getElementById("detailCrumbPort").textContent = port.meta.name;
  document.getElementById("detailTitle").textContent = data.title + (locked ? " 🔒" : "");

  let bubbleHtml = "";
  if (data.gated) {
    const a = getAssistant(state.assistant) || getAssistant("alex");
    const msg = valid ? t("wellness.unlockedIntro") : t("wellness.lockedIntro");
    bubbleHtml = `
      <div class="assistant-bubble premium" style="margin:0 0 14px;">
        <div class="ab-avatar" style="${gradientStyle(a.grad)}"><img src="${getAssistantPhoto(a.id, "detailBubble")}" alt="${a.name}" loading="lazy"></div>
        <div>
          <div class="ab-name">${a.name} · ${t("wellness.roleSuffix")}</div>
          <div class="ab-text">${msg}</div>
        </div>
      </div>`;
  } else {
    const a = getAssistant(state.assistant) || getAssistant("alex");
    const msg = t(`categoryPrompts.${key}`) || "How can I help you here?";
    bubbleHtml = `
      <div class="assistant-bubble" style="margin:0 0 14px;">
        <div class="ab-avatar" style="${gradientStyle(a.grad)}"><img src="${getAssistantPhoto(a.id, "detailBubble")}" alt="${a.name}" loading="lazy"></div>
        <div>
          <div class="ab-name">${a.name}</div>
          <div class="ab-text">${msg}</div>
        </div>
      </div>`;
  }

  const rowsHtml = data.rows.map((r) => {
    const rowClickable = !!r.sd && !locked;
    return `
    <div class="d-row ${rowClickable ? 'clickable' : ''}" ${rowClickable ? `data-sd="${r.sd}"` : ""}>
      <div class="d-icon">${r.icon}</div>
      <div class="d-body">
        <div class="d-title">${r.title}</div>
        <div class="d-sub">${r.sub}</div>
        ${r.tag ? `<span class="d-tag ${r.tagClosed ? 'closed' : ''}">${r.tag}</span>` : ""}
      </div>
      ${r.sd ? `<div class="d-action">${locked ? '🔒' : '›'}</div>` : (r.action ? `<div class="d-action">${r.action}</div>` : "")}
    </div>
  `;
  }).join("");

  document.getElementById("detailList").innerHTML = bubbleHtml + rowsHtml;
  goToScreen("detail");
}

function openSubDetail(sdKey) {
  const sd = SUBDETAILS[sdKey];
  if (!sd) return;
  const port = currentPort();
  const locked = !!sd.gated && !isUnionValid();

  document.getElementById("subdetailCrumbPort").textContent = port.meta.name;
  document.getElementById("subdetailTitle").textContent = sd.title;

  let bodyHtml = "";
  if (sd.type === "hours_contacts") {
    let inner = "";
    if (sd.hours) {
      inner += `<div class="sd-card"><div class="sd-card-title">🕐 Hours</div><table class="hours-table">` +
        sd.hours.map(([day, time, today]) => `<tr class="${today ? 'hours-today' : ''}"><td>${day}</td><td>${time}</td></tr>`).join("") +
        `</table></div>`;
    }
    if (sd.contacts) {
      inner += `<div class="sd-card"><div class="sd-card-title">📞 Contacts</div>` +
        sd.contacts.map((c) => `<div class="contact-row"><div class="c-icon">${c.icon}</div><div class="c-body"><div class="c-title">${c.title}</div><div class="c-sub">${c.sub}</div></div>${c.action ? `<div class="c-action">${c.action}</div>` : ""}</div>`).join("") +
        `</div>`;
    }
    if (sd.directions) {
      inner += `<div class="sd-card"><div class="sd-card-title">📍 Getting there</div>` +
        sd.directions.map((c) => `<div class="contact-row"><div class="c-icon">${c.icon}</div><div class="c-body"><div class="c-title">${c.title}</div><div class="c-sub">${c.sub}</div></div>${c.action ? `<div class="c-action">${c.action}</div>` : ""}</div>`).join("") +
        `</div>`;
    }
    bodyHtml = wrapGate(inner, locked, sd);
  } else if (sd.type === "schedule") {
    let inner = `<div class="sd-card"><div class="sd-card-title">${sd.from}</div>` +
      sd.times.map((t, i) => `<div class="sched-row ${i === sd.nextIndex ? 'next' : ''}"><span>${t}</span>${i === sd.nextIndex ? '<span class="sched-tag">NEXT</span>' : ''}</div>`).join("") +
      `</div>`;
    if (sd.note) inner += `<div class="sd-card"><div class="sd-card-title">ℹ️ Pending</div><div class="sd-note">${sd.note}</div></div>`;
    bodyHtml = wrapGate(inner, locked, sd);
  } else if (sd.type === "qr_code") {
    const qrData = encodeURIComponent(state.mwaId || "MWA-DEMO");
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${qrData}`;
    let inner = `<div class="sd-card qr-card">
      <div class="sd-card-title" style="justify-content:center;">🔳 ${sd.title}</div>
      <div class="qr-id">${state.mwaId || ""}</div>
      <div class="qr-image-wrap"><img src="${qrImgUrl}" alt="QR code" class="qr-image"></div>
      <div class="qr-countdown" id="qrCountdown">Refreshes in 60s</div>
    </div>
    <div class="sd-card"><div class="sd-card-title">ℹ️ About this code</div><div class="sd-note">${sd.note}</div></div>`;
    bodyHtml = wrapGate(inner, locked, sd);
  }

  document.getElementById("subdetailBody").innerHTML = bodyHtml;
  clearInterval(qrCountdownTimer);
  if (sd.type === "qr_code" && !locked) startQrCountdown();
  goToScreen("subdetail");
}
function startQrCountdown() {
  let seconds = 60;
  const el = document.getElementById("qrCountdown");
  if (!el) return;
  el.textContent = `Refreshes in ${seconds}s`;
  qrCountdownTimer = setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) seconds = 60; // demo loop — real rotation happens server-side once backend is live
    const liveEl = document.getElementById("qrCountdown");
    if (!liveEl) { clearInterval(qrCountdownTimer); return; }
    liveEl.textContent = `Refreshes in ${seconds}s`;
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

function openModal(id) {
  document.getElementById(id).classList.add("open");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Coordinator demo replies now come from t("coordinator.demoReplies") in i18n.js.
let chatReplyIndex = 0;

function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  const body = document.getElementById("chatBody");
  body.insertAdjacentHTML("beforeend", `<div class="chat-msg me">${escapeHtml(text)}</div>`);
  input.value = "";
  body.scrollTop = body.scrollHeight;
  setTimeout(() => {
    const replies = t("coordinator.demoReplies");
    const reply = replies[chatReplyIndex % replies.length];
    chatReplyIndex++;
    body.insertAdjacentHTML("beforeend", `<div class="chat-msg them">${reply}</div>`);
    body.scrollTop = body.scrollHeight;
  }, 900);
}

// ---- ASSISTANT CHAT (demo) --------------------------------------------
// Prototype-level only: keyword matching stands in for the real AI classification
// described in the scope of work (section 5). Real logic — grounding in port data,
// the three-tier question model, and red-line detection — is the specialist's job.
// Escalation phrasing per persona now lives in t("escalation.<id>") in i18n.js.

const COMPLEX_TOPIC_KEYWORDS = [
  "sad", "lonely", "alone", "can't sleep", "cant sleep", "no one listens", "nobody listens",
  "depressed", "hopeless", "hurt myself", "suicide", "kill myself", "want to die",
  "captain", "master", "argue", "argued", "fight", "shouted", "yelled", "threat", "threatened",
  "bar", "alcohol", "drink", "girl", "girlfriend", "women", "woman", "dating", "meet someone",
  "bad news from home", "family problem", "divorce",
];

function isComplexTopic(text) {
  const t = text.toLowerCase();
  return COMPLEX_TOPIC_KEYWORDS.some((kw) => t.includes(kw));
}

// Assistant demo replies now come from t("demoReplies") in i18n.js.
let assistantReplyIndex = 0;

// Quick-action chips shown until the seafarer sends their first message.
// Trimmed to items that don't already duplicate the home screen (partner
// feedback) — Seafarers' Centre/Pharmacy/Medical/Emergency live as home
// tiles or the Emergency card already, so they're not repeated here.
const QUICK_ACTIONS = [
  { key: "returnToShip",        icon: "🚢", type: "detail", target: "transport" },
  { key: "coordinator",         icon: "👤", type: "screen", target: "volunteer" },
  { key: "needTransportToShip", icon: "🚌", type: "detail", target: "transport" },
];

// Session state for the assistant-chat screen (point 8 fix): once opened,
// the conversation stays intact — navigating into a category and pressing
// "back" returns here instead of dumping the seafarer back on the standard
// home screen. Only an explicit "go home" (bottom-nav Port, or this
// screen's own back arrow) ends the session and resets it.
let chatSessionOpen = false;
let returnToChat = false;

function hideAssistantChatQuickActions() {
  const qa = document.getElementById("qaGrid");
  if (qa) qa.classList.add("hidden");
}

function openAssistantChat() {
  const a = getAssistant(state.assistant) || getAssistant("alex");
  const header = document.getElementById("assistantChatHeader");
  if (header) header.style.cssText = gradientStyle(a.grad);
  setAvatarPhoto("chatAssistantAvatar", a, "chatHeader");
  document.getElementById("chatAssistantName").textContent = a.name;

  if (chatSessionOpen) return; // resuming — leave the existing thread as-is
  chatSessionOpen = true;

  const qaGrid = document.getElementById("qaGrid");
  if (qaGrid) {
    qaGrid.classList.remove("hidden");
    qaGrid.innerHTML = QUICK_ACTIONS.map((qa) => `
      <button class="qa-chip ${qa.urgent ? "urgent" : ""}" data-qa="${qa.key}">
        <span class="qa-icon">${qa.icon}</span><span>${t(`quickActions.${qa.key}`)}</span>
      </button>
    `).join("");
  }

  const body = document.getElementById("assistantChatBody");
  body.innerHTML = `<div class="chat-msg them">${escapeHtml(a.greet)}</div>`;
  const input = document.getElementById("assistantChatInput");
  if (input) input.value = "";
}

function sendAssistantChatMessage() {
  const input = document.getElementById("assistantChatInput");
  const text = input.value.trim();
  if (!text) return;
  hideAssistantChatQuickActions();
  const body = document.getElementById("assistantChatBody");
  const existingToggle = document.getElementById("escalationToggle");
  if (existingToggle) existingToggle.remove(); // sending a new message supersedes an unanswered toggle

  body.insertAdjacentHTML("beforeend", `<div class="chat-msg me">${escapeHtml(text)}</div>`);
  input.value = "";
  body.scrollTop = body.scrollHeight;

  const a = getAssistant(state.assistant) || getAssistant("alex");
  setTimeout(() => {
    if (isComplexTopic(text)) {
      const msg = t(`escalation.${a.id}`) || t("escalation.alex");
      body.insertAdjacentHTML("beforeend", `<div class="chat-msg them">${msg}</div>`);
      body.insertAdjacentHTML("beforeend", `
        <div class="escalation-toggle" id="escalationToggle">
          <button class="esc-btn esc-continue" id="escContinueBtn">${t("escalationToggle.continueBtn")}</button>
          <button class="esc-btn esc-coordinator" id="escCoordinatorBtn">${t("escalationToggle.coordinatorBtn")}</button>
        </div>`);
    } else {
      const replies = t("demoReplies");
      const reply = replies[assistantReplyIndex % replies.length];
      assistantReplyIndex++;
      body.insertAdjacentHTML("beforeend", `<div class="chat-msg them">${escapeHtml(reply)}</div>`);
    }
    body.scrollTop = body.scrollHeight;
  }, 900);
}

let deferredInstallPrompt = null;

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function maybeShowInstallBanner() {
  if (isStandalone()) return;
  if (localStorage.getItem("mwapp_install_dismissed") === "1") return;
  const banner = document.getElementById("installBanner");
  const sub = document.getElementById("installSub");
  if (isIOS()) {
    sub.textContent = t("home.install.subIOS");
    banner.classList.remove("hidden");
  } else if (deferredInstallPrompt) {
    sub.textContent = t("home.install.subDefault");
    banner.classList.remove("hidden");
  }
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  maybeShowInstallBanner();
});

// ---- Lighthouse beam positioning ---------------------------------------
// .lh-bg is shown with background-size:cover, which crops unpredictably
// depending on the VISITOR's actual screen ratio — guessing a fixed CSS
// percentage for where the lamp lands broke on real phones twice before.
// Instead, this replicates the browser's own cover-fit math using the
// REAL rendered size of .lh-bg, and sets the beam's origin as CSS
// variables the browser applies itself — correct on any device.
const LH_IMG_W = 992, LH_IMG_H = 1586; // natural size of assets/scenes/lighthouse-port.jpg
const LH_LAMP_X_PCT = 15.62, LH_LAMP_Y_PCT = 48.55; // lamp position within that source image

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
    // Normal case for phones: screen proportionally taller than the photo.
    // Height drives the scale -> full image height shows (no vertical crop,
    // position:top is moot), sides get cropped equally (position:center).
    const scale = scaleH;
    const scaledW = LH_IMG_W * scale;
    const cropX = (scaledW - cw) / 2;
    lampPctX = (((LH_LAMP_X_PCT / 100) * scaledW - cropX) / cw) * 100;
    lampPctY = LH_LAMP_Y_PCT;
  } else {
    // Screen proportionally wider/shorter than the photo: width drives the
    // scale, full width shows, excess height is cropped off the BOTTOM only.
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
  applyStaticI18n();
  renderAssistantGrid("assistantGrid", false);
  renderLangGrid("langGrid", false);
  renderAssistantGrid("assistantGridModal", true);
  renderLangGrid("langGridModal", true);
  refreshOnboardContinue();
  positionBeamAndEmblem();
  window.addEventListener("resize", positionBeamAndEmblem);
  window.addEventListener("orientationchange", () => setTimeout(positionBeamAndEmblem, 150));

  if (state.assistant && state.lang) {
    // Returning user — first-launch screens are shown once in a lifetime only.
    goToScreen("home");
  }

  document.body.addEventListener("click", (e) => {
    if (e.target.id === "nameSave") {
      state.name = document.getElementById("nameInput").value.trim();
    }

    const goEl = e.target.closest("[data-go]");
    if (goEl) {
      const isBackBtn = goEl.classList.contains("back-btn");
      const currentScreenEl = document.querySelector(".screen.active");
      const currentScreen = currentScreenEl ? currentScreenEl.dataset.screen : null;
      let target = goEl.dataset.go;

      if (target === "home" && isBackBtn && returnToChat && currentScreen !== "assistantchat") {
        // Came here from the assistant chat (via a quick action) — "back"
        // should return to that ongoing conversation, not dump the seafarer
        // on the standard home screen.
        target = "assistantchat";
      } else if (target === "home") {
        // An explicit "go all the way home" (bottom-nav Port, this screen's
        // own back arrow, Save/Skip on the name screen) — end the chat
        // session and the premium view; both start fresh next time.
        state.accessView = "std";
        returnToChat = false;
        chatSessionOpen = false;
      }
      goToScreen(target);
    }

    const detailEl = e.target.closest("[data-detail]");
    if (detailEl) { openDetail(detailEl.dataset.detail); }

    const qaEl = e.target.closest("[data-qa]");
    if (qaEl) {
      const qa = QUICK_ACTIONS.find((x) => x.key === qaEl.dataset.qa);
      if (qa) {
        returnToChat = true; // leaving chat via a quick action — remember to come back here
        if (qa.type === "detail") { openDetail(qa.target); }
        else if (qa.type === "screen") { goToScreen(qa.target); }
      }
    }

    const sdEl = e.target.closest("[data-sd]");
    if (sdEl) { openSubDetail(sdEl.dataset.sd); }

    const modalEl = e.target.closest("[data-modal]");
    if (modalEl) { openModal(modalEl.dataset.modal); }

    const accessEl = e.target.closest("[data-access]");
    if (accessEl) {
      state.accessView = accessEl.dataset.access;
      updateAssistantUI();
      // Partner feedback: fewer taps. Tapping "Trade Union" jumps the
      // seafarer straight to the premium level — the assistant greets them
      // there and explains card activation. No intermediate "explore
      // premium" banner step on the home screen anymore.
      if (accessEl.dataset.access === "vip") {
        openDetail("wellness");
      }
    }

    const portEl = e.target.closest("[data-port]");
    if (portEl) {
      state.portId = portEl.dataset.port;
      updateAssistantUI();
      closeModal("portModal");
    }

    const ctxEl = e.target.closest("[data-context]");
    if (ctxEl) {
      state.context = ctxEl.dataset.context;
      updateAssistantUI();
      closeModal("contextModal");
    }

    const assistantEl = e.target.closest("[data-assistant]");
    if (assistantEl) {
      state.assistant = assistantEl.dataset.assistant;
      renderAssistantGrid("assistantGrid", false);
      renderAssistantGrid("assistantGridModal", true);
      refreshOnboardContinue();
      updateAssistantUI();
      if (assistantEl.dataset.modalTarget) closeModal(assistantEl.dataset.modalTarget);
    }

    const langEl = e.target.closest("[data-lang]");
    if (langEl) {
      state.lang = langEl.dataset.lang;
      renderLangGrid("langGrid", false);
      renderLangGrid("langGridModal", true);
      renderAssistantGrid("assistantGrid", false);
      renderAssistantGrid("assistantGridModal", true);
      refreshOnboardContinue();
      applyStaticI18n();
      updateAssistantUI();
      if (langEl.dataset.modalTarget) closeModal(langEl.dataset.modalTarget);
    }

    if (e.target === document.getElementById("langModal")) closeModal("langModal");
    if (e.target === document.getElementById("assistantModal")) closeModal("assistantModal");
    if (e.target === document.getElementById("portModal")) closeModal("portModal");
    if (e.target === document.getElementById("contextModal")) closeModal("contextModal");

    if (e.target.id === "editNameRow" || e.target.closest("#editNameRow")) {
      goToScreen("name");
    }

    if (e.target.id === "unionRow" || e.target.closest("#unionRow")) {
      openModal("unionModal");
    }

    if (e.target.id === "unionSimActiveBtn") {
      state.unionActive = true;
      state.unionLastConfirmed = todayISO();
      closeModal("unionModal");
      state.accessView = "vip";
      updateAssistantUI();
      openDetail("wellness");
    }

    if (e.target.id === "unionSimInactiveBtn") {
      state.unionActive = false;
      state.unionLastConfirmed = todayISO();
      closeModal("unionModal");
      state.accessView = "std";
      updateAssistantUI();
      goToScreen("home");
      openModal("unionDeniedModal");
    }

    if (e.target.id === "unionCloseBtn") {
      closeModal("unionModal");
    }

    if (e.target.id === "unionDeniedCloseBtn") {
      closeModal("unionDeniedModal");
    }

    if (e.target.id === "resetAppRow" || e.target.closest("#resetAppRow")) {
      localStorage.removeItem("mwapp_state");
      location.reload();
    }

    if (e.target.id === "installBtn") {
      if (isIOS()) {
        openModal("iosInstallModal");
      } else if (deferredInstallPrompt) {
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
      requestLocation((ok) => {
        dismissLocationBanner();
        if (!ok) { /* silently ignored — manual port selection remains available in Settings */ }
        btn.textContent = originalText;
        btn.disabled = false;
      });
    }

    if (e.target.id === "locationCloseBtn") {
      dismissLocationBanner();
    }

    if (e.target.id === "detectLocationRow" || e.target.closest("#detectLocationRow")) {
      const row = document.getElementById("detectLocationRow");
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
      const t = document.getElementById("escalationToggle");
      if (t) t.remove();
    }
    if (e.target.id === "escCoordinatorBtn") {
      const t = document.getElementById("escalationToggle");
      if (t) t.remove();
      goToScreen("volunteer");
    }
  });

  document.getElementById("chatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChatMessage();
  });

  document.getElementById("assistantChatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendAssistantChatMessage();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});
