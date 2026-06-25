// Field names match the real `airports` table exactly
// (iata_code / icao_code / name / city / country / latitude / longitude)
// so the mapping logic in airports-search.js doesn't need a special case.

const sampleAirports = [
    { iata_code: 'DOH', icao_code: 'OTHH', name: 'Hamad International Airport', city: 'Doha', country: 'QA', latitude: 25.2731, longitude: 51.6081, type: 'large_airport' },
    { iata_code: 'WAW', icao_code: 'EPWA', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'PL', latitude: 52.1657, longitude: 20.9671, type: 'large_airport' },
    { iata_code: 'IST', icao_code: 'LTFM', name: 'Istanbul Airport', city: 'Istanbul', country: 'TR', latitude: 41.2753, longitude: 28.7519, type: 'large_airport' },
    { iata_code: 'DXB', icao_code: 'OMDB', name: 'Dubai International Airport', city: 'Dubai', country: 'AE', latitude: 25.2532, longitude: 55.3657, type: 'large_airport' },
    { iata_code: 'BEY', icao_code: 'OLBA', name: 'Beirut-Rafic Hariri International Airport', city: 'Beirut', country: 'LB', latitude: 33.8209, longitude: 35.4884, type: 'large_airport' },
    { iata_code: 'CAI', icao_code: 'HECA', name: 'Cairo International Airport', city: 'Cairo', country: 'EG', latitude: 30.1127, longitude: 31.4000, type: 'large_airport' },
    { iata_code: 'CDG', icao_code: 'LFPG', name: 'Paris Charles de Gaulle Airport', city: 'Paris', country: 'FR', latitude: 49.0097, longitude: 2.5479, type: 'large_airport' },
    { iata_code: 'FRA', icao_code: 'EDDF', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'DE', latitude: 50.0379, longitude: 8.5622, type: 'large_airport' },
  ];
  
  function searchSampleAirports(query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    return sampleAirports
      .filter((a) =>
        [a.iata_code, a.icao_code, a.name, a.city, a.country].join(' ').toLowerCase().includes(q)
      )
      .slice(0, 8);
  }
  
  module.exports = { sampleAirports, searchSampleAirports };