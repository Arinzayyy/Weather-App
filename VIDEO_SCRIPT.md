# Demo Video Script

**Audience.** The PMA reviewers evaluating the AI Engineer Intern assessment.

**Goal.** Show the engineering *process*, not just the features — that's the differentiator. Anchor the demo around one persona's lived scenario, narrate the engineering choices that surface as the user moves through the app, then briefly show the other two personas to prove the same discipline applies across the product.

**Target length.** 7–8 minutes. Tight pacing, no filler, no apologies.

---

## Pre-recording checklist

- Backend running on `localhost:4000`, frontend on `localhost:3000`.
- Browser zoom at 100%, light mode (so the dark glass theme reads well on camera).
- Pre-clear localStorage so the recents row starts empty (`localStorage.clear()` in DevTools console).
- Pre-load three saved records so Priya's CRUD/export view has content:
  - `Lisbon, Portugal` — May 12 to May 16
  - `Porto, Portugal` — May 17 to May 19
  - `Madrid, Spain` — May 20 to May 22
- Have `USER_STORIES.md` and `PRD.md` open in a second tab to flash on screen during the engineering-process callouts.
- DevTools Network tab open in another tab so you can show the `/api/weather/current` request fan-out on demand.
- Microphone test before rolling.

---

## Scene 0 — Hook (0:00 – 0:20)

**On screen.** Cold open on the empty app at `http://localhost:3000`. Default purple gradient. Cursor in the search bar.

**Narration.**
> Hi, I'm Arinze Ohaemesi. This is a weather app I built for the PM Accelerator AI Engineer Intern technical assessment — but I want to start with the *process* before I show you the product, because the process is what shaped every choice you'll see. The principle I worked from was simple: *every feature has to solve a real problem for a specific user, or it doesn't ship.* So before I wrote any code in this iteration, I wrote three personas, nineteen user stories with acceptance criteria, and a PRD built on top of them. Let me walk you through what falls out of that.

**On screen — flash.** Cut briefly to `USER_STORIES.md` open in a tab, scroll past the personas section. Cut to `PRD.md`, scroll past the index. Back to the app.

---

## Scene 1 — Marcus the event planner (0:20 – 4:30)

> Primary scenario. The most demo-rich persona; touches search, current, outlook, map, video panel, and forecast.

### 1a. The setup (0:20 – 0:50)

**On screen.** Search bar empty. Hovering near it.

**Narration.**
> Meet Marcus. He's a senior event planner at a mid-sized agency and he has a brand activation booked for late May. His client gave him three candidate cities — Lisbon, Phoenix, and Charleston. His job is to pick one. Generic weather sites give him *numbers*. Marcus needs a *feel* for the city — what's the climate doing, what's the vibe, what's the spatial layout, what kind of events happen there. So Marcus's user stories drove the layout you're about to see.

### 1b. Search + autocomplete (0:50 – 1:30)

**On screen.** Type `Lisb` slowly — the autocomplete dropdown appears. Use the arrow key to highlight `Lisbon, Portugal`, then press Enter.

**Narration.**
> Two engineering choices showing up here. First, autocomplete — debounced 300 milliseconds, full keyboard navigation, listbox role for screen readers. That's user story US-02, and it exists for my third persona Sam, who I'll get to. Second — under the hood, before this query hits OpenWeatherMap's weather endpoint, the backend resolves it through their geocoding API to coordinates. That's because the weather endpoint has a long tail of 404s for ambiguous strings — for example "Hayward, CA" gets interpreted as Canada — and routing through coordinates makes those errors disappear. That's a backend decision driven by what users actually type.

### 1c. Current conditions + outdoor outlook (1:30 – 2:30)

**On screen.** WeatherCard renders. Background gradient transitions to the cloudy/sunny variant for Lisbon's current code. Pause and zoom on the *outdoor outlook badge*.

**Narration.**
> Marcus has temperature, "feels like," humidity, wind. Standard. But notice this — *"Great for outdoor events. Mild conditions, no precipitation, comfortable wind."* That's the outdoor-outlook badge — user story US-19, built specifically for Marcus's job. It takes the OpenWeatherMap weather code, the temperature, the wind speed, and the humidity, runs them through a deterministic decision tree, and produces one of three labels: green light, outdoor-with-a-backup, or indoor-recommended. The reasoning is shown so Marcus can defend the recommendation to his client. I think of this as engineering as consulting — I'm not just surfacing data, I'm interpreting it for a known job to be done.

**On screen.** Hover the badge to surface the full reasoning tooltip on mobile-style narrow window or just point to the inline reasoning.

### 1d. The forecast (2:30 – 3:00)

**On screen.** Scroll down to ForecastRow. Point at the 5 days.

**Narration.**
> Five-day forecast. One subtle choice — the days here are bucketed by Lisbon's *local* timezone, not my browser's. OpenWeatherMap returns 3-hour slots in UTC; if I bucket by my browser's day, the 7am Lisbon slot ends up labeled the wrong day. Acceptance criterion in user story US-07. Small detail; matters when Marcus is comparing cities across timezones.

### 1e. The map (3:00 – 3:30)

**On screen.** Scroll to MapEmbed. The Lisbon marker is centred. Click the marker briefly to show the popup.

**Narration.**
> Map's a Leaflet embed over OpenStreetMap tiles — no API key, no quota, which matters because I'm going to demo this app dozens of times. I prototyped the Google Maps Embed first; switched after the third demo got a quota warning. The recenter logic uses Leaflet's `useMap` hook, so when Marcus searches a different city the map re-centres without re-rendering.

### 1f. The YouTube panel — local scene (3:30 – 4:10)

**On screen.** Scroll up so the right-rail YouTubePanel is visible. Click one of the videos to play it inline.

**Narration.**
> This is the piece that makes the app *feel* different. User story US-10, persona Marcus. Two parallel YouTube searches run server-side — two videos for "weather conditions outdoor" and one for "events activities" in Lisbon. Marcus gets the visual character of the city in the same screen. The YouTube API key is server-side only — never shipped to the browser — and the panel degrades gracefully if the key is missing.

### 1g. Engineering callout — the architecture (4:10 – 4:30)

**On screen.** Cut to DevTools Network tab. Trigger a search for `Phoenix, AZ`. Show the requests fan out — `/api/weather/current`, then `/api/youtube?location=Phoenix, AZ, US`.

**Narration.**
> What you just saw — single user action, two backend calls, both proxied through my Express server. That's intentional. Every third-party API call goes through the backend. Keys stay server-side, responses get normalised, and if I want to swap OpenWeatherMap for AccuWeather tomorrow the frontend doesn't change. That's documented in the PRD section 8.

---

## Scene 2 — Priya the travel consultant (4:30 – 5:45)

> CRUD + exports. Faster pace; the engineering depth is in *what* she can do, not *how* it looks.

**On screen.** Cut directly to the saved-records section. Three trips already in there.

**Narration.**
> Persona two — Priya. She's an independent travel consultant building bespoke client itineraries. Her workflow has nothing to do with Marcus's. She doesn't need outdoor outlook badges or YouTube panels — she needs to save trips and export them in formats her clients actually open.

**On screen.** Click Edit on the Lisbon record. Change the date-to. Save.

**Narration.**
> Full CRUD on saved records. Each save snapshots the current weather payload as JSON in the same row, so the saved trip stays meaningful even if upstream APIs change. That's a data-modeling choice — the backend engineer is the curator of the data, not just a passthrough.

**On screen.** Click the export buttons in sequence. Click PDF — let it download. Briefly open it to show the formatted output. Then click CSV; show the raw CSV in a quick preview.

**Narration.**
> Five export formats — JSON, CSV, PDF, XML, Markdown — because Priya's clients are not all the same. Spreadsheet clients want CSV. Casual clients want PDF. The data-nerd clients want JSON. One backend endpoint, format selected via query parameter, the right Content-Type and Content-Disposition for each so the browser handles it cleanly. RESTful by design.

**On screen.** Toggle °F to °C. Show the temperatures flip across the page.

**Narration.**
> And because half of Priya's clients are international — °F to °C toggle, persists across reloads. User story US-06.

---

## Scene 3 — Sam the field dispatcher (5:45 – 6:45)

> Mobile, fast, glanceable. Let the speed do the work — keep narration short.

**On screen.** Resize the browser to mobile width (375px). Refresh the page so the recents row is empty. Tap "Use My Location."

**Narration.**
> Persona three — Sam. Field-services dispatcher, mobile, gloves on, bad signal. Sam has one question all day: what's the weather doing where my people are. This is her in two seconds.

**On screen.** Geolocation completes; the page updates. The background gradient shifts to match the conditions.

**Narration.**
> One tap, geolocation submits, conditions render. The gradient changes — Sam can read the weather mood without reading the words. That's user story US-08, glanceable theming.

**On screen.** Type `Bake` — autocomplete dropdown appears with `Bakersfield, CA`. Tap it. Then go back. Show the *recent searches* chip row now has both her current location and Bakersfield.

**Narration.**
> Last thing for Sam — recent searches. User story US-18, the only net-new feature in this iteration. Sam re-checks the same handful of locations all day. Now they're one tap each, persisted across reloads in localStorage. No retyping with gloves on.

---

## Scene 4 — Outro: the engineering process (6:45 – 7:30)

**On screen.** Cut to a split screen or a clean "credits" frame: USER_STORIES.md on the left, PRD.md on the right.

**Narration.**
> So that's the product — but the process is the part I want to leave you with. Three personas. Nineteen user stories with acceptance criteria. A PRD that ties every feature back to a story and every story back to a persona. The OpenWeatherMap geocoding decision came from a story. The Leaflet swap came from a story. The outdoor outlook badge came from a story. Even the recent-searches chip row — which I added late in this iteration — came from a story. Engineering, to me, is applied science using established patterns to make life easier. That's what I tried to build.
>
> Code's on GitHub at github.com slash Arinzayyy slash Weather-App. README links to USER_STORIES.md and PRD.md. Thanks for watching.

**On screen.** Cut to GitHub URL frame. Hold for 2 seconds.

---

## Engineering-process callouts to keep in mind

If a section runs long and something has to get trimmed, **never trim these** — they're the differentiators:

1. *Personas drove the user stories drove the PRD drove the build.*
2. *Backend proxies every third-party call.* Key safety + provider portability.
3. *Geocoding-first weather lookups.* Eliminates the "Hayward, CA" 404 bug.
4. *Snapshot at save time.* Saved trips don't depend on a future API call.
5. *Outdoor-outlook is interpretation, not just data.* Engineering as consulting.
6. *State-in-resolved-name is the cheap disambiguation.* Modal-free.
7. *RESTful by design.* Resources are nouns, verbs come from HTTP methods.

---

## Things to NOT show

- The deprecated `LocationPicker.js` stub (deleted from the demo build).
- DevTools console with React dev warnings (Next.js 16 has a few harmless ones).
- The `.env` file with real keys.
- The SQLite file path on disk.

---

## After recording

Upload the video, link it from the GitHub repo (or attach to the Google Form submission), and verify the link is publicly viewable before submitting.
