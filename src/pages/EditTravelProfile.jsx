import React, { useState, useEffect, useRef } from 'react';
import { User, FileText, Shield, Check, Trash2, X, ChevronDown, Home, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PassportSelectorInput from '@/components/travel/PassportSelector.jsx';
import VisaManager from '@/components/travel/VisaManager';
import { useTranslation } from '@/components/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { searchAirports } from '@/components/api/flightClient';

function AccordionSection({ icon: Icon, title, isOpen, onToggle, children, filled }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${filled ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            <Icon className={`w-4 h-4 ${filled ? 'text-emerald-600' : 'text-gray-400'}`} />
          </div>
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
          {filled && <span className="text-xs text-emerald-600 font-medium">✓</span>}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EditProfileModal({ profile, isActive, onUpdate, onDelete, onSetActive, onClose }) {
  const { t } = useTranslation();
  const [editedProfile, setEditedProfile] = useState(profile);
  const [openSection, setOpenSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedProfile(profile);
    setOpenSection(null);
  }, [profile]);

  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  // Local edits only — nothing is persisted until Save is pressed.
  // (Previously this also wrote a partial copy to localStorage under
  // the old key 'skypath_user_profile' on every keystroke; that was
  // dead code left over from before the Supabase migration and never
  // actually synced with the real save path, so it's been removed.)
  const handleFieldChange = (updates) => {
    setEditedProfile(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // onUpdate (Profile.jsx's handleUpdateProfile) does the real
      // Supabase write and throws on failure — await it so a DB error
      // shows up as a toast instead of the modal closing as if it
      // succeeded.
      await onUpdate(editedProfile);
      onClose();
    } catch (err) {
      // onUpdate already shows its own toast.error; just keep the
      // modal open so the user can retry without re-entering data.
      console.error('EditProfileModal: save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this travel profile?')) {
      onDelete();
      onClose();
    }
  };

  const [airportQuery, setAirportQuery] = useState(
    editedProfile?.home_airport ? `${editedProfile.home_airport.city}, ${editedProfile.home_airport.country} (${editedProfile.home_airport.code})` : ''
  );
  const [airportResults, setAirportResults] = useState([]);
  const [airportLoading, setAirportLoading] = useState(false);
  const [airportOpen, setAirportOpen] = useState(false);
  const airportDebounce = useRef(null);

  if (!profile) return null;

  const handleAirportInput = (e) => {
    const q = e.target.value;
    setAirportQuery(q);
    if (q.length < 2) { setAirportResults([]); setAirportOpen(false); return; }
    clearTimeout(airportDebounce.current);
    airportDebounce.current = setTimeout(async () => {
      setAirportLoading(true);
      try {
        const data = await searchAirports(q);
        setAirportResults(data);
        setAirportOpen(data.length > 0);
      } catch {}
      setAirportLoading(false);
    }, 280);
  };

  const selectAirport = (airport) => {
    setAirportQuery(`${airport.city}, ${airport.country} (${airport.code})`);
    setAirportOpen(false);
    handleFieldChange({ home_airport: { code: airport.code, name: airport.name, city: airport.city, country: airport.country } });
  };

  const personalFilled = !!(editedProfile.full_name || editedProfile.date_of_birth);
  const passportFilled = !!(editedProfile.passport_country || editedProfile.passport_number);
  const visaFilled = (editedProfile.visas || []).length > 0;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget && !isSaving) onClose(); }}
      >
        <motion.div
          key="sheet"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[95vh] overflow-y-auto shadow-2xl my-4"
          style={{ background: 'linear-gradient(160deg, #3FA9F5 0%, #14B8A6 60%, #0e9488 100%)' }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 px-4 pt-5 pb-3"
            style={{ background: 'linear-gradient(160deg, #3FA9F5 0%, #14B8A6 100%)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  {isActive && (
                    <span className="text-xs font-semibold bg-white/30 text-white px-2 py-0.5 rounded-full">Active</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isActive && (
                  <Button size="sm" variant="ghost" onClick={() => { onSetActive(); onClose(); }} disabled={isSaving}
                    className="text-white hover:bg-white/20 text-xs font-semibold">
                    Set Active
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleSave} disabled={isSaving}
                  className="text-white hover:bg-white/20 text-xs font-semibold">
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-1" />
                  )}
                  {isSaving ? 'Saving…' : 'Save'}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDelete} disabled={isSaving}
                  className="text-red-700 hover:bg-red-100/40">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={onClose} disabled={isSaving}
                  className="text-white hover:bg-white/20">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Profile Name */}
            <div className="mb-1">
              <Label className="text-sky-100 text-xs font-semibold uppercase tracking-wide mb-1 block">Profile Name</Label>
              <Input
                value={editedProfile.profile_name || ''}
                onChange={(e) => handleFieldChange({ profile_name: e.target.value })}
                placeholder="e.g., Primary Passport"
                className="bg-white/30 border-white/30 text-white placeholder:text-sky-100/70 font-semibold text-base focus:bg-white/40"
              />
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="px-4 pb-4 space-y-3 pt-3">
            <AccordionSection
              icon={User}
              title="Personal Info"
              isOpen={openSection === 'personal'}
              onToggle={() => toggleSection('personal')}
              filled={personalFilled}
            >
              <div className="space-y-2">
                <Label className="text-teal-900 text-xs font-semibold">Full Name (as on passport)</Label>
                <Input
                  value={editedProfile.full_name || ''}
                  onChange={(e) => handleFieldChange({ full_name: e.target.value })}
                  placeholder="John Doe"
                  className="bg-white/80 border-teal-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-teal-900 text-xs font-semibold">Date of Birth</Label>
                <Input
                  type="date"
                  value={editedProfile.date_of_birth || ''}
                  onChange={(e) => handleFieldChange({ date_of_birth: e.target.value })}
                  className="bg-white/80 border-teal-200"
                />
              </div>
            </AccordionSection>

            <AccordionSection
              icon={FileText}
              title="Passport Details"
              isOpen={openSection === 'passport'}
              onToggle={() => toggleSection('passport')}
              filled={passportFilled}
            >
              <div className="space-y-2">
                <Label className="text-teal-900 text-xs font-semibold">{t('selectPassport')}</Label>
                <PassportSelectorInput
                  value={editedProfile.passport_country}
                  onChange={(countryCode, countryName) =>
                    handleFieldChange({ passport_country: countryCode, passport_country_name: countryName })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-teal-900 text-xs font-semibold">Passport Number</Label>
                <Input
                  value={editedProfile.passport_number || ''}
                  onChange={(e) => handleFieldChange({ passport_number: e.target.value })}
                  placeholder="ABC123456"
                  className="bg-white/80 border-teal-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-teal-900 text-xs font-semibold">Passport Expiry Date</Label>
                <Input
                  type="date"
                  value={editedProfile.passport_expiry_date || ''}
                  onChange={(e) => handleFieldChange({ passport_expiry_date: e.target.value })}
                  className="bg-white/80 border-teal-200"
                />
              </div>
            </AccordionSection>

            <AccordionSection
              icon={Home}
              title="Home Airport"
              isOpen={openSection === 'home_airport'}
              onToggle={() => toggleSection('home_airport')}
              filled={!!editedProfile.home_airport?.code}
            >
              <div className="space-y-2 relative">
                <Label className="text-teal-900 text-xs font-semibold">Your departure airport (auto-fills search)</Label>
                <Input
                  value={airportQuery}
                  onChange={handleAirportInput}
                  onFocus={() => airportResults.length > 0 && setAirportOpen(true)}
                  onBlur={() => setTimeout(() => setAirportOpen(false), 150)}
                  placeholder="Search city or airport…"
                  className="bg-white/80 border-teal-200"
                />
                {airportLoading && <p className="text-xs text-teal-600">Searching…</p>}
                {airportOpen && (
                  <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                    {airportResults.map(airport => (
                      <button
                        key={airport.code}
                        onMouseDown={() => selectAirport(airport)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-sky-50 text-left border-b border-slate-100 last:border-0"
                      >
                        <span className="font-bold text-sky-700 text-xs bg-sky-100 px-1.5 py-0.5 rounded">{airport.code}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{airport.city}, {airport.country}</p>
                          <p className="text-xs text-slate-500 truncate">{airport.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {editedProfile.home_airport?.code && (
                  <button
                    onClick={() => { setAirportQuery(''); handleFieldChange({ home_airport: null }); }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear home airport
                  </button>
                )}
              </div>
            </AccordionSection>

            <AccordionSection
              icon={Shield}
              title={t('yourVisas') || 'Your Visas'}
              isOpen={openSection === 'visas'}
              onToggle={() => toggleSection('visas')}
              filled={visaFilled}
            >
              <VisaManager
                visas={editedProfile.visas || []}
                onVisasChange={(visas) => handleFieldChange({ visas })}
                passportCountry={editedProfile.passport_country}
              />
            </AccordionSection>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}