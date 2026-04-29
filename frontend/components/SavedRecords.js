const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const FORMATS = [
  { key: 'json', label: 'JSON' },
  { key: 'csv',  label: 'CSV'  },
  { key: 'pdf',  label: 'PDF'  },
  { key: 'xml',  label: 'XML'  },
  { key: 'md',   label: 'MD'   },
];

function exportUrl(format) {
  return BASE + '/api/weather/export?format=' + encodeURIComponent(format);
}

export default function SavedRecords({ records, onEdit, onDelete, isBusy }) {
  if (records.length === 0) return null;

  return (
    <section className="w-full max-w-xl space-y-3" aria-label="Saved records">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">
          Saved records ({records.length})
        </h3>
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-0.5 sm:pb-0">
          <span className="text-white/40">Export:</span>
          {FORMATS.map((f) => (
            <a
              key={f.key}
              href={exportUrl(f.key)}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white/70 hover:text-white border border-white/20 font-medium transition-colors"
            >
              {f.label}
            </a>
          ))}
        </div>
      </header>

      <ul className="space-y-2">
        {records.map((r) => {
          const td      = r.temperatureData || {};
          const loc     = td.location || {};
          const current = td.current || {};
          const main    = current.main || {};
          const weather = (current.weather && current.weather[0]) || {};
          const iconUrl = weather.icon
            ? 'https://openweathermap.org/img/wn/' + weather.icon + '.png'
            : null;
          const place = loc.resolvedName
            ? [loc.resolvedName, loc.state, loc.country].filter(Boolean).join(', ')
            : r.location;
          const temp = main.temp == null ? '—' : Math.round(main.temp) + '°F';

          return (
            <li
              key={r.id}
              className="glass rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {iconUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconUrl} alt={weather.description || ''} width={36} height={36} className="shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate text-sm">{place}</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    {r.dateFrom} → {r.dateTo} · {temp}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit(r)}
                  disabled={isBusy}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-400/20 text-amber-200 border border-amber-400/30 hover:bg-amber-400/30 disabled:opacity-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  disabled={isBusy}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-400/20 text-red-200 border border-red-400/30 hover:bg-red-400/30 disabled:opacity-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
