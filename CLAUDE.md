все промпты касательно проекта ПодШар



Промпт для версии 0.1:
Act as an Expert Full-Stack Software Architect with 10+ years of experience. I require a comprehensive architectural blueprint, technology stack recommendation, and initial boilerplate code for a highly customized, private, multi-page web application. The application must be cross-platform (PWA for mobile, scalable to a desktop app via Electron/Tauri) and is designed exclusively for a closed group of 3 users.

The application is named "Podshar" (Logo concept: a downward arrow "Pod" + a wisp-like sphere "Shar"). 

Please design the system using a modern, scalable stack (e.g., Next.js, TypeScript, Tailwind CSS, WebSockets, PostgreSQL, Python/Playwright for scraping, and a robust i18n library for localization). 

Here is the structured functional and UI/UX specification:

1. UI/UX LAYOUT & DESIGN SYSTEM
- Design Language: "Fashion/Minimalism" inspired by Japanese Archive, Avant-Garde, and high-end Streetwear aesthetics. The UI must feel like a premium digital fashion lookbook—clean, structured, and typography-driven.
- Color Palette:
  * Base/Background: #f7efe5 (Warm minimal cream for a clean canvas)
  * Primary Text/Lines: #7b5246 (Earthy, structured brown)
  * Accents/Highlights: #D8C3B1 and #A88B7D (Used for contrasting elements, interactive buttons, cards, and hover states).
- Homepage Architecture (Based on UI wireframes):
  * Dynamic Greeting: Large, centered dynamic text reacting to the time of day (e.g., "Good morning...", "Добрый день...").
  * Central Action: A main center button labeled "ПХ" acting as a redirect/transition to the main search hub and subsequent pages. This button should heavily utilize the accent colors for contrast.
  * Collapsible Left Sidebar: Initially closed. When opened, the top section displays the User Profile (editing capabilities to be added later) followed by crucial live quick-stats (Dota 2 PTS, Brawl Stars Cups). Below the stats are the main navigation links.
  * Persistent AI Assistant ("Podshar"): A widget anchored to the bottom-right corner. It uses our custom logo, acting as a site navigator and a conversational AI helper.
- Localization (i18n): Full application support for English (EN), Russian (RU), Ukrainian (UK), and German (DE).

2. CORE SYSTEM & AUTHENTICATION
- Strict private access for exactly 3 pre-defined users with registration and login.
- Custom CAPTCHA system utilizing images exclusively fetched from our internal app gallery.

3. DASHBOARDS & LIFE ORGANIZER (Homepage Integrations)
- Environment & Time: Live Weather widget, "Doomsday" countdown timer, Shared Calendar.
- Logistics: SBB (Swiss Transit) live API integration to quick-check transit routes from our locations to specific POIs (IKEA, Swisscom, and local schools).
- Productivity & Banter: Shared To-Do List, Gym schedule tracker, and a "Wall of Shame" (internal roasting feed).

4. CULTURE, MEDIA & FASHION
- Niche Quote of the Day: Highly ironic, tied to internet culture.
- Meme Feed: Scraped and aggregated from TikTok and Reddit. Categorized into Popular, New, and Niche (specifically RU/EN memes, "3umph" style, and "Royal XVII" vibes).
- Interactive Photo Gallery: Includes a custom AI bot (OpenAI Vision API) that analyzes uploaded photos and generates highly sarcastic, niche comments based on our inside jokes.
- Fashion & Fragrance Radar (Python Scraper Module):
  * Fashion: Scrapes Pinterest and web sources for trending TikTok aesthetics (Japanese Archive, Avant-Garde, Indie Sleaze, Sk8, Streetwear).
  * Fragrance: Scrapes niche perfumes based on specific personas (e.g., "Michael Jackson's perfume"), general popularity, compliment factor, and niche appeal.

5. MUSIC ANALYTICS (CROSS-PLATFORM)
- Connect Spotify API (for 2 users) and SoundCloud (API/Scraper for 1 user).
- Multi-platform comparative dashboard tracking the overall "Most Listened Track" across all 3 users, shared top genres/artists, and a music compatibility score.

6. DATA SCRAPING, FINANCE & WORLD
- "Ballick" Button: A secure financial aggregator fetching and displaying the current fiat/crypto balances of all 3 users.
- Trap House Real Estate Scraper: Custom scraper monitoring listings for 3-room apartments, studios, houses, and basements on specific streets to find a shared living space.
- Geopolitics: Embedded, focused map tracking the war in Ukraine with specific regional highlights.

7. GAMING HUB (WEBSOCKETS & OFFLINE)
- Casual Co-op Hub: Integrations for popular simple games (Meccha chameleon, peak, schedule 1).
- Classic/Board Games: Chess, Durak (Russian card game), Texas Hold'em Poker.
- Custom WebSockets Games: A 1v1v1 (3-player) Tetris based on a shared points system.
- Daily Guessing Games: Wordle, Dotadle (guess the Dota hero by stats), Brawlstarsdle.
- Offline Play: A Chrome Dinosaur game clone with a synced online leaderboard for the 3 users.

8. GAMING STATS & TRACKING
- Brawl Stars API: Live fetching of cups, overall ranks, and match history.
- Dota 2 Hub: Live tracking of in-game MMR/Ranks, recent patch notes, and a meta-hero analyzer specifically tailored to our current MMR brackets.

DELIVERABLES REQUIRED:
1. Step-by-step development roadmap.
2. The optimal relational database schema (PostgreSQL via Prisma) handling users, stats, scraped items, and media.
3. Write the boilerplate Next.js frontend code (layout.tsx and page.tsx) specifically implementing the Homepage UI: the dynamic greeting, the central "ПХ" transition button, the collapsible left sidebar (with profile and stats placeholders), and the bottom-right AI widget. Ensure the Tailwind classes reflect the specified color palette (#f7efe5 background, #7b5246 text, #D8C3B1/#A88B7D accents).




Промпт 2:

Mega-Prompt for Claude (Frontend Architecture v2)
Role & Tech Stack Act as an Expert Frontend Architect. Write the initial Next.js (App Router), TypeScript, and Tailwind CSS boilerplate for the home page of a private web application named "Podshar".
Design System & Aesthetics
Style: Premium digital fashion lookbook (Minimalism, Japanese Archive).
Colors: Background #f7efe5, Primary Text #7b5246, Accents #D8C3B1 and #A88B7D.
Typography & Animations: Use elegant, readable web-fonts (e.g., a mix of clean sans-serif for UI and a sophisticated serif for the greeting). Animations should be smooth, simple, and CSS-based, maintaining a premium feel without being overly complex.
Layout Architecture & Mechanics
Left Sidebar (Collapsible):
Initially closed. When opened, it must push the central canvas to the right (do not use a modal overlay/dimming effect).
Contains a User Profile placeholder and a vertical list of 5 navigation links with #D8C3B1 hover states.
Center Canvas (Main Content):
Displays a dynamic greeting (e.g., "Good morning...") calculating the local time.
Central "ПХ" Button: This must NOT look like a standard web button. Design it as a highly detailed, visually striking interactive object. Use layered borders, subtle inner shadows, or intricate geometry using Tailwind to make it feel like a premium centerpiece waiting to be clicked for a major transition.
Right Sidebar (Podshar AI Chat):
Desktop: A persistent, fixed right-side column fully integrated into the layout.
Mobile: Strictly hidden by default. Add a floating action button (visible only on mobile) that smoothly slides the AI panel in from the right edge when tapped.
Deliverables Generate production-ready, clean components:
tailwind.config.ts (with custom colors).
app/layout.tsx (handling the responsive 3-column grid).
app/page.tsx (dynamic greeting and the detailed "ПХ" object).
components/LeftSidebar.tsx (with the push-animation logic).
components/RightAIChat.tsx (desktop persistent, mobile slide-in).


http://localhost:3000/en/hub
Промпт 3 (версия 0.3 — Block-based Minimalism + интерактивная кнопка «Солнце»):

Act as an Expert Full-Stack Software Architect and Creative Developer with 10+ years of experience. We are pivoting the UI/UX design for the "Podshar" application. The previous iteration felt too much like an e-commerce platform. We are stripping it down to a clean, block-based minimalism while preserving the core layout structure.

Please read the previous context in CLAUDE.md, but OVERRIDE the visual design rules with the following strictly new specifications:

1. ARCHITECTURE & LAYOUT RETAINMENT (Based on UI Wireframe)
- Preserve the overall structural layout:
  * The Collapsible Left Sidebar (Profile on top, stats below, navigation links) MUST REMAIN.
  * The Right AI Assistant ("Podshar") widget/panel MUST REMAIN.
  * The Central Homepage canvas with the time-based dynamic greeting MUST REMAIN.
- Strip away all complex e-commerce gradients, unnecessary detail layers, and elaborate commercial styling.

2. NEW DESIGN SYSTEM (Block-based Minimalism)
- Aesthetic: Pure, structural block-based design (Bento box style), heavily inspired by clean, modern developer portfolios (like https://trqwaa.github.io/portfolio-site-by-Tymofii/). Sharp edges, solid borders, clean spatial separation, and zero visual clutter.
- Typography: Force "Roboto" (sans-serif) across the entire application for all headings, labels, stats, and text.
- Color Palette: Keep the minimal cream/brown palette (#f7efe5 background, #7b5246 for borders/text, #D8C3B1 & #A88B7D for accents), but apply them strictly for a flat, blocky look with distinct border outlines.

3. THE CENTERPIECE: INTERACTIVE "ПХ" SUN BUTTON
- The center of the homepage must feature the prominent, highly interactive "ПХ" transition button.
- Visual Concept: The button acts like a reactive "Sun".
- Interaction Mechanics: Implement precise mouse-tracking logic (e.g., using `onMouseMove` with `useRef`, `framer-motion`, or CSS custom variables).
- Behavior 1 (Proximity): Dynamically calculate the distance between the cursor and the center of the button. The closer the cursor gets to the center, the brighter/more intense the button's "rays" or aura become.
- Behavior 2 (Directionality & Rays): The sun's "rays" must calculate the exact angle relative to the cursor (using `Math.atan2`) and physically stretch/pull towards the current mouse position.
- The text "ПХ" stays anchored at the center of this object.

DELIVERABLES:
1. Update `tailwind.config.ts` to enforce the Roboto font and block-style utilities.
2. Refactor `page.tsx` and the main AppShell layout to maintain the Left Sidebar and Right AI Chat using a clean, flat Bento-block structure.
3. Write a dedicated client-side component (`PHButton.tsx`) containing the complete JavaScript math, React Hooks, and Framer Motion logic to execute the "Sun" cursor-tracking and ray-stretching mechanics.


ИЗМЕНЕНИЯ, ВНЕСЁННЫЕ ПО ПРОМПТУ 3
=================================

Дизайн-система (tailwind.config.ts, src/app/globals.css)
- Один шрифт Roboto (300/400/500/700, subsets latin + latin-ext + cyrillic).
  Playfair Display и Inter удалены. Токен `font-display` оставлен как алиас
  на Roboto, чтобы ни один вызов не пришлось менять.
- Палитра не изменилась. Изменилось применение: плоские заливки, сплошные
  контуры, острые углы. `borderRadius.DEFAULT` = 0px.
- Новый токен `rule` (rgba(123,82,70,0.34)) — контур всех бенто-блоков.
- Тени с размытием убраны. Вместо них `shadow-block` — жёсткое смещение
  без блюра (эффект наложенного листа, а не свечения).
- Новый CSS-класс `.block-card` — единственный примитив поверхности.

Разметка
- src/app/[locale]/page.tsx — бенто-сетка на 6 колонок: приветствие во всю
  ширину, солнце в широком блоке на две строки, два мета-блока рядом.
  Высоты строк `auto`, не `1fr`: строка на `1fr` съедает весь вьюпорт и
  оставляет мелкие блоки пустыми.
- src/components/AppShell.tsx — верхняя панель с триггером меню внутри
  потока. Механика push сохранена без изменений.
- src/components/LeftSidebar.tsx, RightAIChat.tsx, hub/page.tsx — переведены
  на плоские блоки со сплошными контурами.

Кнопка-солнце (src/components/PHButton.tsx, новый)
- 24 луча, framer-motion 13. Два независимых сигнала:
  proximity (Math.hypot, возведён в квадрат) и направление (Math.atan2).
- Выравнивание луча = cos(Δ) в 4-й степени — узкий лепесток, солнце тянется
  к курсору, а не раздувается равномерно.
- Всё считается через motion values, вне рендера React: иначе 24 луча
  давали бы 24 ре-рендера на каждый кадр движения мыши.
- Учитывается prefers-reduced-motion: слушатель не навешивается.
- PhSeal.tsx удалён.

Исправленные баги (найдены при проверке в браузере, не по промпту)
1. Солнце загружалось полностью зажжённым: motion values начинались с (0,0),
   что равно «курсор ровно в центре». Теперь стартуют на расстоянии FALLOFF.
2. Лучи были не видны: они начинались на радиусе 66px, а половина ширины
   квадратного ядра — 72px, то есть лучи прятались за ядром. Введена функция
   rayOffset(): граница квадрата = half / max(|sin|, |cos|), а не константа.
3. RangeError: Incorrect locale information provided. Запрос /favicon.ico
   попадал в маршрут [locale] как locale = "favicon.ico". Layout и page
   рендерятся параллельно, поэтому notFound() в layout не спасал page —
   Intl.DateTimeFormat падал раньше. Добавлен src/lib/locale.ts
   (resolveLocale), который вызывают ВСЕ страницы под [locale].
   Плюс добавлен src/app/icon.svg, чтобы /favicon.ico вообще не доходил
   до маршрута.
4. Hydration mismatch: сервер сериализовал float как "-81.282px", клиент —
   как "-81.28203230275511px". rayOffset() возвращает toFixed(2).

Зависимости
- Добавлен framer-motion ^13.2.0.

Проверено
- tsc --noEmit — чисто.
- Маршруты /ru /en /de/hub — 200; /favicon.ico и /nonsense-path — 404 без
  исключений в логе сервера.
- Консоль браузера (через CDP) — ни ошибок, ни предупреждений.

Промпт 4 (версия 0.4 — Everyday Minimalism, кнопка-«реактор», удаление хаба):

Act as an Expert Frontend Architect and Creative Developer continuing work on the
"Podshar" application. Read the existing project context in CLAUDE.md (previous
prompts v0.1–v0.3), but OVERRIDE the following areas with the specs below. Leave
everything not mentioned here (data models, backend integrations, routing
conventions) unchanged.

1. AESTHETIC PIVOT — FROM "FASHION" TO "EVERYDAY MINIMALISM"
- The bento "sun" version still reads as too polished and commercial. Podshar is
  a private tool built by 3 friends: plain, honest, a bit funny, hand-built —
  not a brand. Reference for restraint only (not layout or content):
  https://trqwaa.github.io/portfolio-site-by-Tymofii/
- Remove premium/lookbook language, ornate borders, fashion-magazine framing
  from spacing, copy and micro-interactions.

2. COLOR PALETTE — REVISE
- Drop the cream/brown fashion palette. Direction: everyday neutral base
  (near-white / soft light-gray), plain dark neutral text, ONE restrained accent
  used sparingly. No gradients, no competing accents.
- Ship 2 labeled palette options as CSS variables / Tailwind tokens so one can
  be approved fast. Re-skin only — layout structure untouched.

3. STRUCTURE TO KEEP AS-IS
- Collapsible left sidebar with the push-canvas animation.
- Right/bottom-corner assistant trigger + panel (desktop persistent, mobile
  slide-in). Time-based dynamic greeting. Only tokens/borders/shadows change.

4. REMOVE — SEARCH HUB
- Delete /hub entirely and every reference (button wiring, nav links, imports).
  The "ПХ" button navigates nowhere; a console.log placeholder is fine.

5. THE CENTERPIECE — "ПХ" AS A REACTOR
- Solid warning-red core dead-centre (~#d93a34), soft circular radial glow
  fading to transparent — a blast radius, not rays. Slow 3–4s breathing idle.
- Reuse Math.hypot (distance) and Math.atan2 (direction) from v0.3, applied to
  the glow as a whole: closer = brighter and larger; gradient centre shifts
  toward the cursor, clamped to ~15–20% of the aura radius. Core and label stay
  anchored dead-centre. Hover → near-max intensity, pointer cursor.
- Drive it through motion values / CSS custom properties, not per-frame React
  re-renders. prefers-reduced-motion: static glow, no pulse, no tracking.

6. AI ASSISTANT ICON — REPLACE WITH ATTACHED PHOTO
- The pug-in-a-hood photo becomes the assistant's mascot. Save as
  public/assets/podshar-avatar.(png|webp), webp preferred, optimized. Use on the
  mobile FAB and in the chat panel header. Circular crop (object-fit: cover,
  centred on the face), works at 28–56px. Thin 1–2px border in the new neutral
  token, no shadow, no glow. Hover scale 1.0 → 1.04, no colour overlay. Proper
  alt text. SVG mark stays as fallback only.


ИЗМЕНЕНИЯ, ВНЕСЁННЫЕ ПО ПРОМПТУ 4
=================================

Палитра (src/app/globals.css, tailwind.config.ts)
- Кремово-коричневая палитра удалена целиком. Ни один компонент больше не знает
  hex: все токены Tailwind резолвятся в CSS-переменные.
- Два варианта живут рядом, активен один:
    A "Graphite" (по умолчанию) — canvas #f2f2f2, surface #ffffff, sunk #eaeaea,
      ink #1f1f1f, accent #3b6ea5. Ближе всего к референсу Тимофея: там
      near-white фон, #1F1F1F графит и никаких акцентных цветов вообще.
    B "Paper" — тёплый вариант: #f5f4f0 / #fbfaf7 / #eae8e2, ink #23211d,
      accent #4e7a5e.
  Переключение: атрибут data-palette="paper" на <html> в [locale]/layout.tsx.
  Больше ничего менять не нужно.
- Значения хранятся каналами RGB ("242 242 242"), а не hex, иначе перестают
  работать модификаторы прозрачности Tailwind (border-ink/20, text-ink/60).
- --reactor (#d93a34) намеренно вне обеих палитр: это сигнальная лампа, а не
  цвет бренда, и она должна читаться как чужеродная.
- shadow-block теперь none. Токен оставлен, чтобы вызов shadow-block давал
  плоскость, а не серую тень Tailwind по умолчанию.

Удаление хаба
- src/app/[locale]/hub/ удалён.
- Ссылки убраны: Link href="/hub" в PHButton, блок "Все разделы" в LeftSidebar,
  запись в NAV_GROUPS, ключи nav.hub и sidebar.more во всех четырёх каталогах.
- NAV_GROUPS оставлен: его единственный потребитель теперь /api/assistant,
  где он служит таблицей допустимых маршрутов.
- Проверено: /ru/hub отдаёт 404, в src не осталось ни одного упоминания.

Кнопка-реактор (src/components/PHButton.tsx, переписан)
- 24 луча заменены одним radial-gradient. Тот же аппарат, что в v0.3: Math.hypot
  для близости (в квадрате — поздний резкий отклик), Math.atan2 для направления.
- Градиент собирается через useMotionTemplate, то есть строка backgroundImage
  переписывается прямо на элементе: React не ре-рендерится ни на одном кадре.
- Смещение центра ограничено 9 процентными пунктами блока = 18% радиуса ауры.
  Дальше нимб визуально отрывается от ядра.
- Дыхание (animate-breathe, 3.6s) висит на отдельном родителе, а не на том же
  элементе, что и scale от близости: иначе два transform затирают друг друга.
- Наведение хранится в motion value, не в useState, — ядро не должно
  ре-рендериться.
- prefers-reduced-motion: фиксированная интенсивность, без дыхания, слушатель
  не навешивается.
- Клик: console.log('hub coming soon'), никакой навигации.
- Подпись под кнопкой переехала с "Войти в хаб" на "Не нажимать" (ирония вместо
  призыва к действию). Ключ home.issue → home.today: "Выпуск" было языком
  глянцевого журнала.

Аватар ассистента (src/components/AssistantAvatar.tsx, новый)
- Круглый <img> с object-cover и якорем 50% 44% (лицо сидит выше центра кадра),
  тонкий контур border-ink/25, без тени. Наведение — scale 1.04, без заливки.
- Стоит на мобильном FAB (56px) и в шапке панели (32px). PodsharMark остался
  только как fallback.
- ВАЖНО: сам файл public/assets/podshar-avatar.webp ещё не положен — фотография
  была во вложении чата, на диске её нет. Инструкция в public/assets/README.md.
  Пока файла нет, рендерится SVG-марка, ничего не ломается.

Исправленный баг (найден при проверке в браузере)
- onError на <img> недостаточно: элемент рендерится на сервере, картинка падает
  ДО гидратации, событие теряется — оставался значок битого изображения. Решение:
  ref-колбэк на монтировании проверяет el.complete && el.naturalWidth === 0.

Проверено
- tsc --noEmit — чисто (потребовался prisma generate: npm пропустил
  postinstall-скрипты; разрешены через npm install-scripts approve).
- /ru /en /de /uk — 200; /ru/hub, /favicon.ico, /nonsense — 404.
- Консоль браузера (headless Edge через CDP, 1440px и 390px): исключений нет,
  hydration mismatch нет. Единственная запись — 404 на отсутствующий аватар.


Промпт 5 (версия 0.5 — мелкое обновление, устно):

"Сделай чтобы чат с агентом тоже можно было прятать, ну и он был как кружочек
(как все ИИ-агенты на подобных сайтах), а ИИ-агенту поверх кружочка нанеси фотку
мопса которую я скидывал. Ну и чуть измени кнопку ПХ: сделай чтобы тон кнопки
смешивался чуть больше вместе, чтобы то свечение казалось одной кнопкой. Ну и
вырази чуть-чуть границы блоков (в которых лежат дата и время и сама кнопка),
чтобы границы были потолще, было видно разделение. Ну и шрифт какой-то более
чуть толще от Roboto."


ИЗМЕНЕНИЯ, ВНЕСЁННЫЕ ПО ПРОМПТУ 5
=================================

Фотография мопса — найдена и положена
- Файла не было на диске (в чате приходило вложение, у меня к его байтам
  доступа нет). Нашёлся оригинал: C:\Users\Student\Downloads\
  photo_5828092349924446134_x.jpg, 800x787.
- Обрезан квадратом 620px с центром (415, 370) — плотно по голове, без белых
  полей: на 36-56px внутри круга поля превращали морду в кашу. Ресайз до
  256x256, WebP q84 → public/assets/podshar-avatar.webp, 11.5 КБ.
- Конвертация через Pillow (поставлен: pip install pillow). ImageMagick и
  ffmpeg на машине нет, System.Drawing не умеет WebP.
- В AssistantAvatar якорь кропа 50%/44% заменён на object-center: исходник
  теперь уже отцентрован сам, смещение в CSS сдвигало бы морду с круга.

Чат — один прячущийся оверлей вместо постоянной колонки
- До этого на десктопе была третья колонка в потоке, на мобиле — отдельная
  выезжающая панель. Два <aside> рендерили два разных <ChatBody />, то есть два
  списка сообщений и два состояния, которые расходились при переходе через lg.
  Теперь одна fixed-панель на всех ширинах.
- Триггер — круглая кнопка 56px с мопсом в правом нижнем углу, на всех
  брейкпоинтах. При открытии панели она уезжает (scale 0.9 + opacity 0).
- Панель fixed, а не flex-sibling: она всплывает поверх канвы и не сжимает
  бенто-сетку. Левый ящик по-прежнему толкает — это навигация, там потеря
  места на странице и есть смысл ящика.
- inert, когда закрыта (иначе клавиатурой можно затабиться в невидимый чат),
  фокус уходит в поле ввода при открытии, Esc закрывает.
- AppShell больше не резервирует ширину под чат — канва во всю ширину.

Кнопка ПХ — ядро и свечение как один объект
- Ядро 112px внутри ауры 288px, значит его край — ровно 19.4% радиуса ауры.
  Стоп `hot` держится плоским до 20%: самый плотный красный оказывается точно
  там, где кончается сплошной круг, и градиент уходит уже оттуда. Раньше
  свечение начинало спадать от самого центра и читалось как отдельный нимб
  вокруг диска.
- Базовая альфа поднята (0.10 → 0.34 в покое), стопы: hot 0%, hot 20%,
  mid 40%, 0 на 76%.
- С ядра снят бордер: он рисовал жёсткое кольцо ровно на том шве, который
  градиент и пытается спрятать, и разрезал объект надвое.

Границы блоков
- Токен rule: 0.14 → 0.26 альфы, .block-card теперь border-2.
- Добавлен rule-soft (0.13) на 1px — для разделителей ВНУТРИ блока (шапки
  панелей, секции сайдбара). Иерархия: толстое = другой блок, тонкое = та же
  поверхность, следующая секция. Без этого 2px везде превращались в шум.

Шрифт
- Roboto → Manrope (400/500/600/700, subsets latin + latin-ext + cyrillic).
  Та же нейтральная гротескная территория, но выше x-height и заметно плотнее
  штрихи: тот же вес читается тяжелее. Roboto 400 уходил в серость на
  почти-белом фоне.
- Переменная --font-roboto переименована в --font-sans.
- Ничего легче 400 в системе не осталось: font-light убран из приветствия,
  дат, статов. ps-label ушёл на 600, "ПХ" на 700, имена и числа на 600.

Проверено
- tsc --noEmit чисто, npm run build проходит.
- Headless Edge через CDP, 1440px и 390px: исключений нет, hydration mismatch
  нет, 404 на аватар исчез (файл на месте). Проверены открытый чат, открытый
  левый ящик, реактор с курсором на ядре.


Промпт 6 (версия 0.6 — дополнение к промпту 5, устно):

"Тот круг свечения от кнопки ПХ был чуть в разнобой, такой чуть как лучи солнца
но не совсем лучи. Ну и чтобы не было границ, которые видно как обрезают края
свечения кнопки. Ну и чуть закругли блоки повсюду, где все даты и аккаунты
лежат. Дальше в левой шторке статистику кубков и Dota 2 PTS оставь там сверху
возле аккаунта, а кнопки основной навигации перемести чуть вниз, сделай шрифт
крупнее (ну и так чуть по сайту, где в этом шрифт нуждается). Дальше в навигации
5 кнопок — быстрых переходников по сайту. Вместо ленты, игр, всех этих названий
просто вставь (В РАЗРАБОТКЕ) или что-то типа того, потому что в будущем мы хотим
поменять название и определиться лично, что мы хотим иметь в этой шторке."


ИЗМЕНЕНИЯ, ВНЕСЁННЫЕ ПО ПРОМПТУ 6
=================================

Свечение — три слоя вместо одного круга
- Одиночный radial-gradient читался как напечатанный круг: было видно ровно то
  место, где он кончается. Теперь:
  * petals — два смещённых эллиптических градиента ПОД основным. Каждый уходит
    от курсора под своим углом (+0.9 и -1.3 рад) и на меньшее расстояние, а их
    центры смещены от середины (46/47 и 55/54). Объединение несимметрично, у
    ореола нет одного силуэта, который можно обвести.
  * rays — conic-gradient из пяти неравных секторов, замаскированный в кольцо
    (radial-маска: прозрачно до 16%, непрозрачно к 44%, снова прозрачно к 82%)
    и вращающийся 48 с за оборот. Лучи не касаются ни ядра, ни края.
  * edge — все стопы приходят в ноль внутри коробки с запасом.
- Ширины секторов не делят 360 нацело, поэтому соседи никогда не совпадают и
  кольцо не складывается в узор.

Исправленный баг (виден на первом же скриншоте)
- Первая версия лучей начиналась с rayAlpha на 0deg и приходила в 0 на 360deg.
  Conic-градиент заворачивает 360° обратно на 0°, поэтому на стыке получался
  разрыв — идеально прямая радиальная линия, ровно тот край, ради устранения
  которого слой и вводился. Оба конца развёртки прибиты к нулевой альфе.

Обрез свечения на узких экранах
- Аура была фиксированные 320px. На 390px это уже шире блока, в котором она
  лежит, а масштаб от близости добавляет ещё 14%. Аура и её коробка переведены
  на min(20rem, 70vw) и min(26rem, 92vw) — уменьшаются вместе, запас
  сохраняется на любой ширине.

Закругления
- borderRadius: block 14px (бенто-карточки и панели), DEFAULT 8px, sm 6px
  (контролы внутри блока). Острый угол был последней деталью прежней суровой
  версии и спорил с круглыми объектами на странице — реактором и собакой.
- .block-card получил rounded-block. Аватарные плашки стали кругами, пузыри
  чата — rounded-block с прижатым углом со стороны говорящего.

Левая шторка
- Профиль и статистика объединены в одну секцию без разделителя между ними:
  статы принадлежат профилю, а не стоят рядом. Навигация отодвинута вниз
  (border-t + pt-8). Раньше три секции с одинаковыми отступами читались как
  один сплошной список.
- Аватар профиля 44 → 48px и круглый, имя 16 → 18px, статы 20 → 24px.

Навигация — пять слотов «В разработке»
- PRIMARY_NAV удалён, вместо него PRIMARY_NAV_SLOTS = 5. Шторка рендерит пять
  инертных строк с пунктирным контуром и текстом nav.wip.
- Причина в коде записана: пять кнопок с названиями несуществующих страниц —
  это приглашение кликнуть и получить 404, плюс фиксация имён, которые мы
  собираемся менять. Когда названия определятся, это снова станет NavItem[].
- Ключ nav.wip: In progress / В разработке / В розробці / In Arbeit.

Шрифт крупнее
- Токен label 10px → 12px (трекинг 0.14 → 0.12em: на 12px прежний разгонял
  слова). 10px — это размер сноски, а не заголовка секции.
- По сайту: дата 24 → 30px, подпись под ней 14 → 16px, имя участника 20 → 24px,
  хендл 14 → 16px, имя ассистента 14 → 16px, текст чата и поле ввода 14 → 15px,
  строки навигации 14 → 16px, вордмарк 9.6 → 12px, переключатель языка на 600.

Проверено
- tsc --noEmit чисто, npm run build проходит.
- Headless Edge, 1440px и 390px: исключений нет, hydration mismatch нет.
  Проверены открытая шторка, реактор вблизи ядра, мобильная раскладка.


Промпт 7 (версия 0.7 — ЭКСПЕРИМЕНТ, отдельная ветка):

"Не кажется ли тебе, что какая-то кнопка стала чуть более глаза резать? Я хотел,
чтобы ты сделал, чтобы оно было как лучи от солнца, которые не по всей площади,
а тянутся к кнопке. Ну и сам сайт выглядит чуть более серьёзным, его нужно как-то
чем-то более неформально выразить, как какой-то СНГ тикток. Если нет идей — просто
забей, но как-то сделать его с чуточкой культуры, как будто этот сайт для
несерьёзности, для тупых подростков. Подготовь путь, чтобы откатиться к этому
этапу, на котором мы прямо сейчас. Это так, чисто экспериментально."


КАК ОТКАТИТЬСЯ
==============
Рабочая копия была скачана ZIP-архивом, поэтому приехала без .git, и под этот
промпт был заведён локальный репозиторий. Получились две параллельные истории
одного проекта: v0.1-v0.3 на GitHub, v0.6+ локально. Связаны коммитом
b7ee3aa (merge -s ours: коммиты origin сохранены как родитель, дерево осталось
нашим). С этого момента репозиторий один:

  origin  https://github.com/NellleT/podshar-website
  main    вся работа, v0.1 -> v0.11
  тег v0.6 — состояние до эксперимента с неформальностью (коммит 5b2c835)
  ветка experiment/less-serious — та же линия, оставлена как закладка

  Откат к v0.6:         git switch --detach v0.6
  Посмотреть разницу:   git diff v0.6 main
  Забрать один файл:    git checkout v0.6 -- src/components/PHButton.tsx

Ничего не потеряно: v0.6 — тег, история GitHub — родитель merge-коммита.


ИЗМЕНЕНИЯ, ВНЕСЁННЫЕ ПО ПРОМПТУ 7
=================================

Кнопка — лучи вместо залитого пятна
- Причина рези: заливка доходила до 0.80 альфы на круге в 20rem. Это много
  красного на почти белой странице, и площадь работала против самой кнопки.
- Убраны оба «лепестка» и большое пятно. Заливка теперь тихая (пик 0.42) и
  маленькая — спад к 58% вместо 74%. Её задача — только перекрыть стык между
  ядром и лучами.
- Лучи настоящие: 12 узких спиц, каждая из трёх стопов (прозрачно → альфа →
  прозрачно), то есть спица разгорается и гаснет вдоль развёртки, а не является
  сектором с боковыми гранями. Шаги между ними 26/28/30/34° — почти ровно, но
  никогда ровно, поэтому кольцо читается как нарисованное от руки.
- Направление «к кнопке» даёт маска: непрозрачна ровно там, где кончается ядро
  (17-25%), наполовину съедена к 48%, в ноль к 76%. Каждый луч ярче всего у
  кнопки и истончается наружу — глаз читает это как «тянется внутрь».
- Наклон к курсору теперь сдвиг всего кольца лучей (до 14px в сторону курсора):
  сам conic-градиент не знает направления, поворачивать его бессмысленно.
- Строка градиента из 40 стопов заменена функцией buildRays() поверх массива
  RAY_ANGLES. Руками такую строку нельзя было ни прочитать, ни безопасно
  править.
- Два вложенных span у слоя лучей: внешний несёт сдвиг к курсору, внутренний —
  медленный поворот. На одном элементе два transform затирают друг друга.

Неформальность
- Лейблы переведены в нижний регистр. Капс с разрядкой — это фирменный стиль
  галерей и годовых отчётов; он молча превращал приватный сайт на троих в
  брошюру. Те же слова строчными говорят то же самое без осанки.
- Тексты переписаны разговорно на всех четырёх языках:
  «Добро пожаловать» → «ну привет», «Сегодня» → «какой сегодня день»,
  «Участник» → «кто это вообще», «Профиль» → «это ты»,
  «Статистика» → «цифры», «Навигация» → «куда-нибудь»,
  «Навигатор» → «мопс-навигатор».
  aria-label сайдбара остался осмысленным (отдельный ключ navHeading для
  видимого заголовка) — скринридер не должен слышать шутки вместо структуры.
- Новый блок «мысль дня» во всю ширину: 8 ироничных строк на язык, одна на
  день. Выбор от номера дня по цюрихскому времени, не Math.random(): случайное
  число дало бы разные строки на сервере и клиенте (hydration mismatch) и
  менялось бы на каждом обновлении, что убивает саму идею «мысли ДНЯ».
- Стикер «ПХ™» на блоке цитаты, повёрнут на -6°. Ровный был бы просто ещё
  одной подписью.
- Кнопка ПХ теперь отвечает на нажатия: 6 написанных реплик, дальше счётчик
  («нажато 12. ничего не происходит»). console.log убран. Счётчик — единственный
  useState в компоненте и меняется только по клику, анимацию не трогает.

Проверено
- tsc --noEmit чисто, npm run build проходит.
- Headless Edge, 1440px и 390px: исключений нет, hydration mismatch нет.
  Нажатие проверено — подпись меняется на «серьёзно?».


Промпт 8 (версия 0.8 — доводка интерфейса, устно/письменно):

"Лучи есть, но они не продолжают основное свечение — поправь. Кнопку сделай
органичнее, менее рваной (речь про UI). Кружок с ИИ-агентом сделай подвижным,
а также сворачиваемым и разворачиваемым. Рядом с «какой сегодня день» добавь
текущее время пользователя. Доведи интерфейс и проверь баги; дальше перейдём к
функциям аккаунта. Свои идеи предлагай."


ИЗМЕНЕНИЯ, ВНЕСЁННЫЕ ПО ПРОМПТУ 8
=================================

Реактор — лучи растут из свечения
- Раньше заливка гасла на 58%, а маска лучей открывалась на 17%: лучи начинались
  в пустоте и читались как отдельное кольцо вокруг кнопки. Теперь у заливки
  длинный хвост (4 стопа, ноль на 84%), а маска лучей открывается на 13% —
  внутри плотной зоны заливки. Луч выходит из свечения уже зажжённым.
- Профиль луча: вместо «0 → alpha → 0» (треугольник с двумя прямыми гранями и
  острым кончиком) — приближение приподнятого косинуса, RAY_PROFILE, по три
  стопа на сторону. Прямых участков нет, углов нет.
- Один ярус из 12 одинаковых лучей давал шестерёнку: 12 равных зубцов по кругу.
  Теперь три яруса (RAY_TIERS) — длинные, средние, короткие. У каждого своя
  дальность маски, свой блюр, свой вес (gain) и своя скорость вращения
  (71s / 52s reverse / 96s). Ярусы расходятся по фазе бесконечно, поэтому силуэт
  никогда не складывается в многоугольник.
- Блюр 6-9px на каждом ярусе: conic-градиент при малой альфе банднется в
  видимые фасетки, и никакое количество стопов это не лечит. Блюр их растворяет
  и заодно скругляет кончики. Каждый ярус — один композитный слой, который
  только вращается, поэтому браузер размывает его один раз.
- Ядро: плоская заливка заменена радиальным градиентом (светлее сверху, темнее
  снизу) плюс box-shadow того же красного. Резкость («jagged») жила ровно на
  границе сплошного круга: диск обрывался на одном пикселе. Тень растягивает
  последние пиксели ядра в ауру, и границе негде приземлиться.

Часы пользователя (src/components/LocalClock.tsx, новый)
- Дата и время — разного рода факты. Дата общая, рендерится на сервере в
  цюрихском времени, чтобы все трое видели один день. Время — твоё, резолвится
  в браузере, в твоей зоне, поэтому компонент клиентский.
- До монтирования не рендерится ничего: любая заглушка со временем дала бы на
  сервере одну строку, в браузере другую — hydration mismatch на каждой
  загрузке. Обёртка держит высоту, чтобы блок не прыгал.
- Тик раз в секунду. Зона показывается городом: "Europe/Zurich" → "Zurich".

Лаунчер ассистента (src/components/AssistantLauncher.tsx, новый)
- Перетаскивается (framer drag, dragConstraints по контейнеру inset-4),
  сворачивается в диск 32px, разворачивается нажатием. Позиция и свёрнутость
  живут в localStorage: контроль, который ты передвинул, а он вернулся на место
  после перезагрузки, — это не передвинутый контроль.
- Смещение хранится в motion values (ноль ре-рендеров за кадр), свёрнутость — в
  React state, потому что она меняет разметку.
- Восстановление позиции идёт в useEffect, а не в начальном состоянии: иначе
  сервер и первый клиентский кадр разошлись бы.
- Кламп на resize: уменьшенное окно иначе оставляет кнопку за экраном.
- RightAIChat больше не рендерит кнопку сам, только говорит `hidden`.

Исправленные баги (найдены при проверке, не по промпту)
1. Перетаскивание не работало вообще. Диагностика через CDP показала на
   pointerdown ровно один pointermove и событие dragstart: <img> по умолчанию
   draggable, браузер начинал СВОЙ drag-and-drop картинки, забирал pointer
   capture и глушил все последующие pointermove. Лечение: draggable={false} на
   изображении плюс onDragStartCapture с preventDefault на лаунчере.
2. Скрытый лаунчер (при открытой панели) оставался в порядке табуляции —
   прозрачная кнопка поверх открытого чата. Добавлен inert.
3. Клик после перетаскивания гасился только на главной кнопке, но не на кнопке
   сворачивания: бросив кружок на неё, можно было случайно свернуть. Проверка
   вынесена в swallowedByDrag() и вызывается обеими кнопками.

Проверено
- tsc --noEmit чисто, npm run build проходит.
- Headless Edge через CDP: перетаскивание реально двигает кнопку (позиция
  733,407 после драга), позиция и свёрнутость переживают перезагрузку, клик без
  драга открывает панель, лаунчер при этом прячется.
- /en /de /uk /ru — ни исключений, ни ошибок в консоли, ни упавших запросов.
  Мобильные 390px — то же.


Промпт 9 (версия 0.9 — устно):

"Сделай чуть выразительней лучи и так, чтобы они как лианы пытались тянуться к
курсору и будто бы обхватывать его, независимо практически от основного
свечения."


ИЗМЕНЕНИЯ, ВНЕСЁННЫЕ ПО ПРОМПТУ 9
=================================

Конические лучи заменены на SVG-лианы (src/components/ReactorVines.tsx, новый)
- Причина смены техники, а не параметров: conic-gradient рисует один и тот же
  профиль на каждом радиусе. Он не умеет ни гнуться, ни дать одному лучу длину,
  отличную от соседа. «Тянуться и обхватывать» — это про кривые, поэтому 17
  кубических Безье в SVG, переписываемых каждый кадр.
- Геометрия в системе координат viewBox 200x200 с центром (100,100):
    align   косинус угла между лианой и направлением на курсор. 1 — точно на
            курсор, 0 — вбок и назад. Через lobe = align² задаёт длину, толщину
            и прозрачность: у поля лиан есть перёд.
    grip    кончик подтягивается не к самому курсору, а на КОЛЬЦО радиусом 12
            вокруг него, в ближайшую к своему свободному кончику точку. Если
            тянуть все кончики в одну точку, получается складывающийся зонт;
            кольцо даёт смыкающиеся пальцы, а это и просили.
    hook    вторая контрольная точка уходит по касательной к этому кольцу, со
            знаком стороны. Именно она заворачивает последний отрезок кривой
            ВОКРУГ курсора, а не приводит её в него в лоб.
    curl    первая контрольная точка отклоняется на sin(bearing - угол). Знак
            меняется при переходе через курсор, поэтому лианы слева и справа
            загибаются внутрь.
    drift   две несоизмеримые синусоиды на лиану: поле шевелится и при
            неподвижной мыши, иначе это схема, а не растение.
- Каждая лиана рисуется дважды: широкая размытая копия снизу (объём и связка
  корней с заливкой) и чёткая линия сверху. Одиночная линия постоянной ширины
  читается как проволока.
- Независимость от заливки — по прямой просьбе: базовая альфа лиан 0.20 и почти
  не зависит от intensity, а сама заливка притушена (пик 0.34 вместо 0.42) и
  теперь только перекрывает стык ядра и лиан.
- Ноль React-state: один useAnimationFrame читает motion values и пишет
  d/stroke-width/stroke-opacity прямо в 34 DOM-узла. Ре-рендер на кадр с 34
  детьми был бы на порядок дороже.
- SSR: серверная разметка содержит те же покоящиеся кривые, что клиент считает
  на первом кадре (та же функция, тот же toFixed(2)), поэтому гидратация тихая.
- prefers-reduced-motion: поле рисуется один раз и больше не трогается.

Удалено
- RAY_TIERS, RAY_PROFILE, buildRays, компонент RayTier и оба motion value
  смещения кольца. Вся коническая машинерия из v0.8 ушла целиком.

Проверено
- tsc --noEmit чисто, npm run build проходит.
- Headless Edge: курсор рядом с ядром — лианы вытягиваются в его сторону и
  кончики заворачиваются крючками; курсор далеко — короткие стебли по кругу.
- /ru /en /de /uk и мобильные 390px: ни исключений, ни ошибок в консоли.


Промпт 10 (версия 0.10 — устно):

"При нажатии кнопки сделай так, будто бы волны со свечением расплываются по
радиусу."


ИЗМЕНЕНИЯ, ВНЕСЁННЫЕ ПО ПРОМПТУ 10
==================================

Ударная волна на нажатие (src/components/PHButton.tsx)
- Два кольца на клик, второе с задержкой 0.16 с. Одно расширяющееся кольцо
  читается как обычный ripple из библиотеки компонентов; два, идущие следом
  друг за другом, читаются как «что-то сработало».
- Кольцо — не диск: radial-gradient прозрачен в середине (0 до 47%), пик 0.62 на
  62%, и хвост в ноль к 84%. Внутренний скат круче внешнего, как у настоящей
  волны: фронт и след за ним. На залитом свечении сплошной диск был бы просто
  «аура моргнула».
- Масштаб 0.30 → 1.55 за 1.15 с с easing [0.16,1,0.3,1]: резкий старт, долгое
  затухание. Стартовый размер меньше ядра, поэтому кольцо буквально выходит
  из-под кнопки.
- Кольца рендерятся ДО лиан, чтобы лианы оставались поверх собственной волны.

Волна связана с лианами, а не нарисована поверх них
- Новый motion value `punch`: ставится в 1 по клику и гасится до нуля за 0.9 с.
- Введён `lit` = min(1, intensity + punch*0.6) — и всё, что раньше читало
  intensity (заливка, наклон, масштаб ауры, лианы), читает теперь его.
  Поэтому при нажатии лианы удлиняются и вспыхивают вместе с волной, а не
  наблюдают, как она проходит мимо.

Исправленный изъян (найден до проверки в браузере, при чтении кода)
- Задержка второго кольца сначала считалась как (индекс в массиве % 2) * 0.16.
  Кольца выбывают не по порядку (у каждого свой onAnimationComplete), поэтому
  индексы выживших сдвигаются, transition.delay пересчитывается на лету и
  анимация перезапускается посреди полёта. Задержка теперь хранится в самом
  элементе массива: waves: {id, delay}[].
- MAX_WAVES = 8: кнопка провоцирует долбить по ней, а без потолка каждое
  нажатие оставляло бы в состоянии ещё два анимируемых узла.
- prefers-reduced-motion: волн нет вообще, счётчик нажатий работает.

Проверено
- tsc --noEmit чисто, npm run build проходит.
- Headless Edge: одиночное нажатие — кольцо поймано в полёте, лианы вытянуты
  импульсом; пять нажатий подряд по 220 мс — ни исключений, ни ошибок.
- /ru /en /uk и мобильные 390px — чисто.


Промпт 11 (версия 0.11 — устно):

"Почему лианы в момент клика не расходятся в стороны друг от друга? Это тоже
надо реализовать."


ИЗМЕНЕНИЯ, ВНЕСЁННЫЕ ПО ПРОМПТУ 11
==================================

Разлёт лиан на нажатие (src/components/ReactorVines.tsx)
- В v0.10 импульс поднимал только яркость и длину. Радиальный толчок сам по себе
  неотличим от роста яркости: лианы просто становились чуть длиннее. Хват при
  этом оставался сомкнутым, то есть волна проходила «сквозь» неподвижную руку.
- Добавлен параметр burst (это тот же punch из PHButton). Он делает три вещи:
    splay   угол лианы смещается на SPLAY * sin(base - bearing) * align.
            sin равен нулю для лианы, смотрящей точно на курсор, и меняет знак
            по разные стороны от неё — поэтому соседи расходятся ДРУГ ОТ ДРУГА,
            а не поворачиваются все в одну сторону. Множитель align оставляет
            дальнюю половину кольца в покое.
    grip    хват отпускается на 80% на пике и возвращается по мере затухания.
    hook    крючок на кончике распрямляется на 60%.
  Плюс радиальный толчок len += burst * 11.
- Важная деталь: align и lobe считаются по ИСХОДНОМУ углу лианы, до разлёта.
  Если считать после, лиана тускнеет ровно в тот момент, когда её отбрасывает,
  и это читается как «сдалась», а не «её толкнуло».
- Итог — жест целиком: хват разжимается, лианы разлетаются веером, затем всё
  смыкается обратно за 0.9 с.

Проверено
- tsc --noEmit чисто, npm run build проходит.
- Headless Edge, два кадра одного нажатия: на 180 мс лианы разведены и
  распрямлены, на 1400 мс — снова сомкнуты крючками. Пять нажатий подряд,
  /en, мобильные 390px — без исключений и ошибок в консоли.
