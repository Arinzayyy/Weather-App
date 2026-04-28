# Weather App — PM Accelerator AI Engineer Intern Assessment

Full-stack weather application built by **Arinze Ohaemesi** for the PM Accelerator AI Engineer Intern technical assessment (April 2026). Covers **Assessment 1 (Frontend)** and **Assessment 2 (Backend)** as a full-stack submission.

> _This README will be completed in Step 13. It currently documents setup only._

## Stack

- **Frontend:** Next.js (pages router) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3)
- **Weather API:** OpenWeatherMap (current + 5-day forecast)
- **Maps:** Leaflet + OpenStreetMap tiles (no API key required)

## Prerequisites

- Node.js 18+
- npm 9+
- An OpenWeatherMap API key (free, activation can take up to 2 hours)

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

## Project structure

```
weather-app/
├── .env.example           # Template — copy to .env and fill in keys
├── .gitignore
├── README.md
├── backend/               # Express + SQLite
│   ├── package.json
│   ├── server.js          # Entry point
│   ├── routes/
│   │   └── weather.js     # CRUD + export endpoints
│   └── db/
│       └── database.js    # SQLite setup + schema
└── frontend/              # Next.js + Tailwind
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── pages/
    │   ├── _app.js
    │   └── index.js       # Main weather UI
    ├── components/        # SearchBar, WeatherCard, ForecastRow, MapEmbed, ExportButton
    └── styles/
        └── globals.css
```

## About PM Accelerator

Product Manager Accelerator (PM Accelerator) is a career accelerator program that helps aspiring product managers and AI engineers break into top tech companies through mentorship, hands-on projects, and interview prep.

---

Built by **Arinze Ohaemesi** · PM Accelerator AI Engineer Intern Assessment · April 2026
