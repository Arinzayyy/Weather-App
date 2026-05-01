# Build Status — WeatherApp

> Snapshot of progress on the PM Accelerator AI Engineer Intern technical assessment (Full-stack / Dual Role).
> Built by **Arinze Ohaemesi**.
<<<<<<< HEAD
> Email received: **April 21, 2026** · Submission deadline: **May 1, 2026**
=======
> Email received: **April 21, 2026** · Submission deadline: **Friday May 1, 2026**.
> Last updated: **April 29, 2026**.

---

## User-centric pivot (April 28)

Mid-build, the project was restructured from a feature checklist into an engineering process anchored on specific users. Three deliverables landed:

1. Personas + user stories with acceptance criteria
2. PRD built from those stories
3. Demo video script structured around one persona's scenario, narrating the engineering process

**All three are now in the repo.** Personas live in [`USER_STORIES.md`](./USER_STORIES.md), PRD in [`PRD.md`](./PRD.md), demo script in [`VIDEO_SCRIPT.md`](./VIDEO_SCRIPT.md). README was rewritten to lead with that framing.
>>>>>>> 8c7187a1d06c0d8339cbc76311e86b34d628600c

---

## What's done

### Documentation
- [x] [`USER_STORIES.md`](./USER_STORIES.md) — three personas (Marcus / Priya / Sam) + 19 user stories with acceptance criteria, each linked to its implementation file
- [x] [`PRD.md`](./PRD.md) — TL;DR, problem, goals/non-goals, persona summaries, story index, feature spec, NFRs, architecture diagram, data model, API surface, success metrics, risks, open questions, future / v2, changelog
- [x] [`README.md`](./README.md) — full rewrite, leads with personas, every feature row links to its US-XX
- [x] [`VIDEO_SCRIPT.md`](./VIDEO_SCRIPT.md) — 7–8 min walkthrough script (Marcus 4 min + Priya 1 min + Sam 1 min + outro), pre-recording checklist, engineering callouts that survive any trim, "things to NOT show" list

### Frontend (Assessment 1)
<<<<<<< HEAD
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
=======
- [x] Next.js 16 (Pages Router) + Tailwind + glassmorphism design system
- [x] Search input — city / `City, ST` / `City, Country` / US zip / `lat,lon` / browser geolocation
- [x] Real-time autocomplete dropdown (debounced 300ms, full keyboard nav, ARIA listbox)
- [x] Current-conditions card with state-in-resolved-name (handles long-tail disambiguation)
- [x] 5-day forecast bucketed by city-local timezone
- [x] Leaflet + OpenStreetMap map embed (SSR-skipped, auto-recenters via `useMap`)
- [x] °F / °C toggle, persists across reloads
- [x] Dynamic gradient backgrounds keyed to OWM weather code + day/night (1.2s transition)
- [x] CRUD UI — save form, saved-records list, Edit / Delete
- [x] Export bar — JSON / CSV / PDF / XML / Markdown
- [x] Error handling — invalid input, network failure, geolocation denied, location not found, missing API key
- [x] YouTube panel (right-rail sticky sidebar) — 2 weather + 1 events videos per location
- [x] **NEW (US-18, Sam):** RecentSearches chip row — last 5 searches, deduplicated, persisted to localStorage
- [x] **NEW (US-19, Marcus):** OutdoorOutlook badge on WeatherCard — deterministic green / amber / red recommendation with reasoning
- [x] Footer with builder name + PM Accelerator description

### Backend (Assessment 2)
- [x] Express + CORS + JSON body parser + centralised error handler
- [x] SQLite via better-sqlite3 — single `weather_records` table with snapshot at save time
- [x] OpenWeatherMap service — geocoding-first (eliminates the "Hayward, CA" 404 class of bug)
- [x] US state-code normalisation (`"City, ST"` → `"City,ST,US"`)
- [x] CRUD endpoints — `GET / POST / PUT / DELETE /api/weather` (and `/:id`)
- [x] `GET /api/weather/current` — lookup without saving
- [x] `GET /api/weather/autocomplete` — search-as-you-type suggestions
- [x] `GET /api/weather/geocode` — up to 5 candidate matches (kept for future programmatic disambiguation; modal UI cut, see PRD §13 O-1)
- [x] `GET /api/weather/export?format=` — five export formats
- [x] `GET /api/youtube?location=` — server-side YouTube key, 2 parallel queries
- [x] `GET /api/health` — uptime + key-presence check

### Cleanup
- [x] `LocationPicker.js` — overwritten with a deprecation tombstone (`export default function LocationPicker() { return null; }` plus explanatory comment). **Still needs to be physically deleted from the desktop** — see "What's left" below.
>>>>>>> 8c7187a1d06c0d8339cbc76311e86b34d628600c

---

## What's left

<<<<<<< HEAD
### Submission (must-do before May 1)
- [ ] **Push to GitHub** — `git remote add origin https://github.com/Arinzayyy/Weather-App.git && git push -u origin main` (blocked by stale .git lock files — remove with `Remove-Item -Force ".git\index.lock"` and `.git\config.lock"`)
- [ ] **Add GitHub collaborators** — Settings → Collaborators → add `community@pmaccelerator.io` and `hr@pmaccelerator.io` (Read access)
- [ ] **Record demo video** — 10–15 min walkthrough framed around Jordan Rivera (travel coordinator) use case per Pierre's engineering mindset feedback
- [ ] **Submit Google Form** — repo URL + video link (link in assessment email)
- [ ] **Reply to Simi's email** — Section 1 (technical pride point, difficulty, program goal) + Section 2 (cohort, hours, role, college, OPT/CPT)
- [x] ~~**Add YouTube API key**~~ — already present in `backend/.env`

---

## Mentor Feedback Applied (Pierre-Andre Malbrough — April 28, 2026)
=======
### On the desktop, before recording the video

- [ ] **Pull this branch on desktop.** All the new files are in the laptop's last push.
- [ ] **Delete the deprecated `LocationPicker.js` stub.** The bash sandbox couldn't remove it from the Windows mount, so I left it as a no-op tombstone. Run from PowerShell in the repo root:
  ```powershell
  Remove-Item .\frontend\components\LocationPicker.js
  git add -A
  git commit -m "Remove deprecated LocationPicker"
  ```
- [ ] **Smoke-test the two new components.** Boot backend + frontend and verify:
  - RecentSearches chips appear after a successful search, persist across a hard refresh, dedupe, cap at 5
  - OutdoorOutlook badge renders on at least 3 conditions: a clear day (green), a windy or light-rain day (amber), and a thunderstorm or extreme-temp day (red)
- [ ] **Verify `.env` has `YOUTUBE_API_KEY` set** on desktop (and that `.env.example` documents it but doesn't include the real key)
- [ ] **Run a quick responsive sanity check** at 375 / 768 / 1280 — the new RecentSearches row should wrap cleanly on mobile and the OutdoorOutlook badge should hide its inline reasoning at narrow widths (it already uses `hidden sm:inline`)

### Submission (in this order)

- [ ] **Push to GitHub** — https://github.com/Arinzayyy/Weather-App
- [ ] **Record the demo video** following [`VIDEO_SCRIPT.md`](./VIDEO_SCRIPT.md) — pre-recording checklist is at the top, target length 7–8 min
- [ ] **Add `community@pmaccelerator.io` and `hr@pmaccelerator.io`** as repo viewers (Settings → Collaborators)
- [ ] **Submit Google Form** — repo URL + video link (link is in the original PMA email)
- [ ] **Reply to the PMA email** with Section 1 + Section 2 answers:
  - Section 1: technical project pride point + difficulty encountered; goal for joining program
  - Section 2: cohort commitment (Cohort 9: Jun 22–Aug 14, 2026 | Cohort 10: Aug 17–Oct 9, 2026), 10–20 hr/wk yes/no, role applying for, college info, OPT/CPT status

---

## Updated timeline (working back from Friday May 1)
>>>>>>> 8c7187a1d06c0d8339cbc76311e86b34d628600c

Pierre's core note: features need user stories. Every feature must solve a specific user's problem.

| Pierre's Feedback | Action Taken |
|---|---|
<<<<<<< HEAD
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
=======
| Mon Apr 27 | Disambiguation backend · GitHub push · responsive pass |
| Tue Apr 28 | Pivot to user-centric framing |
| Wed Apr 29 *(today)* | Personas · USER_STORIES.md · PRD.md · 2 new features · README rewrite · video script |
| Thu Apr 30 | Pull on desktop · smoke-test · push · **record demo** |
| Fri May 1 | Invite PMA collaborators · **submit Google Form · send email reply** |

---

## Local run

See [`README.md`](./README.md) for the full setup. TL;DR:

```bash
cp .env.example .env       # fill in OPENWEATHER_API_KEY and YOUTUBE_API_KEY
cd backend && npm install && npm run dev    # http://localhost:4000
cd frontend && npm install && npm run dev   # http://localhost:3000
>>>>>>> 8c7187a1d06c0d8339cbc76311e86b34d628600c
```

---

## File map of what changed in this iteration

New:
- `USER_STORIES.md`
- `PRD.md`
- `VIDEO_SCRIPT.md`
- `frontend/components/RecentSearches.js`
- `frontend/components/OutdoorOutlook.js`

Rewritten:
- `README.md`
- `STATUS.md` (this file)

Edited:
- `frontend/pages/index.js` — wired RecentSearches + pushRecent helper
- `frontend/components/WeatherCard.js` — wired OutdoorOutlook badge
- `frontend/components/LocationPicker.js` — deprecation tombstone (delete on desktop)
