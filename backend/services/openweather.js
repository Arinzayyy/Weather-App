// Thin wrapper around the OpenWeatherMap API.
// Centralizing this means routes don't care about URL shapes or query params —
// they just call these functions and get back either data or a thrown error.
//
// Strategy: every user-facing query is first resolved to lat/lon via OWM's
// Geocoding API (/geo/1.0/direct or /geo/1.0/zip), then the actual weather
// + forecast endpoints are called with coordinates. This avoids the well-known
// quirks of /data/2.5/weather's free-text parser (which 404s on common cases
// like "Hayward, CA" because it tries to interpret "CA" as country Canada).
const axios = require('axios');

const OWM_BASE = 'https://api.openweathermap.org';

function apiKey() {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    const err = new Error('OPENWEATHER_API_KEY is not set in .env');
    err.statusCode = 500;
    throw err;
  }
  return key;
}

// Detects whether a user-typed location is "lat,lon" (e.g. "37.7749, -122.4194").
// If so, returns { lat, lon }. Otherwise returns null.
function parseCoords(input) {
  const match = String(input).trim().match(
    /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/
  );
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[3]);
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

// Set of valid US state / DC two-letter postal codes. Used to detect when
// a "City, XX" query likely needs a ",US" country suffix appended for OWM.
const US_STATE_CODES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]);

// "Hayward, CA" -> "Hayward,CA,US"
// "Paris, FR"   -> "Paris, FR" (FR is not a US state code, leave alone)
// "Tokyo"       -> "Tokyo"
// Edge case: "Toronto, CA" gets treated as CA = California (US). Acceptable —
// users searching for Toronto, Canada can type "Toronto, Canada" instead.
function normalizeQuery(input) {
  const trimmed = String(input).trim();
  const match = trimmed.match(/^(.+?),\s*([A-Za-z]{2})\s*$/);
  if (match && US_STATE_CODES.has(match[2].toUpperCase())) {
    return match[1].trim() + ',' + match[2].toUpperCase() + ',US';
  }
  return trimmed;
}

// Wrap axios errors into something routes can return cleanly.
function wrapError(err, fallback = 'Weather service request failed') {
  if (err.response) {
    const status = err.response.status;
    if (status === 401) {
      const e = new Error('Invalid OpenWeatherMap API key (check .env, activation can take up to 2 hours)');
      e.statusCode = 500;
      return e;
    }
    if (status === 404) {
      const e = new Error('Location not found. Please check your input and try again.');
      e.statusCode = 404;
      return e;
    }
    const e = new Error(err.response.data?.message || fallback);
    e.statusCode = status >= 500 ? 502 : status;
    return e;
  }
  const e = new Error(fallback);
  e.statusCode = 502;
  return e;
}

// Resolve any user input to an array of up to `limit` candidate matches.
// Coords and zip codes are unambiguous and always return exactly one match.
// Free-text place names ("Springfield", "Portland") may return multiple so
// the frontend can render a disambiguation picker. Always returns an array;
// throws on 404 (no matches at all) or transport errors.
async function geocodeMany(location, limit = 5) {
  // 1) Already coords?
  const coords = parseCoords(location);
  if (coords) {
    return [{ lat: coords.lat, lon: coords.lon, source: 'coords' }];
  }

  const trimmed = String(location).trim();

  // 2) Looks like a zip code? (4-10 digits, optional ",CC" country)
  const zipMatch = trimmed.match(/^(\d{4,10})(?:,\s*([A-Za-z]{2}))?$/);
  if (zipMatch) {
    try {
      const country = zipMatch[2] ? zipMatch[2].toUpperCase() : 'US';
      const { data } = await axios.get(OWM_BASE + '/geo/1.0/zip', {
        params: { zip: zipMatch[1] + ',' + country, appid: apiKey() },
        timeout: 8000,
      });
      return [{
        lat: data.lat, lon: data.lon, source: 'zip',
        name: data.name, country: data.country,
      }];
    } catch (err) {
      throw wrapError(err, 'Unable to resolve zip code');
    }
  }

  // 3) Free-text place name. Normalize "City, ST" → "City,ST,US" first.
  const normalized = normalizeQuery(trimmed);
  try {
    const { data } = await axios.get(OWM_BASE + '/geo/1.0/direct', {
      params: { q: normalized, limit, appid: apiKey() },
      timeout: 8000,
    });
    if (!Array.isArray(data) || data.length === 0) {
      const e = new Error('Location not found. Please check your input and try again.');
      e.statusCode = 404;
      throw e;
    }
    return data.map((hit) => ({
      lat: hit.lat, lon: hit.lon, source: 'direct',
      name: hit.name, country: hit.country, state: hit.state,
    }));
  } catch (err) {
    if (err.statusCode) throw err; // re-throw our own 404
    throw wrapError(err, 'Unable to resolve location');
  }
}

// Single-match geocode — used internally when we already have unambiguous
// input (coords from a picker, raw lat/lon, etc.) or as a fallback.
async function geocode(location) {
  const matches = await geocodeMany(location, 1);
  return matches[0];
}

// Accepts either a string (geocodes it) or an already-resolved {lat,lon}.
// Lets getWeatherSnapshot geocode once and pass coords to both downstream calls.
async function ensureCoords(input) {
  if (input && typeof input === 'object' && typeof input.lat === 'number' && typeof input.lon === 'number') {
    return input;
  }
  return geocode(input);
}

// GET /data/2.5/weather — current weather, called with resolved coords.
async function getCurrentWeather(location) {
  const geo = await ensureCoords(location);
  try {
    const { data } = await axios.get(OWM_BASE + '/data/2.5/weather', {
      params: {
        lat: geo.lat,
        lon: geo.lon,
        appid: apiKey(),
        units: 'imperial', // we return Fahrenheit primary; FE converts to C
      },
      timeout: 8000,
    });
    return data;
  } catch (err) {
    throw wrapError(err, 'Unable to fetch current weather');
  }
}

// GET /data/2.5/forecast — 3-hour intervals over 5 days, called with resolved coords.
async function getForecast(location) {
  const geo = await ensureCoords(location);
  try {
    const { data } = await axios.get(OWM_BASE + '/data/2.5/forecast', {
      params: {
        lat: geo.lat,
        lon: geo.lon,
        appid: apiKey(),
        units: 'imperial',
      },
      timeout: 8000,
    });
    return data;
  } catch (err) {
    throw wrapError(err, 'Unable to fetch forecast');
  }
}

// Combined "snapshot" we persist in the DB's temperature_data column.
// Stored as JSON so we can show everything we had at save-time later,
// even if OWM's response shape changes.
async function getWeatherSnapshot(location) {
  // Geocode ONCE, then reuse the coords for both downstream calls.
  const geo = await geocode(location);
  const [current, forecast] = await Promise.all([
    getCurrentWeather(geo),
    getForecast(geo),
  ]);
  return {
    fetchedAt: new Date().toISOString(),
    location: {
      // Prefer the geocoder's resolved name (it knows state too) over /weather's
      // bare city name. Falls back to /weather if geocoding came from coords input.
      resolvedName: geo.name || current.name,
      country: geo.country || current.sys?.country,
      state: geo.state,
      lat: current.coord?.lat ?? geo.lat,
      lon: current.coord?.lon ?? geo.lon,
      timezoneOffsetSeconds: current.timezone,
    },
    current,
    forecast,
  };
}

module.exports = {
  parseCoords,
  normalizeQuery,
  geocode,
  geocodeMany,
  getCurrentWeather,
  getForecast,
  getWeatherSnapshot,
};
