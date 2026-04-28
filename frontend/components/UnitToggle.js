// Simple segmented control for Fahrenheit / Celsius.
// Guide calls out that some users think in F, others in C — a toggle is cheaper
// than hardcoding one and storing the preference in localStorage (done by parent).
export default function UnitToggle({ unit, onChange }) {
  const baseBtn = 'px-3 py-1 text-sm rounded-md transition';
  const active = 'bg-white shadow font-semibold text-slate-900';
  const idle = 'text-slate-600 hover:text-slate-900';

  return (
    <div
      role="group"
      aria-label="Temperature unit"
      className="inline-flex items-center rounded-lg bg-slate-200 p-1"
    >
      <button
        type="button"
        aria-pressed={unit === 'F'}
        onClick={() => onChange('F')}
        className={baseBtn + ' ' + (unit === 'F' ? active : idle)}
      >°F</button>
      <button
        type="button"
        aria-pressed={unit === 'C'}
        onClick={() => onChange('C')}
        className={baseBtn + ' ' + (unit === 'C' ? active : idle)}
      >°C</button>
    </div>
  );
}
