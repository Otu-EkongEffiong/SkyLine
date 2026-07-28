// netlify/functions/live-flights.js
//
// GET /.netlify/functions/live-flights
// Optional query params (OpenSky bounding box):
//   lamin, lomin, lamax, lomax  — decimal degrees, viewport bounds
//   onGround=true|false         — filter by ground status (default: airborne only)

import { ok, badRequest, serverError, methodNotAllowed } from './_lib/http.js';
import { getOpenSkyAuthHeaders } from './_lib/openskyAuth.js';

const OPENSKY_STATES_URL = 'https://opensky-network.org/api/states/all';
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 15000; // OpenSky refreshes ~every 10-15s anyway; no point calling more often per bbox
const MAX_FLIGHTS_RETURNED = 800;

// In-memory cache, keyed by rounded bbox. Persists across warm
// invocations of the same function instance — not guaranteed, but
// meaningfully reduces upstream calls under normal traffic without
// needing an external cache store for a diploma-scope project.
const cache = new Map();

function parseOnGroundFilter(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

function parseBboxParam(value) {
  if (value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN; // NaN signals "present but invalid"
}

function cacheKeyFor({ lamin, lomin, lamax, lomax, onGroundFilter }) {
  // Round to 1 decimal (~11km) so nearby pans/zooms share a cache
  // entry instead of each producing a unique key.
  const round = (n) => (n == null ? 'x' : n.toFixed(1));
  return `${round(lamin)},${round(lomin)},${round(lamax)},${round(lomax)},${onGroundFilter}`;
}

function normalizeState(state) {
  if (!Array.isArray(state) || state.length < 17) return null; // malformed row — skip, don't throw

  const [
    icao24, callsign, originCountry, timePosition, lastContact,
    longitude, latitude, baroAltitude, onGround, velocity,
    trueTrack, verticalRate, , geoAltitude, squawk,
  ] = state;

  return {
    icao24: icao24 || null,
    callsign: (callsign || '').trim() || null,
    originCountry: originCountry || null,
    lat: latitude,
    lon: longitude,
    altitude: baroAltitude ?? geoAltitude ?? null,
    onGround: Boolean(onGround),
    velocity,
    heading: trueTrack,
    verticalRate,
    squawk: squawk || null,
    timePosition,
    lastContact,
  };
}

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  const params = event.queryStringParameters || {};
  const onGroundFilter = parseOnGroundFilter(params.onGround);

  const lamin = parseBboxParam(params.lamin);
  const lomin = parseBboxParam(params.lomin);
  const lamax = parseBboxParam(params.lamax);
  const lomax = parseBboxParam(params.lomax);

  // Reject malformed bbox input locally instead of wasting an upstream call.
  const bboxValues = [lamin, lomin, lamax, lomax];
  if (bboxValues.some((v) => Number.isNaN(v))) {
    return badRequest('lamin/lomin/lamax/lomax must be valid numbers.');
  }
  if (lamin != null && lamax != null && lamin > lamax) {
    return badRequest('lamin must be less than or equal to lamax.');
  }

  const cacheKey = cacheKeyFor({ lamin, lomin, lamax, lomax, onGroundFilter });
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return ok({ ...cached.body, cached: true });
  }

  try {
    const url = new URL(OPENSKY_STATES_URL);
    if (lamin != null) url.searchParams.set('lamin', lamin);
    if (lomin != null) url.searchParams.set('lomin', lomin);
    if (lamax != null) url.searchParams.set('lamax', lamax);
    if (lomax != null) url.searchParams.set('lomax', lomax);

    const headers = await getOpenSkyAuthHeaders();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res;
    try {
      res = await fetch(url.toString(), { headers, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      const bodyText = await res.text().catch(() => '');
      throw new Error(`OpenSky request failed (${res.status}): ${bodyText.slice(0, 200)}`);
    }

    const data = await res.json();
    const states = data?.states || [];

    const flights = states
      .map(normalizeState)
      .filter((flight) => {
        if (!flight) return false;
        if (flight.lat == null || flight.lon == null) return false;
        if (onGroundFilter === null) return !flight.onGround;
        return flight.onGround === onGroundFilter;
      })
      .slice(0, MAX_FLIGHTS_RETURNED);

    const responseBody = { time: data.time ?? null, count: flights.length, flights };
    cache.set(cacheKey, { body: responseBody, timestamp: Date.now() });

    return ok(responseBody);
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    console.error('live-flights error:', isTimeout ? 'request timed out' : err);
    return serverError(isTimeout ? 'OpenSky request timed out.' : (err.message || 'Could not fetch live flights.'));
  }
};