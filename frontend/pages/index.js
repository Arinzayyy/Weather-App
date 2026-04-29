import { useEffect, useState, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import ForecastRow from '../components/ForecastRow';
import MapEmbed from '../components/MapEmbed';
import UnitToggle from '../components/UnitToggle';
import SaveForm from '../components/SaveForm';
import SavedRecords from '../components/SavedRecords';
import YouTubePanel from '../components/YouTubePanel';
import {
  fetchCurrentWeather,
  fetchYouTubeVideos,
  saveRecord,
  listRecords,
  updateRecord,
  deleteRecord,
} from '../lib/api';

function getBackground(data) {
  if (!data || !data.current) {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
  const w = (data.current.weather && data.current.weather[0]) || {};
  const id = w.id || 0;
  const isNight = (w.icon || '').endsWith('n');

  if (id >= 200 && id < 300) return 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
  if (id >= 300 && id < 600) return isNight
    ? 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
    : 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)';
  if (id >= 600 && id < 700) return 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
  if (id >= 700 && id < 800) return 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)';
  if (id === 800) return isNight
    ? 'linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #283593 100%)'
    : 'linear-gradient(135deg, #1565c0 0%, #42a5f5 50%, #29b6f6 100%)';
  return isNight
    ? 'linear-gradient(135deg, #1c1c2e 0%, #2d3561 100%)'
    : 'linear-gradient(135deg, #485563 0%, #29323c 100%)';
}

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unit, setUnit] = useState('F');

  const [records, setRecords] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [editing, setEditing] = useState(null);

  const [ytVideos, setYtVideos] = useState([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState('');
  const [ytLocation, setYtLocation] = useState('');

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('weather.unit') : null;
      if (saved === 'C' || saved === 'F') setUnit(saved);
    } catch (_) {}
  }, []);
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem('weather.unit', unit);
    } catch (_) {}
  }, [unit]);

  const refreshRecords = useCallback(async () => {
    try { setRecords(await listRecords()); }
    catch (err) { setError(err.message || 'Unable to load saved records.'); }
  }, []);
  useEffect(() => { refreshRecords(); }, [refreshRecords]);

  async function loadYouTubeVideos(label) {
    setYtVideos([]);
    setYtError('');
    setYtLocation(label);
    setYtLoading(true);
    try {
      const result = await fetchYouTubeVideos(label);
      setYtVideos(result.videos || []);
    } catch (err) {
      setYtError(err.message || 'Could not load videos.');
    } finally {
      setYtLoading(false);
    }
  }

  async function handleSearch(location, asyncError) {
    setError('');
    setData(null);
    setYtVideos([]);
    setYtError('');
    setYtLocation('');
    setYtLoading(false);
    if (asyncError) { setError(asyncError); return; }
    setIsLoading(true);
    try {
      const snapshot = await fetchCurrentWeather(location);
      setData(snapshot);
      // Build the display label from the resolved location returned by the backend
      const loc = snapshot.location || {};
      const label = [loc.resolvedName, loc.state, loc.country].filter(Boolean).join(', ') || location;
      loadYouTubeVideos(label);
    } catch (err) {
      setError(err.message || 'Unable to fetch weather data. Please check your connection.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveOrUpdate({ location, dateFrom, dateTo }) {
    setError('');
    setIsBusy(true);
    try {
      if (editing) { await updateRecord(editing.id, { location, dateFrom, dateTo }); setEditing(null); }
      else { await saveRecord({ location, dateFrom, dateTo }); }
      await refreshRecords();
    } catch (err) {
      setError(err.message || 'Unable to save record.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(id) {
    if (typeof window !== 'undefined' && !window.confirm('Delete record #' + id + '?')) return;
    setError('');
    setIsBusy(true);
    try {
      await deleteRecord(id);
      if (editing && editing.id === id) setEditing(null);
      await refreshRecords();
    } catch (err) {
      setError(err.message || 'Unable to delete record.');
    } finally {
      setIsBusy(false);
    }
  }

  const saveInitial = editing
    ? { location: editing.location, dateFrom: editing.dateFrom, dateTo: editing.dateTo }
    : data
      ? { location: (data.location && data.location.resolvedName) || (data.current && data.current.name) || '' }
      : null;

  const showSidebar = data || ytLoading || ytVideos.length > 0;

  return (
    <main className="weather-bg min-h-screen" style={{ background: getBackground(data) }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-4 sm:gap-6">

        {/* ── Header ── */}
        <header className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-lg">Weather App</h1>
          <p className="text-white/60 text-xs sm:text-sm">Enter any city, zip code, or GPS coordinates.</p>
        </header>

        {/* ── Search row — stacks on mobile, side-by-side on sm+ ── */}
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-2">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          <div className="flex justify-end">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="max-w-2xl mx-auto w-full">
            <div role="alert" className="glass rounded-xl px-4 py-3 text-sm text-white"
              style={{ background: 'rgba(239,68,68,0.25)' }}>
              ⚠ {error}
            </div>
          </div>
        )}

        {/* ── Loading spinner ── */}
        {isLoading && !data && (
          <div className="text-center text-white/60 py-12 flex flex-col items-center gap-3" aria-live="polite">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Fetching current conditions…
          </div>
        )}

        {/* ── Empty state ── */}
        {!error && !data && !isLoading && records.length === 0 && (
          <div className="text-center text-white/40 py-16">
            Search for a location to see current conditions.
          </div>
        )}

        {/* ── Two-column layout ── */}
        <div className={showSidebar ? 'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start' : 'flex flex-col gap-6'}>

          {/* Left column — weather + forms */}
          <div className="flex flex-col gap-6">
            {data && <WeatherCard data={data} unit={unit} />}
            {data && <ForecastRow data={data} unit={unit} />}
            {data && <MapEmbed data={data} />}
            {(data || editing) && (
              <SaveForm initial={saveInitial} editingId={editing ? editing.id : null}
                isBusy={isBusy} onSubmit={handleSaveOrUpdate} onCancel={() => setEditing(null)} />
            )}
            <SavedRecords records={records} onEdit={(r) => setEditing(r)}
              onDelete={handleDelete} isBusy={isBusy} />
          </div>

          {/* Right column — YouTube sidebar */}
          {showSidebar && (
            <div className="lg:sticky lg:top-6">
              <YouTubePanel videos={ytVideos} location={ytLocation}
                isLoading={ytLoading} error={ytError} />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="text-xs text-white/40 text-center pt-6 border-t border-white/10">
          <p>Built by Arinze Ohaemesi · PM Accelerator AI Engineer Intern Assessment · April 2026</p>
          <p className="mt-1">
            <strong className="text-white/60">Product Manager Accelerator</strong> — a career accelerator
            helping aspiring PMs and AI engineers break into top tech companies through mentorship,
            hands-on projects, and interview prep.
          </p>
        </footer>

      </div>
    </main>
  );
}
