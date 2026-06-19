// @ts-nocheck
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Share2, Plane, Clock, MapPin, User, QrCode, Download, Mail, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import FlightStatusTracker from '@/components/travel/FlightStatusTracker';
import BottomNav from '@/components/BottomNav';

export default function TripDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [shareEmail, setShareEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  
  // Get trip ID from URL
  const tripId = new URLSearchParams(window.location.search).get('id');
  
  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => JSON.parse(localStorage.getItem('skypath_trips') || '[]').find(t => t.id === tripId) || null,
    enabled: !!tripId,
  });

  const shareItineraryMutation = useMutation({
    mutationFn: async (email) => {
      const currentShared = trip.shared_with || [];
      if (currentShared.includes(email)) {
        throw new Error('Already shared with this email');
      }
      
      // Trip update — save to localStorage
      const trips = JSON.parse(localStorage.getItem('skypath_trips') || '[]');
      const idx = trips.findIndex(t => t.id === trip.id);
      if (idx >= 0) trips[idx] = { ...trips[idx], shared_with: [...currentShared, email] };
      localStorage.setItem('skypath_trips', JSON.stringify(trips));

      // Send email with itinerary
      console.log('Email would be sent:', {
        to: email,
        subject: `Flight Itinerary Shared: ${trip.origin.city} → ${trip.destination.city}`,
        body: `
          <h2>Flight Itinerary</h2>
          <p><strong>Booking Reference:</strong> ${trip.booking_reference}</p>
          <p><strong>Route:</strong> ${trip.origin.city} (${trip.origin.code}) → ${trip.destination.city} (${trip.destination.code})</p>
          <p><strong>Departure:</strong> ${format(parseISO(trip.departure_date), 'PPP p')}</p>
          <p><strong>Arrival:</strong> ${format(parseISO(trip.arrival_date), 'PPP p')}</p>
          
          <h3>Flight Segments:</h3>
          ${trip.segments.map(seg => `
            <p>
              <strong>${seg.airline} ${seg.flight_number}</strong><br/>
              ${seg.origin} → ${seg.destination}<br/>
              Departs: ${seg.departure_time} | Arrives: ${seg.arrival_time}
            </p>
          `).join('')}
        `
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      toast.success('Itinerary shared successfully');
      setShareEmail('');
      setIsSharing(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to share itinerary');
    }
  });

  const handleShare = () => {
    if (!shareEmail) return;
    shareItineraryMutation.mutate(shareEmail);
  };

  const downloadItinerary = () => {
    const content = `
FLIGHT ITINERARY
================

Booking Reference: ${trip.booking_reference}
Route: ${trip.origin.city} → ${trip.destination.city}
Departure: ${format(parseISO(trip.departure_date), 'PPP p')}
Arrival: ${format(parseISO(trip.arrival_date), 'PPP p')}

FLIGHT SEGMENTS
---------------
${trip.segments.map(seg => `
${seg.airline} ${seg.flight_number}
${seg.origin} → ${seg.destination}
Departs: ${seg.departure_time}
Arrives: ${seg.arrival_time}
Duration: ${seg.duration}
`).join('\n')}

PASSENGERS
----------
${trip.passengers?.map(p => `${p.name} - Seat: ${p.seat || 'Not assigned'}`).join('\n') || 'No passengers listed'}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerary-${trip.booking_reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Trip not found</p>
          <Button onClick={() => navigate(createPageUrl('MyTrips'))}>
            Back to My Trips
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    const config = {
      upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' },
      current: { label: 'In Progress', color: 'bg-green-100 text-green-700' },
      completed: { label: 'Completed', color: 'bg-slate-100 text-slate-700' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' }
    }[trip.status] || { label: trip.status, color: 'bg-slate-100 text-slate-700' };
    
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('MyTrips')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Trip Details</h1>
                <p className="text-sm text-slate-500">{trip.booking_reference}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Dialog open={isSharing} onOpenChange={setIsSharing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share Itinerary
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Itinerary</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Send this itinerary to friends or family via email
                </p>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
                {trip.shared_with?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Already shared with:</p>
                    <div className="flex flex-wrap gap-2">
                      {trip.shared_with.map((email, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Button 
                  onClick={handleShare}
                  disabled={!shareEmail || shareItineraryMutation.isPending}
                  className="w-full"
                >
                  {shareItineraryMutation.isPending ? 'Sharing...' : 'Share'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="gap-2" onClick={downloadItinerary}>
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>

        {/* Route Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Route Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-2xl font-bold">{trip.origin.code}</p>
                <p className="text-sm text-slate-600">{trip.origin.city}</p>
                <p className="text-xs text-slate-500">{trip.origin.airport}</p>
              </div>
              <div className="flex-shrink-0 mx-4">
                <Plane className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-2xl font-bold">{trip.destination.code}</p>
                <p className="text-sm text-slate-600">{trip.destination.city}</p>
                <p className="text-xs text-slate-500">{trip.destination.airport}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-slate-500 mb-1">Departure</p>
                <p className="font-medium">{format(parseISO(trip.departure_date), 'PPP')}</p>
                <p className="text-sm text-slate-600">{format(parseISO(trip.departure_date), 'p')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Arrival</p>
                <p className="font-medium">{format(parseISO(trip.arrival_date), 'PPP')}</p>
                <p className="text-sm text-slate-600">{format(parseISO(trip.arrival_date), 'p')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flight Status Tracker */}
        {trip.status === 'current' && (
          <FlightStatusTracker segments={trip.segments} />
        )}

        {/* Flight Segments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Flight Segments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trip.segments.map((segment, index) => (
              <div key={index} className={`p-4 rounded-lg border ${index > 0 ? 'mt-4 pt-4 border-t' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{segment.airline} {segment.flight_number}</p>
                    <p className="text-sm text-slate-600">{segment.origin} → {segment.destination}</p>
                  </div>
                  {segment.status && (
                    <Badge variant="outline" className="text-xs">
                      {segment.status}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Departure</p>
                    <p className="font-medium">{segment.departure_time}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Arrival</p>
                    <p className="font-medium">{segment.arrival_time}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Duration: {segment.duration}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Passengers */}
        {trip.passengers?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Passengers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trip.passengers.map((passenger, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-medium">{passenger.name}</p>
                        {passenger.passport_number && (
                          <p className="text-xs text-slate-500">Passport: {passenger.passport_number}</p>
                        )}
                      </div>
                    </div>
                    {passenger.seat && (
                      <Badge variant="outline">Seat {passenger.seat}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Booking Reference</span>
              <span className="font-mono font-semibold">{trip.booking_reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Price</span>
              <span className="font-semibold">{trip.currency} {trip.price.toFixed(2)}</span>
            </div>
            {trip.confirmation_email && (
              <div className="flex justify-between">
                <span className="text-slate-600">Confirmation Email</span>
                <span className="text-sm">{trip.confirmation_email}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Alert */}
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="ml-2 text-green-800">
            <strong>Booking Confirmed</strong> - All flight segments are confirmed and ticketed.
          </AlertDescription>
        </Alert>
      </div>

      <BottomNav />
    </div>
  );
}