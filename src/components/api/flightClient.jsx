/**
 * Flight API client — all calls go through Netlify Functions.
 * Import from '@/components/api/flightClient' (amadeusClient re-exports this).
 */
import { generateMockOffers, generateMockCalendarPrices, generateMockLiveFlights } from '@/lib/mockFlights';

const FUNCTIONS_BASE = '/.netlify/functions';

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
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return res.json();
}

async function getJSON(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `${FUNCTIONS_BASE}/${path}?${qs}` : `${FUNCTIONS_BASE}/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    let message = `Request to ${path} failed (${res.status})`;
    try {
      const errBody = await res.json();
      message = errBody?.error || message;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return res.json();
}

export async function searchAirports(query) {
  if (!query || query.length < 2) return [];
  try {
    const data = await getJSON('airports-search', { q: query });
    return data.airports || [];
  } catch {
    return [];
  }
}

export async function searchFlights({ origin, destination, departureDate, returnDate, travelerProfile } = {}) {
  try {
    const data = await postJSON('search-flights', {
      origin: origin?.code || origin,
      destination: destination?.code || destination,
      departureDate,
      returnDate: returnDate || null,
      travelerProfile: travelerProfile || null,
    });
    return data.offers || [];
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('searchFlights falling back to mock data:', err.message);
      return generateMockOffers(
        { origin: typeof origin === 'string' ? { code: origin } : origin, destination: typeof destination === 'string' ? { code: destination } : destination, departureDate },
        travelerProfile
      );
    }
    throw err;
  }
}

export async function getCheapestDates({ origin, destination, fromDate, toDate } = {}) {
  try {
    const data = await getJSON('flights-cheapest-dates', {
      origin,
      destination,
      from: fromDate,
      to: toDate,
    });
    return data.prices || {};
  } catch {
    if (import.meta.env.DEV && fromDate) {
      return generateMockCalendarPrices(fromDate);
    }
    return {};
  }
}

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

export async function getLiveAircraftPosition(icao24) {
  if (!icao24) return null;
  try {
    const data = await getJSON('air-craft-position', { icao24 });
    return data.position || null;
  } catch (err) {
    console.warn('getLiveAircraftPosition failed:', err.message);
    return null;
  }
}

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

export async function priceOffer(offerId) {
  try {
    return postJSON('price-flight', { offerId });
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

export async function createPaymentIntent({ offerId, amount, currency }) {
  try {
    return postJSON('create-payment-intent', { offerId, amount, currency });
  } catch (err) {
    if (import.meta.env.DEV) {
      throw new Error('Stripe not available in dev without Netlify — use demo checkout');
    }
    throw err;
  }
}

export async function createBooking({ offerId, passengers, paymentIntentId, userId }) {
  try {
    return postJSON('book-flight', { offerId, passengers, paymentIntentId, userId });
  } catch (err) {
    if (import.meta.env.DEV) {
      return { bookingReference: `SKY-${Date.now().toString(36).toUpperCase()}`, orderId: offerId };
    }
    throw err;
  }
}

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
