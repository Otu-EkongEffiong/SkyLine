// netlify/functions/_lib/duffelClient.js
// Thin wrapper around the Duffel REST API.
// Docs: https://duffel.com/docs/api/overview/welcome
//
// All calls happen server-side only — the Duffel access token must never
// reach the browser.

const DUFFEL_BASE_URL = 'https://api.duffel.com';
const DUFFEL_API_VERSION = 'v2';

function getDuffelHeaders() {
  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error('DUFFEL_ACCESS_TOKEN is not configured.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Duffel-Version': DUFFEL_API_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function duffelRequest(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${DUFFEL_BASE_URL}${path}`, {
    method,
    headers: getDuffelHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = json?.errors?.[0]?.message || `Duffel request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.details = json;
    throw error;
  }

  return json;
}

/**
 * Create an offer request and return matching offers.
 * https://duffel.com/docs/api/offer-requests/create-offer-request
 */
async function createOfferRequest({ origin, destination, departureDate, returnDate, passengers }) {
  const slices = [{ origin, destination, departure_date: departureDate }];
  if (returnDate) {
    slices.push({ origin: destination, destination: origin, departure_date: returnDate });
  }

  const body = {
    data: {
      slices,
      passengers: passengers && passengers.length ? passengers : [{ type: 'adult' }],
      cabin_class: 'economy',
    },
  };

  // return_offers=true inlines the matching offers in the response.
  return duffelRequest('/air/offer_requests?return_offers=true&supplier_timeout=15000', {
    method: 'POST',
    body,
  });
}

/**
 * Re-fetch/price a single offer right before booking, to confirm the
 * price and availability haven't changed since search.
 * https://duffel.com/docs/api/offers/get-a-single-offer
 */
async function getOffer(offerId) {
  return duffelRequest(`/air/offers/${offerId}?return_available_services=false`);
}

/**
 * Create a booking (order) for a priced offer.
 * https://duffel.com/docs/api/orders/create-an-order
 */
async function createOrder({ offerId, passengers, paymentType = 'balance' }) {
  const body = {
    data: {
      type: 'instant',
      selected_offers: [offerId],
      passengers,
      payments: [
        {
          type: paymentType,
          currency: 'GBP',
        },
      ],
    },
  };
  return duffelRequest('/air/orders', { method: 'POST', body });
}

module.exports = { createOfferRequest, getOffer, createOrder };