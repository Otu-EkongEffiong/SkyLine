import { supabase } from './supabaseClient';

const ACTIVE_PROFILE_KEY = 'skyline_active_profile_id';

/**
 * @typedef {Object} SavedVisa
 * @property {string} country_code
 * @property {string} [country_name]
 * @property {string} [visa_type]
 * @property {string} valid_from
 * @property {string} valid_until
 * @property {string} [expiry_date]
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

/**
 * Robust helper to retrieve the authenticated user ID safely using async/await.
 */
async function getCurrentUserId() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      // Fallback check to cached session if user endpoint throttles
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.id || null;
    }
    return user.id;
  } catch (err) {
    console.error("Error retrieving user session context:", err);
    return null;
  }
}

/**
 * Creates a primary passenger profile when auth triggers did not run (e.g. SQL misconfiguration).
 */
export async function ensurePrimaryProfile(user) {
  const userId = user?.id || (await getCurrentUserId());
  if (!userId) return null;

  const { data: existing, error: existingError } = await supabase
    .from('passenger_profiles')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (existingError) {
    console.error('ensurePrimaryProfile: failed to check existing profiles:', existingError);
    return null;
  }
  if (existing?.length) return existing[0];

  const { data, error } = await supabase
    .from('passenger_profiles')
    .insert({
      user_id: userId,
      profile_name: 'Primary Profile',
      full_name: user?.user_metadata?.full_name || 'Traveler',
      passport_country: user?.user_metadata?.passport_country || '',
      is_primary: true,
    })
    .select()
    .single();

  if (error) {
    console.error('ensurePrimaryProfile: failed to create primary profile:', error);
    return null;
  }
  return data;
}

/**
 * Loads the signed-in user's profile matching the app's standard schema layout.
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

  const travelProfiles = (profiles || []).map((p) => ({
    id: p.id,
    profile_name: p.profile_name || (p.full_name ? `${p.full_name}'s Profile` : 'Travel Profile'),
    full_name: p.full_name,
    nationality: p.nationality,
    passport_country: p.passport_country,
    passport_number: p.passport_number,
    passport_expiry_date: p.passport_expiry,
    date_of_birth: p.date_of_birth,
    home_airport: p.home_airport, 
    is_primary: p.is_primary,
    visas: (visas || []).map((v) => ({
      country_code: v.country,
      visa_type: v.visa_type,
      valid_from: v.valid_from,
      valid_until: v.valid_until,
      expiry_date: v.valid_until, 
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
 * Creates or updates a passenger profile, and safely normalizes empty date types.
 */
export async function saveProfile(profile) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('You must be signed in to save a travel profile.');

  const profileRow = {
    user_id: userId,
    profile_name: profile.profile_name || 'Travel Profile',
    full_name: profile.full_name || 'Traveler',
    nationality: profile.nationality || profile.passport_country_name || null,
    passport_country: profile.passport_country || '',
    passport_number: profile.passport_number || null,
    // Safely map empty input string values to real SQL NULL values
    passport_expiry: profile.passport_expiry_date === "" ? null : (profile.passport_expiry_date || null),
    date_of_birth: profile.date_of_birth === "" ? null : (profile.date_of_birth || null),
    home_airport: profile.home_airport || null
  };

  let savedProfile;
  const isExistingRow = typeof profile.id === 'number' || /^\d+$/.test(String(profile.id));

  if (isExistingRow) {
    const { data, error } = await supabase
      .from('passenger_profiles')
      .update(profileRow)
      .eq('id', profile.id)
      .eq('user_id', userId) 
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

  if (Array.isArray(profile.visas)) {
    const { error: deleteError } = await supabase
      .from('saved_visas')
      .delete()
      .eq('user_id', userId);
    if (deleteError) throw deleteError;

    if (profile.visas.length > 0) {
      const visaRows = profile.visas
        .filter(v => v.country_code)
        .map((v) => ({
          user_id: userId,
          country: v.country_code,
          visa_type: v.visa_type || null,
          valid_from: v.valid_from || v.expiry_date || new Date().toISOString().slice(0, 10),
          valid_until: v.valid_until || v.expiry_date || new Date().toISOString().slice(0, 10),
          entries_allowed: v.entries_allowed || 'multiple',
        }));
      const { error: insertError } = await supabase.from('saved_visas').insert(visaRows);
      if (insertError) throw insertError;
    }
  }

  return savedProfile;
}

/**
 * Deletes a passenger profile from the database.
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
 * Marks a profile ID as active in local presentation storage.
 */
export function setActiveProfile(profileId) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, String(profileId));
  window.dispatchEvent(new Event('storage'));
}