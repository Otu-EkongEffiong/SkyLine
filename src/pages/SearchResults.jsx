// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plane, Globe, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import RouteCard from '@/components/travel/RouteCard';
import AIFlightSuggestions from '@/components/travel/AIFlightSuggestions';
import FlightCalendar from '@/components/travel/FlightCalendar';
import BottomNav from '@/components/BottomNav';
import { createPageUrl } from '@/utils';
import { searchFlights, getCheapestDates } from '@/components/api/flightClient';
import { loadSearch, saveSearchResults, saveSelectedRoute } from '@/lib/searchStorage';
import { loadUserProfile, getActiveTravelProfile, travelerProfilePayload } from '@/lib/profileStorage';
import { filterRoutes } from '@/lib/routeFilters';
import { COUNTRIES, getFlagEmoji } from '@/components/travel/PassportSelector';
import { addDays, format as formatDate } from 'date-fns';

export default function SearchResults() {
  const navigate = useNavigate();
  const search = loadSearch();
  const profile = getActiveTravelProfile(loadUserProfile());

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [calendarPrices, setCalendarPrices] = useState(null);

  useEffect(() => {
    if (!search?.origin || !search?.destination) {
      navigate(createPageUrl('Home'));
      return;
    }
    runSearch(search);
  }, []);

  const runSearch = async (searchData) => {
    setLoading(true);
    try {
      const offers = await searchFlights({
        origin: searchData.origin,
        destination: searchData.destination,
        departureDate: searchData.departureDate,
        returnDate: searchData.returnDate,
        travelerProfile: travelerProfilePayload(profile),
      });
      setRoutes(offers);
      saveSearchResults(offers);

      const fromDate = formatDate(addDays(new Date(searchData.departureDate), -15), 'yyyy-MM-dd');
      const toDate = formatDate(addDays(new Date(searchData.departureDate), 15), 'yyyy-MM-dd');
      const prices = await getCheapestDates({
        origin: searchData.origin.code,
        destination: searchData.destination.code,
        fromDate,
        toDate,
      });
      setCalendarPrices(Object.keys(prices).length ? prices : null);
    } catch (err) {
      toast.error(err.message || 'Search failed');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoute = (route) => {
    saveSelectedRoute(route);
    navigate(createPageUrl('RouteDetails'));
  };

  const handleCalendarDateSelect = async (date) => {
    const next = { ...search, departureDate: formatDate(date, 'yyyy-MM-dd') };
    await runSearch(next);
    setViewMode('list');
  };

  if (!search) return null;

  const passportCountry = profile?.passport_country
    ? COUNTRIES.find((c) => c.code === profile.passport_country)
    : null;

  const filtered = filterRoutes(routes, filter);

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 pb-24">
      <div className="sticky top-0 z-40 bg-background/95 dark:bg-slate-950/95 backdrop-blur border-b border-border dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('Home'))}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {search.origin.city} → {search.destination.city}
            </h1>
            <p className="text-sm text-slate-500">{search.departureDate}{search.returnDate ? ` – ${search.returnDate}` : ''}</p>
          </div>
          <div className="flex gap-1">
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
              <Plane className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'calendar' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('calendar')}>
              <Globe className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-slate-500">Searching flights with visa-aware ranking…</p>
          </div>
        ) : viewMode === 'calendar' ? (
          <FlightCalendar
            priceData={calendarPrices}
            onDateSelect={handleCalendarDateSelect}
            selectedDate={search.departureDate ? new Date(search.departureDate) : null}
          />
        ) : (
          <>
            {passportCountry && (
              <div className="mb-4 p-4 bg-sky-50 dark:bg-sky-950 border border-sky-100 dark:border-sky-800 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sky-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sky-900 dark:text-sky-100">
                    {getFlagEmoji(profile.passport_country)} Routes ranked for {passportCountry.name} passport
                  </p>
                  <p className="text-sm text-sky-700 dark:text-sky-300">
                    {routes.filter((r) => r.isRecommended).length} recommended · {routes.filter((r) => r.hasVisaIssue).length} require extra visas
                  </p>
                </div>
              </div>
            )}

            <AIFlightSuggestions
              currentSearch={search}
              profile={profile}
              onSearchModification={() => runSearch(search)}
            />

            <Tabs value={filter} onValueChange={setFilter} className="mb-6">
              <TabsList className="flex flex-wrap h-auto gap-1">
                <TabsTrigger value="all">All ({routes.length})</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="cheapest">Cheapest</TabsTrigger>
                <TabsTrigger value="lowest-visa-risk">Lowest visa risk</TabsTrigger>
                <TabsTrigger value="avoid">Avoid</TabsTrigger>
              </TabsList>
            </Tabs>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                No routes in this category. Try another filter or update your profile visas.
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((route, index) => (
                  <RouteCard key={route.id} route={route} index={index} onSelect={handleSelectRoute} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
