# IMWIRSA PWM Bot — что это и как поднять

Телеграм-бот для координаторов портов (PWM). Позволяет прислать
изменение/исправление/дополнение/предостережение по своему порту в
несколько тапов вместо повторного заполнения анкеты.

**Важно, что бот НЕ делает:** он не пишет напрямую в данные MWApp.
Каждое сообщение приходит тебе в Telegram и на почту — ты сам решаешь,
вносить правку в JSON порта или нет. Это осознанное решение (см.
комментарий в начале `src/index.js`), не забытая функция — если объём
обращений вырастет, автозапись в GitHub можно добавить позже отдельным
шагом.

---

## Шаг 1. Создать бота в Telegram

1. Напиши **@BotFather** в Telegram → `/newbot`.
2. Дай имя (например `IMWIRSA PWM Bot`) и username (например `imwirsa_pwm_bot`).
3. BotFather пришлёт токен вида `123456789:AAH...` — сохрани его, понадобится в шаге 4.

## Шаг 2. Узнать свой Telegram chat id (куда бот будет слать уведомления)

1. Напиши своему новому боту что угодно (он пока не ответит — это нормально).
2. Открой в браузере:
   `https://api.telegram.org/bot<ТВОЙ_ТОКЕН>/getUpdates`
3. В ответе найди `"chat":{"id": ЧИСЛО, ...}` — это и есть `ADMIN_CHAT_ID`.

## Шаг 3. Залить код в GitHub

Готово — ты уже это делаешь вручную, файл за файлом.

## Шаг 4. Создать Worker в Cloudflare

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → выбери репозиторий `imwirsa`.
2. **Важно, по опыту с MWApp**: укажи **Root directory = `pwm-bot`**, Build
   output можно оставить пустым.
   Если Cloudflare предложит выбрать между "Pages" и "Workers" —
   для этого проекта нужен именно **Worker**, не Pages.

## Шаг 5. Создать два KV namespace

Cloudflare Dashboard → **Workers & Pages** → **KV** → **Create namespace**:
- `imwirsa-pwm-sessions`
- `imwirsa-pwm-coordinators`

Затем в настройках Worker'а → **Settings → Variables → KV Namespace
Bindings** → добавь оба:
- binding name `SESSIONS` → namespace `imwirsa-pwm-sessions`
- binding name `COORDINATORS` → namespace `imwirsa-pwm-coordinators`

## Шаг 6. Секреты и переменные

Worker → **Settings → Variables**:

**Secrets (зашифрованные)**:
- `TELEGRAM_BOT_TOKEN` — токен из шага 1
- `RESEND_API_KEY` — тот же ключ, что использует `imwirsa-forms`

**Обычные переменные**:
- `ADMIN_CHAT_ID` — число из шага 2
- `NOTIFY_EMAIL` — `info@imwirsa.org`
- `RESEND_FROM` — `PWM Bot <pwm@imwirsa.org>`

## Шаг 7. Подключить Telegram к Worker'у (webhook)

После деплоя у тебя будет адрес вида
`https://imwirsa-pwm-bot.<твой-аккаунт>.workers.dev`.

Открой в браузере один раз:
