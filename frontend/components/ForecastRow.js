function fToC(f) { return (f - 32) * 5 / 9; }
function round(n) { return n == null || Number.isNaN(n) ? '—' : Math.round(n); }

function localDateKey(unixSeconds, tzOffsetSeconds) {
  const ms = (unixSeconds + (tzOffsetSeconds || 0)) * 1000;
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function localWeekday(unixSeconds, tzOffsetSeconds) {
  const ms = (unixSeconds + (tzOffsetSeconds || 0)) * 1000;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(ms).getUTCDay()];
}

function pickRepresentative(entries, tzOffsetSeconds) {
  let best = entries[0];
  let bestDelta = Infinity;
  for (const e of entries) {
    const ms = (e.dt + (tzOffsetSeconds || 0)) * 1000;
    const hour = new Date(ms).getUTCHours();
    const delta = Math.abs(hour - 12);
    if (delta < bestDelta) { best = e; bestDelta = delta; }
  }
  return best;
}

function summarizeByDay(forecast) {
  if (!forecast || !Array.isArray(forecast.list)) return [];
  const tz = (forecast.city && forecast.city.timezone) || 0;
  const groups = new Map();
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
      if (typeof t === 'number') { if (t < min) min = t; if (t > max) max = t; }
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
  return days.slice(0, 5);
}

export default function ForecastRow({ data, unit }) {
  const forecast = data && data.forecast;
  const days = summarizeByDay(forecast);
  if (days.length === 0) return null;

  const toUnit = (tempF) => {
    if (tempF == null) return '—';
    return round(unit === 'C' ? fToC(tempF) : tempF) + '°';
  };

  return (
    <section className="w-full max-w-xl" aria-label="5-day forecast">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 px-1">
        5-day forecast
      </h3>
      {/* Horizontal scroll on mobile, 5-col grid on sm+ */}
      <div className="flex sm:grid sm:grid-cols-5 gap-2 overflow-x-auto pb-1 sm:pb-0 sm:overflow-visible">
        {days.map((d) => {
          const iconUrl = d.icon ? 'https://openweathermap.org/img/wn/' + d.icon + '@2x.png' : null;
          return (
            <div
              key={d.key}
              className="glass rounded-xl p-3 flex flex-col items-center text-center gap-1 shrink-0 w-28 sm:w-auto"
              title={d.description || ''}
            >
              <p className="text-xs font-semibold text-white">{d.weekday}</p>
              {iconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconUrl} alt={d.description || d.condition || ''} width={44} height={44} />
              )}
              <p className="text-xs text-white/60 leading-tight min-h-[2rem] flex items-center justify-center capitalize">
                {d.description || d.condition || '—'}
              </p>
              <div className="text-sm mt-1 leading-tight">
                <span className="font-bold text-white">{toUnit(d.maxF)}</span>
                <span className="text-white/50"> / {toUnit(d.minF)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
