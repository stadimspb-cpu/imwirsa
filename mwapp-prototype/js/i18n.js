// ============================================================
// MWApp — i18n scaffold
//
// "en" is the source of truth. Every other language falls back to
// "en" for any key that's empty or missing, so the app never shows
// a blank string while translations are still in progress.
//
// HOW TO FINISH A TRANSLATION (for a translator, not a developer):
//   1. Find the language block below (ru / tr / fil).
//   2. Fill in the value for each key — copy the structure from
//      "en", keep the key names exactly as they are, translate only
//      the text on the right of each colon.
//   3. Save the file. Nothing else needs to change — every screen
//      pulls its text from here automatically.
//
// SCOPE NOTE: this file covers app "chrome" — buttons, labels,
// assistant persona text, system/escalation messages. It does NOT
// cover port content (hours, contacts, addresses — the PORTS and
// SUBDETAILS objects in app.js). That's real-world data that needs
// a curator/translator per port, and is a separate pass once the
// port data model is finalised.
// ============================================================
const I18N = {
  en: {
    lighthouse: {
      sub: "IMWIRSA presents",
      headline: "Welcome, Seafarer.",
      text: "The sea has connected people and nations for thousands of years. You are not alone. MWApp is here to guide and support you wherever your journey takes you.",
      cta: "CONTINUE",
    },
    onboard: {
      title: "Choose your assistant",
      sub: "We're here to support you every step of the way.",
      chooseLanguage: "Choose your language",
      continueBtn: "Continue",
    },
    intro: {
      hello: "Hello!",
      imText: "I'm",
      role: "your MWA Assistant.",
      changeLink: "Change assistant or language",
      continueBtn: "Continue",
    },
    name: {
      msg: "One more thing — completely optional. How would you like me to address you? You can skip this at any time.",
      placeholder: "Enter your name or a nickname",
      save: "Save",
      skip: "Skip",
    },
    home: {
      tapToChat: "Tap to chat →",
      heroGreeting: "Welcome to the Port of {port}. Choose a category below for local help, or just ask me.",
      emergencyContacts: "Emergency contacts",
      categories: {
        centre: "Seafarers'<br>Centre",
        transport: "Transport",
        shops: "Shops &<br>Food",
        citylife: "City Life",
        spiritual: "Spiritual<br>Care",
        ask: "Ask the<br>assistant",
      },
      install: {
        title: "Add MWApp to your Home Screen",
        subDefault: "Get one-tap access next time, like a real app.",
        subIOS: "Tap 'Add', then follow 2 quick steps.",
        add: "Add",
      },
      location: {
        title: "Find your port automatically?",
        sub: "Used once, on this device, to detect the nearest port. Never sent to our servers or stored.",
        enable: "Enable",
      },
    },
    // Shared labels used inside Level-3 content blocks.
    common: {
      awaitingData: "Awaiting port data",
      hours: "Hours",
      contacts: "Contacts",
      gettingThere: "Getting there",
      schedule: "Schedule",
      next: "NEXT",
      openInMaps: "Map",
      openMapsBtn: "Open in Maps",
      goodToKnow: "Good to know",
      lastUpdated: "Last updated: {date} · source: Port Welfare Manager",
      qrRefresh: "Refreshes in {s}s",
    },
    status: {
      openUntil: "Open until {time}",
      closedOpensAt: "Closed · opens at {time}",
      closedForToday: "Closed for today",
    },
    chat: { inputPlaceholder: "Type a message…" },
    coordinator: {
      title: "💬 IMWIRSA Welfare Coordinator",
      statusAnonymous: "Anonymous · Available 24/7 ·",
      connecting: "Connecting you with a Coordinator…",
      firstMessage: "Hello, this is Kadri, your IMWIRSA Welfare Coordinator. I'm here to listen — how are you doing today?",
      demoReplies: [
        "Thank you for sharing that. I'm listening — take your time.",
        "That sounds difficult. You're not alone in this, and I'm here with you right now.",
        "Would it help to talk through what's on your mind, or would you prefer some practical suggestions?",
      ],
    },
    settings: {
      title: "Settings",
      subtitleRole: "Your Maritime Welfare Assistant",
      preferences: "Preferences",
      changeAssistant: "Change assistant",
      language: "Language",
      myName: "My name",
      talkToCoordinator: "Talk to IMWIRSA Welfare Coordinator",
      membership: "Membership",
      yourMwaId: "Your MWA-ID",
      unionCard: "Union / Club Card",
      unionActive: "Active this month ✓",
      unionNeedsReconfirm: "Needs reconfirmation ›",
      unionNotConfirmed: "Not confirmed yet ›",
      portLocationDev: "Port & Location (dev preview)",
      detectLocation: "Detect port by location",
      detectLocating: "Locating…",
      detectUpdated: "Updated ✓",
      detectUnavailable: "Unavailable — pick manually below",
      testPort: "Test port",
      context: "Context (auto once GPS is added)",
      contextAtPort: "At the port ›",
      contextInCity: "In the city ›",
      dataPrivacy: "Data & Privacy",
      nameStoredNote: "Your name is stored only on this device",
      clearData: "Clear my data",
      startOver: "Start over (show first launch again)",
      about: "About",
      versionLabel: "MWApp v0.1 (prototype)",
      website: "imwirsa.org",
    },
    nav: { port: "Port", ship: "Ship", settings: "Settings" },
    modals: {
      lang: { title: "Choose your language" },
      assistant: { title: "Choose your assistant" },
      union: {
        title: "Check your card status",
        text1: "This confirms your Trade Union or partner club card is active. Confirmation is required once a month — first on setup, then again on the 1st of every following month.",
        text2: "Demo mode: real-time verification with your union is coming soon. For now, simulate a result below.",
        simActive: "Simulate: card is Active",
        simInactive: "Simulate: card is Not active",
        cancel: "Cancel",
      },
      unionDenied: {
        title: "Premium Welfare Services unavailable",
        text1: "Your Trade Union / club card isn't currently active, so this level isn't available right now. You can keep using everything under <strong>Standard</strong>.",
        text2: "To get or renew a card, contact IMWIRSA support:",
        whatsapp: "💬 WhatsApp +372 5561 3815",
        close: "Close",
      },
      clearData: {
        title: "Delete everything stored on this device?",
        text: "This removes your name, your MWA-ID, your card status and your ship's marked position. Everything is stored only on this phone, so once deleted it cannot be recovered.",
        confirm: "Delete everything",
        cancel: "Cancel",
      },
      port: { title: "Test port (dev preview)" },
      context: {
        title: "Where is the seafarer right now?",
        text: "This will be detected automatically once GPS is connected. For now, switch manually to preview both states.",
        atPort: "At the port",
        inCity: "In the city",
      },
      iosInstall: {
        title: "Add to Home Screen",
        step1: 'Tap the <strong>Share</strong> button <span class="ios-icon">⬆️</span> in your browser\'s toolbar',
        step2: 'Scroll down and tap <strong>"Add to Home Screen"</strong> <span class="ios-icon">➕</span>',
        step3: 'Tap <strong>"Add"</strong> in the top corner',
        gotIt: "Got it",
      },
      gate: {
        msg: "Available to Trade Union card holders",
        sub: "Contacts and booking unlock once your active Trade Union card is confirmed.",
        confirm: "Confirm card",
      },
    },
    assistants: {
      alex: {
        name: "Alex",
        tag: "I'll help you find information and guidance.",
        greet: "Hello! My name is Alex. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language at any time in Settings. How may I help you today?",
      },
      omar: {
        name: "Omar",
        tag: "I'll make sure you feel supported and informed.",
        greet: "Hello, my friend. My name is Omar. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language any time in Settings. How may I help you today?",
      },
      sophia: {
        name: "Sophia",
        tag: "I'll guide you with care and answer your questions.",
        greet: "Hello! My name is Sophia. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language at any time in Settings. How may I help you today?",
      },
      grace: {
        name: "Grace",
        tag: "I'll support you every step of your journey.",
        greet: "Hello! My name is Grace. I'll be your Maritime Welfare Assistant during this voyage. You can change your assistant or language at any time in Settings. How may I help you today?",
      },
    },
    escalation: {
      alex: "This sounds like something worth talking through with a real person. I can connect you to the IMWIRSA Welfare Coordinator right now, or we can keep talking here — your choice.",
      omar: "My friend, this is something worth speaking about with a real person, not just with me. I can bring in the IMWIRSA Welfare Coordinator right now — or if you'd rather keep talking to me a little longer, that's alright too.",
      sophia: "Thank you for telling me this. It matters, and I want you to talk to someone who can really help — I can connect you with the IMWIRSA Welfare Coordinator right now, or stay here with you a little longer if you'd rather. Whatever feels right.",
      grace: "This is important, and you deserve to speak with someone who can properly help. I can connect you with the IMWIRSA Welfare Coordinator now, if you wish — or, if you prefer, we can continue speaking here. The choice is yours.",
    },
    escalationToggle: { continueBtn: "Continue", coordinatorBtn: "Coordinator" },
    categoryPrompts: {
      centre: "Any questions about the seafarers' centre — opening hours, services, how to get there? Ask me, and I'll bring in the centre's own team if it's something only they can help with.",
      transport: "Need help getting around — shuttle times, taxis, buses, or leaving the port? Just ask, I'm right here.",
      shops: "Looking for food, supplies, a SIM card or a pharmacy nearby? Let me know what you need.",
      citylife: "Thinking of going into the city? I can tell you what's nearby and what's worth knowing before you go.",
      spiritual: "If you'd like to speak with a chaplain, find a quiet place, or simply have someone to talk to — I can help you find who's here.",
      emergency: "If this is urgent, use the contacts below right away. I'm also here if you want to talk it through.",
      fallback: "How can I help you here?",
    },
    askMe: {
      centre: "Not sure where to start? Ask me →",
      transport: "Can't find your ride? Ask me →",
      shops: "Looking for something specific? Ask me →",
      citylife: "Not sure where to go? Ask me →",
      spiritual: "Would you rather just talk? Ask me →",
      emergency: "Need help right now? Ask me →",
      wellness: "Have a question about this? Ask me →",
      default: "Not sure? Ask me →",
    },
    wellness: {
      unlockedIntro: "Welcome back — your Trade Union card is confirmed for this month. Here's what's available to you.",
      lockedIntro: "These are Trade Union member services. To unlock them, please confirm your card status in Settings → Union / Trade Card.",
      roleSuffix: "Trade Union Support",
    },
    demoReplies: [
      "Got it — let me know if you'd like directions or more details on that.",
      "I can help with that. Is there anything else on your mind?",
      "Sure thing. Feel free to ask me anything else about the port or the app.",
    ],
    ship: {
      title: "My Ship",
      introText: "Before you go ashore, mark exactly where your ship is docked. If you're not sure how to get back — especially at night, or if the port has several gates — MWApp will guide you to this exact spot, not just \"the port\".",
      markBtn: "📍 Mark my ship's location",
      markedLabel: "Location marked",
      markedToday: "Today",
      navigateBtn: "🧭 Navigate back to my ship",
      remarkBtn: "Mark a new location",
      errorText: "Couldn't get your location. Please check that location access is allowed for this browser, then try again.",
      privacyNote: "Saved only on this device. Never sent to our servers.",
    },
  },
  // ---------------------------------------------------------------
  // RUSSIAN / TURKISH / FILIPINO — TODO: replace with real translations.
  // Leave keys empty ({}) until ready; the app shows English until filled.
  // ---------------------------------------------------------------
  ru: {
    lighthouse: {
      sub: "IMWIRSA представляет",
      headline: "Добро пожаловать, моряк.",
      text: "Море тысячелетиями связывает людей и народы. Вы не одиноки. MWApp всегда рядом, чтобы направлять и поддерживать вас, куда бы ни вёл ваш путь.",
      cta: "ПРОДОЛЖИТЬ",
    },
    onboard: {
      title: "Выберите своего ассистента",
      sub: "Мы рядом на каждом шаге вашего пути.",
      chooseLanguage: "Выберите язык",
      continueBtn: "Продолжить",
    },
    intro: {
      hello: "Здравствуйте!",
      imText: "Меня зовут",
      role: "ваш ассистент MWA.",
      changeLink: "Сменить ассистента или язык",
      continueBtn: "Продолжить",
    },
    name: {
      msg: "Ещё один момент — это совершенно необязательно. Как мне к вам обращаться? Вы можете пропустить этот шаг в любое время.",
      placeholder: "Введите имя или псевдоним",
      save: "Сохранить",
      skip: "Пропустить",
    },
    home: {
      tapToChat: "Нажмите, чтобы начать чат →",
      heroGreeting: "Добро пожаловать в порт {port}. Выберите категорию ниже, чтобы получить помощь на месте, или просто спросите меня.",
      emergencyContacts: "Экстренные контакты",
      categories: {
        centre: "Центр<br>моряков",
        transport: "Транспорт",
        shops: "Магазины<br>и еда",
        citylife: "Жизнь в городе",
        spiritual: "Духовная<br>поддержка",
        ask: "Спросить<br>ассистента",
      },
      install: {
        title: "Добавьте MWApp на главный экран",
        subDefault: "В следующий раз открывайте одним нажатием, как настоящее приложение.",
        subIOS: "Нажмите «Добавить», затем выполните 2 простых шага.",
        add: "Добавить",
      },
      location: {
        title: "Определить порт автоматически?",
        sub: "Используется один раз, только на этом устройстве, чтобы определить ближайший порт. Никогда не отправляется на наши серверы и не сохраняется.",
        enable: "Включить",
      },
    },
    common: {
      awaitingData: "Ожидание данных порта",
      hours: "Часы работы",
      contacts: "Контакты",
      gettingThere: "Как добраться",
      schedule: "Расписание",
      next: "ДАЛЕЕ",
      openInMaps: "Карта",
      openMapsBtn: "Открыть в картах",
      goodToKnow: "Полезно знать",
      lastUpdated: "Обновлено: {date} · источник: менеджер по благосостоянию порта",
      qrRefresh: "Обновится через {s}с",
    },
    status: {
      openUntil: "Открыто до {time}",
      closedOpensAt: "Закрыто · открывается в {time}",
      closedForToday: "Закрыто на сегодня",
    },
    chat: { inputPlaceholder: "Введите сообщение…" },
    coordinator: {
      title: "💬 Координатор по благосостоянию IMWIRSA",
      statusAnonymous: "Анонимно · Доступно 24/7 ·",
      connecting: "Соединяем вас с координатором…",
      firstMessage: "Здравствуйте, это Кадри, ваш координатор по благосостоянию IMWIRSA. Я здесь, чтобы выслушать вас — как вы себя чувствуете сегодня?",
      demoReplies: [
        "Спасибо, что рассказали об этом. Я слушаю — не торопитесь.",
        "Похоже, это непросто. Вы не одиноки, и я сейчас рядом с вами.",
        "Вам помогло бы обсудить то, что вас беспокоит, или вы предпочли бы практические советы?",
      ],
    },
    settings: {
      title: "Настройки",
      subtitleRole: "Ваш ассистент по благосостоянию моряков",
      preferences: "Предпочтения",
      changeAssistant: "Сменить ассистента",
      language: "Язык",
      myName: "Моё имя",
      talkToCoordinator: "Связаться с координатором IMWIRSA",
      membership: "Членство",
      yourMwaId: "Ваш MWA-ID",
      unionCard: "Карта профсоюза / клуба",
      unionActive: "Активна в этом месяце ✓",
      unionNeedsReconfirm: "Требуется подтверждение ›",
      unionNotConfirmed: "Ещё не подтверждена ›",
      portLocationDev: "Порт и локация (тест. версия)",
      detectLocation: "Определить порт по геолокации",
      detectLocating: "Определение местоположения…",
      detectUpdated: "Обновлено ✓",
      detectUnavailable: "Недоступно — выберите вручную ниже",
      testPort: "Тестовый порт",
      context: "Контекст (авто после подключения GPS)",
      contextAtPort: "В порту ›",
      contextInCity: "В городе ›",
      dataPrivacy: "Данные и конфиденциальность",
      nameStoredNote: "Ваше имя хранится только на этом устройстве",
      clearData: "Удалить мои данные",
      startOver: "Начать заново (показать первый запуск снова)",
      about: "О приложении",
      versionLabel: "MWApp v0.1 (прототип)",
      website: "imwirsa.org",
    },
    nav: { port: "Порт", ship: "Судно", settings: "Настройки" },
    modals: {
      lang: { title: "Выберите язык" },
      assistant: { title: "Выберите ассистента" },
      union: {
        title: "Проверьте статус карты",
        text1: "Это подтверждает, что ваша карта профсоюза или партнёрского клуба активна. Подтверждение требуется раз в месяц — сначала при настройке, затем 1-го числа каждого следующего месяца.",
        text2: "Демо-режим: проверка в реальном времени с профсоюзом скоро появится. Пока смоделируйте результат ниже.",
        simActive: "Смоделировать: карта активна",
        simInactive: "Смоделировать: карта не активна",
        cancel: "Отмена",
      },
      unionDenied: {
        title: "Премиум-услуги благосостояния недоступны",
        text1: "Ваша карта профсоюза/клуба сейчас не активна, поэтому этот уровень временно недоступен. Вы можете продолжать пользоваться всем в разделе <strong>Стандарт</strong>.",
        text2: "Чтобы получить или продлить карту, свяжитесь с поддержкой IMWIRSA:",
        whatsapp: "💬 WhatsApp +372 5561 3815",
        close: "Закрыть",
      },
      clearData: {
        title: "Удалить все данные, сохранённые на этом устройстве?",
        text: "Это удалит ваше имя, ваш MWA-ID, статус карты и отмеченное местоположение судна. Всё хранится только на этом телефоне, поэтому после удаления восстановить это будет нельзя.",
        confirm: "Удалить всё",
        cancel: "Отмена",
      },
      port: { title: "Тестовый порт (тест. версия)" },
      context: {
        title: "Где сейчас находится моряк?",
        text: "Это будет определяться автоматически после подключения GPS. Пока переключайте вручную, чтобы посмотреть оба состояния.",
        atPort: "В порту",
        inCity: "В городе",
      },
      iosInstall: {
        title: "Добавить на главный экран",
        step1: 'Нажмите кнопку <strong>«Поделиться»</strong> <span class="ios-icon">⬆️</span> на панели браузера',
        step2: 'Прокрутите вниз и нажмите <strong>«На экран «Домой»»</strong> <span class="ios-icon">➕</span>',
        step3: 'Нажмите <strong>«Добавить»</strong> в верхнем углу',
        gotIt: "Понятно",
      },
      gate: {
        msg: "Доступно держателям карты профсоюза",
        sub: "Контакты и бронирование откроются после подтверждения активной карты профсоюза.",
        confirm: "Подтвердить карту",
      },
    },
    assistants: {
      alex: {
        name: "Алекс",
        tag: "Я помогу вам найти информацию и подскажу, что делать.",
        greet: "Здравствуйте! Меня зовут Алекс. Я буду вашим ассистентом по благосостоянию моряков в этом рейсе. Вы можете сменить ассистента или язык в любое время в настройках. Чем я могу вам помочь сегодня?",
      },
      omar: {
        name: "Омар",
        tag: "Я позабочусь о том, чтобы вы чувствовали поддержку и были в курсе всего.",
        greet: "Здравствуйте, друг мой. Меня зовут Омар. Я буду вашим ассистентом по благосостоянию моряков в этом рейсе. Вы можете сменить ассистента или язык в любое время в настройках. Чем я могу вам помочь сегодня?",
      },
      sophia: {
        name: "София",
        tag: "Я буду заботливо направлять вас и отвечать на ваши вопросы.",
        greet: "Здравствуйте! Меня зовут София. Я буду вашим ассистентом по благосостоянию моряков в этом рейсе. Вы можете сменить ассистента или язык в любое время в настройках. Чем я могу вам помочь сегодня?",
      },
      grace: {
        name: "Грейс",
        tag: "Я буду поддерживать вас на каждом этапе вашего пути.",
        greet: "Здравствуйте! Меня зовут Грейс. Я буду вашим ассистентом по благосостоянию моряков в этом рейсе. Вы можете сменить ассистента или язык в любое время в настройках. Чем я могу вам помочь сегодня?",
      },
    },
    escalation: {
      alex: "Похоже, об этом стоит поговорить с реальным человеком. Я могу прямо сейчас соединить вас с координатором IMWIRSA, или мы можем продолжить разговор здесь — выбор за вами.",
      omar: "Друг мой, об этом стоит поговорить с реальным человеком, а не только со мной. Я могу прямо сейчас подключить координатора IMWIRSA — или, если вы предпочитаете ещё немного поговорить со мной, это тоже нормально.",
      sophia: "Спасибо, что рассказали мне об этом. Это важно, и я хочу, чтобы вы поговорили с тем, кто действительно сможет помочь — я могу прямо сейчас соединить вас с координатором IMWIRSA, или остаться здесь с вами ещё немного, если вы предпочитаете. Как вам будет комфортнее.",
      grace: "Это важно, и вы заслуживаете поговорить с тем, кто действительно может помочь. Я могу соединить вас с координатором IMWIRSA прямо сейчас, если хотите — или, если предпочитаете, мы можем продолжить разговор здесь. Выбор за вами.",
    },
    escalationToggle: { continueBtn: "Продолжить", coordinatorBtn: "Координатор" },
    categoryPrompts: {
      centre: "Есть вопросы о центре моряков — часы работы, услуги, как добраться? Спросите меня, и я подключу команду центра, если это то, в чём могут помочь только они.",
      transport: "Нужна помощь с передвижением — расписание шаттлов, такси, автобусы или выход из порта? Просто спросите, я рядом.",
      shops: "Ищете еду, товары, сим-карту или ближайшую аптеку? Дайте знать, что вам нужно.",
      citylife: "Планируете поехать в город? Я расскажу, что рядом и что стоит знать перед поездкой.",
      spiritual: "Если хотите поговорить с капелланом, найти тихое место или просто с кем-то поговорить — я помогу вам найти нужного человека.",
      emergency: "Если это срочно, сразу используйте контакты ниже. Я тоже здесь, если хотите обсудить ситуацию.",
      fallback: "Чем я могу вам помочь?",
    },
    askMe: {
      centre: "Не знаете, с чего начать? Спросите меня →",
      transport: "Не можете найти транспорт? Спросите меня →",
      shops: "Ищете что-то конкретное? Спросите меня →",
      citylife: "Не знаете, куда пойти? Спросите меня →",
      spiritual: "Хотите просто поговорить? Спросите меня →",
      emergency: "Нужна помощь прямо сейчас? Спросите меня →",
      wellness: "Есть вопрос об этом? Спросите меня →",
      default: "Не уверены? Спросите меня →",
    },
    wellness: {
      unlockedIntro: "С возвращением — ваша карта профсоюза подтверждена на этот месяц. Вот что вам доступно.",
      lockedIntro: "Это услуги для членов профсоюза. Чтобы открыть их, подтвердите статус карты в Настройках → Карта профсоюза/клуба.",
      roleSuffix: "Поддержка профсоюза",
    },
    demoReplies: [
      "Понял — дайте знать, если нужны маршрут или подробности.",
      "Я могу с этим помочь. Есть ещё что-то, что вас беспокоит?",
      "Конечно. Не стесняйтесь спрашивать меня о порте или приложении что угодно ещё.",
    ],
    ship: {
      title: "Моё судно",
      introText: "Прежде чем сойти на берег, отметьте точное место стоянки вашего судна. Если не уверены, как вернуться — особенно ночью или если в порту несколько проходных — MWApp приведёт вас именно к этому месту, а не просто «в порт».",
      markBtn: "📍 Отметить место стоянки судна",
      markedLabel: "Место отмечено",
      markedToday: "Сегодня",
      navigateBtn: "🧭 Проложить маршрут к судну",
      remarkBtn: "Отметить новое место",
      errorText: "Не удалось определить местоположение. Проверьте, разрешён ли доступ к геолокации для этого браузера, и попробуйте снова.",
      privacyNote: "Сохраняется только на этом устройстве. Никогда не отправляется на наши серверы.",
    },
  },
  tr: {
    lighthouse: {
      sub: "IMWIRSA sunar",
      headline: "Hoş geldin, Denizci.",
      text: "Deniz, binlerce yıldır insanları ve ulusları birbirine bağladı. Yalnız değilsin. MWApp, yolculuğun seni nereye götürürse götürsün sana rehberlik etmek ve destek olmak için burada.",
      cta: "DEVAM ET",
    },
    onboard: {
      title: "Asistanını seç",
      sub: "Yolculuğunun her adımında yanındayız.",
      chooseLanguage: "Dilini seç",
      continueBtn: "Devam et",
    },
    intro: {
      hello: "Merhaba!",
      imText: "Ben",
      role: "senin MWA Asistanınım.",
      changeLink: "Asistanı veya dili değiştir",
      continueBtn: "Devam et",
    },
    name: {
      msg: "Bir şey daha — tamamen isteğe bağlı. Sana nasıl hitap etmemi istersin? İstediğin zaman bu adımı atlayabilirsin.",
      placeholder: "Adını veya bir takma ad gir",
      save: "Kaydet",
      skip: "Atla",
    },
    home: {
      tapToChat: "Sohbet etmek için dokun →",
      heroGreeting: "{port} Limanı'na hoş geldin. Yerel yardım için aşağıdan bir kategori seç ya da doğrudan bana sor.",
      emergencyContacts: "Acil durum irtibatları",
      categories: {
        centre: "Denizci<br>Merkezi",
        transport: "Ulaşım",
        shops: "Mağazalar<br>ve Yiyecek",
        citylife: "Şehir Hayatı",
        spiritual: "Manevi<br>Destek",
        ask: "Asistana<br>sor",
      },
      install: {
        title: "MWApp'ı Ana Ekranına Ekle",
        subDefault: "Bir dahaki sefere gerçek bir uygulama gibi tek dokunuşla eriş.",
        subIOS: "'Ekle'ye dokun, ardından 2 basit adımı izle.",
        add: "Ekle",
      },
      location: {
        title: "Limanını otomatik olarak bulalım mı?",
        sub: "En yakın limanı belirlemek için yalnızca bu cihazda ve tek seferlik kullanılır. Sunucularımıza asla gönderilmez veya saklanmaz.",
        enable: "Etkinleştir",
      },
    },
    common: {
      awaitingData: "Liman verisi bekleniyor",
      hours: "Çalışma saatleri",
      contacts: "İletişim",
      gettingThere: "Nasıl gidilir",
      schedule: "Program",
      next: "İLERİ",
      openInMaps: "Harita",
      openMapsBtn: "Haritalarda Aç",
      goodToKnow: "Bilmekte fayda var",
      lastUpdated: "Son güncelleme: {date} · kaynak: Liman Refah Yöneticisi",
      qrRefresh: "{s} sn içinde yenilenecek",
    },
    status: {
      openUntil: "{time}'e kadar açık",
      closedOpensAt: "Kapalı · {time}'de açılıyor",
      closedForToday: "Bugün kapalı",
    },
    chat: { inputPlaceholder: "Bir mesaj yaz…" },
    coordinator: {
      title: "💬 IMWIRSA Refah Koordinatörü",
      statusAnonymous: "Anonim · 7/24 Erişilebilir ·",
      connecting: "Bir koordinatörle bağlanıyorsun…",
      firstMessage: "Merhaba, ben Kadri, IMWIRSA Refah Koordinatörün. Seni dinlemek için buradayım — bugün nasılsın?",
      demoReplies: [
        "Bunu paylaştığın için teşekkür ederim. Dinliyorum — acele etmene gerek yok.",
        "Bu zor görünüyor. Bunda yalnız değilsin, şu anda yanındayım.",
        "Aklındakileri konuşmak yardımcı olur mu, yoksa pratik öneriler mi tercih edersin?",
      ],
    },
    settings: {
      title: "Ayarlar",
      subtitleRole: "Denizci Refah Asistanın",
      preferences: "Tercihler",
      changeAssistant: "Asistanı değiştir",
      language: "Dil",
      myName: "Adım",
      talkToCoordinator: "IMWIRSA Refah Koordinatörü ile Konuş",
      membership: "Üyelik",
      yourMwaId: "MWA-ID'in",
      unionCard: "Sendika / Kulüp Kartı",
      unionActive: "Bu ay aktif ✓",
      unionNeedsReconfirm: "Yeniden onay gerekiyor ›",
      unionNotConfirmed: "Henüz onaylanmadı ›",
      portLocationDev: "Liman ve Konum (test sürümü)",
      detectLocation: "Konuma göre limanı belirle",
      detectLocating: "Konum belirleniyor…",
      detectUpdated: "Güncellendi ✓",
      detectUnavailable: "Kullanılamıyor — aşağıdan manuel seç",
      testPort: "Test limanı",
      context: "Bağlam (GPS eklendiğinde otomatik)",
      contextAtPort: "Limanda ›",
      contextInCity: "Şehirde ›",
      dataPrivacy: "Veri ve Gizlilik",
      nameStoredNote: "Adın yalnızca bu cihazda saklanır",
      clearData: "Verilerimi sil",
      startOver: "Baştan başla (ilk açılışı tekrar göster)",
      about: "Hakkında",
      versionLabel: "MWApp v0.1 (prototip)",
      website: "imwirsa.org",
    },
    nav: { port: "Liman", ship: "Gemi", settings: "Ayarlar" },
    modals: {
      lang: { title: "Dilini seç" },
      assistant: { title: "Asistanını seç" },
      union: {
        title: "Kart durumunu kontrol et",
        text1: "Bu, Sendika veya ortak kulüp kartının aktif olduğunu doğrular. Onay ayda bir kez gereklidir — ilk kurulumda, ardından her ayın 1'inde tekrar.",
        text2: "Demo modu: sendikanla gerçek zamanlı doğrulama yakında geliyor. Şimdilik aşağıda bir sonucu simüle et.",
        simActive: "Simüle et: Kart Aktif",
        simInactive: "Simüle et: Kart Aktif Değil",
        cancel: "İptal",
      },
      unionDenied: {
        title: "Premium Refah Hizmetleri kullanılamıyor",
        text1: "Sendika / kulüp kartın şu anda aktif değil, bu yüzden bu seviye şu an kullanılamıyor. <strong>Standart</strong> altındaki her şeyi kullanmaya devam edebilirsin.",
        text2: "Kart almak veya yenilemek için IMWIRSA destek ile iletişime geç:",
        whatsapp: "💬 WhatsApp +372 5561 3815",
        close: "Kapat",
      },
      clearData: {
        title: "Bu cihazda saklanan her şey silinsin mi?",
        text: "Bu işlem adını, MWA-ID'ini, kart durumunu ve geminin işaretlenmiş konumunu siler. Her şey yalnızca bu telefonda saklanır, bu yüzden silindikten sonra geri alınamaz.",
        confirm: "Her şeyi sil",
        cancel: "İptal",
      },
      port: { title: "Test limanı (test sürümü)" },
      context: {
        title: "Denizci şu anda nerede?",
        text: "GPS bağlandığında bu otomatik olarak belirlenecek. Şimdilik her iki durumu görmek için manuel olarak değiştir.",
        atPort: "Limanda",
        inCity: "Şehirde",
      },
      iosInstall: {
        title: "Ana Ekrana Ekle",
        step1: 'Tarayıcının araç çubuğundaki <strong>Paylaş</strong> düğmesine <span class="ios-icon">⬆️</span> dokun',
        step2: 'Aşağı kaydır ve <strong>"Ana Ekrana Ekle"</strong> <span class="ios-icon">➕</span> seçeneğine dokun',
        step3: 'Üst köşedeki <strong>"Ekle"</strong> düğmesine dokun',
        gotIt: "Anladım",
      },
      gate: {
        msg: "Sendika kartı sahiplerine açıktır",
        sub: "Aktif Sendika kartın onaylandığında iletişim ve rezervasyon açılır.",
        confirm: "Kartı onayla",
      },
    },
    assistants: {
      alex: {
        name: "Alex",
        tag: "Bilgi bulmana ve yol göstermene yardımcı olacağım.",
        greet: "Merhaba! Benim adım Alex. Bu yolculuk boyunca senin Denizci Refah Asistanın olacağım. Asistanını veya dilini istediğin zaman Ayarlar'dan değiştirebilirsin. Bugün sana nasıl yardımcı olabilirim?",
      },
      omar: {
        name: "Omar",
        tag: "Desteklendiğini ve bilgilendirildiğini hissetmeni sağlayacağım.",
        greet: "Merhaba dostum. Benim adım Omar. Bu yolculuk boyunca senin Denizci Refah Asistanın olacağım. Asistanını veya dilini istediğin zaman Ayarlar'dan değiştirebilirsin. Bugün sana nasıl yardımcı olabilirim?",
      },
      sophia: {
        name: "Sophia",
        tag: "Seni özenle yönlendirecek ve sorularını yanıtlayacağım.",
        greet: "Merhaba! Benim adım Sophia. Bu yolculuk boyunca senin Denizci Refah Asistanın olacağım. Asistanını veya dilini istediğin zaman Ayarlar'dan değiştirebilirsin. Bugün sana nasıl yardımcı olabilirim?",
      },
      grace: {
        name: "Grace",
        tag: "Yolculuğunun her adımında sana destek olacağım.",
        greet: "Merhaba! Benim adım Grace. Bu yolculuk boyunca senin Denizci Refah Asistanın olacağım. Asistanını veya dilini istediğin zaman Ayarlar'dan değiştirebilirsin. Bugün sana nasıl yardımcı olabilirim?",
      },
    },
    escalation: {
      alex: "Bu, gerçek bir kişiyle konuşulmaya değer bir konu gibi görünüyor. Seni hemen şimdi IMWIRSA Refah Koordinatörü'ne bağlayabilirim, ya da burada konuşmaya devam edebiliriz — karar senin.",
      omar: "Dostum, bu sadece benimle değil, gerçek bir kişiyle konuşulmaya değer bir konu. IMWIRSA Refah Koordinatörü'nü hemen şimdi devreye sokabilirim — ya da benimle biraz daha konuşmayı tercih edersen, bu da sorun değil.",
      sophia: "Bunu benimle paylaştığın için teşekkür ederim. Bu önemli ve gerçekten yardımcı olabilecek biriyle konuşmanı istiyorum — seni hemen şimdi IMWIRSA Refah Koordinatörü'ne bağlayabilirim ya da istersen biraz daha burada seninle kalabilirim. Sana uygun olan neyse.",
      grace: "Bu önemli ve gerçekten yardımcı olabilecek biriyle konuşmayı hak ediyorsun. İstersen seni şimdi IMWIRSA Refah Koordinatörü'ne bağlayabilirim — ya da tercih edersen burada konuşmaya devam edebiliriz. Karar senin.",
    },
    escalationToggle: { continueBtn: "Devam et", coordinatorBtn: "Koordinatör" },
    categoryPrompts: {
      centre: "Denizci merkezi hakkında sorun mu var — açılış saatleri, hizmetler, nasıl gidilir? Bana sor, sadece onların yardımcı olabileceği bir konuysa merkezin kendi ekibini devreye sokarım.",
      transport: "Etrafta dolaşmak için yardıma mı ihtiyacın var — servis saatleri, taksiler, otobüsler ya da limandan çıkış? Sadece sor, buradayım.",
      shops: "Yiyecek, malzeme, SIM kart veya yakında bir eczane mi arıyorsun? İhtiyacını bana bildir.",
      citylife: "Şehre gitmeyi mi düşünüyorsun? Yakında neler olduğunu ve gitmeden önce bilmen gerekenleri sana anlatabilirim.",
      spiritual: "Bir din görevlisiyle konuşmak, sakin bir yer bulmak ya da sadece konuşacak biri istiyorsan — burada kimin olduğunu bulmana yardımcı olabilirim.",
      emergency: "Bu acilse, aşağıdaki iletişim bilgilerini hemen kullan. Konuşmak istersen ben de buradayım.",
      fallback: "Burada sana nasıl yardımcı olabilirim?",
    },
    askMe: {
      centre: "Nereden başlayacağını bilmiyor musun? Bana sor →",
      transport: "Aracını bulamıyor musun? Bana sor →",
      shops: "Belirli bir şey mi arıyorsun? Bana sor →",
      citylife: "Nereye gideceğini bilmiyor musun? Bana sor →",
      spiritual: "Sadece konuşmayı mı tercih edersin? Bana sor →",
      emergency: "Hemen yardıma mı ihtiyacın var? Bana sor →",
      wellness: "Bununla ilgili bir sorun mu var? Bana sor →",
      default: "Emin değil misin? Bana sor →",
    },
    wellness: {
      unlockedIntro: "Tekrar hoş geldin — Sendika kartın bu ay için onaylandı. İşte sana sunulanlar.",
      lockedIntro: "Bunlar Sendika üyesi hizmetleridir. Bunları açmak için lütfen Ayarlar → Sendika / Kulüp Kartı'ndan kart durumunu onayla.",
      roleSuffix: "Sendika Desteği",
    },
    demoReplies: [
      "Anladım — yol tarifi veya daha fazla ayrıntı istersen haber ver.",
      "Bu konuda yardımcı olabilirim. Aklında başka bir şey var mı?",
      "Tabii. Liman veya uygulama hakkında başka bir şey sormaktan çekinme.",
    ],
    ship: {
      title: "Gemim",
      introText: "Karaya çıkmadan önce geminin tam olarak nerede demirlediğini işaretle. Nasıl geri döneceğinden emin değilsen — özellikle geceleri ya da limanın birden fazla kapısı varsa — MWApp seni sadece \"limana\" değil, tam olarak bu noktaya yönlendirecek.",
      markBtn: "📍 Geminin konumunu işaretle",
      markedLabel: "Konum işaretlendi",
      markedToday: "Bugün",
      navigateBtn: "🧭 Gemiye geri dön",
      remarkBtn: "Yeni bir konum işaretle",
      errorText: "Konumun alınamadı. Lütfen bu tarayıcı için konum erişimine izin verildiğinden emin ol ve tekrar dene.",
      privacyNote: "Yalnızca bu cihazda saklanır. Sunucularımıza asla gönderilmez.",
    },
  },
  fil: {
    lighthouse: {
      sub: "Ipinapakita ng IMWIRSA",
      headline: "Maligayang pagdating, Marino.",
      text: "Libu-libong taon nang pinagbubuklod ng dagat ang mga tao at bansa. Hindi ka nag-iisa. Narito ang MWApp para gabayan at suportahan ka saanman ka dalhin ng iyong paglalakbay.",
      cta: "MAGPATULOY",
    },
    onboard: {
      title: "Piliin ang iyong assistant",
      sub: "Narito kami para suportahan ka sa bawat hakbang.",
      chooseLanguage: "Piliin ang iyong wika",
      continueBtn: "Magpatuloy",
    },
    intro: {
      hello: "Kamusta!",
      imText: "Ako si",
      role: "ang iyong MWA Assistant.",
      changeLink: "Palitan ang assistant o wika",
      continueBtn: "Magpatuloy",
    },
    name: {
      msg: "Isa pang bagay — opsyonal lang ito. Ano ang gusto mong itawag ko sa iyo? Puwede mong laktawan ito anumang oras.",
      placeholder: "Ilagay ang iyong pangalan o palayaw",
      save: "I-save",
      skip: "Laktawan",
    },
    home: {
      tapToChat: "I-tap para mag-chat →",
      heroGreeting: "Maligayang pagdating sa Daungan ng {port}. Pumili ng kategorya sa ibaba para sa lokal na tulong, o tanungin mo na lang ako.",
      emergencyContacts: "Mga emergency contact",
      categories: {
        centre: "Sentro ng<br>mga Marino",
        transport: "Transportasyon",
        shops: "Tindahan<br>at Pagkain",
        citylife: "Buhay sa Lungsod",
        spiritual: "Espirituwal<br>na Alaga",
        ask: "Tanungin ang<br>assistant",
      },
      install: {
        title: "Idagdag ang MWApp sa Home Screen mo",
        subDefault: "Magkaroon ng one-tap access sa susunod, tulad ng tunay na app.",
        subIOS: "I-tap ang 'Add', pagkatapos sundan ang 2 mabilisang hakbang.",
        add: "Idagdag",
      },
      location: {
        title: "Hanapin ang iyong daungan nang awtomatiko?",
        sub: "Ginagamit isang beses lang, sa device na ito, para matukoy ang pinakamalapit na daungan. Hindi ito ipinapadala sa aming mga server o ina-store.",
        enable: "I-enable",
      },
    },
    common: {
      awaitingData: "Hinihintay ang datos ng daungan",
      hours: "Oras ng Operasyon",
      contacts: "Mga Contact",
      gettingThere: "Paano makarating",
      schedule: "Iskedyul",
      next: "SUSUNOD",
      openInMaps: "Mapa",
      openMapsBtn: "Buksan sa Maps",
      goodToKnow: "Mabuting malaman",
      lastUpdated: "Huling na-update: {date} · pinagmulan: Port Welfare Manager",
      qrRefresh: "Mago-refresh sa {s}s",
    },
    status: {
      openUntil: "Bukas hanggang {time}",
      closedOpensAt: "Sarado · magbubukas sa {time}",
      closedForToday: "Sarado para sa araw na ito",
    },
    chat: { inputPlaceholder: "Mag-type ng mensahe…" },
    coordinator: {
      title: "💬 IMWIRSA Welfare Coordinator",
      statusAnonymous: "Anonymous · Available 24/7 ·",
      connecting: "Ikinokonekta ka sa isang Coordinator…",
      firstMessage: "Kamusta, ako si Kadri, ang iyong IMWIRSA Welfare Coordinator. Narito ako para makinig — kumusta ka ngayon?",
      demoReplies: [
        "Salamat sa pagbabahagi niyan. Nakikinig ako — huwag kang magmadali.",
        "Mukhang mahirap iyan. Hindi ka nag-iisa dito, at narito ako kasama mo ngayon.",
        "Makakatulong ba kung pag-usapan natin ang nasa isip mo, o mas gugustuhin mo ang mga praktikal na mungkahi?",
      ],
    },
    settings: {
      title: "Mga Setting",
      subtitleRole: "Ang Iyong Maritime Welfare Assistant",
      preferences: "Mga Kagustuhan",
      changeAssistant: "Palitan ang assistant",
      language: "Wika",
      myName: "Aking pangalan",
      talkToCoordinator: "Kausapin ang IMWIRSA Welfare Coordinator",
      membership: "Membership",
      yourMwaId: "Ang Iyong MWA-ID",
      unionCard: "Union / Club Card",
      unionActive: "Aktibo ngayong buwan ✓",
      unionNeedsReconfirm: "Kailangan ng muling kumpirmasyon ›",
      unionNotConfirmed: "Hindi pa nakumpirma ›",
      portLocationDev: "Daungan at Lokasyon (dev preview)",
      detectLocation: "Tukuyin ang daungan gamit ang lokasyon",
      detectLocating: "Hinahanap ang lokasyon…",
      detectUpdated: "Na-update ✓",
      detectUnavailable: "Hindi available — pumili nang manual sa ibaba",
      testPort: "Test port",
      context: "Konteksto (awtomatiko kapag na-add na ang GPS)",
      contextAtPort: "Nasa daungan ›",
      contextInCity: "Nasa lungsod ›",
      dataPrivacy: "Data at Privacy",
      nameStoredNote: "Ang iyong pangalan ay naka-store lamang sa device na ito",
      clearData: "Burahin ang aking data",
      startOver: "Magsimula ulit (ipakita muli ang unang launch)",
      about: "Tungkol dito",
      versionLabel: "MWApp v0.1 (prototype)",
      website: "imwirsa.org",
    },
    nav: { port: "Daungan", ship: "Barko", settings: "Mga Setting" },
    modals: {
      lang: { title: "Piliin ang iyong wika" },
      assistant: { title: "Piliin ang iyong assistant" },
      union: {
        title: "Tingnan ang status ng iyong card",
        text1: "Kinukumpirma nito na aktibo ang iyong Trade Union o partner club card. Kailangan ang kumpirmasyon isang beses bawat buwan — una sa setup, pagkatapos ay muli sa ika-1 ng bawat sumusunod na buwan.",
        text2: "Demo mode: paparating na ang real-time na verification sa iyong union. Sa ngayon, i-simulate ang resulta sa ibaba.",
        simActive: "I-simulate: Aktibo ang card",
        simInactive: "I-simulate: Hindi aktibo ang card",
        cancel: "Kanselahin",
      },
      unionDenied: {
        title: "Hindi available ang Premium Welfare Services",
        text1: "Hindi kasalukuyang aktibo ang iyong Trade Union / club card, kaya hindi available ang level na ito sa ngayon. Puwede mo pa ring gamitin ang lahat sa ilalim ng <strong>Standard</strong>.",
        text2: "Para makakuha o mag-renew ng card, makipag-ugnayan sa IMWIRSA support:",
        whatsapp: "💬 WhatsApp +372 5561 3815",
        close: "Isara",
      },
      clearData: {
        title: "Burahin ang lahat ng naka-store sa device na ito?",
        text: "Aalisin nito ang iyong pangalan, ang iyong MWA-ID, ang status ng iyong card, at ang minarkahang posisyon ng iyong barko. Lahat ay naka-store lamang sa telepono na ito, kaya kapag nabura, hindi na ito maibabalik.",
        confirm: "Burahin lahat",
        cancel: "Kanselahin",
      },
      port: { title: "Test port (dev preview)" },
      context: {
        title: "Nasaan ang marino ngayon?",
        text: "Awtomatikong matutukoy ito kapag naka-connect na ang GPS. Sa ngayon, mano-manong i-switch para makita ang dalawang estado.",
        atPort: "Nasa daungan",
        inCity: "Nasa lungsod",
      },
      iosInstall: {
        title: "Idagdag sa Home Screen",
        step1: 'I-tap ang button na <strong>Share</strong> <span class="ios-icon">⬆️</span> sa toolbar ng iyong browser',
        step2: 'Mag-scroll pababa at i-tap ang <strong>"Add to Home Screen"</strong> <span class="ios-icon">➕</span>',
        step3: 'I-tap ang <strong>"Add"</strong> sa itaas na sulok',
        gotIt: "Nakuha ko",
      },
      gate: {
        msg: "Available sa mga may hawak ng Trade Union card",
        sub: "Mabubuksan ang mga contact at booking kapag nakumpirma na ang aktibo mong Trade Union card.",
        confirm: "Kumpirmahin ang card",
      },
    },
    assistants: {
      alex: {
        name: "Alex",
        tag: "Tutulungan kitang makahanap ng impormasyon at gabay.",
        greet: "Kamusta! Ako si Alex. Ako ang iyong Maritime Welfare Assistant sa paglalayag na ito. Puwede mong palitan ang assistant o wika anumang oras sa Settings. Paano kita matutulungan ngayon?",
      },
      omar: {
        name: "Omar",
        tag: "Titiyakin kong makaramdam ka ng suporta at ikaw ay laging may kaalaman.",
        greet: "Kamusta, kaibigan. Ako si Omar. Ako ang iyong Maritime Welfare Assistant sa paglalayag na ito. Puwede mong palitan ang assistant o wika anumang oras sa Settings. Paano kita matutulungan ngayon?",
      },
      sophia: {
        name: "Sophia",
        tag: "Gagabayan kita nang may pag-aalaga at sasagutin ang iyong mga tanong.",
        greet: "Kamusta! Ako si Sophia. Ako ang iyong Maritime Welfare Assistant sa paglalayag na ito. Puwede mong palitan ang assistant o wika anumang oras sa Settings. Paano kita matutulungan ngayon?",
      },
      grace: {
        name: "Grace",
        tag: "Susuportahan kita sa bawat hakbang ng iyong paglalakbay.",
        greet: "Kamusta! Ako si Grace. Ako ang iyong Maritime Welfare Assistant sa paglalayag na ito. Puwede mong palitan ang assistant o wika anumang oras sa Settings. Paano kita matutulungan ngayon?",
      },
    },
    escalation: {
      alex: "Mukhang mas mabuting pag-usapan ito ng tunay na tao. Puwede kitang ikonekta sa IMWIRSA Welfare Coordinator ngayon din, o puwede pa rin tayong magpatuloy dito — desisyon mo.",
      omar: "Kaibigan, ito ay isang bagay na dapat pag-usapan ng tunay na tao, hindi lang sa akin. Puwede kong ikonekta ang IMWIRSA Welfare Coordinator ngayon din — o kung gusto mong makipag-usap muna sa akin nang kaunti pa, okay lang din iyon.",
      sophia: "Salamat sa pagsasabi nito sa akin. Mahalaga ito, at gusto kong makausap mo ang taong tunay na makakatulong — puwede kitang ikonekta sa IMWIRSA Welfare Coordinator ngayon din, o manatili dito kasama mo nang kaunti pa kung gugustuhin mo. Kung ano ang komportable para sa iyo.",
      grace: "Mahalaga ito, at karapat-dapat kang makausap ng taong tunay na makakatulong. Puwede kitang ikonekta sa IMWIRSA Welfare Coordinator ngayon, kung gusto mo — o kung mas gusto mo, puwede tayong magpatuloy dito. Desisyon mo ito.",
    },
    escalationToggle: { continueBtn: "Magpatuloy", coordinatorBtn: "Coordinator" },
    categoryPrompts: {
      centre: "May mga tanong ka ba tungkol sa sentro ng mga marino — oras ng operasyon, mga serbisyo, paano makarating? Tanungin mo ako, at kokontakin ko ang sarili nilang team kung isa itong bagay na sila lang ang makakatulong.",
      transport: "Kailangan mo ba ng tulong sa paggalaw — oras ng shuttle, taxi, bus, o pag-alis sa daungan? Tanungin mo lang, nandito ako.",
      shops: "Naghahanap ka ba ng pagkain, gamit, SIM card o pharmacy na malapit? Sabihin mo lang ang kailangan mo.",
      citylife: "Balak mo bang pumunta sa lungsod? Masasabi ko sa iyo kung ano ang malapit at kung ano ang mahalagang malaman bago ka umalis.",
      spiritual: "Kung gusto mong makausap ang isang chaplain, maghanap ng tahimik na lugar, o may kausap lang — matutulungan kitang mahanap kung sino ang narito.",
      emergency: "Kung urgent ito, gamitin agad ang mga contact sa ibaba. Narito rin ako kung gusto mong pag-usapan ito.",
      fallback: "Paano kita matutulungan dito?",
    },
    askMe: {
      centre: "Hindi sigurado kung saan magsisimula? Tanungin ako →",
      transport: "Hindi mahanap ang sasakyan mo? Tanungin ako →",
      shops: "May hinahanap kang partikular? Tanungin ako →",
      citylife: "Hindi sigurado kung saan pupunta? Tanungin ako →",
      spiritual: "Mas gusto mo bang makipag-usap lang? Tanungin ako →",
      emergency: "Kailangan ng tulong ngayon din? Tanungin ako →",
      wellness: "May tanong ka ba tungkol dito? Tanungin ako →",
      default: "Hindi sigurado? Tanungin ako →",
    },
    wellness: {
      unlockedIntro: "Muling pagbati — nakumpirma na ang iyong Trade Union card para sa buwang ito. Narito ang mga available sa iyo.",
      lockedIntro: "Ito ay mga serbisyo para sa miyembro ng Trade Union. Para ma-unlock ang mga ito, kumpirmahin ang status ng iyong card sa Settings → Union / Trade Card.",
      roleSuffix: "Suporta ng Trade Union",
    },
    demoReplies: [
      "Nakuha ko — sabihin mo lang kung gusto mo ng direksyon o karagdagang detalye tungkol dito.",
      "Matutulungan kita diyan. May iba ka pa bang naiisip?",
      "Sige. Huwag mag-atubiling magtanong ng kahit ano pa tungkol sa daungan o sa app.",
    ],
    ship: {
      title: "Aking Barko",
      introText: "Bago ka umahon, markahan nang eksakto kung saan naka-dock ang iyong barko. Kung hindi ka sigurado kung paano babalik — lalo na sa gabi, o kung maraming gate ang daungan — gagabayan ka ng MWApp sa eksaktong lugar na ito, hindi lang sa \"daungan\".",
      markBtn: "📍 Markahan ang lokasyon ng aking barko",
      markedLabel: "Naka-mark ang lokasyon",
      markedToday: "Ngayon",
      navigateBtn: "🧭 Bumalik sa aking barko",
      remarkBtn: "Markahan ang bagong lokasyon",
      errorText: "Hindi nakuha ang iyong lokasyon. Pakisuri kung pinapayagan ang location access para sa browser na ito, pagkatapos ay subukan ulit.",
      privacyNote: "Naka-save lamang sa device na ito. Hindi ito ipinapadala sa aming mga server.",
    },
  },
};

// ---- lookup helpers ---------------------------------------------------
function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}
// t("home.tapToChat") reads the current language (state.lang), and falls back
// to English for any language object that's empty or missing that specific
// key — so partially-translated languages never break.
function t(path, vars) {
  const lang = (typeof state !== "undefined" && state.lang) ? state.lang : "en";
  let node = getPath(I18N[lang], path);
  if (node === undefined) node = getPath(I18N.en, path);
  if (typeof node === "string" && vars) {
    Object.keys(vars).forEach((k) => {
      node = node.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]);
    });
  }
  return node;
}
function getAssistant(id, lang) {
  const base = ASSISTANTS[id];
  if (!base) return null;
  const useLang = lang || (typeof state !== "undefined" ? state.lang : "en") || "en";
  const langNode = (I18N[useLang] && I18N[useLang].assistants && I18N[useLang].assistants[id]) || {};
  const enNode = I18N.en.assistants[id];
  return { ...base, name: langNode.name || enNode.name, tag: langNode.tag || enNode.tag, greet: langNode.greet || enNode.greet };
}
const PHOTO_SCREEN_ORDER = [
  "onboardGrid", "introHero", "nameScreen", "homeBubble",
  "chatHeader", "chatHero", "detailHeader", "settings",
];
function getAssistantPhoto(id, screenKey) {
  const base = ASSISTANTS[id];
  if (!base || !base.photos || !base.photos.length) return base ? base.photo : "";
  if (base.photos.length === 1) return base.photos[0];
  const idx = PHOTO_SCREEN_ORDER.indexOf(screenKey);
  const pos = idx === -1 ? 0 : idx % base.photos.length;
  return base.photos[pos];
}
// ---- static "chrome" text ---------------------------------------------
function applyStaticI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const val = t(el.getAttribute("data-i18n"));
    if (val !== undefined) el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const val = t(el.getAttribute("data-i18n-html"));
    if (val !== undefined) el.innerHTML = val;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const val = t(el.getAttribute("data-i18n-placeholder"));
    if (val !== undefined) el.placeholder = val;
  });
}
