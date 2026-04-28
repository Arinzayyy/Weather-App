// Disambiguation picker. Rendered when /api/weather/geocode returns 2+ matches
// for the user's free-text query (e.g. "Springfield" → IL, MA, MO, OR, ...).
// User clicks one, parent calls /api/weather/current with its lat,lon for an
// unambiguous lookup.

function describe(m) {
  const parts = [m.name];
  if (m.state) parts.push(m.state);
  if (m.country) parts.push(m.country);
  return parts.join(', ');
}

export default function LocationPicker({ query, matches, onPick, onCancel, isLoading }) {
  if (!matches || matches.length === 0) return null;

  return (
    <section
      className="w-full max-w-xl bg-white rounded-2xl shadow p-5 space-y-3"
      aria-label="Multiple locations match your search"
      role="dialog"
      aria-modal="false"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-700">
            Multiple locations match "{query}"
          </h3>
          <p className="text-xs text-slate-500">
            Pick the one you meant — or refine your search with a state / country.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="text-xs text-slate-500 hover:text-slate-700 underline"
        >
          Cancel
        </button>
      </header>

      <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
        {matches.map((m, i) => (
          <li key={m.lat + ',' + m.lon + ':' + i}>
            <button
              type="button"
              onClick={() => onPick(m)}
              disabled={isLoading}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none disabled:opacity-50 flex items-center justify-between gap-3"
            >
              <span className="font-medium text-slate-800 truncate">{describe(m)}</span>
              <span className="text-xs text-slate-400 shrink-0">
                {m.lat.toFixed(2)}, {m.lon.toFixed(2)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
