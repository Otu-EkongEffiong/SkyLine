const STORAGE_KEY = 'skypath_user_profile';

export function loadUserProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getActiveTravelProfile(userProfile) {
  if (!userProfile?.travel_profiles?.length) return null;
  return (
    userProfile.travel_profiles.find((p) => p.id === userProfile.active_profile_id) ||
    userProfile.travel_profiles[0]
  );
}

export function travelerProfilePayload(profile) {
  if (!profile) return null;
  return {
    passport_country: profile.passport_country,
    visas: profile.visas || [],
  };
}
