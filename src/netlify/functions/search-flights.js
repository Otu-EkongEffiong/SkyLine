/**
 * netlify/functions/flights-search.js
//
// POST /.netlify/functions/flights-search
// Body: {
//   origin: "LOS", destination: "LHR",
//   departureDate: "2026-08-01", returnDate: "2026-08-15" | null,
//   travelerProfile: {
//     passport_country: "NG",
//     visas: [{ country_code: "GB", expiry_date: "2027-01-01" }]
//   } | null
// }
// 1. Calls Duffel to get raw flight offers.
 * 2. For each offer, derives the ordered list of countries the
 *    itinerary touches (origin excluded, every transit + destination
 *    included) using the airport -> country lookup in Supabase.
 * 3. Scores each offer's visa risk against the traveler profile via the
 *    visaRules engine.
 * 4. Ranks all offers using the documented price/duration/comfort/visa
 *    weighting model.
 * 5. Returns a flat list ready for RouteCard.jsx to render directly.
*/


const { ok, badRequest, serverError, methodNotAllowed, parseBody } = require('./_lib/http');
const duffel = require('./_lib/duffelClient');
const { scoreRouteForTraveler } = require('./_lib/visaRules');
const { rankOffers } = require('./_lib/routeScoring');
const { getSupabaseAdmin } = require('./_lib/supabaseAdmin');

async function airportCountryMap(iataCodes) {
  const unique = [...new Set(iataCodes)].filter(Boolean);
  if (unique.length === 0) return {};

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('airports')
    .select('iata_code, country')
    .in('iata_code', unique);

  if (error) {
    console.error('airportCountryMap error:', error);
    return {};
  }
  return Object.fromEntries((data || []).map((row) => [row.iata_code, row.country]));
}

function minutesBetween(isoStart, isoEnd) {
  const ms = new Date(isoEnd).getTime() - new Date(isoStart).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

function flattenDuffelOffer(offer) {
  // A Duffel offer has one or more "slices" (outbound / return), each
  // with one or more "segments" (individual flights). We flatten every
  // segment across every slice into a single ordered list for display
  // and country-risk evaluation.
  const segments = offer.slices.flatMap((slice) => slice.segments);

  const airportCodes = [];
  segments.forEach((seg) => {
    airportCodes.push(seg.origin.iata_code, seg.destination.iata_code);
  });

  const totalDurationMinutes = offer.slices.reduce((sum, slice) => {
    const first = slice.segments[0];
    const last = slice.segments[slice.segments.length - 1];
    return sum + minutesBetween(first.departing_at, last.arriving_at);
  }, 0);

  const layoverCount = segments.length - offer.slices.length; // segments minus one per slice

  return {
    id: offer.id,
    totalAmount: parseFloat(offer.total_amount),
    currency: offer.total_currency,
    totalDurationMinutes,
    layoverCount: Math.max(0, layoverCount),
    segments: segments.map((seg) => ({
      origin: seg.origin.iata_code,
      originAirport: seg.origin.name,
      destination: seg.destination.iata_code,
      destinationAirport: seg.destination.name,
      departureTime: seg.departing_at,
      arrivalTime: seg.arriving_at,
      duration: seg.duration,
      flightNumber: `${seg.marketing_carrier.iata_code}${seg.marketing_carrier_flight_number}`,
      airline: seg.marketing_carrier.name,
    })),
    airportCodes,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const { origin, destination, departureDate, returnDate, travelerProfile } = parseBody(event);

  if (!origin || !destination || !departureDate) {
    return badRequest('origin, destination, and departureDate are required.');
  }

  try {
    const duffelResponse = await duffel.createOfferRequest({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers: [{ type: 'adult' }],
    });

    const rawOffers = duffelResponse?.data?.offers || [];
    const flattened = rawOffers.map(flattenDuffelOffer);

    // Build one shared airport -> country lookup for every offer at once.
    const allCodes = flattened.flatMap((o) => o.airportCodes);
    const countryByAirport = await airportCountryMap(allCodes);

    const passportCountry = travelerProfile?.passport_country || null;
    const existingVisas = travelerProfile?.visas || [];

    const annotated = await Promise.all(
      flattened.map(async (offer) => {
        // Countries touched, in order, excluding the very first origin.
        const routeCountries = [];
        offer.segments.forEach((seg, idx) => {
          const destCountry = countryByAirport[seg.destination];
          if (destCountry && (routeCountries.length === 0 || routeCountries[routeCountries.length - 1] !== destCountry)) {
            routeCountries.push(destCountry);
          }
        });

        let visaResult = { visaScore: 0, hasVisaIssue: false, perCountry: [] };
        if (passportCountry && routeCountries.length > 0) {
          visaResult = await scoreRouteForTraveler({
            passportCountry,
            routeCountries,
            existingVisas,
          });
        }

        return {
          ...offer,
          price: offer.totalAmount,
          totalDuration: `${Math.floor(offer.totalDurationMinutes / 60)}h ${offer.totalDurationMinutes % 60}m`,
          connections: routeCountries.slice(0, -1).map((country) => ({
            countryCode: country,
            city: country,
            layoverTime: '—',
            visaStatus: visaResult.perCountry.find((c) => c.country === country)?.status || 'unknown',
          })),
          destVisaStatus: visaResult.perCountry[visaResult.perCountry.length - 1]?.status || 'unknown',
          visaScore: visaResult.visaScore,
          hasVisaIssue: visaResult.hasVisaIssue,
        };
      })
    );

    const ranked = rankOffers(annotated);

    return ok({ offers: ranked });
  } catch (err) {
    console.error('flights-search error:', err);
    return serverError(err.message || 'Flight search failed.');
  }
};