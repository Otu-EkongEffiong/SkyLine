// @ts-nocheck
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Loader2, Plane } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/BottomNav';
import { getLiveFlights } from '@/components/api/flightClient';

// Fix default asset bundling issues for Leaflet markers inside Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Cache plane icons by heading to prevent creating thousands of DOM elements
const iconCache = new Map();
const getPlaneIcon = (heading = 0) => {
  const roundedHeading = Math.round(heading / 5) * 5; // Group headings by 5-degree steps
  if (iconCache.has(roundedHeading)) {
    return iconCache.get(roundedHeading);
  }

  const icon = new L.DivIcon({
    className: 'custom-plane-marker',
    html: `
      <div style="transform: rotate(${roundedHeading}deg); transition: transform 0.3s; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-1.1-.3-2.2.4-2.4 1.5-.2.8.3 1.7 1 2l6.2 2.5-3.8 3.8-3.1-.8c-.6-.2-1.3.1-1.6.6-.4.7-.2 1.6.4 2l4.1 2.4 2.4 4.1c.4.6 1.3.8 2 .4.5-.3.8-1 .6-1.6l-.8-3.1 3.8-3.8 2.5 6.2c.3.7 1.2 1.2 2 1a2 2 0 0 0 1.5-2.4Z"/>
        </svg>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  iconCache.set(roundedHeading, icon);
  return icon;
};

// Tracks map movement with debouncing to prevent trigger loops
function BoundsWatcher({ onBoundsChange }) {
  const timerRef = useRef(null);

  useMapEvents({
    moveend: (e) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      // Debounce bounds update by 500ms
      timerRef.current = setTimeout(() => {
        const bounds = e.target.getBounds();
        onBoundsChange({
          lamin: bounds.getSouth().toFixed(4),
          lamax: bounds.getNorth().toFixed(4),
          lomin: bounds.getWest().toFixed(4),
          lomax: bounds.getEast().toFixed(4),
        });
      }, 500);
    },
  });

  return null;
}

export default function LiveMap() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const [bounds, setBounds] = useState({
    lamin: 24.396308,
    lamax: 49.384358,
    lomin: -124.848974,
    lomax: -66.885444
  });

  // Store bounds in a ref so fetchFlights doesn't invalidate on every bounds change
  const boundsRef = useRef(bounds);
  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);

  // Stable API fetcher function
  const fetchFlights = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLiveFlights(boundsRef.current);
      setFlights(data.flights || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('LiveMap telemetry acquisition failure:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when bounds change
  useEffect(() => {
    fetchFlights();
  }, [bounds, fetchFlights]);

  // Set up 30-second interval polling
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchFlights();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchFlights]);

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-[1000] bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-base font-bold">Live Flight Map</h1>
            <p className="text-xs text-slate-400">
              {loading ? 'Scanning airspace…' : `${flights.length} aircraft tracked · updated ${lastUpdated?.toLocaleTimeString() || ''}`}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchFlights} 
            disabled={loading} 
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-1 w-full relative min-h-[calc(100vh-140px)]">
        <MapContainer 
          center={[39.8283, -98.5795]} 
          zoom={4} 
          className="absolute inset-0 w-full h-full z-10"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <BoundsWatcher onBoundsChange={setBounds} />

          {flights.map((f) => (
            <Marker
              key={f.icao24}
              position={[f.lat, f.lon]}
              icon={getPlaneIcon(f.heading || 0)}
            >
              <Popup className="dark-popup">
                <div className="text-sm p-1 space-y-1.5 min-w-[180px] text-slate-900 dark:text-slate-100">
                  <div className="font-bold flex items-center justify-between border-b pb-1 border-slate-200">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Plane className="w-3.5 h-3.5 text-sky-500" />
                      {f.callsign?.trim() || f.icao24.toUpperCase()}
                    </span>
                    {!f.onGround ? (
                      <Badge className="bg-sky-500 text-white font-normal text-[10px] px-1.5 py-0">Airborne</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">GND</Badge>
                    )}
                  </div>
                  <div className="text-xs space-y-0.5 text-slate-600 font-medium">
                    <p>Altitude: <span className="font-mono text-slate-900">{f.altitude ? `${Math.round(f.altitude * 3.28084).toLocaleString()} ft` : '—'}</span></p>
                    <p>Ground Speed: <span className="font-mono text-slate-900">{f.velocity ? `${Math.round(f.velocity * 1.94384)} kt` : '—'}</span></p>
                    <p>Heading: <span className="font-mono text-slate-900">{f.heading != null ? `${Math.round(f.heading)}°` : '—'}</span></p>
                    <p className="text-[11px] italic text-slate-400 mt-1">{f.originCountry || 'Unknown Registration'}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <BottomNav />
    </div>
  );
}