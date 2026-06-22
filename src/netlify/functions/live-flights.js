// GET /.netlify/functions/live-flights
// Optional query params (OpenSky bounding box):
//   lamin, lomin, lamax, lomax  — decimal degrees
//   onGround=true|false         — filter by ground status (default: airborne only)
//
// Returns all (or viewport-filtered) aircraft state vectors from OpenSky
// Network. Free for anonymous use; set OPENSKY_USERNAME / OPENSKY_PASSWORD
// env vars to raise rate limits.
// Docs: https://openskynetwork.github.io/opensky-api/rest.html

const { ok, serverError, methodNotAllowed } = require('./_lib/http');

const OPENSKY_BASE_URL = 'https://opensky-network.org/api/states/all';

function openskyHeaders() {
  const headers = {};
  const { OPENSKY_USERNAME, OPENSKY_PASSWORD } = process.env;
  if (OPENSKY_USERNAME && OPENSKY_PASSWORD) {
    const basic = Buffer.from(`${OPENSKY_USERNAME}:${OPENSKY_PASSWORD}`).toString('base64');
    headers.Authorization = `Basic ${basic}`;
  }
  return headers;
}

function parseOnGroundFilter(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null; // no filter
}

/**
 * Map an OpenSky "state vector" array to a plain object.
 * Schema: https://openskynetwork.github.io/opensky-api/rest.html#response
 */
function normalizeState(state) {
  const [
    icao24,
    callsign,
    originCountry,
    timePosition,
    lastContact,
    longitude,
    latitude,
    baroAltitude,
    onGround,
    velocity,
    trueTrack,
    verticalRate,
    ,
    geoAltitude,
    squawk,
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

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  const params = event.queryStringParameters || {};
  const onGroundFilter = parseOnGroundFilter(params.onGround);

  try {
    const url = new URL(`${OPENSKY_BASE_URL}/states/all`);

    // Optional viewport filter — keeps payloads smaller for map views.
    for (const key of ['lamin', 'lomin', 'lamax', 'lomax']) {
      if (params[key] !== undefined && params[key] !== '') {
        url.searchParams.set(key, params[key]);
      }
    }

    const res = await fetch(url.toString(), { headers: openskyHeaders() });
    if (!res.ok) throw new Error(`OpenSky request failed (${res.status})`);

    const data = await res.json();
    const states = data?.states || [];

    const flights = states
      .map(normalizeState)
      .filter((flight) => {
        if (flight.lat == null || flight.lon == null) return false;
        if (onGroundFilter === null) return !flight.onGround;
        return flight.onGround === onGroundFilter;
      });

    return ok({
      time: data.time ?? null,
      count: flights.length,
      flights,
    });
  } catch (err) {
    console.error('live-flights error:', err);
    return serverError(err.message || 'Could not fetch live flights.');
  }
};
