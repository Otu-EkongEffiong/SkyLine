// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Plane, User, Settings, AlertTriangle, CheckCircle, Sparkles, Globe, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import FlightSearchForm from '@/components/travel/FlightSearchForm';
import RouteCard from '@/components/travel/RouteCard';
import { getFlagEmoji, COUNTRIES } from '@/components/travel/PassportSelector';
import { getVisaStatus, getConnectionDifficulty, EVISA_COUNTRIES, VOA_COUNTRIES, AIRPORT_COUNTRY_MAP } from '@/components/travel/AccessibilityMap';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/components/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import FlightCalendar from '@/components/travel/FlightCalendar';
import { addDays, format as formatDate } from 'date-fns';
import BottomNav from '@/components/BottomNav';
import AIFlightSuggestions from '@/components/travel/AIFlightSuggestions';
import { searchFlights, getCheapestDates } from '@/components/api/amadeusClient';

// Component for visa suggestions
function VisaSuggestions({ passportCountry, existingVisas }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = React.useState(false);
  
  // Get countries where user can get e-visa or VOA
  const evisaCountries = EVISA_COUNTRIES
    .filter(code => !existingVisas.some(v => v.country_code === code))
    .map(code => COUNTRIES.find(c => c.code === code))
    .filter(Boolean)
    .slice(0, 8);
  
  const voaCountries = VOA_COUNTRIES
    .filter(code => !existingVisas.some(v => v.country_code === code))
    .map(code => COUNTRIES.find(c => c.code === code))
    .filter(Boolean)
    .slice(0, 8);
  
  if (evisaCountries.length === 0 && voaCountries.length === 0) return null;
  
  return (
    <div className="mb-6 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div className="text-left">
            <p className="font-medium text-blue-900 dark:text-blue-100">Unlock More Routes</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {evisaCountries.length + voaCountries.length} countries offer easy visa options for your passport
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400 rotate-90" />
          </motion.div>
          </button>

          <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-blue-100 dark:border-blue-800"
            >
            <div className="p-4 space-y-4">
              {evisaCountries.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border-green-200 dark:border-green-700">e-Visa Available</Badge>
                    <span className="text-xs text-blue-600 dark:text-blue-300">{evisaCountries.length} countries</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {evisaCountries.map(country => (
                      <div key={country.code} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-slate-700">
                        <span className="text-lg">{getFlagEmoji(country.code)}</span>
                        <span className="text-xs text-slate-700 dark:text-slate-200">{country.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {voaCountries.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700">Visa on Arrival</Badge>
                    <span className="text-xs text-blue-600 dark:text-blue-300">{voaCountries.length} countries</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {voaCountries.map(country => (
                      <div key={country.code} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-slate-700">
                        <span className="text-lg">{getFlagEmoji(country.code)}</span>
                        <span className="text-xs text-slate-700 dark:text-slate-200">{country.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-blue-600 dark:text-blue-300">
                Add these visas to your profile to see more flight options with connections through these countries.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simulate flight search results based on user profile
function generateFlightResults(search, profile) {
  const { origin, destination, departureDate } = search;
  const passportCode = profile?.passport_country;
  const visas = profile?.visas || [];
  
  // Define possible routes with connections
  const routeTemplates = [
    {
      type: 'direct',
      price: 450 + Math.floor(Math.random() * 200),
      connections: [],
    },
    {
      type: 'via_dubai',
      price: 380 + Math.floor(Math.random() * 150),
      connections: [{ city: 'Dubai', code: 'DXB', countryCode: 'AE', layoverTime: '2h 30m' }],
    },
    {
      type: 'via_istanbul',
      price: 350 + Math.floor(Math.random() * 120),
      connections: [{ city: 'Istanbul', code: 'IST', countryCode: 'TR', layoverTime: '3h 15m' }],
    },
    {
      type: 'via_doha',
      price: 390 + Math.floor(Math.random() * 160),
      connections: [{ city: 'Doha', code: 'DOH', countryCode: 'QA', layoverTime: '2h 45m' }],
    },
    {
      type: 'via_frankfurt',
      price: 420 + Math.floor(Math.random() * 180),
      connections: [{ city: 'Frankfurt', code: 'FRA', countryCode: 'DE', layoverTime: '1h 50m' }],
    },
    {
      type: 'via_singapore',
      price: 410 + Math.floor(Math.random() * 170),
      connections: [{ city: 'Singapore', code: 'SIN', countryCode: 'SG', layoverTime: '2h 20m' }],
    },
    {
      type: 'via_london',
      price: 480 + Math.floor(Math.random() * 200),
      connections: [{ city: 'London', code: 'LHR', countryCode: 'GB', layoverTime: '4h 00m' }],
    },
  ];

  const airlines = ['Emirates', 'Qatar Airways', 'Turkish Airlines', 'Singapore Airlines', 'Lufthansa', 'British Airways', 'Etihad'];
  
  return routeTemplates.map((template, index) => {
    // Check visa status for each connection
    const connectionsWithVisa = template.connections.map(conn => {
      const status = passportCode ? getVisaStatus(passportCode, conn.countryCode, visas) : 'unknown';
      return {
        ...conn,
        visaStatus: status,
        hasVisa: status === 'has_visa',
      };
    });

    const hasVisaIssue = connectionsWithVisa.some(c => 
      c.visaStatus === 'visa_required' && !c.hasVisa
    );

    // Direct flights or visa-free connections are recommended
    const isRecommended = !hasVisaIssue && (
      template.connections.length === 0 || 
      connectionsWithVisa.every(c => ['visa_free', 'has_visa', 'visa_on_arrival'].includes(c.visaStatus))
    );

    const departureHour = 6 + Math.floor(Math.random() * 16);
    const flightDuration = template.connections.length === 0 ? 
      8 + Math.floor(Math.random() * 6) : 
      12 + Math.floor(Math.random() * 8);

    return {
      id: index,
      price: template.price,
      totalDuration: `${flightDuration}h ${Math.floor(Math.random() * 50)}m`,
      connections: connectionsWithVisa,
      hasVisaIssue,
      isRecommended,
      segments: [
        {
          origin: origin.code,
          originAirport: origin.name,
          destination: template.connections[0]?.code || destination.code,
          destinationAirport: template.connections[0]?.city || destination.name,
          departureTime: `${String(departureHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          arrivalTime: `${String((departureHour + 5) % 24).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          duration: template.connections.length === 0 ? `${flightDuration}h` : '5h 30m',
          airline: airlines[Math.floor(Math.random() * airlines.length)],
        },
        ...(template.connections.length > 0 ? [{
          origin: template.connections[0].code,
          originAirport: template.connections[0].city,
          destination: destination.code,
          destinationAirport: destination.name,
          departureTime: `${String((departureHour + 8) % 24).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          arrivalTime: `${String((departureHour + 14) % 24).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          duration: '6h 15m',
          airline: airlines[Math.floor(Math.random() * airlines.length)],
        }] : []),
      ],
    };
  });
}

export default function Home() {
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearch, setCurrentSearch] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [calendarPrices, setCalendarPrices] = useState(null);

  // Load user profile from localStorage (no backend required)
  const [userProfile, setUserProfile] = React.useState(() => {
    try {
      const stored = localStorage.getItem('skypath_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const profile = userProfile?.travel_profiles?.find(p => p.id === userProfile.active_profile_id) || 
                  userProfile?.travel_profiles?.[0] || 
                  null;

  const handleSearch = async (searchData) => {
    setIsSearching(true);
    setCurrentSearch(searchData);
    
    try {
      // ── Call live Amadeus API ─────────────────────────────────────────────
      let results = await searchFlights({
        originCode:      searchData.origin.code,
        destinationCode: searchData.destination.code,
        departureDate:   searchData.departureDate,
        returnDate:      searchData.returnDate || undefined,
        adults:          1,
      });

      // ── Visa-aware route scoring ──────────────────────────────────────────
      // SkyPath's core purpose: help weak-passport holders find easiest routes.
      // We NEVER hide routes — score and sort so most accessible rise to top.
      const passportCode = profile?.passport_country;
      const visas        = profile?.visas || [];
      const hasPassport  = !!passportCode;

      results = results.map(route => {
        // Annotate each layover with visa status for this passport.
        // Use AIRPORT_COUNTRY_MAP as fallback because Amadeus often omits countryCode.
        const connectionsWithVisa = route.connections.map(conn => {
          const countryCode = conn.countryCode || AIRPORT_COUNTRY_MAP?.[conn.code] || '';
          const status = hasPassport ? getVisaStatus(passportCode, countryCode, visas) : 'unknown';
          return { ...conn, countryCode, visaStatus: status, hasVisa: status === 'has_visa' };
        });

        // Also check the destination country itself
        const destCode       = route.segments[route.segments.length - 1]?.destination;
        const destCountry    = AIRPORT_COUNTRY_MAP?.[destCode] || '';
        const destVisaStatus = (hasPassport && destCountry)
          ? getVisaStatus(passportCode, destCountry, visas)
          : 'unknown';

        // Visa issue = anything needing an in-person visa (e-Visa / VOA are fine)
        const hasVisaIssue =
          connectionsWithVisa.some(c => c.visaStatus === 'visa_required') ||
          destVisaStatus === 'visa_required';

        // Friction score: 0 = fully clear, higher = harder for this passport
        let visaScore = 0;
        connectionsWithVisa.forEach(c => {
          visaScore += getConnectionDifficulty(passportCode, c.countryCode, visas);
        });
        if (destVisaStatus === 'visa_required')   visaScore += 10;
        if (destVisaStatus === 'evisa')            visaScore += 1;
        if (destVisaStatus === 'visa_on_arrival')  visaScore += 1;

        const isRecommended = !hasVisaIssue && visaScore === 0;

        return { ...route, connections: connectionsWithVisa, hasVisaIssue, isRecommended, visaScore, destVisaStatus, destCountry };
      });

      // Filter: if user has profile, only show flights they can actually take
      // (destination must be accessible, and all layovers must not require in-person visa)
      const availableRoutes = hasPassport 
        ? results.filter(route => {
            const canAccessDestination = route.destVisaStatus !== 'visa_required';
            const canAccessLayovers = !route.connections.some(c => c.visaStatus === 'visa_required');
            return canAccessDestination && canAccessLayovers;
          })
        : results;

      // Sort: easiest first → then friction score → then price
      availableRoutes.sort((a, b) => {
        if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
        if (a.visaScore     !== b.visaScore)     return a.visaScore - b.visaScore;
        return a.price - b.price;
      });

      // ── Calendar price data ─────────────────────────────────────────────────
      // Try real Amadeus Flight Dates API first, fall back to estimates
      const amadeusCalendar = await getCheapestDates(
        searchData.origin.code,
        searchData.destination.code
      );

      // Set calendar prices — use real Amadeus data if available, else estimate
      if (amadeusCalendar) {
        setCalendarPrices(amadeusCalendar);
      } else {
        const priceData = {};
        const baseDate  = new Date(searchData.departureDate);
        const avgPrice  = results.length > 0
          ? results.reduce((sum, r) => sum + r.price, 0) / results.length
          : 500;
        for (let i = -15; i <= 15; i++) {
          const date = addDays(baseDate, i);
          if (date >= new Date()) {
            const dateStr = formatDate(date, 'yyyy-MM-dd');
            const dow     = date.getDay();
            const mult    = (dow === 0 || dow === 6) ? 1.2 : 1;
            priceData[dateStr] = Math.round(avgPrice * mult * (0.9 + Math.random() * 0.2));
          }
        }
        setCalendarPrices(priceData);
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Flight search error:', error);
      toast.error('Failed to search flights. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCalendarDateSelect = async (date) => {
    if (!currentSearch) return;
    
    const newSearch = {
      ...currentSearch,
      departureDate: formatDate(date, 'yyyy-MM-dd')
    };
    
    await handleSearch(newSearch);
  };

  const handleSearchModification = async (action) => {
    if (!currentSearch) return;
    
    let modifiedSearch = { ...currentSearch };
    
    if (action.type === 'shift_dates') {
      const newDate = addDays(new Date(), action.days);
      modifiedSearch.departureDate = formatDate(newDate, 'yyyy-MM-dd');
    } else if (action.type === 'suggest_weekday') {
      // Find next Tuesday
      const today = new Date();
      const daysUntilTuesday = (2 - today.getDay() + 7) % 7 || 7;
      const nextTuesday = addDays(today, daysUntilTuesday + 7);
      modifiedSearch.departureDate = formatDate(nextTuesday, 'yyyy-MM-dd');
    }
    
    await handleSearch(modifiedSearch);
    setViewMode('list');
  };

  const passportCountry = profile?.passport_country 
    ? COUNTRIES.find(c => c.code === profile.passport_country)
    : null;

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-sky-500 to-teal-500 dark:from-sky-600 dark:via-sky-700 dark:to-teal-700">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')] bg-cover bg-center opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/src/assets/icon.svg" 
              alt="SkyLine Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Hero Content */}
          <div className="text-center mb-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-white mb-3"
            >
              {t('heroTitle')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/90 max-w-2xl mx-auto"
            >
              {t('heroSubtitle')}
            </motion.p>
          </div>

          {/* Profile Status Alert */}
          {!userProfile?.travel_profiles?.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl mx-auto mb-6"
            >
              <Alert className="bg-white/20 border-white/30 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-white" />
                <AlertDescription className="ml-2 text-white">
                  <Link to={createPageUrl('Profile')} className="underline hover:no-underline font-semibold">
                    {t('setUp')}
                  </Link>
                  {' '}{t('setupAlert')}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <FlightSearchForm onSearch={handleSearch} isSearching={isSearching} defaultOrigin={profile?.home_airport || null} />
          </motion.div>

          {/* Profile Summary */}
          {passportCountry && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex items-center justify-center gap-3 text-sm"
            >
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30">
                <span className="text-base">{getFlagEmoji(profile.passport_country)}</span>
                <span className="text-white font-medium">{passportCountry.name}</span>
              </div>
              {profile.visas?.length > 0 && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">{profile.visas.length} {profile.visas.length > 1 ? t('yourVisas').toLowerCase() : 'visa'}</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {searchResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background min-h-screen"
          >
            <div className="max-w-6xl mx-auto px-4 py-8">
              {/* Results Header */}
               <div className="flex items-start justify-between mb-6">
                 <div>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                     {currentSearch.origin.city} → {currentSearch.destination.city}
                   </h3>
                   <p className="text-slate-500 dark:text-slate-400">
                     {searchResults.length} {t('routesFound')} • {searchResults.filter(r => r.isRecommended).length} {t('recommended')}
                     {passportCountry && searchResults.length === 0 && (
                       <span className="ml-2 text-amber-600 font-medium">
                         (No flights available with your current passport & visas)
                       </span>
                     )}
                   </p>
                 </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="gap-2"
                  >
                    <Plane className="w-4 h-4" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                    className="gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Calendar
                  </Button>
                </div>
              </div>

              {/* AI Smart Suggestions */}
              {viewMode === 'list' && (
                <div className="mb-6">
                  <AIFlightSuggestions 
                    currentSearch={currentSearch} 
                    profile={profile}
                    onSearchModification={handleSearchModification}
                  />
                </div>
              )}

              {/* Visa Info Banner */}
              {profile?.passport_country && viewMode === 'list' && (
                <>
                  <div className="mb-6 p-4 bg-sky-50 dark:bg-sky-950 border border-sky-100 dark:border-sky-800 rounded-lg flex items-start gap-3">
                    <Globe className="w-5 h-5 text-sky-600 dark:text-sky-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-sky-900 dark:text-sky-100">{t('routesOptimized')} {passportCountry?.name} {t('passport')}</p>
                      <p className="text-sm text-sky-700 dark:text-sky-300">
                        {t('highlightedRoutes')}
                      </p>
                    </div>
                  </div>

                  {/* E-Visa & VOA Suggestions */}
                  <VisaSuggestions passportCountry={profile.passport_country} existingVisas={profile.visas || []} />
                </>
              )}

              {/* Results List or Calendar */}
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {searchResults.map((route, index) => (
                    <RouteCard key={route.id} route={route} index={index} />
                  ))}
                </div>
              ) : (
                <FlightCalendar
                  priceData={calendarPrices}
                  onDateSelect={handleCalendarDateSelect}
                  selectedDate={currentSearch?.departureDate ? new Date(currentSearch.departureDate) : null}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Section (shown when no results) */}
       {!searchResults && (
         <div className="bg-background dark:bg-slate-950 py-16">
           <div className="max-w-6xl mx-auto px-4">
             <div className="text-center mb-12">
               <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">{t('whySkyPath')}</h3>
               <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                 {t('builtFor')}
               </p>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Globe,
                  title: t('visaAwareRouting'),
                  description: t('visaAwareDesc'),
                  color: 'sky',
                },
                {
                  icon: CheckCircle,
                  title: t('smartRecommendations'),
                  description: t('smartRecommendationsDesc'),
                  color: 'teal',
                },
                {
                  icon: AlertTriangle,
                  title: t('noSurprises'),
                  description: t('noSurprisesDesc'),
                  color: 'orange',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-card dark:bg-slate-800 rounded-xl p-6 border border-border dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                  >
                  <div className={`w-12 h-12 rounded-full bg-${feature.color}-50 dark:bg-${feature.color}-950 flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{feature.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}