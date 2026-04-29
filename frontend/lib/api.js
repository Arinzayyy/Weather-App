// Thin wrapper around `fetch` so components don't repeat URL + error logic.
// All calls go to our Express backend, not directly to OpenWeatherMap.

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch (networkErr) {
    // fetch itself failed (DNS, CORS, backend down, etc.)
    throw new Error('Unable to fetch weather data. Please check your connection.');
  }

  let body = null;
  try { body = await res.json(); } catch (_) { /* non-JSON response */ }

  if (!res.ok) {
    const message = (body && body.error) || 'Request failed with status ' + res.status;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return body;
}

// Autocomplete suggestions for the search bar dropdown (partial queries OK).
// Returns [] instead of throwing when nothing matches.
export async function fetchAutocomplete(q) {
  const body = await request('/api/weather/autocomplete?q=' + encodeURIComponent(q));
  return (body && body.suggestions) || [];
}

// Resolve a free-text query to up to 5 candidate matches. Frontend uses this
// to render a disambiguation picker when the input is ambiguous.
export async function geocodeLocation(location) {
  const body = await request('/api/weather/geocode?location=' + encodeURIComponent(location));
  return (body && body.matches) || [];
}

// Lookup current weather + 5-day forecast snapshot (does NOT save anything).
export function fetchCurrentWeather(location) {
  return request('/api/weather/current?location=' + encodeURIComponent(location));
}

// Save a record with location + date range.
export function saveRecord({ location, dateFrom, dateTo }) {
  return request('/api/weather', {
    method: 'POST',
    body: JSON.stringify({ location, dateFrom, dateTo }),
  });
}

// YouTube videos for a location.
export function fetchYouTubeVideos(location) {
  return request('/api/youtube?location=' + encodeURIComponent(location));
}

// CRUD on saved records.
export function listRecords()        { return request('/api/weather'); }
export function getRecord(id)        { return request('/api/weather/' + id); }
export function updateRecord(id, p)  { return request('/api/weather/' + id, { method: 'PUT', body: JSON.stringify(p) }); }
export function deleteRecord(id)     { return request('/api/weather/' + id, { method: 'DELETE' }); }
