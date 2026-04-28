// Renders the current-weather snapshot returned by /api/weather/current.
// Shows temperature in BOTH F and C per the guide's Section 1.2 requirements,
// with the primary unit controlled by the parent's UnitToggle.

function fToC(f) { return (f - 32) * 5 / 9; }

function round(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return Math.round(n);
}

export default function WeatherCard({ data, unit }) {
  if (!data || !data.current) return null;

  const { current, location } = data;
  const tempF   = current.main && current.main.temp;
  const feelsF  = current.main && current.main.feels_like;
  const humidity = current.main && current.main.humidity;
  const windMph  = current.wind && current.wind.speed;
  const weather = (current.weather && current.weather[0]) || {};
  const iconUrl = weather.icon ? 'https://openweathermap.org/img/wn/' + weather.icon + '@2x.png' : null;
  const resolvedName = (location && location.resolvedName) || current.name || '';
  const state        = (location && location.state) || '';
  const country      = (location && location.country) || (current.sys && current.sys.country) || '';
  // "Springfield, IL, US" — falls back gracefully if state or country missing.
  const place = [resolvedName, state, country].filter(Boolean).join(', ');

  const primaryTempF  = unit === 'F' ? tempF : null;
  const primaryTempC  = unit === 'C' ? fToC(tempF) : null;
  const primaryFeelsF = unit === 'F' ? feelsF : null;
  const primaryFeelsC = unit === 'C' ? fToC(feelsF) : null;

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{place || 'Unknown location'}</h2>
          <p className="text-slate-500 capitalize">{weather.description || weather.main || '—'}</p>
        </div>
        {iconUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={iconUrl} alt={weather.description || 'Weather icon'} width={96} height={96} />
        )}
      </div>

      <div className="flex items-baseline gap-3 flex-wrap">
        {unit === 'F' ? (
          <>
            <span className="text-6xl font-bold">{round(primaryTempF)}°F</span>
            <span className="text-slate-500 text-lg">/ {round(fToC(tempF))}°C</span>
          </>
        ) : (
          <>
            <span className="text-6xl font-bold">{round(primaryTempC)}°C</span>
            <span className="text-slate-500 text-lg">/ {round(tempF)}°F</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm border-t border-slate-100 pt-4">
        <div>
          <p className="text-slate-500">Feels like</p>
          <p className="font-semibold">
            {unit === 'F'
              ? round(primaryFeelsF) + '°F'
              : round(primaryFeelsC) + '°C'}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Humidity</p>
          <p className="font-semibold">{round(humidity)}%</p>
        </div>
        <div>
          <p className="text-slate-500">Wind</p>
          <p className="font-semibold">{round(windMph)} mph</p>
        </div>
      </div>
    </div>
  );
}
