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

  // ── UNIVERSAL — same content on every port, not port-specific data ──
  currency_exchange_safety: {
    title: "Currency Exchange",
    callout: { tone: "warn", text: "Never exchange money on the street, even for a good rate someone offers you. In some countries this is a criminal offence — and it's one of the most common ways seafarers get scammed near a port." },
    sections: [
      { icon: "✅", title: "Where to exchange safely", rows: [
        { icon: "🏦", title: "A bank or licensed exchange office", sub: "Look under this port's Shops & Food card for ones checked by your coordinator" },
        { icon: "🏧", title: "An ATM", sub: "Usually the safest option where available — official bank rate, no one to negotiate with" },
      ]},
      { icon: "🚩", title: "Red flags — walk away", rows: [
        { icon: "🗣", title: "A stranger offers you a better rate", sub: "On the street, at the gate, or \"just around the corner\" — always a scam" },
        { icon: "🚗", title: "Being asked to go somewhere private", sub: "A car, a back room, an alley — a legitimate exchange never needs this" },
        { icon: "🧾", title: "No receipt offered", sub: "A real exchange always gives you a printed receipt with the rate used" },
      ]},
      { icon: "🛡", title: "Before you hand over money", rows: [
        { icon: "🔢", title: "Know the rough official rate first", sub: "Check on your phone before you go — so you can spot a bad deal immediately" },
        { icon: "🧮", title: "Count what you receive, before you walk away", sub: "In front of the person who gave it to you, not after" },
      ]},
    ],
    note: "This page is the same in every port — the specific exchange offices your coordinator has checked are listed under this port's own Shops & Food card.",
  },

  vanasadam_currency_exchange: {
    title: "Currency Exchange",
    callout: { tone: "warn", text: "Never exchange money on the street, even for a good rate someone offers you. In some countries this is a criminal offence — and it's one of the most common ways seafarers get scammed near a port." },
    sections: [
      { icon: "✅", title: "Where to exchange safely", rows: [
        { icon: "🏦", title: "A bank or licensed exchange office", sub: "See the checked addresses below" },
        { icon: "🏧", title: "An ATM", sub: "Usually the safest option where available — official bank rate, no one to negotiate with" },
      ]},
      { icon: "🚩", title: "Red flags — walk away", rows: [
        { icon: "🗣", title: "A stranger offers you a better rate", sub: "On the street, at the gate, or \"just around the corner\" — always a scam" },
        { icon: "🚗", title: "Being asked to go somewhere private", sub: "A car, a back room, an alley — a legitimate exchange never needs this" },
        { icon: "🧾", title: "No receipt offered", sub: "A real exchange always gives you a printed receipt with the rate used" },
      ]},
      { icon: "🛡", title: "Before you hand over money", rows: [
        { icon: "🔢", title: "Know the rough official rate first", sub: "Check on your phone before you go — so you can spot a bad deal immediately" },
        { icon: "🧮", title: "Count what you receive, before you walk away", sub: "In front of the person who gave it to you, not after" },
      ]},
      { icon: "📍", title: "Checked addresses near you", rows: [
        { icon: "💱", title: "Tavid Currency Exchange — Nautica mall", sub: "Ahtri 9 · 5 min walk from Terminal D", action: "🧭" },
        { icon: "💱", title: "Tavid Currency Exchange — Viru Keskus", sub: "Viru väljak 4", action: "🧭" },
        { icon: "🏧", title: "Swedbank / SEB ATMs", sub: "Nautica mall and inside the Terminal D building", action: "🧭" },
      ]},
    ],
    updated: "5 August 2026",
  },

  muuga_currency_exchange: {
    title: "Currency Exchange",
    callout: { tone: "warn", text: "Never exchange money on the street, even for a good rate someone offers you. In some countries this is a criminal offence — and it's one of the most common ways seafarers get scammed near a port." },
    sections: [
      { icon: "✅", title: "Where to exchange safely", rows: [
        { icon: "🏦", title: "A bank or licensed exchange office", sub: "See the checked addresses below" },
        { icon: "🏧", title: "An ATM", sub: "Usually the safest option where available — official bank rate, no one to negotiate with" },
      ]},
      { icon: "🚩", title: "Red flags — walk away", rows: [
        { icon: "🗣", title: "A stranger offers you a better rate", sub: "On the street, at the gate, or \"just around the corner\" — always a scam" },
        { icon: "🚗", title: "Being asked to go somewhere private", sub: "A car, a back room, an alley — a legitimate exchange never needs this" },
        { icon: "🧾", title: "No receipt offered", sub: "A real exchange always gives you a printed receipt with the rate used" },
      ]},
      { icon: "🛡", title: "Before you hand over money", rows: [
        { icon: "🔢", title: "Know the rough official rate first", sub: "Check on your phone before you go — so you can spot a bad deal immediately" },
        { icon: "🧮", title: "Count what you receive, before you walk away", sub: "In front of the person who gave it to you, not after" },
      ]},
      { icon: "📍", title: "Checked addresses near you", rows: [
        { icon: "💱", title: "Tavid Currency Exchange — Lasnamäe Centrum", sub: "Mustakivi tee 13, Tallinn · ~12 km · taxi or bus 34", action: "🧭" },
        { icon: "🏧", title: "SEB / Swedbank ATMs — Maardu Keskus", sub: "~5 km · or at the Circle K petrol station", action: "🧭" },
      ]},
    ],
    note: "There's no exchange office right at the port — the closest checked ones are in Maardu or central Tallinn, both a real trip from here.",
    updated: "5 August 2026",
  },

  // ── TALLINN · SEAFARERS' CENTRE ────────────────────────────────────
  vanasadam_centre_about: {
    title: "About the Centre",
    hours: [
      ["Monday", "14:00 – 21:00"], ["Tuesday", "14:00 – 21:00"], ["Wednesday", "14:00 – 21:00"],
      ["Thursday", "14:00 – 21:00"], ["Friday", "14:00 – 21:00"], ["Saturday", "14:00 – 21:00"], ["Sunday", "Closed — or by request"],
    ],
    contacts: [
      { icon: "📞", title: "+372 631 8234", sub: "Main line", action: "📞" },
      { icon: "📞", title: "+372 56 462 825", sub: "Chaplain's direct line · also WhatsApp", action: "📞" },
      { icon: "🧑‍💼", title: "Revo Jaager — Chaplain", sub: "English, Estonian, Russian, German", action: "💬" },
      { icon: "🌐", title: "meremeestemisjon.ee", sub: "Centre website", action: "›" },
      { icon: "✉️", title: "muuga@meremeestemisjon.ee", sub: "Email", action: "✉️" },
    ],
    note: "The physical Seafarers' Centre (Estonian Seamen's Mission) is at Muuga, 17 km from here — too far to walk. But Vanasadam sits right in central Tallinn, so the whole city is about 5 minutes on foot instead. Closed 25 Dec, 1 Jan, and Easter Sunday.",
  },

  vanasadam_centre_services: {
    title: "Services",
    groups: [
      { label: "Hospitality", icon: "☕", items: ["Coffee & tea", "Snacks"] },
      { label: "Recreation", icon: "🎱", items: ["TV lounge", "Terrace", "Rest & relaxation area", "Games room", "Billiards", "Table tennis", "Library", "Book exchange", "Sports facilities"] },
      { label: "Connectivity", icon: "📶", items: ["Free Wi-Fi", "Computers for seafarers", "SIM cards on site"] },
      { label: "Welfare services", icon: "🤝", items: ["Small shop", "Volunteers who visit ships", "Events & excursions", "Help carrying purchases from the city", "Transfer to shopping centres on request"] },
      { label: "Spiritual care", icon: "🕊", items: ["Prayer room", "Chapel", "Chaplain"] },
    ],
    note: "No hot lunch is cooked — snacks and coffee are free or €1–3. This describes the Muuga centre itself; from Vanasadam it's the city on foot, not this centre.",
  },

  vanasadam_centre_shuttle: {
    title: "Free Shuttle Bus",
    from: "Straight from your gangway, or from the Terminal A / Terminal D checkpoint",
    directions: [
      { icon: "📞", title: "Book 2–3 hours ahead", sub: "WhatsApp or call the chaplain: +372 56 462 825", action: "📞" },
      { icon: "🚐", title: "How to recognise it", sub: "White minibus (VW Transporter / Mercedes Vito), Estonian Seamen's Mission logo or a \"Seamen's Club\" sign on the windscreen", action: "" },
      { icon: "📅", title: "No fixed timetable from Vanasadam", sub: "Runs on call · return time agreed with the driver on the spot", action: "" },
      { icon: "🗓", title: "Weekends", sub: "By prior arrangement", action: "" },
    ],
    note: "For cargo or repair vessels berthed at Vanasadam specifically — this isn't a scheduled run like some ports, so book ahead rather than just waiting at a stop.",
  },

  vanasadam_centre_location: {
    title: "Location & Route",
    contacts: [
      { icon: "📍", title: "Altmetsa tee 1, Muuga, 74115 Harju maakond", sub: "The Seamen's Mission building — 17 km away, not walkable from here", action: "" },
    ],
    maps: { lat: 59.4912, lng: 24.9398, label: "Estonian Seamen's Mission (Muuga)" },
    directions: [
      { icon: "🚐", title: "Book the shuttle ahead", sub: "See Free Shuttle Bus above — the only realistic way to reach the centre building from Vanasadam", action: "›" },
      { icon: "🚶", title: "Into the city instead: 5 minutes", sub: "From Terminal A or D, follow the lit pavement along Sadama or Kai street towards Nautica mall / the Old Town — fully paved and safe", action: "🧭" },
    ],
    note: "At night, avoid unlit construction areas around the port and unmarked vehicle exits from the ferry lanes.",
  },


  // ── TALLINN · TRANSPORT ────────────────────────────────────────────
  // "Leaving the Port" is the single most-asked question ashore and also the
  // riskiest to state as fact — a wrong gate or document rule can strand a
  // seafarer at the checkpoint. So it carries `updated` (provenance line) and
  // its callout points at the ship's agent as the authority, not the app.
  vanasadam_transport_leaving: {
    title: "Leaving the Port",
    callout: { tone: "ok", text: "Yes — shore leave is normally permitted at Vanasadam. Always confirm with your Master or ship's agent before you go: rules can change per berth and per vessel." },
    sections: [
      { icon: "🚪", title: "Exit gate", rows: [
        { icon: "🅰️", title: "Terminal A — foot passenger exit", sub: "Pedestrian" },
        { icon: "🅳", title: "Terminal D — foot passenger exit", sub: "Pedestrian" },
        { icon: "🚛", title: "Cargo Gate 1 (Uus-Sadama st.) / Gate 2 (Logi st.)", sub: "Vehicles only" },
      ]},
      { icon: "🪪", title: "Take with you", rows: [
        { icon: "📘", title: "Seaman's Book", sub: "Or equivalent seafarer's identity document" },
        { icon: "📄", title: "Crew List", sub: "Signed by the Master" },
      ]},
      { icon: "🛃", title: "If you're not from the EU / Schengen area", rows: [
        { icon: "🛂", title: "Border check applies at the checkpoint", sub: "No Schengen visa? You'll need a Shore Leave Pass, arranged by your ship's agent in advance" },
      ]},
      { icon: "🚶", title: "On foot", rows: [
        { icon: "✅", title: "No special gear needed inside Terminals A / D", sub: "The passenger terminal areas are fine on foot as you are" },
        { icon: "🦺", title: "Hi-vis vest + safety shoes required in cargo/ISPS zones", sub: "If you're moving through the working cargo or repair berths" },
        { icon: "⚠️", title: "Stay on marked walkways", sub: "Loading/unloading berths, ferry marshalling areas and technical roads are off-limits — follow the green/yellow marked paths only" },
      ]},
    ],
    note: "If the checkpoint turns you back, call your ship's agent, or the Seamen's Mission chaplain on duty: +372 56 462 825 (especially if a shuttle was already booked). Pedestrian zones normally run about 06:00–22:30/23:00; overnight, access goes through the security duty checkpoint.",
    updated: "5 August 2026",
  },

  vanasadam_transport_taxi: {
    title: "Taxi",
    sections: [
      { icon: "📱", title: "Apps", rows: [
        { icon: "🟢", title: "Bolt", sub: "Most common here · card payment in-app", action: "›" },
        { icon: "⚫", title: "Uber", sub: "Also available in Tallinn", action: "›" },
        { icon: "🔵", title: "Forus", sub: "Local Estonian app", action: "›" },
      ]},
      { icon: "☎️", title: "By phone", rows: [
        { icon: "📞", title: "Forus Taxi", sub: "+372 612 0000", action: "📞" },
        { icon: "📞", title: "Tallink Takso", sub: "+372 640 8900", action: "📞" },
      ]},
      { icon: "📍", title: "Pickup point", rows: [
        { icon: "🚖", title: "Official taxi ranks", sub: "Right at the Terminal A and Terminal D exits", action: "🧭" },
      ]},
    ],
    note: "Typical fare into town is €5–8 through an app. Unofficial drivers sometimes wait right at the pedestrian exit offering \"fast taxi\" at inflated prices — a genuine taxi always has a roof sign, a price list on the right rear window and a running meter. Without those, walk on: at the terminal \"first line\" without an app, fares of €20–30 for a 2 km ride are not unheard of. Order through Bolt.",
    updated: "5 August 2026",
  },

  vanasadam_transport_public: {
    title: "Public Transport",
    sections: [
      { icon: "🚏", title: "Nearest stop", rows: [
        { icon: "🅰️", title: "Reisisadam A", sub: "50 m from the Terminal A exit" },
        { icon: "🅳", title: "Reisisadam D", sub: "70 m from the Terminal D exit" },
      ]},
      { icon: "🚎", title: "Routes", rows: [
        { icon: "2️⃣", title: "Bus 2", sub: "From Terminals A / D to the centre / Viru Keskus" },
        { icon: "🚋", title: "Trams 2 & 5", sub: "From the Linnahall or Kanuti stop, 5–7 min walk from Terminal A" },
      ]},
      { icon: "🎫", title: "Tickets", rows: [
        { icon: "💳", title: "Contactless bank card", sub: "Tap the validator when boarding — simplest option" },
        { icon: "🚌", title: "From the driver", sub: "Card only, no cash" },
      ]},
    ],
    note: "About 5–8 minutes to the city centre, €2.00 for an hourly ticket. Last services run roughly 23:30–00:00 — after that, use an app taxi. No shuttle exists inside the port itself: the passenger terminals are compact enough to walk, and for the more distant repair-vessel berths, your agent or the Seamen's Mission shuttle arranges the transfer.",
    updated: "5 August 2026",
  },


  // ── TALLINN · SHOPS & FOOD ─────────────────────────────────────────
  vanasadam_shops_supermarkets: {
    title: "Supermarkets",
    sections: [
      { icon: "🛒", title: "Nearest stores", rows: [
        { icon: "🛍", title: "Rimi Hyper — Nautica mall", sub: "350 m from Terminal D / 750 m from Terminal A · 08:00–22:00", action: "🧭" },
        { icon: "🛍", title: "Prisma Express — Rotermanni", sub: "~700 m from the gate · 07:00–23:00", action: "🧭" },
        { icon: "🛍", title: "Grossi Toidukaubad — Ahtri st.", sub: "~600 m from Terminal D · 08:00–21:00 · budget option", action: "🧭" },
      ]},
      { icon: "🌙", title: "24-hour", rows: [
        { icon: "🕛", title: "Prisma Sikupilli hypermarket", sub: "Not walkable — about a 7-minute / €5 taxi ride", action: "🧭" },
      ]},
    ],
    note: "Rimi in Nautica is the closest and the usual choice for a quick run before sailing. Bring a bag — carrier bags are charged separately in Estonia.",
    updated: "5 August 2026",
  },

  vanasadam_shops_food: {
    title: "Food & Drinks",
    sections: [
      { icon: "🍔", title: "Quick & cheap", rows: [
        { icon: "🍟", title: "Nautica mall food court", sub: "Hesburger, Subway, Buffet — combo meal €6–9", action: "🧭" },
      ]},
      { icon: "🍽", title: "Local favourite", rows: [
        { icon: "🥘", title: "Koch Aidad — Lootsi 10", sub: "400 m from the gate · hearty Estonian/European food in a historic barn building", action: "🧭" },
      ]},
      { icon: "🌍", title: "Other diets", rows: [
        { icon: "🍛", title: "Armduu, or Indian/Asian places in Rotermann Quarter", sub: "~600 m from the port", action: "🧭" },
      ]},
    ],
    updated: "5 August 2026",
  },

  vanasadam_shops_sim: {
    title: "Electronics & SIM Cards",
    sections: [
      { icon: "📡", title: "Mobile operators", rows: [
        { icon: "🟦", title: "Telia · Elisa · Tele2", sub: "Starter packs: Super, Rasmus, Smart", action: "" },
        { icon: "🏪", title: "Buy at any R-Kiosk", sub: "Inside Terminals A and D, also on the street in front of Nautica mall", action: "🧭" },
        { icon: "💶", title: "€3–5", sub: "Includes 5–10 GB, valid 7–30 days", action: "" },
        { icon: "🪪", title: "No passport needed", sub: "Prepaid starter packs are sold without ID" },
      ]},
      { icon: "📶", title: "Free Wi-Fi", rows: [
        { icon: "⚓", title: "\"Tallinn Airport/Port Free Wi-Fi\" or \"Nautica Free Wi-Fi\"", sub: "No password — one click to connect" },
      ]},
    ],
    note: "An Estonian prepaid SIM works across the whole EU at no extra cost, so it's worth buying here even if your next port is elsewhere in Europe.",
    updated: "5 August 2026",
  },

  vanasadam_shops_pharmacies: {
    title: "Pharmacies",
    sections: [
      { icon: "💊", title: "Nearest", rows: [
        { icon: "🏥", title: "Apotheka — Nautica mall (Ahtri 9)", sub: "350 m from Terminal D · 09:00–20:00", action: "🧭" },
      ]},
      { icon: "🌙", title: "24-hour", rows: [
        { icon: "🕛", title: "Tõnismäe Apotheka", sub: "Central Tallinn, a few km away — the nearest confirmed 24h pharmacy", action: "🧭" },
      ]},
      { icon: "📋", title: "Medicines", rows: [
        { icon: "🧾", title: "Prescriptions from outside the EU are usually not accepted", sub: "Most basic medicines — painkillers, cold and stomach remedies — are sold over the counter without one" },
      ]},
    ],
    note: "Pharmacists here speak English and Russian freely and can advise on minor complaints without a doctor. For anything serious, see Emergency Contacts.",
    updated: "5 August 2026",
  },

  vanasadam_shops_souvenirs: {
    title: "Souvenirs",
    sections: [
      { icon: "🎁", title: "Where to find them", rows: [
        { icon: "🏰", title: "Old Town shops — Viru street", sub: "~1 km / 12 min walk · amber, knitwear, Kalev chocolate — the biggest choice", action: "🧭" },
        { icon: "🛍", title: "Rotermann Quarter shops", sub: "~600 m from the port · designer Estonian gifts and souvenirs", action: "🧭" },
      ]},
    ],
    updated: "5 August 2026",
  },

  vanasadam_shops_seafarer: {
    title: "Seafarer Supplies",
    sections: [
      { icon: "⚓", title: "Ship stores / marine supply", rows: [
        { icon: "🗺", title: "Beckmann Maritime / Navimenu", sub: "Charts, workwear and ship's stores — usually ordered through your agent with delivery on board", action: "" },
      ]},
      { icon: "🦺", title: "Personal gear", rows: [
        { icon: "🥾", title: "Tamrex — Katusepapi 35", sub: "~3 km · about 10 min by taxi · safety shoes, workwear, hi-vis gear for yourself", action: "🧭" },
      ]},
    ],
    updated: "5 August 2026",
  },

  // ── TALLINN · CITY LIFE ────────────────────────────────────────────
  // Static places only — no timed walking routes and no live event feed.
  // Both were deliberately dropped: a route implies the app has worked out
  // that the seafarer will be back before the ship sails, which we cannot
  // promise, and live events need a backend and someone to keep them fresh.
  vanasadam_city_parks: {
    title: "Parks & Waterfronts",
    sections: [
      { icon: "🌊", title: "Waterfront", rows: [
        { icon: "🚶", title: "Reidi tee promenade", sub: "Starts right at the Terminal D exit · 2 km along the sea", action: "🧭" },
      ]},
      { icon: "🌳", title: "Green space", rows: [
        { icon: "🌲", title: "Kadriorg Park", sub: "~1.8 km · a large palace park", action: "🧭" },
      ]},
      { icon: "🤫", title: "Quiet corner", rows: [
        { icon: "🪑", title: "Rotermann Quarter courtyards", sub: "~600 m from the gate", action: "🧭" },
      ]},
      { icon: "👁", title: "Viewpoint", rows: [
        { icon: "🏰", title: "Kohtuotsa viewing platform, Old Town", sub: "1.5 km · a striking view over the whole port and the bay", action: "🧭" },
      ]},
    ],
    note: "If you only have an hour and want air rather than sightseeing, the Reidi tee promenade right at Terminal D is the simplest choice.",
    updated: "5 August 2026",
  },

  vanasadam_city_culture: {
    title: "Culture & Must-See",
    sections: [
      { icon: "⭐", title: "Top 5", rows: [
        { icon: "1️⃣", title: "Rotermann Quarter", sub: "600 m / 5 min walk · modern industrial district, cafés, architecture, shops", action: "🧭" },
        { icon: "2️⃣", title: "Old Town (Vanalinn)", sub: "1 km / 12 min walk to the Viru gates · UNESCO World Heritage", action: "🧭" },
        { icon: "3️⃣", title: "Reidi tee promenade", sub: "Right at the Terminal D exit · sea view, benches, a place to rest", action: "🧭" },
        { icon: "4️⃣", title: "Toompea viewing platforms", sub: "1.8 km / 20 min walk", action: "🧭" },
        { icon: "5️⃣", title: "Lennusadam Seaplane Harbour", sub: "1.8 km west of the port · maritime museum with a real submarine", action: "🧭" },
      ]},
    ],
    updated: "5 August 2026",
  },

  vanasadam_city_free: {
    title: "Free Time & Relax",
    sections: [
      { icon: "🆓", title: "Somewhere to sit", rows: [
        { icon: "🏬", title: "Nautica mall, ground floor lounge", sub: "Free Wi-Fi, comfortable seating, benches with USB charging", action: "🧭" },
        { icon: "🚪", title: "Terminal D / Terminal A waiting halls", sub: "Open lounges with chairs, power sockets, fast Wi-Fi", action: "🧭" },
        { icon: "🍽", title: "Viru Keskus food court", sub: "Plenty of seating, sockets at the tables, no obligation to buy anything", action: "🧭" },
      ]},
    ],
    updated: "5 August 2026",
  },

  vanasadam_city_safety: {
    title: "Safety",
    callout: { tone: "warn", text: "Before you leave, agree your return time with the ship and mark your ship's position on the Ship screen. Finding the right gate again after dark is the single most common problem ashore." },
    sections: [
      { icon: "🟢", title: "General risk", rows: [
        { icon: "🛡", title: "Very safe, day and night", sub: "Tallinn is one of the safest capitals in the EU" },
      ]},
      { icon: "🚫", title: "Bringing anything back to the ship", rows: [
        { icon: "🍾", title: "Alcohol into the port is strictly forbidden without paperwork", sub: "Any amount, no exceptions — you need a permit signed by your ship's Master before it can come through the gate" },
      ]},
      { icon: "🌙", title: "At night", rows: [
        { icon: "🍺", title: "Basic caution around Suur-Karja", sub: "The Old Town's bar street — nothing dangerous, just the usual nightlife area" },
        { icon: "🚫", title: "No drinking in the street or in parks", sub: "It's against the law here — bars, restaurants and their terraces are fine" },
        { icon: "🕙", title: "Shops stop selling alcohol at 22:00", sub: "Resumes at 10:00 · only bars sell alcohol overnight" },
      ]},
      { icon: "⚠️", title: "Watch out for", rows: [
        { icon: "💸", title: "Inflated \"street\" taxi fares", sub: "At the terminal exits and around Old Town nightclubs — always use an app instead", action: "" },
      ]},
      { icon: "📞", title: "If something goes wrong", rows: [
        { icon: "🚨", title: "112", sub: "Police and ambulance · free · 24/7", action: "📞" },
        { icon: "🏛", title: "Seamen's Mission chaplain", sub: "+372 56 462 825", action: "📞" },
      ]},
    ],
    updated: "5 August 2026",
  },


  // ── TALLINN · SPIRITUAL CARE ───────────────────────────────────────
  // Static contacts only. No built-in chat with anyone outside IMWIRSA:
  // that would create a second escalation path around the Coordinator.
  // The neutral "no particular faith" row is kept first on the level-2
  // list, because a seafarer who simply wants a human conversation should
  // not have to pick a denomination before he can ask for one.
  vanasadam_spiritual_mission: {
    title: "Estonian Seamen's Mission",
    sections: [
      { icon: "🤝", title: "What they offer", rows: [
        { icon: "💬", title: "Ship visits, spiritual and emotional conversation", sub: "Lutheran / ecumenical — open to any Christian denomination, or none" },
        { icon: "🙏", title: "Prayer, books and literature", sub: "" },
        { icon: "🚐", title: "Practical help", sub: "Delivering groceries or a SIM card, arranging a transfer" },
      ]},
      { icon: "🕐", title: "When", rows: [
        { icon: "📅", title: "Mon–Sat, 14:00 – 21:00", sub: "Sunday by prior request" },
      ]},
    ],
    contacts: [
      { icon: "🧑‍💼", title: "Revo Jaager — Chaplain", sub: "English, Estonian, Russian, German", action: "💬" },
      { icon: "📞", title: "+372 56 462 825", sub: "Also WhatsApp", action: "📞" },
    ],
    updated: "5 August 2026",
  },

  vanasadam_spiritual_stella: {
    title: "Stella Maris",
    sections: [
      { icon: "🤝", title: "What they offer", rows: [
        { icon: "💬", title: "Ship visits on request, Mass and services", sub: "Catholic chaplaincy — including support for Filipino crews" },
        { icon: "🙏", title: "Spiritual guidance", sub: "" },
      ]},
      { icon: "🕐", title: "When", rows: [
        { icon: "📅", title: "Daily, 08:00 – 19:00", sub: "At Sts Peter and Paul Cathedral, Old Town" },
      ]},
    ],
    contacts: [
      { icon: "📞", title: "+372 644 6367", sub: "Stella Maris Estonia chaplaincy / parish line", action: "📞" },
    ],
    updated: "5 August 2026",
  },

  vanasadam_spiritual_muslim: {
    title: "Muslim Support",
    sections: [
      { icon: "🕌", title: "Where", rows: [
        { icon: "📍", title: "Tallinn Islamic Cultural Centre — Keevise 9", sub: "~4 km from Vanasadam", action: "🧭" },
        { icon: "🕐", title: "Open for the five daily prayers", sub: "Friday (Jumu'ah) prayer around midday" },
      ]},
      { icon: "🤝", title: "Help available", rows: [
        { icon: "💬", title: "Conversation in Arabic, English, Russian, Estonian", sub: "Ask at the centre" },
        { icon: "🍽", title: "Halal food guidance", sub: "The centre can point you to the nearest options" },
      ]},
    ],
    contacts: [
      { icon: "📞", title: "+372 614 3086", sub: "Islamic Centre reception", action: "📞" },
    ],
    updated: "5 August 2026",
  },

  vanasadam_spiritual_orthodox: {
    title: "Orthodox",
    sections: [
      { icon: "⛪", title: "Where", rows: [
        { icon: "📍", title: "St Nicholas Cathedral — Vene st. 24", sub: "~1.1 km from Vanasadam", action: "🧭" },
      ]},
      { icon: "🤝", title: "What they offer", rows: [
        { icon: "🙏", title: "Prayer — St Nicholas is the patron of seafarers", sub: "" },
        { icon: "⚓", title: "Ship blessing on request", sub: "" },
        { icon: "💬", title: "Conversation with a priest", sub: "Russian, Estonian" },
      ]},
      { icon: "🕐", title: "When", rows: [
        { icon: "📅", title: "Daily, 09:00 – 18:00", sub: "" },
      ]},
    ],
    contacts: [
      { icon: "📞", title: "+372 644 3484", sub: "Duty priest, Tallinn", action: "📞" },
    ],
    updated: "5 August 2026",
  },

  vanasadam_spiritual_prayer: {
    title: "Places for Prayer",
    sections: [
      { icon: "🕊", title: "Nearest formal prayer room", rows: [
        { icon: "⚓", title: "Ecumenical chapel, Estonian Seamen's Mission", sub: "At the centre in Muuga, 17 km away — not walkable from here, open to any faith", action: "🧭" },
      ]},
      { icon: "🏙", title: "Closer, in the city", rows: [
        { icon: "⛪", title: "Old Town churches", sub: "Mostly open to visitors during the day — sitting quietly is completely normal", action: "🧭" },
        { icon: "🕌", title: "Tallinn Islamic Cultural Centre", sub: "Keevise 9, ~4 km — prayer hall and washing facilities", action: "🧭" },
      ]},
    ],
    note: "The formal prayer room is at the centre building in Muuga, not here — but Vanasadam sits right in the Old Town, so a quiet church is a short walk away either way.",
    updated: "5 August 2026",
  },


  // ── MUUGA HARBOUR · SEAFARERS' CENTRE ──────────────────────────────
  // Unlike Vanasadam, the real centre building is physically here — this is
  // "home base" for the Estonian Seamen's Mission, not a distant referral.
  muuga_centre_about: {
    title: "About the Centre",
    hours: [
      ["Monday", "14:00 – 21:00"], ["Tuesday", "14:00 – 21:00"], ["Wednesday", "14:00 – 21:00"],
      ["Thursday", "14:00 – 21:00"], ["Friday", "14:00 – 21:00"], ["Saturday", "14:00 – 21:00"], ["Sunday", "Closed — or by prior request"],
    ],
    contacts: [
      { icon: "📞", title: "+372 631 8234", sub: "Main line", action: "📞" },
      { icon: "📞", title: "+372 56 462 825", sub: "Chaplain's direct line · also WhatsApp", action: "📞" },
      { icon: "🧑‍💼", title: "Revo Jaager — Chaplain", sub: "English, Russian, Estonian, German", action: "💬" },
      { icon: "🌐", title: "meremeestemisjon.ee", sub: "Centre website", action: "›" },
      { icon: "✉️", title: "muuga@meremeestemisjon.ee", sub: "Email", action: "✉️" },
    ],
    note: "Closed 25 Dec, 1 Jan, and Easter Sunday.",
  },

  muuga_centre_services: {
    title: "Services",
    groups: [
      { label: "Spiritual care", icon: "🕊", items: ["Chaplain on site"] },
      { label: "Welfare services", icon: "🤝", items: ["Free transfer to the shops in Maardu when you visit the centre"] },
    ],
    note: "No full meal is cooked — tea and coffee are free, snacks €1–3.",
  },

  muuga_centre_shuttle: {
    title: "Free Shuttle Bus",
    from: "Straight from your ship inside the port, or from Gate 1",
    directions: [
      { icon: "🕑", title: "Runs on call, 14:00 – 20:30", sub: "Call or WhatsApp the chaplain: +372 56 462 825", action: "📞" },
      { icon: "🚐", title: "How to recognise it", sub: "White minibus (VW Transporter / Mercedes Vito), Estonian Seamen's Mission logo", action: "" },
      { icon: "🔄", title: "Return", sub: "Agreed with the driver on the spot", action: "" },
      { icon: "🗓", title: "Weekends", sub: "By prior arrangement", action: "" },
    ],
    note: "Free — donations welcome, not expected.",
  },

  muuga_centre_location: {
    title: "Location & Route",
    contacts: [
      { icon: "📍", title: "Altmetsa tee 1, Muuga, 74115 Harju maakond", sub: "~1.8 km from Gate 1", action: "" },
    ],
    maps: { lat: 59.4912, lng: 24.9398, label: "Estonian Seamen's Mission (Muuga)" },
    directions: [
      { icon: "🚶", title: "On foot: about 20 minutes (1.8 km)", sub: "From Gate 1, follow the pavement along Nuudi tee to the junction with Altmetsa tee, then turn right", action: "🧭" },
      { icon: "🚐", title: "Or book the shuttle", sub: "See Free Shuttle Bus above", action: "›" },
    ],
    note: "At night the road is poorly lit with heavy truck traffic — wear a hi-vis vest and a reflector, and consider the shuttle instead of walking after dark.",
  },

  // ── MUUGA HARBOUR · TRANSPORT ───────────────────────────────────────
  muuga_transport_leaving: {
    title: "Leaving the Port",
    callout: { tone: "ok", text: "Yes — shore leave is normally permitted at Muuga. Always confirm with your Master or ship's agent before you go: rules can change per berth and per vessel." },
    sections: [
      { icon: "🚪", title: "Exit gate", rows: [
        { icon: "1️⃣", title: "Gate 1 / Peavärav — Nuudi tee", sub: "Pedestrian exit" },
        { icon: "🚛", title: "East Gate (Idavärav) and terminal-specific checkpoints", sub: "Vehicles / cargo only" },
      ]},
      { icon: "🪪", title: "Take with you", rows: [
        { icon: "📘", title: "Seaman's Book", sub: "Or equivalent seafarer's identity document" },
        { icon: "📄", title: "Crew List", sub: "Required" },
        { icon: "🎫", title: "Port Pass", sub: "For visitors — not needed by the seafarer, but your ship's agent may need to arrange one for others", action: "" },
      ]},
      { icon: "🛃", title: "If you're not from the EU / Schengen area", rows: [
        { icon: "🛂", title: "You'll need a Shore Leave Pass", sub: "Arranged by your ship's agent before you head to the checkpoint" },
      ]},
      { icon: "🚶", title: "On foot", rows: [
        { icon: "🦺", title: "Hi-vis vest and safety shoes are compulsory", sub: "Anywhere on foot in the Muuga port area, not just the working berths" },
        { icon: "⚠️", title: "Container and terminal yards are strictly off-limits on foot", sub: "Getting from your ship to the gate should be by your agent's vehicle or the centre's shuttle" },
      ]},
    ],
    note: "Gate phone: your ship's agent, or the Seamen's Mission on duty at +372 56 462 825.",
    updated: "5 August 2026",
  },

  muuga_transport_taxi: {
    title: "Taxi",
    sections: [
      { icon: "📱", title: "Apps", rows: [
        { icon: "🟢", title: "Bolt", sub: "Set pickup to \"Muuga Sadam Peavärav / Gate 1\"", action: "›" },
        { icon: "⚫", title: "Uber", sub: "Also available", action: "›" },
      ]},
      { icon: "☎️", title: "By phone", rows: [
        { icon: "📞", title: "Forus Taxi", sub: "+372 612 0000", action: "📞" },
      ]},
      { icon: "📍", title: "Pickup point", rows: [
        { icon: "🚖", title: "The car park in front of Gate 1", sub: "Taxis don't enter the secured zone without a special pass", action: "🧭" },
      ]},
    ],
    note: "€18–25 into central Tallinn; €5–7 to the nearby town of Maardu. Street pickups are rare out here simply because of the distance — always order through an app rather than expecting to flag one down, and never try to call a taxi right to the ship's side, security won't let it through.",
    updated: "5 August 2026",
  },

  muuga_transport_public: {
    title: "Public Transport",
    sections: [
      { icon: "🚏", title: "Nearest stop", rows: [
        { icon: "🚶", title: "Muuga sadam stop", sub: "150 m from Gate 1", action: "🧭" },
      ]},
      { icon: "🚎", title: "Routes", rows: [
        { icon: "3️⃣", title: "Bus 34", sub: "To central Tallinn, Viru Keskus stop" },
        { icon: "🚌", title: "Suburban bus 103", sub: "" },
      ]},
      { icon: "🎫", title: "Tickets", rows: [
        { icon: "💳", title: "Contactless bank card at the validator, or pay the driver", sub: "€2.00" },
      ]},
    ],
    note: "About 35–45 minutes to central Tallinn. Last bus 34 runs around 23:00. No in-port shuttle for getting from the ship to the gate itself — that's arranged by your agent or the Seamen's Mission, free of charge, by request.",
    updated: "5 August 2026",
  },

  // ── MUUGA HARBOUR · SHOPS & FOOD ────────────────────────────────────
  muuga_shops_supermarkets: {
    title: "Supermarkets",
    sections: [
      { icon: "🛒", title: "Nearest stores", rows: [
        { icon: "🛍", title: "Maxima X — Altmetsa tee 35", sub: "~3.2 km from Gate 1 · 08:00–22:00", action: "🧭" },
        { icon: "🛍", title: "Grossi Toidukaubad — Maardu", sub: "~5 km · 08:00–21:00 · budget option", action: "🧭" },
        { icon: "🛍", title: "Prisma / Selver — Maardu", sub: "~5.5 km · 08:00–22:00", action: "🧭" },
      ]},
      { icon: "🌙", title: "24-hour", rows: [
        { icon: "⛽", title: "Circle K petrol station, Maardu tee", sub: "24/7 · hot dogs, coffee, basics — no full 24h supermarket in the Muuga/Maardu area", action: "🧭" },
      ]},
    ],
    updated: "5 August 2026",
  },

  muuga_shops_food: {
    title: "Food & Drinks",
    sections: [
      { icon: "🍔", title: "Quick & cheap", rows: [
        { icon: "☕", title: "Seamen's Centre canteen", sub: "Snacks and pastries", action: "" },
        { icon: "🥘", title: "Bistros in Maardu", sub: "Reached by the mission's shuttle · combo meal €6–8", action: "" },
      ]},
      { icon: "🍽", title: "Local favourite", rows: [
        { icon: "🍴", title: "Cafés and small restaurants in Maardu", sub: "Where the shuttle usually takes seafarers", action: "" },
      ]},
      { icon: "🌍", title: "Other diets", rows: [
        { icon: "🥗", title: "Halal and vegetarian sections at Selver / Prisma, Maardu", sub: "" },
      ]},
    ],
    updated: "5 August 2026",
  },

  muuga_shops_sim: {
    title: "Electronics & SIM Cards",
    sections: [
      { icon: "📡", title: "Mobile operators", rows: [
        { icon: "🟦", title: "Telia · Elisa · Tele2", sub: "Starter packs: Super, Smart", action: "" },
        { icon: "⚓", title: "Right at the Seamen's Centre", sub: "Ask the chaplain — or buy at Maxima X / R-Kiosk in Maardu", action: "" },
        { icon: "💶", title: "€3–5", sub: "5–10 GB included", action: "" },
        { icon: "🪪", title: "No document needed", sub: "" },
      ]},
      { icon: "📶", title: "Free Wi-Fi", rows: [
        { icon: "🏛", title: "Seamen's Centre building and terminal office buildings", sub: "" },
      ]},
    ],
    updated: "5 August 2026",
  },

  muuga_shops_pharmacies: {
    title: "Pharmacies",
    sections: [
      { icon: "💊", title: "Nearest", rows: [
        { icon: "🏥", title: "Südameapteek — Maardu Keskus", sub: "~5 km from Gate 1 · 09:00–20:00", action: "🧭" },
      ]},
      { icon: "🌙", title: "24-hour", rows: [
        { icon: "🕛", title: "None nearby", sub: "The nearest confirmed 24h pharmacy is Tõnismäe Südameapteek in central Tallinn, ~18 km away", action: "" },
      ]},
      { icon: "📋", title: "Medicines", rows: [
        { icon: "🧾", title: "EU prescriptions accepted", sub: "Non-EU prescriptions generally aren't — basic medicines are sold freely without one" },
      ]},
    ],
    note: "Staff speak Russian and Estonian freely, with basic English.",
    updated: "5 August 2026",
  },

  muuga_shops_souvenirs: {
    title: "Souvenirs",
    sections: [
      { icon: "🎁", title: "Where to find them", rows: [
        { icon: "⚓", title: "Small shop at the Seamen's Centre itself", sub: "The simplest option — right where the shuttle drops you", action: "" },
        { icon: "🛍", title: "Souvenir sections at Lasnamäe Centrum mall / Maardu", sub: "For a bigger selection, further out", action: "" },
      ]},
    ],
    updated: "5 August 2026",
  },

  muuga_shops_seafarer: {
    title: "Seafarer Supplies",
    sections: [
      { icon: "🦺", title: "Personal gear", rows: [
        { icon: "🥾", title: "Tamrex — Vana-Narva mnt 1, Maardu", sub: "~3.5 km from Gate 1 · safety shoes, workwear jacket, gloves", action: "🧭" },
      ]},
    ],
    updated: "5 August 2026",
  },

  // ── MUUGA HARBOUR · CITY LIFE ───────────────────────────────────────
  muuga_city_parks: {
    title: "Parks & Waterfronts",
    sections: [
      { icon: "🌳", title: "Green space", rows: [
        { icon: "🌲", title: "Maardu Park", sub: "~4.5 km from the gate", action: "🧭" },
        { icon: "🌿", title: "Garden around the Seamen's Centre itself", sub: "The simplest option — right where the shuttle drops you", action: "🧭" },
      ]},
      { icon: "🌊", title: "Waterfront", rows: [
        { icon: "🚶", title: "Maardu järv (lake) promenade", sub: "~7 km from the gate", action: "🧭" },
      ]},
      { icon: "👁", title: "Viewpoint", rows: [
        { icon: "🚗", title: "Uustalu / Rannamõisa bluff", sub: "Needs a car to reach — not a walk-up option from here", action: "" },
      ]},
    ],
    note: "Realistically, the centre's own garden is the easy choice if you just want air without a long trip.",
    updated: "5 August 2026",
  },

  muuga_city_culture: {
    title: "Culture & Must-See",
    sections: [
      { icon: "⭐", title: "What's realistic from here", rows: [
        { icon: "1️⃣", title: "Seamen's Centre itself", sub: "1.8 km from the gate — pool table, Wi-Fi, a place to unwind", action: "🧭" },
        { icon: "2️⃣", title: "Maardu town", sub: "5 km — small and pleasant, a park, an Orthodox church, squares", action: "🧭" },
        { icon: "3️⃣", title: "Lasnamäe Centrum mall, Tallinn", sub: "12 km — for shopping", action: "🧭" },
        { icon: "4️⃣", title: "Tallinn Old Town", sub: "18 km — only worth it with a taxi/bus and at least 4–5 hours to spare", action: "🧭" },
      ]},
    ],
    note: "Muuga is genuinely a working port, well outside the city — the Old Town is a real excursion from here, not a quick walk like at Vanasadam. Plan your time accordingly.",
    updated: "5 August 2026",
  },

  muuga_city_free: {
    title: "Free Time & Relax",
    sections: [
      { icon: "🆓", title: "Somewhere to sit", rows: [
        { icon: "⚓", title: "Muuga Seamen's Centre", sub: "By far the best option — sockets, sofas, free Wi-Fi, hot tea, and it's safe", action: "🧭" },
      ]},
    ],
    note: "Out here, the centre isn't just one option among several — it's genuinely the place to be. Everything else involves a real trip.",
    updated: "5 August 2026",
  },

  muuga_city_safety: {
    title: "Safety",
    callout: { tone: "warn", text: "Before you leave, agree your return time with the ship and mark your ship's position on the Ship screen. Getting back to the right berth after dark, across a working industrial port, is a real risk here — take it seriously." },
    sections: [
      { icon: "🟡", title: "General risk", rows: [
        { icon: "🛡", title: "Safe but inconvenient by day", sub: "Industrial zone, missing pavements in places" },
        { icon: "🌑", title: "Walking not recommended after dark", sub: "Unlit highway sections, heavy truck traffic" },
      ]},
      { icon: "🚫", title: "Bringing anything back to the ship", rows: [
        { icon: "🍾", title: "Alcohol into the port is strictly forbidden without paperwork", sub: "Any amount, no exceptions — you need a permit signed by your ship's Master before it can come through the gate" },
      ]},
      { icon: "⚠️", title: "Watch out for", rows: [
        { icon: "🏚", title: "Abandoned warehouse areas along Nuudi tee at night", sub: "Avoid" },
        { icon: "💸", title: "Informal drivers asking €50+ for a ride into Tallinn", sub: "The real Bolt fare is €18–25 — order through the app" },
      ]},
      { icon: "🦺", title: "Rules here specifically", rows: [
        { icon: "🚫", title: "Hi-vis vest required after dark, port-wide", sub: "Enforced by port police and security — not optional" },
        { icon: "🍺", title: "No drinking in the street, car parks, or the industrial zone", sub: "" },
        { icon: "🕙", title: "Shop alcohol sales stop at 22:00", sub: "" },
      ]},
      { icon: "📞", title: "If something goes wrong", rows: [
        { icon: "🚨", title: "112", sub: "Police and ambulance · free · 24/7", action: "📞" },
        { icon: "🏛", title: "Seamen's Mission chaplain", sub: "+372 56 462 825", action: "📞" },
      ]},
    ],
    updated: "5 August 2026",
  },

  // ── MUUGA HARBOUR · SPIRITUAL CARE ──────────────────────────────────
  // Unlike Vanasadam, the Estonian Seamen's Mission chapel is physically
  // on site here — this is the "home" entry, not a referral 17 km away.
  muuga_spiritual_mission: {
    title: "Estonian Seamen's Mission",
    sections: [
      { icon: "🤝", title: "What they offer", rows: [
        { icon: "💬", title: "Ship visits, spiritual and emotional conversation", sub: "Lutheran / ecumenical — open to any Christian denomination, or none" },
        { icon: "🙏", title: "Prayer, books and literature", sub: "" },
        { icon: "🚐", title: "Practical help", sub: "Groceries, a SIM card, transfer to Maardu" },
      ]},
      { icon: "🕐", title: "When", rows: [
        { icon: "📅", title: "Mon–Sat, 14:00 – 21:00", sub: "Sunday by prior request" },
      ]},
    ],
    contacts: [
      { icon: "🧑‍💼", title: "Revo Jaager — Chaplain", sub: "English, Russian, Estonian, German", action: "💬" },
      { icon: "📞", title: "+372 56 462 825", sub: "Also WhatsApp", action: "📞" },
    ],
    updated: "5 August 2026",
  },

  muuga_spiritual_stella: {
    title: "Stella Maris",
    sections: [
      { icon: "🤝", title: "What they offer", rows: [
        { icon: "💬", title: "Ship visits on request, Mass and services", sub: "Catholic chaplaincy — including support for Filipino crews" },
      ]},
      { icon: "🕐", title: "When", rows: [
        { icon: "📅", title: "Daily, 08:00 – 19:00", sub: "At Sts Peter and Paul Cathedral, Tallinn Old Town — ~18 km from Muuga" },
      ]},
    ],
    contacts: [
      { icon: "📞", title: "+372 644 6367", sub: "Stella Maris Estonia chaplaincy / parish line", action: "📞" },
    ],
    note: "This one's a real trip out from Muuga — for anything less than a scheduled visit, the chaplain at the centre here can usually pass a message along.",
    updated: "5 August 2026",
  },

  muuga_spiritual_muslim: {
    title: "Muslim Support",
    sections: [
      { icon: "🕌", title: "Where", rows: [
        { icon: "📍", title: "Tallinn Islamic Cultural Centre — Keevise 9", sub: "~14 km from Muuga", action: "🧭" },
        { icon: "🕐", title: "Open for the five daily prayers", sub: "Friday (Jumu'ah) prayer around midday" },
      ]},
      { icon: "🤝", title: "Help available", rows: [
        { icon: "💬", title: "Conversation in Arabic, English, Russian, Estonian", sub: "Ask at the centre" },
      ]},
    ],
    contacts: [
      { icon: "📞", title: "+372 614 3086", sub: "Islamic Centre reception", action: "📞" },
    ],
    updated: "5 August 2026",
  },

  muuga_spiritual_orthodox: {
    title: "Orthodox",
    sections: [
      { icon: "⛪", title: "Where", rows: [
        { icon: "📍", title: "St Nicholas Church, Maardu — Otsa tee 1", sub: "~5 km from Muuga — the closer option than central Tallinn", action: "🧭" },
      ]},
      { icon: "🤝", title: "What they offer", rows: [
        { icon: "🙏", title: "Prayer — St Nicholas is the patron of seafarers", sub: "" },
        { icon: "⚓", title: "Ship blessing on request", sub: "" },
      ]},
      { icon: "🕐", title: "When", rows: [
        { icon: "📅", title: "Daily, 09:00 – 18:00", sub: "" },
      ]},
    ],
    contacts: [
      { icon: "📞", title: "+372 606 0842", sub: "Duty priest, Maardu", action: "📞" },
    ],
    updated: "5 August 2026",
  },

  muuga_spiritual_prayer: {
    title: "Places for Prayer",
    sections: [
      { icon: "🕊", title: "At the centre — the easy choice", rows: [
        { icon: "⚓", title: "Ecumenical chapel, Estonian Seamen's Mission", sub: "Altmetsa tee 1, ~1.8 km from Gate 1 — open to any faith", action: "🧭" },
      ]},
      { icon: "🏙", title: "Further away", rows: [
        { icon: "🕌", title: "Tallinn Islamic Cultural Centre", sub: "Keevise 9, ~14 km", action: "🧭" },
      ]},
    ],
    note: "Unlike Vanasadam, the prayer room is genuinely close here — it's part of the same building as the centre itself.",
    updated: "5 August 2026",
  },


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
  // Pattern for future ports: duplicate this object as wellness_zone_{portId}
  // once a real cabin is confirmed there (e.g. wellness_zone_hamburg). Until
  // then, that port's "wellness" row in its own Level-2 skeleton stays a
  // single PENDING row — see e.g. Hamburg below — so nothing here needs to
  // change per-port; only new real entries get added.
  wellness_zone_vanasadam: {
    gated: true,
    title: "Wellness Recovery Zone — Tallinn",
    note: "Your quiet harbor to rest, recover, and reset. A comfortable space offering massage, soothing scents, and deep relaxation for body and mind — everything you need to recharge your physical and emotional strength between watches.",
    contacts: [
      { icon: "🧑‍💼", title: "Kadri Saar — Your Wellness Host", sub: "Book a session via WhatsApp", action: "💬" },
    ],
    directions: [
      { icon: "📍", title: "Next to the Seafarers' Centre", sub: "Sadama 25, Tallinn", action: "🧭" },
    ],
  },
  legal_help: {
    gated: true,
    title: "Legal Assistance (Emergency)",
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
    title: "Free Medical Consultation",
    hours: [
      ["Monday", "08:00 – 20:00"], ["Tuesday", "08:00 – 20:00"], ["Wednesday", "08:00 – 20:00"],
      ["Thursday", "08:00 – 20:00"], ["Friday", "08:00 – 20:00"], ["Saturday", "09:00 – 15:00"], ["Sunday", "Emergency only"],
    ],
    contacts: [
      { icon: "🩺", title: "Tallinn Medical Clinic — priority booking", sub: "Union card covers consultation fee", action: "📞" },
      { icon: "🚑", title: "Emergency services", sub: "112 · Free · 24/7", action: "📞" },
    ],
  },
  // Psychological Support as a Premium service was dropped entirely on
  // 7 August 2026 — union legal advice: a real, licensed psychologist could
  // plausibly be found and vetted for one port like Tallinn, but doing this
  // safely at scale across many ports and jurisdictions carries real
  // liability risk, and IMWIRSA isn't positioned to carry it. If revisited,
  // that's a scope decision to make deliberately, not just re-add a row.
  port_discounts: {
    gated: true,
    title: "City Discounts & Privileges",
    note: "When paying at any of these partners, show your Premium QR code from the app at checkout to receive the discount included in the partner program.",
    contacts: [
      { icon: "🛍", title: "Rimi Supermarket", sub: "Sadama tn 21, Tallinn", action: "🧭" },
      { icon: "☕", title: "Seafarers' Centre café", sub: "Sadama tn 25, Tallinn", action: "🧭" },
      { icon: "🚕", title: "Partner taxi service", sub: "Pickup point at the centre — ask staff", action: "🧭" },
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
    categories: {
      centre: {
        title: "Seafarers' Centre",
        statusFrom: "vanasadam_centre_about",
        rows: [
          { icon: "ℹ️", title: "About the Centre", sub: "Opening hours, phone, coordinator, website", action: "›", sd: "vanasadam_centre_about" },
          { icon: "🎱", title: "Services", sub: "Hospitality, recreation, connectivity, welfare", action: "›", sd: "vanasadam_centre_services" },
          { icon: "🚐", title: "Free Shuttle Bus", sub: "Timetable, pickup point, how to recognise it", action: "›", sd: "vanasadam_centre_shuttle" },
          { icon: "📍", title: "Location & Route", sub: "Address, map, how to get there on foot", action: "›", sd: "vanasadam_centre_location" },
        ],
      },
      transport: {
        title: "Transport",
        rows: [
          { icon: "🚪", title: "Leaving the Port", sub: "Exit rules, required documents, gate information", action: "›", sd: "vanasadam_transport_leaving" },
          { icon: "🚐", title: "Port Shuttle", sub: "Timetable, pickup point, how to recognise it", action: "›", sd: "vanasadam_centre_shuttle" },
          { icon: "🚕", title: "Taxi", sub: "Trusted apps, estimated fare, safety tips", action: "›", sd: "vanasadam_transport_taxi" },
          { icon: "🚎", title: "Public Transport", sub: "Nearest stop, routes, tickets, journey to the city", action: "›", sd: "vanasadam_transport_public" },
        ],
      },
      shops: {
        title: "Shops & Food",
        rows: [
          { icon: "💱", title: "Currency Exchange", sub: "How to exchange money safely — read this first, before you need it", action: "›", sd: "vanasadam_currency_exchange" },
          { icon: "🛒", title: "Supermarkets", sub: "Nearest stores, shopping centres, 24/7 shops", action: "›", sd: "vanasadam_shops_supermarkets" },
          { icon: "🍽", title: "Food & Drinks", sub: "Seafarer-friendly places, fast food, local restaurants", action: "›", sd: "vanasadam_shops_food" },
          { icon: "📱", title: "Electronics & SIM Cards", sub: "Operators, SIM cards, Wi-Fi, chargers", action: "›", sd: "vanasadam_shops_sim" },
          { icon: "💊", title: "Pharmacies", sub: "Nearest and 24/7 pharmacies, prescription & OTC medicines", action: "›", sd: "vanasadam_shops_pharmacies" },
          { icon: "🎁", title: "Souvenirs", sub: "Where to find something to take home", action: "›", sd: "vanasadam_shops_souvenirs" },
          { icon: "⚓", title: "Seafarer Supplies", sub: "Workwear, safety gear, ship's stores", action: "›", sd: "vanasadam_shops_seafarer" },
        ],
      },
      citylife: {
        title: "City Life",
        rows: [
          { icon: "🌳", title: "Parks & Waterfronts", sub: "Promenade, parks, quiet green space, viewpoints", action: "›", sd: "vanasadam_city_parks" },
          { icon: "🏛", title: "Culture & Must-See", sub: "Top 5 city places, museums, historic centre", action: "›", sd: "vanasadam_city_culture" },
          { icon: "🧘", title: "Free Time & Relax", sub: "Free places, viewpoints, somewhere to sit and call home", action: "›", sd: "vanasadam_city_free" },
          { icon: "🛡", title: "Safety", sub: "What to know before going into the city", action: "›", sd: "vanasadam_city_safety" },
        ],
      },
      spiritual: {
        title: "Spiritual Care",
        rows: [
          // Neutral option first, deliberately: someone who simply wants to talk
          // should not have to choose a denomination in order to ask.
          { icon: "💬", title: "No particular faith — I'd just like to talk", sub: "Speak with your assistant, who can bring in the IMWIRSA Coordinator", action: "›", go: "assistantchat" },
          { icon: "⚓", title: "Estonian Seamen's Mission", sub: "Lutheran / ecumenical chaplaincy · ship visits, practical help", action: "›", sd: "vanasadam_spiritual_mission" },
          { icon: "✝️", title: "Stella Maris", sub: "Catholic chaplaincy · ship visits, Mass, guidance", action: "›", sd: "vanasadam_spiritual_stella" },
          { icon: "☦️", title: "Orthodox", sub: "St Nicholas Cathedral · prayer, ship blessing on request", action: "›", sd: "vanasadam_spiritual_orthodox" },
          { icon: "🕌", title: "Muslim Support", sub: "Islamic Centre · prayer hall, conversation, halal food", action: "›", sd: "vanasadam_spiritual_muslim" },
          { icon: "🙏", title: "Places for Prayer", sub: "Nearest prayer room and quiet churches in the Old Town", action: "›", sd: "vanasadam_spiritual_prayer" },
        ],
      },
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🩺", title: "Ida-Tallinna Keskhaigla (East Tallinn Central Hospital)", sub: "Ravi 18 · ~2.5 km · ER open 24/7", action: "🧭" },
          { icon: "🇬🇧", title: "Confido Medical Centre / Qvalitas", sub: "English- and Russian-speaking private clinics, paid service", action: "🧭" },
          { icon: "🏛", title: "Seamen's Mission chaplain", sub: "+372 56 462 825 · also +372 631 8234", action: "📞" },
          { icon: "🌐", title: "ISWAN 24/7 Helpline", sub: "+44 20 7283 2922 · Multilingual", action: "📞" },
          { icon: "⚖️", title: "ITF Inspector — Jaanus Kuiv", sub: "+372 50 63 908 · free basic advice on wages, contracts & seafarers' rights", action: "📞" },
          { icon: "🤝", title: "EMSA — Estonian Seafarers' Independent Union", sub: "+372 661 2406 · Mon–Fri 09:00–17:00", action: "📞" },
          { icon: "📡", title: "Port duty dispatcher", sub: "+372 631 8008 · 24/7", action: "📞" },
        ],
      },
      wellness: {
        title: "Premium Welfare Services", gated: true,
        rows: [
          { icon: "🔳", title: "Your Premium QR Code", sub: "Your digital ID for partner discounts, wellness entry, and union benefits.", action: "›", sd: "premium_qr" },
          { icon: "🏷", title: "City Discounts & Privileges", sub: "Show your QR code at partner venues in town for exclusive member discounts.", action: "›", sd: "port_discounts" },
          { icon: "🌊", title: "Wellness Recovery Zone", sub: "Private spaces to relax, recharge, and reduce stress during your port call.", action: "›", sd: "wellness_zone_vanasadam" },
          { icon: "🩺", title: "Free Medical Consultation", sub: "Free English-speaking health guidance and medical advice during your stay.", action: "›", sd: "medical_extended" },
          { icon: "⚖️", title: "Legal Assistance (Emergency)", sub: "Discounted English legal aid in critical situations with local authorities.", action: "›", sd: "legal_help" },
        ],
      },
    },
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
    categories: {
      centre: {
        title: "Seafarers' Centre",
        statusFrom: "muuga_centre_about",
        rows: [
          { icon: "ℹ️", title: "About the Centre", sub: "Opening hours, phone, chaplain, website", action: "›", sd: "muuga_centre_about" },
          { icon: "🎱", title: "Services", sub: "Hospitality, recreation, connectivity, welfare", action: "›", sd: "muuga_centre_services" },
          { icon: "🚐", title: "Free Shuttle Bus", sub: "From the ship or the gate, book ahead", action: "›", sd: "muuga_centre_shuttle" },
          { icon: "📍", title: "Location & Route", sub: "Address, map, how to get there on foot", action: "›", sd: "muuga_centre_location" },
        ],
      },
      transport: {
        title: "Transport",
        rows: [
          { icon: "🚪", title: "Leaving the Port", sub: "Exit rules, required documents, gate information", action: "›", sd: "muuga_transport_leaving" },
          { icon: "🚕", title: "Taxi", sub: "Apps, phone numbers, where to catch one", action: "›", sd: "muuga_transport_taxi" },
          { icon: "🚎", title: "Public Transport", sub: "Nearest stop, routes, tickets, journey to the city", action: "›", sd: "muuga_transport_public" },
        ],
      },
      shops: {
        title: "Shops & Food",
        rows: [
          { icon: "💱", title: "Currency Exchange", sub: "How to exchange money safely — read this first, before you need it", action: "›", sd: "muuga_currency_exchange" },
          { icon: "🛒", title: "Supermarkets", sub: "Nearest stores, shopping centres, 24/7 shops", action: "›", sd: "muuga_shops_supermarkets" },
          { icon: "🍽", title: "Food & Drinks", sub: "Seafarer-friendly places, local restaurants", action: "›", sd: "muuga_shops_food" },
          { icon: "📱", title: "Electronics & SIM Cards", sub: "Operators, SIM cards, Wi-Fi, chargers", action: "›", sd: "muuga_shops_sim" },
          { icon: "💊", title: "Pharmacies", sub: "Nearest and 24/7 pharmacies, prescription & OTC medicines", action: "›", sd: "muuga_shops_pharmacies" },
          { icon: "🎁", title: "Souvenirs", sub: "Where to find something to take home", action: "›", sd: "muuga_shops_souvenirs" },
          { icon: "⚓", title: "Seafarer Supplies", sub: "Workwear, safety gear", action: "›", sd: "muuga_shops_seafarer" },
        ],
      },
      citylife: {
        title: "City Life",
        rows: [
          { icon: "🌳", title: "Parks & Waterfronts", sub: "Nearest green space and water — a real trip out here", action: "›", sd: "muuga_city_parks" },
          { icon: "🏛", title: "Culture & Must-See", sub: "What's realistically reachable from Muuga", action: "›", sd: "muuga_city_culture" },
          { icon: "🧘", title: "Free Time & Relax", sub: "Somewhere to sit without spending anything", action: "›", sd: "muuga_city_free" },
          { icon: "🛡", title: "Safety", sub: "What to know before going into the city", action: "›", sd: "muuga_city_safety" },
        ],
      },
      spiritual: {
        title: "Spiritual Care",
        rows: [
          { icon: "💬", title: "No particular faith — I'd just like to talk", sub: "Speak with your assistant, who can bring in the IMWIRSA Coordinator", action: "›", go: "assistantchat" },
          { icon: "⚓", title: "Estonian Seamen's Mission", sub: "Right here at the centre · Lutheran / ecumenical, open to all", action: "›", sd: "muuga_spiritual_mission" },
          { icon: "✝️", title: "Stella Maris", sub: "Catholic chaplaincy · ship visits, Mass, guidance", action: "›", sd: "muuga_spiritual_stella" },
          { icon: "☦️", title: "Orthodox", sub: "St Nicholas Church, Maardu · prayer, ship blessing on request", action: "›", sd: "muuga_spiritual_orthodox" },
          { icon: "🕌", title: "Muslim Support", sub: "Islamic Centre, Tallinn · prayer hall, halal food", action: "›", sd: "muuga_spiritual_muslim" },
          { icon: "🙏", title: "Places for Prayer", sub: "The ecumenical chapel is right here at the centre", action: "›", sd: "muuga_spiritual_prayer" },
        ],
      },
      emergency: {
        title: "Emergency Contacts",
        rows: [
          { icon: "🚨", title: "Police / Ambulance", sub: "112 · Free, 24/7", action: "📞" },
          { icon: "🩺", title: "Ida-Tallinna Keskhaigla (East Tallinn Central Hospital)", sub: "Ravi 18 · ~19 km · ER open 24/7", action: "🧭" },
          { icon: "🇬🇧", title: "Confido Medical Centre / Qvalitas", sub: "English- and Russian-speaking private clinics, paid service", action: "🧭" },
          { icon: "🏛", title: "Seamen's Mission chaplain", sub: "+372 56 462 825 · also +372 631 8234", action: "📞" },
          { icon: "🌐", title: "ISWAN 24/7 Helpline", sub: "+44 20 7283 2922 · Multilingual", action: "📞" },
          { icon: "⚖️", title: "ITF Inspector — Jaanus Kuiv", sub: "+372 50 63 908 · free basic advice on wages, contracts & seafarers' rights", action: "📞" },
          { icon: "🤝", title: "EMSA — Estonian Seafarers' Independent Union", sub: "+372 661 2406 · Mon–Fri 09:00–17:00", action: "📞" },
          { icon: "📡", title: "Port duty dispatcher", sub: "+372 631 8008 · 24/7", action: "📞" },
        ],
      },
      wellness: { title: "Premium Welfare Services", gated: true, rows: [ PENDING("ℹ️", TBD, "Trade Union partner services pending confirmation for this terminal") ] },
    },
  },

  "constanta-main": {
    meta: { flag: "🇷🇴", terminal: "Constanța", city: "Constanța", country: "Romania", tz: "UTC+2", lat: 44.1730, lng: 28.6520 },
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

  "hamburg-main": {
    meta: { flag: "🇩🇪", terminal: "Hamburg", city: "Hamburg", country: "Germany", tz: "UTC+2", lat: 53.5335, lng: 9.9481 },
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

  "istanbul-haydarpasa": {
    meta: { flag: "🇹🇷", terminal: "Haydarpaşa", city: "Istanbul", country: "Türkiye", tz: "UTC+3", lat: 41.0011, lng: 29.0192 },
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

function currentPort() { return PORTS[state.portId] || PORTS["tallinn-vanasadam"]; }
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
  constanta: "constanta-main",
  hamburg: "hamburg-main",
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

function updateAssistantUI() {
  const a = getAssistant(state.assistant);
  if (!a) return;

  const introPhoto = getAssistantPhoto(a.id, "introHero");
  document.getElementById("introAvatar").innerHTML = `<img src="${introPhoto}" alt="${a.name}" loading="lazy">`;
  document.getElementById("introName").textContent = a.name;
  document.getElementById("introMsg").textContent = a.greet;

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
  if (name === "volunteer") {
    const ctxEl = document.getElementById("chatPortContext");
    if (ctxEl) ctxEl.textContent = portDisplayName(currentPort());
  }
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
function openDetail(key) {
  const data = currentCategories()[key];
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
  "самоубийств", "покончить с собой", "убью себя", "не хочу жить", "причинить себе вред",
  "intihar", "kendimi öldür", "yaşamak istemiyorum", "kendime zarar",
  "magpakamatay", "papatayin ko ang sarili ko", "ayoko na mabuhay",
];
function isRedLineTopic(text) {
  const lower = text.toLowerCase();
  return RED_LINE_KEYWORDS.some((kw) => lower.includes(kw));
}

const COMPLEX_TOPIC_KEYWORDS = [
  "sad", "lonely", "alone", "can't sleep", "cant sleep", "no one listens", "nobody listens",
  "depressed", "hopeless",
  "captain", "master", "argue", "argued", "fight", "shouted", "yelled", "threat", "threatened",
  "bar", "alcohol", "drink", "girl", "girlfriend", "women", "woman", "dating", "meet someone",
  "bad news from home", "family problem", "divorce",
];

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
      const replies = t("demoReplies");
      const reply = replies[state.assistantReplyIndex % replies.length];
      state.assistantReplyIndex++;
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
