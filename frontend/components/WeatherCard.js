import OutdoorOutlook from './OutdoorOutlook';

function fToC(f) { return (f - 32) * 5 / 9; }
function round(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return Math.round(n);
}

export default function WeatherCard({ data, unit }) {
  if (!data || !data.current) return null;

  const { current, location } = data;
  const tempF    = current.main && current.main.temp;
  const feelsF   = current.main && current.main.feels_like;
  const humidity = current.main && current.main.humidity;
  const windMph  = current.wind && current.wind.speed;
  const weather  = (current.weather && current.weather[0]) || {};
  const iconUrl  = weather.icon
    ? 'https://openweathermap.org/img/wn/' + weather.icon + '@4x.png'
    : null;
  const weatherId = typeof weather.id === 'number' ? weather.id : null;

  const resolvedName = (location && location.resolvedName) || current.name || '';
  const state        = (location && location.state) || '';
  const country      = (location && location.country) || (current.sys && current.sys.country) || '';
  const place = [resolvedName, state, country].filter(Boolean).join(', ');

  const primaryTemp  = unit === 'F' ? tempF : fToC(tempF);
  const secondaryTemp = unit === 'F' ? fToC(tempF) : tempF;
  const secondaryUnit = unit === 'F' ? '°C' : '°F';
  const primaryFeels = unit === 'F' ? feelsF : fToC(feelsF);

  return (
    <div className="glass w-full rounded-2xl p-4 sm:p-6">
      {/* Location + icon row */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
            {place || 'Unknown location'}
          </h2>
          <p className="text-white/70 capitalize text-sm mt-0.5">
            {weather.description || weather.main || '—'}
          </p>
        </div>
        {iconUrl && (
          <div className="shrink-0 drop-shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconUrl}
              alt={weather.description || 'Weather icon'}
              width={100}
              height={100}
              style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.4))' }}
            />
          </div>
        )}
      </div>

      {/* Temperature */}
      <div className="flex items-baseline gap-3 mt-4 flex-wrap">
        <span className="text-5xl sm:text-7xl font-bold text-white leading-none">
          {round(primaryTemp)}°{unit}
        </span>
        <span className="text-white/50 text-lg sm:text-xl">
          {round(secondaryTemp)}{secondaryUnit}
        </span>
      </div>

      {/* Outdoor outlook (US-19) — interprets the data into a recommendation
          for Marcus the event planner. */}
      <div className="mt-3">
        <OutdoorOutlook
          weatherId={weatherId}
          tempF={tempF}
          windMph={windMph}
          humidity={humidity}
          description={weather.description || weather.main}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/20 text-sm">
        <div className="flex flex-col gap-1">
          <p className="text-white/50 text-xs uppercase tracking-wide">Feels like</p>
          <p className="font-semibold text-white text-base">
            {round(primaryFeels)}°{unit}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-white/50 text-xs uppercase tracking-wide">Humidity</p>
          <p className="font-semibold text-white text-base">{round(humidity)}%</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-white/50 text-xs uppercase tracking-wide">Wind</p>
          <p className="font-semibold text-white text-base">{round(windMph)} mph</p>
        </div>
      </div>
    </div>
  );
}
