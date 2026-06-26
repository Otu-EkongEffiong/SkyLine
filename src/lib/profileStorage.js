// src/lib/profileStorage.js
//
// Travel profile + visa persistence, backed by Supabase
// (passenger_profiles + saved_visas tables) instead of localStorage.
//
// This REPLACES any earlier localStorage-only version of
// profileStorage.js. The function names are kept the same
// (loadUserProfile, saveProfile, deleteProfile, setActiveProfile)
// so existing callers (Profile.jsx, EditProfileModal.jsx,
// BottomNav.jsx) don't need to change their import statements —
// only what happens inside these functions changes.
//
// "Active profile" is still tracked in localStorage (it's a pure UI
// preference, not data that needs to survive across devices or be
// queried), but the actual profile/visa records now live in Supabase.

import { supabase } from './supabaseClient';

const ACTIVE_PROFILE_KEY = 'skyline_active_profile_id';

/**
 * @typedef {Object} SavedVisa
 * @property {string} country_code
 * @property {string} [country_name]
 * @property {string} [visa_type]
 * @property {string} valid_from
 * @property {string} valid_until
 * @property {'single'|'double'|'multiple'} [entries_allowed]
 */

/**
 * @typedef {Object} TravelProfile
 * @property {string|number} id
 * @property {string} [profile_name]
 * @property {string} [full_name]
 * @property {string} [nationality]
 * @property {string} [passport_country]
 * @property {string} [passport_country_name]
 * @property {string} [passport_number]
 * @property {string} [passport_expiry_date]
 * @property {string} [date_of_birth]
 * @property {Object} [home_airport]
 * @property {SavedVisa[]} visas
 */

function getCurrentUserId() {
  // Supabase Auth populates this synchronously from the cached session
  // after the initial auth check; AuthContext.jsx should already be
  // awaiting getSession()/onAuthStateChange before rendering protected
  // pages, so this is safe to call from profile screens.
  return supabase.auth.getUser().then((res) => res.data?.user?.id || null);
}

/**
 * Loads the signed-in user's profile, in the same shape the old
 * localStorage version returned, so existing components
 * (Profile.jsx, BottomNav.jsx) don't need to change how they read it:
 *   { travel_profiles: TravelProfile[], active_profile_id }
 *
 * @returns {Promise<{travel_profiles: TravelProfile[], active_profile_id: string|number|null}>}
 */
export async function loadUserProfile() {
  const userId = await getCurrentUserId();
  if (!userId) return { travel_profiles: [], active_profile_id: null };

  const { data: profiles, error: profilesError } = await supabase
    .from('passenger_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (profilesError) {
    console.error('loadUserProfile: failed to load passenger_profiles:', profilesError);
    return { travel_profiles: [], active_profile_id: null };
  }

  const { data: visas, error: visasError } = await supabase
    .from('saved_visas')
    .select('*')
    .eq('user_id', userId);

  if (visasError) {
    console.error('loadUserProfile: failed to load saved_visas:', visasError);
  }

  // saved_visas isn't linked to a specific profile in the current
  // schema (one user, one passport in this diploma version), so every
  // visa the user owns is attached to every one of their profiles.
  // If you later add multi-passport support, add a profile_id column
  // to saved_visas and filter here instead.
  const travelProfiles = (profiles || []).map((p) => ({
    id: p.id,
    profile_name: p.full_name ? `${p.full_name}'s Profile` : 'Travel Profile',
    full_name: p.full_name,
    nationality: p.nationality,
    passport_country: p.passport_country,
    passport_number: p.passport_number,
    passport_expiry_date: p.passport_expiry,
    date_of_birth: p.date_of_birth,
    is_primary: p.is_primary,
    visas: (visas || []).map((v) => ({
      country_code: v.country,
      visa_type: v.visa_type,
      valid_from: v.valid_from,
      valid_until: v.valid_until,
      expiry_date: v.valid_until, // alias used elsewhere in the app (VisaAlerts.jsx)
      entries_allowed: v.entries_allowed,
    })),
  }));

  const storedActiveId = localStorage.getItem(ACTIVE_PROFILE_KEY);
  const activeId = travelProfiles.some((p) => String(p.id) === storedActiveId)
    ? storedActiveId
    : travelProfiles.find((p) => p.is_primary)?.id ?? travelProfiles[0]?.id ?? null;

  return { travel_profiles: travelProfiles, active_profile_id: activeId };
}

/**
 * Creates or updates a passenger profile, and replaces that profile's
 * visa set. Called from EditProfileModal.jsx's Save button.
 *
 * @param {TravelProfile} profile
 * @returns {Promise<TravelProfile>} the saved profile, with its real DB id
 */
export async function saveProfile(profile) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('You must be signed in to save a travel profile.');

  const profileRow = {
    user_id: userId,
    full_name: profile.full_name || 'Traveler',
    nationality: profile.nationality || profile.passport_country_name || null,
    passport_country: profile.passport_country,
    passport_number: profile.passport_number || null,
    passport_expiry: profile.passport_expiry_date || null,
    date_of_birth: profile.date_of_birth || null,
  };

  let savedProfile;
  // A real Supabase row has a numeric `id`. New, not-yet-saved profiles
  // created client-side (e.g. `Date.now()` placeholder ids) won't match
  // anything in the DB, so treat anything non-numeric-looking as "create".
  const isExistingRow = typeof profile.id === 'number' || /^\d+$/.test(String(profile.id));

  if (isExistingRow) {
    const { data, error } = await supabase
      .from('passenger_profiles')
      .update(profileRow)
      .eq('id', profile.id)
      .eq('user_id', userId) // belt-and-suspenders alongside RLS
      .select()
      .single();
    if (error) throw error;
    savedProfile = data;
  } else {
    const { data, error } = await supabase
      .from('passenger_profiles')
      .insert(profileRow)
      .select()
      .single();
    if (error) throw error;
    savedProfile = data;
  }

  // Replace this user's visa set with whatever is currently in the
  // form. Simpler and safer than diffing individual rows for a
  // diploma-scope app, and avoids orphaned/duplicate visa rows.
  if (Array.isArray(profile.visas)) {
    const { error: deleteError } = await supabase
      .from('saved_visas')
      .delete()
      .eq('user_id', userId);
    if (deleteError) throw deleteError;

    if (profile.visas.length > 0) {
      const visaRows = profile.visas.map((v) => ({
        user_id: userId,
        country: v.country_code,
        visa_type: v.visa_type || null,
        valid_from: v.valid_from || v.expiry_date || new Date().toISOString().slice(0, 10),
        valid_until: v.valid_until || v.expiry_date,
        entries_allowed: v.entries_allowed || 'multiple',
      }));
      const { error: insertError } = await supabase.from('saved_visas').insert(visaRows);
      if (insertError) throw insertError;
    }
  }

  return savedProfile;
}

/**
 * Deletes a passenger profile (and, since this diploma schema shares
 * one visa set per user, leaves visas untouched — they belong to the
 * user, not a specific profile row).
 *
 * @param {string|number} profileId
 */
export async function deleteProfile(profileId) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('You must be signed in to delete a travel profile.');

  const { error } = await supabase
    .from('passenger_profiles')
    .delete()
    .eq('id', profileId)
    .eq('user_id', userId);
  if (error) throw error;

  const storedActiveId = localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (String(profileId) === storedActiveId) {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
}

/**
 * Marks a profile as the active one. Purely a local UI preference —
 * not written to Supabase, since "which profile is selected right
 * now in this browser" isn't data that needs to sync across devices.
 *
 * @param {string|number} profileId
 */
export function setActiveProfile(profileId) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, String(profileId));
  // Let BottomNav.jsx and other listeners react immediately, mirroring
  // the existing 'storage' event pattern already used elsewhere.
  window.dispatchEvent(new Event('storage'));
}