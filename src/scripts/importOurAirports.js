//import from the website https://ourairports.com/data/ (airports.csv)

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');
 
const CSV_PATH = path.join(__dirname, 'airports.csv');
const BATCH_SIZE = 500;
 
// Only airport types worth importing for a flight-search app — skips
// heliports, balloon ports, and closed airports to keep the table lean.
const RELEVANT_TYPES = new Set(['large_airport', 'medium_airport', 'small_airport']);
 
async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.');
    process.exit(1);
  }
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`Could not find ${CSV_PATH}. Download airports.csv from https://ourairports.com/data/ first.`);
    process.exit(1);
  }
 
  const supabase = createClient(supabaseUrl, serviceRoleKey);
 
  console.log('Reading airports.csv ...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parse(csvContent, { columns: true, skip_empty_lines: true });
 
  const records = rows
    .filter((row) => RELEVANT_TYPES.has(row.type) && row.iata_code)
    .map((row) => ({
      id: parseInt(row.id, 10),
      iata_code: row.iata_code || null,
      icao_code: row.ident || null,
      name: row.name,
      city: row.municipality || null,
      country: row.iso_country,
      latitude: parseFloat(row.latitude_deg),
      longitude: parseFloat(row.longitude_deg),
      type: row.type,
    }));
 
  console.log(`Importing ${records.length} airports with IATA codes in batches of ${BATCH_SIZE} ...`);
 
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('airports').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Batch starting at row ${i} failed:`, error);
      process.exit(1);
    }
    console.log(`  imported ${Math.min(i + BATCH_SIZE, records.length)} / ${records.length}`);
  }
 
  console.log('Done.');
}
 
main();