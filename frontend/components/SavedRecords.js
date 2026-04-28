// Renders the list of saved records with per-row Edit / Delete, plus a
// toolbar of export buttons (JSON / CSV / PDF / XML / Markdown).

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const FORMATS = [
  { key: 'json', label: 'JSON' },
  { key: 'csv',  label: 'CSV'  },
  { key: 'pdf',  label: 'PDF'  },
  { key: 'xml',  label: 'XML'  },
  { key: 'md',   label: 'Markdown' },
];

function exportUrl(format) {
  return BASE + '/api/weather/export?format=' + encodeURIComponent(format);
}

export default function SavedRecords({ records, onEdit, onDelete, isBusy }) {
  return (
    <section className="w-full max-w-xl space-y-3" aria-label="Saved records">
      <header className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-700">
          Saved records ({records.length})
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Export:</span>
          {FORMATS.map((f) => (
            <a
              key={f.key}
              href={exportUrl(f.key)}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              {f.label}
            </a>
          ))}
        </div>
      </header>

      {records.length === 0 && (
        <p className="text-sm text-slate-500 italic">
          No saved records yet. Search for a location and save it with a date range.
        </p>
      )}

      <ul className="space-y-2">
        {records.map((r) => {
          const td = r.temperatureData || {};
          const loc = td.location || {};
          const current = td.current || {};
          const main = current.main || {};
          const place = loc.resolvedName
            ? [loc.resolvedName, loc.state, loc.country].filter(Boolean).join(', ')
            : r.location;
          const temp = main.temp == null ? '—' : Math.round(main.temp) + '°F';
          return (
            <li
              key={r.id}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">#{r.id} · {place}</p>
                <p className="text-xs text-slate-500">
                  {r.dateFrom} → {r.dateTo} · {temp} at save
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(r)}
                  disabled={isBusy}
                  className="px-3 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  disabled={isBusy}
                  className="px-3 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
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
