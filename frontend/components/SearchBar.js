import { useState, useEffect, useRef } from 'react';
import { getBrowserLocation } from '../lib/geolocation';
import { fetchAutocomplete } from '../lib/api';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar({ onSearch, isLoading }) {
  const [value, setValue]             = useState('');
  const [inlineError, setInlineError] = useState('');
  const [isLocating, setIsLocating]   = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop]       = useState(false);
  const [activeIdx, setActiveIdx]     = useState(-1);
  const containerRef = useRef(null);
  const inputRef     = useRef(null);
  const disabled = isLoading || isLocating;

  const debouncedQuery = useDebounce(value, 300);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }
    let cancelled = false;
    fetchAutocomplete(q)
      .then(results => {
        if (cancelled) return;
        setSuggestions(results);
        setShowDrop(results.length > 0);
        setActiveIdx(-1);
      })
      .catch(() => {
        if (!cancelled) { setSuggestions([]); setShowDrop(false); }
      });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleChange(e) {
    setValue(e.target.value);
    if (inlineError) setInlineError('');
  }

  function commitSearch(query) {
    setShowDrop(false);
    setSuggestions([]);
    setActiveIdx(-1);
    const trimmed = (query || value).trim();
    if (!trimmed) { setInlineError('Please enter a location to search.'); return; }
    setInlineError('');
    setValue(trimmed);
    onSearch(trimmed);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (showDrop && activeIdx >= 0 && suggestions[activeIdx]) {
      commitSearch(suggestions[activeIdx].label);
    } else {
      commitSearch();
    }
  }

  function handleKeyDown(e) {
    if (!showDrop || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowDrop(false);
      setActiveIdx(-1);
    }
  }

  function handleSuggestionClick(label) {
    commitSearch(label);
    inputRef.current && inputRef.current.focus();
  }

  async function handleUseMyLocation() {
    setInlineError('');
    setIsLocating(true);
    setShowDrop(false);
    try {
      const coords = await getBrowserLocation();
      setValue(coords);
      onSearch(coords);
    } catch (err) {
      onSearch(null, err.message || 'Unable to determine your location.');
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-2" ref={containerRef}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2" noValidate>
        <label htmlFor="location-input" className="sr-only">Location</label>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            id="location-input"
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowDrop(true)}
            placeholder="City, zip, or coordinates (e.g. Oakland, CA)"
            autoComplete="off"
            disabled={disabled}
            aria-invalid={Boolean(inlineError)}
            aria-describedby={inlineError ? 'location-error' : undefined}
            aria-autocomplete="list"
            aria-controls={showDrop ? 'location-suggestions' : undefined}
            aria-activedescendant={showDrop && activeIdx >= 0 ? 'suggestion-' + activeIdx : undefined}
            className={
              'w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md text-white placeholder-white/50 ' +
              'focus:outline-none focus:ring-2 disabled:opacity-50 border ' +
              (inlineError
                ? 'border-red-400/60 focus:ring-red-400/50'
                : 'border-white/30 focus:ring-white/40')
            }
          />

          {showDrop && (
            <ul
              id="location-suggestions"
              role="listbox"
              aria-label="Location suggestions"
              className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden border border-white/25 shadow-xl"
              style={{ backdropFilter: 'blur(20px)', background: 'rgba(15,30,60,0.88)' }}
            >
              {suggestions.map((s, i) => (
                <li
                  key={s.label + i}
                  id={'suggestion-' + i}
                  role="option"
                  aria-selected={i === activeIdx}
                  onMouseDown={() => handleSuggestionClick(s.label)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={
                    'px-4 py-2.5 cursor-pointer text-sm flex items-center gap-2 transition-colors ' +
                    (i === activeIdx ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10')
                  }
                >
                  <span aria-hidden="true" className="text-white/40 text-xs">pin</span>
                  {s.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="px-6 py-3 rounded-xl bg-white/25 backdrop-blur-md text-white font-semibold border border-white/30 hover:bg-white/35 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {inlineError && (
        <p id="location-error" className="text-sm text-red-300" role="alert">
          {inlineError}
        </p>
      )}

      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={disabled}
        className="self-start text-sm text-white/60 hover:text-white underline-offset-2 hover:underline disabled:opacity-40 flex items-center gap-1 transition-colors"
      >
        {isLocating ? 'Locating...' : 'Use My Location'}
      </button>
    </div>
  );
}
