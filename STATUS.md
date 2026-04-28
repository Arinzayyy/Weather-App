# Build Status — Weather App

> Snapshot of progress on the PM Accelerator AI Engineer Intern technical assessment (Full-stack / Dual Role).
> Built by **Arinze Ohaemesi**.
> Email received: **April 21, 2026** · Submission deadline: **May 1, 2026** (10 days, dual role).

---

## What's done

### Frontend (Assessment 1)
- [x] Next.js 16 (Pages Router) + Tailwind CSS scaffold
- [x] Location input — accepts city, "City, ST", zip code, GPS coordinates ("lat,lon"), and the user's browser geolocation
- [x] Current weather display — temp (°F + °C with toggle), feels like, humidity, wind, condition icon
- [x] 5-day forecast — daily cards grouped from OWM's 3-hour intervals, timezone-aware
- [x] **Map** — Leaflet + OpenStreetMap tiles, marker with popup (location + temp), auto-recenters on new searches, SSR-skipped via `next/dynamic`
- [x] Unit toggle (F/C) with `localStorage` persistence
- [x] **Disambiguation picker** — when a query matches multiple places (e.g. "Springfield"), user picks which one
- [x] CRUD UI — save form (location + dateFrom + dateTo), saved-records list with Edit / Delete
- [x] Export bar — JSON / CSV / PDF / XML / Markdown download links
- [x] Error handling — invalid input, network failure, geolocation denied, location not found, API key invalid
- [x] Use-my-location button (browser Geolocation API)
- [x] Footer with builder name + PM Accelerator description

### Backend (Assessment 2)
- [x] Express server with CORS, JSON body parsing, centralized error handler
- [x] SQLite via better-sqlite3 — `weather_searches` table (id, location, date_from, date_to, temperature_data JSON, created_at, updated_at)
- [x] **OpenWeatherMap service wrapper** — geocoding-first strategy:
  - Coords → used directly
  - Zip codes → `/geo/1.0/zip`
  - Free-text place → `/geo/1.0/direct` (with smart "City, ST" → "City,ST,US" normalization)
- [x] CRUD endpoints — `POST/GET/PUT/DELETE /api/weather`, `GET /api/weather/:id`
- [x] `GET /api/weather/current` — lookup without saving
- [x] `GET /api/weather/geocode` — disambiguation candidates
- [x] `GET /api/weather/export?format=…` — five export formats (JSON, CSV, PDF, XML, Markdown)
- [x] Date range validation — both required, ordered correctly, within 5 days of today
- [x] Re-fetches fresh weather snapshot on every save / update
- [x] `GET /api/health` — lightweight uptime + key-presence check

---

## What's left

### Code
- [ ] **Step 11 — Responsive pass** at 375 / 768 / 1280 breakpoints. Spot-fix any layout issues at mobile/tablet sizes.
- [ ] **Step 13 — README polish.** Current README covers setup + structure but should be expanded: feature tour, screenshots, architecture diagram, env-var reference table, deployment notes.

### Submission (must-do, not yet done)
- [ ] Push to **GitHub** at https://github.com/Arinzayyy/Weather-App (this push)
- [ ] Add `community@pmaccelerator.io` and `hr@pmaccelerator.io` as collaborators with view access
- [ ] **Record demo video** (~10–15 min walkthrough — search, save, edit, delete, export, picker, map, geolocation, error states)
- [ ] **Submit Google Form** with repo URL + video link (link is in the assessment email)
- [ ] **Reply to PMA email** with Section 1 + Section 2 answers:
  - Section 1: technical project pride point + difficulty encountered; goal for joining program
  - Section 2: cohort commitment (Cohort 9: Jun 22–Aug 14, 2026 | Cohort 10: Aug 17–Oct 9, 2026), 10–20 hr/wk yes/no, role applying for, college info, OPT/CPT status

---

## Timeline (working back from May 1 deadline)

| Day | Plan |
|---|---|
| Mon Apr 27 *(today)* | Disambiguation done · push to GitHub · invite collaborators · Step 11 responsive pass |
| Tue Apr 28 | Step 13 README polish · end-to-end QA |
| Wed Apr 29 | Record demo video · draft email reply |
| Thu Apr 30 | **Submit Google Form · send email reply** |
| Fri May 1 | Buffer / hard deadline |

---

## Local run

See `README.md` for setup. TL;DR:

```bash
cp .env.example .env       # fill in OPENWEATHER_API_KEY
cd backend && npm install && npm run dev   # http://localhost:4000
cd frontend && npm install && npm run dev  # http://localhost:3000
```
