// Recent searches chip row.
// Serves user story US-18: Sam (field dispatcher) wants to re-run a recent
// search with one tap instead of retyping on a phone in the field.
//
// State lives in index.js (so the hook can be wired into handleSearch); this
// component is presentational only — it renders chips and emits onSelect.

export default function RecentSearches({ items, onSelect, disabled }) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Recent searches"
    >
      <span className="text-xs uppercase tracking-widest text-white/40 mr-1">
        Recent
      </span>
      {items.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          disabled={disabled}
          className="px-3 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur-md text-white/85 border border-white/20 hover:bg-white/25 hover:text-white disabled:opacity-40 transition-colors"
          title={'Search ' + label + ' again'}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
