// ============================================================
// MWApp prototype — vanilla JS state machine, no build step.
// ============================================================

// Visual identity only — name/tag/greet text lives in js/i18n.js so it can be
// translated per language. Use getAssistant(id) (defined in i18n.js) to get an
// assistant merged with its translated text fields.
const ASSISTANTS = {
  alex:   { id: "alex",   icon: "⚓", grad: ["#0D6E8A", "#0A5A72"], accent: "#29C5FF", photo: "assets/avatars/alex.png",   photos: ["assets/avatars/alex.png"] },
  omar:   { id: "omar",   icon: "🧭", grad: ["#1B3A6B", "#B8860B"], accent: "#2AD9A8", photo: "assets/avatars/omar.png",   photos: ["assets/avatars/omar.png"] },
  sophia: { id: "sophia", icon: "⭐", grad: ["#5DD3F0", "#0D6E8A"], accent: "#B15CFF", photo: "assets/avatars/sophia.png", photos: ["assets/avatars/sophia.png"] },
  grace:  { id: "grace",  icon: "🌙", grad: ["#E8523A", "#B8860B"], accent: "#FFA83D", photo: "assets/avatars/grace.png",  photos: ["assets/avatars/grace.png"] },
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

  // ── TALLINN · SEAFARERS' CENTRE ────────────────────────────────────
  tallinn_centre_about: {
    title: "About the Centre",
    hours: [
      ["Monday", "08:00 – 20:00"], ["Tuesday", "08:00 – 20:00"], ["Wednesday", "08:00 – 20:00"],
      ["Thursday", "08:00 – 20:00"], ["Friday", "08:00 – 20:00"], ["Saturday", "09:00 – 17:00"], ["Sunday", "10:00 – 15:00"],
    ],
    contacts: [
      { icon: "📞", title: "+372 5555 1234", sub: "Main line · English, Russian spoken", action: "📞" },
      { icon: "🧑‍💼", title: "Marta Kask", sub: "Centre Coordinator", action: "💬" },
      { icon: "🌐", title: "seafarerscentre.ee", sub: "Centre website", action: "›" },
      { icon: "✉️", title: "info@seafarerscentre.ee", sub: "Email", action: "✉️" },
    ],
    note: "This page holds only the core details. Anything else about the centre — ask your assistant.",
  },

  tallinn_centre_services: {
    title: "Services",
    groups: [
      { label: "Hospitality", icon: "☕", items: ["Coffee & tea", "Snacks", "TV lounge", "Outdoor terrace"] },
      { label: "Recreation", icon: "🎱", items: ["Rest & relaxation area", "Games room", "Billiards", "Table tennis", "Library", "Book exchange"] },
      { label: "Connectivity", icon: "📶", items: ["Free Wi-Fi", "SIM cards"] },
      { label: "Welfare services", icon: "🤝", items: ["Welfare shop", "Volunteers", "Events & excursions", "Currency exchange"] },
      { label: "Spiritual care", icon: "🕊", items: ["Prayer room"] },
    ],
  },

  tallinn_centre_shuttle: {
    title: "Free Shuttle Bus",
    from: "Departs from Gate D",
    times: ["09:00", "12:00", "14:30", "17:00", "19:00"],
    nextIndex: 2,
    directions: [
      { icon: "📍", title: "Pickup point", sub: "Gate D, next to the checkpoint barrier", action: "🧭" },
      { icon: "🚐", title: "How to recognise it", sub: "White minibus, blue IMWIRSA anchor decal on both doors", action: "" },
      { icon: "🔄", title: "Return schedule", sub: "Leaves the centre 20 minutes after each arrival", action: "" },
    ],
    note: "Return fare after 20:00 — " + TBD.toLowerCase() + ".",
  },

  tallinn_centre_location: {
    title: "Location & Route",
    contacts: [
      { icon: "📍", title: "Sadama 25, Tallinn 10111", sub: "0.8 km from the passenger terminal", action: "" },
    ],
    maps: { lat: 59.4468, lng: 24.7621, label: "Tallinn Seafarers' Centre" },
    directions: [
      { icon: "🚐", title: "Shuttle from Gate D", sub: "Every 2 hours · free", action: "›" },
      { icon: "🚶", title: "On foot: 12 minutes", sub: "Sadama tn → turn at the lighthouse", action: "🧭" },
    ],
  },

  // ── TALLINN · TRANSPORT ────────────────────────────────────────────
  // "Leaving the Port" is the single most-asked question ashore and also the
  // riskiest to state as fact — a wrong gate or document rule can strand a
  // seafarer at the checkpoint. So it carries `updated` (provenance line) and
  // its callout points at the ship's agent as the authority, not the app.
  tallinn_transport_leaving: {
    title: "Leaving the Port",
    callout: { tone: "ok", text: "Yes — shore leave is normally permitted at Old City Harbour. Always confirm with your Master or ship's agent before you go: rules can change per berth and per vessel." },
    sections: [
      { icon: "🚪", title: "Exit gate", rows: [
        { icon: "1️⃣", title: "Gate 1 — main checkpoint", sub: "Pedestrian exit, open 24/7" },
        { icon: "🅳", title: "Gate D — shuttle pickup", sub: "Vehicles only · no pedestrian exit" },
      ]},
      { icon: "🪪", title: "Take with you", rows: [
        { icon: "📘", title: "Seafarer's Identity Document", sub: "Or passport with a valid visa where required" },
        { icon: "🎫", title: "Port pass", sub: "Issued on board · show at the Gate 1 checkpoint" },
        { icon: "📄", title: "Shore pass / crew list copy", sub: "Ask your agent whether your vessel requires one" },
      ]},
      { icon: "🚶", title: "On foot", rows: [
        { icon: "⚠️", title: "Stay on marked walkways", sub: "Do not cross terminal or container areas on foot" },
        { icon: "🦺", title: "High-visibility vest", sub: "Required inside the operational port area" },
      ]},
    ],
    note: "If the checkpoint turns you back, call the Seafarers' Centre — they deal with the port authority daily and can usually sort it out faster than anyone on board.",
    updated: "24 July 2026",
  },

  tallinn_transport_taxi: {
    title: "Taxi",
    sections: [
      { icon: "📱", title: "Apps", rows: [
        { icon: "🟢", title: "Bolt", sub: "Estonian app · card payment in-app · most common here", action: "›" },
        { icon: "⚫", title: "Uber", sub: "Available in Tallinn · similar pricing", action: "›" },
      ]},
      { icon: "🚕", title: "Street taxi", rows: [
        { icon: "🏷", title: "Price list must be on the rear window", sub: "By Estonian law · if there is none, take a different car" },
        { icon: "🧾", title: "Always ask for a receipt", sub: "Required if you later dispute the fare" },
      ]},
      { icon: "📍", title: "Pickup point", rows: [
        { icon: "🚖", title: "Terminal D forecourt", sub: "Right of the main entrance", action: "🧭" },
      ]},
    ],
    note: "Typical fare to the city centre is around €5–8 by app. If a driver at the terminal offers a fixed price well above that without a meter, walk away — it's the most common way seafarers get overcharged here.",
    updated: "24 July 2026",
  },

  tallinn_transport_public: {
    title: "Public Transport",
    sections: [
      { icon: "🚏", title: "Nearest stop", rows: [
        { icon: "🚶", title: "Linnahall stop — 300 m from Gate 1", sub: "About a 4-minute walk" },
      ]},
      { icon: "🚎", title: "Routes", rows: [
        { icon: "2️⃣", title: "Bus 2", sub: "Port → Viru keskus (city centre) · every 10–15 min" },
        { icon: "🚋", title: "Tram 1 / 2", sub: "From Linnahall towards the Old Town" },
      ]},
      { icon: "🎫", title: "Tickets", rows: [
        { icon: "💳", title: "Contactless bank card", sub: "Tap on the validator when boarding · simplest option" },
        { icon: "🏪", title: "Paper ticket from R-Kiosk", sub: "Buy before boarding · cheaper than from the driver" },
      ]},
    ],
    note: "Journey to the city centre is about 10 minutes. Last buses run until roughly 23:00 — after that, use an app taxi.",
    updated: "24 July 2026",
  },

  // ── TALLINN · SHOPS & FOOD ─────────────────────────────────────────
  tallinn_shops_supermarkets: {
    title: "Supermarkets",
    sections: [
      { icon: "🛒", title: "Nearest stores", rows: [
        { icon: "🛍", title: "Rimi", sub: "600 m from the gate · 08:00–22:00 daily · free Wi-Fi", action: "🧭" },
        { icon: "🛍", title: "Selver", sub: "Inside Viru keskus · 09:00–21:00 · larger selection", action: "🧭" },
      ]},
      { icon: "🌙", title: "Late & 24/7", rows: [
        { icon: "🕛", title: "Circle K at the port exit", sub: "Open 24/7 · basics, snacks, coffee, SIM top-ups", action: "🧭" },
      ]},
      { icon: "🏬", title: "Shopping centres", rows: [
        { icon: "🏢", title: "Viru keskus", sub: "2 km · supermarket, clothing, electronics, food court", action: "🧭" },
      ]},
    ],
    note: "Rimi is the closest and the usual choice for a quick run before sailing. Bring a bag — carrier bags are charged separately in Estonia.",
    updated: "24 July 2026",
  },

  tallinn_shops_food: {
    title: "Food & Drinks",
    sections: [
      { icon: "⚓", title: "Seafarer-friendly", rows: [
        { icon: "☕", title: "Seafarers' Centre café", sub: "Hot meal about €6 · coffee free · open until 19:00", action: "🧭" },
      ]},
      { icon: "🍔", title: "Fast food", rows: [
        { icon: "🍟", title: "Chains at Viru keskus food court", sub: "€6–10 for a meal · open until 21:00", action: "🧭" },
      ]},
      { icon: "🍽", title: "Local restaurants", rows: [
        { icon: "🥘", title: "Old Town, Vene & Viru streets", sub: "Estonian and international · €12–20 main course", action: "🧭" },
        { icon: "🐟", title: "Balti jaama turg market hall", sub: "Cheap, good, popular with locals · 09:00–19:00", action: "🧭" },
      ]},
    ],
    note: "Prices in the Old Town rise sharply on the main tourist streets. One street back is usually a third cheaper for the same meal.",
    updated: "24 July 2026",
  },

  tallinn_shops_sim: {
    title: "Electronics & SIM Cards",
    sections: [
      { icon: "📡", title: "Mobile operators", rows: [
        { icon: "🟦", title: "Tele2 · Elisa · Telia", sub: "Prepaid SIM about €5 for 3 GB · sold at R-Kiosk by the port exit", action: "🧭" },
        { icon: "🪪", title: "ID may be requested", sub: "Bring your seafarer's document when buying a SIM" },
      ]},
      { icon: "📶", title: "Free Wi-Fi", rows: [
        { icon: "🏛", title: "Seafarers' Centre", sub: "Free for all visiting seafarers · no password needed at the desk" },
        { icon: "⚓", title: "Port Wi-Fi", sub: "Network: TallinnPort · Password: seafarer2026" },
      ]},
      { icon: "🔌", title: "Electronics", rows: [
        { icon: "🔋", title: "Chargers & adapters", sub: "Euronics / Photopoint at Viru keskus · Estonia uses type C/F, 230 V", action: "🧭" },
      ]},
      { icon: "💱", title: "Money", rows: [
        { icon: "🏧", title: "SEB Bank ATM", sub: "400 m from the gate · EUR · card withdrawal", action: "🧭" },
      ]},
    ],
    note: "An Estonian prepaid SIM works across the whole EU at no extra cost, so it is worth buying here even if your next port is elsewhere in Europe.",
    updated: "24 July 2026",
  },

  tallinn_shops_pharmacies: {
    title: "Pharmacies",
    sections: [
      { icon: "💊", title: "Nearest", rows: [
        { icon: "🏥", title: "Apotheka — Sadama 15", sub: "500 m · Mon–Fri 09:00–20:00 · closed at weekends", action: "🧭" },
        { icon: "🏥", title: "Benu — Viru keskus", sub: "2 km · daily 09:00–21:00", action: "🧭" },
      ]},
      { icon: "🌙", title: "24/7", rows: [
        { icon: "🕛", title: "Tõnismäe Apotheka", sub: "Open 24 hours · about 3 km from the port", action: "🧭" },
      ]},
      { icon: "📋", title: "Medicines", rows: [
        { icon: "🧾", title: "Prescription medicines", sub: "An EU prescription is accepted · from outside the EU, a doctor's visit is usually needed first" },
        { icon: "💊", title: "Over the counter", sub: "Painkillers, cold remedies, seasickness tablets, bandages" },
      ]},
    ],
    note: "Pharmacists in Tallinn speak English and Russian and can advise on minor complaints without a doctor. For anything serious, see Emergency Contacts.",
    updated: "24 July 2026",
  },

  // ── TALLINN · CITY LIFE ────────────────────────────────────────────
  // Static places only — no timed walking routes and no live event feed.
  // Both were deliberately dropped: a route implies the app has worked out
  // that the seafarer will be back before the ship sails, which we cannot
  // promise, and live events need a backend and someone to keep them fresh.
  tallinn_city_parks: {
    title: "Parks & Waterfronts",
    sections: [
      { icon: "🌊", title: "Waterfront", rows: [
        { icon: "🚶", title: "Kultuurikilomeeter promenade", sub: "Starts right outside the port · flat seaside walk, benches along the way", action: "🧭" },
        { icon: "🌅", title: "Patarei seafront", sub: "Open view over the bay · quiet in the evening", action: "🧭" },
      ]},
      { icon: "🌳", title: "Green space", rows: [
        { icon: "🌲", title: "Kadriorg park", sub: "3 km · large wooded park, ponds, benches · free, always open", action: "🧭" },
        { icon: "🪑", title: "Tornide väljak", sub: "1.5 km · lawn under the old town wall · popular quiet spot", action: "🧭" },
      ]},
      { icon: "👁", title: "Viewpoints", rows: [
        { icon: "🏰", title: "Kohtuotsa platform, Toompea", sub: "Free · the classic view over the rooftops and the port", action: "🧭" },
      ]},
    ],
    note: "If you only have an hour and want air rather than sightseeing, the promenade outside the port is the simplest choice — you never lose sight of the harbour.",
    updated: "24 July 2026",
  },

  tallinn_city_culture: {
    title: "Culture & Must-See",
    sections: [
      { icon: "⭐", title: "Top 5", rows: [
        { icon: "1️⃣", title: "Old Town & Town Hall Square", sub: "UNESCO medieval centre · 2 km · free to walk", action: "🧭" },
        { icon: "2️⃣", title: "Toompea hill & viewing platforms", sub: "Upper town, cathedral, panorama over the port", action: "🧭" },
        { icon: "3️⃣", title: "Alexander Nevsky Cathedral", sub: "Orthodox cathedral on Toompea · free entry, modest dress", action: "🧭" },
        { icon: "4️⃣", title: "Seaplane Harbour (Lennusadam)", sub: "Maritime museum in a seaplane hangar · submarine, icebreaker · 1.5 km", action: "🧭" },
        { icon: "5️⃣", title: "Kadriorg Palace & park", sub: "Baroque palace and art museum · 3 km", action: "🧭" },
      ]},
    ],
    note: "Seaplane Harbour is the one most seafarers come back talking about — it is close to the port, indoors, and makes sense whatever the weather.",
    updated: "24 July 2026",
  },

  tallinn_city_free: {
    title: "Free Time & Relax",
    sections: [
      { icon: "🆓", title: "Free to visit", rows: [
        { icon: "🏰", title: "Old Town streets & city wall", sub: "Walking the medieval centre costs nothing" },
        { icon: "⛪", title: "Churches and the cathedral", sub: "Free entry · donations optional" },
        { icon: "👁", title: "Kohtuotsa & Patkuli platforms", sub: "Free viewpoints over the city and the harbour", action: "🧭" },
      ]},
      { icon: "📞", title: "Somewhere to call home", rows: [
        { icon: "🏛", title: "Seafarers' Centre lounge", sub: "Free Wi-Fi, power sockets, quiet corner · no obligation to buy anything", action: "🧭" },
        { icon: "📚", title: "Tallinn Central Library", sub: "Free Wi-Fi, warm, seats, sockets · no purchase needed · 2 km", action: "🧭" },
        { icon: "🏬", title: "Viru keskus seating areas", sub: "Free Wi-Fi, open until 21:00", action: "🧭" },
      ]},
    ],
    note: "If you just need a warm place with signal to speak to your family, the centre's lounge is the safest bet — nobody there will hurry you along.",
    updated: "24 July 2026",
  },

  tallinn_city_safety: {
    title: "Safety",
    // The one genuine danger of a city card is a seafarer losing track of time.
    // Rather than build timed routes (rejected — the app cannot promise you'll
    // make it back), the callout points at the Ship screen, which already
    // solves the "which gate was it?" problem.
    callout: { tone: "warn", text: "Before you leave, agree your return time with the ship and mark your ship's position on the Ship screen. Finding the right gate again after dark is the single most common problem ashore." },
    sections: [
      { icon: "🟢", title: "General risk", rows: [
        { icon: "🛡", title: "Low risk — normal precautions", sub: "Tallinn is a safe city · ordinary big-city care is enough" },
      ]},
      { icon: "🌙", title: "At night", rows: [
        { icon: "🧑‍🤝‍🧑", title: "Go ashore with colleagues", sub: "Safer than walking into town alone, especially late" },
        { icon: "🚕", title: "Use an app taxi after dark", sub: "Bolt or Uber · avoid unmarked cars offering rides at the terminal" },
        { icon: "🍺", title: "Alcohol", sub: "Bars close late · drinking in public streets and parks is prohibited" },
      ]},
      { icon: "⚠️", title: "Watch out for", rows: [
        { icon: "💸", title: "Fixed-price offers without a meter", sub: "The usual way seafarers get overcharged near the terminal" },
        { icon: "🎭", title: "People claiming to represent the centre", sub: "Real staff never ask you for money · ignore them, or call the police" },
      ]},
      { icon: "📞", title: "If something goes wrong", rows: [
        { icon: "🚨", title: "112", sub: "Police and ambulance · free · 24/7 · English spoken", action: "📞" },
        { icon: "🏛", title: "Seafarers' Centre", sub: "+372 5555 1234 · they deal with these situations regularly", action: "📞" },
      ]},
    ],
    updated: "24 July 2026",
  },

  // ── TALLINN · SPIRITUAL CARE ───────────────────────────────────────
  // Static contacts only. No built-in chat with anyone outside IMWIRSA:
  // that would create a second escalation path around the Coordinator.
  // The neutral "no particular faith" row is kept first on the level-2
  // list, because a seafarer who simply wants a human conversation should
  // not have to pick a denomination before he can ask for one.
  tallinn_spiritual_stella: {
    title: "Stella Maris",
    sections: [
      { icon: "🤝", title: "What they offer", rows: [
        { icon: "💬", title: "Ship visits and conversation", sub: "Chaplain comes aboard on request · no religious obligation" },
        { icon: "🙏", title: "Prayer, confession, blessing", sub: "Catholic chaplaincy · other denominations welcome" },
        { icon: "🚐", title: "Transport and practical help", sub: "Shopping runs, SIM cards, help contacting family" },
      ]},
      { icon: "🕐", title: "When", rows: [
        { icon: "📅", title: "Mon–Sat, 10:00 – 18:00", sub: "Ship visits by arrangement, including outside these hours" },
      ]},
    ],
    contacts: [
      { icon: "🧑‍💼", title: "Fr. Mihkel Laar — port chaplain", sub: "English, Estonian, Russian", action: "💬" },
      { icon: "📞", title: "+372 5555 2210", sub: "Also WhatsApp", action: "📞" },
    ],
    updated: "24 July 2026",
  },

  tallinn_spiritual_mts: {
    title: "The Mission to Seafarers",
    sections: [
      { icon: "🤝", title: "What they offer", rows: [
        { icon: "💬", title: "Ship visits and a listening ear", sub: "Anglican chaplaincy · open to seafarers of any faith or none" },
        { icon: "📶", title: "Help getting online", sub: "Wi-Fi access and SIM cards for calling home" },
        { icon: "⚖️", title: "Support in difficulty", sub: "Abandonment, unpaid wages, bereavement · they know who to call" },
      ]},
      { icon: "🕐", title: "When", rows: [
        { icon: "📅", title: "Mon–Fri, 09:00 – 17:00", sub: "Emergency ship visits outside hours by phone" },
      ]},
    ],
    contacts: [
      { icon: "📞", title: "+372 5555 2244", sub: "English spoken", action: "📞" },
      { icon: "🌐", title: "missiontoseafarers.org", sub: "Global network · chaplains in most major ports", action: "›" },
    ],
    updated: "24 July 2026",
  },

  tallinn_spiritual_muslim: {
    title: "Muslim Support",
    sections: [
      { icon: "🕌", title: "Where", rows: [
        { icon: "📍", title: "Tallinn Islamic Centre", sub: "Keevise 9 · prayer hall, washing facilities · 4 km from the port", action: "🧭" },
        { icon: "🕐", title: "Open for the five daily prayers", sub: "Friday prayer around midday · arrive a little early" },
      ]},
      { icon: "🤝", title: "Help available", rows: [
        { icon: "💬", title: "Conversation in Arabic, Turkish, Russian", sub: "Ask at the centre · volunteers are usually present" },
        { icon: "🍽", title: "Halal food", sub: "Several shops and cafés in the city · ask the centre for the nearest" },
      ]},
    ],
    contacts: [
      { icon: "📞", title: "+372 5555 2277", sub: "Islamic Centre, general enquiries", action: "📞" },
    ],
    updated: "24 July 2026",
  },

  tallinn_spiritual_other: {
    title: "Other Faith Communities",
    sections: [
      { icon: "☦️", title: "Orthodox", rows: [
        { icon: "⛪", title: "Alexander Nevsky Cathedral, Toompea", sub: "Daily services · Church Slavonic and Estonian", action: "🧭" },
        { icon: "⛪", title: "St Nicholas Church, Old Town", sub: "Russian Orthodox parish · 2 km", action: "🧭" },
      ]},
      { icon: "✝️", title: "Protestant & Catholic", rows: [
        { icon: "⛪", title: "St Peter and St Paul, Old Town", sub: "Roman Catholic · Sunday Mass in several languages", action: "🧭" },
        { icon: "⛪", title: "Charles's Church", sub: "Estonian Evangelical Lutheran · 2.5 km", action: "🧭" },
      ]},
      { icon: "🕊", title: "Not listed here?", rows: [
        { icon: "💬", title: "Ask the Seafarers' Centre", sub: "They keep contacts for communities not shown in the app", action: "📞" },
      ]},
    ],
    updated: "24 July 2026",
  },

  tallinn_spiritual_prayer: {
    title: "Places for Prayer",
    sections: [
      { icon: "🏛", title: "In the port", rows: [
        { icon: "🕊", title: "Prayer room, Seafarers' Centre", sub: "Multi-faith · open during centre hours · no booking, no questions asked", action: "🧭" },
        { icon: "🤫", title: "Quiet room, Seafarers' Centre", sub: "For being alone for a while · not religious in itself", action: "🧭" },
      ]},
      { icon: "🏙", title: "In the city", rows: [
        { icon: "⛪", title: "Old Town churches", sub: "Most open to visitors during the day · sitting quietly is normal", action: "🧭" },
        { icon: "🕌", title: "Tallinn Islamic Centre", sub: "Prayer hall and washing facilities · Keevise 9", action: "🧭" },
      ]},
    ],
    note: "The prayer room and the quiet room at the centre are the closest options to the ship, and neither requires you to explain yourself to anyone.",
    updated: "24 July 2026",
  },

  // ── OTHER PORTS — real data we already hold, kept under the new shape ──
  hamburg_centre_about: {
    title: "About the Centre",
    hours: [
      ["Monday", "10:00 – 21:00"], ["Tuesday", "10:00 – 21:00"], ["Wednesday", "10:00 – 21:00"],
      ["Thursday", "10:00 – 21:00"], ["Friday", "10:00 – 21:00"], ["Saturday", "15:00 – 21:00"], ["Sunday", "15:00 – 21:00"],
    ],
    contacts: [
      { icon: "📞", title: "+49 40 740 1661", sub: "Main line", action: "📞" },
      { icon: "☎️", title: "Freecall 0800 382 5325236", sub: "For pickup requests from your ship", action: "📞" },
      { icon: "🌐", title: "duckdalben.de", sub: "Club website", action: "›" },
    ],
  },
  constanta_centre_about: {
    title: "About the Centre",
    contacts: [
      { icon: "📞", title: "+40 723 000 555", sub: "Constanța & Midia-Năvodari · also for shuttle pickup", action: "📞" },
      { icon: "📞", title: "+40 723 218 090", sub: "Agigea (South Constanța)", action: "📞" },
      { icon: "🌐", title: "romania.seamensclub.ro", sub: "Club website", action: "›" },
    ],
  },

  // ── PREMIUM / TRADE UNION (unchanged) ──────────────────────────────
  premium_qr: {
    type: "qr_code", gated: true,
    title: "Your Premium QR Code",
    note: "Show this code to partner staff for verification — supermarkets, cafés and transport partners near the centre. Demo mode: this is a static illustrative code. Live rotating verification, tied to your real MWA-ID and checked against IMWIRSA's server, will connect once the backend is ready.",
  },
  wellness_zone_tallinn: {
    gated: true,
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
    gated: true,
    title: "Legal Consultation (Paid)",
    note: "Free basic information and union/ITF contacts are always available to every seafarer under Emergency Contacts — this is specifically a paid, in-depth consultation with a maritime lawyer for Trade Union members.",
    contacts: [
      { icon: "💬", title: "WhatsApp consultation with a maritime lawyer", sub: "Paid service, covered by Trade Union membership · response within 24h", action: "💬" },
    ],
    directions: [
      { icon: "🏛", title: "In person at the Seafarers' Centre", sub: "By appointment only", action: "🧭" },
    ],
  },
  medical_extended: {
    gated: true,
    title: "Medical — Extended Access",
    hours: [
      ["Monday", "08:00 – 20:00"], ["Tuesday", "08:00 – 20:00"], ["Wednesday", "08:00 – 20:00"],
      ["Thursday", "08:00 – 20:00"], ["Friday", "08:00 – 20:00"], ["Saturday", "09:00 – 15:00"], ["Sunday", "Emergency only"],
    ],
    contacts: [
      { icon: "🩺", title: "Tallinn Medical Clinic — priority booking", sub: "Union card covers consultation fee", action: "📞" },
      { icon: "🚑", title: "Emergency services", sub: "112 · Free · 24/7", action: "📞" },
    ],
  },
  psych_support: {
    gated: true,
    title: "Psychological Support",
    contacts: [
      { icon: "🧠", title: "Licensed counsellor", sub: "+372 5555 9911 · English, Russian", action: "📞" },
      { icon: "💬", title: "Confidential chat", sub: "Available 24/7 via this app", action: "💬" },
      { icon: "🧘", title: "Quiet room at the centre", sub: "Open now · no booking needed", action: "🧭" },
    ],
  },
  port_discounts: {
    gated: true,
    title: "Port Discounts & Privileges",
    contacts: [
      { icon: "🛍", title: "Rimi Supermarket", sub: "5% off with union card", action: "🧭" },
      { icon: "☕", title: "Seafarers' Centre café", sub: "Free coffee, discounted meals", action: "🧭" },
      { icon: "🚕", title: "Partner taxi service", sub: "Fixed reduced rate to city centre", action: "🧭" },
    ],
  },
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
      PENDING("🛒", "Supermarkets", "Nearest stores, shopping centres, 24/7 shops"),
      PENDING("🍽", "Food & Drinks", "Fast food, local restaurants, seafarer-friendly places"),
      PENDING("📱", "Electronics & SIM Cards", "Mobile operators, SIM cards, chargers & adapters"),
      PENDING("💊", "Pharmacies", "Nearest and 24/7 pharmacies, prescription & OTC medicines"),
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
const PORTS = {
  tallinn: {
    meta: { flag: "🇪🇪", name: "Tallinn", sub: "Estonia · Old City Harbour", tz: "UTC+3", lat: 59.4451, lng: 24.7654 },
    categories: {
      centre: {
        title: "Seafarers' Centre",
        statusFrom: "tallinn_centre_about",
        rows: [
          { icon: "ℹ️", title: "About the Centre", sub: "Opening hours, phone, coordinator, website", action: "›", sd: "tallinn_centre_about" },
          { icon: "🎱", title: "Services", sub: "Hospitality, recreation, connectivity, welfare", action: "›", sd: "tallinn_centre_services" },
          { icon: "🚐", title: "Free Shuttle Bus", sub: "Timetable, pickup point, how to recognise it", action: "›", sd: "tallinn_centre_shuttle" },
          { icon: "📍", title: "Location & Route", sub: "Address, map, how to get there on foot", action: "›", sd: "tallinn_centre_location" },
        ],
      },
      transport: {
        title: "Transport",
        rows: [
          { icon: "🚪", title: "Leaving the Port", sub: "Exit rules, required documents, gate information", action: "›", sd: "tallinn_transport_leaving" },
          { icon: "🚐", title: "Port Shuttle", sub: "Timetable, pickup point, how to recognise it", action: "›", sd: "tallinn_centre_shuttle" },
          { icon: "🚕", title: "Taxi", sub: "Trusted apps, estimated fare, safety tips", action: "›", sd: "tallinn_transport_taxi" },
          { icon: "🚎", title: "Public Transport", sub: "Nearest stop, routes, tickets, journey to the city", action: "›", sd: "tallinn_transport_public" },
        ],
      },
      shops: {
        title: "Shops & Food",
        rows: [
          { icon: "🛒", title: "Supermarkets", sub: "Nearest stores, shopping centres, 24/7 shops", action: "›", sd: "tallinn_shops_supermarkets" },
          { icon: "🍽", title: "Food & Drinks", sub: "Seafarer-friendly places, fast food, local restaurants", action: "›", sd: "tallinn_shops_food" },
          { icon: "📱", title: "Electronics & SIM Cards", sub: "Operators, SIM cards, Wi-Fi, chargers, ATM", action: "›", sd: "tallinn_shops_sim" },
          { icon: "💊", title: "Pharmacies", sub: "Nearest and 24/7 pharmacies, prescription & OTC medicines", action: "›", sd: "tallinn_shops_pharmacies" },
        ],
      },
      citylife: {
        title: "City Life",
        rows: [
          { icon: "🌳", title: "Parks & Waterfronts", sub: "Promenade, parks, quiet green space, viewpoints", action: "›", sd: "tallinn_city_parks" },
          { icon: "🏛", title: "Culture & Must-See", sub: "Top 5 city places, museums, historic centre", action: "›", sd: "tallinn_city_culture" },
          { icon: "🧘", title: "Free Time & Relax", sub: "Free places, viewpoints, somewhere to sit and call home", action: "›", sd: "tallinn_city_free" },
          { icon: "🛡", title: "Safety", sub: "What to know before going into the city", action: "›", sd: "tallinn_city_safety" },
        ],
      },
      spiritual: {
        title: "Spiritual Care",
        rows: [
          // Neutral option first, deliberately: someone who simply wants to talk
          // should not have to choose a denomination in order to ask.
          { icon: "💬", title: "No particular faith — I'd just like to talk", sub: "Speak with your assistant, who can bring in the IMWIRSA Coordinator", action: "›", go: "assistantchat" },
          { icon: "⚓", title: "Stella Maris", sub: "Catholic chaplaincy · ship visits, practical help", action: "›", sd: "tallinn_spiritual_stella" },
          { icon: "✝️", title: "The Mission to Seafarers", sub: "Anglican chaplaincy · open to any faith or none", action: "›", sd: "tallinn_spiritual_mts" },
          { icon: "🕌", title: "Muslim Support", sub: "Islamic Centre · prayer hall, conversation, halal food", action: "›", sd: "tallinn_spiritual_muslim" },
          { icon: "⛪", title: "Other Faith Communities", sub: "Orthodox, Lutheran, Catholic parishes in the city", action: "›", sd: "tallinn_spiritual_other" },
          { icon: "🙏", title: "Places for Prayer", sub: "Prayer room and quiet room at the centre, places in the city", action: "›", sd: "tallinn_spiritual_prayer" },
        ],
      },
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🩺", title: "Tallinn Medical Clinic", sub: "1.2 km · paid service · English spoken", action: "🧭" },
          { icon: "🏛", title: "Seafarers' Centre", sub: "+372 5555 1234", action: "📞" },
          { icon: "🌐", title: "ISWAN 24/7 Helpline", sub: "+44 20 7283 2922 · Multilingual", action: "📞" },
          { icon: "⚖️", title: "ITF Inspector — Baltic region", sub: "Free basic advice on wages, contracts & seafarers' rights", action: "📞" },
        ],
      },
      wellness: {
        title: "Premium Welfare Services", gated: true,
        rows: [
          { icon: "🔳", title: "Your Premium QR Code", sub: "Show this to partner staff to verify your status", action: "›", sd: "premium_qr" },
          { icon: "🌊", title: "Wellness Recovery Zone", sub: "Massage, counselling and quiet space near the centre", action: "›", sd: "wellness_zone_tallinn" },
          { icon: "⚖️", title: "Legal Consultation (Paid)", sub: "In-depth consultation with a maritime lawyer, covered by Trade Union membership", action: "›", sd: "legal_help" },
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
          { icon: "ℹ️", title: "About the Centre", sub: "Seamen's Club Constanța · phones, website", action: "›", sd: "constanta_centre_about" },
          PENDING("🎱", "Services", "Hospitality, recreation, connectivity, welfare"),
          PENDING("🚐", "Free Shuttle Bus", "Timetable, pickup point, how to recognise it"),
          PENDING("📍", "Location & Route", "Address, map, how to get there"),
        ],
      },
      transport: transportSkeleton(null),
      shops: shopsSkeleton(),
      citylife: citylifeSkeleton(),
      spiritual: spiritualSkeleton(),
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🏛", title: "Seamen's Club Constanța", sub: "+40 723 000 555", action: "📞" },
          { icon: "🌐", title: "ISWAN 24/7 Helpline", sub: "+44 20 7283 2922 · Multilingual", action: "📞" },
        ],
      },
      wellness: { title: "Premium Welfare Services", gated: true, rows: [ PENDING("ℹ️", TBD, "Trade Union partner services pending confirmation") ] },
    },
  },

  hamburg: {
    meta: { flag: "🇩🇪", name: "Hamburg", sub: "Germany · Port of Hamburg", tz: "UTC+2", lat: 53.5335, lng: 9.9481 },
    categories: {
      centre: {
        title: "Seafarers' Centre",
        statusFrom: "hamburg_centre_about",
        rows: [
          { icon: "ℹ️", title: "About the Centre", sub: "Duckdalben International Seamen's Club", action: "›", sd: "hamburg_centre_about" },
          PENDING("🎱", "Services", "Hospitality, recreation, connectivity, welfare"),
          PENDING("🚐", "Free Shuttle Bus", "Timetable, pickup point, how to recognise it"),
          PENDING("📍", "Location & Route", "Address, map, how to get there"),
        ],
      },
      transport: transportSkeleton(null),
      shops: shopsSkeleton(),
      citylife: citylifeSkeleton(),
      spiritual: spiritualSkeleton(),
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🏛", title: "Duckdalben Club", sub: "+49 40 740 1661", action: "📞" },
          { icon: "🌐", title: "ISWAN 24/7 Helpline", sub: "+44 20 7283 2922 · Multilingual", action: "📞" },
        ],
      },
      wellness: { title: "Premium Welfare Services", gated: true, rows: [ PENDING("ℹ️", TBD, "Trade Union partner services pending confirmation") ] },
    },
  },

  istanbul: {
    meta: { flag: "🇹🇷", name: "Istanbul", sub: "Türkiye · Haydarpaşa Port", tz: "UTC+3", lat: 41.0011, lng: 29.0192 },
    categories: {
      centre: {
        title: "Seafarers' Centre",
        rows: [
          PENDING("ℹ️", "About the Centre", "Opening hours, phone, coordinator, website"),
          PENDING("🎱", "Services", "Hospitality, recreation, connectivity, welfare"),
          PENDING("🚐", "Free Shuttle Bus", "Timetable, pickup point, how to recognise it"),
          PENDING("📍", "Location & Route", "Address, map, how to get there"),
        ],
      },
      transport: transportSkeleton(null),
      shops: shopsSkeleton(),
      citylife: citylifeSkeleton(),
      spiritual: spiritualSkeleton(),
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🏛", title: "Istanbul Seafarers' Contact Centre", sub: "+90 216 347 3771", action: "📞" },
          { icon: "🌐", title: "ISWAN 24/7 Helpline", sub: "+44 20 7283 2922 · Multilingual", action: "📞" },
        ],
      },
      wellness: { title: "Premium Welfare Services", gated: true, rows: [ PENDING("ℹ️", TBD, "Trade Union partner services pending confirmation") ] },
    },
  },
};

function currentPort() { return PORTS[state.portId] || PORTS.tallinn; }
function currentCategories() { return currentPort().categories; }

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

// ---- Trade Union card validity (reconfirmed every calendar month) ----
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function monthKeyOf(isoDate) { return isoDate ? isoDate.slice(0, 7) : null; }
function isUnionValid() {
  if (!state.unionActive || !state.unionLastConfirmed) return false;
  return monthKeyOf(state.unionLastConfirmed) === monthKeyOf(todayISO());
}

const state = {
  assistant: null,
  lang: null,
  name: "",
  mwaId: null,
  unionActive: false,
  unionLastConfirmed: null,
  portId: "tallinn",
  context: "at_port",
  accessView: "std",
  shipPoint: null,
};

function ensureMwaId() {
  if (state.mwaId) return;
  const n = Math.floor(1000000 + Math.random() * 8999999);
  state.mwaId = `MWA-${n}`;
  saveState();
}

function saveState() { try { localStorage.setItem("mwapp_state", JSON.stringify(state)); } catch (e) {} }
function loadState() {
  try {
    const raw = localStorage.getItem("mwapp_state");
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch (e) {}
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

function updateAssistantUI() {
  const a = getAssistant(state.assistant);
  if (!a) return;

  const introPhoto = getAssistantPhoto(a.id, "introHero");
  document.getElementById("introAvatar").innerHTML = `<img src="${introPhoto}" alt="${a.name}" loading="lazy">`;
  document.getElementById("introName").textContent = a.name;
  document.getElementById("introMsg").textContent = a.greet;

  const namePhoto = getAssistantPhoto(a.id, "nameScreen");
  document.getElementById("nameAvatar").innerHTML = `<img src="${namePhoto}" alt="${a.name}" loading="lazy">`;

  setAvatarPhoto("settingsAvatar", a, "settings");
  document.getElementById("settingsName").textContent = a.name;

  const port = currentPort();
  document.getElementById("homePortName").textContent = `${port.meta.flag} ${port.meta.name}`;
  document.getElementById("homePortSub").textContent = port.meta.sub;
  const tzEl = document.getElementById("homeTz");
  if (tzEl) tzEl.textContent = `⏱ ${port.meta.tz}`;

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
  if (["home", "volunteer", "settings", "detail", "subdetail", "assistantchat", "ship"].includes(name)) {
    bottomNav.style.display = "flex";
    document.querySelectorAll(".nav-item[data-nav]").forEach((n) => n.classList.toggle("active", n.dataset.nav === name));
  } else {
    bottomNav.style.display = "none";
  }
  bottomNav.classList.toggle("on-photo", name === "home");

  if (name === "intro" || name === "name" || name === "home" || name === "settings") updateAssistantUI();
  if (name === "volunteer") {
    const ctxEl = document.getElementById("chatPortContext");
    if (ctxEl) ctxEl.textContent = currentPort().meta.name;
  }
  if (name === "assistantchat") openAssistantChat();
  if (name === "ship") renderShipScreen();
  if (name === "home") { maybeShowInstallBanner(); maybeShowLocationBanner(); }
}

let qrCountdownTimer = null;

function setDetailHeaderPhoto(a) {
  const el = document.getElementById("detailHeaderPhoto");
  if (!el) return;
  const photo = getAssistantPhoto(a.id, "detailHeader");
  el.innerHTML = `<img src="${photo}" alt="${a.name}" loading="lazy">`;
}

// ---- LEVEL 2 -----------------------------------------------------------
function openDetail(key) {
  const data = currentCategories()[key];
  if (!data) return;
  const port = currentPort();
  const valid = isUnionValid();
  const locked = !!data.gated && !valid;

  document.getElementById("detailCrumbPort").textContent = port.meta.name;
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
    bubbleHtml = `
      <div class="assistant-bubble" style="margin:0 0 14px;">
        <div class="ab-name">${a.name}</div>
        <div class="ab-text">${msg}</div>
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

  document.getElementById("subdetailCrumbPort").textContent = port.meta.name;
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
    const qrData = encodeURIComponent(state.mwaId || "MWA-DEMO");
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${qrData}`;
    inner += `<div class="sd-card qr-card">
      <div class="sd-card-title" style="justify-content:center;">🔳 ${sd.title}</div>
      <div class="qr-id">${state.mwaId || ""}</div>
      <div class="qr-image-wrap"><img src="${qrImgUrl}" alt="QR code" class="qr-image"></div>
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

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

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
    body.insertAdjacentHTML("beforeend", `<div class="chat-msg them">${escapeHtml(reply)}</div>`);
    body.scrollTop = body.scrollHeight;
  }, 900);
}

// ---- ASSISTANT CHAT (demo) --------------------------------------------
// Prototype-level only: keyword matching stands in for the real AI classification
// described in the scope of work (section 5).
const COMPLEX_TOPIC_KEYWORDS = [
  "sad", "lonely", "alone", "can't sleep", "cant sleep", "no one listens", "nobody listens",
  "depressed", "hopeless", "hurt myself", "suicide", "kill myself", "want to die",
  "captain", "master", "argue", "argued", "fight", "shouted", "yelled", "threat", "threatened",
  "bar", "alcohol", "drink", "girl", "girlfriend", "women", "woman", "dating", "meet someone",
  "bad news from home", "family problem", "divorce",
];

function isComplexTopic(text) {
  const lower = text.toLowerCase();
  return COMPLEX_TOPIC_KEYWORDS.some((kw) => lower.includes(kw));
}

let assistantReplyIndex = 0;
let chatSessionOpen = false;

function setChatHeaderPhoto(a) {
  const el = document.getElementById("chatAssistantPhoto");
  if (!el) return;
  el.innerHTML = `<img src="${getAssistantPhoto(a.id, "chatHero")}" alt="${a.name}" loading="lazy">`;
}

function openAssistantChat() {
  const a = getAssistant(state.assistant) || getAssistant("alex");
  setChatHeaderPhoto(a);
  document.getElementById("chatAssistantName").textContent = a.name;
  if (chatSessionOpen) return;
  chatSessionOpen = true;
  const body = document.getElementById("assistantChatBody");
  body.innerHTML = `<div class="chat-msg them">${escapeHtml(a.greet)}</div>`;
  const input = document.getElementById("assistantChatInput");
  if (input) input.value = "";
}

function sendAssistantChatMessage() {
  const input = document.getElementById("assistantChatInput");
  const text = input.value.trim();
  if (!text) return;
  const body = document.getElementById("assistantChatBody");
  const existingToggle = document.getElementById("escalationToggle");
  if (existingToggle) existingToggle.remove();

  body.insertAdjacentHTML("beforeend", `<div class="chat-msg me">${escapeHtml(text)}</div>`);
  input.value = "";
  body.scrollTop = body.scrollHeight;

  const a = getAssistant(state.assistant) || getAssistant("alex");
  setTimeout(() => {
    if (isComplexTopic(text)) {
      const msg = t(`escalation.${a.id}`) || t("escalation.alex");
      body.insertAdjacentHTML("beforeend", `<div class="chat-msg them">${escapeHtml(msg)}</div>`);
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

    const mapEl = e.target.closest("[data-map]");
    if (mapEl) {
      const [la, ln] = mapEl.dataset.map.split(",");
      window.open(mapsUrl(la, ln), "_blank");
    }

    const goEl = e.target.closest("[data-go]");
    if (goEl) {
      const target = goEl.dataset.go;

      // Going home is the one explicit "start fresh" action: it ends the
      // assistant-chat session and drops back to the Standard view.
      if (target === "home") {
        state.accessView = "std";
        chatSessionOpen = false;
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

    if (e.target.id === "unionCloseBtn") closeModal("unionModal");
    if (e.target.id === "unionDeniedCloseBtn") closeModal("unionDeniedModal");

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

  document.getElementById("chatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChatMessage();
  });
  document.getElementById("assistantChatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendAssistantChatMessage();
  });

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
});
