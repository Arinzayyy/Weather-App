import { useEffect, useState } from 'react';

function todayIso() { return new Date().toISOString().slice(0, 10); }
function isoPlusDays(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function SaveForm({ initial, editingId, isBusy, onSubmit, onCancel }) {
  const [location, setLocation] = useState('');
  const [dateFrom, setDateFrom] = useState(todayIso());
  const [dateTo,   setDateTo]   = useState(isoPlusDays(3));
  const [formError, setFormError] = useState('');

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
    if (dateFrom > dateTo) { setFormError('From date must be before To date'); return; }
    setFormError('');
    onSubmit({ location: loc, dateFrom, dateTo });
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/40 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50 text-sm';
  const labelClass = 'flex flex-col gap-1 text-xs font-medium text-white/70 uppercase tracking-wide';

  return (
    <section
      className="glass w-full max-w-xl rounded-2xl p-5 space-y-4"
      aria-label={editingId ? 'Edit saved record' : 'Save this search'}
    >
      <h3 className="text-sm font-semibold text-white">
        {editingId ? '✏️ Edit record #' + editingId : '💾 Save this search'}
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className={labelClass}>
          Location
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Oakland, CA"
            disabled={isBusy}
            className={inputClass}
          />
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className={labelClass + ' flex-1'}>
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              disabled={isBusy}
              className={inputClass}
            />
          </label>
          <label className={labelClass + ' flex-1'}>
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              disabled={isBusy}
              className={inputClass}
            />
          </label>
        </div>
        {formError && (
          <p className="text-sm text-red-300" role="alert">{formError}</p>
        )}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isBusy}
            className="px-5 py-2 rounded-xl bg-emerald-500/70 backdrop-blur-sm text-white font-semibold border border-emerald-400/40 hover:bg-emerald-500/90 disabled:opacity-50 transition-colors text-sm"
          >
            {isBusy ? 'Saving…' : editingId ? 'Update' : 'Save record'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isBusy}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 disabled:opacity-50 transition-colors text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
