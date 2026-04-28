// Real Leaflet map (client-only — never rendered on the server because
// Leaflet expects `window`). MapEmbed.js loads this via next/dynamic with
// ssr:false so Next.js skips it during SSR/SSG.
//
// Why Leaflet over a plain iframe: it integrates as a real React component,
// which lets us drive the map declaratively from props (auto-recenter when
// the search location changes), compose a custom popup, and own the styling.
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// --- Fix Leaflet's default marker icon under bundlers ----------------------
// Leaflet's CSS references icon images via relative paths that webpack/Next
// can't resolve, so by default markers render as broken images. The standard
// workaround is to point the default icon at the unpkg-hosted assets.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Small helper component: re-centers the map when the searched location
// changes. Uses react-leaflet's useMap hook to grab the underlying L.Map
// instance from inside the MapContainer subtree.
function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LeafletMap({ data }) {
  const loc = data && data.location;
  const current = data && data.current;
  const lat = (loc && loc.lat) ?? (current && current.coord && current.coord.lat);
  const lon = (loc && loc.lon) ?? (current && current.coord && current.coord.lon);
  const placeName =
    (loc && loc.resolvedName) ||
    (current && current.name) ||
    'Current location';
  const country = (loc && loc.country) ? ', ' + loc.country : '';
  const temp = current && current.main && current.main.temp;
  const cond = current && current.weather && current.weather[0] && current.weather[0].description;

  if (typeof lat !== 'number' || typeof lon !== 'number') return null;

  const center = [lat, lon];

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={false}
      style={{ height: '280px', width: '100%' }}
      aria-label={'Map of ' + placeName}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center}>
        <Popup>
          <div className="text-sm">
            <p className="font-semibold">{placeName + country}</p>
            {typeof temp === 'number' && (
              <p>{Math.round(temp)}°F{cond ? ' · ' + cond : ''}</p>
            )}
          </div>
        </Popup>
      </Marker>
      <Recenter center={center} />
    </MapContainer>
  );
}
