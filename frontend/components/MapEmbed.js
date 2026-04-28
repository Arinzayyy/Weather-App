// Map section. We render a real Leaflet map (OpenStreetMap tiles, no API
// key required), but Leaflet touches `window` on import, so we lazy-load
// the actual map component with next/dynamic and ssr:false.
//
// The wrapping <section> + heading + rounded card stay here so SSR still
// produces stable layout markup; only the map canvas itself is client-only.
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center h-[280px] text-sm text-slate-500"
      aria-live="polite"
    >
      Loading map…
    </div>
  ),
});

export default function MapEmbed({ data }) {
  // Bail out cleanly if we don't have coordinates yet.
  const loc = data && data.location;
  const current = data && data.current;
  const lat = (loc && loc.lat) ?? (current && current.coord && current.coord.lat);
  const lon = (loc && loc.lon) ?? (current && current.coord && current.coord.lon);
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;

  return (
    <section className="w-full max-w-xl" aria-label="Map of searched location">
      <h3 className="text-sm font-semibold text-slate-600 mb-3">Map</h3>
      <div className="rounded-xl overflow-hidden shadow-sm bg-white">
        <LeafletMap data={data} />
      </div>
    </section>
  );
}
