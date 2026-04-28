// Input validation helpers for the CRUD routes.
// Each validator returns { ok: true, value } or { ok: false, error }.

// Accept ISO date strings (YYYY-MM-DD) or full datetimes.
// We store as YYYY-MM-DD in the DB for simplicity.
function parseDate(input, fieldName) {
  if (!input || typeof input !== 'string') {
    return { ok: false, error: `${fieldName} is required (expected YYYY-MM-DD)` };
  }
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    return { ok: false, error: `${fieldName} is not a valid date` };
  }
  // normalize to YYYY-MM-DD in UTC
  const iso = d.toISOString().slice(0, 10);
  return { ok: true, value: iso };
}

function daysFromToday(isoDate) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const then = new Date(isoDate);
  return Math.round((then - today) / (1000 * 60 * 60 * 24));
}

// OpenWeatherMap free tier covers ~5 days of forecast and does not include
// historical data. We enforce that here so users get a clean error message
// instead of a silent empty forecast.
const MAX_FORECAST_DAYS = 5;

function validateCreateOrUpdate(body, { partial = false } = {}) {
  const errors = [];
  const out = {};

  if (!partial || body.location !== undefined) {
    if (typeof body.location !== 'string' || body.location.trim().length === 0) {
      errors.push('location is required');
    } else {
      out.location = body.location.trim();
    }
  }

  let from = null;
  let to = null;

  if (!partial || body.dateFrom !== undefined) {
    const r = parseDate(body.dateFrom, 'dateFrom');
    if (!r.ok) errors.push(r.error);
    else { out.dateFrom = r.value; from = r.value; }
  }

  if (!partial || body.dateTo !== undefined) {
    const r = parseDate(body.dateTo, 'dateTo');
    if (!r.ok) errors.push(r.error);
    else { out.dateTo = r.value; to = r.value; }
  }

  if (from && to && from > to) {
    errors.push('dateFrom must be on or before dateTo');
  }

  // Historical data isn't available on the free OWM tier.
  if (from && daysFromToday(from) < 0) {
    errors.push('dateFrom cannot be in the past (historical data requires a paid OpenWeatherMap plan)');
  }
  if (to && daysFromToday(to) > MAX_FORECAST_DAYS) {
    errors.push(`dateTo cannot be more than ${MAX_FORECAST_DAYS} days in the future (OpenWeatherMap free tier limit)`);
  }

  if (errors.length > 0) {
    const e = new Error(errors.join('; '));
    e.statusCode = 400;
    throw e;
  }

  return out;
}

module.exports = { validateCreateOrUpdate, parseDate, daysFromToday };
