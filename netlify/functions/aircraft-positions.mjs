// GET / netlify/functions/aircraft-position?icao24=4ca7b6
//
// Powers the live flight-path map. OpenSky Network's REST API is free
// for anonymous/limited use (no key required, but credentials can be
// added via OPENSKY_USERNAME/OPENSKY_PASSWORD env vars to raise rate
// limits). Docs: https://openskynetwork.github.io/opensky-api/rest.html

const { ok, badRequest, serverError, methodNotAllowed } = require('./_lib/http');

const OPENSKY_BASE_URL = 'https://opensky-network.org/api';

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  const { icao24 } = event.queryStringParameters || {};
  if (!icao24) return badRequest('icao24 is required.');

  try {
    const headers = {};
    const { OPENSKY_USERNAME, OPENSKY_PASSWORD } = process.env;
    if (OPENSKY_USERNAME && OPENSKY_PASSWORD) {
      const basic = Buffer.from(`${OPENSKY_USERNAME}:${OPENSKY_PASSWORD}`).toString('base64');
      headers.Authorization = `Basic ${basic}`;
    }

    const res = await fetch(`${OPENSKY_BASE_URL}/states/all?icao24=${icao24.toLowerCase()}`, { headers });
    if (!res.ok) throw new Error(`OpenSky request failed (${res.status})`);

    const data = await res.json();
    const state = data?.states?.[0];

    if (!state) return ok({ position: null });

    // OpenSky "state vector" array indices, per their documented schema.
    const [, , , , , longitude, latitude, baroAltitude, , velocity, heading] = state;

    return ok({
      position: {
        lat: latitude,
        lon: longitude,
        altitude: baroAltitude,
        heading,
        velocity,
      },
    });
  } catch (err) {
    console.error('aircraft-position error:', err);
    return serverError(err.message || 'Could not fetch live position.');
  }
};