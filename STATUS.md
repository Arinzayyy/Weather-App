# Build Status — WeatherApp

> Snapshot of progress on the PM Accelerator AI Engineer Intern technical assessment (Full-stack / Dual Role).
> Built by **Arinze Ohaemesi**.
> Email received: **April 21, 2026** · Submission deadline: **May 1, 2026**

---

## What's done

### Frontend (Assessment 1)
- [x] Next.js (Pages Router) + Tailwind CSS
- [x] **Autocomplete search** — debounced (300ms), keyboard navigable (arrows/enter/esc), outside-click to close, full ARIA (listbox/option/activedescendant). Calls backend `/api/weather/autocomplete` — API key stays server-side
- [x] Location input — city, "City, ST", zip code, GPS coordinates, browser geolocation
- [x] Current weather card — temp (°F/°C), feels like, humidity, wind, 4x icon with glow
- [x] 5-day forecast — daily cards from OWM 3-hour intervals, timezone-aware, horizontal scroll on mobile
- [x] **Interactive map** — Leaflet + OpenStreetMap, marker + popup, SSR-skipped via `next/dynamic`
- [x] Unit toggle (°F / °C) with localStorage persistence
- [x] CRUD UI — save form, saved-records list with Edit / Delete
- [x] Export bar — JSON / CSV / PDF / XML / Markdown
- [x] **YouTube sidebar** — 2 weather/conditions + 1 local events video per search; thumbnail-click-to-embed; server-side API key proxy
- [x] **Dynamic gradient backgrounds** — keyed to OWM condition ID + day/night, 1.2s CSS transition
- [x] **Glassmorphism UI** — `backdrop-blur-xl`, `bg-white/15`, `border-white/25` across all cards
- [x] **Responsive layout** — two-column grid (`lg:grid-cols-[1fr_360px]`) collapses to single column on mobile; tested at 375/768/1280px
- [x] Disambiguation screen removed — autocomplete handles location selection upstream
- [x] Error handling — invalid input, network failure, geolocation denied, location not found, API key invalid
- [x] Footer with builder name + PM Accelerator description

### Backend (Assessment 2)
- [x] Express + CORS + JSON body parsing + centralized error handler
- [x] SQLite via better-sqlite3 — `weather_searches` table with full CRUD
- [x] OpenWeatherMap service wrapper — geocoding-first strategy (coords → zip → free-text with "City,ST,US" normalization)
- [x] `GET /api/weather/autocomplete?q=` — returns `[]` instead of 404 for no-match (safe for mid-typing calls)
- [x] `GET /api/weather/geocode?location=` — disambiguation candidates (up to 5)
- [x] `GET /api/weather/current?location=` — lookup without saving
- [x] `POST/GET/PUT/DELETE /api/weather` — full CRUD
- [x] `GET /api/weather/export?format=` — JSON, CSV, PDF, XML, Markdown
- [x] `GET /api/youtube?location=` — parallel search: 2 weather + 1 events video
- [x] `GET /api/health` — uptime + key-presence check
- [x] Date range validation, fresh snapshot on every save/update
- [x] RESTful design — idempotent methods, correct HTTP status codes, JSON error objects

### Documentation
- [x] **WeatherApp_PRD.docx** — 7-section Product Requirements Document: 3 personas, 12 user stories with acceptance criteria, feature requirements table, non-functional requirements, open questions
- [x] **WeatherApp_PDR.docx** — 12-section Product Design Review
- [x] **README.md** — opens with user personas table, full feature tour, API endpoint table, project structure, env-var reference

---

## What's left

### Submission (must-do before May 1)
- [ ] **Push to GitHub** — `git remote add origin https://github.com/Arinzayyy/Weather-App.git && git push -u origin main` (blocked by stale .git lock files — remove with `Remove-Item -Force ".git\index.lock"` and `.git\config.lock"`)
- [ ] **Add GitHub collaborators** — Settings → Collaborators → add `community@pmaccelerator.io` and `hr@pmaccelerator.io` (Read access)
- [ ] **Record demo video** — 10–15 min walkthrough framed around Jordan Rivera (travel coordinator) use case per Pierre's engineering mindset feedback
- [ ] **Submit Google Form** — repo URL + video link (link in assessment email)
- [ ] **Reply to Simi's email** — Section 1 (technical pride point, difficulty, program goal) + Section 2 (cohort, hours, role, college, OPT/CPT)
- [x] ~~**Add YouTube API key**~~ — already present in `backend/.env`

---

## Mentor Feedback Applied (Pierre-Andre Malbrough — April 28, 2026)

Pierre's core note: features need user stories. Every feature must solve a specific user's problem.

| Pierre's Feedback | Action Taken |
|---|---|
| "Start with user stories, then build a PRD" | Created `WeatherApp_PRD.docx` with 3 personas + 12 user stories + acceptance criteria |
| "Autocomplete is a standard feature that's missing" | Implemented debounced autocomplete with full keyboard nav and ARIA |
| "Frame demo around a specific user's scenario" | Demo script to open with Jordan Rivera (travel coordinator) scenario |
| "Technology must make a specific user's life easier" | Removed generic travel videos — YouTube now fetches weather + local events (maps to US-09, Marcus the event planner) |
| "Disambiguation screen shows same city 3 times" | Removed — autocomplete handles location selection before search |

---

## Local Run

```bash
cp .env.example .env       # fill in OPENWEATHER_API_KEY + YOUTUBE_API_KEY
cd backend && npm install && npm run dev   # http://localhost:4000
cd frontend && npm install && npm run dev  # http://localhost:3000
```
