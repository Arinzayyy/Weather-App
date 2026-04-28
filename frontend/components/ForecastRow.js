// Renders the 5-day forecast as a horizontal card row (stacks on mobile).
// OWM's /forecast returns 3-hour intervals, so we group them by LOCAL day
// (using the location's timezone offset, not the browser's) and summarize each day.

function fToC(f) { return (f - 32) * 5 / 9; }
function round(n) { return n == null || Number.isNaN(n) ? '—' : Math.round(n); }

// Convert a UTC unix seconds timestamp into a YYYY-MM-DD string in the
// LOCATION's local time. Guide's "timezone awareness" callout: weather times
// should reflect the searched city, not the user's browser.
function localDateKey(unixSeconds, tzOffsetSeconds) {
  const ms = (unixSeconds + (tzOffsetSeconds || 0)) * 1000;
  // getUTC* methods on a Date built from shifted ms give us the local date cleanly.
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function localWeekday(unixSeconds, tzOffsetSeconds) {
  const ms = (unixSeconds + (tzOffsetSeconds || 0)) * 1000;
  // Use UTC getters on pre-shifted time so we get the LOCATION's day name.
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(ms).getUTCDay()];
}

// Pick a representative hour (noon-ish) for icon/description; fall back to the
// middle entry in the day's list.
function pickRepresentative(entries, tzOffsetSeconds) {
  let best = entries[0];
  let bestDelta = Infinity;
  for (const e of entries) {
    const ms = (e.dt + (tzOffsetSeconds || 0)) * 1000;
    const hour = new Date(ms).getUTCHours();
    const delta = Math.abs(hour - 12);
    if (delta < bestDelta) {
      best = e;
      bestDelta = delta;
    }
  }
  return best;
}

function summarizeByDay(forecast) {
  if (!forecast || !Array.isArray(forecast.list)) return [];
  const tz = (forecast.city && forecast.city.timezone) || 0;
  const groups = new Map(); // key: YYYY-MM-DD -> array of entries

  for (const entry of forecast.list) {
    const key = localDateKey(entry.dt, tz);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }

  const days = [];
  for (const [key, entries] of groups) {
    let min = Infinity, max = -Infinity;
    for (const e of entries) {
      const t = e.main && e.main.temp;
      if (typeof t === 'number') {
        if (t < min) min = t;
        if (t > max) max = t;
      }
    }
    const rep = pickRepresentative(entries, tz);
    days.push({
      key,
      weekday: localWeekday(entries[0].dt, tz),
      minF: Number.isFinite(min) ? min : null,
      maxF: Number.isFinite(max) ? max : null,
      icon: rep.weather && rep.weather[0] && rep.weather[0].icon,
      description: rep.weather && rep.weather[0] && rep.weather[0].description,
      condition: rep.weather && rep.weather[0] && rep.weather[0].main,
    });
  }
  // OWM can return up to 6 partial days (5 full + a sliver of today);
  // we cap at 5 to match the assessment's "5-day" wording.
  return days.slice(0, 5);
}

export default function ForecastRow({ data, unit }) {
  const forecast = data && data.forecast;
  const days = summarizeByDay(forecast);
  if (days.length === 0) return null;

  const toUnit = (tempF) => {
    if (tempF == null) return '—';
    const n = unit === 'C' ? fToC(tempF) : tempF;
    return round(n) + '°';
  };

  return (
    <section className="w-full max-w-xl" aria-label="5-day forecast">
      <h3 className="text-sm font-semibold text-slate-600 mb-3">5-day forecast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {days.map((d) => {
          const iconUrl = d.icon ? 'https://openweathermap.org/img/wn/' + d.icon + '.png' : null;
          return (
            <div
              key={d.key}
              className="bg-white rounded-xl shadow-sm p-3 flex flex-col items-center text-center"
              title={d.description || ''}
            >
              <p className="text-sm font-semibold text-slate-700">{d.weekday}</p>
              {iconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconUrl} alt={d.description || d.condition || ''} width={48} height={48} />
              )}
              <p className="text-xs capitalize text-slate-500 leading-tight min-h-[2rem]">
                {d.description || d.condition || '—'}
              </p>
              <p className="text-sm mt-1">
                <span className="font-semibold">{toUnit(d.maxF)}</span>
                <span className="text-slate-400"> / {toUnit(d.minF)}</span>
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
