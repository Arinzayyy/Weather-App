import { useEffect, useState, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import ForecastRow from '../components/ForecastRow';
import MapEmbed from '../components/MapEmbed';
import UnitToggle from '../components/UnitToggle';
import SaveForm from '../components/SaveForm';
import SavedRecords from '../components/SavedRecords';
import LocationPicker from '../components/LocationPicker';
import {
  geocodeLocation,
  fetchCurrentWeather,
  saveRecord,
  listRecords,
  updateRecord,
  deleteRecord,
} from '../lib/api';

export default function Home() {
  // Current search view
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unit, setUnit] = useState('F');

  // Saved records (CRUD)
  const [records, setRecords] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [editing, setEditing] = useState(null); // record object or null

  // Disambiguation state — populated when the geocoder returns 2+ candidates
  // for the user's query (e.g. "Springfield" matches IL, MA, MO, OR, ...).
  const [matches, setMatches] = useState([]);
  const [pendingQuery, setPendingQuery] = useState('');

  // Persist unit preference.
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('weather.unit') : null;
      if (saved === 'C' || saved === 'F') setUnit(saved);
    } catch (_) { /* ignore */ }
  }, []);
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem('weather.unit', unit);
    } catch (_) { /* ignore */ }
  }, [unit]);

  // Load saved records on mount.
  const refreshRecords = useCallback(async () => {
    try {
      const list = await listRecords();
      setRecords(list);
    } catch (err) {
      setError(err.message || 'Unable to load saved records.');
    }
  }, []);
  useEffect(() => { refreshRecords(); }, [refreshRecords]);

  // Two-phase search:
  //   1. Geocode the query → array of candidate matches
  //   2a. If exactly one match, fetch the weather snapshot directly via coords
  //   2b. If 2+ matches, render the LocationPicker so the user disambiguates;
  //       the picker calls handlePickMatch with the chosen candidate
  async function handleSearch(location, asyncError) {
    setError('');
    setMatches([]);
    setPendingQuery('');
    if (asyncError) { setError(asyncError); setData(null); return; }
    setIsLoading(true);
    try {
      const found = await geocodeLocation(location);
      if (!found || found.length === 0) {
        throw new Error('Location not found. Please check your input and try again.');
      }
      if (found.length === 1) {
        const m = found[0];
        const snapshot = await fetchCurrentWeather(m.lat + ',' + m.lon);
        setData(snapshot);
      } else {
        setMatches(found);
        setPendingQuery(location);
        setData(null);
      }
    } catch (err) {
      setError(err.message || 'Unable to fetch weather data. Please check your connection.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePickMatch(match) {
    setError('');
    setMatches([]);
    setPendingQuery('');
    setIsLoading(true);
    try {
      const snapshot = await fetchCurrentWeather(match.lat + ',' + match.lon);
      setData(snapshot);
    } catch (err) {
      setError(err.message || 'Unable to fetch weather data.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveOrUpdate({ location, dateFrom, dateTo }) {
    setError('');
    setIsBusy(true);
    try {
      if (editing) {
        await updateRecord(editing.id, { location, dateFrom, dateTo });
        setEditing(null);
      } else {
        await saveRecord({ location, dateFrom, dateTo });
      }
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

  // Pre-fill the save form with the current search location when one exists.
  const saveInitial = editing
    ? { location: editing.location, dateFrom: editing.dateFrom, dateTo: editing.dateTo }
    : data
      ? { location: (data.location && data.location.resolvedName) || (data.current && data.current.name) || '' }
      : null;

  return (
    <main className="min-h-screen flex flex-col items-center p-6 gap-6">
      <header className="flex flex-col items-center gap-2 w-full max-w-xl mt-6">
        <h1 className="text-4xl font-bold tracking-tight">Weather App</h1>
        <p className="text-slate-600 text-center">
          Enter any city, zip code, or GPS coordinates.
        </p>
      </header>

      <div className="w-full max-w-xl flex justify-end">
        <UnitToggle unit={unit} onChange={setUnit} />
      </div>

      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      {error && (
        <div
          role="alert"
          className="w-full max-w-xl bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      {matches.length > 0 && (
        <LocationPicker
          query={pendingQuery}
          matches={matches}
          onPick={handlePickMatch}
          onCancel={() => { setMatches([]); setPendingQuery(''); }}
          isLoading={isLoading}
        />
      )}

      {isLoading && !data && matches.length === 0 && (
        <div className="w-full max-w-xl text-center text-slate-500 pt-8" aria-live="polite">
          Fetching current conditions…
        </div>
      )}

      {!error && !data && !isLoading && records.length === 0 && (
        <div className="w-full max-w-xl text-center text-slate-500 pt-12">
          Search for a location to see current conditions.
        </div>
      )}

      {data && <WeatherCard data={data} unit={unit} />}
      {data && <ForecastRow data={data} unit={unit} />}
      {data && <MapEmbed data={data} />}

      {(data || editing) && (
        <SaveForm
          initial={saveInitial}
          editingId={editing ? editing.id : null}
          isBusy={isBusy}
          onSubmit={handleSaveOrUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      <SavedRecords
        records={records}
        onEdit={(r) => setEditing(r)}
        onDelete={handleDelete}
        isBusy={isBusy}
      />

      <footer className="mt-auto pt-12 text-xs text-slate-500 text-center max-w-xl">
        <p>Built by Arinze Ohaemesi · PM Accelerator AI Engineer Intern Assessment · April 2026</p>
        <p className="mt-2">
          <strong>Product Manager Accelerator</strong> is a career accelerator program that helps
          aspiring product managers and AI engineers break into top tech companies through
          mentorship, hands-on projects, and interview prep.
        </p>
      </footer>
    </main>
  );
}
