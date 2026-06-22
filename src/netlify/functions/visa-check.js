// POST /.netlify/functions/visa-check
// Body: {
//   passportCountry: "NG",
//   routeCountries: ["AE", "DE"],
//   existingVisas: [{ country_code: "AE", expiry_date: "2027-01-01" }]
// }
//
// Standalone visa/transit eligibility check, independent of a flight
// search. Used by Profile.jsx (Travel Access summary), Home.jsx
// (VisaSuggestions), and AccessibilityMap.jsx so they share one source
// of truth with the route-scoring engine in flights-search.js.

const { ok, badRequest, serverError, methodNotAllowed, parseBody } = require('./_lib/http');
const { getVisaStatus } = require('./_lib/visaRules');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const { passportCountry, routeCountries, existingVisas } = parseBody(event);
  if (!passportCountry || !Array.isArray(routeCountries) || routeCountries.length === 0) {
    return badRequest('passportCountry and a non-empty routeCountries array are required.');
  }

  try {
    const results = await Promise.all(
      routeCountries.map(async (country) => ({
        country,
        ...(await getVisaStatus(passportCountry, country, existingVisas || [])),
      }))
    );
    return ok({ results });
  } catch (err) {
    console.error('visa-check error:', err);
    return serverError(err.message || 'Visa check failed.');
  }
};