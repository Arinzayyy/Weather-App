export default function UnitToggle({ unit, onChange }) {
  const baseBtn = 'px-3 py-1 text-sm rounded-lg transition font-medium';
  const active  = 'bg-white/30 text-white shadow';
  const idle    = 'text-white/60 hover:text-white';

  return (
    <div
      role="group"
      aria-label="Temperature unit"
      className="inline-flex items-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1 gap-0.5"
    >
      <button type="button" aria-pressed={unit === 'F'} onClick={() => onChange('F')} className={baseBtn + ' ' + (unit === 'F' ? active : idle)}>
        °F
      </button>
      <button type="button" aria-pressed={unit === 'C'} onClick={() => onChange('C')} className={baseBtn + ' ' + (unit === 'C' ? active : idle)}>
        °C
      </button>
    </div>
  );
}
