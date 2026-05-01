# WeatherApp — PM Accelerator AI Engineer Intern Assessment

Full-stack weather platform built by **Arinze Ohaemesi** for the PM Accelerator AI Engineer Intern technical assessment (April 2026). Covers **Assessment 1 (Frontend)** and **Assessment 2 (Backend)** as a unified full-stack submission.

---

## Who This Is For

This application was designed around three specific user personas, each with documented needs:

| Persona | Role | Primary Need |
|---|---|---|
| **Maya Chen** | Climate Data Analyst | Export structured weather data for Python/Excel analysis |
| **Jordan Rivera** | Corporate Travel Coordinator | Quickly confirm destinations with autocomplete + 5-day forecast |
| **Marcus Thompson** | Outdoor Event Planner | Understand venue climate character + save records for proposals |

Full user stories and acceptance criteria are documented in [`WeatherApp_PRD.docx`](./WeatherApp_PRD.docx).

---

## Features

**Search & Discovery**
- Autocomplete suggestions as you type (debounced, keyboard navigable, full ARIA support)
- Searches resolve via OpenWeatherMap Geocoding API — city names, zip codes, or GPS coordinates all work
- Dynamic gradient backgrounds that change based on weather condition and time of day

**Current Conditions**
- Temperature display with live °F / °C toggle (client-side conversion, no re-fetch)
- Feels like, humidity, wind speed
- High-resolution weather icons with glow effect

**5-Day Forecast**
- Daily high/low with weather icons and condition descriptions
- Horizontal scroll on mobile, 5-column grid on desktop

**Interactive Map**
- Leaflet + OpenStreetMap (no API key required)
- Centered on result coordinates with a marker popup showing city and conditions

**Weather & Local Scene Sidebar**
- YouTube Data API v3 integration (server-side proxy — API key never exposed to browser)
- 2 weather/conditions videos + 1 local events video per search
- Click any thumbnail to play inline; clears on new search

**Saved Records (full CRUD)**
- Save any search with a custom date range
- Edit or delete individual records
- Export all records as JSON, CSV, PDF, XML, or Markdown

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (Pages Router), React 18, Tailwind CSS 3 |
| Backend | Node.js, Express 4 |
| Database | SQLite via better-sqlite3 (synchronous, file-based) |
| Weather Data | OpenWeatherMap — Geocoding, Current Weather, 5-day Forecast APIs |
| Maps | Leaflet + OpenStreetMap (SSR-skipped via next/dynamic) |
| Video | YouTube Data API v3 (server-side proxy) |
| PDF Export | PDFKit |
| CSV Export | json2csv |

---

## Prerequisites

- Node.js 18+
- npm 9+
- OpenWeatherMap API key — free at [openweathermap.org/api](https://openweathermap.org/api) (activation can take up to 2 hours)
- YouTube Data API v3 key — free at [console.cloud.google.com](https://console.cloud.google.com) (enable YouTube Data API v3)

---

## Setup

```bash
# 1. Copy the env template and fill in your API keys
cp .env.example .env
# Edit .env — add OPENWEATHER_API_KEY and YOUTUBE_API_KEY

# 2. Install backend dependencies
cd backend && npm install

# 3. Install frontend dependencies
cd ../frontend && npm install
```

---

## Running Locally

Two terminals required:

```bash
# Terminal 1 — backend (http://localhost:4000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:3000)
cd frontend
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

All keys live in a single `.env` file inside `/backend`. Copy `.env.example` as a starting point.

| Variable | Required | Description |
|---|---|---|
| `OPENWEATHER_API_KEY` | Yes | OpenWeatherMap API key |
| `YOUTUBE_API_KEY` | Yes | YouTube Data API v3 key |
| `PORT` | No | Backend port (default: 4000) |
| `DATABASE_PATH` | No | SQLite file path (default: ./db/weather.sqlite) |
| `FRONTEND_ORIGIN` | No | CORS origin for the frontend (default: http://localhost:3000) |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/weather/autocomplete?q=` | Location suggestions for search dropdown |
| GET | `/api/weather/geocode?location=` | Full geocoding with disambiguation |
| GET | `/api/weather/current?location=` | Current weather + 5-day forecast snapshot |
| POST | `/api/weather` | Save a weather record |
| GET | `/api/weather` | List all saved records |
| PUT | `/api/weather/:id` | Update a saved record |
| DELETE | `/api/weather/:id` | Delete a saved record |
| GET | `/api/weather/export?format=` | Export records (json, csv, pdf, xml, md) |
| GET | `/api/youtube?location=` | Weather + events videos for a location |

---

## Project Structure

```
WeatherApp/
├── .env.example                # Copy to .env and add your keys
├── .gitignore
├── README.md
├── WeatherApp_PRD.docx         # Product Requirements Document
├── WeatherApp_PDR.docx         # Product Design Review
├── backend/
│   ├── server.js               # Express entry point + middleware
│   ├── routes/
│   │   ├── weather.js          # CRUD, autocomplete, geocode, export
│   │   └── youtube.js          # YouTube API proxy
│   ├── services/
│   │   └── openweather.js      # OWM API wrapper (geocoding, weather, forecast)
│   ├── db/
│   │   └── database.js         # SQLite schema + connection
│   └── utils/
│       ├── exporters.js        # JSON, CSV, PDF, XML, MD export logic
│       └── validators.js       # Input validation
└── frontend/
    ├── pages/
    │   └── index.js            # Main page — search, weather, CRUD
    ├── components/
    │   ├── SearchBar.js        # Debounced autocomplete search input
    │   ├── WeatherCard.js      # Current conditions card
    │   ├── ForecastRow.js      # 5-day forecast
    │   ├── MapEmbed.js         # Leaflet map wrapper
    │   ├── YouTubePanel.js     # Weather + events video sidebar
    │   ├── SaveForm.js         # Save/edit record form
    │   ├── SavedRecords.js     # Records list + export buttons
    │   └── UnitToggle.js       # °F / °C toggle
    ├── lib/
    │   ├── api.js              # Fetch wrappers for all backend endpoints
    │   └── geolocation.js      # Browser geolocation helper
    └── styles/
        └── globals.css         # Glassmorphism utilities, weather-bg transition
```

---

## About PM Accelerator

[Product Manager Accelerator](https://www.pmaccelerator.io) is a career accelerator program helping aspiring PMs and AI engineers break into top tech companies through mentorship, hands-on projects, and interview preparation.

---

Built by **Arinze Ohaemesi** · [LinkedIn](https://www.linkedin.com/in/arinze-ohaemesi-1667a426b/) · PM Accelerator AI Engineer Intern Assessment · April 2026
