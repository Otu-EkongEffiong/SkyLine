export function filterRoutes(routes, filter) {
  const list = [...(routes || [])];
  switch (filter) {
    case 'recommended':
      return list.filter((r) => r.isRecommended);
    case 'cheapest':
      return [...list].sort((a, b) => a.price - b.price);
    case 'lowest-visa-risk':
      return [...list].sort((a, b) => (a.visaScore ?? 99) - (b.visaScore ?? 99));
    case 'avoid':
      return list.filter((r) => r.hasVisaIssue);
    default:
      return list;
  }
}

export function getMobilityScore(profile) {
  if (!profile?.passport_country) return null;
  const visaFree = profile.visa_free_count ?? 0;
  const visas = profile.visas?.length ?? 0;
  return Math.min(100, 30 + visaFree * 0.5 + visas * 8);
}
