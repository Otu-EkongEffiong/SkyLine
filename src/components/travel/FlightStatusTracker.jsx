// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import { Bell, BellOff, Plane, Clock, MapPin, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getFlightStatus } from '@/components/api/amadeusClient';

export default function FlightStatusTracker({ trip, onStatusUpdate }) {
  const [isTracking, setIsTracking] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [flightStatus, setFlightStatus] = useState(null);

  useEffect(() => {
    // Check if notifications are supported and enabled
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Fetch real status from Amadeus Flight Schedule API
  const fetchStatus = useCallback(async () => {
    if (!trip?.carrierCode || !trip?.flightNumber) return;
    try {
      const date = trip.departureDate || trip.departureTime?.slice(0, 10);
      const live = await getFlightStatus(trip.carrierCode, trip.flightNumber, date);
      if (!live) return;

      const oldStatus = flightStatus;
      setFlightStatus(live);
      if (onStatusUpdate) onStatusUpdate(live);

      // Notify on important changes
      if (notificationsEnabled && oldStatus) {
        if (live.status === 'Delayed' && oldStatus.status !== 'Delayed') {
          sendNotification('Flight Delayed', `${live.origin} → ${live.destination} delayed by ${live.delay} min`);
        }
        if (live.gate && live.gate !== oldStatus.gate) {
          sendNotification('Gate Change', `Gate changed to ${live.gate} for ${live.flightNumber}`);
        }
        if (live.status === 'Boarding' && oldStatus.status !== 'Boarding') {
          sendNotification('Now Boarding', `${live.flightNumber} is boarding at gate ${live.gate || '—'}`);
        }
      }
    } catch (err) {
      console.warn('Flight status fetch failed:', err.message);
    }
  }, [trip, notificationsEnabled, flightStatus, onStatusUpdate]);

  useEffect(() => {
    if (!isTracking) return;
    fetchStatus(); // immediate check on start
    const interval = setInterval(fetchStatus, 120_000); // re-check every 2 min
    return () => clearInterval(interval);
  }, [isTracking, fetchStatus]);

  const sendNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
    toast.info(title, { description: body });
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported in this browser');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    
    if (permission === 'granted') {
      toast.success('Notifications enabled');
    } else {
      toast.error('Notification permission denied');
    }
  };

  const toggleTracking = () => {
    if (!isTracking && !notificationsEnabled) {
      requestNotificationPermission();
    }
    setIsTracking(!isTracking);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Time': return 'bg-green-100 text-green-700';
      case 'Delayed': return 'bg-red-100 text-red-700';
      case 'Boarding': return 'bg-blue-100 text-blue-700';
      case 'Departed': return 'bg-purple-100 text-purple-700';
      case 'Arrived': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'On Time': return <CheckCircle className="w-4 h-4" />;
      case 'Delayed': return <AlertCircle className="w-4 h-4" />;
      case 'Boarding': return <Plane className="w-4 h-4" />;
      case 'Departed': return <Plane className="w-4 h-4" />;
      case 'Arrived': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Can't track without flight number info
  if (isTracking && !trip?.carrierCode) {
    return (
      <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
        Flight tracking requires a carrier code and flight number.
        These are available after booking.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          size="sm"
          variant={isTracking ? "default" : "outline"}
          onClick={toggleTracking}
          className={isTracking ? "bg-amber-600 hover:bg-amber-700" : ""}
        >
          {isTracking ? (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Tracking Active
            </>
          ) : (
            <>
              <BellOff className="w-4 h-4 mr-2" />
              Enable Tracking
            </>
          )}
        </Button>
        {isTracking && (
          <Button size="sm" variant="ghost" onClick={fetchStatus} title="Refresh now">
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isTracking && flightStatus && (
        <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(flightStatus.status)}>
                {getStatusIcon(flightStatus.status)}
                <span className="ml-1">{flightStatus.status}</span>
              </Badge>
              {flightStatus.delay > 0 && (
                <span className="text-xs text-red-600 font-medium">+{flightStatus.delay} min</span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-3 h-3" />
              <span>Gate {flightStatus.gate}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <Clock className="w-3 h-3" />
              <span>Boarding: {flightStatus.boardingTime ? new Date(flightStatus.boardingTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBA'}</span>
            </div>
          </div>
        </div>
      )}

      {isTracking && !notificationsEnabled && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          Enable notifications to receive real-time alerts
        </div>
      )}
    </div>
  );
}