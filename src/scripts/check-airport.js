import { createClient } from '@supabase/supabase-js';
import ws from 'ws'; // 1. Import the WebSocket polyfill

async function main() {
  const query = process.argv[2];
  if (!query) {
    console.error('Usage: node scripts/check-airport.js <search term>');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.');
    process.exit(1);
  }

  // 2. Pass ws into the realtime transport configuration block
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    realtime: {
      transport: ws,
    },
  });

  const { data, error, count } = await supabase
    .from('airports')
    .select('id, iata_code, icao_code, name, city, country', { count: 'exact' })
    .or(
      [
        `city.ilike.%${query}%`,
        `name.ilike.%${query}%`,
        `iata_code.ilike.%${query}%`,
        `icao_code.ilike.%${query}%`,
      ].join(',')
    )
    .limit(20);

  if (error) {
    console.error('Query failed:', error);
    process.exit(1);
  }

  console.log(`Found ${count ?? data.length} match(es) for "${query}":\n`);
  data.forEach((row) => {
    console.log(
      `  id=${row.id}  iata=${row.iata_code ?? '(null)'}  icao=${row.icao_code ?? '(null)'}  ${row.name} — ${row.city}, ${row.country}`
    );
  });

  if (data.length === 0) {
    console.log('  (no rows matched at all — table may not contain this airport, or RLS is blocking the anon/service key used)');
  }
}

main();