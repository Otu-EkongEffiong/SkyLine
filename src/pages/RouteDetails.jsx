// @ts-nocheck
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Map, Shield, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/BottomNav';
import { createPageUrl } from '@/utils';
import { loadSelectedRoute, loadSearch } from '@/lib/searchStorage';
import { getFlagEmoji } from '@/components/travel/PassportSelector';

export default function RouteDetails() {
  const navigate = useNavigate();
  const route = loadSelectedRoute();
  const search = loadSearch();

  if (!route) {
    navigate(createPageUrl('Home'));
    return null;
  }

  const formatTime = (t) => {
    if (!t) return '—';
    if (t.includes('T')) return new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return t;
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Route Details</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          {route.isRecommended && <Badge className="bg-emerald-600 text-white">Recommended</Badge>}
          {route.hasVisaIssue && <Badge variant="destructive">Visa required</Badge>}
          {route.score != null && (
            <Badge variant="outline" className="gap-1">
              <Shield className="w-3 h-3" />
              Score {route.score}/100
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Itinerary</span>
              <span className="text-2xl font-bold">${Math.round(route.price)}</span>
            </CardTitle>
            <p className="text-sm text-slate-500">Total duration: {route.totalDuration}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {route.segments?.map((seg, i) => (
              <div key={i} className="border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="w-4 h-4 text-sky-500" />
                  <span className="font-medium">{seg.airline} · {seg.flightNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-2xl font-bold">{formatTime(seg.departureTime)}</p>
                    <p className="font-semibold">{seg.origin}</p>
                    <p className="text-slate-500">{seg.originAirport}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatTime(seg.arrivalTime)}</p>
                    <p className="font-semibold">{seg.destination}</p>
                    <p className="text-slate-500">{seg.destinationAirport}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Duration: {seg.duration}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {route.connections?.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Transit & visa checks</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {route.connections.map((conn, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  {conn.countryCode && <span className="text-xl">{getFlagEmoji(conn.countryCode)}</span>}
                  <div className="flex-1">
                    <p className="font-medium">{conn.city || conn.countryCode}</p>
                    <p className="text-xs text-slate-500">Layover {conn.layoverTime}</p>
                  </div>
                  <Badge variant={conn.visaStatus === 'visa_required' ? 'destructive' : 'secondary'}>
                    {conn.visaStatus?.replace(/_/g, ' ') || 'unknown'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {route.hasVisaIssue && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">
              This route requires visas you may not hold. Review transit and destination requirements before booking.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={createPageUrl('LiveMap')} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Map className="w-4 h-4" />
              Live flight map
            </Button>
          </Link>
          <Button
            className="flex-1 bg-orange-500 hover:bg-orange-600"
            onClick={() => navigate(createPageUrl('Checkout'))}
          >
            Continue to checkout
          </Button>
        </div>

        {search && (
          <p className="text-xs text-center text-slate-400">
            {search.origin.code} → {search.destination.code} · {search.departureDate}
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
