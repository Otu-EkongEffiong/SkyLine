const TRIPS_KEY = 'skypath_trips';

export function loadTrips() {
  try {
    return JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveTrip(trip) {
  const trips = loadTrips();
  const idx = trips.findIndex((t) => t.id === trip.id);
  if (idx >= 0) trips[idx] = trip;
  else trips.unshift(trip);
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  return trip;
}

export function getTripById(id) {
  return loadTrips().find((t) => t.id === id) || null;
}
