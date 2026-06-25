// Docs on request and context https://docs netlify.com/functions/build/#code-your-function-2
 

/**
 * netlify/functions/flights-cheapest-dates.js

// GET / netlify/functions/flights-cheapest-dates?origin=LOS&destination=LHR&from=2026-08-01&to=2026-08-31
//
// Powers FlightCalendar.jsx's price-by-day grid. Uses Kiwi.com Tequila's
// flexible date search since it's optimized for exactly this — scanning
// a date range for the cheapest fares — without needing N separate
// Duffel searches.
*/

const { ok, badRequest, serverError, methodNotAllowed } = require('./_lib/http');
const kiwi = require('./_lib/kiwiClient');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  const { origin, destination, from, to } = event.queryStringParameters || {};
  if (!origin || !destination || !from || !to) {
    return badRequest('origin, destination, from, and to are required.');
  }

  try {
    const data = await kiwi.searchCheapestDates({
      origin,
      destination,
      dateFrom: from,
      dateTo: to,
    });

    // Reduce to { 'yyyy-MM-dd': cheapestPriceForThatDay }
    const prices = {};
    for (const flight of data?.data || []) {
      const day = flight.local_departure?.slice(0, 10);
      if (!day) continue;
      if (prices[day] === undefined || flight.price < prices[day]) {
        prices[day] = flight.price;
      }
    }

    return ok({ prices });
  } catch (err) {
    console.error('flights-cheapest-dates error:', err);
    // Kiwi is an optional provider — fail soft so the calendar can show
    // "no data" instead of breaking the page.
    return ok({ prices: {}, warning: 'Cheapest-dates lookup unavailable.' });
  }
};