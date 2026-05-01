# Weather App — Product Requirements Document

| | |
|---|---|
| **Author** | Arinze Ohaemesi |
| **Status** | Draft v1 |
| **Last updated** | April 29, 2026 |
| **Companion docs** | [USER_STORIES.md](./USER_STORIES.md), [README.md](./README.md) |

---

## 1. TL;DR

A user-centric weather application that helps three distinct personas — an event planner picking outdoor venues, a travel consultant building client itineraries, and a field-services dispatcher who lives on her phone — get the *specific* answers their work depends on, in one screen, without context-switching to maps or video.

Built for the PM Accelerator AI-Engineer Intern technical assessment as a full-stack submission.

---

## 2. Problem statement

Existing weather products are tuned for a generic consumer who wants to know *"will I need a jacket?"* They surface raw numbers at the cost of three things specific users actually need:

1. **Spatial and cultural context.** A venue scout doesn't just want temperature; he wants to picture the city.
2. **Persistence + portability.** A travel consultant doesn't want a single lookup; she wants to save a trip and export it for clients in whatever format they prefer.
3. **Speed under friction.** A field worker doesn't want a 4-tap journey to current conditions on a phone with gloves and bad signal.

The opportunity is to ship a single application that respects all three workflows by making different surfaces of the UI serve different jobs.

---

## 3. Goals and non-goals

### Goals

- **G1** — Solve the venue-research workflow (Marcus) end-to-end inside one screen: search, current, forecast, map, local video.
- **G2** — Solve the trip-portability workflow (Priya) by persisting trips with date ranges and exporting to five formats.
- **G3** — Solve the speed-on-mobile workflow (Sam) with one-tap geolocation, debounced autocomplete, and a glanceable theme.
- **G4** — Demonstrate full-stack engineering rigor: RESTful API, normalised data model, well-handled failure modes, accessible UI.

### Non-goals

- **NG1** — Hyperlocal nowcasting (the app uses OpenWeatherMap's free 5-day/3-hour grid, not radar-derived minute-by-minute).
- **NG2** — Multi-user accounts and auth (single-user demo; everyone shares one SQLite file).
- **NG3** — Push notifications or background sync.
- **NG4** — Native mobile apps (the web UI is responsive but PWA install is out of scope).
- **NG5** — A subscription billing system (this is an assessment build).

---

## 4. Target users

Detailed personas live in [USER_STORIES.md](./USER_STORIES.md#personas). One-line summaries:

- **Marcus Chen** — senior event planner researching outdoor venues; primary value comes from current + forecast + map + local-scene videos.
- **Priya Desai** — independent travel consultant building client itineraries; primary value comes from save/edit/delete + multi-format export.
- **Sam Rivera** — field-services dispatcher on a phone; primary value comes from geolocation + autocomplete + glanceable theme.

These three were chosen because they have *meaningfully different* jobs to be done, which keeps the feature set honest — every feature has to map to a specific story for a specific persona, or it doesn't ship.

---

## 5. User stories (index)

Full criteria in [USER_STORIES.md](./USER_STORIES.md). Index here:

| ID | Story | Persona | Status |
|---|---|---|---|
| US-01 | Geolocation ("Use My Location") | Sam | Shipped |
| US-02 | Real-time autocomplete | Sam | Shipped |
| US-03 | Search by city / zip / coordinates | All | Shipped |
| US-04 | Disambiguation via state-in-name + first-match-wins | Sam | Shipped |
| US-05 | Current weather snapshot | Marcus | Shipped |
| US-06 | °F / °C unit toggle with persistence | Priya | Shipped |
| US-07 | 5-day forecast, city-local timezone | Marcus | Shipped |
| US-08 | Glanceable weather-themed background | Sam | Shipped |
| US-09 | Map of the venue (Leaflet + OSM) | Marcus | Shipped |
| US-10 | Local-scene YouTube videos | Marcus | Shipped |
| US-11 | Save a trip (location + date range) | Priya | Shipped |
| US-12 | Edit a saved trip | Priya | Shipped |
| US-13 | Delete a saved trip | Priya | Shipped |
| US-14 | List saved trips | Priya | Shipped |
| US-15 | Export to PDF | Priya | Shipped |
| US-16 | Export to CSV | Priya | Shipped |
| US-17 | Export to JSON / XML / Markdown | Priya | Shipped |
| US-18 | Recent searches chips | Sam | Proposed (this iteration) |
| US-19 | Outdoor outlook badge | Marcus | Proposed (this iteration) |

---

## 6. Functional requirements

Each requirement points back to the story it satisfies. The feature is the *implementation*; the story is the *reason it's there*.

### F-1 — Search bar with autocomplete and geolocation
*US-01, US-02, US-03, US-04*

Single text input that accepts city / "city, ST" / "city, country" / US zip / `lat,lon`. Debounced (300ms) autocomplete dropdown, full keyboard nav, accessible. "Use My Location" button next to the input invokes the browser geolocation API and submits the resolved coordinates. Geocoding runs server-side first so every weather call hits OWM by coordinates (eliminates the "Hayward, CA" 404 class of bug); the resolved place name carries its US state, which handles the long tail of disambiguation in one line of UI rather than a modal. The `/api/weather/geocode` endpoint remains available for future programmatic disambiguation work.

### F-2 — Current-conditions card
*US-05, US-06*

Glassmorphic card showing place (with US state if applicable), description, headline temperature in the user's chosen unit + secondary unit, "feels like," humidity, wind, and the OWM weather icon at 4× resolution.

### F-3 — Five-day forecast row
*US-07*

Horizontally scrollable on mobile, 5-column grid on tablet+. Each day shows weekday, icon, description, high/low. Days bucketed by **city-local** timezone using OWM's `city.timezone` offset (not the browser's locale, which would misgroup forecasts when the user is researching cities in other timezones).

### F-4 — Dynamic theme
*US-08*

Page background gradient is keyed to the OWM weather code returned for the current search, with a day/night branch off the icon's `n`-suffix. CSS transition (1.2s) so the change is perceptible but not jarring.

### F-5 — Map embed
*US-09*

Leaflet map in a glass container. OpenStreetMap tile layer (no API key, no quota). Auto-recenters when the search location changes via a `useMap` hook. Marker popup shows the resolved place name.

### F-6 — Local-scene videos panel
*US-10*

Right-rail sidebar (collapses to bottom on mobile). Server-side YouTube Data API fans out two parallel searches per location: 2× "weather conditions outdoor" + 1× "events activities." Cards play inline on click. API key is server-side only.

### F-7 — Saved trips with CRUD
*US-11, US-12, US-13, US-14*

Form: location + date-from + date-to. List of saved trips with Edit/Delete on each. SQLite store (single file, no external DB). The temperature-data snapshot is captured at save time so the record stays meaningful even if upstream APIs change.

### F-8 — Multi-format export
*US-15, US-16, US-17*

Five export buttons: JSON, CSV, PDF, XML, Markdown. Each is a `GET /api/weather/export?format=...` call that returns the right `Content-Type` and `Content-Disposition` for the browser to download.

### F-9 (proposed) — Recent searches chips
*US-18*

Below the search bar: up to 5 chips of recent successful searches, persisted to `localStorage`. Click a chip to re-run that search. De-duplicated; most recent first.

### F-10 (proposed) — Outdoor outlook badge
*US-19*

Small badge on the WeatherCard that interprets `(weather.id, temp, wind, humidity)` into one of three labels: "Great for outdoor events," "Outdoor with a backup," "Indoor recommended." Tooltip exposes the reasoning.

---

## 7. Non-functional requirements

- **NFR-1 — Accessibility.** Keyboard navigation throughout the search dropdown; ARIA roles on listbox/option; alt text on icons; sufficient contrast on glass surfaces (white text on dark gradients consistently passes WCAG AA at the chosen opacities).
- **NFR-2 — Responsive.** Verified at 375px (iPhone), 768px (iPad), 1280px (desktop). Two-column layout collapses to a single column at `lg` breakpoint.
- **NFR-3 — Resilience.** Network failures, missing API keys, invalid input, and "no matches" all surface as human-readable errors — no stack traces in the UI.
- **NFR-4 — Secrets hygiene.** All API keys (`OPENWEATHER_API_KEY`, `YOUTUBE_API_KEY`) live in `.env`, never in client bundles, never in git.
- **NFR-5 — RESTful conventions.** Resources are nouns (`/api/weather`, `/api/weather/:id`), verbs come from HTTP methods (GET / POST / PUT / DELETE), errors return JSON with a `{ error: "…" }` shape and the right status code.

---

## 8. Technical architecture

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
└────────────────────────┘
```

### Why this shape

- **Backend-first proxy.** All third-party API calls go through Express, never directly from the browser. This keeps API keys server-side, lets us cache/normalise responses, and lets us swap providers (e.g., to AccuWeather) without touching the client.
- **Geocoding-first weather lookup.** Every weather query is resolved through OWM's geocoding API to coordinates *before* hitting `/data/2.5/weather`. This eliminates the long tail of 404s caused by ambiguous strings (e.g. "Hayward, CA" — OWM treats `CA` as Canada at the weather endpoint).
- **Single SQLite file.** Zero infra. Good enough for a single-user demo; would swap for Postgres in a hosted multi-tenant version.
- **Snapshot at save time.** Saved records capture the weather payload as JSON in the same row, so the saved trip is meaningful even if the user has been offline or OWM rotates their schema.

---

## 9. Data model

### `weather_records` (SQLite)

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | auto-increment |
| `location` | TEXT NOT NULL | the user's original input |
| `date_from` | TEXT NOT NULL | ISO `YYYY-MM-DD` |
| `date_to` | TEXT NOT NULL | ISO `YYYY-MM-DD` |
| `temperature_data` | TEXT NOT NULL | JSON snapshot of the current+forecast payload |
| `created_at` | TEXT NOT NULL | ISO timestamp, default `CURRENT_TIMESTAMP` |
| `updated_at` | TEXT NOT NULL | ISO timestamp, updated on PUT |

Constraint: `date_from <= date_to` enforced at write time (not in the schema; both client-side in `SaveForm` and server-side before insert/update).

---

## 10. API surface

All endpoints under `/api`. Errors return `{ error: string }` with an appropriate 4xx/5xx code.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Healthcheck — service alive, key configured |
| GET | `/api/weather/autocomplete?q=` | Search-as-you-type suggestions |
| GET | `/api/weather/geocode?location=` | Up to 5 candidate matches for ambiguous input |
| GET | `/api/weather/current?location=` | Current + 5-day snapshot for one location |
| GET | `/api/weather` | List saved records |
| POST | `/api/weather` | Create a saved record |
| GET | `/api/weather/:id` | Read one record |
| PUT | `/api/weather/:id` | Update a record |
| DELETE | `/api/weather/:id` | Delete a record |
| GET | `/api/weather/export?format=` | Export records as `json` / `csv` / `pdf` / `xml` / `md` |
| GET | `/api/youtube?location=` | Local-scene videos for a location |

---

## 11. Success metrics

For an assessment build, these are *demo-quality* metrics rather than production analytics:

- **M-1** — Three persona scenarios can be completed end-to-end in the demo video without leaving the app.
- **M-2** — Time-to-current-conditions from "Use My Location" tap is under 3 seconds on a normal connection.
- **M-3** — All five export formats produce valid, openable files (verified manually for the demo).
- **M-4** — Zero unhandled error toasts across the three demo scenarios.

A hosted multi-user version would track: weekly active personas, save-rate, export-rate by format, search-to-result success rate, and disambiguation-picker usage.

---

## 12. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| OWM rate limits during the demo | Med | Med | Free tier is 60 calls/min — well above demo load. App degrades to a clean error if rate-limited. |
| YouTube Data API quota exhaustion | Low | Low | Default 10k units/day; each search costs ~100 units. Panel hides gracefully if 503. |
| Ambiguous location returns the wrong city | Low | Med | Geocoding-first + US-state-code normalisation; resolved place includes the state so the user notices a wrong "Springfield" immediately. Picker UI on the roadmap. |
| User selects "save" before search resolves | Low | Low | Save form is hidden until `data` is set, or while editing an existing record. |
| Maps tile blocking on enterprise networks | Low | Low | Leaflet + OSM only — no Google Maps/Mapbox dependency. |

---

## 13. Open questions

- **O-1** *(resolved April 29)* — Disambiguation picker UI was prototyped but cut. The `/api/weather/geocode` endpoint is retained, but the client uses geocoding-first + state-in-resolved-name as the lighter-weight alternative. The interactive picker is logged in [§15 Future](#15-future--v2) for re-introduction if multi-match traffic justifies it.
- **O-2** — Should "recent searches" (US-18) be scoped per browser (`localStorage`) or per saved record (DB-backed)? Defaulting to localStorage to keep the no-auth model.
- **O-3** — Should the outdoor-outlook (US-19) take wind direction into account, or just speed? Defaulting to speed-only for v1; revisit after demo feedback.

---

## 14. Out of scope (for this iteration)

- User accounts, auth, multi-tenant data
- Server-side caching of weather payloads
- Webhooks / scheduled-trip alerts
- Internationalisation (UI strings are English only)
- Telemetry / analytics

---

## 15. Future / v2

- **Per-persona landing presets.** "I'm planning an event / a trip / a shift" — pre-tunes the dashboard.
- **Interactive disambiguation picker.** Re-introduce a modal that lists `/api/weather/geocode` matches when ambiguous queries are detected (cut in this iteration as O-1).
- **Trip sharing.** Generate a public read-only link for a saved trip Priya can email a client.
- **Severe-weather highlighting.** Surface OWM weather alerts (`/data/3.0/onecall`) when the day's worst slot crosses a threshold.
- **Historical climatology.** Show "what is October normally like in Lisbon" alongside the live forecast.
- **Native iOS share-sheet.** PWA install + share-target for Sam to send a location in from any other app.

---

## 16. Changelog

- **v1 — April 29, 2026.** Initial draft. Personas, user stories, and feature mapping introduced. Two new stories proposed for this iteration (US-18, US-19).
