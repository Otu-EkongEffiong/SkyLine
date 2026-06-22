import { getVisaStatus, getConnectionDifficulty, AIRPORT_COUNTRY_MAP } from '@/components/travel/AccessibilityMap';

const AIRLINES = ['Emirates', 'Qatar Airways', 'Turkish Airlines', 'Singapore Airlines', 'Lufthansa', 'British Airways'];

const ROUTE_TEMPLATES = [
  { price: 450, connections: [] },
  { price: 380, connections: [{ city: 'Dubai', code: 'DXB', countryCode: 'AE', layoverTime: '2h 30m' }] },
  { price: 350, connections: [{ city: 'Istanbul', code: 'IST', countryCode: 'TR', layoverTime: '3h 15m' }] },
  { price: 390, connections: [{ city: 'Doha', code: 'DOH', countryCode: 'QA', layoverTime: '2h 45m' }] },
  { price: 420, connections: [{ city: 'Frankfurt', code: 'FRA', countryCode: 'DE', layoverTime: '1h 50m' }] },
];

function annotateRoute(route, profile) {
  const passportCode = profile?.passport_country;
  const visas = profile?.visas || [];
  const hasPassport = !!passportCode;

  const connectionsWithVisa = route.connections.map((conn) => {
    const countryCode = conn.countryCode || AIRPORT_COUNTRY_MAP?.[conn.code] || '';
    const status = hasPassport ? getVisaStatus(passportCode, countryCode, visas) : 'unknown';
    return { ...conn, countryCode, visaStatus: status, hasVisa: status === 'has_visa' };
  });

  const destCode = route.segments[route.segments.length - 1]?.destination;
  const destCountry = AIRPORT_COUNTRY_MAP?.[destCode] || '';
  const destVisaStatus = hasPassport && destCountry ? getVisaStatus(passportCode, destCountry, visas) : 'unknown';

  const hasVisaIssue =
    connectionsWithVisa.some((c) => c.visaStatus === 'visa_required') ||
    destVisaStatus === 'visa_required';

  let visaScore = 0;
  connectionsWithVisa.forEach((c) => {
    visaScore += getConnectionDifficulty(passportCode, c.countryCode, visas);
  });
  if (destVisaStatus === 'visa_required') visaScore += 10;
  if (destVisaStatus === 'evisa') visaScore += 1;
  if (destVisaStatus === 'visa_on_arrival') visaScore += 1;

  return {
    ...route,
    connections: connectionsWithVisa,
    hasVisaIssue,
    isRecommended: !hasVisaIssue && visaScore === 0,
    visaScore,
    destVisaStatus,
    destCountry,
  };
}

export function generateMockOffers(search, profile) {
  const { origin, destination } = search;

  const offers = ROUTE_TEMPLATES.map((template, index) => {
    const depHour = 6 + Math.floor(Math.random() * 12);
    const durationH = template.connections.length === 0 ? 8 : 14;

    const segments = template.connections.length === 0
      ? [{
          origin: origin.code,
          originAirport: origin.name || origin.city,
          destination: destination.code,
          destinationAirport: destination.name || destination.city,
          departureTime: `${String(depHour).padStart(2, '0')}:30`,
          arrivalTime: `${String((depHour + durationH) % 24).padStart(2, '0')}:15`,
          duration: `${durationH}h 45m`,
          airline: AIRLINES[index % AIRLINES.length],
          flightNumber: `SK${100 + index}`,
        }]
      : [
          {
            origin: origin.code,
            originAirport: origin.name || origin.city,
            destination: template.connections[0].code,
            destinationAirport: template.connections[0].city,
            departureTime: `${String(depHour).padStart(2, '0')}:30`,
            arrivalTime: `${String((depHour + 5) % 24).padStart(2, '0')}:00`,
            duration: '5h 30m',
            airline: AIRLINES[index % AIRLINES.length],
            flightNumber: `SK${100 + index}`,
          },
          {
            origin: template.connections[0].code,
            originAirport: template.connections[0].city,
            destination: destination.code,
            destinationAirport: destination.name || destination.city,
            departureTime: `${String((depHour + 8) % 24).padStart(2, '0')}:00`,
            arrivalTime: `${String((depHour + 14) % 24).padStart(2, '0')}:15`,
            duration: '6h 15m',
            airline: AIRLINES[(index + 1) % AIRLINES.length],
            flightNumber: `SK${200 + index}`,
          },
        ];

    return annotateRoute({
      id: `mock-${index}`,
      price: template.price + Math.floor(Math.random() * 80),
      totalDuration: `${durationH}h 45m`,
      totalDurationMinutes: durationH * 60 + 45,
      connections: template.connections,
      segments,
      score: 0,
    }, profile);
  });

  offers.sort((a, b) => {
    if (a.hasVisaIssue !== b.hasVisaIssue) return a.hasVisaIssue ? 1 : -1;
    if (a.visaScore !== b.visaScore) return a.visaScore - b.visaScore;
    return a.price - b.price;
  });

  const top = offers.find((o) => !o.hasVisaIssue);
  return offers.map((o) => ({ ...o, isRecommended: top ? o === top : false }));
}

export function generateMockCalendarPrices(departureDate, avgPrice = 450) {
  const prices = {};
  const base = new Date(departureDate);
  for (let i = -15; i <= 15; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    if (d >= new Date()) {
      const key = d.toISOString().slice(0, 10);
      const dow = d.getDay();
      const mult = dow === 0 || dow === 6 ? 1.15 : 1;
      prices[key] = Math.round(avgPrice * mult * (0.9 + Math.random() * 0.2));
    }
  }
  return prices;
}

export function generateMockLiveFlights(bounds) {
  const lamin = parseFloat(bounds?.lamin) || 25;
  const lamax = parseFloat(bounds?.lamax) || 55;
  const lomin = parseFloat(bounds?.lomin) || -130;
  const lomax = parseFloat(bounds?.lomax) || -60;

  const flights = Array.from({ length: 40 }, (_, i) => ({
    icao24: `mock${i.toString(16).padStart(6, '0')}`,
    callsign: `SKY${1000 + i}`,
    originCountry: 'United States',
    lat: lamin + Math.random() * (lamax - lamin),
    lon: lomin + Math.random() * (lomax - lomin),
    altitude: 8000 + Math.random() * 3000,
    onGround: false,
    velocity: 180 + Math.random() * 120,
    heading: Math.random() * 360,
    verticalRate: 0,
    squawk: null,
  }));

  return { time: Math.floor(Date.now() / 1000), count: flights.length, flights };
}
