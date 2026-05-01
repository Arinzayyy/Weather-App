# Build Status — Weather App

> Snapshot of progress on the PM Accelerator AI Engineer Intern technical assessment (Full-stack / Dual Role).
> Built by **Arinze Ohaemesi**.
> Email received: **April 21, 2026** · Submission deadline: **Friday May 1, 2026**.
> Last updated: **April 29, 2026**.

---

## User-centric pivot (April 28)

Mid-build, the project was restructured from a feature checklist into an engineering process anchored on specific users. Three deliverables landed:

1. Personas + user stories with acceptance criteria
2. PRD built from those stories
3. Demo video script structured around one persona's scenario, narrating the engineering process

**All three are now in the repo.** Personas live in [`USER_STORIES.md`](./USER_STORIES.md), PRD in [`PRD.md`](./PRD.md), demo script in [`VIDEO_SCRIPT.md`](./VIDEO_SCRIPT.md). README was rewritten to lead with that framing.

---

## What's done

### Documentation
- [x] [`USER_STORIES.md`](./USER_STORIES.md) — three personas (Marcus / Priya / Sam) + 19 user stories with acceptance criteria, each linked to its implementation file
- [x] [`PRD.md`](./PRD.md) — TL;DR, problem, goals/non-goals, persona summaries, story index, feature spec, NFRs, architecture diagram, data model, API surface, success metrics, risks, open questions, future / v2, changelog
- [x] [`README.md`](./README.md) — full rewrite, leads with personas, every feature row links to its US-XX
- [x] [`VIDEO_SCRIPT.md`](./VIDEO_SCRIPT.md) — 7–8 min walkthrough script (Marcus 4 min + Priya 1 min + Sam 1 min + outro), pre-recording checklist, engineering callouts that survive any trim, "things to NOT show" list

### Frontend (Assessment 1)
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

---

## What's left

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

| Day | Plan |
|---|---|
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
