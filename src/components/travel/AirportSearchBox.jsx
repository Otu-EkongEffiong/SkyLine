// @ts-nocheck
import React, { useState, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { searchAirports } from '@/components/api/amadeusClient';

/**
 * Standalone airport search box — shows live suggestions as the user types.
 * Used on the AdminAirports page for testing; also importable anywhere.
 *
 * Props:
 *   value      — selected airport object or null
 *   onChange   — called with airport object when user selects one
 *   placeholder
 *   exclude    — airport object to exclude from results
 */
export default function AirportSearchBox({ value, onChange, placeholder = 'Search airports…', exclude }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  React.useEffect(() => {
    if (!value) setQuery('');
  }, [value]);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    if (onChange) onChange(null);

    clearTimeout(debounceRef.current);
    if (q.length < 2) { setResults([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchAirports(q);
        const filtered = exclude ? data.filter(a => a.code !== exclude?.code) : data;
        setResults(filtered);
        setOpen(filtered.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
  };

  const select = (airport) => {
    setQuery(`${airport.city}, ${airport.country} (${airport.code})`);
    if (onChange) onChange(airport);
    setOpen(false);
  };

  const clear = () => {
    setQuery('');
    if (onChange) onChange(null);
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      {value ? (
        <div className="flex items-center gap-2 w-full h-12 px-4 bg-card border border-border rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <span className="font-bold text-amber-700 dark:text-amber-400 text-xs">{value.code}</span>
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="font-medium text-foreground text-sm truncate">{value.city}</p>
            <p className="text-[10px] text-muted-foreground truncate">{value.name}</p>
          </div>
          <button onClick={clear} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleInput}
            onFocus={() => results.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={placeholder}
            className="w-full h-12 pl-9 pr-9 bg-white dark:bg-slate-800 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors"
            style={{ color: '#000000' }}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-amber-500 pointer-events-none" />
          )}
        </div>
      )}

      {open && !value && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {results.map((airport) => (
            <button
              key={airport.code}
              onMouseDown={() => select(airport)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent text-left transition-colors border-b border-border last:border-0"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <span className="font-bold text-amber-700 dark:text-amber-400 text-xs">{airport.code}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {airport.city}, {airport.country}
                </p>
                <p className="text-xs text-muted-foreground truncate">{airport.name}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 bg-muted px-1.5 py-0.5 rounded uppercase">
                {airport.subType === 'CITY' ? 'city' : 'airport'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}