# User Stories

> Source-of-truth for *why* each feature exists. Every story names the persona it serves, the action it enables, and the benefit it delivers — and lists acceptance criteria the implementation has to satisfy.

Companion to [`PRD.md`](./PRD.md) (which builds on these stories) and [`README.md`](./README.md) (which surfaces the highlights for first-time readers).

---

## Personas

### Marcus Chen — Senior Event Planner

**Role.** Books outdoor venues — corporate gatherings, brand activations, weddings — at a mid-size events agency. Decisions get made 4 to 12 weeks before the event.

**Context.** Marcus is choosing between four candidate cities for an October brand activation. He has the marketing brief and a budget; what he doesn't have is *a feel* for those cities. Numbers alone (`72°F, 40% precipitation`) don't tell him whether a sunset reception there will be magical or miserable.

**Jobs to be done.**
- Compare current and short-range conditions across candidate cities
- Visualise where the venue actually sits geographically
- Get a *qualitative* sense of the city — what events, what scene, what vibe

**Pain points.**
- Generic weather sites surface numbers, not character
- Switching between weather, maps, and YouTube to research a city is a heavy context-switch
- Five-day forecast windows often don't align with how he plans (he wants directional, not minute-by-minute)

**Success looks like.** In one screen, Marcus can pick a city and walk away with a defensible recommendation: "Phoenix in late October — 78°F, sunny, here's the marina venue on the map, here's a recent crowd-shot reel of an outdoor event there. Greenlight."

---

### Priya Desai — Independent Travel Consultant

**Role.** Builds bespoke multi-city itineraries for high-touch clients. Runs 3 to 8 active trips at any time.

**Context.** Each trip lives in Priya's head as "client X, three cities, dates Y to Z, here are the weather windows that work." Today she keeps that in a spreadsheet she manually updates. Her clients want polished deliverables — a PDF they can put on the fridge, a CSV their spouse can open in Numbers, sometimes raw JSON for the data-nerdy ones.

**Jobs to be done.**
- Save the locations + date ranges she's actively researching
- Edit them as plans shift (clients change their minds)
- Export the same data in the right format for each client

**Pain points.**
- Weather-lookup tools don't persist anything; trip-planning tools don't show weather
- One-format export ("download as PDF") fails the client who wanted CSV
- Half her clients are international — needs °F *and* °C without re-clicking each time

**Success looks like.** Priya researches a Lisbon-Porto-Madrid trip, saves each leg with its date window, and emails the client a PDF + a CSV from the same dashboard in under two minutes.

---

### Sam Rivera — Field-Services Dispatcher / Outdoor Contractor

**Role.** Coordinates field crews and outdoor jobs. Spends most of the day on a phone, often with gloves on, often outside, often with bad signal.

**Context.** Sam needs the answer to one question repeatedly: *"What's the weather doing where my people are?"* Sometimes that's "right here, right now," sometimes it's "the next site I'm driving to." She doesn't have time to type "Bakersfield, California" three times.

**Jobs to be done.**
- Get current conditions for her current location in one tap
- Re-check a location she searched five minutes ago without retyping
- Disambiguate when there are multiple cities by the same name

**Pain points.**
- Most weather UIs are too dense to scan in three seconds
- Typing on a phone with gloves or in the sun is slow; ambiguous city names ("Springfield") waste time
- She works with a multinational team — temperature units have to persist

**Success looks like.** Sam opens the app, taps "Use My Location," sees a glanceable theme + the temp, and knows whether to pull her crew off the roof. Two seconds.

---

## Story Map

Each story names the persona, the action, the benefit, and the acceptance criteria the implementation has to pass.

### Search & discovery

#### US-01 — Geolocation
> **As** Sam (field dispatcher), **I want to** request weather for my current location with one tap, **so that** I don't waste time typing on a phone in the field.

**Acceptance criteria**
- Given the search bar is visible, when I press "Use My Location," then the browser geolocation API is invoked.
- When permission is granted, the resolved coordinates are submitted as the search query and conditions render.
- When permission is denied or unavailable, an inline error explains why, in plain language.
- The button shows a "Locating…" state while in flight and is disabled during.

**Implemented in.** `frontend/components/SearchBar.js` (`handleUseMyLocation`), `frontend/lib/geolocation.js`.

---

#### US-02 — Real-time autocomplete
> **As** Sam, **I want to** see location suggestions as I type, **so that** I can pick the right city without finishing the word.

**Acceptance criteria**
- After typing 2+ characters, suggestions appear within ~300ms (debounced).
- Up/Down arrows change the active suggestion; Enter selects it.
- Clicking a suggestion submits the search.
- Pressing Escape, blurring the input, or typing fewer than 2 chars hides the dropdown.
- Suggestions are accessible (`role="listbox"`, `aria-activedescendant`).

**Implemented in.** `frontend/components/SearchBar.js`, backend `GET /api/weather/autocomplete`.

---

#### US-03 — Flexible search
> **As** Marcus (event planner), **I want to** search by city, zip code, or GPS coordinates, **so that** I can use whatever input I have on hand for a candidate venue.

**Acceptance criteria**
- "City" works (`Oakland`)
- "City, ST" works for US addresses (`Hayward, CA`)
- "City, Country" works (`Lisbon, PT`)
- US zip codes work (`94601`)
- "lat,lon" coordinates work (`37.77,-122.41`)
- Invalid input returns a 4xx with a clear error message.

**Implemented in.** `backend/services/openweather.js` (`normalizeQuery`, `geocode`, `parseCoords`).

---

#### US-04 — Disambiguation
> **As** Sam, **I want to** know exactly which "Springfield" I just searched, **so that** I don't act on weather for the wrong city.

**Acceptance criteria**
- The resolved place name in the WeatherCard always includes the US state (when applicable) and country, so an off-by-one match is visible immediately ("Springfield, IL, US" vs "Springfield, MO, US").
- For US queries, the backend normalises `"City, ST"` to `"City,ST,US"` before hitting the geocoder, so state-qualified queries route correctly even when OWM's defaults would interpret `CA` as Canada.
- The geocoder API (`/api/weather/geocode`) returns up to 5 candidates and remains available for a future picker UI; the client currently uses geocoding-first + first-match-wins for a single-tap experience.

**Implemented in.** `backend/services/openweather.js` (`geocode`, `normalizeQuery`, `US_STATE_CODES`), `frontend/components/WeatherCard.js` (place rendering with state).

---

### Current conditions

#### US-05 — Current weather snapshot
> **As** Marcus, **I want to** see current conditions for a candidate venue city, **so that** I can sanity-check the climate before recommending it to my client.

**Acceptance criteria**
- Card shows: place name (with state for US), description, temperature, "feels like," humidity, wind speed, and the OWM weather icon.
- The place label is built from the resolved geocoder name, not the raw user input.
- When the API is down, the user sees a clear error not a stack trace.

**Implemented in.** `frontend/components/WeatherCard.js`, backend `GET /api/weather/current`.

---

#### US-06 — Temperature unit toggle
> **As** Priya (international travel consultant), **I want to** flip between °F and °C, **so that** I can show clients the unit they understand.

**Acceptance criteria**
- A two-button toggle switches the displayed unit instantly across the card and the forecast.
- The choice persists across page reloads (`localStorage`).
- Both units are visible side-by-side for the headline temperature so the user always sees both.

**Implemented in.** `frontend/components/UnitToggle.js`, `frontend/pages/index.js` (persistence).

---

#### US-07 — 5-day forecast
> **As** Marcus, **I want to** see a 5-day directional forecast, **so that** I can decide whether to keep a candidate city in the running.

**Acceptance criteria**
- 5 days, each showing weekday, icon, description, and high/low.
- Days are bucketed by the *city's* local timezone, not the browser's.
- Mid-day entry is chosen as the day's representative.
- High/low computed across all 3-hour slots in that day.

**Implemented in.** `frontend/components/ForecastRow.js` (`summarizeByDay`).

---

#### US-08 — Glanceable theme
> **As** Sam, **I want to** read the weather mood from the colour of the screen, **so that** I can act on it without reading.

**Acceptance criteria**
- Background gradient changes based on the weather code returned by OWM.
- Day vs night variants are distinct (icon code ending in `n` flips the palette).
- Transitions are smooth (1.2s) so the change is perceptible but not jarring.

**Implemented in.** `frontend/pages/index.js` (`getBackground`), `frontend/styles/globals.css` (`.weather-bg`).

---

### Spatial & cultural context

#### US-09 — Map of the venue
> **As** Marcus, **I want to** see the searched location on a map, **so that** I can spatially place the venue relative to airports, hotels, the coastline, etc.

**Acceptance criteria**
- The map auto-centres on the resolved coordinates.
- A marker shows the place name on click.
- The map provider is free (no API key, no demo limits) — Leaflet + OpenStreetMap.

**Implemented in.** `frontend/components/LeafletMap.js`, `frontend/components/MapEmbed.js`.

---

#### US-10 — Local scene videos
> **As** Marcus, **I want to** see real video footage of weather and events in this city, **so that** I can feel the *character* of the place, not just its numbers.

**Acceptance criteria**
- Two parallel YouTube searches run server-side with a single API call from the client: 2 "weather/conditions" results + 1 "events/activities" result.
- Each card shows thumbnail, title, channel — clicking plays inline.
- The YouTube API key is server-side only.
- When the YouTube key is missing, the panel degrades gracefully — no crash.

**Implemented in.** `backend/routes/youtube.js`, `frontend/components/YouTubePanel.js`.

---

### Saved trips (persistence)

#### US-11 — Save a trip
> **As** Priya, **I want to** save a location + date range, **so that** I can come back to my research without losing my place.

**Acceptance criteria**
- Save form requires: location (text), date-from, date-to.
- Date-from must be ≤ date-to (validated client and server).
- Server persists to SQLite and returns the new record.
- The saved record snapshots current weather so it doesn't depend on a future API call.

**Implemented in.** `frontend/components/SaveForm.js`, `backend/routes/weather.js` (`POST /`), `backend/db/database.js`.

---

#### US-12 — Edit a saved trip
> **As** Priya, **I want to** edit a saved trip, **so that** I can adjust dates when my client's plans shift.

**Acceptance criteria**
- Each saved record has an Edit button.
- Edit pre-fills the save form with the existing values.
- Submitting updates the record server-side and refreshes the list.
- Cancel returns the form to "create" mode without writing.

**Implemented in.** `frontend/components/SavedRecords.js`, `frontend/components/SaveForm.js`, `backend/routes/weather.js` (`PUT /:id`).

---

#### US-13 — Delete a saved trip
> **As** Priya, **I want to** delete a saved trip, **so that** the list reflects the trips I'm actually working on.

**Acceptance criteria**
- Each record has a Delete button.
- Deletion is confirmed via a browser dialog before firing.
- Server removes the row and the list refreshes.
- If the deleted record was being edited, the edit form is cleared.

**Implemented in.** `frontend/components/SavedRecords.js`, `backend/routes/weather.js` (`DELETE /:id`).

---

#### US-14 — List saved trips
> **As** Priya, **I want to** see all my saved trips at a glance, **so that** I can navigate my active workload.

**Acceptance criteria**
- Records render in a card list, each showing place, date range, headline temp, and weather icon.
- The list updates after every Save / Edit / Delete without a page reload.

**Implemented in.** `frontend/components/SavedRecords.js`, backend `GET /api/weather`.

---

### Exports

#### US-15 — Export to PDF
> **As** Priya, **I want to** download my saved trips as a PDF, **so that** I can email a polished deliverable to a non-technical client.

**Acceptance criteria**
- One-click download of all saved records as a paginated PDF.
- Each record's location, dates, and headline weather are visible.
- The PDF has a header naming the export.

**Implemented in.** `backend/utils/exporters.js` (PDF), `GET /api/weather/export?format=pdf`.

---

#### US-16 — Export to CSV
> **As** Priya, **I want to** download my saved trips as CSV, **so that** clients (or I) can open them in any spreadsheet tool.

**Acceptance criteria**
- One-click CSV download of all records.
- Columns include id, location, resolvedName, state, country, coords, date range, current temp, description.
- Headers are present; commas inside fields are escaped.

**Implemented in.** `backend/utils/exporters.js` (CSV).

---

#### US-17 — Export to JSON / XML / Markdown
> **As** a developer-leaning client of Priya's, **I want to** consume the saved-trips data programmatically, **so that** I can pipe it into my own tools.

**Acceptance criteria**
- JSON export returns the same shape as the API.
- XML export is well-formed.
- Markdown export is human-readable and renders cleanly on GitHub.

**Implemented in.** `backend/utils/exporters.js`.

---

### Persona-targeted additions (proposed for this iteration)

These two stories are net-new in the latest iteration. Each one visibly serves a specific persona and is small enough to ship before the deadline.

#### US-18 — Recent searches (Sam)
> **As** Sam, **I want to** see my last 3-5 searches as one-tap chips, **so that** I can re-check a site without retyping.

**Acceptance criteria**
- The most recent 5 successful searches appear as chips below the search bar.
- Tapping a chip re-runs the search.
- Chips persist across reloads (`localStorage`).
- Chips are de-duplicated (most recent wins).

---

#### US-19 — Outdoor outlook badge (Marcus)
> **As** Marcus, **I want to** see a one-line "outdoor outlook" interpretation of the current weather, **so that** I get a defensible recommendation without doing my own analysis.

**Acceptance criteria**
- A small badge on the WeatherCard reads one of: "Great for outdoor events," "Outdoor with a backup," "Indoor recommended."
- The recommendation is derived deterministically from temperature, weather code, wind, and precipitation indicators.
- The reasoning is visible on hover/tap (e.g., "Wind 22 mph + light rain").
