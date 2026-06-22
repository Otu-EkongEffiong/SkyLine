// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plane, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { getLiveFlights } from '@/components/api/flightClient';

// Fix default marker icons in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const planeIcon = new L.DivIcon({
  className: 'plane-marker',
  html: '<div style="font-size:18px;transform:rotate(0deg)">✈️</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function BoundsWatcher({ onBoundsChange }) {
  useMapEvents({
    moveend: (e) => {
      const b = e.target.getBounds();
      onBoundsChange({
        lamin: b.getSouth().toFixed(4),
        lamax: b.getNorth().toFixed(4),
        lomin: b.getWest().toFixed(4),
        lomax: b.getEast().toFixed(4),
      });
    },
  });
  return null;
}

export default function LiveMap() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bounds, setBounds] = useState({ lamin: 25, lamax: 50, lomin: -130, lomax: -60 });
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchFlights = useCallback(async (b = bounds) => {
    setLoading(true);
    try {
      const data = await getLiveFlights(b);
      setFlights(data.flights || []);
      setLastUpdate(data.time ? new Date(data.time * 1000) : new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [bounds]);

  useEffect(() => {
    fetchFlights(bounds);
    const id = setInterval(() => fetchFlights(bounds), 20000);
    return () => clearInterval(id);
  }, [bounds]);

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/95 border-b border-slate-700 z-[1000]">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-white font-bold">Live Flight Map</h1>
          <p className="text-xs text-slate-400">
            {flights.length} aircraft · OpenSky Network
            {lastUpdate && ` · Updated ${lastUpdate.toLocaleTimeString()}`}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1 border-slate-600 text-white" onClick={() => fetchFlights(bounds)} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex-1 relative">
        <MapContainer center={[39.8, -98.5]} zoom={4} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <BoundsWatcher onBoundsChange={setBounds} />
          {flights.map((f) => (
            <Marker
              key={f.icao24}
              position={[f.lat, f.lon]}
              icon={planeIcon}
            >
              <Popup>
                <div className="text-sm space-y-1 min-w-[160px]">
                  <p className="font-bold flex items-center gap-1">
                    <Plane className="w-3 h-3" />
                    {f.callsign || f.icao24}
                  </p>
                  <p>Alt: {f.altitude ? `${Math.round(f.altitude)} m` : '—'}</p>
                  <p>Speed: {f.velocity ? `${Math.round(f.velocity * 1.944)} kt` : '—'}</p>
                  <p>Heading: {f.heading != null ? `${Math.round(f.heading)}°` : '—'}</p>
                  <p className="text-xs text-slate-500">{f.originCountry || 'Unknown origin'}</p>
                  {!f.onGround && <Badge className="text-xs">Airborne</Badge>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
