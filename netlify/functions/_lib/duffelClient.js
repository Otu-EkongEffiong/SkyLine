// Thin wrapper around the Duffel REST API.
// Docs: https://duffel.com/docs/api/overview/welcome

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

export async function createOfferRequest({ origin, destination, departureDate, returnDate, passengers }) {
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

  return duffelRequest('/air/offer_requests?return_offers=true&supplier_timeout=15000', {
    method: 'POST',
    body,
  });
}

export async function getOffer(offerId) {
  return duffelRequest(`/air/offers/${offerId}?return_available_services=false`);
}

export async function createOrder({ offerId, passengers, paymentType = 'balance' }) {
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