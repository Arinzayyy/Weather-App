import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center h-[280px] text-sm text-white/50"
      aria-live="polite"
    >
      Loading map…
    </div>
  ),
});

export default function MapEmbed({ data }) {
  const loc     = data && data.location;
  const current = data && data.current;
  const lat = (loc && loc.lat) ?? (current && current.coord && current.coord.lat);
  const lon = (loc && loc.lon) ?? (current && current.coord && current.coord.lon);
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;

  return (
    <section className="w-full max-w-xl" aria-label="Map of searched location">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 px-1">
        Map
      </h3>
      <div className="glass rounded-2xl overflow-hidden h-[200px] sm:h-[280px]">
        <LeafletMap data={data} />
      </div>
    </section>
  );
}
