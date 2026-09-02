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


