// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { User, Loader2, Plane, Plus, CheckCircle, AlertCircle, Clock, FileText, ChevronRight, Stamp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';
import TravelProfileCard from '@/components/travel/TravelProfileCard';
import EditProfileModal from '@/components/travel/EditProfileModal';
import TravelAccessModal from '@/components/travel/TravelAccessModal';
import { getVisaStatus, VISA_UNLOCK_MAP } from '@/components/travel/Travelconstants';
import { COUNTRIES, getFlagEmoji } from '@/components/travel/PassportSelector';
import VisaMap from '@/components/travel/VisaMap';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/components/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import BottomNav from '@/components/BottomNav';
import VisaAlerts from '@/components/travel/VisaAlerts';


// ── localStorage helpers ────────────────────────────────────────────────
const STORAGE_KEY = 'skypath_user_profile'; // key kept for backward compat

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveProfile(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

const ACCESS_TILES = [
  { key: 'visa_free',       label: 'Visa Free',        icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800' },
  { key: 'evisa',           label: 'e-Visa',           icon: FileText,    color: 'text-sky-600',     bg: 'bg-sky-50 dark:bg-sky-900/30',         border: 'border-sky-200 dark:border-sky-800' },
  { key: 'visa_on_arrival', label: 'On Arrival',       icon: Clock,       color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/30',     border: 'border-amber-200 dark:border-amber-800' },
  { key: 'visa_required',   label: 'Visa Required',    icon: AlertCircle, color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/30',         border: 'border-red-200 dark:border-red-800' },
];

function TravelAccessSummary({ passportCode, passportName, visas, onOpen }) {
  const buckets = { visa_free: 0, evisa: 0, visa_on_arrival: 0, visa_required: 0 };
  COUNTRIES.forEach(c => {
    if (c.code === passportCode) return;
    const status = getVisaStatus(passportCode, c.code, visas);
    if (status === 'visa_free') buckets.visa_free++;
    else if (status === 'evisa' || status === 'evisa_available') buckets.evisa++;
    else if (status === 'visa_on_arrival') buckets.visa_on_arrival++;
    else buckets.visa_required++;
  });

  const visaUnlockBreakdown = visas
    .map(visa => {
      const unlocked = (VISA_UNLOCK_MAP[visa.country_code] || []).filter(code => {
        const baseStatus = getVisaStatus(passportCode, code, []);
        return baseStatus !== 'visa_free' && code !== passportCode;
      });
      return { visa, unlocked };
    })
    .filter(({ unlocked }) => unlocked.length > 0);

  const allUnlockedSet = new Set(visaUnlockBreakdown.flatMap(({ unlocked }) => unlocked));
  const totalUnlocked = allUnlockedSet.size;

  return (
    <Card className="shadow-sm border-border dark:border-slate-700 bg-card dark:bg-slate-800 cursor-pointer hover:shadow-md transition-shadow" onClick={onOpen}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Your Travel Access</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">{getFlagEmoji(passportCode)} {passportName || passportCode} passport</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Map */}
        <div className="mb-3">
          <VisaMap passportCode={passportCode} visas={visas} />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 justify-center mb-3">
          {ACCESS_TILES.map(tile => {
            const count = buckets[tile.key] || 0;
            const Icon = tile.icon;
            return (
              <div key={tile.key} className={`rounded-lg border px-3 py-1.5 flex items-center gap-1.5 ${tile.bg} ${tile.border}`}>
                <Icon className={`w-3.5 h-3.5 ${tile.color}`} />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{count}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{tile.label}</span>
              </div>
            );
          })}
        </div>

        {visaUnlockBreakdown.length > 0 && (
          <div className="mt-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Stamp className="w-4 h-4 text-violet-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">Unlocked by Your Visas</span>
              <span className="ml-auto text-xs font-bold bg-violet-200 dark:bg-violet-800 text-violet-800 dark:text-violet-200 px-2 py-0.5 rounded-full">{totalUnlocked} countries</span>
            </div>
            <div className="space-y-2">
              {visaUnlockBreakdown.map(({ visa, unlocked }) => (
                <div key={visa.country_code} className="flex items-start gap-2">
                  <span className="text-base leading-tight mt-0.5">{getFlagEmoji(visa.country_code)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{visa.country_name} {visa.visa_type ? `(${visa.visa_type})` : 'Visa'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {unlocked.slice(0, 6).map(code => getFlagEmoji(code)).join(' ')}
                      {unlocked.length > 6 && <span className="ml-1">+{unlocked.length - 6} more</span>}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 shrink-0">{unlocked.length}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-3 text-center">Tap to explore countries by category</p>
      </CardContent>
    </Card>
  );
}

export default function Profile() {
  const { t } = useTranslation();

  const [profile, setProfile]               = useState(loadProfile);
  const [travelProfiles, setTravelProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [isSaving, setIsSaving]             = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showTravelAccess, setShowTravelAccess] = useState(false);

  // Hydrate local state from profile on mount / profile change
  useEffect(() => {
    if (profile) {
      setTravelProfiles(profile.travel_profiles || []);
      setActiveProfileId(profile.active_profile_id || profile.travel_profiles?.[0]?.id || null);
    }
  }, []);

  // Persist any change to localStorage and update local profile state
  const persist = (travel_profiles, active_profile_id) => {
    setIsSaving(true);
    const updated = { ...(profile || {}), travel_profiles, active_profile_id };
    saveProfile(updated);
    setProfile(updated);
    setTravelProfiles(travel_profiles);
    setActiveProfileId(active_profile_id);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(t('profileSaved') || 'Profile saved');
    }, 300);
  };

  const handleAddProfile = () => {
    if (travelProfiles.length >= 2) {
      toast.error(t('maxProfilesReached') || 'Max 2 profiles allowed');
      return;
    }
    const newProfile = {
      id: `profile_${Date.now()}`,
      profile_name: `Travel Profile ${travelProfiles.length + 1}`,
      full_name: '',
      passport_number: '',
      passport_country: '',
      passport_country_name: '',
      passport_expiry_date: '',
      date_of_birth: '',
      visas: [],
    };
    const updated = [...travelProfiles, newProfile];
    const newActiveId = activeProfileId || newProfile.id;
    persist(updated, newActiveId);
  };

  const handleUpdateProfile = (updatedProfile) => {
    const updated = travelProfiles.map(p => p.id === updatedProfile.id ? updatedProfile : p);
    persist(updated, activeProfileId);
  };

  const handleDeleteProfile = (profileId) => {
    const updated = travelProfiles.filter(p => p.id !== profileId);
    const newActiveId = activeProfileId === profileId ? updated[0]?.id : activeProfileId;
    persist(updated, newActiveId || null);
  };

  const handleSetActive = (profileId) => {
    persist(travelProfiles, profileId);
  };

  const activeProfile = travelProfiles.find(p => p.id === activeProfileId);

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 pb-20 text-foreground dark:text-slate-100">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-sky-500 to-teal-500 dark:from-sky-600 dark:via-sky-700 dark:to-teal-700">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/src/assets/icon.svg" 
              alt="SkyLine Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">{t('travelProfiles') || 'Travel Profiles'}</h2>
            <p className="text-white/90 text-sm">{t('manageUpToProfiles') || 'Manage up to 2 travel profiles with passport and booking details'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Passport / Visa expiry alerts */}
        {profile && (
          <div className="mb-6">
            <VisaAlerts profile={profile} />
          </div>
        )}

        {/* Prompt to create first profile */}
        {(!travelProfiles || travelProfiles.length === 0) && (
          <Alert className="mb-6 bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-800">
            <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <AlertDescription className="text-sky-900 dark:text-sky-100">
              {t('savePassportDetails') || 'Add a travel profile to get visa-aware flight recommendations.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {travelProfiles.map((prof, index) => (
            <motion.div
              key={prof.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TravelProfileCard
                profile={prof}
                isActive={prof.id === activeProfileId}
                onEdit={() => setEditingProfile(prof)}
                onSetActive={() => handleSetActive(prof.id)}
              />
            </motion.div>
          ))}

          {/* Add profile button */}
          {travelProfiles.length < 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: travelProfiles.length * 0.1 }}
            >
              <Card className="touch-card border-dashed border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center h-full min-h-[160px]">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleAddProfile}
                  className="flex flex-col gap-3 h-auto py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{t('addTravelProfile') || 'Add Travel Profile'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {travelProfiles.length === 0
                        ? (t('createFirstProfile') || 'Create your first profile')
                        : (t('addSecondProfile') || 'Add a second traveller')}
                    </p>
                  </div>
                </Button>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Travel Access summary tiles */}
        {activeProfile?.passport_country && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <TravelAccessSummary
              passportCode={activeProfile.passport_country}
              passportName={activeProfile.passport_country_name}
              visas={activeProfile.visas || []}
              onOpen={() => setShowTravelAccess(true)}
            />
          </motion.div>
        )}

        {/* Save indicator */}
         {isSaving && (
           <div className="fixed bottom-20 right-4 bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-100 text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
             <Loader2 className="w-4 h-4 animate-spin" />
             Saving…
           </div>
         )}
      </div>

      {/* Travel Access Modal */}
      <AnimatePresence>
        {showTravelAccess && activeProfile?.passport_country && (
          <TravelAccessModal
            passportCode={activeProfile.passport_country}
            passportName={activeProfile.passport_country_name}
            visas={activeProfile.visas || []}
            onClose={() => setShowTravelAccess(false)}
          />
        )}
      </AnimatePresence>

      {editingProfile && (
        <EditProfileModal
          profile={editingProfile}
          isActive={editingProfile.id === activeProfileId}
          onUpdate={handleUpdateProfile}
          onDelete={() => handleDeleteProfile(editingProfile.id)}
          onSetActive={() => handleSetActive(editingProfile.id)}
          onClose={() => setEditingProfile(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}