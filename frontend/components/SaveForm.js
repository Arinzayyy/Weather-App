import { useEffect, useState } from 'react';

// Dual-purpose form: CREATE a new saved record, OR UPDATE an existing one.
// Parent passes `initial` when editing (location/dates pre-filled) and `editingId`.
// Dates default to today + today+3 for convenience.
function todayIso() { return new Date().toISOString().slice(0, 10); }
function isoPlusDays(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function SaveForm({
  initial,        // { location, dateFrom, dateTo } | null
  editingId,      // number | null
  isBusy,
  onSubmit,
  onCancel,
}) {
  const [location, setLocation] = useState('');
  const [dateFrom, setDateFrom] = useState(todayIso());
  const [dateTo, setDateTo]     = useState(isoPlusDays(3));
  const [formError, setFormError] = useState('');

  // Sync with parent when editing a different record or when initial changes.
  useEffect(() => {
    if (initial) {
      setLocation(initial.location || '');
      setDateFrom(initial.dateFrom || todayIso());
      setDateTo(initial.dateTo || isoPlusDays(3));
      setFormError('');
    }
  }, [initial, editingId]);

  function handleSubmit(e) {
    e.preventDefault();
    const loc = location.trim();
    if (!loc) { setFormError('Location is required'); return; }
    if (!dateFrom || !dateTo) { setFormError('Both dates are required'); return; }
    if (dateFrom > dateTo) { setFormError('dateFrom must be on or before dateTo'); return; }
    setFormError('');
    onSubmit({ location: loc, dateFrom, dateTo });
  }

  return (
    <section
      className="w-full max-w-xl bg-white rounded-2xl shadow p-5 space-y-3"
      aria-label={editingId ? 'Edit saved record' : 'Save this search'}
    >
      <h3 className="text-sm font-semibold text-slate-700">
        {editingId ? 'Edit record #' + editingId : 'Save this search'}
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Location
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Oakland, CA"
            disabled={isBusy}
            className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 flex flex-col gap-1 text-sm">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              disabled={isBusy}
              className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex-1 flex flex-col gap-1 text-sm">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              disabled={isBusy}
              className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
        {formError && <p className="text-sm text-red-600" role="alert">{formError}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isBusy}
            className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            {isBusy ? 'Saving…' : editingId ? 'Update' : 'Save record'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isBusy}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
