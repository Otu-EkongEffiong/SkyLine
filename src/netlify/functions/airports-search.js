// netlify/functions/airports-search.js
//
// GET /.netlify/functions/airports-search?q=<query>
//
// Searches the `airports` table in Supabase, which is populated once
// from the OurAirports dataset (https://ourairports.com/data/) via the
// admin import screen (see scripts/import-ourairports.js). This keeps
// airport lookup free, instant, and offline-friendly — no external API
// call needed for typeahead search.

const { ok, badRequest, serverError, methodNotAllowed } = require('./_lib/http');
const { getSupabaseAdmin } = require('./_lib/supabaseAdmin');
const { searchSampleAirports } = require('./_lib/sampleAirports');

function toClientShape(row) {
  return {
    code: row.iata_code,
    icao: row.icao_code,
    name: row.name,
    city: row.city,
    country: row.country,
    lat: row.latitude,
    lon: row.longitude,
    subType: row.type === 'large_airport' || row.type === 'medium_airport' ? 'AIRPORT' : 'CITY',
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  const query = (event.queryStringParameters?.q || '').trim();
  if (query.length < 2) return ok({ airports: [] });

  try {
    const supabase = getSupabaseAdmin();

    // Match against IATA code, ICAO code, city, or airport name.
    // `ilike` performs a case-insensitive partial match.
    const { data, error } = await supabase
      .from('airports')
      .select('iata_code, icao_code, name, city, country, latitude, longitude, type')
      .or(
        [
          `iata_code.ilike.%${query}%`,
          `icao_code.ilike.%${query}%`,
          `city.ilike.%${query}%`,
          `name.ilike.%${query}%`,
        ].join(',')
      )
      .not('iata_code', 'is', null)
      .order('city', { ascending: true })
      .limit(15);

    if (error) throw error;

    if (data && data.length > 0) {
      return ok({ airports: data.map(toClientShape), source: 'supabase' });
    }

    // Table is empty or this query matched nothing in Supabase — fall
    // back to a small bundled sample list so search/visa flows are
    // still testable before the full OurAirports import has run.
    // `source: 'fallback'` lets the frontend (or you, in devtools) tell
    // the difference between "real data" and "demo data".
    const fallback = searchSampleAirports(query).map(toClientShape);
    return ok({ airports: fallback, source: 'fallback' });
  } catch (err) {
    console.error('airports-search error:', err);
    // Even on a Supabase error (e.g. credentials not set yet locally),
    // don't block development — degrade to sample data instead of a 500.
    const fallback = searchSampleAirports(query).map(toClientShape);
    return ok({ airports: fallback, source: 'fallback', warning: err.message });
  }
};