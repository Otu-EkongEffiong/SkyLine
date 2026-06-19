// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, MapPin, Loader2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { useTranslation } from '@/components/translations';
import { searchAirports } from '@/components/api/amadeusClient';

// ─────────────────────────────────────────────────────────
// Live Amadeus airport autocomplete input
// Searches every airport + city worldwide as you type
// ─────────────────────────────────────────────────────────
function AirportSelector({ label, value, onChange, placeholder, exclude }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  // Clear text if value is cleared externally
  useEffect(() => {
    if (!value) setQuery('');
  }, [value]);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    onChange(null); // clear committed selection while typing

    clearTimeout(debounceRef.current);
    if (q.length < 2) { setResults([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {

        // Never show the opposite airport as an option
        const data = await searchAirports(q);

        const filtered = exclude ? data.filter(a => a.code !== exclude.code) : data;
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
    onChange(airport);
    setOpen(false);
  };

  const clear = () => {
    setQuery('');
    onChange(null);
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <Label className="text-slate-600 dark:text-slate-300 text-sm font-medium">{label}</Label>
      <div className="relative">

         {/* Committed selection — shows badge + clear button */}
         {value ? (
           <div className="flex items-center gap-2 w-full h-14 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
             <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900 flex items-center justify-center shrink-0">
               <span className="font-bold text-sky-700 dark:text-sky-300 text-xs">{value.code}</span>
             </div>
             <div className="text-left min-w-0 flex-1">
               <p className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">{value.city}</p>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{value.name}</p>
             </div>
             <button onClick={clear} className="shrink-0 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
               <X className="w-4 h-4" />
             </button>
           </div>
         ) : (
           /* Text input for searching */
           <div className="relative">
             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
             <input
               ref={inputRef}
               value={query}
               onChange={handleInput}
               onFocus={() => results.length > 0 && setOpen(true)}
               onBlur={() => setTimeout(() => setOpen(false), 150)}
               placeholder={placeholder}
               className="w-full h-14 pl-9 pr-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-amber-500 pointer-events-none" />
            )}
          </div>
        )}

        {/* Live results dropdown */}
        {open && !value && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
            {results.map((airport) => (
              <button
                key={airport.code}
                onMouseDown={() => select(airport)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 dark:hover:bg-slate-700 text-left transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <span className="font-bold text-slate-600 dark:text-slate-300 text-xs">{airport.code}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                    {airport.city}, {airport.country}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{airport.name}</p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded uppercase">
                  {airport.subType === 'CITY' ? 'city' : 'airport'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main FlightSearchForm
// Props contract unchanged from original:
//   onSearch({ origin, destination, departureDate, returnDate })
//   isSearching: boolean
// ─────────────────────────────────────────────────────────
export default function FlightSearchForm({ onSearch, isSearching, defaultOrigin }) {
  const { t } = useTranslation();

  const [origin,        setOrigin]        = useState(defaultOrigin || null);
  const [destination,   setDestination]   = useState(null);

  // Re-apply defaultOrigin if it arrives after initial render (profile loaded async)
  React.useEffect(() => {
    if (defaultOrigin && !origin) setOrigin(defaultOrigin);
  }, [defaultOrigin]);
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate,    setReturnDate]    = useState(null);
  const [depDateOpen,   setDepDateOpen]   = useState(false);
  const [retDateOpen,   setRetDateOpen]   = useState(false);
  const [tripType,      setTripType]      = useState('round'); // 'round' or 'oneWay'

  const canSearch = origin && destination && departureDate;

  const handleSearch = () => {
    if (!canSearch) return;
    onSearch({
      origin,
      destination,
      departureDate: format(departureDate, 'yyyy-MM-dd'),
      returnDate:    returnDate ? format(returnDate, 'yyyy-MM-dd') : null,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 p-6">
      {/* Trip Type Toggle */}
      <div className="mb-4 flex gap-2">
         <button
           onClick={() => setTripType('round')}
           className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
             tripType === 'round'
               ? 'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-200 border border-sky-300 dark:border-sky-700'
               : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-150 dark:hover:bg-slate-600'
           }`}
         >
           Round Trip
         </button>
         <button
           onClick={() => setTripType('oneWay')}
           className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
             tripType === 'oneWay'
               ? 'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-200 border border-sky-300 dark:border-sky-700'
               : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-150 dark:hover:bg-slate-600'
           }`}
         >
           One Way
         </button>
       </div>

      <div className="space-y-4">

        {/* From / To */}
        <div className="grid grid-cols-2 gap-4">
          <AirportSelector
            label={t('from')}
            value={origin}
            onChange={setOrigin}
            placeholder="City or airport anywhere..."
            exclude={destination}
          />
          <AirportSelector
            label={t('to')}
            value={destination}
            onChange={setDestination}
            placeholder="City or airport anywhere..."
            exclude={origin}
          />
        </div>

        {/* Departure / Return dates */}
         <div className="grid grid-cols-2 gap-4">

           <div className="space-y-2">
             <Label className="text-slate-600 dark:text-slate-300 text-sm font-medium">{t('departure')}</Label>
             <Popover open={depDateOpen} onOpenChange={setDepDateOpen}>
               <PopoverTrigger asChild>
                 <Button
                   variant="outline"
                   className="w-full justify-start h-14 px-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                 >
                   {departureDate ? (
                     <div className="flex items-center gap-3">
                       <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                       <div className="text-left">
                         <p className="font-medium text-slate-900 dark:text-slate-100">{format(departureDate, 'MMM d, yyyy')}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{format(departureDate, 'EEEE')}</p>
                       </div>
                     </div>
                   ) : (
                     <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                       <Calendar className="w-5 h-5" />
                       <span>Select date</span>
                     </div>
                   )}
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="start">
                 <CalendarComponent
                   mode="single"
                   selected={departureDate}
                   onSelect={(d) => { setDepartureDate(d); setDepDateOpen(false); }}
                   disabled={(d) => d < new Date()}
                   initialFocus
                 />
               </PopoverContent>
             </Popover>
           </div>

           {tripType === 'round' && (
             <div className="space-y-2">
               <Label className="text-slate-600 dark:text-slate-300 text-sm font-medium">{t('returnOptional')}</Label>
               <Popover open={retDateOpen} onOpenChange={setRetDateOpen}>
                 <PopoverTrigger asChild>
                   <Button
                     variant="outline"
                     className="w-full justify-start h-14 px-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                   >
                     {returnDate ? (
                       <div className="flex items-center gap-3">
                         <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                         <div className="text-left">
                           <p className="font-medium text-slate-900 dark:text-slate-100">{format(returnDate, 'MMM d, yyyy')}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400">{format(returnDate, 'EEEE')}</p>
                         </div>
                       </div>
                     ) : (
                       <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                         <Calendar className="w-5 h-5" />
                         <span>Select date</span>
                       </div>
                     )}
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-0" align="start">
                   <CalendarComponent
                     mode="single"
                     selected={returnDate}
                     onSelect={(d) => { setReturnDate(d); setRetDateOpen(false); }}
                     disabled={(d) => d < (departureDate || new Date())}
                     initialFocus
                   />
                 </PopoverContent>
               </Popover>
             </div>
           )}

         </div>
      </div>

      {/* Search button */}
       <div className="mt-6 flex justify-center">
         <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.15, ease: 'easeOut' }}>
           <Button
             onClick={handleSearch}
             disabled={!canSearch || isSearching}
             className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-blue-400/50"
           >
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('searching')}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                {t('search')}
              </div>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}