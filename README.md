# Weather App

A user-centric weather application built around three real personas — an event planner, a travel consultant, and a field-services dispatcher — by **Arinze Ohaemesi** for the Product Manager Accelerator AI Engineer Intern technical assessment (April 2026). Covers **Assessment 1 (Frontend)** and **Assessment 2 (Backend)** as a full-stack submission.

> **Why this isn't just another weather app.** This project was built around a simple discipline: every feature has to solve a real problem for a specific user, or it doesn't ship. Each screen below was built from a written user story; each user story is tied to a persona; the personas are tied to real workflows that today's weather products don't serve well. See **[USER_STORIES.md](./USER_STORIES.md)** and **[PRD.md](./PRD.md)** for the full engineering process behind the build.

---

## Who it's for

Three personas, each with a workflow today's weather sites don't serve well. Full personas, jobs-to-be-done, and pain points are in [USER_STORIES.md § Personas](./USER_STORIES.md#personas).

- **Marcus Chen** — senior event planner picking outdoor venues. Needs to *feel* a city, not just see numbers.
- **Priya Desai** — independent travel consultant building client itineraries. Needs to save trips and export them in formats clients open.
- **Sam Rivera** — field-services dispatcher on a phone all day. Needs current conditions in two seconds, gloves on.

---

## What it does

Each feature here is implemented in service of at least one user story. The story IDs link to acceptance criteria in [USER_STORIES.md](./USER_STORIES.md).

| Feature | Persona | User story |
|---|---|---|
| One-tap "Use My Location" geolocation | Sam | [US-01](./USER_STORIES.md#us-01--geolocation) |
| Real-time autocomplete (debounced, keyboard-navigable) | Sam | [US-02](./USER_STORIES.md#us-02--real-time-autocomplete) |
| Search by city / `City, ST` / `City, Country` / US zip / `lat,lon` | All | [US-03](./USER_STORIES.md#us-03--flexible-search) |
| Disambiguation by state-in-resolved-name | Sam | [US-04](./USER_STORIES.md#us-04--disambiguation) |
| Recent-searches chip row, persisted to localStorage | Sam | [US-18](./USER_STORIES.md#us-18--recent-searches-sam) |
| Current conditions card | Marcus | [US-05](./USER_STORIES.md#us-05--current-weather-snapshot) |
| °F / °C toggle that persists across reloads | Priya | [US-06](./USER_STORIES.md#us-06--temperature-unit-toggle) |
| 5-day forecast bucketed by city-local timezone | Marcus | [US-07](./USER_STORIES.md#us-07--5-day-forecast) |
| Glanceable weather-themed background gradient (day/night aware) | Sam | [US-08](./USER_STORIES.md#us-08--glanceable-theme) |
| "Outdoor outlook" recommendation badge | Marcus | [US-19](./USER_STORIES.md#us-19--outdoor-outlook-badge-marcus) |
| Leaflet + OpenStreetMap embed (no API key) | Marcus | [US-09](./USER_STORIES.md#us-09--map-of-the-venue) |
| Local-scene videos panel (YouTube Data API, server-side key) | Marcus | [US-10](./USER_STORIES.md#us-10--local-scene-videos) |
| Save trip with location + date range | Priya | [US-11](./USER_STORIES.md#us-11--save-a-trip) |
| Edit / delete / list saved trips | Priya | [US-12](./USER_STORIES.md#us-12--edit-a-saved-trip) – [US-14](./USER_STORIES.md#us-14--list-saved-trips) |
| Export saved trips as JSON / CSV / PDF / XML / Markdown | Priya | [US-15](./USER_STORIES.md#us-15--export-to-pdf) – [US-17](./USER_STORIES.md#us-17--export-to-json--xml--markdown) |

---

## Stack

- **Frontend** — Next.js 16 (Pages Router), React 18, Tailwind CSS, Leaflet + react-leaflet
- **Backend** — Node.js + Express, axios for upstream HTTP, better-sqlite3 for storage
- **Database** — SQLite (single file, zero infra)
- **Weather data** — OpenWeatherMap (current + 5-day forecast, geocoding API)
- **Maps** — Leaflet + OpenStreetMap tiles (no API key, no quota)
- **Local-scene videos** — YouTube Data API v3 (server-side key)

---

## Architecture overview

```
┌────────────────────────┐        ┌──────────────────────────┐
│  Browser               │        │  Node / Express backend  │
│  Next.js + Tailwind    │  HTTP  │  port 4000               │
│  (port 3000)           │ ─────▶ │                          │
│                        │        │  routes/weather.js       │──▶ OpenWeatherMap
│  - SearchBar           │        │  routes/youtube.js       │──▶ YouTube Data API v3
│  - WeatherCard         │  CORS  │  services/openweather.js │
│  - ForecastRow         │ ◀───── │  utils/exporters.js      │
│  - MapEmbed (Leaflet)  │        │  db/database.js          │──▶ SQLite (file)
│  - SaveForm            │        │                          │
│  - SavedRecords        │        └──────────────────────────┘
│  - YouTubePanel        │
│  - RecentSearches      │
│  - OutdoorOutlook      │
└────────────────────────┘
```

Two design choices worth highlighting; both written up in detail in [PRD.md § 8](./PRD.md#8-technical-architecture):

1. **Backend-first proxy.** All third-party API calls go through Express, never directly from the browser. Keeps API keys server-side, lets the backend normalise responses, and lets us swap providers without touching the client.
2. **Geocoding-first weather lookups.** Every query is resolved to coordinates via OWM's geocoding API *before* the weather endpoints are called. Eliminates the "Hayward, CA" 404 class of bug (where OWM treats `CA` as Canada at the weather endpoint) and lets the resolved place name carry US state info into the UI.

---

## Prerequisites

- Node.js 18+
- npm 9+
- An OpenWeatherMap API key (free tier — activation takes up to 2 hours)
- A YouTube Data API v3 key (free quota; required for the local-scene videos panel)

---

## First-time setup

```bash
# 1. Copy env template and fill in your keys
cp .env.example .env

# 2. Install backend deps
cd backend
npm install

# 3. Install frontend deps
cd ../frontend
npm install
```

Required environment variables (`.env` in repo root):

```bash
OPENWEATHER_API_KEY=your_openweathermap_key_here
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
```

The frontend reads `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:4000`) so the proxy stays consistent across environments.

---

## Run locally (two terminals)

```bash
# Terminal 1 — backend
cd backend
npm run dev
# -> http://localhost:4000

# Terminal 2 — frontend
cd frontend
npm run dev
# -> http://localhost:3000
```

---

## Project structure

```
weather-app/
├── .env.example           # Template — copy to .env and fill in keys
├── .gitignore
├── README.md              # ← you are here
├── USER_STORIES.md        # Personas + 19 stories with acceptance criteria
├── PRD.md                 # PRD built from the user stories
├── VIDEO_SCRIPT.md        # Demo-video walkthrough script
├── backend/               # Express + SQLite
│   ├── server.js          # Entry point
│   ├── routes/
│   │   ├── weather.js     # CRUD + export + geocode endpoints
│   │   └── youtube.js     # Local-scene videos
│   ├── services/
│   │   └── openweather.js # Geocoding-first OWM client
│   ├── utils/
│   │   └── exporters.js   # JSON / CSV / PDF / XML / MD
│   └── db/
│       └── database.js    # SQLite schema + helpers
└── frontend/              # Next.js + Tailwind
    ├── pages/
    │   ├── _app.js
    │   └── index.js       # Main weather UI
    ├── components/
    │   ├── SearchBar.js
    │   ├── WeatherCard.js
    │   ├── OutdoorOutlook.js
    │   ├── ForecastRow.js
    │   ├── MapEmbed.js
    │   ├── LeafletMap.js
    │   ├── UnitToggle.js
    │   ├── SaveForm.js
    │   ├── SavedRecords.js
    │   ├── YouTubePanel.js
    │   └── RecentSearches.js
    ├── lib/
    │   ├── api.js
    │   └── geolocation.js
    └── styles/
        └── globals.css
```

---

## API surface

Full table in [PRD.md § 10](./PRD.md#10-api-surface). Highlights:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Confirms the server is up + key configured |
| GET | `/api/weather/autocomplete?q=` | Search-as-you-type suggestions |
| GET | `/api/weather/current?location=` | Current + 5-day snapshot |
| GET, POST | `/api/weather` | List / create saved records |
| GET, PUT, DELETE | `/api/weather/:id` | Read / update / delete one record |
| GET | `/api/weather/export?format=` | Export as `json` / `csv` / `pdf` / `xml` / `md` |
| GET | `/api/youtube?location=` | Local-scene videos (server-side key) |

---

## Engineering decisions

A few choices that came out of the design process and are worth a closer look:

- **[Why a backend proxy at all?](./PRD.md#8-technical-architecture)** — keys, normalisation, provider portability.
- **[Why geocode every query first?](./PRD.md#f-1--search-bar-with-autocomplete-and-geolocation)** — fixes the long tail of OWM weather-endpoint 404s and lets the UI surface US state automatically.
- **[Why Leaflet over Google Maps Embed?](./PRD.md#f-5--map-embed)** — no API key, no demo-time quota, and a more honest demo of frontend skill (`useMap` hook, custom icon URLs, recenter logic).
- **[Why snapshot weather at save time?](./PRD.md#f-7--saved-trips-with-crud)** — saved trips remain meaningful even if upstream APIs change or rotate schemas.
- **[Why no disambiguation modal in the end?](./PRD.md#13-open-questions)** — state-in-resolved-name handles the long tail in zero modal steps; the picker UI is logged as a v2 future item.

---

## Status

This branch is the assessment submission as of **April 29, 2026**. The companion [PRD.md § 16 Changelog](./PRD.md#16-changelog) tracks substantive iterations.

---

## About PM Accelerator

Product Manager Accelerator (PM Accelerator) is a career accelerator program that helps aspiring product managers and AI engineers break into top tech companies through mentorship, hands-on projects, and interview prep. This project was built as part of the PMA AI Engineer Intern technical assessment.

---

Built by **Arinze Ohaemesi** · PM Accelerator AI Engineer Intern Assessment · April 2026
