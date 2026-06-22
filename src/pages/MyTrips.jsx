import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/PullToRefresh';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plane, Calendar, MapPin, Clock, ChevronRight, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from '@/components/BottomNav';
import FlightStatusTracker from '@/components/travel/FlightStatusTracker';
import { motion } from 'framer-motion';
import { useTranslation } from '@/components/translations';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { loadTrips } from '@/lib/tripStorage';
import { loadUserProfile } from '@/lib/profileStorage';

export default function MyTrips() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upcoming');

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['trips'] });
  };

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => loadTrips(),
  });

  const userProfile = loadUserProfile();
  const activeProfile = userProfile?.travel_profiles?.find(
    (p) => p.id === userProfile.active_profile_id
  ) || userProfile?.travel_profiles?.[0] || null;
  const homeAirport = activeProfile?.home_airport || null;

  // Categorize trips by status and date
  const now = new Date();
  const categorizedTrips = {
    upcoming: trips.filter(t => 
      (t.status === 'upcoming' || !t.status) && isAfter(parseISO(t.departure_date), now)
    ),
    current: trips.filter(t => 
      t.status === 'current' || 
      (isAfter(now, parseISO(t.departure_date)) && isBefore(now, parseISO(t.arrival_date)))
    ),
    past: trips.filter(t => 
      t.status === 'completed' || 
      (isBefore(parseISO(t.arrival_date), now) && t.status !== 'current')
    ),
  };

  const TripCard = ({ trip }) => {
    const isPast = trip.status === 'completed';
    const isCurrent = trip.status === 'current';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card 
        className="hover:shadow-md transition-shadow cursor-pointer bg-card dark:bg-slate-800 border border-border dark:border-slate-700 shadow-none"
          onClick={() => navigate(createPageUrl('TripDetails') + '?id=' + trip.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                   <Plane className="w-4 h-4 text-sky-500" />
                   <span className="text-sm text-slate-500 dark:text-slate-400">{trip.segments?.[0]?.airline || 'Flight'}</span>
                  {isCurrent && (
                    <Badge className="bg-blue-500">{t('inProgress')}</Badge>
                  )}
                </div>
                <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                   {(trip.origin?.city || trip.origin?.code || '?')} → {(trip.destination?.city || trip.destination?.code || '?')}
                 </CardTitle>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>{format(parseISO(trip.departure_date), 'MMM d, yyyy')}</span>
              </div>
              {trip.return_date && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span>→</span>
                  <span>{format(parseISO(trip.return_date), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>

            {/* Flight Status Tracker - only for current trips */}
            {isCurrent && trip.segments?.length > 0 && (
              <div className="pt-3 border-t dark:border-slate-700">
                <FlightStatusTracker segments={trip.segments} />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t('booking')}: {trip.booking_reference}
              </div>
              <Button variant="outline" size="sm">
                {t('viewDetails')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950 flex items-center justify-center mx-auto mb-4">
        <Plane className="w-8 h-8 text-sky-300 dark:text-sky-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {type === 'upcoming' && t('noUpcomingTrips')}
        {type === 'current' && t('noCurrentTrips')}
        {type === 'past' && t('noPastTrips')}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm">
        {type === 'upcoming' && t('bookNextAdventure')}
        {type === 'current' && t('noTripsInProgress')}
        {type === 'past' && t('completedTripsHere')}
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-slate-950 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-background dark:bg-slate-950 text-foreground dark:text-slate-100" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
      {/* Hero Section with Logo */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-sky-500 to-teal-500 dark:from-sky-600 dark:via-sky-700 dark:to-teal-700">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')] bg-cover bg-center opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-6" style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' }}>
          {/* Header */}
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/src/assets/icon.svg" 
              alt="SkyLine Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          
          {/* Page Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">{t('myTrips')}</h2>
            <p className="text-white/90 text-sm">{t('viewManageBookings')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted">
            <TabsTrigger value="upcoming">{t('upcoming')}</TabsTrigger>
            <TabsTrigger value="current">{t('current')}</TabsTrigger>
            <TabsTrigger value="past">{t('past')}</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {categorizedTrips.upcoming.length > 0 ? (
              categorizedTrips.upcoming.map(trip => <TripCard key={trip.id} trip={trip} />)
            ) : (
              <EmptyState type="upcoming" />
            )}
          </TabsContent>

          <TabsContent value="current" className="space-y-4">
            {categorizedTrips.current.length > 0 ? (
              categorizedTrips.current.map(trip => <TripCard key={trip.id} trip={trip} />)
            ) : (
              <EmptyState type="current" />
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {categorizedTrips.past.length > 0 ? (
              categorizedTrips.past.map(trip => <TripCard key={trip.id} trip={trip} />)
            ) : (
              <EmptyState type="past" />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Cheap flight recommendations */}
      <div className="border-t dark:border-slate-800 pt-6 mt-2">
        <CheapFlightRecommendations homeAirport={homeAirport} />
      </div>

      <BottomNav />
      </div>
    </PullToRefresh>
  );
}