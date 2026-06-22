const SEARCH_KEY = 'skyline_search';
const RESULTS_KEY = 'skyline_search_results';
const ROUTE_KEY = 'skyline_selected_route';

export function saveSearch(search) {
  sessionStorage.setItem(SEARCH_KEY, JSON.stringify(search));
}

export function loadSearch() {
  try {
    const raw = sessionStorage.getItem(SEARCH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSearchResults(results) {
  sessionStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

export function loadSearchResults() {
  try {
    const raw = sessionStorage.getItem(RESULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSelectedRoute(route) {
  sessionStorage.setItem(ROUTE_KEY, JSON.stringify(route));
}

export function loadSelectedRoute() {
  try {
    const raw = sessionStorage.getItem(ROUTE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearBookingFlow() {
  sessionStorage.removeItem(ROUTE_KEY);
}
