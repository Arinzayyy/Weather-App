import { useState } from 'react';
import { getBrowserLocation } from '../lib/geolocation';

// Single text input — per the guide, OWM handles parsing for city / zip / coords
// natively so we pass the raw string through. "Use My Location" button fills
// the input from navigator.geolocation and auto-submits.
//
// Error handling split:
//  - empty-input error: rendered INLINE here (guide Section 1.5 requirement)
//  - async errors (network / API): surfaced by the parent's page-level banner
export default function SearchBar({ onSearch, isLoading }) {
  const [value, setValue] = useState('');
  const [inlineError, setInlineError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const disabled = isLoading || isLocating;

  function handleChange(e) {
    setValue(e.target.value);
    if (inlineError) setInlineError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setInlineError('Please enter a location to search.');
      return;
    }
    setInlineError('');
    onSearch(trimmed);
  }

  async function handleUseMyLocation() {
    setInlineError('');
    setIsLocating(true);
    try {
      const coords = await getBrowserLocation();
      setValue(coords);
      onSearch(coords);
    } catch (err) {
      // Permission denied etc. — page-level banner is the right place for this
      // because it's an async failure, not an input validation error.
      onSearch(null, err.message || 'Unable to determine your location.');
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2" noValidate>
        <label htmlFor="location-input" className="sr-only">Location</label>
        <input
          id="location-input"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="City, zip, or coordinates (e.g. Oakland, CA)"
          autoComplete="off"
          disabled={disabled}
          aria-invalid={Boolean(inlineError)}
          aria-describedby={inlineError ? 'location-error' : undefined}
          className={
            'flex-1 px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 disabled:bg-slate-100 ' +
            (inlineError
              ? 'border-red-400 focus:ring-red-400'
              : 'border-slate-300 focus:ring-blue-500')
          }
        />
        <button
          type="submit"
          disabled={disabled}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {inlineError && (
        <p id="location-error" className="text-sm text-red-600" role="alert">
          {inlineError}
        </p>
      )}

      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={disabled}
        className="self-start text-sm text-blue-700 hover:text-blue-900 underline-offset-2 hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1"
      >
        <span aria-hidden="true">📍</span>
        {isLocating ? 'Locating…' : 'Use My Location'}
      </button>
    </div>
  );
}
