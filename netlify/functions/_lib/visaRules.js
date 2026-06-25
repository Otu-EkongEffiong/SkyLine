// netlify/functions/_lib/visaRules.js
//
// Visa & transit rule engine for the diploma implementation.
//
// Reads from custom Supabase tables (`visa_rules`) maintained by the
// application administrator, as described in section 5.1 of the
// documentation. In a production version this lookup would be replaced
// or cross-validated with a professional source such as IATA Timatic
// or Sherpa — but the function signature below (`getVisaStatus`,
// `scoreRouteForTraveler`) would stay the same, so swapping the data
// source later does not require touching the frontend or other
// functions.
//
// Expected `visa_rules` table shape (Supabase / Postgres):
//   passport_country   text   -- ISO 3166-1 alpha-2, e.g. 'NG'
//   destination_country text  -- ISO 3166-1 alpha-2, e.g. 'DE'
//   status              text  -- one of: visa_free | evisa | visa_on_arrival | visa_required
//   max_stay_days       int   null
//   notes               text  null

import { getSupabaseAdmin } from './supabaseAdmin.js';

export const STATUS_RANK = {
  visa_free: 0,
  has_visa: 0,
  evisa: 1,
  visa_on_arrival: 2,
  visa_required: 3,
  unknown: 2.5,
};

export async function getVisaStatus(passportCountry, destinationCountry, existingVisas = []) {
  if (!passportCountry || !destinationCountry) return { status: 'unknown' };
  if (passportCountry === destinationCountry) return { status: 'visa_free' };

  const matchingVisa = existingVisas.find((v) => v.country_code === destinationCountry);
  if (matchingVisa) {
    const notExpired = !matchingVisa.expiry_date || new Date(matchingVisa.expiry_date) > new Date();
    if (notExpired) return { status: 'has_visa', notes: 'Covered by an existing visa on file.' };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('visa_rules')
    .select('status, max_stay_days, notes')
    .eq('passport_country', passportCountry)
    .eq('destination_country', destinationCountry)
    .maybeSingle();

  if (error) {
    console.error('visa_rules lookup error:', error);
    return { status: 'unknown', notes: 'Could not verify — please check official sources.' };
  }

  if (!data) {
    return { status: 'unknown', notes: 'No rule on file — verify with the destination embassy before booking.' };
  }

  return {
    status: data.status,
    maxStayDays: data.max_stay_days,
    notes: data.notes,
  };
}

export async function scoreRouteForTraveler({ passportCountry, routeCountries, existingVisas = [] }) {
  const perCountry = [];
  let worstRank = 0;
  let hasVisaIssue = false;

  for (const country of routeCountries) {
    const result = await getVisaStatus(passportCountry, country, existingVisas);
    perCountry.push({ country, ...result });

    const rank = STATUS_RANK[result.status] ?? STATUS_RANK.unknown;
    worstRank = Math.max(worstRank, rank);
    if (result.status === 'visa_required') hasVisaIssue = true;
  }

  const isRecommended = perCountry.every((c) => c.status === 'visa_free' || c.status === 'has_visa');

  return {
    perCountry,
    visaScore: worstRank,
    hasVisaIssue,
    isRecommended,
  };
}