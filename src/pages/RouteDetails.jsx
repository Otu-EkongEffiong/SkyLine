// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Map, Shield, Plane, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/BottomNav';
import { createPageUrl } from '@/utils';
import { loadSelectedRoute, loadSearch } from '@/lib/searchStorage';
import { getFlagEmoji } from '@/components/travel/PassportSelector';
import { searchAirports } from '@/components/api/flightClient';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

function makeStopIcon(color) {
  return new L.DivIcon({
    className: 'route-stop-marker',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const ORIGIN_ICON = makeStopIcon('#10b981');      // Emerald — Departure
const DESTINATION_ICON = makeStopIcon('#ef4444'); // Red — Final Arrival

function visaMarkerColor(status) {
  switch (status) {
    case 'visa_free':
    case 'has_visa':        return '#10b981'; // Emerald
    case 'evisa':
    case 'visa_on_arrival': return '#f59e0b'; // Amber
    case 'visa_required':   return '#ef4444'; // Red
    default:                return '#94a3b8'; // Slate — Unknown
  }
}

function visaStatusLabel(status) {
  switch (status) {
    case 'visa_free':       return 'Visa free';
    case 'has_visa':        return 'You hold a visa';
    case 'evisa':           return 'e-Visa available';
    case 'visa_on_arrival': return 'Visa on arrival';
    case 'visa_required':   return 'Visa required';
    default:                return 'Visa status unknown';
  }
}

function useRouteCoordinates(orderedCodes) {
  const [coords, setCoords] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const uniqueCodes = [...new Set(orderedCodes)];
      const results = await Promise.all(
        uniqueCodes.map(async (code) => {
          try {
            const matches = await searchAirports(code);
            const exact = matches.find((a) => a.code === code) || matches[0];
            return exact ? [code, { lat: exact.lat, lon: exact.lon }] : null;
          } catch {
            return null;
          }
        })
      );
      if (cancelled) return;
      const map = Object.fromEntries(results.filter(Boolean));
      setCoords(map);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [orderedCodes.join(',')]);

  return { coords, loading };
}

function RouteMap({ route }) {
  const visaStatusByCode = useMemo(() => {
    const map = {};
    (route.connections || []).forEach((conn) => {
      if (conn.countryCode) map[conn.countryCode] = conn.visaStatus;
      if (conn.city) map[conn.city] = conn.visaStatus;
    });
    return map;
  }, [route]);

  const orderedCodes = useMemo(() => {
    if (!route?.segments?.length) return [];
    const codes = [route.segments[0].origin];
    route.segments.forEach((seg) => codes.push(seg.destination));
    return codes;
  }, [route]);

  const { coords, loading } = useRouteCoordinates(orderedCodes);

  const path = orderedCodes
    .map((code) => (coords[code] ? { code, ...coords[code] } : null))
    .filter(Boolean);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    );
  }

  if (path.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl text-sm text-slate-400">
        Route map unavailable for this itinerary.
      </div>
    );
  }

  const latLngs = path.map((p) => [p.lat, p.lon]);
  const centerLat = latLngs.reduce((sum, p) => sum + p[0], 0) / latLngs.length;
  const centerLon = latLngs.reduce((sum, p) => sum + p[1], 0) / latLngs.length;

  return (
    <div>
      <div className="h-64 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <MapContainer center={[centerLat, centerLon]} zoom={3} className="w-full h-full" scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <Polyline positions={latLngs} pathOptions={{ color: '#0ea5e9', weight: 3, dashArray: '6 6' }} />
          {path.map((p, i) => {
            const isFirst = i === 0;
            const isLast = i === path.length - 1;
            const layoverStatus = visaStatusByCode[p.code];
            
            const icon = isFirst
              ? ORIGIN_ICON
              : isLast
              ? DESTINATION_ICON
              : makeStopIcon(visaMarkerColor(layoverStatus));

            return (
              <Marker key={`${p.code}-${i}`} position={[p.lat, p.lon]} icon={icon}>
                <Popup>
                  <div className="p-0.5">
                    <span className="font-semibold">{p.code}</span>
                    {isFirst && ' · Departure'}
                    {isLast && ' · Arrival'}
                    {!isFirst && !isLast && ' · Layover'}
                    
                    {!isFirst && !isLast && (
                      <div className="mt-1 text-xs font-medium" style={{ color: visaMarkerColor(layoverStatus) }}>
                        {visaStatusLabel(layoverStatus)}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Visa-free / held
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> e-Visa / on arrival
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Visa required
        </span>
      </div>
    </div>
  );
}

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
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="w-4 h-4 text-sky-500" />
              Flight Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RouteMap route={route} />
          </CardContent>
        </Card>

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
              Live global flight map
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