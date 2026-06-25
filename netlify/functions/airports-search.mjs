// Docs on request and context https://docs netlify.com/functions/build/#code-your-function-2
 


const { ok, badRequest, serverError, methodNotAllowed } = require('./_lib/http');
const { getSupabaseAdmin } = require('./_lib/supabaseAdmin');
const { searchSampleAirports } = require('./_lib/sampleAirports');

function toClientShape(row) {
  return {
    // Prefer IATA (what Duffel and most frontends expect), fall back to
    // ICAO so small airports without an IATA code still render something
    // usable instead of `null` in the picker.
    code: row.iata_code || row.icao_code || '',
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
      .order('city', { ascending: true })
      .limit(15);

    if (error) throw error;

    // Prefer rows that actually have a bookable IATA code (Duffel and
    // most airlines search by IATA), but don't throw ICAO-only rows
    // away entirely — surface them too, sorted after IATA matches, so
    // the user still sees *something* for small airports.
    const withIata = (data || []).filter((row) => row.iata_code);
    const icaoOnly = (data || []).filter((row) => !row.iata_code);
    const combined = [...withIata, ...icaoOnly];

    if (combined.length > 0) {
      return ok({ airports: combined.map(toClientShape), source: 'supabase' });
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