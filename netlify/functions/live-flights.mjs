// netlify/functions/live-flights.js
//
// GET /.netlify/functions/live-flights
// Optional query params (OpenSky bounding box):
//   lamin, lomin, lamax, lomax  — decimal degrees, viewport bounds
//   onGround=true|false         — filter by ground status (default: airborne only)
//
// FIXED: OpenSky retired Basic Auth (username/password)

import { ok, serverError, methodNotAllowed } from './_lib/http';
import { getOpenSkyAuthHeaders } from './_lib/openskyAuth';

const OPENSKY_STATES_URL = 'https://opensky-network.org/api/states/all';

function parseOnGroundFilter(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

function normalizeState(state) {
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

  try {
    const url = new URL(OPENSKY_STATES_URL);
    for (const key of ['lamin', 'lomin', 'lamax', 'lomax']) {
      if (params[key] !== undefined && params[key] !== '') {
        url.searchParams.set(key, params[key]);
      }
    }

    const headers = await getOpenSkyAuthHeaders();
    const res = await fetch(url.toString(), { headers });

    if (!res.ok) {
      // Surface the real status instead of a generic error — helps
      // distinguish "no data for this bbox right now" (204/empty)
      // from real auth failures (401/403) at a glance in the logs.
      const bodyText = await res.text().catch(() => '');
      throw new Error(`OpenSky request failed (${res.status}): ${bodyText.slice(0, 200)}`);
    }

    const data = await res.json();
    const states = data?.states || [];

    const flights = states.map(normalizeState).filter((flight) => {
      if (flight.lat == null || flight.lon == null) return false;
      if (onGroundFilter === null) return !flight.onGround;
      return flight.onGround === onGroundFilter;
    });

    return ok({ time: data.time ?? null, count: flights.length, flights });
  } catch (err) {
    console.error('live-flights error:', err);
    return serverError(err.message || 'Could not fetch live flights.');
  }
};