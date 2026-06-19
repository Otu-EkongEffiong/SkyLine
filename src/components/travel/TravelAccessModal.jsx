// @ts-nocheck
import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Clock, FileText, Search, ChevronRight, Stamp, Loader2, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";
import { getFlagEmoji, COUNTRIES } from './PassportSelector';
import { getVisaStatus, VISA_UNLOCK_MAP } from './Travelconstants';
import { motion, AnimatePresence } from 'framer-motion';
import VisaMap from './VisaMap';

// Per-session cache for individual country lookups
const DETAIL_CACHE = {};

const CATEGORIES = [
  {
    key: 'has_visa',
    title: 'You Have Visa',
    icon: CheckCircle,
    iconColor: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
    badgeBg: 'bg-purple-100 text-purple-700',
  },
  {
    key: 'visa_free',
    title: 'Visa Free',
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    badgeBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    key: 'evisa',
    title: 'e-Visa Available',
    icon: FileText,
    iconColor: 'text-sky-600',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-200 dark:border-sky-800',
    badgeBg: 'bg-sky-100 text-sky-700',
  },
  {
    key: 'visa_on_arrival',
    title: 'Visa on Arrival',
    icon: Clock,
    iconColor: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    badgeBg: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'visa_required',
    title: 'Visa Required',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800',
    badgeBg: 'bg-red-100 text-red-700',
  },
];

const VISA_UNLOCKED_CAT = {
  key: 'visa_unlocked',
  title: 'Unlocked by Your Visas',
  icon: Stamp,
  iconColor: 'text-violet-600',
  bg: 'bg-violet-50 dark:bg-violet-950/40',
  border: 'border-violet-200 dark:border-violet-800',
  badgeBg: 'bg-violet-100 text-violet-700',
};

function CountryListSheet({ category, countries, passportCode, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [liveDetails, setLiveDetails] = useState({});
  const [loadingDetail, setLoadingDetail] = useState({});

  const cat = CATEGORIES.find(c => c.key === category) || VISA_UNLOCKED_CAT;
  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCountryTap = async (country) => {
    if (selectedCountry?.code === country.code) {
      setSelectedCountry(null);
      return;
    }
    setSelectedCountry(country);
    if (liveDetails[country.code]) return;

    const cacheKey = `${passportCode}_${country.code}`;
    if (DETAIL_CACHE[cacheKey]) {
      setLiveDetails(prev => ({ ...prev, [country.code]: DETAIL_CACHE[cacheKey] }));
      return;
    }

    setLoadingDetail(prev => ({ ...prev, [country.code]: true }));
    try {
      DETAIL_CACHE[cacheKey] = 'unknown';
      setLiveDetails(prev => ({ ...prev, [country.code]: 'unknown' }));
    } catch {}
    setLoadingDetail(prev => ({ ...prev, [country.code]: false }));
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute inset-0 bg-white dark:bg-slate-900 flex flex-col z-10"
    >
      <div className={cn('flex items-center gap-3 px-4 py-4 border-b dark:border-slate-700', cat.bg)}>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10 transition-colors">
          <X className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <cat.icon className={cn('w-5 h-5', cat.iconColor)} />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{cat.title}</h3>
          <span className={cn('ml-auto text-xs font-medium px-2 py-0.5 rounded-full', cat.badgeBg)}>
            {countries.length}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 border-b dark:border-slate-700">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search countries…"
            className="flex-1 bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center text-slate-400 py-12 text-sm">No countries found</div>
        ) : (
          <ul>
            {filtered.map(country => {
              const detail = liveDetails[country.code];
              const isLoadingThis = loadingDetail[country.code];
              const isSelected = selectedCountry?.code === country.code;

              return (
                <li key={country.code} className="border-b border-slate-100 dark:border-slate-800">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleCountryTap(country)}
                  >
                    <span className="text-2xl">{getFlagEmoji(country.code)}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-800 dark:text-slate-200 text-sm font-medium">{country.name}</span>
                      {country.unlockedBy && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          via {country.unlockedBy.map(c => getFlagEmoji(c)).join(' ')} visa
                        </p>
                      )}
                    </div>
                    {isLoadingThis
                      ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                      : <ChevronRight className={cn("w-4 h-4 transition-transform", isSelected ? "rotate-90 text-slate-600" : "text-slate-300")} />
                    }
                  </button>

                  <AnimatePresence>
                    {isSelected && detail && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className={cn('mx-4 mb-3 rounded-xl p-3 border text-sm space-y-1.5', cat.bg, cat.border)}>
                          {detail.visa_type && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Entry type</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{detail.visa_type}</span>
                            </div>
                          )}
                          {detail.duration && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Stay allowed</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{detail.duration}</span>
                            </div>
                          )}
                          {detail.link && (
                            <a
                              href={detail.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sky-600 hover:underline text-xs pt-1"
                              onClick={e => e.stopPropagation()}
                            >
                              <ExternalLink className="w-3 h-3" /> Apply / Learn more
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

export default function TravelAccessModal({ passportCode, visas = [], passportName, onClose }) {
  const [activeCategory, setActiveCategory] = useState(null);

  // Use static data for bucketing (accurate enough for categorization, no rate limits)
  const buckets = { has_visa: [], visa_free: [], evisa: [], visa_on_arrival: [], visa_required: [] };

  COUNTRIES.forEach(country => {
    if (country.code === passportCode) return;
    const status = getVisaStatus(passportCode, country.code, visas);
    if (status === 'has_visa') buckets.has_visa.push(country);
    else if (status === 'visa_free') buckets.visa_free.push(country);
    else if (status === 'evisa' || status === 'evisa_available') buckets.evisa.push(country);
    else if (status === 'visa_on_arrival') buckets.visa_on_arrival.push(country);
    else buckets.visa_required.push(country);
  });

  // Countries unlocked by held visas
  const visaUnlockedMap = {};
  visas.forEach(visa => {
    (VISA_UNLOCK_MAP[visa.country_code] || []).forEach(code => {
      const status = getVisaStatus(passportCode, code, []);
      if (status === 'visa_free') return;
      if (visas.some(v => v.country_code === code)) return;
      if (!visaUnlockedMap[code]) visaUnlockedMap[code] = [];
      visaUnlockedMap[code].push(visa.country_code);
    });
  });

  const visaUnlockedCountries = Object.keys(visaUnlockedMap)
    .map(code => {
      const country = COUNTRIES.find(c => c.code === code);
      return country ? { ...country, unlockedBy: visaUnlockedMap[code] } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  const getCountries = (key) => {
    if (key === 'visa_unlocked') return visaUnlockedCountries;
    return buckets[key] || [];
  };

  const total = buckets.has_visa.length + buckets.visa_free.length + buckets.evisa.length + buckets.visa_on_arrival.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '85vh', background: 'linear-gradient(160deg, #3FA9F5 0%, #14B8A6 60%, #0e9488 100%)' }}
      >
        <div className="relative overflow-hidden" style={{ maxHeight: '85vh' }}>
          <div className="flex flex-col" style={{ maxHeight: '85vh' }}>
            {/* Header */}
            <div className="flex flex-col pt-3 pb-3 px-4" style={{ background: 'linear-gradient(160deg, #3FA9F5 0%, #14B8A6 100%)' }}>
              <div className="w-10 h-1 rounded-full bg-white/30 mb-3 mx-auto" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getFlagEmoji(passportCode)}</span>
                  <div>
                    <h2 className="font-bold text-white text-base">{passportName || passportCode} Passport</h2>
                    <p className="text-white/80 text-xs">{total} destinations without advance visa</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <VisaMap passportCode={passportCode} visas={visas} />
            </div>

            {/* Category rows */}
            <div className="overflow-y-auto flex-1 py-2 bg-white dark:bg-slate-900">
              {CATEGORIES.map(cat => {
                const countries = getCountries(cat.key);
                if (cat.key === 'has_visa' && countries.length === 0) return null;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border', cat.bg, cat.border)}>
                      <cat.icon className={cn('w-5 h-5', cat.iconColor)} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{cat.title}</p>
                      <p className="text-xs text-slate-500">{countries.length} countries</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-semibold px-2.5 py-0.5 rounded-full', cat.badgeBg)}>
                        {countries.length}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                );
              })}

              {visaUnlockedCountries.length > 0 && (
                <button
                  onClick={() => setActiveCategory('visa_unlocked')}
                  className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800">
                    <Stamp className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">Unlocked by Your Visas</p>
                    <p className="text-xs text-slate-500">Countries accessible due to visas you hold</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                      {visaUnlockedCountries.length}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {activeCategory && (
              <CountryListSheet
                key={activeCategory}
                category={activeCategory}
                countries={getCountries(activeCategory)}
                passportCode={passportCode}
                onClose={() => setActiveCategory(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}