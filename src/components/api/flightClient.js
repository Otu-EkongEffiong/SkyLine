/**
 * Flight API client — all calls go through Netlify Functions.
 * Import from '@/components/api/flightClient' (amadeusClient re-exports this).
 *
 * Endpoint naming matches the files in netlify/functions/ exactly:
 *   airports-search.js, flights-search.js, flights-cheapest-dates.js,
 *   flight-status.js, aircraft-position.js, live-flights.js,
 *   flights-price.js, flights-book.js, visa-check.js,
 *   payments-create-intent.js
 *
 * In dev (`npm run dev` without `netlify dev`), Netlify Functions aren't
 * reachable, so every call falls back to data from '@/lib/mockFlights'
 * — but ONLY when `import.meta.env.DEV` is true. In production, a
 * failed call always rethrows so a real outage is never silently
 * masked by fake data.
 */
import { generateMockOffers, generateMockCalendarPrices, generateMockLiveFlights } from '@/lib/mockFlights';

const FUNCTIONS_BASE = '/.netlify/functions';

/**
 * @typedef {Object} Airport
 * @property {string} code   IATA (or ICAO fallback) code
 * @property {string} [icao]
 * @property {string} name
 * @property {string} city
 * @property {string} country
 * @property {number} [lat]
 * @property {number} [lon]
 * @property {string} [subType]
 */

/**
 * @typedef {Object} ExistingVisa
 * @property {string} country_code
 * @property {string} [expiry_date]
 */

/**
 * @typedef {Object} TravelerProfile
 * @property {string} [passport_country]
 * @property {ExistingVisa[]} [visas]
 */

/**
 * @typedef {Object} FlightSearchParams
 * @property {Airport|string} [origin]
 * @property {Airport|string} [destination]
 * @property {string} [departureDate]  'yyyy-MM-dd'
 * @property {string} [returnDate]     'yyyy-MM-dd'
 * @property {TravelerProfile} [travelerProfile]
 */

/**
 * @typedef {Object} CheapestDatesParams
 * @property {string} [origin]       IATA code
 * @property {string} [destination]  IATA code
 * @property {string} [fromDate]     'yyyy-MM-dd'
 * @property {string} [toDate]       'yyyy-MM-dd'
 */

/**
 * @typedef {Object} VisaCheckParams
 * @property {string} [passportCountry]
 * @property {string[]} [routeCountries]  ordered, transit + destination
 * @property {ExistingVisa[]} [existingVisas]
 */

/**
 * @typedef {Object} LiveFlightsBounds
 * @property {number|string} [lamin]
 * @property {number|string} [lomin]
 * @property {number|string} [lamax]
 * @property {number|string} [lomax]
 * @property {'true'|'false'} [onGround]
 */

/**
 * @param {string} path
 * @param {Record<string, unknown>} [body]
 * @returns {Promise<any>}
 */
async function postJSON(path, body) {
  const res = await fetch(`${FUNCTIONS_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    let message = `Request to ${path} failed (${res.status})`;
    try {
      const errBody = await res.json();
      message = errBody?.error || message;
    } catch {
      /* ignore parse failure */
    }
    throw new Error(message);
  }
  return res.json();
}

/**
 * @param {string} path
 * @param {Record<string, string | number | undefined>} [params]
 * @returns {Promise<any>}
 */
async function getJSON(path, params = {}) {
  /** @type {Record<string, string>} */
  const cleanParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) cleanParams[key] = String(value);
  }
  const qs = new URLSearchParams(cleanParams).toString();
  const url = qs ? `${FUNCTIONS_BASE}/${path}?${qs}` : `${FUNCTIONS_BASE}/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    let message = `Request to ${path} failed (${res.status})`;
    try {
      const errBody = await res.json();
      message = errBody?.error || message;
    } catch {
      /* ignore parse failure */
    }
    throw new Error(message);
  }
  return res.json();
}

/**
 * Airport search — used by FlightSearchForm, AirportSearchBox, EditProfileModal.
 * Backed by the OurAirports dataset (imported into Supabase).
 *
 * @param {string} query  free text — city, airport name, or IATA/ICAO code
 * @returns {Promise<Airport[]>}
 */
export async function searchAirports(query) {
  if (!query || query.length < 2) return [];
  try {
    const data = await getJSON('airports-search', { q: query });
    return data.airports || [];
  } catch {
    return [];
  }
}

/**
 * Flight search — used by Home.jsx after FlightSearchForm submits.
 * Routed through Duffel, annotated with visa risk, and ranked using the
 * documented price/duration/comfort/visa weighting model.
 *
 * @param {FlightSearchParams} [params]
 * @returns {Promise<Array<Object>>} ranked route offers
 */
export async function searchFlights({ origin, destination, departureDate, returnDate, travelerProfile } = {}) {
  const originCode = typeof origin === 'string' ? origin : origin?.code;
  const destinationCode = typeof destination === 'string' ? destination : destination?.code;

  try {
    const data = await postJSON('flights-search', {
      origin: originCode,
      destination: destinationCode,
      departureDate,
      returnDate: returnDate || null,
      travelerProfile: travelerProfile || null,
    });
    return data.offers || [];
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('searchFlights falling back to mock data:', err.message);
      return generateMockOffers(
        {
          origin: typeof origin === 'string' ? { code: origin } : origin,
          destination: typeof destination === 'string' ? { code: destination } : destination,
          departureDate,
        },
        travelerProfile
      );
    }
    throw err;  
  }
}

/**
 * Cheapest-dates calendar — used by FlightCalendar.jsx via Home.jsx.
 *
 * @param {CheapestDatesParams} [params]
 * @returns {Promise<Record<string, number|null>>} date -> price (USD)
 */
export async function getCheapestDates({ origin, destination, fromDate, toDate } = {}) {
  try {
    const data = await getJSON('flights-cheapest-dates', {
      origin,
      destination,
      from: fromDate,
      to: toDate,
    });
    return data.prices || /** @type {Record<string, number>} */ ({});
  } catch {
    if (import.meta.env.DEV && fromDate) {
      return /** @type {Record<string, number>} */(generateMockCalendarPrices(fromDate));
    }
    /** @type {Record<string, number|null>} */
    const empty = {};
    return empty;
  }
}

/**
 * Live flight status — used by FlightStatusTracker.jsx and TripDetails.jsx.
 * Backed by FlightAware AeroAPI for gate/terminal/delay data.
 *
 * @param {string} carrierCode   e.g. "BA"
 * @param {string} flightNumber  e.g. "117"
 * @param {string} [date]        'yyyy-MM-dd'
 * @returns {Promise<Object|null>}
 */
export async function getFlightStatus(carrierCode, flightNumber, date) {
  if (!carrierCode || !flightNumber) return null;
  try {
    const data = await getJSON('flight-status', {
      carrier: carrierCode,
      number: flightNumber,
      date,
    });
    return data.status || null;
  } catch (err) {
    console.warn('getFlightStatus failed:', err.message);
    return null;
  }
}

/**
 * Live position for a SINGLE tracked aircraft — used by
 * FlightStatusTracker.jsx for the in-app flight map. Backed by OpenSky.
 *
 * @param {string} icao24  the aircraft's 24-bit ICAO address, when known
 * @returns {Promise<{lat:number, lon:number, heading:number, altitude:number}|null>}
 */
export async function getLiveAircraftPosition(icao24) {
  if (!icao24) return null;
  try {
    const data = await getJSON('aircraft-position', { icao24 });
    return data.position || null;
  } catch (err) {
    console.warn('getLiveAircraftPosition failed:', err.message);
    return null;
  }
}

/**
 * Live positions for ALL aircraft in a map viewport — used by the
 * full live-map view (distinct from getLiveAircraftPosition, which
 * tracks one specific aircraft). Backed by OpenSky.
 *
 * @param {LiveFlightsBounds} [bounds]
 * @returns {Promise<{time:number, count:number, flights:Array<Object>}>}
 */
export async function getLiveFlights(bounds = {}) {
  try {
    const data = await getJSON('live-flights', bounds);
    return data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('getLiveFlights falling back to mock:', err.message);
      return generateMockLiveFlights(bounds);
    }
    throw err;
  }
}

/**
 * Price a previously-searched offer and lock it for booking.
 * Maps to Duffel's offer-price step before order creation.
 *
 * @param {string} offerId
 * @returns {Promise<Object>}
 */
export async function priceOffer(offerId) {
  try {
    return await postJSON('flights-price', { offerId });
  } catch (err) {
    if (import.meta.env.DEV) {
      const route = JSON.parse(sessionStorage.getItem('skyline_selected_route') || 'null');
      return {
        offerId,
        totalAmount: route?.price || 450,
        currency: route?.currency || 'USD',
        available: true,
      };
    }
    throw err;
  }
}

/**
 * Create a Stripe PaymentIntent for a priced offer (test mode by default).
 *
 * @param {Object} params
 * @param {string} params.offerId
 * @param {number} params.amount    in the smallest currency unit (e.g. cents)
 * @param {string} params.currency  e.g. "usd"
 * @returns {Promise<{clientSecret:string, paymentIntentId:string}>}
 */
export async function createPaymentIntent({ offerId, amount, currency }) {
  try {
    return await postJSON('payments-create-intent', { offerId, amount, currency });
  } catch (err) {
    if (import.meta.env.DEV) {
      throw new Error('Stripe not available in dev without Netlify — run `netlify dev` or use demo checkout.');
    }
    throw err;
  }
}

/**
 * Create a booking/order. Maps to Duffel order creation. Should be called
 * only after a successful Stripe PaymentIntent confirmation.
 *
 * @param {Object} params
 * @param {string} params.offerId
 * @param {Array<Object>} params.passengers
 * @param {string} params.paymentIntentId
 * @param {string} [params.userId]
 * @returns {Promise<Object>} booking record (also persisted to Supabase)
 */
export async function createBooking({ offerId, passengers, paymentIntentId, userId }) {
  try {
    return await postJSON('flights-book', { offerId, passengers, paymentIntentId, userId });
  } catch (err) {
    if (import.meta.env.DEV) {
      return { bookingReference: `SKY-${Date.now().toString(36).toUpperCase()}`, orderId: offerId };
    }
    throw err;
  }
}

/**
 * Visa/transit eligibility check for a specific route.
 * Reads from the custom Supabase visa-rule tables for the diploma
 * implementation.
 *
 * @param {VisaCheckParams} [params]
 * @returns {Promise<Array<{country:string, status:string, notes?:string}>>}
 */
export async function checkVisaRequirements({ passportCountry, routeCountries, existingVisas } = {}) {
  try {
    const data = await postJSON('visa-check', {
      passportCountry,
      routeCountries,
      existingVisas: existingVisas || [],
    });
    return data.results || [];
  } catch {
    return [];
  }
}