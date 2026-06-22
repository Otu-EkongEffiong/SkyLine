// GET /.netlify/functions/flight-status?carrier=BA&number=117&date=2026-08-01
//
// Backs FlightStatusTracker.jsx / TripDetails.jsx. Uses FlightAware
// AeroAPI for gate, terminal, delay, and operational status.

const { ok, badRequest, serverError, methodNotAllowed } = require('./_lib/http');

const AEROAPI_BASE_URL = 'https://aeroapi.flightaware.com/aeroapi';

function mapAeroApiStatus(flight) {
  if (!flight) return null;

  let status = 'Scheduled';
  if (flight.cancelled) status = 'Cancelled';
  else if (flight.diverted) status = 'Diverted';
  else if (flight.actual_off && !flight.actual_on) status = 'Departed';
  else if (flight.actual_on) status = 'Arrived';
  else if (flight.departure_delay > 0) status = 'Delayed';

  return {
    status,
    delay: Math.round((flight.departure_delay || 0) / 60),
    gate: flight.gate_origin || null,
    terminal: flight.terminal_origin || null,
    boardingTime: flight.scheduled_off || null,
    flightNumber: flight.ident,
    origin: flight.origin?.code_iata,
    destination: flight.destination?.code_iata,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  const { carrier, number, date } = event.queryStringParameters || {};
  if (!carrier || !number) {
    return badRequest('carrier and number are required.');
  }

  const apiKey = process.env.FLIGHTAWARE_API_KEY;
  if (!apiKey) return serverError('FLIGHTAWARE_API_KEY is not configured.');

  const ident = `${carrier}${number}`;

  try {
    const params = new URLSearchParams({ max_pages: '1' });
    if (date) {
      params.set('start', `${date}T00:00:00Z`);
      params.set('end', `${date}T23:59:59Z`);
    }

    const res = await fetch(`${AEROAPI_BASE_URL}/flights/${ident}?${params.toString()}`, {
      headers: { 'x-apikey': apiKey },
    });

    if (!res.ok) {
      if (res.status === 404) return ok({ status: null });
      throw new Error(`FlightAware request failed (${res.status})`);
    }

    const data = await res.json();
    const flight = data?.flights?.[0] || null;

    return ok({ status: mapAeroApiStatus(flight) });
  } catch (err) {
    console.error('flight-status error:', err);
    return serverError(err.message || 'Could not fetch flight status.');
  }
};
