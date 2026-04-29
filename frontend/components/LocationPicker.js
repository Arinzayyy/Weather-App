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
      className="glass w-full max-w-xl rounded-2xl p-5 space-y-3"
      aria-label="Multiple locations match your search"
      role="dialog"
      aria-modal="false"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">
            Multiple matches for "{query}"
          </h3>
          <p className="text-xs text-white/60 mt-0.5">
            Pick the one you meant, or refine your search.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="text-xs text-white/50 hover:text-white underline transition-colors shrink-0"
        >
          Cancel
        </button>
      </header>

      <ul className="divide-y divide-white/10 border border-white/20 rounded-xl overflow-hidden">
        {matches.map((m, i) => (
          <li key={m.lat + ',' + m.lon + ':' + i}>
            <button
              type="button"
              onClick={() => onPick(m)}
              disabled={isLoading}
              className="w-full text-left px-4 py-3 hover:bg-white/10 focus:bg-white/10 focus:outline-none disabled:opacity-50 flex items-center justify-between gap-3 transition-colors"
            >
              <span className="font-medium text-white truncate">{describe(m)}</span>
              <span className="text-xs text-white/40 shrink-0">
                {m.lat.toFixed(2)}, {m.lon.toFixed(2)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
