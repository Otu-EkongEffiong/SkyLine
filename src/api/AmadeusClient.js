/// <reference types="vite/client" />

/**
 * Amadeus API Client for SkyPath
 *
 * Setup:
 * 1. Go to https://developers.amadeus.com → "My Self-Service Workspace" → create an app
 * 2. Copy your API Key and API Secret
 * 3. Add to your .env file (Vite project root):
 *      VITE_AMADEUS_API_KEY=your_api_key_here
 *      VITE_AMADEUS_API_SECRET=your_api_secret_here
 *
 * The test environment (used by default) is free and has real data but limited traffic.
 * Switch AMADEUS_BASE_URL to https://api.amadeus.com for production.
 */

// In development, all requests go through Vite's proxy (/amadeus → test.api.amadeus.com)
// so that CORS is never an issue. In production build, point to your backend proxy.
const AMADEUS_BASE_URL = import.meta.env.DEV
  ? ''           // empty = use Vite proxy path  e.g. /amadeus/v2/...
  : '';          // TODO: replace with your production proxy URL when deploying

// ─────────────────────────────────────────────────────────
// AUTH  —  OAuth2 client-credentials, cached in memory
// ─────────────────────────────────────────────────────────

let _tokenCache = null;

async function getAccessToken() {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.token;
  }

  // @ts-ignore — Vite injects import.meta.env at build time
  const apiKey    = /** @type {string} */ (import.meta.env.VITE_AMADEUS_API_KEY);
  // @ts-ignore — Vite injects import.meta.env at build time
  const apiSecret = /** @type {string} */ (import.meta.env.VITE_AMADEUS_API_SECRET);

  if (!apiKey || !apiSecret) {
    throw new Error(
      'Missing Amadeus credentials.\n' +
      'Add VITE_AMADEUS_API_KEY and VITE_AMADEUS_API_SECRET to your .env file.\n' +
      'Get them free at https://developers.amadeus.com'
    );
  }

  const res = await fetch('/amadeus/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     apiKey,
      client_secret: apiSecret,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Amadeus auth failed: ${err.error_description || res.statusText}`);
  }

  const data = await res.json();
  _tokenCache = {
    token:     data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return _tokenCache.token;
}

// ─────────────────────────────────────────────────────────
// GENERIC REQUEST
// ─────────────────────────────────────────────────────────

async function amadeusRequest(path, params = {}) {
  const token = await getAccessToken();
  // /amadeus prefix routes through Vite proxy → test.api.amadeus.com
  const fullPath = `/amadeus${path}`;
  const url   = new URL(fullPath, window.location.origin);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'undefined' && v !== 'null') {
      url.searchParams.set(k, String(v));
    }
  });

  const res  = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();

  if (!res.ok) {
    const msg = json?.errors?.[0]?.detail || json?.errors?.[0]?.title || res.statusText;
    throw new Error(`Amadeus error (${res.status}): ${msg}`);
  }

  return json;
}

// ─────────────────────────────────────────────────────────
// 1.  AIRPORT / CITY  AUTOCOMPLETE
//     Used in FlightSearchForm to replace the static list
// ─────────────────────────────────────────────────────────

/**
 * Search airports and cities by keyword.
 * Returns objects shaped to drop into the existing AirportSelector Command list.
 *
 * @param {string} keyword
 * @returns {Array<{ code, city, country, name, label }>}
 */
/** @returns {Promise<Array<{code:string,city:string,country:string,name:string,label:string,subType:string}>>} */
export async function searchAirports(keyword) {
  if (!keyword || keyword.length < 2) return [];

  const data = await amadeusRequest('/v1/reference-data/locations', {
    keyword,
    subType:         'AIRPORT,CITY',
    'page[limit]':   10,
  });

  return (data.data || []).map((loc) => ({
    // Matches the shape used by existing FlightSearchForm AirportSelector
    code:    loc.iataCode,
    city:    loc.address?.cityName  || loc.name,
    country: loc.address?.countryName || '',
    name:    loc.name,
    // convenience label for display
    label:   `${loc.iataCode} – ${loc.name}, ${loc.address?.cityName || ''}`,
    subType: loc.subType,
  }));
}

// ─────────────────────────────────────────────────────────
// 2.  FLIGHT OFFERS SEARCH
//     Returns results shaped for RouteCard + FlightCalendar
// ─────────────────────────────────────────────────────────

/**
 * Search for available flights.
 *
 * @param {Object}  p
 * @param {string}  p.originCode          IATA code e.g. "DOH"
 * @param {string}  p.destinationCode     IATA code e.g. "LHR"
 * @param {string}  p.departureDate       "YYYY-MM-DD"
 * @param {string}  [p.returnDate]        "YYYY-MM-DD"  — omit for one-way
 * @param {number}  [p.adults=1]
 * @param {string}  [p.travelClass]       "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"
 * @param {boolean} [p.nonStop=false]
 * @param {number}  [p.max=20]
 *
 * @returns {Array}  RouteCard-compatible route objects
 */
/** @returns {Promise<any[]>} */
export async function searchFlights({
  originCode,
  destinationCode,
  departureDate,
  returnDate,
  adults      = 1,
  travelClass = 'ECONOMY',
  nonStop     = false,
  max         = 20,
}) {
  const data = await amadeusRequest('/v2/shopping/flight-offers', {
    originLocationCode:      originCode,
    destinationLocationCode: destinationCode,
    departureDate,
    ...(returnDate ? { returnDate } : {}),
    adults,
    travelClass,
    ...(nonStop ? { nonStop: 'true' } : {}),
    max,
    currencyCode:            'USD',
  });

  return (data.data || []).map((offer, idx) =>
    normalizeToRouteCard(offer, data.dictionaries || {}, idx)
  );
}

// ─────────────────────────────────────────────────────────
// 3.  PRICE CONFIRMATION  (call before booking)
// ─────────────────────────────────────────────────────────

/**
 * Confirm the real-time price of a selected offer before booking.
 * Always call this; prices can change between search and purchase.
 *
 * @param {Object} rawOffer  — the `_raw` field on a RouteCard result
 * @returns {Object|null}    confirmed offer with live price
 */
/** @returns {Promise<any>} */
export async function confirmFlightPrice(rawOffer) {
  const token = await getAccessToken();

  const res = await fetch('/amadeus/v1/shopping/flight-offers/pricing', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type:         'flight-offers-pricing',
        flightOffers: [rawOffer],
      },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Price confirmation failed: ${json?.errors?.[0]?.detail || res.statusText}`);
  }

  return json.data?.flightOffers?.[0] ?? null;
}

// ─────────────────────────────────────────────────────────
// 4.  CHEAPEST DATES  (powers FlightCalendar price heatmap)
// ─────────────────────────────────────────────────────────

/**
 * Build a priceData map { "YYYY-MM-DD": priceNumber } for FlightCalendar.
 * Falls back to undefined if the route isn't supported by the Inspiration API.
 *
 * @param {string} origin
 * @param {string} destination
 * @returns {Object|null}  { "2025-04-01": 342, ... }
 */
/** @returns {Promise<Record<string,number>|null>} */
export async function getCheapestDates(origin, destination) {
  try {
    const data = await amadeusRequest('/v1/shopping/flight-dates', {
      origin,
      destination,
      oneWay: false,
    });

    /** @type {Record<string, number>} */
    const priceMap = {};
    (data.data || []).forEach((d) => {
      const dateStr = d.departure?.at?.slice(0, 10);
      const price   = parseFloat(d.price?.total);
      if (dateStr && !isNaN(price)) {
        priceMap[dateStr] = price;
      }
    });

    return Object.keys(priceMap).length > 0 ? priceMap : null;
  } catch {
    // Flight Dates API only supports certain city pairs — silently return null
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// 5.  FLIGHT STATUS  (for FlightStatusTracker / TripDetails)
// ─────────────────────────────────────────────────────────

/**
 * Real-time flight status for a specific flight.
 *
 * @param {string} carrierCode      e.g. "QR"
 * @param {string} flightNumber     e.g. "302"
 * @param {string} scheduledDate    "YYYY-MM-DD"
 * @returns {Object|null}
 */
/** @returns {Promise<any>} */
export async function getFlightStatus(carrierCode, flightNumber, scheduledDate) {
  try {
    const data = await amadeusRequest('/v2/schedule/flights', {
      carrierCode,
      flightNumber,
      scheduledDepartureDate: scheduledDate,
    });

    const flight = data.data?.[0];
    if (!flight) return null;

    const dep = flight.flightPoints?.[0];
    const arr = flight.flightPoints?.[flight.flightPoints.length - 1];

    return {
      flightNumber:       `${carrierCode}${flightNumber}`,
      // Map Amadeus statuses to what FlightStatusTracker already handles
      status:             mapAmadeusStatus(flight.legs?.[0]?.status),
      delay:              flight.legs?.[0]?.delayedDeparture ?? 0,
      origin:             dep?.iataCode,
      destination:        arr?.iataCode,
      scheduledDeparture: dep?.departure?.timings?.[0]?.value,
      scheduledArrival:   arr?.arrival?.timings?.[0]?.value,
      gate:               dep?.departure?.gate?.mainGate || null,
      terminal:           dep?.departure?.terminal?.code || null,
      aircraft:           flight.legs?.[0]?.aircraftEquipment?.aircraftType,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// Airport → country fallback (Amadeus often omits countryCode)
// ─────────────────────────────────────────────────────────
const AIRPORT_COUNTRY_FALLBACK = {
  'DXB':'AE','AUH':'AE','SHJ':'AE','DOH':'QA','BAH':'BH','KWI':'KW','MCT':'OM',
  'RUH':'SA','JED':'SA','MED':'SA','CAI':'EG','CMN':'MA','ADD':'ET','NBO':'KE',
  'LOS':'NG','ACC':'GH','ABJ':'CI','DKR':'SN',
  'LHR':'GB','LGW':'GB','MAN':'GB','STN':'GB','CDG':'FR','ORY':'FR',
  'FRA':'DE','MUC':'DE','DUS':'DE','AMS':'NL','BRU':'BE','ZUR':'CH',
  'GVA':'CH','FCO':'IT','MXP':'IT','MAD':'ES','BCN':'ES','LIS':'PT',
  'ARN':'SE','CPH':'DK','HEL':'FI','OSL':'NO','VIE':'AT','PRG':'CZ',
  'BUD':'HU','WAW':'PL','IST':'TR','SAW':'TR',
  'SIN':'SG','KUL':'MY','BKK':'TH','DMK':'TH','CGK':'ID','DPS':'ID',
  'MNL':'PH','SGN':'VN','HAN':'VN','HKG':'HK','PEK':'CN','PVG':'CN',
  'CTU':'CN','CAN':'CN','NRT':'JP','HND':'JP','KIX':'JP','ICN':'KR',
  'GMP':'KR','DEL':'IN','BOM':'IN','MAA':'IN','BLR':'IN','HYD':'IN',
  'CCU':'IN','CMB':'LK','KTM':'NP','DAC':'BD','KHI':'PK',
  'LHE':'PK','ISB':'PK','KBL':'AF','SYD':'AU','MEL':'AU','BNE':'AU',
  'AKL':'NZ','JFK':'US','EWR':'US','ORD':'US','ATL':'US','LAX':'US',
  'MIA':'US','DFW':'US','SFO':'US','IAD':'US','BOS':'US','YYZ':'CA',
  'YVR':'CA','YUL':'CA','MEX':'MX','GRU':'BR','GIG':'BR','EZE':'AR',
  'BOG':'CO','SCL':'CL','LIM':'PE','SVO':'RU','DME':'RU','LED':'RU',
};

function getCountryForAirport(iataCode, dictionaries) {
  return dictionaries?.locations?.[iataCode]?.countryCode
      || AIRPORT_COUNTRY_FALLBACK[iataCode]
      || '';
}

// ─────────────────────────────────────────────────────────
// INTERNAL  —  normalise Amadeus offer → RouteCard shape
// ─────────────────────────────────────────────────────────

function normalizeToRouteCard(offer, dictionaries, idx) {
  const itinerary = offer.itineraries?.[0];
  const segments  = itinerary?.segments || [];
  const firstSeg  = segments[0];
  const lastSeg   = segments[segments.length - 1];
  const price     = parseFloat(offer.price?.total || 0);

  // Build connections array (layover airports, country codes, layover time)
  const connections = [];
  for (let i = 0; i < segments.length - 1; i++) {
    const inbound  = segments[i];
    const outbound = segments[i + 1];
    const arrDT    = new Date(inbound.arrival?.at);
    const depDT    = new Date(outbound.departure?.at);
    const layoverMin = Math.round((depDT.getTime() - arrDT.getTime()) / 60_000);

    const iataCode   = inbound.arrival?.iataCode;
    const connCountry = getCountryForAirport(iataCode, dictionaries);

    connections.push({
      city:        inbound.arrival?.iataCode,
      code:        inbound.arrival?.iataCode,
      countryCode: connCountry,
      layoverTime: formatDuration(layoverMin),
    });
  }

  // Build RouteCard segments array
  const routeSegments = segments.map((seg) => ({
    origin:             seg.departure?.iataCode,
    originAirport:      dictionaries?.locations?.[seg.departure?.iataCode]?.cityCode || seg.departure?.iataCode,
    destination:        seg.arrival?.iataCode,
    destinationAirport: dictionaries?.locations?.[seg.arrival?.iataCode]?.cityCode   || seg.arrival?.iataCode,
    departureTime:      seg.departure?.at ? new Date(seg.departure.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--',
    arrivalTime:        seg.arrival?.at   ? new Date(seg.arrival.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--',
    duration:           parseDurationISO(seg.duration),
    airline:            dictionaries?.carriers?.[seg.carrierCode] || seg.carrierCode,
    flightNumber:       `${seg.carrierCode}${seg.number}`,
  }));

  return {
    // ── RouteCard-required fields ──────────────────────────
    id:            offer.id || String(idx),
    price,
    totalDuration: parseDurationISO(itinerary?.duration),
    connections,
    segments:      routeSegments,
    isRecommended: false,   // Home.jsx sets this after visa checks
    hasVisaIssue:  false,   // Home.jsx sets this after visa checks

    // ── Extra metadata ─────────────────────────────────────
    currency:    offer.price?.currency || 'USD',
    nonStop:     segments.length === 1,
    stops:       segments.length - 1,
    cabin:       offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
    baggage: {
      checkedBags: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity ?? 0,
    },
    lastTicketingDate: offer.lastTicketingDate,

    // ── Keep raw offer for confirmFlightPrice() ────────────
    _raw: offer,
  };
}

function parseDurationISO(iso) {
  if (!iso) return '—';
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const h = parseInt(m?.[1] || 0);
  const min = parseInt(m?.[2] || 0);
  return min > 0 ? `${h}h ${min}m` : `${h}h`;
}

function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}


// ─────────────────────────────────────────────────────────
// 6.  CREATE FLIGHT ORDER  (final booking step)
// ─────────────────────────────────────────────────────────

/**
 * Create a flight booking (PNR) via Amadeus Flight Create Orders API.
 * IMPORTANT: In test/self-service mode, ticketing is handled by a consolidator.
 * Do NOT include payment info — it will be rejected.
 *
 * @param {Object} confirmedOffer   — the offer returned by confirmFlightPrice()
 * @param {Array}  travelers        — array of traveler objects per Amadeus spec:
 *   [{
 *     id: "1",
 *     dateOfBirth: "1990-01-15",
 *     name: { firstName: "JOHN", lastName: "DOE" },
 *     gender: "MALE",
 *     contact: {
 *       emailAddress: "john@example.com",
 *       phones: [{ deviceType: "MOBILE", countryCallingCode: "1", number: "5551234567" }]
 *     },
 *     documents: [{
 *       documentType: "PASSPORT",
 *       number: "AB123456",
 *       expiryDate: "2030-01-01",
 *       issuanceCountry: "US",
 *       nationality: "US",
 *       holder: true
 *     }]
 *   }]
 * @returns {Object}  booking confirmation with PNR and booking reference
 */
/** @returns {Promise<any>} */
export async function createFlightOrder(confirmedOffer, travelers) {
  const token = await getAccessToken();

  const res = await fetch('/amadeus/v1/booking/flight-orders', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type:         'flight-order',
        flightOffers: [confirmedOffer],
        travelers,
      },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    const errDetail = json?.errors?.[0]?.detail || json?.errors?.[0]?.title || res.statusText;
    throw new Error(`Booking failed: ${errDetail}`);
  }

  // Return booking confirmation
  const order = json.data;
  return {
    bookingId:        order.id,
    pnr:              order.associatedRecords?.[0]?.reference || order.id,
    airline:          order.associatedRecords?.[0]?.originSystemCode || '',
    flightOffers:     order.flightOffers,
    travelers:        order.travelers,
    ticketingDate:    order.flightOffers?.[0]?.lastTicketingDate,
    _raw:             order,
  };
}

function mapAmadeusStatus(amadeusStatus) {
  // Map Amadeus schedule statuses → FlightStatusTracker statuses
  const map = {
    'SCHEDULED':  'On Time',
    'ACTIVE':     'Boarding',
    'LANDED':     'Arrived',
    'CANCELLED':  'Cancelled',
    'INCIDENT':   'Delayed',
    'DIVERTED':   'Delayed',
  };
  return map[amadeusStatus] || 'On Time';
}

// ─────────────────────────────────────────────────────────
// 7.  GET FLIGHT ORDER  (retrieve existing booking)
// ─────────────────────────────────────────────────────────

/**
 * Retrieve a saved flight order by its Amadeus order ID.
 * Use this to display booking details on a "My Trips" / confirmation page.
 *
 * @param {string} flightOrderId  — the id returned by createFlightOrder()
 * @returns {Object}  normalized booking object
 */
/** @returns {Promise<any>} */
export async function getFlightOrder(flightOrderId) {
  const token = await getAccessToken();

  const res = await fetch(
    `/amadeus/v1/booking/flight-orders/${encodeURIComponent(flightOrderId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Get order failed: ${json?.errors?.[0]?.detail || res.statusText}`);
  }

  const order = json.data;
  const dicts = json.dictionaries || {};

  // Normalize segments for display
  const itineraries = order.flightOffers?.[0]?.itineraries || [];
  const segments = itineraries.flatMap(it =>
    (it.segments || []).map(seg => ({
      flightNumber:   `${seg.carrierCode}${seg.number}`,
      airline:        dicts.carriers?.[seg.carrierCode] || seg.carrierCode,
      origin:         seg.departure?.iataCode,
      destination:    seg.arrival?.iataCode,
      departureAt:    seg.departure?.at,
      arrivalAt:      seg.arrival?.at,
      terminal:       seg.departure?.terminal,
      duration:       parseDurationISO(seg.duration),
      aircraft:       seg.aircraft?.code,
      cabin:          order.flightOffers?.[0]?.travelerPricings?.[0]
                        ?.fareDetailsBySegment?.find(f => f.segmentId === seg.id)?.cabin || 'ECONOMY',
    }))
  );

  return {
    bookingId:     order.id,
    pnr:           order.associatedRecords?.[0]?.reference || order.id,
    status:        order.ticketingAggreement?.option || 'CONFIRMED',
    price:         order.flightOffers?.[0]?.price?.grandTotal,
    currency:      order.flightOffers?.[0]?.price?.currency || 'USD',
    travelers:     order.travelers || [],
    segments,
    contacts:      order.contacts || [],
    createdAt:     order.associatedRecords?.[0]?.creationDateTime,
    _raw:          order,
  };
}

// ─────────────────────────────────────────────────────────
// 8.  CANCEL FLIGHT ORDER
// ─────────────────────────────────────────────────────────

/**
 * Cancel a flight order (DELETE). Returns true on success.
 * Note: cancellation policies vary by fare — refund is not guaranteed.
 *
 * @param {string} flightOrderId
 * @returns {boolean}
 */
/** @returns {Promise<boolean>} */
export async function cancelFlightOrder(flightOrderId) {
  const token = await getAccessToken();

  const res = await fetch(
    `/amadeus/v1/booking/flight-orders/${encodeURIComponent(flightOrderId)}`,
    {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (res.status === 204) return true; // Successfully deleted

  const json = await res.json().catch(() => ({}));
  throw new Error(`Cancellation failed: ${json?.errors?.[0]?.detail || res.statusText}`);
}

// ─────────────────────────────────────────────────────────
// 9.  AIRPORT DIRECT DESTINATIONS
//     "Where can I fly direct from this airport?"
//     Great for building an Explore / Discover Destinations UI
// ─────────────────────────────────────────────────────────

/**
 * Get all airports/cities reachable by direct flight from a given airport.
 *
 * @param {string}  departureAirportCode   e.g. "LHR"
 * @param {Object}  [opts]
 * @param {number}  [opts.max=200]
 * @param {string}  [opts.arrivalCountryCode]  ISO 3166-1 alpha-2 to filter by country
 * @returns {Array<{ iataCode, name, city, country, latitude, longitude, relevance }>}
 */
/** @returns {Promise<Array<{iataCode:string,name:string,city:string,country:string,countryCode:string,latitude:number,longitude:number,relevance:number,timezone:string}>>} */
export async function getAirportDirectDestinations(departureAirportCode, opts = {}) {
  const data = await amadeusRequest('/v1/airport/direct-destinations', {
    departureAirportCode,
    ...(opts.max              ? { max: opts.max }                           : { max: 200 }),
    ...(opts.arrivalCountryCode ? { arrivalCountryCode: opts.arrivalCountryCode } : {}),
  });

  return (data.data || []).map(dest => ({
    iataCode:   dest.iataCode,
    name:       dest.name,
    city:       dest.address?.cityName   || dest.name,
    country:    dest.address?.countryName || '',
    countryCode: dest.address?.countryCode || '',
    latitude:   dest.geoCode?.latitude,
    longitude:  dest.geoCode?.longitude,
    relevance:  dest.metrics?.relevance ?? 0,
    timezone:   dest.timeZone?.offset || '',
  }));
}

// ─────────────────────────────────────────────────────────
// 10. AIRLINE DESTINATIONS
//     "Where does this airline fly?"
//     Useful for filtering search by preferred carrier
// ─────────────────────────────────────────────────────────

/**
 * Get all destinations served by a given airline.
 *
 * @param {string}  airlineCode            IATA airline code e.g. "EK"
 * @param {Object}  [opts]
 * @param {number}  [opts.max=200]
 * @param {string}  [opts.arrivalCountryCode]
 * @returns {Array<{ iataCode, name, city, country, relevance }>}
 */
/** @returns {Promise<Array<{iataCode:string,name:string,city:string,country:string,countryCode:string,latitude:number,longitude:number,relevance:number,timezone:string}>>} */
export async function getAirlineDestinations(airlineCode, opts = {}) {
  const data = await amadeusRequest('/v1/airline/destinations', {
    airlineCode,
    ...(opts.max              ? { max: opts.max }                           : { max: 200 }),
    ...(opts.arrivalCountryCode ? { arrivalCountryCode: opts.arrivalCountryCode } : {}),
  });

  return (data.data || []).map(dest => ({
    iataCode:    dest.iataCode,
    name:        dest.name,
    city:        dest.address?.cityName    || dest.name,
    country:     dest.address?.countryName || '',
    countryCode: dest.address?.countryCode || '',
    latitude:    dest.geoCode?.latitude,
    longitude:   dest.geoCode?.longitude,
    relevance:   dest.metrics?.relevance ?? 0,
    timezone:    dest.timeZone?.offset || '',
  }));
}

// ─────────────────────────────────────────────────────────
// 11. AIRLINE LOOKUP
//     Resolve IATA/ICAO codes → full airline names
//     Used to enrich RouteCard airline display names
// ─────────────────────────────────────────────────────────

// In-memory cache so we don't re-fetch the same codes
const _airlineCache = {};

/**
 * Look up one or more airlines by IATA/ICAO code.
 * Results are cached in memory for the session.
 *
 * @param {string|string[]}  codes   single code or comma-separated/array
 * @returns {Object}  { "BA": { iata: "BA", icao: "BAW", name: "British Airways" }, ... }
 */
/** @returns {Promise<Record<string,{iata:string,icao:string,name:string,fullName:string}|undefined>>} */
export async function lookupAirlines(codes) {
  const codeList = Array.isArray(codes)
    ? codes
    : String(codes).split(',').map(c => c.trim());

  // Only fetch codes not already cached
  const missing = codeList.filter(c => c && !_airlineCache[c]);

  if (missing.length > 0) {
    try {
      const data = await amadeusRequest('/v1/reference-data/airlines', {
        airlineCodes: missing.join(','),
      });

      (data.data || []).forEach(airline => {
        _airlineCache[airline.iataCode] = {
          iata:     airline.iataCode,
          icao:     airline.icaoCode,
          name:     airline.commonName || airline.businessName || airline.iataCode,
          fullName: airline.businessName || airline.commonName || airline.iataCode,
        };
      });
    } catch {
      // Non-fatal — caller can fall back to raw code
    }
  }

  // Return map for requested codes (undefined for unknown)
  return Object.fromEntries(codeList.map(c => [c, _airlineCache[c]]));
}

/**
 * Convenience: resolve a single airline code to its display name.
 * Returns the code itself if not found.
 *
 * @param {string} code  e.g. "QR"
 * @returns {string}     e.g. "Qatar Airways"
 */
/** @returns {Promise<string>} */
export async function getAirlineName(code) {
  if (!code) return '';
  const map = await lookupAirlines([code]);
  return map[code]?.name || code;
}

// ─────────────────────────────────────────────────────────
// 12. EXPORT ALL AIRPORT_COUNTRY_MAP for use in Home.jsx
//     (re-export the fallback map so AccessibilityMap, Home,
//      and RouteCard can all use the same source of truth)
// ─────────────────────────────────────────────────────────

export { AIRPORT_COUNTRY_FALLBACK as AIRPORT_COUNTRY_MAP };