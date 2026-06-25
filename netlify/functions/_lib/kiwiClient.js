/**
 * netlify/functions/_lib/kiwiClient.js
 * Thin wrapper around the Kiwi.com Tequila API.
 * Docs: https://tequila.kiwi.com/portal/docs/tequila_api
 *
 * Used as an OPTIONAL secondary provider for low-cost / flexible-date /
 * creative-routing search. Duffel remains the primary provider for
 * booking-grade search and order creation.
 */

const TEQUILA_BASE_URL = 'https://api.tequila.kiwi.com';

function getTequilaHeaders() {
  const apiKey = process.env.KIWI_TEQUILA_API_KEY;
  if (!apiKey) {
    throw new Error('KIWI_TEQUILA_API_KEY is not configured.');
  }
  return { apikey: apiKey };
}

/**
 * Search one-way/round-trip flights on Kiwi Tequila.
 * https://tequila.kiwi.com/portal/docs/tequila_api/search_api
 */
async function searchFlights({ origin, destination, dateFrom, dateTo, returnFrom, returnTo, limit = 20 }) {
  const params = new URLSearchParams({
    fly_from: origin,
    fly_to: destination,
    date_from: dateFrom,
    date_to: dateTo || dateFrom,
    limit: String(limit),
    curr: 'USD',
  });
  if (returnFrom) params.set('return_from', returnFrom);
  if (returnTo) params.set('return_to', returnTo);

  const res = await fetch(`${TEQUILA_BASE_URL}/v2/search?${params.toString()}`, {
    headers: getTequilaHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Kiwi Tequila search failed (${res.status})`);
  }
  return res.json();
}

/**
 * Flexible-date "cheapest dates" lookup, used to populate the
 * FlightCalendar price grid.
 * https://tequila.kiwi.com/portal/docs/tequila_api/nomad_api (date range search)
 */
async function searchCheapestDates({ origin, destination, dateFrom, dateTo }) {
  const params = new URLSearchParams({
    fly_from: origin,
    fly_to: destination,
    date_from: dateFrom,
    date_to: dateTo,
    curr: 'USD',
    limit: '1000',
    sort: 'price',
  });

  const res = await fetch(`${TEQUILA_BASE_URL}/v2/search?${params.toString()}`, {
    headers: getTequilaHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Kiwi Tequila date search failed (${res.status})`);
  }
  return res.json();
}

export { searchFlights, searchCheapestDates };